# Stark SolarPower Panel UI 0.6.1 — one-screen Overview

## Information hierarchy

- Overview does not render the repeated three-card Input/Output/Load row.
- Input voltage, load and battery remain visible in the photographic hero.
- Output voltage and the complete factual set remain visible in the state summary and UPS view.

## Mobile geometry

- The battery scene node and reserve strip have a visible gap and never overlap.
- At 100% on the target iPhone Pro Max portrait viewport, both state-summary rows fit above the fixed Bottom Tab Bar.
- Text, pills and entity targets remain readable and do not clip.

## Regression

- Transform-owned vertical movement at 100% and focal pinch/pan remain stable after touch release.
- Pinch and pan do not open native Home Assistant graphs.
- Header, system menu, UPS selector and Bottom Tab Bar remain native-sized.
