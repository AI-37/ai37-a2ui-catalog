from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field

from .form_card import FormFieldLookupValue, LookupSuggestMode
from .shared import StrictModel

# Вид источника значения РАСЧЁТНЫХ редакторов (КЕО, инсоляция). Шире
# констракшнового словаря: есть значения, посчитанные агентом (`calculated`), и
# допущения (`assumption`). Общий словарь CE/LE расширять нельзя — их подписи
# завязаны ровно на четыре вида.
CalcFieldSourceKind = Literal["project", "question", "suggested", "calculated", "assumption"]

# Тип поля расчётного редактора: `lookup` не нужен — справочники живут у агента.
CalcEditorFieldType = Literal["text", "number", "select", "boolean"]


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
    """Readonly-строка блока «Условия»: значение приходит готовой строкой."""

    name: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    value: str = Field(min_length=1, max_length=200)
    note: str = Field(default=None, min_length=1, max_length=200)


class CalcSubmit(StrictModel):
    """Единственный action расчётного редактора — «Рассчитать»."""

    name: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=80)
