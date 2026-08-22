import "./stark-solarpower-panel.js";

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
}
