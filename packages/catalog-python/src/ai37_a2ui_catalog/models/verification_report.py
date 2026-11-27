from __future__ import annotations

from typing import Literal

from pydantic import Field

from .shared import StrictModel

VerificationReportCheckStatus = Literal["pass", "fail", "warning", "error", "skipped"]


class VerificationReportVerdict(StrictModel):
    """Вердикт проверки контрагента; `warning` — «требует дополнительной проверки»."""

    status: Literal["pass", "fail", "warning"]
    badge: str = Field(min_length=1, max_length=120)
    headline: str = Field(min_length=1, max_length=200)
    summary: str = Field(default=None, min_length=1, max_length=400)


class VerificationReportDetail(StrictModel):
    """Ключевое значение проверки — готовая строка от агента."""

    label: str = Field(min_length=1, max_length=80)
    value: str = Field(min_length=1, max_length=600)


class VerificationReportSource(StrictModel):
    label: str = Field(min_length=1, max_length=120)
    # Ссылкой рендерер делает только http(s); без url — подпись без ссылки.
    url: str = Field(default=None, min_length=1, max_length=2000)


class VerificationReportCheck(StrictModel):
    """Строка проверки; раскрывается, только если есть `details` или `sources`."""

    id: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    status: VerificationReportCheckStatus
    summary: str = Field(default=None, min_length=1, max_length=400)
    details: list[VerificationReportDetail] = Field(default=None, min_length=1, max_length=16)
    sources: list[VerificationReportSource] = Field(default=None, min_length=1, max_length=8)


class VerificationReportProps(StrictModel):
    """Результат проверки контрагента: вердикт и список проверок."""

    verdict: VerificationReportVerdict
    checks: list[VerificationReportCheck] = Field(max_length=30)
    note: str = Field(default=None, min_length=1, max_length=1000)
