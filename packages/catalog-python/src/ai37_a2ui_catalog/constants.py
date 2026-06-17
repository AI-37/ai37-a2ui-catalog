from __future__ import annotations

CATALOG_SLUG = "ai37-a2ui"
CATALOG_VERSION = "v1"
# Хостинг каталога — GitHub Pages проекта AI-37/ai37-a2ui-catalog (см. constants.ts).
CATALOG_BASE_URL = (
    f"https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/{CATALOG_SLUG}/{CATALOG_VERSION}"
)
CATALOG_ID = f"{CATALOG_BASE_URL}/catalog.json"
# Id базового каталога A2UI (basicCatalog @a2ui) — для content-negotiation вывода
# (MIME application/vnd.a2ui+json → base). См. constants.ts.
A2UI_BASE_CATALOG_ID = "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json"
