import "./stark-solarpower-panel-v021.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.0";
const PARENT_ROUTE = "/dashboard-infrastructure/overview";

const NAV_ITEMS = {
  overview: ["mdi:view-dashboard-outline", "Обзор"],
  diagnostics: ["mdi:stethoscope", "Диагностика"],
  history: ["mdi:chart-line", "История"],
};

if (Panel && !Panel.prototype.__starkUiV030) {
  Panel.prototype.__starkUiV030 = true;

  const baseRender = Panel.prototype._render;
  const baseStyles = Panel.prototype._styles;

  Panel.prototype._navigateTo = function (path) {
    const from = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.pushState({ from }, "", path);
    window.dispatchEvent(
      new CustomEvent("location-changed", {
        bubbles: true,
        composed: true,
        detail: { replace: false },
      })
    );
  };

  // NikaS application contract: Back is an explicit parent navigation action,
  // never browser-history traversal.
  Panel.prototype._navigateBack = function () {
    this._navigateTo(PARENT_ROUTE);
  };

  Panel.prototype._styles = function () {
    return `${baseStyles.call(this)}
      .app {
        padding-bottom: calc(96px + env(safe-area-inset-bottom));
      }
      .tabs.bottom-nav {
        position: fixed;
        left: 50%;
        right: auto;
        bottom: 0;
        z-index: 50;
        width: min(100%, 620px);
        transform: translateX(-50%);
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 4px;
        margin: 0;
        padding: 7px max(8px, env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
        border-radius: 18px 18px 0 0;
        border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent);
        border-bottom: 0;
        background: color-mix(in srgb, var(--card-background-color) 94%, transparent);
        box-shadow: 0 -6px 24px rgba(0,0,0,.08);
        backdrop-filter: blur(20px) saturate(145%);
        -webkit-backdrop-filter: blur(20px) saturate(145%);
      }
      .bottom-nav .tab {
        min-width: 0;
        height: auto;
        min-height: 58px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 6px 4px;
        font-size: 10px;
        line-height: 1.05;
      }
      .bottom-nav .tab ha-icon { --mdc-icon-size: 22px; }
      .bottom-nav .tab.active {
        color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, var(--card-background-color));
        box-shadow: none;
      }
      .bottom-nav .tab:active { transform: scale(.97); }
      @media (min-width: 760px) {
        .tabs.bottom-nav { width: min(620px, calc(100% - 32px)); }
      }
      @media (max-width: 430px) {
        .app-header { margin-bottom: 12px; }
        .bottom-nav .tab { min-height: 56px; }
      }
    `;
  };

  Panel.prototype._render = function () {
    baseRender.call(this);

    const root = this.shadowRoot;
    const main = root?.querySelector("main.app");
    const nav = root?.querySelector(".tabs");
    if (!root || !main || !nav) return;

    const subtitle = root.querySelector(".app-header .subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    nav.classList.add("bottom-nav");
    nav.setAttribute("aria-label", "Разделы Stark SolarPower");

    nav.querySelectorAll("button[data-view]").forEach((button) => {
      const item = NAV_ITEMS[button.dataset.view];
      if (!item) return;
      const [icon, label] = item;
      button.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span>${label}</span>`;
      button.setAttribute("aria-label", label);
      if (button.classList.contains("active")) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    // Moving the already-bound navigation keeps its click handlers and places
    // the primary section switcher in the thumb zone, below all page content.
    main.append(nav);
  };
}
