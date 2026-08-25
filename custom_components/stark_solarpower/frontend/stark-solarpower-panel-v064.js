import "./stark-solarpower-panel-v063.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.4";

if (Panel && !Panel.prototype.__starkUiV064) {
  Panel.prototype.__starkUiV064 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v064]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV064 = "true";
      style.textContent = `
        /* UI 0.6.4: spend the remaining phone-height reserve on the room. */
        .hero-scene-v051 {
          height:322px !important;
        }

        @media (max-width:430px) {
          .hero-scene-v051 {
            height:322px !important;
          }
        }
      `;
      root.append(style);
    }
  };
}
