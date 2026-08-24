import React from 'react';
import {BUTTON_INVENTORY} from './button-inventory';
import {FamilyBlock} from './family-block';
import {ProbaShell} from './proba-shell';
import {TypographyBlock} from './typography-block';

/** `/proba/revision` — что в каталоге есть сегодня. Предложение живёт на `/proba/system`. */
export function RevisionPage() {
  const duplicates = BUTTON_INVENTORY.filter(family => family.duplicateOf).length;

  return (
    <ProbaShell
      route="/proba/revision"
      eyebrow="AI37 A2UI CATALOG"
      title="Ревизия"
      lead={`Девять кеглей, 131 объявление, восемь копий одной цветовой палитры и ${BUTTON_INVENTORY.length} семейств кнопок — из них ${duplicates} покопийные дубли соседей.`}
    >
      <TypographyBlock />

      <div style={{display: 'grid', gap: 12}}>
        {BUTTON_INVENTORY.map(family => (
          <FamilyBlock key={family.title} family={family} />
        ))}
      </div>
    </ProbaShell>
  );
}
