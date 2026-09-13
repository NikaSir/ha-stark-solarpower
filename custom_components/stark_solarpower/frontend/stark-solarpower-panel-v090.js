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
      plaque.className = "title-wrap title-return-v090";
      plaque.setAttribute("aria-label", "Вернуться на главную панель");
      const content = document.createElement("span");
      content.className = "title-return-copy-v090";
      const title = document.createElement("span");
      title.className = "title-return-name-v090";
      title.textContent = "ИБП Stark";
      const version = document.createElement("span");
      version.className = "subtitle";
      version.textContent = `UI v${UI_VERSION}`;
      content.append(title, version);
      plaque.append(content);
      plaque.addEventListener("click", () => navigateToSourceV090(this.__starkReturnRouteV090));
      legacyTitle.replaceWith(plaque);
    }

    const version = plaque.querySelector(".subtitle");
    if (version?.textContent !== `UI v${UI_VERSION}`) version.textContent = `UI v${UI_VERSION}`;

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
          display:block!important;
          border:1px solid color-mix(in srgb,var(--primary-color,#03a9d9) 24%,var(--divider-color,#dfe3e8))!important;
          border-radius:16px!important;
          background:color-mix(in srgb,var(--primary-color,#03a9d9) 5%,var(--card-background-color,#fff))!important;
          color:var(--primary-text-color)!important;
          box-shadow:0 5px 16px rgba(23,45,76,.06)!important;
          appearance:none!important;
          font:inherit!important;
          text-align:center!important;
          cursor:pointer!important;
          -webkit-tap-highlight-color:transparent;
        }
        .app-header .title-return-v090:focus-visible {
          outline:2px solid var(--primary-color)!important;
          outline-offset:2px!important;
        }
        .app-header .title-return-v090:active { transform:scale(.985); background:color-mix(in srgb,var(--primary-color,#03a9d9) 13%,var(--card-background-color,#fff))!important; border-color:color-mix(in srgb,var(--primary-color,#03a9d9) 42%,var(--divider-color,#dfe3e8))!important; box-shadow:0 2px 7px rgba(23,45,76,.05)!important; }
        .title-return-copy-v090 { display:flex; min-width:0; flex-direction:column; align-items:center; }
        .title-return-name-v090 {
          max-width:100%;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          font-size:23px;
          line-height:1.05;
          font-weight:800;
        }
        .title-return-v090 .subtitle { margin-top:3px!important; font-size:14px!important; line-height:1.2; font-weight:560!important; letter-spacing:.01em; }
        @media(max-width:390px) {
          .app-header .title-return-v090 { min-width:0!important; width:100%!important; padding-inline:8px!important; }
          .title-return-name-v090 { font-size:21px; }
          .title-return-v090 .subtitle { font-size:13px!important; }
        }
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
