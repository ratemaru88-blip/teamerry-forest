(function () {
  "use strict";

  const SAFE_PATCH_VERSION = "0.1";
  const COMPATIBILITY_VERSION = "1.0";

  function buildPatchCandidate(input = {}) {
    const instruction = input.instruction || null;
    const mapping = input.mapping || null;
    const change = instruction?.changes?.[0] || null;
    const generatedAt = input.generatedAt || new Date().toISOString();
    const checks = validatePatchRequest(input, instruction, mapping, change);
    const sourceResolution = input.sourceResolution || { status: "unresolved", reason: "source-location-unresolved" };
    const block = checks.block || getSourceBlock(sourceResolution);
    const status = block ? (block.code === "before-mismatch" || block.code === "stale-instruction" ? "stale" : "blocked") : "ready-for-review";
    const candidate = {
      safePatchVersion: SAFE_PATCH_VERSION,
      compatibilitySpecVersion: COMPATIBILITY_VERSION,
      generatedAt,
      sourceInstruction: instruction ? {
        safeChangeInstructionVersion: instruction.safeChangeInstructionVersion || "",
        generatedAt: instruction.generatedAt || "",
      } : null,
      target: instruction?.target ? cloneJsonValue(instruction.target) : null,
      status,
      blockReason: block,
      userIntent: instruction?.userIntent || "",
      semanticDiff: change ? [{
        property: change.property,
        before: cloneJsonValue(change.before),
        after: cloneJsonValue(change.after),
        beforeSource: change.beforeSource || "observed",
        ...(change.coordinateContext ? { coordinateContext: change.coordinateContext } : {}),
      }] : [],
      sourceLocation: block ? null : cloneJsonValue(sourceResolution.sourceLocation || null),
      sourceChange: block ? [] : cloneJsonValue(sourceResolution.operations || []),
      operations: block ? [] : cloneJsonValue(sourceResolution.operations || []),
      allowedProperties: cloneJsonValue(instruction?.allowedProperties || []),
      protectedProperties: cloneJsonValue(instruction?.protectedProperties || []),
      protectedBehavior: cloneJsonValue(instruction?.protectedBehavior || null),
      doNotChange: cloneJsonValue(instruction?.doNotChange || []),
      validationChecks: buildValidationChecks(instruction, sourceResolution, checks),
      policy: {
        sourceWriteAllowed: false,
        automaticApplyAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
      },
      review: {
        status: "pending",
        approvedAt: null,
        rejectedAt: null,
      },
    };
    const diffText = buildDiffText(candidate);
    const signature = createCandidateSignature(candidate);
    candidate.signature = signature;
    return {
      ok: status === "ready-for-review",
      candidate,
      diffText,
      signature,
      errors: block ? [block.message || block.code] : [],
      warnings: checks.warnings,
    };
  }

  function validatePatchRequest(input, instruction, mapping, change) {
    const warnings = [];
    if (!instruction || typeof instruction !== "object") {
      return { block: blockReason("missing-instruction", "Safe Change Instructionがありません。"), warnings };
    }
    if (instruction.safeChangeInstructionVersion !== "0.1") {
      return { block: blockReason("unsupported-instruction-version", "対応していないSafe Change Instructionです。"), warnings };
    }
    if (instruction.compatibilitySpecVersion !== COMPATIBILITY_VERSION) {
      return { block: blockReason("compatibility-version-mismatch", "Compatibility Spec Versionが一致しません。"), warnings };
    }
    if (!mapping || typeof mapping !== "object") {
      return { block: blockReason("missing-mapping", "Confirmed Mappingが見つかりません。"), warnings };
    }
    const target = instruction.target || {};
    const identityPairs = [
      ["pageId", target.pageId, mapping.pageId],
      ["tbId", target.tbId, mapping.tbId],
      ["domRef", target.domRef, mapping.domRef],
      ["viewState", target.viewState || "", mapping.viewState || ""],
      ["sourcePath", target.sourcePath || "", mapping.page?.sourcePath || input.pageMeta?.sourcePath || ""],
    ];
    const mismatch = identityPairs.find(([, expected, actual]) => String(expected || "") !== String(actual || ""));
    if (mismatch) {
      return { block: blockReason("stale-instruction", `${mismatch[0]}が現在のConfirmed Mappingと一致しません。`), warnings };
    }
    if (input.domResolved === false) {
      return { block: blockReason("missing-dom", "対象DOMが現在のAnalyzer画面にありません。"), warnings };
    }
    if (input.ambiguousMapping) {
      return { block: blockReason("ambiguous-mapping", "Mappingが曖昧です。共通MappingとView専用Mappingを確定してください。"), warnings };
    }
    if (!String(instruction.userIntent || "").trim()) {
      return { block: blockReason("missing-user-intent", "User Intentがありません。"), warnings };
    }
    if (!Array.isArray(instruction.changes) || instruction.changes.length !== 1 || !change) {
      return { block: blockReason("invalid-change-count", "v0.1では1つのchangeだけをPatch Candidateにできます。"), warnings };
    }
    if (deepEqual(change.before, change.after)) {
      return { block: blockReason("no-op", "beforeとafterが同じためPatch Candidateを作れません。"), warnings };
    }
    const allowed = new Set(instruction.allowedProperties || []);
    const protectedProperties = new Set(instruction.protectedProperties || []);
    if (!allowed.has(change.property)) {
      return { block: blockReason("not-editable", `"${change.property}" はallowedPropertiesに含まれていません。`), warnings };
    }
    if (protectedProperties.has(change.property)) {
      return { block: blockReason("protected-property", `"${change.property}" はprotectedPropertiesに含まれています。`), warnings };
    }
    if (input.currentObserved?.ok && !deepEqual(input.currentObserved.value, change.before)) {
      return { block: blockReason("before-mismatch", "現在のDOM値がInstructionのbeforeと一致しません。"), warnings };
    }
    if (input.currentObserved?.ok === false) {
      warnings.push(`current-observed-unresolved: ${input.currentObserved.reason || "unknown"}`);
    }
    return { block: null, warnings };
  }

  function getSourceBlock(sourceResolution) {
    if (sourceResolution?.status === "resolved") {
      return null;
    }
    const code = sourceResolution?.reason || sourceResolution?.status || "source-location-unresolved";
    const messages = {
      "multiple-source-candidates": "変更元のCSS宣言候補が複数あります。",
      "source-location-unresolved": "変更元のCSS宣言を一意に特定できません。",
      "unsupported-property": "このPropertyはSafe Patch v0.1では未対応です。",
      "layout-dependency": "Layout依存があるためv0.1ではPatch化しません。",
    };
    return blockReason(code, sourceResolution?.message || messages[code] || code);
  }

  function buildValidationChecks(instruction, sourceResolution, checks) {
    const base = Array.isArray(instruction?.validationChecks) ? instruction.validationChecks : [];
    return [
      ...cloneJsonValue(base),
      {
        id: "safe-patch-source-resolved",
        required: true,
        status: sourceResolution?.status || "unresolved",
        description: "Patch Candidateは一意に解決できたCSS宣言だけをSource Changeにする。",
      },
      {
        id: "safe-patch-runtime-only",
        required: true,
        status: "passed",
        description: "v0.1ではExisting HTML/CSS/JS/Manifestへ書き込まない。",
      },
      {
        id: "safe-patch-before-current",
        required: true,
        status: checks.block?.code === "before-mismatch" ? "failed" : "checked",
        description: "Instruction beforeが現在DOMのObserved値と一致していること。",
      },
    ];
  }

  function buildDiffText(candidate) {
    if (!candidate) {
      return "";
    }
    if (candidate.status !== "ready-for-review") {
      return `Safe Patch Candidate blocked: ${candidate.blockReason?.code || "unknown"}\n${candidate.blockReason?.message || ""}`;
    }
    const lines = [
      `Safe Patch Candidate v${candidate.safePatchVersion}`,
      `Target: ${candidate.target.pageId} / ${candidate.target.sourcePath}${candidate.target.viewState ? ` / ${candidate.target.viewState}` : ""} / ${candidate.target.tbId}`,
      `DOM: ${candidate.target.domRef}`,
      `Intent: ${candidate.userIntent}`,
      "Source Change:",
    ];
    candidate.operations.forEach((operation) => {
      const sourceRef = operation.sourceRef || operation.source || {};
      lines.push(`- ${operation.type}: ${sourceRef.sourcePath || sourceRef.path || "-"} :: ${sourceRef.selector || "-"} { ${operation.property}: ${JSON.stringify(operation.before)} -> ${JSON.stringify(operation.after)} }`);
    });
    return lines.join("\n");
  }

  function createCandidateSignature(candidate) {
    const stable = {
      version: candidate.safePatchVersion,
      target: candidate.target,
      semanticDiff: candidate.semanticDiff,
      operations: candidate.operations,
      blockReason: candidate.blockReason,
      doNotChange: candidate.doNotChange,
    };
    return hashString(JSON.stringify(stableValue(stable)));
  }

  function blockReason(code, message) {
    return { code, message };
  }

  function cloneJsonValue(value) {
    if (value === undefined) {
      return null;
    }
    return JSON.parse(JSON.stringify(value));
  }

  function deepEqual(a, b) {
    return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
  }

  function stableValue(value) {
    if (Array.isArray(value)) {
      return value.map(stableValue);
    }
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = stableValue(value[key]);
        return result;
      }, {});
    }
    return value;
  }

  function hashString(value) {
    let hash = 0;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return `spc_${Math.abs(hash).toString(36)}`;
  }

  window.TBalanceSafePatch = {
    buildPatchCandidate,
    buildDiffText,
    createCandidateSignature,
  };
})();
