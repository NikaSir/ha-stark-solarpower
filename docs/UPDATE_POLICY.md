# Update policy

Stark SolarPower is maintained through GitHub and delivered to Home Assistant through HACS.

Production flow:

1. Develop changes on a non-`main` branch.
2. Open a pull request to `main`.
3. Require repository validation, Hassfest, and HACS checks to pass.
4. Merge the validated pull request into `main`.
5. Update the integration in Home Assistant through HACS.
6. Restart Home Assistant when requested.
7. Use manual ZIP installation only as an emergency recovery path.

The Home Assistant config entry must not be removed for routine updates. Existing device identifiers and entity unique IDs are preserved across normal upgrades.
