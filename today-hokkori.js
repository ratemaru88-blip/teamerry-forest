const HOKKORI_START_DATE = "2026-07-15";

(function () {
  const HOKKORI_CONFIG = {
    version: "v1",
    timeZone: "Asia/Tokyo",
    startDate: HOKKORI_START_DATE,
    countPerDay: 3,
    seedPrefix: "TeaMerry-Forest-Today-Hokkori",
  };

  function hashString(text) {
    let hash = 2166136261;
    const source = String(text);

    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;

    return function random() {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(items, seedText) {
    const result = [...items];
    const random = mulberry32(hashString(seedText));

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
  }

  function getJstDateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: HOKKORI_CONFIG.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = {};

    parts.forEach((part) => {
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    });

    return `${values.year}-${values.month}-${values.day}`;
  }

  function dateKeyToDayNumber(dateKey) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

    if (!match) {
      throw new Error(`Invalid hokkori date: ${dateKey}`);
    }

    return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
  }

  function getDayIndex(dateKey) {
    return Math.max(0, dateKeyToDayNumber(dateKey) - dateKeyToDayNumber(HOKKORI_CONFIG.startDate));
  }

  function isHokkoriEnabled(value) {
    if (value === undefined || value === null || value === "") {
      return true;
    }

    if (typeof value === "boolean") {
      return value;
    }

    const normalized = String(value).trim().toLowerCase();
    return !["false", "0", "no", "off", "非公開", "対象外"].includes(normalized);
  }

  function normalizeHandwriting(value) {
    const text = String(value || "").trim().toLowerCase();

    if (text.startsWith("round") || text.includes("丸い筆跡")) {
      return "round";
    }

    if (text.startsWith("careful") || text.includes("丁寧な筆跡")) {
      return "careful";
    }

    if (text.startsWith("faded") || text.startsWith("かすれ") || text.includes("かすれた筆跡")) {
      return "faded";
    }

    if (text.startsWith("child") || text.includes("子どもの筆跡")) {
      return "child";
    }

    return "quiet";
  }

  function normalizeBottle(raw = {}) {
    const text = String(raw.message || raw.text || raw.body || raw["ボトル本文"] || "").trim();
    const preview = String(raw.boardExcerpt || raw.preview || raw["掲示板抜粋"] || "").trim();

    return {
      raw,
      id: String(raw.id || raw.ID || "").trim(),
      category: String(raw.category || raw["カテゴリ"] || "").trim(),
      displayName: String(raw.displayName || raw["表示名"] || raw["表示名 （空欄＝おさんぽさん）"] || "").trim() || "おさんぽさん",
      text,
      preview: preview || text,
      handwritingTemplate: normalizeHandwriting(raw.handwritingTemplate || raw.handwriting || raw["筆跡テンプレート"]),
      enabled: raw.enabled !== false && isHokkoriEnabled(raw.hokkoriEnabled || raw["今日のほっこり対象"]),
    };
  }

  function selectCategoriesForDay(categories, dayIndex) {
    if (categories.length <= HOKKORI_CONFIG.countPerDay) {
      return [...categories];
    }

    const weekIndex = Math.floor(dayIndex / 7);
    const dayInWeek = dayIndex % 7;
    const shuffled = seededShuffle(
      categories,
      [HOKKORI_CONFIG.seedPrefix, HOKKORI_CONFIG.version, "category-week", weekIndex].join("|")
    );
    const selected = [];
    const startPosition = (dayInWeek * HOKKORI_CONFIG.countPerDay) % shuffled.length;

    for (let offset = 0; selected.length < HOKKORI_CONFIG.countPerDay; offset += 1) {
      const category = shuffled[(startPosition + offset) % shuffled.length];

      if (!selected.includes(category)) {
        selected.push(category);
      }
    }

    return selected;
  }

  function countPreviousCategoryAppearances(categories, category, dayIndex) {
    let count = 0;

    for (let index = 0; index < dayIndex; index += 1) {
      if (selectCategoriesForDay(categories, index).includes(category)) {
        count += 1;
      }
    }

    return count;
  }

  function selectBottleFromCategory(bottles, category, categories, dayIndex) {
    const categoryBottles = bottles.filter((bottle) => bottle.category === category);

    if (!categoryBottles.length) {
      return null;
    }

    const ordered = seededShuffle(
      categoryBottles,
      [HOKKORI_CONFIG.seedPrefix, HOKKORI_CONFIG.version, "bottle-order", category].join("|")
    );
    const appearanceCount = countPreviousCategoryAppearances(categories, category, dayIndex);

    return ordered[appearanceCount % ordered.length];
  }

  function getTodayHokkori(rawBottles, targetDate = new Date()) {
    if (!Array.isArray(rawBottles)) {
      throw new TypeError("Bottle data must be an array.");
    }

    const bottles = rawBottles
      .map(normalizeBottle)
      .filter((bottle) => bottle.enabled && bottle.id && bottle.category && bottle.text);

    if (bottles.length < HOKKORI_CONFIG.countPerDay) {
      throw new Error("Today hokkori needs at least 3 valid bottles.");
    }

    const categories = [...new Set(bottles.map((bottle) => bottle.category))].sort((a, b) => a.localeCompare(b, "ja"));
    const dateKey = getJstDateKey(targetDate);
    const dayIndex = getDayIndex(dateKey);
    const selectedCategories = selectCategoriesForDay(categories, dayIndex);
    const selected = selectedCategories
      .map((category) => selectBottleFromCategory(bottles, category, categories, dayIndex))
      .filter(Boolean);

    if (selected.length < HOKKORI_CONFIG.countPerDay) {
      const selectedIds = new Set(selected.map((bottle) => bottle.id));
      const fallback = seededShuffle(
        bottles.filter((bottle) => !selectedIds.has(bottle.id)),
        [HOKKORI_CONFIG.seedPrefix, HOKKORI_CONFIG.version, "fallback", dateKey].join("|")
      );

      while (selected.length < HOKKORI_CONFIG.countPerDay && fallback.length) {
        selected.push(fallback.shift());
      }
    }

    return {
      dateKey,
      dayIndex,
      items: selected.slice(0, HOKKORI_CONFIG.countPerDay),
    };
  }

  window.TeaMerryTodayHokkori = {
    config: HOKKORI_CONFIG,
    getTodayHokkori,
    normalizeBottle,
  };
  window.getTodayHokkori = getTodayHokkori;
})();
