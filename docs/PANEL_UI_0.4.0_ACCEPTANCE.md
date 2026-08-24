# Stark SolarPower Panel UI 0.4.0 — acceptance contract

**Primary target:** iPhone Pro Max, portrait  
**Template:** NikaS Integration Panel Template v1.0

## Scope

UI 0.4.0 redesigns the **Overview** while preserving the accepted application shell, Device Selector, Diagnostics, History and read-only integration behavior.

## Required screen hierarchy

1. Header
2. persistent UPS Device Selector
3. selected UPS Hero Status
4. factual power-flow diagram
5. four key metrics
6. four operational state tiles
7. recent event summary
8. fixed Bottom Tab Bar

## Header

- `52px / minmax(0,1fr) / 52px` mobile geometry;
- `48px / minmax(0,1fr) / 48px` narrow fallback;
- icon-only explicit Back to `/dashboard-infrastructure/overview`;
- centered `Stark SolarPower`;
- subtitle `UPS · UI v0.4.0`;
- one global Refresh action;
- no decorative title icon.

## Device Selector

- `UPS Интернет` remains first; `UPS Котёл` remains second;
- selection does not reorder controls;
- one row on the primary iPhone viewport;
- selecting a UPS updates Overview, Diagnostics and History in place;
- status dots use factual health semantics;
- `unknown` / `unavailable` never render as healthy.

## Overview Hero

The first card answers: **what is the UPS doing now?**

Required factual status examples:

- `От сети · Нормально`;
- `От батареи`;
- `Данные устарели`;
- `Нет телеметрии`;
- `Аварийный режим`;
- `Состояние неизвестно`.

The source/freshness badge is compact and independent from operating mode.

## Power-flow semantics

### Line Mode

`Сеть → UPS → Нагрузка`

Battery is shown as connected/charged, but there is **no arrow implying that the battery is feeding the UPS**.

### Battery Mode

`АКБ → UPS → Нагрузка`

Grid path is visually de-emphasized. Battery and output path use warning/orange semantics.

The diagram must not invent power, current, runtime or direction not supported by Home Assistant entities.

## Key metrics

2×2 mobile grid:

- input voltage;
- output voltage;
- battery charge;
- load.

Units are always shown when available. Long press opens native Home Assistant more-info.

## State tiles

2×2 on iPhone portrait, 4 columns only on desktop:

- Сеть;
- АКБ;
- Облако;
- Данные.

Each tile has icon, short primary state and one short secondary fact. Color is semantic only.

## Recent events

Compact rows:

- battery mode;
- cloud telemetry;
- data freshness;
- fault mode.

Existing event-entity semantics and relative timestamps are reused.

## Mobile fit gates

On the 430 px-class primary viewport:

- no horizontal scrolling;
- Header title remains one line;
- both UPS selector buttons remain one row;
- the power diagram remains inside the Hero card;
- no metric or status text widens the viewport;
- 2×2 metric/state grids preserve readable 14–19 px typography;
- final event row scrolls fully above the Bottom Tab Bar;
- Bottom Tab Bar remains full-width, fixed and edge-attached with iOS safe-area padding.

## Safety / behavior unchanged

- cloud polling interval remains 60 seconds;
- stale threshold remains 360 seconds;
- no UPS command is added;
- Refresh continues through the integration-owned Home Assistant button entity;
- no direct frontend call to SolarPower API;
- no raw or ambiguous detailed field is promoted to an operational alarm;
- self-contained `stark-solarpower-panel-bundle.js` remains the only production frontend entry point.
