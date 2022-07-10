import {
  AssetOrDebtVal,
  ChartData,
  Item,
  ModelData,
} from './../types/interfaces';
import { assetsDivWithHeadings, defaultColumn, addIndices } from './tablePages';
import { checkAsset, checkTransaction } from '../models/checks';
import {
  deleteAsset,
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
import { lessThan } from '../utils/stringUtils';
import { collapsibleFragment } from './tablePages';
import { log, printDebug } from '../utils/utils';
import { getDisplay } from '../utils/viewUtils';
import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';

function addToMap(
  name: string,
  val: AssetOrDebtVal,
  myMap: Map<string, AssetOrDebtVal>,
) {
  const existingEntry = myMap.get(name);
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

function makeDataGrid(myMap: Map<string, AssetOrDebtVal>, model: ModelData) {
  return (
    <DataGrid
      deleteFunction={undefined}
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
              NAME: key[0],
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
  todaysValues: Map<string, AssetOrDebtVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }
  const categorisedValues = new Map<string, AssetOrDebtVal>();

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
  deleteTransactions: (arg: string[]) => void,
  doChecks: boolean,
  assetChartData: ChartData,
  todaysValues: Map<string, AssetOrDebtVal>,
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
      <AddDeleteEntryForm
        name="start"
        getValue={
          getStartDate
            ? getStartDate
            : () => {
                return '';
              }
        }
        submitFunction={
          updateStartDate
            ? updateStartDate
            : async () => {
                return;
              }
        }
        showAlert={showAlert}
      />
      <AddDeleteEntryForm
        name="end"
        getValue={
          getEndDate
            ? getEndDate
            : () => {
                return '';
              }
        }
        submitFunction={
          updateEndDate
            ? updateEndDate
            : async () => {
                return;
              }
        }
        showAlert={showAlert}
      />
      {assetsDivWithHeadings(
        model,
        todaysValues,
        showAlert,
        deleteTransactions,
        doChecks,
      )}
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
            showAlert={showAlert}
          />
        </div>,
        `Add an asset, a defined-contributions pension, or revalue an asset`,
      )}
    </div>
  );
}
