"""Протокол «A2UI внутри MCP App» для Python-агентов — пара к npm `@ai37/a2ui-mcp-app`.

Поверхность едет в `_meta["ai37/a2ui"]` результата инструмента, а не в
`structuredContent`: хост без UI отдаёт модели `structuredContent` вместо `content`,
и модель получила бы весь JSON формы. Формат и имена ключей совпадают с TS-пакетом
байт в байт — их проверяет общий тест с фикстурой.
"""

from __future__ import annotations

from functools import cache
from importlib.resources import files
from typing import Any

from ..constants import CATALOG_ID

A2UI_META_KEY = "ai37/a2ui"
A2UI_APP_PROTOCOL_VERSION = 1
# Ресурсный канал view (справочники, подбор): действие `resource:<id>` тем же actionTool.
A2UI_RESOURCE_ACTION_PREFIX = "resource:"
A2UI_MCP_APP_HTML_FILE = "a2ui-mcp-app.html"


@cache
def html() -> str:
    """Однофайловый HTML view (MIME `text/html;profile=mcp-app`) — тот же файл, что в npm-пакете."""
    return files(__package__).joinpath(A2UI_MCP_APP_HTML_FILE).read_text(encoding="utf-8")


def a2ui_surface_messages(
    node: dict[str, Any], surface_id: str, catalog_id: str = CATALOG_ID
) -> list[dict[str, Any]]:
    """Один узел `{component, props}` → поток A2UI v0.9: `createSurface` и `updateComponents`."""
    return [
        {"version": "v0.9", "createSurface": {"surfaceId": surface_id, "catalogId": catalog_id}},
        {
            "version": "v0.9",
            "updateComponents": {
                "surfaceId": surface_id,
                "components": [{"id": "root", "component": node["component"], **node["props"]}],
            },
        },
    ]


def a2ui_app_result(
    *,
    text: str,
    surface_id: str,
    action_tool: str,
    node: dict[str, Any] | None = None,
    messages: list[dict[str, Any]] | None = None,
    state: Any = None,
    catalog_id: str = CATALOG_ID,
) -> dict[str, Any]:
    """Результат инструмента с view: текст для модели в `content`, поверхность в `_meta`.

    Передаётся ровно одно из `node` (корневой узел) и `messages` (готовый поток,
    пустой — ответ на черновик). В `_meta` всегда все пять полей протокола.
    """
    if (node is None) == (messages is None):
        raise ValueError("a2ui_app_result: нужен ровно один из node и messages")
    stream = a2ui_surface_messages(node, surface_id, catalog_id) if node is not None else messages
    return {
        "content": [{"type": "text", "text": text}],
        "_meta": {
            A2UI_META_KEY: {
                "version": A2UI_APP_PROTOCOL_VERSION,
                "messages": stream,
                "surfaceId": surface_id,
                "state": state,
                "actionTool": action_tool,
            }
        },
    }


def a2ui_resource_result(resource: Any, text: str = "") -> dict[str, Any]:
    """Ответ на `resource:<id>`: `resource` — то же тело, что отдала бы ручка `/api/agent-resource`."""
    return {
        "content": [{"type": "text", "text": text}],
        "_meta": {A2UI_META_KEY: {"version": A2UI_APP_PROTOCOL_VERSION, "resource": resource}},
    }


def parse_resource_action_name(name: str) -> str | None:
    """`resource:<id>` → `<id>`; обычное действие поверхности — `None`."""
    if not name.startswith(A2UI_RESOURCE_ACTION_PREFIX):
        return None
    resource_id = name[len(A2UI_RESOURCE_ACTION_PREFIX) :]
    return resource_id or None


__all__ = [
    "A2UI_APP_PROTOCOL_VERSION",
    "A2UI_MCP_APP_HTML_FILE",
    "A2UI_META_KEY",
    "A2UI_RESOURCE_ACTION_PREFIX",
    "a2ui_app_result",
    "a2ui_resource_result",
    "a2ui_surface_messages",
    "html",
    "parse_resource_action_name",
]
