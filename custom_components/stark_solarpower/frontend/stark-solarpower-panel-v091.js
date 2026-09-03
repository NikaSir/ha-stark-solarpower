import "./stark-solarpower-panel-v090.js";

const Panel = customElements.get("stark-solarpower-panel");
const NIKAS_SHELL_BOUNDARY_THRESHOLD_PX = 4;

function shouldBlockNikasShellBoundaryMove({
  deltaX,
  deltaY,
  inViewport,
  scrollTop,
  scrollHeight,
  clientHeight,
}) {
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) <= Math.abs(Number(deltaX) || 0)) return false;
  if (!inViewport) return true;
  const maximumScroll = Math.max(0, (Number(scrollHeight) || 0) - (Number(clientHeight) || 0));
  if (maximumScroll <= 1) return true;
  const currentScroll = Math.max(0, Number(scrollTop) || 0);
  if (deltaY > 0 && currentScroll <= 1) return true;
  return deltaY < 0 && currentScroll >= maximumScroll - 1;
}

function createNikasShellScrollBoundaryGuard({ host, viewport }) {
  if (!host?.addEventListener || !viewport) return () => {};
  let touch = null;

  const eventStartedInViewport = (event) => {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    return path.includes(viewport) || Boolean(viewport.contains?.(event.target));
  };
  const rememberTouch = (event) => {
    if (event.touches.length !== 1) {
      touch = null;
      return;
    }
    const current = event.touches[0];
    touch = {
      x: current.clientX,
      y: current.clientY,
      startX: current.clientX,
      startY: current.clientY,
      inViewport: eventStartedInViewport(event),
      blocked: false,
    };
  };
  const moveTouch = (event) => {
    if (event.touches.length !== 1) {
      touch = null;
      return;
    }
    const current = event.touches[0];
    if (!touch) {
      rememberTouch(event);
      return;
    }
    const deltaX = current.clientX - touch.x;
    const deltaY = current.clientY - touch.y;
    const travelX = current.clientX - touch.startX;
    const travelY = current.clientY - touch.startY;
    touch.x = current.clientX;
    touch.y = current.clientY;
    const verticalIntent = Math.abs(travelY) > NIKAS_SHELL_BOUNDARY_THRESHOLD_PX
      && Math.abs(travelY) > Math.abs(travelX);
    if (!touch.blocked && verticalIntent) {
      touch.blocked = shouldBlockNikasShellBoundaryMove({
        deltaX,
        deltaY,
        inViewport: touch.inViewport,
        scrollTop: viewport.scrollTop,
        scrollHeight: viewport.scrollHeight,
        clientHeight: viewport.clientHeight,
      });
    }
    if (touch.blocked && event.cancelable) event.preventDefault();
  };
  const endTouch = (event) => {
    if (event.touches.length === 1) rememberTouch(event);
    else touch = null;
  };
  const cancelTouch = () => {
    touch = null;
  };

  host.addEventListener("touchstart", rememberTouch, { passive: false, capture: true });
  host.addEventListener("touchmove", moveTouch, { passive: false, capture: true });
  host.addEventListener("touchend", endTouch, { passive: true, capture: true });
  host.addEventListener("touchcancel", cancelTouch, { passive: true, capture: true });

  return () => {
    host.removeEventListener("touchstart", rememberTouch, true);
    host.removeEventListener("touchmove", moveTouch, true);
    host.removeEventListener("touchend", endTouch, true);
    host.removeEventListener("touchcancel", cancelTouch, true);
    touch = null;
  };
}

if (Panel && !Panel.prototype.__starkUiV091) {
  Panel.prototype.__starkUiV091 = true;
  const previousDisconnected = Panel.prototype.disconnectedCallback;

  Panel.prototype._installScrollBoundaryGuardV090 = function () {
    const viewport = this.__starkShellV080?.viewport
      || this.shadowRoot?.querySelector(".zoom-viewport-v065");
    if (!viewport || this.__starkScrollGuardViewportV091 === viewport) return;

    this.__starkScrollGuardCleanupV090?.();
    this.__starkScrollGuardCleanupV091?.();
    this.__starkScrollGuardCleanupV091 = createNikasShellScrollBoundaryGuard({
      host: this,
      viewport,
    });
    this.__starkScrollGuardViewportV091 = viewport;
  };

  Panel.prototype.disconnectedCallback = function () {
    this.__starkScrollGuardCleanupV090?.();
    this.__starkScrollGuardCleanupV091?.();
    this.__starkScrollGuardCleanupV090 = null;
    this.__starkScrollGuardCleanupV091 = null;
    this.__starkScrollGuardViewportV090 = null;
    this.__starkScrollGuardViewportV091 = null;
    previousDisconnected?.call(this);
  };
}
