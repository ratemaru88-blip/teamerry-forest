import crypto from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { access, chmod, lstat, open, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_WRITER_VERSION = "0.1";
const DEFAULT_ALLOWED_EXTENSIONS = [".css"];
const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function createSourceWriter(options = {}) {
  const repoRoot = await realpath(options.repoRoot || process.cwd());
  const writer = {
    version: SOURCE_WRITER_VERSION,
    repoRoot,
    readEnabled: options.readEnabled !== false,
    writeEnabled: options.writeEnabled !== false,
    allowedExtensions: options.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS,
    maxFileBytes: Number(options.maxFileBytes || DEFAULT_MAX_FILE_BYTES),
  };

  return {
    getCapabilities() {
      return {
        ok: true,
        sourceWriterVersion: writer.version,
        read: writer.readEnabled,
        write: writer.writeEnabled,
        allowedExtensions: writer.allowedExtensions.slice(),
        existingFilesOnly: true,
        maxFileBytes: writer.maxFileBytes,
      };
    },
    async readSource(request = {}) {
      if (!writer.readEnabled) {
        throw sourceWriterError("writer-disabled", "Source Writer read is disabled.");
      }
      const target = await resolveSafeSourcePath(writer, request.path);
      const bytes = await readAllowedSource(writer, target);
      const content = decodeUtf8(bytes);
      return {
        ok: true,
        sourceWriterVersion: writer.version,
        path: target.relativePath,
        encoding: content.bom ? "utf-8-bom" : "utf-8",
        byteLength: bytes.length,
        sha256: hashBytes(bytes),
        content: content.text,
      };
    },
    async writeSource(request = {}) {
      if (!writer.writeEnabled) {
        throw sourceWriterError("writer-disabled", "Source Writer write is disabled.");
      }
      const target = await resolveSafeSourcePath(writer, request.path);
      if (!request.expectedSha256 || typeof request.expectedSha256 !== "string") {
        throw sourceWriterError("hash-mismatch", "expectedSha256 is required.");
      }
      if (typeof request.newContent !== "string") {
        throw sourceWriterError("invalid-request", "newContent must be a string.");
      }

      const beforeBytes = await readAllowedSource(writer, target);
      const beforeSha256 = hashBytes(beforeBytes);
      if (beforeSha256 !== request.expectedSha256) {
        throw sourceWriterError("source-changed", "Source changed after it was read.", {
          beforeSha256,
          expectedSha256: request.expectedSha256,
        });
      }

      const beforeDecoded = decodeUtf8(beforeBytes);
      const afterBytes = encodeUtf8(request.newContent, beforeDecoded.bom);
      if (afterBytes.length > writer.maxFileBytes) {
        throw sourceWriterError("file-too-large", "New source content exceeds the size limit.");
      }
      const afterSha256 = hashBytes(afterBytes);
      if (request.expectedNewSha256 && request.expectedNewSha256 !== afterSha256) {
        throw sourceWriterError("hash-mismatch", "expectedNewSha256 does not match newContent.");
      }
      if (beforeSha256 === afterSha256) {
        return {
          ok: true,
          sourceWriterVersion: writer.version,
          status: "no-op",
          path: target.relativePath,
          beforeSha256,
          afterSha256,
          beforeByteLength: beforeBytes.length,
          afterByteLength: afterBytes.length,
          verified: true,
        };
      }

      const originalBytes = Buffer.from(beforeBytes);
      let writeResult = null;
      try {
        writeResult = await atomicReplaceBytes(target.realPath, afterBytes);
        const verifiedBytes = await readAllowedSource(writer, target);
        const verifiedSha256 = hashBytes(verifiedBytes);
        if (verifiedSha256 !== afterSha256) {
          await rollbackSource(target.realPath, originalBytes);
          throw sourceWriterError("verification-failed", "Write verification failed and rollback was attempted.", {
            afterSha256,
            verifiedSha256,
            status: "rolled-back",
          });
        }
        return {
          ok: true,
          sourceWriterVersion: writer.version,
          status: "written",
          path: target.relativePath,
          beforeSha256,
          afterSha256,
          beforeByteLength: beforeBytes.length,
          afterByteLength: afterBytes.length,
          verified: true,
        };
      } catch (error) {
        if (error?.sourceWriterError) {
          throw error;
        }
        if (writeResult?.tempPath) {
          await cleanupTemp(writeResult.tempPath);
        }
        throw sourceWriterError("write-failed", "Source write failed.", { detail: error?.message || String(error) });
      }
    },
  };
}

export async function resolveSafeSourcePath(writer, requestPath) {
  const rawPath = validateRelativeRequestPath(requestPath);
  const decodedPath = decodeRequestPath(rawPath);
  const normalizedPath = normalizeRelativePath(decodedPath);
  const extension = path.extname(normalizedPath).toLowerCase();
  if (!writer.allowedExtensions.includes(extension)) {
    throw sourceWriterError("unsupported-extension", "This source type is not allowed.");
  }
  if (normalizedPath.split(/[\\/]/).some((segment) => segment.startsWith("."))) {
    throw sourceWriterError("invalid-path", "Hidden paths are not allowed.");
  }
  if (normalizedPath.split(/[\\/]/).includes("node_modules") || normalizedPath.split(/[\\/]/).includes(".git")) {
    throw sourceWriterError("invalid-path", "This path is not allowed.");
  }

  const candidatePath = path.resolve(writer.repoRoot, normalizedPath);
  const rootWithSep = writer.repoRoot.endsWith(path.sep) ? writer.repoRoot : `${writer.repoRoot}${path.sep}`;
  if (candidatePath !== writer.repoRoot && !candidatePath.startsWith(rootWithSep)) {
    throw sourceWriterError("path-outside-repo", "Path resolves outside the project.");
  }

  await rejectSymlinkPath(writer.repoRoot, normalizedPath);
  let realTarget = "";
  try {
    realTarget = await realpath(candidatePath);
  } catch (error) {
    throw sourceWriterError("file-not-found", "Source file was not found.");
  }
  if (realTarget !== writer.repoRoot && !realTarget.startsWith(rootWithSep)) {
    throw sourceWriterError("path-outside-repo", "Real path resolves outside the project.");
  }
  return {
    relativePath: normalizedPath.replace(/\\/g, "/"),
    realPath: realTarget,
  };
}

export function hashBytes(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function validateRelativeRequestPath(requestPath) {
  if (typeof requestPath !== "string" || !requestPath.trim()) {
    throw sourceWriterError("invalid-path", "A relative source path is required.");
  }
  if (requestPath.includes("\0")) {
    throw sourceWriterError("invalid-path", "Null bytes are not allowed.");
  }
  const rawPath = requestPath.trim();
  if (/^[a-z]:[\\/]/i.test(rawPath) || rawPath.startsWith("\\\\") || path.isAbsolute(rawPath)) {
    throw sourceWriterError("absolute-path-not-allowed", "Absolute paths are not allowed.");
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(rawPath)) {
    throw sourceWriterError("invalid-path", "URL paths are not allowed.");
  }
  return rawPath;
}

function decodeRequestPath(rawPath) {
  try {
    let decoded = rawPath;
    for (let index = 0; index < 2 && decoded.includes("%"); index += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        break;
      }
      decoded = next;
    }
    return decoded;
  } catch (error) {
    throw sourceWriterError("invalid-path", "Encoded path is invalid.");
  }
}

function normalizeRelativePath(requestPath) {
  if (requestPath.split(/[\\/]/).includes("..")) {
    throw sourceWriterError("invalid-path", "Path traversal is not allowed.");
  }
  const normalized = path.normalize(requestPath).replace(/^([\\/])+/, "");
  if (!normalized || normalized === "." || normalized.split(/[\\/]/).includes("..")) {
    throw sourceWriterError("invalid-path", "Path traversal is not allowed.");
  }
  return normalized;
}

async function rejectSymlinkPath(repoRoot, relativePath) {
  const segments = relativePath.split(/[\\/]/).filter(Boolean);
  let current = repoRoot;
  for (const segment of segments) {
    current = path.join(current, segment);
    let entry = null;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (segment === segments[segments.length - 1]) {
        throw sourceWriterError("file-not-found", "Source file was not found.");
      }
      throw sourceWriterError("invalid-path", "Source path does not exist.");
    }
    if (entry.isSymbolicLink()) {
      throw sourceWriterError("symlink-not-allowed", "Symlink or junction paths are not allowed.");
    }
  }
}

async function readAllowedSource(writer, target) {
  const entry = await stat(target.realPath);
  if (!entry.isFile()) {
    throw sourceWriterError("not-a-file", "Source path is not a regular file.");
  }
  if (entry.size > writer.maxFileBytes) {
    throw sourceWriterError("file-too-large", "Source file exceeds the size limit.");
  }
  const bytes = await readFile(target.realPath);
  decodeUtf8(bytes);
  return bytes;
}

function decodeUtf8(bytes) {
  const bom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  const text = bytes.toString("utf8");
  const encoded = Buffer.from(text, "utf8");
  if (!encoded.equals(bytes)) {
    throw sourceWriterError("unsupported-encoding", "Only UTF-8 source files are supported.");
  }
  return { text, bom };
}

function encodeUtf8(text, keepBom) {
  const encoded = Buffer.from(text, "utf8");
  if (!keepBom || (encoded.length >= 3 && encoded[0] === 0xef && encoded[1] === 0xbb && encoded[2] === 0xbf)) {
    return encoded;
  }
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), encoded]);
}

async function atomicReplaceBytes(targetPath, bytes) {
  const directory = path.dirname(targetPath);
  const baseName = path.basename(targetPath);
  const tempPath = path.join(directory, `.${baseName}.tbalance-write-${crypto.randomBytes(8).toString("hex")}.tmp`);
  const originalStat = await stat(targetPath);
  await writeFile(tempPath, bytes, { flag: "wx", mode: originalStat.mode });
  const fileHandle = await open(tempPath, "r+");
  try {
    await fileHandle.sync();
  } finally {
    await fileHandle.close();
  }
  try {
    await chmod(tempPath, originalStat.mode);
  } catch (error) {
    // Windows attributes may not always map cleanly to POSIX modes.
  }
  await rename(tempPath, targetPath);
  return { tempPath };
}

async function rollbackSource(targetPath, originalBytes) {
  try {
    await atomicReplaceBytes(targetPath, originalBytes);
  } catch (error) {
    throw sourceWriterError("rollback-failed", "Rollback failed.", { detail: error?.message || String(error) });
  }
}

async function cleanupTemp(tempPath) {
  try {
    await access(tempPath, fsConstants.F_OK);
    await rm(tempPath, { force: true });
  } catch (error) {
    // Already gone.
  }
}

export function sourceWriterError(errorCode, message, extra = {}) {
  const error = new Error(message);
  error.sourceWriterError = true;
  error.errorCode = errorCode;
  error.publicMessage = message;
  Object.assign(error, extra);
  return error;
}
