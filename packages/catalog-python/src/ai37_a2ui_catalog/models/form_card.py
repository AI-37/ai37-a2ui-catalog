from __future__ import annotations

from typing import Literal

from pydantic import Field, model_validator

from .shared import StrictModel

FormFieldType = Literal["text", "number", "select", "boolean", "lookup"]


class FormFieldLookupValue(StrictModel):
    value: str
    label: str


class FormField(StrictModel):
    name: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    type: FormFieldType
    required: bool = None
    options: list[str] = Field(default=None, min_length=1)
    referenceId: str = Field(default=None, min_length=1, max_length=80)
    minChars: int = Field(default=None, ge=1, le=10)
    placeholder: str = Field(default=None, min_length=1, max_length=120)
    defaultValue: str | int | float | bool | FormFieldLookupValue = None

    @model_validator(mode="after")
    def validate_lookup_reference(self) -> "FormField":
        if self.type == "lookup" and not isinstance(self.referenceId, str):
            raise ValueError('referenceId is required when type is "lookup"')
        return self


class FormCardSubmit(StrictModel):
    label: str = Field(min_length=1, max_length=80)
    action: str = Field(min_length=1, max_length=120)


class FormCardProps(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default=None, min_length=1, max_length=240)
    fields: list[FormField] = Field(min_length=1)
    submit: FormCardSubmit
