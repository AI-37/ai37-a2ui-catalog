import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {liftEditorDefinition} from '@ai37/a2ui-catalog-schemas';
import {applyDependentRules} from './apply-dependent-rules';
import {createLiftEditorDrafts} from './create-lift-editor-drafts';
import {findMissingRequired} from './find-missing-required';
import {findRuleTargetsBySource} from './find-rule-targets-by-source';
import {LiftEditorScreen} from './lift-editor-screen';
import {LiftEditorTabs} from './lift-editor-tabs';
import {liftTouchedKey} from './lift-touched-key';
import {pickInitialLiftTab} from './pick-initial-lift-tab';
import {seedLiftValues} from './seed-lift-values';
import {shiftTouchedAfterRemove} from './shift-touched-after-remove';
import {useA2uiBaseStyles} from './shared';
import {tokens} from './tokens';
import type {LiftEditorDraft, LiftEditorTab} from './lift-editor.types';

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  background: tokens.accent,
  color: tokens.accentContrast,
  fontWeight: 600,
  cursor: 'pointer',
};

/**
 * Подбор лифтов одним сообщением: вкладки «Здание» + лифты (или единственная
 * лифтовая группа), переключение методики расчёта, добавление и удаление
 * лифтов, авто-подстановки нормативных значений — всё на клиенте, без единого
 * AG-UI-run до submit. Наружу уходит ровно один `dispatchAction` с полным
 * документом `{method, building, lifts}` активной ветки (Решение 10 design.md).
 *
 * Доменных знаний о ГОСТ в компоненте нет: конфиги методик, ряды подсказок и
 * строки зависимых значений целиком приходят в props.
 */
export const LiftEditor = createComponentImplementation(liftEditorDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const [method, setMethod] = React.useState(props.method);
  const [drafts, setDrafts] = React.useState(() => createLiftEditorDrafts(props));
  // Поля, правленные вручную: авто-подстановка их не перетирает, пока не
  // изменится хотя бы один источник правила.
  const [touched, setTouched] = React.useState<ReadonlySet<string>>(() => new Set());
  const [activeTab, setActiveTab] = React.useState<LiftEditorTab>(() =>
    pickInitialLiftTab(
      props.methodConfigs.find(config => config.method === props.method) ?? props.methodConfigs[0]!,
      createLiftEditorDrafts(props)[props.method] ?? {building: {}, lifts: [{}]},
    ),
  );

  // Новое сообщение агента — новый документ: state пересевается из props,
  // несохранённые правки теряются (как у FormCard/ConstructionsEditor).
  const propsKey = JSON.stringify([props.method, props.building, props.lifts]);
  const [baseKey, setBaseKey] = React.useState(propsKey);
  if (propsKey !== baseKey) {
    const nextDrafts = createLiftEditorDrafts(props);
    const nextConfig =
      props.methodConfigs.find(config => config.method === props.method) ?? props.methodConfigs[0]!;
    setBaseKey(propsKey);
    setMethod(props.method);
    setDrafts(nextDrafts);
    setTouched(new Set());
    setActiveTab(pickInitialLiftTab(nextConfig, nextDrafts[props.method]!));
  }

  const config =
    props.methodConfigs.find(candidate => candidate.method === method) ?? props.methodConfigs[0]!;
  const draft = drafts[config.method]!;
  const rules = config.dependentRules ?? [];
  const perLift = config.liftsMode === 'per-lift';
  // Смена методики могла укоротить список лифтов — вкладка не должна повиснуть.
  const liftIndex =
    typeof activeTab === 'number' ? Math.min(activeTab, draft.lifts.length - 1) : null;

  const updateDraft = (next: LiftEditorDraft) =>
    setDrafts(prev => ({...prev, [config.method]: next}));

  const isTouchedIn = (source: ReadonlySet<string>, index: number) => (field: string) =>
    source.has(liftTouchedKey(config.method, index, field));

  const handleBuildingChange = (name: string, value: string | boolean) => {
    const building = {...draft.building, [name]: value};
    // Поле здания — источник для полей ВСЕХ лифтов (тип здания → tOst).
    const nextTouched = new Set(touched);
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
  };

  // Черновик прежней методики остаётся нетронутым: случайный клик по селекту
  // не стирает работу, возврат восстанавливает введённое.
  const handleMethodChange = (next: string) => {
    setMethod(next);
    setActiveTab('building');
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
    updateDraft({building: draft.building, lifts});
    setActiveTab(lifts.length - 1);
  };

  const handleRemoveLift = (index: number) => {
    if (draft.lifts.length <= 1) return;
    setTouched(shiftTouchedAfterRemove(touched, config.method, index));
    updateDraft({building: draft.building, lifts: draft.lifts.filter((_u, i) => i !== index)});
    setActiveTab(0);
  };

  const incomplete = new Set<LiftEditorTab>();
  if (findMissingRequired(config.buildingFields, draft.building).length > 0) {
    incomplete.add('building');
  }
  draft.lifts.forEach((lift, index) => {
    if (findMissingRequired(config.liftFields, lift).length > 0) incomplete.add(index);
  });

  const handleSubmit = () => {
    if (incomplete.size > 0) return;
    void context.dispatchAction({
      event: {
        name: props.submitAction,
        // Только активная ветка: черновики остальных методик наружу не едут.
        context: {method: config.method, building: draft.building, lifts: draft.lifts},
      },
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 14,
        padding: 18,
        borderRadius: 18,
        border: `1px solid ${tokens.border}`,
        background: tokens.surface,
        color: tokens.text,
      }}
    >
      <LiftEditorTabs
        active={liftIndex ?? 'building'}
        buildingLabel={props.buildingTabLabel}
        liftTabLabel={config.liftTabLabel}
        perLift={perLift}
        liftCount={draft.lifts.length}
        addLabel={props.addLabel}
        canAdd={config.maxLifts === undefined || draft.lifts.length < config.maxLifts}
        incomplete={incomplete}
        onSelect={setActiveTab}
        onAdd={handleAddLift}
      />
      {liftIndex === null ? (
        <LiftEditorScreen
          title={config.buildingTitle}
          gostLabel={config.gostLabel}
          fields={config.buildingFields}
          values={draft.building}
          building={draft.building}
          advancedLabel={props.advancedLabel}
          methodSelect={{
            field: props.methodField,
            value: config.method,
            // Подписи методик — из конфигов: свой список опций у methodField
            // разошёлся бы с ключами `method`.
            options: props.methodConfigs.map(candidate => ({
              value: candidate.method,
              label: candidate.label,
            })),
            onChange: handleMethodChange,
          }}
          onChange={handleBuildingChange}
        />
      ) : (
        <LiftEditorScreen
          title={perLift ? `${config.liftTitle} ${liftIndex + 1}` : config.liftTitle}
          gostLabel={config.gostLabel}
          fields={config.liftFields}
          values={draft.lifts[liftIndex]!}
          building={draft.building}
          advancedLabel={props.advancedLabel}
          onChange={(name, value) => handleLiftChange(liftIndex, name, value)}
        />
      )}
      <footer style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
        {perLift && liftIndex !== null && draft.lifts.length > 1 ? (
          <button
            type="button"
            onClick={() => handleRemoveLift(liftIndex)}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              border: `1px solid ${tokens.borderStrong}`,
              background: 'transparent',
              color: tokens.danger,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {props.removeLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={incomplete.size > 0}
          style={{
            ...primaryButtonStyle,
            marginLeft: 'auto',
            opacity: incomplete.size > 0 ? 0.45 : 1,
            cursor: incomplete.size > 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {props.submitLabel}
        </button>
      </footer>
    </div>
  );
});
