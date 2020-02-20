import React from 'react';
import { ChartData, DbModelData } from './../types/interfaces';
import {
  debtsChart,
  debtsTable,
  debtsView,
  deleteAssetFromTable,
  getDisplay,
  showContent,
  submitAsset,
  submitTrigger,
  toggleDisplay,
  submitTransaction,
} from './../App';
import Button from './reactComponents/Button';
import { assetsOrDebtsChartDiv } from './chartPages';
import { assetsOrDebtsTableDiv, transactionsTableDiv } from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';
import { AddDeleteDebtForm } from './reactComponents/AddDeleteDebtForm';
import { payOffDebt, revalueDebt } from '../localization/stringConstants';

export function debtsDiv(model: DbModelData, debtChartData: ChartData[]) {
  if (!getDisplay(debtsView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(debtsView) ? 'block' : 'none' }}>
      <Button
        action={(event: any) => {
          event.persist();
          toggleDisplay(debtsChart);
        }}
        title={`${showContent.get(debtsChart).display ? 'Hide ' : 'Show '}${
          debtsChart.lc
        }`}
        type={showContent.get(debtsChart).display ? 'primary' : 'secondary'}
        key={debtsChart.lc}
        id="toggleDebtsChart"
      />
      <Button
        action={(event: any) => {
          event.persist();
          toggleDisplay(debtsTable);
        }}
        title={`${showContent.get(debtsTable).display ? 'Hide ' : 'Show '}${
          debtsTable.lc
        }`}
        type={showContent.get(debtsTable).display ? 'primary' : 'secondary'}
        key={debtsTable.lc}
        id="toggleDebtsTable"
      />
      {assetsOrDebtsChartDiv(model, debtChartData, true)}
      {assetsOrDebtsTableDiv(model, true)}
      <h4>Revalue debts</h4>
      {transactionsTableDiv(model, revalueDebt)}
      <h4>Pay off debts</h4>
      {transactionsTableDiv(model, payOffDebt)}

      <div className="addNewDebt">
        <h4> Add or delete debt </h4>
        <AddDeleteDebtForm
          checkAssetFunction={checkAsset}
          submitAssetFunction={submitAsset}
          checkTransactionFunction={checkTransaction}
          submitTransactionFunction={submitTransaction}
          deleteAssetFunction={deleteAssetFromTable}
          submitTrigger={submitTrigger}
          model={model}
        />
      </div>
    </div>
  );
}
