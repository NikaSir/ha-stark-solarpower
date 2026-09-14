# Release policy

## Source of truth

- `main` is the canonical source branch.
- A public release must be traceable to an immutable Git commit/tag.
- Release artifacts must be produced from committed source, never from an uncommitted local working tree.

## Version lineage

Existing project version history must be preserved during GitHub migration. Repository bootstrap is not a reason to reset or renumber the integration.

Published tags match the integration manifest version. HACS and Hassfest checks passed on the beta snapshot below. This confirms repository validation, not installation in the target Home Assistant.

## Release gate

Before a release:

1. Repository checks are green.
2. Functional tests for the affected integration behavior are complete.
3. `CHANGELOG.md` is updated.
4. No secrets or private diagnostics are present in tracked files or release artifacts.
5. The release tag points to the exact reviewed commit.

Published tags are treated as immutable.

## Verified beta delivery snapshot — 2026-09-14

- Published GitHub prerelease: [`1.9.11-b1`](https://github.com/NikaSir/ha-stark-solarpower/releases/tag/1.9.11-b1).
- Source commit: `785c4589af5c21bbd9c81a2b201f3d325c1669d0`.
- The tag matches the integration manifest version.
- HACS and Hassfest checks on this exact commit completed successfully.
- Delivery uses the standard GitHub source archive. `hacs.json` does not require a separately uploaded ZIP asset.
- **Target Home Assistant installation and device acceptance remain unverified.** A published beta and green CI are not evidence of a successful installed update.

## Beta acceptance in Home Assistant

1. Open this custom Integration repository in HACS and enable beta/prerelease versions in its version selection.
2. Confirm the selected version is `1.9.11-b1`, install it, and restart Home Assistant as required.
3. Confirm the loaded integration version and panel UI version against the selected release; reopen the panel from a cold client/cache.
4. Verify the fixed header and bottom menu, device selectors, black Refresh button and completion feedback, scrolling, pinch zoom and reset. Verify telemetry updates without a full panel redraw.
5. Record the installed version, Home Assistant/HACS versions, device/client, checks performed and any errors. Do not mark acceptance complete without this evidence.
6. Publish stable only after user acceptance and version-consistent checks. Preserve existing published beta/stable tags and releases; use a new reviewed version for corrections.

This repository-specific beta policy reflects the approved publication decision and takes precedence over older blanket no-Releases wording in shared documentation. Shared pinned standards are not modified here.
