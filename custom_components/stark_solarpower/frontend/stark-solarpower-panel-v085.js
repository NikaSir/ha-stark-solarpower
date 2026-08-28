import "./stark-solarpower-panel-v084.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.5";
const SOURCE_ROUTE_KEY = "nikas.specialized.source_route.v1";
const RETURN_ROUTE_KEY = "nikas.stark_solarpower.return_route.v1";
const SAFE_DEFAULT_ROUTE = "/dashboard-infrastructure/overview";
const SAFE_ROUTE_PREFIXES = ["/dashboard-house", "/dashboard-actions", "/dashboard-infrastructure"];

function safeReturnRoute(value) {
  if (!value) return null;
  try {
    const url = new URL(decodeURIComponent(String(value).trim()), window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const allowed = SAFE_ROUTE_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
    return allowed ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch (_error) {
    return null;
  }
}

function resolveReturnRoute(panel) {
  const current = new URL(window.location.href);
  const explicit = ["return_to", "from"]
    .map((key) => safeReturnRoute(current.searchParams.get(key)))
    .find(Boolean) || null;
  let handedOff = null;
  let saved = null;
  try {
    handedOff = safeReturnRoute(sessionStorage.getItem(SOURCE_ROUTE_KEY));
    sessionStorage.removeItem(SOURCE_ROUTE_KEY);
    saved = safeReturnRoute(sessionStorage.getItem(RETURN_ROUTE_KEY));
  } catch (_error) {}
  const configured = safeReturnRoute(panel?._panel?.config?.parent_route || panel?.panel?.config?.parent_route);
  const route = explicit || handedOff || saved || safeReturnRoute(document.referrer) || configured || SAFE_DEFAULT_ROUTE;
  try { sessionStorage.setItem(RETURN_ROUTE_KEY, route); } catch (_error) {}
  return route;
}

function navigateToSource(route) {
  const target = safeReturnRoute(route) || SAFE_DEFAULT_ROUTE;
  window.history.pushState(null, "", target);
  window.dispatchEvent(new Event("location-changed"));
}

if (Panel && !Panel.prototype.__starkUiV085) {
  Panel.prototype.__starkUiV085 = true;
  const previousRender = Panel.prototype._render;

  Panel.prototype._installHeaderReturnV085 = function () {
    const root = this.shadowRoot;
    const header = root?.querySelector(".app-header");
    let plaque = header?.querySelector(".title-return-v085");
    if (!header) return;

    if (!this.__starkReturnRouteV085) this.__starkReturnRouteV085 = resolveReturnRoute(this);
    if (!plaque) {
      const legacy = header.querySelector(".title-wrap");
      if (!legacy) return;
      plaque = document.createElement("button");
      plaque.type = "button";
      plaque.className = "title-wrap title-return-v085";
      plaque.setAttribute("aria-label", "Вернуться в базовую панель NikaS");
      plaque.innerHTML = `<div><h1>Stark SolarPower</h1><div class="subtitle">UI v${UI_VERSION}</div></div>`;
      plaque.addEventListener("click", () => navigateToSource(this.__starkReturnRouteV085));
      legacy.replaceWith(plaque);
      if (this.__starkShellV080) this.__starkShellV080.header = header;
    }
    const subtitle = plaque.querySelector(".subtitle");
    if (subtitle?.textContent !== `UI v${UI_VERSION}`) subtitle.textContent = `UI v${UI_VERSION}`;
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installHeaderReturnV085();
    if (!this.shadowRoot?.querySelector("style[data-stark-v085]")) {
      const style = document.createElement("style");
      style.dataset.starkV085 = "true";
      style.textContent = `
        .app-header .title-return-v085{
          grid-column:2!important;justify-self:center!important;
          width:min(100%,460px)!important;min-width:0!important;min-height:44px!important;
          margin:0!important;padding:5px 14px!important;
          display:block!important;text-align:center!important;
          border:1px solid var(--divider-color)!important;border-radius:16px!important;
          background:var(--card-background-color)!important;color:var(--primary-text-color)!important;
          box-shadow:0 4px 14px rgba(23,45,76,.06)!important;
          appearance:none!important;font:inherit!important;cursor:pointer!important;
        }
        .app-header .title-return-v085:active{transform:scale(.985)}
        .app-header .title-return-v085:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
        .app-header .title-return-v085 h1{font-size:23px!important;font-weight:800!important}
        .app-header .title-return-v085 .subtitle{font-size:14px!important;font-weight:560!important}
        @media(max-width:390px){
          .app-header .title-return-v085 h1{font-size:21px!important}
          .app-header .title-return-v085 .subtitle{font-size:13px!important}
        }
      `;
      this.shadowRoot.append(style);
    }
  };
}
