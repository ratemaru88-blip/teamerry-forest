(function () {
  "use strict";

  const VERSION = "0.1";
  const VALID_TARGETS = new Set(["chatgpt", "codex", "other"]);

  function buildWithAiSharePackage(input = {}) {
    const validation = validateShareRequest(input);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        warnings: validation.warnings,
        package: null,
        summary: "",
        text: "",
      };
    }

    const instruction = cloneJsonValue(input.safeChangeInstruction);
    const target = instruction.target || {};
    const sharePackage = {
      withAiShareVersion: VERSION,
      targetAi: normalizeTargetAi(input.targetAi),
      presentationMode: getPresentationMode(input.targetAi),
      generatedAt: input.generatedAt || new Date().toISOString(),
      project: {
        projectId: target.projectId || input.projectId || "",
      },
      page: {
        pageId: target.pageId || "",
        sourcePath: target.sourcePath || "",
        viewState: target.viewState || "",
        sourceAuthority: target.sourceAuthority || "standard-web",
      },
      target: {
        tbId: target.tbId || "",
        domRef: target.domRef || "",
      },
      safeChangeInstruction: instruction,
      humanSummary: String(input.humanSummary || "").trim(),
      sharePolicy: {
        readOnlyInstruction: true,
        automaticApplyAllowed: false,
        sourceMutationAllowed: false,
        aiApiCallAllowed: false,
        automaticPatchAllowed: false,
      },
      shareScope: {
        includes: [
          "Safe Change Instruction",
          "Human Summary",
          "Target Context",
          "Allowed Properties",
          "Protected Properties",
          "Do Not Change",
          "Validation Checks",
        ],
        excludes: [
          "Analyzer Raw Result",
          "Full Source Code",
          "Screenshot",
          "Markup Layers",
          "Persistent Manifest Write",
          "Automatic Patch",
        ],
      },
    };
    const summary = buildShareSummary(sharePackage);
    return {
      ok: true,
      errors: [],
      warnings: validation.warnings,
      package: sharePackage,
      summary,
      text: buildShareText(sharePackage, summary),
    };
  }

  function validateShareRequest(input = {}) {
    const errors = [];
    const warnings = [];
    const instruction = input.safeChangeInstruction || null;
    const mapping = input.mapping || null;
    const requestedTargetAi = String(input.targetAi || "chatgpt").trim().toLowerCase();

    if (!VALID_TARGETS.has(requestedTargetAi)) {
      errors.push("AI Targetが不正です。");
    }
    if (!instruction || typeof instruction !== "object") {
      errors.push("Safe Change Instruction Required");
      return { ok: false, errors, warnings };
    }
    if (!instruction.safeChangeInstructionVersion) {
      errors.push("Safe Change Instruction Versionがありません。");
    }
    if (!instruction.compatibilitySpecVersion) {
      errors.push("Compatibility Spec Versionがありません。");
    }
    if (!instruction.target || typeof instruction.target !== "object") {
      errors.push("Safe Change Instruction targetがありません。");
    }
    if (!String(instruction.userIntent || "").trim()) {
      errors.push("userIntentが空です。");
    }
    if (!Array.isArray(instruction.changes) || !instruction.changes.length) {
      errors.push("changesがありません。");
    }
    if (!Array.isArray(instruction.allowedProperties)) {
      errors.push("allowedPropertiesがありません。");
    }
    if (!Array.isArray(instruction.protectedProperties)) {
      errors.push("protectedPropertiesがありません。");
    }
    if (!Array.isArray(instruction.doNotChange)) {
      errors.push("doNotChangeがありません。");
    }
    if (!Array.isArray(instruction.validationChecks)) {
      errors.push("validationChecksがありません。");
    }
    if (!mapping || typeof mapping !== "object") {
      errors.push("Target Confirmed Mappingが見つかりません。");
    }
    if (input.domResolved === false) {
      errors.push("Target DOMが現在のAnalyzer画面で解決できません。");
    }
    if (input.ambiguousMapping) {
      errors.push("Mappingが曖昧です。共有前にMappingを確定してください。");
    }
    if (instruction.target && mapping) {
      const target = instruction.target;
      const checks = [
        ["pageId", target.pageId || "", mapping.pageId || ""],
        ["tbId", target.tbId || "", mapping.tbId || ""],
        ["domRef", target.domRef || "", mapping.domRef || ""],
        ["viewState", target.viewState || "", mapping.viewState || ""],
      ];
      checks.forEach(([label, expected, actual]) => {
        if (expected !== actual) {
          errors.push(`Stale Instruction: ${label}が現在のConfirmed Mappingと一致しません。`);
        }
      });
    }
    if (input.sharePolicy?.automaticApplyAllowed === true
      || input.sharePolicy?.sourceMutationAllowed === true
      || input.sharePolicy?.aiApiCallAllowed === true
      || input.sharePolicy?.automaticPatchAllowed === true) {
      errors.push("WITH AI v0.1では自動適用・Source変更を許可できません。");
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  function buildShareSummary(sharePackage) {
    if (!sharePackage) {
      return "共有内容なし";
    }
    const instruction = sharePackage.safeChangeInstruction || {};
    const changes = Array.isArray(instruction.changes) ? instruction.changes : [];
    const protectedBehaviorCount = (sharePackage.safeChangeInstruction?.doNotChange || [])
      .filter((item) => item?.type === "behavior").length;
    const changeLabel = changes.map((change) => change.property).filter(Boolean).join(", ") || "-";
    return [
      `共有内容: Safe Change Instruction ${changes.length}件`,
      `AI: ${sharePackage.targetAi}`,
      `Target: ${sharePackage.target.tbId || "-"} (${sharePackage.target.domRef || "-"})`,
      `Change: ${changeLabel}`,
      `Protected Behavior: ${protectedBehaviorCount}件`,
      "Policy: automaticApplyAllowed=false / sourceMutationAllowed=false",
    ].join("\n");
  }

  function buildShareText(sharePackage, summary = "") {
    return [
      "TBalance WITH AI Share",
      "Safe Change Instruction v0.1",
      "",
      "Purpose:",
      "Review and understand the requested Safe Change Instruction.",
      "Do not apply, patch, commit, push, or publish automatically.",
      "Respect protected properties, protected behavior, doNotChange, and validationChecks.",
      "",
      "Summary:",
      summary || buildShareSummary(sharePackage),
      "",
      "Share Package JSON:",
      JSON.stringify(sharePackage, null, 2),
    ].join("\n");
  }

  function normalizeTargetAi(value) {
    const normalized = String(value || "chatgpt").trim().toLowerCase();
    return VALID_TARGETS.has(normalized) ? normalized : "chatgpt";
  }

  function getPresentationMode(targetAi) {
    const normalized = normalizeTargetAi(targetAi);
    if (normalized === "codex") {
      return "technical-review";
    }
    if (normalized === "other") {
      return "generic-review";
    }
    return "human-review";
  }

  function cloneJsonValue(value) {
    if (value === undefined) {
      return null;
    }
    return JSON.parse(JSON.stringify(value));
  }

  window.TBalanceWithAiShare = {
    version: VERSION,
    validateShareRequest,
    buildWithAiSharePackage,
    buildShareSummary,
    buildShareText,
  };
}());
