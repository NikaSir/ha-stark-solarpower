import "./stark-solarpower-panel-v061.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.2";

if (Panel && !Panel.prototype.__starkUiV062) {
  Panel.prototype.__starkUiV062 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    const overview = root.querySelector(".overview-v051");
    const hero = overview?.querySelector(":scope > .ups-hero-v051");
    const reserve = hero?.querySelector(":scope > .reserve-strip-v051");
    if (hero && reserve) hero.insertAdjacentElement("afterend", reserve);

    // The battery node now sits above the UPS, so its live path runs down
    // from the charge card toward the cabinet instead of below the cabinet.
    const batteryLine = root.querySelector(".flow-lines-v051 .line-battery-v051");
    if (batteryLine) batteryLine.setAttribute("d", "M50 22 V38");

    if (!root.querySelector("style[data-stark-ui-v062]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV062 = "true";
      style.textContent = `
        /* UI 0.6.2: taller photographic scene with floor-mounted UPS. */
        .ups-hero-v051 {
          background-position:center 54% !important;
        }
        .hero-scene-v051 {
          height:260px !important;
        }
        .ups-art-v051 {
          width:min(54%,230px) !important;
          max-height:85% !important;
          bottom:5px !important;
        }
        .scene-node-v051.grid,
        .scene-node-v051.load {
          top:46% !important;
        }
        .scene-node-v051.battery {
          top:4px !important;
          bottom:auto !important;
        }
        .overview-v051 > .reserve-strip-v051 {
          width:100%;
          min-height:44px !important;
          box-sizing:border-box;
          padding:7px 14px !important;
          border-radius:17px;
          background:var(--card-background-color) !important;
          box-shadow:0 5px 18px rgba(23,45,76,.05);
        }

        @media (max-width:430px) {
          .hero-scene-v051 {
            height:252px !important;
          }
          .ups-art-v051 {
            width:min(55%,222px) !important;
            max-height:84% !important;
            bottom:4px !important;
          }
          .scene-node-v051.battery { top:3px !important; }
          .overview-v051 > .reserve-strip-v051 {
            min-height:43px !important;
            padding:6px 12px !important;
          }
        }
      `;
      root.append(style);
    }
  };
}
