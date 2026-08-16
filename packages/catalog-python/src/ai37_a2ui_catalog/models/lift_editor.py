from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import Field, model_validator

from .form_card import FormFieldLookupValue, LookupSuggestMode
from .shared import StrictModel

# Режим лифтов методики: перечень вкладок «Лифт 1…N» либо одна лифтовая группа.
LiftsMode = Literal["per-lift", "group"]

# Экран поля-источника: значения лифта (по умолчанию) или здания.
LiftEditorFieldScope = Literal["building", "lift"]

# `combo` — свободный ввод с подсказками ряда; остальное — типы поля FormCard.
LiftEditorFieldType = Literal["text", "number", "select", "boolean", "lookup", "combo"]

# Источник значения поля — тот же контракт, что `generalSources` теплотеха.
LiftEditorFieldSourceKind = Literal["project", "question", "suggested", "default"]


class LiftEditorFieldSource(StrictModel):
    source: LiftEditorFieldSourceKind
    # Человеческое обоснование одной строкой.
    note: str = Field(default=None, min_length=1, max_length=200)


class LiftEditorFieldOptionsBy(StrictModel):
    """Подсказки, зависящие от значения другого поля (ряды Прил. Е по типу здания)."""

    source: str = Field(min_length=1, max_length=80)
    scope: LiftEditorFieldScope = None
    options: dict[str, Annotated[list[str], Field(min_length=1)]]


class LiftEditorField(StrictModel):
    """Поле редактора: базовое поле FormCard плюс аддитивные ключи."""

    name: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    type: LiftEditorFieldType
    required: bool = None
    options: list[str] = Field(default=None, min_length=1)
    referenceId: str = Field(default=None, min_length=1, max_length=80)
    minChars: int = Field(default=None, ge=1, le=10)
    suggestMode: LookupSuggestMode = None
    placeholder: str = Field(default=None, min_length=1, max_length=120)
    defaultValue: str | int | float | bool | FormFieldLookupValue = None
    # Поле со значением по умолчанию — под экспандер.
    advanced: bool = None
    # Подпись поля в строке-сводке свёрнутой секции; без неё сводка берёт `name`.
    shortLabel: str = Field(default=None, min_length=1, max_length=40)
    hint: str = Field(default=None, min_length=1, max_length=160)
    # Пояснение к варианту ряда; в submit уходит само значение.
    optionNotes: dict[str, str] = None
    optionsBy: LiftEditorFieldOptionsBy = None


class LiftEditorDependentRuleSource(StrictModel):
    field: str = Field(min_length=1, max_length=80)
    scope: LiftEditorFieldScope = None


class LiftEditorDependentRuleRow(StrictModel):
    # Порядок значений = порядок `sources` правила.
    when: list[str | float] = Field(min_length=1)
    set: dict[str, str | float]


class LiftEditorDependentRule(StrictModel):
    """Декларативное зависимое значение: готовые строки ряда, без таблиц ГОСТ."""

    sources: list[LiftEditorDependentRuleSource] = Field(min_length=1, max_length=4)
    rows: list[LiftEditorDependentRuleRow] = Field(min_length=1)
    # Нет совпадения: 'keep' (default) оставляет как есть, 'clear' очищает.
    onNoMatch: Literal["keep", "clear"] = None


class LiftEditorMethodConfig(StrictModel):
    """Конфиг одной методики: состав экранов, режим лифтов и правила подстановок."""

    method: str = Field(min_length=1, max_length=40)
    label: str = Field(min_length=1, max_length=120)
    gostLabel: str = Field(min_length=1, max_length=60)
    buildingTitle: str = Field(min_length=1, max_length=120)
    buildingFields: list[LiftEditorField] = Field(min_length=1)
    liftTitle: str = Field(min_length=1, max_length=120)
    liftFields: list[LiftEditorField] = Field(min_length=1)
    liftsMode: LiftsMode
    liftTabLabel: str = Field(min_length=1, max_length=80)
    # Тип здания для текста шапки, когда у ветки нет поля `buildingType`.
    buildingKindLabel: str = Field(default=None, min_length=1, max_length=80)
    maxLifts: int = Field(default=None, ge=1, le=16)
    dependentRules: list[LiftEditorDependentRule] = Field(default=None, max_length=8)


class LiftEditorProps(StrictModel):
    # Управляет активным конфигом, поэтому отдельный проп, а не поле здания.
    methodField: LiftEditorField
    # Конфиги ВСЕХ методик сразу — смена методики локальна, без раунд-трипа.
    methodConfigs: list[LiftEditorMethodConfig] = Field(min_length=1)
    method: str = Field(min_length=1, max_length=40)
    # Значения активной ветки; черновики остальных живут только на клиенте.
    building: dict[str, Any]
    lifts: list[dict[str, Any]]
    buildingTabLabel: str = Field(min_length=1, max_length=80)
    advancedLabel: str = Field(min_length=1, max_length=80)
    addLabel: str = Field(min_length=1, max_length=80)
    removeLabel: str = Field(min_length=1, max_length=80)
    submitLabel: str = Field(min_length=1, max_length=80)
    # Единственный action компонента.
    submitAction: str = Field(min_length=1, max_length=120)
    # Имя action'а автосохранения черновика; без него автосейва нет.
    draftAction: str = Field(default=None, min_length=1, max_length=120)
    # Шапка карточки; без `headerTitle` переключатель методики падает над секции.
    headerTitle: str = Field(default=None, min_length=1, max_length=120)
    headerContext: str = Field(default=None, min_length=1, max_length=200)
    # Подпись кнопки-навигации «Далее»; без пропа кнопка блокируется, как раньше.
    pendingLabel: str = Field(default=None, min_length=1, max_length=80)
    # Источники значений полей — только подписи; в payload не уходят.
    buildingSources: dict[str, LiftEditorFieldSource] = None
    liftSources: list[dict[str, LiftEditorFieldSource]] = None

    @model_validator(mode="after")
    def validate_document(self) -> "LiftEditorProps":
        if all(config.method != self.method for config in self.methodConfigs):
            raise ValueError(f'methodConfigs has no config for method "{self.method}"')

        if self.methodField.type != "select":
            raise ValueError('methodField.type must be "select"')

        for config in self.methodConfigs:
            for rule in config.dependentRules or []:
                for row in rule.rows:
                    if len(row.when) != len(rule.sources):
                        raise ValueError(
                            f'Row "when" has {len(row.when)} value(s) but the rule '
                            f"declares {len(rule.sources)} source(s)."
                        )

        return self
