(function () {
  "use strict";

  const SUPPORTED_TRIGGERS = ["click", "clock", "pageOpen", "event"];
  const SUPPORTED_CONDITIONS = ["sceneIs", "timeAtOrAfter"];
  const SUPPORTED_ACTIONS = ["setScene", "showRandomDialogue", "showDialogueSequence", "openFlow", "playSound"];

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
    if (type === "pageOpen") {
      return { type, fireOnce: trigger.fireOnce !== false };
    }
    if (type === "event") {
      return { type, eventName: String(trigger.eventName || trigger.name || "") };
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
    if (action.type === "openFlow") {
      return {
        type: "openFlow",
        flowId: String(action.flowId || action.target || ""),
        targetRef: String(action.targetRef || action.layerId || ""),
      };
    }
    if (action.type === "playSound") {
      return {
        type: "playSound",
        soundRef: String(action.soundRef || action.assetRef || action.assetId || ""),
        targetRef: String(action.targetRef || action.layerId || ""),
        soundMode: String(action.soundMode || action.mode || "click"),
        sound: normalizeSoundActionPayload(action.sound || action.audio || {}),
      };
    }
    if (action.type === "showDialogueSequence") {
      return {
        type: "showDialogueSequence",
        dataSourceRef: String(action.dataSourceRef || action.dataSourceId || ""),
        targetRef: String(action.targetRef || action.layerId || ""),
        advanceRefs: Array.isArray(action.advanceRefs) ? action.advanceRefs.filter(Boolean).map(String) : [],
        textField: action.textField || "text",
        linesField: action.linesField || "lines",
        setIdField: action.setIdField || "setId",
        excludePrevious: action.excludePrevious !== false,
        filter: clone(action.filter || {}),
      };
    }
    return {
      type: "showRandomDialogue",
      dataSourceRef: String(action.dataSourceRef || action.dataSourceId || ""),
      targetRef: String(action.targetRef || action.layerId || ""),
      textField: action.textField || "text",
      fallbackText: String(action.fallbackText || ""),
      excludePrevious: action.excludePrevious !== false,
      filter: clone(action.filter || {}),
    };
  }

  function normalizeSoundActionPayload(sound = {}) {
    return {
      enabled: sound.enabled !== false,
      assetRef: String(sound.assetRef || sound.assetId || ""),
      assetId: String(sound.assetId || sound.assetRef || ""),
      fileName: String(sound.fileName || sound.name || ""),
      src: String(sound.src || sound.url || ""),
      volume: clamp(Number(sound.volume ?? 80), 0, 100),
      loop: Boolean(sound.loop),
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

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return min;
    }
    return Math.max(min, Math.min(max, number));
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
      firedPageOpen: new Set(),
      previousItems: new Map(),
      activeSequences: new Map(),
      runtimeText: new Map(),
      diagnostics: [],
      rng: typeof options.rng === "function" ? options.rng : Math.random,
      nowProvider: typeof options.nowProvider === "function" ? options.nowProvider : () => new Date(),
      fetchDataSource: options.fetchDataSource,
      onSceneChange: options.onSceneChange,
      onRuntimeTextChange: options.onRuntimeTextChange,
      onOpenFlow: options.onOpenFlow,
      onPlaySound: options.onPlaySound,
      onDiagnostic: options.onDiagnostic,
    };
    runtime.initialSceneId = runtime.sceneId;
    runtime.evaluateClock = () => evaluateClock(runtime);
    runtime.handleClick = (layerId) => handleClick(runtime, layerId);
    runtime.firePageOpen = () => firePageOpen(runtime);
    runtime.dispatchEvent = (eventName, payload = {}) => dispatchEvent(runtime, eventName, payload);
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
    runtime.activeSequences.clear();
    runtime.firedPageOpen.clear();
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
    handled = advanceActiveSequence(runtime, layerId) || handled;
    getEnabledBehaviors(runtime.page)
      .filter((behavior) => behavior.trigger.type === "click" && behavior.trigger.targetRef === layerId)
      .forEach((behavior) => {
        handled = executeBehavior(runtime, behavior) || handled;
      });
    return handled;
  }

  function firePageOpen(runtime) {
    let handled = false;
    getEnabledBehaviors(runtime.page)
      .filter((behavior) => behavior.trigger.type === "pageOpen")
      .forEach((behavior) => {
        if (behavior.trigger.fireOnce !== false && runtime.firedPageOpen.has(behavior.behaviorId)) {
          return;
        }
        runtime.firedPageOpen.add(behavior.behaviorId);
        handled = executeBehavior(runtime, behavior) || handled;
      });
    return handled;
  }

  function dispatchEvent(runtime, eventName, payload = {}) {
    const name = String(eventName || payload.eventName || "");
    let handled = false;
    getEnabledBehaviors(runtime.page)
      .filter((behavior) => behavior.trigger.type === "event" && behavior.trigger.eventName === name)
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
    if (action.type === "showDialogueSequence") {
      return showDialogueSequence(runtime, behavior, action);
    }
    if (action.type === "openFlow") {
      const handled = runtime.onOpenFlow?.(action.flowId, behavior, action);
      if (handled) {
        return true;
      }
      addDiagnostic(runtime, behavior, "open-flow-not-connected", "投稿FlowはまだNative TESTへ接続されていません。");
      return false;
    }
    if (action.type === "playSound") {
      const handled = runtime.onPlaySound?.(action, behavior);
      if (handled) {
        return true;
      }
      addDiagnostic(runtime, behavior, "sound-not-found", "再生するサウンドが見つかりません。");
      return false;
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
      return applyFallbackDialogue(runtime, behavior, action, target);
    }
    const item = pickRandomItem(runtime, behavior, action, filterItems(result.items || [], action.filter));
    if (!item) {
      addDiagnostic(runtime, behavior, "empty-data-source", "表示できる台詞がありません。");
      return applyFallbackDialogue(runtime, behavior, action, target);
    }
    runtime.runtimeText.set(target.id, String(item[action.textField || "text"] || item.text || ""));
    runtime.previousItems.set(`${behavior.behaviorId}:${action.dataSourceRef}`, item.id);
    runtime.onRuntimeTextChange?.(target.id, runtime.runtimeText.get(target.id), behavior);
    return true;
  }

  function applyFallbackDialogue(runtime, behavior, action, target) {
    const text = String(action.fallbackText || "").trim();
    if (!text) {
      return false;
    }
    runtime.runtimeText.set(target.id, text);
    runtime.onRuntimeTextChange?.(target.id, text, behavior);
    return true;
  }

  function showDialogueSequence(runtime, behavior, action) {
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
    const set = pickRandomSet(runtime, behavior, action, filterItems(result.items || [], action.filter));
    if (!set?.lines?.length) {
      addDiagnostic(runtime, behavior, "empty-data-source", "表示できる台詞がありません。");
      return false;
    }
    const explicitAdvanceRefs = Array.isArray(action.advanceRefs)
      ? action.advanceRefs.filter(Boolean).map(String)
      : [];
    const sequence = {
      behaviorId: behavior.behaviorId,
      dataSourceRef: action.dataSourceRef,
      setId: set.setId,
      targetRef: target.id,
      advanceRefs: Array.from(new Set((explicitAdvanceRefs.length ? explicitAdvanceRefs : [target.id]).filter(Boolean))),
      lines: set.lines,
      index: 0,
    };
    runtime.activeSequences.set(target.id, sequence);
    runtime.previousItems.set(`${behavior.behaviorId}:${action.dataSourceRef}`, set.setId);
    runtime.runtimeText.set(target.id, String(sequence.lines[0] || ""));
    runtime.onRuntimeTextChange?.(target.id, runtime.runtimeText.get(target.id), behavior);
    return true;
  }

  function advanceActiveSequence(runtime, layerId) {
    const id = String(layerId || "");
    const sequence = Array.from(runtime.activeSequences.values()).find((item) => item.advanceRefs.includes(id));
    if (!sequence) {
      return false;
    }
    sequence.index += 1;
    if (sequence.index >= sequence.lines.length) {
      runtime.activeSequences.delete(sequence.targetRef);
      return true;
    }
    runtime.runtimeText.set(sequence.targetRef, String(sequence.lines[sequence.index] || ""));
    runtime.onRuntimeTextChange?.(sequence.targetRef, runtime.runtimeText.get(sequence.targetRef), { behaviorId: sequence.behaviorId });
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

  function pickRandomSet(runtime, behavior, action, items) {
    const sets = items
      .map((item, index) => {
        const lines = Array.isArray(item[action.linesField || "lines"])
          ? item[action.linesField || "lines"].map((line) => String(line || "")).filter(Boolean)
          : [String(item[action.textField || "text"] || item.text || "")].filter(Boolean);
        return {
          setId: String(item[action.setIdField || "setId"] || item.id || `set-${index + 1}`),
          lines,
        };
      })
      .filter((item) => item.lines.length);
    if (!sets.length) {
      return null;
    }
    const key = `${behavior.behaviorId}:${action.dataSourceRef}`;
    const previous = runtime.previousItems.get(key);
    const candidates = action.excludePrevious && sets.length > 1
      ? sets.filter((item) => item.setId !== previous)
      : sets;
    const index = Math.floor(runtime.rng() * candidates.length) % candidates.length;
    return candidates[index];
  }

  function filterItems(items, filter = {}) {
    const enabledItems = (items || []).filter((item) => item?.enabled !== false);
    const entries = Object.entries(filter || {}).filter(([, value]) => value != null && String(value).trim());
    if (!entries.length) {
      return enabledItems;
    }
    return enabledItems.filter((item) => entries.every(([key, expected]) => {
      const actual = item?.[key];
      if (Array.isArray(actual)) {
        return Array.isArray(expected)
          ? expected.every((value) => actual.map(String).includes(String(value)))
          : actual.map(String).includes(String(expected));
      }
      return Array.isArray(expected)
        ? expected.map(String).includes(String(actual))
        : String(actual) === String(expected);
    }));
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
    if (behavior.trigger?.type === "pageOpen") {
      return "ページを開いた時";
    }
    if (behavior.trigger?.type === "event") {
      return `${behavior.trigger.eventName || "イベント"} 後`;
    }
    if (behavior.actions?.some((action) => action.type === "showDialogueSequence")) {
      return "3行台詞";
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
