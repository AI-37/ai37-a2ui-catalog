from __future__ import annotations

from typing import Any, Literal

from pydantic import Field

from .calc_editor_common import CalcCondition, CalcEditorField, CalcFieldSource, CalcSubmit
from .shared import StrictModel


class InsolationPoint(StrictModel):
    """Значения одной расчётной точки (окна) плюс источники этих значений."""

    name: str = Field(default=None, min_length=1, max_length=120)
    values: dict[str, Any]
    sources: dict[str, CalcFieldSource] = None


class InsolationBuilding(StrictModel):
    """Строка затеняющего здания; список общий для всех расчётных точек."""

    values: dict[str, Any]
    sources: dict[str, CalcFieldSource] = None


class InsolationNotice(StrictModel):
    """Плашка-предупреждение секции: текст приходит от агента."""

    text: str = Field(min_length=1, max_length=400)
    tone: Literal["warning", "info"] = None


class InsolationPointTemplate(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    fields: list[CalcEditorField] = Field(min_length=1)


class InsolationEditorProps(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    meta: str = Field(default=None, min_length=1, max_length=200)
    conditions: list[CalcCondition] = Field(min_length=1)
    pointTemplate: InsolationPointTemplate
    points: list[InsolationPoint] = Field(min_length=1)
    pointLabel: str = Field(min_length=1, max_length=80)
    addPointLabel: str = Field(min_length=1, max_length=80)
    removePointLabel: str = Field(min_length=1, max_length=80)
    maxPoints: int = Field(default=None, ge=1, le=24)
    buildingsTitle: str = Field(min_length=1, max_length=120)
    buildingFields: list[CalcEditorField] = Field(min_length=1)
    # Пустой список — валидное состояние «застройки нет».
    buildings: list[InsolationBuilding]
    addBuildingLabel: str = Field(min_length=1, max_length=80)
    removeBuildingLabel: str = Field(min_length=1, max_length=80)
    maxBuildings: int = Field(default=None, ge=1, le=32)
    notices: list[InsolationNotice] = Field(default=None, min_length=1)
    sourcesLabel: str = Field(default=None, min_length=1, max_length=80)
    submit: CalcSubmit
