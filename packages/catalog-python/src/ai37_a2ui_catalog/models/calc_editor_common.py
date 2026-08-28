from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field, model_validator

from .form_card import FormFieldLookupValue, LookupSuggestMode
from .shared import StrictModel

# Вид источника значения РАСЧЁТНЫХ редакторов (КЕО, инсоляция). Шире
# констракшнового словаря: есть значения, посчитанные агентом (`calculated`), и
# допущения (`assumption`). Общий словарь CE/LE расширять нельзя — их подписи
# завязаны ровно на четыре вида.
CalcFieldSourceKind = Literal["project", "question", "suggested", "calculated", "assumption"]

# Тип поля расчётного редактора: `lookup` не нужен — справочники живут у агента.
CalcEditorFieldType = Literal["text", "number", "select", "boolean"]

# Тип правимого условия. Без него строка условий readonly — прежнее поведение.
CalcConditionType = Literal["text", "select", "lookup"]


class CalcFieldSource(StrictModel):
    source: CalcFieldSourceKind
    # Человеческое обоснование одной строкой.
    note: str = Field(default=None, min_length=1, max_length=200)


class CalcRevealBy(StrictModel):
    """Раскрытие поля по значению поля-триггера того же экрана."""

    field: str = Field(min_length=1, max_length=80)
    values: list[Annotated[str, Field(min_length=1, max_length=120)]] = Field(min_length=1)


class CalcEditorField(StrictModel):
    """Поле расчётного редактора: базовое поле FormCard плюс аддитивные ключи."""

    name: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    type: CalcEditorFieldType
    required: bool = None
    options: list[str] = Field(default=None, min_length=1)
    referenceId: str = Field(default=None, min_length=1, max_length=80)
    minChars: int = Field(default=None, ge=1, le=10)
    suggestMode: LookupSuggestMode = None
    placeholder: str = Field(default=None, min_length=1, max_length=120)
    defaultValue: str | int | float | bool | FormFieldLookupValue = None
    hint: str = Field(default=None, min_length=1, max_length=200)
    # Подпись поля в строке-сводке свёрнутой секции.
    shortLabel: str = Field(default=None, min_length=1, max_length=40)
    # Пояснение к варианту списка; в submit уходит само значение.
    optionNotes: dict[str, str] = None
    revealBy: CalcRevealBy = None
    # Предупреждение по значению самого поля («нет» у затенения).
    valueWarnings: dict[str, str] = None
    # Границы предупреждающей проверки числа; submit не блокируют.
    min: float = None
    max: float = None


class CalcCondition(StrictModel):
    """Строка блока «Условия».

    Значение приходит готовой строкой; с `type` строка становится контролом и
    правится на месте, а правленое значение уходит в submit тем же ключом
    `name`. Город (регион строительства) агент берёт из проекта, но проект
    бывает не тот — правка меняет расчёт, а не данные проекта. Без `type`
    строка остаётся readonly: так приходят выведенные значения (норматив,
    методика), их пересчитывает агент.

    Пустое `value` — отсутствие ответа, и допустимо оно только у правимого
    условия: иначе агент изобретает заглушку («—»), а она уезжает в submit как
    настоящее значение. Выведенное условие пустым не бывает — не вычислилось,
    значит строку не присылать вовсе.
    """

    name: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    value: str = Field(max_length=200)
    note: str = Field(default=None, min_length=1, max_length=200)
    type: CalcConditionType = Field(default=None)
    options: list[Annotated[str, Field(min_length=1, max_length=200)]] = Field(
        default=None, min_length=1
    )
    referenceId: str = Field(default=None, min_length=1, max_length=80)
    source: CalcFieldSource = Field(default=None)

    @model_validator(mode="after")
    def validate_control(self) -> "CalcCondition":
        if self.value == "" and self.type is None:
            raise ValueError('a non-empty "value" is required when "type" is absent')
        if self.type == "select" and not self.options:
            raise ValueError('options are required when type is "select"')
        if self.type == "lookup" and not isinstance(self.referenceId, str):
            raise ValueError('referenceId is required when type is "lookup"')
        return self


class CalcSubmit(StrictModel):
    """Единственный action расчётного редактора — «Рассчитать»."""

    name: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=80)
