from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import Field, model_validator

from .calc_editor_common import CalcCondition, CalcEditorField, CalcFieldSource, CalcSubmit
from .shared import StrictModel

# Вид правила предупреждения: отношение сумм или сумма против границы.
KeoValidationRuleKind = Literal["ratio-max", "sum-max"]


class KeoEditorSection(StrictModel):
    """Секция помещения; `advanced` — экспандер принятых коэффициентов."""

    key: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=120)
    advanced: bool = None
    fields: list[CalcEditorField] = Field(min_length=1)


class KeoEditorRoom(StrictModel):
    """Значения одного помещения плюс источники этих значений."""

    name: str = Field(default=None, min_length=1, max_length=120)
    values: dict[str, Any]
    sources: dict[str, CalcFieldSource] = None


class KeoComputedNoteEntry(StrictModel):
    """Готовые строки плоскости и точки расчёта для одного назначения."""

    plane: str = Field(min_length=1, max_length=200)
    point: str = Field(default=None, min_length=1, max_length=200)
    byApartment: dict[str, str] = None


class KeoComputedNotes(StrictModel):
    """Вычисляемая подпись вместо редактируемого поля «рабочая плоскость»."""

    label: str = Field(min_length=1, max_length=120)
    purposeField: str = Field(min_length=1, max_length=80)
    apartmentField: str = Field(default=None, min_length=1, max_length=80)
    byPurpose: dict[str, KeoComputedNoteEntry]


class KeoValidationRule(StrictModel):
    """Предупреждающее правило геометрии: параметры и текст — от агента."""

    kind: KeoValidationRuleKind
    over: list[Annotated[str, Field(min_length=1, max_length=80)]] = Field(min_length=1)
    under: list[Annotated[str, Field(min_length=1, max_length=80)]] = Field(
        default=None, min_length=1
    )
    limit: float = None
    limitField: str = Field(default=None, min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=300)
    # Поля, подсвечиваемые пометкой «! проверить» при нарушении.
    targets: list[Annotated[str, Field(min_length=1, max_length=80)]] = Field(min_length=1)


class KeoEditorRoomTemplate(StrictModel):
    sections: list[KeoEditorSection] = Field(min_length=1)


class KeoEditorProps(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    meta: str = Field(default=None, min_length=1, max_length=200)
    conditions: list[CalcCondition] = Field(min_length=1)
    roomTemplate: KeoEditorRoomTemplate
    rooms: list[KeoEditorRoom] = Field(min_length=1)
    roomLabel: str = Field(min_length=1, max_length=80)
    addRoomLabel: str = Field(min_length=1, max_length=80)
    removeRoomLabel: str = Field(min_length=1, max_length=80)
    maxRooms: int = Field(default=None, ge=1, le=24)
    computedNotes: KeoComputedNotes = None
    validationRules: list[KeoValidationRule] = Field(default=None, max_length=8)
    sourcesLabel: str = Field(default=None, min_length=1, max_length=80)
    # Подпись первого режима кнопки подвала («Далее»); без неё кнопка одна.
    nextLabel: str = Field(default=None, min_length=1, max_length=80)
    # Заголовок группы условий; без него группа стоит блоком без раскрывашки.
    conditionsLabel: str = Field(default=None, min_length=1, max_length=120)
    # Имя action'а автосохранения черновика; без него наружу уходит только submit.
    draftAction: str = Field(default=None, min_length=1, max_length=120)
    # URL приёма черновика REST-каналом (спайк keo-draft-rest-channel): задан —
    # черновик уезжает POST'ом вне диалогового run'а, draftAction — путь отката.
    # Строго относительный путь (один ведущий /): значение уходит в fetch.
    draftUrl: str = Field(default=None, min_length=1, max_length=500, pattern=r"^\/(?:$|[^\/])")
    submit: CalcSubmit

    @model_validator(mode="after")
    def validate_document(self) -> "KeoEditorProps":
        field_names = {
            field.name for section in self.roomTemplate.sections for field in section.fields
        }

        for section in self.roomTemplate.sections:
            for field in section.fields:
                if field.revealBy is not None and field.revealBy.field not in field_names:
                    raise ValueError(
                        f'revealBy references unknown field "{field.revealBy.field}"'
                    )

        if self.computedNotes is not None and self.computedNotes.purposeField not in field_names:
            raise ValueError(
                "computedNotes.purposeField references unknown field "
                f'"{self.computedNotes.purposeField}"'
            )

        for rule in self.validationRules or []:
            if rule.kind == "ratio-max" and (rule.under is None or rule.limit is None):
                raise ValueError('ratio-max rule requires both "under" and "limit"')

            if rule.kind == "sum-max" and rule.limit is None and rule.limitField is None:
                raise ValueError('sum-max rule requires "limit" or "limitField"')

        return self
