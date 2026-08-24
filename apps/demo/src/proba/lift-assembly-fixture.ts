import {liftEditorPropsSchema} from '@ai37/a2ui-catalog-schemas';
import groupFixture from '../../../../fixtures/valid/lift-editor-group.json';
import perLiftFixture from '../../../../fixtures/valid/lift-editor-recommend.json';
import type {LiftBranch} from './lift-assembly.types';

/**
 * Наполнение витрины — валидные фикстуры каталога, а не выдуманные данные.
 * Обе несут оба конфига методик и различаются только активным, поэтому
 * переключатель на любой из них работает в обе стороны.
 *
 * Разбор схемой, а не приведение типа: JSON из репозитория и типы пакета
 * разъезжаются молча, а `parse` уронит страницу на первом же расхождении.
 */
export const LIFT_BRANCHES: LiftBranch[] = [
  {
    id: 'per-lift',
    title: 'ГОСТ Р 52941-2008 · жилые здания',
    lead: 'Секция «Здание» и секции «Лифт 1…N»: лифты добавляются и удаляются.',
    props: liftEditorPropsSchema.parse(perLiftFixture.props),
  },
  {
    id: 'group',
    title: 'ГОСТ 34758-2021 · лифтовая группа',
    lead: 'Секция «Здание» и одна секция группы: тип здания переключает ряды Прил. Е.',
    props: liftEditorPropsSchema.parse(groupFixture.props),
  },
];
