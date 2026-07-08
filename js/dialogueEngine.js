(() => {
  "use strict";

  const DEFAULT_JSON_PATHS = [
    "./data/export/dialogue.json",
  ];

  let TeaMerryDialogueData = [];
  let TeaMerryDialogueLoadedFrom = "";

  const normalizeText = (value) => String(value ?? "").trim();

  const normalizeType = (type) => {
    const value = normalizeText(type).toLowerCase();

    if (value === "forest_whisper") {
      return "whisper";
    }

    return value;
  };

  const getDialogueText = (dialogue) => normalizeText(dialogue && (dialogue.text ?? dialogue["セリフ本文"]));

  const getDialoguePriority = (dialogue) => {
    const priority = Number(dialogue && (dialogue.priority ?? dialogue["優先度"]));
    return Number.isFinite(priority) ? priority : 50;
  };

  const getDialogueConditions = (dialogue) => {
    const rawConditions = dialogue && (dialogue.conditions ?? dialogue["条件"]);

    if (!rawConditions) {
      return [];
    }

    if (Array.isArray(rawConditions)) {
      return rawConditions.map(normalizeText).filter(Boolean);
    }

    if (typeof rawConditions === "string") {
      return rawConditions.split(",").map(normalizeText).filter(Boolean);
    }

    if (typeof rawConditions === "object") {
      return rawConditions;
    }

    return [];
  };

  const getContextValues = (context) => {
    const values = new Set();

    Object.values(context || {}).forEach((value) => {
      if (Array.isArray(value)) {
        value.map(normalizeText).filter(Boolean).forEach((item) => values.add(item));
        return;
      }

      const text = normalizeText(value);
      if (text) {
        values.add(text);
      }
    });

    return values;
  };

  const normalizeDialogue = (dialogue = {}) => ({
    ...dialogue,
    id: normalizeText(dialogue.id ?? dialogue["セリフID"]),
    type: normalizeType(dialogue.type ?? dialogue["表示種別"]),
    character: normalizeText(dialogue.character ?? dialogue["キャラクター"]),
    place: normalizeText(dialogue.place ?? dialogue["場所"]),
    section: normalizeText(dialogue.section ?? dialogue["章"]),
    conditions: getDialogueConditions(dialogue),
    tone: normalizeText(dialogue.tone ?? dialogue["トーン"]),
    priority: getDialoguePriority(dialogue),
    text: getDialogueText(dialogue),
    enabled: dialogue.enabled ?? dialogue["有効"] ?? true,
    note: normalizeText(dialogue.note ?? dialogue["備考"]),
  });

  const isEnabled = (dialogue) => {
    const enabled = dialogue && dialogue.enabled;

    if (typeof enabled === "boolean") {
      return enabled;
    }

    if (typeof enabled === "string") {
      return enabled.trim().toUpperCase() === "ON";
    }

    return enabled !== false;
  };

  const getDialoguesFromJson = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.dialogues)) {
      return data.dialogues;
    }

    return [];
  };

  async function fetchDialogueJson(jsonPath) {
    const response = await fetch(jsonPath);

    if (!response.ok) {
      throw new Error(`Dialogue JSON load failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * dialogue.json を読み込む。
   */
  async function loadDialogue(jsonPath = DEFAULT_JSON_PATHS) {
    const paths = Array.isArray(jsonPath) ? jsonPath : [jsonPath];
    const errors = [];

    for (const path of paths) {
      try {
        const data = await fetchDialogueJson(path);
        TeaMerryDialogueData = getDialoguesFromJson(data).map(normalizeDialogue);
        TeaMerryDialogueLoadedFrom = path;
        return TeaMerryDialogueData;
      } catch (error) {
        errors.push({ path, error });
      }
    }

    console.warn("[TeaMerry DialogueEngine] loadDialogue failed:", errors);
    TeaMerryDialogueData = [];
    TeaMerryDialogueLoadedFrom = "";
    return [];
  }

  /**
   * dialogue.conditions と context を照合する。
   */
  function checkConditions(dialogue, context = {}) {
    const normalized = normalizeDialogue(dialogue);
    const type = normalizeType(context.type);
    const character = normalizeText(context.character);
    const place = normalizeText(context.place);
    const section = normalizeText(context.section);
    const contextValues = getContextValues(context);

    if (type && normalized.type && normalized.type !== type) {
      return false;
    }

    if (character && normalized.character && normalized.character !== character) {
      return false;
    }

    if (place && normalized.place && normalized.place !== place) {
      return false;
    }

    if (section && normalized.section && normalized.section !== section) {
      return false;
    }

    if (Array.isArray(normalized.conditions)) {
      return normalized.conditions.every((condition) => contextValues.has(condition));
    }

    return Object.entries(normalized.conditions || {}).every(([key, required]) => {
      const current = context[key];

      if (required === undefined || required === null || required === "") {
        return true;
      }

      if (Array.isArray(required)) {
        return required.map(normalizeText).includes(normalizeText(current));
      }

      return normalizeText(required) === normalizeText(current);
    });
  }

  /**
   * 条件に合うセリフ候補を取得する。
   */
  function getCandidates(context = {}) {
    return TeaMerryDialogueData.filter((dialogue) => {
      if (!dialogue || !isEnabled(dialogue) || !getDialogueText(dialogue)) {
        return false;
      }

      return checkConditions(dialogue, context);
    });
  }

  /**
   * 優先度を考慮して1件選択する。
   */
  function selectDialogue(candidates = []) {
    if (!candidates.length) {
      return null;
    }

    const highestPriority = candidates.reduce((highest, dialogue) => {
      return Math.max(highest, getDialoguePriority(dialogue));
    }, -Infinity);

    const topCandidates = candidates.filter((dialogue) => getDialoguePriority(dialogue) === highestPriority);
    const index = Math.floor(Math.random() * topCandidates.length);

    return topCandidates[index] || null;
  }

  const hasEventCondition = (dialogue, eventValue) => {
    const conditions = getDialogueConditions(dialogue);
    const normalizedEvent = normalizeText(eventValue);

    if (Array.isArray(conditions)) {
      return Boolean(normalizedEvent && conditions.includes(normalizedEvent));
    }

    if (!conditions || typeof conditions !== "object") {
      return false;
    }

    if (!Object.prototype.hasOwnProperty.call(conditions, "event")) {
      return false;
    }

    if (!normalizedEvent) {
      return true;
    }

    const required = conditions.event;

    if (Array.isArray(required)) {
      return required.map(normalizeText).includes(normalizedEvent);
    }

    return normalizeText(required) === normalizedEvent;
  };

  const filterEventOnlyCandidates = (candidates, options = {}) => {
    if (!options.eventOnly) {
      return candidates;
    }

    const eventValue = normalizeText(options.event ?? (options.eventContext && options.eventContext.event));

    return candidates.filter((dialogue) => hasEventCondition(dialogue, eventValue));
  };

  const getDefaultTargetSelector = (dialogue) => {
    const type = normalizeType(dialogue && dialogue.type);

    if (type === "whisper" || type === "forest_whisper" || (dialogue && dialogue.character === "Forest")) {
      return "#forestWhisperText, #forest-whisper, .forest-whisper__text, .forest-narration";
    }

    return "#characterDialogue, #character-dialogue, #fairyBalloon, .mint-guide__bubble, .forest-narration";
  };

  const revealDialogueContainer = (target) => {
    const container = target.closest(".forest-whisper, .mint-guide, .mobile-walker, [aria-hidden]");

    if (!container) {
      return;
    }

    container.classList.add("is-visible");
    container.classList.add("has-speech");

    if (container.hasAttribute("aria-hidden")) {
      container.setAttribute("aria-hidden", "false");
    }
  };

  /**
   * セリフを画面に表示する。
   * @deprecated v1.0では各ページ側でDOM表示を管理する。既存互換のため残す。
   */
  function showDialogue(dialogue, options = {}) {
    if (!dialogue) {
      return null;
    }

    const normalized = normalizeDialogue(dialogue);
    const targetSelector = options.targetSelector || getDefaultTargetSelector(normalized);
    const target = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector;

    if (!target) {
      console.warn("[TeaMerry DialogueEngine] display target not found:", targetSelector);
      return null;
    }

    target.textContent = normalized.text;
    target.dataset.dialogueId = normalized.id;
    target.dataset.character = normalized.character;
    target.dataset.dialogueType = normalized.type;
    revealDialogueContainer(target);

    return normalized;
  }

  /**
   * 読み込み済みデータから、候補抽出 → 選択 → 表示を行う。
   * @deprecated v1.0では pickForestWhisper / pickCharacterDialogue で文言のみ取得する。
   */
  function runDialogue(context = {}, options = {}) {
    const candidates = getCandidates(context);
    const selected = selectDialogue(candidates);

    showDialogue(selected, options);

    return selected;
  }

  const buildDialogueContext = (options = {}, type) => {
    const {
      jsonPath,
      eventContext,
      eventOnly,
      ...context
    } = options;

    return {
      ...context,
      ...(eventContext || {}),
      type,
    };
  };

  /**
   * 森のささやき文言を取得する。DOM操作は行わない。
   */
  async function pickForestWhisper(options = {}) {
    const jsonPath = options.jsonPath || DEFAULT_JSON_PATHS;

    await loadDialogue(jsonPath);

    const candidates = filterEventOnlyCandidates(
      getCandidates(buildDialogueContext(options, "forest_whisper")),
      options
    );
    const selected = selectDialogue(candidates);

    return selected && selected.text ? selected.text : null;
  }

  /**
   * キャラクター会話文言を取得する。DOM操作は行わない。
   */
  async function pickCharacterDialogue(options = {}) {
    const jsonPath = options.jsonPath || DEFAULT_JSON_PATHS;

    await loadDialogue(jsonPath);

    const candidates = getCandidates(buildDialogueContext(options, "character"));
    const selected = selectDialogue(candidates);

    return selected && selected.text ? selected.text : null;
  }

  window.TeaMerryDialogueEngine = {
    loadDialogue,
    getCandidates,
    checkConditions,
    selectDialogue,
    showDialogue,
    runDialogue,
    pickForestWhisper,
    pickCharacterDialogue,
    get data() {
      return TeaMerryDialogueData;
    },
    get loadedFrom() {
      return TeaMerryDialogueLoadedFrom;
    },
  };

  window.loadDialogue = loadDialogue;
  window.getCandidates = getCandidates;
  window.checkConditions = checkConditions;
  window.selectDialogue = selectDialogue;
  window.showDialogue = showDialogue;
  window.runDialogue = runDialogue;
  window.pickForestWhisper = pickForestWhisper;
  window.pickCharacterDialogue = pickCharacterDialogue;
})();
