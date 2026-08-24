import "./stark-solarpower-panel-v040-semantics.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.4.1";
const PARENT_ROUTE = "/dashboard-infrastructure/overview";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV041) {
  Panel.prototype.__starkUiV041 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._menuOpen = false;

  Panel.prototype._menuNavigateParent = function () {
    if (typeof this._navigateTo === "function") {
      this._navigateTo(PARENT_ROUTE);
      return;
    }
    history.pushState(null, "", PARENT_ROUTE);
    window.dispatchEvent(new Event("location-changed"));
  };

  Panel.prototype._menuMarkupV041 = function () {
    const selectedId = this._selectedUpsId?.() || this._devices?.[0]?.id || null;
    const devices = Array.isArray(this._devices) ? this._devices : [];

    return `
      <div class="menu-backdrop-v041 ${this._menuOpen ? "open" : ""}" data-menu-close aria-hidden="${this._menuOpen ? "false" : "true"}"></div>
      <aside class="menu-drawer-v041 ${this._menuOpen ? "open" : ""}" aria-hidden="${this._menuOpen ? "false" : "true"}" aria-label="Меню Stark SolarPower">
        <div class="menu-head-v041">
          <strong>Меню</strong>
          <button type="button" class="menu-close-v041" data-menu-close aria-label="Закрыть меню"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <button type="button" class="menu-row-v041 parent" data-menu-parent>
          <ha-icon icon="mdi:home-outline"></ha-icon>
          <span>Инфраструктура</span>
          <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
        </button>

        <div class="menu-divider-v041"></div>
        <div class="menu-section-label-v041">ИБП</div>

        ${devices.map((device) => {
          const active = device.id === selectedId;
          const tone = this._status?.(device)?.tone || "bad";
          return `<button type="button" class="menu-row-v041 device ${active ? "active" : ""}" data-menu-device="${esc(device.id)}">
            <ha-icon icon="mdi:battery-charging"></ha-icon>
            <span class="menu-device-name-v041"><i class="menu-dot-v041 ${esc(tone)}"></i>${esc(device.name)}</span>
            <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
          </button>`;
        }).join("")}

        <div class="menu-divider-v041"></div>

        <button type="button" class="menu-row-v041" data-menu-refresh>
          <ha-icon icon="mdi:refresh"></ha-icon>
          <span>Обновить все ИБП</span>
        </button>

        <div class="menu-footer-v041">
          <strong>Stark SolarPower</strong>
          <span>UI v${UI_VERSION} · только чтение</span>
        </div>
      </aside>`;
  };

  Panel.prototype._installMenuV041 = function () {
    const root = this.shadowRoot;
    if (!root) return;

    const oldBack = root.querySelector(".back");
    if (oldBack) {
      const trigger = oldBack.cloneNode(true);
      trigger.classList.add("menu-trigger-v041");
      trigger.setAttribute("aria-label", "Меню");
      trigger.setAttribute("title", "Меню");
      trigger.setAttribute("aria-expanded", this._menuOpen ? "true" : "false");
      trigger.innerHTML = '<ha-icon icon="mdi:menu"></ha-icon>';
      oldBack.replaceWith(trigger);
      trigger.addEventListener("click", () => {
        this._menuOpen = true;
        this._queueRender();
      });
    }

    root.querySelectorAll(".menu-backdrop-v041,.menu-drawer-v041").forEach((node) => node.remove());
    root.insertAdjacentHTML("beforeend", this._menuMarkupV041());

    root.querySelectorAll("[data-menu-close]").forEach((element) => {
      element.addEventListener("click", () => {
        this._menuOpen = false;
        this._queueRender();
      });
    });

    root.querySelector("[data-menu-parent]")?.addEventListener("click", () => {
      this._menuOpen = false;
      this._menuNavigateParent();
    });

    root.querySelectorAll("[data-menu-device]").forEach((button) => {
      button.addEventListener("click", () => {
        const deviceId = button.dataset.menuDevice;
        if (deviceId) this._diagnosticDeviceId = deviceId;
        this._menuOpen = false;
        this._queueRender();
      });
    });

    root.querySelector("[data-menu-refresh]")?.addEventListener("click", () => {
      this._menuOpen = false;
      root.querySelector(".refresh")?.click();
      this._queueRender();
    });
  };

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v041]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV041 = "true";
      style.textContent = `
        .menu-trigger-v041 {
          color: var(--primary-text-color) !important;
        }
        .menu-backdrop-v041 {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(0,0,0,.22);
          opacity: 0;
          pointer-events: none;
          transition: opacity .18s ease;
        }
        .menu-backdrop-v041.open {
          opacity: 1;
          pointer-events: auto;
        }
        .menu-drawer-v041 {
          position: fixed;
          z-index: 81;
          top: 0;
          bottom: 0;
          left: 0;
          width: min(84vw, 340px);
          padding: calc(18px + env(safe-area-inset-top)) 14px calc(18px + env(safe-area-inset-bottom));
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border-right: 1px solid var(--divider-color);
          box-shadow: 12px 0 32px rgba(0,0,0,.15);
          transform: translateX(-102%);
          transition: transform .2s ease;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        .menu-drawer-v041.open {
          transform: translateX(0);
        }
        .menu-head-v041 {
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 4px 8px 10px;
        }
        .menu-head-v041 > strong {
          font-size: 22px;
          line-height: 1.2;
        }
        .menu-close-v041 {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border: 1px solid var(--divider-color);
          border-radius: 50%;
          background: transparent;
          color: var(--secondary-text-color);
          display: grid;
          place-items: center;
        }
        .menu-close-v041 ha-icon { --mdc-icon-size: 23px; }
        .menu-section-label-v041 {
          padding: 2px 12px 6px;
          color: var(--secondary-text-color);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .menu-row-v041 {
          width: 100%;
          min-height: 56px;
          border: 0;
          border-radius: 16px;
          background: transparent;
          color: var(--primary-text-color);
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr) 22px;
          align-items: center;
          gap: 9px;
          padding: 8px 10px;
          text-align: left;
          font: inherit;
          font-size: 16px;
        }
        .menu-row-v041 > ha-icon:first-child {
          color: var(--primary-color);
          --mdc-icon-size: 24px;
        }
        .menu-row-v041 .chevron {
          color: var(--secondary-text-color);
          --mdc-icon-size: 20px;
        }
        .menu-row-v041:not(.parent):not(.device) .chevron { visibility: hidden; }
        .menu-row-v041.active {
          color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 10%, transparent);
          font-weight: 750;
        }
        .menu-device-name-v041 {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .menu-dot-v041 {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: var(--secondary-text-color);
        }
        .menu-dot-v041.good { background: var(--success-color, #2e7d32); }
        .menu-dot-v041.warn { background: var(--warning-color, #ed6c02); }
        .menu-dot-v041.bad { background: var(--error-color, #d32f2f); }
        .menu-divider-v041 {
          height: 1px;
          margin: 10px 8px;
          background: var(--divider-color);
        }
        .menu-footer-v041 {
          margin-top: 18px;
          padding: 12px;
          color: var(--secondary-text-color);
          font-size: 13px;
          line-height: 1.4;
        }
        .menu-footer-v041 strong,
        .menu-footer-v041 span { display: block; }
        .menu-footer-v041 strong {
          color: var(--primary-text-color);
          font-size: 14px;
          margin-bottom: 2px;
        }
        @media (max-width: 390px) {
          .menu-drawer-v041 { width: min(88vw, 328px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .menu-backdrop-v041,
          .menu-drawer-v041 { transition: none; }
        }
      `;
      root.append(style);
    }

    this._installMenuV041();
  };
}
