import React from 'react';
import {Button, DownloadIcon, KitStyles, PencilIcon, PlusIcon, RefreshIcon, TrashIcon} from '@ai37/a2ui-catalog-react/primitives';
import type {ButtonSize, ButtonVariant} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

const VARIANTS: ButtonVariant[] = ['filled', 'outline', 'link'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

/** Готовая кнопка: матрица `variant × size`, тон, иконка, состояния. */
export function ButtonsSystem() {
  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading title="Кнопка" axes="variant · size · tone" />

      <div style={gridStyle}>
        {VARIANTS.map(variant => (
          <Cell key={variant} label={variant}>
            {SIZES.map(size => (
              <Button key={size} variant={variant} size={size}>
                Применить
              </Button>
            ))}
          </Cell>
        ))}

        <Cell label="accent">
          <Button variant="filled" tone="accent">Открыть</Button>
          <Button tone="accent">Показать</Button>
          <Button variant="link" tone="accent">Скачать</Button>
        </Cell>
        <Cell label="danger">
          <Button variant="filled" tone="danger">Удалить</Button>
          <Button tone="danger">Удалить</Button>
          <Button variant="link" tone="danger">Удалить слой</Button>
        </Cell>
        <Cell label="disabled">
          <Button variant="filled" disabled>Далее</Button>
          <Button disabled>Отмена</Button>
          <Button variant="link" disabled>Скачать</Button>
        </Cell>

        <Cell label="icon">
          <Button variant="filled" icon={<RefreshIcon />}>Пересчитать</Button>
          <Button icon={<PencilIcon />}>Изменить</Button>
          <Button variant="link" tone="accent" icon={<DownloadIcon />}>Скачать</Button>
        </Cell>
        <Cell label="icon-only">
          <Button icon={<PencilIcon />} aria-label="Изменить" />
          <Button icon={<TrashIcon />} tone="danger" aria-label="Удалить" />
          <Button variant="filled" icon={<PlusIcon />} aria-label="Добавить" />
        </Cell>
        <Cell label="dashed">
          <Button dashed icon={<PlusIcon />}>Добавить конструкцию</Button>
        </Cell>
      </div>
    </section>
  );
}

/** Ячейка матрицы: имя оси сверху, образцы в строку. */
function Cell({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div style={cellStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">{label}</span>
      <div style={stageStyle}>{children}</div>
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 8,
};

const cellStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  alignContent: 'start',
  padding: '12px 14px',
  borderRadius: 10,
  background: 'light-dark(#f8fafc, #141413)',
};

/* align-items: center — образцы разного кегля стоят на одной оси. */
const stageStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
};
