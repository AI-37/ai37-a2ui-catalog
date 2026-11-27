import React from 'react';
import type {ConstructionLayer, ConstructionLayerKind} from '@ai37/a2ui-catalog-schemas';
import {Field, Select} from '../primitives';
import {layerKindItems} from './layer-kind-labels';
import {useA2uiMessages} from '../i18n';

/**
 * Вид слоя явным селектором на строке формы (change
 * `constructions-layer-kind-thin`): материал / вентилируемый зазор / замкнутый
 * зазор / тонкий слой. До него вид ставился только спец-записью справочника,
 * и слой без λ и толщины (плёнка, клей, сетка) нельзя было объявить таковым.
 *
 * Смена вида на не-материал снимает λ и ключ справочника: у зазора и тонкого
 * слоя λ не бывает, а оставить ключ — значит прислать агенту материал прил. М
 * под видом зазора. Обратно на «Материал» — поля остаются пустыми, λ вводится
 * заново или приходит с опцией.
 */
export function ConstructionsNextKindField({
  layer,
  onChange,
}: {
  layer: ConstructionLayer;
  onChange: (next: ConstructionLayer) => void;
}) {
  const m = useA2uiMessages();
  const value: ConstructionLayerKind = layer.kind ?? 'material';

  const handleChange = (next: string | null) => {
    const kind = (next as ConstructionLayerKind | null) ?? 'material';
    if (kind === 'material') {
      onChange({...layer, kind: undefined});
      return;
    }
    onChange({
      ...layer,
      kind,
      materialKey: undefined,
      lambdaA: undefined,
      lambdaB: undefined,
      lambdaManual: undefined,
    });
  };

  return (
    <Field label={m.constructions.layerKind}>
      <Select items={layerKindItems(m)} value={value} onValueChange={handleChange} />
    </Field>
  );
}
