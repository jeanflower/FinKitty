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
import { collapsibleFragment } from './incomesPage';

// import { log } from './../utils';

function addToMap(name: string, val: AssetVal, myMap: Map<string, AssetVal>) {
  const existingEntry = myMap.get(name);
  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.assetVal += val.assetVal;
  }
}

function makeDataGrid(myMap: Map<string, AssetVal>) {
  return (
    <DataGrid
      deleteFunction={undefined}
      handleGridRowsUpdated={function() {
        return false;
      }}
      rows={Array.from(myMap.entries())
        .filter(key => {
          return key[1].assetVal !== 0.0;
        })
        .map(key => {
          // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
          return {
            NAME: key[0],
            VALUE: `${key[1].assetVal}`,
            CATEGORY: `${key[1].category}`,
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
        {
          ...defaultColumn,
          key: 'CATEGORY',
          name: `category`,
          formatter: <SimpleFormatter name="name" value="unset" />,
          editable: false,
        },
      ]}
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
      <h4>Asset values at {today.toDateString()}</h4>
      {makeDataGrid(todaysValues)}
      <h4>Asset values (categorised) at {today.toDateString()}</h4>
      {makeDataGrid(categorisedValues)}
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
        'Data chart',
      )}
      {collapsibleFragment(
        <>
          {todaysAssetsTable(model, todaysValues)}
          {assetsDivWithHeadings(model, showAlert)}
        </>,
        'Data tables',
      )}

      {collapsibleFragment(
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
        </div>,
        'Add or revalue an asset',
      )}
    </div>
  );
}
