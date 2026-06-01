from __future__ import annotations

from pydantic import Field

from .shared import StrictModel


class LatexFormulaProps(StrictModel):
    title: str = Field(default=None, min_length=1, max_length=120)
    formula: str = Field(min_length=1)
    displayMode: bool = None
    annotation: str = Field(default=None, min_length=1, max_length=240)
    bordered: bool = None
