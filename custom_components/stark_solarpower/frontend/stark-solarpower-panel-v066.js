import "./stark-solarpower-panel-v065.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.6";
const UPS_ARTWORK =
  "/stark_solarpower_panel/assets/stark-country-1000-online.png?v=0.6.6";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (Panel && !Panel.prototype.__starkUiV066) {
  Panel.prototype.__starkUiV066 = true;

  Panel.prototype._connectionStatusV066 = function (device) {
    const cloud = this._isOn(device, "cloud_connected");
    const stale = this._isOn(device, "data_stale");

    const channel = cloud === true
      ? { label:"Облако", tone:"good" }
      : cloud === false
        ? { label:"Нет связи", tone:"bad" }
        : { label:"Нет данных", tone:"unknown" };
    const freshness = stale === false
      ? { label:"Данные актуальны", tone:"current" }
      : stale === true
        ? { label:"Данные устарели", tone:"warn" }
        : { label:"Нет данных", tone:"unknown" };

    return { channel, freshness };
  };

  Panel.prototype._powerStatusV066 = function (device) {
    const mode = this._mode(device);
    const onBattery = mode === "battery_mode" || this._isOn(device, "on_battery") === true;
    if (onBattery) {
      return {
        title:"От батареи",
        detail:`Нагрузка питается от АКБ · Выход ${this._format(device, "output_voltage")}`,
        tone:"warn",
      };
    }
    if (mode === "line_mode") {
      return {
        title:"От сети",
        detail:`Выход ${this._format(device, "output_voltage")} · ${this._format(device, "output_frequency")}`,
        tone:"good",
      };
    }
    if (mode === "fault_mode") {
      return {
        title:"Не определено",
        detail:"UPS сообщает аварийный режим",
        tone:"bad",
      };
    }
    return {
      title:"Не определено",
      detail:"Режим электропитания достоверно не установлен",
      tone:"unknown",
    };
  };

  Panel.prototype._renderOverviewV051 = function () {
    const device = this._selectedDeviceV051();
    if (!device) return this._empty("UPS не найдены");

    const power = this._powerStatusV066(device);
    const connection = this._connectionStatusV066(device);
    const battery = this._numeric(device, "battery_capacity");
    const load = this._numeric(device, "output_load");
    const background = this._heroBackgroundV051(device);

    return `<section class="overview-v051 overview-v066">
      <article class="ups-hero-v051 card-v051 ${esc(power.tone)}" style="--hero-background-v051:url('${esc(background)}')">
        <div class="hero-head-v051">
          <div class="hero-copy-v051">
            <span>ПИТАНИЕ</span>
            <h2>${esc(power.title)}</h2>
            <p>${esc(power.detail)}</p>
          </div>
          <div class="freshness-v051 connection-v066 ${esc(connection.channel.tone)}" role="status" aria-live="polite" aria-label="${esc(connection.channel.label)} · ${esc(connection.freshness.label)}">
            <span class="connection-lamp-v066" aria-hidden="true"></span>
            <span class="connection-copy-v066">
              <strong>${esc(connection.channel.label)}</strong>
              <small class="${esc(connection.freshness.tone)}">${esc(connection.freshness.label)}</small>
            </span>
          </div>
        </div>

        <div class="hero-scene-v051">
          <div class="scene-node-v051 grid" ${this._entityId(device, "input_voltage") ? `data-entity="${esc(this._entityId(device, "input_voltage"))}"` : ""}>
            <ha-icon icon="mdi:transmission-tower"></ha-icon>
            <div><span>Сеть</span><strong>${esc(this._format(device, "input_voltage"))}</strong></div>
          </div>
          <div class="scene-node-v051 load" ${this._entityId(device, "output_load") ? `data-entity="${esc(this._entityId(device, "output_load"))}"` : ""}>
            <ha-icon icon="mdi:monitor-dashboard"></ha-icon>
            <div><span>Нагрузка</span><strong>${load === null ? "—" : `${Math.round(load)} %`}</strong></div>
          </div>
          <img class="ups-art-v051" src="${UPS_ARTWORK}" alt="Stark Country 1000 ONLINE (16A)" loading="eager" decoding="sync" fetchpriority="high" ${this._entityId(device, "mode") ? `data-entity="${esc(this._entityId(device, "mode"))}"` : ""}>
          <div class="scene-node-v051 battery" ${this._entityId(device, "battery_capacity") ? `data-entity="${esc(this._entityId(device, "battery_capacity"))}"` : ""}>
            <ha-icon icon="mdi:battery"></ha-icon>
            <div><span>АКБ</span><strong>${battery === null ? "—" : `${Math.round(battery)} %`}</strong></div>
          </div>
        </div>
      </article>
    </section>`;
  };

  const previousRender = Panel.prototype._render;
  Panel.prototype._render = function () {
    previousRender.call(this);
    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;

    if (!root.querySelector("style[data-stark-ui-v066]")) {
      const style = document.createElement("style");
      style.dataset.starkUiV066 = "true";
      style.textContent = `
        /* UI 0.6.6: Overview contains one visual source of truth. */
        .overview-v066 { gap:0 !important; }
        .overview-v066 .ups-hero-v051 { min-height:0; }
        .overview-v066 .hero-scene-v051 { height:360px !important; }
        .overview-v066 .hero-copy-v051 { min-width:0; max-width:48%; }

        .connection-v066 {
          min-height:48px !important;
          max-width:52% !important;
          gap:10px !important;
          padding:12px 14px !important;
          border-radius:18px !important;
          color:var(--primary-text-color) !important;
        }
        .connection-lamp-v066 {
          width:10px;
          height:10px;
          flex:0 0 10px;
          border-radius:50%;
          background:var(--disabled-text-color);
          box-shadow:0 0 0 3px color-mix(in srgb,var(--disabled-text-color) 12%,transparent);
        }
        .connection-v066.good .connection-lamp-v066 { background:var(--success-color,#2eae55); box-shadow:0 0 0 3px color-mix(in srgb,var(--success-color,#2eae55) 12%,transparent); }
        .connection-v066.bad .connection-lamp-v066 { background:var(--error-color,#d93b3b); box-shadow:0 0 0 3px color-mix(in srgb,var(--error-color,#d93b3b) 12%,transparent); }
        .connection-copy-v066 { min-width:0; display:grid; gap:2px; text-align:left; }
        .connection-copy-v066 strong { color:var(--disabled-text-color); font-size:15px; font-weight:700; line-height:1.1; }
        .connection-v066.good .connection-copy-v066 strong { color:var(--success-color,#2eae55); }
        .connection-v066.bad .connection-copy-v066 strong { color:var(--error-color,#d93b3b); }
        .connection-copy-v066 small { color:var(--secondary-text-color); font-size:12px; font-weight:550; line-height:1.15; }
        .connection-copy-v066 small.warn { color:var(--warning-color,#ed8b00); font-weight:650; }
        .connection-copy-v066 small.unknown { color:var(--secondary-text-color); }

        @media (max-width:430px) {
          .overview-v066 .hero-scene-v051 { height:360px !important; }
          .connection-v066 { max-width:51% !important; }
          .overview-v066 .hero-copy-v051 p { max-width:230px; }
        }
      `;
      root.append(style);
    }
  };
}
