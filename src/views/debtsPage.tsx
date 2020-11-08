import { ChartData, DbItem, DbModelData } from './../types/interfaces';
import { checkAsset, checkTransaction } from '../models/checks';
import { debtsDivWithHeadings, defaultColumn } from './tablePages';
import {
  deleteAsset,
  getDisplay,
  submitAsset,
  submitTransaction,
  submitTrigger,
} from './../App';
import { getTodaysDate, lessThan } from '../utils';

import { AddDeleteDebtForm } from './reactComponents/AddDeleteDebtForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React from 'react';
import SimpleFormatter from './reactComponents/NameFormatter';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import { debtsView } from '../localization/stringConstants';
import { ViewSettings } from '../models/charting';

function todaysDebtsTable(
  model: DbModelData,
  todaysValues: Map<string, number>,
) {
  if (todaysValues.size === 0) {
    return;
    //return 'No data to display';
  }
  const today = getTodaysDate(model);
  return (
    <>
      <h4>Values at {today.toDateString()}</h4>
      <DataGrid
        deleteFunction={async function() {
          return false;
        }}
        handleGridRowsUpdated={function() {
          return false;
        }}
        rows={Array.from(todaysValues.entries())
          .map(key => {
            // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            return {
              NAME: key[0],
              VALUE: `${key[1]}`,
            };
          })
          .sort((a: DbItem, b: DbItem) => lessThan(a.NAME, b.NAME))}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: `today's value`,
            formatter: (
              <CashValueFormatter name="today's value" value="unset" />
            ),
          },
        ]}
      />
    </>
  );
}

export function debtsDiv(
  model: DbModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  debtChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(debtsView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(debtsView) ? 'block' : 'none' }}>
      {assetsOrDebtsChartDivWithButtons(
        model,
        viewSettings,
        debtChartData,
        true,
        false,
      )}
      {todaysDebtsTable(model, todaysValues)}
      {debtsDivWithHeadings(model, showAlert)}

      <div className="addNewDebt">
        <h4>Add a debt</h4>
        <AddDeleteDebtForm
          checkAssetFunction={checkAsset}
          submitAssetFunction={submitAsset}
          checkTransactionFunction={checkTransaction}
          submitTransactionFunction={submitTransaction}
          deleteAssetFunction={deleteAsset}
          submitTriggerFunction={submitTrigger}
          model={model}
          showAlert={showAlert}
        />
      </div>
    </div>
  );
}
