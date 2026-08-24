import React from 'react';
import type {LiftEditorProps} from '@ai37/a2ui-catalog-schemas';
import {applyDependentRules} from './apply-dependent-rules';
import {buildingTouchedKey} from './building-touched-key';
import {createLiftEditorDrafts} from './create-lift-editor-drafts';
import {createLiftEditorSources} from './create-lift-editor-sources';
import {findMissingBySection} from './find-missing-by-section';
import {findRuleTargetsBySource} from './find-rule-targets-by-source';
import {isEmptyLiftValue} from './is-empty-lift-value';
import {LIFT_DRAFT_DEBOUNCE_MS} from './lift-draft-debounce-ms';
import {liftTouchedKey} from './lift-touched-key';
import {omitTouchedLiftSources} from './omit-touched-lift-sources';
import {pickInitialOpenSection} from './pick-initial-open-section';
import {scrollToElement} from './scroll-to-element';
import {seedLiftValues} from './seed-lift-values';
import {shiftSectionsAfterRemove} from './shift-sections-after-remove';
import {shiftTouchedAfterRemove} from './shift-touched-after-remove';
import type {LiftEditorDraft, LiftSectionKey} from './lift-editor.types';
import type {LiftNextControl, LiftNextFieldValue, LiftNextSink} from './lift-next.types';

/** Индекс лифта из ключа секции; `building` — не лифт. */
function liftIndexOf(key: LiftSectionKey): number | null {
  return key === 'building' ? null : Number(key.slice('lift-'.length));
}

/**
 * Состояние экрана лифтов: черновики по методикам, пометки ручной правки,
 * раскрытие и просмотр секций, живой черновик наружу.
 *
 * Доменных знаний здесь нет — ряды, правила и состав полей приходят
 * наполнением, а считают их готовые модули пакета (`apply-dependent-rules`,
 * `split-advanced-fields` и соседи), общие с нынешним `LiftEditor`: два
 * рендерера обязаны вести себя одинаково, а не считать одно и то же дважды.
 *
 * Черновики неактивных методик живут здесь до размонтирования: возврат к
 * прежней ветке показывает введённое, наружу же уезжает только активная.
 */
export function useLiftEditorNext(props: LiftEditorProps, sink: LiftNextSink): LiftNextControl {
  const initialConfig = () =>
    props.methodConfigs.find(candidate => candidate.method === props.method) ??
    props.methodConfigs[0]!;

  const [method, setMethod] = React.useState(props.method);
  const [drafts, setDrafts] = React.useState(() => createLiftEditorDrafts(props));
  const [sources, setSources] = React.useState(() => createLiftEditorSources(props));
  // Поля, правленные вручную: авто-подстановка их не перетирает, подпись
  // источника с них снята.
  const [touched, setTouched] = React.useState<ReadonlySet<string>>(() => new Set());
  const [openSections, setOpenSections] = React.useState<LiftSectionKey[]>(() => [
    pickInitialOpenSection(
      initialConfig(),
      createLiftEditorDrafts(props)[props.method] ?? {building: {}, lifts: [{}]},
    ),
  ]);
  // Просмотренные секции: раскрытие любым способом засчитывает просмотр.
  const [reviewed, setReviewed] = React.useState<ReadonlySet<LiftSectionKey>>(
    () => new Set(openSections),
  );

  // Якоря секций для прокрутки навигацией «Далее».
  const sectionNodes = React.useRef(new Map<LiftSectionKey, HTMLElement>());
  const draftTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Сериализация последнего отправленного черновика — дедуп по содержимому.
  const lastDraft = React.useRef<string | null>(null);

  const cancelPendingDraft = () => {
    if (draftTimer.current === null) return;
    clearTimeout(draftTimer.current);
    draftTimer.current = null;
  };

  // Таймер не переживает unmount: отправлять черновик уже некому.
  React.useEffect(() => cancelPendingDraft, []);

  // Новое сообщение агента — новый документ: state пересевается из props,
  // несохранённые правки и счёт просмотренного теряются (как у нынешнего
  // `LiftEditor`). Источники в ключе: новый провенанс — тоже снапшот.
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
    const nextInitial = pickInitialOpenSection(initialConfig(), nextDrafts[props.method]!);
    cancelPendingDraft();
    setBaseKey(propsKey);
    setMethod(props.method);
    setDrafts(nextDrafts);
    setSources(createLiftEditorSources(props));
    setTouched(new Set());
    setOpenSections([nextInitial]);
    setReviewed(new Set([nextInitial]));
  }

  const config =
    props.methodConfigs.find(candidate => candidate.method === method) ?? props.methodConfigs[0]!;
  const draft = drafts[config.method]!;
  const rules = config.dependentRules ?? [];
  const perLift = config.liftsMode === 'per-lift';

  // Отложенный черновик читает состояние из ref в момент срабатывания —
  // побеждает последний ввод, а не тот, что запланировал таймер.
  const latest = React.useRef({method: config.method, draft});
  latest.current = {method: config.method, draft};

  const dispatchDraft = (nextMethod: string, next: LiftEditorDraft) => {
    if (!sink.onDraft) return;

    const payload = {method: nextMethod, building: next.building, lifts: next.lifts};
    const serialized = JSON.stringify(payload);
    if (serialized === lastDraft.current) return;

    lastDraft.current = serialized;
    sink.onDraft(payload);
  };

  // Структурное действие несёт полное состояние — отложенный черновик после
  // него избыточен, поэтому таймер сбрасывается.
  const sendDraftNow = (next: LiftEditorDraft = draft, nextMethod: string = config.method) => {
    cancelPendingDraft();
    dispatchDraft(nextMethod, next);
  };

  const scheduleDraft = () => {
    if (!sink.onDraft) return;
    cancelPendingDraft();
    draftTimer.current = setTimeout(() => {
      draftTimer.current = null;
      dispatchDraft(latest.current.method, latest.current.draft);
    }, LIFT_DRAFT_DEBOUNCE_MS);
  };

  const updateDraft = (next: LiftEditorDraft) =>
    setDrafts(prev => ({...prev, [config.method]: next}));

  const isTouchedIn = (source: ReadonlySet<string>, index: number) => (field: string) =>
    source.has(liftTouchedKey(config.method, index, field));

  const changeBuilding = (name: string, value: LiftNextFieldValue) => {
    const building = {...draft.building, [name]: value};
    const nextTouched = new Set(touched);
    // Правка снимает подпись источника независимо от вернувшегося значения.
    nextTouched.add(buildingTouchedKey(config.method, name));
    // Поле здания — источник для полей ВСЕХ лифтов (тип здания → ряды Прил. Е).
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

  const changeLift = (index: number, name: string, value: LiftNextFieldValue) => {
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

  const missing = findMissingBySection(config, draft);
  const sectionOrder: LiftSectionKey[] = [
    'building',
    ...draft.lifts.map((_unused, index) => `lift-${index}` as LiftSectionKey),
  ];
  const hasUnreviewed = sectionOrder.some(key => !reviewed.has(key));
  // Pending-режим: даже полностью предзаполненный документ проходится по
  // секциям до submit'а. Без пропа `pendingLabel` режима нет.
  const pending = props.pendingLabel !== undefined && (missing.size > 0 || hasUnreviewed);

  const methodSources = sources[config.method] ?? {building: {}, lifts: []};

  // Тип здания в тексте шапки: живое значение поля активной ветки, при его
  // отсутствии — подпись конфига.
  const kindValue = draft.building['buildingType'];
  const buildingKind = !isEmptyLiftValue(kindValue)
    ? String(kindValue)
    : (config.buildingKindLabel ?? '');

  return {
    config,
    draft,
    perLift,
    sectionOrder,
    openSections,
    buildingKind,
    pending,
    blocked: props.pendingLabel === undefined && missing.size > 0,
    canAddLift: config.maxLifts === undefined || draft.lifts.length < config.maxLifts,

    // «заполните» (пустые обязательные) перекрывает «просмотреть» (свёрнутая
    // непросмотренная); раскрытая секция обходится без пометки.
    badgeFor: key => {
      if (missing.has(key)) return 'fill';
      if (!reviewed.has(key) && !openSections.includes(key)) return 'review';
      return undefined;
    },

    sourcesFor: key => {
      const index = liftIndexOf(key);
      if (index === null) {
        return omitTouchedLiftSources(methodSources.building, field =>
          touched.has(buildingTouchedKey(config.method, field)),
        );
      }

      return omitTouchedLiftSources(methodSources.lifts[index] ?? {}, isTouchedIn(touched, index));
    },

    // Раскрытие = просмотр: пометка «просмотреть» слетает и не возвращается.
    setOpenSections: next => {
      setOpenSections(next);
      setReviewed(prev => {
        const merged = new Set(prev);
        for (const key of next) merged.add(key);
        return merged;
      });
    },

    // Черновик прежней методики остаётся нетронутым: возврат восстанавливает
    // введённое. Наружу уезжает только вновь выбранная ветка — сразу, без
    // ожидания ответа.
    changeMethod: next => {
      const nextConfig = props.methodConfigs.find(candidate => candidate.method === next);
      const nextDraft = drafts[next];
      if (!nextConfig || !nextDraft) return;

      const initial = pickInitialOpenSection(nextConfig, nextDraft);
      setMethod(next);
      setOpenSections([initial]);
      setReviewed(new Set([initial]));
      sendDraftNow(nextDraft, next);
    },

    changeValue: (key, name, value) => {
      const index = liftIndexOf(key);
      if (index === null) {
        changeBuilding(name, value);
        return;
      }

      changeLift(index, name, value);
    },

    addLift: () => {
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
      // Новую секцию добавили, чтобы заполнить: она раскрыта, остальные свёрнуты.
      setOpenSections([key]);
      setReviewed(prev => new Set(prev).add(key));
      sendDraftNow(next);
    },

    removeLift: index => {
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
      // Перенумерация: раскрытие и счёт просмотренного не должны переехать на
      // соседний лифт.
      setOpenSections(prev => [...shiftSectionsAfterRemove(new Set(prev), index)]);
      setReviewed(prev => shiftSectionsAfterRemove(prev, index));
      sendDraftNow(next);
    },

    // «Далее» — навигация, а не отправка: свернуть всё и раскрыть ровно одну
    // следующую цель со скроллом к ней. Клиентской блокировки submit'а нет —
    // о недостающем судит агент.
    submit: () => {
      if (!pending) {
        if (props.pendingLabel === undefined && missing.size > 0) return;
        cancelPendingDraft();
        sink.onSubmit({method: config.method, building: draft.building, lifts: draft.lifts});
        return;
      }

      const target = missing.keys().next().value ?? sectionOrder.find(key => !reviewed.has(key));
      if (target === undefined) return;

      setOpenSections([target]);
      setReviewed(prev => new Set(prev).add(target));
      scrollToElement(sectionNodes.current.get(target) ?? null);
      // «Далее» фиксирует заполненное немедленно, не дожидаясь дебаунса.
      sendDraftNow();
    },

    bindSection: key => node => {
      if (node === null) {
        sectionNodes.current.delete(key);
      } else {
        sectionNodes.current.set(key, node);
      }
    },
  };
}
