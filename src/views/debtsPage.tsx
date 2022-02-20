import { ChartData, Item, ModelData, DebtVal } from './../types/interfaces';
import { checkAsset, checkTransaction } from '../models/checks';
import { debtsDivWithHeadings, defaultColumn, addIndices } from './tablePages';
import {
  deleteAsset,
  getDisplay,
  submitAsset,
  submitTransaction,
  submitTrigger,
} from './../App';

import { AddDeleteDebtForm } from './reactComponents/AddDeleteDebtForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React from 'react';
import { SimpleFormatter } from './reactComponents/NameFormatter';
import { assetsOrDebtsChartDivWithButtons } from './chartPages';
import { debtsView } from '../localization/stringConstants';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { lessThan } from '../stringUtils';
import { collapsibleFragment } from './tablePages';
import { log, printDebug } from '../utils';

function addToMap(name: string, val: DebtVal, myMap: Map<string, DebtVal>) {
  const existingEntry = myMap.get(name);
  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.debtVal += val.debtVal;
  }
}

function makeDataGrid(myMap: Map<string, DebtVal>, model: ModelData) {
  return (
    <DataGrid
      deleteFunction={undefined}
      handleGridRowsUpdated={function () {
        return false;
      }}
      rows={addIndices(
        Array.from(myMap.entries())
          .filter((key) => {
            return key[1].debtVal !== 0.0;
          })
          .map((key) => {
            if (printDebug()) {
              log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            }
            return {
              NAME: key[0],
              VALUE: `${key[1].debtVal}`,
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

export function todaysDebtsTable(
  model: ModelData,
  todaysValues: Map<string, DebtVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }
  const categorisedValues = new Map<string, DebtVal>();

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
        `Debt values at ${today.toDateString()}`,
      )}
      {collapsibleFragment(
        makeDataGrid(categorisedValues, model),
        `Debt values (categorised) at ${today.toDateString()}`,
      )}
    </>
  );
}

export function debtsDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  debtChartData: ChartData,
  todaysValues: Map<string, DebtVal>,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
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
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        ),
        'Debts data chart',
      )}
      {todaysDebtsTable(model, todaysValues)}
      {debtsDivWithHeadings(model, showAlert, doChecks)}
      {collapsibleFragment(
        <div className="addNewDebt">
          <AddDeleteDebtForm
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
        'Add or revalue a debt',
      )}
    </div>
  );
}
