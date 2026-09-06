(function () {
  "use strict";

  const SUPPORTED_TRIGGERS = ["click", "clock"];
  const SUPPORTED_CONDITIONS = ["sceneIs", "timeAtOrAfter"];
  const SUPPORTED_ACTIONS = ["setScene", "showRandomDialogue"];

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function normalizePage(page = {}) {
    page.behaviors = Array.isArray(page.behaviors) ? page.behaviors.map(normalizeBehavior).filter(Boolean) : [];
    page.dataSourceRefs = Array.isArray(page.dataSourceRefs) ? Array.from(new Set(page.dataSourceRefs.filter(Boolean).map(String))) : [];
    return page;
  }

  function normalizeBehavior(input = {}) {
    const behaviorId = input.behaviorId || input.id || window.TBalanceNativeId?.createStableId?.("behavior") || `bhv_${Date.now().toString(36)}`;
    const trigger = normalizeTrigger(input.trigger);
    if (!trigger) {
      return null;
    }
    return {
      behaviorId,
      id: behaviorId,
      displayName: input.displayName || input.name || getDefaultBehaviorName(trigger),
      enabled: input.enabled !== false,
      trigger,
      conditions: Array.isArray(input.conditions) ? input.conditions.map(normalizeCondition).filter(Boolean) : [],
      actions: Array.isArray(input.actions) ? input.actions.map(normalizeAction).filter(Boolean) : [],
      metadata: Object.assign({}, input.metadata || {}),
    };
  }

  function normalizeTrigger(trigger = {}) {
    const type = SUPPORTED_TRIGGERS.includes(trigger.type) ? trigger.type : "";
    if (!type) {
      return null;
    }
    if (type === "click") {
      return { type, targetRef: String(trigger.targetRef || trigger.layerId || "") };
    }
    return {
      type,
      evaluateOnLoad: trigger.evaluateOnLoad !== false,
      intervalSeconds: Math.max(15, Number(trigger.intervalSeconds) || 60),
    };
  }

  function normalizeCondition(condition = {}) {
    if (!SUPPORTED_CONDITIONS.includes(condition.type)) {
      return null;
    }
    if (condition.type === "sceneIs") {
      return { type: "sceneIs", sceneId: String(condition.sceneId || "") };
    }
    return {
      type: "timeAtOrAfter",
      time: normalizeTime(condition.time || "16:00"),
      timeZone: condition.timeZone || "browser-local",
    };
  }

  function normalizeAction(action = {}) {
    if (!SUPPORTED_ACTIONS.includes(action.type)) {
      return null;
    }
    if (action.type === "setScene") {
      return { type: "setScene", sceneId: String(action.sceneId || "") };
    }
    return {
      type: "showRandomDialogue",
      dataSourceRef: String(action.dataSourceRef || action.dataSourceId || ""),
      targetRef: String(action.targetRef || action.layerId || ""),
      textField: action.textField || "text",
      excludePrevious: action.excludePrevious !== false,
    };
  }

  function normalizeTime(value) {
    const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return "00:00";
    }
    const hour = Math.min(23, Math.max(0, Number(match[1]) || 0));
    const minute = Math.min(59, Math.max(0, Number(match[2]) || 0));
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function getDefaultBehaviorName(trigger) {
    return trigger.type === "clock" ? "時刻でシーン切替" : "クリック動作";
  }

  function createRuntime(options = {}) {
    const runtime = {
      page: options.page || null,
      project: options.project || null,
      sceneId: options.initialSceneId || "",
      timers: [],
      previousItems: new Map(),
      runtimeText: new Map(),
      diagnostics: [],
      rng: typeof options.rng === "function" ? options.rng : Math.random,
      nowProvider: typeof options.nowProvider === "function" ? options.nowProvider : () => new Date(),
      fetchDataSource: options.fetchDataSource,
      onSceneChange: options.onSceneChange,
      onRuntimeTextChange: options.onRuntimeTextChange,
      onDiagnostic: options.onDiagnostic,
    };
    runtime.initialSceneId = runtime.sceneId;
    runtime.evaluateClock = () => evaluateClock(runtime);
    runtime.handleClick = (layerId) => handleClick(runtime, layerId);
    runtime.getRuntimeText = (layerId) => runtime.runtimeText.get(layerId) || null;
    runtime.setClockTime = (time) => {
      runtime.nowProvider = () => createDateForTime(time);
      runtime.sceneId = runtime.initialSceneId || runtime.sceneId;
      runtime.onSceneChange?.(runtime.sceneId, null);
      return evaluateClock(runtime);
    };
    runtime.cleanup = () => cleanupRuntime(runtime);
    activate(runtime);
    return runtime;
  }

  function activate(runtime) {
    const clockBehaviors = getEnabledBehaviors(runtime.page).filter((behavior) => behavior.trigger.type === "clock");
    clockBehaviors.forEach((behavior) => {
      if (behavior.trigger.evaluateOnLoad !== false) {
        executeBehavior(runtime, behavior);
      }
      const interval = Math.max(15, Number(behavior.trigger.intervalSeconds) || 60) * 1000;
      if (typeof window.setInterval === "function") {
        runtime.timers.push(window.setInterval(() => executeBehavior(runtime, behavior), interval));
      }
    });
  }

  function cleanupRuntime(runtime) {
    runtime.timers.forEach((timer) => window.clearInterval(timer));
    runtime.timers = [];
    runtime.previousItems.clear();
    runtime.runtimeText.clear();
    runtime.diagnostics = [];
  }

  function getEnabledBehaviors(page) {
    normalizePage(page || {});
    return (page?.behaviors || []).filter((behavior) => behavior.enabled !== false);
  }

  function evaluateClock(runtime) {
    let handled = false;
    getEnabledBehaviors(runtime.page)
      .filter((behavior) => behavior.trigger.type === "clock")
      .forEach((behavior) => {
        handled = executeBehavior(runtime, behavior) || handled;
      });
    return handled;
  }

  function handleClick(runtime, layerId) {
    let handled = false;
    getEnabledBehaviors(runtime.page)
      .filter((behavior) => behavior.trigger.type === "click" && behavior.trigger.targetRef === layerId)
      .forEach((behavior) => {
        handled = executeBehavior(runtime, behavior) || handled;
      });
    return handled;
  }

  function executeBehavior(runtime, behavior) {
    if (!areConditionsMet(runtime, behavior.conditions || [])) {
      return false;
    }
    let ran = false;
    for (const action of behavior.actions || []) {
      ran = executeAction(runtime, behavior, action) || ran;
    }
    return ran;
  }

  function areConditionsMet(runtime, conditions) {
    return (conditions || []).every((condition) => evaluateCondition(runtime, condition));
  }

  function evaluateCondition(runtime, condition) {
    if (condition.type === "sceneIs") {
      return runtime.sceneId === condition.sceneId;
    }
    if (condition.type === "timeAtOrAfter") {
      return isTimeAtOrAfter(runtime.nowProvider(), condition.time);
    }
    return false;
  }

  function isTimeAtOrAfter(date, time) {
    const [hour, minute] = normalizeTime(time).split(":").map(Number);
    const current = date.getHours() * 60 + date.getMinutes();
    return current >= hour * 60 + minute;
  }

  function executeAction(runtime, behavior, action) {
    if (action.type === "setScene") {
      if (!action.sceneId || !runtime.page?.scenes?.some((scene) => scene.sceneId === action.sceneId)) {
        addDiagnostic(runtime, behavior, "missing-scene", "切替先シーンが見つかりません。");
        return false;
      }
      runtime.sceneId = action.sceneId;
      runtime.onSceneChange?.(action.sceneId, behavior);
      return true;
    }
    if (action.type === "showRandomDialogue") {
      return showRandomDialogue(runtime, behavior, action);
    }
    return false;
  }

  function showRandomDialogue(runtime, behavior, action) {
    const target = (runtime.page?.layers || []).find((layer) => layer.id === action.targetRef || layer.layerId === action.targetRef);
    if (!target) {
      addDiagnostic(runtime, behavior, "missing-target", "台詞の表示先が見つかりません。");
      return false;
    }
    const result = runtime.fetchDataSource?.(action.dataSourceRef) || { status: "missing", items: [] };
    if (result.status !== "ok") {
      addDiagnostic(runtime, behavior, result.code || result.status || "data-source-error", "台詞データを読み込めません。");
      return false;
    }
    const item = pickRandomItem(runtime, behavior, action, result.items || []);
    if (!item) {
      addDiagnostic(runtime, behavior, "empty-data-source", "表示できる台詞がありません。");
      return false;
    }
    runtime.runtimeText.set(target.id, String(item[action.textField || "text"] || item.text || ""));
    runtime.previousItems.set(`${behavior.behaviorId}:${action.dataSourceRef}`, item.id);
    runtime.onRuntimeTextChange?.(target.id, runtime.runtimeText.get(target.id), behavior);
    return true;
  }

  function pickRandomItem(runtime, behavior, action, items) {
    if (!items.length) {
      return null;
    }
    const key = `${behavior.behaviorId}:${action.dataSourceRef}`;
    const previous = runtime.previousItems.get(key);
    const candidates = action.excludePrevious && items.length > 1
      ? items.filter((item) => item.id !== previous)
      : items;
    const index = Math.floor(runtime.rng() * candidates.length) % candidates.length;
    return candidates[index];
  }

  function addDiagnostic(runtime, behavior, code, message) {
    const diagnostic = { behaviorId: behavior.behaviorId, code, message };
    runtime.diagnostics.push(diagnostic);
    runtime.onDiagnostic?.(diagnostic);
  }

  function createDateForTime(time) {
    const date = new Date();
    const [hour, minute] = normalizeTime(time).split(":").map(Number);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  function summarizeBehavior(behavior, context = {}) {
    if (behavior.trigger?.type === "clock") {
      const time = behavior.conditions?.find((condition) => condition.type === "timeAtOrAfter")?.time || "";
      const sceneId = behavior.actions?.find((action) => action.type === "setScene")?.sceneId || "";
      const scene = context.page?.scenes?.find((item) => item.sceneId === sceneId);
      return `${time || "時刻"} → ${scene?.displayName || "シーン"}`;
    }
    if (behavior.actions?.some((action) => action.type === "showRandomDialogue")) {
      const condition = behavior.conditions?.find((item) => item.type === "sceneIs");
      const scene = context.page?.scenes?.find((item) => item.sceneId === condition?.sceneId);
      return `クリックすると台詞${scene ? `（${scene.displayName}のみ）` : ""}`;
    }
    return behavior.displayName || "動作あり";
  }

  window.TBalanceNativeBehaviors = {
    normalizePage,
    normalizeBehavior,
    createRuntime,
    summarizeBehavior,
    clone,
  };
})();
