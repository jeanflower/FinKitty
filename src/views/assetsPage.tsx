import React from 'react';
import { ChartData, DbModelData } from './../types/interfaces';
import {
  assetsChart,
  assetsTable,
  assetsView,
  deleteAssetFromTable,
  getDisplay,
  showContent,
  submitAsset,
  submitTrigger,
  toggleDisplay,
} from './../App';
import Button from './reactComponents/Button';
import { assetsChartDiv } from './chartPages';
import { assetsTableDiv } from './tablePages';
import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import { checkAsset } from '../models/checks';

export function assetsDiv(model: DbModelData, assetChartData: ChartData[]) {
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
      {assetsChartDiv(model, assetChartData)}
      {assetsTableDiv(model)}
      <div className="addNewAsset">
        <h4> Add or delete asset </h4>
        <AddDeleteAssetForm
          checkFunction={checkAsset}
          submitFunction={submitAsset}
          deleteFunction={deleteAssetFromTable}
          submitTrigger={submitTrigger}
          model={model}
        />
      </div>
    </div>
  );
}
