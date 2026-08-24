/**
 * Строка списка отчёта. Одна и та же в трёх местах: «Проверки» и
 * «Конструкции» теплотеха и «Что изменить» лифтов — слева титул с
 * пояснением, справа статус, чип отклонения или кнопка.
 *
 * Рамку, фон и радиус даёт `Card`: здесь только раскладка двух слотов и
 * акцентная рамка рекомендованного варианта. Модификатор карточки объявлен
 * двумя классами (`.a2ui-card.a2ui-card--accent`) — иначе порядок слоёв
 * набора решал бы, чья рамка победит.
 */
export const KIT_REPORT_ROW_CSS = `
.a2ui-kit .a2ui-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
}

/* Слот main тянется и переносится, слот side не сжимается: статус и кнопка
   в две строки не читаются. */
.a2ui-kit .a2ui-row__main {
  display: grid;
  gap: 3px;
  min-width: 0;
  flex: 1 1 240px;
}

.a2ui-kit .a2ui-row__side {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.a2ui-kit .a2ui-card.a2ui-card--accent { border-color: var(--a2ui-text-color-accent); }
`;
