from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


TextAlign = Literal["start", "center", "end"]
CellPrimitive = str | int | float | bool | None
