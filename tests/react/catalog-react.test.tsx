import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';

function readMessages(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'messages', fileName), 'utf8'),
  ) as A2uiMessage[];
}

describe('catalog-react integration', () => {
  it('renders the simple table surface', () => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(readMessages('simple-table-surface.json'));
    const surface = processor.model.getSurface('demo-surface');

    render(<A2uiSurface surface={surface as any} />);

    expect(screen.getByText('Quarterly pipeline snapshot')).toBeInTheDocument();
    expect(screen.getByText('North')).toBeInTheDocument();
  });

  it('renders the flex table surface', () => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(readMessages('flex-table-surface.json'));
    const surface = processor.model.getSurface('demo-surface');

    render(<A2uiSurface surface={surface as any} />);

    expect(screen.getByText('Operations scorecard')).toBeInTheDocument();
    expect(screen.getByText('Resolution time')).toBeInTheDocument();
  });

  it('renders the html table surface with sanitized merged cells', () => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(readMessages('html-table-surface.json'));
    const surface = processor.model.getSurface('demo-surface');

    const {container} = render(<A2uiSurface surface={surface as any} />);

    // заголовок карточки + атрибуция
    expect(screen.getByText('Таблица 2')).toBeInTheDocument();
    expect(
      screen.getByText(/СП 4\.13130\.2013 — Системы противопожарной защиты/),
    ).toBeInTheDocument();
    // санитизированный <table> с объединёнными ячейками отрисован нативно
    const table = container.querySelector('.a2ui-html-table table');
    expect(table).toBeTruthy();
    expect(table?.querySelector('th[rowspan="2"]')).toBeTruthy();
    expect(table?.querySelector('th[colspan="3"]')).toBeTruthy();
    expect(screen.getByText('Степень огнестойкости здания')).toBeInTheDocument();
  });

  it('renders the latex formula surface', () => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(readMessages('latex-formula-surface.json'));
    const surface = processor.model.getSurface('demo-surface');

    const {container} = render(<A2uiSurface surface={surface as any} />);

    expect(screen.getByText('Bayesian update')).toBeInTheDocument();
    expect(container.querySelector('.katex')).toBeTruthy();
  });

  it('renders the choice card surface', () => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(readMessages('choice-card-surface.json'));
    const surface = processor.model.getSurface('demo-surface');

    render(<A2uiSurface surface={surface as any} />);

    expect(screen.getByText('Выберите стандарт расчёта лифтов')).toBeInTheDocument();
    expect(screen.getByText('ГОСТ Р 52941')).toBeInTheDocument();
    expect(screen.getByText('Подтвердить выбор')).toBeInTheDocument();
  });

  it('renders the form card surface', () => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(readMessages('form-card-surface.json'));
    const surface = processor.model.getSurface('demo-surface');

    render(<A2uiSurface surface={surface as any} />);

    expect(screen.getByText('Параметры здания и лифтов')).toBeInTheDocument();
    expect(screen.getByText('Количество этажей')).toBeInTheDocument();
    expect(screen.getByText('Отправить параметры')).toBeInTheDocument();
  });
});
