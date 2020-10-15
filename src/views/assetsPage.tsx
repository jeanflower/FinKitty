import React from 'react';
import { ChartData, DbModelData, DbItem } from './../types/interfaces';
import {
  assetsView,
  deleteAsset,
  getDisplay,
  submitAsset,
  submitTrigger,
  submitTransaction,
} from './../App';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import {
  assetsOrDebtsTableDiv,
  defaultColumn,
  transactionFilteredTable,
} from './tablePages';
import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import { checkAsset, checkTransaction } from '../models/checks';
import { revalueAsset, liquidateAsset } from '../localization/stringConstants';
import DataGrid from './reactComponents/DataGrid';
import SimpleFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import { getTodaysDate, lessThan } from '../utils';
// import { log } from './../utils';

function todaysAssetsTable(
  model: DbModelData,
  todaysValues: Map<string, number>,
) {
  if (todaysValues.size === 0) {
    return;
    //return 'No data to display';
  }
  const today = getTodaysDate(model);
  return (
    <div>
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
    </div>
  );
}

export function assetsDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(assetsView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}>
      {assetsOrDebtsChartDivWithButtons(model, assetChartData, false, false)}
      {todaysAssetsTable(model, todaysValues)}

      <h4>Asset definitions</h4>
      {assetsOrDebtsTableDiv(model, showAlert, false)}
      {transactionFilteredTable(
        model,
        showAlert,
        liquidateAsset,
        'Liquidate assets to keep cash afloat',
      )}
      {transactionFilteredTable(
        model,
        showAlert,
        revalueAsset,
        'Revalue assets',
      )}

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
