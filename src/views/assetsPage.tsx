import React from 'react';
import { ChartData, DbModelData } from './../types/interfaces';
import {
  assetsChart,
  assetsTable,
  assetsView,
  deleteAsset,
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
import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import { checkAsset, checkTransaction } from '../models/checks';
import { revalueAsset } from '../localization/stringConstants';

export function assetsDiv(model: DbModelData, assetChartData: ChartData[]) {
  if (!getDisplay(assetsView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}>
      <Button
        action={(event: any) => {
          event.persist();
          toggleDisplay(assetsChart);
        }}
        title={`${showContent.get(assetsChart).display ? 'Hide ' : 'Show '}${
          assetsChart.lc
        }`}
        type={showContent.get(assetsChart).display ? 'primary' : 'secondary'}
        key={assetsChart.lc}
        id="toggleAssetsChart"
      />
      <Button
        action={(event: any) => {
          event.persist();
          toggleDisplay(assetsTable);
        }}
        title={`${showContent.get(assetsTable).display ? 'Hide ' : 'Show '}${
          assetsTable.lc
        }`}
        type={showContent.get(assetsTable).display ? 'primary' : 'secondary'}
        key={assetsTable.lc}
        id="toggleAssetsTable"
      />
      {assetsOrDebtsChartDiv(model, assetChartData, false)}
      {assetsOrDebtsTableDiv(model, false)}
      <h4>Revalue assets</h4>
      {transactionsTableDiv(model, revalueAsset)}

      <div className="addNewAsset">
        <h4> Add an asset or pension </h4>
        <AddDeleteAssetForm
          checkAssetFunction={checkAsset}
          submitAssetFunction={submitAsset}
          checkTransactionFunction={checkTransaction}
          submitTransactionFunction={submitTransaction}
          deleteAssetFunction={deleteAsset}
          submitTrigger={submitTrigger}
          model={model}
        />
      </div>
    </div>
  );
}
