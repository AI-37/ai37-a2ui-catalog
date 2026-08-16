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
        ("constructions-editor.json", "ConstructionsEditor"),
        ("constructions-editor-conditions.json", "ConstructionsEditor"),
        ("lift-editor-per-lift.json", "LiftEditor"),
        ("lift-editor-group.json", "LiftEditor"),
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
        ("form-card-invalid-suggest-mode.json", "FormCard"),
        ("constructions-editor-missing-reference.json", "ConstructionsEditor"),
        ("constructions-editor-negative-thickness.json", "ConstructionsEditor"),
        ("constructions-editor-unknown-type.json", "ConstructionsEditor"),
        ("constructions-editor-empty-draft-action.json", "ConstructionsEditor"),
        ("constructions-editor-unknown-general-key.json", "ConstructionsEditor"),
        ("lift-editor-unknown-method.json", "LiftEditor"),
        ("lift-editor-empty-lift-fields.json", "LiftEditor"),
        ("lift-editor-when-length-mismatch.json", "LiftEditor"),
        ("lift-editor-empty-draft-action.json", "LiftEditor"),
        ("lift-editor-unknown-source.json", "LiftEditor"),
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
    assert get_component_schema("ConstructionsEditor")["type"] == "object"
    assert get_component_schema("LiftEditor")["type"] == "object"


def test_constructions_editor_round_trip() -> None:
    fixture = load_fixture("valid", "constructions-editor.json")
    model = validate_component_payload("ConstructionsEditor", fixture["props"])

    dumped = model.model_dump(exclude_none=True)
    # None-поля дампа: exclude_none режет и легитимный null thicknessMm
    # незаполненной строки — восстанавливаем его перед сравнением.
    for construction, dumped_construction in zip(
        fixture["props"]["constructions"], dumped["constructions"]
    ):
        for layer, dumped_layer in zip(construction["layers"], dumped_construction["layers"]):
            if layer["thicknessMm"] is None:
                dumped_layer["thicknessMm"] = None

    assert dumped == fixture["props"]


def test_constructions_editor_general_accepts_empty_block() -> None:
    fixture = load_fixture("valid", "constructions-editor.json")
    empty_general = {key: None for key in fixture["props"]["general"]}
    props = {**fixture["props"], "general": empty_general}

    model = validate_component_payload("ConstructionsEditor", props)

    assert model.general is not None
    # gsop опционален — прежние эмитенты ключа не шлют, в дампе он None.
    assert model.general.model_dump() == {**empty_general, "gsop": None}


def test_constructions_editor_general_sources() -> None:
    fixture = load_fixture("valid", "constructions-editor.json")
    props = {
        **fixture["props"],
        "general": {**fixture["props"]["general"], "gsop": 6380},
        "generalSources": {
            "tv": {"source": "suggested", "note": "норма для жилых по ГОСТ 30494"},
            "city": {"source": "project"},
        },
        "conditionsCollapsed": True,
        "headerTitle": "Параметры расчёта",
        "headerContext": "Проект «ЖК Северный, к.3» · СП 50.13330",
    }

    model = validate_component_payload("ConstructionsEditor", props)

    assert model.general.gsop == 6380
    assert model.generalSources.tv.source == "suggested"
    assert model.generalSources.city.note is None

    # Ключ, которого нет в general, отвергается — связь по строковому ключу
    # проверяет схема (Решение 4 design.md).
    with pytest.raises(ValidationError):
        validate_component_payload(
            "ConstructionsEditor",
            {**props, "generalSources": {"unknownField": {"source": "project"}}},
        )


def test_constructions_editor_without_back_button() -> None:
    # Объединённый экран кнопку возврата не шлёт; прежние эмитенты — шлют.
    fixture = load_fixture("valid", "constructions-editor.json")
    assert "backAction" not in fixture["props"]

    model = validate_component_payload(
        "ConstructionsEditor",
        {**fixture["props"], "backLabel": "Назад", "backAction": "navigate"},
    )

    assert model.backAction == "navigate"
