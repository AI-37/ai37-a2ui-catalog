import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {
  constructionsEditorNextDefinition,
  type ConstructionEntry,
  type ConstructionsGeneral,
} from '@ai37/a2ui-catalog-schemas';
import {Card, KIT_SCOPE, KitStyles} from '../primitives';
import {climateKey} from './climate-key';
import {computeLiveRpr} from './compute-live-rpr';
import {CONDITIONS_DRAFT_DEBOUNCE_MS} from './conditions-draft-debounce-ms';
import {ConstructionsNextConditionsSlot} from './constructions-next-conditions-slot';
import {ConstructionsNextCounter} from './constructions-next-counter';
import {ConstructionsNextFooter} from './constructions-next-footer';
import {ConstructionsNextHeader} from './constructions-next-header';
import {ConstructionsNextList} from './constructions-next-list';
import type {
  ConstructionsEditorFormTarget,
  ConstructionsGeneralKey,
} from './constructions-editor.types';
import {createGeneralState} from './create-general-state';
import {createLocalId} from './create-local-id';
import {findInvalidLayers} from './find-invalid-layers';
import {omitTouchedSources} from './omit-touched-sources';
import {scrollToElement} from './scroll-to-element';
import {useA2uiBaseStyles} from './shared';

/**
 * Тот же экран теплотехнического расчёта, что `ConstructionsEditor`, собранный
 * из примитивов каталога (`src/primitives`): карточка, кнопка, пилюля, три
 * ступени текста, форма — оформление наше, а раскрывашки, списки, числовые
 * поля и поиск по справочнику приходят из `@base-ui/react` вместе с
 * клавиатурой и `aria`. Схема props общая со старым рендерером намеренно: одно
 * наполнение обязано рендериться обоими, иначе сравнивать нечего.
 *
 * Контракт данных не меняется. Наружу уходит один submit с
 * `{general, constructions}` как есть — клиентской блокировки нет, о
 * недостающем сообщает агент; подсветка невалидной конструкции — индикация, не
 * блок. При заданном `draftAction` коммиты форм (add/remove конструкции,
 * «Применить»/«Добавить»/«Удалить слой», «Сохранить» шапки, «Применить»
 * паспортного Rпр) уезжают черновиком сразу, а правки условий — с дебаунсом:
 * кнопки сохранения условий нет, ГСОП и Rнорм приходят ответным снапшотом.
 *
 * Отличия исполнения от старого рендерера, а не поведения: список конструкций
 * — аккордеон с одной раскрытой карточкой за раз (десяток открытых составов
 * не читается), а подпись секции «Условия» стоит снаружи карточки и потому
 * видна и в свёрнутом состоянии.
 */
export const ConstructionsEditorNext = createComponentImplementation(
  constructionsEditorNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const hasGeneral = props.general !== undefined;

    const [constructions, setConstructions] = React.useState<ConstructionEntry[]>(() =>
      props.constructions.map(entry => ({
        ...entry,
        layers: entry.layers.map(layer => ({...layer})),
      })),
    );
    // Раскрытая карточка одна: аккордеон одиночный, а на старте не раскрыта ни
    // одна — десяток конструкций по три слоя развёрнутыми это простыня.
    const [openId, setOpenId] = React.useState<string | null>(null);
    // Единственная раскрытая форма редактора — любого вида: слой ('new' —
    // форма нового слоя), шапка карточки или паспортное Rпр. Открытие любой
    // формы закрывает текущую, несохранённые правки уходят вместе с ней.
    const [editing, setEditing] = React.useState<{
      entryId: string;
      target: ConstructionsEditorFormTarget;
    } | null>(null);
    // Начальное состояние блока условий задаёт агент, дальше им владеет
    // пользователь: `conditionsCollapsed` читается один раз.
    const [conditionsOpen, setConditionsOpen] = React.useState(!props.conditionsCollapsed);
    // Погашенные агентские статусы: просмотр карточки без ошибок данных или
    // коммит любой её формы. Живёт до submit; на стороне агента статусы
    // снимает `constructions:apply`.
    const [dismissedStatusIds, setDismissedStatusIds] = React.useState<ReadonlySet<string>>(
      new Set(),
    );
    // Якоря навигации pending-кнопки: блок условий и карточки по id.
    const conditionsRef = React.useRef<HTMLDivElement | null>(null);
    const cardRefs = React.useRef(new Map<string, HTMLDivElement>());
    // Состояние из props, а не сами props: дефолт типа здания подставляется
    // здесь же и «тронутым климатом» не считается.
    const initialGeneral = createGeneralState(
      props.general,
      props.condition,
      props.buildingTypeOptions,
    );
    const [general, setGeneral] = React.useState<ConstructionsGeneral>(initialGeneral);
    // Тронутые пользователем поля условий: с них снята подпись источника.
    const [touched, setTouched] = React.useState<ReadonlySet<ConstructionsGeneralKey>>(new Set());

    // Снимок климата, из которого агент посчитал `rnorm`. Новые props (ответ
    // агента с пересчитанным Rнорм) — новый снимок, свежие значения и свежие
    // источники: набор тронутых полей сбрасывается вместе с ними.
    const propsClimate = climateKey(initialGeneral);
    const [baseClimate, setBaseClimate] = React.useState(propsClimate);
    if (propsClimate !== baseClimate) {
      setBaseClimate(propsClimate);
      setGeneral(initialGeneral);
      setTouched(new Set());
    }
    const climateDirty = climateKey(general) !== baseClimate;

    // Отложенный draft правок условий. Payload собирается из ref в момент
    // срабатывания таймера, а не в момент правки — последний ввод побеждает.
    const draftTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const draftStateRef = React.useRef({general, constructions});
    draftStateRef.current = {general, constructions};

    const cancelPendingDraft = () => {
      if (draftTimerRef.current === null) return;
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    };

    // Таймер не переживает unmount: отправлять draft уже некому.
    React.useEffect(() => cancelPendingDraft, []);

    const scheduleConditionsDraft = () => {
      const draftAction = props.draftAction;
      if (!draftAction) return;
      cancelPendingDraft();
      draftTimerRef.current = setTimeout(() => {
        draftTimerRef.current = null;
        const latest = draftStateRef.current;
        void context.dispatchAction({
          event: {
            name: draftAction,
            context: {general: latest.general, constructions: latest.constructions},
          },
        });
      }, CONDITIONS_DRAFT_DEBOUNCE_MS);
    };

    const handleGeneralChange = (
      next: ConstructionsGeneral,
      changed: ConstructionsGeneralKey[],
    ) => {
      setGeneral(next);
      scheduleConditionsDraft();
      setTouched(prev => {
        const nextTouched = new Set(prev);
        for (const key of changed) nextTouched.add(key);
        return nextTouched;
      });
    };

    const typeConfigs = props.typeConfigs;
    // `condition` из блока условий; нет значения — λБ, как на сервере.
    const condition = general.condition ?? undefined;

    const invalidityOf = (entry: ConstructionEntry) =>
      findInvalidLayers(
        entry,
        typeConfigs.find(candidate => candidate.type === entry.type),
      );

    // Гейт условий — клиентский live-эквивалент isStep1Filled агента:
    // назначение, регион, tот, zот, tв. Пока не заполнены, статусных пометок
    // нет. Без пропа `general` гейта нет — путь отката ведёт себя как прежде.
    const conditionsFilled =
      !hasGeneral ||
      (general.buildingType !== null &&
        general.city !== null &&
        general.tot !== null &&
        general.zot !== null &&
        general.tv !== null);

    // Гашение просмотром: раскрытие карточки без ошибок данных подтверждает её
    // состав (вердикт Rпр не важен — непрохождение нормы легитимно); карточка
    // с ошибками данных гасится только их починкой.
    const dismissStatusOnView = (id: string) => {
      const entry = constructions.find(candidate => candidate.id === id);
      if (!entry?.status || invalidityOf(entry).invalid) return;
      setDismissedStatusIds(prev => new Set(prev).add(id));
    };

    const needsAttention = (entry: ConstructionEntry) =>
      invalidityOf(entry).invalid ||
      (entry.status !== undefined && !dismissedStatusIds.has(entry.id));

    // Pending — тот же источник, что статусные пометки: незаполненные условия
    // либо карточка, требующая внимания. Без пропа `pendingLabel` режима нет.
    const pending =
      props.pendingLabel !== undefined &&
      (!conditionsFilled || constructions.some(needsAttention));

    const comparable = constructions.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      return config?.rnorm !== undefined;
    });
    const passing = comparable.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      const rpr = computeLiveRpr(entry, config, condition);
      return rpr !== null && config?.rnorm !== undefined && rpr >= config.rnorm;
    });

    const handleOpenChange = (id: string | null) => {
      if (id !== null) dismissStatusOnView(id);
      setOpenId(id);
    };

    // Полное состояние экрана: `general` — только когда агент его прислал,
    // иначе payload прежний (путь отката).
    const buildContext = (entries: ConstructionEntry[]) =>
      hasGeneral ? {general, constructions: entries} : {constructions: entries};

    // Автосейв черновика: тот же payload, что у submit'а, без чтения ответа
    // агента. Нет пропа — no-op. Немедленный draft несёт полное состояние —
    // отложенный после него избыточен, таймер сбрасывается.
    const sendDraft = (next: ConstructionEntry[]) => {
      if (!props.draftAction) return;
      cancelPendingDraft();
      void context.dispatchAction({
        event: {name: props.draftAction, context: buildContext(next)},
      });
    };

    const handleEntryChange = (next: ConstructionEntry, options?: {commit?: boolean}) => {
      const updated = constructions.map(entry => (entry.id === next.id ? next : entry));
      setConstructions(updated);
      // Коммит формы — явный признак от карточки; ввод внутри незакоммиченной
      // формы наверх не поднимается вовсе.
      if (options?.commit) {
        sendDraft(updated);
        // Правка равна подтверждению: коммит любой формы гасит агентский статус.
        setDismissedStatusIds(prev => (prev.has(next.id) ? prev : new Set(prev).add(next.id)));
      }
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
      setOpenId(entry.id);
      sendDraft(updated);
    };

    // Ничего не блокируем и не подсвечиваем: единственный компетентный
    // валидатор — агент. Отложенный draft отменяется: submit шлёт то же полное
    // состояние, а запоздавший ответ черновика мог бы визуально «откатить» форму.
    const handleSubmit = () => {
      cancelPendingDraft();
      void context.dispatchAction({
        event: {name: props.submitAction, context: buildContext(constructions)},
      });
    };

    // «Далее» — навигация, не action: раскрыть незаполненные условия, иначе
    // ТОЛЬКО первую сверху карточку, требующую внимания (аккордеон одиночный,
    // остальные закроются сами), со скроллом к цели.
    const handlePendingClick = () => {
      if (!conditionsFilled) {
        setConditionsOpen(true);
        scrollToElement(conditionsRef.current);
        return;
      }
      const target = constructions.find(needsAttention);
      if (!target) return;
      dismissStatusOnView(target.id);
      setOpenId(target.id);
      scrollToElement(cardRefs.current.get(target.id) ?? null);
    };

    // Подпись главной кнопки: pending-режим включается только вместе с
    // `pendingLabel`, но проверку повторяем — иначе тип пришлось бы утверждать.
    const submitLabel =
      pending && props.pendingLabel !== undefined ? props.pendingLabel : props.submitLabel;

    const handleBack = () => {
      if (!props.backAction) return;
      void context.dispatchAction({
        event: {name: props.backAction, context: props.backActionContext ?? {}},
      });
    };

    return (
      <div className={KIT_SCOPE}>
        <KitStyles />
        <Card>
          <div style={bodyStyle}>
            <ConstructionsNextHeader title={props.headerTitle} context={props.headerContext} />
            <ConstructionsNextConditionsSlot
              show={hasGeneral}
              sectionRef={conditionsRef}
              open={conditionsOpen}
              onOpenChange={setConditionsOpen}
              general={general}
              sources={omitTouchedSources(props.generalSources, touched)}
              buildingTypeOptions={props.buildingTypeOptions}
              cityReferenceId={props.cityReferenceId}
              minChars={props.minChars}
              onChange={handleGeneralChange}
            />
            <ConstructionsNextList
              entries={constructions}
              typeConfigs={typeConfigs}
              condition={condition}
              materialsReferenceId={props.materialsReferenceId}
              minChars={props.minChars}
              showRnorm={!climateDirty}
              showStatusChips={conditionsFilled}
              dismissedStatusIds={dismissedStatusIds}
              openId={openId}
              onOpenChange={handleOpenChange}
              editing={editing}
              onEditingChange={(entryId, target) =>
                setEditing(target === null ? null : {entryId, target})
              }
              onEntryChange={handleEntryChange}
              onEntryRemove={handleEntryRemove}
              addLabel={props.addLabel}
              onAdd={handleAdd}
              entryRef={(id, element) => {
                if (element) {
                  cardRefs.current.set(id, element);
                } else {
                  cardRefs.current.delete(id);
                }
              }}
            />
            <ConstructionsNextFooter
              backLabel={props.backAction ? props.backLabel : undefined}
              onBack={handleBack}
              submitLabel={submitLabel}
              onSubmit={pending ? handlePendingClick : handleSubmit}
              counter={
                <ConstructionsNextCounter
                  show={!climateDirty}
                  passing={passing.length}
                  comparable={comparable.length}
                />
              }
            />
          </div>
        </Card>
      </div>
    );
  },
);

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
