import "./stark-solarpower-panel-v084.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.5";
const STARTUP_ASSETS = [
  "/stark_solarpower_panel/assets/stark-country-1000-online.png?v=0.6.6",
  "/stark_solarpower_panel/assets/stark-hero-internet-v063.webp?v=0.6.3",
  "/stark_solarpower_panel/assets/stark-hero-boiler-v063.webp?v=0.6.3",
];

function prewarmStartupAssetsV085() {
  if (globalThis.__starkStartupAssetsV085) return globalThis.__starkStartupAssetsV085.ready;

  const images = STARTUP_ASSETS.map((url) => {
    const image = new Image();
    image.loading = "eager";
    image.decoding = "sync";
    image.fetchPriority = "high";
    image.src = url;
    return image;
  });
  const ready = Promise.allSettled(images.map((image) => (
    typeof image.decode === "function"
      ? image.decode()
      : new Promise((resolve) => {
        if (image.complete) resolve();
        else {
          image.addEventListener("load", resolve, { once:true });
          image.addEventListener("error", resolve, { once:true });
        }
      })
  )));

  globalThis.__starkStartupAssetsV085 = { images, ready };
  return ready;
}

prewarmStartupAssetsV085();

if (Panel && !Panel.prototype.__starkUiV085) {
  Panel.prototype.__starkUiV085 = true;
  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
