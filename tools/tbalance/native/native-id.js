(function () {
  "use strict";

  const PREFIXES = {
    project: "prj",
    page: "pg",
    layer: "lyr",
    asset: "ast",
    scene: "scn",
    behavior: "bhv",
    datasource: "data",
    build: "bld",
  };

  function createStableId(kind) {
    const prefix = PREFIXES[kind] || sanitizePrefix(kind);
    const random = getRandomToken();
    return `${prefix}_${random}`;
  }

  function sanitizePrefix(value) {
    const prefix = String(value || "id").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return prefix || "id";
  }

  function getRandomToken() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }
    const time = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${time}${random}`;
  }

  function isStableId(value, kind) {
    const prefix = PREFIXES[kind] || sanitizePrefix(kind);
    return new RegExp(`^${prefix}_[a-z0-9]{8,}$`, "i").test(String(value || ""));
  }

  window.TBalanceNativeId = {
    createStableId,
    isStableId,
  };
})();
