# VerificationReport: вердикт проверки контрагента с раскрытием каждой проверки

## Why

Агент Минстроя отдаёт вердикт `verify_single` markdown-списком: у пройденной
проверки — галочка и название, без основания. Отзыв проверяющего от
05.10.2026 (ИНН 7203350660, вердикт `needs_review`): «а можно сделать раскрытие
каждой строки, например профильный оквэд, финансовая отчетность». Данные для
раскрытия у агента есть (`StepResult.details`), показать их нечем: в каталоге
нет компонента со списком раскрываемых строк проверки.

План: AI-37/docs `plans/minstroy-verification-report-a2ui.md` (PR #470, влит
12.10.2026). Идея: Notion `3f2a34ceee6081d49d57c7aeb53549ad`.

## What Changes

- **Новый компонент `VerificationReport`** (аддитивно, каталог v2, пакеты
  0.39.3 → 0.40.0). Props: `verdict {status: pass|fail|warning, badge,
  headline, summary?}`, `checks [{id, label, status: pass|fail|warning|error|skipped,
  summary?, details?: [{label, value}], sources?: [{label, url?}]}]`, `note?`.
- **Новых примитивов нет.** Инвентаризация:
  - закрыто набором — `ReportNextVerdictSection` (шапка), `ReportNextSection`
    (подпись «Проверки»), `CardHeader`/`CardBody`/`cardClassName`/`buttonClassName`/
    `ChevronIcon` (рама строки и кнопка-раскрывашка — те же классы, что у
    `SectionItem`), `ReportRowDetail` (основание), `StatusPill`, `ReportNote`
    (пояснение без проверок);
  - из библиотеки — `Accordion` Base UI (`multiple`): клавиатура,
    `aria-expanded`, `aria-controls`;
  - нового — 0 примитивов. Своё у рендерера — заголовок строки в две строки,
    панель деталей (`<dl>` «подпись — значение») и строка источников. Почему
    не `SectionItem` целиком — design, решение 8.
- **Тип `ReportNextVerdict` расширен до `pass | fail | warning`** — тип секции,
  не схемы: `ThermalReport`, `LiftReport`, `KeoReport` по-прежнему шлют
  `pass | fail`.
- Python-зеркало `VerificationReportProps` — эмитент Python-агент (minstroy).
- Фикстуры: 3 valid (спорный случай на 8 проверок, точечная на 1, вердикт без
  проверок), 2 invalid; тесты: 6 схемных, 8 рендерных, 5 Python (+ сверка
  JSON Schema с Pydantic); два превью в demo.

## Capabilities

### New Capabilities

- `verification-report` — карточка результата проверки контрагента.

## Impact

- Контракт каталога: +1 компонент, старые схемы не меняются.
- Потребители: `minstroy` (эмитент, Python-модель, пин `>=0.40.0`), `spai-ui`
  (рендер, бамп `^0.40.0`). `spai-chat-backend` не трогается — дерево агента
  проходит как есть.
