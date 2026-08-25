import "./stark-solarpower-panel-v056.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.7";
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;
const SNAP_MIN = 0.97;
const SNAP_MAX = 1.03;
const DOUBLE_TAP_DELAY_MS = 360;
const TAP_DURATION_MS = 280;
const TAP_MOVE_PX = 14;

function clampScale(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, number));
}

function distance(first, second) {
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function clientMidpoint(first, second) {
  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
}

function viewportMidpoint(first, second, viewport) {
  const point = clientMidpoint(first, second);
  const rect = viewport.getBoundingClientRect();
  return { x: point.x - rect.left, y: point.y - rect.top };
}

function pointDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

if (Panel && !Panel.prototype.__starkUiV057) {
  Panel.prototype.__starkUiV057 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._removeZoomShellsV057 = function () {
    this.__starkCanvasResizeObserverV057?.disconnect();
    this.__starkCanvasResizeObserverV057 = null;
    window.cancelAnimationFrame(this.__starkCanvasFrameV057);

    const app = this.shadowRoot?.querySelector("main.app");
    if (!app) return;

    const wrappers = Array.from(
      app.querySelectorAll(".zoom-viewport-v054, .zoom-viewport-v055, .zoom-viewport-v057")
    ).reverse();

    wrappers.forEach((viewport) => {
      const content = viewport.classList.contains("zoom-viewport-v057")
        ? viewport.querySelector(":scope > .zoom-stage-v057 > .zoom-content-v057")
        : viewport.querySelector(":scope > .zoom-content-v054, :scope > .zoom-content-v055");
      if (content) {
        while (content.firstChild) viewport.before(content.firstChild);
      }
      viewport.remove();
    });

    app.querySelectorAll(".zoom-toolbar-v054").forEach((toolbar) => toolbar.remove());
  };

  Panel.prototype._installFixedCanvasV057 = function () {
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const selector = app?.querySelector(":scope > .global-device-context");
    const nav = app?.querySelector(":scope > .tabs.bottom-nav, :scope > .tabs");
    if (!root || !app || !header || !nav) return;

    const viewport = document.createElement("section");
    viewport.className = "zoom-viewport-v057";
    viewport.setAttribute("aria-label", "Единая масштабируемая рабочая область Stark SolarPower");

    const stage = document.createElement("div");
    stage.className = "zoom-stage-v057";
    const content = document.createElement("div");
    content.className = "zoom-content-v057";
    stage.append(content);
    viewport.append(stage);

    const excluded = new Set([header, selector, nav]);
    Array.from(app.children).forEach((child) => {
      if (!excluded.has(child)) content.append(child);
    });

    const anchor = selector || header;
    anchor.insertAdjacentElement("afterend", viewport);
    app.append(nav);

    let scale = clampScale(this._loadZoomV054?.() || this.__starkZoomV054 || 1);
    let baseWidth = Math.max(1, viewport.clientWidth || viewport.getBoundingClientRect().width);
    let baseHeight = 1;

    const horizontalOffset = (targetScale = scale) => Math.max(0, (baseWidth - baseWidth * targetScale) / 2);

    const measureBase = () => {
      const nextWidth = Math.max(1, viewport.clientWidth || viewport.getBoundingClientRect().width);
      if (Math.abs(nextWidth - baseWidth) > 0.5) {
        baseWidth = nextWidth;
        content.style.width = `${baseWidth}px`;
      }
      baseHeight = Math.max(1, content.scrollHeight);
    };

    const applyGeometry = (remeasure = false) => {
      if (remeasure) measureBase();
      const offset = horizontalOffset();
      stage.style.width = `${Math.max(baseWidth, baseWidth * scale)}px`;
      stage.style.height = `${Math.max(1, baseHeight * scale)}px`;
      content.style.left = `${offset}px`;
      content.style.transform = `scale(${scale})`;
      this.__starkZoomV054 = scale;
    };

    const setScaleAtPoint = (nextScale, point, persist = false) => {
      const previousScale = scale;
      const previousOffset = horizontalOffset(previousScale);
      const focal = point || { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
      const contentX = (viewport.scrollLeft + focal.x - previousOffset) / previousScale;
      const contentY = (viewport.scrollTop + focal.y) / previousScale;

      scale = clampScale(nextScale);
      applyGeometry(false);
      const nextOffset = horizontalOffset(scale);
      viewport.scrollLeft = Math.max(0, contentX * scale + nextOffset - focal.x);
      viewport.scrollTop = Math.max(0, contentY * scale - focal.y);
      if (persist) this._storeZoomV054?.();
    };

    const resetScale = (notify = true) => {
      scale = 1;
      applyGeometry(false);
      this.__starkZoomV054 = 1;
      this._storeZoomV054?.();
      viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      if (notify) this._showZoomResetV056?.(viewport);
    };

    content.style.width = `${baseWidth}px`;
    content.style.zoom = "";
    measureBase();
    applyGeometry(false);

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(this.__starkCanvasFrameV057);
      this.__starkCanvasFrameV057 = window.requestAnimationFrame(() => {
        const previousWidth = baseWidth;
        measureBase();
        applyGeometry(false);
        if (Math.abs(previousWidth - baseWidth) > 0.5) {
          viewport.scrollLeft = 0;
          viewport.scrollTop = 0;
        }
      });
    };

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(scheduleMeasure);
      observer.observe(viewport);
      observer.observe(content);
      this.__starkCanvasResizeObserverV057 = observer;
    } else {
      window.requestAnimationFrame(scheduleMeasure);
    }

    let pinch = null;
    let tapGesture = null;

    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const point = viewportMidpoint(first, second, viewport);
      pinch = {
        distance: Math.max(1, distance(first, second)),
        scale,
        point,
      };
      tapGesture = {
        startedAt: performance.now(),
        midpoint: clientMidpoint(first, second),
        distance: distance(first, second),
        moved: false,
      };
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchmove", (event) => {
      if (!pinch || event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const point = viewportMidpoint(first, second, viewport);
      const currentDistance = distance(first, second);
      const nextScale = pinch.scale * currentDistance / pinch.distance;
      setScaleAtPoint(nextScale, point, false);

      if (
        tapGesture &&
        (pointDistance(tapGesture.midpoint, clientMidpoint(first, second)) > TAP_MOVE_PX ||
          Math.abs(currentDistance - tapGesture.distance) > TAP_MOVE_PX)
      ) {
        tapGesture.moved = true;
      }
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchend", (event) => {
      if (event.touches.length !== 0 || (!pinch && !tapGesture)) return;
      const completedTap = tapGesture;
      pinch = null;
      tapGesture = null;
      const now = performance.now();

      if (scale >= SNAP_MIN && scale <= SNAP_MAX && scale !== 1) {
        resetScale(true);
      } else {
        this.__starkZoomV054 = scale;
        this._storeZoomV054?.();
      }

      const isTwoFingerTap = completedTap &&
        !completedTap.moved &&
        now - completedTap.startedAt <= TAP_DURATION_MS;
      if (!isTwoFingerTap) {
        this.__starkLastTwoFingerTapV057 = null;
        return;
      }

      const previousTap = this.__starkLastTwoFingerTapV057;
      if (
        previousTap &&
        now - previousTap.at <= DOUBLE_TAP_DELAY_MS &&
        pointDistance(previousTap.midpoint, completedTap.midpoint) <= 48
      ) {
        this.__starkLastTwoFingerTapV057 = null;
        resetScale(true);
        return;
      }
      this.__starkLastTwoFingerTapV057 = { at: now, midpoint: completedTap.midpoint };
    }, { passive: true });

    viewport.addEventListener("touchcancel", () => {
      pinch = null;
      tapGesture = null;
      this.__starkLastTwoFingerTapV057 = null;
    }, { passive: true });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v057]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV057 = "true";
      style.textContent = `
        /* UI 0.5.7: one fixed-layout canvas scaled as a single live image. */
        .zoom-viewport-v057 {
          position:relative;
          width:100%;
          max-width:100%;
          min-height:180px;
          max-height:calc(100dvh - 188px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          overflow:auto;
          overscroll-behavior:contain;
          touch-action:pan-x pan-y;
          -webkit-overflow-scrolling:touch;
        }
        .zoom-stage-v057 {
          position:relative;
          min-width:1px;
          min-height:1px;
          overflow:visible;
        }
        .zoom-content-v057 {
          position:absolute;
          top:0;
          width:100%;
          min-width:0;
          transform-origin:0 0;
          will-change:transform;
          contain:layout style;
        }
        .zoom-content-v057 > :last-child { margin-bottom:8px; }

        @media (max-width:430px) {
          .zoom-viewport-v057 {
            max-height:calc(100dvh - 180px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          }
        }
        @media (min-width:760px) {
          .zoom-viewport-v057 { max-height:calc(100dvh - 188px); }
        }
      `;
      root.append(style);
    }

    this._removeZoomShellsV057();
    this._installFixedCanvasV057();
  };
}
