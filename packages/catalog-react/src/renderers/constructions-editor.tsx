import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {
  constructionsEditorDefinition,
  type ConstructionEntry,
  type ConstructionsGeneral,
} from '@ai37/a2ui-catalog-schemas';
import {climateKey} from './climate-key';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorCard} from './constructions-editor-card';
import {ConstructionsEditorConditions} from './constructions-editor-conditions';
import {
  CONSTRUCTIONS_EDITOR_CSS,
  CONSTRUCTIONS_EDITOR_STYLE_HREF,
} from './constructions-editor-styles';
import type {
  ConstructionsEditorFormTarget,
  ConstructionsGeneralKey,
} from './constructions-editor.types';
import {createGeneralState} from './create-general-state';
import {createLocalId} from './create-local-id';
import {omitTouchedSources} from './omit-touched-sources';
import {StyleTag} from './style-tag';
import {useA2uiBaseStyles} from './shared';

/**
 * Экран теплотехнического расчёта одним сообщением: блок «Условия» в шапке и
 * конструкции сразу под ним, с общим локальным состоянием (Решения 1—8
 * design.md). Вкладок нет — оба блока видны сразу; условия сворачиваются в
 * строку-сводку, и это переключение чисто клиентское: наружу не уезжает
 * ничего, введённое его переживает. Наружу уходит один submit с
 * `{general, constructions}` как есть — клиентской блокировки нет, о
 * недостающем сообщает агент; подсветка невалидной конструкции — индикация на
 * данных, не блок. При заданном `draftAction` коммиты состояния конструкций
 * (add/remove конструкции, «Применить»/«Добавить»/«Удалить слой» формы слоя,
 * «Сохранить» формы шапки, «Применить» формы паспортного Rпр) дополнительно
 * уезжают черновиком с тем же payload'ом.
 *
 * `generalSources` — только оформление полей условий: в payload источники не
 * попадают, агент их и прислал. Пропы вкладок (`generalTabLabel`,
 * `constructionsTabLabel`, `nextLabel`) схема принимает ради совместимости
 * эмитентов, но рендерер их игнорирует.
 *
 * Без пропа `general` компонент работает как прежде: только конструкции и
 * submit с `{constructions}` — путь отката.
 */
export const ConstructionsEditor = createComponentImplementation(
  constructionsEditorDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const hasGeneral = props.general !== undefined;

    const [constructions, setConstructions] = React.useState<ConstructionEntry[]>(() =>
      props.constructions.map(entry => ({...entry, layers: entry.layers.map(layer => ({...layer}))})),
    );
    // Раскрытые карточки. Пустое множество на старте: десяток конструкций по
    // три слоя развёрнутыми — простыня, в которой не найти нужную.
    const [openIds, setOpenIds] = React.useState<ReadonlySet<string>>(new Set());
    // Единственная раскрытая форма редактора — любого вида: слой ('new' —
    // форма нового слоя), шапка карточки или паспортное Rпр. Открытие любой
    // формы закрывает текущую, несохранённые правки уходят вместе с ней.
    const [editingTarget, setEditingTarget] = React.useState<{
      entryId: string;
      target: ConstructionsEditorFormTarget;
    } | null>(null);
    // Начальное состояние блока условий задаёт агент, дальше им владеет
    // пользователь: `conditionsCollapsed` читается один раз (Решение 6).
    const [conditionsOpen, setConditionsOpen] = React.useState(!props.conditionsCollapsed);
    // Состояние из props, а не сами props: дефолт типа здания подставляется
    // здесь же и «тронутым климатом» не считается.
    const initialGeneral = createGeneralState(
      props.general,
      props.condition,
      props.buildingTypeOptions,
    );
    const [general, setGeneral] = React.useState<ConstructionsGeneral>(initialGeneral);
    // Тронутые пользователем поля условий: с них снято оформление источника.
    const [touched, setTouched] = React.useState<ReadonlySet<ConstructionsGeneralKey>>(new Set());
    // Есть несохранённые правки условий: правка поля черновика не порождает
    // (иначе он уезжал бы на каждое нажатие клавиши), поэтому коммит — явный.
    const [conditionsDirty, setConditionsDirty] = React.useState(false);

    // Снимок климата, из которого агент посчитал `rnorm`. Новые props (ответ
    // агента с пересчитанным Rнорм) — новый снимок, свежие значения и свежие
    // источники: набор тронутых полей сбрасывается вместе с ними.
    const propsClimate = climateKey(initialGeneral);
    const [baseClimate, setBaseClimate] = React.useState(propsClimate);
    if (propsClimate !== baseClimate) {
      setBaseClimate(propsClimate);
      setGeneral(initialGeneral);
      setTouched(new Set());
      setConditionsDirty(false);
    }
    const climateDirty = climateKey(general) !== baseClimate;

    const handleGeneralChange = (
      next: ConstructionsGeneral,
      changed: ConstructionsGeneralKey[],
    ) => {
      setGeneral(next);
      setConditionsDirty(true);
      setTouched(prev => {
        const nextTouched = new Set(prev);
        for (const key of changed) nextTouched.add(key);
        return nextTouched;
      });
    };

    const typeConfigs = props.typeConfigs;
    // `condition` из вкладки; нет значения — λБ, как на сервере (Решение 6).
    const condition = general.condition ?? undefined;

    const comparable = constructions.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      return config?.rnorm !== undefined;
    });
    const passing = comparable.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      const rpr = computeLiveRpr(entry, config, condition);
      return rpr !== null && config?.rnorm !== undefined && rpr >= config.rnorm;
    });

    const handleToggle = (id: string) => {
      setOpenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    // Полное состояние экрана: `general` — только когда агент его прислал,
    // иначе payload прежний (путь отката).
    const buildContext = (entries: ConstructionEntry[]) =>
      hasGeneral ? {general, constructions: entries} : {constructions: entries};

    // Автосейв черновика: тот же payload, что у submit'а, без чтения ответа
    // агента. Нет пропа — no-op.
    const sendDraft = (next: ConstructionEntry[]) => {
      if (!props.draftAction) return;
      void context.dispatchAction({
        event: {name: props.draftAction, context: buildContext(next)},
      });
    };

    const handleEntryChange = (next: ConstructionEntry, options?: {commit?: boolean}) => {
      const updated = constructions.map(entry => (entry.id === next.id ? next : entry));
      setConstructions(updated);
      // Коммит формы (слоя, шапки, паспортного Rпр) — явный признак от
      // карточки; ввод внутри незакоммиченной формы наверх не поднимается
      // вовсе, а правки вкладки общих данных уезжают ближайшим коммитом
      // либо submit'ом.
      if (options?.commit) sendDraft(updated);
    };

    const handleEntryRemove = (id: string) => {
      const updated = constructions.filter(entry => entry.id !== id);
      setConstructions(updated);
      sendDraft(updated);
    };

    const handleAdd = () => {
      const firstType = typeConfigs[0];
      if (!firstType) return;
      const entry = {id: createLocalId(), type: firstType.type, layers: []} as ConstructionEntry;
      const updated = [...constructions, entry];
      setConstructions(updated);
      // Новую карточку раскрываем: её добавили, чтобы сразу заполнить.
      setOpenIds(prev => new Set(prev).add(entry.id));
      sendDraft(updated);
    };

    // Ничего не блокируем и не подсвечиваем: единственный компетентный
    // валидатор — агент (Решение 3 design.md).
    const handleSubmit = () => {
      void context.dispatchAction({
        event: {name: props.submitAction, context: buildContext(constructions)},
      });
    };

    const handleBack = () => {
      if (!props.backAction) return;
      void context.dispatchAction({
        event: {name: props.backAction, context: props.backActionContext ?? {}},
      });
    };

    return (
      <div className="a2ui-ce">
        <StyleTag href={CONSTRUCTIONS_EDITOR_STYLE_HREF} css={CONSTRUCTIONS_EDITOR_CSS} />
        {props.headerTitle ? (
          <header className="a2ui-ce__header">
            <span className="a2ui-ce__header-title">{props.headerTitle}</span>
            {props.headerContext ? (
              <span className="a2ui-ce__header-context">{props.headerContext}</span>
            ) : null}
          </header>
        ) : null}
        <div className="a2ui-ce__body">
          {hasGeneral ? (
            <ConstructionsEditorConditions
              open={conditionsOpen}
              onToggle={() => setConditionsOpen(prev => !prev)}
              general={general}
              sources={omitTouchedSources(props.generalSources, touched)}
              showGsop={!climateDirty}
              buildingTypeOptions={props.buildingTypeOptions}
              cityReferenceId={props.cityReferenceId}
              minChars={props.minChars}
              onChange={handleGeneralChange}
              dirty={conditionsDirty}
              onSave={
                props.draftAction
                  ? () => {
                      sendDraft(constructions);
                      setConditionsDirty(false);
                    }
                  : undefined
              }
            />
          ) : null}
          <section className="a2ui-ce__group">
            <h3 className="a2ui-ce-section-title">Конструкции · {constructions.length}</h3>
            <div className="a2ui-ce__list">
              {constructions.map(entry => (
                <ConstructionsEditorCard
                  key={entry.id}
                  entry={entry}
                  typeConfigs={typeConfigs}
                  condition={condition}
                  materialsReferenceId={props.materialsReferenceId}
                  minChars={props.minChars}
                  open={openIds.has(entry.id)}
                  showRnorm={!climateDirty}
                  editingTarget={editingTarget?.entryId === entry.id ? editingTarget.target : null}
                  onEditingChange={target =>
                    setEditingTarget(target === null ? null : {entryId: entry.id, target})
                  }
                  onToggle={() => handleToggle(entry.id)}
                  onChange={handleEntryChange}
                  onRemove={() => handleEntryRemove(entry.id)}
                />
              ))}
              <button type="button" onClick={handleAdd} className="a2ui-ce-btn a2ui-ce-btn--dashed">
                + {props.addLabel}
              </button>
            </div>
          </section>
          <footer className="a2ui-ce__footer">
            {props.backLabel && props.backAction ? (
              <button type="button" onClick={handleBack} className="a2ui-ce-btn">
                {props.backLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSubmit}
              className="a2ui-ce-btn a2ui-ce-btn--primary"
            >
              {props.submitLabel}
            </button>
            {/* Климат тронут → присланный Rнорм протух, сводка молчит до
                следующих props (Решение 4 design.md). */}
            {climateDirty ? null : (
              <span className="a2ui-ce__count">
                проходит {passing.length} из {comparable.length}
              </span>
            )}
          </footer>
        </div>
      </div>
    );
  },
);
