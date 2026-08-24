import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {CurrentLookup} from './current-lookup';
import {Field, KitStyles, Lookup} from '@ai37/a2ui-catalog-react/primitives';
import {PlainField} from './plain-field';
import {ProbaShell} from './proba-shell';
import {PickedNote} from './picked-note';

/** `/proba/lookup` — тот же справочник двумя реализациями: наша и примитив на Base UI. */
export function LookupPage() {
  const [picked, setPicked] = React.useState<LookupOption | null>(null);
  const [city, setCity] = React.useState('');
  const [material, setMaterial] = React.useState('');

  const handlePick = (option: LookupOption) => setPicked(option);

  return (
    <ProbaShell
      route="/proba/lookup"
      eyebrow="AI37 A2UI CATALOG"
      title="Поиск"
      lead="Один справочник, две реализации. Сеть в обеих — наш useLookupSuggest; отличается только UI."
    >
      <section className="a2ui-kit" style={sectionStyle}>
        <KitStyles />

        <div style={columnsStyle}>
          <div style={columnStyle}>
            <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">Наш LookupCombobox</span>
            <PlainField label="Город строительства">
              <CurrentLookup
                name="city-current"
                referenceId="cities"
                placeholder="Город из справочника"
                onPick={handlePick}
              />
            </PlainField>
            <PlainField label="Материал слоя">
              <CurrentLookup
                name="material-current"
                referenceId="sp50-materials"
                placeholder="Материал по СП 50"
                onPick={handlePick}
              />
            </PlainField>
          </div>

          <div style={columnStyle}>
            <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
              Примитив на Base UI Autocomplete
            </span>
            <Field label="Город строительства">
              <Lookup
                name="city-base"
                referenceId="cities"
                placeholder="Город из справочника"
                text={city}
                onTextChange={setCity}
                onPick={handlePick}
              />
            </Field>
            <Field label="Материал слоя">
              <Lookup
                name="material-base"
                referenceId="sp50-materials"
                placeholder="Материал по СП 50"
                text={material}
                onTextChange={setMaterial}
                onPick={handlePick}
              />
            </Field>
          </div>
        </div>

        <PickedNote picked={picked} />
      </section>

      <section style={checklistStyle}>
        <h2 style={{margin: 0, fontSize: 15, fontWeight: 600}}>Что проверять руками</h2>
        <ol style={{margin: 0, paddingLeft: 20, display: 'grid', gap: 6, fontSize: 13, lineHeight: 1.5}}>
          <li>Набрать «мос», нажать <code>↓</code> — подсветится ли опция.</li>
          <li><code>Enter</code> на подсвеченной — подставится ли значение в поле.</li>
          <li><code>Escape</code> — закроется ли список, останется ли фокус в поле.</li>
          <li><code>Tab</code> из поля с открытым списком — не потеряется ли выбор.</li>
          <li>Набрать «Зеленоград» (нет в справочнике) — останется ли свободный текст.</li>
          <li>Материалы: видна ли группа (раздел табл. М.1) и подсветка совпадения в ней.</li>
        </ol>
      </section>
    </ProbaShell>
  );
}

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.1)',
  background: '#ffffff',
};

const columnsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 24,
};

const columnStyle: React.CSSProperties = {display: 'grid', gap: 12, alignContent: 'start'};

const checklistStyle: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  padding: 20,
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: '#f8fafc',
};
