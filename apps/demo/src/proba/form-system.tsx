import React from 'react';
import {Combo, Field, Form, Input, KitStyles, Lookup, NumberField, Select, Static} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

/** Тип конструкции: доменное значение и человеческая подпись — разные строки. */
const TYPE_ITEMS = [
  {value: 'steny', label: 'Стены'},
  {value: 'okna', label: 'Окна и балконные двери'},
];

/** Ряд номинальных скоростей Прил. А: у части значений — пояснение к строке. */
const SPEED_OPTIONS = [
  {value: '0.63', label: '0.63', note: 'h и t123 — уточнить у изготовителя'},
  {value: '1', label: '1', note: 'h 1.5; t123 13.5'},
  {value: '1.6', label: '1.6', note: 'h 3; t123 12'},
  {value: '2.5', label: '2.5', note: 'h 6; t123 14'},
  {value: '4', label: '4', note: 'h 15; t123 16.5'},
];

/** Готовая форма: сетка, поле и пять видов содержимого поля. */
export function FormSystem() {
  const [city, setCity] = React.useState('Москва');
  const [buildingType, setBuildingType] = React.useState<string | null>('Жилое многоквартирное');
  const [condition, setCondition] = React.useState<string | null>('Б');
  const [tv, setTv] = React.useState<number | null>(20);
  const [type, setType] = React.useState<string | null>('steny');
  const [material, setMaterial] = React.useState('Кладка из глиняного обыкновенного кирпича');
  const [thickness, setThickness] = React.useState<number | null>(380);
  const [speed, setSpeed] = React.useState('1.6');

  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading
        title="Форма"
        axes="Form (1 · 2 · 3 колонки) · Field (wide) · Input · Autocomplete · Combo · Select · NumberField · Static (голый · boxed)"
      />

      <Form columns={2}>
        <Field label="Город строительства">
          <Lookup
            name="system-city"
            referenceId="cities"
            placeholder="Город из справочника"
            text={city}
            onTextChange={setCity}
            onPick={option => setCity(option.label)}
          />
        </Field>
        <Field label="Назначение помещений">
          <Select
            items={['Жилое многоквартирное', 'Общественное']}
            value={buildingType}
            onValueChange={setBuildingType}
            placeholder="—"
          />
        </Field>
        <Field
          label={
            <>
              Температура внутреннего воздуха t<sub className="a2ui-field__index">в</sub>
            </>
          }
        >
          <NumberField value={tv} onValueChange={setTv} />
        </Field>
        <Field label="Условия эксплуатации">
          <Select items={['А', 'Б']} value={condition} onValueChange={setCondition} placeholder="—" />
        </Field>
        <Field label="Название конструкции">
          <Input defaultValue="Наружная стена" placeholder="Как называть в отчёте" />
        </Field>
        <Field label="ГСОП — градусо-сутки отопит. периода, °C·сут/год">
          <Static>—</Static>
        </Field>
        {/* boxed: значение пришло готовым и правится не здесь. Голым текстом
            оно теряется в ряду полей — подпись есть, а поля будто нет. */}
        <Field label="Регион проекта">
          <Static boxed>Тюмень · группа светового климата 1</Static>
        </Field>
      </Form>

      {/* Три колонки — «строка + два числа»: первая вдвое шире. Это форма слоя
          конструкции; сузьте окно — материал заберёт строку себе, а числа
          встанут парой под ним. */}
      <Form columns={3}>
        <Field wide label="Материал">
          <Lookup
            name="system-material"
            referenceId="sp50-materials"
            placeholder="Материал из справочника или свой"
            text={material}
            onTextChange={setMaterial}
            onPick={option => setMaterial(option.label)}
          />
        </Field>
        <Field label="Толщина, мм">
          {/* compact: поле под 4–5 знаков — растянутая коробка обещала бы
              длинное значение, которого у толщины не бывает. */}
          <NumberField value={thickness} onValueChange={setThickness} min={1} compact />
        </Field>
        <Field label="λ, Вт/(м·°C)">
          <Static>
            0.81<span className="a2ui-t--sub a2ui-t--muted"> авто</span>
          </Static>
        </Field>
      </Form>

      <Form columns={2}>
        {/* Подпись пункта не равна значению: в submit уходит `steny`, на
            экране стоит «Стены». Ось нужна форме шапки карточки. */}
        <Field label="Тип конструкции — подписи вместо значений">
          <Select items={TYPE_ITEMS} value={type} onValueChange={setType} placeholder="—" />
        </Field>
        <Field label="Недоступный список">
          <Select items={['А', 'Б']} value="Б" onValueChange={() => undefined} disabled />
        </Field>
        <Field label="Недоступное числовое поле">
          <NumberField value={20} onValueChange={() => undefined} disabled />
        </Field>
        {/* Combo: ряд — подсказка, а не ограничение. Наберите значение вне ряда
            — оно останется значением поля; у вариантов с пояснением строка
            двухэтажная. */}
        <Field label="Vn — номинальная скорость, м/с (ряд-подсказка)">
          <Combo name="system-speed" options={SPEED_OPTIONS} value={speed} onValueChange={setSpeed} />
        </Field>
        {/* Пустой ряд: попап из одной пустой полосы обещал бы подсказки,
            которых нет, поэтому поле остаётся обычным вводом. */}
        <Field label="Ряд пуст — обычный ввод">
          <Combo name="system-empty-row" options={[]} value="" onValueChange={() => undefined} />
        </Field>
      </Form>
    </section>
  );
}
