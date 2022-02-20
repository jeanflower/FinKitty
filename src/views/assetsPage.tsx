import { AssetVal, ChartData, Item, ModelData } from './../types/interfaces';
import { assetsDivWithHeadings, defaultColumn, addIndices } from './tablePages';
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
import { SimpleFormatter } from './reactComponents/NameFormatter';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import { assetsView } from '../localization/stringConstants';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { lessThan } from '../stringUtils';
import { collapsibleFragment } from './tablePages';
import { log, printDebug } from '../utils';

function addToMap(name: string, val: AssetVal, myMap: Map<string, AssetVal>) {
  const existingEntry = myMap.get(name);
  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.assetVal += val.assetVal;
    if (existingEntry.assetQ && val.assetQ) {
      existingEntry.assetQ += val.assetQ;
    } else if (val.assetQ) {
      existingEntry.assetQ = val.assetQ;
    }
  }
}

function makeDataGrid(myMap: Map<string, AssetVal>, model: ModelData) {
  return (
    <DataGrid
      deleteFunction={undefined}
      handleGridRowsUpdated={function () {
        return false;
      }}
      rows={addIndices(
        Array.from(myMap.entries())
          .filter((key) => {
            return key[1].assetVal !== 0.0;
          })
          .map((key) => {
            if (printDebug()) {
              log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            }
            const quantityText = key[1].assetQ ? `${key[1].assetQ}` : '';
            return {
              NAME: key[0],
              VALUE: `${key[1].assetVal}`,
              QUANTITY: quantityText,
              CATEGORY: `${key[1].category}`,
            };
          })
          .sort((a: Item, b: Item) => lessThan(b.NAME, a.NAME)),
      )}
      columns={[
        /*
        {
          ...defaultColumn,
          key: 'index',
          name: 'index',
          formatter: <SimpleFormatter name="name" value="unset" />,
          editable: false,
        },
        */
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
        {
          ...defaultColumn,
          key: 'QUANTITY',
          name: `quantity`,
          formatter: <SimpleFormatter name="quantity" value="unset" />,
          editable: false,
        },
        {
          ...defaultColumn,
          key: 'CATEGORY',
          name: `category`,
          formatter: <SimpleFormatter name="name" value="unset" />,
          editable: false,
        },
      ]}
      triggers={model.triggers}
    />
  );
}

export function todaysAssetsTable(
  model: ModelData,
  todaysValues: Map<string, AssetVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }
  const categorisedValues = new Map<string, AssetVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    const cat = key[1].category;
    if (cat === '') {
      addToMap(key[0], key[1], categorisedValues);
    } else {
      const catName: string = key[1].category;
      addToMap(catName, key[1], categorisedValues);
    }
  }
  const today = getTodaysDate(model);
  return (
    <>
      {collapsibleFragment(
        makeDataGrid(todaysValues, model),
        `Asset values at ${today.toDateString()}`,
      )}
      {collapsibleFragment(
        makeDataGrid(categorisedValues, model),
        `Asset values (categorised) at ${today.toDateString()}`,
      )}
    </>
  );
}

export function assetsDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  assetChartData: ChartData,
  todaysValues: Map<string, AssetVal>,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (!getDisplay(assetsView)) {
    // log(`don't populate assetsView`);
    return;
  }
  // log(`do populate assetsView`);

  return (
    <div className="ml-3">
      {collapsibleFragment(
        assetsOrDebtsChartDivWithButtons(
          model,
          viewSettings,
          assetChartData,
          false,
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        ),
        'Asset data chart',
      )}
      {todaysAssetsTable(model, todaysValues)}
      {assetsDivWithHeadings(model, showAlert, doChecks)}
      {collapsibleFragment(
        <div className="addNewAsset">
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
        </div>,
        `Add an asset, a defined-contributions pension, or revalue an asset`,
      )}
    </div>
  );
}
