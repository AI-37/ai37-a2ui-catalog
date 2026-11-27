from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field

from .shared import StrictModel


class LiftReportAction(StrictModel):
    """Действие карточки отчёта; имена действий выбирает агент."""

    name: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=80)
    payload: dict[str, Annotated[str, Field(max_length=200)]] = None


class LiftReportVerdict(StrictModel):
    status: Literal["pass", "fail"]
    badge: str = Field(min_length=1, max_length=120)
    headline: str = Field(min_length=1, max_length=200)
    summary: str = Field(default=None, min_length=1, max_length=400)


class LiftReportSuggestion(StrictModel):
    """Вариант «Что изменить»: агент уже пересчитал его и прислал готовую строку."""

    id: str = Field(min_length=1, max_length=120)
    title: str = Field(min_length=1, max_length=200)
    detail: str = Field(default=None, min_length=1, max_length=300)
    tone: Literal["pass", "fail", "neutral"]
    action: LiftReportAction = None
    statusLabel: str = Field(default=None, min_length=1, max_length=80)


class LiftReportSuggestions(StrictModel):
    title: str = Field(default=None, min_length=1, max_length=120)
    items: list[LiftReportSuggestion] = Field(min_length=1)


class LiftReportInputChip(StrictModel):
    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=120)


class LiftReportInputGroup(StrictModel):
    label: str = Field(min_length=1, max_length=120)
    tone: Literal["normal", "warning"]
    chips: list[LiftReportInputChip] = Field(min_length=1)
    note: str = Field(default=None, min_length=1, max_length=500)


class LiftReportInputs(StrictModel):
    action: LiftReportAction = None
    groups: list[LiftReportInputGroup] = Field(min_length=1)


class LiftReportProtocol(StrictModel):
    meta: str = Field(default=None, min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=60000)
    # Протокол текстом в props: имя файла включает «Скачать» без ссылки на полку
    # (внешний хост MCP App), содержимое — полная простыня, иначе `content`.
    downloadFileName: str = Field(default=None, min_length=1, max_length=120)
    downloadContent: str = Field(default=None, min_length=1, max_length=120000)
    # Ссылка на ручку агента или полку chat-backend — меню форматов .md/.docx.
    downloadUrl: str = Field(default=None, min_length=1, max_length=2000)


class LiftReportProps(StrictModel):
    """Результат расчёта лифтов; обязательны только `verdict` и `inputs`."""

    verdict: LiftReportVerdict
    suggestions: LiftReportSuggestions = None
    inputs: LiftReportInputs
    protocol: LiftReportProtocol = None
