import "./stark-solarpower-panel-v080.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.1";

if (Panel && !Panel.prototype.__starkUiV081) {
  Panel.prototype.__starkUiV081 = true;

  const previousBatteryFact = Panel.prototype._batteryFactV070;
  const previousOverview = Panel.prototype._renderOverviewV051;
  const previousRender = Panel.prototype._render;

  Panel.prototype._batteryFactV070 = function (device, key, label) {
    const compactLabel = key === "battery_piece_number" ? "АКБ, шт." : label;
    return previousBatteryFact.call(this, device, key, compactLabel);
  };

  Panel.prototype._renderOverviewV051 = function () {
    const html = previousOverview.call(this);
    if (!html.includes('class="overview-v051 overview-v066"')) return html;

    // The final mobile composition is emitted with the initial detached view
    // markup. The canvas therefore measures the compact geometry before it is
    // shown; no late resize or structural render is needed.
    const stableStyle = `<style data-stark-overview-v081>
      section.overview-v066 {
        gap:8px !important;
        box-sizing:border-box;
        padding-bottom:16px;
      }
      section.overview-v066 .hero-scene-v051 {
        height:336px !important;
      }
      section.overview-v066 .scene-node-v051.battery {
        top:38px !important;
        bottom:auto !important;
      }
      section.overview-v066 .scene-node-v051.grid,
      section.overview-v066 .scene-node-v051.load {
        top:54% !important;
      }
      section.overview-v066 .reserve-strip-v067 {
        min-height:44px !important;
        padding:7px 12px !important;
      }
      section.overview-v066 .battery-details-v070 {
        padding:10px 14px 11px;
      }
      section.overview-v066 .battery-details-head-v070 {
        margin-bottom:8px;
      }
      section.overview-v066 .battery-fact-v070 span {
        min-height:15px;
        white-space:nowrap;
        overflow-wrap:normal;
      }

      @media(max-width:430px) {
        section.overview-v066 .hero-scene-v051 { height:336px !important; }
        section.overview-v066 .scene-node-v051.battery { top:38px !important; }
      }
      @media(max-width:390px) {
        section.overview-v066 .hero-scene-v051 { height:332px !important; }
        section.overview-v066 .scene-node-v051.battery { top:36px !important; }
        section.overview-v066 .battery-details-v070 { padding:10px 12px 11px; }
      }
    </style>`;

    return `${html}${stableStyle}`;
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
