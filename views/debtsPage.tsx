import {
  ChartData,
  Item,
  ModelData,
  AssetOrDebtVal,
  Asset,
  ViewCallbacks,
} from './../types/interfaces';
import { checkAsset, checkTransaction } from '../models/checks';
import {
  debtsDivWithHeadings,
  defaultColumn,
  addIndices,
  cashValueColumn,
} from './tablePages';

import { AddDeleteDebtForm } from './reactComponents/AddDeleteDebtForm';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import React from 'react';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import { debtsView } from '../localization/stringConstants';

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
  }
}

function makeDataGridForTodaysDebts(
  myMap: Map<Asset, AssetOrDebtVal>,
  model: ModelData,
  tableID: string,
) {
  return (
    <DataGridFinKitty
      tableID={tableID}
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
            return {
              NAME: key[0].NAME,
              VALUE: `${key[1].val}`,
              CATEGORY: `${key[1].category}`,
            };
          }),
      ).sort((a: Item, b: Item) => lessThan(a.NAME, b.NAME))}
      columns={[
        /*
        {
          ...defaultColumn,
          key: 'index',
          name: 'index',
        },
        */
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
          key: 'CATEGORY',
          name: `category`,
        },
      ]}
      model={model}
    />
  );
}

export function todaysDebtsTable(
  model: ModelData,
  todaysValues: Map<Asset, AssetOrDebtVal>,
  doShowTodaysValueColumns: () => boolean,
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
        name: catName,
      };
      addToMap(a, key[1], categorisedValues);
    }
  }

  const today = getTodaysDate(model);
  return (
    <>
      {collapsibleFragment(
        makeDataGridForTodaysDebts(categorisedValues, model, 'todaysDebtsTable'),
        `Debt values (categorised) at ${dateAsString(
          DateFormatType.View,
          today,
        )}`,
      )}
    </>
  );
}

export function debtsDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  doChecks: boolean,
  debtChartData: ChartData,
  todaysDebtValues: Map<Asset, AssetOrDebtVal>,
  parentCallbacks: ViewCallbacks,
) {
  if (!getDisplay(debtsView)) {
    // log(`don't populate debtsView`);
    return;
  }
  // log(`do populate debtsView`);

  return (
    <div className="ml-3">
      {collapsibleFragment(
        assetsOrDebtsChartDivWithButtons(
          model,
          viewSettings,
          debtChartData,
          true,
          parentCallbacks,
        ),
        'Debts data chart',
      )}
      {debtsDivWithHeadings(
        model,
        todaysDebtValues,
        doChecks,
        parentCallbacks,
        '',
      )}
      {todaysDebtsTable(model, todaysDebtValues, parentCallbacks.doShowTodaysValueColumns)}
      {collapsibleFragment(
        <div className="addNewDebt">
          <AddDeleteDebtForm
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
        'Add or revalue a debt',
      )}
    </div>
  );
}
