from __future__ import annotations

from typing import Literal

from pydantic import Field

from .shared import StrictModel

FormFieldType = Literal["text", "number", "select", "boolean"]


class FormField(StrictModel):
    name: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    type: FormFieldType
    required: bool = None
    options: list[str] = Field(default=None, min_length=1)
    placeholder: str = Field(default=None, min_length=1, max_length=120)
    defaultValue: str | int | float | bool = None


class FormCardSubmit(StrictModel):
    label: str = Field(min_length=1, max_length=80)
    action: str = Field(min_length=1, max_length=120)


class FormCardProps(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default=None, min_length=1, max_length=240)
    fields: list[FormField] = Field(min_length=1)
    submit: FormCardSubmit
