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
  input_voltage: "231", output_voltage: "229.6", battery_capacity: "100", battery_voltage: "27.3", output_load: "18",
  battery_remain_time: "135",
  data_timestamp: "2026-11-14T17:36:00Z",
  last_successful_update: "2026-11-14T17:37:00Z",
});
const boiler = ups("boiler", "UPS Котел", {
  cloud_connected: "off", data_stale: "on", mode: "line_mode",
  input_voltage: "199", output_voltage: "198.9", battery_capacity: "87", battery_voltage: "25.1", output_load: "82",
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
assert.match(markup, /class="ups-overview"[^>]*data-ups-count="2"/);
for (const [, card] of markup.matchAll(/<article[^>]*>(.*?)<\/article>/gs)) {
  const [collapsed, details] = card.split("<details>");
  assert.deepEqual(
    [...collapsed.split('class="ups-overview-grid"')[1].matchAll(/<div><span>([^<]+)<\/span><strong>/g)].map((match) => match[1]),
    ["Питание", "Нагрузка", "АКБ", "Заряд", "Вход", "Выход"],
  );
  assert.match(collapsed, /ups-overview-hero[\s\S]*Автономность[\s\S]*ups-overview-grid/);
  assert.doesNotMatch(collapsed, /<p class="ups-overview-status/);
  assert.match(details, /ups-overview-status.*ups-overview-status.*Снимок.*Обмен/s);
}
assert.match(markup, /aria-label="Связь: Нет связи"/);
assert.match(markup, /aria-label="Свежесть: Данные актуальны"/);
assert.match(markup, /aria-label="Свежесть: Данные устарели"/);

const compactIcons = (card) => [...card.matchAll(
  /class="ups-status-icon (\w+)" role="img" aria-label="([^"]+)"[^>]*>\s*<span class="ups-status-glyph(?: ups-status-glyph--question)?" aria-hidden="true"><ha-icon icon="([^"]+)"/g,
)].map(([, tone, label, icon]) => [tone, label, icon]);
const cards = (html) => [...html.matchAll(/<article[^>]*>(.*?)<\/article>/gs)].map(([, card]) => card);
const currentCloud = ["good", "Связь: Облако", "mdi:cloud"];
const staleClock = ["warn", "Свежесть: Данные устарели", "mdi:clock-alert-outline"];
assert.deepEqual(cards(markup).map(compactIcons), [
  [currentCloud, ["good", "Свежесть: Данные актуальны", "mdi:check-circle-outline"]],
  [["warn", "Связь: Нет связи", "mdi:cloud-off-outline"], staleClock],
]);
states["net.data_stale"].state = "on";
const sampleTime = states["net.data_timestamp"].state;
states["net.data_timestamp"].state = "unavailable";
assert.deepEqual(compactIcons(cards(panel._renderOverviewV051())[0]), [
  currentCloud,
  ["unknown", "Свежесть: Нет данных", "mdi:clock-outline"],
]);
assert.match(cards(panel._renderOverviewV051())[0], /ups-status-glyph--question/);
states["net.data_timestamp"].state = sampleTime;
states["boiler.cloud_connected"].state = "unavailable";
states["boiler.data_stale"].state = "unavailable";
const unavailableMarkup = panel._renderOverviewV051();
assert.equal((unavailableMarkup.match(/class="ups-status-glyph ups-status-glyph--question"/g) || []).length, 2);
assert.deepEqual(cards(unavailableMarkup).map(compactIcons), [
  [currentCloud, staleClock],
  [["unknown", "Связь: Нет данных", "mdi:cloud-question-outline"],
    ["unknown", "Свежесть: Нет данных", "mdi:clock-outline"]],
]);
states["net.data_stale"].state = "off";
states["boiler.cloud_connected"].state = "off";
states["boiler.data_stale"].state = "on";
assert.match(markup, /data-entity="net.battery_capacity"[^>]*>[\s\S]*?<span>Заряд<\/span><strong>100 %/);
assert.match(markup, /data-entity="net.output_voltage"[^>]*>[\s\S]*?<span>Выход<\/span><strong>229,6 В/);
assert.match(markup, /data-entity="boiler.battery_capacity"[^>]*>[\s\S]*?<span>Заряд<\/span><strong>—/);
assert.match(markup, /data-entity="boiler.output_voltage"[^>]*>[\s\S]*?<span>Выход<\/span><strong>—/);
states["net.battery_capacity"].state = "unavailable";
states["net.output_voltage"].state = "0";
const partial = panel._renderOverviewV051();
assert.match(partial, /Заряд<\/span><strong>—/);
assert.match(partial, /Выход<\/span><strong>0 В/);
assert.match(partial, /АКБ<\/span><strong>27,3 В/);
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

const tabs = {
  classList: { add() {} },
  querySelectorAll: () => [],
  querySelector(selector) {
    const view = selector.match(/"(\w+)"/)[1];
    return {
      remove: () => { this.innerHTML = this.innerHTML.replace(
        new RegExp(`<button[^>]*data-view-v051="${view}"[^>]*>.*?</button>`), "",
      ); },
      setAttribute() {},
      querySelector: () => ({ textContent: "" }),
    };
  },
  insertBefore() {},
};
panel.shadowRoot = { querySelector: () => tabs };
panel._installNavigationV051();
assert.deepEqual(
  [...tabs.innerHTML.matchAll(/data-view-v051="([^"]+)"/g)].map((match) => match[1]),
  ["overview", "ups", "events", "history", "diagnostics"],
);
panel._diagnosticDeviceId = boiler.id;
for (const [view, heading] of [["ups", "Рабочие параметры"], ["events", "СОБЫТИЯ"]]) {
  panel._view = view;
  const content = panel._renderViewMarkupV080();
  assert.match(content, new RegExp(heading));
  assert.match(content, /UPS Котел/);
}
panel._view = "diagnostics";
assert.doesNotMatch(panel._renderViewMarkupV080(), /Рабочие параметры|СОБЫТИЯ/);
