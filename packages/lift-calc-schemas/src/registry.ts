import type { FieldDescriptor } from './types';

/** Ряд грузоподъёмностей ГОСТ 34758 (Табл. Г.1), кг. */
export const Q_OPTIONS_34758 = [
  450, 630, 800, 1000, 1275, 1350, 1600, 1800, 2000, 2500,
] as const;

/** Ряд ширин дверного проёма ГОСТ 34758, мм. */
export const DOORWIDTH_OPTIONS_34758 = [800, 900, 1000, 1100, 1200] as const;

/** Номинальные скорости с табличными h/t123 (ГОСТ Р 52941, VN_TABLE), м/с. */
export const VN_OPTIONS_52941 = [0.63, 1.0, 1.6, 2.5, 4.0] as const;

/**
 * Реестр полей ГОСТ Р 52941-2008 (жилые здания). Плоский набор (здание + один типовой лифт;
 * `nLifts` задаёт число одинаковых кабин в группе). Обязательны только N и A — остальное имеет
 * типовые дефолты или производится автоматически (h/t123 из скорости).
 */
export const FIELDS_52941: readonly FieldDescriptor[] = [
  { key: 'N', section: 'building', kind: 'int', min: 1, label: 'Число заселённых этажей', describe: 'Число заселённых этажей здания' },
  { key: 'A', section: 'building', kind: 'int', min: 1, label: 'Жильцы всего здания, чел.', describe: 'Общее число жильцов здания' },
  { key: 'hf', section: 'building', kind: 'number', default: 2.8, label: 'Высота этажа, м', describe: 'Высота этажа, м' },
  { key: 'i', section: 'building', kind: 'number', default: 8, min: 0, max: 100, label: 'Интенсивность пассажиропотока, %', describe: 'Расчётная интенсивность пассажиропотока, % (4–8 для жилых)' },
  { key: 'kp', section: 'building', kind: 'number', default: 0.7, min: 0, max: 1, label: 'Коэф. вероятной высоты подъёма', describe: 'Коэффициент вероятной высоты подъёма (0,7–0,9)' },
  { key: 'kt', section: 'building', kind: 'number', default: 1.05, min: 1, max: 2, label: 'Коэф. дополнительных потерь', describe: 'Коэффициент дополнительных потерь времени (1,05–1,10)' },
  { key: 'gammaUp', section: 'building', kind: 'number', default: 0.8, min: 0, max: 1, label: 'Коэф. заполнения при подъёме', describe: 'Коэффициент заполнения кабины при подъёме' },
  { key: 'gammaDown', section: 'building', kind: 'number', default: 0.4, min: 0, max: 1, label: 'Коэф. заполнения при спуске', describe: 'Коэффициент заполнения кабины при спуске' },

  { key: 'nLifts', section: 'building', kind: 'int', default: 1, min: 1, max: 10, label: 'Число лифтов в группе', describe: 'Число одинаковых лифтов в группе' },
  { key: 'Q', section: 'lift', kind: 'number', default: 1000, min: 1, label: 'Грузоподъёмность, кг', describe: 'Грузоподъёмность кабины, кг (типовые 400 / 630 / 1000)' },
  { key: 'Vn', section: 'lift', kind: 'enum-number', allowed: VN_OPTIONS_52941, default: 1.0, label: 'Номинальная скорость, м/с', describe: 'Номинальная скорость, м/с (0,63 / 1,0 / 1,6 / 2,5 / 4,0)' },
  { key: 'H0', section: 'lift', kind: 'number', default: 0, label: 'Отметка нижней остановки, м', describe: 'Отметка нижней остановки, м' },
  { key: 'Nn', section: 'lift', kind: 'int', default: 0, min: 0, label: 'Этажей без пользования лифтом', describe: 'Число нижних этажей без пользования лифтом' },
  { key: 'h', section: 'lift', kind: 'number', auto: true, min: 0, label: 'Путь разгона/торможения, м', describe: 'Путь разгона/торможения, м (по умолчанию из таблицы по скорости)' },
  { key: 't123', section: 'lift', kind: 'number', auto: true, min: 0, label: 'Потери t1+t2+t3, с', describe: 'Потери времени t1+t2+t3, с (по умолчанию из таблицы по скорости)' },
  { key: 'dt', section: 'lift', kind: 'number', default: 1, min: 0, label: 'Время на одного пассажира, с', describe: 'Время на вход/выход одного пассажира, с' },
];

/**
 * Реестр полей ГОСТ 34758-2021 — ТОЛЬКО НЕжилые здания (гостиницы / офисы). Жилые считаются по
 * ГОСТ Р 52941-2008 (продуктовое разделение: одна методика на тип здания, без пересечения). Одна
 * лифтовая группа (`Nl` одинаковых лифтов). `buildingType` (hotel/office) влияет на авто-`tOst`
 * (Прил. Е.2). Обязательны тип здания, N1/A/Nl, скорость и ширина двери; `tOst`/`Pk` — авто.
 */
export const FIELDS_34758: readonly FieldDescriptor[] = [
  { key: 'buildingType', section: 'building', kind: 'enum-string', allowed: ['hotel', 'office'], label: 'Тип здания', describe: 'Тип НЕжилого здания: hotel (гостиница) / office (офис). Жилые здания считаются по ГОСТ Р 52941-2008 (методика calc-lifts-52941).' },
  { key: 'N1', section: 'building', kind: 'int', min: 2, label: 'Число обслуживаемых этажей', describe: 'Число обслуживаемых лифтом этажей' },
  { key: 'A', section: 'building', kind: 'int', min: 1, label: 'Заселённость здания, чел.', describe: 'Расчётная заселённость здания, чел.' },
  { key: 'Nl', section: 'building', kind: 'int', min: 1, label: 'Число лифтов в группе', describe: 'Число одинаковых лифтов в группе' },
  { key: 'hf', section: 'building', kind: 'number', default: 3.3, min: 0, label: 'Высота этажа, м', describe: 'Высота этажа, м' },

  { key: 'Q', section: 'lift', kind: 'enum-number', allowed: Q_OPTIONS_34758, default: 1000, label: 'Грузоподъёмность, кг', describe: 'Грузоподъёмность из ряда 450/630/800/1000/1275/1350/1600/1800/2000/2500, кг' },
  { key: 'Vn', section: 'lift', kind: 'number', min: 0, label: 'Номинальная скорость, м/с', describe: 'Номинальная скорость, м/с' },
  { key: 'doorWidth', section: 'lift', kind: 'enum-number', allowed: DOORWIDTH_OPTIONS_34758, label: 'Ширина дверного проёма, мм', describe: 'Ширина дверного проёма из ряда 800/900/1000/1100/1200, мм' },
  { key: 'tOst', section: 'lift', kind: 'number', auto: true, min: 0, label: 'Время на остановку, с', describe: 'Время на остановку, с (по умолчанию авто по Прил. Е из ширины двери, скорости и типа здания)' },
  { key: 'Pk', section: 'lift', kind: 'number', auto: true, min: 0, label: 'Расчётная вместимость, чел.', describe: 'Расчётная вместимость кабины (по умолчанию авто round(E·0,8) по грузоподъёмности)' },
];

/** Реестр по идентификатору ГОСТ. */
export const REGISTRY = {
  '52941': FIELDS_52941,
  '34758': FIELDS_34758,
} as const;
