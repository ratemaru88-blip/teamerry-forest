(function () {
  "use strict";

  const VERSION = "0.1";
  const COMPATIBILITY_VERSION = "1.0";
  const BEFORE_SOURCES = new Set(["observed", "user-confirmed", "runtime-confirmed"]);

  function buildSafeChangeInstruction(input = {}) {
    const validation = validateSafeChangeRequest(input);
    if (!validation.ok) {
      return {
        ok: false,
        errors: validation.errors,
        warnings: validation.warnings,
        instruction: null,
        summary: "",
      };
    }

    const mapping = input.mapping;
    const target = {
      projectId: input.projectId,
      pageId: mapping.pageId,
      sourcePath: input.sourcePath || mapping.page?.sourcePath || "",
      viewState: mapping.viewState || input.viewState || "",
      sourceAuthority: mapping.sourceAuthority || input.sourceAuthority || "standard-web",
      tbId: mapping.tbId,
      domRef: mapping.domRef,
    };

    const protectedBehavior = normalizeProtectedBehavior(input.protectedBehavior);
    const protectedProperties = uniqueStrings(mapping.protectedProperties);
    const instruction = {
      safeChangeInstructionVersion: VERSION,
      compatibilitySpecVersion: COMPATIBILITY_VERSION,
      generatedAt: input.generatedAt || new Date().toISOString(),
      target,
      userIntent: String(input.userIntent || "").trim(),
      changes: validation.changes,
      allowedProperties: uniqueStrings(mapping.editableProperties).filter((property) => !protectedProperties.includes(property)),
      protectedProperties,
      protectedBehavior,
      doNotChange: buildDoNotChange(protectedProperties, protectedBehavior),
      validationChecks: buildValidationChecks(Boolean(protectedBehavior)),
    };

    return {
      ok: true,
      errors: [],
      warnings: validation.warnings,
      instruction,
      summary: buildHumanSummary(instruction),
    };
  }

  function validateSafeChangeRequest(input = {}) {
    const errors = [];
    const warnings = [];
    const mapping = input.mapping || null;

    if (!mapping || typeof mapping !== "object") {
      errors.push("Confirmed Mappingがありません。");
      return { ok: false, errors, warnings, changes: [] };
    }
    if (input.ambiguousMapping) {
      errors.push("Mappingが曖昧です。共通MappingとView専用Mappingのどちらを使うか確定してください。");
    }
    if (input.domResolved === false) {
      errors.push("対象DOMを現在のAnalyzer画面で解決できません。");
    }
    if (!input.projectId) {
      errors.push("projectIdがありません。");
    }
    if (!mapping.pageId) {
      errors.push("pageIdがありません。");
    }
    if (!mapping.tbId) {
      errors.push("tbIdがありません。");
    }
    if (!mapping.domRef) {
      errors.push("domRefがありません。");
    }
    if (!String(input.userIntent || "").trim()) {
      errors.push("userIntentが空です。変更意図を入力してください。");
    }

    const editable = uniqueStrings(mapping.editableProperties);
    const protectedProperties = uniqueStrings(mapping.protectedProperties);
    const rawChanges = Array.isArray(input.changes) ? input.changes : [];
    if (!rawChanges.length) {
      errors.push("changesがありません。");
    }
    if (rawChanges.length > 1) {
      errors.push("v0.1では1つのConfirmed Componentに対する1変更だけを扱います。");
    }

    const changes = [];
    rawChanges.slice(0, 1).forEach((change, index) => {
      const property = String(change?.property || "").trim();
      if (!property) {
        errors.push(`changes[${index}].propertyがありません。`);
        return;
      }
      if (!editable.includes(property)) {
        errors.push(`"${property}" はeditablePropertiesに含まれていません。`);
      }
      if (protectedProperties.includes(property)) {
        errors.push(`"${property}" はprotectedPropertiesに含まれています。protectedが優先です。`);
      }
      if (!Object.prototype.hasOwnProperty.call(change, "before")) {
        errors.push(`changes[${index}].beforeがありません。`);
      }
      if (!Object.prototype.hasOwnProperty.call(change, "after")) {
        errors.push(`changes[${index}].afterがありません。`);
      }
      const beforeSource = change?.beforeSource || "observed";
      if (!BEFORE_SOURCES.has(beforeSource)) {
        errors.push(`changes[${index}].beforeSourceが不正です。`);
      }
      if (Object.prototype.hasOwnProperty.call(change, "before")
        && Object.prototype.hasOwnProperty.call(change, "after")
        && deepEqual(change.before, change.after)) {
        warnings.push(`"${property}" はbeforeとafterが同じためno-opです。`);
        return;
      }
      changes.push({
        property,
        before: cloneJsonValue(change.before),
        after: cloneJsonValue(change.after),
        beforeSource,
        ...(change.coordinateContext ? { coordinateContext: change.coordinateContext } : {}),
      });
    });

    if (rawChanges.length && !changes.length && !errors.length) {
      errors.push("有効な変更がありません。beforeとafterが同じです。");
    }

    return {
      ok: !errors.length,
      errors,
      warnings,
      changes,
    };
  }

  function buildDoNotChange(protectedProperties, protectedBehavior) {
    const items = protectedProperties.map((property) => ({
      type: "property",
      name: property,
    }));
    if (protectedBehavior) {
      items.push({
        type: "behavior",
        behaviorRef: protectedBehavior.behaviorRef || null,
        description: protectedBehavior.description || "Adapter-confirmed protected behavior",
      });
    }
    return items;
  }

  function buildValidationChecks(hasProtectedBehavior) {
    const checks = [
      {
        id: "target-resolves",
        required: true,
        description: "Target pageId, sourcePath, viewState, tbId, and domRef resolve to the intended component.",
      },
      {
        id: "requested-change-matches",
        required: true,
        description: "Only the requested after value is applied to the requested property.",
      },
      {
        id: "protected-properties-unchanged",
        required: true,
        description: "All protectedProperties remain unchanged.",
      },
    ];
    if (hasProtectedBehavior) {
      checks.push({
        id: "protected-behavior-preserved",
        required: true,
        description: "Adapter-reported protected behavior remains preserved.",
      });
    }
    return checks;
  }

  function buildHumanSummary(instruction) {
    if (!instruction) {
      return "";
    }
    const target = instruction.target;
    const changeLines = instruction.changes.map((change) => {
      const before = JSON.stringify(change.before);
      const after = JSON.stringify(change.after);
      return `- ${change.property}: ${before} -> ${after} (${change.beforeSource})`;
    });
    const doNotChangeLines = instruction.doNotChange.length
      ? instruction.doNotChange.map((item) => `- ${item.type}: ${item.name || item.behaviorRef || item.description || "protected"}`)
      : ["- なし"];
    return [
      `Safe Change Instruction v${instruction.safeChangeInstructionVersion}`,
      `Target: ${target.pageId} / ${target.sourcePath}${target.viewState ? ` / ${target.viewState}` : ""} / ${target.tbId} (${target.domRef})`,
      `Intent: ${instruction.userIntent}`,
      "Changes:",
      ...changeLines,
      "Do Not Change:",
      ...doNotChangeLines,
      "Validation:",
      ...instruction.validationChecks.map((check) => `- ${check.id}`),
    ].join("\n");
  }

  function normalizeProtectedBehavior(value) {
    if (!value) {
      return null;
    }
    if (value.status === "unresolved" || value.status === "none") {
      return null;
    }
    return cloneJsonValue(value);
  }

  function uniqueStrings(values) {
    return Array.from(new Set((Array.isArray(values) ? values : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)));
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

  window.TBalanceSafeChange = {
    buildSafeChangeInstruction,
    validateSafeChangeRequest,
    buildHumanSummary,
  };
})();
