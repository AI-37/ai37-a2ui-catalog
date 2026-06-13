from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from ai37_a2ui_catalog import get_component_schema


REPO_ROOT = Path(__file__).resolve().parents[2]
COMPONENT_NAMES = ("SimpleTable", "FlexTable", "LatexFormula", "ChoiceCard", "FormCard")


def load_exported_schema(component: str) -> dict[str, Any]:
    completed = subprocess.run(
        [
            "pnpm",
            "exec",
            "tsx",
            "packages/catalog-schemas/src/generate-artifacts.ts",
            "--component",
            component,
        ],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


def resolve_local_ref(root: dict[str, Any], ref: str) -> Any:
    node: Any = root
    for part in ref.removeprefix("#/").split("/"):
        node = node[part]
    return node


def normalize_schema(schema: Any, root: dict[str, Any] | None = None) -> Any:
    if root is None and isinstance(schema, dict):
        root = schema

    if isinstance(schema, dict):
        if "$ref" in schema and isinstance(schema["$ref"], str) and schema["$ref"].startswith("#/") and root is not None:
            resolved = resolve_local_ref(root, schema["$ref"])
            merged = {
                **resolved,
                **{key: value for key, value in schema.items() if key not in {"$ref", "definitions", "$defs", "$schema"}},
            }
            return normalize_schema(merged, root)

        normalized: dict[str, Any] = {}
        for key, value in schema.items():
            if key in {"$schema", "$id", "definitions", "$defs", "title", "description", "default"}:
                continue
            normalized[key] = normalize_schema(value, root)

        if "required" in normalized and isinstance(normalized["required"], list):
            normalized["required"] = sorted(normalized["required"])

        if "properties" in normalized and isinstance(normalized["properties"], dict):
            normalized["properties"] = {
                key: normalized["properties"][key]
                for key in sorted(normalized["properties"])
            }

        if "type" in normalized and isinstance(normalized["type"], list):
            if "number" in normalized["type"] and "integer" in normalized["type"]:
                normalized["type"] = [
                    schema_type for schema_type in normalized["type"]
                    if schema_type != "integer"
                ]
            normalized["type"] = sorted(normalized["type"])

        if "enum" in normalized and isinstance(normalized["enum"], list):
            normalized["enum"] = sorted(normalized["enum"])

        if "anyOf" in normalized and isinstance(normalized["anyOf"], list):
            variants = normalized["anyOf"]
            simple_types = []
            complex_variants = []
            for variant in variants:
                if isinstance(variant, dict) and set(variant.keys()) == {"type"} and isinstance(variant["type"], str):
                    simple_types.append(variant["type"])
                else:
                    complex_variants.append(variant)

            if simple_types and not complex_variants:
                normalized.pop("anyOf")
                if "number" in simple_types and "integer" in simple_types:
                    simple_types = [schema_type for schema_type in simple_types if schema_type != "integer"]
                normalized["type"] = sorted(simple_types)
            else:
                normalized["anyOf"] = sorted(
                    complex_variants,
                    key=lambda item: json.dumps(item, sort_keys=True),
                )

        return normalized

    if isinstance(schema, list):
        return [normalize_schema(item, root) for item in schema]

    return schema


def test_exported_json_schemas_match_pydantic_models() -> None:
    for component in COMPONENT_NAMES:
        js_schema = normalize_schema(load_exported_schema(component))
        python_schema = normalize_schema(get_component_schema(component))
        assert python_schema == js_schema
