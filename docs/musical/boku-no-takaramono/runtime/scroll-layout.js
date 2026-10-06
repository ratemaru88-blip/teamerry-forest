(function () {
  "use strict";

  function frameSize(page, viewport) {
    const size = page[viewport] || page.viewports?.[viewport] || {};
    return {
      width: Number(size.width) || (viewport === "mobile" ? 1080 : 1920),
      height: Number(size.screenHeight) || Number(size.height) || (viewport === "mobile" ? 1920 : 1080),
      count: Number(size.screenCount) || 1,
    };
  }

  function configure(page, viewport, width, height, count) {
    if (![width, height, count].every(Number.isInteger) || width < 1 || width > 12000
      || height < 1 || height > 12000 || count < 1 || count > 20 || height * count > 60000) {
      throw new Error("invalid-scroll-size");
    }
    const size = Object.assign({}, page[viewport], {
      width, height: height * count, screenHeight: height, screenCount: count,
    });
    page[viewport] = size;
    page.viewports = Object.assign({}, page.viewports, { [viewport]: Object.assign({}, size) });
    return size;
  }

  function nextIndex(page, viewport, selectedId, sceneId) {
    let next = 0;
    for (const layer of page.layers || []) {
      if (layer.id === selectedId || layer.type !== "image" || layer.visible === false || layer.visibilityMode === "hidden"
        || (layer.visibilityMode === "mobile" && viewport !== "mobile")
        || (layer.visibilityMode === "desktop" && viewport !== "desktop")) continue;
      const index = layer.scrollFrames?.[viewport];
      if (Number.isInteger(index)) {
        const layout = window.TBalanceNativeScenes.resolveLayerState(layer, viewport, sceneId);
        next = Math.max(next, index + 1, Math.ceil(((layout.y || 0) + (layout.height || 0)) / frameSize(page, viewport).height));
      }
      else if (layer.role === "background") {
        const layout = window.TBalanceNativeScenes.resolveLayerState(layer, viewport, sceneId);
        next = Math.max(next, Math.floor((layout.y || 0) / frameSize(page, viewport).height) + 1);
      }
    }
    return next;
  }

  function fit(frame, natural, index, mode = "contain") {
    const scale = mode === "width" ? frame.width / natural.width
      : Math.min(frame.width / natural.width, frame.height / natural.height);
    const width = Math.round(natural.width * scale);
    const height = Math.round(natural.height * scale);
    return { x: Math.round((frame.width - width) / 2), y: index * frame.height
      + (mode === "width" ? 0 : Math.round((frame.height - height) / 2)), width, height, rotation: 0 };
  }

  function targetY(page, viewport, action) {
    const frame = frameSize(page, viewport);
    const target = action?.scrollTargets?.[viewport] || { screen: 1, offset: 0 };
    const screen = Math.min(frame.count, Math.max(1, Math.round(Number(target.screen) || 1)));
    const offset = Math.min(frame.height - 1, Math.max(0, Number(target.offset) || 0));
    return (screen - 1) * frame.height + offset;
  }

  window.TBalanceScrollLayout = { frameSize, configure, nextIndex, fit, targetY };
})();
