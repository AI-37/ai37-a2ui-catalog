from __future__ import annotations

from typing import Literal

from pydantic import Field, model_validator

from .shared import StrictModel

ProposalCardState = Literal["open", "accepted", "rejected", "superseded"]
ProposalItemStatus = Literal["pending", "accepted", "rejected", "stale"]
ProposalItemKind = Literal["added", "changed", "removed"]
ProposalCardView = Literal["list", "table"]


class ProposalSourceLink(StrictModel):
    """Одна из ссылок источника, например запись голосового сообщения в документах проекта.

    Без `href` рендерер рисует подпись текстом: зритель без права открыть запись видит её имя, но не
    переходит. Правило адреса то же, что у `ProposalSource.href`.
    """

    label: str = Field(min_length=1, max_length=120)
    href: str = Field(default=None, min_length=1, max_length=2000)


class ProposalSource(StrictModel):
    """Откуда предложение (у карточки) или пункт (документ и страница): подпись, цитата, ссылка.

    Нужна подпись или цитата. `href` — только открываемый адрес (путь от корня хоста или http(s)),
    служебную ссылку агента (`project-attachment:…`) сюда не кладут. Если записей несколько, они идут
    в `links` после подписи; пустой список равен отсутствию поля.
    """

    label: str = Field(default=None, min_length=1, max_length=120)
    quote: str = Field(default=None, min_length=1, max_length=1000)
    href: str = Field(default=None, min_length=1, max_length=2000)
    links: list[ProposalSourceLink] = Field(default=None, max_length=20)

    @model_validator(mode="after")
    def validate_label_or_quote(self) -> "ProposalSource":
        if self.label is None and self.quote is None:
            raise ValueError("source needs a label or a quote")
        return self


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
    # Документ и страница пункта; без поля пункт идёт от источника всей пачки.
    source: ProposalSource = None


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
