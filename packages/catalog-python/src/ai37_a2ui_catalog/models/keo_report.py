from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field

from .keo_drawings import KeoDrawings
from .shared import StrictModel


class KeoReportAction(StrictModel):
    """Действие карточки отчёта; имена действий выбирает агент."""

    name: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=80)
    payload: dict[str, Annotated[str, Field(max_length=200)]] = None


class KeoReportVerdict(StrictModel):
    status: Literal["pass", "fail"]
    badge: str = Field(min_length=1, max_length=120)
    headline: str = Field(min_length=1, max_length=200)
    summary: str = Field(default=None, min_length=1, max_length=400)


class KeoReportRecommendation(StrictModel):
    """Карточка секции «Что изменить»: тон — оформление, кнопка — только action."""

    title: str = Field(min_length=1, max_length=200)
    detail: str = Field(min_length=1, max_length=300)
    tone: Literal["success", "neutral", "fail"]
    action: KeoReportAction = None


class KeoReportRoom(StrictModel):
    """Строка результата по помещению; значения — готовые строки от агента."""

    id: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    value: str = Field(min_length=1, max_length=60)
    norm: str = Field(min_length=1, max_length=60)
    status: Literal["pass", "fail"]
    action: KeoReportAction = None


class KeoReportInputChip(StrictModel):
    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=120)


class KeoReportInputGroup(StrictModel):
    label: str = Field(min_length=1, max_length=120)
    tone: Literal["normal", "warning"]
    chips: list[KeoReportInputChip] = Field(min_length=1)
    note: str = Field(default=None, min_length=1, max_length=500)


class KeoReportInputs(StrictModel):
    action: KeoReportAction = None
    groups: list[KeoReportInputGroup] = Field(min_length=1)


class KeoReportProtocol(StrictModel):
    meta: str = Field(default=None, min_length=1, max_length=200)
    # Краткий вывод расчёта — в UI не показывается, только скачивается.
    content: str = Field(min_length=1, max_length=60000)
    # Без имени файла кнопки «Скачать» нет.
    downloadFileName: str = Field(default=None, min_length=1, max_length=120)
    downloadContent: str = Field(default=None, min_length=1, max_length=120000)
    # Относительный URL ручки агента для «Скачать» — меню форматов .md/.docx.
    downloadUrl: str = Field(default=None, min_length=1, max_length=2000)


class KeoReportProps(StrictModel):
    """Результат расчёта КЕО; обязательны только `verdict` и `inputs`."""

    verdict: KeoReportVerdict
    recommendations: list[KeoReportRecommendation] = Field(default=None, min_length=1)
    rooms: list[KeoReportRoom] = Field(default=None, min_length=1)
    assumptions: list[Annotated[str, Field(min_length=1, max_length=300)]] = Field(
        default=None, min_length=1
    )
    inputs: KeoReportInputs
    # Модель чертежей Данилюка числами; нет поля — секции «Чертежи» нет.
    drawings: KeoDrawings = None
    protocol: KeoReportProtocol = None
