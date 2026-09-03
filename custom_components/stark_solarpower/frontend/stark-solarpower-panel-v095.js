import "./stark-solarpower-panel-v092.js";

const Panel = customElements.get("stark-solarpower-panel");

if (Panel && !Panel.prototype.__starkUiV095) {
  Panel.prototype.__starkUiV095 = true;
  const previousSyncControls = Panel.prototype._syncShellControlsV080;

  Panel.prototype._installPeerSelectorV095 = function () {
    const root = this.shadowRoot;
    if (!root || root.querySelector("style[data-stark-ui-v095]")) return;

    const style = document.createElement("style");
    style.dataset.starkUiV095 = "true";
    style.textContent = `
      /* Canonical StarLine peer-device selector: status and selection stay independent. */
      .global-device-context {
        box-sizing:border-box!important;
        width:100%!important;
        height:52px!important;
        min-height:52px!important;
        flex:0 0 52px!important;
        grid-template-columns:repeat(var(--ups-count),minmax(0,1fr))!important;
        gap:8px!important;
        margin:0!important;
        padding:4px max(12px,env(safe-area-inset-right,0px)) 4px max(12px,env(safe-area-inset-left,0px))!important;
        border:0!important;
        border-radius:0!important;
        overflow:visible!important;
        background:var(--card-background-color)!important;
        box-shadow:none!important;
      }
      .global-device-context button {
        box-sizing:border-box!important;
        min-width:0!important;
        width:100%!important;
        height:44px!important;
        min-height:44px!important;
        justify-content:flex-start!important;
        gap:10px!important;
        padding:0 14px!important;
        border:1px solid var(--divider-color)!important;
        border-radius:15px!important;
        background:var(--card-background-color)!important;
        color:var(--primary-text-color)!important;
        box-shadow:none!important;
        font-size:15px!important;
        line-height:1.15!important;
        font-weight:750!important;
        text-align:left!important;
      }
      .global-device-context button.active {
        border-color:color-mix(in srgb,var(--primary-color,#03a9d9) 65%,transparent)!important;
        background:color-mix(in srgb,var(--primary-color,#03a9d9) 10%,var(--card-background-color))!important;
        color:var(--primary-color,#03a9d9)!important;
        box-shadow:none!important;
      }
      .global-device-context .device-name {
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      @media(max-width:380px) {
        .global-device-context {
          gap:6px!important;
        }
        .global-device-context button {
          gap:8px!important;
          padding-inline:10px!important;
          font-size:14px!important;
        }
      }
    `;
    root.append(style);
  };

  Panel.prototype._syncShellControlsV080 = function () {
    previousSyncControls?.call(this);
    this._installPeerSelectorV095();
  };
}
