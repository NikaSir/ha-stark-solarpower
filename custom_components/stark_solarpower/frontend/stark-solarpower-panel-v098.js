import "./stark-solarpower-panel-v096.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.9.10";

if (Panel && !Panel.prototype.__starkUiV098) {
  Panel.prototype.__starkUiV098 = true;
  const previousRender = Panel.prototype._render;

  Panel.prototype._installOverviewHeaderV098 = function () {
    const root = this.shadowRoot;
    if (!root || root.querySelector("style[data-stark-ui-v098]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV098 = "true";
    style.textContent = `
      /* Stark UI 0.9.10 — Keenetic-style status header above an inset photo. */
      section.overview-v066 .ups-hero-v051,
      section.startup-overview-v086 .ups-hero-v051 {
        padding:12px!important;
        background-image:none!important;
        background-color:color-mix(in srgb,var(--card-background-color,#fff) 95%,var(--primary-color,#03a9d9) 5%)!important;
      }
      section.overview-v066 .hero-head-v051,
      section.startup-overview-v086 .hero-head-v051 {
        min-height:88px!important;
      }
      section.overview-v066 .hero-scene-v051,
      section.startup-overview-v086 .hero-scene-v051 {
        position:relative!important;
        z-index:2!important;
        height:310px!important;
        margin:0!important;
        overflow:hidden!important;
        border:1px solid color-mix(in srgb,var(--divider-color,#dfe3e8) 82%,transparent)!important;
        border-radius:20px!important;
        background-image:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02)),var(--hero-background-v051)!important;
        background-position:center!important;
        background-size:cover!important;
        background-repeat:no-repeat!important;
      }
      section.overview-v066 .ups-hero-v051::after,
      section.startup-overview-v086 .ups-hero-v051::after {
        width:205px!important;
        height:205px!important;
        top:-92px!important;
        right:-70px!important;
        background:color-mix(in srgb,var(--primary-color,#03a9d9) 12%,var(--card-background-color,#fff))!important;
      }
      @media(max-width:430px) {
        section.overview-v066 .hero-scene-v051,
        section.startup-overview-v086 .hero-scene-v051 { height:300px!important; }
      }
      @media(max-width:390px) {
        section.overview-v066 .hero-scene-v051,
        section.startup-overview-v086 .hero-scene-v051 { height:296px!important; }
      }
      @container stark-hero (max-width:359px) {
        section.overview-v066 .hero-head-v051,
        section.startup-overview-v086 .hero-head-v051 { min-height:150px!important; }
      }
    `;
    root.append(style);
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installOverviewHeaderV098();
    const version = this.shadowRoot?.querySelector(".title-return-v090 .subtitle");
    if (version?.textContent !== `UI v${UI_VERSION}`) version.textContent = `UI v${UI_VERSION}`;
  };
}
