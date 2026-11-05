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
        ("constructions-editor-r.json", "ConstructionsEditor"),
        ("constructions-editor-nt.json", "ConstructionsEditor"),
        # Тонкий слой и вентфасад без толщины (change constructions-layer-kind-thin).
        ("constructions-editor-thin.json", "ConstructionsEditor"),
        ("lift-editor-per-lift.json", "LiftEditor"),
        ("lift-editor-group.json", "LiftEditor"),
        ("lift-editor-note-rule.json", "LiftEditorNext"),
        ("lift-editor-recommend.json", "LiftEditorNext"),
        ("keo-editor.json", "KeoEditor"),
        # Новый рендерер на той же схеме props (change keo-editor-next):
        # подписи «Далее» и «Условия» обязаны быть и в зеркале.
        ("keo-editor.json", "KeoEditorNext"),
        # Первый ход: города нет, помещение пустое — пустое значение правимого
        # условия валидно (change keo-condition-unfilled).
        ("keo-editor-first-move.json", "KeoEditorNext"),
        # Автосохранение черновика — аддитивный `draftAction`
        # (change keo-editor-draft).
        ("keo-editor-draft.json", "KeoEditorNext"),
        ("keo-report-fail.json", "KeoReport"),
        ("keo-report-pass.json", "KeoReport"),
        # Новый рендерер на той же схеме props (change keo-report-next).
        ("keo-report-fail.json", "KeoReportNext"),
        # Модель чертежей Данилюка — аддитивное поле `drawings`
        # (change keo-report-drawings): небо видно и небо перекрыто.
        ("keo-report-drawings.json", "KeoReportNext"),
        ("keo-report-drawings-blocked.json", "KeoReportNext"),
        ("insolation-editor.json", "InsolationEditor"),
        ("insolation-report-pass.json", "InsolationReport"),
        ("insolation-report-fail.json", "InsolationReport"),
        ("artifact-card.json", "ArtifactCard"),
        ("artifact-card-minimal.json", "ArtifactCard"),
        # Проверка контрагента (change verification-report): спорный случай,
        # точечная проверка с одной строкой и вердикт без проверок.
        ("verification-report-review.json", "VerificationReport"),
        ("verification-report-pass.json", "VerificationReport"),
        ("verification-report-fail.json", "VerificationReport"),
        ("attachment-choice-card-signature.json", "AttachmentChoiceCard"),
        ("attachment-choice-card-minimal.json", "AttachmentChoiceCard"),
        # Подтверждение пачки предложений агента данных (план AI-37/docs#545).
        ("proposal-card-voice.json", "ProposalCard"),
        ("proposal-card-params.json", "ProposalCard"),
        ("proposal-card-superseded.json", "ProposalCard"),
        # Источник у пункта: документ и страница (план AI-37/docs#569, срез D).
        ("proposal-card-documents.json", "ProposalCard"),
        ("proposal-card-voice-links.json", "ProposalCard"),
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
        ("constructions-editor-r-above-one.json", "ConstructionsEditor"),
        ("constructions-editor-tv-room-null.json", "ConstructionsEditor"),
        ("constructions-editor-unknown-layer-kind.json", "ConstructionsEditor"),
        ("lift-editor-unknown-method.json", "LiftEditor"),
        ("lift-editor-empty-lift-fields.json", "LiftEditor"),
        ("lift-editor-when-length-mismatch.json", "LiftEditor"),
        ("lift-editor-empty-draft-action.json", "LiftEditor"),
        ("lift-editor-unknown-source.json", "LiftEditor"),
        ("lift-editor-rule-row-empty.json", "LiftEditor"),
        ("lift-editor-recommend-empty-resource.json", "LiftEditorNext"),
        ("lift-editor-recommend-empty-params.json", "LiftEditorNext"),
        ("keo-editor-unknown-reveal.json", "KeoEditor"),
        ("keo-editor-empty-next-label.json", "KeoEditorNext"),
        ("keo-editor-empty-conditions-label.json", "KeoEditorNext"),
        ("keo-editor-empty-condition-value.json", "KeoEditorNext"),
        ("keo-editor-empty-draft-action.json", "KeoEditorNext"),
        ("insolation-editor-unknown-source.json", "InsolationEditor"),
        ("insolation-report-overlapping-segments.json", "InsolationReport"),
        ("artifact-card-href-in-props.json", "ArtifactCard"),
        ("artifact-card-bad-id.json", "ArtifactCard"),
        ("artifact-card-bad-file-id.json", "ArtifactCard"),
        ("verification-report-unknown-status.json", "VerificationReport"),
        ("verification-report-empty-details.json", "VerificationReport"),
        ("attachment-choice-card-no-context.json", "AttachmentChoiceCard"),
        ("attachment-choice-card-attach-no-accept.json", "AttachmentChoiceCard"),
        ("attachment-choice-card-extra-key.json", "AttachmentChoiceCard"),
        ("proposal-card-unknown-state.json", "ProposalCard"),
        ("proposal-card-empty-items.json", "ProposalCard"),
        ("proposal-card-unknown-item-kind.json", "ProposalCard"),
        ("proposal-card-confirm-without-action.json", "ProposalCard"),
        ("proposal-card-item-source-without-text.json", "ProposalCard"),
        ("proposal-card-item-source-not-object.json", "ProposalCard"),
        ("proposal-card-source-link-without-label.json", "ProposalCard"),
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


def test_proposal_card_builds_from_python() -> None:
    """Агент на Python собирает карточку моделями и отдаёт её JSON без None-полей."""
    from ai37_a2ui_catalog.models import ProposalCardProps, ProposalConfirm, ProposalItem

    card = ProposalCardProps(
        proposalId="pb_1",
        title="Изменения из сообщения",
        state="open",
        items=[ProposalItem(id="c1", kind="changed", label="вытяжка ростеров", before="1", after="2")],
        confirm=ProposalConfirm(label="Подтвердить", action="proposal.accept"),
    )
    dumped = card.model_dump(exclude_none=True)

    assert dumped["items"] == [
        {"id": "c1", "kind": "changed", "label": "вытяжка ростеров", "before": "1", "after": "2"}
    ]
    assert validate_component_payload("ProposalCard", dumped) == card


def test_proposal_item_source_builds_from_python() -> None:
    """Пункт несёт свой источник; JSON без None-полей проходит валидацию каталога."""
    from ai37_a2ui_catalog.models import ProposalCardProps, ProposalItem, ProposalSource

    card = ProposalCardProps(
        proposalId="pb_2",
        title="Параметры из документов",
        state="open",
        items=[
            ProposalItem(
                id="d1",
                kind="added",
                label="Тариф, ₽/кВт·ч",
                after="7,48",
                source=ProposalSource(label="Счёт за сентябрь.pdf, стр. 2", quote="7,48 руб. без НДС"),
            ),
            ProposalItem(id="d2", kind="added", label="Площадь, м²", after="1 240"),
        ],
    )
    dumped = card.model_dump(exclude_none=True)

    assert dumped["items"][0]["source"] == {"label": "Счёт за сентябрь.pdf, стр. 2", "quote": "7,48 руб. без НДС"}
    assert "source" not in dumped["items"][1]
    assert validate_component_payload("ProposalCard", dumped) == card


@pytest.mark.parametrize(
    "source",
    [
        {},
        {"href": "/projects/p/documents"},
        {"label": ""},
        {"label": "Счёт.pdf", "page": 2},
        {"label": 2},
        "Счёт.pdf",
    ],
)
def test_proposal_item_source_rejects_bad_shapes(source: object) -> None:
    from ai37_a2ui_catalog.models import ProposalItem

    with pytest.raises(ValidationError):
        ProposalItem.model_validate({"id": "d1", "kind": "added", "label": "Тариф", "source": source})


def test_proposal_source_links_build_from_python() -> None:
    """Источник пачки с записями: ссылка с адресом и подпись без него, JSON без None-полей."""
    from ai37_a2ui_catalog.models import ProposalCardProps, ProposalItem, ProposalSource, ProposalSourceLink

    card = ProposalCardProps(
        proposalId="pb_3",
        title="Изменения из голосовых сообщений",
        state="open",
        items=[ProposalItem(id="s1", kind="changed", label="уставка приточки, °C", before="18", after="20")],
        source=ProposalSource(
            label="Голосовые сообщения · 2",
            links=[
                ProposalSourceLink(label="Голосовое сообщение 1", href="/documents/ser_1"),
                ProposalSourceLink(label="Голосовое сообщение 2"),
            ],
        ),
    )
    dumped = card.model_dump(exclude_none=True)

    assert dumped["source"]["links"] == [
        {"label": "Голосовое сообщение 1", "href": "/documents/ser_1"},
        {"label": "Голосовое сообщение 2"},
    ]
    assert validate_component_payload("ProposalCard", dumped) == card


@pytest.mark.parametrize("links", [[], [{"label": "Запись 1"}], [{"label": f"Запись {n}"} for n in range(20)]])
def test_proposal_source_links_accepts(links: list[dict[str, str]]) -> None:
    from ai37_a2ui_catalog.models import ProposalSource

    assert ProposalSource.model_validate({"label": "Голосовые сообщения", "links": links}).links is not None
    assert ProposalSource.model_validate({"label": "Голосовые сообщения"}).links is None


@pytest.mark.parametrize(
    "links",
    [
        [{"href": "/documents/ser_1"}],
        [{"label": ""}],
        [{"label": "Запись 1", "href": ""}],
        [{"label": "Запись 1", "seriesId": "ser_1"}],
        ["Запись 1"],
        {"label": "Запись 1"},
        None,
        [{"label": f"Запись {n}"} for n in range(21)],
    ],
)
def test_proposal_source_links_rejects_bad_shapes(links: object) -> None:
    from ai37_a2ui_catalog.models import ProposalSource

    with pytest.raises(ValidationError):
        ProposalSource.model_validate({"label": "Голосовые сообщения", "links": links})


def test_proposal_source_links_alone_are_not_a_source() -> None:
    """Подпись или цитата нужна по-прежнему: одних ссылок мало."""
    from ai37_a2ui_catalog.models import ProposalSource

    with pytest.raises(ValidationError):
        ProposalSource.model_validate({"links": [{"label": "Голосовое сообщение 1"}]})
