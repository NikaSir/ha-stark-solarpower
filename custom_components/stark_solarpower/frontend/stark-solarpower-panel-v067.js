import "./stark-solarpower-panel-v066.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.7";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV067) {
  Panel.prototype.__starkUiV067 = true;

  const previousOverview = Panel.prototype._renderOverviewV051;
  const previousRender = Panel.prototype._render;

  Panel.prototype._renderOverviewV051 = function () {
    const html = previousOverview.call(this);
    const device = this._selectedDeviceV051();
    if (!device || !html.includes('class="overview-v051 overview-v066"')) return html;

    const battery = this._numeric(device, "battery_capacity");
    const reserve = this._reserveV050(device, battery !== null);
    const entityId = this._entityId(device, "battery_capacity");

    // This style is part of the initial work-surface markup. The zoom engine
    // therefore measures the final geometry instead of observing a later CSS
    // height change and briefly collapsing/repositioning the iOS canvas.
    const stableStyle = `<style data-stark-overview-v067>
      section.overview-v066 { gap:10px !important; }
      section.overview-v066 .ups-hero-v051 { min-height:0; }
      section.overview-v066 .hero-scene-v051 { height:360px !important; }
      section.overview-v066 .hero-copy-v051 { min-width:0; max-width:48%; }
      section.overview-v066 .connection-v066 {
        min-height:48px !important;
        max-width:52% !important;
        gap:10px !important;
        padding:12px 14px !important;
        border-radius:18px !important;
        color:var(--primary-text-color) !important;
      }
      section.overview-v066 .connection-lamp-v066 {
        width:10px; height:10px; flex:0 0 10px; border-radius:50%;
        background:var(--disabled-text-color);
        box-shadow:0 0 0 3px color-mix(in srgb,var(--disabled-text-color) 12%,transparent);
      }
      section.overview-v066 .connection-v066.good .connection-lamp-v066 { background:var(--success-color,#2eae55); box-shadow:0 0 0 3px color-mix(in srgb,var(--success-color,#2eae55) 12%,transparent); }
      section.overview-v066 .connection-v066.bad .connection-lamp-v066 { background:var(--error-color,#d93b3b); box-shadow:0 0 0 3px color-mix(in srgb,var(--error-color,#d93b3b) 12%,transparent); }
      section.overview-v066 .connection-copy-v066 { min-width:0; display:grid; gap:2px; text-align:left; }
      section.overview-v066 .connection-copy-v066 strong { color:var(--disabled-text-color); font-size:15px; font-weight:700; line-height:1.1; }
      section.overview-v066 .connection-v066.good .connection-copy-v066 strong { color:var(--success-color,#2eae55); }
      section.overview-v066 .connection-v066.bad .connection-copy-v066 strong { color:var(--error-color,#d93b3b); }
      section.overview-v066 .connection-copy-v066 small { color:var(--secondary-text-color); font-size:12px; font-weight:550; line-height:1.15; }
      section.overview-v066 .connection-copy-v066 small.warn { color:var(--warning-color,#ed8b00); font-weight:650; }
      .reserve-strip-v067 {
        min-height:50px; display:flex; align-items:center; justify-content:center; gap:10px;
        padding:10px 14px; border:1px solid color-mix(in srgb,var(--success-color,#2eae55) 28%,transparent);
        border-radius:18px; background:color-mix(in srgb,var(--success-color,#2eae55) 7%,var(--card-background-color));
        color:var(--success-color,#2eae55); box-shadow:0 5px 18px rgba(23,45,76,.05);
      }
      .reserve-strip-v067 ha-icon { --mdc-icon-size:25px; flex:0 0 auto; }
      .reserve-strip-v067 strong { font-size:15px; line-height:1.15; }
      .reserve-strip-v067.warn { color:var(--warning-color,#ed8b00); border-color:color-mix(in srgb,var(--warning-color,#ed8b00) 30%,transparent); background:color-mix(in srgb,var(--warning-color,#ed8b00) 7%,var(--card-background-color)); }
      .reserve-strip-v067.bad { color:var(--error-color,#d93b3b); border-color:color-mix(in srgb,var(--error-color,#d93b3b) 30%,transparent); background:color-mix(in srgb,var(--error-color,#d93b3b) 7%,var(--card-background-color)); }
      .reserve-strip-v067.unknown { color:var(--secondary-text-color); border-color:var(--divider-color); background:var(--card-background-color); }
      @media (max-width:430px) {
        section.overview-v066 .hero-scene-v051 { height:360px !important; }
        section.overview-v066 .connection-v066 { max-width:51% !important; }
        section.overview-v066 .hero-copy-v051 p { max-width:230px; }
      }
    </style>`;

    const reserveStrip = `<div class="reserve-strip-v067 ${esc(reserve.tone)}" ${entityId ? `data-entity="${esc(entityId)}"` : ""}>
      <ha-icon icon="${esc(reserve.icon)}"></ha-icon>
      <strong>${esc(reserve.label)}</strong>
    </div>`;

    return stableStyle + html.replace("</section>", `${reserveStrip}</section>`);
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
