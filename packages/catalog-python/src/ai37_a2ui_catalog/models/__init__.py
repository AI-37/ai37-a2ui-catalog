from .choice_card import ChoiceCardProps, ChoiceCardSubmit, ChoiceOption
from .flex_table import FlexTableCell, FlexTableProps, FlexTableRow
from .form_card import FormCardProps, FormCardSubmit, FormField, FormFieldType
from .latex_formula import LatexFormulaProps
from .shared import CellPrimitive, StrictModel, TextAlign
from .simple_table import SimpleTableColumn, SimpleTableProps, SimpleTableRow

COMPONENT_MODELS = {
    "SimpleTable": SimpleTableProps,
    "FlexTable": FlexTableProps,
    "LatexFormula": LatexFormulaProps,
    "ChoiceCard": ChoiceCardProps,
    "FormCard": FormCardProps,
}

__all__ = [
    "COMPONENT_MODELS",
    "CellPrimitive",
    "ChoiceCardProps",
    "ChoiceCardSubmit",
    "ChoiceOption",
    "FlexTableCell",
    "FlexTableProps",
    "FlexTableRow",
    "FormCardProps",
    "FormCardSubmit",
    "FormField",
    "FormFieldType",
    "LatexFormulaProps",
    "SimpleTableColumn",
    "SimpleTableProps",
    "SimpleTableRow",
    "StrictModel",
    "TextAlign",
]
