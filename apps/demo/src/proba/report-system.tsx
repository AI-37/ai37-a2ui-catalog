import React from 'react';
import {
  Button,
  DataChip,
  KitStyles,
  Menu,
  ReportHeadline,
  ReportNote,
  ReportProtocolCard,
  ReportRow,
  ReportTable,
  StatusPill,
} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

/** Таблица витрины — три слоя стены: короче настоящей, устройство то же. */
const TABLE = {
  columns: ['Слой', 'δ, мм', 'λ', 'R, м²·°С/Вт'],
  rows: [
    ['Кирпичная кладка на ЦПР', '250', '0,70', '0,36'],
    ['Минераловатная плита', '120', '0,042', '2,86'],
  ],
  footer: {label: 'R₀ приведённое · с сопротивлениями поверхностей', value: '3,21'},
};

/** Форматы «Скачать» витрины: тот же список, что у протокола с ручкой агента. */
const DOWNLOAD_ITEMS = [
  {label: 'Markdown (.md)', href: '#md'},
  {label: 'Word (.docx)', href: '#docx'},
];

/**
 * Части отчёта: семь мест, которых у набора не было. Все семь — про чтение,
 * а не про ввод: отчёт read-mostly, и вся его интерактивность живёт в
 * кнопках и меню, которые уже показаны соседними блоками витрины.
 */
export function ReportSystem() {
  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading
        title="Отчёт"
        axes="ReportRow (main · side · accent) · DataChip (сплошной · пунктирный) · StatusPill (pass · fail · warning · neutral × badge · row) · ReportHeadline (display + serif) · ReportTable · ReportNote · ReportProtocolCard (+ Menu side=top)"
      />

      {/* Вердикт: пилюля ступени badge и serif-заголовок. Ступень у заголовка
          та же, что у display — новое здесь только семейство. */}
      <div style={stageColumnStyle}>
        <StatusPill tone="pass" size="badge">
          Соответствует СП 50.13330
        </StatusPill>
        <ReportHeadline>R₀ приведённое — 3,21 м²·°С/Вт</ReportHeadline>
      </div>

      <div style={stageStyle}>
        <StatusPill tone="pass">Соответствует</StatusPill>
        <StatusPill tone="fail">Не соответствует</StatusPill>
        <StatusPill tone="warning">Проверьте</StatusPill>
        <StatusPill tone="neutral">не проходит</StatusPill>
      </div>

      <div style={stageStyle}>
        <DataChip label="Регион" value="Тюмень · ГСОП 6 380" />
        <DataChip label="t внутр" value="+21 °C" dashed />
        <DataChip label="Условия эксплуатации" value="А" dashed />
      </div>

      {/* Одна и та же строка в трёх видах правого слота: статус, чип
          отклонения, кнопка. Четвёртый вид — акцентная рамка рекомендованного
          варианта, у него слот тот же. */}
      <div style={stageColumnStyle}>
        <ReportRow
          title="Поэлементное требование"
          detail="R₀ 3,21 ≥ Rтр 3,08 м²·°С/Вт — п. 5.1"
          side={<StatusPill tone="pass">Соответствует</StatusPill>}
        />
        <ReportRow
          title="Наружные стены выше 0,000"
          detail="Rпр 2,82 · Rнорм 3,68"
          side={
            <>
              <StatusPill tone="fail">−23,3 %</StatusPill>
              <Button variant="outline">Подобрать</Button>
            </>
          }
        />
        <ReportRow
          title="3 лифта в группе"
          detail="Интервал 73 с — проходит с запасом"
          tone="accent"
          side={<Button variant="outline">Пересчитать</Button>}
        />
      </div>

      <div style={stageColumnStyle}>
        <ReportTable columns={TABLE.columns} rows={TABLE.rows} footer={TABLE.footer} />
      </div>

      <div style={stageColumnStyle}>
        <ReportNote>
          Допущения: условие эксплуатации Б принято с запасом (зона влажности не задана)
        </ReportNote>
      </div>

      {/* Протокол: одна строка без раскрытия. Меню «Скачать» — ось `side` у
          Menu набора: список растёт вверх, внутрь карточки. */}
      <div style={stageColumnStyle}>
        <ReportProtocolCard
          label="Протокол расчёта"
          meta="СП 50.13330.2024 · Прил. Г · 9 шагов"
          action={<Menu label="Скачать" side="top" items={DOWNLOAD_ITEMS} />}
        />
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
  background: '#f8fafc',
};

const stageColumnStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  justifyItems: 'start',
  padding: '12px 14px',
  borderRadius: 10,
  background: '#f8fafc',
};
