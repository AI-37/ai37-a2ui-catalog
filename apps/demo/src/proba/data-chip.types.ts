export interface DataChipProps {
  /** Что за величина: «t внутр», «Скорость». */
  label: string;
  /** Само значение: «+21 °C», «1,0 м/с». */
  value: string;
  /** Пунктирная рамка: значение принято системой, а не введено. */
  dashed?: boolean | undefined;
}
