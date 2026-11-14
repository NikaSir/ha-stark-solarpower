import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const components = new Map();
const context = vm.createContext({
  HTMLElement: class { attachShadow() {} },
  Image: class { decode() { return Promise.resolve(); } },
  customElements: {
    get: (name) => components.get(name),
    define: (name, cls) => components.set(name, cls),
  },
});
vm.runInContext(fs.readFileSync(
  new URL("../custom_components/stark_solarpower/frontend/stark-solarpower-panel-bundle.js", import.meta.url),
  "utf8",
), context);
const panel = new (components.get("stark-solarpower-panel"))();
const states = {};
function ups(id, name, readings) {
  const entities = {};
  for (const [key, state] of Object.entries(readings)) {
    const entity = `${id}.${key}`;
    entities[key] = entity;
    states[entity] = { state };
  }
  return { id, name, entities };
}
const internet = ups("net", "UPS Интернет", {
  cloud_connected: "on", data_stale: "off", mode: "line_mode",
  input_voltage: "231", battery_voltage: "27.3", output_load: "18",
  battery_remain_time: "135",
  data_timestamp: "2026-11-14T17:36:00Z",
  last_successful_update: "2026-11-14T17:37:00Z",
});
const boiler = ups("boiler", "UPS Котел", {
  cloud_connected: "off", data_stale: "on", mode: "line_mode",
  input_voltage: "199", battery_voltage: "25.1", output_load: "82",
  battery_remain_time: "99",
  data_timestamp: "2026-11-14T17:11:00Z",
  last_successful_update: "2026-11-14T17:12:00Z",
});
panel._hass = { states };
panel._devices = [internet, boiler];
panel._registryLoaded = true;

let markup = panel._renderOverviewV051();
assert.match(markup, /ИБП Интернет/);
assert.match(markup, /ИБП Котёл/);
assert.match(markup, /2 ч 15 мин/);
assert.match(markup, /18 %/);
assert.match(markup, /Неизвестно/);
assert.doesNotMatch(markup, /199 В|25,1 В|82 %|1 ч 39 мин/);
assert.equal((markup.match(/<details>/g) || []).length, 2);
for (const detail of markup.matchAll(/<details>(.*?)<\/details>/gs)) {
  assert.match(detail[1], /<summary>.*Подробнее.*<\/summary>.*Снимок.*Обмен/s);
}
states["net.battery_remain_time"].state = "unavailable";
states["net.output_load"].state = "0";
states["net.mode"].state = "unknown";
markup = panel._renderOverviewV051();
assert.doesNotMatch(markup, /2 ч 15 мин|От сети/);
assert.match(markup, /0 %/);
assert.equal(panel._viewCacheKeyV080(), "overview");

states["net.mode"].state = "bypass_mode";
assert.match(panel._renderOverviewV051(), /Байпас/);
states["net.mode"].state = "fault_mode";
assert.match(panel._renderOverviewV051(), /Авария/);
