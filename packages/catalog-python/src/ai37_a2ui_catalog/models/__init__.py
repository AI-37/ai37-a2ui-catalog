from .flex_table import FlexTableCell, FlexTableProps, FlexTableRow
from .latex_formula import LatexFormulaProps
from .shared import CellPrimitive, StrictModel, TextAlign
from .simple_table import SimpleTableColumn, SimpleTableProps, SimpleTableRow

COMPONENT_MODELS = {
    "SimpleTable": SimpleTableProps,
    "FlexTable": FlexTableProps,
    "LatexFormula": LatexFormulaProps,
}

__all__ = [
    "COMPONENT_MODELS",
    "CellPrimitive",
    "FlexTableCell",
    "FlexTableProps",
    "FlexTableRow",
    "LatexFormulaProps",
    "SimpleTableColumn",
    "SimpleTableProps",
    "SimpleTableRow",
    "StrictModel",
    "TextAlign",
]
