# Stark SolarPower Panel UI 0.8.3 Acceptance

## Scope

UI 0.8.3 interprets the vendor `Battery Remain Time` value as minutes for presentation on the Overview battery card. The source entity itself is not recalculated or replaced so the original vendor value remains available for diagnostics and field comparison with the physical UPS display.

## Required behavior

- The Overview battery card label is `Автономия`, not `Остаток RAW`.
- The source remains `battery_remain_time`.
- The vendor raw value is treated as minutes only for the Overview presentation.
- Values below 60 minutes render as `N мин`.
- Values of 60 minutes or more render as `H ч MM мин`.
- Examples: `45 -> 45 мин`, `90 -> 1 ч 30 мин`, `255 -> 4 ч 15 мин`.
- Missing, unavailable, negative or non-numeric input renders as `—`.
- Diagnostics continue to expose the vendor-provided entity value for comparison.
- No battery runtime is derived from charge percentage, output load, battery voltage or nominal capacity.
- Existing stable-DOM, pinch, two-finger reset, fixed Header and fixed Bottom Tab Bar behavior remains unchanged.

## Field validation

After deployment, disconnect mains power under a controlled load and record at the same moment:

1. UPS front-panel remaining-runtime indication.
2. Home Assistant `battery_remain_time` raw value.
3. Overview `Автономия` value.
4. Output load percentage and battery capacity.
5. Elapsed real backup time until mains restoration or the chosen safe stop point.

The first validation criterion is that the Overview value is exactly the raw minute value converted to hours/minutes. The second criterion is agreement, within the UPS display resolution/update interval, between the raw value and the physical UPS runtime indication.
