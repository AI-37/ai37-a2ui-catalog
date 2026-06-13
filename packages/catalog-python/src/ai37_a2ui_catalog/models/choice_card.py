from __future__ import annotations

from pydantic import Field

from .shared import StrictModel


class ChoiceOption(StrictModel):
    label: str = Field(min_length=1, max_length=120)
    value: str = Field(min_length=1, max_length=120)
    description: str = Field(default=None, min_length=1, max_length=240)


class ChoiceCardSubmit(StrictModel):
    label: str = Field(min_length=1, max_length=80)
    action: str = Field(min_length=1, max_length=120)


class ChoiceCardProps(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default=None, min_length=1, max_length=240)
    multiple: bool = None
    choices: list[ChoiceOption] = Field(min_length=1)
    submit: ChoiceCardSubmit = None
