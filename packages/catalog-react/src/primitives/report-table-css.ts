/**
 * Таблица отчёта: слои «изнутри наружу» с итоговой строкой. В наборе таблицы
 * не было вовсе, поэтому здесь и геометрия, и правила колонок.
 *
 * Первая колонка тянется и переносится, числовые прижаты вправо и набраны
 * табличными цифрами — иначе разряды не встают в столбик. Скролл живёт на
 * своём контейнере: в чате карточка отчёта стоит в узкой колонке, и уехавшая
 * вбок страница ломает тред целиком.
 */
export const KIT_REPORT_TABLE_CSS = `
.a2ui-kit .a2ui-table-scroll { overflow-x: auto; }

.a2ui-kit .a2ui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--a2ui-text-size-body);
  font-variant-numeric: tabular-nums;
}

.a2ui-kit .a2ui-table th,
.a2ui-kit .a2ui-table td {
  padding: 10px 14px;
  text-align: right;
  white-space: nowrap;
}

.a2ui-kit .a2ui-table th:first-child,
.a2ui-kit .a2ui-table td:first-child {
  width: 100%;
  text-align: left;
  white-space: normal;
}

.a2ui-kit .a2ui-table th {
  font-size: var(--a2ui-text-size-sub);
  font-weight: var(--a2ui-text-weight-strong);
  color: var(--a2ui-text-color-muted);
  border-bottom: 1px solid var(--a2ui-card-border);
}

.a2ui-kit .a2ui-table td { border-bottom: 1px solid var(--a2ui-card-border); }

/* Итоговая строка — на утопленном фоне и без разделителя под собой: она
   закрывает таблицу, а не продолжает её. */
.a2ui-kit .a2ui-table__footer td {
  background: var(--a2ui-card-surface-sunken);
  border-bottom: none;
  font-weight: var(--a2ui-text-weight-strong);
  white-space: normal;
}
`;
