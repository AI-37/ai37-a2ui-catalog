import type React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

/**
 * Пропсы презентационного комбобокса lookup-поля. Состоянием (текст, выбор,
 * опции) владеет режимный контрол (action/fetch); комбобокс полностью
 * контролируемый.
 */
export type LookupComboboxProps = {
  /** name скрытого input'а — его подхватывает сборщик значений `handleSubmit` FormCard. */
  name: string;
  placeholder?: string | undefined;
  inputText: string;
  selected: LookupOption | null;
  /** Видимые опции; без `loading`/`queried` пустой массив = дропдаун закрыт. */
  options: LookupOption[];
  /**
   * Идёт поиск (fetch-режим): попап открыт со статусом «Ищем…» вместо опций.
   * Action-режим статусы не сообщает — оба флага по умолчанию false, попап
   * живёт только по `options`.
   */
  loading?: boolean | undefined;
  /** По текущему вводу был завершённый запрос: пустые `options` = «Ничего не найдено». */
  queried?: boolean | undefined;
  /**
   * Класс текстового инпута вместо инлайнового стиля по умолчанию: рендерер со
   * своим CSS-слоем (`ConstructionsEditor`) стилизует контрол классом, иначе
   * инлайн-стиль перебил бы его правила.
   */
  inputClassName?: string | undefined;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPick: (option: LookupOption) => void;
  /** Закрытие дропдауна (blur, Escape) — контрол решает, что при этом сбросить. */
  onClose: () => void;
};
