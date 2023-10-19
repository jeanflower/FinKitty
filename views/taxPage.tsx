import React from 'react';
import { taxView } from '../localization/stringConstants';

import {
  ChartData,
  ModelData,
  ReportDatum,
  ViewCallbacks,
} from '../types/interfaces';
import { makeTwoDP } from '../utils/stringUtils';
import { ViewSettings, getDisplay } from '../utils/viewUtils';
import { getDefaultChartSettings, taxChartDivWithButtons } from './chartPages';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import { addIndices, cashValueColumn, defaultColumn, triggerDateColumn } from './tablePages';

export function taxDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  taxChartData: ChartData,
  totalTaxPaid: number,
  reportData: ReportDatum[],
  parentCallbacks: ViewCallbacks,
) {
  if (!getDisplay(taxView)) {
    // log(`don't populate taxView`);
    return;
  }
  // log(`do populate taxView`);

  const tableData = [];
  for (const d of reportData) {
    console.log(`report datum date = ${d.date}`);
    tableData.push({
      DATE: d.date,
      AMOUNT: `${d.newVal}`,
      DESCRIPTION: d.name.substring('taxBreakdown'.length, d.name.length),
    });
  }
  const rows = addIndices(tableData.reverse());
  // for (const r of rows) {
  //   console.log(`row ${r.index}, ${r.DATE}`);
  // }

  return (
    <div className="ml-3">
      {taxChartDivWithButtons(
        model,
        viewSettings,
        taxChartData,
        getDefaultChartSettings(viewSettings, model.settings),
        parentCallbacks,
      )}
      <h2>Total tax paid: {makeTwoDP(totalTaxPaid)}</h2>

      <DataGridFinKitty
        tableID={'planningTable'}
        deleteFunction={undefined}
        setEraFunction={undefined}
        rows={rows}
        columns={[
          /*
          {
            ...defaultColumn,
            key: 'index',
            name: 'index',
          },
          */
          {
            ...triggerDateColumn(model),
            key: 'DATE',
            name: 'date',
            width: 120,
            renderEditCell: undefined,
          },
          {
            ...cashValueColumn,
            key: 'AMOUNT',
            name: 'amount',
            width: 100,
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'DESCRIPTION',
            name: 'description',
            renderEditCell: undefined,
          },
        ]}
        model={model}
      />
    </div>
  );
}
