import React from 'react';

/**
 * Таблица внутри markdown отчёта — в своём контейнере со скроллом и на стилях
 * таблицы набора (`a2ui-table`), а не на голом браузерном `<table>`.
 *
 * Скролл обязателен: «Исходные данные» протокола — широкая таблица, а карточка
 * отчёта стоит в узкой колонке чата. Уехавшая вбок страница ломает тред
 * целиком, поэтому едет содержимое таблицы, а не лента (то же правило, что у
 * `ReportTable`).
 */
export function ReportMarkdownTable({children}: {children?: React.ReactNode}) {
  return (
    <div className="a2ui-table-scroll">
      <table className="a2ui-table">{children}</table>
    </div>
  );
}
