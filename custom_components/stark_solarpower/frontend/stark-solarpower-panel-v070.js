import "./stark-solarpower-panel-v069.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.7.0";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV070) {
  Panel.prototype.__starkUiV070 = true;

  const previousOverview = Panel.prototype._renderOverviewV051;
  const previousRender = Panel.prototype._render;

  Panel.prototype._batteryFactV070 = function (device, key, label) {
    const entityId = this._entityId(device, key);
    return `<div class="battery-fact-v070" ${entityId ? `data-entity="${esc(entityId)}"` : ""}>
      <span>${esc(label)}</span>
      <strong>${esc(this._format(device, key, "—"))}</strong>
    </div>`;
  };

  Panel.prototype._renderOverviewV051 = function () {
    const html = previousOverview.call(this);
    const device = this._selectedDeviceV051();
    if (!device || !html.includes('class="overview-v051 overview-v066"')) return html;

    const stableStyle = `<style data-stark-overview-v070>
      section.overview-v066 .scene-node-v051.battery {
        top:72px !important;
        bottom:auto !important;
      }
      .battery-details-v070 {
        padding:12px 14px;
        border:1px solid color-mix(in srgb,var(--success-color,#2eae55) 24%,var(--divider-color));
        border-radius:22px;
        background:var(--card-background-color);
        box-shadow:0 5px 18px rgba(23,45,76,.05);
      }
      .battery-details-head-v070 {
        display:flex; align-items:center; gap:8px; margin-bottom:10px;
      }
      .battery-details-head-v070 ha-icon {
        --mdc-icon-size:23px; color:var(--success-color,#2eae55); flex:0 0 auto;
      }
      .battery-details-head-v070 strong {
        font-size:17px; line-height:1.1;
      }
      .battery-details-head-v070 small {
        margin-left:auto; color:var(--secondary-text-color); font-size:11px; line-height:1.1;
      }
      .battery-facts-v070 {
        display:grid; grid-template-columns:repeat(4,minmax(0,1fr));
      }
      .battery-fact-v070 {
        min-width:0; padding:0 9px; border-left:1px solid var(--divider-color);
      }
      .battery-fact-v070:first-child { padding-left:0; border-left:0; }
      .battery-fact-v070:last-child { padding-right:0; }
      .battery-fact-v070 span,.battery-fact-v070 strong { display:block; }
      .battery-fact-v070 span {
        min-height:24px; color:var(--secondary-text-color); font-size:11px; line-height:1.1;
      }
      .battery-fact-v070 strong {
        margin-top:4px; color:var(--primary-text-color); font-size:15px; line-height:1.1;
        overflow-wrap:anywhere;
      }
      @media(max-width:390px) {
        section.overview-v066 .scene-node-v051.battery { top:68px !important; }
        .battery-details-v070 { padding:11px 12px; }
        .battery-details-head-v070 small { display:none; }
        .battery-fact-v070 { padding:0 6px; }
        .battery-fact-v070 span { font-size:10px; }
        .battery-fact-v070 strong { font-size:14px; }
      }
    </style>`;

    const details = `<article class="battery-details-v070">
      <div class="battery-details-head-v070">
        <ha-icon icon="mdi:battery-heart-variant"></ha-icon>
        <strong>Батарея</strong>
        <small>Расширенная телеметрия</small>
      </div>
      <div class="battery-facts-v070">
        ${this._batteryFactV070(device, "battery_voltage", "Напряжение")}
        ${this._batteryFactV070(device, "battery_piece_number", "Количество АКБ")}
        ${this._batteryFactV070(device, "charger_temperature", "Темп. ЗУ")}
        ${this._batteryFactV070(device, "battery_remain_time", "Остаток RAW")}
      </div>
    </article>`;

    return stableStyle + html.replace("</section>", `${details}</section>`);
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
