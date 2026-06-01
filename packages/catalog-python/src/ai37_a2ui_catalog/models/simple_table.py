from __future__ import annotations

from pydantic import Field, model_validator

from .shared import CellPrimitive, StrictModel, TextAlign


class SimpleTableColumn(StrictModel):
    key: str = Field(min_length=1)
    header: str = Field(min_length=1)
    align: TextAlign = None
    width: str = Field(default=None, min_length=1)


class SimpleTableRow(StrictModel):
    cells: list[CellPrimitive]


class SimpleTableProps(StrictModel):
    title: str = Field(default=None, min_length=1, max_length=120)
    caption: str = Field(default=None, min_length=1, max_length=240)
    compact: bool = None
    striped: bool = None
    columns: list[SimpleTableColumn] = Field(min_length=1)
    rows: list[SimpleTableRow]

    @model_validator(mode="after")
    def validate_row_lengths(self) -> "SimpleTableProps":
        expected = len(self.columns)
        for index, row in enumerate(self.rows):
            if len(row.cells) != expected:
                raise ValueError(f"Row {index} must contain exactly {expected} cells.")
        return self
