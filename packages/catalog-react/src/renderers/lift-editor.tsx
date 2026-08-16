import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {liftEditorDefinition} from '@ai37/a2ui-catalog-schemas';
import {applyDependentRules} from './apply-dependent-rules';
import {buildLiftSectionSummary} from './build-lift-section-summary';
import {buildingTouchedKey} from './building-touched-key';
import {createLiftEditorDrafts} from './create-lift-editor-drafts';
import {createLiftEditorSources} from './create-lift-editor-sources';
import {findMissingBySection} from './find-missing-by-section';
import {findRuleTargetsBySource} from './find-rule-targets-by-source';
import {isEmptyLiftValue} from './is-empty-lift-value';
import {LIFT_DRAFT_DEBOUNCE_MS} from './lift-draft-debounce-ms';
import {LiftEditorHeader} from './lift-editor-header';
import {LiftEditorMethodSwitcher} from './lift-editor-method-switcher';
import {LiftEditorScreen} from './lift-editor-screen';
import {LiftEditorSection} from './lift-editor-section';
import {LIFT_EDITOR_CSS, LIFT_EDITOR_STYLE_HREF} from './lift-editor-styles';
import {liftTouchedKey} from './lift-touched-key';
import {omitTouchedLiftSources} from './omit-touched-lift-sources';
import {pickInitialOpenSection} from './pick-initial-open-section';
import {scrollToElement} from './scroll-to-element';
import {seedLiftValues} from './seed-lift-values';
import {shiftSectionsAfterRemove} from './shift-sections-after-remove';
import {shiftTouchedAfterRemove} from './shift-touched-after-remove';
import {StyleTag} from './style-tag';
import {useA2uiBaseStyles} from './shared';
import type {LiftEditorDraft, LiftSectionBadge, LiftSectionKey} from './lift-editor.types';

/**
 * Подбор лифтов одним экраном: секция «Здание» сверху, под ней секции лифтов
 * (или единственная лифтовая группа) со строками-сводками из живых значений,
 * методика — переключателем в шапке карточки. Вкладок нет; раскрытие и
 * сворачивание секций локальны, введённое их переживает. Наружу уходит ровно
 * один submit с полным документом `{method, building, lifts}` активной ветки.
 *
 * При заданном `pendingLabel` кнопка подвала двухрежимная: пока есть
 * незаполненные обязательные поля или непросмотренные секции — «Далее»
 * (сворачивает всё и раскрывает ровно одну следующую цель, без action'а),
 * иначе — submit. Без пропа кнопка блокируется, как раньше.
 *
 * При заданном `draftAction` любая правка поля планирует черновик дебаунсом
 * (`LIFT_DRAFT_DEBOUNCE_MS`), а структурные действия (add/remove лифта, смена
 * методики, «Далее») шлют его немедленно, отменяя отложенный; submit тоже
 * отменяет отложенный. Дедупликация по содержимому. Без пропа автосейва нет.
 *
 * `buildingSources`/`liftSources` — только подписи под контролами: правка поля
 * снимает подпись, в payload источники не уходят. Доменных знаний о ГОСТ в
 * компоненте нет — конфиги, ряды и правила целиком приходят в props.
 */
export const LiftEditor = createComponentImplementation(liftEditorDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const initialConfig = () =>
    props.methodConfigs.find(config => config.method === props.method) ?? props.methodConfigs[0]!;

  const [method, setMethod] = React.useState(props.method);
  const [drafts, setDrafts] = React.useState(() => createLiftEditorDrafts(props));
  const [sources, setSources] = React.useState(() => createLiftEditorSources(props));
  // Поля, правленные вручную: авто-подстановка их не перетирает, подпись
  // источника с них снята. Ключи лифтов — `lift-touched-key`, здания —
  // `building-touched-key`.
  const [touched, setTouched] = React.useState<ReadonlySet<string>>(() => new Set());
  const [openSections, setOpenSections] = React.useState<ReadonlySet<LiftSectionKey>>(
    () =>
      new Set([
        pickInitialOpenSection(
          initialConfig(),
          createLiftEditorDrafts(props)[props.method] ?? {building: {}, lifts: [{}]},
        ),
      ]),
  );
  // Просмотренные секции: раскрытие любым способом засчитывает просмотр.
  const [reviewed, setReviewed] = React.useState<ReadonlySet<LiftSectionKey>>(
    () => new Set(openSections),
  );

  // Якоря секций для прокрутки навигацией «Далее».
  const sectionRefs = React.useRef(new Map<LiftSectionKey, HTMLElement>());
  // Отложенный черновик: payload читается из ref в момент срабатывания таймера
  // — последний ввод побеждает (Решение 6 design.md).
  const draftTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Сериализация последнего отправленного черновика — дедуп по содержимому.
  const lastDraft = React.useRef<string | null>(null);

  const cancelPendingDraft = () => {
    if (draftTimerRef.current === null) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null;
  };

  // Таймер не переживает unmount: отправлять черновик уже некому.
  React.useEffect(() => cancelPendingDraft, []);

  // Новое сообщение агента — новый документ: state пересевается из props,
  // несохранённые правки и счёт просмотренного теряются (как у FormCard/
  // ConstructionsEditor). Источники в ключе: новый провенанс — тоже снапшот.
  const propsKey = JSON.stringify([
    props.method,
    props.building,
    props.lifts,
    props.buildingSources,
    props.liftSources,
  ]);
  const [baseKey, setBaseKey] = React.useState(propsKey);
  if (propsKey !== baseKey) {
    const nextDrafts = createLiftEditorDrafts(props);
    const nextConfig = initialConfig();
    const nextInitial = pickInitialOpenSection(nextConfig, nextDrafts[props.method]!);
    cancelPendingDraft();
    setBaseKey(propsKey);
    setMethod(props.method);
    setDrafts(nextDrafts);
    setSources(createLiftEditorSources(props));
    setTouched(new Set());
    setOpenSections(new Set([nextInitial]));
    setReviewed(new Set([nextInitial]));
  }

  const config =
    props.methodConfigs.find(candidate => candidate.method === method) ?? props.methodConfigs[0]!;
  const draft = drafts[config.method]!;
  const rules = config.dependentRules ?? [];
  const perLift = config.liftsMode === 'per-lift';

  const updateDraft = (next: LiftEditorDraft) =>
    setDrafts(prev => ({...prev, [config.method]: next}));

  // Документ активной ветки — общий payload submit'а и черновика.
  const buildDocument = (nextMethod: string, next: LiftEditorDraft) => ({
    method: nextMethod,
    building: next.building,
    lifts: next.lifts,
  });

  const draftStateRef = React.useRef({method: config.method, draft});
  draftStateRef.current = {method: config.method, draft};

  const dispatchDraft = (nextMethod: string, next: LiftEditorDraft) => {
    if (!props.draftAction) return;

    const payload = buildDocument(nextMethod, next);
    const serialized = JSON.stringify(payload);
    if (serialized === lastDraft.current) return;

    lastDraft.current = serialized;
    void context.dispatchAction({event: {name: props.draftAction, context: payload}});
  };

  // Немедленный черновик структурных действий: несёт полное состояние,
  // отложенный после него избыточен — таймер сбрасывается.
  const sendDraftNow = (next: LiftEditorDraft = draft, nextMethod: string = config.method) => {
    cancelPendingDraft();
    dispatchDraft(nextMethod, next);
  };

  const scheduleDraft = () => {
    if (!props.draftAction) return;
    cancelPendingDraft();
    draftTimerRef.current = setTimeout(() => {
      draftTimerRef.current = null;
      const latest = draftStateRef.current;
      dispatchDraft(latest.method, latest.draft);
    }, LIFT_DRAFT_DEBOUNCE_MS);
  };

  const isTouchedIn = (source: ReadonlySet<string>, index: number) => (field: string) =>
    source.has(liftTouchedKey(config.method, index, field));

  const handleBuildingChange = (name: string, value: string | boolean) => {
    const building = {...draft.building, [name]: value};
    const nextTouched = new Set(touched);
    // Правка снимает provenance поля независимо от вернувшегося значения.
    nextTouched.add(buildingTouchedKey(config.method, name));
    // Поле здания — источник для полей ВСЕХ лифтов (тип здания → tOst).
    const targets = findRuleTargetsBySource(rules, name, 'building');
    draft.lifts.forEach((_unused, index) => {
      for (const target of targets) {
        nextTouched.delete(liftTouchedKey(config.method, index, target));
      }
    });

    setTouched(nextTouched);
    updateDraft({
      building,
      lifts: draft.lifts.map((lift, index) =>
        applyDependentRules({rules, building, lift, isTouched: isTouchedIn(nextTouched, index)}),
      ),
    });
    scheduleDraft();
  };

  const handleLiftChange = (index: number, name: string, value: string | boolean) => {
    const nextTouched = new Set(touched);
    nextTouched.add(liftTouchedKey(config.method, index, name));
    for (const target of findRuleTargetsBySource(rules, name, 'lift')) {
      nextTouched.delete(liftTouchedKey(config.method, index, target));
    }

    setTouched(nextTouched);
    updateDraft({
      building: draft.building,
      lifts: draft.lifts.map((lift, candidate) =>
        candidate === index
          ? applyDependentRules({
              rules,
              building: draft.building,
              lift: {...lift, [name]: value},
              isTouched: isTouchedIn(nextTouched, index),
            })
          : lift,
      ),
    });
    scheduleDraft();
  };

  // Черновик прежней методики остаётся нетронутым: возврат восстанавливает
  // введённое. Смена методики сбрасывает счёт просмотренного — новая ветка
  // проходится заново.
  const handleMethodChange = (next: string) => {
    const nextConfig = props.methodConfigs.find(candidate => candidate.method === next);
    const nextDraft = drafts[next];
    if (!nextConfig || !nextDraft) return;

    const nextInitial = pickInitialOpenSection(nextConfig, nextDraft);
    setMethod(next);
    setOpenSections(new Set([nextInitial]));
    setReviewed(new Set([nextInitial]));
    // Черновик несёт ВНОВЬ выбранную ветку: прежняя остаётся только на клиенте.
    sendDraftNow(nextDraft, next);
  };

  const handleToggle = (key: LiftSectionKey) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    // Раскрытие = просмотр: бейдж «просмотреть» слетает и не возвращается.
    setReviewed(prev => new Set(prev).add(key));
  };

  const handleAddLift = () => {
    const lifts = [
      ...draft.lifts,
      applyDependentRules({
        rules,
        building: draft.building,
        lift: seedLiftValues(config.liftFields),
        isTouched: () => false,
      }),
    ];
    const next = {building: draft.building, lifts};
    const key: LiftSectionKey = `lift-${lifts.length - 1}`;
    updateDraft(next);
    setSources(prev => {
      const branch = prev[config.method] ?? {building: {}, lifts: []};
      return {...prev, [config.method]: {building: branch.building, lifts: [...branch.lifts, {}]}};
    });
    // Новая секция раскрыта (её добавили, чтобы заполнить), остальные свёрнуты.
    setOpenSections(new Set([key]));
    setReviewed(prev => new Set(prev).add(key));
    sendDraftNow(next);
  };

  const handleRemoveLift = (index: number) => {
    if (draft.lifts.length <= 1) return;
    const next = {building: draft.building, lifts: draft.lifts.filter((_u, i) => i !== index)};
    updateDraft(next);
    setTouched(shiftTouchedAfterRemove(touched, config.method, index));
    setSources(prev => {
      const branch = prev[config.method] ?? {building: {}, lifts: []};
      return {
        ...prev,
        [config.method]: {
          building: branch.building,
          lifts: branch.lifts.filter((_u, i) => i !== index),
        },
      };
    });
    setOpenSections(prev => shiftSectionsAfterRemove(prev, index));
    setReviewed(prev => shiftSectionsAfterRemove(prev, index));
    sendDraftNow(next);
  };

  const missing = findMissingBySection(config, draft);
  const sectionOrder: LiftSectionKey[] = [
    'building',
    ...draft.lifts.map((_unused, index) => `lift-${index}` as LiftSectionKey),
  ];
  const hasUnreviewed = sectionOrder.some(key => !reviewed.has(key));
  // Pending-режим: даже полностью предзаполненный документ проходится по
  // секциям до submit'а. Без пропа `pendingLabel` режима нет.
  const pending = props.pendingLabel !== undefined && (missing.size > 0 || hasUnreviewed);

  // «заполните» (пустые обязательные, сильнее) / «просмотреть» (свёрнутая
  // непросмотренная).
  const badgeFor = (key: LiftSectionKey): LiftSectionBadge | undefined => {
    if (missing.has(key)) return 'fill';
    if (!reviewed.has(key) && !openSections.has(key)) return 'review';
    return undefined;
  };

  // «Далее» — навигация, не action: свернуть всё и раскрыть ровно одну
  // следующую цель — первую секцию с незаполненными обязательными, иначе
  // первую непросмотренную по порядку экрана, — со скроллом к ней.
  const handlePendingClick = () => {
    const target =
      missing.keys().next().value ?? sectionOrder.find(key => !reviewed.has(key));
    if (target === undefined) return;

    setOpenSections(new Set([target]));
    setReviewed(prev => new Set(prev).add(target));
    scrollToElement(sectionRefs.current.get(target) ?? null);
    // «Далее» фиксирует заполненную секцию немедленно, не дожидаясь дебаунса.
    sendDraftNow();
  };

  // Submit шлёт то же полное состояние — запоздавший черновик после него мог
  // бы визуально «откатить» форму, поэтому отложенный отменяется.
  const handleSubmit = () => {
    if (props.pendingLabel === undefined && missing.size > 0) return;
    cancelPendingDraft();
    void context.dispatchAction({
      event: {
        name: props.submitAction,
        // Только активная ветка: черновики остальных методик наружу не едут.
        context: buildDocument(config.method, draft),
      },
    });
  };

  const bindSectionRef = (key: LiftSectionKey) => (node: HTMLElement | null) => {
    if (node === null) {
      sectionRefs.current.delete(key);
    } else {
      sectionRefs.current.set(key, node);
    }
  };

  // Тип здания в тексте шапки: живое значение поля `buildingType` активной
  // ветки, при его отсутствии — `buildingKindLabel` конфига.
  const kindValue = draft.building['buildingType'];
  const buildingKind = !isEmptyLiftValue(kindValue)
    ? String(kindValue)
    : (config.buildingKindLabel ?? '');

  const methodSources = sources[config.method] ?? {building: {}, lifts: []};
  const buildingSources = omitTouchedLiftSources(methodSources.building, field =>
    touched.has(buildingTouchedKey(config.method, field)),
  );

  const nonAdvanced = (fields: readonly (typeof config.buildingFields)[number][]) =>
    fields.filter(field => field.advanced !== true);

  const switcher = (
    <LiftEditorMethodSwitcher
      configs={props.methodConfigs}
      method={config.method}
      fieldLabel={props.methodField.label}
      buildingKind={buildingKind}
      onChange={handleMethodChange}
    />
  );

  return (
    <div className="a2ui-le">
      <StyleTag href={LIFT_EDITOR_STYLE_HREF} css={LIFT_EDITOR_CSS} />
      {props.headerTitle !== undefined ? (
        <LiftEditorHeader
          title={props.headerTitle}
          context={props.headerContext}
          switcher={switcher}
        />
      ) : (
        // Fallback без шапки: переключатель — первым элементом над секциями.
        <div>{switcher}</div>
      )}
      <LiftEditorSection
        title={props.buildingTabLabel}
        summary={buildLiftSectionSummary(nonAdvanced(config.buildingFields), draft.building)}
        open={openSections.has('building')}
        badge={badgeFor('building')}
        onToggle={() => handleToggle('building')}
        sectionRef={bindSectionRef('building')}
      >
        <LiftEditorScreen
          fields={config.buildingFields}
          values={draft.building}
          building={draft.building}
          advancedLabel={props.advancedLabel}
          sources={buildingSources}
          onChange={handleBuildingChange}
        />
      </LiftEditorSection>
      {draft.lifts.map((lift, index) => {
        const key: LiftSectionKey = `lift-${index}`;
        const liftSources = omitTouchedLiftSources(
          methodSources.lifts[index] ?? {},
          isTouchedIn(touched, index),
        );

        return (
          <LiftEditorSection
            key={key}
            title={perLift ? `${config.liftTabLabel} ${index + 1}` : config.liftTabLabel}
            summary={buildLiftSectionSummary(nonAdvanced(config.liftFields), lift)}
            open={openSections.has(key)}
            badge={badgeFor(key)}
            onToggle={() => handleToggle(key)}
            headerAction={
              perLift && draft.lifts.length > 1 ? (
                <button
                  type="button"
                  className="a2ui-le-link a2ui-le-link--danger"
                  onClick={() => handleRemoveLift(index)}
                >
                  {props.removeLabel}
                </button>
              ) : undefined
            }
            sectionRef={bindSectionRef(key)}
          >
            <LiftEditorScreen
              fields={config.liftFields}
              values={lift}
              building={draft.building}
              advancedLabel={props.advancedLabel}
              sources={liftSources}
              onChange={(name, value) => handleLiftChange(index, name, value)}
            />
          </LiftEditorSection>
        );
      })}
      {perLift ? (
        <button
          type="button"
          className="a2ui-le-add"
          disabled={config.maxLifts !== undefined && draft.lifts.length >= config.maxLifts}
          onClick={handleAddLift}
        >
          + {props.addLabel}
        </button>
      ) : null}
      <footer className="a2ui-le__footer">
        <button
          type="button"
          className="a2ui-le-submit"
          disabled={props.pendingLabel === undefined && missing.size > 0}
          onClick={pending ? handlePendingClick : handleSubmit}
        >
          {pending ? props.pendingLabel : props.submitLabel}
        </button>
      </footer>
    </div>
  );
});
