# Stark SolarPower Panel UI 0.8.6 Acceptance

## Field defect

UI 0.8.5 prewarmed the image assets but still gated the work surface on Home Assistant registry discovery. Phone evidence showed a blank viewport and then a standalone `Загрузка UPS…` state before the photographic Overview appeared.

## Required behavior

- Header, neutral device selector, photographic Overview and Bottom Tab Bar are visible during the first render.
- No blank central viewport or standalone loading spinner is presented.
- Unknown telemetry is displayed as `—`; readiness and connectivity are not inferred.
- Startup artwork and background use the same URLs and mobile geometry as the live Overview.
- After registry discovery, the normal stable shell and cached live views take ownership.
- Routine telemetry and gestures retain the UI 0.8.5 contracts.

## Phone field pass

1. Restart Home Assistant and open `/dashboard-ups` from a cold browser state.
2. Confirm that the room background and UPS cabinet are present in the first visible panel state.
3. Confirm that only neutral `Получение данных` and `—` placeholders precede live telemetry.
4. Confirm there is no white central frame and no `Загрузка UPS…` spinner.
5. Repeat with a warm browser cache and compare the transition.
6. Pinch/release above the lower navigation and confirm neither `История` nor more-info opens.
