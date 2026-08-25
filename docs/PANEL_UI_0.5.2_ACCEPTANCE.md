# Stark SolarPower Panel UI 0.5.2 — iPhone field acceptance

Primary target: iPhone Pro Max, portrait, Home Assistant companion app.

## Geometry

- No duplicate blank safe-area band appears above the Header.
- Header controls remain at least 44 px touch targets.
- The two-device selector remains one row and materially shorter than UI 0.5.1.
- The input/output/load cards use a horizontal icon-and-copy layout.
- Both `Неотключаемая линия` and `АКБ` state rows enter the first viewport above the fixed navigation.
- Bottom navigation remains safe-area-aware and does not cover state values.

## Hero

- Freshness remains one line on iPhone Pro Max.
- Normal operating copy remains one line; narrow devices may wrap safely.
- Network/boiler context is visible without compromising text contrast.
- Stark Country UPS is larger than UI 0.5.1 and has a visible floor relationship.
- Battery node no longer obscures the UPS cabinet.
- Grid/output and battery paths remain visibly active and state-aware.

## Preserved contracts

- Fixed selector order and selected-device-only content.
- `Обзор / ИБП / История / События / Диагн.` navigation.
- Neutral normal measurements; semantic green/amber/red states.
- No synthesized runtime, watts or alarms.
- Cloud/stale/unknown never render as healthy.
- Long press opens native Home Assistant more-info.
- Read-only integration boundary.

## Release gate

1. Deterministic production bundle rebuild produces no diff.
2. All JavaScript passes `node --check`.
3. JSON and Python validation pass.
4. HACS, Hassfest, repository and frontend checks pass.
5. Field screenshots confirm both UPS contexts and complete first-viewport state content.
