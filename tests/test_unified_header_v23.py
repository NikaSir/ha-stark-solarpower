from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SHELL = (ROOT / "templates/shell_v2/nikas-specialized-shell.js").read_text(encoding="utf-8")
UI = (ROOT / "custom_components/stark_solarpower/frontend/stark-solarpower-panel-v096.js").read_text(encoding="utf-8")


def test_refresh_action_is_black_at_rest():
    assert ".nikas-shell__side-action--right{justify-self:end;color:var(--primary-text-color,#17191c)}" in SHELL


def test_peer_selector_is_between_viewport_and_bottom_navigation():
    assert 'grid-template-areas:"header" "viewport" "peer" "tabs"' in UI
    assert "minmax(0,1fr) 52px" in UI

HERO_SOURCE = (ROOT / "custom_components/stark_solarpower/frontend/stark-solarpower-panel-v098.js").read_text(encoding="utf-8")
BUNDLE = (ROOT / "custom_components/stark_solarpower/frontend/stark-solarpower-panel-bundle.js").read_text(encoding="utf-8")


def test_hero_accent_uses_canonical_density():
    canonical = "background:color-mix(in srgb,var(--primary-color,#03a9d9) 12%,var(--card-background-color,#fff))!important"
    for artifact in (HERO_SOURCE, BUNDLE):
        assert canonical in artifact
        assert "background:rgba(3,169,217,0.07)!important" not in artifact

