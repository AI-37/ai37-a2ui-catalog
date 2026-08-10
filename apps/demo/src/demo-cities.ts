/**
 * Демо-справочник `cities`: города для превью lookup-поля FormCard и вкладки
 * «Общие данные» ConstructionsEditor. Общий для action-имитации
 * (`demo-lookup-host`) и dev-middleware fetch-режима (`vite.config.ts`) — оба
 * канала отвечают одинаково.
 *
 * Опции несут климат — `tot` (средняя температура отопительного периода, °C),
 * `zot` (его продолжительность, сут) и `tn` (температура холодной пятидневки,
 * °C): выбор города подставляет их в поля вкладки. Значения здесь
 * ОРИЕНТИРОВОЧНЫЕ, только для превью; нормативные берёт из СП 131 агент —
 * владелец справочника.
 */
export type DemoCity = {
  value: string;
  label: string;
  tot: number;
  zot: number;
  tn: number;
};

export const DEMO_CITIES: DemoCity[] = [
  {value: 'moskva', label: 'Москва', tot: -2.2, zot: 205, tn: -25},
  {value: 'sankt-peterburg', label: 'Санкт-Петербург', tot: -1.3, zot: 213, tn: -24},
  {value: 'novosibirsk', label: 'Новосибирск', tot: -8.1, zot: 221, tn: -37},
  {value: 'ekaterinburg', label: 'Екатеринбург', tot: -6, zot: 221, tn: -32},
  {value: 'kazan', label: 'Казань', tot: -4.8, zot: 207, tn: -31},
  {value: 'nizhniy-novgorod', label: 'Нижний Новгород', tot: -4.1, zot: 212, tn: -30},
  {value: 'chelyabinsk', label: 'Челябинск', tot: -6.5, zot: 218, tn: -34},
  {value: 'samara', label: 'Самара', tot: -5.2, zot: 200, tn: -30},
  {value: 'omsk', label: 'Омск', tot: -8.4, zot: 216, tn: -37},
  {value: 'rostov-na-donu', label: 'Ростов-на-Дону', tot: -0.1, zot: 166, tn: -22},
  {value: 'ufa', label: 'Уфа', tot: -6, zot: 209, tn: -33},
  {value: 'krasnoyarsk', label: 'Красноярск', tot: -6.7, zot: 233, tn: -37},
  {value: 'voronezh', label: 'Воронеж', tot: -3.1, zot: 196, tn: -26},
  {value: 'perm', label: 'Пермь', tot: -5.9, zot: 225, tn: -35},
  {value: 'volgograd', label: 'Волгоград', tot: -2.4, zot: 177, tn: -25},
  {value: 'krasnodar', label: 'Краснодар', tot: 2, zot: 149, tn: -19},
  {value: 'sochi', label: 'Сочи', tot: 7.9, zot: 94, tn: -3},
  {value: 'murmansk', label: 'Мурманск', tot: -3.2, zot: 275, tn: -27},
  {value: 'yakutsk', label: 'Якутск', tot: -20.6, zot: 252, tn: -52},
  {value: 'vladivostok', label: 'Владивосток', tot: -3.9, zot: 196, tn: -23},
];
