# HACS installation and updates

The repository is prepared for HACS installation as a custom **Integration** repository.

Repository:

`https://github.com/NikaSir/ha-stark-solarpower`

Recommended production flow:

1. Develop changes on a non-`main` branch.
2. Open a pull request to `main`.
3. Require repository validation, Hassfest, and HACS checks to pass.
4. Merge the validated pull request into `main`.
5. Update **Stark SolarPower** from HACS.
6. Restart Home Assistant when HACS requests it.

The Home Assistant config entry does not need to be removed for routine updates. Device identifiers and entity unique IDs are preserved across normal upgrades.

Manual ZIP replacement is retained only as an emergency recovery path.
