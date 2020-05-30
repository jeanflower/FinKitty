import React from 'react';
import {
  deleteExpense,
  expensesChart,
  expensesTable,
  expensesView,
  getDisplay,
  showContent,
  submitExpense,
  submitTransaction,
  submitTrigger,
  toggleDisplay,
} from '../App';
import Button from './reactComponents/Button';
import { expensesChartDiv } from './chartPages';
import { expensesTableDiv, transactionsTableDiv } from './tablePages';
import { AddDeleteExpenseForm } from './reactComponents/AddDeleteExpenseForm';
import { checkExpense, checkTransaction } from '../models/checks';
import { DbModelData, ChartData } from '../types/interfaces';
import { revalueExp } from '../localization/stringConstants';

export function expensesDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  expensesChartData: ChartData[],
) {
  if (!getDisplay(expensesView)) {
    return;
  }
  return (
    <div style={{ display: getDisplay(expensesView) ? 'block' : 'none' }}>
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          toggleDisplay(expensesChart);
        }}
        title={`${showContent.get(expensesChart).display ? 'Hide ' : 'Show '}${
          expensesChart.lc
        }`}
        type={showContent.get(expensesChart).display ? 'primary' : 'secondary'}
        key={expensesChart.lc}
        id="toggle-expensesChart"
      />
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          toggleDisplay(expensesTable);
        }}
        title={`${showContent.get(expensesTable).display ? 'Hide ' : 'Show '}${
          expensesTable.lc
        }`}
        type={showContent.get(expensesTable).display ? 'primary' : 'secondary'}
        key={expensesTable.lc}
        id="toggle-expensesTable"
      />
      {expensesChartDiv(model, expensesChartData)}
      <h4>Expense definitions</h4>
      {expensesTableDiv(model, showAlert)}
      <h4>Expense revaluations</h4>
      {transactionsTableDiv(model, showAlert, revalueExp)}
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
