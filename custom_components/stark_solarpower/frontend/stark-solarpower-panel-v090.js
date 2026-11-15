import "./stark-solarpower-panel-v086.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.9.7";
const SAFE_RETURN_ROUTE = "/home/overview";

function resolveReturnRouteV090(_panel) {
  return SAFE_RETURN_ROUTE;
}

function navigateToSourceV090(_route) {
  window.history.pushState(null, "", SAFE_RETURN_ROUTE);
  window.dispatchEvent(new Event("location-changed"));
}

if (Panel && !Panel.prototype.__starkUiV090) {
  Panel.prototype.__starkUiV090 = true;
  const previousRender = Panel.prototype._render;
  const previousSyncControls = Panel.prototype._syncShellControlsV080;

  Panel.prototype._headerVersionLabelV090 = function () {
    return `UI v${UI_VERSION} / —`;
  };

  Panel.prototype._installHeaderReturnV090 = function () {
    const root = this.shadowRoot;
    const header = root?.querySelector(".app-header");
    if (!header) return;

    if (!this.__starkReturnRouteV090) {
      this.__starkReturnRouteV090 = resolveReturnRouteV090(this);
    }

    let plaque = header.querySelector(".title-return-v090");
    if (!plaque) {
      const legacyTitle = header.querySelector(".title-wrap");
      if (!legacyTitle) return;
      plaque = document.createElement("button");
      plaque.type = "button";
      plaque.className = "title-return-v090";
      plaque.setAttribute("aria-label", "Вернуться на главную панель");
      plaque.setAttribute("aria-describedby", "stark-header-versions");
      const title = document.createElement("strong");
      title.className = "title-return-name-v090";
      title.textContent = "ИБП Stark";
      const version = document.createElement("small");
      version.id = "stark-header-versions";
      plaque.append(title, version);
      plaque.addEventListener("click", () => navigateToSourceV090(this.__starkReturnRouteV090));
      legacyTitle.replaceWith(plaque);
    }

    const version = plaque.querySelector("#stark-header-versions");
    const label = this._headerVersionLabelV090();
    if (version && version.textContent !== label) version.textContent = label;

    if (!root.querySelector("style[data-stark-ui-v090]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV090 = "true";
      style.textContent = `
        /* NikaS Specialized Panel UI Standard v2.2 + Navigation Contract v1.2. */
        .app-header .title-return-v090 {
          grid-column:2!important;
          justify-self:center!important;
          min-width:min(290px,100%)!important;
          max-width:100%!important;
          min-height:44px!important;
          margin:0!important;
          padding:5px 14px!important;
          appearance:none!important;
          font-family:inherit;
          color:var(--primary-text-color,#17191c)!important;
          -webkit-tap-highlight-color:transparent;
        }
        .app-header .title-return-v090:focus-visible {
          outline:2px solid var(--primary-color)!important;
          outline-offset:2px!important;
        }
        .app-header .title-return-v090:active { transform:scale(.985); background:color-mix(in srgb,var(--primary-color,#03a9d9) 13%,var(--card-background-color,#fff))!important; border-color:color-mix(in srgb,var(--primary-color,#03a9d9) 42%,var(--divider-color,#dfe3e8))!important; box-shadow:0 2px 7px rgba(23,45,76,.05)!important; }
      `;
      root.append(style);
    }
  };

  Panel.prototype._installScrollBoundaryGuardV090 = function () {
    const viewport = this.__starkShellV080?.viewport
      || this.shadowRoot?.querySelector(".zoom-viewport-v065");
    if (!viewport || this.__starkScrollGuardViewportV090 === viewport) return;

    this.__starkScrollGuardCleanupV090?.();
    let lastTouchY = null;

    const isNativeScroll = () => viewport.classList.contains("native-scroll");
    const atTop = () => viewport.scrollTop <= 0;
    const atBottom = () => (
      Math.ceil(viewport.scrollTop + viewport.clientHeight) >= viewport.scrollHeight
    );
    const onTouchStart = (event) => {
      lastTouchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const onTouchMove = (event) => {
      if (!isNativeScroll() || event.touches.length !== 1 || lastTouchY === null) {
        lastTouchY = null;
        return;
      }
      const nextY = event.touches[0].clientY;
      const deltaY = nextY - lastTouchY;
      lastTouchY = nextY;
      if ((atTop() && deltaY > 0) || (atBottom() && deltaY < 0)) {
        event.preventDefault();
      }
    };
    const onTouchEnd = (event) => {
      lastTouchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const onWheel = (event) => {
      if (!isNativeScroll()) return;
      if ((atTop() && event.deltaY < 0) || (atBottom() && event.deltaY > 0)) {
        event.preventDefault();
      }
    };

    viewport.addEventListener("touchstart", onTouchStart, { passive:true });
    viewport.addEventListener("touchmove", onTouchMove, { passive:false });
    viewport.addEventListener("touchend", onTouchEnd, { passive:true });
    viewport.addEventListener("touchcancel", onTouchEnd, { passive:true });
    viewport.addEventListener("wheel", onWheel, { passive:false });
    this.__starkScrollGuardViewportV090 = viewport;
    this.__starkScrollGuardCleanupV090 = () => {
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
      viewport.removeEventListener("touchend", onTouchEnd);
      viewport.removeEventListener("touchcancel", onTouchEnd);
      viewport.removeEventListener("wheel", onWheel);
      if (this.__starkScrollGuardViewportV090 === viewport) {
        this.__starkScrollGuardViewportV090 = null;
      }
    };
  };

  Panel.prototype._syncShellControlsV080 = function () {
    previousSyncControls?.call(this);
    this._installHeaderReturnV090();
    this._installScrollBoundaryGuardV090();
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installHeaderReturnV090();
    this._installScrollBoundaryGuardV090();
  };
}
