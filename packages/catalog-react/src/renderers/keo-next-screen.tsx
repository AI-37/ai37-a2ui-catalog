import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {Card, CardHeader, KIT_SCOPE, KitStyles} from '../primitives';
import {KEO_CONDITIONS_KEY} from './keo-conditions-key';
import {KeoNextAddRoom} from './keo-next-add-room';
import {KeoNextConditionsSection} from './keo-next-conditions-section';
import {KeoNextConditionsSlot} from './keo-next-conditions-slot';
import {KeoNextFooter} from './keo-next-footer';
import {KeoNextRoom} from './keo-next-room';
import {MIN_EDITOR_ITEMS} from './min-editor-items';
import {useKeoEditorNext} from './use-keo-editor-next';
import type {KeoScreenProps} from './keo-next.types';

/**
 * Экран `KeoEditor` на примитивах каталога: шапка утопленной полосой, условия,
 * помещения секциями со своими секциями внутри, кнопка добавления и подвал.
 *
 * Секции — `Accordion` с `multiple: true`: раскрыть можно сколько угодно, и
 * «Далее» — единственное, что закрывает предыдущую (Решение 1 design
 * архивного `proba-keo-assembly`). Клавиатура, `aria-expanded` и роли —
 * библиотечные.
 *
 * Экран отделён от `KeoEditorNext` ради второго потребителя — песочницы
 * `/proba/keo-assembly`, где то же самое стоит без a2ui-контекста: получатель
 * состояния приходит `sink`'ом, а не берётся из `dispatchAction`.
 */
export function KeoNextScreen({props, sink}: KeoScreenProps) {
  const control = useKeoEditorNext(props, sink);
  // Экранов на странице может быть два (старый и новый рендерер в одном
  // треде), и «Условия» на ней тоже два: id панелей несут уникальную
  // приставку, иначе aria-controls обеих кнопок указывал бы в одну панель.
  const scope = React.useId();
  const panelId = (key: string) => `${scope}-${key}`;
  const outer = new Set([KEO_CONDITIONS_KEY, ...control.rooms.map(room => room.id)]);
  // Вычисляемая строка стоит в секции, где живёт поле назначения: от него она
  // и зависит.
  const purposeSection = control.sections.find(section =>
    section.fields.some(field => field.name === props.computedNotes?.purposeField),
  )?.key;

  return (
    <div className={KIT_SCOPE}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          {/* Шапка — утопленная полоса, как у лифтов: титул тянется, мета
              уезжает в правый край. Слот действия пуст — переключать методику
              на этом экране нечего. */}
          <Card flat>
            <CardHeader
              title={
                <span style={headTitleStyle} className="a2ui-t--body a2ui-t--strong">
                  {props.title}
                </span>
              }
              status={<span className="a2ui-t--sub a2ui-t--muted">{props.meta}</span>}
            />
          </Card>

          <KeoNextConditionsSlot
            control={control}
            conditions={props.conditions}
            label={props.conditionsLabel}
          />

          <Accordion.Root
            multiple
            value={[...control.open].filter(key => outer.has(key))}
            onValueChange={(next: string[]) => control.setOpen(next, 'outer')}
            style={listStyle}
          >
            <KeoNextConditionsSection
              control={control}
              conditions={props.conditions}
              label={props.conditionsLabel}
              panelId={panelId(KEO_CONDITIONS_KEY)}
            />

            {control.rooms.map((room, position) => (
              <KeoNextRoom
                key={room.id}
                control={control}
                room={room}
                title={control.roomLabels[position]!}
                removable={control.rooms.length > MIN_EDITOR_ITEMS}
                removeLabel={props.removeRoomLabel}
                panelId={panelId}
                computedLabel={props.computedNotes?.label}
                purposeSection={purposeSection}
              />
            ))}
          </Accordion.Root>

          <KeoNextAddRoom
            label={props.addRoomLabel}
            state={control.addRoomState}
            onClick={control.addRoom}
          />

          <KeoNextFooter
            counter={control.counter}
            sourcesLabel={props.sourcesLabel}
            pending={control.pending}
            nextLabel={props.nextLabel}
            submitLabel={props.submit.label}
            onSubmit={control.submit}
          />
        </div>
      </Card>
    </div>
  );
}

/** Титул шапки забирает свободное место: мета уезжает в правый край. */
const headTitleStyle: React.CSSProperties = {flex: 1, minWidth: 0};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 12, padding: 16};

const listStyle: React.CSSProperties = {display: 'grid', gap: 8};
