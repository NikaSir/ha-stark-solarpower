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
