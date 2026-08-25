import "./stark-solarpower-panel-v057.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.8";
const PAN_THRESHOLD_PX = 5;
const GESTURE_GUARD_MS = 700;

function cancelEntityHold(target) {
  const entity = target?.closest?.("[data-entity]");
  if (!entity) return;
  const event = typeof PointerEvent === "function"
    ? new PointerEvent("pointercancel", { bubbles: true, composed: true })
    : new Event("pointercancel", { bubbles: true, composed: true });
  entity.dispatchEvent(event);
}

if (Panel && !Panel.prototype.__starkUiV058) {
  Panel.prototype.__starkUiV058 = true;

  const previousRender = Panel.prototype._render;
  const previousShowMoreInfo = Panel.prototype._showMoreInfo;

  Panel.prototype._showMoreInfo = function (entityId) {
    const guardedUntil = Number(this.__starkGestureGuardUntilV058 || 0);
    if (guardedUntil === Number.POSITIVE_INFINITY || performance.now() < guardedUntil) return;
    previousShowMoreInfo.call(this, entityId);
  };

  Panel.prototype._installCanvasPanV058 = function () {
    const root = this.shadowRoot;
    const viewport = root?.querySelector(".zoom-viewport-v057");
    if (!root || !viewport || viewport.dataset.starkPanV058 === "true") return;
    viewport.dataset.starkPanV058 = "true";

    let pan = null;
    let multiTouchActive = false;

    const beginPan = (touch, target) => {
      pan = {
        x: touch.clientX,
        y: touch.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        target,
        moved: false,
      };
    };

    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length >= 2) {
        multiTouchActive = true;
        pan = null;
        this.__starkGestureGuardUntilV058 = Number.POSITIVE_INFINITY;
        Array.from(event.touches).forEach((touch) => {
          const target = root.elementFromPoint?.(touch.clientX, touch.clientY) ||
            document.elementFromPoint(touch.clientX, touch.clientY);
          cancelEntityHold(target);
        });
        return;
      }
      if (event.touches.length === 1 && !multiTouchActive) {
        beginPan(event.touches[0], event.target);
      }
    }, { passive: true });

    viewport.addEventListener("touchmove", (event) => {
      if (event.touches.length >= 2) {
        multiTouchActive = true;
        pan = null;
        this.__starkGestureGuardUntilV058 = Number.POSITIVE_INFINITY;
        return;
      }
      if (!pan || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const dx = touch.clientX - pan.x;
      const dy = touch.clientY - pan.y;
      if (!pan.moved && Math.hypot(dx, dy) < PAN_THRESHOLD_PX) return;

      if (!pan.moved) {
        pan.moved = true;
        this.__starkGestureGuardUntilV058 = Number.POSITIVE_INFINITY;
        cancelEntityHold(pan.target);
      }

      viewport.scrollLeft = pan.scrollLeft - dx;
      viewport.scrollTop = pan.scrollTop - dy;
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchend", (event) => {
      if (multiTouchActive) {
        if (event.touches.length === 1) {
          beginPan(event.touches[0], event.target);
          return;
        }
        if (event.touches.length === 0) {
          multiTouchActive = false;
          pan = null;
          this.__starkGestureGuardUntilV058 = performance.now() + GESTURE_GUARD_MS;
        }
        return;
      }

      if (event.touches.length === 0 && pan) {
        if (pan.moved) {
          this.__starkGestureGuardUntilV058 = performance.now() + GESTURE_GUARD_MS;
        }
        pan = null;
      }
    }, { passive: true });

    viewport.addEventListener("touchcancel", () => {
      multiTouchActive = false;
      pan = null;
      this.__starkGestureGuardUntilV058 = performance.now() + GESTURE_GUARD_MS;
    }, { passive: true });

    viewport.addEventListener("click", (event) => {
      const guardedUntil = Number(this.__starkGestureGuardUntilV058 || 0);
      if (guardedUntil === Number.POSITIVE_INFINITY || performance.now() < guardedUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, { capture: true });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v058]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV058 = "true";
      style.textContent = `
        /* UI 0.5.8: deterministic one-finger canvas pan and gesture guards. */
        .zoom-viewport-v057 {
          touch-action:none !important;
          cursor:grab;
        }
        .zoom-viewport-v057:active { cursor:grabbing; }
      `;
      root.append(style);
    }

    this._installCanvasPanV058();
  };
}
