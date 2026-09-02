from __future__ import annotations

from typing import Annotated

from pydantic import Field

from .shared import StrictModel

# Единицы фиксированы схемой: линейные размеры — метры, углы — градусы.
# Готовых строк, пикселей и разметки в модели нет — форматирует рендерер.

# Положительный линейный размер, м.
DrawingSize = Annotated[float, Field(ge=0.01, le=200)]

# Высота от уровня пола, м (подоконник у пола — 0).
DrawingLevel = Annotated[float, Field(ge=0, le=200)]

# Знаковое смещение вдоль оси, м.
DrawingOffset = Annotated[float, Field(ge=-200, le=200)]

# Угол возвышения над горизонтом из расчётной точки, град.
ElevationDeg = Annotated[float, Field(ge=-89.9, le=89.9)]

# Азимут от оси характерного разреза на плане, град.
AzimuthDeg = Annotated[float, Field(ge=-89.9, le=89.9)]

# Азимут луча веера графика II, град: половина веера, 0 ≤ ψ < 90.
RayAngleDeg = Annotated[float, Field(ge=0, le=89.9)]

# Число лучей графика (n₁, n₂) — до 100 у бесконечно широкого проёма.
RayCount = Annotated[float, Field(ge=0, le=100)]


class KeoDrawingPoint(StrictModel):
    """Расчётная точка на разрезе: от внутренней грани оконной стены и от пола."""

    lt: DrawingSize
    height: DrawingLevel


class KeoDrawingOpposing(StrictModel):
    """Противостоящая застройка — только для подписи β-луча."""

    distance: DrawingSize
    height: DrawingSize


class KeoSectionDrawing(StrictModel):
    """Разрез по помещению: начало координат — пол на внутренней грани стены."""

    roomDepth: DrawingSize
    roomHeight: DrawingSize
    wallThickness: DrawingSize
    sillHeight: DrawingLevel
    windowTop: DrawingSize
    point: KeoDrawingPoint
    # α — верх проёма из расчётной точки.
    alphaDeg: ElevationDeg
    # β — верх застройки; нет застройки — нет поля.
    betaDeg: ElevationDeg = None
    opposing: KeoDrawingOpposing = None
    # Видно ли небо из расчётной точки: False — сектор не рисуется.
    skyVisible: bool
    # n₁ по графику I; при перекрытом небе поля нет.
    n1: RayCount = None


class KeoDrawingWindow(StrictModel):
    """Светопроём на плане: ширина и смещение центра от оси расчётной точки."""

    width: DrawingSize
    offset: DrawingOffset


class KeoDrawingPlanPoint(StrictModel):
    """Расчётная точка на плане: от внутренней грани оконной стены."""

    lt: DrawingSize


class KeoPlanDrawing(StrictModel):
    """План помещения: ось Y — характерный разрез, вглубь помещения."""

    roomWidth: DrawingSize
    roomDepth: DrawingSize
    wallThickness: DrawingSize
    window: KeoDrawingWindow
    point: KeoDrawingPlanPoint
    # θ — верх проёма из расчётной точки в характерном разрезе.
    thetaDeg: ElevationDeg
    # Азимуты лучей графика II: ψ_k, при которых K(ψ_k; θ) = k, k = 1…49 —
    # одна половина веера. Закон зависит от θ и живёт у агента.
    fanRayAnglesDeg: list[RayAngleDeg] = Field(min_length=1, max_length=49)
    # Края сектора через проём: знак — сторона от оси разреза.
    psi1Deg: AzimuthDeg
    psi2Deg: AzimuthDeg
    n2: RayCount = None


class KeoDrawings(StrictModel):
    """Две проекции одного помещения — порознь чертёж не читается."""

    section: KeoSectionDrawing
    plan: KeoPlanDrawing
