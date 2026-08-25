import "./stark-solarpower-panel-v060.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.1";

if (Panel && !Panel.prototype.__starkUiV061) {
  Panel.prototype.__starkUiV061 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    // Input, output and load already exist in the live hero and the factual
    // state summary. Remove the repeated overview row from both layout and
    // the entity interaction surface.
    root.querySelector(".overview-v051 > .metrics-row-v051")?.remove();

    if (!root.querySelector("style[data-stark-ui-v061]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV061 = "true";
      style.textContent = `
        /* UI 0.6.1: one-screen mobile Overview without repeated metrics. */
        .overview-v051 { gap:8px !important; }
        .overview-v051 > .metrics-row-v051 { display:none !important; }

        .hero-head-v051 { min-height:78px !important; }
        .hero-scene-v051 { height:215px !important; }
        .scene-node-v051.battery { bottom:8px !important; }
        .reserve-strip-v051 {
          min-height:44px !important;
          padding-top:6px !important;
          padding-bottom:6px !important;
        }

        .overview-v051 > .state-card-v051 { padding:8px !important; }
        .overview-v051 > .state-card-v051 h3 {
          margin-bottom:7px !important;
          font-size:17px !important;
        }
        .overview-v051 > .state-card-v051 .state-row-v051 {
          padding:7px 8px !important;
          border-radius:15px !important;
        }
        .overview-v051 > .state-card-v051 .state-row-v051 + .state-row-v051 {
          margin-top:6px !important;
        }
        .overview-v051 > .state-card-v051 .state-values-v051 {
          margin-top:5px !important;
        }

        @media (max-width:430px) {
          .ups-hero-v051 { padding:12px !important; }
          .hero-scene-v051 {
            height:208px !important;
            margin-left:-8px !important;
            margin-right:-8px !important;
          }
          .scene-node-v051.battery { bottom:7px !important; }
          .reserve-strip-v051 { min-height:43px !important; }
        }
      `;
      root.append(style);
    }
  };
}
