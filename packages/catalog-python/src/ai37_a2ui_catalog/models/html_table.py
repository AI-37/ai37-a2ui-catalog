from __future__ import annotations

from pydantic import Field

from .shared import StrictModel


class HtmlTableProps(StrictModel):
    html: str = Field(min_length=1)
    title: str = Field(default=None, min_length=1, max_length=120)
    caption: str = Field(default=None, min_length=1, max_length=240)
    sourceCode: str = Field(default=None, min_length=1, max_length=120)
    sourceTitle: str = Field(default=None, min_length=1, max_length=240)
