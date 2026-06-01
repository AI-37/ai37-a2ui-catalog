from __future__ import annotations

from typing import Any

from .models import COMPONENT_MODELS


def validate_component_payload(component: str, payload: dict[str, Any]):
    model = COMPONENT_MODELS[component]
    return model.model_validate(payload)


def validate_component_payload_json(component: str, payload_json: str):
    model = COMPONENT_MODELS[component]
    return model.model_validate_json(payload_json)


def get_component_schema(component: str) -> dict[str, Any]:
    return COMPONENT_MODELS[component].model_json_schema()
