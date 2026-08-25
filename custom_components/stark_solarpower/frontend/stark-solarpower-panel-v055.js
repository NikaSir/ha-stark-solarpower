import "./stark-solarpower-panel-v054.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.5";
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;

function clampScale(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, number));
}

function touchDistance(first, second) {
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function touchMidpoint(first, second, viewport) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: (first.clientX + second.clientX) / 2 - rect.left,
    y: (first.clientY + second.clientY) / 2 - rect.top,
  };
}

if (Panel && !Panel.prototype.__starkUiV055) {
  Panel.prototype.__starkUiV055 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._removeZoomShellsV055 = function () {
    const app = this.shadowRoot?.querySelector("main.app");
    if (!app) return;

    // UI 0.5.4 could wrap an already-rendered work viewport again when an
    // optimized HA state update skipped the base innerHTML replacement.
    // Unwrap from the deepest viewport outward and rebuild exactly one shell.
    const wrappers = Array.from(
      app.querySelectorAll(".zoom-viewport-v054, .zoom-viewport-v055")
    ).reverse();

    wrappers.forEach((viewport) => {
      const content = viewport.querySelector(
        ":scope > .zoom-content-v054, :scope > .zoom-content-v055"
      );
      if (content) {
        while (content.firstChild) viewport.before(content.firstChild);
      }
      viewport.remove();
    });

    app.querySelectorAll(".zoom-toolbar-v054").forEach((toolbar) => toolbar.remove());
  };

  Panel.prototype._installPinchViewportV055 = function () {
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const selector = app?.querySelector(":scope > .global-device-context");
    const nav = app?.querySelector(":scope > .tabs.bottom-nav, :scope > .tabs");
    if (!root || !app || !header || !nav) return;

    const viewport = document.createElement("section");
    viewport.className = "zoom-viewport-v055";
    viewport.setAttribute("aria-label", "Рабочая область Stark SolarPower. Масштабирование двумя пальцами");
    const content = document.createElement("div");
    content.className = "zoom-content-v055";
    viewport.append(content);

    const excluded = new Set([header, selector, nav]);
    Array.from(app.children).forEach((child) => {
      if (!excluded.has(child)) content.append(child);
    });

    const anchor = selector || header;
    anchor.insertAdjacentElement("afterend", viewport);
    app.append(nav);

    const initialScale = clampScale(this._loadZoomV054?.() || this.__starkZoomV054 || 1);
    this.__starkZoomV054 = initialScale;
    content.style.zoom = String(initialScale);

    let pinch = null;
    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const midpoint = touchMidpoint(first, second, viewport);
      const scale = clampScale(this.__starkZoomV054 || 1);
      pinch = {
        distance: Math.max(1, touchDistance(first, second)),
        scale,
        contentX: (viewport.scrollLeft + midpoint.x) / scale,
        contentY: (viewport.scrollTop + midpoint.y) / scale,
      };
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchmove", (event) => {
      if (!pinch || event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const midpoint = touchMidpoint(first, second, viewport);
      const scale = clampScale(pinch.scale * touchDistance(first, second) / pinch.distance);
      this.__starkZoomV054 = scale;
      content.style.zoom = String(scale);
      viewport.scrollLeft = Math.max(0, pinch.contentX * scale - midpoint.x);
      viewport.scrollTop = Math.max(0, pinch.contentY * scale - midpoint.y);
      event.preventDefault();
    }, { passive: false });

    const finishPinch = () => {
      if (!pinch) return;
      pinch = null;
      this._storeZoomV054?.();
    };
    viewport.addEventListener("touchend", finishPinch, { passive: true });
    viewport.addEventListener("touchcancel", finishPinch, { passive: true });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    this._removeZoomShellsV055();
    this._installPinchViewportV055();

    if (!root.querySelector("style[data-stark-ui-v055]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV055 = "true";
      style.textContent = `
        /* UI 0.5.5: gesture-only zoom, exactly one work viewport. */
        .zoom-toolbar-v054 { display:none !important; }
        .zoom-viewport-v055 {
          width:100%;
          max-width:100%;
          min-height:180px;
          max-height:calc(100dvh - 188px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          overflow:auto;
          overscroll-behavior:contain;
          touch-action:pan-x pan-y;
          -webkit-overflow-scrolling:touch;
        }
        .zoom-content-v055 {
          width:100%;
          min-width:100%;
          transform-origin:0 0;
        }
        .zoom-content-v055 > :last-child { margin-bottom:8px; }

        @media (max-width:430px) {
          .zoom-viewport-v055 {
            max-height:calc(100dvh - 180px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          }
        }
        @media (min-width:760px) {
          .zoom-viewport-v055 { max-height:calc(100dvh - 188px); }
        }
      `;
      root.append(style);
    }
  };
}
