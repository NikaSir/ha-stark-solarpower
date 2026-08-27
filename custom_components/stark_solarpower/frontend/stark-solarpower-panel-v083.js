import "./stark-solarpower-panel-v082.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.3";

function escV083(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRuntimeMinutesV083(value) {
  const rawMinutes = Number(value);
  if (!Number.isFinite(rawMinutes) || rawMinutes < 0) return "—";
  const totalMinutes = Math.round(rawMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} мин`;
  return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;
}

if (Panel && !Panel.prototype.__starkUiV083) {
  Panel.prototype.__starkUiV083 = true;

  const previousBatteryFact = Panel.prototype._batteryFactV070;
  const previousRender = Panel.prototype._render;

  Panel.prototype._batteryFactV070 = function (device, key, label) {
    if (key !== "battery_remain_time") {
      return previousBatteryFact.call(this, device, key, label);
    }

    const entityId = this._entityId(device, key);
    const rawMinutes = this._numeric(device, key);
    const runtime = formatRuntimeMinutesV083(rawMinutes);
    return `<div class="battery-fact-v070 battery-runtime-v083" ${entityId ? `data-entity="${escV083(entityId)}"` : ""} data-runtime-source="vendor-raw-minutes">
      <span>Автономия</span>
      <strong>${escV083(runtime)}</strong>
    </div>`;
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
