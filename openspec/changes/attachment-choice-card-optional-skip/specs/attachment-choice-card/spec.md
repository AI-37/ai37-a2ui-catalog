## ADDED Requirements

### Requirement: Карточка без `skip` только запрашивает файл

Если в props нет `skip`, карточка SHALL рендерить одну кнопку `attach` и не рендерить кнопку «без файла»; кнопка `attach` SHALL оставаться неактивной до загрузки файла и диспатчить `{value: attach.value, fileId, fileName}`.

#### Scenario: Карточка без skip отрисована

- **WHEN** props не содержат `skip`
- **THEN** в карточке одна кнопка действия — `attach`, неактивная

#### Scenario: Файл загружен, клик по attach

- **WHEN** файл загружен и пользователь нажал `attach`
- **THEN** уходит одно действие `action` с `{value, fileId, fileName}`

### Requirement: Схема принимает props без `skip`

Схема props SHALL принимать объект без `skip`, а `skip`, если он передан, SHALL по-прежнему требовать `label` и `value`.

#### Scenario: Props без skip

- **WHEN** валидируется фикстура `attachment-choice-card-attach-only.json`
- **THEN** валидация проходит

#### Scenario: Неполный skip

- **WHEN** `skip` передан без `label`
- **THEN** валидация падает
