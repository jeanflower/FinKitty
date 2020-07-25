import React from 'react';
import { ChartData, DbModelData, DbItem } from './../types/interfaces';
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
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import {
  assetsOrDebtsTableDiv,
  transactionsTableDiv,
  defaultColumn,
} from './tablePages';
import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import { checkAsset, checkTransaction } from '../models/checks';
import { revalueAsset, liquidateAsset } from '../localization/stringConstants';
import DataGrid from './reactComponents/DataGrid';
import SimpleFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import { getTodaysDate, lessThan } from '../utils';
// import { log } from './../utils';

export function assetsDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(assetsView)) {
    return;
  }

  const today = getTodaysDate(model);
  return (
    <div style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}>
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
      {assetsOrDebtsChartDivWithButtons(model, assetChartData, false, false)}
      <h4>Asset definitions</h4>
      {assetsOrDebtsTableDiv(model, showAlert, false)}
      <h4>Liquidate assets to keep cash afloat</h4>
      {transactionsTableDiv(model, showAlert, liquidateAsset)}
      <h4>Revalue assets</h4>
      {transactionsTableDiv(model, showAlert, revalueAsset)}

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

      <div className="addNewAsset">
        <h4> Add an asset or pension </h4>
        <AddDeleteAssetForm
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
