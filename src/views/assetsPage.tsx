import { AssetVal, ChartData, Item, ModelData } from './../types/interfaces';
import { assetsDivWithHeadings, defaultColumn } from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';
import {
  deleteAsset,
  getDisplay,
  submitAsset,
  submitTransaction,
  submitTrigger,
} from './../App';

import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React from 'react';
import SimpleFormatter from './reactComponents/NameFormatter';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import { assetsView } from '../localization/stringConstants';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { lessThan } from '../stringUtils';

// import { log } from './../utils';

function todaysAssetsTable(
  model: ModelData,
  todaysValues: Map<string, AssetVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }
  const today = getTodaysDate(model);
  return (
    <>
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
              VALUE: `${key[1].assetVal}`,
            };
          })
          .sort((a: Item, b: Item) => lessThan(a.NAME, b.NAME))}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
            editable: false,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: `value`,
            formatter: <CashValueFormatter name="value" value="unset" />,
            editable: false,
          },
        ]}
      />
    </>
  );
}

export function assetsDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  todaysValues: Map<string, AssetVal>,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (!getDisplay(assetsView)) {
    return;
  }

  return (
    <div
      className="ml-3"
      style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}
    >
      {assetsOrDebtsChartDivWithButtons(
        model,
        viewSettings,
        assetChartData,
        false,
        showAlert,
        getStartDate,
        updateStartDate,
        getEndDate,
        updateEndDate,
      )}
      {todaysAssetsTable(model, todaysValues)}
      {assetsDivWithHeadings(model, showAlert)}

      <div className="addNewAsset">
        <h4>
          {' '}
          Add an asset, a defined-contributions pension, or revalue an asset{' '}
        </h4>
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
