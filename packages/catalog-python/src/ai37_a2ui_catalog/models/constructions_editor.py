from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import Field

from .shared import StrictModel

# Вид строки слоя: материал или воздушный зазор (вент./невент.); зазоры в
# live-Rпр клиента пропускаются, их Rs считает сервер.
ConstructionLayerKind = Literal["material", "vent-gap", "closed-gap"]

ConstructionType = Literal[
    "steny", "pokrytiya", "cherdachnye_podval_grunt", "okna", "fonari", "dver"
]

CherdachnyeSubtype = Literal["cherdak", "podval_vent", "podval_nevent", "pol_po_gruntu"]

PositiveFloat = Annotated[float, Field(gt=0)]


class ConstructionLayer(StrictModel):
    material: str = Field(min_length=1, max_length=200)
    # None — незаполненная строка (черновик до submit).
    thicknessMm: PositiveFloat | None
    kind: ConstructionLayerKind = None
    materialKey: str = None
    lambdaA: float = Field(default=None, gt=0)
    lambdaB: float = Field(default=None, gt=0)
    lambdaManual: float = Field(default=None, gt=0)


class ConstructionEntry(StrictModel):
    # Ключ React-списка; клиентский, агент его игнорирует.
    id: str = Field(min_length=1)
    type: ConstructionType
    subtype: CherdachnyeSubtype = None
    name: str = Field(default=None, max_length=200)
    layers: list[ConstructionLayer] = Field(max_length=50)
    rprPassport: float = Field(default=None, gt=0)


class ConstructionTypeConfig(StrictModel):
    type: ConstructionType
    label: str
    hasLayers: bool
    rnorm: float = Field(default=None, gt=0)
    alphaV: float = Field(default=None, gt=0)
    # Число или record по subtype; subtype без записи (пол по грунту) —
    # член 1/αн в live-Rпр опускается.
    alphaN: PositiveFloat | dict[CherdachnyeSubtype, PositiveFloat] = None


class ConstructionsCity(StrictModel):
    value: str = Field(min_length=1, max_length=200)
    label: str = Field(min_length=1, max_length=200)


class ConstructionsGeneral(StrictModel):
    """Общие данные (климат СП 131 и здание); незаполненное значение — None."""

    buildingType: Annotated[str, Field(max_length=200)] | None
    city: ConstructionsCity | None
    # tот — средняя температура отопительного периода, °C (бывает < 0).
    tot: float | None
    # zот — продолжительность отопительного периода, сут.
    zot: float | None
    # tн — температура наиболее холодной пятидневки, °C.
    tn: float | None
    # tв — расчётная температура внутреннего воздуха, °C.
    tv: float | None
    # Условие эксплуатации А/Б; None → λБ (как на сервере).
    condition: Literal["А", "Б"] | None
    # ГСОП от агента; клиент его не считает. Опционален ради обратной
    # совместимости: прежние эмитенты ключа не шлют.
    gsop: float | None = None


# Откуда взялось значение поля general: из проекта, из текста вопроса,
# предложено агентом или принято по умолчанию.
ConstructionsFieldSourceKind = Literal["project", "question", "suggested", "default"]


class ConstructionsFieldSource(StrictModel):
    source: ConstructionsFieldSourceKind
    # Человеческое обоснование одной строкой.
    note: str = Field(default=None, min_length=1, max_length=200)


class ConstructionsGeneralSources(StrictModel):
    """Источники значений general — параллельный блок, наружу не уходит."""

    buildingType: ConstructionsFieldSource = None
    city: ConstructionsFieldSource = None
    tot: ConstructionsFieldSource = None
    zot: ConstructionsFieldSource = None
    tn: ConstructionsFieldSource = None
    tv: ConstructionsFieldSource = None
    condition: ConstructionsFieldSource = None
    gsop: ConstructionsFieldSource = None


class ConstructionsEditorProps(StrictModel):
    constructions: list[ConstructionEntry]
    typeConfigs: list[ConstructionTypeConfig] = Field(min_length=1)
    # Общие данные блока «Условия»; без них блока нет и submit шлёт
    # только `{constructions}`.
    general: ConstructionsGeneral = None
    # Источники значений general: оформление и подпись, наружу не уходят.
    generalSources: ConstructionsGeneralSources = None
    # Начальное состояние блока «Условия»; по умолчанию раскрыт.
    conditionsCollapsed: bool = None
    # Шапка карточки: заголовок слева, контекст справа.
    headerTitle: str = Field(default=None, min_length=1, max_length=120)
    headerContext: str = Field(default=None, min_length=1, max_length=200)
    buildingTypeOptions: list[Annotated[str, Field(min_length=1, max_length=200)]] = Field(
        default=None, max_length=50
    )
    # Справочник городов для lookup'а; опция может нести tot/zot/tn.
    cityReferenceId: str = Field(default=None, min_length=1, max_length=80)
    # DEPRECATED: вкладок нет — общие данные стали блоком «Условия».
    generalTabLabel: str = Field(default=None, min_length=1, max_length=80)
    # DEPRECATED: конструкции идут сразу под блоком «Условия».
    constructionsTabLabel: str = Field(default=None, min_length=1, max_length=80)
    # DEPRECATED: начальное значение general.condition; правится во вкладке.
    condition: Literal["А", "Б"] = None
    materialsReferenceId: str = Field(min_length=1, max_length=80)
    minChars: int = Field(default=None, ge=1, le=10)
    addLabel: str = Field(min_length=1, max_length=80)
    submitLabel: str = Field(min_length=1, max_length=80)
    # DEPRECATED: перехода между вкладками нет — экран один.
    nextLabel: str = Field(default=None, min_length=1, max_length=80)
    submitAction: str = Field(min_length=1, max_length=120)
    # Кнопка возврата опциональна: на объединённом экране её нет.
    backLabel: str = Field(default=None, min_length=1, max_length=80)
    backAction: str = Field(default=None, min_length=1, max_length=120)
    backActionContext: dict[str, Any] = None
    # Имя action'а автосохранения черновика; без него автосейва нет.
    draftAction: str = Field(default=None, min_length=1, max_length=120)
