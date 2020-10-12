import React from 'react';
import {
  deleteExpense,
  expensesView,
  getDisplay,
  submitExpense,
  submitTransaction,
  submitTrigger,
} from '../App';
import { expensesChartDivWithButtons } from './chartPages';
import {
  expensesTableDiv,
  transactionsTableDiv,
  defaultColumn,
} from './tablePages';
import { AddDeleteExpenseForm } from './reactComponents/AddDeleteExpenseForm';
import { checkExpense, checkTransaction } from '../models/checks';
import { DbModelData, ChartData, DbItem } from '../types/interfaces';
import { revalueExp } from '../localization/stringConstants';
import DataGrid from './reactComponents/DataGrid';
import { lessThan, getTodaysDate } from '../utils';
import SimpleFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

export function expensesDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  expensesChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(expensesView)) {
    return;
  }
  const today = getTodaysDate(model);
  return (
    <div style={{ display: getDisplay(expensesView) ? 'block' : 'none' }}>
      {expensesChartDivWithButtons(model, expensesChartData)}
      <h4>Expense definitions</h4>
      {expensesTableDiv(model, showAlert)}
      <h4>Expense revaluations</h4>
      {transactionsTableDiv(model, showAlert, revalueExp)}

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

      <div className="addNewExpense">
        <h4> Add an expense </h4>
        <AddDeleteExpenseForm
          checkFunction={checkExpense}
          submitFunction={submitExpense}
          deleteFunction={deleteExpense}
          submitTriggerFunction={submitTrigger}
          model={model}
          showAlert={showAlert}
          checkTransactionFunction={checkTransaction}
          submitTransactionFunction={submitTransaction}
        />
      </div>
    </div>
  );
}
