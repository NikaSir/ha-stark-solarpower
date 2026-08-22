# Stark SolarPower Panel UI 0.3.5 acceptance

Primary target: **iPhone Pro Max, portrait**.

This release aligns the UPS application shell with **NikaS Integration Panel Template v1.0** without changing UPS telemetry or control semantics.

## Header

- Layout: `52px | minmax(0,1fr) | 52px`.
- Narrow fallback: `48px | minmax(0,1fr) | 48px` below 390 px.
- Back is icon-only `mdi:arrow-left`, 44×44 px touch target.
- Back navigates explicitly to `/dashboard-infrastructure/overview`.
- Center title: `Stark SolarPower`, 18 px.
- Subtitle: `UPS · UI v0.3.5`, 14 px.
- Right zone contains only global Refresh, 44×44 px.
- No decorative brand icon beside the title.

At a 430 px-class viewport with 12 px side gutters, the Header has about 406 px usable width. After two 52 px control zones, the title column retains about 302 px, which is sufficient for the current title/subtitle without clipping.

## Device selector

- `UPS Интернет` remains left; `UPS Котёл` remains right.
- One stable row immediately below Header on every primary view.
- 10 px gap, 52 px minimum height, 16 px text.
- At a 430 px-class viewport the two selector cells are about 198 px each after gutters/gap.
- Selection never reorders controls or device data.

## Bottom Tab Bar

- `Обзор · Диагностика · История`.
- Fixed to the viewport bottom edge.
- Width: 100%; no 620 px desktop cap.
- No external side/bottom gaps and no floating/pill container.
- iOS bottom safe area included in padding.
- Each tab: at least 58 px high, 24 px icon, 14 px label.
- At a 430 px-class viewport each tab receives about 143 px before safe-area side padding, sufficient for the three current labels.

## Content fit

- No horizontal scrolling is permitted.
- Selected-device content is one column on mobile.
- Long status labels may wrap inside the status badge instead of widening the card.
- Power-flow values use `clamp(15px, 4vw, 17px)` and may wrap rather than overflow.
- Diagnostics/history values use `min-width:0` and `overflow-wrap:anywhere` where needed.
- Page bottom clearance is `98px + safe-area-inset-bottom`, so the final content scrolls above the fixed Tab Bar.
- Desktop content is capped at 1240 px; the selected UPS detail card is capped at 820 px while the Tab Bar remains full-width.

## Acceptance gates

The panel is accepted when an iPhone Pro Max portrait field check confirms:

1. no horizontal scroll;
2. Header title remains centered and uncut;
3. both UPS selector buttons remain on one row;
4. all three bottom tabs remain visible and touchable;
5. the last content can be scrolled fully above the Tab Bar;
6. light/dark themes preserve readable contrast;
7. Back and Refresh do not trigger entity/device actions on hold or double tap.
