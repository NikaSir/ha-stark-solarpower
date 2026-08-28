import "./stark-solarpower-panel-v086.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.9.0";
const SOURCE_ROUTE_KEY = "nikas.specialized.source_route.v1";
const SOURCE_ROUTE_AT_KEY = "nikas.specialized.source_route_at.v1";
const RETURN_ROUTE_KEY = "nikas.stark_solarpower.return_route.v1";
const SAFE_RETURN_ROUTE = "/dashboard-infrastructure/overview";

function normalizeBaseRouteV090(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value).trim(), window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === "/dashboard-house-v11" || url.pathname.startsWith("/dashboard-house-v11/")) {
      return "/dashboard-house-v11/home";
    }
    if (url.pathname === "/dashboard-actions" || url.pathname.startsWith("/dashboard-actions/")) {
      return "/dashboard-actions/home";
    }
    if (url.pathname === "/dashboard-infrastructure" || url.pathname.startsWith("/dashboard-infrastructure/")) {
      return "/dashboard-infrastructure/overview";
    }
  } catch (_error) {
    // Invalid and cross-origin candidates fall through to the next source.
  }
  return null;
}

function readOneShotSourceV090() {
  try {
    const rawRoute = sessionStorage.getItem(SOURCE_ROUTE_KEY);
    const rawTimestamp = sessionStorage.getItem(SOURCE_ROUTE_AT_KEY);
    sessionStorage.removeItem(SOURCE_ROUTE_KEY);
    sessionStorage.removeItem(SOURCE_ROUTE_AT_KEY);
    if (rawTimestamp !== null) {
      const timestamp = Number(rawTimestamp);
      if (!Number.isFinite(timestamp) || Date.now() - timestamp > 30_000) return null;
    }
    return normalizeBaseRouteV090(rawRoute);
  } catch (_error) {
    return null;
  }
}

function readSavedSourceV090() {
  try {
    return normalizeBaseRouteV090(sessionStorage.getItem(RETURN_ROUTE_KEY));
  } catch (_error) {
    return null;
  }
}

function resolveReturnRouteV090(panel) {
  const current = new URL(window.location.href);
  const explicit = normalizeBaseRouteV090(current.searchParams.get("return_to"))
    || normalizeBaseRouteV090(current.searchParams.get("from"));
  const handedOff = readOneShotSourceV090();
  const saved = readSavedSourceV090();
  const referrer = normalizeBaseRouteV090(document.referrer);
  const configured = normalizeBaseRouteV090(
    panel?._panel?.config?.parent_route || panel?.panel?.config?.parent_route,
  );
  const route = explicit || handedOff || saved || referrer || configured || SAFE_RETURN_ROUTE;
  try {
    sessionStorage.setItem(RETURN_ROUTE_KEY, route);
  } catch (_error) {
    // Private browsing may disable storage; the captured instance value remains valid.
  }
  return route;
}

function navigateToSourceV090(route) {
  const target = normalizeBaseRouteV090(route) || SAFE_RETURN_ROUTE;
  window.history.pushState(null, "", target);
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
      plaque.setAttribute("aria-label", "Вернуться в исходную панель NikaS");
      const content = document.createElement("span");
      content.className = "title-return-copy-v090";
      const title = document.createElement("span");
      title.className = "title-return-name-v090";
      title.textContent = "Stark SolarPower";
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
        /* NikaS Specialized Panel UI + Navigation Standard v1.8. */
        .app-header .title-return-v090 {
          grid-column:2!important;
          justify-self:center!important;
          width:min(100%,460px)!important;
          min-width:0!important;
          min-height:44px!important;
          margin:0!important;
          padding:5px 14px!important;
          display:block!important;
          border:1px solid var(--divider-color)!important;
          border-radius:16px!important;
          background:var(--card-background-color)!important;
          color:var(--primary-text-color)!important;
          box-shadow:0 4px 14px rgba(23,45,76,.06)!important;
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
        .app-header .title-return-v090:active { transform:scale(.985); }
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
        .title-return-v090 .subtitle { font-size:14px!important; line-height:1.1; font-weight:560!important; }
        @media(max-width:390px) {
          .title-return-name-v090 { font-size:21px; }
          .title-return-v090 .subtitle { font-size:13px!important; }
        }
      `;
      root.append(style);
    }
  };

  Panel.prototype._syncShellControlsV080 = function () {
    previousSyncControls?.call(this);
    this._installHeaderReturnV090();
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installHeaderReturnV090();
  };
}
