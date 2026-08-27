# Stark SolarPower Panel UI 0.8.4 Acceptance

## Field evidence

- Physical UPS display: `3.6 h`, `24.9 Vdc`, `230 Vac`, three battery-capacity segments.
- Panel while on battery: `75 %`, `25.0 V`, `3 ч 44 мин` before the next detailed refresh.
- Panel after mains return: `74 %`, `26.2 V`; this is a partial reserve, not a ready reserve.
- The four-segment physical indicator corroborates the reported capacity band. It is not used to derive the exact percentage.

## Required behavior

- Primary telemetry remains on the 60-second coordinator interval.
- Detailed telemetry remains on the five-minute interval outside Battery Mode.
- A fresh Battery Mode snapshot causes detailed telemetry to refresh on that same coordinator pass.
- `battery_remain_time` remains the factual vendor source and is displayed as hours/minutes.
- Battery percentage is never derived from voltage, runtime, load or the coarse front-panel segments.
- In confirmed Line Mode, 21–94% renders `Резерв неполный · АКБ N %` with warning tone.
- In confirmed Line Mode, 95–100% may render `Резерв готов · АКБ N %`.
- Battery Mode retains `Питание от АКБ · N %`.
- Non-Line modes never claim that the reserve is ready.
- No structural render, image reload or navigation replacement is introduced.

## Phone field pass

- [ ] Disconnect `UPS Интернет` from mains and wait through two 60-second updates.
- [ ] Confirm that `Автономия` changes without waiting five minutes and remains within the physical display resolution/update interval.
- [ ] Restore mains below 95% and confirm `Резерв неполный`, not `Резерв готов`.
- [ ] Confirm `Резерв готов` only after the battery reaches at least 95%.
- [ ] Pinch and two-finger reset on Overview never open `История` or entity more-info.
- [ ] Header, device selector, image and Bottom Tab Bar remain stable during telemetry updates.
