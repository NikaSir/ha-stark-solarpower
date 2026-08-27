import "./stark-solarpower-panel-v020.js";

const Panel = customElements.get("stark-solarpower-panel");

if (Panel && !Panel.prototype.__starkUiV021) {
  Panel.prototype.__starkUiV021 = true;

  const baseRender = Panel.prototype._render;
  const baseStyles = Panel.prototype._styles;

  Panel.prototype._navigateBack = function () {
    const fallback = "/dashboard-infrastructure/overview";
    window.history.pushState(null, "", fallback);
    window.dispatchEvent(
      new CustomEvent("location-changed", {
        bubbles: true,
        composed: true,
      })
    );
  };

  Panel.prototype._styles = function () {
    return `${baseStyles.call(this)}
      .header-main {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .back {
        width: 44px;
        min-width: 44px;
        height: 44px;
        border: 0;
        border-radius: 14px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        display: grid;
        place-items: center;
        box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.15));
      }
      .back ha-icon { --mdc-icon-size: 25px; }
      @media (max-width: 430px) {
        .header-main { gap: 7px; }
        .back { width: 42px; min-width: 42px; height: 42px; border-radius: 13px; }
        .app-header .title-icon { width: 42px; height: 42px; border-radius: 14px; }
        .app-header .title-wrap { gap: 9px; }
        .app-header h1 { font-size: 24px; }
      }
    `;
  };

  Panel.prototype._render = function () {
    baseRender.call(this);

    const root = this.shadowRoot;
    const header = root?.querySelector(".app-header");
    const titleWrap = header?.querySelector(".title-wrap");
    if (!header || !titleWrap) return;

    const subtitle = titleWrap.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = "UPS · UI v0.2.1";

    if (header.querySelector(".header-main")) return;

    const group = document.createElement("div");
    group.className = "header-main";
    header.insertBefore(group, titleWrap);

    const button = document.createElement("button");
    button.className = "back";
    button.type = "button";
    button.setAttribute("aria-label", "Назад");
    button.setAttribute("title", "Назад");
    button.innerHTML = '<ha-icon icon="mdi:arrow-left"></ha-icon>';
    button.addEventListener("click", () => this._navigateBack());

    group.append(button, titleWrap);
  };
}
