import "./stark-solarpower-panel-v071.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.0";
const TONES = ["good", "warn", "bad", "unknown", "current"];

function sameTreeShape(current, desired) {
  if (!current || !desired || current.nodeType !== desired.nodeType) return false;
  if (current.nodeType === Node.ELEMENT_NODE && current.tagName !== desired.tagName) return false;
  if (current.childNodes.length !== desired.childNodes.length) return false;
  for (let index = 0; index < current.childNodes.length; index += 1) {
    if (!sameTreeShape(current.childNodes[index], desired.childNodes[index])) return false;
  }
  return true;
}

function sameChildrenShape(current, desired) {
  if (current.childNodes.length !== desired.childNodes.length) return false;
  for (let index = 0; index < current.childNodes.length; index += 1) {
    if (!sameTreeShape(current.childNodes[index], desired.childNodes[index])) return false;
  }
  return true;
}

function syncAttributes(current, desired) {
  for (const attribute of Array.from(current.attributes)) {
    if (!desired.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  }
  for (const attribute of Array.from(desired.attributes)) {
    if (current.getAttribute(attribute.name) !== attribute.value) {
      current.setAttribute(attribute.name, attribute.value);
    }
  }
}

function syncTree(current, desired) {
  if (current.nodeType === Node.TEXT_NODE) {
    if (current.nodeValue !== desired.nodeValue) current.nodeValue = desired.nodeValue;
    return;
  }
  if (current.nodeType === Node.ELEMENT_NODE) syncAttributes(current, desired);
  for (let index = 0; index < current.childNodes.length; index += 1) {
    syncTree(current.childNodes[index], desired.childNodes[index]);
  }
}

function syncChildren(current, desired) {
  for (let index = 0; index < current.childNodes.length; index += 1) {
    syncTree(current.childNodes[index], desired.childNodes[index]);
  }
}

function cleanTemplate(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  template.content.querySelectorAll(".device-switcher").forEach((node) => node.remove());
  Array.from(template.content.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) node.remove();
  });
  return template;
}

if (Panel && !Panel.prototype.__starkUiV080) {
  Panel.prototype.__starkUiV080 = true;

  const legacyRender = Panel.prototype._render;

  Panel.prototype._viewCacheKeyV080 = function () {
    const device = this._selectedUpsId?.() || this._diagnosticDeviceId || this._devices?.[0]?.id || "default";
    return `${device}::${this._view || "overview"}`;
  };

  Panel.prototype._renderViewMarkupV080 = function () {
    return this._renderLiveViewV069?.() ?? null;
  };

  Panel.prototype._viewStructureKeyV080 = function () {
    const device = this._selectedDeviceV051?.();
    const entities = Object.entries(device?.entities || {})
      .map(([name, entityId]) => [name, entityId])
      .sort(([left], [right]) => left.localeCompare(right));
    return JSON.stringify([this._view, device?.id || null, entities]);
  };

  Panel.prototype._bindViewEntitiesV080 = function (scope) {
    scope?.querySelectorAll("[data-entity]").forEach((element) => {
      if (element.dataset.starkBoundV080) return;
      element.dataset.starkBoundV080 = "true";
      const entityId = element.dataset.entity;
      if (!entityId) return;
      let timer = null;
      let fired = false;
      const clear = () => {
        if (timer) clearTimeout(timer);
        timer = null;
      };
      element.addEventListener("pointerdown", () => {
        fired = false;
        timer = setTimeout(() => {
          fired = true;
          this._showMoreInfo(entityId);
        }, 520);
      });
      element.addEventListener("pointerup", clear);
      element.addEventListener("pointercancel", clear);
      element.addEventListener("pointerleave", clear);
      if (element.classList.contains("history-link")) {
        element.addEventListener("click", (event) => {
          if (!fired) this._showMoreInfo(entityId);
          event.preventDefault();
        });
      }
    });
  };

  Panel.prototype._createCachedViewV080 = function (key, markup, structureKey) {
    const shell = this.__starkShellV080;
    if (!shell || typeof markup !== "string") return null;
    const view = document.createElement("div");
    view.className = "work-view-v080";
    view.dataset.cacheKeyV080 = key;
    view.__starkStructureKeyV080 = structureKey;
    view.hidden = true;
    const template = cleanTemplate(markup);
    view.append(template.content);
    this._bindViewEntitiesV080(view);
    shell.surface.append(view);
    shell.cache.set(key, view);
    return view;
  };

  Panel.prototype._patchCachedViewV080 = function (view, markup, structureKey) {
    if (!view || typeof markup !== "string") return false;
    const template = cleanTemplate(markup);
    if (
      view.__starkStructureKeyV080 === structureKey
      && sameChildrenShape(view, template.content)
    ) {
      syncChildren(view, template.content);
      return true;
    }

    // Only a real structural change may replace one cached work view. The
    // Header, selector, viewport, canvas, artwork owner and Bottom Tab Bar
    // remain the original mounted nodes.
    view.replaceChildren(template.content);
    view.__starkStructureKeyV080 = structureKey;
    this._bindViewEntitiesV080(view);
    return true;
  };

  Panel.prototype._syncShellControlsV080 = function () {
    const shell = this.__starkShellV080;
    if (!shell) return;
    const selectedId = this._selectedUpsId?.() || this._devices?.[0]?.id || null;
    shell.selector?.querySelectorAll("[data-ups-device]").forEach((button) => {
      const active = button.dataset.upsDevice === selectedId;
      if (button.classList.contains("active") !== active) {
        button.classList.toggle("active", active);
      }
      const pressed = active ? "true" : "false";
      if (button.getAttribute("aria-pressed") !== pressed) {
        button.setAttribute("aria-pressed", pressed);
      }
      const device = this._devices?.find((item) => item.id === button.dataset.upsDevice);
      const dot = button.querySelector(".device-health-dot");
      if (dot && device) {
        const tone = this._status?.(device)?.tone || "unknown";
        if (!dot.classList.contains(tone)) {
          dot.classList.remove(...TONES);
          dot.classList.add(tone);
        }
      }
    });
    shell.nav?.querySelectorAll("[data-view-v051]").forEach((button) => {
      const active = button.dataset.viewV051 === this._view;
      if (button.classList.contains("active") !== active) {
        button.classList.toggle("active", active);
      }
      if (active && button.getAttribute("aria-current") !== "page") {
        button.setAttribute("aria-current", "page");
      } else if (!active && button.hasAttribute("aria-current")) {
        button.removeAttribute("aria-current");
      }
    });
    const subtitle = shell.header?.querySelector(".subtitle");
    if (subtitle?.textContent !== `UPS Control Center · UI v${UI_VERSION}`) {
      subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
    }
  };

  Panel.prototype._installShellV080 = function () {
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const selector = app?.querySelector(":scope > .global-device-context");
    const viewport = app?.querySelector(":scope > .zoom-viewport-v065");
    const surface = viewport?.querySelector(":scope > .zoom-stage-v065 > .zoom-surface-v065");
    const nav = app?.querySelector(":scope > .tabs.bottom-nav-v051");
    if (!root || !app || !header || !viewport || !surface || !nav) return false;

    const key = this._viewCacheKeyV080();
    const initial = document.createElement("div");
    initial.className = "work-view-v080";
    initial.dataset.cacheKeyV080 = key;
    initial.__starkStructureKeyV080 = this._viewStructureKeyV080();
    while (surface.firstChild) initial.append(surface.firstChild);
    initial.querySelectorAll("[data-entity]").forEach((element) => {
      // Initial view already owns the legacy listeners installed during the
      // one allowed complete mount. New cached views use the v0.8 binder.
      element.dataset.starkBoundV080 = "legacy";
    });
    surface.append(initial);

    this.__starkShellV080 = {
      app,
      header,
      selector,
      viewport,
      surface,
      nav,
      cache:new Map([[key, initial]]),
      activeKey:key,
      deviceId:this._selectedUpsId?.() || this._devices?.[0]?.id || "default",
    };
    this._syncShellControlsV080();
    this.__starkCanvasControllerV065?.refresh();
    return true;
  };

  Panel.prototype._reconcileShellV080 = function () {
    const shell = this.__starkShellV080;
    if (!shell || !shell.app.isConnected || !shell.viewport.isConnected) return false;

    const key = this._viewCacheKeyV080();
    const deviceId = this._selectedUpsId?.() || this._devices?.[0]?.id || "default";
    const markup = this._renderViewMarkupV080();
    const structureKey = this._viewStructureKeyV080();
    let target = shell.cache.get(key);
    if (!target) target = this._createCachedViewV080(key, markup, structureKey);
    else this._patchCachedViewV080(target, markup, structureKey);
    if (!target) return false;

    const changedView = shell.activeKey !== key;
    const changedDevice = shell.deviceId !== deviceId;
    if (changedView) {
      shell.cache.forEach((view, viewKey) => { view.hidden = viewKey !== key; });
      shell.activeKey = key;
      shell.deviceId = deviceId;
      if (changedDevice) this.__starkCanvasControllerV065?.switchContext(deviceId);
      else this.__starkCanvasControllerV065?.resetPosition({ persist:true });
    } else {
      this.__starkCanvasControllerV065?.refresh();
    }

    this._syncShellControlsV080();
    return true;
  };

  Panel.prototype._render = function () {
    if (this.__starkShellV080 && this._reconcileShellV080()) return;

    legacyRender.call(this);
    if (
      this._hass
      && !this._loadingRegistry
      && !this._registryError
      && this._devices?.length
    ) {
      this._installShellV080();
    }

    const root = this.shadowRoot;
    if (!root || root.querySelector("style[data-stark-ui-v080]")) return;
    const style = document.createElement("style");
    style.dataset.starkUiV080 = "true";
    style.textContent = `
      /* NikaS Specialized Panel UI Standard v1.6. */
      :host {
        display:block!important;
        width:100%!important;
        height:100dvh!important;
        min-height:0!important;
        overflow:hidden!important;
        overscroll-behavior:none!important;
      }
      main.app {
        width:100%!important;
        height:100dvh!important;
        max-height:100dvh!important;
        min-height:0!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        padding-bottom:calc(64px + env(safe-area-inset-bottom,0px))!important;
      }
      .app-header,.global-device-context { flex:0 0 auto!important; }
      .app-header h1 { font-size:23px!important; font-weight:800!important; white-space:nowrap!important; }
      .app-header .subtitle { font-size:14px!important; font-weight:560!important; }
      .app-header .system-menu-v056,.app-header .refresh {
        box-shadow:0 7px 20px rgba(23,45,76,.08)!important;
      }
      .tabs.bottom-nav-v051 {
        padding:6px max(8px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(8px,env(safe-area-inset-left,0px))!important;
      }
      .bottom-nav-v051 .tab {
        min-height:52px!important;
        gap:3px!important;
        padding:4px 2px!important;
        border-radius:16px!important;
      }
      .zoom-viewport-v065 {
        flex:1 1 auto!important;
        width:100%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        overflow-anchor:none!important;
        overscroll-behavior-x:none!important;
        overscroll-behavior-y:none!important;
      }
      .zoom-surface-v065,.work-view-v080 { width:100%; min-width:0; }
      .work-view-v080[hidden] { display:none!important; }

      /* v1.6 typography envelope: meaningful phone text is 12–25 px. */
      .hero-copy-v051 h2 { font-size:25px!important; line-height:1.04!important; letter-spacing:-.025em!important; }
      section.overview-v066 .ups-hero-v051.unknown .hero-copy-v051 h2,
      section.overview-v066 .ups-hero-v051.bad .hero-copy-v051 h2 { font-size:25px!important; }
      .eyebrow,.flow-node span,.flow-ups span,.metric-label,.hint,.mini-version,.status,
      .metric-copy-v051 span,.metric-copy-v051 small,
      .state-values-v051 span,.state-pill-v051,.battery-details-head-v070 small,
      .battery-fact-v070 span { font-size:12px!important; }
      .connection-copy-v066 strong { font-size:16px!important; font-weight:700!important; }
      .connection-copy-v066 small { font-size:13px!important; font-weight:560!important; }

      /* Status color owns the stable two-line plaque, not only its lamp. */
      section.overview-v066 .connection-v066 {
        border-width:1px!important;
        border-style:solid!important;
        box-shadow:0 5px 16px rgba(23,45,76,.06)!important;
      }
      section.overview-v066 .connection-v066.good {
        border-color:color-mix(in srgb,var(--success-color,#2eae55) 30%,var(--divider-color))!important;
        background:color-mix(in srgb,var(--success-color,#2eae55) 10%,var(--card-background-color))!important;
      }
      section.overview-v066 .connection-v066.bad {
        border-color:color-mix(in srgb,var(--error-color,#d93b3b) 30%,var(--divider-color))!important;
        background:color-mix(in srgb,var(--error-color,#d93b3b) 10%,var(--card-background-color))!important;
      }
      section.overview-v066 .connection-v066.unknown {
        border-color:color-mix(in srgb,var(--disabled-text-color) 30%,var(--divider-color))!important;
        background:color-mix(in srgb,var(--disabled-text-color) 9%,var(--card-background-color))!important;
      }

      @media(max-width:390px) {
        .app-header h1 { font-size:21px!important; }
        .app-header .subtitle { font-size:13px!important; }
        .global-device-context button { font-size:15px!important; }
        .bottom-nav-v051 .tab,.bottom-nav-v051 .tab span { font-size:12px!important; }
        .state-pill-v051,.state-values-v051 span,.battery-fact-v070 span { font-size:12px!important; }
      }
      @media(max-width:680px) {
        :host { position:fixed!important; inset:0!important; width:auto!important; height:auto!important; }
        main.app { position:absolute!important; inset:0!important; width:auto!important; height:auto!important; }
      }
    `;
    root.append(style);
  };
}
