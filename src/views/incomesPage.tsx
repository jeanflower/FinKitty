import React from 'react';
import { ChartData, DbModelData, DbItem } from '../types/interfaces';
import {
  deleteIncome,
  getDisplay,
  incomesView,
  submitIncome,
  submitTransaction,
  submitTrigger,
} from '../App';
import {
  incomesChartDivWithButtons,
  getDefaultChartSettings,
} from './chartPages';
import {
  incomesTableDivWithHeading,
  defaultColumn,
  transactionFilteredTable,
} from './tablePages';
import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import { checkIncome, checkTransaction } from '../models/checks';
import { revalueInc } from '../localization/stringConstants';
import DataGrid from './reactComponents/DataGrid';
import { lessThan, getTodaysDate } from '../utils';
import SimpleFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

function todaysIncomesTable(
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

export function incomesDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  incomesChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(incomesView)) {
    return;
  }
  // log('rendering an incomesDiv');
  return (
    <div style={{ display: getDisplay(incomesView) ? 'block' : 'none' }}>
      {incomesChartDivWithButtons(
        model,
        incomesChartData,
        getDefaultChartSettings(model),
      )}
      {todaysIncomesTable(model, todaysValues)}
      {incomesTableDivWithHeading(model, showAlert)}
      {transactionFilteredTable(
        model,
        showAlert,
        revalueInc,
        'Income revaluations',
      )}

      <div className="addNewIncome">
        <h4>
          {' '}
          Add an income, a defined-benefits pension, or revalue an income
        </h4>
        <AddDeleteIncomeForm
          checkIncomeFunction={checkIncome}
          checkTransactionFunction={checkTransaction}
          submitIncomeFunction={submitIncome}
          submitTransactionFunction={submitTransaction}
          deleteFunction={deleteIncome}
          submitTriggerFunction={submitTrigger}
          model={model}
          showAlert={showAlert}
        />
      </div>
    </div>
  );
}
