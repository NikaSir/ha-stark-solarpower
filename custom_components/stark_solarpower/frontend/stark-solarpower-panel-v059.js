import "./stark-solarpower-panel-v058.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.9";

function clampScale(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(2, Math.max(0.75, number));
}

function renderedScale(content, fallback = 1) {
  const match = String(content?.style?.transform || "").match(/scale\(([^)]+)\)/);
  return clampScale(match ? match[1] : fallback);
}

if (Panel && !Panel.prototype.__starkUiV059) {
  Panel.prototype.__starkUiV059 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._canvasViewKeyV059 = function () {
    return this._selectedUpsId?.() || this._diagnosticDeviceId || this._devices?.[0]?.id || "default";
  };

  Panel.prototype._captureCanvasViewV059 = function (viewport) {
    const content = viewport?.querySelector(":scope > .zoom-stage-v057 > .zoom-content-v057");
    if (!viewport || !content) return null;

    const scale = renderedScale(content, this.__starkZoomV054 || 1);
    const offset = Number.parseFloat(content.style.left || "0") || 0;
    const focalX = viewport.clientWidth / 2;
    const focalY = viewport.clientHeight / 2;
    const state = {
      scale,
      contentX: (viewport.scrollLeft + focalX - offset) / scale,
      contentY: (viewport.scrollTop + focalY) / scale,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };

    const key = viewport.dataset.starkViewKeyV059 || this._canvasViewKeyV059();
    this.__starkCanvasViewsV059 ||= new Map();
    this.__starkCanvasViewsV059.set(key, state);
    return state;
  };

  Panel.prototype._restoreCanvasViewV059 = function (viewport, state) {
    const content = viewport?.querySelector(":scope > .zoom-stage-v057 > .zoom-content-v057");
    if (!viewport || !content || !state) return;

    const scale = renderedScale(content, state.scale);
    const offset = Number.parseFloat(content.style.left || "0") || 0;
    const focalX = viewport.clientWidth / 2;
    const focalY = viewport.clientHeight / 2;
    const left = state.contentX * scale + offset - focalX;
    const top = state.contentY * scale - focalY;

    viewport.scrollLeft = Math.max(0, Number.isFinite(left) ? left : state.scrollLeft || 0);
    viewport.scrollTop = Math.max(0, Number.isFinite(top) ? top : state.scrollTop || 0);
  };

  Panel.prototype._render = function () {
    const oldViewport = this.shadowRoot?.querySelector(".zoom-viewport-v057");
    if (oldViewport) this._captureCanvasViewV059(oldViewport);

    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    const viewport = root.querySelector(".zoom-viewport-v057");
    if (!viewport) return;

    const key = this._canvasViewKeyV059();
    viewport.dataset.starkViewKeyV059 = key;

    // A telemetry update may legitimately rebuild the live DOM. Restore the
    // same logical point after the replacement canvas has measured its stage.
    if (oldViewport && oldViewport !== viewport) {
      const state = this.__starkCanvasViewsV059?.get(key);
      if (!state) return;

      this._restoreCanvasViewV059(viewport, state);
      window.requestAnimationFrame(() => {
        this._restoreCanvasViewV059(viewport, state);
        window.requestAnimationFrame(() => this._restoreCanvasViewV059(viewport, state));
      });
    }
  };
}
