import "./stark-solarpower-panel-v043.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.0";
const UPS_ARTWORK =
  "/stark_solarpower_panel/assets/stark-country-1000-online.png?v=0.5.0";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV050) {
  Panel.prototype.__starkUiV050 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._lineQualityV050 = function (voltage, trusted) {
    if (!trusted || voltage === null) {
      return { label: "Не подтверждено", tone: "unknown" };
    }
    if (voltage >= 210 && voltage <= 230) {
      return { label: "Норма", tone: "good" };
    }
    if ((voltage >= 205 && voltage < 210) || (voltage > 230 && voltage <= 235)) {
      return { label: "Внимание", tone: "warn" };
    }
    if ((voltage >= 198 && voltage < 205) || (voltage > 235 && voltage <= 242)) {
      return { label: "Отклонение", tone: "warn" };
    }
    return { label: "Авария", tone: "bad" };
  };

  Panel.prototype._freshnessV050 = function (device) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const age = this._format(device, "data_age", "Неизвестно");

    if (cloud === false) {
      return {
        label: "Источник недоступен",
        tone: "bad",
        icon: "mdi:cloud-off-outline",
      };
    }
    if (cloud === null) {
      return {
        label: "Источник неизвестен",
        tone: "unknown",
        icon: "mdi:cloud-question-outline",
      };
    }
    if (stale === true) {
      return {
        label: "Данные устарели",
        tone: "warn",
        icon: "mdi:clock-alert-outline",
      };
    }
    if (stale === null) {
      return {
        label: "Свежесть неизвестна",
        tone: "unknown",
        icon: "mdi:clock-question-outline",
      };
    }
    return {
      label: age === "Неизвестно" ? "Данные актуальны" : `Обновлено ${age} назад`,
      tone: "good",
      icon: "mdi:clock-check-outline",
    };
  };

  Panel.prototype._heroCopyV050 = function (device) {
    const headline = this._overviewHeadline(device);
    const mode = this._mode(device);
    const battery = this._numeric(device, "battery_capacity");

    if (mode === "line_mode" && headline.tone === "good") {
      const batteryCopy =
        battery === null
          ? "Состояние АКБ неизвестно"
          : battery >= 95
            ? "АКБ заряжена"
            : `АКБ ${Math.round(battery)} %`;
      return {
        title: "От сети",
        detail: `Выход стабилен · ${batteryCopy}`,
        tone: "good",
      };
    }
    return headline;
  };

  Panel.prototype._reserveV050 = function (device, trusted) {
    const mode = this._mode(device);
    const battery = this._numeric(device, "battery_capacity");
    const onBattery = mode === "battery_mode" || this._isOn(device, "on_battery") === true;

    if (!trusted) {
      return {
        label: "Оценка резерва недоступна",
        tone: "unknown",
        icon: "mdi:battery-unknown",
      };
    }
    if (battery === null) {
      return {
        label: "Состояние резерва неизвестно",
        tone: "unknown",
        icon: "mdi:battery-unknown",
      };
    }
    if (onBattery) {
      return {
        label: `Питание от АКБ · ${Math.round(battery)} %`,
        tone: battery <= 20 ? "bad" : "warn",
        icon: "mdi:battery-arrow-down-outline",
      };
    }
    if (battery <= 20) {
      return {
        label: `Низкий заряд · ${Math.round(battery)} %`,
        tone: "bad",
        icon: "mdi:battery-alert-variant-outline",
      };
    }
    return {
      label: `Резерв готов · АКБ ${Math.round(battery)} %`,
      tone: "good",
      icon: "mdi:battery-check-outline",
    };
  };

  Panel.prototype._metricCardV050 = function (device, key, label, icon, captionKey) {
    const entityId = this._entityId(device, key);
    const caption = captionKey ? this._format(device, captionKey) : "";
    return `<div class="metric-card-v050" ${entityId ? `data-entity="${esc(entityId)}"` : ""}>
      <div class="metric-icon-v050"><ha-icon icon="${esc(icon)}"></ha-icon></div>
      <div class="metric-copy-v050">
        <span>${esc(label)}</span>
        <strong>${esc(this._format(device, key))}</strong>
        ${caption ? `<small>${esc(caption)}</small>` : ""}
      </div>
    </div>`;
  };

  Panel.prototype._statePillV050 = function (label, tone) {
    return `<span class="state-pill-v050 ${esc(tone)}"><i></i>${esc(label)}</span>`;
  };

  Panel.prototype._renderStateSummaryV050 = function (device, trusted, onBattery) {
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

    const inputEntity = this._entityId(device, "input_voltage");
    const batteryEntity = this._entityId(device, "battery_capacity");

    return `<article class="state-card-v050 card-v050">
      <h3>Состояние</h3>
      <div class="state-row-v050 line" ${inputEntity ? `data-entity="${esc(inputEntity)}"` : ""}>
        <div class="state-row-head-v050">
          <div><ha-icon icon="mdi:transmission-tower"></ha-icon><strong>Неотключаемая линия</strong></div>
          ${this._statePillV050(lineState.label, lineState.tone)}
        </div>
        <div class="state-values-v050 three">
          <div><span>Напряжение</span><strong>${esc(this._format(device, "input_voltage"))}</strong></div>
          <div><span>Частота</span><strong>${esc(this._format(device, "input_frequency"))}</strong></div>
          <div><span>Качество</span><strong class="tone-${esc(quality.tone)}">${esc(quality.label)}</strong></div>
        </div>
      </div>
      <div class="state-row-v050 battery" ${batteryEntity ? `data-entity="${esc(batteryEntity)}"` : ""}>
        <div class="state-row-head-v050">
          <div><ha-icon icon="mdi:battery"></ha-icon><strong>АКБ</strong></div>
          ${this._statePillV050(batteryState.label, batteryState.tone)}
        </div>
        <div class="state-values-v050 three">
          <div><span>Заряд</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong></div>
          <div><span>Напряжение</span><strong>${esc(this._format(device, "battery_voltage"))}</strong></div>
          <div><span>Режим</span><strong>${esc(this._modeLabel(device))}</strong></div>
        </div>
      </div>
    </article>`;
  };

  Panel.prototype._renderOverview = function () {
    const selectedId = this._selectedUpsId?.();
    const device = this._devices.find((item) => item.id === selectedId) || this._devices[0];
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

    const inputEntity = this._entityId(device, "input_voltage");
    const outputEntity = this._entityId(device, "output_voltage");
    const batteryEntity = this._entityId(device, "battery_capacity");
    const loadEntity = this._entityId(device, "output_load");
    const modeEntity = this._entityId(device, "mode");

    return `<section class="overview-v050">
      <article class="ups-hero-v050 card-v050 ${esc(headline.tone)}">
        <div class="hero-head-v050">
          <div class="hero-copy-v050">
            <span>ПИТАНИЕ</span>
            <h2>${esc(headline.title)}</h2>
            <p>${esc(headline.detail)}</p>
          </div>
          <div class="freshness-v050 ${esc(freshness.tone)}">
            <ha-icon icon="${esc(freshness.icon)}"></ha-icon>
            <span>${esc(freshness.label)}</span>
          </div>
        </div>

        <div class="hero-scene-v050 ${onBattery ? "battery-flow-v050" : "line-flow-v050"}">
          <div class="scene-window-v050" aria-hidden="true"></div>
          <div class="scene-rack-v050" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <svg class="flow-lines-v050" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path class="line-grid-v050" d="M17 43 H38 Q44 43 44 51 H49" />
            <path class="line-output-v050" d="M51 51 H56 Q56 43 62 43 H83" />
            <path class="line-battery-v050" d="M50 82 V64" />
          </svg>
          <div class="scene-node-v050 grid" ${inputEntity ? `data-entity="${esc(inputEntity)}"` : ""}>
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
            <div><span>Линия</span><strong>${esc(this._format(device, "input_voltage"))}</strong></div>
          </div>
          <div class="scene-node-v050 load" ${loadEntity ? `data-entity="${esc(loadEntity)}"` : ""}>
            <ha-icon icon="mdi:monitor-dashboard"></ha-icon>
            <div><span>Нагрузка</span><strong>${load === null ? "—" : `${Math.round(load)} %`}</strong></div>
          </div>
          <img class="ups-art-v050" src="${UPS_ARTWORK}" alt="Stark Country 1000 ONLINE (16A)" loading="eager" decoding="async" ${modeEntity ? `data-entity="${esc(modeEntity)}"` : ""}>
          <div class="scene-node-v050 battery" ${batteryEntity ? `data-entity="${esc(batteryEntity)}"` : ""}>
            <ha-icon icon="mdi:battery"></ha-icon>
            <div><span>АКБ</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong></div>
          </div>
        </div>

        <div class="reserve-strip-v050 ${esc(reserve.tone)}" ${batteryEntity ? `data-entity="${esc(batteryEntity)}"` : ""}>
          <ha-icon icon="${esc(reserve.icon)}"></ha-icon>
          <strong>${esc(reserve.label)}</strong>
        </div>
      </article>

      <div class="metrics-row-v050">
        ${this._metricCardV050(device, "input_voltage", "ВХОД", "mdi:power-plug", "input_frequency")}
        ${this._metricCardV050(device, "output_voltage", "ВЫХОД", "mdi:sine-wave", "output_frequency")}
        ${this._metricCardV050(device, "output_load", "НАГРУЗКА", "mdi:gauge", "output_current")}
      </div>

      ${this._renderStateSummaryV050(device, trusted, onBattery)}

      <article class="events-card-v050 card-v050">
        <div class="section-head-v050"><h3>Последние события</h3><span>read-only</span></div>
        <div class="overview-events-list">
          ${this._eventRow(device, "battery_mode_events", "Режим АКБ")}
          ${this._eventRow(device, "cloud_telemetry_events", "Облако")}
          ${this._eventRow(device, "data_freshness_events", "Свежесть данных")}
          ${this._eventRow(device, "fault_mode_events", "Аварийный режим")}
        </div>
      </article>
    </section>
    <p class="hint hint-v050">Нажмите и удерживайте показатель, чтобы открыть штатный more-info Home Assistant.</p>`;
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v050]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV050 = "true";
      style.textContent = `
        :host {
          --stark-ice: color-mix(in srgb, var(--primary-color) 9%, var(--card-background-color));
          --stark-line: color-mix(in srgb, var(--primary-color) 74%, #55d7ff);
          color-scheme: light dark;
        }
        .app {
          background: var(--primary-background-color);
          padding-top: 4px !important;
        }
        .app-header {
          min-height: 74px !important;
          margin-bottom: 12px !important;
          border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        }
        .app-header h1 { font-size: 23px !important; font-weight: 800 !important; letter-spacing: -.025em !important; }
        .subtitle { font-size: 14px !important; font-weight: 560 !important; }
        .back,.refresh {
          border: 1px solid color-mix(in srgb, var(--divider-color) 72%, transparent) !important;
          border-radius: 16px !important;
          background: var(--card-background-color) !important;
          box-shadow: 0 7px 20px rgba(23,45,76,.08) !important;
        }
        .global-device-context {
          gap: 0 !important;
          padding: 3px !important;
          border: 1px solid var(--divider-color);
          border-radius: 22px !important;
          overflow: hidden;
          background: var(--card-background-color);
          box-shadow: 0 5px 16px rgba(23,45,76,.045);
        }
        .global-device-context button {
          border: 0 !important;
          border-radius: 18px !important;
          background: transparent !important;
        }
        .global-device-context button.active {
          background: var(--stark-ice) !important;
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color) 22%, transparent);
        }
        .device-health-dot { width: 8px !important; height: 8px !important; flex-basis: 8px !important; }

        .overview-v050 { width: min(100%, 820px); margin: 0 auto; display: grid; gap: 14px; }
        .card-v050 {
          min-width: 0;
          border: 1px solid color-mix(in srgb, var(--divider-color) 84%, transparent);
          border-radius: 28px;
          background: var(--card-background-color);
          box-shadow: 0 10px 30px rgba(23,45,76,.065);
        }
        .ups-hero-v050 {
          position: relative;
          overflow: hidden;
          padding: 18px;
          background:
            radial-gradient(circle at 92% 7%, color-mix(in srgb, var(--primary-color) 10%, transparent) 0 14%, transparent 14.5%),
            linear-gradient(145deg, color-mix(in srgb, var(--primary-color) 5%, var(--card-background-color)), var(--card-background-color) 48%, color-mix(in srgb, #80d8ff 10%, var(--card-background-color)));
        }
        .hero-head-v050 { position: relative; z-index: 4; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 12px; align-items: start; }
        .hero-copy-v050 { min-width: 0; }
        .hero-copy-v050>span { display: block; color: var(--secondary-text-color); font-size: 14px; line-height: 1.2; font-weight: 800; letter-spacing: .075em; }
        .hero-copy-v050 h2 { margin: 7px 0 0; font-size: clamp(34px, 9vw, 46px); line-height: 1; letter-spacing: -.04em; overflow-wrap: anywhere; }
        .hero-copy-v050 p { margin: 7px 0 0; color: var(--secondary-text-color); font-size: 16px; line-height: 1.3; }
        .ups-hero-v050.good .hero-copy-v050 h2 { color: var(--success-color,#2eae55); }
        .ups-hero-v050.warn .hero-copy-v050 h2 { color: var(--warning-color,#ed8b00); }
        .ups-hero-v050.bad .hero-copy-v050 h2 { color: var(--error-color,#d93b3b); }
        .freshness-v050 { min-height: 42px; max-width: 210px; display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px; border: 1px solid color-mix(in srgb,currentColor 18%,transparent); border-radius: 999px; background: color-mix(in srgb,var(--card-background-color) 82%,transparent); box-shadow: 0 5px 16px rgba(23,45,76,.055); font-size: 14px; line-height: 1.2; font-weight: 700; text-align: right; }
        .freshness-v050 ha-icon { --mdc-icon-size: 19px; flex: 0 0 auto; }
        .freshness-v050.good { color: var(--success-color,#2eae55); }
        .freshness-v050.warn { color: var(--warning-color,#ed8b00); }
        .freshness-v050.bad { color: var(--error-color,#d93b3b); }
        .freshness-v050.unknown { color: var(--secondary-text-color); }

        .hero-scene-v050 { position: relative; height: 346px; margin: 10px -18px 0; overflow: hidden; isolation: isolate; }
        .hero-scene-v050::before { content:""; position:absolute; inset:34% 0 0; z-index:-3; background: linear-gradient(180deg,transparent,color-mix(in srgb,var(--primary-color) 4%,var(--card-background-color))); border-top: 1px solid color-mix(in srgb,var(--divider-color) 35%,transparent); }
        .scene-window-v050 { position:absolute; left:3%; top:16%; width:24%; height:62%; z-index:-2; border-radius:4px; opacity:.62; background: linear-gradient(90deg,transparent 48%,rgba(255,255,255,.72) 49% 52%,transparent 53%),linear-gradient(0deg,transparent 48%,rgba(255,255,255,.72) 49% 52%,transparent 53%),linear-gradient(145deg,rgba(210,240,255,.74),rgba(255,255,255,.35)); box-shadow: inset 0 0 0 1px rgba(255,255,255,.58); }
        .scene-rack-v050 { position:absolute; right:2%; top:8%; width:22%; height:73%; z-index:-2; padding:9px 7px; display:grid; grid-template-rows:repeat(4,1fr); gap:8px; border-radius:7px; border:2px solid color-mix(in srgb,var(--secondary-text-color) 18%,transparent); background:color-mix(in srgb,var(--secondary-text-color) 7%,transparent); opacity:.58; }
        .scene-rack-v050 i { display:block; border-radius:3px; background:repeating-linear-gradient(0deg,color-mix(in srgb,var(--secondary-text-color) 15%,transparent) 0 2px,transparent 2px 5px); border:1px solid color-mix(in srgb,var(--secondary-text-color) 11%,transparent); }
        .flow-lines-v050 { position:absolute; inset:0; z-index:1; width:100%; height:100%; overflow:visible; pointer-events:none; }
        .flow-lines-v050 path { fill:none; stroke:var(--stark-line); stroke-width:1.1; vector-effect:non-scaling-stroke; stroke-linecap:round; filter:drop-shadow(0 0 4px color-mix(in srgb,var(--primary-color) 64%,transparent)); }
        .flow-lines-v050 .line-battery-v050 { stroke:color-mix(in srgb,var(--success-color,#2eae55) 76%,#69f0ae); }
        .battery-flow-v050 .line-grid-v050 { stroke:var(--secondary-text-color); opacity:.35; filter:none; }
        .battery-flow-v050 .line-output-v050,.battery-flow-v050 .line-battery-v050 { stroke:var(--warning-color,#ed8b00); }
        .ups-art-v050 { position:absolute; z-index:2; left:50%; bottom:30px; width:min(43%,280px); max-height:77%; object-fit:contain; transform:translateX(-50%); filter:drop-shadow(0 16px 14px rgba(24,39,57,.19)); user-select:none; -webkit-user-drag:none; }
        .scene-node-v050 { position:absolute; z-index:3; min-width:130px; min-height:72px; display:flex; align-items:center; gap:9px; padding:10px 12px; border:1px solid rgba(255,255,255,.78); border-radius:19px; background:color-mix(in srgb,var(--card-background-color) 86%,transparent); box-shadow:0 8px 24px rgba(23,45,76,.095); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
        .scene-node-v050.grid { left:2%; top:34%; }
        .scene-node-v050.load { right:2%; top:34%; }
        .scene-node-v050.battery { left:50%; bottom:5px; transform:translateX(-50%); min-width:142px; }
        .scene-node-v050 ha-icon { --mdc-icon-size:28px; color:var(--primary-color); flex:0 0 auto; }
        .scene-node-v050.battery ha-icon { color:var(--success-color,#2eae55); }
        .battery-flow-v050 .scene-node-v050.battery ha-icon { color:var(--warning-color,#ed8b00); }
        .scene-node-v050 span,.scene-node-v050 strong { display:block; }
        .scene-node-v050 span { color:var(--secondary-text-color); font-size:14px; line-height:1.15; }
        .scene-node-v050 strong { margin-top:2px; font-size:18px; line-height:1.15; }
        .reserve-strip-v050 { min-height:58px; display:flex; align-items:center; gap:12px; padding:10px 16px; border:1px solid color-mix(in srgb,var(--primary-color) 28%,transparent); border-radius:20px; background:color-mix(in srgb,var(--primary-color) 7%,var(--card-background-color)); color:var(--primary-color); }
        .reserve-strip-v050 ha-icon { --mdc-icon-size:28px; }
        .reserve-strip-v050 strong { font-size:17px; line-height:1.2; }
        .reserve-strip-v050.good { color:var(--primary-color); }
        .reserve-strip-v050.warn { color:var(--warning-color,#ed8b00); border-color:color-mix(in srgb,var(--warning-color,#ed8b00) 30%,transparent); background:color-mix(in srgb,var(--warning-color,#ed8b00) 8%,var(--card-background-color)); }
        .reserve-strip-v050.bad { color:var(--error-color,#d93b3b); border-color:color-mix(in srgb,var(--error-color,#d93b3b) 28%,transparent); background:color-mix(in srgb,var(--error-color,#d93b3b) 7%,var(--card-background-color)); }
        .reserve-strip-v050.unknown { color:var(--secondary-text-color); border-color:var(--divider-color); background:color-mix(in srgb,var(--secondary-text-color) 5%,var(--card-background-color)); }

        .metrics-row-v050 { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
        .metric-card-v050 { min-width:0; min-height:116px; display:flex; align-items:center; gap:11px; padding:14px; border:1px solid var(--divider-color); border-radius:23px; background:var(--card-background-color); box-shadow:0 7px 22px rgba(23,45,76,.055); }
        .metric-icon-v050 { width:48px; height:48px; flex:0 0 48px; display:grid; place-items:center; border-radius:50%; background:var(--stark-ice); color:var(--primary-color); }
        .metric-icon-v050 ha-icon { --mdc-icon-size:27px; }
        .metric-copy-v050 { min-width:0; }
        .metric-copy-v050 span,.metric-copy-v050 strong,.metric-copy-v050 small { display:block; }
        .metric-copy-v050 span { color:var(--secondary-text-color); font-size:14px; font-weight:800; line-height:1.15; }
        .metric-copy-v050 strong { margin-top:5px; font-size:24px; line-height:1; letter-spacing:-.02em; overflow-wrap:anywhere; }
        .metric-copy-v050 small { margin-top:6px; color:var(--secondary-text-color); font-size:14px; line-height:1.2; overflow-wrap:anywhere; }

        .state-card-v050,.events-card-v050 { padding:18px; }
        .state-card-v050 h3,.section-head-v050 h3 { margin:0; font-size:24px; line-height:1.15; letter-spacing:-.02em; }
        .state-row-v050 { margin-top:14px; padding:15px 16px; border:1px solid var(--divider-color); border-radius:21px; }
        .state-row-v050.line { border-color:color-mix(in srgb,var(--primary-color) 42%,var(--divider-color)); background:color-mix(in srgb,var(--primary-color) 3%,var(--card-background-color)); }
        .state-row-head-v050 { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .state-row-head-v050>div { min-width:0; display:flex; align-items:center; gap:9px; }
        .state-row-head-v050>div ha-icon { --mdc-icon-size:25px; color:var(--primary-color); flex:0 0 auto; }
        .state-row-v050.battery .state-row-head-v050>div ha-icon { color:var(--success-color,#2eae55); }
        .state-row-head-v050>div strong { font-size:18px; line-height:1.2; overflow-wrap:anywhere; }
        .state-pill-v050 { min-height:34px; flex:0 0 auto; display:inline-flex; align-items:center; gap:7px; padding:6px 11px; border-radius:999px; font-size:14px; font-weight:700; white-space:nowrap; }
        .state-pill-v050 i { width:8px; height:8px; border-radius:50%; background:currentColor; }
        .state-pill-v050.good { color:var(--success-color,#2eae55); background:color-mix(in srgb,var(--success-color,#2eae55) 10%,transparent); }
        .state-pill-v050.warn { color:var(--warning-color,#ed8b00); background:color-mix(in srgb,var(--warning-color,#ed8b00) 11%,transparent); }
        .state-pill-v050.bad { color:var(--error-color,#d93b3b); background:color-mix(in srgb,var(--error-color,#d93b3b) 10%,transparent); }
        .state-pill-v050.unknown { color:var(--secondary-text-color); background:color-mix(in srgb,var(--secondary-text-color) 9%,transparent); }
        .state-values-v050 { margin-top:14px; display:grid; gap:0; }
        .state-values-v050.three { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .state-values-v050>div { min-width:0; padding:0 12px; border-left:1px solid var(--divider-color); }
        .state-values-v050>div:first-child { padding-left:0; border-left:0; }
        .state-values-v050>div:last-child { padding-right:0; }
        .state-values-v050 span,.state-values-v050 strong { display:block; }
        .state-values-v050 span { color:var(--secondary-text-color); font-size:14px; line-height:1.2; }
        .state-values-v050 strong { margin-top:4px; font-size:18px; line-height:1.2; overflow-wrap:anywhere; }
        .tone-good { color:var(--success-color,#2eae55); }
        .tone-warn { color:var(--warning-color,#ed8b00); }
        .tone-bad { color:var(--error-color,#d93b3b); }
        .tone-unknown { color:var(--secondary-text-color); }
        .section-head-v050 { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .section-head-v050>span { color:var(--secondary-text-color); font-size:14px; }
        .events-card-v050 .overview-events-list { margin-top:10px; }
        .events-card-v050 .event-row { min-height:58px !important; padding:10px 2px !important; }
        .hint-v050 { width:min(100%,820px); margin:0 auto; padding-bottom:5px; }

        .diagnostic-card,.history-card { border-radius:24px !important; box-shadow:0 8px 26px rgba(23,45,76,.06) !important; }
        .tabs.bottom-nav { box-shadow:0 -5px 22px rgba(23,45,76,.08) !important; }
        .bottom-nav .tab.active { background:var(--stark-ice) !important; }

        @media (max-width:620px) {
          .hero-head-v050 { grid-template-columns:minmax(0,1fr); }
          .freshness-v050 { justify-self:start; max-width:100%; min-height:38px; }
          .hero-scene-v050 { height:330px; margin-top:4px; }
          .metrics-row-v050 { grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
          .metric-card-v050 { min-height:114px; flex-direction:column; align-items:flex-start; gap:8px; padding:12px; }
          .metric-icon-v050 { width:42px; height:42px; flex-basis:42px; }
          .metric-copy-v050 strong { font-size:21px; }
        }
        @media (max-width:430px) {
          .app { padding-left:max(10px,env(safe-area-inset-left)) !important; padding-right:max(10px,env(safe-area-inset-right)) !important; }
          .app-header h1 { font-size:21px !important; }
          .subtitle { font-size:13px !important; }
          .ups-hero-v050 { padding:15px; border-radius:25px; }
          .hero-copy-v050 h2 { font-size:38px; }
          .hero-copy-v050 p { font-size:15px; }
          .hero-scene-v050 { height:306px; margin-left:-15px; margin-right:-15px; }
          .ups-art-v050 { width:46%; max-height:74%; bottom:28px; }
          .scene-node-v050 { min-width:112px; min-height:65px; gap:7px; padding:8px 9px; border-radius:17px; }
          .scene-node-v050.grid { left:1%; top:34%; }
          .scene-node-v050.load { right:1%; top:34%; }
          .scene-node-v050.battery { min-width:126px; bottom:3px; }
          .scene-node-v050 ha-icon { --mdc-icon-size:24px; }
          .scene-node-v050 span { font-size:13px; }
          .scene-node-v050 strong { font-size:16px; }
          .reserve-strip-v050 { min-height:54px; padding:9px 13px; }
          .reserve-strip-v050 strong { font-size:16px; }
          .metrics-row-v050 { gap:7px; }
          .metric-card-v050 { min-height:108px; border-radius:20px; padding:10px; }
          .metric-icon-v050 { width:39px; height:39px; flex-basis:39px; }
          .metric-icon-v050 ha-icon { --mdc-icon-size:23px; }
          .metric-copy-v050 span,.metric-copy-v050 small { font-size:13px; }
          .metric-copy-v050 strong { font-size:19px; }
          .state-card-v050,.events-card-v050 { padding:15px; border-radius:25px; }
          .state-card-v050 h3,.section-head-v050 h3 { font-size:22px; }
          .state-row-v050 { padding:13px; }
          .state-row-head-v050>div strong { font-size:16px; }
          .state-pill-v050 { min-height:32px; padding:5px 9px; font-size:13px; }
          .state-values-v050>div { padding-left:8px; padding-right:8px; }
          .state-values-v050 span { font-size:12px; }
          .state-values-v050 strong { font-size:16px; }
        }
        @media (max-width:370px) {
          .hero-scene-v050 { height:286px; }
          .scene-node-v050 { min-width:101px; }
          .scene-node-v050 ha-icon { display:none; }
          .metric-card-v050 { padding:9px; }
          .metric-icon-v050 { width:36px; height:36px; flex-basis:36px; }
          .metric-copy-v050 strong { font-size:17px; }
          .state-values-v050 span { font-size:11px; }
          .state-values-v050 strong { font-size:14px; }
        }
        @media (min-width:760px) {
          .hero-scene-v050 { height:400px; }
          .ups-art-v050 { width:min(38%,300px); }
        }
        @media (prefers-reduced-motion:reduce) {
          * { scroll-behavior:auto !important; }
        }
      `;
      root.append(style);
    }
  };
}
