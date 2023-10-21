import {
  Asset,
  AssetOrDebtVal,
  ChartData,
  Item,
  ModelData,
  ViewCallbacks,
} from './../types/interfaces';
import {
  assetsDivWithHeadings,
  defaultColumn,
  addIndices,
  faveColumn,
  cashValueColumn,
} from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';

import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import React from 'react';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import { assetsView } from '../localization/stringConstants';
import { getTodaysDate } from '../models/modelUtils';
import { dateAsString, lessThan } from '../utils/stringUtils';
import { collapsibleFragment } from './tablePages';
import { DateFormatType, log, printDebug } from '../utils/utils';
import { ViewSettings, getDisplay } from '../utils/viewUtils';
import { simpleAsset } from '../models/exampleModels';

function addToMap(
  name: Asset,
  val: AssetOrDebtVal,
  myMap: Map<Asset, AssetOrDebtVal>,
) {
  const existingKey = [...myMap.keys()].find((x) => {
    return x.NAME === name.NAME;
  });
  const existingEntry = existingKey ? myMap.get(existingKey) : undefined;

  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.val += val.val;
    if (existingEntry.quantity && val.quantity) {
      existingEntry.quantity += val.quantity;
    } else if (val.quantity) {
      existingEntry.quantity = val.quantity;
    }
  }
}

function makeDataGrid(
  myMap: Map<Asset, AssetOrDebtVal>,
  model: ModelData,
  tableID: string,
  parentCallbacks: ViewCallbacks,
) {
  return (
    <DataGridFinKitty
      tableID={tableID}
      deleteFunction={undefined}
      setEraFunction={undefined}
      rows={addIndices(
        Array.from(myMap.entries())
          .filter((key) => {
            return key[1].val !== 0.0;
          })
          .map((key) => {
            /* istanbul ignore if  */
            if (printDebug()) {
              log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            }
            const quantityText = key[1].quantity ? `${key[1].quantity}` : '';
            return {
              NAME: key[0].NAME,
              ERA: key[0].ERA,
              VALUE: `${key[1].val}`,
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
        },
        */
        faveColumn(
          parentCallbacks.deleteAsset,
          'delAsset',
        ),
        {
          ...defaultColumn,
          key: 'NAME',
          name: 'name',
        },
        {
          ...cashValueColumn,
          key: 'VALUE',
          name: `value`,
        },
        {
          ...defaultColumn,
          key: 'QUANTITY',
          name: `quantity`,
        },
        {
          ...defaultColumn,
          key: 'CATEGORY',
          name: `category`,
        },
      ]}
      model={model}
    />
  );
}

export function todaysAssetsTable(
  model: ModelData,
  todaysValues: Map<Asset, AssetOrDebtVal>,
  parentCallbacks: ViewCallbacks,
) {
  if (todaysValues.size === 0 || !parentCallbacks.doShowTodaysValueColumns()) {
    return;
  }
  const categorisedValues = new Map<Asset, AssetOrDebtVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    const cat = key[1].category;
    if (cat === '') {
      addToMap(key[0], key[1], categorisedValues);
    } else {
      const catName: string = key[1].category;
      const a = {
        ...simpleAsset,
        NAME: catName,
      };
      addToMap(a, key[1], categorisedValues);
    }
  }
  const today = getTodaysDate(model);
  return (
    <>
      {collapsibleFragment(
        makeDataGrid(
          categorisedValues, 
          model, 
          'todaysAssetsTable',
          parentCallbacks,
        ),
        `Asset values (categorised) at ${dateAsString(
          DateFormatType.View,
          today,
        )}`,
      )}
    </>
  );
}

export function assetsDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  doChecks: boolean,
  assetChartData: ChartData,
  todaysValues: Map<Asset, AssetOrDebtVal>,
  parentCallbacks: ViewCallbacks,
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
          parentCallbacks,
        ),
        'Asset data chart',
      )}
      {assetsDivWithHeadings(
        model,
        todaysValues,
        doChecks,
        parentCallbacks,
        '',
      )}
      {todaysAssetsTable(
        model, 
        todaysValues,
        parentCallbacks,
        )}
      {collapsibleFragment(
        <div className="addNewAsset">
          <AddDeleteAssetForm
            checkAssetFunction={checkAsset}
            submitAssetFunction={parentCallbacks.submitAsset}
            checkTransactionFunction={checkTransaction}
            submitTransactionFunction={parentCallbacks.submitTransaction}
            deleteAssetFunction={parentCallbacks.deleteAsset}
            submitTriggerFunction={parentCallbacks.submitTrigger}
            model={model}
            showAlert={parentCallbacks.showAlert}
            doCheckBeforeOverwritingExistingData={parentCallbacks.doCheckBeforeOverwritingExistingData}
          />
        </div>,
        `Add an asset, a defined-contributions pension, or revalue an asset`,
      )}
    </div>
  );
}
