import http from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = Number(process.env.TBALANCE_AI_BRIDGE_PORT || 8787);
const MAX_BODY_BYTES = 24 * 1024 * 1024;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.join(__dirname, "current-state.json");
const VIEW_PATH = path.join(__dirname, "current-view.webp");
const SUGGESTION_PATH = path.join(__dirname, "ai-suggestion.json");
const HISTORY_ROOT = path.join(__dirname, "history");
const HISTORY_LIMIT = 5;

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Max-Age", "600");
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function decodeDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") {
    return null;
  }
  const match = dataUrl.match(/^data:image\/webp;base64,(.+)$/);
  return match ? Buffer.from(match[1], "base64") : null;
}

function safeSegment(value, fallback = "item") {
  return String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || fallback;
}

function getHistoryScope(payload) {
  const projectKey = safeSegment(payload.project?.id || payload.project?.name || "tbalance_project", "tbalance_project");
  const pageKey = safeSegment(payload.pageId || payload.page || "page", "page");
  return {
    projectKey,
    pageKey,
    dir: path.join(HISTORY_ROOT, projectKey, pageKey),
  };
}

function getHistoryIndexPath(scope) {
  return path.join(scope.dir, "history-index.json");
}

async function readHistoryIndex(scope) {
  try {
    const text = await readFile(getHistoryIndexPath(scope), "utf8");
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function writeHistoryIndex(scope, entries) {
  await mkdir(scope.dir, { recursive: true });
  await writeFile(getHistoryIndexPath(scope), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

function createHistoryEntryId(date = new Date()) {
  const pad = (value, size = 2) => String(value).padStart(size, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    "_",
    pad(date.getMilliseconds(), 3),
  ].join("");
}

async function saveHistorySnapshot(payload, state, imageBuffer) {
  const scope = getHistoryScope(payload);
  const savedAt = state.bridge.savedAt;
  const entryId = createHistoryEntryId(new Date(savedAt));
  const entryDir = path.join(scope.dir, entryId);
  const statePath = path.join(entryDir, "state.json");
  const viewPath = path.join(entryDir, "view.webp");
  await mkdir(entryDir, { recursive: true });

  const entryState = Object.assign({}, state, {
    screenshot: state.screenshot ? Object.assign({}, state.screenshot, {
      file: "view.webp",
      historyFile: path.relative(__dirname, viewPath).replace(/\\/g, "/"),
    }) : null,
    bridge: Object.assign({}, state.bridge, {
      historyId: entryId,
      historyProjectKey: scope.projectKey,
      historyPageKey: scope.pageKey,
    }),
  });
  await writeFile(statePath, `${JSON.stringify(entryState, null, 2)}\n`, "utf8");
  if (imageBuffer) {
    await writeFile(viewPath, imageBuffer);
  }

  const index = await readHistoryIndex(scope);
  const nextEntry = {
    id: entryId,
    savedAt,
    label: state.page || payload.page || "TBalance",
    note: payload.userNote || "",
    project: payload.project?.name || "",
    page: payload.page || "",
    mode: payload.mode || "",
    stateFile: path.relative(__dirname, statePath).replace(/\\/g, "/"),
    viewFile: imageBuffer ? path.relative(__dirname, viewPath).replace(/\\/g, "/") : "",
  };
  const nextIndex = [...index.filter((entry) => entry.id !== entryId), nextEntry]
    .sort((a, b) => String(a.savedAt).localeCompare(String(b.savedAt)));
  const overflow = nextIndex.length > HISTORY_LIMIT ? nextIndex.splice(0, nextIndex.length - HISTORY_LIMIT) : [];
  await writeHistoryIndex(scope, nextIndex);
  await Promise.all(overflow.map((entry) => rm(path.join(scope.dir, entry.id), { recursive: true, force: true })));
  return { entry: nextEntry, entries: nextIndex };
}

async function saveSnapshot(req, res) {
  try {
    const body = await readRequestBody(req);
    const payload = JSON.parse(body || "{}");
    const screenshot = payload.screenshot || null;
    const imageBuffer = decodeDataUrl(screenshot?.dataUrl);
    const state = Object.assign({}, payload, {
      screenshot: screenshot ? {
        mime: screenshot.mime || "image/webp",
        width: screenshot.width || 0,
        height: screenshot.height || 0,
        file: "current-view.webp",
        error: screenshot.error || "",
      } : null,
      bridge: {
        savedAt: new Date().toISOString(),
        host: HOST,
        port: PORT,
      },
    });

    await mkdir(__dirname, { recursive: true });
    await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    if (imageBuffer) {
      await writeFile(VIEW_PATH, imageBuffer);
    }
    const history = await saveHistorySnapshot(payload, state, imageBuffer);
    sendJson(res, 200, {
      ok: true,
      savedAt: state.bridge.savedAt,
      historyId: history.entry.id,
      historyCount: history.entries.length,
      stateFile: STATE_PATH,
      viewFile: imageBuffer ? VIEW_PATH : "",
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      error: error?.message || "Invalid request.",
    });
  }
}

async function readHistory(req, res) {
  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  const scope = getHistoryScope({
    project: { id: url.searchParams.get("projectId") || url.searchParams.get("project") || "" },
    pageId: url.searchParams.get("pageId") || url.searchParams.get("page") || "",
  });
  const entries = await readHistoryIndex(scope);
  sendJson(res, 200, {
    ok: true,
    limit: HISTORY_LIMIT,
    projectKey: scope.projectKey,
    pageKey: scope.pageKey,
    entries: entries.slice().reverse(),
  });
}

async function restoreHistory(req, res) {
  try {
    const body = await readRequestBody(req);
    const payload = JSON.parse(body || "{}");
    const scope = getHistoryScope(payload);
    const entries = await readHistoryIndex(scope);
    const entry = entries.find((item) => item.id === payload.id);
    if (!entry) {
      throw new Error("History entry was not found.");
    }
    const statePath = path.join(__dirname, entry.stateFile || "");
    const viewPath = path.join(__dirname, entry.viewFile || "");
    const text = await readFile(statePath, "utf8");
    const restored = JSON.parse(text);
    restored.bridge = Object.assign({}, restored.bridge, {
      restoredAt: new Date().toISOString(),
      restoredFromHistoryId: entry.id,
    });
    await writeFile(STATE_PATH, `${JSON.stringify(restored, null, 2)}\n`, "utf8");
    if (entry.viewFile) {
      const image = await readFile(viewPath);
      await writeFile(VIEW_PATH, image);
    }
    sendJson(res, 200, {
      ok: true,
      restoredAt: restored.bridge.restoredAt,
      entry,
      state: restored,
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      error: error?.message || "Could not restore history.",
    });
  }
}

async function readState(res) {
  try {
    const text = await readFile(STATE_PATH, "utf8");
    setCorsHeaders(res);
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(text);
  } catch (error) {
    sendJson(res, 404, {
      ok: false,
      error: "current-state.json is not ready.",
    });
  }
}

async function readScreenshot(res) {
  try {
    const image = await readFile(VIEW_PATH);
    setCorsHeaders(res);
    res.writeHead(200, {
      "Content-Type": "image/webp",
      "Cache-Control": "no-store",
    });
    res.end(image);
  } catch (error) {
    sendJson(res, 404, {
      ok: false,
      error: "current-view.webp is not ready.",
    });
  }
}

async function readSuggestion(res) {
  try {
    const text = await readFile(SUGGESTION_PATH, "utf8");
    setCorsHeaders(res);
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(text);
  } catch (error) {
    sendJson(res, 404, {
      ok: false,
      error: "ai-suggestion.json is not ready.",
    });
  }
}

async function saveSuggestion(req, res) {
  try {
    const body = await readRequestBody(req);
    const payload = JSON.parse(body || "{}");
    const savedAt = new Date().toISOString();
    const suggestion = Object.assign({}, payload, {
      ok: true,
      savedAt,
    });
    await mkdir(__dirname, { recursive: true });
    await writeFile(SUGGESTION_PATH, `${JSON.stringify(suggestion, null, 2)}\n`, "utf8");
    sendJson(res, 200, {
      ok: true,
      savedAt,
      suggestionFile: SUGGESTION_PATH,
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      error: error?.message || "Could not save AI suggestion.",
    });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/tbalance/health") {
    sendJson(res, 200, { ok: true, host: HOST, port: PORT });
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/tbalance/state") {
    await readState(res);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/tbalance/screenshot") {
    await readScreenshot(res);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/tbalance/history") {
    await readHistory(req, res);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/tbalance/suggestion") {
    await readSuggestion(res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/tbalance/share") {
    await saveSnapshot(req, res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/tbalance/suggestion") {
    await saveSuggestion(req, res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/tbalance/history/restore") {
    await restoreHistory(req, res);
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found." });
});

server.listen(PORT, HOST, () => {
  console.log(`TBalance AI bridge listening on http://${HOST}:${PORT}`);
});
