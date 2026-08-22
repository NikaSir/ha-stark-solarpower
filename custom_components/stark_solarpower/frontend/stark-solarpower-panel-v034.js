import "./stark-solarpower-panel-v033.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.3.4";

if (Panel && !Panel.prototype.__starkUiV034) {
  Panel.prototype.__starkUiV034 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._render = function () {
    previousRender.call(this);

    const root = this.shadowRoot;
    if (!root) return;

    const subtitle = root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS · UI v${UI_VERSION}`;

    if (root.querySelector("style[data-stark-ui-v034]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV034 = "true";
    style.textContent = `
      /* Mobile-first typography pass for iPhone Pro Max. Layout is unchanged. */
      .subtitle {
        font-size: 14px !important;
        line-height: 1.25 !important;
      }
      .global-device-context button {
        font-size: 16px !important;
        line-height: 1.2 !important;
        font-weight: 650 !important;
      }
      .global-device-context button.active {
        font-weight: 750 !important;
      }
      .device-health-dot {
        width: 9px !important;
        height: 9px !important;
        flex-basis: 9px !important;
      }
      .eyebrow {
        font-size: 13px !important;
        line-height: 1.25 !important;
      }
      .status {
        font-size: 15px !important;
        line-height: 1.2 !important;
      }
      .flow-node span,
      .flow-ups span {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }
      .flow-node strong,
      .flow-ups strong {
        font-size: 17px !important;
        line-height: 1.2 !important;
      }
      .bar-title {
        font-size: 15px !important;
        line-height: 1.25 !important;
      }
      .trust {
        font-size: 15px !important;
        line-height: 1.35 !important;
      }
      .metric-label {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }
      .metric strong {
        font-size: 16px !important;
        line-height: 1.25 !important;
      }
      .source-summary span,
      .source-summary strong {
        font-size: 15px !important;
        line-height: 1.3 !important;
      }
      .diagnostic-group h3,
      .event-summary h3 {
        font-size: 18px !important;
        line-height: 1.25 !important;
      }
      .diagnostic-row span,
      .diagnostic-row strong {
        font-size: 16px !important;
        line-height: 1.35 !important;
      }
      .history-state {
        font-size: 15px !important;
      }
      .history-link span {
        font-size: 15px !important;
        line-height: 1.25 !important;
      }
      .history-link strong {
        font-size: 16px !important;
        line-height: 1.25 !important;
      }
      .event-row > span {
        font-size: 15px !important;
        line-height: 1.25 !important;
      }
      .event-copy strong {
        font-size: 16px !important;
        line-height: 1.3 !important;
      }
      .event-copy small {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }
      .hint {
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      .bottom-nav .tab {
        font-size: 14px !important;
        line-height: 1.1 !important;
        font-weight: 650 !important;
      }
      .bottom-nav .tab ha-icon {
        --mdc-icon-size: 24px !important;
      }

      @media (max-width: 430px) {
        .global-device-context button {
          min-height: 52px !important;
          padding: 8px 10px !important;
        }
        .power-flow {
          margin-bottom: 18px !important;
        }
        .flow-node,
        .flow-ups {
          min-height: 96px !important;
        }
        .metric {
          min-height: 60px !important;
        }
        .diagnostic-row {
          min-height: 48px !important;
        }
        .history-link {
          min-height: 58px !important;
        }
        .event-row {
          min-height: 50px !important;
        }
      }
    `;
    root.append(style);
  };
}
