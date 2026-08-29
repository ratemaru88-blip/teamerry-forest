(function () {
  "use strict";

  const VERSION = "0.1";
  const SAME_PAGE_PROTOCOLS = new Set(["http:", "https:"]);
  const PLACEHOLDER_SOURCE_PATHS = new Set(["", "unknown", "unknown.html", "unknown-page", "page"]);

  function normalizeSourcePath(value, fallback = "index.html") {
    const raw = String(value || fallback || "index.html").trim();
    if (!raw) {
      return fallback;
    }
    try {
      const url = new URL(raw, "https://tbalance.local/");
      return normalizePathname(url.pathname);
    } catch (error) {
      return normalizePathname(raw.split("?")[0].split("#")[0]);
    }
  }

  function normalizeViewState(value) {
    return String(value || "").trim().replace(/^\?/, "");
  }

  function isPlaceholderSourcePath(value) {
    const raw = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\\/g, "/")
      .replace(/^[./]+/, "")
      .replace(/^\/+/, "")
      .split("?")[0]
      .split("#")[0];
    return PLACEHOLDER_SOURCE_PATHS.has(raw);
  }

  function normalizePathname(pathname) {
    const clean = String(pathname || "")
      .replace(/\\/g, "/")
      .replace(/^[./]+/, "")
      .replace(/^\/+/, "")
      .split("?")[0]
      .split("#")[0];
    return clean || "index.html";
  }

  function suggestPageId(sourcePath) {
    const clean = normalizeSourcePath(sourcePath);
    const name = clean.split("/").pop().replace(/\.[^.]+$/, "") || "home";
    const id = name === "index"
      ? "page-home"
      : `page-${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    return id || "page-home";
  }

  function splitHref(rawHref, fromSourcePath = "index.html", context = {}) {
    const target = String(rawHref || "").trim();
    if (!target) {
      return { kind: "unresolved", reason: "empty-href", rawHref: target };
    }
    if (/^(mailto|tel|javascript):/i.test(target)) {
      return { kind: "behavior", reason: "behavior-protocol", rawHref: target, protocol: target.split(":")[0].toLowerCase() };
    }
    const base = new URL(normalizeSourcePath(fromSourcePath), "https://tbalance.local/");
    let url;
    try {
      url = new URL(target, base);
    } catch (error) {
      return { kind: "unresolved", reason: "invalid-url", rawHref: target, message: error.message };
    }
    if (!SAME_PAGE_PROTOCOLS.has(url.protocol)) {
      return { kind: "external", reason: "external-protocol", rawHref: target, url: url.href };
    }
    if (url.origin !== base.origin) {
      return { kind: "external", reason: "external-origin", rawHref: target, url: url.href };
    }
    const sourcePath = normalizeSourcePath(url.pathname);
    const query = url.search ? url.search.slice(1) : "";
    const hash = url.hash ? url.hash.slice(1) : "";
    return {
      kind: "internal",
      rawHref: target,
      sourcePath,
      pageId: context.pageIdBySourcePath?.[sourcePath] || suggestPageId(sourcePath),
      targetState: {
        query,
        hash,
        viewState: normalizeViewState(query),
      },
    };
  }

  function scanHtml(html, sourcePath, options = {}) {
    const titleFallback = normalizeSourcePath(sourcePath);
    const result = {
      sourcePath: normalizeSourcePath(sourcePath),
      title: titleFallback,
      links: [],
      dynamic: [],
      diagnostics: [],
    };
    if (!html || typeof html !== "string") {
      result.diagnostics.push(makeDiagnostic("error", "empty-html", result.sourcePath, "HTMLが空です。"));
      return result;
    }
    let doc = null;
    if (typeof DOMParser !== "undefined") {
      doc = new DOMParser().parseFromString(html, "text/html");
    }
    if (!doc) {
      result.diagnostics.push(makeDiagnostic("warning", "domparser-unavailable", result.sourcePath, "DOMParserを利用できません。"));
      return result;
    }
    result.title = doc.querySelector("title")?.textContent?.trim() || result.title;
    const anchors = Array.from(doc.querySelectorAll("a[href]"));
    anchors.forEach((anchor, index) => {
      const href = anchor.getAttribute("href") || "";
      const label = compactText(anchor.textContent || anchor.getAttribute("aria-label") || anchor.getAttribute("title") || href);
      const split = splitHref(href, result.sourcePath, options);
      result.links.push({
        linkId: `link-${index + 1}`,
        rawHref: href,
        label,
        domRef: selectorFor(anchor),
        kind: split.kind,
        reason: split.reason || "",
        targetPageId: split.pageId || "",
        targetSourcePath: split.sourcePath || "",
        targetState: split.targetState || null,
        externalUrl: split.url || "",
      });
    });
    Array.from(doc.querySelectorAll("[onclick], button, form")).forEach((node, index) => {
      result.dynamic.push({
        dynamicId: `dynamic-${index + 1}`,
        domRef: selectorFor(node),
        label: compactText(node.textContent || node.getAttribute("aria-label") || node.getAttribute("title") || node.tagName.toLowerCase()),
        tag: node.tagName.toLowerCase(),
        reason: node.hasAttribute("onclick") ? "inline-onclick" : `${node.tagName.toLowerCase()}-behavior-unknown`,
      });
    });
    return result;
  }

  function buildGraph(input = {}) {
    const pages = mergePages(input.pages || []);
    const pageBySourcePath = Object.fromEntries(pages.map((page) => [page.sourcePath, page.pageId]));
    const scans = input.scans || {};
    const links = [];
    const diagnostics = [];

    Object.values(scans).forEach((scan) => {
      if (!scan) {
        return;
      }
      const fromPage = findPageForSourcePath(pages, scan.sourcePath) || {
        pageId: suggestPageId(scan.sourcePath),
        sourcePath: normalizeSourcePath(scan.sourcePath),
        label: scan.title || normalizeSourcePath(scan.sourcePath),
        identityStatus: "candidate",
        source: "scan",
      };
      if (!isPlaceholderSourcePath(fromPage.sourcePath) && !pages.some((page) => page.pageId === fromPage.pageId)) {
        pages.push(fromPage);
      }
      (scan.diagnostics || []).forEach((diagnostic) => diagnostics.push(diagnostic));
      (scan.links || []).forEach((link) => {
        let resolved = link;
        if (link.kind === "internal" && !link.targetPageId && link.targetSourcePath) {
          resolved = { ...link, targetPageId: pageBySourcePath[link.targetSourcePath] || suggestPageId(link.targetSourcePath) };
        }
        const targetExists = !resolved.targetSourcePath || pages.some((page) => page.sourcePath === resolved.targetSourcePath);
        const edgeStatus = getEdgeStatus(resolved, targetExists);
        links.push({
          edgeId: `${fromPage.pageId}:${link.linkId}`,
          fromPageId: fromPage.pageId,
          fromSourcePath: fromPage.sourcePath,
          toPageId: resolved.targetPageId || "",
          toSourcePath: resolved.targetSourcePath || "",
          label: resolved.label || resolved.rawHref || "",
          domRef: resolved.domRef || "",
          rawHref: resolved.rawHref || "",
          targetState: resolved.targetState || null,
          kind: resolved.kind || "unresolved",
          status: edgeStatus,
          externalUrl: resolved.externalUrl || "",
          reason: resolved.reason || "",
        });
        if (resolved.kind === "internal" && resolved.targetSourcePath && resolved.targetState) {
          addStateToPage(pages, resolved.targetSourcePath, resolved.targetState, "discovered-link");
        }
      });
      (scan.dynamic || []).forEach((item) => {
        diagnostics.push(makeDiagnostic("info", "dynamic-link-candidate", scan.sourcePath, `${item.domRef}: ${item.reason}`, { domRef: item.domRef }));
      });
    });

    return {
      siteMapVersion: VERSION,
      generatedAt: new Date().toISOString(),
      projectId: input.projectId || "sample-project",
      adapterId: input.adapterId || "none",
      pages: pages.sort((a, b) => a.pageId.localeCompare(b.pageId)),
      links,
      diagnostics: buildDiagnostics(pages, links, diagnostics),
    };
  }

  function mergePages(pageSources) {
    const byKey = new Map();
    const diagnostics = [];
    pageSources.forEach((page) => {
      const normalized = normalizePage(page);
      if (!normalized) {
        diagnostics.push(makeDiagnostic("info", "source-path-unconfirmed", "index.html", "現在ページのSourceをまだ確定できません。Analyzer未解析またはpage metadata不足です。", { source: page?.source || page?.origin || "runtime" }));
        return;
      }
      const key = normalized.pageId || `source:${normalized.sourcePath}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, normalized);
        return;
      }
      byKey.set(key, {
        ...existing,
        ...normalized,
        label: chooseBetterLabel(existing, normalized),
        sourcePath: chooseBetterSourcePath(existing.sourcePath, normalized.sourcePath),
        viewStates: unique([...(existing.viewStates || []), ...(normalized.viewStates || [])]),
        viewStateDetails: mergeStateDetails(existing.viewStateDetails, normalized.viewStateDetails),
        componentCount: Math.max(Number(existing.componentCount || 0), Number(normalized.componentCount || 0)),
        sources: unique([...(existing.sources || []), ...(normalized.sources || [])]),
        identityStatus: existing.identityStatus === "confirmed" || normalized.identityStatus === "confirmed" ? "confirmed" : existing.identityStatus,
      });
    });
    const pages = Array.from(byKey.values());
    pages.placeholderDiagnostics = diagnostics;
    return pages;
  }

  function chooseBetterSourcePath(current, next) {
    if (isPlaceholderSourcePath(current)) {
      return isPlaceholderSourcePath(next) ? "" : normalizeSourcePath(next);
    }
    if (isPlaceholderSourcePath(next)) {
      return normalizeSourcePath(current);
    }
    const currentPath = normalizeSourcePath(current);
    const nextPath = normalizeSourcePath(next);
    if (!currentPath) {
      return nextPath;
    }
    if (!nextPath) {
      return currentPath;
    }
    return currentPath;
  }

  function chooseBetterLabel(current = {}, next = {}) {
    const currentLabel = String(current.label || "").trim();
    const nextLabel = String(next.label || "").trim();
    if (!currentLabel) {
      return nextLabel;
    }
    if (!nextLabel) {
      return currentLabel;
    }
    const currentIsTechnical = currentLabel === current.pageId || currentLabel === current.sourcePath;
    const nextIsTechnical = nextLabel === next.pageId || nextLabel === next.sourcePath;
    if (currentIsTechnical && !nextIsTechnical) {
      return nextLabel;
    }
    return currentLabel;
  }

  function normalizePage(page = {}) {
    const rawSourcePath = page.sourcePath || page.path || page.url || "";
    if (isPlaceholderSourcePath(rawSourcePath)) {
      return null;
    }
    const sourcePath = normalizeSourcePath(rawSourcePath);
    const viewStateDetails = normalizeStateDetails(page);
    return {
      pageId: page.pageId || page.id || suggestPageId(sourcePath),
      label: page.label || page.title || sourcePath,
      sourcePath,
      sourceAuthority: page.sourceAuthority || "standard-web",
      viewStates: unique(viewStateDetails.map((item) => item.value)),
      viewStateDetails,
      componentCount: Number(page.componentCount || page.components?.length || 0),
      identityStatus: page.identityStatus || "candidate",
      sources: unique([page.source || page.origin || "runtime"]),
    };
  }

  function findPageForSourcePath(pages, sourcePath) {
    const normalized = normalizeSourcePath(sourcePath);
    return pages.find((page) => page.sourcePath === normalized) || null;
  }

  function getEdgeStatus(link, targetExists) {
    if (link.kind === "external") {
      return "external";
    }
    if (link.kind === "behavior") {
      return "dynamic";
    }
    if (link.kind !== "internal") {
      return "unresolved";
    }
    return targetExists ? "resolved" : "missing-target";
  }

  function buildDiagnostics(pages, links, baseDiagnostics) {
    const diagnostics = [...(baseDiagnostics || []), ...(pages.placeholderDiagnostics || [])];
    links.forEach((link) => {
      if (link.status === "missing-target") {
        diagnostics.push(makeDiagnostic("warning", "missing-target", link.fromSourcePath, `${link.rawHref} の対象ページを確認できません。`, { edgeId: link.edgeId }));
      }
      if (link.status === "dynamic") {
        diagnostics.push(makeDiagnostic("info", "dynamic-link", link.fromSourcePath, `${link.rawHref || link.domRef} は動的リンク候補です。`, { edgeId: link.edgeId }));
      }
      if (link.status === "unresolved") {
        diagnostics.push(makeDiagnostic("warning", "unresolved-link", link.fromSourcePath, `${link.rawHref} を解決できません。`, { edgeId: link.edgeId }));
      }
    });
    const pageIds = new Set();
    pages.forEach((page) => {
      if (pageIds.has(page.pageId)) {
        diagnostics.push(makeDiagnostic("warning", "duplicate-page-id", page.sourcePath, `${page.pageId} が重複しています。`));
      }
      pageIds.add(page.pageId);
    });
    const counts = diagnostics.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {});
    return {
      total: diagnostics.length,
      errors: counts.error || 0,
      warnings: counts.warning || 0,
      info: counts.info || 0,
      items: diagnostics,
    };
  }

  function makeDiagnostic(severity, code, sourcePath, message, extra = {}) {
    return {
      severity,
      code,
      sourcePath: normalizeSourcePath(sourcePath || "index.html"),
      message,
      ...extra,
    };
  }

  function selectorFor(node) {
    if (!node || !node.tagName) {
      return "";
    }
    const tag = node.tagName.toLowerCase();
    if (node.id) {
      return `#${node.id}`;
    }
    const className = String(node.className || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
    if (className) {
      return `${tag}.${className}`;
    }
    const parent = node.parentElement;
    if (!parent) {
      return tag;
    }
    const siblings = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
    const index = siblings.indexOf(node);
    return index > 0 ? `${tag}:nth-of-type(${index + 1})` : tag;
  }

  function compactText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function normalizeStateDetails(page = {}) {
    const details = [];
    const add = (value, source) => {
      const normalized = normalizeViewState(value);
      if (!normalized) {
        return;
      }
      details.push({ value: normalized, source: source || page.source || page.origin || "runtime" });
    };
    (page.viewStateDetails || []).forEach((item) => {
      add(item?.value || item?.viewState || item, item?.source);
    });
    (page.viewStates || []).forEach((value) => add(value, page.source || page.origin || "runtime"));
    add(page.viewState, page.source || page.origin || "runtime");
    return mergeStateDetails([], details);
  }

  function mergeStateDetails(current = [], next = []) {
    const byValueSource = new Map();
    [...(current || []), ...(next || [])].forEach((item) => {
      const value = normalizeViewState(item?.value || item?.viewState || item);
      if (!value) {
        return;
      }
      const source = item?.source || "runtime";
      byValueSource.set(`${value}::${source}`, { value, source });
    });
    return Array.from(byValueSource.values());
  }

  function addStateToPage(pages, sourcePath, targetState, source) {
    const page = findPageForSourcePath(pages, sourcePath);
    if (!page) {
      return;
    }
    const states = [targetState.viewState, targetState.query, targetState.hash ? `#${targetState.hash}` : ""].filter(Boolean);
    page.viewStateDetails = mergeStateDetails(page.viewStateDetails, states.map((value) => ({ value, source })));
    page.viewStates = unique(page.viewStateDetails.map((item) => item.value));
  }

  window.TBalanceSiteMap = {
    VERSION,
    normalizeSourcePath,
    normalizeViewState,
    isPlaceholderSourcePath,
    suggestPageId,
    splitHref,
    scanHtml,
    buildGraph,
  };
})();
