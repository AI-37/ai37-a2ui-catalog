import React from 'react';
import {PROBA_TYPOGRAPHY_CSS} from './proba-typography-css';
import {PROPOSED_BUTTON_CSS} from './proposed-button-css';
import {ProposedButton} from './proposed-button';
import {DownloadIcon, PencilIcon, PlusIcon, RefreshIcon, TrashIcon} from './proba-icons';
import type {ButtonSize, ButtonVariant} from './proposed-button.types';

const VARIANTS: ButtonVariant[] = ['filled', 'outline', 'link'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

/** Готовая кнопка: матрица `variant × size`, тон, иконка, состояния. */
export function ButtonsSystem() {
  return (
    <section className="a2ui-proba" style={sectionStyle}>
      <style href="proba-typography" precedence="default">
        {PROBA_TYPOGRAPHY_CSS}
      </style>
      <style href="proba-proposed-button" precedence="default">
        {PROPOSED_BUTTON_CSS}
      </style>

      <h2 style={h2Style}>
        Кнопка <code style={codeStyle}>variant · size · tone</code>
      </h2>

      <div style={gridStyle}>
        {VARIANTS.map(variant => (
          <Cell key={variant} label={variant}>
            {SIZES.map(size => (
              <ProposedButton key={size} variant={variant} size={size}>
                Применить
              </ProposedButton>
            ))}
          </Cell>
        ))}

        <Cell label="accent">
          <ProposedButton variant="filled" tone="accent">Открыть</ProposedButton>
          <ProposedButton tone="accent">Показать</ProposedButton>
          <ProposedButton variant="link" tone="accent">Скачать</ProposedButton>
        </Cell>
        <Cell label="danger">
          <ProposedButton variant="filled" tone="danger">Удалить</ProposedButton>
          <ProposedButton tone="danger">Удалить</ProposedButton>
          <ProposedButton variant="link" tone="danger">Удалить слой</ProposedButton>
        </Cell>
        <Cell label="disabled">
          <ProposedButton variant="filled" disabled>Далее</ProposedButton>
          <ProposedButton disabled>Отмена</ProposedButton>
          <ProposedButton variant="link" disabled>Скачать</ProposedButton>
        </Cell>

        <Cell label="icon">
          <ProposedButton variant="filled" icon={<RefreshIcon />}>Пересчитать</ProposedButton>
          <ProposedButton icon={<PencilIcon />}>Изменить</ProposedButton>
          <ProposedButton variant="link" tone="accent" icon={<DownloadIcon />}>Скачать</ProposedButton>
        </Cell>
        <Cell label="icon-only">
          <ProposedButton icon={<PencilIcon />} aria-label="Изменить" />
          <ProposedButton icon={<TrashIcon />} tone="danger" aria-label="Удалить" />
          <ProposedButton variant="filled" icon={<PlusIcon />} aria-label="Добавить" />
        </Cell>
        <Cell label="dashed">
          <ProposedButton dashed icon={<PlusIcon />}>Добавить конструкцию</ProposedButton>
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

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.1)',
  background: '#ffffff',
};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};
const codeStyle: React.CSSProperties = {fontSize: 13, color: '#64748b', fontWeight: 400};

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
  background: '#f8fafc',
};

/* align-items: center — образцы разного кегля стоят на одной оси. */
const stageStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
};
