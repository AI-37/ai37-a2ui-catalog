/**
 * Демо-справочник `sp50-materials`: материалы прил. М СП 50 (сокращённо) для
 * превью lookup-строк ConstructionsEditor. Опции несут доп. поля
 * `lambdaA`/`lambdaB` (контракт fetch-ответа допускает расширение) — выбор
 * заполняет λ строки; «Пароизоляционная плёнка» без λ показывает переход на
 * ручной ввод.
 */
export const DEMO_MATERIALS: Array<{
  value: string;
  label: string;
  lambdaA?: number;
  lambdaB?: number;
}> = [
  {value: 'm-kirpich-glina', label: 'Кладка из глиняного обыкновенного кирпича', lambdaA: 0.7, lambdaB: 0.81},
  {value: 'm-kirpich-silikat', label: 'Кладка из силикатного кирпича', lambdaA: 0.76, lambdaB: 0.87},
  {value: 'm-minvata-plity', label: 'Плиты минераловатные', lambdaA: 0.045, lambdaB: 0.048},
  {value: 'm-penopolistirol', label: 'Пенополистирол (плиты)', lambdaA: 0.038, lambdaB: 0.041},
  {value: 'm-eps', label: 'Экструдированный пенополистирол', lambdaA: 0.031, lambdaB: 0.034},
  {value: 'm-zhelezobeton', label: 'Железобетон', lambdaA: 1.92, lambdaB: 2.04},
  {value: 'm-gazobeton-600', label: 'Газобетон D600', lambdaA: 0.22, lambdaB: 0.26},
  {value: 'm-shtukaturka-cement', label: 'Штукатурка цементно-песчаная', lambdaA: 0.76, lambdaB: 0.93},
  {value: 'm-derevo-sosna', label: 'Сосна и ель поперёк волокон', lambdaA: 0.14, lambdaB: 0.18},
  {value: 'm-paroizolyaciya', label: 'Пароизоляционная плёнка'},
];
