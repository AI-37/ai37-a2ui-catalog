import React from 'react';
import {Button, Field, Select} from '@ai37/a2ui-catalog-react/primitives';
import {applyRecommendVariant} from './apply-recommend-variant';
import type {RecommendLabels, RecommendVariant} from './recommend.types';

/**
 * Остальные варианты: селект с подписью и кнопка применения. Карточками их не
 * показываем — список ряда Прил. Е длинный, и блок в форме расчёта не должен
 * быть длиннее самой формы.
 */
export function RecommendMore({
  variants,
  labels,
}: {
  variants: RecommendVariant[];
  labels: RecommendLabels;
}) {
  const [picked, setPicked] = React.useState<string | null>(null);

  if (variants.length === 0) {
    return null;
  }

  const items = variants.map(variant => ({value: variant.id, label: variant.title}));
  const apply = () => {
    const variant = variants.find(item => item.id === picked);
    if (variant !== undefined) {
      applyRecommendVariant(variant);
    }
  };

  return (
    <div className="a2ui-recommend__more">
      <span className="a2ui-recommend__more-field">
        <Field label={labels.moreLabel}>
          <Select
            items={items}
            value={picked}
            onValueChange={setPicked}
            placeholder="выберите конфигурацию"
          />
        </Field>
      </span>
      <Button variant="outline" disabled={picked === null} onClick={apply}>
        {labels.applyLabel}
      </Button>
    </div>
  );
}
