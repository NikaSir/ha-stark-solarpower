import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const bundlePath = new URL(
  "../custom_components/stark_solarpower/frontend/stark-solarpower-panel-bundle.js",
  import.meta.url,
);
const source = fs.readFileSync(bundlePath, "utf8");

class FakeClassList {
  constructor() { this.names = new Set(["refresh"]); }
  toggle(name, enabled) {
    if (enabled) this.names.add(name);
    else this.names.delete(name);
  }
  contains(name) { return this.names.has(name); }
}

class FakeIcon {
  constructor() { this.attributes = new Map([["icon", "mdi:refresh"]]); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
}

class FakeButton {
  constructor() {
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.disabled = false;
    this.icon = new FakeIcon();
  }
  querySelector(selector) { return selector === "ha-icon" ? this.icon : null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
}

class FakeStatus {
  constructor() { this.textContent = ""; }
}

class FakeHeader {
  constructor(status) { this.status = status; }
  querySelector(selector) { return selector === ".refresh-status-v096" ? this.status : null; }
}

class FakeShadowRoot {
  constructor() {
    this.refresh = new FakeButton();
    this.status = new FakeStatus();
    this.header = new FakeHeader(this.status);
  }
  querySelector(selector) {
    if (selector === ".refresh") return this.refresh;
    if (selector === ".app-header") return this.header;
    return null;
  }
}

globalThis.HTMLElement = class {
  constructor() { this.isConnected = true; }
  attachShadow() {
    this.shadowRoot = new FakeShadowRoot();
    return this.shadowRoot;
  }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
};

const registry = new Map();
globalThis.customElements = {
  define(name, constructor) { registry.set(name, constructor); },
  get(name) { return registry.get(name); },
};
globalThis.Event = class Event {};
globalThis.CustomEvent = class CustomEvent {};
globalThis.Image = class Image {
  decode() { return Promise.resolve(); }
};

let now = 0;
let nextTimerId = 1;
const timers = new Map();
globalThis.performance = { now: () => now };
globalThis.window = {
  setTimeout(callback, delay) {
    const id = nextTimerId++;
    timers.set(id, { callback, delay });
    return id;
  },
  clearTimeout(id) { timers.delete(id); },
};

function runTimer(delay) {
  const match = [...timers.entries()].find(([, timer]) => timer.delay === delay);
  assert.ok(match, `expected a ${delay} ms timer`);
  const [id, timer] = match;
  timers.delete(id);
  now += delay;
  timer.callback();
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

vm.runInThisContext(source, { filename: bundlePath.pathname });
const Panel = customElements.get("stark-solarpower-panel");
assert.ok(Panel, "production bundle must register stark-solarpower-panel");

function makePanel(callService) {
  const panel = new Panel();
  panel._devices = [
    { id:"internet", name:"UPS Интернет", entities:{ refresh_now:"button.ups_internet_refresh" } },
    { id:"boiler", name:"UPS Котёл", entities:{ refresh_now:"button.ups_boiler_refresh" } },
  ];
  panel._hass = {
    states: {
      "button.ups_internet_refresh": { state:"2026-09-09T00:00:00+00:00" },
      "button.ups_boiler_refresh": { state:"2026-09-09T00:00:00+00:00" },
    },
    callService,
  };
  return panel;
}

let serviceCalls = 0;
const successful = makePanel(async (domain, service) => {
  serviceCalls += 1;
  assert.equal(domain, "button");
  assert.equal(service, "press");
});
const successRun = successful._runRefreshV096();
void successful._runRefreshV096();
assert.equal(serviceCalls, 2, "one refresh request must be sent to each UPS only once");
assert.equal(successful.shadowRoot.refresh.disabled, true);
assert.equal(successful.shadowRoot.refresh.getAttribute("aria-busy"), "true");
assert.equal(successful.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:refresh");
await flushMicrotasks();
runTimer(900);
await successRun;
assert.equal(successful.shadowRoot.refresh.disabled, false);
assert.equal(successful.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:check");
assert.equal(successful.shadowRoot.status.textContent, "Запрос обновления выполнен");
runTimer(1400);
assert.equal(successful.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:refresh");

const partial = makePanel(async (_domain, _service, data) => (
  data.entity_id === "button.ups_boiler_refresh" ? false : undefined
));
const partialRun = partial._runRefreshV096();
await flushMicrotasks();
runTimer(900);
await partialRun;
assert.equal(partial.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:alert-circle-outline");
assert.equal(partial.shadowRoot.status.textContent, "Не удалось обновить данные");

let retryCalls = 0;
partial._hass.callService = async () => { retryCalls += 1; };
const retryRun = partial._runRefreshV096();
assert.equal(
  [...timers.values()].some((timer) => timer.delay === 1400),
  false,
  "retry must cancel the preceding result timer",
);
await flushMicrotasks();
runTimer(900);
await retryRun;
assert.equal(retryCalls, 2);
assert.equal(partial.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:check");
runTimer(1400);

let unavailableCalls = 0;
const unavailable = makePanel(async () => { unavailableCalls += 1; });
delete unavailable._hass.states["button.ups_boiler_refresh"];
const unavailableRun = unavailable._runRefreshV096();
runTimer(900);
await unavailableRun;
assert.equal(unavailableCalls, 0);
assert.equal(unavailable.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:alert-circle-outline");
runTimer(1400);

const slowResolvers = [];
const slow = makePanel(() => new Promise((resolve) => { slowResolvers.push(resolve); }));
const slowRun = slow._runRefreshV096();
assert.equal(slow.shadowRoot.refresh.disabled, true);
now += 1000;
slowResolvers.forEach((resolve) => resolve());
await flushMicrotasks();
await slowRun;
assert.equal(slow.shadowRoot.refresh.icon.getAttribute("icon"), "mdi:check");
runTimer(1400);

assert.ok(source.includes('const NIKAS_SHELL_V2_VERSION = "2.1"'));
assert.ok(source.includes('grid-template-areas:"header" "peer" "viewport" "tabs"'));
assert.ok(source.includes("--mdc-icon-size:26px!important"));
assert.ok(source.includes("width:168px!important"));
assert.ok(source.includes("height:58px!important"));
assert.ok(source.includes("REFRESH_MINIMUM_MS = 900"));
assert.ok(source.includes("REFRESH_RESULT_MS = 1400"));
assert.ok(!source.includes("window.location.reload"));

console.log("Stark UI 0.9.6 / NikaS UI 2.2 production regression OK");
