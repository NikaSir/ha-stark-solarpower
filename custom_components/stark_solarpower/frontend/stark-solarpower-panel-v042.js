import "./stark-solarpower-panel-v041.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.2";

if (Panel && !Panel.prototype.__starkUiV042) {
  Panel.prototype.__starkUiV042 = true;

  // Home Assistant owns the top-left menu. The panel must request the native
  // HA sidebar/system menu instead of rendering its own application drawer.
  Panel.prototype._installMenuV041 = function () {
    const root = this.shadowRoot;
    if (!root) return;

    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
    this._menuOpen = false;

    const oldTrigger = root.querySelector(".back,.menu-trigger-v041,.ha-menu-trigger-v042");
    if (!oldTrigger) return;

    const trigger = oldTrigger.cloneNode(true);
    trigger.classList.remove("menu-trigger-v041");
    trigger.classList.add("ha-menu-trigger-v042");
    trigger.setAttribute("aria-label", "Меню Home Assistant");
    trigger.setAttribute("title", "Меню Home Assistant");
    trigger.removeAttribute("aria-expanded");
    trigger.innerHTML = '<ha-icon icon="mdi:menu"></ha-icon>';
    oldTrigger.replaceWith(trigger);

    trigger.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("hass-toggle-menu", {
          bubbles: true,
          composed: true,
        })
      );
    });
  };

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // Defensive cleanup for an in-place frontend update from UI 0.4.1.
    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
  };
}
