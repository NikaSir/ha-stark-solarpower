import "./stark-solarpower-panel-v070.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.7.1";

const SHELL_AND_TYPE_STYLES = `
  /* UI 0.7.1: one stationary shell and the LIDER indicator language. */
  :host {
    height:100dvh !important;
    min-height:0 !important;
    overflow:hidden !important;
    overscroll-behavior:none !important;
  }
  :host main.app {
    width:100% !important;
    height:100dvh !important;
    min-height:0 !important;
    max-height:100dvh !important;
    display:flex !important;
    flex-direction:column !important;
    overflow:hidden !important;
    padding-bottom:calc(64px + env(safe-area-inset-bottom,0px)) !important;
  }
  :host main.app > .app-header,
  :host main.app > .global-device-context {
    position:relative !important;
    z-index:12 !important;
    flex:0 0 auto !important;
  }
  :host main.app > .zoom-viewport-v065 {
    width:100% !important;
    height:auto !important;
    min-height:0 !important;
    max-height:none !important;
    flex:1 1 auto !important;
  }

  :host main.app > .app-header h1 {
    font-size:23px !important;
    line-height:1.05 !important;
    font-weight:800 !important;
  }
  :host main.app > .app-header .subtitle {
    font-size:14px !important;
    line-height:1.15 !important;
    font-weight:560 !important;
  }
  :host main.app > .app-header .system-menu-v056,
  :host main.app > .app-header .refresh {
    width:44px !important;
    min-width:44px !important;
    height:44px !important;
    min-height:44px !important;
    border-radius:16px !important;
  }
  :host main.app > .app-header .system-menu-v056 ha-icon,
  :host main.app > .app-header .refresh ha-icon {
    --mdc-icon-size:25px !important;
  }

  :host main.app .zoom-surface-v065 {
    font-size:14px !important;
  }
  :host main.app .zoom-surface-v065 h2,
  :host main.app .zoom-surface-v065 .hero-copy-v051 h2 {
    font-size:25px !important;
  }
  :host main.app .zoom-surface-v065 h3,
  :host main.app .zoom-surface-v065 .state-card-v051 h3 {
    font-size:18px !important;
  }
  :host main.app .zoom-surface-v065 .eyebrow,
  :host main.app .zoom-surface-v065 .hint,
  :host main.app .zoom-surface-v065 .mini-version,
  :host main.app .zoom-surface-v065 .hero-copy-v051 > span,
  :host main.app .zoom-surface-v065 .metric-copy-v051 span,
  :host main.app .zoom-surface-v065 .metric-copy-v051 small,
  :host main.app .zoom-surface-v065 .state-pill-v051,
  :host main.app .zoom-surface-v065 .state-values-v051 span,
  :host main.app .zoom-surface-v065 .battery-details-head-v070 small,
  :host main.app .zoom-surface-v065 .battery-fact-v070 span,
  :host main.app .zoom-surface-v065 .history-link span,
  :host main.app .zoom-surface-v065 .history-link strong,
  :host main.app .zoom-surface-v065 .event-row span,
  :host main.app .zoom-surface-v065 .event-row strong,
  :host main.app .zoom-surface-v065 .source-summary span,
  :host main.app .zoom-surface-v065 .source-summary strong {
    font-size:12px !important;
  }

  :host main.app .zoom-surface-v065 .connection-v066 {
    border-width:1px !important;
    border-style:solid !important;
    box-shadow:0 5px 18px rgba(23,45,76,.07) !important;
  }
  :host main.app .zoom-surface-v065 .connection-v066.good {
    color:var(--success-color,#2eae55) !important;
    border-color:color-mix(in srgb,var(--success-color,#2eae55) 30%,transparent) !important;
    background:color-mix(in srgb,var(--success-color,#2eae55) 11%,var(--card-background-color)) !important;
  }
  :host main.app .zoom-surface-v065 .connection-v066.bad {
    color:var(--error-color,#d93b3b) !important;
    border-color:color-mix(in srgb,var(--error-color,#d93b3b) 30%,transparent) !important;
    background:color-mix(in srgb,var(--error-color,#d93b3b) 10%,var(--card-background-color)) !important;
  }
  :host main.app .zoom-surface-v065 .connection-v066.unknown {
    color:var(--secondary-text-color) !important;
    border-color:color-mix(in srgb,var(--secondary-text-color) 28%,transparent) !important;
    background:color-mix(in srgb,var(--secondary-text-color) 8%,var(--card-background-color)) !important;
  }
  :host main.app .zoom-surface-v065 .connection-lamp-v066 {
    box-shadow:0 0 0 4px color-mix(in srgb,currentColor 14%,transparent),0 0 10px color-mix(in srgb,currentColor 24%,transparent) !important;
  }
  :host main.app .zoom-surface-v065 .connection-copy-v066 strong {
    font-size:16px !important;
    font-weight:700 !important;
  }
  :host main.app .zoom-surface-v065 .connection-copy-v066 small {
    font-size:13px !important;
    font-weight:600 !important;
  }
  @media(max-width:520px) {
    :host {
      position:fixed !important;
      inset:0 !important;
      width:auto !important;
      height:auto !important;
      max-height:none !important;
    }
    :host main.app {
      position:absolute !important;
      inset:0 !important;
      width:auto !important;
      height:auto !important;
      max-height:none !important;
    }
  }
  @media(max-width:430px) {
    :host main.app > .app-header h1 { font-size:21px !important; }
    :host main.app > .app-header .subtitle { font-size:13px !important; }
  }
`;

function registryKey(panel) {
  return JSON.stringify((panel._devices || []).map((device) => [
    device.id,
    device.name,
    device.model,
    Object.entries(device.entities || {}).sort(([left], [right]) => left.localeCompare(right)),
  ]).sort(([left], [right]) => String(left).localeCompare(String(right))));
}

function liveMarkup(panel) {
  return panel._renderLiveViewV069?.();
}

function viewCacheKey(panel) {
  return `${panel._selectedUpsId?.() || "default"}:${panel._view || "overview"}`;
}

if (Panel && !Panel.prototype.__starkUiV071) {
  Panel.prototype.__starkUiV071 = true;

  const previousStyles = Panel.prototype._styles;
  const previousRender = Panel.prototype._render;

  // Selection is state, not ordering. Keeping device buttons in one order is
  // part of the stationary shell and avoids a visible jump on every switch.
  Panel.prototype._prioritizeSelectedUps = function () {};

  Panel.prototype._styles = function () {
    return `${previousStyles.call(this)}\n${SHELL_AND_TYPE_STYLES}`;
  };

  Panel.prototype._bindSurfaceEntitiesV071 = function (surface) {
    surface?.querySelectorAll("[data-entity]").forEach((element) => {
      if (element.dataset.starkBoundV071 === "true") return;
      element.dataset.starkBoundV071 = "true";
      const entityId = element.dataset.entity;
      if (!entityId) return;
      let timer = null;
      let fired = false;
      const clear = () => {
        if (timer) window.clearTimeout(timer);
        timer = null;
      };
      element.addEventListener("pointerdown", () => {
        fired = false;
        timer = window.setTimeout(() => {
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

  Panel.prototype._syncStableShellV071 = function () {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelectorAll(".bottom-nav-v051 [data-view-v051]").forEach((button) => {
      const active = button.dataset.viewV051 === this._view;
      button.classList.toggle("active", active);
      button.toggleAttribute("aria-current", active);
      if (active) button.setAttribute("aria-current", "page");
    });
    const selectedId = this._selectedUpsId?.();
    root.querySelectorAll(".global-device-context [data-ups-device]").forEach((button) => {
      const active = button.dataset.upsDevice === selectedId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };

  Panel.prototype._buildWorkFragmentV071 = function () {
    const markup = liveMarkup(this);
    if (typeof markup !== "string") return null;
    const template = document.createElement("template");
    template.innerHTML = markup;
    template.content.querySelectorAll(".device-switcher").forEach((node) => node.remove());
    Array.from(template.content.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) node.remove();
    });
    return template.content;
  };

  Panel.prototype._switchCachedWorkSurfaceV071 = function (nextCacheKey) {
    const root = this.shadowRoot;
    const surface = root?.querySelector(".zoom-surface-v065");
    const activeCacheKey = this.__starkActiveViewCacheKeyV071;
    if (!root || !surface || !activeCacheKey || activeCacheKey === nextCacheKey) return false;

    this.__starkViewCacheV071 ||= new Map();
    const outgoing = document.createDocumentFragment();
    while (surface.firstChild) outgoing.append(surface.firstChild);
    this.__starkViewCacheV071.set(activeCacheKey, outgoing);

    const cached = this.__starkViewCacheV071.get(nextCacheKey);
    if (cached) {
      this.__starkViewCacheV071.delete(nextCacheKey);
      surface.append(cached);
      // Reconcile telemetry accumulated while the preserved view was detached.
      // If its structure no longer matches, discard only that cached view and
      // lazily build its new shape; the shell and other cached tabs survive.
      if (!this._patchLiveViewV069?.()) {
        while (surface.firstChild) surface.firstChild.remove();
        const replacement = this._buildWorkFragmentV071();
        if (!replacement) return false;
        surface.append(replacement);
        this._bindSurfaceEntitiesV071(surface);
      }
    } else {
      const fragment = this._buildWorkFragmentV071();
      if (!fragment) return false;
      surface.append(fragment);
      this._bindSurfaceEntitiesV071(surface);
    }
    this.__starkActiveViewCacheKeyV071 = nextCacheKey;
    return true;
  };

  Panel.prototype._render = function () {
    const canRender = Boolean(
      this._hass
      && !this._loadingRegistry
      && !this._registryError
      && this._devices?.length
    );
    const nextRegistryKey = canRender ? registryKey(this) : null;
    const nextLiveKey = canRender ? this._liveStructureKeyV069?.() : null;
    const nextDevice = canRender ? this._selectedUpsId?.() : null;
    const nextCacheKey = canRender ? viewCacheKey(this) : null;
    const canReplaceSurface = Boolean(
      nextLiveKey
      && this.__starkRegistryKeyV071 === nextRegistryKey
      && this.__starkLiveKeyV071
      && this.__starkLiveKeyV071 !== nextLiveKey
      && this.__starkActiveViewCacheKeyV071 !== nextCacheKey
    );

    if (canReplaceSurface && this._switchCachedWorkSurfaceV071(nextCacheKey)) {
      const controller = this.__starkCanvasControllerV065;
      controller?.switchKey(this._stateKeyV065?.());
      if (this.__starkViewV071 !== this._view) controller?.origin();
      else controller?.refresh();

      this._liveStructureCacheV069 = nextLiveKey;
      const overviewDevice = this._view === "overview" ? this._selectedDeviceV051?.() : null;
      this._overviewStructureCacheV068 = overviewDevice
        ? this._overviewStructureKeyV068?.(overviewDevice)
        : null;
      this.__starkLiveKeyV071 = nextLiveKey;
      this.__starkViewV071 = this._view;
      this.__starkDeviceV071 = nextDevice;
      this._syncStableShellV071();
      return;
    }

    const previousSurface = this.shadowRoot?.querySelector(".zoom-surface-v065");
    previousRender.call(this);

    const renderedSurface = this.shadowRoot?.querySelector(".zoom-surface-v065");
    const rendered = Boolean(renderedSurface);
    if (!previousSurface || previousSurface !== renderedSurface) {
      this.__starkViewCacheV071 = new Map();
    }
    this.__starkRegistryKeyV071 = rendered && canRender ? registryKey(this) : null;
    this.__starkLiveKeyV071 = rendered && canRender ? this._liveStructureKeyV069?.() : null;
    if (!this.__starkActiveViewCacheKeyV071 || previousSurface !== renderedSurface) {
      this.__starkActiveViewCacheKeyV071 = rendered && canRender ? viewCacheKey(this) : null;
    }
    this.__starkViewV071 = this._view;
    this.__starkDeviceV071 = rendered && canRender ? this._selectedUpsId?.() : null;
    this._syncStableShellV071();
  };
}
