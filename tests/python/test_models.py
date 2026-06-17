from __future__ import annotations

import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from ai37_a2ui_catalog import CATALOG_ID, get_component_schema, validate_component_payload


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_fixture(group: str, name: str):
    return json.loads((REPO_ROOT / "fixtures" / group / name).read_text(encoding="utf-8"))


@pytest.mark.parametrize(
    ("file_name", "component"),
    [
        ("simple-table.json", "SimpleTable"),
        ("flex-table.json", "FlexTable"),
        ("latex-formula.json", "LatexFormula"),
        ("choice-card.json", "ChoiceCard"),
        ("form-card.json", "FormCard"),
    ],
)
def test_valid_fixtures(file_name: str, component: str) -> None:
    fixture = load_fixture("valid", file_name)
    model = validate_component_payload(component, fixture["props"])
    assert model is not None


@pytest.mark.parametrize(
    ("file_name", "component"),
    [
        ("simple-table-row-length.json", "SimpleTable"),
        ("flex-table-span-mismatch.json", "FlexTable"),
        ("latex-formula-empty.json", "LatexFormula"),
        ("choice-card-empty-choices.json", "ChoiceCard"),
        ("form-card-invalid-field-type.json", "FormCard"),
    ],
)
def test_invalid_fixtures(file_name: str, component: str) -> None:
    fixture = load_fixture("invalid", file_name)
    with pytest.raises((ValidationError, ValueError)):
        validate_component_payload(component, fixture["props"])


def test_component_schemas_are_available() -> None:
    assert CATALOG_ID.startswith("https://ai-37.github.io/ai37-a2ui-catalog")
    assert get_component_schema("SimpleTable")["type"] == "object"
    assert get_component_schema("FlexTable")["type"] == "object"
    assert get_component_schema("LatexFormula")["type"] == "object"
    assert get_component_schema("ChoiceCard")["type"] == "object"
    assert get_component_schema("FormCard")["type"] == "object"
