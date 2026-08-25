import "./stark-solarpower-panel-v059.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.0";
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;
const SNAP_MIN = 0.97;
const SNAP_MAX = 1.03;
const PAN_THRESHOLD_PX = 5;
const GESTURE_GUARD_MS = 700;
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

function midpoint(first, second, viewport = null) {
  const point = {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
  if (!viewport) return point;
  const rect = viewport.getBoundingClientRect();
  return { x: point.x - rect.left, y: point.y - rect.top };
}

function pointDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function cancelEntityHold(target) {
  const entity = target?.closest?.("[data-entity]");
  if (!entity) return;
  const event = typeof PointerEvent === "function"
    ? new PointerEvent("pointercancel", { bubbles: true, composed: true })
    : new Event("pointercancel", { bubbles: true, composed: true });
  entity.dispatchEvent(event);
}

if (Panel && !Panel.prototype.__starkUiV060) {
  Panel.prototype.__starkUiV060 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._canvasStateKeyV060 = function () {
    return this._selectedUpsId?.() || this._diagnosticDeviceId || this._devices?.[0]?.id || "default";
  };

  Panel.prototype._rememberCanvasStateV060 = function (key, state) {
    this.__starkCanvasStatesV060 ||= new Map();
    this.__starkCanvasStatesV060.set(key, { ...state });
  };

  Panel.prototype._installTransformPanV060 = function (sourceViewport) {
    const root = this.shadowRoot;
    const oldStage = sourceViewport?.querySelector(":scope > .zoom-stage-v057");
    const content = oldStage?.querySelector(":scope > .zoom-content-v057");
    if (!root || !sourceViewport || !oldStage || !content) return null;

    // Detach every anonymous listener from the scroll-based engines while
    // retaining the live work DOM. Future compatibility layers see the same
    // historical class but skip installing their pan handler via the marker.
    this.__starkCanvasResizeObserverV057?.disconnect();
    this.__starkCanvasResizeObserverV057 = null;
    this.__starkCanvasResizeCleanupV057?.();
    this.__starkCanvasResizeCleanupV057 = null;
    window.cancelAnimationFrame(this.__starkCanvasFrameV057);

    this.__starkCanvasResizeObserverV060?.disconnect();
    this.__starkCanvasResizeObserverV060 = null;
    this.__starkCanvasResizeCleanupV060?.();
    this.__starkCanvasResizeCleanupV060 = null;

    const viewport = sourceViewport.cloneNode(false);
    viewport.className = "zoom-viewport-v057 zoom-viewport-v060";
    viewport.dataset.starkPanV058 = "true";
    viewport.dataset.starkTransformPanV060 = "true";
    viewport.setAttribute("aria-label", "Единая масштабируемая и перемещаемая рабочая область Stark SolarPower");

    const stage = oldStage.cloneNode(false);
    stage.className = "zoom-stage-v057 zoom-stage-v060";
    stage.append(content);
    viewport.append(stage);
    sourceViewport.replaceWith(viewport);

    const key = this._canvasStateKeyV060();
    viewport.dataset.starkStateKeyV060 = key;
    const stored = this.__starkCanvasStatesV060?.get(key);
    const state = {
      scale: clampScale(stored?.scale ?? this._loadZoomV054?.() ?? this.__starkZoomV054 ?? 1),
      x: Number.isFinite(stored?.x) ? stored.x : 0,
      y: Number.isFinite(stored?.y) ? stored.y : 0,
    };

    let baseWidth = 1;
    let baseHeight = 1;

    const measure = () => {
      baseWidth = Math.max(1, viewport.clientWidth || viewport.getBoundingClientRect().width);
      content.style.width = `${baseWidth}px`;
      baseHeight = Math.max(1, content.scrollHeight, content.getBoundingClientRect().height / state.scale);
    };

    const clampPosition = () => {
      const viewportWidth = Math.max(1, viewport.clientWidth);
      const viewportHeight = Math.max(1, viewport.clientHeight);
      const scaledWidth = baseWidth * state.scale;
      const scaledHeight = baseHeight * state.scale;

      if (scaledWidth <= viewportWidth) state.x = (viewportWidth - scaledWidth) / 2;
      else state.x = Math.min(0, Math.max(viewportWidth - scaledWidth, state.x));

      if (scaledHeight <= viewportHeight) state.y = 0;
      else state.y = Math.min(0, Math.max(viewportHeight - scaledHeight, state.y));
    };

    const apply = (remeasure = false) => {
      if (remeasure) measure();
      clampPosition();
      stage.style.width = `${Math.max(baseWidth, viewport.clientWidth)}px`;
      stage.style.height = `${Math.max(baseHeight, viewport.clientHeight)}px`;
      content.style.left = "0px";
      content.style.transform = `translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
      this.__starkZoomV054 = state.scale;
      this._rememberCanvasStateV060(key, state);
    };

    const persist = () => {
      this.__starkZoomV054 = state.scale;
      this._storeZoomV054?.();
      this._rememberCanvasStateV060(key, state);
    };

    const reset = (notify = true) => {
      state.scale = 1;
      state.x = 0;
      state.y = 0;
      apply(false);
      persist();
      if (notify) this._showZoomResetV056?.(viewport);
    };

    content.style.zoom = "";
    content.style.transformOrigin = "0 0";
    measure();
    apply(false);

    let pan = null;
    let pinch = null;
    let tapGesture = null;
    let multiTouchActive = false;

    const beginPan = (touch, target) => {
      pan = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        x: state.x,
        y: state.y,
        target,
        moved: false,
      };
    };

    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length >= 2) {
        const [first, second] = event.touches;
        const point = midpoint(first, second, viewport);
        multiTouchActive = true;
        pan = null;
        pinch = {
          distance: Math.max(1, distance(first, second)),
          scale: state.scale,
          contentX: (point.x - state.x) / state.scale,
          contentY: (point.y - state.y) / state.scale,
        };
        tapGesture = {
          startedAt: performance.now(),
          midpoint: midpoint(first, second),
          distance: distance(first, second),
          moved: false,
        };
        this.__starkGestureGuardUntilV058 = Number.POSITIVE_INFINITY;
        Array.from(event.touches).forEach((touch) => {
          const target = root.elementFromPoint?.(touch.clientX, touch.clientY) ||
            document.elementFromPoint(touch.clientX, touch.clientY);
          cancelEntityHold(target);
        });
        event.preventDefault();
        return;
      }

      if (event.touches.length === 1 && !multiTouchActive) {
        beginPan(event.touches[0], event.target);
      }
    }, { passive: false });

    viewport.addEventListener("touchmove", (event) => {
      if (event.touches.length >= 2 && pinch) {
        const [first, second] = event.touches;
        const point = midpoint(first, second, viewport);
        const currentDistance = distance(first, second);
        state.scale = clampScale(pinch.scale * currentDistance / pinch.distance);
        state.x = point.x - pinch.contentX * state.scale;
        state.y = point.y - pinch.contentY * state.scale;
        apply(false);

        if (
          tapGesture &&
          (pointDistance(tapGesture.midpoint, midpoint(first, second)) > TAP_MOVE_PX ||
            Math.abs(currentDistance - tapGesture.distance) > TAP_MOVE_PX)
        ) {
          tapGesture.moved = true;
        }
        event.preventDefault();
        return;
      }

      if (!pan || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - pan.clientX;
      const dy = touch.clientY - pan.clientY;
      if (!pan.moved && Math.hypot(dx, dy) < PAN_THRESHOLD_PX) return;

      if (!pan.moved) {
        pan.moved = true;
        this.__starkGestureGuardUntilV058 = Number.POSITIVE_INFINITY;
        cancelEntityHold(pan.target);
      }
      state.x = pan.x + dx;
      state.y = pan.y + dy;
      apply(false);
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchend", (event) => {
      if (multiTouchActive && event.touches.length === 1) {
        pinch = null;
        beginPan(event.touches[0], event.target);
        return;
      }

      if (event.touches.length !== 0) return;
      const completedTap = tapGesture;
      const wasMultiTouch = multiTouchActive;
      const panMoved = Boolean(pan?.moved);
      multiTouchActive = false;
      pinch = null;
      tapGesture = null;
      pan = null;

      if (state.scale >= SNAP_MIN && state.scale <= SNAP_MAX && state.scale !== 1) {
        reset(true);
      } else {
        apply(false);
        persist();
      }

      const now = performance.now();
      if (wasMultiTouch) {
        this.__starkGestureGuardUntilV058 = now + GESTURE_GUARD_MS;
        const isTwoFingerTap = completedTap && !completedTap.moved &&
          now - completedTap.startedAt <= TAP_DURATION_MS;
        if (isTwoFingerTap) {
          const previousTap = this.__starkLastTwoFingerTapV060;
          if (
            previousTap && now - previousTap.at <= DOUBLE_TAP_DELAY_MS &&
            pointDistance(previousTap.midpoint, completedTap.midpoint) <= 48
          ) {
            this.__starkLastTwoFingerTapV060 = null;
            reset(true);
          } else {
            this.__starkLastTwoFingerTapV060 = { at: now, midpoint: completedTap.midpoint };
          }
        } else {
          this.__starkLastTwoFingerTapV060 = null;
        }
      } else if (panMoved) {
        this.__starkGestureGuardUntilV058 = now + GESTURE_GUARD_MS;
      }
    }, { passive: true });

    viewport.addEventListener("touchcancel", () => {
      multiTouchActive = false;
      pinch = null;
      tapGesture = null;
      pan = null;
      apply(false);
      persist();
      this.__starkGestureGuardUntilV058 = performance.now() + GESTURE_GUARD_MS;
    }, { passive: true });

    viewport.addEventListener("click", (event) => {
      const guardedUntil = Number(this.__starkGestureGuardUntilV058 || 0);
      if (guardedUntil === Number.POSITIVE_INFINITY || performance.now() < guardedUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, { capture: true });

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => apply(true));
      observer.observe(content);
      this.__starkCanvasResizeObserverV060 = observer;
    }

    const handleResize = () => apply(true);
    window.addEventListener("resize", handleResize, { passive: true });
    window.visualViewport?.addEventListener("resize", handleResize, { passive: true });
    this.__starkCanvasResizeCleanupV060 = () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
    window.requestAnimationFrame(() => apply(true));

    return viewport;
  };

  Panel.prototype._render = function () {
    const oldViewport = this.shadowRoot?.querySelector(".zoom-viewport-v060");
    if (oldViewport) {
      const key = oldViewport.dataset.starkStateKeyV060 || this._canvasStateKeyV060();
      const stored = this.__starkCanvasStatesV060?.get(key);
      if (stored) this._rememberCanvasStateV060(key, stored);
    }

    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;
    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    const viewport = root.querySelector(".zoom-viewport-v057");
    if (!viewport) return;
    if (!viewport.classList.contains("zoom-viewport-v060")) {
      this._installTransformPanV060(viewport);
    }

    if (!root.querySelector("style[data-stark-ui-v060]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV060 = "true";
      style.textContent = `
        /* UI 0.6.0: transform-owned pan; no browser scroll/rubber-band state. */
        .zoom-viewport-v060 {
          position:relative;
          overflow:hidden !important;
          overscroll-behavior:none !important;
          overflow-anchor:none !important;
          touch-action:none !important;
        }
        .zoom-stage-v060 {
          position:relative;
          overflow:hidden !important;
        }
        .zoom-stage-v060 > .zoom-content-v057 {
          position:absolute;
          top:0;
          transform-origin:0 0 !important;
          will-change:transform;
          overflow-anchor:none !important;
        }
      `;
      root.append(style);
    }
  };
}
