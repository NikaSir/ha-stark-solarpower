# Changelog

All notable project changes are recorded here.

## [1.8.10] - 2026-08-25

### Panel UI 0.6.0 — transform-owned zoom and pan

- Replace browser-owned `scrollLeft`/`scrollTop` canvas movement with one persistent `translate3d(x,y,0) scale(s)` transform.
- Remove iOS overflow rubber-band rollback that returned work content to the top boundary after touch release at both normal and enlarged scale.
- Clamp translation against the measured scaled canvas so every reachable position remains stable after release.
- Preserve transform state per selected UPS across telemetry-driven DOM replacement.
- Keep focal pinch, one-finger pan, two-finger reset/snap and the entity-activation guard.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.9] - 2026-08-25

### Panel UI 0.5.9 — focal-point persistence across telemetry rebuilds

- Capture the logical center point of the transformed canvas before a selected UPS telemetry render replaces its DOM.
- Restore that logical point after the replacement canvas completes its geometry measurement.
- Keep scale and pan position stable when live values change or primary telemetry becomes unavailable.
- Preserve the UI 0.5.8 entity-activation guard; pinch and pan do not open native more-info/history graphs.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.8] - 2026-08-25

### Panel UI 0.5.8 — stable canvas pan and gesture guard

- Add explicit one-finger horizontal and vertical panning for the transformed work canvas.
- Keep the existing canvas and scroll coordinates across optimized Home Assistant state updates instead of rebuilding it.
- Stop observing scrollbar-induced viewport geometry as a responsive resize source.
- Recalculate base width only for real window/visual-viewport resize events; content-height updates do not reset the origin.
- Cancel pending entity holds and suppress post-pinch/post-drag clicks to prevent accidental native more-info graphs.
- Preserve intentional stationary hold → more-info, focal pinch, reset/snap, system menu and all UPS semantics.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.7] - 2026-08-25

### Panel UI 0.5.7 — fixed transform canvas

- Replace layout-affecting CSS `zoom` with one fixed-layout `transform: scale()` work canvas.
- Scale the complete live selected-UPS DOM as a single visual composition without reflowing cards, paths or overlays during pinch.
- Compensate the transformed canvas dimensions so every enlarged region remains reachable by pan/scroll.
- Keep focal-point pinch, 75–200% limits, two-finger double-tap reset, 97–103% snap and per-UPS persistence.
- Recalculate the responsive base geometry only when the actual viewport/content dimensions change.
- Preserve the native Home Assistant menu, Header, device selector, Bottom Tab Bar and all UPS domain behavior.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.6] - 2026-08-25

### Panel UI 0.5.6 — HA menu, gesture reset and battery path

- Restore the permanent left Header control as the native Home Assistant main-system menu button.
- Reset the work viewport to 100% with a two-finger double tap and transient `Масштаб 100%` confirmation.
- Snap a completed 97–103% pinch to exactly 100% while keeping on-screen zoom controls absent.
- Extend the battery SVG path beneath the UPS and battery node so responsive geometry cannot expose a disconnected segment.
- Increase the battery-path stroke and glow for clear visual continuity without changing power-state semantics.
- Preserve the normalized single work viewport, per-UPS scale persistence and all UPS domain behavior.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.5] - 2026-08-25

### Panel UI 0.5.5 — gesture-only zoom hotfix

- Remove the on-screen `− / percentage / +` zoom controls completely.
- Keep two-finger focal-point pinch zoom, pan/scroll and per-UPS local scale persistence.
- Normalize previously nested zoom wrappers to exactly one work viewport after every optimized Home Assistant update.
- Fix the repeated controls and progressive content shrinking visible in UI 0.5.4.
- Preserve the native Header, UPS selector, fixed Bottom Tab Bar and all UPS domain behavior.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.4] - 2026-08-25

### Panel UI 0.5.4 — shared shell and work-area zoom

- Adopt the required NikaS specialized-panel shell without changing UPS telemetry, thresholds, states or commands.
- Keep the Header below the notch/Dynamic Island and restore explicit Back navigation to `/dashboard-infrastructure/overview`.
- Add native-sized `− / percentage / +` controls with 75–200% range, 10% steps and tap-to-reset at 100%.
- Add two-finger focal-point pinch zoom plus pan/scroll inside the selected-UPS work viewport only.
- Keep Header, device selector, zoom controls and fixed Bottom Tab Bar at native scale.
- Persist the chosen scale locally per Stark panel client and selected UPS.
- Continue HACS delivery from the default branch without GitHub Releases.

## [1.8.3] - 2026-08-25

### Panel UI 0.5.3 — iOS safe area

- Move the Stark SolarPower application header below the iPhone Dynamic Island/notch.
- Consume the top safe-area inset exactly once inside the integration-owned panel shell.
- Preserve the compact UI 0.5.2 geometry, device selector, contextual hero, fixed bottom navigation and read-only telemetry semantics.
- Keep development delivery on the HACS default branch without GitHub Releases.

## [1.8.2] - 2026-08-25

### Panel UI 0.5.2 — iPhone field geometry

- Remove duplicate top safe-area padding observed in the Home Assistant iOS field capture.
- Reduce the device selector and fixed Bottom Tab Bar to the accepted target proportions while preserving touch targets.
- Keep the photographic hero, but increase and ground the Stark Country UPS, separate the battery node from the cabinet and strengthen the active power paths.
- Reduce the white scene wash so the network/boiler context remains legible behind dynamic elements.
- Keep freshness on one line on iPhone Pro Max and prevent the normal status sentence from consuming an extra row.
- Convert the input/output/load metrics back to the compact horizontal target layout.
- Tighten the state summary so both the non-disconnectable line and battery rows remain visible above navigation.
- Preserve factual entity values, strict stale/source semantics, five-view navigation and read-only behavior.

## [1.8.1] - 2026-08-25

### Panel UI 0.5.1 — target-composition alignment

- Rebuild the Overview hero to match the accepted compact photographic target instead of the oversized abstract scene.
- Add optimized local context backgrounds: a network room for `UPS Интернет` and a boiler room for `UPS Котёл`.
- Keep the physical Stark Country UPS, active SVG power paths and all live values as independent dynamic layers above the backgrounds.
- Move data freshness to the top-right status zone and reduce the hero height so the key metrics and state summary enter the first mobile viewport.
- Use neutral typography for normal measurements; reserve green, amber and red for confirmed state semantics.
- Replace the three-item Bottom Tab Bar with the target five-item structure: `Обзор / ИБП / История / События / Диагн.`.
- Keep every view scoped to the selected UPS and move event summaries to the dedicated Events view.
- Continue to avoid invented runtime: the Overview reports factual battery readiness and does not derive minutes from battery percentage or load.

## [1.8.0] - 2026-08-24

### Panel UI 0.5.0 — Stark Country status-first dashboard

- Replace the schematic-only Overview hero with the approved NikaS status-first mobile composition.
- Add the real Stark Country 1000 ONLINE (16A) product artwork as an optimized transparent local asset; the panel has no external image dependency.
- Keep the fixed `UPS Интернет / UPS Котёл` selector and selected-device-only content across Overview, Diagnostics and History.
- Present the live power path around the physical UPS: non-disconnectable line → UPS → load, with the battery branch shown separately.
- Use only Home Assistant entity values. Runtime, watts and other values are never invented when the integration does not provide a proven entity.
- Add a compact three-card row for input, output and load plus explicit non-disconnectable-line and battery state summaries.
- Preserve strict trust semantics: stale/source failure overrides the last reported operating mode and can never appear healthy.
- Keep the native Home Assistant hamburger menu, refresh feedback, long press → more-info and read-only integration boundary.
- Continue HACS delivery through the deterministic self-contained frontend bundle with UI-version cache busting.

## [1.6.5] - 2026-08-22

### Panel UI 0.3.5 — NikaS template shell alignment

- Align the Stark SolarPower shell with `NikaS Integration Panel Template v1.0`.
- Standardize Header geometry to `52px / 1fr / 52px` with a `48px / 1fr / 48px` narrow fallback.
- Keep Header Back icon-only with a 44×44 px touch target and explicit navigation to `/dashboard-infrastructure/overview`.
- Keep one global Refresh action in the symmetric right Header zone and center `Stark SolarPower` geometrically on the viewport.
- Make the Bottom Tab Bar truly full-width and edge-attached on mobile and desktop; remove the previous 620 px desktop cap and rounded floating-card geometry.
- Preserve fixed safe-area-aware bottom navigation with 58 px-class touch targets, 14 px labels and 24 px icons.
- Add mobile overflow guards for the Header, UPS selector, status badge, power-flow values, diagnostics and history rows.
- Verify the primary iPhone Pro Max portrait layout as a single-column, no-horizontal-scroll composition; keep `UPS Интернет` / `UPS Котёл` on one stable selector row.
- Keep selected-device-only content, 1.6.4 typography, read-only behavior and all UPS telemetry/event semantics unchanged.
- Continue production delivery through the single self-contained `stark-solarpower-panel-bundle.js` artifact.

## [1.6.4] - 2026-08-22

### Panel UI 0.3.4 — mobile typography

- Increase mobile-first text sizes after iPhone Pro Max field review without changing the accepted UI structure.
- Raise Device Selector labels, power-flow labels and values, battery/load captions, freshness banner text, diagnostic rows, history rows, event timestamps, hints and Bottom Tab Bar labels to a more comfortable reading size.
- Keep `Stark SolarPower` Header geometry, fixed UPS selector order, selected-device-only content and full-width fixed bottom navigation unchanged.
- Preserve the self-contained `stark-solarpower-panel-bundle.js` production delivery contract and query-string cache busting.
- No UPS telemetry, event, cloud, stale-data or control semantics change.

## [1.6.3] - 2026-08-22

### Panel UI 0.3.3 — frontend hardening

- Replace the runtime chain of versioned panel modules with one deterministic self-contained production bundle: `stark-solarpower-panel-bundle.js`.
- Register Home Assistant `module_url` directly to the autonomous bundle and use the UI version as query-string cache busting.
- Keep previous versioned frontend files only as build-time source/history; the browser no longer loads them at runtime.
- Add deterministic bundle generation, JavaScript syntax validation, a CI guard rejecting remaining runtime `import`/`export` statements, and a committed-artifact consistency check.
- Preserve the accepted UI 0.3.2 layout, device selector, explicit Back contract, full-width bottom Tab Bar, read-only behavior and entity semantics.
- This is a loading-architecture hardening release; no UPS telemetry/control semantics change.

## [1.6.2] - 2026-08-22

### Panel UI 0.3.2

- Keep `UPS Интернет` and `UPS Котёл` in a fixed selector order; selection never reorders controls or device data.
- Apply the same persistent Device Selector directly below the Header on Overview, Diagnostics and History.
- Scope Overview, Diagnostics and History content to the selected UPS only; the second full UPS block is no longer duplicated below.
- Preserve selected UPS context while switching `Обзор / Диагностика / История`.
- Remove the decorative battery icon from the Header and geometrically center `Stark SolarPower` between symmetric Back/Refresh zones.
- Keep the full-width fixed bottom Tab Bar, explicit Back route, health-dot semantics and read-only safety model unchanged.

## [1.6.1] - 2026-08-22

### Panel UI 0.3.1

- Add one global UPS device-context selector directly below the Header on Overview, Diagnostics and History.
- Keep the selected UPS context while switching between primary bottom-navigation sections.
- On Overview and History, the selected UPS is promoted to the first card while the second UPS remains visible for whole-system comparison.
- Diagnostics uses the same global selector instead of a page-local duplicate.
- Add per-UPS health dots to the selector using the existing panel status semantics; `unknown` / `unavailable` are never shown as healthy.
- Keep the full-width fixed bottom Tab Bar, explicit Back route and all existing read-only safety boundaries unchanged.

## [1.6.0] - 2026-08-22

### Panel UI 0.3.0

- Adopt the Home Assistant NikaS specialized-panel application shell.
- Move `Обзор / Диагностика / История` from the top of the screen into a fixed bottom navigation bar with iOS safe-area handling.
- Keep the accepted UPS Overview information architecture unchanged.
- Make the header Back action an explicit navigation to `/dashboard-infrastructure/overview`; browser history is no longer used as an application contract.
- Keep the global refresh action in the header and retain 44 pt-class touch targets.
- Preserve long press → native Home Assistant more-info for factual entities; header and bottom-navigation controls remain navigation-only.
- Publish `parent_route` and navigation metadata in `panel_manifest.json`.

## [1.5.2] - 2026-08-22

### Panel UI 0.2.1

- Add a dedicated back button to the Stark SolarPower panel header.
- Use Home Assistant history state when the panel was opened from another HA screen, returning to the actual previous screen.
- Fall back to `/dashboard-infrastructure` when the panel was opened directly and there is no safe HA back destination.
- Preserve the existing mobile-first header layout, stable `/dashboard-ups` route and read-only behavior.

## [1.5.1] - 2026-08-22

### Panel UI 0.2.0

- Format UPS data timestamps and last-successful-update timestamps in the Home Assistant configured timezone instead of exposing raw ISO strings.
- Add relative timestamps to latest integration events.
- Add current operating mode to History cards.
- Add explicit extended-telemetry event labels.
- Tighten Diagnostics layout for iPhone-sized viewports.
- Enable theme-aware color-scheme behavior without adding frontend dependencies.
- Keep the v0.1 Overview information architecture unchanged after successful iPhone Pro Max field review.
- Preserve dependency-free frontend delivery, stable `/dashboard-ups` route and existing entity interactions.

## [1.5.0] - 2026-08-22

### Added

- Integration-owned Stark SolarPower panel at the stable route `/dashboard-ups`.
- Mobile-first overview designed for iPhone Pro Max portrait orientation.
- Per-UPS application-style cards with overall health, operating mode, power path, battery, load, cloud source and data freshness.
- Dedicated diagnostics view separating primary SolarPower telemetry from the intermittent extended endpoint.
- Compact history view using native Home Assistant more-info/history for input voltage, output voltage, load and battery charge.
- Dynamic Home Assistant entity/device registry discovery so additional Stark SolarPower UPS devices reuse the same UI template.
- Long-press more-info behavior for factual entities.
- Integration-owned navigation metadata in `panel_manifest.json` for `ha-contract-generated-ui` hand-off.
- Panel UX and failure-state acceptance documentation in `docs/PANEL.md`.

### Design

- The panel reads Home Assistant entities only; JavaScript never calls the Stark/SolarPower cloud API directly.
- The top refresh action uses the existing integration `Обновить все ИБП` button entity.
- `unknown` and `unavailable` are never mapped to a healthy status.
- Primary cloud loss and stale data remain distinct states.
- Extended BUS/temperature telemetry remains unavailable when the latest detailed poll failed; old values are not presented as current.
- No additional HACS frontend dependency is required.

## [1.4.1] - 2026-08-22

### Fixed

- Suppress the first coordinator edge after Home Assistant startup or config-entry reload so a synthetic `telemetry_restored` (or other transition event) is not emitted while event entities are settling.
- Existing event entity unique IDs and event types are unchanged.

## [1.4.0] - 2026-08-22

### Added

- Home Assistant event entities for UPS state transitions.
- Battery-mode entered/exited events.
- Explicit Fault Mode entered/cleared transitions using only the validated operating-mode field.
- Cloud telemetry lost/restored events.
- UPS data stale/fresh events using the existing 6-minute freshness threshold.
- Optional extended-telemetry lost/restored diagnostic events.
- English and Russian event names and event-type translations.

### Design

- Event entities are edge-triggered and do not replay an event when Home Assistant starts.
- No new device-automation trigger API is added. Home Assistant developer guidance currently recommends event entities for integration events, while legacy device automations are being phased away for new integrations.
- Event reporting remains read-only and does not add any UPS control commands.

## [1.3.0] - 2026-08-22

### Added

- Detailed `queryDeviceLastData` read-only telemetry sampled every 5 minutes.
- Positive/negative DC bus voltage sensors.
- UPS, PFC, ambient and charger temperature sensors.
- Optional diagnostics for vendor battery runtime RAW value, battery piece/group fields, protocol ID, DC-DC/PFC/inverter states and input/output relay states.
- Full normalized detailed telemetry payload in Home Assistant diagnostics for future field mapping without exposing credentials or API secrets.

### Changed

- Stale-data threshold increased from 5 to 6 minutes (360 seconds).
- Manual **Refresh all UPS** also forces an immediate detailed-telemetry refresh.
- Primary cloud polling remains 60 seconds.
- Battery remaining-time value is exposed as a unitless RAW diagnostic until the SolarPower cloud field unit is verified on real hardware.
- Extended telemetry is no longer merged into live entities after a failed latest detailed poll; cached values remain available only in diagnostics until a successful retry.
- Failed detailed telemetry is retried on the next normal 60-second coordinator pass instead of waiting another full 5-minute interval.

### Field validation

- UPS protocol ID `PI01` confirmed on both field UPS devices.
- Battery piece count reported as `2` on both field UPS devices.
- The vendor field `Battery Group NNumber` normalizes to `battery_group_nnumber`; a stable internal alias is retained without changing entity unique IDs. Field values differ between the two UPS devices, so it remains a RAW diagnostic rather than a physical group count.
- Input/output relay and DC-DC/PFC/inverter fields return vendor `Open`/`Closed` text; semantics remain diagnostic-only pending state-transition verification.
- `Fault Kind = 14` is present while both UPS devices are operating normally, so it is treated as historical/vendor RAW data rather than an active alarm.

### Safety

- Ambiguous vendor fields such as `Fault Kind`, pre-fault snapshots, `battery_voltage_2`, high/low voltage fields, and vendor runtime/group semantics are collected in diagnostics first and are not promoted to active alarm/control semantics until verified on real hardware.

## [1.2.0] - 2026-08-21

### Added

- HTTPS-first SolarPower API transport with compatibility fallback.
- API transport information in diagnostics.
- Stale-data hardening: operational entities become unavailable when the actual UPS snapshot is older than 5 minutes.
- Manual **Refresh all UPS** action with debounce protection.
- Integration-local brand icon and logo.

### Preserved

- 60-second automatic polling interval.
- Existing entity unique IDs and device identifiers.
- Read-only cloud access model.

### Verified

- Tested on Home Assistant 2026.8.2.
- Verified with two STARK Country Online 1000 VA UPS devices.
- Verified HTTPS transport.
- Verified stale-data and cloud-unavailable behavior on real hardware.

## [1.1.0] - 2026-08-20

### Added

- UPS data timestamp based on SolarPower `gts`.
- Data age sensor.
- Stale-data binary sensor based on the actual cloud snapshot timestamp.
- Manual refresh action.

### Changed

- Automatic polling remains 60 seconds.

## [1.0.0] - 2026-08-20

### Added

- Initial working Stark SolarPower Home Assistant integration.
- Two-device SolarPower account discovery.
- Read-only telemetry for input/output power parameters, load and battery.
