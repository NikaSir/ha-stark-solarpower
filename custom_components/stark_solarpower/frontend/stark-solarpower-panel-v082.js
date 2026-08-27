import "./stark-solarpower-panel-v081.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.2";

function gestureGuardActiveV082(panel) {
  const now = performance.now();
  return [panel.__starkGuardUntilV065, panel.__starkGestureGuardUntilV058]
    .map((value) => Number(value || 0))
    .some((guardedUntil) => (
      guardedUntil === Number.POSITIVE_INFINITY || now < guardedUntil
    ));
}

function cancelEntityHoldV082(element) {
  const event = typeof PointerEvent === "function"
    ? new PointerEvent("pointercancel", { bubbles:true, composed:true })
    : new Event("pointercancel", { bubbles:true, composed:true });
  element.dispatchEvent(event);
}

if (Panel && !Panel.prototype.__starkUiV082) {
  Panel.prototype.__starkUiV082 = true;

  const previousShowMoreInfo = Panel.prototype._showMoreInfo;
  const previousRender = Panel.prototype._render;

  // Hold timers call `_showMoreInfo()` directly, so click suppression alone
  // cannot stop them. Keep this guard at the final dispatch boundary shared
  // by the initial legacy view and all lazily cached v0.8 views.
  Panel.prototype._showMoreInfo = function (entityId) {
    if (gestureGuardActiveV082(this)) return;
    previousShowMoreInfo.call(this, entityId);
  };

  Panel.prototype._cancelEntityHoldsV082 = function (scope) {
    scope?.querySelectorAll("[data-entity]").forEach(cancelEntityHoldV082);
  };

  Panel.prototype._installPinchMoreInfoGuardV082 = function () {
    const viewport = this.__starkShellV080?.viewport
      || this.shadowRoot?.querySelector(".zoom-viewport-v065");
    const surface = this.__starkShellV080?.surface
      || viewport?.querySelector(".zoom-surface-v065");
    if (!viewport || !surface || this.__starkGuardViewportV082 === viewport) return;
    this.__starkGuardViewportV082 = viewport;

    // The first finger may already own a 520 ms hold timer when the second
    // finger arrives. Cancel every entity hold in the permanent work surface
    // instead of relying on elementFromPoint across an iOS shadow root.
    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length < 2) return;
      this.__starkGuardUntilV065 = Number.POSITIVE_INFINITY;
      this._cancelEntityHoldsV082(surface);
    }, { capture:true, passive:true });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installPinchMoreInfoGuardV082();
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
