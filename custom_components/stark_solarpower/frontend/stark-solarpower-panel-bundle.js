// GENERATED FILE. DO NOT EDIT DIRECTLY.
// Stark SolarPower self-contained Home Assistant panel bundle.
// Source history is composed at build time; no previous UI file is loaded at runtime.

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel.js
(() => {
const DOMAIN = "stark_solarpower";
const UI_VERSION = "0.1.0";

const ENTITY_KEYS = [
  "extended_telemetry_events",
  "cloud_telemetry_events",
  "data_freshness_events",
  "battery_mode_events",
  "fault_mode_events",
  "last_successful_update",
  "positive_bus_voltage",
  "negative_bus_voltage",
  "ambient_temperature",
  "charger_temperature",
  "battery_piece_number",
  "battery_group_number",
  "battery_remain_time",
  "input_relay_status",
  "output_relay_status",
  "dctodc_status",
  "inverter_status",
  "pfc_temperature",
  "ups_temperature",
  "protocol_id",
  "battery_capacity",
  "battery_voltage",
  "input_frequency",
  "output_frequency",
  "output_current",
  "input_voltage",
  "output_voltage",
  "output_load",
  "cloud_connected",
  "data_stale",
  "on_battery",
  "data_timestamp",
  "data_age",
  "firmware",
  "refresh_now",
  "mode",
];

const MODE_LABELS = {
  line_mode: "От сети",
  battery_mode: "От батареи",
  standby_mode: "Ожидание",
  bypass_mode: "Байпас",
  fault_mode: "Авария",
  shutdown_mode: "Выключен",
  unknown: "Неизвестно",
};

const DIAGNOSTIC_GROUPS = [
  {
    title: "Качество данных",
    items: [
      ["cloud_connected", "Облачная телеметрия"],
      ["data_stale", "Данные устарели"],
      ["data_age", "Возраст данных"],
      ["data_timestamp", "Время данных ИБП"],
      ["last_successful_update", "Последнее успешное обновление"],
    ],
  },
  {
    title: "Электрические параметры",
    items: [
      ["input_voltage", "Входное напряжение"],
      ["input_frequency", "Входная частота"],
      ["output_voltage", "Выходное напряжение"],
      ["output_frequency", "Выходная частота"],
      ["output_current", "Выходной ток"],
      ["output_load", "Нагрузка"],
      ["battery_capacity", "Заряд АКБ"],
      ["battery_voltage", "Напряжение АКБ"],
    ],
  },
  {
    title: "Расширенная телеметрия",
    items: [
      ["positive_bus_voltage", "Положительная шина DC"],
      ["negative_bus_voltage", "Отрицательная шина DC"],
      ["ups_temperature", "Температура ИБП"],
      ["pfc_temperature", "Температура PFC"],
      ["ambient_temperature", "Температура окружающей среды"],
      ["charger_temperature", "Температура зарядного устройства"],
    ],
  },
  {
    title: "Сервисные параметры",
    items: [
      ["protocol_id", "Протокол ИБП"],
      ["firmware", "Прошивка ИБП"],
      ["battery_piece_number", "Количество АКБ"],
      ["battery_remain_time", "Остаток времени АКБ (RAW ИБП)"],
      ["battery_group_number", "Параметр группы АКБ (RAW ИБП)"],
      ["input_relay_status", "Входное реле"],
      ["output_relay_status", "Выходное реле"],
      ["inverter_status", "Состояние инвертора"],
      ["dctodc_status", "Состояние DC-DC"],
      ["pfc_status", "Состояние PFC"],
    ],
  },
];

const HISTORY_ITEMS = [
  ["input_voltage", "Входное напряжение", "mdi:flash"],
  ["output_voltage", "Выходное напряжение", "mdi:power-plug"],
  ["output_load", "Нагрузка", "mdi:gauge"],
  ["battery_capacity", "Заряд АКБ", "mdi:battery"],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

class StarkSolarPowerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._panel = null;
    this._devices = [];
    this._loadingRegistry = false;
    this._registryLoaded = false;
    this._registryError = null;
    this._view = "overview";
    this._diagnosticDeviceId = null;
    this._renderQueued = false;
  }

  set hass(value) {
    this._hass = value;
    if (!this._registryLoaded && !this._loadingRegistry) {
      this._loadRegistry();
    }
    this._queueRender();
  }

  get hass() {
    return this._hass;
  }

  set panel(value) {
    this._panel = value;
    this._queueRender();
  }

  connectedCallback() {
    this._queueRender();
  }

  _queueRender() {
    if (this._renderQueued) return;
    this._renderQueued = true;
    requestAnimationFrame(() => {
      this._renderQueued = false;
      this._render();
    });
  }

  async _loadRegistry() {
    if (!this._hass) return;
    this._loadingRegistry = true;
    this._registryError = null;
    try {
      const [entities, devices] = await Promise.all([
        this._hass.callWS({ type: "config/entity_registry/list" }),
        this._hass.callWS({ type: "config/device_registry/list" }),
      ]);

      const deviceMap = new Map(devices.map((device) => [device.id, device]));
      const groups = new Map();

      for (const entry of entities) {
        if (entry.platform !== DOMAIN || !entry.device_id) continue;
        const key = this._keyFromUniqueId(entry.unique_id);
        if (!key) continue;

        if (!groups.has(entry.device_id)) {
          const device = deviceMap.get(entry.device_id) || {};
          groups.set(entry.device_id, {
            id: entry.device_id,
            name: device.name_by_user || device.name || "UPS",
            manufacturer: device.manufacturer || "STARK Country",
            model: device.model || "Country Online",
            entities: {},
          });
        }
        groups.get(entry.device_id).entities[key] = entry.entity_id;
      }

      this._devices = [...groups.values()].sort((a, b) => {
        const rank = (name) => {
          if (name.includes("Интернет")) return 0;
          if (name.includes("Кот")) return 1;
          return 10;
        };
        return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, "ru");
      });
      this._diagnosticDeviceId ||= this._devices[0]?.id || null;
      this._registryLoaded = true;
    } catch (err) {
      this._registryError = String(err);
    } finally {
      this._loadingRegistry = false;
      this._queueRender();
    }
  }

  _keyFromUniqueId(uniqueId) {
    if (!uniqueId) return null;
    return ENTITY_KEYS.find((key) => uniqueId.endsWith(`_${key}`)) || null;
  }

  _state(device, key) {
    const entityId = device?.entities?.[key];
    return entityId && this._hass ? this._hass.states[entityId] : null;
  }

  _entityId(device, key) {
    return device?.entities?.[key] || null;
  }

  _available(stateObj) {
    return Boolean(
      stateObj &&
        stateObj.state !== "unavailable" &&
        stateObj.state !== "unknown" &&
        stateObj.state !== "none"
    );
  }

  _isOn(device, key) {
    const stateObj = this._state(device, key);
    return this._available(stateObj) ? stateObj.state === "on" : null;
  }

  _numeric(device, key) {
    const stateObj = this._state(device, key);
    if (!this._available(stateObj)) return null;
    const value = Number(stateObj.state);
    return Number.isFinite(value) ? value : null;
  }

  _mode(device) {
    const stateObj = this._state(device, "mode");
    return this._available(stateObj) ? stateObj.state : null;
  }

  _modeLabel(device) {
    const mode = this._mode(device);
    return mode ? MODE_LABELS[mode] || mode : "Неизвестно";
  }

  _status(device) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const onBattery = this._isOn(device, "on_battery");
    const mode = this._mode(device);

    if (cloud === false) {
      return { label: "Облако недоступно", tone: "bad", icon: "mdi:cloud-off-outline" };
    }
    if (cloud === null) {
      return { label: "Источник неизвестен", tone: "bad", icon: "mdi:cloud-question-outline" };
    }
    if (stale === true) {
      return { label: "Данные устарели", tone: "warn", icon: "mdi:clock-alert-outline" };
    }
    if (stale === null) {
      return { label: "Свежесть неизвестна", tone: "bad", icon: "mdi:clock-question-outline" };
    }
    if (mode === "fault_mode") {
      return { label: "Авария", tone: "bad", icon: "mdi:alert-octagon-outline" };
    }
    if (onBattery === true || mode === "battery_mode") {
      return { label: "От батареи", tone: "warn", icon: "mdi:battery-arrow-down-outline" };
    }
    if (mode === "line_mode") {
      const required = ["input_voltage", "output_voltage", "battery_capacity", "output_load"];
      if (required.every((key) => this._available(this._state(device, key)))) {
        return { label: "Нормально", tone: "good", icon: "mdi:check-circle-outline" };
      }
      return { label: "Часть данных недоступна", tone: "warn", icon: "mdi:alert-circle-outline" };
    }
    if (mode) {
      return { label: this._modeLabel(device), tone: "warn", icon: "mdi:information-outline" };
    }
    return { label: "Состояние неизвестно", tone: "bad", icon: "mdi:help-circle-outline" };
  }

  _format(device, key, fallback = "—") {
    const stateObj = this._state(device, key);
    if (!stateObj) return fallback;
    if (stateObj.state === "unavailable") return "Недоступно";
    if (stateObj.state === "unknown") return "Неизвестно";

    if (key === "mode") return this._modeLabel(device);
    if (key === "cloud_connected") return stateObj.state === "on" ? "Подключено" : "Отключено";
    if (key === "data_stale") return stateObj.state === "on" ? "Да" : "Нет";
    if (key === "on_battery") return stateObj.state === "on" ? "Да" : "Нет";
    if (key === "data_age") return this._formatDuration(Number(stateObj.state));
    if (key.endsWith("_events")) {
      return stateObj.attributes?.event_type || stateObj.state || fallback;
    }

    const unit = stateObj.attributes?.unit_of_measurement;
    return unit ? `${stateObj.state} ${unit}` : stateObj.state;
  }

  _formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return "Неизвестно";
    if (seconds < 60) return `${Math.round(seconds)} с`;
    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    return rest ? `${minutes} мин ${rest} с` : `${minutes} мин`;
  }

  _extendedAvailable(device) {
    return ["positive_bus_voltage", "negative_bus_voltage", "ups_temperature"].some((key) =>
      this._available(this._state(device, key))
    );
  }

  _metric(device, key, label, icon) {
    const entityId = this._entityId(device, key);
    const value = this._format(device, key);
    const available = this._available(this._state(device, key));
    return `
      <div class="metric ${available ? "" : "metric-unavailable"}" ${entityId ? `data-entity="${escapeHtml(entityId)}"` : ""}>
        <ha-icon icon="${icon}"></ha-icon>
        <div class="metric-copy">
          <span class="metric-label">${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      </div>`;
  }

  _renderOverviewCard(device) {
    const status = this._status(device);
    const inputVoltage = this._format(device, "input_voltage");
    const outputVoltage = this._format(device, "output_voltage");
    const battery = this._numeric(device, "battery_capacity");
    const load = this._numeric(device, "output_load");
    const onBattery = this._isOn(device, "on_battery") === true || this._mode(device) === "battery_mode";
    const dataAge = this._format(device, "data_age");
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");

    let trustText = "Качество данных неизвестно";
    let trustTone = "bad";
    if (cloud === false) {
      trustText = "Источник SolarPower недоступен";
    } else if (stale === true) {
      trustText = `Данные устарели · ${dataAge}`;
      trustTone = "warn";
    } else if (cloud === true && stale === false) {
      trustText = `Данные актуальны · возраст ${dataAge}`;
      trustTone = "good";
    }

    const batteryWidth = battery === null ? 0 : Math.max(0, Math.min(100, battery));
    const loadWidth = load === null ? 0 : Math.max(0, Math.min(100, load));
    const sourceIcon = onBattery ? "mdi:battery-high" : "mdi:transmission-tower";
    const sourceLabel = onBattery ? "АКБ" : "Сеть";

    return `
      <article class="ups-card">
        <div class="card-head">
          <div>
            <div class="eyebrow">${escapeHtml(device.model)}</div>
            <h2>${escapeHtml(device.name)}</h2>
          </div>
          <div class="status ${status.tone}">
            <ha-icon icon="${status.icon}"></ha-icon>
            <span>${escapeHtml(status.label)}</span>
          </div>
        </div>

        <div class="power-flow">
          <div class="flow-node ${onBattery ? "source-battery" : ""}" ${this._entityId(device, onBattery ? "battery_capacity" : "input_voltage") ? `data-entity="${escapeHtml(this._entityId(device, onBattery ? "battery_capacity" : "input_voltage"))}"` : ""}>
            <ha-icon icon="${sourceIcon}"></ha-icon>
            <span>${sourceLabel}</span>
            <strong>${onBattery ? (battery === null ? "—" : `${Math.round(battery)}%`) : inputVoltage}</strong>
          </div>
          <div class="flow-line"><span></span><ha-icon icon="mdi:chevron-right"></ha-icon></div>
          <div class="flow-ups" ${this._entityId(device, "mode") ? `data-entity="${escapeHtml(this._entityId(device, "mode"))}"` : ""}>
            <ha-icon icon="mdi:battery-charging"></ha-icon>
            <strong>UPS</strong>
            <span>${escapeHtml(this._modeLabel(device))}</span>
          </div>
          <div class="flow-line"><span></span><ha-icon icon="mdi:chevron-right"></ha-icon></div>
          <div class="flow-node" ${this._entityId(device, "output_voltage") ? `data-entity="${escapeHtml(this._entityId(device, "output_voltage"))}"` : ""}>
            <ha-icon icon="mdi:power-plug"></ha-icon>
            <span>Нагрузка</span>
            <strong>${escapeHtml(outputVoltage)}</strong>
          </div>
        </div>

        <div class="bars">
          <div class="bar-row" ${this._entityId(device, "battery_capacity") ? `data-entity="${escapeHtml(this._entityId(device, "battery_capacity"))}"` : ""}>
            <div class="bar-title"><span>АКБ</span><strong>${battery === null ? "—" : `${Math.round(battery)}%`}</strong></div>
            <div class="bar"><i style="width:${batteryWidth}%"></i></div>
          </div>
          <div class="bar-row" ${this._entityId(device, "output_load") ? `data-entity="${escapeHtml(this._entityId(device, "output_load"))}"` : ""}>
            <div class="bar-title"><span>Нагрузка</span><strong>${load === null ? "—" : `${Math.round(load)}%`}</strong></div>
            <div class="bar"><i style="width:${loadWidth}%"></i></div>
          </div>
        </div>

        <div class="trust ${trustTone}">
          <ha-icon icon="${cloud === false ? "mdi:cloud-off-outline" : stale === true ? "mdi:clock-alert-outline" : "mdi:shield-check-outline"}"></ha-icon>
          <span>${escapeHtml(trustText)}</span>
        </div>

        <div class="quick-grid">
          ${this._metric(device, "input_voltage", "Вход", "mdi:flash")}
          ${this._metric(device, "output_voltage", "Выход", "mdi:power-plug")}
          ${this._metric(device, "battery_capacity", "АКБ", "mdi:battery")}
          ${this._metric(device, "output_load", "Нагрузка", "mdi:gauge")}
        </div>
      </article>`;
  }

  _renderOverview() {
    return `
      <section class="overview-grid">
        ${this._devices.map((device) => this._renderOverviewCard(device)).join("")}
      </section>
      <p class="hint">Нажмите и удерживайте фактический показатель, чтобы открыть штатный more-info Home Assistant.</p>`;
  }

  _renderDiagnosticSummary(device) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");
    const extended = this._extendedAvailable(device);
    const rows = [
      ["Основной канал SolarPower", cloud === true ? "Работает" : cloud === false ? "Недоступен" : "Неизвестно", cloud === true ? "good" : "bad"],
      ["Свежесть snapshot", stale === false ? "Актуально" : stale === true ? "Устарело" : "Неизвестно", stale === false ? "good" : stale === true ? "warn" : "bad"],
      ["Расширенная телеметрия", extended ? "Доступна" : "Недоступна", extended ? "good" : "warn"],
    ];
    return `
      <div class="source-summary">
        ${rows.map(([label, value, tone]) => `<div><span>${label}</span><strong class="text-${tone}">${value}</strong></div>`).join("")}
      </div>`;
  }

  _renderDiagnostics() {
    const device = this._devices.find((item) => item.id === this._diagnosticDeviceId) || this._devices[0];
    if (!device) return this._empty("UPS не найдены");

    return `
      <div class="device-switcher">
        ${this._devices.map((item) => `<button class="device-chip ${item.id === device.id ? "active" : ""}" data-device="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>`).join("")}
      </div>
      <section class="diagnostic-card">
        <div class="card-head compact">
          <div><div class="eyebrow">Диагностика</div><h2>${escapeHtml(device.name)}</h2></div>
          <span class="mini-version">${escapeHtml(this._format(device, "firmware"))}</span>
        </div>
        ${this._renderDiagnosticSummary(device)}
        ${DIAGNOSTIC_GROUPS.map((group) => this._renderDiagnosticGroup(device, group)).join("")}
      </section>
      <p class="hint">Недоступно не считается нормой. Основной и расширенный облачные каналы оцениваются раздельно.</p>`;
  }

  _renderDiagnosticGroup(device, group) {
    const items = group.items.filter(([key]) => this._entityId(device, key));
    if (!items.length) return "";
    return `
      <div class="diagnostic-group">
        <h3>${escapeHtml(group.title)}</h3>
        ${items.map(([key, label]) => {
          const entityId = this._entityId(device, key);
          const stateObj = this._state(device, key);
          const unavailable = !this._available(stateObj);
          return `<div class="diagnostic-row ${unavailable ? "is-unavailable" : ""}" data-entity="${escapeHtml(entityId)}">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(this._format(device, key))}</strong>
          </div>`;
        }).join("")}
      </div>`;
  }

  _renderHistory() {
    return `
      <section class="history-grid">
        ${this._devices.map((device) => `
          <article class="history-card">
            <div class="card-head compact"><div><div class="eyebrow">История</div><h2>${escapeHtml(device.name)}</h2></div></div>
            <div class="history-metrics">
              ${HISTORY_ITEMS.map(([key, label, icon]) => {
                const entityId = this._entityId(device, key);
                if (!entityId) return "";
                return `<button class="history-link" data-entity="${escapeHtml(entityId)}">
                  <ha-icon icon="${icon}"></ha-icon><span>${escapeHtml(label)}</span><strong>${escapeHtml(this._format(device, key))}</strong><ha-icon icon="mdi:chart-line"></ha-icon>
                </button>`;
              }).join("")}
            </div>
            <div class="event-summary">
              <h3>Последние события</h3>
              ${this._eventRow(device, "battery_mode_events", "Режим АКБ")}
              ${this._eventRow(device, "cloud_telemetry_events", "Облако")}
              ${this._eventRow(device, "data_freshness_events", "Свежесть данных")}
              ${this._eventRow(device, "fault_mode_events", "Аварийный режим")}
            </div>
          </article>`).join("")}
      </section>
      <p class="hint">На iPhone графики открываются штатным more-info: нажмите и удерживайте показатель. Так история остаётся компактной и использует нативную историю Home Assistant.</p>`;
  }

  _eventRow(device, key, label) {
    const entityId = this._entityId(device, key);
    if (!entityId) return "";
    const stateObj = this._state(device, key);
    const raw = stateObj?.attributes?.event_type || (this._available(stateObj) ? stateObj.state : "Не было событий");
    const labels = {
      battery_mode_entered: "Перешёл на батарею",
      battery_mode_exited: "Вышел из режима АКБ",
      telemetry_lost: "Телеметрия потеряна",
      telemetry_restored: "Телеметрия восстановлена",
      data_stale: "Данные устарели",
      data_fresh: "Данные снова свежие",
      fault_mode_entered: "Аварийный режим",
      fault_mode_cleared: "Аварийный режим снят",
    };
    return `<div class="event-row" data-entity="${escapeHtml(entityId)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(labels[raw] || raw)}</strong></div>`;
  }

  _empty(message) {
    return `<div class="empty"><ha-icon icon="mdi:battery-alert-variant-outline"></ha-icon><strong>${escapeHtml(message)}</strong><span>Проверьте загрузку интеграции Stark SolarPower.</span></div>`;
  }

  _styles() {
    return `
      :host {
        display:block;
        min-height:100%;
        background:var(--primary-background-color);
        color:var(--primary-text-color);
        font-family:var(--paper-font-body1_-_font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
        overflow-x:hidden;
      }
      * { box-sizing:border-box; }
      .app { max-width:1100px; margin:0 auto; padding:14px 12px 36px; }
      .app-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:2px 2px 14px; }
      .title-wrap { display:flex; align-items:center; gap:12px; min-width:0; }
      .title-icon { width:46px; height:46px; border-radius:15px; display:grid; place-items:center; background:color-mix(in srgb, var(--primary-color) 14%, transparent); color:var(--primary-color); }
      .title-icon ha-icon { --mdc-icon-size:27px; }
      h1,h2,h3,p { margin:0; }
      h1 { font-size:26px; line-height:1.05; letter-spacing:-.02em; }
      h2 { font-size:22px; line-height:1.15; letter-spacing:-.01em; }
      h3 { font-size:15px; }
      .subtitle,.eyebrow,.hint,.mini-version { color:var(--secondary-text-color); }
      .subtitle { margin-top:4px; font-size:12px; }
      .eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px; }
      .refresh { min-width:44px; height:44px; border:0; border-radius:14px; background:var(--card-background-color); color:var(--primary-color); display:grid; place-items:center; box-shadow:var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.15)); }
      .tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; padding:5px; border-radius:15px; background:color-mix(in srgb, var(--secondary-text-color) 10%, transparent); margin-bottom:12px; }
      .tab { height:42px; border:0; border-radius:11px; background:transparent; color:var(--secondary-text-color); font:inherit; font-weight:600; }
      .tab.active { background:var(--card-background-color); color:var(--primary-text-color); box-shadow:0 1px 3px rgba(0,0,0,.12); }
      .overview-grid,.history-grid { display:grid; grid-template-columns:1fr; gap:12px; }
      .ups-card,.diagnostic-card,.history-card { background:var(--card-background-color); border:1px solid var(--divider-color); border-radius:22px; padding:16px; box-shadow:var(--ha-card-box-shadow, none); overflow:hidden; }
      .card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:16px; }
      .card-head.compact { margin-bottom:12px; align-items:center; }
      .status { display:flex; align-items:center; gap:6px; padding:8px 10px; border-radius:999px; font-size:12px; font-weight:700; white-space:nowrap; }
      .status ha-icon { --mdc-icon-size:18px; }
      .good,.text-good { color:var(--success-color, #2e7d32); }
      .warn,.text-warn { color:var(--warning-color, #ed6c02); }
      .bad,.text-bad { color:var(--error-color, #d32f2f); }
      .status.good,.trust.good { background:color-mix(in srgb, var(--success-color, #2e7d32) 12%, transparent); }
      .status.warn,.trust.warn { background:color-mix(in srgb, var(--warning-color, #ed6c02) 13%, transparent); }
      .status.bad,.trust.bad { background:color-mix(in srgb, var(--error-color, #d32f2f) 12%, transparent); }
      .power-flow { display:grid; grid-template-columns:minmax(74px,1fr) 28px minmax(82px,1fr) 28px minmax(74px,1fr); align-items:center; gap:3px; margin:2px 0 17px; }
      .flow-node,.flow-ups { min-width:0; min-height:92px; border-radius:17px; background:color-mix(in srgb, var(--secondary-text-color) 7%, transparent); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-align:center; padding:8px 5px; }
      .flow-node ha-icon,.flow-ups ha-icon { color:var(--primary-color); --mdc-icon-size:24px; }
      .flow-node span,.flow-ups span { font-size:11px; color:var(--secondary-text-color); }
      .flow-node strong,.flow-ups strong { font-size:13px; max-width:100%; overflow:hidden; text-overflow:ellipsis; }
      .source-battery { background:color-mix(in srgb, var(--warning-color, #ed6c02) 12%, transparent); }
      .source-battery ha-icon { color:var(--warning-color, #ed6c02); }
      .flow-line { display:flex; align-items:center; color:var(--secondary-text-color); }
      .flow-line span { height:2px; background:currentColor; flex:1; opacity:.45; }
      .flow-line ha-icon { --mdc-icon-size:18px; margin-left:-4px; }
      .bars { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:13px; }
      .bar-row { min-width:0; }
      .bar-title { display:flex; justify-content:space-between; gap:8px; font-size:12px; margin-bottom:6px; }
      .bar-title span { color:var(--secondary-text-color); }
      .bar { height:7px; border-radius:999px; overflow:hidden; background:color-mix(in srgb, var(--secondary-text-color) 13%, transparent); }
      .bar i { display:block; height:100%; border-radius:inherit; background:var(--primary-color); }
      .trust { min-height:42px; display:flex; align-items:center; gap:8px; padding:9px 11px; border-radius:13px; margin-bottom:12px; font-size:12px; font-weight:600; }
      .trust ha-icon { --mdc-icon-size:19px; flex:0 0 auto; }
      .quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
      .metric { min-height:55px; display:flex; align-items:center; gap:9px; padding:9px; border:1px solid var(--divider-color); border-radius:14px; min-width:0; }
      .metric ha-icon { color:var(--primary-color); --mdc-icon-size:21px; flex:0 0 auto; }
      .metric-copy { min-width:0; display:flex; flex-direction:column; gap:2px; }
      .metric-label { font-size:10px; color:var(--secondary-text-color); }
      .metric strong { font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .metric-unavailable { opacity:.65; }
      .hint { font-size:11px; line-height:1.45; padding:10px 5px 0; }
      .device-switcher { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; margin:0 0 10px; padding:1px; }
      .device-switcher::-webkit-scrollbar { display:none; }
      .device-chip { flex:0 0 auto; min-height:40px; border:1px solid var(--divider-color); border-radius:999px; background:var(--card-background-color); color:var(--primary-text-color); padding:0 14px; font:inherit; font-size:13px; }
      .device-chip.active { border-color:var(--primary-color); color:var(--primary-color); font-weight:700; }
      .source-summary { display:grid; gap:1px; overflow:hidden; border:1px solid var(--divider-color); border-radius:15px; margin-bottom:16px; }
      .source-summary div { min-height:42px; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 11px; background:color-mix(in srgb, var(--secondary-text-color) 4%, transparent); }
      .source-summary span { font-size:12px; color:var(--secondary-text-color); }
      .source-summary strong { font-size:12px; text-align:right; }
      .diagnostic-group { margin-top:17px; }
      .diagnostic-group h3 { margin-bottom:7px; color:var(--secondary-text-color); }
      .diagnostic-row { min-height:44px; display:flex; align-items:center; justify-content:space-between; gap:12px; border-top:1px solid var(--divider-color); padding:8px 2px; }
      .diagnostic-row span { font-size:13px; min-width:0; }
      .diagnostic-row strong { font-size:13px; text-align:right; max-width:52%; overflow-wrap:anywhere; }
      .diagnostic-row.is-unavailable strong { color:var(--error-color, #d32f2f); }
      .history-metrics { display:grid; gap:7px; }
      .history-link { min-height:52px; width:100%; border:1px solid var(--divider-color); border-radius:14px; background:transparent; color:var(--primary-text-color); display:grid; grid-template-columns:28px 1fr auto 22px; align-items:center; gap:7px; padding:8px 10px; text-align:left; font:inherit; }
      .history-link > ha-icon:first-child { color:var(--primary-color); }
      .history-link > ha-icon:last-child { color:var(--secondary-text-color); --mdc-icon-size:18px; }
      .history-link span { font-size:12px; }
      .history-link strong { font-size:12px; text-align:right; }
      .event-summary { margin-top:16px; }
      .event-summary h3 { color:var(--secondary-text-color); margin-bottom:7px; }
      .event-row { min-height:44px; display:flex; align-items:center; justify-content:space-between; gap:10px; border-top:1px solid var(--divider-color); padding:8px 2px; }
      .event-row span { font-size:12px; color:var(--secondary-text-color); }
      .event-row strong { font-size:12px; text-align:right; max-width:60%; }
      .empty { min-height:240px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; text-align:center; color:var(--secondary-text-color); }
      .empty ha-icon { --mdc-icon-size:42px; color:var(--warning-color, #ed6c02); }
      .empty strong { color:var(--primary-text-color); }
      button { -webkit-tap-highlight-color:transparent; cursor:pointer; }
      [data-entity] { touch-action:manipulation; }
      @media (min-width:760px) {
        .app { padding:20px 20px 48px; }
        .overview-grid,.history-grid { grid-template-columns:1fr 1fr; }
        .tabs { max-width:520px; }
        .diagnostic-card { max-width:760px; }
      }
      @media (max-width:380px) {
        .app { padding-left:9px; padding-right:9px; }
        h1 { font-size:23px; }
        h2 { font-size:20px; }
        .ups-card,.diagnostic-card,.history-card { padding:13px; border-radius:19px; }
        .status { padding:7px 8px; font-size:11px; }
        .power-flow { grid-template-columns:minmax(68px,1fr) 22px minmax(76px,1fr) 22px minmax(68px,1fr); }
        .flow-node,.flow-ups { min-height:86px; }
      }
    `;
  }

  _render() {
    if (!this.shadowRoot) return;
    let body = "";
    if (!this._hass || this._loadingRegistry) {
      body = `<div class="empty"><ha-icon icon="mdi:loading"></ha-icon><strong>Загрузка UPS…</strong></div>`;
    } else if (this._registryError) {
      body = this._empty("Не удалось прочитать реестр сущностей");
    } else if (!this._devices.length) {
      body = this._empty("Устройства Stark SolarPower не найдены");
    } else if (this._view === "diagnostics") {
      body = this._renderDiagnostics();
    } else if (this._view === "history") {
      body = this._renderHistory();
    } else {
      body = this._renderOverview();
    }

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <main class="app">
        <header class="app-header">
          <div class="title-wrap">
            <div class="title-icon"><ha-icon icon="mdi:battery-charging"></ha-icon></div>
            <div><h1>Stark SolarPower</h1><div class="subtitle">UPS · UI v${UI_VERSION}</div></div>
          </div>
          <button class="refresh" aria-label="Обновить все ИБП" title="Обновить все ИБП"><ha-icon icon="mdi:refresh"></ha-icon></button>
        </header>
        <nav class="tabs" aria-label="Разделы UPS">
          <button class="tab ${this._view === "overview" ? "active" : ""}" data-view="overview">Обзор</button>
          <button class="tab ${this._view === "diagnostics" ? "active" : ""}" data-view="diagnostics">Диагностика</button>
          <button class="tab ${this._view === "history" ? "active" : ""}" data-view="history">История</button>
        </nav>
        ${body}
      </main>`;

    this._bindEvents();
  }

  _bindEvents() {
    this.shadowRoot.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        this._view = button.dataset.view;
        this._queueRender();
      });
    });

    this.shadowRoot.querySelectorAll("[data-device]").forEach((button) => {
      button.addEventListener("click", () => {
        this._diagnosticDeviceId = button.dataset.device;
        this._queueRender();
      });
    });

    this.shadowRoot.querySelector(".refresh")?.addEventListener("click", async () => {
      const entityId = this._devices.map((device) => this._entityId(device, "refresh_now")).find(Boolean);
      if (!entityId || !this._hass) return;
      try {
        await this._hass.callService("button", "press", { entity_id: entityId });
      } catch (err) {
        console.warn("Stark SolarPower refresh failed", err);
      }
    });

    this.shadowRoot.querySelectorAll("[data-entity]").forEach((element) => {
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
  }

  _showMoreInfo(entityId) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }
}

customElements.define("stark-solarpower-panel", StarkSolarPowerPanel);
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v020.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const HISTORY_ITEMS_V020 = [
  ["input_voltage", "Входное напряжение", "mdi:flash"],
  ["output_voltage", "Выходное напряжение", "mdi:power-plug"],
  ["output_load", "Нагрузка", "mdi:gauge"],
  ["battery_capacity", "Заряд АКБ", "mdi:battery"],
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV020) {
  Panel.prototype.__starkUiV020 = true;

  const baseFormat = Panel.prototype._format;
  const baseStyles = Panel.prototype._styles;
  const baseRender = Panel.prototype._render;

  Panel.prototype._formatDateTime = function (value) {
    if (!value) return "Неизвестно";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const timeZone = this._hass?.config?.time_zone || undefined;
    try {
      return new Intl.DateTimeFormat("ru-RU", {
        timeZone,
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch (_) {
      return date.toLocaleString("ru-RU");
    }
  };

  Panel.prototype._formatRelative = function (value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const delta = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
    if (delta < 60) return `${delta} с назад`;
    if (delta < 3600) return `${Math.floor(delta / 60)} мин назад`;
    if (delta < 86400) return `${Math.floor(delta / 3600)} ч назад`;
    return `${Math.floor(delta / 86400)} дн назад`;
  };

  Panel.prototype._format = function (device, key, fallback = "—") {
    const stateObj = this._state(device, key);
    if (
      stateObj &&
      stateObj.state !== "unavailable" &&
      stateObj.state !== "unknown" &&
      (key === "data_timestamp" || key === "last_successful_update")
    ) {
      return this._formatDateTime(stateObj.state);
    }
    return baseFormat.call(this, device, key, fallback);
  };

  Panel.prototype._eventLabel = function (raw) {
    const labels = {
      battery_mode_entered: "Перешёл на батарею",
      battery_mode_exited: "Вышел из режима АКБ",
      telemetry_lost: "Телеметрия потеряна",
      telemetry_restored: "Телеметрия восстановлена",
      extended_telemetry_lost: "Расширенная телеметрия потеряна",
      extended_telemetry_restored: "Расширенная телеметрия восстановлена",
      data_stale: "Данные устарели",
      data_fresh: "Данные снова свежие",
      fault_mode_entered: "Аварийный режим",
      fault_mode_cleared: "Аварийный режим снят",
    };
    return labels[raw] || raw;
  };

  Panel.prototype._eventRow = function (device, key, label) {
    const entityId = this._entityId(device, key);
    if (!entityId) return "";
    const stateObj = this._state(device, key);
    const available = this._available(stateObj);
    const raw = stateObj?.attributes?.event_type || (available ? stateObj.state : "Не было событий");
    const relative = available ? this._formatRelative(stateObj.last_changed) : "";
    const absolute = available ? this._formatDateTime(stateObj.last_changed) : "";
    return `<div class="event-row event-row-v2" data-entity="${esc(entityId)}">
      <span>${esc(label)}</span>
      <div class="event-copy">
        <strong>${esc(this._eventLabel(raw))}</strong>
        ${relative ? `<small title="${esc(absolute)}">${esc(relative)}</small>` : ""}
      </div>
    </div>`;
  };

  Panel.prototype._renderHistory = function () {
    return `
      <section class="history-grid">
        ${this._devices.map((device) => `
          <article class="history-card">
            <div class="card-head compact">
              <div><div class="eyebrow">История</div><h2>${esc(device.name)}</h2></div>
              <span class="history-state">${esc(this._modeLabel(device))}</span>
            </div>
            <div class="history-metrics">
              ${HISTORY_ITEMS_V020.map(([key, label, icon]) => {
                const entityId = this._entityId(device, key);
                if (!entityId) return "";
                return `<button class="history-link" data-entity="${esc(entityId)}">
                  <ha-icon icon="${icon}"></ha-icon>
                  <span>${esc(label)}</span>
                  <strong>${esc(this._format(device, key))}</strong>
                  <ha-icon icon="mdi:chart-line"></ha-icon>
                </button>`;
              }).join("")}
            </div>
            <div class="event-summary">
              <h3>Последние события</h3>
              ${this._eventRow(device, "battery_mode_events", "Режим АКБ")}
              ${this._eventRow(device, "cloud_telemetry_events", "Облако")}
              ${this._eventRow(device, "data_freshness_events", "Свежесть данных")}
              ${this._eventRow(device, "fault_mode_events", "Аварийный режим")}
            </div>
          </article>`).join("")}
      </section>
      <p class="hint">Показатели открывают штатную историю Home Assistant. Для фактических сущностей сохраняется long press → more-info.</p>`;
  };

  Panel.prototype._styles = function () {
    return `${baseStyles.call(this)}
      :host { color-scheme: light dark; }
      .diagnostic-row strong { font-variant-numeric: tabular-nums; }
      .history-state {
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      }
      .event-row-v2 { align-items: center; }
      .event-copy {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 3px;
        max-width: 64%;
        min-width: 0;
      }
      .event-copy strong {
        max-width: 100%;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .event-copy small {
        color: var(--secondary-text-color);
        font-size: 10px;
        font-weight: 500;
        white-space: nowrap;
      }
      @media (max-width: 430px) {
        .diagnostic-row { gap: 8px; }
        .diagnostic-row span { max-width: 54%; }
        .diagnostic-row strong { max-width: 46%; }
      }
    `;
  };

  Panel.prototype._render = function () {
    baseRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = "UPS · UI v0.2.0";
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v020.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v021.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");

if (Panel && !Panel.prototype.__starkUiV021) {
  Panel.prototype.__starkUiV021 = true;

  const baseRender = Panel.prototype._render;
  const baseStyles = Panel.prototype._styles;

  Panel.prototype._navigateBack = function () {
    if (window.history.state?.from !== undefined) {
      window.history.back();
      return;
    }

    const fallback = "/dashboard-infrastructure";
    window.history.replaceState(window.history.state, "", fallback);
    window.dispatchEvent(
      new CustomEvent("location-changed", {
        bubbles: true,
        composed: true,
        detail: { replace: true },
      })
    );
  };

  Panel.prototype._styles = function () {
    return `${baseStyles.call(this)}
      .header-main {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .back {
        width: 44px;
        min-width: 44px;
        height: 44px;
        border: 0;
        border-radius: 14px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        display: grid;
        place-items: center;
        box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.15));
      }
      .back ha-icon { --mdc-icon-size: 25px; }
      @media (max-width: 430px) {
        .header-main { gap: 7px; }
        .back { width: 42px; min-width: 42px; height: 42px; border-radius: 13px; }
        .app-header .title-icon { width: 42px; height: 42px; border-radius: 14px; }
        .app-header .title-wrap { gap: 9px; }
        .app-header h1 { font-size: 24px; }
      }
    `;
  };

  Panel.prototype._render = function () {
    baseRender.call(this);

    const root = this.shadowRoot;
    const header = root?.querySelector(".app-header");
    const titleWrap = header?.querySelector(".title-wrap");
    if (!header || !titleWrap) return;

    const subtitle = titleWrap.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = "UPS · UI v0.2.1";

    if (header.querySelector(".header-main")) return;

    const group = document.createElement("div");
    group.className = "header-main";
    header.insertBefore(group, titleWrap);

    const button = document.createElement("button");
    button.className = "back";
    button.type = "button";
    button.setAttribute("aria-label", "Назад");
    button.setAttribute("title", "Назад");
    button.innerHTML = '<ha-icon icon="mdi:arrow-left"></ha-icon>';
    button.addEventListener("click", () => this._navigateBack());

    group.append(button, titleWrap);
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v021.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v030.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.0";
const PARENT_ROUTE = "/dashboard-infrastructure/overview";

const NAV_ITEMS = {
  overview: ["mdi:view-dashboard-outline", "Обзор"],
  diagnostics: ["mdi:stethoscope", "Диагностика"],
  history: ["mdi:chart-line", "История"],
};

if (Panel && !Panel.prototype.__starkUiV030) {
  Panel.prototype.__starkUiV030 = true;

  const baseRender = Panel.prototype._render;
  const baseStyles = Panel.prototype._styles;

  Panel.prototype._navigateTo = function (path) {
    const from = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.pushState({ from }, "", path);
    window.dispatchEvent(
      new CustomEvent("location-changed", {
        bubbles: true,
        composed: true,
        detail: { replace: false },
      })
    );
  };

  // NikaS application contract: Back is an explicit parent navigation action,
  // never browser-history traversal.
  Panel.prototype._navigateBack = function () {
    this._navigateTo(PARENT_ROUTE);
  };

  Panel.prototype._styles = function () {
    return `${baseStyles.call(this)}
      .app {
        padding-bottom: calc(96px + env(safe-area-inset-bottom));
      }
      .tabs.bottom-nav {
        position: fixed;
        left: 50%;
        right: auto;
        bottom: 0;
        z-index: 50;
        width: min(100%, 620px);
        transform: translateX(-50%);
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4px;
        margin: 0;
        padding: 7px max(8px, env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
        border-radius: 18px 18px 0 0;
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        border-bottom: 0;
        background: color-mix(in srgb, var(--card-background-color) 94%, transparent);
        box-shadow: 0 -6px 24px rgba(0,0,0,.08);
        backdrop-filter: blur(20px) saturate(145%);
        -webkit-backdrop-filter: blur(20px) saturate(145%);
      }
      .bottom-nav .tab {
        min-width: 0;
        height: auto;
        min-height: 58px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 6px 4px;
        font-size: 10px;
        line-height: 1.05;
      }
      .bottom-nav .tab ha-icon { --mdc-icon-size: 22px; }
      .bottom-nav .tab.active {
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color));
        box-shadow: none;
      }
      .bottom-nav .tab:active { transform: scale(.97); }
      @media (min-width: 760px) {
        .tabs.bottom-nav { width: min(620px, calc(100% - 32px)); }
      }
      @media (max-width: 430px) {
        .app-header { margin-bottom: 12px; }
        .bottom-nav .tab { min-height: 56px; }
      }
    `;
  };

  Panel.prototype._render = function () {
    baseRender.call(this);

    const root = this.shadowRoot;
    const main = root?.querySelector("main.app");
    const nav = root?.querySelector(".tabs");
    if (!root || !main || !nav) return;

    const subtitle = root.querySelector(".app-header .subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    nav.classList.add("bottom-nav");
    nav.setAttribute("aria-label", "Разделы Stark SolarPower");

    nav.querySelectorAll("button[data-view]").forEach((button) => {
      const item = NAV_ITEMS[button.dataset.view];
      if (!item) return;
      const [icon, label] = item;
      button.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span>${label}</span>`;
      button.setAttribute("aria-label", label);
      if (button.classList.contains("active")) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    // Moving the already-bound navigation keeps its click handlers and places
    // the primary section switcher in the thumb zone, below all page content.
    main.append(nav);
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v030.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v031.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.1";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV031) {
  Panel.prototype.__starkUiV031 = true;

  const baseRender = Panel.prototype._render;

  Panel.prototype._selectedUpsId = function () {
    return this._diagnosticDeviceId || this._devices?.[0]?.id || null;
  };

  Panel.prototype._prioritizeSelectedUps = function () {
    const selectedId = this._selectedUpsId();
    if (!selectedId || !Array.isArray(this._devices) || this._devices.length < 2) return;
    const index = this._devices.findIndex((device) => device.id === selectedId);
    if (index <= 0) return;
    const selected = this._devices[index];
    this._devices = [selected, ...this._devices.filter((device) => device.id !== selectedId)];
  };

  Panel.prototype._installDeviceContext = function () {
    const root = this.shadowRoot;
    const header = root?.querySelector(".app-header");
    if (!root || !header || !this._devices?.length) return;

    // Diagnostics had its own local switcher in the first UI revisions.
    // The NikaS app shell now owns one device-context selector shared by all views.
    root.querySelectorAll(".device-switcher").forEach((node) => node.remove());
    root.querySelector(".global-device-context")?.remove();

    if (!root.querySelector("style[data-stark-device-context]")) {
      const style = document.createElement("style");
      style.dataset.starkDeviceContext = "true";
      style.textContent = `
        .global-device-context {
          display: grid;
          grid-template-columns: repeat(var(--ups-count), minmax(0, 1fr));
          gap: 8px;
          margin: 0 2px 12px;
        }
        .global-device-context button {
          min-width: 0;
          min-height: 48px;
          border: 1px solid var(--divider-color);
          border-radius: 15px;
          padding: 7px 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.15;
          text-align: center;
          -webkit-tap-highlight-color: transparent;
        }
        .global-device-context button.active {
          border-color: var(--primary-color);
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 7%, var(--card-background-color));
          font-weight: 750;
        }
        .global-device-context button:active { transform: scale(.98); }
        .device-health-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: var(--secondary-text-color);
        }
        .device-health-dot.good { background: var(--success-color, #2e7d32); }
        .device-health-dot.warn { background: var(--warning-color, #ed6c02); }
        .device-health-dot.bad { background: var(--error-color, #d32f2f); }
        .global-device-context .device-name {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        @media (max-width: 380px) {
          .global-device-context { gap: 6px; margin-left: 0; margin-right: 0; }
          .global-device-context button { padding: 6px; font-size: 11px; }
        }
      `;
      root.append(style);
    }

    const selectedId = this._selectedUpsId();
    const selector = document.createElement("div");
    selector.className = "global-device-context";
    selector.setAttribute("aria-label", "Выбор UPS");
    selector.style.setProperty("--ups-count", String(Math.max(1, this._devices.length)));
    selector.innerHTML = this._devices
      .map((device) => {
        const tone = this._status?.(device)?.tone || "bad";
        const active = device.id === selectedId;
        return `<button type="button" data-ups-device="${esc(device.id)}" class="${active ? "active" : ""}" aria-pressed="${active ? "true" : "false"}">
          <span class="device-health-dot ${esc(tone)}" aria-hidden="true"></span>
          <span class="device-name">${esc(device.name)}</span>
        </button>`;
      })
      .join("");

    header.insertAdjacentElement("afterend", selector);

    selector.querySelectorAll("button[data-ups-device]").forEach((button) => {
      button.addEventListener("click", () => {
        const deviceId = button.dataset.upsDevice;
        if (!deviceId || deviceId === this._selectedUpsId()) return;
        this._diagnosticDeviceId = deviceId;
        this._prioritizeSelectedUps();
        this._queueRender();
      });
    });
  };

  Panel.prototype._render = function () {
    this._prioritizeSelectedUps();
    baseRender.call(this);

    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    this._installDeviceContext();
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v031.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v032.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.2";

if (Panel && !Panel.prototype.__starkUiV032) {
  Panel.prototype.__starkUiV032 = true;

  // Device order is a stable UI contract: UPS Internet stays first, UPS Boiler second.
  // Selection changes only active state and content context; it never reorders controls.
  Panel.prototype._prioritizeSelectedUps = function () {};

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // UI Standard v1.2: no decorative brand/device icon in the Header and
    // title is geometrically centered against symmetric Back/Refresh zones.
    root.querySelector(".title-icon")?.remove();

    if (!root.querySelector("style[data-stark-ui-v032]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV032 = "true";
      style.textContent = `
        .app-header {
          display: grid !important;
          grid-template-columns: 52px minmax(0, 1fr) 52px !important;
          align-items: center !important;
          gap: 0 !important;
        }
        .header-main { display: contents !important; }
        .back {
          grid-column: 1 !important;
          justify-self: start !important;
          width: 44px !important;
          min-width: 44px !important;
          height: 44px !important;
        }
        .title-wrap {
          grid-column: 2 !important;
          min-width: 0 !important;
          display: block !important;
          text-align: center !important;
        }
        .title-wrap > div { min-width: 0 !important; }
        .app-header h1 {
          margin: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          text-align: center !important;
        }
        .subtitle { text-align: center !important; }
        .refresh {
          grid-column: 3 !important;
          justify-self: end !important;
          width: 44px !important;
          min-width: 44px !important;
        }

        .global-device-context {
          grid-template-columns: repeat(var(--ups-count), minmax(0, 1fr)) !important;
        }
        .global-device-context button {
          min-height: 48px !important;
        }

        @media (max-width: 430px) {
          .app-header {
            grid-template-columns: 48px minmax(0, 1fr) 48px !important;
          }
          .app-header h1 { font-size: 23px !important; }
        }
      `;
      root.append(style);
    }

    // Multi-device content follows Diagnostics: one selected physical UPS only.
    // The selector stays in its fixed order above; only the active content changes.
    const selectedId = this._selectedUpsId?.();
    const selectedIndex = Array.isArray(this._devices)
      ? this._devices.findIndex((device) => device.id === selectedId)
      : -1;

    if (selectedIndex >= 0) {
      if (this._view === "overview") {
        root.querySelectorAll(".overview-grid > .ups-card").forEach((card, index) => {
          if (index !== selectedIndex) card.remove();
        });
      }
      if (this._view === "history") {
        root.querySelectorAll(".history-grid > .history-card").forEach((card, index) => {
          if (index !== selectedIndex) card.remove();
        });
      }
    }
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v032.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v033.js
(() => {
const PanelV033 = customElements.get("stark-solarpower-panel");
const UI_VERSION_V033 = "0.3.3";

if (PanelV033 && !PanelV033.prototype.__starkUiV033) {
  PanelV033.prototype.__starkUiV033 = true;
  const previousRenderV033 = PanelV033.prototype._render;

  PanelV033.prototype._render = function () {
    previousRenderV033.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION_V033}`;
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v033.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v034.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.4";

if (Panel && !Panel.prototype.__starkUiV034) {
  Panel.prototype.__starkUiV034 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    if (root.querySelector("style[data-stark-ui-v034]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV034 = "true";
    style.textContent = `
      /* Mobile-first typography pass for iPhone Pro Max. Layout is unchanged. */
      .subtitle {
        font-size: 14px !important;
        line-height: 1.25 !important;
      }
      .global-device-context button {
        font-size: 16px !important;
        line-height: 1.2 !important;
        font-weight: 650 !important;
      }
      .global-device-context button.active {
        font-weight: 750 !important;
      }
      .device-health-dot {
        width: 9px !important;
        height: 9px !important;
        flex-basis: 9px !important;
      }
      .eyebrow {
        font-size: 13px !important;
        line-height: 1.25 !important;
      }
      .status {
        font-size: 15px !important;
        line-height: 1.2 !important;
      }
      .flow-node span,
      .flow-ups span {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }
      .flow-node strong,
      .flow-ups strong {
        font-size: 17px !important;
        line-height: 1.2 !important;
      }
      .bar-title {
        font-size: 15px !important;
        line-height: 1.25 !important;
      }
      .trust {
        font-size: 15px !important;
        line-height: 1.35 !important;
      }
      .metric-label {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }
      .metric strong {
        font-size: 16px !important;
        line-height: 1.25 !important;
      }
      .source-summary span,
      .source-summary strong {
        font-size: 15px !important;
        line-height: 1.3 !important;
      }
      .diagnostic-group h3,
      .event-summary h3 {
        font-size: 18px !important;
        line-height: 1.25 !important;
      }
      .diagnostic-row span,
      .diagnostic-row strong {
        font-size: 16px !important;
        line-height: 1.35 !important;
      }
      .history-state {
        font-size: 15px !important;
      }
      .history-link span {
        font-size: 15px !important;
        line-height: 1.25 !important;
      }
      .history-link strong {
        font-size: 16px !important;
        line-height: 1.25 !important;
      }
      .event-row > span {
        font-size: 15px !important;
        line-height: 1.25 !important;
      }
      .event-copy strong {
        font-size: 16px !important;
        line-height: 1.3 !important;
      }
      .event-copy small {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }
      .hint {
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      .bottom-nav .tab {
        font-size: 14px !important;
        line-height: 1.1 !important;
        font-weight: 650 !important;
      }
      .bottom-nav .tab ha-icon {
        --mdc-icon-size: 24px !important;
      }

      @media (max-width: 430px) {
        .global-device-context button {
          min-height: 52px !important;
          padding: 8px 10px !important;
        }
        .power-flow {
          margin-bottom: 18px !important;
        }
        .flow-node,
        .flow-ups {
          min-height: 96px !important;
        }
        .metric {
          min-height: 60px !important;
        }
        .diagnostic-row {
          min-height: 48px !important;
        }
        .history-link {
          min-height: 58px !important;
        }
        .event-row {
          min-height: 50px !important;
        }
      }
    `;
    root.append(style);
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v034.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v035.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.5";

if (Panel && !Panel.prototype.__starkUiV035) {
  Panel.prototype.__starkUiV035 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // NikaS Integration Panel Template v1.0: Header Back is icon-only.
    root.querySelectorAll(".back span").forEach((node) => node.remove());
    const back = root.querySelector(".back");
    if (back) {
      back.setAttribute("aria-label", "Назад");
      back.setAttribute("title", "Назад");
    }

    if (root.querySelector("style[data-stark-ui-v035]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV035 = "true";
    style.textContent = `
      /* NikaS Integration Panel Template v1.0 shell alignment. */
      :host {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden !important;
      }
      .app {
        width: 100% !important;
        max-width: 1240px !important;
        margin: 0 auto !important;
        padding: 8px max(12px, env(safe-area-inset-right)) calc(98px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)) !important;
        overflow-x: hidden !important;
      }

      /* Header: 52 / 1fr / 52, centered title, icon-only Back, one Refresh action. */
      .app-header {
        display: grid !important;
        grid-template-columns: 52px minmax(0, 1fr) 52px !important;
        align-items: center !important;
        min-height: 62px !important;
        gap: 0 !important;
        margin: 0 0 12px !important;
        padding: max(5px, env(safe-area-inset-top)) 0 5px !important;
      }
      .header-main { display: contents !important; }
      .back,
      .refresh {
        width: 44px !important;
        min-width: 44px !important;
        height: 44px !important;
        min-height: 44px !important;
        border: 0 !important;
        border-radius: 14px !important;
        background: transparent !important;
        box-shadow: none !important;
        display: grid !important;
        place-items: center !important;
        padding: 0 !important;
      }
      .back {
        grid-column: 1 !important;
        justify-self: start !important;
        color: var(--primary-text-color) !important;
      }
      .refresh {
        grid-column: 3 !important;
        justify-self: end !important;
        color: var(--primary-color) !important;
      }
      .back ha-icon,
      .refresh ha-icon { --mdc-icon-size: 25px !important; }
      .title-wrap {
        grid-column: 2 !important;
        min-width: 0 !important;
        display: block !important;
        text-align: center !important;
      }
      .title-wrap > div { min-width: 0 !important; }
      .app-header h1 {
        margin: 0 !important;
        font-size: 18px !important;
        line-height: 1.12 !important;
        font-weight: 760 !important;
        letter-spacing: 0 !important;
        text-align: center !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .subtitle {
        margin-top: 3px !important;
        font-size: 14px !important;
        line-height: 1.2 !important;
        text-align: center !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      /* Device context remains stable and must fit one iPhone row. */
      .global-device-context {
        width: 100% !important;
        min-width: 0 !important;
        grid-template-columns: repeat(var(--ups-count), minmax(0, 1fr)) !important;
        gap: 10px !important;
        margin: 0 0 12px !important;
      }
      .global-device-context button {
        min-width: 0 !important;
        min-height: 52px !important;
        border-radius: 20px !important;
        padding: 8px 10px !important;
        font-size: 16px !important;
        line-height: 1.2 !important;
      }
      .global-device-context .device-name {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      /* Prevent long mobile values/statuses from widening the viewport. */
      .overview-grid,
      .history-grid,
      .ups-card,
      .diagnostic-card,
      .history-card,
      .card-head,
      .quick-grid,
      .source-summary,
      .diagnostic-row,
      .history-link,
      .event-row {
        min-width: 0 !important;
        max-width: 100% !important;
      }
      .overview-grid,
      .history-grid {
        grid-template-columns: minmax(0, 1fr) !important;
      }
      .card-head > div:first-child { min-width: 0 !important; }
      .card-head h2 {
        max-width: 100% !important;
        overflow-wrap: anywhere !important;
      }
      .status {
        flex: 0 1 auto !important;
        min-width: 0 !important;
        max-width: 48% !important;
        white-space: normal !important;
        text-align: right !important;
        justify-content: flex-end !important;
      }
      .status span { overflow-wrap: anywhere !important; }
      .power-flow { min-width: 0 !important; }
      .flow-node strong,
      .flow-ups strong {
        font-size: clamp(15px, 4vw, 17px) !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        text-overflow: clip !important;
      }
      .metric-copy,
      .metric strong,
      .source-summary span,
      .source-summary strong,
      .diagnostic-row span,
      .diagnostic-row strong,
      .history-link span,
      .history-link strong,
      .event-row span,
      .event-copy,
      .event-copy strong {
        min-width: 0 !important;
      }
      .diagnostic-row strong,
      .event-copy strong,
      .history-link strong {
        overflow-wrap: anywhere !important;
      }
      .history-link {
        grid-template-columns: 28px minmax(0, 1fr) minmax(0, auto) 22px !important;
      }

      /* Bottom navigation: full-width, fixed, edge-attached, never a floating pill. */
      .tabs.bottom-nav {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        transform: none !important;
        width: 100% !important;
        max-width: none !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 2px !important;
        margin: 0 !important;
        padding: 6px max(6px, env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(6px, env(safe-area-inset-left)) !important;
        border: 0 !important;
        border-top: 1px solid var(--divider-color) !important;
        border-radius: 0 !important;
        background: var(--card-background-color) !important;
        box-shadow: 0 -3px 14px color-mix(in srgb, #000 7%, transparent) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        z-index: 50 !important;
      }
      .bottom-nav .tab {
        min-width: 0 !important;
        min-height: 58px !important;
        height: auto !important;
        border-radius: 14px !important;
        padding: 4px 2px !important;
        gap: 2px !important;
        font-size: 14px !important;
        line-height: 1.1 !important;
        font-weight: 700 !important;
        overflow: hidden !important;
      }
      .bottom-nav .tab span {
        display: block !important;
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .bottom-nav .tab ha-icon { --mdc-icon-size: 24px !important; }
      .bottom-nav .tab.active {
        color: var(--primary-color) !important;
        background: color-mix(in srgb, var(--primary-color) 11%, transparent) !important;
        box-shadow: none !important;
      }

      @media (max-width: 430px) {
        .app-header {
          grid-template-columns: 52px minmax(0, 1fr) 52px !important;
        }
        .ups-card,
        .diagnostic-card,
        .history-card {
          width: 100% !important;
          padding: 16px !important;
        }
        .quick-grid,
        .bars { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .power-flow {
          grid-template-columns: minmax(74px, 1fr) 24px minmax(82px, 1fr) 24px minmax(74px, 1fr) !important;
          gap: 2px !important;
        }
        .flow-line ha-icon { --mdc-icon-size: 17px !important; }
      }

      @media (max-width: 390px) {
        .app {
          padding-left: max(10px, env(safe-area-inset-left)) !important;
          padding-right: max(10px, env(safe-area-inset-right)) !important;
        }
        .app-header {
          grid-template-columns: 48px minmax(0, 1fr) 48px !important;
        }
        .global-device-context { gap: 8px !important; }
        .global-device-context button {
          min-height: 50px !important;
          padding: 7px 8px !important;
          font-size: 15px !important;
        }
        .power-flow {
          grid-template-columns: minmax(68px, 1fr) 20px minmax(76px, 1fr) 20px minmax(68px, 1fr) !important;
        }
        .bottom-nav .tab { min-height: 56px !important; }
      }

      @media (min-width: 760px) {
        .app { padding-left: 20px !important; padding-right: 20px !important; }
        .tabs.bottom-nav { width: 100% !important; max-width: none !important; }
        .overview-grid,
        .history-grid,
        .diagnostic-card {
          width: min(100%, 820px) !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
      }
    `;
    root.append(style);
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v035.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v040.js
(() => {
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
    return { label: "Онлайн", detail: `Данные ${age} назад`, tone: "good", icon: "mdi:cloud-check-outline" };
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
      const primary = cloud === true ? "Онлайн" : cloud === false ? "Недоступно" : "Неизвестно";
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
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v040.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v040-semantics.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");

if (Panel && !Panel.prototype.__starkUiV040Semantics) {
  Panel.prototype.__starkUiV040Semantics = true;

  const previousStateTile = Panel.prototype._overviewStateTile;

  Panel.prototype._overviewStateTile = function (device, kind) {
    if (kind === "grid") {
      const mode = this._mode(device);
      const inputVoltage = this._numeric(device, "input_voltage");
      if (mode === "battery_mode") {
        return {
          icon: "mdi:transmission-tower-off",
          title: "Сеть",
          primary: "Нет входа",
          secondary: this._format(device, "input_voltage", "0 V"),
          tone: "warn",
          entity: this._entityId(device, "input_voltage"),
        };
      }
      if (inputVoltage !== null && inputVoltage > 0) {
        return {
          icon: "mdi:transmission-tower",
          title: "Сеть",
          primary: "Есть питание",
          secondary: this._format(device, "input_voltage"),
          tone: "good",
          entity: this._entityId(device, "input_voltage"),
        };
      }
      return {
        icon: "mdi:transmission-tower",
        title: "Сеть",
        primary: "Неизвестно",
        secondary: "Нет достоверных данных",
        tone: "unknown",
        entity: this._entityId(device, "input_voltage"),
      };
    }

    if (kind === "battery") {
      const tile = previousStateTile.call(this, device, kind);
      const battery = this._numeric(device, "battery_capacity");
      const mode = this._mode(device);
      if (mode !== "battery_mode" && battery !== null) {
        tile.secondary = battery >= 95 ? "Заряжен" : "Доступен";
      }
      return tile;
    }

    return previousStateTile.call(this, device, kind);
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v040-semantics.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v041.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.1";
const PARENT_ROUTE = "/dashboard-infrastructure/overview";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV041) {
  Panel.prototype.__starkUiV041 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._menuOpen = false;

  Panel.prototype._menuNavigateParent = function () {
    if (typeof this._navigateTo === "function") {
      this._navigateTo(PARENT_ROUTE);
      return;
    }
    history.pushState(null, "", PARENT_ROUTE);
    window.dispatchEvent(new Event("location-changed"));
  };

  Panel.prototype._menuMarkupV041 = function () {
    const selectedId = this._selectedUpsId?.() || this._devices?.[0]?.id || null;
    const devices = Array.isArray(this._devices) ? this._devices : [];

    return `
      <div class="menu-backdrop-v041 ${this._menuOpen ? "open" : ""}" data-menu-close aria-hidden="${this._menuOpen ? "false" : "true"}"></div>
      <aside class="menu-drawer-v041 ${this._menuOpen ? "open" : ""}" aria-hidden="${this._menuOpen ? "false" : "true"}" aria-label="Меню Stark SolarPower">
        <div class="menu-head-v041">
          <strong>Меню</strong>
          <button type="button" class="menu-close-v041" data-menu-close aria-label="Закрыть меню"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <button type="button" class="menu-row-v041 parent" data-menu-parent>
          <ha-icon icon="mdi:home-outline"></ha-icon>
          <span>Инфраструктура</span>
          <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
        </button>

        <div class="menu-divider-v041"></div>
        <div class="menu-section-label-v041">ИБП</div>

        ${devices.map((device) => {
          const active = device.id === selectedId;
          const tone = this._status?.(device)?.tone || "bad";
          return `<button type="button" class="menu-row-v041 device ${active ? "active" : ""}" data-menu-device="${esc(device.id)}">
            <ha-icon icon="mdi:battery-charging"></ha-icon>
            <span class="menu-device-name-v041"><i class="menu-dot-v041 ${esc(tone)}"></i>${esc(device.name)}</span>
            <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
          </button>`;
        }).join("")}

        <div class="menu-divider-v041"></div>

        <button type="button" class="menu-row-v041" data-menu-refresh>
          <ha-icon icon="mdi:refresh"></ha-icon>
          <span>Обновить все ИБП</span>
        </button>

        <div class="menu-footer-v041">
          <strong>Stark SolarPower</strong>
          <span>UI v${UI_VERSION} · только чтение</span>
        </div>
      </aside>`;
  };

  Panel.prototype._installMenuV041 = function () {
    const root = this.shadowRoot;
    if (!root) return;

    const oldBack = root.querySelector(".back");
    if (oldBack) {
      const trigger = oldBack.cloneNode(true);
      trigger.classList.add("menu-trigger-v041");
      trigger.setAttribute("aria-label", "Меню");
      trigger.setAttribute("title", "Меню");
      trigger.setAttribute("aria-expanded", this._menuOpen ? "true" : "false");
      trigger.innerHTML = '<ha-icon icon="mdi:menu"></ha-icon>';
      oldBack.replaceWith(trigger);
      trigger.addEventListener("click", () => {
        this._menuOpen = true;
        this._queueRender();
      });
    }

    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
    root.insertAdjacentHTML("beforeend", this._menuMarkupV041());

    root.querySelectorAll("[data-menu-close]").forEach((element) => {
      element.addEventListener("click", () => {
        this._menuOpen = false;
        this._queueRender();
      });
    });

    root.querySelector("[data-menu-parent]")?.addEventListener("click", () => {
      this._menuOpen = false;
      this._menuNavigateParent();
    });

    root.querySelectorAll("[data-menu-device]").forEach((button) => {
      button.addEventListener("click", () => {
        const deviceId = button.dataset.menuDevice;
        if (deviceId) this._diagnosticDeviceId = deviceId;
        this._menuOpen = false;
        this._queueRender();
      });
    });

    root.querySelector("[data-menu-refresh]")?.addEventListener("click", () => {
      this._menuOpen = false;
      root.querySelector(".refresh")?.click();
      this._queueRender();
    });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v041]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV041 = "true";
      style.textContent = `
        .menu-trigger-v041 {
          color: var(--primary-text-color) !important;
        }
        .menu-backdrop-v041 {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(0,0,0,.22);
          opacity: 0;
          pointer-events: none;
          transition: opacity .18s ease;
        }
        .menu-backdrop-v041.open {
          opacity: 1;
          pointer-events: auto;
        }
        .menu-drawer-v041 {
          position: fixed;
          z-index: 81;
          top: 0;
          bottom: 0;
          left: 0;
          width: min(84vw, 340px);
          padding: calc(18px + env(safe-area-inset-top)) 14px calc(18px + env(safe-area-inset-bottom));
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border-right: 1px solid var(--divider-color);
          box-shadow: 12px 0 32px rgba(0,0,0,.15);
          transform: translateX(-102%);
          transition: transform .2s ease;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        .menu-drawer-v041.open {
          transform: translateX(0);
        }
        .menu-head-v041 {
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 4px 8px 10px;
        }
        .menu-head-v041 > strong {
          font-size: 22px;
          line-height: 1.2;
        }
        .menu-close-v041 {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border: 1px solid var(--divider-color);
          border-radius: 50%;
          background: transparent;
          color: var(--secondary-text-color);
          display: grid;
          place-items: center;
        }
        .menu-close-v041 ha-icon { --mdc-icon-size: 23px; }
        .menu-section-label-v041 {
          padding: 2px 12px 6px;
          color: var(--secondary-text-color);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .menu-row-v041 {
          width: 100%;
          min-height: 56px;
          border: 0;
          border-radius: 16px;
          background: transparent;
          color: var(--primary-text-color);
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr) 22px;
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          text-align: left;
          font: inherit;
          font-size: 16px;
        }
        .menu-row-v041 > ha-icon:first-child {
          color: var(--primary-color);
          --mdc-icon-size: 24px;
        }
        .menu-row-v041 .chevron {
          color: var(--secondary-text-color);
          --mdc-icon-size: 20px;
        }
        .menu-row-v041:not(.parent):not(.device) .chevron { visibility: hidden; }
        .menu-row-v041.active {
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 10%, transparent);
          font-weight: 750;
        }
        .menu-device-name-v041 {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .menu-dot-v041 {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: var(--secondary-text-color);
        }
        .menu-dot-v041.good { background: var(--success-color, #2e7d32); }
        .menu-dot-v041.warn { background: var(--warning-color, #ed6c02); }
        .menu-dot-v041.bad { background: var(--error-color, #d32f2f); }
        .menu-divider-v041 {
          height: 1px;
          margin: 10px 8px;
          background: var(--divider-color);
        }
        .menu-footer-v041 {
          margin-top: 18px;
          padding: 12px;
          color: var(--secondary-text-color);
          font-size: 13px;
          line-height: 1.4;
        }
        .menu-footer-v041 strong,
        .menu-footer-v041 span { display: block; }
        .menu-footer-v041 strong {
          color: var(--primary-text-color);
          font-size: 14px;
          margin-bottom: 2px;
        }
        @media (max-width: 390px) {
          .menu-drawer-v041 { width: min(88vw, 328px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .menu-backdrop-v041,
          .menu-drawer-v041 { transition: none; }
        }
      `;
      root.append(style);
    }

    this._installMenuV041();
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v041.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v042.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.2";

if (Panel && !Panel.prototype.__starkUiV042) {
  Panel.prototype.__starkUiV042 = true;

  // Home Assistant owns the top-left menu. The panel must request the native
  // HA sidebar/system menu instead of rendering its own application drawer.
  Panel.prototype._installMenuV041 = function () {
    const root = this.shadowRoot;
    if (!root) return;

    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
    this._menuOpen = false;

    const oldTrigger = root.querySelector(".back,.menu-trigger-v041,.ha-menu-trigger-v042");
    if (!oldTrigger) return;

    const trigger = oldTrigger.cloneNode(true);
    trigger.classList.remove("menu-trigger-v041");
    trigger.classList.add("ha-menu-trigger-v042");
    trigger.setAttribute("aria-label", "Меню Home Assistant");
    trigger.setAttribute("title", "Меню Home Assistant");
    trigger.removeAttribute("aria-expanded");
    trigger.innerHTML = '<ha-icon icon="mdi:menu"></ha-icon>';
    oldTrigger.replaceWith(trigger);

    trigger.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("hass-toggle-menu", {
          bubbles: true,
          composed: true,
        })
      );
    });
  };

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // Defensive cleanup for an in-place frontend update from UI 0.4.1.
    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v042.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v043.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.3";

if (Panel && !Panel.prototype.__starkUiV043) {
  Panel.prototype.__starkUiV043 = true;

  const previousKeyFromUniqueId = Panel.prototype._keyFromUniqueId;
  const previousExtendedAvailable = Panel.prototype._extendedAvailable;
  const previousHeadline = Panel.prototype._overviewHeadline;
  const previousBindEvents = Panel.prototype._bindEvents;
  const previousRender = Panel.prototype._render;

  // UI 0.4.3 hardening: PFC status is a real backend diagnostic entity and
  // must participate in the frontend entity map even though older bundles did
  // not include it in ENTITY_KEYS.
  Panel.prototype._keyFromUniqueId = function (uniqueId) {
    if (uniqueId?.endsWith("_pfc_status")) return "pfc_status";
    return previousKeyFromUniqueId.call(this, uniqueId);
  };

  // Do not infer extended-channel health from only three values. Treat the
  // detailed telemetry surface as available when any confirmed extended field
  // is live for the selected UPS.
  Panel.prototype._extendedAvailable = function (device) {
    const keys = [
      "positive_bus_voltage",
      "negative_bus_voltage",
      "ups_temperature",
      "pfc_temperature",
      "ambient_temperature",
      "charger_temperature",
      "battery_piece_number",
      "battery_group_number",
      "battery_remain_time",
      "protocol_id",
      "dctodc_status",
      "pfc_status",
      "inverter_status",
      "input_relay_status",
      "output_relay_status",
    ];
    if (keys.some((key) => this._available(this._state(device, key)))) return true;
    return previousExtendedAvailable.call(this, device);
  };

  // The backend owns the stale threshold. The UI only reports the current
  // stale state and observed age, so a future threshold change cannot make the
  // explanatory text lie.
  Panel.prototype._overviewHeadline = function (device) {
    const headline = previousHeadline.call(this, device);
    if (this._isOn(device, "data_stale") === true) {
      const age = this._format(device, "data_age", "Неизвестно");
      headline.detail = age === "Неизвестно"
        ? "Возраст последнего snapshot неизвестен"
        : `Последний snapshot: ${age} назад`;
    }
    return headline;
  };

  Panel.prototype._setRefreshFeedbackV043 = function (state) {
    this._refreshFeedbackV043 = state;
    const button = this.shadowRoot?.querySelector(".refresh");
    if (!button) return;

    button.classList.toggle("is-refreshing-v043", state === "busy");
    button.classList.toggle("is-ok-v043", state === "ok");
    button.classList.toggle("is-error-v043", state === "error");
    button.disabled = state === "busy";
    button.setAttribute("aria-busy", state === "busy" ? "true" : "false");

    const icon = button.querySelector("ha-icon");
    if (icon) {
      icon.setAttribute(
        "icon",
        state === "busy"
          ? "mdi:loading"
          : state === "ok"
            ? "mdi:check"
            : state === "error"
              ? "mdi:alert-circle-outline"
              : "mdi:refresh"
      );
    }

    const label = state === "busy"
      ? "Обновление UPS…"
      : state === "ok"
        ? "UPS обновлены"
        : state === "error"
          ? "Ошибка обновления UPS"
          : "Обновить все ИБП";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  };

  // Replace the old fire-and-forget refresh listener with a single listener
  // that provides visual progress/success/error feedback and prevents repeated
  // taps while the coordinator refresh is in flight.
  Panel.prototype._bindEvents = function () {
    previousBindEvents.call(this);

    const root = this.shadowRoot;
    const oldButton = root?.querySelector(".refresh");
    if (!root || !oldButton) return;

    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    this._setRefreshFeedbackV043(this._refreshFeedbackV043 || null);

    button.addEventListener("click", async () => {
      if (this._refreshFeedbackV043 === "busy" || !this._hass) return;
      const entityId = this._devices
        .map((device) => this._entityId(device, "refresh_now"))
        .find(Boolean);
      if (!entityId) return;

      this._setRefreshFeedbackV043("busy");
      try {
        await this._hass.callService("button", "press", { entity_id: entityId });
        this._setRefreshFeedbackV043("ok");
        window.setTimeout(() => {
          if (this._refreshFeedbackV043 !== "ok") return;
          this._setRefreshFeedbackV043(null);
        }, 850);
      } catch (err) {
        console.warn("Stark SolarPower refresh failed", err);
        this._setRefreshFeedbackV043("error");
        window.setTimeout(() => {
          if (this._refreshFeedbackV043 !== "error") return;
          this._setRefreshFeedbackV043(null);
        }, 1400);
      }
    });
  };

  Panel.prototype._renderFingerprintV043 = function () {
    const devices = Array.isArray(this._devices) ? this._devices : [];
    const states = [];
    for (const device of devices) {
      const entities = device?.entities || {};
      for (const [key, entityId] of Object.entries(entities)) {
        const stateObj = this._hass?.states?.[entityId];
        states.push([
          device.id,
          key,
          entityId,
          stateObj?.state ?? null,
          stateObj?.last_updated ?? null,
          stateObj?.attributes?.event_type ?? null,
          stateObj?.attributes?.unit_of_measurement ?? null,
        ]);
      }
    }
    return JSON.stringify([
      this._view,
      this._diagnosticDeviceId,
      this._loadingRegistry,
      this._registryLoaded,
      this._registryError,
      devices.map((device) => [device.id, device.name, device.model]),
      states,
    ]);
  };

  Panel.prototype._render = function () {
    // Home Assistant may update hundreds of unrelated entities while this
    // panel is open. Avoid rebuilding the complete Shadow DOM unless the
    // selected view/device or a Stark entity actually changed.
    const fingerprint = this._renderFingerprintV043();
    if (this._renderFingerprintCacheV043 === fingerprint && this.shadowRoot?.childElementCount) {
      return;
    }
    this._renderFingerprintCacheV043 = fingerprint;

    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // Battery copy must describe the observed capacity, not label every
    // non-battery-mode state as fully charged.
    if (this._view === "overview") {
      const selectedId = this._selectedUpsId?.();
      const device = this._devices.find((item) => item.id === selectedId) || this._devices[0];
      const battery = device ? this._numeric(device, "battery_capacity") : null;
      const mode = device ? this._mode(device) : null;
      const copy = root.querySelector(".overview-v040 .battery-node small");
      if (copy) {
        copy.textContent = mode === "battery_mode"
          ? "Питает нагрузку"
          : battery === null
            ? "Состояние неизвестно"
            : battery >= 95
              ? "Заряжен"
              : "Доступен";
      }
    }

    if (!root.querySelector("style[data-stark-ui-v043]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV043 = "true";
      style.textContent = `
        /* Normal data stays neutral. Semantic colors are reserved for status. */
        .ups-hero-v040.good,
        .overview-state-tile.good {
          color: var(--primary-text-color) !important;
        }
        .hero-metric-v040:nth-child(3) ha-icon,
        .hero-metric-v040:nth-child(4) ha-icon {
          color: var(--primary-color) !important;
        }
        .battery-node {
          background: color-mix(in srgb, var(--primary-color) 7%, var(--card-background-color)) !important;
        }
        .battery-node ha-icon {
          color: var(--primary-color) !important;
        }
        .battery-flow .battery-node {
          background: color-mix(in srgb, var(--warning-color,#ed6c02) 9%, var(--card-background-color)) !important;
        }
        .battery-flow .battery-node ha-icon {
          color: var(--warning-color,#ed6c02) !important;
        }

        /* Compact the hero without reducing mobile-readable typography. */
        .ups-power-diagram { margin-top: 22px !important; margin-bottom: 18px !important; }
        .diagram-node { min-height: 102px !important; }
        .battery-link { height: 30px !important; }
        .battery-node { min-height: 94px !important; }
        .hero-metric-v040 { min-height: 70px !important; }

        .refresh.is-refreshing-v043 ha-icon {
          animation: stark-refresh-spin-v043 .8s linear infinite;
        }
        .refresh.is-ok-v043 { color: var(--success-color,#2e7d32) !important; }
        .refresh.is-error-v043 { color: var(--error-color,#d32f2f) !important; }
        @keyframes stark-refresh-spin-v043 { to { transform: rotate(360deg); } }

        @media (max-width:430px) {
          .diagram-node { min-height: 98px !important; }
          .battery-node { min-height: 90px !important; }
          .hero-metric-v040 { min-height: 68px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .refresh.is-refreshing-v043 ha-icon { animation: none !important; }
        }
      `;
      root.append(style);
    }

    this._setRefreshFeedbackV043(this._refreshFeedbackV043 || null);
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v043.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v050.js
(() => {
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
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v050.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v051.js
(() => {
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
  ["history", "mdi:chart-line", "История"],
  ["events", "mdi:bell", "События"],
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
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v051.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v052.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.2";

if (Panel && !Panel.prototype.__starkUiV052) {
  Panel.prototype.__starkUiV052 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v052]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV052 = "true";
      style.textContent = `
        /* UI 0.5.2: field alignment with the accepted iPhone target. */
        :host { margin-top:0 !important; padding-top:0 !important; }
        .app { padding-top:2px !important; }
        .app-header {
          min-height:62px !important;
          margin:0 0 6px !important;
          padding:2px 0 3px !important;
        }
        .global-device-context {
          min-height:48px !important;
          margin-bottom:8px !important;
          padding:2px !important;
          border-radius:17px !important;
        }
        .global-device-context button {
          min-height:44px !important;
          padding:5px 8px !important;
          border-radius:14px !important;
          font-size:15px !important;
        }

        .ups-hero-v051 {
          background-image:
            linear-gradient(180deg,rgba(255,255,255,.82) 0%,rgba(255,255,255,.46) 24%,rgba(255,255,255,.02) 58%,rgba(255,255,255,.10) 100%),
            var(--hero-background-v051) !important;
        }
        .hero-head-v051 { min-height:82px !important; }
        .hero-copy-v051 p { white-space:nowrap; }
        .freshness-v051 {
          width:auto !important;
          max-width:none !important;
          flex:0 0 auto;
          padding:6px 9px !important;
          white-space:nowrap;
        }
        .freshness-v051 span { white-space:nowrap; }
        .hero-scene-v051 { height:225px !important; }
        .flow-lines-v051 {
          filter:drop-shadow(0 0 5px rgba(30,188,255,.98)) drop-shadow(0 0 2px rgba(255,255,255,.95)) !important;
        }
        .flow-lines-v051 path { stroke-width:1.55 !important; }
        .ups-art-v051 {
          width:min(46%,205px) !important;
          max-height:78% !important;
          bottom:62px !important;
        }
        .scene-node-v051.grid,.scene-node-v051.load { top:41% !important; }
        .scene-node-v051.battery { bottom:-7px !important; }

        .metric-card-v051 {
          min-height:76px !important;
          flex-direction:row !important;
          align-items:center !important;
          gap:7px !important;
          padding:8px !important;
          border-radius:19px !important;
        }
        .metric-icon-v051 {
          width:36px !important;
          height:36px !important;
          flex:0 0 36px !important;
        }
        .metric-copy-v051 { padding-top:0 !important; }
        .metric-copy-v051 span { font-size:11px !important; }
        .metric-copy-v051 strong { margin-top:4px !important; font-size:17px !important; }
        .metric-copy-v051 small { margin-top:4px !important; font-size:11px !important; }

        .state-card-v051 { padding:10px !important; }
        .state-card-v051 h3 { margin-bottom:8px !important; font-size:18px !important; }
        .state-row-v051 { padding:9px !important; border-radius:16px !important; }
        .state-row-v051+.state-row-v051 { margin-top:7px !important; }
        .state-row-head-v051 strong { font-size:14px !important; }
        .state-values-v051 { margin-top:8px !important; }
        .state-values-v051 span { font-size:11px !important; }
        .state-values-v051 strong { font-size:12px !important; }

        .tabs.bottom-nav-v051 {
          padding-top:4px !important;
          padding-bottom:calc(4px + env(safe-area-inset-bottom)) !important;
        }
        .bottom-nav-v051 .tab {
          min-height:52px !important;
          padding:3px 1px !important;
          font-size:12px !important;
        }
        .bottom-nav-v051 .tab ha-icon { --mdc-icon-size:22px !important; }

        @media (max-width:430px) {
          .app-header { min-height:60px !important; }
          .hero-copy-v051 h2 { font-size:35px !important; }
          .hero-copy-v051 p { font-size:13px !important; }
          .freshness-v051 { min-height:34px !important; font-size:11px !important; }
          .freshness-v051 ha-icon { --mdc-icon-size:18px !important; }
          .hero-scene-v051 { margin-left:-10px !important; margin-right:-10px !important; }
          .scene-node-v051 { min-width:94px !important; min-height:56px !important; }
        }
        @media (max-width:370px) {
          .hero-copy-v051 p { white-space:normal; }
          .freshness-v051 { padding-left:7px !important; padding-right:7px !important; }
        }
      `;
      root.append(style);
    }
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v052.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v053.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.3";

if (Panel && !Panel.prototype.__starkUiV053) {
  Panel.prototype.__starkUiV053 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v053]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV053 = "true";
      style.textContent = `
        /*
         * UI 0.5.3: keep the panel header below the iOS Dynamic Island.
         * panel_custom already owns the Home Assistant shell; only this
         * integration panel consumes the remaining top safe-area inset.
         */
        :host {
          --stark-safe-top-v053:
            max(
              10px,
              var(
                --safe-area-inset-top,
                env(safe-area-inset-top, 0px)
              )
            );
          margin-top:0 !important;
          padding-top:0 !important;
        }
        .app {
          padding-top:var(--stark-safe-top-v053) !important;
        }
        .app-header {
          margin-top:0 !important;
        }

        @media (display-mode:browser) and (min-width:760px) {
          :host { --stark-safe-top-v053:10px; }
        }
      `;
      root.append(style);
    }
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v053.js

// BEGIN custom_components/stark_solarpower/frontend/stark-solarpower-panel-v054.js
(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.5.4";
const PARENT_ROUTE = "/dashboard-infrastructure/overview";
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;

function clampScale(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, number));
}

function touchDistance(first, second) {
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

function touchMidpoint(first, second, viewport) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: (first.clientX + second.clientX) / 2 - rect.left,
    y: (first.clientY + second.clientY) / 2 - rect.top,
  };
}

if (Panel && !Panel.prototype.__starkUiV054) {
  Panel.prototype.__starkUiV054 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._zoomStorageKeyV054 = function () {
    const deviceId = this._selectedUpsId?.() || this._diagnosticDeviceId || this._devices?.[0]?.id || "default";
    return `nikas:specialized-panel:stark-solarpower:zoom:${deviceId}`;
  };

  Panel.prototype._loadZoomV054 = function () {
    const key = this._zoomStorageKeyV054();
    if (this.__starkZoomKeyV054 === key && Number.isFinite(this.__starkZoomV054)) {
      return clampScale(this.__starkZoomV054);
    }
    this.__starkZoomKeyV054 = key;
    try {
      this.__starkZoomV054 = clampScale(window.localStorage.getItem(key) || 1);
    } catch (_error) {
      this.__starkZoomV054 = 1;
    }
    return this.__starkZoomV054;
  };

  Panel.prototype._storeZoomV054 = function () {
    try {
      window.localStorage.setItem(this._zoomStorageKeyV054(), String(clampScale(this.__starkZoomV054)));
    } catch (_error) {
      // Private browsing/storage policy must never make the panel unusable.
    }
  };

  Panel.prototype._installBackV054 = function () {
    const root = this.shadowRoot;
    const oldControl = root?.querySelector(".app-header .back, .app-header .menu-trigger-v041");
    if (!root || !oldControl) return;

    const back = oldControl.cloneNode(true);
    back.classList.remove("menu-trigger-v041");
    back.classList.add("back", "shell-back-v054");
    back.setAttribute("aria-label", "Назад к инфраструктуре");
    back.setAttribute("title", "Назад к инфраструктуре");
    back.removeAttribute("aria-expanded");
    back.innerHTML = '<ha-icon icon="mdi:arrow-left"></ha-icon>';
    oldControl.replaceWith(back);
    back.addEventListener("click", () => {
      this._menuOpen = false;
      if (typeof this._navigateTo === "function") this._navigateTo(PARENT_ROUTE);
      else {
        window.history.pushState(null, "", PARENT_ROUTE);
        window.dispatchEvent(new Event("location-changed"));
      }
    });

    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
  };

  Panel.prototype._installZoomV054 = function () {
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const selector = app?.querySelector(":scope > .global-device-context");
    const nav = app?.querySelector(":scope > .tabs.bottom-nav, :scope > .tabs");
    if (!root || !app || !header || !nav) return;

    const toolbar = document.createElement("div");
    toolbar.className = "zoom-toolbar-v054";
    toolbar.setAttribute("aria-label", "Масштаб рабочей области");
    toolbar.innerHTML = `
      <span class="zoom-label-v054">Масштаб</span>
      <div class="zoom-controls-v054">
        <button type="button" data-zoom-out aria-label="Уменьшить масштаб">−</button>
        <button type="button" class="zoom-value-v054" data-zoom-reset aria-label="Сбросить масштаб до 100%">100%</button>
        <button type="button" data-zoom-in aria-label="Увеличить масштаб">+</button>
      </div>`;

    const viewport = document.createElement("section");
    viewport.className = "zoom-viewport-v054";
    viewport.setAttribute("aria-label", "Рабочая область Stark SolarPower");
    const content = document.createElement("div");
    content.className = "zoom-content-v054";
    viewport.append(content);

    const excluded = new Set([header, selector, nav]);
    Array.from(app.children).forEach((child) => {
      if (!excluded.has(child)) content.append(child);
    });

    const anchor = selector || header;
    anchor.insertAdjacentElement("afterend", toolbar);
    toolbar.insertAdjacentElement("afterend", viewport);
    app.append(nav);

    const value = toolbar.querySelector(".zoom-value-v054");
    const applyScale = (nextScale, focalPoint = null, persist = false) => {
      const previousScale = clampScale(this.__starkZoomV054 || 1);
      const scale = clampScale(nextScale);
      const point = focalPoint || {
        x: viewport.clientWidth / 2,
        y: viewport.clientHeight / 2,
      };
      const contentX = (viewport.scrollLeft + point.x) / previousScale;
      const contentY = (viewport.scrollTop + point.y) / previousScale;

      this.__starkZoomV054 = scale;
      content.style.zoom = String(scale);
      value.textContent = `${Math.round(scale * 100)}%`;
      value.setAttribute("aria-label", `Масштаб ${Math.round(scale * 100)}%. Сбросить до 100%`);

      requestAnimationFrame(() => {
        viewport.scrollLeft = Math.max(0, contentX * scale - point.x);
        viewport.scrollTop = Math.max(0, contentY * scale - point.y);
      });
      if (persist) this._storeZoomV054();
    };

    applyScale(this._loadZoomV054());

    toolbar.querySelector("[data-zoom-out]")?.addEventListener("click", () => {
      applyScale(this.__starkZoomV054 - SCALE_STEP, null, true);
    });
    toolbar.querySelector("[data-zoom-in]")?.addEventListener("click", () => {
      applyScale(this.__starkZoomV054 + SCALE_STEP, null, true);
    });
    toolbar.querySelector("[data-zoom-reset]")?.addEventListener("click", () => {
      applyScale(1, { x: 0, y: 0 }, true);
    });

    let pinch = null;
    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const midpoint = touchMidpoint(first, second, viewport);
      const scale = clampScale(this.__starkZoomV054 || 1);
      pinch = {
        distance: Math.max(1, touchDistance(first, second)),
        scale,
        contentX: (viewport.scrollLeft + midpoint.x) / scale,
        contentY: (viewport.scrollTop + midpoint.y) / scale,
      };
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchmove", (event) => {
      if (!pinch || event.touches.length !== 2) return;
      const [first, second] = event.touches;
      const midpoint = touchMidpoint(first, second, viewport);
      const scale = clampScale(pinch.scale * touchDistance(first, second) / pinch.distance);
      this.__starkZoomV054 = scale;
      content.style.zoom = String(scale);
      value.textContent = `${Math.round(scale * 100)}%`;
      viewport.scrollLeft = Math.max(0, pinch.contentX * scale - midpoint.x);
      viewport.scrollTop = Math.max(0, pinch.contentY * scale - midpoint.y);
      event.preventDefault();
    }, { passive: false });

    const finishPinch = () => {
      if (!pinch) return;
      pinch = null;
      this._storeZoomV054();
      value.setAttribute("aria-label", `Масштаб ${Math.round(this.__starkZoomV054 * 100)}%. Сбросить до 100%`);
    };
    viewport.addEventListener("touchend", finishPinch, { passive: true });
    viewport.addEventListener("touchcancel", finishPinch, { passive: true });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    this._installBackV054();
    this._installZoomV054();

    if (!root.querySelector("style[data-stark-ui-v054]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV054 = "true";
      style.textContent = `
        /* Shared specialized-panel shell: native chrome around one zoomable work viewport. */
        .app-header { padding-top:5px !important; }
        .shell-back-v054 { color:var(--primary-text-color) !important; }
        .zoom-toolbar-v054 {
          width:min(100%,820px);
          min-height:44px;
          margin:0 auto 8px;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:10px;
          color:var(--secondary-text-color);
        }
        .zoom-label-v054 { font-size:12px; font-weight:700; letter-spacing:.02em; }
        .zoom-controls-v054 {
          display:grid;
          grid-template-columns:44px 66px 44px;
          min-height:44px;
          overflow:hidden;
          border:1px solid var(--divider-color);
          border-radius:15px;
          background:var(--card-background-color);
          box-shadow:0 4px 14px rgba(23,45,76,.06);
        }
        .zoom-controls-v054 button {
          min-width:44px;
          min-height:44px;
          padding:0;
          border:0;
          border-right:1px solid var(--divider-color);
          border-radius:0;
          background:transparent;
          color:var(--primary-text-color);
          font:inherit;
          font-size:22px;
          font-weight:700;
          line-height:1;
          -webkit-tap-highlight-color:transparent;
        }
        .zoom-controls-v054 button:last-child { border-right:0; }
        .zoom-controls-v054 button:active { background:var(--stark-ice); }
        .zoom-controls-v054 .zoom-value-v054 {
          color:var(--primary-color);
          font-size:13px;
          font-variant-numeric:tabular-nums;
        }
        .zoom-viewport-v054 {
          width:100%;
          max-width:100%;
          min-height:180px;
          max-height:calc(100dvh - 242px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          overflow:auto;
          overscroll-behavior:contain;
          touch-action:pan-x pan-y;
          -webkit-overflow-scrolling:touch;
        }
        .zoom-content-v054 {
          width:100%;
          min-width:100%;
          transform-origin:0 0;
        }
        .zoom-content-v054 > :last-child { margin-bottom:8px; }

        @media (max-width:430px) {
          .zoom-toolbar-v054 { min-height:40px; margin-bottom:7px; }
          .zoom-label-v054 { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
          .zoom-controls-v054 { grid-template-columns:42px 62px 42px; min-height:42px; }
          .zoom-controls-v054 button { min-width:42px; min-height:42px; }
          .zoom-viewport-v054 {
            max-height:calc(100dvh - 228px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));
          }
        }
        @media (min-width:760px) {
          .zoom-viewport-v054 { max-height:calc(100dvh - 238px); }
        }
      `;
      root.append(style);
    }
  };
}
})();
// END custom_components/stark_solarpower/frontend/stark-solarpower-panel-v054.js
