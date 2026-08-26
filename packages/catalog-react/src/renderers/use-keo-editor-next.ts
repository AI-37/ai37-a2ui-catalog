import React from 'react';
import type {CalcEditorField, KeoEditorProps} from '@ai37/a2ui-catalog-schemas';
import {calcFieldRangeWarning} from './calc-field-range-warning';
import {calcTouchedKey} from './calc-touched-key';
import {countCalcSources} from './count-calc-sources';
import {createCalcScreens} from './create-calc-screens';
import {createLocalId} from './create-local-id';
import {evaluateKeoRules} from './evaluate-keo-rules';
import {formatCalcSourceCounter} from './format-calc-source-counter';
import {isRevealedField} from './is-revealed-field';
import {resolveKeoComputedNote} from './resolve-keo-computed-note';
import {seedCalcValues} from './seed-calc-values';
import {findMissingKeoTargets} from './find-missing-keo-targets';
import {KEO_CONDITIONS_KEY} from './keo-conditions-key';
import {keoNavigationTargets} from './keo-navigation-targets';
import {keoOpenWithRoom} from './keo-open-with-room';
import {keoTargetRoom} from './keo-target-room';
import type {KeoControl, KeoRoomDraft, KeoSink} from './keo-next.types';

/**
 * Состояние экрана КЕО: помещения, раскрытие, просмотр секций и счётчик
 * источников. Доменных знаний здесь нет — правила, границы, подписи плоскости
 * и состав полей приходят наполнением, а считают их готовые модули пакета
 * (`evaluate-keo-rules`, `is-revealed-field`, `count-calc-sources` и соседи),
 * общие с нынешним `KeoEditor`: два экрана обязаны вести себя одинаково, а не
 * считать одно и то же дважды.
 *
 * Раскрытие — состояние клиента: агент им не владеет (Решение 3 design). Оно
 * живёт ОДНИМ множеством на весь экран, хотя аккордеонов на нём много, —
 * иначе «Далее», раскрывающее секцию в другом помещении, пришлось бы
 * рассылать по нескольким состояниям.
 */
export function useKeoEditorNext(props: KeoEditorProps, sink: KeoSink): KeoControl {
  const sections = props.roomTemplate.sections;
  const templateFields = sections.flatMap(section => section.fields);
  // Группа условий — раскрывашка только с заголовком: без него ей нечем
  // подписать триггер, и она стоит открытым блоком (Решение 4 design).
  const collapsibleConditions = props.conditionsLabel !== undefined;
  // Проход по секциям существует, только если для него прислали подпись:
  // русского слова компонент не сочиняет, а кнопка без подписи невозможна.
  const walkthrough = props.nextLabel !== undefined;

  const seed = (source: KeoEditorProps) => {
    const rooms = createCalcScreens(source.rooms);
    const missing = findMissingKeoTargets(rooms, sections);
    const targets = keoNavigationTargets(rooms, sections, collapsibleConditions);
    // Раскрыта первая цель с незаполненными обязательными полями; таких нет —
    // первая по порядку (канон `pickInitialOpenSection` лифтов).
    const initial = targets.find(target => missing.has(target)) ?? targets[0]!;

    return {
      rooms,
      // Условия — тоже состояние: город строительства правится на экране.
      conditions: Object.fromEntries(source.conditions.map(item => [item.name, item.value])),
      open: keoOpenWithRoom(initial),
    };
  };

  const [state, setState] = React.useState(() => seed(props));
  const [touched, setTouched] = React.useState<ReadonlySet<string>>(() => new Set());
  const [reviewed, setReviewed] = React.useState<ReadonlySet<string>>(() => new Set(state.open));

  // Новое сообщение агента — новый документ: state пересевается из props,
  // несохранённые правки и счёт просмотренного теряются (канон FormCard/CE/LE).
  const propsKey = JSON.stringify([props.rooms, props.roomTemplate, props.conditions]);
  const [baseKey, setBaseKey] = React.useState(propsKey);
  if (propsKey !== baseKey) {
    const next = seed(props);
    setBaseKey(propsKey);
    setState(next);
    setTouched(new Set());
    setReviewed(new Set(next.open));
  }

  const {rooms, conditions, open} = state;
  const roomLabels = rooms.map((room, position) => room.name ?? `${props.roomLabel} ${position + 1}`);
  const targets = keoNavigationTargets(rooms, sections, collapsibleConditions);
  const missing = findMissingKeoTargets(rooms, sections);
  // Кнопка ведёт по секциям, пока есть незаполненные обязательные поля или
  // непросмотренные цели. Без подписи режима нет: кнопка сразу отправляет.
  const pending = walkthrough && (missing.size > 0 || targets.some(target => !reviewed.has(target)));
  const outerKeys = new Set([KEO_CONDITIONS_KEY, ...rooms.map(room => room.id)]);

  // Предупреждения правил считаются один раз на помещение за рендер: полей у
  // помещения 23, и гонять правила на каждое незачем.
  const ruleCache = new Map<string, Map<string, string[]>>();
  const rulesFor = (room: KeoRoomDraft) => {
    const cached = ruleCache.get(room.id);
    if (cached !== undefined) return cached;

    const computed = evaluateKeoRules(props.validationRules ?? [], room.values);
    ruleCache.set(room.id, computed);

    return computed;
  };

  const review = (keys: Iterable<string>) =>
    setReviewed(prev => {
      const merged = new Set(prev);
      for (const key of keys) merged.add(key);
      return merged;
    });

  const replaceOpen = (next: Set<string>) => {
    setState(prev => ({...prev, open: next}));
    review(next);
  };

  return {
    rooms,
    roomLabels,
    sections,
    open,
    counter: formatCalcSourceCounter(
      // Счётчик считает ВЕСЬ документ, а не раскрытое помещение: сводка футера
      // описывает то, что уедет агенту.
      countCalcSources([
        ...props.conditions.map(condition => ({
          source: condition.source,
          edited: touched.has(calcTouchedKey(KEO_CONDITIONS_KEY, condition.name)),
        })),
        ...rooms.flatMap(room =>
          templateFields
            .filter(field => isRevealedField(field, room.values))
            .map(field => ({
              source: room.sources[field.name],
              edited: touched.has(calcTouchedKey(room.id, field.name)),
            })),
        ),
      ]),
    ),
    pending,
    canAddRoom: props.maxRooms === undefined || rooms.length < props.maxRooms,

    // Замена значения трогает только ключи своего списка: аккордеонов на экране
    // много, и общее множество иначе схлопывало бы соседний.
    setOpen: (keys, scope) => {
      const owned =
        scope === 'outer'
          ? (key: string) => outerKeys.has(key)
          : (key: string) => keoTargetRoom(key) === scope.roomId;
      const next = new Set([...open].filter(key => !owned(key)));
      for (const key of keys) next.add(key);

      replaceOpen(next);
    },

    // «заполните» (пустые обязательные) перекрывает «просмотреть» (свёрнутая
    // непросмотренная); раскрытая заполненная секция обходится без пометки.
    badgeFor: key => {
      const isRoom = rooms.some(room => room.id === key);
      const hasMissing = isRoom
        ? [...missing].some(target => keoTargetRoom(target) === key)
        : missing.has(key);

      if (hasMissing) return 'fill';
      if (!reviewed.has(key) && !open.has(key)) return 'review';

      return undefined;
    },

    sourceFor: (roomId, field) =>
      rooms.find(room => room.id === roomId)?.sources[field],

    isEdited: (roomId, field) => touched.has(calcTouchedKey(roomId, field)),

    warningsFor: (room: KeoRoomDraft, field: CalcEditorField) => {
      const range = calcFieldRangeWarning(field, room.values[field.name]);

      return [...(rulesFor(room).get(field.name) ?? []), ...(range === undefined ? [] : [range])];
    },

    computedNoteFor: room =>
      props.computedNotes === undefined
        ? undefined
        : resolveKeoComputedNote(props.computedNotes, room.values),

    conditionValue: name => conditions[name] ?? '',

    isConditionEdited: name => touched.has(calcTouchedKey(KEO_CONDITIONS_KEY, name)),

    changeCondition: (name, value) => {
      setTouched(prev => new Set(prev).add(calcTouchedKey(KEO_CONDITIONS_KEY, name)));
      setState(prev => ({...prev, conditions: {...prev.conditions, [name]: value}}));
    },

    changeValue: (roomId, name, value) => {
      setTouched(prev => new Set(prev).add(calcTouchedKey(roomId, name)));
      setState(prev => ({
        ...prev,
        rooms: prev.rooms.map(room =>
          room.id === roomId ? {...room, values: {...room.values, [name]: value}} : room,
        ),
      }));
    },

    addRoom: () => {
      const room: KeoRoomDraft = {
        id: createLocalId(),
        name: undefined,
        values: seedCalcValues(templateFields),
        sources: {},
      };
      // Помещение добавили, чтобы заполнить: оно раскрыто вместе с первой
      // секцией, остальное остаётся как было — «Далее» здесь не нажимали.
      const next = new Set(open);
      next.add(room.id);
      const first = sections[0];
      if (first !== undefined) next.add(calcTouchedKey(room.id, first.key));

      setState(prev => ({...prev, rooms: [...prev.rooms, room], open: next}));
      review(next);
    },

    removeRoom: roomId => {
      if (rooms.length <= 1) return;
      const mine = (key: string) => key === roomId || keoTargetRoom(key) === roomId;

      setState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
        open: new Set([...prev.open].filter(key => !mine(key))),
      }));
      setReviewed(prev => new Set([...prev].filter(key => !mine(key))));
    },

    // «Далее» — навигация, а не отправка: закрыть текущую цель и раскрыть
    // ровно одну следующую. Клиентской блокировки submit нет — о недостающем
    // судит агент (канон `LiftEditorNext`). Без `nextLabel` режима навигации
    // не существует, и кнопка отправляет с первого нажатия.
    submit: () => {
      const target = pending
        ? ([...missing][0] ?? targets.find(candidate => !reviewed.has(candidate)))
        : undefined;

      if (target === undefined) {
        sink.onSubmit({
          // Живые значения, а не присланные: правка города и есть смысл
          // «изменить только для расчёта».
          conditions,
          rooms: rooms.map((room, position) => ({
            name: roomLabels[position]!,
            values: room.values,
          })),
        });
        return;
      }

      replaceOpen(keoOpenWithRoom(target));
    },
  };
}
