import React from 'react';
import { taxView } from '../localization/stringConstants';
import { ViewSettings } from '../models/charting';
import {
  ChartData,
  ModelData,
  ReportDatum,
  ViewCallbacks,
} from '../types/interfaces';
import { makeTwoDP } from '../utils/stringUtils';
import { getDisplay } from '../utils/viewUtils';
import { getDefaultChartSettings, taxChartDivWithButtons } from './chartPages';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import { addIndices, defaultColumn } from './tablePages';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

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
  for (const r of rows) {
    console.log(`row ${r.index}, ${r.DATE}`);
  }

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
        handleGridRowsUpdated={function () {
          return false;
        }}
        rows={rows}
        columns={[
          /*
          {
            ...defaultColumn,
            key: 'index',
            name: 'index',
            formatter: <SimpleFormatter name="name" value="unset" />,
            editable: false,
          },
          */
          {
            ...defaultColumn,
            key: 'DATE',
            name: 'date',
            formatter: (
              <TriggerDateFormatter name="date" model={model} value="unset" />
            ),
            width: 120,
          },
          {
            ...defaultColumn,
            key: 'AMOUNT',
            name: 'amount',
            formatter: <CashValueFormatter name="basic" value="unset" />,
            editable: false,
            width: 100,
          },
          {
            ...defaultColumn,
            key: 'DESCRIPTION',
            name: 'description',
            editable: false,
          },
        ]}
        model={model}
      />
    </div>
  );
}
