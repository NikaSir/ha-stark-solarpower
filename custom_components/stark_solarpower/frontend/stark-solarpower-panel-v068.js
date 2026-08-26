import "./stark-solarpower-panel-v067.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.8";
const TONES = ["good", "warn", "bad", "unknown", "current"];

function setText(root, selector, value) {
  const element = root?.querySelector(selector);
  if (!element) return false;
  const text = String(value ?? "");
  if (element.textContent !== text) element.textContent = text;
  return true;
}

function setTone(element, tone) {
  if (!element) return false;
  element.classList.remove(...TONES);
  if (tone) element.classList.add(tone);
  return true;
}

if (Panel && !Panel.prototype.__starkUiV068) {
  Panel.prototype.__starkUiV068 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._overviewStructureKeyV068 = function (device) {
    const entities = Object.entries(device?.entities || {})
      .map(([key, entityId]) => [key, entityId])
      .sort(([left], [right]) => left.localeCompare(right));
    return JSON.stringify([
      this._view,
      device?.id ?? null,
      device?.name ?? null,
      device?.model ?? null,
      entities,
    ]);
  };

  Panel.prototype._patchOverviewV068 = function (device) {
    const root = this.shadowRoot;
    const overview = root?.querySelector(".zoom-surface-v065 .overview-v066")
      || root?.querySelector(".overview-v066");
    if (!root || !overview || !device) return false;

    const power = this._powerStatusV066(device);
    const connection = this._connectionStatusV066(device);
    const battery = this._numeric(device, "battery_capacity");
    const load = this._numeric(device, "output_load");
    const reserve = this._reserveV050(device, battery !== null);

    setTone(overview.querySelector(".ups-hero-v051"), power.tone);
    setText(overview, ".hero-copy-v051 h2", power.title);
    setText(overview, ".hero-copy-v051 p", power.detail);

    const connectionPlaque = overview.querySelector(".connection-v066");
    setTone(connectionPlaque, connection.channel.tone);
    setText(overview, ".connection-copy-v066 strong", connection.channel.label);
    const freshness = overview.querySelector(".connection-copy-v066 small");
    setTone(freshness, connection.freshness.tone);
    if (freshness && freshness.textContent !== connection.freshness.label) {
      freshness.textContent = connection.freshness.label;
    }

    setText(overview, ".scene-node-v051.grid strong", this._format(device, "input_voltage"));
    setText(overview, ".scene-node-v051.load strong", load === null ? "—" : `${Math.round(load)} %`);
    setText(overview, ".scene-node-v051.battery strong", battery === null ? "—" : `${Math.round(battery)} %`);

    const reserveStrip = overview.querySelector(".reserve-strip-v067");
    setTone(reserveStrip, reserve.tone);
    const reserveIcon = reserveStrip?.querySelector("ha-icon");
    if (reserveIcon?.getAttribute("icon") !== reserve.icon) {
      reserveIcon?.setAttribute("icon", reserve.icon);
    }
    setText(overview, ".reserve-strip-v067 strong", reserve.label);

    setText(root, ".subtitle", `UPS Control Center · UI v${UI_VERSION}`);
    return true;
  };

  Panel.prototype._render = function () {
    const device = this._selectedDeviceV051?.();
    const structureKey = this._view === "overview" && device
      ? this._overviewStructureKeyV068(device)
      : null;

    // Telemetry updates must not replace the Overview DOM. Keeping the same
    // image, canvas and zoom nodes prevents iOS WebView flashes and preserves
    // the user's current scale, pan and native scroll position.
    if (
      structureKey
      && this._overviewStructureCacheV068 === structureKey
      && this._patchOverviewV068(device)
    ) {
      return;
    }

    previousRender.call(this);

    const renderedDevice = this._selectedDeviceV051?.();
    this._overviewStructureCacheV068 = this._view === "overview" && renderedDevice
      ? this._overviewStructureKeyV068(renderedDevice)
      : null;
    setText(this.shadowRoot, ".subtitle", `UPS Control Center · UI v${UI_VERSION}`);
  };
}
