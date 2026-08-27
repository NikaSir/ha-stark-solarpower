# Changelog

All notable project changes are recorded here.

## [1.8.26] - 2026-08-27

### Panel UI 0.8.4 — field-verified reserve semantics

- Refresh detailed telemetry every 60 seconds while a fresh UPS snapshot reports Battery Mode, so `Автономия` follows the physical front-panel countdown instead of waiting up to five minutes.
- Keep the normal detailed-telemetry interval at five minutes while the UPS is not running from its battery.
- Treat the vendor remaining-time value as minutes, preserving UI 0.8.3 hours/minutes formatting and the original diagnostic entity value.
- Show `Резерв неполный` between 21% and 94% after mains return; use `Резерв готов` only from 95% in confirmed Line Mode.
- Keep unknown/non-Line states conservative and avoid inferring charge current from voltage or load.
- Preserve the stable DOM, fixed Header/Bottom Tab Bar and pinch/more-info guards.

## [1.8.24] - 2026-08-27

### Panel UI 0.8.2 — pinch / more-info isolation

- Guard the final `_showMoreInfo()` dispatch with the active v0.6.5 gesture interval instead of relying only on generated-click suppression.
- Cancel every pending entity hold timer in the permanent work surface as soon as a second finger joins the gesture.
- Avoid `elementFromPoint` dependence across the iOS Shadow DOM boundary, which could leave the first-finger 520ms timer active over the UPS artwork.
- Preserve intentional one-finger hold → native Home Assistant more-info outside pinch and post-gesture guard intervals.
- Add regression coverage for the current/legacy guard bridge, all-entity `pointercancel`, stable DOM and delivery-version parity.

## [1.8.23] - 2026-08-27

### Panel UI 0.8.1 — mobile Overview composition

- Raise the battery-capacity plaque into the clear area above the UPS cabinet.
- Reduce the phone photographic scene from 360 to 336 CSS pixels without shrinking the UPS artwork.
- Keep the input and load plaques aligned with the cabinet after the scene-height adjustment.
- Compact the reserve and battery-detail surfaces and use the one-line `АКБ, шт.` label.
- Reserve 16 CSS pixels below the battery card so its border and values remain fully visible above the fixed Bottom Tab Bar.
- Emit the final geometry in the initial cached-view markup and preserve the stable-DOM, zoom and gesture contracts from UI 0.8.0.

## [1.8.22] - 2026-08-26

### Panel UI 0.8.0 — NikaS specialized-panel standard v1.6

- Lock the phone application shell to the viewport so Header, peer selector and Bottom Tab Bar remain stationary while only the work viewport scrolls.
- Mount the shell and zoom canvas once, lazily cache visited UPS/tab views and point-patch routine telemetry without replacing artwork or fixed chrome.
- Restore the persisted per-UPS transform before a selected view becomes visible and reset/clamp offsets on tab changes.
- Adopt the v1.6 `23/14 px` Header pair (`21/13 px` narrow) and the `12–25 px` meaningful typography envelope.
- Tint the requested two-level cloud/freshness plaque with its transport-status color while retaining independent freshness semantics.
- Preserve focal pinch, 97–103% snap, reliable two-finger reset and protection against accidental History/more-info activation.

## [1.8.21] - 2026-08-26

### Panel UI 0.7.1 — gesture guard and fallback-title fit

- Keep `Не определено` on one line without shrinking normal power-mode headings.
- Rebalance the battery-capacity plaque with a clear gap above the UPS cabinet.
- Preserve the two-finger gesture after the first finger lifts so a two-finger double tap reliably resets the work canvas to 100%.
- Suppress the delayed synthetic click after pinch before it can activate `История` or another fixed bottom-navigation item.

## [1.8.20] - 2026-08-26

### Panel UI 0.7.0 — battery detail surface

- Lower the battery-capacity plaque into the clear space above the UPS cabinet.
- Use the free area below reserve readiness for a compact factual battery card: bank voltage, confirmed battery count, charger temperature and vendor RAW remaining-time value.
- Enable the confirmed battery-count and vendor RAW remaining-time diagnostic entities by default so their live values can reach the panel.
- Put Events before History in the fixed Bottom Tab Bar.
- Do not invent a charge-current value: the current SolarPower entity set exposes output current, not verified battery charge current.

## [1.8.19] - 2026-08-26

### Panel UI 0.6.9 — flicker-free telemetry on every view

- Extend in-place telemetry reconciliation from Overview to UPS, History, Events and Diagnostics.
- Build the desired view in a detached template and synchronize only changed text, classes, attributes and icons in the existing work canvas.
- Preserve view DOM, event handlers, zoom, pan and scroll state while falling back to a complete render only when the view, selected UPS or entity structure changes.

## [1.8.18] - 2026-08-26

### Panel UI 0.6.8 — flicker-free live telemetry

- Update Overview values, power mode, cloud/freshness state and reserve readiness in place without replacing the scene DOM.
- Keep the loaded room photograph, UPS artwork, zoom transform, pan offsets and scroll position intact during normal telemetry updates.
- Reserve full panel rendering for view changes, selected-UPS changes and structural registry changes.

## [1.8.17] - 2026-08-26

### Panel UI 0.6.7 — stable overview canvas

- Prevent a transient zero-width iOS layout frame from collapsing the zoom surface to a one-pixel strip after telemetry updates or UPS switching.
- Put the final Overview geometry into the initial work-surface markup so the zoom engine measures it once without a late height change or visible flash.
- Restore the compact factual reserve/battery readiness plaque below the photographic hero without restoring the duplicated `Состояние` summary.

## [1.8.16] - 2026-08-26

### Panel UI 0.6.6 — independent cloud/freshness status

- Replace the one-line update-age chip with a selected-UPS two-level `Облако / Нет связи / Нет данных` and `Данные актуальны / Данные устарели / Нет данных` indicator.
- Keep the UPS power mode separate from connection health and show output voltage/frequency in the hero copy.
- Remove the duplicated Overview state summary; the full electrical and battery facts remain in the dedicated UPS view.
- Keep extended-telemetry health diagnostic-only and preserve NIKAS UI Standard v1.5 zoom, shell and navigation behavior.

## [1.8.15] - 2026-08-26

### Panel UI 0.6.5 — NIKAS UI Standard v1.5

- Use native vertical-only scrolling at 100% with a fixed transform origin.
- Enable bounded, axis-specific one-finger panning only above 100%.
- Align Header and Bottom Tab Bar geometry with the UPS reference shell.
- Preserve focal pinch, 97–103% snap, two-finger reset, per-UPS scale and gesture guards.

## [1.8.14] - 2026-08-25

### Panel UI 0.6.4 — final hero spacing

- Use the remaining target-phone viewport reserve to increase the photographic scene height from 290 to 322 CSS pixels.
- Keep the UPS anchored to the floor so it moves lower with the expanded scene.
- Keep the battery card at the top of the scene, creating a deliberate clear gap above the UPS cabinet.
- Preserve the clean backgrounds, compact state summary, transform-owned pan/zoom and one-screen composition.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.13] - 2026-08-25

### Panel UI 0.6.3 — clean hero composition

- Replace both room backgrounds with clean, edge-safe production plates and add restrained blue/green activity LEDs to the Internet rack.
- Remove decorative power-flow lines and the repeated reserve-ready strip.
- Give the recovered height to the photographic scene while keeping the UPS grounded on the floor.
- Keep the battery card above the UPS and restore enough header clearance to prevent overlap with the status copy.
- Preserve the compact factual state summary, transform-owned pan/zoom and gesture guards.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.12] - 2026-08-25

### Panel UI 0.6.2 — expanded hero composition

- Expand the photographic room scene into the available one-screen space.
- Enlarge the Stark UPS and ground it on the room floor.
- Move the battery charge card above the cabinet and reverse its live connection path accordingly.
- Move the reserve-ready strip out of the photograph into a separate full-width surface below the hero.
- Preserve the compact state summary, transform-owned pan/zoom and gesture guards.
- Continue HACS delivery from `main` without GitHub Releases.

## [1.8.11] - 2026-08-25

### Panel UI 0.6.1 — one-screen Overview layout

- Remove the repeated Input/Output/Load metric-card row from Overview.
- Keep those facts in the hero, compact state summary and dedicated UPS view without duplicating a standalone block.
- Move the battery scene node fully above the reserve strip so the two surfaces no longer touch or overlap.
- Tighten Overview gaps, hero geometry and state-summary padding so both state rows fit above the fixed Bottom Tab Bar on the target iPhone.
- Preserve transform-owned pan/zoom, gesture guards, system menu and read-only UPS semantics.
- Continue HACS delivery from `main` without GitHub Releases.

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
