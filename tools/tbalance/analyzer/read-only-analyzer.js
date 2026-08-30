(function () {
  "use strict";

  const MAX_ELEMENTS = 240;
  const INTERACTIVE_TAGS = new Set(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "FORM", "SUMMARY", "DETAILS"]);
  const CONTENT_TAGS = new Set(["IMG", "VIDEO", "AUDIO", "CANVAS", "SVG", "PICTURE", "TEXTAREA", "INPUT", "BUTTON"]);
  const SAFE_VISUAL_TAGS = new Set(["IMG", "SVG", "PICTURE"]);

  function analyzeDocument(doc, options = {}) {
    if (!doc || !doc.documentElement) {
      throw new Error("解析できるDocumentがありません。");
    }
    const win = doc.defaultView || window;
    const page = {
      path: options.path || doc.location?.pathname || "",
      title: doc.title || "",
      entryType: options.entryType || "unknown-existing",
      sourceAuthority: options.sourceAuthority || "standard-web",
      sourcePath: options.sourcePath || "",
      viewState: options.viewState || "",
      analyzedAt: new Date().toISOString(),
      scriptExecution: options.scriptExecution || "blocked",
    };
    const elements = [];
    const nodes = Array.from(doc.body ? doc.body.querySelectorAll("*") : doc.querySelectorAll("*"));
    for (const node of nodes) {
      if (elements.length >= MAX_ELEMENTS) {
        break;
      }
      if (!shouldIncludeElement(node, win)) {
        continue;
      }
      elements.push(analyzeElement(node, win, elements.length));
    }
    return {
      analyzerVersion: "0.1",
      source: "TBalanceReadOnlyAnalyzer",
      page,
      counts: {
        elements: elements.length,
        truncated: nodes.length > elements.length && elements.length >= MAX_ELEMENTS,
      },
      elements,
      notes: [
        "Read Only Analyzer v0.1 result is Runtime / Temporary data.",
        "Observed and Inferred are intentionally separated.",
        "No metadata, manifest, HTML, CSS, or JS changes were written.",
      ],
    };
  }

  function analyzeElement(node, win, index) {
    const style = win.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const parent = node.parentElement;
    const parentStyle = parent ? win.getComputedStyle(parent) : null;
    const tag = node.tagName;
    const inlineEvents = getInlineEvents(node);
    const observed = {
      tag: tag.toLowerCase(),
      id: node.id || "",
      className: typeof node.className === "string" ? node.className : "",
      dataAttributes: getDataAttributes(node),
      domRef: getSelectorCandidate(node),
      parentRef: parent ? getSelectorCandidate(parent) : "",
      childCount: node.children ? node.children.length : 0,
      role: node.getAttribute("role") || "",
      tabIndex: node.hasAttribute("tabindex") ? node.getAttribute("tabindex") : "",
      ariaLabel: node.getAttribute("aria-label") || "",
      bounds: {
        x: round(rect.left),
        y: round(rect.top),
        width: round(rect.width),
        height: round(rect.height),
      },
      computed: {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        positionType: style.position,
        transform: style.transform === "none" ? "" : style.transform,
        zIndex: style.zIndex,
        overflow: `${style.overflowX}/${style.overflowY}`,
        pointerEvents: style.pointerEvents,
        backgroundColor: style.backgroundColor,
      },
      layout: {
        parentDisplay: parentStyle?.display || "",
        parentPosition: parentStyle?.position || "",
        flexChild: Boolean(parentStyle && parentStyle.display.includes("flex")),
        gridChild: Boolean(parentStyle && parentStyle.display.includes("grid")),
      },
      link: node.getAttribute("href") || "",
      src: node.getAttribute("src") || node.currentSrc || "",
      backgroundImage: getBackgroundImage(style),
      textExists: hasDirectText(node),
      formType: getFormType(node),
      htmlSemantics: getHtmlSemantics(node),
      inlineEvents,
      eventDetected: inlineEvents.length ? "inline-event" : "unknown",
    };
    const inferred = inferElement(node, observed);
    return {
      candidateId: createCandidateId(node, observed, index),
      observed,
      inferred,
    };
  }

  function shouldIncludeElement(node, win) {
    if (!node || node.nodeType !== 1) {
      return false;
    }
    const tag = node.tagName;
    if (["SCRIPT", "STYLE", "META", "LINK", "TITLE", "NOSCRIPT", "TEMPLATE"].includes(tag)) {
      return false;
    }
    const style = win.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    if (rect.width >= 1 && rect.height >= 1) {
      return true;
    }
    return INTERACTIVE_TAGS.has(tag) || CONTENT_TAGS.has(tag) || hasDirectText(node);
  }

  function inferElement(node, observed) {
    const interactive = isInteractive(node, observed);
    const runtimeScriptUnknown = hasRuntimeScriptContext(node);
    const dynamicStateHint = hasDynamicStateHint(node, observed);
    const containerDependency = observed.childCount > 0 && (observed.computed.pointerEvents === "none" || observed.computed.positionType === "absolute");
    const layoutDependency = observed.layout.flexChild
      || observed.layout.gridChild
      || observed.computed.transform
      || observed.computed.positionType === "sticky"
      || containerDependency;
    const strongVisualCandidate = !interactive
      && ["absolute", "fixed"].includes(observed.computed.positionType)
      && !layoutDependency
      && !observed.inlineEvents.length
      && !observed.textExists
      && !dynamicStateHint
      && isStrongVisualTag(node, observed);
    let analysisStatus = "unknown";
    if (interactive || observed.inlineEvents.length || dynamicStateHint) {
      analysisStatus = "behavior-analysis-required";
    } else if (layoutDependency) {
      analysisStatus = "layout-dependency";
    } else if (strongVisualCandidate) {
      analysisStatus = "safe-visual-edit";
    }
    return {
      roleCandidate: getRoleCandidate(node, observed),
      componentCandidate: getComponentCandidate(node, observed),
      visualEditSafety: analysisStatus === "safe-visual-edit" ? "candidate" : "not-confirmed",
      layoutDependency: layoutDependency ? "detected" : "low",
      jsInfluence: observed.inlineEvents.length ? "inline-event" : runtimeScriptUnknown ? "runtime-script-present-unverified" : "unknown",
      possibleBehavior: interactive ? "interactive-or-navigation" : dynamicStateHint ? "dynamic-state-or-script-bound" : "unknown",
      analysisStatus,
      confidence: getConfidence(analysisStatus, observed),
      evidence: getEvidence(node, observed, layoutDependency, interactive, runtimeScriptUnknown, dynamicStateHint),
    };
  }

  function getRoleCandidate(node, observed) {
    const explicit = node.getAttribute("role");
    if (explicit) {
      return explicit;
    }
    if (observed.tag === "a") return "link";
    if (observed.tag === "button") return "button";
    if (["input", "select", "textarea", "form"].includes(observed.tag)) return "form-control";
    if (observed.tag === "img") return "image";
    if (/^h[1-6]$/.test(observed.tag)) return "heading";
    if (observed.backgroundImage) return "background-visual";
    if (observed.textExists) return "text";
    return "visual";
  }

  function getComponentCandidate(node, observed) {
    const className = observed.className || "";
    if (/modal|dialog|popup/i.test(className)) return "modal";
    if (/nav|menu/i.test(className) || observed.tag === "nav") return "navigation";
    if (/card|panel/i.test(className)) return "panel";
    if (/button|cta/i.test(className) || observed.tag === "button") return "button";
    if (observed.tag === "form") return "form";
    return "";
  }

  function getEvidence(node, observed, layoutDependency, interactive, runtimeScriptUnknown, dynamicStateHint) {
    const evidence = [];
    if (node.id) evidence.push("id");
    if (observed.className) evidence.push("class");
    if (observed.tag) evidence.push(`${observed.tag}-element`);
    if (interactive) evidence.push("interactive-semantics");
    if (observed.inlineEvents.length) evidence.push("inline-event");
    if (layoutDependency) evidence.push("layout-dependency");
    if (runtimeScriptUnknown) evidence.push("runtime-script-context");
    if (dynamicStateHint) evidence.push("dynamic-state-hint");
    if (observed.backgroundImage) evidence.push("background-image");
    return evidence;
  }

  function getConfidence(status, observed) {
    if (status === "safe-visual-edit") return 0.72;
    if (status === "behavior-analysis-required") return observed.inlineEvents.length ? 0.78 : 0.66;
    if (status === "layout-dependency") return 0.68;
    return 0.45;
  }

  function isInteractive(node, observed) {
    return INTERACTIVE_TAGS.has(node.tagName)
      || Boolean(observed.role && /button|link|menuitem|tab|checkbox|radio/i.test(observed.role))
      || (observed.tabIndex !== "" && observed.tabIndex !== "-1")
      || Boolean(observed.link)
      || observed.formType !== "";
  }

  function hasRuntimeScriptContext(node) {
    const doc = node.ownerDocument;
    if (!doc) {
      return false;
    }
    return Boolean(doc.querySelector("script[src], script:not([type]), script[type=''], script[type='text/javascript'], script[type='module']"));
  }

  function hasDynamicStateHint(node, observed) {
    if (observed.role && /button|link|menuitem|tab|checkbox|radio/i.test(observed.role)) {
      return true;
    }
    if (observed.tabIndex !== "" && observed.tabIndex !== "-1") return true;
    if (node.hasAttribute("aria-expanded") || node.hasAttribute("aria-controls") || node.hasAttribute("aria-pressed")) {
      return true;
    }
    return false;
  }

  function isStrongVisualTag(node, observed) {
    if (SAFE_VISUAL_TAGS.has(node.tagName)) {
      return true;
    }
    if (!["DIV", "SPAN"].includes(node.tagName)) {
      return false;
    }
    return observed.childCount === 0
      && !observed.textExists
      && (Boolean(observed.backgroundImage) || hasVisibleBackground(observed.computed.backgroundColor));
  }

  function hasVisibleBackground(value) {
    return Boolean(value)
      && value !== "transparent"
      && value !== "rgba(0, 0, 0, 0)";
  }

  function getHtmlSemantics(node) {
    const tag = node.tagName.toLowerCase();
    if (tag === "a") return "anchor";
    if (tag === "button") return "button";
    if (["input", "select", "textarea", "form", "label"].includes(tag)) return "form";
    if (/^h[1-6]$/.test(tag)) return "heading";
    if (["main", "nav", "section", "article", "aside", "header", "footer"].includes(tag)) return "landmark";
    if (tag === "img") return "image";
    return "";
  }

  function getFormType(node) {
    if (node.tagName === "INPUT") return node.getAttribute("type") || "text";
    if (["SELECT", "TEXTAREA", "FORM"].includes(node.tagName)) return node.tagName.toLowerCase();
    return "";
  }

  function getInlineEvents(node) {
    return Array.from(node.attributes || [])
      .filter((attr) => /^on/i.test(attr.name))
      .map((attr) => attr.name.toLowerCase());
  }

  function getDataAttributes(node) {
    const data = {};
    Array.from(node.attributes || []).forEach((attr) => {
      if (attr.name.startsWith("data-")) {
        data[attr.name] = attr.value;
      }
    });
    return data;
  }

  function getBackgroundImage(style) {
    const value = style.backgroundImage || "";
    return value && value !== "none" ? value : "";
  }

  function hasDirectText(node) {
    return Array.from(node.childNodes || []).some((child) => child.nodeType === 3 && child.textContent.trim());
  }

  function getSelectorCandidate(node) {
    if (!node || node.nodeType !== 1) {
      return "";
    }
    if (node.id) {
      return `#${cssEscape(node.id)}`;
    }
    const dataId = node.getAttribute("data-tb-id") || node.getAttribute("data-testid");
    if (dataId) {
      const attr = node.getAttribute("data-tb-id") ? "data-tb-id" : "data-testid";
      return `[${attr}="${escapeAttr(dataId)}"]`;
    }
    const cls = typeof node.className === "string" ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
    const base = node.tagName.toLowerCase() + cls.map((name) => `.${cssEscape(name)}`).join("");
    const parent = node.parentElement;
    if (!parent) {
      return base;
    }
    const siblings = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
    if (siblings.length <= 1) {
      return base;
    }
    return `${base}:nth-of-type(${siblings.indexOf(node) + 1})`;
  }

  function createCandidateId(node, observed, index) {
    const raw = node.getAttribute("data-tb-id")
      || node.id
      || observed.className.split(/\s+/).find(Boolean)
      || `${observed.tag}-${index + 1}`;
    return String(raw)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      || `element-${index + 1}`;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(value);
    }
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function escapeAttr(value) {
    return String(value).replace(/"/g, '\\"');
  }

  function round(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  window.TBalanceReadOnlyAnalyzer = {
    analyzeDocument,
    getSelectorCandidate,
  };
})();
