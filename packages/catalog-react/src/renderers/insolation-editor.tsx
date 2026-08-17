import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {insolationEditorDefinition} from '@ai37/a2ui-catalog-schemas';
import {CalcConditions} from './calc-conditions';
import {CalcEditorField as CalcField} from './calc-editor-field';
import {calcFieldRangeWarning} from './calc-field-range-warning';
import {calcTouchedKey} from './calc-touched-key';
import {CalcTabs} from './calc-tabs';
import {countCalcSources} from './count-calc-sources';
import {createCalcScreens} from './create-calc-screens';
import {createLocalId} from './create-local-id';
import {formatCalcSourceCounter} from './format-calc-source-counter';
import {InsolationBuildings} from './insolation-editor-buildings';
import {InsolationNotices} from './insolation-editor-notices';
import {
  INSOLATION_EDITOR_CSS,
  INSOLATION_EDITOR_STYLE_HREF,
} from './insolation-editor-styles';
import {isRevealedField} from './is-revealed-field';
import {seedCalcValues} from './seed-calc-values';
import {StyleTag} from './style-tag';
import {useA2uiBaseStyles} from './shared';

/**
 * Сбор исходных данных расчёта инсоляции одним экраном: readonly-условия
 * (регион с широтной зоной, норматив с периодом), расчётные точки вкладками
 * («Точка 1…N» с добавлением и удалением) и общий для всех точек список
 * затеняющих зданий компактными строками.
 *
 * Всё редактирование локально: наружу уходит РОВНО ОДИН submit с документом
 * `{conditions, points, buildings}`. Значения, посчитанные агентом (отметка
 * центра окна, дата проверки), остаются редактируемыми и помеченными —
 * КЛИЕНТСКОГО пересчёта нет: пересчёт по этажу — знание агента (Решение 4
 * design.md).
 */
export const InsolationEditor = createComponentImplementation(
  insolationEditorDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const [points, setPoints] = React.useState(() => createCalcScreens(props.points));
    const [buildings, setBuildings] = React.useState(() => createCalcScreens(props.buildings));
    const [activeIndex, setActiveIndex] = React.useState(0);
    // Правленные поля точек и зданий: ключ «id экрана :: поле».
    const [touched, setTouched] = React.useState<ReadonlySet<string>>(() => new Set());

    // Новое сообщение агента — новый документ (канон FormCard/CE/LE).
    const propsKey = JSON.stringify([props.points, props.buildings, props.conditions]);
    const [baseKey, setBaseKey] = React.useState(propsKey);
    if (propsKey !== baseKey) {
      setBaseKey(propsKey);
      setPoints(createCalcScreens(props.points));
      setBuildings(createCalcScreens(props.buildings));
      setActiveIndex(0);
      setTouched(new Set());
    }

    const index = Math.min(activeIndex, points.length - 1);
    const active = points[index]!;
    const pointLabels = points.map(
      (point, position) => point.name ?? `${props.pointLabel} ${position + 1}`,
    );

    const isEdited = (screenId: string, field: string) =>
      touched.has(calcTouchedKey(screenId, field));

    const markTouched = (screenId: string, field: string) =>
      setTouched(prev => new Set(prev).add(calcTouchedKey(screenId, field)));

    const handlePointChange = (name: string, value: string | boolean) => {
      markTouched(active.id, name);
      setPoints(prev =>
        prev.map(point =>
          point.id === active.id ? {...point, values: {...point.values, [name]: value}} : point,
        ),
      );
    };

    const handleAddPoint = () => {
      setPoints(prev => [
        ...prev,
        {
          id: createLocalId(),
          name: undefined,
          values: seedCalcValues(props.pointTemplate.fields),
          sources: {},
        },
      ]);
      setActiveIndex(points.length);
    };

    const handleRemovePoint = () => {
      if (points.length <= 1) return;
      setPoints(prev => prev.filter(point => point.id !== active.id));
      setActiveIndex(Math.max(0, index - 1));
    };

    const handleBuildingChange = (
      buildingId: string,
      field: string,
      value: string | boolean,
    ) => {
      markTouched(buildingId, field);
      setBuildings(prev =>
        prev.map(building =>
          building.id === buildingId
            ? {...building, values: {...building.values, [field]: value}}
            : building,
        ),
      );
    };

    const handleAddBuilding = () =>
      setBuildings(prev => [
        ...prev,
        {
          id: createLocalId(),
          name: undefined,
          values: seedCalcValues(props.buildingFields),
          sources: {},
        },
      ]);

    const handleRemoveBuilding = (buildingId: string) =>
      setBuildings(prev => prev.filter(building => building.id !== buildingId));

    const handleSubmit = () => {
      void context.dispatchAction({
        event: {
          name: props.submit.name,
          context: {
            conditions: Object.fromEntries(
              props.conditions.map(condition => [condition.name, condition.value]),
            ),
            points: points.map((point, position) => ({
              name: pointLabels[position]!,
              values: point.values,
            })),
            buildings: buildings.map(building => building.values),
          },
        },
      });
    };

    // Счётчик описывает ВЕСЬ документ (все точки и здания), а не активную вкладку.
    const counter = formatCalcSourceCounter(
      countCalcSources([
        ...points.flatMap(point =>
          props.pointTemplate.fields
            .filter(field => isRevealedField(field, point.values))
            .map(field => ({
              source: point.sources[field.name],
              edited: isEdited(point.id, field.name),
            })),
        ),
        ...buildings.flatMap(building =>
          props.buildingFields.map(field => ({
            source: building.sources[field.name],
            edited: isEdited(building.id, field.name),
          })),
        ),
      ]),
    );

    return (
      <div className="a2ui-ie">
        <StyleTag href={INSOLATION_EDITOR_STYLE_HREF} css={INSOLATION_EDITOR_CSS} />
        <header className="a2ui-ie__header">
          <span className="a2ui-ie__header-title">{props.title}</span>
          {props.meta !== undefined ? (
            <span className="a2ui-ie__header-meta">{props.meta}</span>
          ) : null}
        </header>
        <CalcConditions prefix="ie" conditions={props.conditions} />
        <CalcTabs
          prefix="ie"
          labels={pointLabels}
          activeIndex={index}
          addLabel={props.addPointLabel}
          addDisabled={props.maxPoints !== undefined && points.length >= props.maxPoints}
          onSelect={setActiveIndex}
          onAdd={handleAddPoint}
        />
        {points.length > 1 ? (
          <div className="a2ui-ie__point-head">
            <button
              type="button"
              className="a2ui-ie-link a2ui-ie-link--danger"
              onClick={handleRemovePoint}
            >
              {props.removePointLabel}
            </button>
          </div>
        ) : null}
        <section className="a2ui-ie-section">
          <div className="a2ui-ie-section__head">
            <span className="a2ui-ie-section__title">{props.pointTemplate.title}</span>
          </div>
          <div className="a2ui-ie-grid">
            {props.pointTemplate.fields
              .filter(field => isRevealedField(field, active.values))
              .map(field => {
                const range = calcFieldRangeWarning(field, active.values[field.name]);

                return (
                  <CalcField
                    key={field.name}
                    prefix="ie"
                    field={field}
                    value={active.values[field.name]}
                    source={active.sources[field.name]}
                    edited={isEdited(active.id, field.name)}
                    warnings={range === undefined ? [] : [range]}
                    onChange={value => handlePointChange(field.name, value)}
                  />
                );
              })}
          </div>
        </section>
        <InsolationBuildings
          title={props.buildingsTitle}
          fields={props.buildingFields}
          buildings={buildings}
          addLabel={props.addBuildingLabel}
          removeLabel={props.removeBuildingLabel}
          addDisabled={props.maxBuildings !== undefined && buildings.length >= props.maxBuildings}
          isEdited={isEdited}
          onChange={handleBuildingChange}
          onAdd={handleAddBuilding}
          onRemove={handleRemoveBuilding}
        />
        {props.notices ? <InsolationNotices notices={props.notices} /> : null}
        <footer className="a2ui-ie__footer">
          {counter === '' ? null : (
            <span className="a2ui-ie__sources">
              {props.sourcesLabel === undefined ? counter : `${props.sourcesLabel}: ${counter}`}
            </span>
          )}
          <button type="button" className="a2ui-ie-submit" onClick={handleSubmit}>
            {props.submit.label}
          </button>
        </footer>
      </div>
    );
  },
);
