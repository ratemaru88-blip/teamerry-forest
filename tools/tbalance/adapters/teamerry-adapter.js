(function () {
  "use strict";

  const PROJECT_BASE_URL = "https://ratemaru88-blip.github.io/teamerry-forest/";

  const TEA_MERRY_PAGES = [
    {
      id: "top",
      pageId: "page-home",
      label: "トップページ（森）",
      sourcePath: "index.html",
      url: `${PROJECT_BASE_URL}index.html`,
      aliases: ["トップページ", "森", "forest", "top", "#forest-map"],
    },
    {
      id: "observatory",
      pageId: "page-observatory",
      label: "星風テラス",
      sourcePath: "observatory.html",
      url: `${PROJECT_BASE_URL}observatory.html`,
      aliases: ["星風テラス", "星風", "observatory"],
    },
    {
      id: "hokkori",
      pageId: "page-observatory",
      label: "今日のほっこり",
      sourcePath: "observatory.html",
      url: `${PROJECT_BASE_URL}observatory.html?hokkori=1`,
      viewState: "hokkori=1",
      aliases: ["今日のほっこり", "ほっこり", "hokkori", "#hokkori"],
      desktopDisplayMode: "mobile-modal",
    },
    {
      id: "wishstar",
      pageId: "page-observatory",
      label: "願い星を書く",
      sourcePath: "observatory.html",
      url: `${PROJECT_BASE_URL}observatory.html?wish=1`,
      viewState: "wish=1",
      aliases: ["願い星を書く", "願い星", "wishstar", "wish", "#wish-star"],
      desktopDisplayMode: "mobile-modal",
    },
    {
      id: "bottle-mail",
      pageId: "page-observatory",
      label: "ボトルメール",
      sourcePath: "observatory.html",
      url: `${PROJECT_BASE_URL}observatory.html?bottle=1`,
      viewState: "bottle=1",
      aliases: ["ボトルメール", "bottlemail", "bottle", "#bottle-mail"],
      desktopDisplayMode: "mobile-modal",
    },
    {
      id: "tea-room",
      pageId: "page-tea-room",
      label: "ティールーム",
      sourcePath: "tea_room.html",
      url: `${PROJECT_BASE_URL}tea_room.html`,
      aliases: ["ティールーム", "tea room", "tearoom", "tea_room"],
    },
    {
      id: "ledger",
      pageId: "page-ledger",
      label: "森の記録帳",
      sourcePath: "ledger.html",
      url: `${PROJECT_BASE_URL}ledger.html`,
      aliases: ["森の記録帳", "記録帳", "ledger"],
    },
    {
      id: "cave",
      pageId: "page-cave",
      label: "ひみつの洞窟",
      sourcePath: "cave.html",
      url: `${PROJECT_BASE_URL}cave.html`,
      aliases: ["ひみつの洞窟", "洞窟", "cave"],
    },
    {
      id: "komoremi",
      pageId: "page-komoremi",
      label: "木漏れ日ページ",
      sourcePath: "komoremi.html",
      url: `${PROJECT_BASE_URL}komoremi.html`,
      aliases: ["木漏れ日", "komoremi"],
    },
  ];

  const PROTECTED_BEHAVIORS = {
    "guide-character": {
      behaviorRef: "teamerry-guide-character-dialogue-reaction",
      label: "案内キャラクターの会話・反応",
      protectedProperties: ["behavior", "dialogue", "event-handlers"],
    },
    "guide-speech-bubble": {
      behaviorRef: "teamerry-guide-speech-display",
      label: "案内セリフ吹き出し表示",
      protectedProperties: ["behavior", "dialogue", "structure"],
    },
    "wish-write-hotspot": {
      behaviorRef: "teamerry-wish-star-form-flow",
      label: "願い星を書くフォーム表示",
      protectedProperties: ["behavior", "navigation", "form-flow"],
    },
    "night-hokkori-hotspot": {
      behaviorRef: "teamerry-hokkori-random-display",
      label: "今日のほっこり表示",
      protectedProperties: ["behavior", "navigation", "random-display"],
    },
    "forest-back": {
      behaviorRef: "teamerry-forest-navigation",
      label: "森へ戻るナビゲーション",
      protectedProperties: ["behavior", "navigation"],
    },
  };

  function createTeaMerryAdapter(provider = {}, options = {}) {
    const genericAdapter = options.genericAdapter || window.TBalanceAdapter?.createGenericAdapter?.(provider) || null;

    return {
      id: "teamerry",
      version: "0.1",
      label: "TeaMerry Forest",
      capabilities: {
        pages: true,
        links: true,
        componentMapping: true,
        protectedBehavior: true,
        patch: false,
      },
      getKnownPages(context = {}) {
        return getKnownPages(context, genericAdapter);
      },
      resolveInternalLink(target, context = {}) {
        return resolveTeaMerryLink(target, context) || genericAdapter?.resolveInternalLink?.(target, context) || unresolved(target);
      },
      resolveTestUrl(target, context = {}) {
        const linkResult = resolveTeaMerryLink(target, context);
        if (linkResult?.page) {
          return {
            ...linkResult,
            url: toLocalProjectUrl(linkResult.page, context),
            officialUrl: linkResult.page.url,
            testUrl: toLocalProjectUrl(linkResult.page, context),
            displayMode: getDisplayModeForPage(linkResult.page, context),
          };
        }
        return genericAdapter?.resolveTestUrl?.(target, context) || unresolved(target);
      },
      getComponentMapping(pageId, tbId, context = {}) {
        return genericAdapter?.getComponentMapping?.(pageId, tbId, context) || null;
      },
      getProtectedBehavior(pageId, tbId, context = {}) {
        const generic = genericAdapter?.getProtectedBehavior?.(pageId, tbId, context) || null;
        const mapping = generic?.mapping || generic?.mappings?.[0] || null;
        const behavior = PROTECTED_BEHAVIORS[tbId] || (mapping?.tbId ? PROTECTED_BEHAVIORS[mapping.tbId] : null);
        if (!generic && !behavior) {
          return null;
        }
        if (generic?.status === "ambiguous") {
          return generic;
        }
        const protectedProperties = mergeUnique(generic?.protectedProperties || [], behavior?.protectedProperties || []);
        return {
          status: "resolved",
          adapter: "teamerry",
          pageId,
          tbId,
          protectedProperties,
          behaviorRef: behavior?.behaviorRef || generic?.behaviorRef || null,
          label: behavior?.label || "",
          viewState: normalizeViewState(context.viewState),
        };
      },
      getPageLink(target) {
        return findTeaMerryPage(target);
      },
      getReferenceTarget(id = "observatory-night", context = {}) {
        if (id !== "observatory-night") {
          return null;
        }
        const page = TEA_MERRY_PAGES.find((item) => item.id === "observatory");
        return {
          url: toLocalProjectUrl({ ...page, url: `${PROJECT_BASE_URL}observatory.html?time=night` }, context),
          loadedKind: "teamerry-reference",
          meta: {
            sourcePath: "observatory.html",
            viewState: "time=night",
            allowScripts: true,
          },
        };
      },
      shouldUseMobileModal(target) {
        const page = findTeaMerryPage(target);
        return page?.desktopDisplayMode === "mobile-modal";
      },
      getClickTargetAliases(target) {
        const page = findTeaMerryPage(target);
        if (!page) {
          return [];
        }
        return [page.id, page.label, ...page.aliases].filter(Boolean);
      },
    };
  }

  function getKnownPages(context, genericAdapter) {
    const confirmedPages = genericAdapter?.getKnownPages?.(context) || [];
    const pageMap = new Map();
    TEA_MERRY_PAGES.forEach((page) => {
      if (!pageMap.has(page.pageId)) {
        pageMap.set(page.pageId, {
          pageId: page.pageId,
          sourcePath: page.sourcePath,
          sourceAuthority: "standard-web",
          label: page.label,
          viewStates: [],
          componentCount: 0,
        });
      }
      const entry = pageMap.get(page.pageId);
      if (page.viewState && !entry.viewStates.includes(page.viewState)) {
        entry.viewStates.push(page.viewState);
      }
    });
    confirmedPages.forEach((page) => {
      const entry = pageMap.get(page.pageId) || {
        pageId: page.pageId,
        sourcePath: page.sourcePath || "",
        sourceAuthority: page.sourceAuthority || "standard-web",
        label: "",
        viewStates: [],
        componentCount: 0,
      };
      entry.sourcePath = entry.sourcePath || page.sourcePath || "";
      entry.sourceAuthority = page.sourceAuthority || entry.sourceAuthority || "standard-web";
      entry.componentCount = page.componentCount || entry.componentCount || 0;
      (page.viewStates || []).forEach((viewState) => {
        if (viewState && !entry.viewStates.includes(viewState)) {
          entry.viewStates.push(viewState);
        }
      });
      pageMap.set(entry.pageId, entry);
    });
    return Array.from(pageMap.values()).map((page) => ({
      ...page,
      viewStates: page.viewStates.slice().sort(),
    }));
  }

  function resolveTeaMerryLink(target) {
    const page = findTeaMerryPage(target);
    if (!page) {
      return null;
    }
    return {
      status: "resolved",
      adapter: "teamerry",
      target: String(target || "").trim(),
      id: page.id,
      pageId: page.pageId,
      sourcePath: page.sourcePath,
      sourceAuthority: "standard-web",
      label: page.label,
      url: page.url,
      officialUrl: page.url,
      path: getProjectPath(page.url),
      viewState: page.viewState || "",
      isExternal: false,
      page,
    };
  }

  function findTeaMerryPage(target) {
    const raw = String(target || "").trim();
    if (!raw) {
      return null;
    }
    const normalizedText = normalizeTargetText(raw);
    const normalizedUrl = normalizeTeaMerryUrl(raw);
    const normalizedPath = normalizeProjectPath(raw);
    return TEA_MERRY_PAGES.find((page) => {
      if (page.id === normalizedText || normalizeTargetText(page.id) === normalizedText) {
        return true;
      }
      if (normalizeTeaMerryUrl(page.url) === normalizedUrl) {
        return true;
      }
      if (normalizeProjectPath(page.url) === normalizedPath) {
        return true;
      }
      return page.aliases.some((alias) => normalizeTargetText(alias) === normalizedText);
    }) || null;
  }

  function toLocalProjectUrl(page, context = {}) {
    const rawUrl = String(page?.url || "").trim();
    if (!rawUrl) {
      return "";
    }
    try {
      const sourceUrl = new URL(rawUrl, PROJECT_BASE_URL);
      const projectPath = getProjectPath(sourceUrl.href) || page.sourcePath || "index.html";
      const base = getLocalProjectBase(context);
      return new URL(projectPath, base).toString();
    } catch (error) {
      return rawUrl;
    }
  }

  function getLocalProjectBase(context = {}) {
    const candidates = [
      context.projectBaseUrl,
      context.siteBaseUrl,
      context.origin,
      context.baseUrl,
      context.currentUrl,
      context.effectiveUrl,
      typeof location !== "undefined" ? location.href : "",
    ];
    const base = candidates.find((candidate) => typeof candidate === "string" && candidate.trim()) || PROJECT_BASE_URL;
    try {
      const url = new URL(base, PROJECT_BASE_URL);
      const path = url.pathname || "/";
      if (path.includes("/tools/tbalance/")) {
        return new URL("../../", url).toString();
      }
      if (/\/[^/]+\.[a-z0-9]+$/i.test(path)) {
        return new URL("./", url).toString();
      }
      return url.toString().endsWith("/") ? url.toString() : `${url.toString()}/`;
    } catch (error) {
      return PROJECT_BASE_URL;
    }
  }

  function getDisplayModeForPage(page, context = {}) {
    const viewport = String(context.viewport || "").trim();
    if (viewport === "desktop" && page.desktopDisplayMode) {
      return page.desktopDisplayMode;
    }
    return "full";
  }

  function normalizeTeaMerryUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    try {
      const url = new URL(raw, PROJECT_BASE_URL);
      if (url.hostname !== "ratemaru88-blip.github.io" || !url.pathname.startsWith("/teamerry-forest/")) {
        return raw;
      }
      url.hash = "";
      return url.toString();
    } catch (error) {
      return raw;
    }
  }

  function normalizeProjectPath(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    try {
      return getProjectPath(new URL(raw, PROJECT_BASE_URL).toString()).toLowerCase();
    } catch (error) {
      return raw.replace(/^\.\//, "").replace(/^\//, "").toLowerCase();
    }
  }

  function getProjectPath(value) {
    const url = typeof value === "string" ? new URL(value, PROJECT_BASE_URL) : value;
    const path = url.pathname.replace(/^\/teamerry-forest\//, "").replace(/^\/+/, "") || "index.html";
    return `${path}${url.search}${url.hash}`;
  }

  function normalizeTargetText(target) {
    return String(target || "")
      .trim()
      .replace(/^#/, "")
      .replace(/[＿_\-\s]+/g, "")
      .toLowerCase();
  }

  function normalizeViewState(value) {
    return String(value || "").trim();
  }

  function mergeUnique(...lists) {
    return Array.from(new Set(lists.flat().filter(Boolean)));
  }

  function unresolved(target) {
    return {
      status: "unresolved",
      target: String(target || "").trim(),
      reason: "teamerry-unresolved",
    };
  }

  window.TBalanceTeaMerryAdapter = {
    createTeaMerryAdapter,
    pages: TEA_MERRY_PAGES.map((page) => ({ ...page, aliases: [...page.aliases] })),
  };
})();
