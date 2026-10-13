from __future__ import annotations

from pydantic import Field

from .shared import StrictModel


class AttachmentChoiceSkip(StrictModel):
    """Кнопка «продолжить без файла»: шлёт действие с `{value}`."""

    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=120)


class AttachmentChoiceAttach(StrictModel):
    """Кнопка «продолжить с файлом»: неактивна, пока файл не выбран и не загружен.

    Шлёт действие с `{value, fileId, fileName}`; `fileId` — id на полке треда
    (`chat-attachment:<fileId>`).
    """

    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=120)
    pickLabel: str = Field(min_length=1, max_length=80)
    accept: str = Field(min_length=1, max_length=200)
    hint: str = Field(default=None, min_length=1, max_length=240)


class AttachmentChoiceCardProps(StrictModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default=None, min_length=1, max_length=400)
    contextId: str = Field(min_length=1, max_length=200)
    skip: AttachmentChoiceSkip
    attach: AttachmentChoiceAttach
    action: str = Field(min_length=1, max_length=120)
