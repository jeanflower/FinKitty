import React from 'react';
import { ChartData, DbModelData, DbItem } from './../types/interfaces';
import {
  debtsView,
  deleteAsset,
  getDisplay,
  submitAsset,
  submitTrigger,
  submitTransaction,
} from './../App';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import {
  assetsOrDebtsTableDiv,
  defaultColumn,
  transactionFilteredTable,
} from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';
import { AddDeleteDebtForm } from './reactComponents/AddDeleteDebtForm';
import { payOffDebt, revalueDebt } from '../localization/stringConstants';
import { getTodaysDate, lessThan } from '../utils';
import DataGrid from './reactComponents/DataGrid';
import SimpleFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

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
    <div>
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
    </div>
  );
}

export function debtsDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  debtChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(debtsView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(debtsView) ? 'block' : 'none' }}>
      {assetsOrDebtsChartDivWithButtons(model, debtChartData, true, false)}
      {todaysDebtsTable(model, todaysValues)}

      <h4>Debt definitions</h4>
      {assetsOrDebtsTableDiv(model, showAlert, true)}
      {transactionFilteredTable(model, showAlert, revalueDebt, 'Revalue debts')}
      {transactionFilteredTable(model, showAlert, payOffDebt, 'Pay off debts')}

      <div className="addNewDebt">
        <h4> Add a debt </h4>
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
