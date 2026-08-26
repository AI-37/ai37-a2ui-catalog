import React from 'react';
import {KitStyles, Menu, MoreIcon} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

/** Форматы протокола: те же два пункта, что у «Скачать ▾» в отчётах. */
const FORMATS = [
  {label: 'Markdown (.md)', href: '#md'},
  {label: 'Word (.docx)', href: '#docx'},
];

/** Методики расчёта лифтов: у триггера-ссылки подпись — выбранное значение. */
const METHODS = [
  {label: 'ГОСТ Р 52941-2008 (жилые здания)', onSelect: () => undefined},
  {label: 'ГОСТ 34758-2021 (офисы, гостиницы, жилые)', onSelect: () => undefined},
];

/** Действия карточки конструкции: пункт с обработчиком, а не ссылкой. */
const ACTIONS = [
  {label: 'Изменить тип и название', onSelect: () => undefined},
  {label: 'Удалить', tone: 'danger' as const, onSelect: () => undefined},
];

/** Готовое меню: триггер с подписью, icon-only и ссылка; пункты-ссылки и пункты-действия. */
export function MenuSystem() {
  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading title="Меню" axes="Menu · Trigger (подпись · icon-only · ссылка) · LinkItem · Item" />

      <div style={stageStyle}>
        <Menu label="Скачать" items={FORMATS} />
        {/* Icon-only триггер: подписи нет, значит имя живёт в aria-label.
            Необратимое действие — тоном danger, как у карточки конструкции. */}
        <Menu
          icon={<MoreIcon />}
          ariaLabel="Действия: наружная стена"
          items={ACTIONS}
        />
        {/* Триггер-ссылка: под ним не действие, а выбранное значение шапки —
            рамка обещала бы кнопку. Попап прижат правым краем: место такого
            триггера — правый край шапки карточки. */}
        <Menu trigger="link" label="ГОСТ Р 52941-2008 · жилое здание" items={METHODS} />
      </div>
    </section>
  );
}

const stageStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderRadius: 10,
  background: 'light-dark(#f8fafc, #141413)',
};
