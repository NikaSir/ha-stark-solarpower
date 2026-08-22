import "./stark-solarpower-panel-v034.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.5";

if (Panel && !Panel.prototype.__starkUiV035) {
  Panel.prototype.__starkUiV035 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    // NikaS Integration Panel Template v1.0: Header Back is icon-only.
    root.querySelectorAll(".back span").forEach((node) => node.remove());
    const back = root.querySelector(".back");
    if (back) {
      back.setAttribute("aria-label", "Назад");
      back.setAttribute("title", "Назад");
    }

    if (root.querySelector("style[data-stark-ui-v035]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV035 = "true";
    style.textContent = `
      /* NikaS Integration Panel Template v1.0 shell alignment. */
      :host {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden !important;
      }
      .app {
        width: 100% !important;
        max-width: 1240px !important;
        margin: 0 auto !important;
        padding: 8px max(12px, env(safe-area-inset-right)) calc(98px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)) !important;
        overflow-x: hidden !important;
      }

      /* Header: 52 / 1fr / 52, centered title, icon-only Back, one Refresh action. */
      .app-header {
        display: grid !important;
        grid-template-columns: 52px minmax(0, 1fr) 52px !important;
        align-items: center !important;
        min-height: 62px !important;
        gap: 0 !important;
        margin: 0 0 12px !important;
        padding: max(5px, env(safe-area-inset-top)) 0 5px !important;
      }
      .header-main { display: contents !important; }
      .back,
      .refresh {
        width: 44px !important;
        min-width: 44px !important;
        height: 44px !important;
        min-height: 44px !important;
        border: 0 !important;
        border-radius: 14px !important;
        background: transparent !important;
        box-shadow: none !important;
        display: grid !important;
        place-items: center !important;
        padding: 0 !important;
      }
      .back {
        grid-column: 1 !important;
        justify-self: start !important;
        color: var(--primary-text-color) !important;
      }
      .refresh {
        grid-column: 3 !important;
        justify-self: end !important;
        color: var(--primary-color) !important;
      }
      .back ha-icon,
      .refresh ha-icon { --mdc-icon-size: 25px !important; }
      .title-wrap {
        grid-column: 2 !important;
        min-width: 0 !important;
        display: block !important;
        text-align: center !important;
      }
      .title-wrap > div { min-width: 0 !important; }
      .app-header h1 {
        margin: 0 !important;
        font-size: 18px !important;
        line-height: 1.12 !important;
        font-weight: 760 !important;
        letter-spacing: 0 !important;
        text-align: center !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .subtitle {
        margin-top: 3px !important;
        font-size: 14px !important;
        line-height: 1.2 !important;
        text-align: center !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      /* Device context remains stable and must fit one iPhone row. */
      .global-device-context {
        width: 100% !important;
        min-width: 0 !important;
        grid-template-columns: repeat(var(--ups-count), minmax(0, 1fr)) !important;
        gap: 10px !important;
        margin: 0 0 12px !important;
      }
      .global-device-context button {
        min-width: 0 !important;
        min-height: 52px !important;
        border-radius: 20px !important;
        padding: 8px 10px !important;
        font-size: 16px !important;
        line-height: 1.2 !important;
      }
      .global-device-context .device-name {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      /* Prevent long mobile values/statuses from widening the viewport. */
      .overview-grid,
      .history-grid,
      .ups-card,
      .diagnostic-card,
      .history-card,
      .card-head,
      .quick-grid,
      .source-summary,
      .diagnostic-row,
      .history-link,
      .event-row {
        min-width: 0 !important;
        max-width: 100% !important;
      }
      .overview-grid,
      .history-grid {
        grid-template-columns: minmax(0, 1fr) !important;
      }
      .card-head > div:first-child { min-width: 0 !important; }
      .card-head h2 {
        max-width: 100% !important;
        overflow-wrap: anywhere !important;
      }
      .status {
        flex: 0 1 auto !important;
        min-width: 0 !important;
        max-width: 48% !important;
        white-space: normal !important;
        text-align: right !important;
        justify-content: flex-end !important;
      }
      .status span { overflow-wrap: anywhere !important; }
      .power-flow { min-width: 0 !important; }
      .flow-node strong,
      .flow-ups strong {
        font-size: clamp(15px, 4vw, 17px) !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        text-overflow: clip !important;
      }
      .metric-copy,
      .metric strong,
      .source-summary span,
      .source-summary strong,
      .diagnostic-row span,
      .diagnostic-row strong,
      .history-link span,
      .history-link strong,
      .event-row span,
      .event-copy,
      .event-copy strong {
        min-width: 0 !important;
      }
      .diagnostic-row strong,
      .event-copy strong,
      .history-link strong {
        overflow-wrap: anywhere !important;
      }
      .history-link {
        grid-template-columns: 28px minmax(0, 1fr) minmax(0, auto) 22px !important;
      }

      /* Bottom navigation: full-width, fixed, edge-attached, never a floating pill. */
      .tabs.bottom-nav {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        transform: none !important;
        width: 100% !important;
        max-width: none !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 2px !important;
        margin: 0 !important;
        padding: 6px max(6px, env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(6px, env(safe-area-inset-left)) !important;
        border: 0 !important;
        border-top: 1px solid var(--divider-color) !important;
        border-radius: 0 !important;
        background: var(--card-background-color) !important;
        box-shadow: 0 -3px 14px color-mix(in srgb, #000 7%, transparent) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        z-index: 50 !important;
      }
      .bottom-nav .tab {
        min-width: 0 !important;
        min-height: 58px !important;
        height: auto !important;
        border-radius: 14px !important;
        padding: 4px 2px !important;
        gap: 2px !important;
        font-size: 14px !important;
        line-height: 1.1 !important;
        font-weight: 700 !important;
        overflow: hidden !important;
      }
      .bottom-nav .tab span {
        display: block !important;
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .bottom-nav .tab ha-icon { --mdc-icon-size: 24px !important; }
      .bottom-nav .tab.active {
        color: var(--primary-color) !important;
        background: color-mix(in srgb, var(--primary-color) 11%, transparent) !important;
        box-shadow: none !important;
      }

      @media (max-width: 430px) {
        .app-header {
          grid-template-columns: 52px minmax(0, 1fr) 52px !important;
        }
        .ups-card,
        .diagnostic-card,
        .history-card {
          width: 100% !important;
          padding: 16px !important;
        }
        .quick-grid,
        .bars { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .power-flow {
          grid-template-columns: minmax(74px, 1fr) 24px minmax(82px, 1fr) 24px minmax(74px, 1fr) !important;
          gap: 2px !important;
        }
        .flow-line ha-icon { --mdc-icon-size: 17px !important; }
      }

      @media (max-width: 390px) {
        .app {
          padding-left: max(10px, env(safe-area-inset-left)) !important;
          padding-right: max(10px, env(safe-area-inset-right)) !important;
        }
        .app-header {
          grid-template-columns: 48px minmax(0, 1fr) 48px !important;
        }
        .global-device-context { gap: 8px !important; }
        .global-device-context button {
          min-height: 50px !important;
          padding: 7px 8px !important;
          font-size: 15px !important;
        }
        .power-flow {
          grid-template-columns: minmax(68px, 1fr) 20px minmax(76px, 1fr) 20px minmax(68px, 1fr) !important;
        }
        .bottom-nav .tab { min-height: 56px !important; }
      }

      @media (min-width: 760px) {
        .app { padding-left: 20px !important; padding-right: 20px !important; }
        .tabs.bottom-nav { width: 100% !important; max-width: none !important; }
        .overview-grid,
        .history-grid,
        .diagnostic-card {
          width: min(100%, 820px) !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
      }
    `;
    root.append(style);
  };
}
