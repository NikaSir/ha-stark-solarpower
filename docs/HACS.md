# HACS installation

The repository is prepared for HACS installation as a custom **Integration** repository.

Repository:

`https://github.com/NikaSir/ha-stark-solarpower`

Recommended flow:

1. Merge the validated release branch into `main`.
2. Add the repository to HACS as a custom Integration repository.
3. Install **Stark SolarPower** from HACS.
4. Restart Home Assistant when HACS requests it.

After migration, updates are delivered through HACS instead of manual ZIP replacement.
