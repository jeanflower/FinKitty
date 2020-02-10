import React from 'react';
import {
  deleteExpenseFromTable,
  expensesChart,
  expensesTable,
  expensesView,
  getDisplay,
  showContent,
  submitExpense,
  submitTrigger,
  toggleDisplay,
} from '../App';
import Button from './reactComponents/Button';
import { expensesChartDiv } from './chartPages';
import { expensesTableDiv, transactionsTableDiv } from './tablePages';
import { AddDeleteExpenseForm } from './reactComponents/AddDeleteExpenseForm';
import { checkExpense } from '../models/checks';
import { DbModelData, ChartData } from '../types/interfaces';
import { revalueExp } from '../localization/stringConstants';

export function expensesDiv(
  model: DbModelData,
  expensesChartData: ChartData[],
) {
  if (!getDisplay(expensesView)) {
    return;
  }
  return (
    <div style={{ display: getDisplay(expensesView) ? 'block' : 'none' }}>
      <Button
        action={(event: any) => {
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
        action={(event: any) => {
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
      {expensesTableDiv(model)}
      <h4>Revalue expenses</h4>
      {transactionsTableDiv(model, revalueExp)}
      <div className="addNewExpense">
        <h4> Add or delete expense </h4>
        <AddDeleteExpenseForm
          checkFunction={checkExpense}
          submitFunction={submitExpense}
          deleteFunction={deleteExpenseFromTable}
          submitTrigger={submitTrigger}
          model={model}
        />
      </div>
    </div>
  );
}
