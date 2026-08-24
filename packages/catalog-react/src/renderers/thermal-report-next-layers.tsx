import React from 'react';
import type {ThermalReportLayersTable} from '@ai37/a2ui-catalog-schemas';
import {Card, CardBody, CardHeader, CardTitle, ReportTable} from '../primitives';
import {ThermalReportNextLayersMeta} from './thermal-report-next-layers-meta';

/** Карточка «Конструкция · изнутри наружу»: таблица слоёв с итогом R₀. */
export function ThermalReportNextLayers({table}: {table: ThermalReportLayersTable | undefined}) {
  if (table === undefined) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title={<CardTitle title={table.title} />}
        status={<ThermalReportNextLayersMeta meta={table.meta} />}
      />
      <CardBody>
        <ReportTable columns={table.columns} rows={table.rows} footer={table.footer} />
      </CardBody>
    </Card>
  );
}
