import "./stark-solarpower-panel-v055.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.6";
const SNAP_MIN = 0.97;
const SNAP_MAX = 1.03;
const DOUBLE_TAP_DELAY_MS = 360;
const TAP_DURATION_MS = 280;
const TAP_MOVE_PX = 14;

function midpoint(first, second) {
  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
}

function pointDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

if (Panel && !Panel.prototype.__starkUiV056) {
  Panel.prototype.__starkUiV056 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._installSystemMenuV056 = function () {
    const root = this.shadowRoot;
    const oldControl = root?.querySelector(
      ".app-header .shell-back-v054, .app-header .back, .app-header .menu-trigger-v041"
    );
    if (!root || !oldControl) return;

    const menu = oldControl.cloneNode(true);
    menu.classList.remove("shell-back-v054", "back", "menu-trigger-v041");
    menu.classList.add("system-menu-v056");
    menu.setAttribute("aria-label", "Открыть меню Home Assistant");
    menu.setAttribute("title", "Меню Home Assistant");
    menu.removeAttribute("aria-expanded");
    menu.innerHTML = '<ha-icon icon="mdi:menu"></ha-icon>';
    oldControl.replaceWith(menu);

    menu.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("hass-toggle-menu", {
        bubbles: true,
        composed: true,
      }));
    });
  };

  Panel.prototype._showZoomResetV056 = function (viewport) {
    let toast = viewport.querySelector(":scope > .zoom-reset-toast-v056");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "zoom-reset-toast-v056";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      viewport.prepend(toast);
    }
    toast.textContent = "Масштаб 100%";
    toast.classList.remove("visible");
    requestAnimationFrame(() => toast.classList.add("visible"));
    window.clearTimeout(this.__starkZoomToastTimerV056);
    this.__starkZoomToastTimerV056 = window.setTimeout(() => {
      toast?.classList.remove("visible");
    }, 1100);
  };

  Panel.prototype._resetZoomV056 = function (viewport, content, notify = true) {
    this.__starkZoomV054 = 1;
    content.style.zoom = "1";
    viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    this._storeZoomV054?.();
    if (notify) this._showZoomResetV056(viewport);
  };

  Panel.prototype._installZoomResetV056 = function () {
    const viewport = this.shadowRoot?.querySelector(".zoom-viewport-v055");
    const content = viewport?.querySelector(":scope > .zoom-content-v055");
    if (!viewport || !content) return;

    let gesture = null;
    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 2) return;
      const [first, second] = event.touches;
      gesture = {
        startedAt: performance.now(),
        midpoint: midpoint(first, second),
        distance: Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY),
        moved: false,
      };
    }, { passive: true });

    viewport.addEventListener("touchmove", (event) => {
      if (!gesture || event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const currentMidpoint = midpoint(first, second);
      const currentDistance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
      if (
        pointDistance(gesture.midpoint, currentMidpoint) > TAP_MOVE_PX ||
        Math.abs(currentDistance - gesture.distance) > TAP_MOVE_PX
      ) {
        gesture.moved = true;
      }
    }, { passive: true });

    const finishGesture = (event) => {
      if (!gesture || event.touches.length !== 0) return;
      const completed = gesture;
      gesture = null;
      const now = performance.now();
      const scale = Number(this.__starkZoomV054 || 1);

      if (scale >= SNAP_MIN && scale <= SNAP_MAX && scale !== 1) {
        this._resetZoomV056(viewport, content, true);
      }

      const isTwoFingerTap = !completed.moved && now - completed.startedAt <= TAP_DURATION_MS;
      if (!isTwoFingerTap) {
        this.__starkLastTwoFingerTapV056 = null;
        return;
      }

      const previousTap = this.__starkLastTwoFingerTapV056;
      if (
        previousTap &&
        now - previousTap.at <= DOUBLE_TAP_DELAY_MS &&
        pointDistance(previousTap.midpoint, completed.midpoint) <= 48
      ) {
        this.__starkLastTwoFingerTapV056 = null;
        this._resetZoomV056(viewport, content, true);
        return;
      }

      this.__starkLastTwoFingerTapV056 = { at: now, midpoint: completed.midpoint };
    };

    viewport.addEventListener("touchend", finishGesture, { passive: true });
    viewport.addEventListener("touchcancel", () => {
      gesture = null;
      this.__starkLastTwoFingerTapV056 = null;
    }, { passive: true });
  };

  Panel.prototype._strengthenBatteryLineV056 = function () {
    const line = this.shadowRoot?.querySelector(".flow-lines-v051 .line-battery-v051");
    if (!line) return;
    // Continue beneath both endpoint cards so the visible gap never looks
    // disconnected when responsive geometry or user zoom changes.
    line.setAttribute("d", "M50 97 V62");
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    this._installSystemMenuV056();
    this._installZoomResetV056();
    this._strengthenBatteryLineV056();

    if (!root.querySelector("style[data-stark-ui-v056]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV056 = "true";
      style.textContent = `
        /* UI 0.5.6: native HA menu, gesture reset and continuous battery path. */
        .system-menu-v056 {
          grid-column:1 !important;
          justify-self:start !important;
          width:44px !important;
          min-width:44px !important;
          height:44px !important;
          min-height:44px !important;
          display:grid !important;
          place-items:center !important;
          padding:0 !important;
          border:1px solid color-mix(in srgb,var(--divider-color) 72%,transparent) !important;
          border-radius:16px !important;
          background:var(--card-background-color) !important;
          color:var(--primary-text-color) !important;
          box-shadow:0 7px 20px rgba(23,45,76,.08) !important;
        }
        .system-menu-v056 ha-icon { --mdc-icon-size:25px !important; }
        .zoom-viewport-v055 { position:relative; }
        .zoom-reset-toast-v056 {
          position:sticky;
          top:10px;
          z-index:30;
          width:max-content;
          max-width:calc(100% - 24px);
          margin:0 12px -36px auto;
          padding:8px 12px;
          border:1px solid color-mix(in srgb,var(--primary-color) 22%,transparent);
          border-radius:999px;
          background:color-mix(in srgb,var(--card-background-color) 92%,transparent);
          color:var(--primary-color);
          box-shadow:0 5px 18px rgba(23,45,76,.12);
          font-size:13px;
          font-weight:750;
          pointer-events:none;
          opacity:0;
          transform:translateY(-6px);
          transition:opacity .16s ease,transform .16s ease;
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
        }
        .zoom-reset-toast-v056.visible { opacity:1; transform:translateY(0); }
        .flow-lines-v051 path.line-battery-v051 {
          opacity:1 !important;
          stroke-width:2.15 !important;
          filter:drop-shadow(0 0 5px var(--success-color,#2eae55)) drop-shadow(0 0 2px rgba(255,255,255,.95));
        }
        .battery-flow-v051 .flow-lines-v051 path.line-battery-v051 {
          filter:drop-shadow(0 0 5px var(--warning-color,#ed8b00)) drop-shadow(0 0 2px rgba(255,255,255,.95));
        }
      `;
      root.append(style);
    }
  };
}
