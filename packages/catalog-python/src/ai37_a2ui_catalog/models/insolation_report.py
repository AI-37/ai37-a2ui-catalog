from __future__ import annotations

from typing import Annotated, Literal

from pydantic import Field, model_validator

from .shared import StrictModel

# Минуты от полуночи: 0 — 00:00, 1440 — 24:00.
MinuteOfDay = Annotated[int, Field(ge=0, le=1440)]


class InsolationReportAction(StrictModel):
    """Действие карточки отчёта; имена действий выбирает агент."""

    name: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=80)
    payload: dict[str, Annotated[str, Field(max_length=200)]] = None


class InsolationReportVerdict(StrictModel):
    status: Literal["pass", "fail"]
    badge: str = Field(min_length=1, max_length=120)
    headline: str = Field(min_length=1, max_length=200)
    summary: str = Field(default=None, min_length=1, max_length=400)


class InsolationTimelineTick(StrictModel):
    at: MinuteOfDay
    label: str = Field(min_length=1, max_length=20)


class InsolationTimelineSegment(StrictModel):
    """Сегмент полосы; минуты — единственные числа схемы (нужны для пропорций)."""

    from_: MinuteOfDay = Field(alias="from")
    to: MinuteOfDay
    kind: Literal["sun", "shadow"]
    label: str = Field(default=None, min_length=1, max_length=80)


class InsolationTimeline(StrictModel):
    title: str = Field(min_length=1, max_length=160)
    axisStart: MinuteOfDay
    axisEnd: MinuteOfDay
    ticks: list[InsolationTimelineTick] = Field(min_length=2)
    segments: list[InsolationTimelineSegment] = Field(min_length=1)


class InsolationReportCheck(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    detail: str = Field(default=None, min_length=1, max_length=300)
    status: Literal["pass", "fail", "info"]
    action: InsolationReportAction = None


class InsolationReportInputChip(StrictModel):
    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=120)


class InsolationReportInputGroup(StrictModel):
    label: str = Field(min_length=1, max_length=120)
    tone: Literal["normal", "warning"]
    chips: list[InsolationReportInputChip] = Field(min_length=1)
    note: str = Field(default=None, min_length=1, max_length=500)


class InsolationReportInputs(StrictModel):
    action: InsolationReportAction = None
    groups: list[InsolationReportInputGroup] = Field(min_length=1)


class InsolationReportProtocol(StrictModel):
    meta: str = Field(default=None, min_length=1, max_length=200)
    # Краткий вывод расчёта — в UI не показывается, только скачивается.
    content: str = Field(min_length=1, max_length=60000)
    # Без имени файла кнопки «Скачать» нет.
    downloadFileName: str = Field(default=None, min_length=1, max_length=120)
    downloadContent: str = Field(default=None, min_length=1, max_length=120000)


class InsolationReportProps(StrictModel):
    """Результат расчёта инсоляции; обязательны только `verdict` и `inputs`."""

    verdict: InsolationReportVerdict
    timeline: InsolationTimeline = None
    checks: list[InsolationReportCheck] = Field(default=None, min_length=1)
    assumptions: list[Annotated[str, Field(min_length=1, max_length=300)]] = Field(
        default=None, min_length=1
    )
    inputs: InsolationReportInputs
    protocol: InsolationReportProtocol = None

    @model_validator(mode="after")
    def validate_timeline(self) -> "InsolationReportProps":
        timeline = self.timeline
        if timeline is None:
            return self

        if timeline.axisEnd <= timeline.axisStart:
            raise ValueError("timeline.axisEnd must be greater than timeline.axisStart")

        for segment in timeline.segments:
            if segment.to <= segment.from_:
                raise ValueError('segment "to" must be greater than "from"')

        # Стык (`to` == `from` соседа) разрешён — это соседние солнце и тень.
        ordered = sorted(timeline.segments, key=lambda segment: segment.from_)
        for previous, current in zip(ordered, ordered[1:]):
            if current.from_ < previous.to:
                raise ValueError("timeline segments must not overlap")

        return self
