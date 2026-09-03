import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const PROVIDER_ID = "codex-local";
const PROVIDER_LABEL = "Codex Local";
const DEFAULT_TIMEOUT_MS = 90000;

export function createCodexLocalSafetyProvider(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const codexCommand = options.codexCommand || process.env.TBALANCE_CODEX_COMMAND || resolveCodexCommand();
  const timeoutMs = Number(options.timeoutMs || process.env.TBALANCE_CODEX_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  return {
    id: PROVIDER_ID,
    label: PROVIDER_LABEL,
    capabilities: {
      automaticReview: true,
      apiKeyRequired: false,
      sourceMutationAllowed: false,
      sandbox: "read-only",
      persistentSession: false,
      structuredResponse: true,
      timeoutMs,
    },
    isConfigured: async () => checkCodexLogin(codexCommand, projectRoot),
    reviewSafetyChange: async (request = {}) => {
      const configured = await checkCodexLogin(codexCommand, projectRoot);
      if (!configured.ok) {
        return {
          ok: false,
          provider: PROVIDER_ID,
          errorCode: "provider-unavailable",
          message: configured.message || "Codex Local Providerを利用できません。",
          diagnostics: configured,
        };
      }
      const prompt = buildSafetyReviewPrompt(request);
      const run = await runCodexExec({
        codexCommand,
        projectRoot,
        prompt,
        timeoutMs,
      });
      if (!run.ok) {
        return {
          ok: false,
          provider: PROVIDER_ID,
          requestId: request.requestId || "",
          errorCode: run.errorCode || "codex-exec-failed",
          message: run.message || "Codex Local Reviewに失敗しました。",
          diagnostics: run.diagnostics,
        };
      }
      const parsed = parseStructuredReviewResponse(run.finalText);
      if (!parsed.ok) {
        return {
          ok: false,
          provider: PROVIDER_ID,
          requestId: request.requestId || "",
          errorCode: "invalid-provider-response",
          message: parsed.message || "Codex ResponseをJSONとして確認できませんでした。",
          diagnostics: buildProviderDiagnostics(request, run, {
            jsonlParseSuccess: true,
            finalAgentMessageFound: Boolean(run.finalText),
            structuredResponseValidationSuccess: false,
            responseParseSuccess: false,
            responseParseMessage: parsed.message || "",
          }),
        };
      }
      const validation = validateSafetyReviewResponse(parsed.value, request);
      if (!validation.ok) {
        return {
          ok: false,
          provider: PROVIDER_ID,
          requestId: request.requestId || "",
          errorCode: "schema-mismatch",
          message: validation.message,
          response: parsed.value,
          diagnostics: buildProviderDiagnostics(request, run, {
            jsonlParseSuccess: true,
            finalAgentMessageFound: Boolean(run.finalText),
            structuredResponseValidationSuccess: false,
            responseParseSuccess: true,
            responseValidationMessage: validation.message || "",
            finalResponseSummary: summarizeStructuredResponse(parsed.value),
          }),
        };
      }
      return {
        ok: true,
        provider: PROVIDER_ID,
        providerLabel: PROVIDER_LABEL,
        requestId: request.requestId || parsed.value.requestId || "",
        response: normalizeSafetyReviewResponse(parsed.value, request),
        diagnostics: buildProviderDiagnostics(request, run, {
          jsonlParseSuccess: true,
          finalAgentMessageFound: Boolean(run.finalText),
          structuredResponseValidationSuccess: true,
          responseParseSuccess: true,
          finalResponseSummary: summarizeStructuredResponse(parsed.value),
        }),
      };
    },
  };
}

function checkCodexLogin(codexCommand, cwd) {
  return new Promise((resolve) => {
    const child = spawn(codexCommand, ["login", "status"], {
      cwd,
      windowsHide: true,
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      resolve({
        ok: false,
        errorCode: "codex-not-found",
        message: error?.message || "Codex CLIを起動できません。",
      });
    });
    child.on("close", (code) => {
      const text = `${stdout}\n${stderr}`;
      resolve({
        ok: code === 0 && /Logged in using ChatGPT/i.test(text),
        status: text.trim(),
        auth: /Logged in using ChatGPT/i.test(text) ? "chatgpt" : "unknown",
        errorCode: code === 0 ? "" : "codex-login-status-failed",
        message: code === 0
          ? (/Logged in using ChatGPT/i.test(text) ? "Codex ChatGPT login detected." : "Codex is not logged in using ChatGPT.")
          : "Codex login status failed.",
      });
    });
  });
}

function runCodexExec({ codexCommand, projectRoot, prompt, timeoutMs }) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const args = [
      "exec",
      "-C",
      projectRoot,
      "--sandbox",
      "read-only",
      "--json",
      "-",
    ];
    const child = spawn(codexCommand, args, {
      cwd: projectRoot,
      windowsHide: true,
      shell: false,
      env: {
        ...process.env,
        NO_COLOR: "1",
      },
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill();
      resolve({
        ok: false,
        errorCode: "timeout",
        message: "Codex Local Reviewがtimeoutしました。",
        timedOut: true,
        durationMs: Date.now() - startedAt,
        diagnostics: { stdout, stderr, timeoutMs },
      });
    }, timeoutMs);
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.stdin?.end(prompt);
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        errorCode: "codex-spawn-failed",
        message: error?.message || "Codex CLIを起動できません。",
        timedOut: false,
        durationMs: Date.now() - startedAt,
        diagnostics: { stdout, stderr },
      });
    });
    child.on("close", (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      const finalText = extractFinalAgentText(stdout);
      resolve({
        ok: code === 0 && Boolean(finalText),
        exitCode: code,
        timedOut: false,
        durationMs: Date.now() - startedAt,
        finalText,
        stdout,
        stderr,
        message: code === 0 ? "" : "Codex CLIが失敗しました。",
        errorCode: code === 0 ? "" : "codex-exit-nonzero",
        diagnostics: { stdout, stderr, exitCode: code },
      });
    });
  });
}

function buildProviderDiagnostics(request, run, extra = {}) {
  return {
    providerId: PROVIDER_ID,
    requestId: request.requestId || "",
    exitCode: typeof run.exitCode === "number" ? run.exitCode : null,
    timedOut: Boolean(run.timedOut),
    durationMs: Number(run.durationMs || 0),
    jsonlParseSuccess: Boolean(extra.jsonlParseSuccess),
    finalAgentMessageFound: Boolean(extra.finalAgentMessageFound),
    structuredResponseValidationSuccess: Boolean(extra.structuredResponseValidationSuccess),
    responseParseSuccess: Boolean(extra.responseParseSuccess),
    responseParseMessage: String(extra.responseParseMessage || ""),
    responseValidationMessage: String(extra.responseValidationMessage || ""),
    stderr: String(run.stderr || "").slice(0, 4000),
    finalResponseSummary: extra.finalResponseSummary || null,
  };
}

function summarizeStructuredResponse(response = {}) {
  const targets = Array.isArray(response.targets)
    ? response.targets
    : response.domRef || response.sourceChange || response.sourceChanges
      ? [response]
      : [];
  return {
    status: String(response.status || ""),
    requestId: String(response.requestId || ""),
    pageId: String(response.pageId || response.page?.pageId || ""),
    sourcePath: String(response.sourcePath || response.page?.sourcePath || ""),
    viewState: String(response.viewState || response.page?.viewState || ""),
    reason: String(response.reason || ""),
    confidence: String(response.confidence || ""),
    targets: targets.map((target) => ({
      changeId: String(target.changeId || target.id || target.target?.changeId || ""),
      domRef: String(target.domRef || target.target?.domRef || ""),
      status: String(target.status || target.result || response.status || ""),
      sourceChanges: normalizeSourceChanges(target.sourceChanges || target.sourceChange || target.sourcePatch || response.sourceChanges || response.sourceChange),
      preserve: Array.isArray(target.preserve) ? target.preserve.map(String) : [],
      risk: String(target.risk || target.riskLevel || ""),
      reason: String(target.reason || response.reason || ""),
      confidence: String(target.confidence || response.confidence || ""),
    })),
  };
}

function resolveCodexCommand() {
  if (process.platform !== "win32") {
    return "codex";
  }
  const localAppData = process.env.LOCALAPPDATA || "";
  const codexBinRoot = localAppData ? path.join(localAppData, "OpenAI", "Codex", "bin") : "";
  if (codexBinRoot && existsSync(codexBinRoot)) {
    const candidates = readdirSync(codexBinRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(codexBinRoot, entry.name, "codex.exe"))
      .filter((candidate) => existsSync(candidate));
    if (candidates.length) {
      return candidates[candidates.length - 1];
    }
  }
  return "codex.exe";
}

function extractFinalAgentText(stdout) {
  const lines = String(stdout || "").split(/\r?\n/).filter(Boolean);
  let finalText = "";
  lines.forEach((line) => {
    try {
      const event = JSON.parse(line);
      if (event.type === "item.completed" && event.item?.type === "agent_message") {
        finalText = String(event.item.text || "");
      }
    } catch (error) {
      // Ignore non-JSON diagnostics in stdout.
    }
  });
  return finalText.trim();
}

function parseStructuredReviewResponse(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return { ok: false, message: "Codex Responseが空です。" };
  }
  const direct = parseJson(raw);
  if (direct.ok) {
    return direct;
  }
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const parsed = parseJson(fenced[1]);
    if (parsed.ok) {
      return parsed;
    }
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return parseJson(raw.slice(start, end + 1));
  }
  return { ok: false, message: "Codex ResponseからJSONを抽出できません。" };
}

function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, message: error?.message || "Invalid JSON." };
  }
}

function validateSafetyReviewResponse(response, request = {}) {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return { ok: false, message: "Response root must be an object." };
  }
  if (!response.requestId || typeof response.requestId !== "string") {
    return { ok: false, message: "Response requestId is required." };
  }
  if (request.requestId && response.requestId !== request.requestId) {
    return { ok: false, message: "Response requestId must exactly match the request." };
  }
  const rootStatus = String(response.status || "").toLowerCase();
  const targets = Array.isArray(response.targets)
    ? response.targets
    : response.domRef || response.sourceChange || response.sourceChanges
      ? [response]
      : [];
  if (!["safe-candidate", "unresolved", "unsafe", "needs-review", "needs-manual-review"].includes(rootStatus)) {
    return { ok: false, message: "Response status is invalid." };
  }
  if (!targets.length) {
    return { ok: false, message: "Response targets are missing." };
  }
  for (const target of targets) {
    if (!target?.domRef && !target?.target?.domRef) {
      return { ok: false, message: "Target domRef is missing." };
    }
  }
  return { ok: true };
}

function normalizeSafetyReviewResponse(response, request = {}) {
  const reviewPackage = request.reviewPackage || {};
  const page = reviewPackage.page || {};
  const targets = Array.isArray(response.targets)
    ? response.targets
    : [response];
  return {
    schemaVersion: String(response.schemaVersion || "1.0"),
    workflowReview: true,
    provider: PROVIDER_ID,
    requestId: request.requestId || response.requestId || "",
    pageId: response.pageId || page.pageId || request.pageId || "",
    sourcePath: response.sourcePath || page.sourcePath || "",
    viewState: response.viewState || page.viewState || "",
    sourceFingerprint: response.sourceFingerprint || request.fingerprint || page.sourceFingerprint || "",
    requestRevision: response.requestRevision || request.revision || page.requestRevision || "",
    status: normalizeStatus(response.status),
    targets: targets.map((target) => ({
      ...target,
      domRef: target.domRef || target.target?.domRef || "",
      status: normalizeStatus(target.status || target.result || response.status),
      sourceChanges: normalizeSourceChanges(target.sourceChanges || target.sourceChange || target.sourcePatch || response.sourceChanges || response.sourceChange),
    })),
    reason: String(response.reason || ""),
    confidence: String(response.confidence || ""),
    raw: response,
  };
}

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase();
  if (status === "needs-manual-review") return "needs-review";
  if (status === "unresolved" || status === "unsafe") return status;
  if (status === "safe-candidate") return status;
  return "needs-review";
}

function normalizeSourceChanges(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((item) => ({
    sourcePath: String(item.sourcePath || item.path || ""),
    sourceType: String(item.sourceType || item.kind || "stylesheet-rule"),
    selector: String(item.selector || ""),
    property: String(item.property || item.cssProperty || ""),
    before: String(item.before ?? item.currentValue ?? ""),
    after: String(item.after ?? item.nextValue ?? ""),
    media: String(item.media || ""),
    reason: String(item.reason || ""),
  })).filter((item) => item.sourcePath && item.selector && item.property);
}

function buildSafetyReviewPrompt(request = {}) {
  const reviewPackage = request.reviewPackage || {};
  return [
    "You are Codex Local Provider for TBalance Safety AI Review.",
    "",
    "Rules:",
    "- Read only. Do not modify files.",
    "- Do not run destructive commands.",
    "- Do not commit, push, publish, or apply patches.",
    "- Inspect only what is necessary to identify safe source declaration candidates.",
    "- If uncertain, return status \"unresolved\" or \"unsafe\".",
    "- Your answer must be JSON only. No markdown, no prose outside JSON.",
    "- TBalance will revalidate everything. Do not claim final apply safety.",
    `- Return this exact requestId unchanged: ${request.requestId || ""}`,
    "",
    "You are reviewing a visual preview change.",
    "The source files have NOT been changed.",
    "BEFORE_VISUAL is the state before the user edit.",
    "AFTER_PREVIEW is the runtime-only preview state.",
    "SOURCE_DECLARATIONS are the unchanged original source values.",
    "Do not interpret an original source value as the requested after value merely because its computed position is numerically similar.",
    "Use the current viewport mode and active media-query state when selecting candidates.",
    "Inactive responsive rules are context only; do not treat them as equal current-view candidates.",
    "Return a source change only when one safe source declaration can be identified.",
    "",
    "Return shape:",
    JSON.stringify({
      schemaVersion: "1.0",
      requestId: request.requestId || "",
      pageId: reviewPackage.page?.pageId || request.pageId || "",
      sourcePath: reviewPackage.page?.sourcePath || "",
      viewState: reviewPackage.page?.viewState || "",
      sourceFingerprint: request.fingerprint || reviewPackage.page?.sourceFingerprint || "",
      requestRevision: request.revision || reviewPackage.page?.requestRevision || "",
      status: "safe-candidate|unresolved|unsafe",
      targets: [{
        domRef: "#target",
        changeId: "exact target.changeId from the review package",
        status: "safe-candidate|unresolved|unsafe",
        sourceChanges: [{
          sourcePath: "path/to/file.css",
          sourceType: "stylesheet-rule",
          selector: "#target",
          property: "left",
          before: "10px",
          after: "20px",
          media: "",
          reason: "why this declaration matches the visual intent",
        }],
        preserve: ["animation", "click behavior", "navigation"],
        reason: "",
        confidence: "high|medium|low",
      }],
    }, null, 2),
    "",
    "TBalance Review Package:",
    JSON.stringify(reviewPackage, null, 2),
  ].join("\n");
}
