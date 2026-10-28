from __future__ import annotations

from typing import Literal

from pydantic import Field

from .shared import StrictModel

ProposalCardState = Literal["open", "accepted", "rejected", "superseded"]
ProposalItemStatus = Literal["pending", "accepted", "rejected", "stale"]
ProposalItemKind = Literal["added", "changed", "removed"]
ProposalCardView = Literal["list", "table"]


class ProposalItem(StrictModel):
    """Пункт пачки: «Что · Было · Станет · С какой даты»; значения — готовые строки."""

    id: str = Field(min_length=1, max_length=120)
    kind: ProposalItemKind
    label: str = Field(min_length=1, max_length=200)
    before: str = Field(default=None, min_length=1, max_length=200)
    after: str = Field(default=None, min_length=1, max_length=200)
    effectiveFrom: str = Field(default=None, min_length=1, max_length=40)
    # Без поля пункт ждёт решения (`pending`); `stale` агент вычисляет по ревизии цели.
    status: ProposalItemStatus = None


class ProposalSource(StrictModel):
    """Откуда предложение: подпись и цитата."""

    label: str = Field(default=None, min_length=1, max_length=120)
    quote: str = Field(min_length=1, max_length=1000)


class ProposalConfirm(StrictModel):
    """Кнопка подтверждения: шлёт `action` с контекстом `{proposalId, decision: "accept"}`."""

    label: str = Field(min_length=1, max_length=80)
    action: str = Field(min_length=1, max_length=120)


class ProposalDecideLink(StrictModel):
    """Ссылка на «Требуют решения» вместо кнопки, когда живой задачи у агента нет."""

    label: str = Field(min_length=1, max_length=120)
    href: str = Field(min_length=1, max_length=2000)


class ProposalCardProps(StrictModel):
    """Карточка подтверждения пачки предложений агента."""

    proposalId: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=120)
    state: ProposalCardState
    view: ProposalCardView = None
    items: list[ProposalItem] = Field(min_length=1, max_length=50)
    source: ProposalSource = None
    note: str = Field(default=None, min_length=1, max_length=400)
    confirm: ProposalConfirm = None
    # `False` — у зрителя нет права решать: ни кнопки, ни ссылки.
    canDecide: bool = None
    decideLink: ProposalDecideLink = None
