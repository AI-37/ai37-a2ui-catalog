from __future__ import annotations

from typing import Literal

from pydantic import Field, model_validator

from .shared import StrictModel, TextAlign


class FlexTableCell(StrictModel):
    content: str = Field(min_length=1)
    align: TextAlign = None
    colSpan: int = Field(default=None, ge=1)
    rowSpan: int = Field(default=None, ge=1)
    emphasis: Literal["normal", "muted", "strong"] = None


class FlexTableRow(StrictModel):
    cells: list[FlexTableCell] = Field(min_length=1)


def validate_header_grid(rows: list[FlexTableRow]) -> int:
    total_columns = sum(cell.colSpan or 1 for cell in rows[0].cells)
    active_spans = [0] * total_columns

    for row_index, row in enumerate(rows):
        if row_index > 0:
            active_spans = [max(0, span - 1) for span in active_spans]

        column_index = 0

        for cell in row.cells:
            while column_index < total_columns and active_spans[column_index] > 0:
                column_index += 1

            col_span = cell.colSpan or 1
            row_span = cell.rowSpan or 1

            if column_index + col_span > total_columns:
                raise ValueError(f"Header row {row_index} exceeds the available column span.")

            if any(active_spans[column_index + offset] > 0 for offset in range(col_span)):
                raise ValueError(f"Header row {row_index} overlaps an active rowSpan.")

            for offset in range(col_span):
                active_spans[column_index + offset] = row_span

            column_index += col_span

        if any(span == 0 for span in active_spans):
            raise ValueError(f"Header row {row_index} does not fully cover the table width.")

    return total_columns


class FlexTableProps(StrictModel):
    title: str = Field(default=None, min_length=1, max_length=120)
    caption: str = Field(default=None, min_length=1, max_length=240)
    dense: bool = None
    headerRows: list[FlexTableRow] = Field(min_length=1)
    bodyRows: list[FlexTableRow] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_row_spans(self) -> "FlexTableProps":
        expected = validate_header_grid(self.headerRows)

        for index, row in enumerate(self.bodyRows):
            width = sum(cell.colSpan or 1 for cell in row.cells)
            if width != expected:
                raise ValueError(f"Body row {index} has inconsistent total span.")

        return self
