import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

export interface LookupProps {
  /** Имя скрытого поля: в submit уходит `value` опции, а не подпись. */
  name: string;
  referenceId: string;
  placeholder: string;
  /** Текущий текст поля: свободный ввод — тоже значение. */
  text: string;
  /** Порог подсказок справочника; без него — общий дефолт канала. */
  minChars?: number | undefined;
  onTextChange: (text: string) => void;
  onPick: (option: LookupOption) => void;
}
