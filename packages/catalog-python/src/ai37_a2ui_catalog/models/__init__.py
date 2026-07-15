from .choice_card import ChoiceCardProps, ChoiceCardSubmit, ChoiceOption
from .flex_table import FlexTableCell, FlexTableProps, FlexTableRow
from .form_card import (
    FormCardProps,
    FormCardSubmit,
    FormField,
    FormFieldLookupValue,
    FormFieldType,
    LookupSuggestMode,
)
from .html_table import HtmlTableProps
from .latex_formula import LatexFormulaProps
from .shared import CellPrimitive, StrictModel, TextAlign
from .simple_table import SimpleTableColumn, SimpleTableProps, SimpleTableRow

COMPONENT_MODELS = {
    "SimpleTable": SimpleTableProps,
    "FlexTable": FlexTableProps,
    "HtmlTable": HtmlTableProps,
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
    "FormFieldLookupValue",
    "FormFieldType",
    "HtmlTableProps",
    "LatexFormulaProps",
    "LookupSuggestMode",
    "SimpleTableColumn",
    "SimpleTableProps",
    "SimpleTableRow",
    "StrictModel",
    "TextAlign",
]
