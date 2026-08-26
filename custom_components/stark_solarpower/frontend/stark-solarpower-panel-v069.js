import "./stark-solarpower-panel-v068.js";

const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.9";

function sameTreeShape(current, desired) {
  if (!current || !desired || current.nodeType !== desired.nodeType) return false;
  if (current.nodeType === Node.ELEMENT_NODE && current.tagName !== desired.tagName) return false;
  if (current.childNodes.length !== desired.childNodes.length) return false;
  for (let index = 0; index < current.childNodes.length; index += 1) {
    if (!sameTreeShape(current.childNodes[index], desired.childNodes[index])) return false;
  }
  return true;
}

function sameChildrenShape(current, desired) {
  if (current.childNodes.length !== desired.childNodes.length) return false;
  for (let index = 0; index < current.childNodes.length; index += 1) {
    if (!sameTreeShape(current.childNodes[index], desired.childNodes[index])) return false;
  }
  return true;
}

function syncAttributes(current, desired) {
  for (const attribute of Array.from(current.attributes)) {
    if (!desired.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  }
  for (const attribute of Array.from(desired.attributes)) {
    if (current.getAttribute(attribute.name) !== attribute.value) {
      current.setAttribute(attribute.name, attribute.value);
    }
  }
}

function syncTree(current, desired) {
  if (current.nodeType === Node.TEXT_NODE) {
    if (current.nodeValue !== desired.nodeValue) current.nodeValue = desired.nodeValue;
    return;
  }
  if (current.nodeType === Node.ELEMENT_NODE) syncAttributes(current, desired);
  for (let index = 0; index < current.childNodes.length; index += 1) {
    syncTree(current.childNodes[index], desired.childNodes[index]);
  }
}

function syncChildren(current, desired) {
  for (let index = 0; index < current.childNodes.length; index += 1) {
    syncTree(current.childNodes[index], desired.childNodes[index]);
  }
}

if (Panel && !Panel.prototype.__starkUiV069) {
  Panel.prototype.__starkUiV069 = true;

  const previousRender = Panel.prototype._render;

  Panel.prototype._liveStructureKeyV069 = function () {
    const devices = (this._devices || []).map((device) => [
      device.id,
      device.name,
      device.model,
      Object.entries(device.entities || {})
        .map(([key, entityId]) => [key, entityId])
        .sort(([left], [right]) => left.localeCompare(right)),
    ]);
    return JSON.stringify([
      this._view,
      this._selectedUpsId?.() || null,
      Boolean(this._menuOpen),
      devices,
    ]);
  };

  Panel.prototype._renderLiveViewV069 = function () {
    if (this._view === "overview") return this._renderOverviewV051();
    if (this._view === "ups") return this._renderUpsV051();
    if (this._view === "history") return this._renderHistory();
    if (this._view === "events") return this._renderEventsV051();
    if (this._view === "diagnostics") return this._renderDiagnostics();
    return null;
  };

  Panel.prototype._patchLiveViewV069 = function () {
    const root = this.shadowRoot;
    const current = root?.querySelector(".zoom-surface-v065")
      || root?.querySelector(".zoom-content-v057");
    const markup = this._renderLiveViewV069();
    if (!root || !current || typeof markup !== "string") return false;

    const template = document.createElement("template");
    template.innerHTML = markup;
    // The permanent selector above the canvas supersedes the legacy local
    // Diagnostics selector, which the normal render pipeline also removes.
    template.content.querySelectorAll(".device-switcher").forEach((node) => node.remove());
    // The zoom installer moves app.children, not top-level whitespace nodes.
    // Mirror that exact shape for multi-root Diagnostics markup.
    Array.from(template.content.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.nodeValue.trim()) node.remove();
    });

    if (!sameChildrenShape(current, template.content)) return false;
    syncChildren(current, template.content);

    const subtitle = root.querySelector(".subtitle");
    if (subtitle?.textContent !== `UPS Control Center · UI v${UI_VERSION}`) {
      subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
    }
    return true;
  };

  Panel.prototype._render = function () {
    const canPatch = Boolean(
      this._hass
      && !this._loadingRegistry
      && !this._registryError
      && this._devices?.length
    );
    const structureKey = canPatch ? this._liveStructureKeyV069() : null;

    if (
      structureKey
      && this._liveStructureCacheV069 === structureKey
      && this._patchLiveViewV069()
    ) {
      return;
    }

    // Force the older Overview-only guard to yield whenever the selected
    // view/device structure actually changed and a complete render is needed.
    this._overviewStructureCacheV068 = null;
    previousRender.call(this);

    this._liveStructureCacheV069 = canPatch ? this._liveStructureKeyV069() : null;
    const subtitle = this.shadowRoot?.querySelector(".subtitle");
    if (subtitle) subtitle.textContent = `UPS Control Center · UI v${UI_VERSION}`;
  };
}
