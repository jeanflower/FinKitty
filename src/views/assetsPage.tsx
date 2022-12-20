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
} from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';
import {
  deleteAsset,
  doShowTodaysValueColumns,
  getOption,
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
import { dateAsString, lessThan } from '../utils/stringUtils';
import { collapsibleFragment } from './tablePages';
import { DateFormatType, log, printDebug } from '../utils/utils';
import { getDisplay } from '../utils/viewUtils';
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

function makeDataGrid(myMap: Map<Asset, AssetOrDebtVal>, model: ModelData) {
  return (
    <DataGrid
      deleteFunction={undefined}
      setFavouriteFunction={undefined}
      handleGridRowsUpdated={function () {
        return false;
      }}
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
              FAVOURITE: key[0].FAVOURITE,
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
          formatter: <SimpleFormatter name="name" value="unset" />,
          editable: false,
        },
        */
        faveColumn,
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
      model={model}
    />
  );
}

export function todaysAssetsTable(
  model: ModelData,
  todaysValues: Map<Asset, AssetOrDebtVal>,
) {
  if (todaysValues.size === 0 || !doShowTodaysValueColumns()) {
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
        makeDataGrid(categorisedValues, model),
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
      {assetsDivWithHeadings(model, todaysValues, doChecks, parentCallbacks)}
      {todaysAssetsTable(model, todaysValues)}
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
            showAlert={parentCallbacks.showAlert}
          />
        </div>,
        `Add an asset, a defined-contributions pension, or revalue an asset`,
      )}
    </div>
  );
}
