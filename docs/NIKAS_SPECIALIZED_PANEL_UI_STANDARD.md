# NikaS Specialized Panel UI Standard v1.6

**Status:** REQUIRED  
**Canonical source:** `NikaSir/ha-contract-generated-ui`  
**Applies to:** every integration-owned specialized Home Assistant panel
**Primary acceptance viewport:** iPhone Pro Max, portrait
**Reference visual implementation:** Stark SolarPower / UPS
**Reference typography and status treatment:** LIDER

This synchronized repository copy supersedes the previous v1.5 snapshot. The canonical repository remains authoritative when a newer version exists.

## Ownership and topology

```text
HEADER                                      native scale
DEVICE SELECTOR (peer devices only)         native scale
ONE WORK VIEWPORT                           scroll/zoom owner
BOTTOM TAB BAR                              native scale
```

- Only the work area scales. Header, peer selector and Bottom Tab Bar never scale or move with it.
- Exactly one zoom viewport exists per panel instance; nested wrappers and duplicated handlers are prohibited.
- On phones the panel owns a height-locked shell. The outer Home Assistant page is not the scrolling surface.
- The work viewport prevents scroll chaining into the Home Assistant document.
- Short views fill the work row; long views scroll their final control fully clear of navigation and Home Indicator.
- Effective iOS safe area is consumed exactly once.

## Header

- Grid: `52px minmax(0,1fr) 52px`; very narrow: `48px minmax(0,1fr) 48px`.
- Minimum height: `62px`; narrow target: `60px`, plus the effective top safe area.
- Title: `23px/800`, one line; `21px` on very narrow phones.
- Subtitle/version: `14px/560`; `13px` on very narrow phones.
- Permanent left action is only `<ha-icon icon="mdi:menu">`, dispatching bubbling/composed `hass-toggle-menu`.
- Refresh may occupy the right rail as the only global action.
- Both rails use matching `44×44px` plaques, `16px` radius, divider border, card background, `0 7px 20px rgba(23,45,76,.08)` shadow and `25px` icons.
- Back, integration drawer, device command and decorative brand icon are prohibited in the permanent left rail.

## Peer-device selector

- Use it only for peer physical devices of the same integration.
- Keep it directly below Header, outside the work viewport and at native scale.
- Peer order never changes because of selection.
- Selection survives tab changes and owns independent locally persisted zoom state.

## Zoom and scrolling

At exactly 100%:

- `x = 0` and `y = 0` are invariant;
- native vertical scroll is enabled and horizontal scroll is forbidden;
- one-finger transform panning is disabled;
- stored transforms are normalized before display.

For gesture zoom:

- focal two-finger pinch uses `75–200%`;
- permanent zoom controls are prohibited;
- `97–103%` snaps to exact 100%/origin;
- two-finger double tap resets scale, transform and native scroll and briefly announces `Масштаб 100%`;
- scale persists per panel/client and selected peer;
- one-finger transform pan works only above 100%, independently on axes that truly overflow;
- translation clamps to factual content edges and never exposes empty canvas;
- resize, orientation, reflow, peer and tab changes remeasure/clamp bounds;
- a tab change returns work content to the top while stored scale may remain;
- a second finger cancels more-info and post-gesture synthetic clicks are suppressed;
- pinch/reset must not open History, graphs or more-info.

## Bottom Tab Bar

- One fixed, full-width, edge-attached bar outside the work viewport.
- Card background, top divider, restrained upward shadow and safe-area padding exactly once.
- Three to five equal-width tabs, each at least `52px` high.
- MDI `ha-icon` glyphs at `28px`; one-line labels at approximately `12px/700`.
- Active icon/text use primary colour and an approximately 11% primary-colour plaque with about `16px` radius and no extra shadow.
- Short content never moves the bar; long content clears it fully.

## Typography envelope

- Meaningful user-facing text stays within `12–25px` inclusive.
- `12px` is the minimum for captions, freshness, navigation, chips and compact secondary values.
- `25px` is the maximum for prominent values and compact hero headings.
- Header uses its explicit `23/14px` and `21/13px` pairs.
- `9–10px` is allowed only for redundant non-interactive schematic annotations.
- If meaningful copy would need to be smaller than `12px`, recompose the layout instead.

## Optional connection and freshness indicator

The indicator appears only after an explicit product request. Stark SolarPower has that request.

- Main line is the real data path: `Локально`, `Облако`, `Резерв`, `Нет связи` or `Нет данных`.
- Second line is independent freshness: `Данные актуальны`, `Данные устарели` or `Нет данных`.
- A failed poll makes preserved telemetry stale; absent another documented threshold, data also becomes stale after three normal polling intervals.
- Main line is `16px/700`; freshness is `13px/550–600`.
- Main status colour drives the `10px` lamp, label, approximately 8–12% tinted background and approximately 30% border.
- Current freshness remains neutral; stale/no-data freshness uses warning/unreliable colour.
- The lamp stays fully inside the stable two-line plaque. Flashing/pulsing and repeated entrance animations are prohibited.
- State updates patch text/classes/ARIA only; they never remount the panel or animate geometry.

## Stable rendering and flicker prevention

- Header, selector, viewport, work canvas, persistent background and Bottom Tab Bar mount once per panel instance.
- `set hass()` and telemetry timers patch existing text, attributes, classes and CSS variables.
- Routine telemetry must not assign `shadowRoot.innerHTML`, rebuild a tab, reload unchanged art or replace the viewport/canvas/navigation.
- Tabs and peer-device views use lazy DOM caching; revisiting a view reuses its subtree.
- A genuine structural configuration change may replace only the affected work-view subtree.
- Stored transform is applied before a newly selected view becomes visible.
- Rendering is coalesced to at most one animation frame; unchanged values do not write DOM.
- Exact telemetry age is not a structural key and an unchanged image never receives the same `src` again.
- Delaying a full redraw with a timer or `requestAnimationFrame` is still non-conforming.
- A full-screen loading surface is permitted only during initial mount; later loss/recovery patches the mounted view.

## State, assets and identity

- `unknown`, `unavailable`, stale or untrusted values never appear healthy.
- Frontend consumes verified backend semantics and never invents measurements.
- Critical artwork ships locally; dynamic values remain separate from art.
- `custom_components/<domain>/brand/icon.png` is mandatory and ships with the integration.
- Add dark/icon logo variants when the approved mark is not legible in both themes.

## Automated guards

Tests verify one viewport, no zoom buttons, native menu event, matching Header plaques, canonical Bottom icons, 100% origin/native scroll, bounded enlarged pan, clamp after context changes, packaged brand icon, 12–25px meaningful typography, stable routine telemetry DOM, optional indicator semantics, deterministic bundle and manifest/registration parity.

## Phone acceptance

Verify long-view scrolling at 100%, no horizontal/top-edge displacement, bounded enlarged pan without rebound, fixed chrome, matching Header plaques below Dynamic Island, ten consecutive tab switches without white frames or lost art, in-place telemetry loss/recovery, two-finger reset/toast, safe Bottom clearance and installed brand identity.

## Publication

- Publish through traceable commits, branches and pull requests.
- GitHub Releases are not used.
- Automatic release tags are not used as a publication gate or update channel.
- Keep a pull request draft until automated checks pass and phone acceptance is ready.
