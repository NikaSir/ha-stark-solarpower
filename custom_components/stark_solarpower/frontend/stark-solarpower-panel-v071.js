import "./stark-solarpower-panel-v070.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.7.1";

if (Panel && !Panel.prototype.__starkUiV071) {
  Panel.prototype.__starkUiV071 = true;

  // Gesture completion and post-pinch navigation suppression are implemented
  // by the permanent canvas layer in v065; this layer only finalizes layout.

  const previousOverview = Panel.prototype._renderOverviewV051;
  const previousRender = Panel.prototype._render;

  Panel.prototype._renderOverviewV051 = function () {
    const html = previousOverview.call(this);
    if (!html.includes('class="overview-v051 overview-v066"')) return html;

    return `<style data-stark-overview-v071>
      /* Keep the capacity plaque visually separate from the cabinet. */
      section.overview-v066 .scene-node-v051.battery {
        top:58px !important;
        bottom:auto !important;
      }
      /* The long fallback state is one calm line; normal mode titles keep
         their established 35–38 px hierarchy. */
      section.overview-v066 .ups-hero-v051.unknown .hero-copy-v051 h2,
      section.overview-v066 .ups-hero-v051.bad .hero-copy-v051 h2 {
        white-space:nowrap;
        overflow-wrap:normal;
        font-size:clamp(23px,6.4vw,29px) !important;
        letter-spacing:-.035em;
      }
      @media(max-width:390px) {
        section.overview-v066 .scene-node-v051.battery { top:54px !important; }
      }
    </style>${html}`;
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
