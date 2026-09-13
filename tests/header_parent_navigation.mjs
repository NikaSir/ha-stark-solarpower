import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const shell = fs.readFileSync("templates/shell_v2/nikas-specialized-shell.js", "utf8");
for (const source of ["/dashboard-actions/home", "/dashboard-rooms-v11/rooms", "/dashboard-infrastructure/overview"]) {
 const storage = { getItem: () => source, setItem() {}, removeItem() {} };
 const window = { location: { origin: "https://ha.example", href: "https://ha.example/dashboard-test?return_to="+source+"&from="+source, search: "?return_to="+source+"&from="+source }, sessionStorage: storage, localStorage: storage };
 const context = vm.createContext({window, document: {referrer: "https://ha.example"+source}, URL, URLSearchParams, Date, console});
 vm.runInContext(shell, context);
 assert.equal(vm.runInContext('captureNikasShellReturnRoute({panelId:"stark_solarpower",parentRoute:"/home/overview",safeReturnRoute:"/home/overview"})', context), "/home/overview");
}
console.log("Header parent ignores opening source, query, storage, and referrer");
const original = fs.readFileSync("custom_components/stark_solarpower/frontend/stark-solarpower-panel-v090.js", "utf8").replace(/^import .*$/mg, "");
const c = vm.createContext({customElements:{get:()=>null}, URL, URLSearchParams, window:{location:{href:"https://ha.example/dashboard-ups?return_to=/dashboard-actions/home"}}, document:{referrer:"https://ha.example/dashboard-actions/home"},localStorage:{getItem:()=>"/dashboard-actions/home",setItem(){}},sessionStorage:{getItem:()=>null,removeItem(){}}});
vm.runInContext(original,c);
assert.equal(vm.runInContext('resolveReturnRouteV090({_panel:{config:{parent_route:"/dashboard-actions/home"}}})', c), "/home/overview");
console.log("Stark installed private header resolver uses home");
