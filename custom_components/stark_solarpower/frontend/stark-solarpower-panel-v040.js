import "./stark-solarpower-panel-v035.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.0";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV040) {
  Panel.prototype.__starkUiV040 = true;

  Panel.prototype._overviewHeadline = function (device) {
    const status = this._status(device);
    const mode = this._mode(device);
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");

    if (cloud === false) {
      return { title: "Нет телеметрии", detail: "SolarPower недоступен", tone: "bad" };
    }
    if (cloud === null) {
      return { title: "Состояние неизвестно", detail: "Нет достоверного состояния облачного канала", tone: "unknown" };
    }
    if (stale === true) {
      return { title: "Данные устарели", detail: "Последний достоверный snapshot старше 6 минут", tone: "warn" };
    }
    if (stale === null) {
      return { title: "Свежесть неизвестна", detail: "Возраст фактических данных определить нельзя", tone: "unknown" };
    }
    if (mode === "battery_mode") {
      return { title: "От батареи", detail: "Нагрузка питается от АКБ", tone: "warn" };
    }
    if (mode === "fault_mode") {
      return { title: "Аварийный режим", detail: "UPS сообщает подтверждённый Fault Mode", tone: "bad" };
    }
    if (mode === "line_mode" && status.tone === "good") {
      return { title: "От сети · Нормально", detail: "UPS питает нагрузку", tone: "good" };
    }
    return {
      title: status.label,
      detail: `Текущий режим: ${this._modeLabel(device)}`,
      tone: status.tone === "good" ? "good" : status.tone === "warn" ? "warn" : "unknown",
    };
  };

  Panel.prototype._overviewOnlineBadge = function (device) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const age = this._format(device, "data_age", "Неизвестно");

    if (cloud === false) return { label: "Нет облака", detail: "Нет свежих данных", tone: "bad", icon: "mdi:cloud-off-outline" };
    if (cloud === null) return { label: "Неизвестно", detail: "Источник не подтверждён", tone: "unknown", icon: "mdi:cloud-question-outline" };
    if (stale === true) return { label: "Устарело", detail: `Возраст ${age}`, tone: "warn", icon: "mdi:clock-alert-outline" };
    if (stale === null) return { label: "Неизвестно", detail: "Свежесть не подтверждена", tone: "unknown", icon: "mdi:clock-question-outline" };
    return { label: "Облако", detail: `Данные ${age} назад`, tone: "good", icon: "mdi:cloud-check-outline" };
  };

  Panel.prototype._overviewStateTile = function (device, kind) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const mode = this._mode(device);
    const battery = this._numeric(device, "battery_capacity");
    const inputVoltage = this._numeric(device, "input_voltage");
    const age = this._format(device, "data_age", "Неизвестно");

    if (kind === "grid") {
      const available = inputVoltage !== null;
      const tone = available ? "good" : mode === "battery_mode" ? "warn" : "unknown";
      const primary = available ? "Есть питание" : mode === "battery_mode" ? "Нет входа" : "Неизвестно";
      const secondary = available ? this._format(device, "input_voltage") : mode === "battery_mode" ? "Работа от АКБ" : "Нет данных";
      return { icon: "mdi:transmission-tower", title: "Сеть", primary, secondary, tone, entity: this._entityId(device, "input_voltage") };
    }
    if (kind === "battery") {
      const tone = battery === null ? "unknown" : battery <= 20 ? "bad" : battery <= 40 ? "warn" : "good";
      const primary = battery === null ? "Нет данных" : `${Math.round(battery)} %`;
      const secondary = mode === "battery_mode" ? "Питает нагрузку" : battery === null ? "Состояние неизвестно" : "Заряжен";
      return { icon: "mdi:battery", title: "АКБ", primary, secondary, tone, entity: this._entityId(device, "battery_capacity") };
    }
    if (kind === "cloud") {
      const tone = cloud === true ? "good" : cloud === false ? "bad" : "unknown";
      const primary = cloud === true ? "Доступно" : cloud === false ? "Недоступно" : "Неизвестно";
      const secondary = cloud === true ? "SolarPower" : cloud === false ? "Нет связи" : "Нет данных";
      return { icon: "mdi:cloud", title: "Облако", primary, secondary, tone, entity: this._entityId(device, "cloud_connected") };
    }

    const tone = stale === false ? "good" : stale === true ? "warn" : "unknown";
    const primary = stale === false ? "Свежие" : stale === true ? "Устарели" : "Неизвестно";
    const secondary = stale === null ? "Нет возраста" : age;
    return { icon: "mdi:clock-outline", title: "Данные", primary, secondary, tone, entity: this._entityId(device, "data_age") };
  };

  Panel.prototype._renderOverviewStateTile = function (tile) {
    const entity = tile.entity ? ` data-entity="${esc(tile.entity)}"` : "";
    return `<div class="overview-state-tile ${esc(tile.tone)}"${entity}>
      <ha-icon icon="${esc(tile.icon)}"></ha-icon>
      <div class="overview-state-copy">
        <strong>${esc(tile.title)}</strong>
        <span>${esc(tile.primary)}</span>
        <small>${esc(tile.secondary)}</small>
      </div>
    </div>`;
  };

  Panel.prototype._renderOverviewHero = function (device) {
    const headline = this._overviewHeadline(device);
    const badge = this._overviewOnlineBadge(device);
    const mode = this._mode(device);
    const onBattery = mode === "battery_mode" || this._isOn(device, "on_battery") === true;
    const input = this._format(device, "input_voltage");
    const output = this._format(device, "output_voltage");
    const battery = this._numeric(device, "battery_capacity");
    const load = this._numeric(device, "output_load");

    const inputEntity = this._entityId(device, "input_voltage");
    const outputEntity = this._entityId(device, "output_voltage");
    const batteryEntity = this._entityId(device, "battery_capacity");
    const loadEntity = this._entityId(device, "output_load");
    const modeEntity = this._entityId(device, "mode");

    const flowClass = onBattery ? "battery-flow" : "line-flow";

    return `<article class="ups-hero-v040 card-v040 ${esc(headline.tone)}">
      <div class="hero-v040-head">
        <div class="hero-v040-copy">
          <div class="hero-v040-kicker">СОСТОЯНИЕ СИСТЕМЫ</div>
          <h2>${esc(headline.title)}</h2>
          <p>${esc(headline.detail)}</p>
        </div>
        <div class="hero-online-badge ${esc(badge.tone)}">
          <span><ha-icon icon="${esc(badge.icon)}"></ha-icon>${esc(badge.label)}</span>
          <small>${esc(badge.detail)}</small>
        </div>
      </div>

      <div class="ups-power-diagram ${flowClass}" aria-label="Схема питания UPS">
        <div class="diagram-node grid-node ${onBattery ? "inactive" : "active"}" ${inputEntity ? `data-entity="${esc(inputEntity)}"` : ""}>
          <ha-icon icon="mdi:transmission-tower"></ha-icon>
          <span>Сеть</span>
          <strong>${esc(input)}</strong>
        </div>
        <div class="diagram-link grid-link"><span></span><ha-icon icon="mdi:chevron-right"></ha-icon></div>
        <div class="diagram-node ups-node active" ${modeEntity ? `data-entity="${esc(modeEntity)}"` : ""}>
          <ha-icon icon="mdi:battery-charging"></ha-icon>
          <strong>UPS</strong>
          <span>${esc(this._modeLabel(device))}</span>
        </div>
        <div class="diagram-link output-link"><span></span><ha-icon icon="mdi:chevron-right"></ha-icon></div>
        <div class="diagram-node load-node active" ${outputEntity ? `data-entity="${esc(outputEntity)}"` : ""}>
          <ha-icon icon="mdi:power-plug"></ha-icon>
          <span>Нагрузка</span>
          <strong>${esc(output)}</strong>
        </div>
        <div class="battery-branch ${onBattery ? "active" : "ready"}">
          <div class="battery-link"><span></span>${onBattery ? '<ha-icon icon="mdi:chevron-up"></ha-icon>' : ""}</div>
          <div class="battery-node" ${batteryEntity ? `data-entity="${esc(batteryEntity)}"` : ""}>
            <ha-icon icon="mdi:battery"></ha-icon>
            <div><span>АКБ</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong><small>${onBattery ? "Питает нагрузку" : "Заряжен"}</small></div>
          </div>
        </div>
      </div>

      <div class="hero-metrics-v040">
        <div class="hero-metric-v040" ${inputEntity ? `data-entity="${esc(inputEntity)}"` : ""}><ha-icon icon="mdi:flash"></ha-icon><div><span>Входное напряжение</span><strong>${esc(input)}</strong></div></div>
        <div class="hero-metric-v040" ${outputEntity ? `data-entity="${esc(outputEntity)}"` : ""}><ha-icon icon="mdi:power-plug"></ha-icon><div><span>Выходное напряжение</span><strong>${esc(output)}</strong></div></div>
        <div class="hero-metric-v040" ${batteryEntity ? `data-entity="${esc(batteryEntity)}"` : ""}><ha-icon icon="mdi:battery"></ha-icon><div><span>Заряд АКБ</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong></div></div>
        <div class="hero-metric-v040" ${loadEntity ? `data-entity="${esc(loadEntity)}"` : ""}><ha-icon icon="mdi:gauge"></ha-icon><div><span>Нагрузка</span><strong>${load === null ? "—" : `${Math.round(load)} %`}</strong></div></div>
      </div>
    </article>`;
  };

  Panel.prototype._renderOverviewEvents = function (device) {
    return `<article class="overview-events-v040 card-v040">
      <div class="section-title-v040">ПОСЛЕДНИЕ СОБЫТИЯ</div>
      <div class="overview-events-list">
        ${this._eventRow(device, "battery_mode_events", "Режим АКБ")}
        ${this._eventRow(device, "cloud_telemetry_events", "Облако")}
        ${this._eventRow(device, "data_freshness_events", "Свежесть данных")}
        ${this._eventRow(device, "fault_mode_events", "Аварийный режим")}
      </div>
    </article>`;
  };

  Panel.prototype._renderOverview = function () {
    const selectedId = this._selectedUpsId?.();
    const device = this._devices.find((item) => item.id === selectedId) || this._devices[0];
    if (!device) return this._empty("UPS не найдены");

    const tiles = ["grid", "battery", "cloud", "freshness"].map((kind) => this._overviewStateTile(device, kind));

    return `<section class="overview-v040">
      ${this._renderOverviewHero(device)}
      <article class="overview-states-v040 card-v040">
        <div class="section-title-v040">СОСТОЯНИЯ</div>
        <div class="overview-state-grid-v040">${tiles.map((tile) => this._renderOverviewStateTile(tile)).join("")}</div>
      </article>
      ${this._renderOverviewEvents(device)}
    </section>
    <p class="hint hint-v040">Нажмите и удерживайте фактический показатель, чтобы открыть штатный more-info Home Assistant.</p>`;
  };

  const previousRender = Panel.prototype._render;
  Panel.prototype._render = function () {
    previousRender.call(this);
    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    if (root.querySelector("style[data-stark-ui-v040]")) return;
    const style = document.createElement("style");
    style.dataset.starkUiV040 = "true";
    style.textContent = `
      .overview-v040 { width:min(100%,820px); margin:0 auto; display:grid; gap:14px; }
      .card-v040 { min-width:0; border:1px solid var(--divider-color); border-radius:22px; background:var(--card-background-color); box-shadow:var(--ha-card-box-shadow,none); }
      .ups-hero-v040 { padding:18px; overflow:hidden; }
      .hero-v040-head { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:14px; align-items:start; }
      .hero-v040-copy { min-width:0; }
      .hero-v040-kicker,.section-title-v040 { color:var(--secondary-text-color); font-size:14px; line-height:1.2; font-weight:750; letter-spacing:.055em; }
      .hero-v040-copy h2 { margin:8px 0 0; font-size:clamp(26px,7vw,34px); line-height:1.05; letter-spacing:-.02em; overflow-wrap:anywhere; }
      .hero-v040-copy p { margin:8px 0 0; color:var(--secondary-text-color); font-size:16px; line-height:1.35; }
      .hero-online-badge { min-width:118px; max-width:150px; text-align:right; }
      .hero-online-badge>span { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:7px; border-radius:999px; padding:8px 13px; font-size:16px; font-weight:750; white-space:nowrap; }
      .hero-online-badge>span ha-icon { --mdc-icon-size:18px; }
      .hero-online-badge small { display:block; margin-top:6px; color:var(--secondary-text-color); font-size:14px; line-height:1.2; white-space:normal; }
      .hero-online-badge.good>span { color:var(--success-color,#2e7d32); background:color-mix(in srgb,var(--success-color,#2e7d32) 11%,transparent); }
      .hero-online-badge.warn>span { color:var(--warning-color,#ed6c02); background:color-mix(in srgb,var(--warning-color,#ed6c02) 12%,transparent); }
      .hero-online-badge.bad>span { color:var(--error-color,#d32f2f); background:color-mix(in srgb,var(--error-color,#d32f2f) 11%,transparent); }
      .hero-online-badge.unknown>span { color:var(--secondary-text-color); background:color-mix(in srgb,var(--secondary-text-color) 10%,transparent); }

      .ups-power-diagram { position:relative; margin:28px 0 22px; display:grid; grid-template-columns:minmax(88px,1fr) 38px minmax(96px,1fr) 38px minmax(88px,1fr); grid-template-rows:auto auto; align-items:center; gap:0 3px; }
      .diagram-node { min-width:0; min-height:112px; border-radius:20px; background:color-mix(in srgb,var(--primary-color) 7%,var(--card-background-color)); display:flex; flex-direction:column; justify-content:center; align-items:center; gap:5px; padding:10px 6px; text-align:center; }
      .diagram-node ha-icon { --mdc-icon-size:31px; color:var(--primary-color); }
      .diagram-node span { color:var(--secondary-text-color); font-size:15px; line-height:1.15; }
      .diagram-node strong { max-width:100%; font-size:18px; line-height:1.15; overflow-wrap:anywhere; }
      .diagram-link { min-width:0; display:flex; align-items:center; color:var(--primary-color); }
      .diagram-link span { height:3px; flex:1; border-radius:999px; background:currentColor; }
      .diagram-link ha-icon { --mdc-icon-size:21px; margin-left:-5px; }
      .battery-branch { grid-column:3; grid-row:2; justify-self:center; width:min(100%,150px); display:grid; justify-items:center; margin-top:0; }
      .battery-link { width:26px; height:38px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; color:var(--secondary-text-color); }
      .battery-link span { width:3px; height:100%; border-radius:999px; background:currentColor; opacity:.45; }
      .battery-link ha-icon { --mdc-icon-size:20px; margin-top:-9px; }
      .battery-node { width:100%; min-height:104px; display:flex; align-items:center; justify-content:center; gap:10px; border-radius:20px; padding:10px; background:color-mix(in srgb,var(--warning-color,#ed6c02) 9%,var(--card-background-color)); }
      .battery-node ha-icon { --mdc-icon-size:30px; color:var(--warning-color,#ed6c02); }
      .battery-node span,.battery-node strong,.battery-node small { display:block; }
      .battery-node span { color:var(--secondary-text-color); font-size:15px; }
      .battery-node strong { font-size:20px; line-height:1.1; }
      .battery-node small { margin-top:4px; color:var(--secondary-text-color); font-size:13px; }
      .battery-branch.active .battery-link { color:var(--warning-color,#ed6c02); }
      .battery-flow .grid-node { opacity:.58; }
      .battery-flow .grid-link { color:var(--secondary-text-color); opacity:.4; }
      .battery-flow .output-link { color:var(--warning-color,#ed6c02); }
      .battery-flow .ups-node ha-icon,.battery-flow .load-node ha-icon { color:var(--warning-color,#ed6c02); }

      .hero-metrics-v040 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); border:1px solid var(--divider-color); border-radius:18px; overflow:hidden; }
      .hero-metric-v040 { min-width:0; min-height:76px; display:flex; align-items:center; gap:11px; padding:12px 14px; border-right:1px solid var(--divider-color); border-bottom:1px solid var(--divider-color); }
      .hero-metric-v040:nth-child(2n) { border-right:0; }
      .hero-metric-v040:nth-last-child(-n+2) { border-bottom:0; }
      .hero-metric-v040 ha-icon { --mdc-icon-size:25px; color:var(--primary-color); flex:0 0 auto; }
      .hero-metric-v040:nth-child(3) ha-icon,.hero-metric-v040:nth-child(4) ha-icon { color:var(--warning-color,#ed6c02); }
      .hero-metric-v040>div { min-width:0; }
      .hero-metric-v040 span,.hero-metric-v040 strong { display:block; }
      .hero-metric-v040 span { color:var(--secondary-text-color); font-size:15px; line-height:1.2; }
      .hero-metric-v040 strong { margin-top:3px; font-size:19px; line-height:1.15; overflow-wrap:anywhere; }

      .overview-states-v040,.overview-events-v040 { padding:18px; }
      .overview-state-grid-v040 { margin-top:14px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
      .overview-state-tile { min-width:0; min-height:100px; display:flex; align-items:center; gap:12px; border:1px solid var(--divider-color); border-radius:18px; padding:13px; }
      .overview-state-tile ha-icon { --mdc-icon-size:29px; flex:0 0 auto; }
      .overview-state-tile.good ha-icon { color:var(--success-color,#2e7d32); }
      .overview-state-tile.warn ha-icon { color:var(--warning-color,#ed6c02); }
      .overview-state-tile.bad ha-icon { color:var(--error-color,#d32f2f); }
      .overview-state-tile.unknown ha-icon { color:var(--secondary-text-color); }
      .overview-state-copy { min-width:0; }
      .overview-state-copy strong,.overview-state-copy span,.overview-state-copy small { display:block; }
      .overview-state-copy strong { font-size:16px; }
      .overview-state-copy span { margin-top:4px; font-size:16px; font-weight:700; overflow-wrap:anywhere; }
      .overview-state-copy small { margin-top:3px; color:var(--secondary-text-color); font-size:14px; line-height:1.2; overflow-wrap:anywhere; }

      .overview-events-list { margin-top:10px; }
      .overview-events-v040 .event-row { min-height:58px !important; padding:10px 2px !important; }
      .overview-events-v040 .event-row>span { font-size:15px !important; }
      .overview-events-v040 .event-copy strong { font-size:16px !important; }
      .overview-events-v040 .event-copy small { font-size:14px !important; }
      .hint-v040 { width:min(100%,820px); margin:0 auto; padding-bottom:4px; }

      @media (max-width:430px) {
        .ups-hero-v040,.overview-states-v040,.overview-events-v040 { padding:16px; }
        .hero-v040-head { grid-template-columns:minmax(0,1fr) 124px; gap:10px; }
        .hero-online-badge { min-width:0; max-width:124px; }
        .hero-online-badge>span { min-height:42px; padding:7px 10px; font-size:15px; }
        .hero-online-badge small { font-size:13px; }
        .ups-power-diagram { grid-template-columns:minmax(82px,1fr) 24px minmax(92px,1fr) 24px minmax(82px,1fr); margin-top:24px; }
        .diagram-node { min-height:108px; padding:9px 5px; }
        .diagram-node span { font-size:14px; }
        .diagram-node strong { font-size:17px; }
        .diagram-link ha-icon { --mdc-icon-size:18px; }
        .battery-branch { width:min(100%,136px); }
        .battery-node { min-height:98px; padding:9px; }
      }
      @media (max-width:390px) {
        .hero-v040-head { grid-template-columns:minmax(0,1fr) 112px; }
        .hero-v040-copy h2 { font-size:25px; }
        .hero-v040-copy p { font-size:15px; }
        .hero-online-badge>span { font-size:14px; padding-left:8px; padding-right:8px; }
        .ups-power-diagram { grid-template-columns:minmax(70px,1fr) 18px minmax(82px,1fr) 18px minmax(70px,1fr); }
        .diagram-node { min-height:102px; border-radius:17px; }
        .diagram-node ha-icon { --mdc-icon-size:27px; }
        .diagram-node strong { font-size:16px; }
        .battery-branch { width:min(100%,126px); }
        .hero-metric-v040 { padding:11px 10px; gap:8px; }
        .hero-metric-v040 span { font-size:14px; }
        .hero-metric-v040 strong { font-size:18px; }
        .overview-state-tile { padding:11px; gap:9px; }
        .overview-state-tile ha-icon { --mdc-icon-size:25px; }
      }
      @media (min-width:760px) {
        .hero-v040-copy h2 { font-size:34px; }
        .overview-state-grid-v040 { grid-template-columns:repeat(4,minmax(0,1fr)); }
      }
    `;
    root.append(style);
  };
}
