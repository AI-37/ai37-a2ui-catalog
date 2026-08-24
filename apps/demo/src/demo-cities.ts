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
 *
 * Список длиннее, чем нужно для одного скриншота, намеренно: короткий
 * справочник не показывает, как ведёт себя попап, когда совпадений больше, чем
 * помещается в его высоту (`max-height`, прокрутка, подсветка в каждой строке).
 * Порядок алфавитный — у настоящего агента он по релевантности.
 */
export type DemoCity = {
  value: string;
  label: string;
  tot: number;
  zot: number;
  tn: number;
};

export const DEMO_CITIES: DemoCity[] = [
  {value: 'abakan', label: 'Абакан', tot: -7.9, zot: 225, tn: -37},
  {value: 'arkhangelsk', label: 'Архангельск', tot: -4.5, zot: 250, tn: -31},
  {value: 'astrakhan', label: 'Астрахань', tot: -1.2, zot: 167, tn: -22},
  {value: 'barnaul', label: 'Барнаул', tot: -7.7, zot: 221, tn: -37},
  {value: 'belgorod', label: 'Белгород', tot: -1.9, zot: 191, tn: -23},
  {value: 'biysk', label: 'Бийск', tot: -7.9, zot: 224, tn: -38},
  {value: 'blagoveshchensk', label: 'Благовещенск', tot: -10.6, zot: 212, tn: -34},
  {value: 'bratsk', label: 'Братск', tot: -8.9, zot: 244, tn: -40},
  {value: 'bryansk', label: 'Брянск', tot: -2.3, zot: 199, tn: -25},
  {value: 'velikiy-novgorod', label: 'Великий Новгород', tot: -2, zot: 216, tn: -27},
  {value: 'vladivostok', label: 'Владивосток', tot: -3.9, zot: 196, tn: -23},
  {value: 'vladimir', label: 'Владимир', tot: -3.5, zot: 213, tn: -28},
  {value: 'volgograd', label: 'Волгоград', tot: -2.4, zot: 177, tn: -25},
  {value: 'vologda', label: 'Вологда', tot: -4.1, zot: 228, tn: -32},
  {value: 'voronezh', label: 'Воронеж', tot: -3.1, zot: 196, tn: -26},
  {value: 'ekaterinburg', label: 'Екатеринбург', tot: -6, zot: 221, tn: -32},
  {value: 'ivanovo', label: 'Иваново', tot: -3.9, zot: 217, tn: -30},
  {value: 'izhevsk', label: 'Ижевск', tot: -5.6, zot: 218, tn: -34},
  {value: 'irkutsk', label: 'Иркутск', tot: -8.5, zot: 240, tn: -36},
  {value: 'yoshkar-ola', label: 'Йошкар-Ола', tot: -4.9, zot: 213, tn: -33},
  {value: 'kazan', label: 'Казань', tot: -4.8, zot: 207, tn: -31},
  {value: 'kaliningrad', label: 'Калининград', tot: 1.1, zot: 188, tn: -18},
  {value: 'kaluga', label: 'Калуга', tot: -2.9, zot: 208, tn: -27},
  {value: 'kemerovo', label: 'Кемерово', tot: -8.3, zot: 228, tn: -39},
  {value: 'kirov', label: 'Киров', tot: -5.4, zot: 226, tn: -33},
  {value: 'kostroma', label: 'Кострома', tot: -4, zot: 219, tn: -31},
  {value: 'krasnodar', label: 'Краснодар', tot: 2, zot: 149, tn: -19},
  {value: 'krasnoyarsk', label: 'Красноярск', tot: -6.7, zot: 233, tn: -37},
  {value: 'kurgan', label: 'Курган', tot: -7.7, zot: 213, tn: -37},
  {value: 'kursk', label: 'Курск', tot: -2.4, zot: 193, tn: -24},
  {value: 'lipetsk', label: 'Липецк', tot: -3.1, zot: 199, tn: -27},
  {value: 'magadan', label: 'Магадан', tot: -8.6, zot: 288, tn: -29},
  {value: 'magnitogorsk', label: 'Магнитогорск', tot: -7, zot: 214, tn: -34},
  {value: 'makhachkala', label: 'Махачкала', tot: 2.4, zot: 151, tn: -12},
  {value: 'moskva', label: 'Москва', tot: -2.2, zot: 205, tn: -25},
  {value: 'murmansk', label: 'Мурманск', tot: -3.2, zot: 275, tn: -27},
  {value: 'naberezhnye-chelny', label: 'Набережные Челны', tot: -5.3, zot: 212, tn: -32},
  {value: 'nizhniy-novgorod', label: 'Нижний Новгород', tot: -4.1, zot: 212, tn: -30},
  {value: 'nizhniy-tagil', label: 'Нижний Тагил', tot: -6.4, zot: 227, tn: -34},
  {value: 'novokuznetsk', label: 'Новокузнецк', tot: -7.4, zot: 224, tn: -39},
  {value: 'novorossiysk', label: 'Новороссийск', tot: 4.4, zot: 132, tn: -13},
  {value: 'novosibirsk', label: 'Новосибирск', tot: -8.1, zot: 221, tn: -37},
  {value: 'norilsk', label: 'Норильск', tot: -13.1, zot: 300, tn: -43},
  {value: 'omsk', label: 'Омск', tot: -8.4, zot: 216, tn: -37},
  {value: 'orenburg', label: 'Оренбург', tot: -6.3, zot: 197, tn: -31},
  {value: 'oryol', label: 'Орёл', tot: -2.7, zot: 202, tn: -26},
  {value: 'penza', label: 'Пенза', tot: -4.2, zot: 200, tn: -29},
  {value: 'perm', label: 'Пермь', tot: -5.9, zot: 225, tn: -35},
  {value: 'petrozavodsk', label: 'Петрозаводск', tot: -3.2, zot: 240, tn: -29},
  {value: 'pskov', label: 'Псков', tot: -1.6, zot: 209, tn: -26},
  {value: 'rostov-na-donu', label: 'Ростов-на-Дону', tot: -0.1, zot: 166, tn: -22},
  {value: 'ryazan', label: 'Рязань', tot: -3.2, zot: 205, tn: -27},
  {value: 'salekhard', label: 'Салехард', tot: -11.7, zot: 285, tn: -42},
  {value: 'samara', label: 'Самара', tot: -5.2, zot: 200, tn: -30},
  {value: 'sankt-peterburg', label: 'Санкт-Петербург', tot: -1.3, zot: 213, tn: -24},
  {value: 'saransk', label: 'Саранск', tot: -4.1, zot: 204, tn: -30},
  {value: 'saratov', label: 'Саратов', tot: -4.3, zot: 191, tn: -27},
  {value: 'smolensk', label: 'Смоленск', tot: -2.4, zot: 210, tn: -26},
  {value: 'sochi', label: 'Сочи', tot: 7.9, zot: 94, tn: -3},
  {value: 'stavropol', label: 'Ставрополь', tot: 0.4, zot: 167, tn: -18},
  {value: 'surgut', label: 'Сургут', tot: -9.9, zot: 257, tn: -43},
  {value: 'syktyvkar', label: 'Сыктывкар', tot: -5.9, zot: 243, tn: -36},
  {value: 'tambov', label: 'Тамбов', tot: -3.7, zot: 200, tn: -28},
  {value: 'tver', label: 'Тверь', tot: -3, zot: 213, tn: -29},
  {value: 'tolyatti', label: 'Тольятти', tot: -5, zot: 200, tn: -30},
  {value: 'tomsk', label: 'Томск', tot: -8.4, zot: 233, tn: -39},
  {value: 'tula', label: 'Тула', tot: -2.9, zot: 205, tn: -27},
  {value: 'tyumen', label: 'Тюмень', tot: -6.9, zot: 220, tn: -35},
  {value: 'ulan-ude', label: 'Улан-Удэ', tot: -10.4, zot: 232, tn: -37},
  {value: 'ulyanovsk', label: 'Ульяновск', tot: -4.9, zot: 208, tn: -31},
  {value: 'ufa', label: 'Уфа', tot: -6, zot: 209, tn: -33},
  {value: 'khabarovsk', label: 'Хабаровск', tot: -9.3, zot: 205, tn: -31},
  {value: 'khanty-mansiysk', label: 'Ханты-Мансийск', tot: -9.1, zot: 250, tn: -40},
  {value: 'cheboksary', label: 'Чебоксары', tot: -4.6, zot: 213, tn: -32},
  {value: 'chelyabinsk', label: 'Челябинск', tot: -6.5, zot: 218, tn: -34},
  {value: 'cherepovets', label: 'Череповец', tot: -4, zot: 226, tn: -32},
  {value: 'chita', label: 'Чита', tot: -11.4, zot: 240, tn: -38},
  {value: 'yuzhno-sakhalinsk', label: 'Южно-Сахалинск', tot: -5.4, zot: 227, tn: -23},
  {value: 'yakutsk', label: 'Якутск', tot: -20.6, zot: 252, tn: -52},
  {value: 'yaroslavl', label: 'Ярославль', tot: -3.9, zot: 216, tn: -31},
];
