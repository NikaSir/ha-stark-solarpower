# Stark SolarPower Panel UI 0.8.5 Acceptance

## Scope

UI 0.8.5 optimizes cold startup without changing the accepted UI 0.8.4 composition or interaction model.

## Automated acceptance

- UPS artwork and both device backgrounds are requested during bundle evaluation, before registry discovery can finish.
- All startup images are explicitly decoded and retained for the page lifetime.
- The final visible UPS image is eager, high-priority and uses synchronous first-paint decoding.
- Versioned integration-owned static assets are registered with cache headers.
- The optimization layer does not replace Shadow DOM or cached work views.
- The autonomous bundle remains deterministic and contains no runtime imports.

## Phone field acceptance

1. After a Home Assistant restart, open `/dashboard-ups` and confirm the complete Overview scene appears without the background or UPS cabinet arriving as a visibly later layer.
2. Close and reopen the panel; confirm the warm-cache opening is faster than the first opening.
3. Switch between `UPS Интернет` and `UPS Котёл` ten times; confirm both backgrounds appear immediately and no white frame is shown.
4. Pinch on Overview and release over the lower navigation; confirm `История` and native more-info do not open.
5. Switch through all five tabs and wait for telemetry updates; confirm Header, selector, viewport and Bottom Tab Bar do not remount or flicker.
