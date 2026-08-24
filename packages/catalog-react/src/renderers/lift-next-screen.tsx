import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import type {LiftEditorProps} from '@ai37/a2ui-catalog-schemas';
import {Button, Card, CardHeader, KIT_SCOPE, KitStyles, SectionItem} from '../primitives';
import {buildLiftSectionSummary} from './build-lift-section-summary';
import {LiftNextAddButton} from './lift-next-add-button';
import {LiftNextBadge} from './lift-next-badge';
import {LiftNextFields} from './lift-next-fields';
import {LiftNextHeaderContext} from './lift-next-header-context';
import {LiftNextMethodSwitcher} from './lift-next-method-switcher';
import {LiftNextRemoveButton} from './lift-next-remove-button';
import {LiftNextRecommendSlot} from './lift-next-recommend-slot';
import {useLiftEditorNext} from './use-lift-editor-next';
import type {LiftSectionKey} from './lift-editor.types';
import type {LiftNextSink} from './lift-next.types';

/**
 * Экран `LiftEditor` на примитивах каталога: карточка с переключателем методики
 * в шапке, секция «Здание» и секции лифтов, кнопка подвала в двух режимах.
 *
 * Секции — один `Accordion` с управляемым значением: раскрыта одна за раз, а
 * «Далее» и добавление лифта раскрывают ровно ту, которую нужно заполнять.
 * Клавиатура, `aria-expanded` и роли — библиотечные.
 *
 * Экран отделён от `LiftEditorNext` ради второго потребителя — песочницы
 * `/proba/lift-assembly`, где то же самое стоит без a2ui-контекста: получатель
 * состояния приходит `sink`'ом, а не берётся из `dispatchAction`.
 */
export function LiftNextScreen({props, sink}: {props: LiftEditorProps; sink: LiftNextSink}) {
  const control = useLiftEditorNext(props, sink);
  const {config, draft, perLift} = control;
  // Экранов на странице может быть два (две ветки витрины, старый и новый
  // рендерер в одном треде), и «Здание» на ней тоже два: id панелей несут
  // уникальную приставку, иначе aria-controls обеих кнопок указывал бы в одну
  // панель.
  const scope = React.useId();
  const panelId = (key: LiftSectionKey) => `${scope}-${key}`;

  // Секции разрезаны на два аккордеона: между ними стоит блок подбора, а он
  // не секция. Значение раскрытия у обоих общее и управляемое, поэтому
  // «раскрыта одна за раз» продолжает действовать через границу.
  const accordion = {
    multiple: false as const,
    value: control.openSections,
    onValueChange: (next: string[]) => control.setOpenSections(next as LiftSectionKey[]),
    style: listStyle,
  };

  // Поля экспандера в сводку не идут: сводка обещает заполненное, а дефолты
  // видны своей строкой внутри секции.
  const visible = (fields: readonly (typeof config.buildingFields)[number][]) =>
    fields.filter(field => field.advanced !== true);

  return (
    <div className={KIT_SCOPE}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          {/* Шапка — утопленная полоса, как секции: вложенная карточка берёт
              второй уровень фона от CSS, `flat` снимает рамку. Титул тянется,
              поэтому контекст и переключатель стоят в правом крае. */}
          <Card flat>
            <CardHeader
              title={
                <span style={headTitleStyle} className="a2ui-t--body a2ui-t--strong">
                  {props.headerTitle}
                </span>
              }
              status={<LiftNextHeaderContext context={props.headerContext} />}
              action={
                <LiftNextMethodSwitcher
                  configs={props.methodConfigs}
                  method={config.method}
                  buildingKind={control.buildingKind}
                  onChange={control.changeMethod}
                />
              }
            />
          </Card>

          <Accordion.Root {...accordion}>
            <SectionItem
              value="building"
              panelId={panelId('building')}
              title={props.buildingTabLabel}
              summary={buildLiftSectionSummary(visible(config.buildingFields), draft.building)}
              badge={<LiftNextBadge tone={control.badgeFor('building')} />}
              sectionRef={control.bindSection('building')}
            >
              <LiftNextFields
                advancedId={`${panelId('building')}-advanced`}
                fields={config.buildingFields}
                values={draft.building}
                building={draft.building}
                advancedLabel={props.advancedLabel}
                sources={control.sourcesFor('building')}
                onChange={(name, value) => control.changeValue('building', name, value)}
              />
            </SectionItem>
          </Accordion.Root>

          {/* Блок подбора между «Зданием» и лифтами: он не секция аккордеона,
              поэтому список секций разрезан на две части, а не свёрнут в один
              `Accordion.Root`. В навигации «Далее» и в счёте просмотренного
              блок не участвует. */}
          <LiftNextRecommendSlot
            recommend={props.recommend}
            building={draft.building}
            lift={draft.lifts[0] ?? {}}
            onApply={control.applyRecommendation}
          />

          <Accordion.Root {...accordion}>
            {draft.lifts.map((lift, index) => {
              const key: LiftSectionKey = `lift-${index}`;

              return (
                <SectionItem
                  key={key}
                  value={key}
                  panelId={panelId(key)}
                  title={perLift ? `${config.liftTabLabel} ${index + 1}` : config.liftTabLabel}
                  summary={buildLiftSectionSummary(visible(config.liftFields), lift)}
                  badge={<LiftNextBadge tone={control.badgeFor(key)} />}
                  sectionRef={control.bindSection(key)}
                  action={
                    <LiftNextRemoveButton
                      perLift={perLift}
                      count={draft.lifts.length}
                      index={index}
                      label={props.removeLabel}
                      onClick={() => control.removeLift(index)}
                    />
                  }
                >
                  <LiftNextFields
                    advancedId={`${panelId(key)}-advanced`}
                    fields={config.liftFields}
                    values={lift}
                    building={draft.building}
                    advancedLabel={props.advancedLabel}
                    sources={control.sourcesFor(key)}
                    onChange={(name, value) => control.changeValue(key, name, value)}
                  />
                </SectionItem>
              );
            })}
          </Accordion.Root>

          <LiftNextAddButton
            perLift={perLift}
            label={props.addLabel}
            disabled={!control.canAddLift}
            onClick={control.addLift}
          />

          <div style={footerStyle}>
            {/* Двухрежимная: «Далее» ведёт по секциям, «Рассчитать» отправляет.
                Клиентской блокировки нет — незаполненное судит агент; блокировка
                остаётся только на пути отката, где `pendingLabel` не задан. */}
            <Button
              variant="filled"
              size="lg"
              disabled={control.blocked}
              onClick={control.submit}
            >
              {control.pending ? props.pendingLabel : props.submitLabel}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/** Титул шапки забирает свободное место: остальное уезжает в правый край. */
const headTitleStyle: React.CSSProperties = {flex: 1, minWidth: 0};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 12, padding: 16};

const listStyle: React.CSSProperties = {display: 'grid', gap: 8};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};
