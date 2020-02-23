import React from 'react';
import { ChartData, DbModelData } from '../types/interfaces';
import {
  deleteIncomeFromTable,
  getDisplay,
  incomesChart,
  incomesTable,
  incomesView,
  showContent,
  submitIncome,
  submitTransaction,
  submitTrigger,
  toggleDisplay,
} from '../App';
import Button from './reactComponents/Button';
import { incomesChartDiv } from './chartPages';
import { incomesTableDiv, transactionsTableDiv } from './tablePages';
import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import { checkIncome, checkTransaction } from '../models/checks';
import { revalueInc } from '../localization/stringConstants';

export function incomesDiv(model: DbModelData, incomesChartData: ChartData[]) {
  if (!getDisplay(incomesView)) {
    return;
  }
  // log('rendering an incomesDiv');
  return (
    <div style={{ display: getDisplay(incomesView) ? 'block' : 'none' }}>
      <Button
        action={(event: any) => {
          event.persist();
          toggleDisplay(incomesChart);
        }}
        title={`${showContent.get(incomesChart).display ? 'Hide ' : 'Show '}${
          incomesChart.lc
        }`}
        type={showContent.get(incomesChart).display ? 'primary' : 'secondary'}
        key={incomesChart.lc}
        id="toggle-incomesChart"
      />
      <Button
        action={(event: any) => {
          event.persist();
          toggleDisplay(incomesTable);
        }}
        title={`${showContent.get(incomesTable).display ? 'Hide ' : 'Show '}${
          incomesTable.lc
        }`}
        type={showContent.get(incomesTable).display ? 'primary' : 'secondary'}
        key={incomesTable.lc}
        id="toggle-incomesTable"
      />
      {incomesChartDiv(model, incomesChartData)}
      {incomesTableDiv(model)}
      <h4>Revalue incomes</h4>
      {transactionsTableDiv(model, revalueInc)}
      <div className="addNewIncome">
        <h4> Add an income or pension </h4>
        <AddDeleteIncomeForm
          checkIncomeFunction={checkIncome}
          checkTransactionFunction={checkTransaction}
          submitIncomeFunction={submitIncome}
          submitTransactionFunction={submitTransaction}
          deleteFunction={deleteIncomeFromTable}
          submitTrigger={submitTrigger}
          model={model}
        />
      </div>
    </div>
  );
}
