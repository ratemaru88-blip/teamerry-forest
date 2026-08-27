(function () {
  "use strict";

  const SAFE_APPLY_VERSION = "0.1";
  const COMPATIBILITY_VERSION = "1.0";
  const SUPPORTED_OPERATION = "set-css-declaration";

  function createSourceWriterClient(options = {}) {
    const baseUrl = options.baseUrl || "http://127.0.0.1:8787/api/tbalance/source-writer";
    return {
      async capabilities() {
        const response = await fetch(`${baseUrl}/capabilities`, { method: "GET" });
        return readJsonResponse(response);
      },
      async read(path) {
        const response = await fetch(`${baseUrl}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        return readJsonResponse(response);
      },
      async write(request) {
        const response = await fetch(`${baseUrl}/write`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        return readJsonResponse(response);
      },
    };
  }

  async function runApplyPreflight(input = {}) {
    const now = new Date().toISOString();
    const candidate = input.candidate || null;
    const approvedSignature = input.approvedSignature || "";
    const createSignature = input.createSignature || window.TBalanceSafePatch?.createCandidateSignature;
    const sourceWriterClient = input.sourceWriterClient;
    const checks = [];

    function block(reason, message, extra = {}) {
      checks.push({ id: reason, status: "failed", message });
      const status = extra.status || "preflight-blocked";
      const rest = { ...extra };
      delete rest.status;
      return buildPreflightResult(status, reason, message, {
        candidate,
        checks,
        startedAt: now,
        ...rest,
      });
    }

    if (!candidate) {
      return block("missing-candidate", "Safe Patch Candidateがありません。");
    }
    if (candidate.status !== "ready-for-review") {
      return block(candidate.status || "not-ready", "ready-for-review CandidateだけApplyできます。");
    }
    if (candidate.review?.status !== "approved") {
      return block("not-approved", "Approved CandidateだけApplyできます。");
    }
    if (!approvedSignature) {
      return block("approval-invalid", "Approved Signatureがありません。");
    }
    if (typeof createSignature !== "function") {
      return block("signature-unavailable", "Candidate Signatureを確認できません。");
    }
    const currentSignature = createSignature(candidate);
    if (currentSignature !== approvedSignature || currentSignature !== candidate.signature) {
      return block("approval-invalid", "Candidateが承認後に変更されています。", { currentSignature });
    }
    checks.push({ id: "candidate-signature", status: "passed", message: "Approved Signature一致。" });

    const operations = Array.isArray(candidate.operations) ? candidate.operations : [];
    if (operations.length !== 1) {
      return block("invalid-operation-count", "v0.1では1 OperationだけApplyできます。");
    }
    const operation = operations[0];
    if (operation.type !== SUPPORTED_OPERATION) {
      return block("unsupported-operation", `${operation.type || "unknown"} はApply対象外です。`);
    }
    if (candidate.protectedProperties?.includes(operation.property)) {
      return block("protected-property", `${operation.property} はprotectedPropertiesに含まれています。`);
    }
    const sourceRef = operation.sourceRef || operation.source || {};
    const sourcePath = sourceRef.sourcePath || sourceRef.path || "";
    if (!sourcePath || !sourcePath.endsWith(".css")) {
      return block("unsupported-source-type", "v0.1では実CSS Source FileだけApplyできます。");
    }
    if (sourceRef.sourceType && sourceRef.sourceType !== "stylesheet-rule") {
      return block("unsupported-source-type", "inline styleやHTML SourceへのApplyはv0.1対象外です。");
    }

    let capabilities;
    try {
      capabilities = await sourceWriterClient.capabilities();
    } catch (error) {
      return block("source-writer-unavailable", "Source Writer Bridgeへ接続できません。", { error: error?.message || String(error) });
    }
    if (!capabilities?.ok || !capabilities.read || !capabilities.write) {
      return block(capabilities?.write ? "source-writer-unavailable" : "writer-disabled", "Source Writer Bridgeがread/write可能ではありません。", { capabilities });
    }
    if (!capabilities.allowedExtensions?.includes(".css")) {
      return block("unsupported-source-type", "Source Writer Bridgeが.cssを許可していません。", { capabilities });
    }
    checks.push({ id: "source-writer-capability", status: "passed", message: "Source Writer read/write/.cssを確認。" });

    let currentSource;
    try {
      currentSource = await sourceWriterClient.read(sourcePath);
    } catch (error) {
      const normalized = normalizeClientError(error);
      return block(normalized.errorCode || "source-read-failed", normalized.error || "Source Writerで実Sourceを読めません。", { error: normalized });
    }
    if (!currentSource?.ok) {
      return block(currentSource?.errorCode || "source-read-failed", currentSource?.error || "Source Writer read failed.", { currentSource });
    }
    checks.push({ id: "source-read", status: "passed", message: `${currentSource.path} を再Read。` });

    const resolution = resolveCssDeclaration(currentSource.content, {
      selector: sourceRef.selector,
      property: operation.property,
      media: sourceRef.media || operation.source?.media || "",
    });
    if (resolution.status !== "resolved") {
      return block(resolution.reason || resolution.status, resolution.message || "CSS Declarationを一意に解決できません。", { currentSource, resolution });
    }
    if (normalizeCssValue(resolution.declaration.value) !== normalizeCssValue(operation.before)) {
      if (normalizeCssValue(resolution.declaration.value) === normalizeCssValue(operation.after)) {
        return block("already-applied", "現在SourceはすでにAfter値です。同じCandidateは再Applyしません。", { currentSource, resolution, status: "already-applied" });
      }
      return block("before-mismatch", "Apply直前のSource値がCandidate beforeと一致しません。", { currentSource, resolution });
    }
    checks.push({ id: "before-value", status: "passed", message: `${operation.property}: ${operation.before}` });

    const expected = buildExpectedSource(currentSource.content, resolution.declaration, operation.after, operation.priority || resolution.declaration.priority || "");
    if (!expected.ok) {
      return block(expected.reason || "expected-source-failed", expected.message || "Expected Sourceを生成できません。", { currentSource, resolution });
    }
    const diffValidation = validateSingleDeclarationDiff(currentSource.content, expected.content, operation, resolution.declaration);
    if (!diffValidation.ok) {
      return block(diffValidation.reason || "unexpected-diff", diffValidation.message || "Expected Diffが1 Declarationだけではありません。", { currentSource, resolution, expected });
    }
    checks.push({ id: "expected-diff", status: "passed", message: "Expected Diffは1 Declarationのみ。" });

    const expectedNewSha256 = await sha256Text(expected.content);
    return {
      ok: true,
      safeApplyVersion: SAFE_APPLY_VERSION,
      status: "ready-to-apply",
      reason: "",
      message: "Preflight passed. Human Final Confirmation後に実Sourceへ適用できます。",
      generatedAt: now,
      candidateSignature: candidate.signature,
      target: cloneJsonValue(candidate.target),
      operation: cloneJsonValue(operation),
      source: {
        path: currentSource.path,
        beforeSha256: currentSource.sha256,
        expectedAfterSha256: expectedNewSha256,
        byteLength: currentSource.byteLength,
      },
      originalSource: currentSource.content,
      sourceChange: {
        selector: sourceRef.selector,
        media: sourceRef.media || null,
        property: operation.property,
        before: operation.before,
        after: operation.after,
      },
      expectedSource: expected.content,
      diffText: buildDeclarationDiffText(sourcePath, sourceRef.selector, operation),
      validation: {
        preflight: "passed",
        expectedDiffOnly: true,
        checks,
      },
      protectedBehavior: cloneJsonValue(candidate.protectedBehavior || null),
      doNotChange: cloneJsonValue(candidate.doNotChange || []),
      validationChecks: cloneJsonValue(candidate.validationChecks || []),
      policy: buildApplyPolicy(),
    };
  }

  async function applyApprovedCandidate(input = {}) {
    const preflight = input.preflight || null;
    const sourceWriterClient = input.sourceWriterClient;
    if (!preflight?.ok || preflight.status !== "ready-to-apply") {
      return buildApplyResult("preflight-blocked", "not-ready", "Preflightが成功していません。", { preflight });
    }
    let writeResult;
    try {
      writeResult = await sourceWriterClient.write({
        path: preflight.source.path,
        expectedSha256: preflight.source.beforeSha256,
        newContent: preflight.expectedSource,
        expectedNewSha256: preflight.source.expectedAfterSha256,
      });
    } catch (error) {
      const normalized = normalizeClientError(error);
      return buildApplyResult(normalized.errorCode === "source-changed" ? "source-changed" : "failed", normalized.errorCode, normalized.error || "Source Writer write failed.", { preflight, writeResult: normalized });
    }
    if (!writeResult?.ok || writeResult.status !== "written" || writeResult.verified !== true) {
      return buildApplyResult(writeResult?.errorCode || writeResult?.status || "source-write-failed", writeResult?.errorCode || "source-write-failed", writeResult?.error || "Source Writer write failed.", { preflight, writeResult });
    }

    let afterRead;
    try {
      afterRead = await sourceWriterClient.read(preflight.source.path);
    } catch (error) {
      return buildApplyResult("validation-partial", "source-readback-failed", "Write後のSource再Readに失敗しました。", { preflight, writeResult, error: normalizeClientError(error) });
    }
    const actualDiff = validateSingleDeclarationDiffBySource(preflight.expectedSource, afterRead.content, preflight.operation);
    if (!afterRead?.ok || afterRead.sha256 !== preflight.source.expectedAfterSha256 || !actualDiff.ok) {
      const rollback = await rollbackAppliedSource(preflight, afterRead, sourceWriterClient);
      return buildApplyResult(rollback.status, "unexpected-actual-diff", "承認外Diffを検出したため成功扱いにしません。", {
        preflight,
        writeResult,
        afterRead,
        rollback,
      });
    }

    return {
      ok: true,
      safeApplyVersion: SAFE_APPLY_VERSION,
      status: "applied",
      appliedAt: new Date().toISOString(),
      candidateSignature: preflight.candidateSignature,
      target: cloneJsonValue(preflight.target),
      source: {
        path: preflight.source.path,
        beforeSha256: preflight.source.beforeSha256,
        afterSha256: afterRead.sha256,
      },
      sourceChange: cloneJsonValue(preflight.sourceChange),
      validation: {
        preflight: "passed",
        sourceWrite: "passed",
        sourceReadBack: "passed",
        expectedDiffOnly: true,
        actualDiffOnly: true,
        runtimeVisual: "manual-required",
        protectedBehavior: "manual-required",
      },
      protectedBehavior: cloneJsonValue(preflight.protectedBehavior || null),
      doNotChange: cloneJsonValue(preflight.doNotChange || []),
      validationChecks: cloneJsonValue(preflight.validationChecks || []),
      policy: buildApplyPolicy(),
      writeResult,
    };
  }

  function resolveCssDeclaration(sourceText, query = {}) {
    if (!query.selector || !query.property) {
      return { status: "unresolved", reason: "source-location-unresolved", message: "selector/propertyが不足しています。" };
    }
    const matches = [];
    collectRuleBlocks(sourceText, 0, sourceText.length, "", matches, query);
    if (matches.length === 1) {
      return { status: "resolved", declaration: matches[0] };
    }
    if (matches.length > 1) {
      return { status: "multiple", reason: "multiple-source-candidates", message: "同じSelector/Propertyの候補が複数あります。", candidates: matches };
    }
    return { status: "unresolved", reason: "source-location-unresolved", message: "対象CSS Declarationが見つかりません。" };
  }

  function collectRuleBlocks(text, start, end, mediaText, matches, query) {
    let index = start;
    while (index < end) {
      const brace = text.indexOf("{", index);
      if (brace < 0 || brace >= end) {
        break;
      }
      const selectorStart = findStatementStart(text, index, brace);
      const header = text.slice(selectorStart, brace).trim();
      const close = findMatchingBrace(text, brace, end);
      if (close < 0) {
        break;
      }
      if (/^@media\b/i.test(header) || /^@supports\b/i.test(header)) {
        const nextMedia = header.replace(/^@(media|supports)\s*/i, "").trim();
        collectRuleBlocks(text, brace + 1, close, nextMedia || mediaText, matches, query);
      } else if (mediaMatches(mediaText, query.media) && selectorMatches(header, query.selector)) {
        collectDeclarations(text, brace + 1, close, query.property, header, mediaText, matches);
      }
      index = close + 1;
    }
  }

  function findStatementStart(text, fallbackStart, braceIndex) {
    const prevBrace = text.lastIndexOf("}", braceIndex - 1);
    const prevSemi = text.lastIndexOf(";", braceIndex - 1);
    return Math.max(fallbackStart, prevBrace + 1, prevSemi + 1);
  }

  function findMatchingBrace(text, openIndex, limit) {
    let depth = 0;
    let quote = "";
    for (let index = openIndex; index < limit; index += 1) {
      const char = text[index];
      const prev = text[index - 1];
      if (quote) {
        if (char === quote && prev !== "\\") {
          quote = "";
        }
        continue;
      }
      if (char === "\"" || char === "'") {
        quote = char;
        continue;
      }
      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
      }
    }
    return -1;
  }

  function collectDeclarations(text, start, end, property, selector, mediaText, matches) {
    const declarationPattern = new RegExp(`(^|[;\\n\\r])\\s*(${escapeRegExp(property)})\\s*:`, "gi");
    let match;
    while ((match = declarationPattern.exec(text.slice(start, end)))) {
      const absoluteMatch = start + match.index;
      const propertyStart = absoluteMatch + match[1].length + match[0].indexOf(match[2]);
      const colon = text.indexOf(":", propertyStart);
      if (colon < 0 || colon >= end) {
        continue;
      }
      const semi = findDeclarationEnd(text, colon + 1, end);
      const rawValueStart = colon + 1;
      const rawValueEnd = semi;
      const valueText = text.slice(rawValueStart, rawValueEnd);
      const trimmedStartOffset = valueText.search(/\S/);
      const leading = trimmedStartOffset < 0 ? valueText.length : trimmedStartOffset;
      const trailing = valueText.length - valueText.replace(/\s+$/g, "").length;
      const valueStart = rawValueStart + leading;
      const valueEnd = rawValueEnd - trailing;
      const normalized = parseCssValueAndPriority(text.slice(valueStart, valueEnd));
      matches.push({
        selector,
        media: mediaText || "",
        property,
        value: normalized.value,
        priority: normalized.priority,
        valueStart,
        valueEnd,
        rawValue: text.slice(valueStart, valueEnd),
      });
    }
  }

  function findDeclarationEnd(text, start, limit) {
    let quote = "";
    let paren = 0;
    for (let index = start; index < limit; index += 1) {
      const char = text[index];
      const prev = text[index - 1];
      if (quote) {
        if (char === quote && prev !== "\\") {
          quote = "";
        }
        continue;
      }
      if (char === "\"" || char === "'") {
        quote = char;
        continue;
      }
      if (char === "(") {
        paren += 1;
      } else if (char === ")") {
        paren = Math.max(0, paren - 1);
      } else if (char === ";" && paren === 0) {
        return index;
      }
    }
    return limit;
  }

  function buildExpectedSource(sourceText, declaration, afterValue, priority = "") {
    if (!declaration || !Number.isFinite(declaration.valueStart) || !Number.isFinite(declaration.valueEnd)) {
      return { ok: false, reason: "source-location-unresolved", message: "Declaration value rangeがありません。" };
    }
    const normalizedAfter = `${String(afterValue).trim()}${priority ? ` !${priority}` : ""}`;
    const content = `${sourceText.slice(0, declaration.valueStart)}${normalizedAfter}${sourceText.slice(declaration.valueEnd)}`;
    return { ok: true, content };
  }

  function validateSingleDeclarationDiff(beforeText, afterText, operation, declaration) {
    if (beforeText === afterText) {
      return { ok: false, reason: "no-op", message: "Expected Sourceに差分がありません。" };
    }
    const rebuilt = buildExpectedSource(beforeText, declaration, operation.after, operation.priority || declaration.priority || "");
    if (!rebuilt.ok || rebuilt.content !== afterText) {
      return { ok: false, reason: "unexpected-diff", message: "差分が対象Declarationだけに限定されていません。" };
    }
    return { ok: true };
  }

  function validateSingleDeclarationDiffBySource(expectedText, actualText) {
    return expectedText === actualText
      ? { ok: true }
      : { ok: false, reason: "unexpected-actual-diff", message: "Write後SourceがExpected Sourceと一致しません。" };
  }

  async function rollbackAppliedSource(preflight, afterRead, sourceWriterClient) {
    if (!afterRead?.ok || !preflight?.source?.path || !preflight?.originalSource) {
      return { status: "rollback-failed", message: "Rollbackに必要なSource Snapshotがありません。" };
    }
    try {
      const result = await sourceWriterClient.write({
        path: preflight.source.path,
        expectedSha256: afterRead.sha256,
        newContent: preflight.originalSource,
        expectedNewSha256: preflight.source.beforeSha256,
      });
      return result?.ok ? { status: "rolled-back", result } : { status: "rollback-failed", result };
    } catch (error) {
      return { status: "rollback-failed", error: normalizeClientError(error) };
    }
  }

  function buildPreflightResult(status, reason, message, extra = {}) {
    return {
      ok: false,
      safeApplyVersion: SAFE_APPLY_VERSION,
      status,
      reason,
      message,
      generatedAt: extra.startedAt || new Date().toISOString(),
      candidateSignature: extra.candidate?.signature || "",
      target: cloneJsonValue(extra.candidate?.target || null),
      validation: {
        preflight: "failed",
        checks: cloneJsonValue(extra.checks || []),
      },
      policy: buildApplyPolicy(),
      ...Object.fromEntries(Object.entries(extra).filter(([key]) => !["candidate", "checks", "startedAt"].includes(key))),
    };
  }

  function buildApplyResult(status, reason, message, extra = {}) {
    return {
      ok: false,
      safeApplyVersion: SAFE_APPLY_VERSION,
      status,
      reason,
      message,
      generatedAt: new Date().toISOString(),
      policy: buildApplyPolicy(),
      ...extra,
    };
  }

  function buildApplyPolicy() {
    return {
      gitCommitPerformed: false,
      pushPerformed: false,
      publishPerformed: false,
      automaticApplyAllowed: false,
    };
  }

  function buildDeclarationDiffText(path, selector, operation) {
    return [
      `File: ${path || "-"}`,
      `Selector: ${selector || "-"}`,
      `Property: ${operation.property || "-"}`,
      `Before: ${operation.before}`,
      `After: ${operation.after}`,
      "",
      `- ${operation.property}: ${operation.before};`,
      `+ ${operation.property}: ${operation.after};`,
    ].join("\n");
  }

  async function readJsonResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      const error = new Error(data.error || `Request failed: ${response.status}`);
      error.errorCode = data.errorCode || "request-failed";
      error.payload = data;
      throw error;
    }
    return data;
  }

  async function sha256Text(text) {
    const bytes = new TextEncoder().encode(String(text));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function normalizeClientError(error) {
    return {
      ok: false,
      errorCode: error?.errorCode || error?.payload?.errorCode || "request-failed",
      error: error?.payload?.error || error?.message || String(error),
    };
  }

  function normalizeCssValue(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }

  function parseCssValueAndPriority(rawValue) {
    const text = String(rawValue || "").trim();
    const important = text.match(/\s*!important\s*$/i);
    if (!important) {
      return { value: text, priority: "" };
    }
    return {
      value: text.slice(0, important.index).trim(),
      priority: "important",
    };
  }

  function mediaMatches(actual, expected) {
    return normalizeCssValue(actual || "") === normalizeCssValue(expected || "");
  }

  function selectorMatches(actual, expected) {
    return String(actual || "").split(",").map((part) => part.trim()).includes(String(expected || "").trim());
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function cloneJsonValue(value) {
    if (value === undefined) {
      return null;
    }
    return JSON.parse(JSON.stringify(value));
  }

  window.TBalanceSafeApply = {
    SAFE_APPLY_VERSION,
    createSourceWriterClient,
    runApplyPreflight,
    applyApprovedCandidate,
    resolveCssDeclaration,
    buildExpectedSource,
  };
})();
