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
  /** Видимые опции; пустой массив = дропдаун закрыт. */
  options: LookupOption[];
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPick: (option: LookupOption) => void;
  /** Закрытие дропдауна (blur, Escape) — контрол решает, что при этом сбросить. */
  onClose: () => void;
};
