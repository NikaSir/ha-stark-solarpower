import "./stark-solarpower-panel-v050.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.1";
const UPS_ARTWORK =
  "/stark_solarpower_panel/assets/stark-country-1000-online.png?v=0.5.1";
const HERO_INTERNET =
  "/stark_solarpower_panel/assets/stark-hero-internet-v051.webp?v=0.5.1";
const HERO_BOILER =
  "/stark_solarpower_panel/assets/stark-hero-boiler-v051.webp?v=0.5.1";

const NAV_ITEMS = [
  ["overview", "mdi:home", "Обзор"],
  ["ups", "mdi:battery-charging", "ИБП"],
  ["events", "mdi:bell", "События"],
  ["history", "mdi:chart-line", "История"],
  ["diagnostics", "mdi:stethoscope", "Диагн."],
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV051) {
  Panel.prototype.__starkUiV051 = true;

  const previousRender = Panel.prototype._render;
  const previousOverview = Panel.prototype._renderOverview;

  Panel.prototype._selectedDeviceV051 = function () {
    const selectedId = this._selectedUpsId?.();
    return this._devices.find((item) => item.id === selectedId) || this._devices[0] || null;
  };

  Panel.prototype._heroBackgroundV051 = function (device) {
    return device?.name?.toLocaleLowerCase("ru").includes("кот") ? HERO_BOILER : HERO_INTERNET;
  };

  Panel.prototype._metricCardV051 = function (device, key, label, icon, captionKey) {
    const entityId = this._entityId(device, key);
    const caption = captionKey ? this._format(device, captionKey) : "";
    return `<div class="metric-card-v051" ${entityId ? `data-entity="${esc(entityId)}"` : ""}>
      <div class="metric-icon-v051"><ha-icon icon="${esc(icon)}"></ha-icon></div>
      <div class="metric-copy-v051">
        <span>${esc(label)}</span>
        <strong>${esc(this._format(device, key))}</strong>
        ${caption ? `<small>${esc(caption)}</small>` : ""}
      </div>
    </div>`;
  };

  Panel.prototype._statePillV051 = function (label, tone) {
    return `<span class="state-pill-v051 ${esc(tone)}">${esc(label)}</span>`;
  };

  Panel.prototype._renderStateSummaryV051 = function (device, trusted, onBattery) {
    const inputVoltage = this._numeric(device, "input_voltage");
    const battery = this._numeric(device, "battery_capacity");
    const quality = this._lineQualityV050(inputVoltage, trusted && !onBattery);
    const lineState = !trusted
      ? { label: "Не подтверждена", tone: "unknown" }
      : onBattery
        ? { label: "Нет входа", tone: "warn" }
        : inputVoltage === null
          ? { label: "Неизвестна", tone: "unknown" }
          : { label: "Активна", tone: "good" };
    const batteryState = !trusted
      ? { label: "Не подтверждена", tone: "unknown" }
      : battery === null
        ? { label: "Неизвестна", tone: "unknown" }
        : onBattery
          ? { label: "Питает нагрузку", tone: battery <= 20 ? "bad" : "warn" }
          : battery <= 20
            ? { label: "Низкий заряд", tone: "bad" }
            : { label: "Резерв готов", tone: "good" };

    return `<article class="state-card-v051 card-v051">
      <h3>Состояние</h3>
      <div class="state-row-v051 line" ${this._entityId(device, "input_voltage") ? `data-entity="${esc(this._entityId(device, "input_voltage"))}"` : ""}>
        <div class="state-row-head-v051">
          <div><ha-icon icon="mdi:transmission-tower"></ha-icon><strong>Неотключаемая линия</strong></div>
          ${this._statePillV051(lineState.label, lineState.tone)}
        </div>
        <div class="state-values-v051 four">
          <div><span>Вход</span><strong>${esc(this._format(device, "input_voltage"))}</strong></div>
          <div><span>Выход</span><strong>${esc(this._format(device, "output_voltage"))}</strong></div>
          <div><span>Частота</span><strong>${esc(this._format(device, "input_frequency"))}</strong></div>
          <div><span>Качество</span><strong class="tone-${esc(quality.tone)}">${esc(quality.label)}</strong></div>
        </div>
      </div>
      <div class="state-row-v051 battery" ${this._entityId(device, "battery_capacity") ? `data-entity="${esc(this._entityId(device, "battery_capacity"))}"` : ""}>
        <div class="state-row-head-v051">
          <div><ha-icon icon="mdi:battery"></ha-icon><strong>АКБ</strong></div>
          ${this._statePillV051(batteryState.label, batteryState.tone)}
        </div>
        <div class="state-values-v051 three">
          <div><span>Заряд</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong></div>
          <div><span>Напряжение</span><strong>${esc(this._format(device, "battery_voltage"))}</strong></div>
          <div><span>Состояние</span><strong>${esc(onBattery ? "В работе" : "Заряжена")}</strong></div>
        </div>
      </div>
    </article>`;
  };

  Panel.prototype._renderOverviewV051 = function () {
    const device = this._selectedDeviceV051();
    if (!device) return this._empty("UPS не найдены");

    const headline = this._heroCopyV050(device);
    const freshness = this._freshnessV050(device);
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const trusted = cloud === true && stale === false;
    const mode = this._mode(device);
    const onBattery = mode === "battery_mode" || this._isOn(device, "on_battery") === true;
    const reserve = this._reserveV050(device, trusted);
    const battery = this._numeric(device, "battery_capacity");
    const load = this._numeric(device, "output_load");
    const background = this._heroBackgroundV051(device);

    return `<section class="overview-v051">
      <article class="ups-hero-v051 card-v051 ${esc(headline.tone)} ${onBattery ? "battery-flow-v051" : "line-flow-v051"}" style="--hero-background-v051:url('${esc(background)}')">
        <div class="hero-head-v051">
          <div class="hero-copy-v051">
            <span>ПИТАНИЕ</span>
            <h2>${esc(headline.title)}</h2>
            <p>${esc(headline.detail)}</p>
          </div>
          <div class="freshness-v051 ${esc(freshness.tone)}">
            <ha-icon icon="${esc(freshness.icon)}"></ha-icon>
            <span>${esc(freshness.label)}</span>
          </div>
        </div>

        <div class="hero-scene-v051">
          <svg class="flow-lines-v051" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path class="line-grid-v051" d="M17 46 H35 Q41 46 41 55 H47" />
            <path class="line-output-v051" d="M53 55 H59 Q59 46 65 46 H83" />
            <path class="line-battery-v051" d="M50 91 V75" />
          </svg>
          <div class="scene-node-v051 grid" ${this._entityId(device, "input_voltage") ? `data-entity="${esc(this._entityId(device, "input_voltage"))}"` : ""}>
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
            <div><span>Сеть</span><strong>${esc(this._format(device, "input_voltage"))}</strong></div>
          </div>
          <div class="scene-node-v051 load" ${this._entityId(device, "output_load") ? `data-entity="${esc(this._entityId(device, "output_load"))}"` : ""}>
            <ha-icon icon="mdi:monitor-dashboard"></ha-icon>
            <div><span>Нагрузка</span><strong>${load === null ? "—" : `${Math.round(load)} %`}</strong></div>
          </div>
          <img class="ups-art-v051" src="${UPS_ARTWORK}" alt="Stark Country 1000 ONLINE (16A)" loading="eager" decoding="async" ${this._entityId(device, "mode") ? `data-entity="${esc(this._entityId(device, "mode"))}"` : ""}>
          <div class="scene-node-v051 battery" ${this._entityId(device, "battery_capacity") ? `data-entity="${esc(this._entityId(device, "battery_capacity"))}"` : ""}>
            <ha-icon icon="mdi:battery"></ha-icon>
            <div><span>АКБ</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong></div>
          </div>
        </div>

        <div class="reserve-strip-v051 ${esc(reserve.tone)}" ${this._entityId(device, "battery_capacity") ? `data-entity="${esc(this._entityId(device, "battery_capacity"))}"` : ""}>
          <ha-icon icon="${esc(reserve.icon)}"></ha-icon>
          <strong>${esc(reserve.label)}</strong>
        </div>
      </article>

      <div class="metrics-row-v051">
        ${this._metricCardV051(device, "input_voltage", "ВХОД", "mdi:power-plug", "input_frequency")}
        ${this._metricCardV051(device, "output_voltage", "ВЫХОД", "mdi:sine-wave", "output_frequency")}
        ${this._metricCardV051(device, "output_load", "НАГРУЗКА", "mdi:gauge", "output_current")}
      </div>

      ${this._renderStateSummaryV051(device, trusted, onBattery)}
    </section>`;
  };

  Panel.prototype._detailRowV051 = function (device, key, label) {
    const entityId = this._entityId(device, key);
    if (!entityId) return "";
    return `<div class="detail-row-v051" data-entity="${esc(entityId)}"><span>${esc(label)}</span><strong>${esc(this._format(device, key))}</strong></div>`;
  };

  Panel.prototype._renderUpsV051 = function () {
    const device = this._selectedDeviceV051();
    if (!device) return this._empty("UPS не найдены");
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const trusted = cloud === true && stale === false;
    const onBattery = this._mode(device) === "battery_mode" || this._isOn(device, "on_battery") === true;
    return `<section class="single-view-v051">
      <article class="detail-card-v051 card-v051">
        <div class="detail-head-v051"><div><span>ИБП</span><h2>${esc(device.name)}</h2><p>${esc(device.model || "STARK Country Online")}</p></div>${this._statePillV051(this._modeLabel(device), trusted ? (onBattery ? "warn" : "good") : "unknown")}</div>
        ${this._renderStateSummaryV051(device, trusted, onBattery)}
        <h3>Рабочие параметры</h3>
        <div class="detail-list-v051">
          ${this._detailRowV051(device, "output_current", "Выходной ток")}
          ${this._detailRowV051(device, "ups_temperature", "Температура ИБП")}
          ${this._detailRowV051(device, "firmware", "Прошивка")}
          ${this._detailRowV051(device, "data_age", "Возраст данных")}
        </div>
      </article>
    </section>`;
  };

  Panel.prototype._renderEventsV051 = function () {
    const device = this._selectedDeviceV051();
    if (!device) return this._empty("UPS не найдены");
    return `<section class="single-view-v051">
      <article class="events-card-v051 card-v051">
        <div class="detail-head-v051"><div><span>СОБЫТИЯ</span><h2>${esc(device.name)}</h2><p>Последние подтверждённые изменения состояний</p></div></div>
        <div class="events-list-v051">
          ${this._eventRow(device, "battery_mode_events", "Режим АКБ")}
          ${this._eventRow(device, "cloud_telemetry_events", "Облако")}
          ${this._eventRow(device, "data_freshness_events", "Свежесть данных")}
          ${this._eventRow(device, "fault_mode_events", "Аварийный режим")}
          ${this._eventRow(device, "extended_telemetry_events", "Расширенная телеметрия")}
        </div>
      </article>
    </section>`;
  };

  Panel.prototype._renderHistory = function () {
    const device = this._selectedDeviceV051();
    if (!device) return this._empty("UPS не найдены");
    const items = [
      ["input_voltage", "Входное напряжение", "mdi:transmission-tower"],
      ["output_voltage", "Выходное напряжение", "mdi:sine-wave"],
      ["output_load", "Нагрузка", "mdi:gauge"],
      ["battery_capacity", "Заряд АКБ", "mdi:battery"],
    ];
    return `<section class="single-view-v051"><article class="history-card history-card-v051">
      <div class="detail-head-v051"><div><span>ИСТОРИЯ</span><h2>${esc(device.name)}</h2><p>Открывается штатная история Home Assistant</p></div></div>
      <div class="history-metrics">
        ${items.map(([key, label, icon]) => {
          const entityId = this._entityId(device, key);
          return entityId ? `<button class="history-link" data-entity="${esc(entityId)}"><ha-icon icon="${esc(icon)}"></ha-icon><span>${esc(label)}</span><strong>${esc(this._format(device, key))}</strong><ha-icon icon="mdi:chart-line"></ha-icon></button>` : "";
        }).join("")}
      </div>
    </article></section>`;
  };

  Panel.prototype._renderOverview = function () {
    if (this._view === "ups") return this._renderUpsV051();
    if (this._view === "events") return this._renderEventsV051();
    if (this._view === "overview") return this._renderOverviewV051();
    return previousOverview.call(this);
  };

  Panel.prototype._installNavigationV051 = function () {
    const root = this.shadowRoot;
    const nav = root?.querySelector(".tabs.bottom-nav, .tabs");
    if (!root || !nav) return;
    nav.classList.add("bottom-nav", "bottom-nav-v051");
    nav.innerHTML = NAV_ITEMS.map(([view, icon, label]) => `<button class="tab ${this._view === view ? "active" : ""}" data-view-v051="${view}" aria-label="${esc(label)}" ${this._view === view ? 'aria-current="page"' : ""}><ha-icon icon="${icon}"></ha-icon><span>${esc(label)}</span></button>`).join("");
    nav.querySelectorAll("button[data-view-v051]").forEach((button) => {
      button.addEventListener("click", () => {
        this._view = button.dataset.viewV051;
        this._queueRender();
      });
    });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
    this._installNavigationV051();

    if (!root.querySelector("style[data-stark-ui-v051]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV051 = "true";
      style.textContent = `
        .global-device-context { min-height: 58px !important; margin-bottom: 12px !important; padding: 2px !important; border-radius: 18px !important; }
        .global-device-context button { min-height: 54px !important; border-radius: 15px !important; font-size: 16px !important; }
        .global-device-context .device-health-dot { display: none !important; }

        .overview-v051,.single-view-v051 { width:min(100%,820px); margin:0 auto; display:grid; gap:12px; }
        .card-v051 { min-width:0; border:1px solid color-mix(in srgb,var(--divider-color) 82%,transparent); border-radius:26px; background:var(--card-background-color); box-shadow:0 9px 28px rgba(23,45,76,.065); }
        .ups-hero-v051 { position:relative; overflow:hidden; padding:16px; background-image:linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.62) 23%,rgba(255,255,255,.08) 56%,rgba(255,255,255,.18) 100%),var(--hero-background-v051); background-size:cover; background-position:center; isolation:isolate; }
        .ups-hero-v051::after { content:""; position:absolute; inset:0; z-index:-1; background:linear-gradient(90deg,rgba(235,248,255,.12),transparent 38%,rgba(235,248,255,.08)); pointer-events:none; }
        .hero-head-v051 { position:relative; z-index:6; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; min-height:91px; }
        .hero-copy-v051>span { display:block; color:var(--secondary-text-color); font-size:13px; font-weight:800; letter-spacing:.13em; }
        .hero-copy-v051 h2 { margin:4px 0 0; color:var(--success-color,#2eae55); font-size:38px; line-height:.98; letter-spacing:-.045em; }
        .hero-copy-v051 p { margin:8px 0 0; color:#525a61; font-size:15px; line-height:1.2; font-weight:520; }
        .ups-hero-v051.warn .hero-copy-v051 h2 { color:var(--warning-color,#ed8b00); }
        .ups-hero-v051.bad .hero-copy-v051 h2 { color:var(--error-color,#d93b3b); }
        .ups-hero-v051.unknown .hero-copy-v051 h2 { color:var(--secondary-text-color); }
        .freshness-v051 { min-height:36px; max-width:48%; display:flex; align-items:center; gap:6px; padding:7px 10px; border:1px solid rgba(255,255,255,.86); border-radius:999px; background:rgba(255,255,255,.88); box-shadow:0 3px 12px rgba(23,45,76,.08); font-size:12px; font-weight:750; line-height:1.15; }
        .freshness-v051 ha-icon { --mdc-icon-size:20px; flex:0 0 auto; }
        .freshness-v051.good { color:var(--success-color,#2eae55); }
        .freshness-v051.warn { color:var(--warning-color,#ed8b00); }
        .freshness-v051.bad { color:var(--error-color,#d93b3b); }
        .freshness-v051.unknown { color:var(--secondary-text-color); }

        .hero-scene-v051 { position:relative; height:220px; margin:0 -12px; isolation:isolate; }
        .flow-lines-v051 { position:absolute; inset:0; z-index:2; width:100%; height:100%; pointer-events:none; filter:drop-shadow(0 0 4px rgba(58,198,255,.84)); }
        .flow-lines-v051 path { fill:none; stroke:var(--stark-line); stroke-width:1.2; stroke-linecap:round; stroke-linejoin:round; vector-effect:non-scaling-stroke; }
        .flow-lines-v051 path.line-battery-v051 { stroke:var(--success-color,#2eae55); }
        .battery-flow-v051 .line-grid-v051 { opacity:.22; stroke:var(--secondary-text-color); filter:none; }
        .battery-flow-v051 .line-battery-v051 { stroke:var(--warning-color,#ed8b00); }
        .ups-art-v051 { position:absolute; z-index:3; left:50%; bottom:25px; width:min(39%,190px); max-height:83%; object-fit:contain; transform:translateX(-50%); filter:drop-shadow(0 11px 12px rgba(15,27,38,.28)); }
        .scene-node-v051 { position:absolute; z-index:4; min-width:104px; min-height:62px; display:flex; align-items:center; gap:7px; padding:8px 10px; border:1px solid rgba(255,255,255,.88); border-radius:17px; background:rgba(255,255,255,.92); box-shadow:0 7px 20px rgba(23,45,76,.10); color:#15191d; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
        .scene-node-v051.grid { left:0; top:38%; }
        .scene-node-v051.load { right:0; top:38%; }
        .scene-node-v051.battery { left:50%; bottom:-1px; min-width:122px; transform:translateX(-50%); }
        .scene-node-v051 ha-icon { --mdc-icon-size:25px; color:var(--primary-color); flex:0 0 auto; }
        .scene-node-v051.battery ha-icon { color:var(--success-color,#2eae55); }
        .battery-flow-v051 .scene-node-v051.battery ha-icon { color:var(--warning-color,#ed8b00); }
        .scene-node-v051 span,.scene-node-v051 strong { display:block; }
        .scene-node-v051 span { color:#606970; font-size:13px; line-height:1.1; }
        .scene-node-v051 strong { margin-top:3px; color:#171b1f; font-size:16px; line-height:1.05; }
        .reserve-strip-v051 { position:relative; z-index:6; min-height:49px; display:flex; align-items:center; gap:10px; padding:8px 14px; border:1px solid color-mix(in srgb,var(--primary-color) 28%,transparent); border-radius:17px; background:rgba(243,251,255,.94); color:var(--primary-color); }
        .reserve-strip-v051 ha-icon { --mdc-icon-size:25px; }
        .reserve-strip-v051 strong { font-size:15px; line-height:1.15; }
        .reserve-strip-v051.warn { color:var(--warning-color,#ed8b00); border-color:color-mix(in srgb,var(--warning-color,#ed8b00) 30%,transparent); }
        .reserve-strip-v051.bad { color:var(--error-color,#d93b3b); border-color:color-mix(in srgb,var(--error-color,#d93b3b) 30%,transparent); }
        .reserve-strip-v051.unknown { color:var(--secondary-text-color); border-color:var(--divider-color); }

        .metrics-row-v051 { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
        .metric-card-v051 { min-width:0; min-height:92px; display:flex; align-items:flex-start; gap:8px; padding:11px; border:1px solid var(--divider-color); border-radius:21px; background:var(--card-background-color); box-shadow:0 5px 18px rgba(23,45,76,.05); }
        .metric-icon-v051 { width:39px; height:39px; flex:0 0 39px; display:grid; place-items:center; border-radius:50%; background:var(--stark-ice); color:var(--primary-color); }
        .metric-icon-v051 ha-icon { --mdc-icon-size:23px; }
        .metric-copy-v051 { min-width:0; padding-top:2px; }
        .metric-copy-v051 span,.metric-copy-v051 strong,.metric-copy-v051 small { display:block; }
        .metric-copy-v051 span { color:var(--secondary-text-color); font-size:12px; font-weight:800; line-height:1.1; }
        .metric-copy-v051 strong { margin-top:5px; color:var(--primary-text-color); font-size:19px; line-height:1; letter-spacing:-.02em; overflow-wrap:anywhere; }
        .metric-copy-v051 small { margin-top:7px; color:var(--secondary-text-color); font-size:12px; line-height:1.1; overflow-wrap:anywhere; }

        .state-card-v051 { padding:14px; }
        .state-card-v051 h3 { margin:0 0 10px; font-size:22px; line-height:1.1; }
        .state-row-v051 { padding:11px 12px; border:1px solid var(--divider-color); border-radius:18px; }
        .state-row-v051+.state-row-v051 { margin-top:9px; }
        .state-row-v051.line { border-color:color-mix(in srgb,var(--primary-color) 38%,var(--divider-color)); background:color-mix(in srgb,var(--primary-color) 3%,var(--card-background-color)); }
        .state-row-head-v051 { display:flex; align-items:center; justify-content:space-between; gap:9px; }
        .state-row-head-v051>div { min-width:0; display:flex; align-items:center; gap:7px; }
        .state-row-head-v051 ha-icon { --mdc-icon-size:22px; color:var(--primary-color); }
        .state-row-v051.battery .state-row-head-v051 ha-icon { color:var(--success-color,#2eae55); }
        .state-row-head-v051 strong { font-size:15px; line-height:1.15; }
        .state-pill-v051 { flex:0 0 auto; padding:6px 9px; border-radius:999px; font-size:12px; font-weight:750; white-space:nowrap; }
        .state-pill-v051.good { color:var(--success-color,#2eae55); background:color-mix(in srgb,var(--success-color,#2eae55) 10%,transparent); }
        .state-pill-v051.warn { color:var(--warning-color,#ed8b00); background:color-mix(in srgb,var(--warning-color,#ed8b00) 10%,transparent); }
        .state-pill-v051.bad { color:var(--error-color,#d93b3b); background:color-mix(in srgb,var(--error-color,#d93b3b) 10%,transparent); }
        .state-pill-v051.unknown { color:var(--secondary-text-color); background:color-mix(in srgb,var(--secondary-text-color) 9%,transparent); }
        .state-values-v051 { display:grid; margin-top:10px; }
        .state-values-v051.four { grid-template-columns:repeat(4,minmax(0,1fr)); }
        .state-values-v051.three { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .state-values-v051>div { min-width:0; padding:0 8px; border-left:1px solid var(--divider-color); }
        .state-values-v051>div:first-child { padding-left:0; border-left:0; }
        .state-values-v051>div:last-child { padding-right:0; }
        .state-values-v051 span,.state-values-v051 strong { display:block; }
        .state-values-v051 span { color:var(--secondary-text-color); font-size:11px; line-height:1.1; }
        .state-values-v051 strong { margin-top:4px; color:var(--primary-text-color); font-size:14px; line-height:1.15; overflow-wrap:anywhere; }
        .state-values-v051 .tone-good { color:var(--success-color,#2eae55); }
        .state-values-v051 .tone-warn { color:var(--warning-color,#ed8b00); }
        .state-values-v051 .tone-bad { color:var(--error-color,#d93b3b); }
        .state-values-v051 .tone-unknown { color:var(--secondary-text-color); }

        .detail-card-v051,.events-card-v051 { padding:16px; }
        .detail-card-v051 .state-card-v051 { margin:14px 0; box-shadow:none; }
        .detail-head-v051 { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .detail-head-v051>div>span { color:var(--secondary-text-color); font-size:12px; font-weight:800; letter-spacing:.1em; }
        .detail-head-v051 h2 { margin:4px 0 0; font-size:24px; }
        .detail-head-v051 p { margin:5px 0 0; color:var(--secondary-text-color); font-size:13px; line-height:1.3; }
        .detail-card-v051>h3 { margin:16px 0 7px; color:var(--secondary-text-color); font-size:14px; }
        .detail-list-v051 { border-top:1px solid var(--divider-color); }
        .detail-row-v051 { min-height:47px; display:flex; align-items:center; justify-content:space-between; gap:12px; border-bottom:1px solid var(--divider-color); }
        .detail-row-v051 span { color:var(--secondary-text-color); font-size:13px; }
        .detail-row-v051 strong { font-size:13px; text-align:right; }
        .events-list-v051 { margin-top:15px; }
        .events-list-v051 .event-row { min-height:58px !important; }
        .history-card-v051 { padding:16px !important; }
        .history-card-v051 .history-metrics { margin-top:14px; }

        .tabs.bottom-nav-v051 { grid-template-columns:repeat(5,minmax(0,1fr)) !important; gap:1px !important; }
        .bottom-nav-v051 .tab { min-height:60px !important; padding:5px 1px !important; border-radius:13px !important; font-size:12px !important; }
        .bottom-nav-v051 .tab ha-icon { --mdc-icon-size:24px !important; }

        @media (max-width:430px) {
          .app { padding-left:max(10px,env(safe-area-inset-left)) !important; padding-right:max(10px,env(safe-area-inset-right)) !important; }
          .app-header { min-height:68px !important; margin-bottom:8px !important; }
          .app-header h1 { font-size:21px !important; }
          .subtitle { font-size:12px !important; }
          .global-device-context { min-height:55px !important; margin-bottom:10px !important; }
          .global-device-context button { min-height:51px !important; font-size:15px !important; }
          .ups-hero-v051 { padding:14px; border-radius:23px; }
          .hero-head-v051 { min-height:86px; }
          .hero-copy-v051 h2 { font-size:35px; }
          .hero-copy-v051 p { font-size:14px; }
          .freshness-v051 { max-width:47%; padding:6px 8px; font-size:11px; }
          .hero-scene-v051 { height:205px; margin:0 -10px; }
          .ups-art-v051 { width:41%; bottom:22px; }
          .scene-node-v051 { min-width:96px; min-height:58px; padding:7px 8px; }
          .scene-node-v051 span { font-size:12px; }
          .scene-node-v051 strong { font-size:15px; }
          .scene-node-v051 ha-icon { --mdc-icon-size:22px; }
          .scene-node-v051.battery { min-width:112px; }
          .reserve-strip-v051 { min-height:46px; padding:7px 11px; }
          .reserve-strip-v051 strong { font-size:14px; }
          .metric-card-v051 { min-height:88px; padding:9px; flex-direction:column; gap:6px; }
          .metric-icon-v051 { width:35px; height:35px; flex-basis:35px; }
          .metric-copy-v051 strong { font-size:17px; }
          .metric-copy-v051 small { margin-top:5px; }
          .state-card-v051 { padding:12px; }
          .state-card-v051 h3 { font-size:20px; }
          .state-row-v051 { padding:10px; }
          .state-row-head-v051 strong { font-size:14px; }
          .state-pill-v051 { font-size:11px; }
          .state-values-v051>div { padding-left:5px; padding-right:5px; }
          .state-values-v051 span { font-size:10px; }
          .state-values-v051 strong { font-size:12px; }
        }
        @media (max-width:370px) {
          .freshness-v051 { max-width:45%; }
          .scene-node-v051 { min-width:87px; }
          .scene-node-v051 ha-icon { display:none; }
          .bottom-nav-v051 .tab { font-size:10px !important; }
        }
        @media (min-width:760px) {
          .hero-scene-v051 { height:330px; }
          .ups-art-v051 { width:min(34%,250px); }
        }
      `;
      root.append(style);
    }
  };
}
