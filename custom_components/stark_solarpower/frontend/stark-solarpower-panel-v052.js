import "./stark-solarpower-panel-v051.js";

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
