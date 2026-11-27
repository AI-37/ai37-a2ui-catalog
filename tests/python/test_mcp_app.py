from __future__ import annotations

import json
from pathlib import Path

import pytest

from ai37_a2ui_catalog import mcp_app
from ai37_a2ui_catalog.mcp_app import (
    A2UI_META_KEY,
    a2ui_app_result,
    a2ui_resource_result,
    parse_resource_action_name,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
# Та же фикстура, что у TS-пары (tests/mcp-app/a2ui-app-result.test.ts): формат один на оба языка.
FIXTURE = json.loads(
    (REPO_ROOT / "tests" / "mcp-app" / "a2ui-app-result.fixture.json").read_text(encoding="utf-8")
)


def fixture_result() -> dict:
    data = FIXTURE["input"]
    return a2ui_app_result(
        text=data["text"],
        node=data["node"],
        surface_id=data["surfaceId"],
        action_tool=data["actionTool"],
        state=data["state"],
    )


def test_a2ui_app_result_matches_protocol_byte_for_byte_with_ts():
    result = fixture_result()

    assert result == FIXTURE["expected"]
    assert json.dumps(result, ensure_ascii=False) == json.dumps(FIXTURE["expected"], ensure_ascii=False)
    assert list(result["_meta"][A2UI_META_KEY]) == ["version", "messages", "surfaceId", "state", "actionTool"]


def test_content_carries_only_text_not_form_json():
    props = json.loads(
        (REPO_ROOT / "fixtures" / "valid" / "lift-editor-per-lift.json").read_text(encoding="utf-8")
    )["props"]
    result = a2ui_app_result(
        text="Форма открыта.",
        node={"component": "LiftEditorNext", "props": props},
        surface_id="lift",
        action_tool="lift_form_action",
    )

    assert result["content"] == [{"type": "text", "text": "Форма открыта."}]
    assert "methodConfigs" not in json.dumps(result["content"])
    assert "methodConfigs" in json.dumps(result["_meta"])


def test_draft_result_has_empty_stream_and_null_state():
    result = a2ui_app_result(text="", messages=[], surface_id="lift", action_tool="act")

    assert result["_meta"][A2UI_META_KEY] == {
        "version": 1,
        "messages": [],
        "surfaceId": "lift",
        "state": None,
        "actionTool": "act",
    }


def test_node_and_messages_are_mutually_exclusive():
    with pytest.raises(ValueError):
        a2ui_app_result(text="", surface_id="s", action_tool="a")
    with pytest.raises(ValueError):
        a2ui_app_result(
            text="", surface_id="s", action_tool="a", messages=[], node={"component": "X", "props": {}}
        )


def test_resource_result_and_action_name():
    body = {"variants": [{"id": "v1"}]}

    assert a2ui_resource_result(body) == {
        "content": [{"type": "text", "text": ""}],
        "_meta": {A2UI_META_KEY: {"version": 1, "resource": body}},
    }
    assert parse_resource_action_name("resource:lift-recommend") == "lift-recommend"
    assert parse_resource_action_name("resource:") is None
    assert parse_resource_action_name("calc") is None


def test_html_is_the_built_view():
    built = REPO_ROOT / "packages" / "mcp-app-view" / "dist" / "a2ui-mcp-app.html"

    assert mcp_app.html() == built.read_text(encoding="utf-8")
    assert mcp_app.html().lstrip().lower().startswith("<!doctype html>")
