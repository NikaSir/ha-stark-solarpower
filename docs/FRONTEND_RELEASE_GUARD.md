# Stark SolarPower frontend release guard

Production registration for the integration-owned UPS panel is guarded by CI.

Required invariants:

- `module_url` points to `stark-solarpower-panel-bundle.js`;
- cache busting uses the panel UI version query string;
- `panel_manifest.json` declares `frontend_delivery.mode = self_contained_bundle`;
- `runtime_previous_version_imports = false`;
- the generated production bundle passes `node --check`;
- the committed bundle must match a clean deterministic rebuild;
- production bundle must not contain runtime `import` / `export` dependencies on historical UI modules.

Historical frontend sources may remain build-time inputs. They are not production runtime dependencies.
