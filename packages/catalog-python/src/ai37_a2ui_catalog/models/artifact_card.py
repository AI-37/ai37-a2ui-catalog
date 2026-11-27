from __future__ import annotations

from typing import Literal

from pydantic import Field

from .shared import StrictModel

#: uuid артефакта или файла — тот же pattern, что в zod-схеме (JSON Schema сравнивается тестом).
ARTIFACT_ID_PATTERN = (
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)

ArtifactCardFormat = Literal["docx", "md"]


class ArtifactCardFile(StrictModel):
    id: str = Field(pattern=ARTIFACT_ID_PATTERN)
    fileName: str = Field(min_length=1, max_length=255)
    label: str = Field(default=None, min_length=1, max_length=80)


class ArtifactCardProps(StrictModel):
    artifactId: str = Field(pattern=ARTIFACT_ID_PATTERN)
    name: str = Field(min_length=1, max_length=200)
    kind: str = Field(default=None, min_length=1, max_length=64)
    meta: str = Field(default=None, min_length=1, max_length=200)
    summary: str = Field(default=None, min_length=1, max_length=500)
    scope: Literal["chat", "project"] = None
    formats: list[ArtifactCardFormat] = Field(default=None, max_length=2)
    files: list[ArtifactCardFile] = Field(default=None, max_length=20)
