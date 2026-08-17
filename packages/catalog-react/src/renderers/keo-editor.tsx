import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {keoEditorDefinition, type CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import {buildCalcSectionSummary} from './build-calc-section-summary';
import {CalcEditorField as CalcField} from './calc-editor-field';
import {calcFieldRangeWarning} from './calc-field-range-warning';
import {calcTouchedKey} from './calc-touched-key';
import {CalcConditions} from './calc-conditions';
import {CalcTabs} from './calc-tabs';
import {countCalcSources} from './count-calc-sources';
import {createCalcScreens} from './create-calc-screens';
import {createLocalId} from './create-local-id';
import {evaluateKeoRules} from './evaluate-keo-rules';
import {formatCalcSourceCounter} from './format-calc-source-counter';
import {isRevealedField} from './is-revealed-field';
import {KeoEditorSection} from './keo-editor-section';
import {KEO_EDITOR_CSS, KEO_EDITOR_STYLE_HREF} from './keo-editor-styles';
import {resolveKeoComputedNote} from './resolve-keo-computed-note';
import {seedCalcValues} from './seed-calc-values';
import {StyleTag} from './style-tag';
import {useA2uiBaseStyles} from './shared';

/**
 * Сбор исходных данных расчёта КЕО одним экраном: readonly-условия сверху,
 * помещения вкладками («Помещение 1…N» с добавлением и удалением), секции
 * помещения — назначение, геометрия, светопроём, затенение (раскрывается
 * полем-триггером) и свёрнутый блок принятых коэффициентов.
 *
 * Всё редактирование локально: наружу уходит РОВНО ОДИН submit с полным
 * документом `{conditions, rooms}`. Нормативных знаний в компоненте нет —
 * плоскость и точка расчёта выбираются готовой строкой из `computedNotes`, а
 * предупреждения считаются по правилам из `validationRules` и ничего не
 * блокируют (канон «! проверить» ConstructionsEditor).
 */
export const KeoEditor = createComponentImplementation(keoEditorDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const [rooms, setRooms] = React.useState(() => createCalcScreens(props.rooms));
  const [activeIndex, setActiveIndex] = React.useState(0);
  // Правленные поля: ключ «id помещения :: поле». Метка источника у них
  // становится «изменено вами», в счётчике они уходят в свою группу.
  const [touched, setTouched] = React.useState<ReadonlySet<string>>(() => new Set());
  // Раскрытые секции-экспандеры: ключ «id помещения :: ключ секции».
  const [openSections, setOpenSections] = React.useState<ReadonlySet<string>>(() => new Set());

  // Новое сообщение агента — новый документ: state пересевается из props,
  // несохранённые правки теряются (канон FormCard/CE/LE).
  const propsKey = JSON.stringify([props.rooms, props.roomTemplate, props.conditions]);
  const [baseKey, setBaseKey] = React.useState(propsKey);
  if (propsKey !== baseKey) {
    setBaseKey(propsKey);
    setRooms(createCalcScreens(props.rooms));
    setActiveIndex(0);
    setTouched(new Set());
    setOpenSections(new Set());
  }

  const sections = props.roomTemplate.sections;
  const templateFields = sections.flatMap(section => section.fields);
  const index = Math.min(activeIndex, rooms.length - 1);
  const active = rooms[index]!;
  const roomLabels = rooms.map((room, position) => room.name ?? `${props.roomLabel} ${position + 1}`);

  const isEdited = (roomId: string, field: string) => touched.has(calcTouchedKey(roomId, field));

  const handleChange = (name: string, value: string | boolean) => {
    setTouched(prev => new Set(prev).add(calcTouchedKey(active.id, name)));
    setRooms(prev =>
      prev.map(room =>
        room.id === active.id ? {...room, values: {...room.values, [name]: value}} : room,
      ),
    );
  };

  const handleAddRoom = () => {
    setRooms(prev => [
      ...prev,
      {id: createLocalId(), name: undefined, values: seedCalcValues(templateFields), sources: {}},
    ]);
    setActiveIndex(rooms.length);
  };

  const handleRemoveRoom = () => {
    if (rooms.length <= 1) return;
    setRooms(prev => prev.filter(room => room.id !== active.id));
    setActiveIndex(Math.max(0, index - 1));
  };

  const handleToggleSection = (sectionKey: string) => {
    const key = calcTouchedKey(active.id, sectionKey);
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    void context.dispatchAction({
      event: {
        name: props.submit.name,
        context: {
          conditions: Object.fromEntries(
            props.conditions.map(condition => [condition.name, condition.value]),
          ),
          rooms: rooms.map((room, position) => ({
            name: roomLabels[position]!,
            values: room.values,
          })),
        },
      },
    });
  };

  // Предупреждения активного помещения: правила из props плюс диапазоны полей.
  const ruleWarnings = evaluateKeoRules(props.validationRules ?? [], active.values);
  const warningsFor = (field: CalcEditorField): string[] => {
    const range = calcFieldRangeWarning(field, active.values[field.name]);

    return [...(ruleWarnings.get(field.name) ?? []), ...(range === undefined ? [] : [range])];
  };

  // Счётчик считает ВЕСЬ документ, а не активную вкладку: сводка футера
  // описывает то, что уедет агенту.
  const counter = formatCalcSourceCounter(
    countCalcSources(
      rooms.flatMap(room =>
        templateFields
          .filter(field => isRevealedField(field, room.values))
          .map(field => ({
            source: room.sources[field.name],
            edited: isEdited(room.id, field.name),
          })),
      ),
    ),
  );

  const computedNote =
    props.computedNotes === undefined
      ? undefined
      : resolveKeoComputedNote(props.computedNotes, active.values);

  return (
    <div className="a2ui-ke">
      <StyleTag href={KEO_EDITOR_STYLE_HREF} css={KEO_EDITOR_CSS} />
      <header className="a2ui-ke__header">
        <span className="a2ui-ke__header-title">{props.title}</span>
        {props.meta !== undefined ? <span className="a2ui-ke__header-meta">{props.meta}</span> : null}
      </header>
      <CalcConditions prefix="ke" conditions={props.conditions} />
      <CalcTabs
        prefix="ke"
        labels={roomLabels}
        activeIndex={index}
        addLabel={props.addRoomLabel}
        addDisabled={props.maxRooms !== undefined && rooms.length >= props.maxRooms}
        onSelect={setActiveIndex}
        onAdd={handleAddRoom}
      />
      {rooms.length > 1 ? (
        <div className="a2ui-ke__room-head">
          <button type="button" className="a2ui-ke-link a2ui-ke-link--danger" onClick={handleRemoveRoom}>
            {props.removeRoomLabel}
          </button>
        </div>
      ) : null}
      {computedNote !== undefined && props.computedNotes ? (
        <div className="a2ui-ke-computed">
          <span className="a2ui-ke-computed__label">{props.computedNotes.label}</span>
          <span className="a2ui-ke-computed__value">{computedNote}</span>
        </div>
      ) : null}
      {sections.map(section => {
        const visible = section.fields.filter(field => isRevealedField(field, active.values));

        return (
          <KeoEditorSection
            key={section.key}
            section={section}
            summary={buildCalcSectionSummary(section.fields, active.values)}
            open={openSections.has(calcTouchedKey(active.id, section.key))}
            onToggle={() => handleToggleSection(section.key)}
          >
            {visible.map(field => (
              <CalcField
                key={field.name}
                prefix="ke"
                field={field}
                value={active.values[field.name]}
                source={active.sources[field.name]}
                edited={isEdited(active.id, field.name)}
                warnings={warningsFor(field)}
                onChange={value => handleChange(field.name, value)}
              />
            ))}
          </KeoEditorSection>
        );
      })}
      <footer className="a2ui-ke__footer">
        {counter === '' ? null : (
          <span className="a2ui-ke__sources">
            {props.sourcesLabel === undefined ? counter : `${props.sourcesLabel}: ${counter}`}
          </span>
        )}
        <button type="button" className="a2ui-ke-submit" onClick={handleSubmit}>
          {props.submit.label}
        </button>
      </footer>
    </div>
  );
});
