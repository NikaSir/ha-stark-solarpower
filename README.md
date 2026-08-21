# Stark SolarPower for Home Assistant

Custom Home Assistant integration project for **Stark SolarPower** cloud-backed UPS / power-system telemetry.

## Status

A working integration exists outside this newly bootstrapped repository and is being migrated to GitHub in a controlled way. The repository bootstrap must not be interpreted as a reset of the project's existing version history.

## Scope

This repository contains the Home Assistant integration layer: cloud communication, device discovery, telemetry entities, data freshness handling, diagnostics, tests, documentation, HACS packaging, and releases.

## Repository policy

- Default branch: `main`.
- Credentials, account secrets, tokens, serial/account identifiers used as secrets, and private diagnostic payloads must never be committed.
- Existing project version identifiers are preserved during migration.
- Releases must be traceable to source commits.
- Shared contribution/security defaults are inherited from `NikaSir/.github` unless overridden here.

## Target layout

```text
custom_components/stark_solarpower/
docs/
.github/workflows/
hacs.json
```

Production implementation will be migrated from the verified working build rather than replaced with placeholder code.
