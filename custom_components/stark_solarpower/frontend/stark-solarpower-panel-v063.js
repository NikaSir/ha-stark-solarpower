import "./stark-solarpower-panel-v062.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.3";
const HERO_INTERNET =
  "/stark_solarpower_panel/assets/stark-hero-internet-v063.webp?v=0.6.3";
const HERO_BOILER =
  "/stark_solarpower_panel/assets/stark-hero-boiler-v063.webp?v=0.6.3";

if (Panel && !Panel.prototype.__starkUiV063) {
  Panel.prototype.__starkUiV063 = true;

  // v0.6.3 uses clean, edge-safe context plates. This override is installed
  // before the inherited renderer runs, so no stale background flashes first.
  Panel.prototype._heroBackgroundV051 = function (device) {
    return device?.name?.toLocaleLowerCase("ru").includes("кот")
      ? HERO_BOILER
      : HERO_INTERNET;
  };

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    // Reserve readiness is already represented in the factual battery row.
    // Remove the repeated strip and give its height back to the photograph.
    root.querySelector(".overview-v051 > .reserve-strip-v051")?.remove();
    root.querySelector(".ups-hero-v051 > .reserve-strip-v051")?.remove();

    // The metric cards remain interactive; only the decorative flow drawing
    // is removed to keep the photographic composition calm and uncluttered.
    root.querySelector(".flow-lines-v051")?.remove();

    if (!root.querySelector("style[data-stark-ui-v063]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV063 = "true";
      style.textContent = `
        /* UI 0.6.3: clean full-height hero without decorative wiring. */
        .ups-hero-v051 {
          background-position:center 52% !important;
        }
        .ups-hero-v051::after {
          display:none !important;
        }
        .hero-head-v051 {
          min-height:92px !important;
        }
        .hero-scene-v051 {
          height:290px !important;
        }
        .flow-lines-v051 {
          display:none !important;
        }
        .ups-art-v051 {
          width:min(54%,230px) !important;
          max-height:84% !important;
          bottom:4px !important;
        }
        .scene-node-v051.grid,
        .scene-node-v051.load {
          top:50% !important;
        }
        .scene-node-v051.battery {
          top:5px !important;
          bottom:auto !important;
        }
        .overview-v051 > .reserve-strip-v051,
        .ups-hero-v051 > .reserve-strip-v051 {
          display:none !important;
        }

        @media (max-width:430px) {
          .hero-head-v051 {
            min-height:92px !important;
          }
          .hero-scene-v051 {
            height:290px !important;
          }
          .ups-art-v051 {
            width:min(55%,222px) !important;
            max-height:84% !important;
            bottom:4px !important;
          }
          .scene-node-v051.battery { top:5px !important; }
        }
      `;
      root.append(style);
    }
  };
}
