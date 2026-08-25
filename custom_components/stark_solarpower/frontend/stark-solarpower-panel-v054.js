import "./stark-solarpower-panel-v053.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.4";
const PARENT_ROUTE = "/dashboard-infrastructure/overview";
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;

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

if (Panel && !Panel.prototype.__starkUiV054) {
  Panel.prototype.__starkUiV054 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._zoomStorageKeyV054 = function () {
    const deviceId = this._selectedUpsId?.() || this._diagnosticDeviceId || this._devices?.[0]?.id || "default";
    return `nikas:specialized-panel:stark-solarpower:zoom:${deviceId}`;
  };

  Panel.prototype._loadZoomV054 = function () {
    const key = this._zoomStorageKeyV054();
    if (this.__starkZoomKeyV054 === key && Number.isFinite(this.__starkZoomV054)) {
      return clampScale(this.__starkZoomV054);
    }
    this.__starkZoomKeyV054 = key;
    try {
      this.__starkZoomV054 = clampScale(window.localStorage.getItem(key) || 1);
    } catch (_error) {
      this.__starkZoomV054 = 1;
    }
    return this.__starkZoomV054;
  };

  Panel.prototype._storeZoomV054 = function () {
    try {
      window.localStorage.setItem(this._zoomStorageKeyV054(), String(clampScale(this.__starkZoomV054)));
    } catch (_error) {
      // Private browsing/storage policy must never make the panel unusable.
    }
  };

  Panel.prototype._installBackV054 = function () {
    const root = this.shadowRoot;
    const oldControl = root?.querySelector(".app-header .back, .app-header .menu-trigger-v041");
    if (!root || !oldControl) return;

    const back = oldControl.cloneNode(true);
    back.classList.remove("menu-trigger-v041");
    back.classList.add("back", "shell-back-v054");
    back.setAttribute("aria-label", "Назад к инфраструктуре");
    back.setAttribute("title", "Назад к инфраструктуре");
    back.removeAttribute("aria-expanded");
    back.innerHTML = '<ha-icon icon="mdi:arrow-left"></ha-icon>';
    oldControl.replaceWith(back);
    back.addEventListener("click", () => {
      this._menuOpen = false;
      if (typeof this._navigateTo === "function") this._navigateTo(PARENT_ROUTE);
      else {
        window.history.pushState(null, "", PARENT_ROUTE);
        window.dispatchEvent(new Event("location-changed"));
      }
    });

    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
  };

  Panel.prototype._installZoomV054 = function () {
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const selector = app?.querySelector(":scope > .global-device-context");
    const nav = app?.querySelector(":scope > .tabs.bottom-nav, :scope > .tabs");
    if (!root || !app || !header || !nav) return;

    const toolbar = document.createElement("div");
    toolbar.className = "zoom-toolbar-v054";
    toolbar.setAttribute("aria-label", "Масштаб рабочей области");
    toolbar.innerHTML = `
      <span class="zoom-label-v054">Масштаб</span>
      <div class="zoom-controls-v054">
        <button type="button" data-zoom-out aria-label="Уменьшить масштаб">−</button>
        <button type="button" class="zoom-value-v054" data-zoom-reset aria-label="Сбросить масштаб до 100%">100%</button>
        <button type="button" data-zoom-in aria-label="Увеличить масштаб">+</button>
      </div>`;

    const viewport = document.createElement("section");
    viewport.className = "zoom-viewport-v054";
    viewport.setAttribute("aria-label", "Рабочая область Stark SolarPower");
    const content = document.createElement("div");
    content.className = "zoom-content-v054";
    viewport.append(content);

    const excluded = new Set([header, selector, nav]);
    Array.from(app.children).forEach((child) => {
      if (!excluded.has(child)) content.append(child);
    });

    const anchor = selector || header;
    anchor.insertAdjacentElement("afterend", toolbar);
    toolbar.insertAdjacentElement("afterend", viewport);
    app.append(nav);

    const value = toolbar.querySelector(".zoom-value-v054");
    const applyScale = (nextScale, focalPoint = null, persist = false) => {
      const previousScale = clampScale(this.__starkZoomV054 || 1);
      const scale = clampScale(nextScale);
      const point = focalPoint || {
        x: viewport.clientWidth / 2,
        y: viewport.clientHeight / 2,
      };
      const contentX = (viewport.scrollLeft + point.x) / previousScale;
      const contentY = (viewport.scrollTop + point.y) / previousScale;

      this.__starkZoomV054 = scale;
      content.style.zoom = String(scale);
      value.textContent = `${Math.round(scale * 100)}%`;
      value.setAttribute("aria-label", `Масштаб ${Math.round(scale * 100)}%. Сбросить до 100%`);

      requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, contentX * scale - point.x);
        viewport.scrollTop = Math.max(0, contentY * scale - point.y);
      });
      if (persist) this._storeZoomV054();
    };

    applyScale(this._loadZoomV054());

    toolbar.querySelector("[data-zoom-out]")?.addEventListener("click", () => {
      applyScale(this.__starkZoomV054 - SCALE_STEP, null, true);
    });
    toolbar.querySelector("[data-zoom-in]")?.addEventListener("click", () => {
      applyScale(this.__starkZoomV054 + SCALE_STEP, null, true);
    });
    toolbar.querySelector("[data-zoom-reset]")?.addEventListener("click", () => {
      applyScale(1, { x: 0, y: 0 }, true);
    });

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
      value.textContent = `${Math.round(scale * 100)}%`;
      viewport.scrollLeft = Math.max(0, pinch.contentX * scale - midpoint.x);
      viewport.scrollTop = Math.max(0, pinch.contentY * scale - midpoint.y);
      event.preventDefault();
    }, { passive: false });

    const finishPinch = () => {
      if (!pinch) return;
      pinch = null;
      this._storeZoomV054();
      value.setAttribute("aria-label", `Масштаб ${Math.round(this.__starkZoomV054 * 100)}%. Сбросить до 100%`);
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

    this._installBackV054();
    this._installZoomV054();

    if (!root.querySelector("style[data-stark-ui-v054]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV054 = "true";
      style.textContent = `
        /* Shared specialized-panel shell: native chrome around one zoomable work viewport. */
        .app-header { padding-top:5px !important; }
        .shell-back-v054 { color:var(--primary-text-color) !important; }
        .zoom-toolbar-v054 {
          width:min(100%,820px);
          min-height:44px;
          margin:0 auto 8px;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:10px;
          color:var(--secondary-text-color);
        }
        .zoom-label-v054 { font-size:12px; font-weight:700; letter-spacing:.02em; }
        .zoom-controls-v054 {
          display:grid;
          grid-template-columns:44px 66px 44px;
          min-height:44px;
          overflow:hidden;
          border:1px solid var(--divider-color);
          border-radius:15px;
          background:var(--card-background-color);
          box-shadow:0 4px 14px rgba(23,45,76,.06);
        }
        .zoom-controls-v054 button {
          min-width:44px;
          min-height:44px;
          padding:0;
          border:0;
          border-right:1px solid var(--divider-color);
          border-radius:0;
          background:transparent;
          color:var(--primary-text-color);
          font:inherit;
          font-size:22px;
          font-weight:700;
          line-height:1;
          -webkit-tap-highlight-color:transparent;
        }
        .zoom-controls-v054 button:last-child { border-right:0; }
        .zoom-controls-v054 button:active { background:var(--stark-ice); }
        .zoom-controls-v054 .zoom-value-v054 {
          color:var(--primary-color);
          font-size:13px;
          font-variant-numeric:tabular-nums;
        }
        .zoom-viewport-v054 {
          width:100%;
          max-width:100%;
          min-height:180px;
          max-height:calc(100dvh - 242px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          overflow:auto;
          overscroll-behavior:contain;
          touch-action:pan-x pan-y;
          -webkit-overflow-scrolling:touch;
        }
        .zoom-content-v054 {
          width:100%;
          min-width:100%;
          transform-origin:0 0;
        }
        .zoom-content-v054 > :last-child { margin-bottom:8px; }

        @media (max-width:430px) {
          .zoom-toolbar-v054 { min-height:40px; margin-bottom:7px; }
          .zoom-label-v054 { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
          .zoom-controls-v054 { grid-template-columns:42px 62px 42px; min-height:42px; }
          .zoom-controls-v054 button { min-width:42px; min-height:42px; }
          .zoom-viewport-v054 {
            max-height:calc(100dvh - 228px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          }
        }
        @media (min-width:760px) {
          .zoom-viewport-v054 { max-height:calc(100dvh - 238px); }
        }
      `;
      root.append(style);
    }
  };
}
