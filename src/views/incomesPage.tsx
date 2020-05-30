import React from 'react';
import { ChartData, DbModelData } from '../types/interfaces';
import {
  deleteIncome,
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

export function incomesDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  incomesChartData: ChartData[],
) {
  if (!getDisplay(incomesView)) {
    return;
  }
  // log('rendering an incomesDiv');
  return (
    <div style={{ display: getDisplay(incomesView) ? 'block' : 'none' }}>
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
      <h4>Income definitions</h4>
      {incomesTableDiv(model, showAlert)}
      <h4>Income revaluations</h4>
      {transactionsTableDiv(model, showAlert, revalueInc)}
      <div className="addNewIncome">
        <h4> Add an income or pension </h4>
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
