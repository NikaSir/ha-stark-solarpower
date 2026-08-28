import "./stark-solarpower-panel-v085.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.8.6";
const STARTUP_BACKGROUND =
  "/stark_solarpower_panel/assets/stark-hero-internet-v063.webp?v=0.6.3";
const STARTUP_ARTWORK =
  "/stark_solarpower_panel/assets/stark-country-1000-online.png?v=0.6.6";

function startupOverviewV086() {
  return `<section class="overview-v051 overview-v066 startup-overview-v086" aria-busy="true" aria-label="Получение данных UPS">
    <article class="ups-hero-v051 card-v051 unknown" style="--hero-background-v051:url('${STARTUP_BACKGROUND}')">
      <div class="hero-head-v051">
        <div class="hero-copy-v051">
          <span>ПИТАНИЕ</span>
          <h2>Получение данных</h2>
          <p>Подключение к Home Assistant</p>
        </div>
        <div class="freshness-v051 connection-v066 unknown" role="status" aria-label="Подключение · Чтение телеметрии">
          <span class="connection-lamp-v066" aria-hidden="true"></span>
          <span class="connection-copy-v066">
            <strong>Подключение</strong>
            <small>Чтение телеметрии</small>
          </span>
        </div>
      </div>
      <div class="hero-scene-v051">
        <div class="scene-node-v051 grid">
          <ha-icon icon="mdi:transmission-tower"></ha-icon>
          <div><span>Сеть</span><strong>—</strong></div>
        </div>
        <div class="scene-node-v051 load">
          <ha-icon icon="mdi:monitor-dashboard"></ha-icon>
          <div><span>Нагрузка</span><strong>—</strong></div>
        </div>
        <img class="ups-art-v051" src="${STARTUP_ARTWORK}" alt="Stark Country 1000 ONLINE (16A)" loading="eager" decoding="sync" fetchpriority="high">
        <div class="scene-node-v051 battery">
          <ha-icon icon="mdi:battery"></ha-icon>
          <div><span>АКБ</span><strong>—</strong></div>
        </div>
      </div>
    </article>
    <div class="reserve-strip-v067 unknown">
      <ha-icon icon="mdi:battery-sync"></ha-icon>
      <strong>Проверка состояния АКБ</strong>
    </div>
    <article class="battery-details-v070">
      <div class="battery-details-head-v070">
        <ha-icon icon="mdi:battery-heart-variant"></ha-icon>
        <strong>Батарея</strong>
        <small>Получение телеметрии</small>
      </div>
      <div class="battery-facts-v070">
        <div class="battery-fact-v070"><span>Напряжение</span><strong>—</strong></div>
        <div class="battery-fact-v070"><span>АКБ, шт.</span><strong>—</strong></div>
        <div class="battery-fact-v070"><span>Темп. ЗУ</span><strong>—</strong></div>
        <div class="battery-fact-v070"><span>Автономия</span><strong>—</strong></div>
      </div>
    </article>
    <style data-stark-startup-v086>
      section.startup-overview-v086 {
        gap:8px !important;
        box-sizing:border-box;
        padding-bottom:16px;
      }
      section.startup-overview-v086 .hero-scene-v051 { height:336px !important; }
      section.startup-overview-v086 .scene-node-v051.battery {
        top:38px !important;
        bottom:auto !important;
      }
      section.startup-overview-v086 .scene-node-v051.grid,
      section.startup-overview-v086 .scene-node-v051.load { top:54% !important; }
      section.startup-overview-v086 .reserve-strip-v067 {
        min-height:44px !important;
        padding:7px 12px !important;
      }
      section.startup-overview-v086 .battery-details-v070 { padding:10px 14px 11px; }
      section.startup-overview-v086 .battery-details-head-v070 { margin-bottom:8px; }
      section.startup-overview-v086 .battery-fact-v070 span {
        min-height:15px;
        white-space:nowrap;
        overflow-wrap:normal;
      }
      @media(max-width:390px) {
        section.startup-overview-v086 .hero-scene-v051 { height:332px !important; }
        section.startup-overview-v086 .scene-node-v051.battery { top:36px !important; }
        section.startup-overview-v086 .battery-details-v070 { padding:10px 12px 11px; }
      }
    </style>
  </section>`;
}

if (Panel && !Panel.prototype.__starkUiV086) {
  Panel.prototype.__starkUiV086 = true;
  const previousRender = Panel.prototype._render;

  Panel.prototype._installStartupOverviewV086 = function () {
    if (this._registryLoaded || this._registryError) return;
    const root = this.shadowRoot;
    const app = root?.querySelector("main.app");
    const header = app?.querySelector(":scope > .app-header");
    const empty = app?.querySelector(".zoom-surface-v065 .empty, .empty");
    if (!app || !header || !empty) return;

    if (!app.querySelector(":scope > .global-device-context")) {
      const selector = document.createElement("div");
      selector.className = "global-device-context startup-selector-v086";
      selector.setAttribute("aria-label", "Выбор UPS загружается");
      selector.style.setProperty("--ups-count", "2");
      selector.innerHTML = `<button type="button" class="active" aria-pressed="true" aria-disabled="true"><span class="device-name">UPS Интернет</span></button>
        <button type="button" aria-pressed="false" aria-disabled="true"><span class="device-name">UPS Котёл</span></button>`;
      header.insertAdjacentElement("afterend", selector);
    }

    const template = document.createElement("template");
    template.innerHTML = startupOverviewV086();
    empty.replaceWith(template.content);
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    this._installStartupOverviewV086();
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
