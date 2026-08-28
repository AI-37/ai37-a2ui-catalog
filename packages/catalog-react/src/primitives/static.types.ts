import type React from 'react';

export interface StaticProps {
  /**
   * Значение в залитой коробке контрола — «пришло готовым, править незачем».
   * Без флага значение стоит голым текстом: так показан ГСОП, который вообще
   * не поле, а результат.
   */
  boxed?: boolean;
  children: React.ReactNode;
}
