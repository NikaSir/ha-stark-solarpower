import "./stark-solarpower-panel-v099.js";

const Panel = customElements.get("stark-solarpower-panel");
const UPS_ARTWORK = "/stark_solarpower_panel/assets/stark-country-1000-online.png?v=0.6.6";
const MOSCOW_TIME = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Europe/Moscow", day: "2-digit", month: "2-digit",
  hour: "2-digit", minute: "2-digit",
});
const VOLTAGE = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 });
const POWER_TONES = {
  line_mode: "good", battery_mode: "warn", bypass_mode: "warn",
  standby_mode: "warn", shutdown_mode: "warn", fault_mode: "bad",
};
const POWER_ICONS = {
  line_mode: "mdi:power-plug-outline", battery_mode: "mdi:battery-arrow-down-outline",
  bypass_mode: "mdi:swap-horizontal", standby_mode: "mdi:power-standby",
  shutdown_mode: "mdi:power-off", fault_mode: "mdi:alert-circle-outline",
};

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function deviceTitle(name) {
  return name.replace(/^UPS\b/i, "ИБП").replace(/Котел$/u, "Котёл");
}

function timestamp(panel, device, key) {
  const state = panel._state(device, key)?.state;
  const value = state && Date.parse(state);
  return Number.isFinite(value) ? `${MOSCOW_TIME.format(value)} МСК` : "—";
}

function runtime(minutes) {
  if (minutes === null || minutes < 0) return "—";
  const count = Math.round(minutes);
  const hours = Math.floor(count / 60);
  return hours ? `≈ ${hours} ч ${String(count % 60).padStart(2, "0")} мин` : `≈ ${count} мин`;
}

function entityAttr(panel, device, key) {
  const id = panel._entityId(device, key);
  return id ? ` data-entity="${esc(id)}"` : "";
}

function metric(label, text, icon, entity, tone = "", extra = "") {
  return `<div class="ups-overview-metric ${esc(tone)}"${entity}>
    <ha-icon icon="${icon}" aria-hidden="true"></ha-icon>
    <div><span>${label}</span><strong>${esc(text)}</strong></div>${extra}
  </div>`;
}

function status(text, tone, icon) {
  return `<p class="ups-overview-status ${esc(tone)}"><ha-icon icon="${icon}" aria-hidden="true"></ha-icon>${esc(text)}</p>`;
}

function overviewCard(panel, device) {
  const { channel, freshness } = panel._connectionStatusV066(device);
  const current = channel.tone === "good" && freshness.tone === "current";
  const mode = current ? panel._mode(device) : null;
  const powerTone = Object.hasOwn(POWER_TONES, mode) ? POWER_TONES[mode] : "unknown";
  const powerTitle = powerTone === "unknown" ? "Неизвестно" : panel._modeLabel(device);
  const powerIcon = powerTone === "unknown" ? "mdi:help-circle-outline" : POWER_ICONS[mode];
  const reading = (key) => {
    const state = panel._state(device, key)?.state;
    return current && String(state ?? "").trim() ? panel._numeric(device, key) : null;
  };
  const voltage = (key) => {
    const value = reading(key);
    return value === null ? "—" : `${VOLTAGE.format(value)} В`;
  };
  const load = reading("output_load");
  const filled = Math.max(0, Math.min(10, Math.round((load ?? 0) / 10)));
  const segments = `<span class="ups-load-bar" aria-hidden="true">${Array.from({ length: 10 },
    (_, index) => `<i class="${index < filled ? "filled" : ""}"></i>`).join("")}</span>`;
  const channelIcon = { good: "mdi:cloud-outline", bad: "mdi:cloud-off-outline", unknown: "mdi:cloud-question-outline" };
  const freshnessIcon = { current: "mdi:check-circle-outline", warn: "mdi:clock-alert-outline", unknown: "mdi:clock-question-outline" };
  const autonomy = runtime(reading("battery_remain_time"));
  const entity = (key) => entityAttr(panel, device, key);
  return `<article class="ups-overview-card" aria-label="${esc(deviceTitle(device.name))}">
    <div class="ups-overview-hero">
      <div>
        <h2>${esc(deviceTitle(device.name))}</h2>
        ${status(channel.label, channel.tone, channelIcon[channel.tone])}
        ${status(freshness.label, freshness.tone, freshnessIcon[freshness.tone])}
      </div>
      <img src="${UPS_ARTWORK}" alt="" width="136" height="100" decoding="async">
    </div>
    <div class="ups-overview-grid">
      ${metric("Питание", powerTitle, powerIcon, entity("mode"), powerTone)}
      ${metric("Нагрузка", load === null ? "—" : `${Math.round(load)} %`, "mdi:signal", entity("output_load"), "", segments)}
      ${metric("АКБ", voltage("battery_voltage"), "mdi:battery-outline", entity("battery_voltage"))}
      ${metric("Вход", voltage("input_voltage"), "mdi:sine-wave", entity("input_voltage"))}
    </div>
    <div class="ups-overview-runtime ${autonomy === "—" ? "unknown" : ""}"${entity("battery_remain_time")}>
      <ha-icon icon="mdi:clock-outline" aria-hidden="true"></ha-icon>
      <span>Автономность</span><strong>${esc(autonomy)}</strong>
    </div>
    <details>
      <summary>Подробнее<ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon></summary>
      <dl>
        <div${entity("data_timestamp")}><dt>Снимок</dt><dd>${esc(timestamp(panel, device, "data_timestamp"))}</dd></div>
        <div${entity("last_successful_update")}><dt>Обмен</dt><dd>${esc(timestamp(panel, device, "last_successful_update"))}</dd></div>
      </dl>
    </details>
  </article>`;
}

function overview(panel, devices, busy) {
  return `<section class="ups-overview" aria-label="Обзор ИБП" aria-busy="${busy}">
    ${devices.map((device) => overviewCard(panel, device)).join("")}
  </section>`;
}

const styles = `
  main.app.ups-overview-active.nikas-shell--with-peer {
    grid-template-areas:"header" "viewport" "tabs"!important;
    grid-template-rows:calc(60px + env(safe-area-inset-top,0px)) minmax(0,1fr) calc(64px + env(safe-area-inset-bottom,0px))!important;
  }
  .ups-overview-active > .global-device-context { display:none!important; }
  .ups-overview { display:grid; gap:10px; max-width:820px; margin:0 auto; padding-bottom:16px; }
  .ups-overview-card {
    --ups-edge:color-mix(in srgb,var(--divider-color,#808080) 75%,transparent);
    --ups-tile:color-mix(in srgb,var(--primary-color,#03a9d9) 5%,var(--card-background-color,#222));
    display:grid; gap:6px; padding:8px; min-width:0;
    border:1px solid var(--ups-edge); border-radius:18px;
    background:var(--card-background-color,#222); color:var(--primary-text-color,#fff);
  }
  .ups-overview-hero {
    display:grid; grid-template-columns:minmax(0,1fr) minmax(0,36%); gap:4px;
    align-items:center; padding:2px 6px; border-radius:12px;
    background:radial-gradient(ellipse at 82% 52%,color-mix(in srgb,var(--primary-color,#03a9d9) 18%,transparent),transparent 58%);
  }
  .ups-overview-hero img { display:block; width:100%; height:97px; object-fit:contain; }
  .ups-overview h2 { margin:0 0 5px; font-size:clamp(18px,5vw,24px); line-height:1.15; overflow-wrap:anywhere; }
  .ups-overview-status {
    display:flex; align-items:center; gap:5px; margin:2px 0; font-size:13px; line-height:1.2;
  }
  .ups-overview ha-icon { --mdc-icon-size:20px; flex:none; color:var(--primary-color,#03a9d9); }
  .ups-overview .warn ha-icon, .ups-overview-status.warn { color:var(--warning-color,#b36b00); }
  .ups-overview .bad ha-icon { color:var(--error-color,#d64545); }
  .ups-overview .unknown ha-icon, .ups-overview .current ha-icon { color:var(--secondary-text-color,#918f90); }
  .ups-overview-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:5px; }
  .ups-overview-metric, .ups-overview-runtime {
    border:1px solid var(--ups-edge); border-radius:10px; background:var(--ups-tile);
    display:flex; align-items:center; gap:6px; min-width:0; padding:4px 7px;
  }
  .ups-overview-metric { flex-wrap:wrap; align-content:center; min-height:49px; column-gap:7px; row-gap:3px; }
  .ups-overview-metric div { flex:1; min-width:0; }
  .ups-overview-metric span, .ups-overview-metric strong { display:block; }
  .ups-overview-metric span, .ups-overview-runtime span { font-size:13px; line-height:1.15; }
  .ups-overview-metric strong, .ups-overview-runtime strong { font-size:16px; line-height:1.15; overflow-wrap:anywhere; }
  .ups-overview-runtime { min-height:33px; }
  .ups-overview-runtime strong { margin-inline-start:auto; text-align:end; }
  .ups-overview-metric .ups-load-bar { display:flex; gap:2px; width:100%; }
  .ups-load-bar i { flex:1; height:3px; border-radius:2px; background:var(--divider-color,#777); }
  .ups-load-bar i.filled { background:var(--primary-color,#03a9d9); }
  .ups-overview details { min-width:0; }
  .ups-overview summary {
    display:flex; align-items:center; justify-content:space-between; list-style:none;
    padding:0 5px; min-height:44px; cursor:pointer; font-size:14px; font-weight:700;
    color:var(--primary-color,#03a9d9);
  }
  .ups-overview summary::-webkit-details-marker { display:none; }
  .ups-overview details[open] summary ha-icon { transform:rotate(180deg); }
  .ups-overview dl { display:grid; gap:3px; margin:0; }
  .ups-overview dl div {
    display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:2px 8px;
    background:var(--ups-tile); border-radius:6px; padding:5px 8px; font-size:12px;
  }
  .ups-overview dd { margin:0; }
`;

if (Panel) {
  const previousRender = Panel.prototype._render;
  const previousNavigation = Panel.prototype._installNavigationV051;
  const previousDiagnostics = Panel.prototype._renderDiagnostics;
  const previousKey = Panel.prototype._viewCacheKeyV080;
  const previousStructure = Panel.prototype._viewStructureKeyV080;
  const previousContext = Panel.prototype._stateKeyV065;

  Panel.prototype._renderOverviewV051 = function () {
    return this._devices.length
      ? overview(this, this._devices, false)
      : this._empty("Устройства Stark SolarPower не найдены");
  };

  Panel.prototype._installStartupOverviewV086 = function () {
    if (this._registryLoaded || this._registryError || this._view !== "overview") return;
    const empty = this.shadowRoot?.querySelector(".zoom-surface-v065 .empty, .empty");
    if (!empty) return;
    const template = document.createElement("template");
    template.innerHTML = overview(this, [{ name: "ИБП" }, { name: "ИБП" }], true);
    empty.replaceWith(template.content);
  };

  Panel.prototype._viewCacheKeyV080 = function () {
    return this._view === "overview" ? "overview" : previousKey.call(this);
  };
  Panel.prototype._stateKeyV065 = function () {
    return this._view === "overview" ? "overview" : previousContext.call(this);
  };
  Panel.prototype._viewStructureKeyV080 = function () {
    if (this._view !== "overview") return previousStructure.call(this);
    return JSON.stringify(this._devices.map(({ id, name, entities }) => [id, name, entities]));
  };

  Panel.prototype._installNavigationV051 = function () {
    previousNavigation.call(this);
    const nav = this.shadowRoot?.querySelector(".bottom-nav-v051");
    if (!nav) return;
    nav.querySelector('[data-view-v051="ups"]')?.remove();
    nav.querySelector('[data-view-v051="events"]')?.remove();
    const diagnostics = nav.querySelector('[data-view-v051="diagnostics"]');
    if (diagnostics) {
      diagnostics.setAttribute("aria-label", "Диагностика");
      diagnostics.querySelector("span").textContent = "Диагностика";
      nav.insertBefore(diagnostics, nav.querySelector('[data-view-v051="history"]'));
    }
  };

  Panel.prototype._renderDiagnostics = function () {
    return previousDiagnostics.call(this) + this._renderUpsV051() + this._renderEventsV051();
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    if (!app) return;
    app.classList.toggle("ups-overview-active", this._view === "overview");
    const title = root.querySelector(".title-return-name-v090");
    if (title && title.textContent !== "Stark SolarPower") title.textContent = "Stark SolarPower";
    if (!root.querySelector("style[data-stark-overview-v100]")) {
      const style = document.createElement("style");
      style.dataset.starkOverviewV100 = "true";
      style.textContent = styles;
      root.append(style);
    }
  };
}
