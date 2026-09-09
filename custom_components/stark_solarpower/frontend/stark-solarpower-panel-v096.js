import "./stark-solarpower-panel-v095.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.9.6";
const REFRESH_MINIMUM_MS = 900;
const REFRESH_RESULT_MS = 1400;

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

if (Panel && !Panel.prototype.__starkUiV096) {
  Panel.prototype.__starkUiV096 = true;

  const previousBindEvents = Panel.prototype._bindEvents;
  const previousRender = Panel.prototype._render;
  const previousDisconnected = Panel.prototype.disconnectedCallback;

  Panel.prototype._status = function (device) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const onBattery = this._isOn(device, "on_battery");
    const mode = this._mode(device);

    if (cloud === false) {
      return { label:"Облако недоступно", tone:"bad", icon:"mdi:cloud-off-outline" };
    }
    if (cloud === null) {
      return { label:"Источник неизвестен", tone:"unknown", icon:"mdi:cloud-question-outline" };
    }
    if (stale === true) {
      return { label:"Данные устарели", tone:"warn", icon:"mdi:clock-alert-outline" };
    }
    if (stale === null) {
      return { label:"Свежесть неизвестна", tone:"unknown", icon:"mdi:clock-question-outline" };
    }
    if (mode === "fault_mode") {
      return { label:"Авария", tone:"bad", icon:"mdi:alert-octagon-outline" };
    }
    if (onBattery === true || mode === "battery_mode") {
      return { label:"От батареи", tone:"warn", icon:"mdi:battery-arrow-down-outline" };
    }
    if (mode === "line_mode") {
      const required = ["input_voltage", "output_voltage", "battery_capacity", "output_load"];
      if (required.every((key) => this._available(this._state(device, key)))) {
        return { label:"Нормально", tone:"good", icon:"mdi:check-circle-outline" };
      }
      return { label:"Неполные данные", tone:"unknown", icon:"mdi:help-circle-outline" };
    }
    if (mode && mode !== "unknown") {
      return { label:this._modeLabel(device), tone:"warn", icon:"mdi:information-outline" };
    }
    return { label:"Состояние неизвестно", tone:"unknown", icon:"mdi:help-circle-outline" };
  };

  Panel.prototype._ensureRefreshStatusV096 = function () {
    const header = this.shadowRoot?.querySelector(".app-header");
    if (!header) return null;
    let status = header.querySelector(".refresh-status-v096");
    if (!status) {
      status = document.createElement("span");
      status.className = "refresh-status-v096";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      status.setAttribute("aria-atomic", "true");
      header.append(status);
    }
    return status;
  };

  Panel.prototype._setRefreshPhaseV096 = function (phase, { announce = false } = {}) {
    this.__starkRefreshPhaseV096 = phase;
    const button = this.shadowRoot?.querySelector(".refresh");
    if (!button) return;

    const states = {
      idle: { icon:"mdi:refresh", label:"Обновить", busy:false },
      busy: { icon:"mdi:refresh", label:"Обновление данных", busy:true },
      success: { icon:"mdi:check", label:"Запрос обновления выполнен", busy:false },
      error: { icon:"mdi:alert-circle-outline", label:"Не удалось обновить данные", busy:false },
    };
    const state = states[phase] || states.idle;
    for (const name of ["busy", "success", "error"]) {
      button.classList.toggle(`is-${name}-v096`, phase === name);
    }
    button.disabled = state.busy;
    button.setAttribute("aria-busy", state.busy ? "true" : "false");
    button.setAttribute("aria-label", state.label);
    button.setAttribute("title", state.label);
    const icon = button.querySelector("ha-icon");
    if (icon?.getAttribute("icon") !== state.icon) icon?.setAttribute("icon", state.icon);

    const live = this._ensureRefreshStatusV096();
    if (announce && live) live.textContent = state.label;
  };

  Panel.prototype._refreshTargetsV096 = function () {
    if (!this._hass || typeof this._hass.callService !== "function") return null;
    const devices = Array.isArray(this._devices) ? this._devices : [];
    if (!devices.length) return null;
    const targets = [];
    for (const device of devices) {
      const entityId = this._entityId(device, "refresh_now");
      const state = entityId ? this._hass.states?.[entityId] : null;
      if (!state || ["unknown", "unavailable"].includes(String(state.state).toLowerCase())) {
        return null;
      }
      targets.push(entityId);
    }
    return [...new Set(targets)];
  };

  Panel.prototype._showRefreshResultV096 = function (phase, token) {
    if (token !== this.__starkRefreshTokenV096 || !this.isConnected) return;
    window.clearTimeout(this.__starkRefreshResultTimerV096);
    this._setRefreshPhaseV096(phase, { announce:true });
    this.__starkRefreshResultTimerV096 = window.setTimeout(() => {
      if (token !== this.__starkRefreshTokenV096 || !this.isConnected) return;
      this.__starkRefreshResultTimerV096 = null;
      this._setRefreshPhaseV096("idle");
    }, REFRESH_RESULT_MS);
  };

  Panel.prototype._runRefreshV096 = async function () {
    if (this.__starkRefreshInFlightV096) return false;
    window.clearTimeout(this.__starkRefreshResultTimerV096);
    this.__starkRefreshResultTimerV096 = null;
    const token = (this.__starkRefreshTokenV096 || 0) + 1;
    this.__starkRefreshTokenV096 = token;
    this.__starkRefreshInFlightV096 = true;
    const startedAt = performance.now();
    this._setRefreshPhaseV096("busy");

    let succeeded = false;
    try {
      const targets = this._refreshTargetsV096();
      if (targets?.length) {
        const results = await Promise.allSettled(
          targets.map((entityId) => this._hass.callService("button", "press", { entity_id:entityId })),
        );
        succeeded = results.every(
          (result) => result.status === "fulfilled" && result.value !== false,
        );
      }
    } catch (error) {
      console.warn("Stark SolarPower refresh failed", error);
      succeeded = false;
    }

    const remaining = Math.max(0, REFRESH_MINIMUM_MS - (performance.now() - startedAt));
    if (remaining) await wait(remaining);
    if (token !== this.__starkRefreshTokenV096 || !this.isConnected) return false;
    this.__starkRefreshInFlightV096 = false;
    this._showRefreshResultV096(succeeded ? "success" : "error", token);
    return succeeded;
  };

  Panel.prototype._installRefreshV096 = function () {
    const oldButton = this.shadowRoot?.querySelector(".refresh");
    if (!oldButton || oldButton.dataset.starkRefreshV096 === "true") {
      this._setRefreshPhaseV096(this.__starkRefreshPhaseV096 || "idle");
      return;
    }
    const button = oldButton.cloneNode(true);
    button.dataset.starkRefreshV096 = "true";
    oldButton.replaceWith(button);
    button.addEventListener("click", () => { void this._runRefreshV096(); });
    this._setRefreshPhaseV096(this.__starkRefreshPhaseV096 || "idle");
  };

  Panel.prototype._installShellV096 = function () {
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const selector = app?.querySelector(":scope > .global-device-context");
    const viewport = app?.querySelector(":scope > .zoom-viewport-v065");
    const surface = viewport?.querySelector(".zoom-surface-v065");
    const nav = app?.querySelector(":scope > .tabs.bottom-nav-v051");
    if (!root || !app || !header || !viewport || !nav) return;

    app.classList.add("nikas-shell");
    app.classList.toggle("nikas-shell--with-peer", Boolean(selector));
    header.classList.add("nikas-shell__header");
    selector?.classList.add("nikas-shell__peer");
    viewport.classList.add("nikas-shell__viewport");
    surface?.classList.add("nikas-shell__canvas");
    surface?.querySelectorAll(":scope > .work-view-v080").forEach((view) => {
      view.classList.add("nikas-shell__content");
    });
    nav.classList.add("nikas-shell__tabs");
    nav.style.setProperty("--nikas-shell-tab-count", String(nav.querySelectorAll(".tab").length));
    nav.querySelectorAll(".tab").forEach((tab) => tab.classList.add("nikas-shell__tab"));

    header.querySelector(".system-menu-v056")?.classList.add("nikas-shell__side-action");
    header.querySelector(".refresh")?.classList.add(
      "nikas-shell__side-action",
      "nikas-shell__side-action--right",
    );
    header.querySelector(".title-return-v090")?.classList.add("nikas-shell__title");

    if (!root.querySelector("style[data-stark-ui-v096]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV096 = "true";
      style.textContent = `${nikasShellV2Styles()}
        /* Stark UI 0.9.6 — production adoption of NikaS UI Standard v2.2. */
        :host {
          position:relative!important;
          inset:auto!important;
          width:100%!important;
          height:100%!important;
          min-width:0!important;
          min-height:0!important;
        }
        main.app.nikas-shell {
          position:absolute!important;
          inset:0!important;
          width:100%!important;
          height:100%!important;
          max-width:none!important;
          max-height:none!important;
          min-width:0!important;
          min-height:0!important;
          margin:0!important;
          padding:0!important;
          display:grid!important;
          grid-template-areas:"header" "viewport" "tabs"!important;
          grid-template-rows:calc(60px + env(safe-area-inset-top,0px)) minmax(0,1fr) calc(64px + env(safe-area-inset-bottom,0px))!important;
          overflow:hidden!important;
          container:nikas-panel / inline-size;
        }
        main.app.nikas-shell--with-peer {
          grid-template-areas:"header" "peer" "viewport" "tabs"!important;
          grid-template-rows:calc(60px + env(safe-area-inset-top,0px)) 52px minmax(0,1fr) calc(64px + env(safe-area-inset-bottom,0px))!important;
        }
        .app-header.nikas-shell__header {
          grid-area:header!important;
          min-height:0!important;
          height:auto!important;
          margin:0!important;
          padding:env(safe-area-inset-top,0px) calc(12px + env(safe-area-inset-right,0px)) 0 calc(12px + env(safe-area-inset-left,0px))!important;
          display:grid!important;
          grid-template-columns:52px minmax(0,1fr) 52px!important;
          align-items:center!important;
          background:color-mix(in srgb,var(--primary-background-color,#f4f6f8) 97%,transparent)!important;
          border-bottom:1px solid color-mix(in srgb,var(--divider-color,#dfe3e8) 70%,transparent)!important;
          backdrop-filter:blur(18px) saturate(130%)!important;
          -webkit-backdrop-filter:blur(18px) saturate(130%)!important;
        }
        .app-header .system-menu-v056,
        .app-header .refresh {
          width:44px!important;
          min-width:44px!important;
          height:44px!important;
          min-height:44px!important;
          padding:0!important;
          border:1px solid color-mix(in srgb,var(--divider-color,#dfe3e8) 72%,transparent)!important;
          border-radius:16px!important;
          background:var(--card-background-color,#fff)!important;
          box-shadow:0 7px 20px rgba(23,45,76,.08)!important;
        }
        .app-header .title-return-v090 {
          width:min(360px,100%)!important;
          min-width:0!important;
          max-width:100%!important;
          height:52px!important;
          min-height:52px!important;
          padding:5px 14px!important;
        }
        .global-device-context.nikas-shell__peer {
          grid-area:peer!important;
          height:52px!important;
          min-height:52px!important;
          max-height:52px!important;
        }
        .zoom-viewport-v065.nikas-shell__viewport {
          grid-area:viewport!important;
          width:100%!important;
          height:auto!important;
          min-width:0!important;
          min-height:0!important;
          max-height:none!important;
        }
        .zoom-surface-v065 > .work-view-v080.nikas-shell__content {
          width:100%!important;
          max-width:1280px!important;
          min-height:100%!important;
          margin:0 auto!important;
          padding:12px 12px 20px!important;
          box-sizing:border-box!important;
        }
        .tabs.bottom-nav-v051.nikas-shell__tabs {
          grid-area:tabs!important;
          position:relative!important;
          inset:auto!important;
          width:100%!important;
          height:auto!important;
          margin:0!important;
          padding:6px calc(6px + env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) calc(6px + env(safe-area-inset-left,0px))!important;
          grid-template-columns:repeat(var(--nikas-shell-tab-count,5),minmax(0,1fr))!important;
          gap:2px!important;
          border-radius:0!important;
          border-top:1px solid var(--divider-color,#dfe3e8)!important;
          background:var(--card-background-color,#fff)!important;
          box-shadow:0 -5px 22px rgba(23,45,76,.08)!important;
        }
        .bottom-nav-v051 .tab.nikas-shell__tab {
          min-width:0!important;
          width:100%!important;
          height:52px!important;
          min-height:52px!important;
          padding:2px 3px 6px!important;
          border-radius:16px!important;
          display:flex!important;
          flex-direction:column!important;
          align-items:center!important;
          justify-content:center!important;
          gap:1px!important;
          font-family:inherit!important;
          font-size:12px!important;
          font-weight:700!important;
          line-height:1!important;
        }
        .bottom-nav-v051 .tab.nikas-shell__tab ha-icon {
          --mdc-icon-size:26px!important;
          display:block!important;
          flex:0 0 26px!important;
        }
        .bottom-nav-v051 .tab.nikas-shell__tab span {
          display:block!important;
          flex:0 0 14px!important;
          max-width:100%!important;
          font-size:12px!important;
          font-weight:700!important;
          line-height:14px!important;
          white-space:nowrap!important;
          overflow:hidden!important;
          text-overflow:ellipsis!important;
        }
        .zoom-toast-v065 {
          position:absolute!important;
          left:50%!important;
          bottom:12px!important;
        }
        .refresh.is-busy-v096 ha-icon {
          animation:stark-refresh-spin-v096 900ms linear infinite!important;
          color:var(--primary-color,#03a9d9)!important;
        }
        .refresh.is-success-v096 ha-icon { color:#43a047!important; }
        .refresh.is-error-v096 ha-icon { color:#e53935!important; }
        @keyframes stark-refresh-spin-v096 { to { transform:rotate(360deg); } }
        .refresh-status-v096 {
          position:absolute!important;
          width:1px!important;
          height:1px!important;
          padding:0!important;
          margin:-1px!important;
          overflow:hidden!important;
          clip:rect(0,0,0,0)!important;
          white-space:nowrap!important;
          border:0!important;
        }
        .ups-hero-v051 {
          container:stark-hero / inline-size;
        }
        .ups-hero-v051::after {
          content:""!important;
          display:block!important;
          position:absolute!important;
          width:205px!important;
          height:205px!important;
          top:-92px!important;
          right:-70px!important;
          bottom:auto!important;
          left:auto!important;
          border-radius:50%!important;
          background:rgba(3,169,217,0.07)!important;
          opacity:1!important;
          z-index:0!important;
          pointer-events:none!important;
        }
        .hero-head-v051 { position:static!important; }
        .hero-copy-v051 {
          position:relative;
          z-index:6;
          max-width:calc(100% - 194px)!important;
        }
        .connection-v066 {
          position:absolute!important;
          top:13px!important;
          right:13px!important;
          width:168px!important;
          min-width:168px!important;
          max-width:168px!important;
          height:58px!important;
          min-height:58px!important;
          max-height:58px!important;
          box-sizing:border-box!important;
          display:grid!important;
          grid-template-columns:10px minmax(0,1fr)!important;
          align-items:center!important;
          gap:9px!important;
          padding:11px 12px!important;
          border-radius:18px!important;
          box-shadow:0 4px 14px rgba(0,0,0,.055)!important;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;
          z-index:7!important;
        }
        .connection-v066.good {
          color:var(--success-color,#43a047)!important;
          border-color:color-mix(in srgb,var(--success-color,#43a047) 30%,var(--divider-color,#dfe3e8))!important;
          background:color-mix(in srgb,var(--success-color,#43a047) 11%,var(--card-background-color,#fff))!important;
        }
        .connection-v066.bad {
          color:var(--error-color,#db4437)!important;
          border-color:color-mix(in srgb,var(--error-color,#db4437) 30%,var(--divider-color,#dfe3e8))!important;
          background:color-mix(in srgb,var(--error-color,#db4437) 10%,var(--card-background-color,#fff))!important;
        }
        .connection-v066.unknown {
          color:var(--disabled-text-color,var(--secondary-text-color))!important;
          border-color:color-mix(in srgb,var(--secondary-text-color,#68737d) 28%,var(--divider-color,#dfe3e8))!important;
          background:color-mix(in srgb,var(--secondary-text-color,#68737d) 8%,var(--card-background-color,#fff))!important;
        }
        .connection-lamp-v066 {
          width:10px!important;
          height:10px!important;
          flex:0 0 10px!important;
        }
        .connection-copy-v066 {
          display:grid!important;
          gap:3px!important;
          text-align:left!important;
        }
        .connection-copy-v066 strong {
          font-family:inherit!important;
          font-size:16px!important;
          font-weight:700!important;
          line-height:17px!important;
        }
        .connection-copy-v066 small {
          font-family:inherit!important;
          font-size:13px!important;
          font-weight:600!important;
          line-height:14px!important;
        }
        @container stark-hero (max-width:359px) {
          .hero-head-v051 { min-height:150px!important; }
          .hero-copy-v051 {
            max-width:100%!important;
            padding-top:72px!important;
          }
        }
        @container nikas-panel (min-width:600px) {
          .zoom-surface-v065 > .work-view-v080.nikas-shell__content { padding-inline:16px!important; }
        }
        @container nikas-panel (min-width:1024px) {
          .zoom-surface-v065 > .work-view-v080.nikas-shell__content { padding-inline:24px!important; }
        }
        @container nikas-panel (max-width:359px) {
          .app-header.nikas-shell__header { grid-template-columns:48px minmax(0,1fr) 48px!important; }
          .app-header .title-return-v090 { width:100%!important; padding-inline:8px!important; }
        }
        @media(prefers-reduced-motion:reduce) {
          .refresh.is-busy-v096 ha-icon { animation:none!important; }
          .refresh.is-busy-v096 { opacity:.72!important; }
        }
      `;
      root.append(style);
    }
  };

  Panel.prototype._bindEvents = function () {
    previousBindEvents.call(this);
    this._installRefreshV096();
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installShellV096();
    this._installRefreshV096();
    const version = this.shadowRoot?.querySelector(".title-return-v090 .subtitle");
    if (version?.textContent !== `UI v${UI_VERSION}`) version.textContent = `UI v${UI_VERSION}`;
  };

  Panel.prototype.disconnectedCallback = function () {
    this.__starkRefreshTokenV096 = (this.__starkRefreshTokenV096 || 0) + 1;
    this.__starkRefreshInFlightV096 = false;
    window.clearTimeout(this.__starkRefreshResultTimerV096);
    this.__starkRefreshResultTimerV096 = null;
    previousDisconnected?.call(this);
  };
}
