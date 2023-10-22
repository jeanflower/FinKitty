import {
  ChartData,
  Item,
  ModelData,
  IncomeVal,
  Income,
  ViewCallbacks,
} from '../types/interfaces';
import { checkIncome, checkTransaction } from '../models/checks';
import {
  collapsibleFragment,
  defaultColumn,
  incomesTableDivWithHeading,
  transactionFilteredTable,
  addIndices,
  cashValueColumn,
} from './tablePages';

import {
  getDefaultChartSettings,
  incomesChartDivWithButtons,
} from './chartPages';
import { incomesView, revalueInc } from '../localization/stringConstants';

import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import React from 'react';

import { getTodaysDate } from '../models/modelUtils';
import { dateAsString, lessThan } from '../utils/stringUtils';
import { DateFormatType, log, printDebug } from '../utils/utils';
import { ViewSettings, getDisplay } from '../utils/viewUtils';
import { simpleIncome } from '../models/exampleModels';

function addToMap(name: Income, val: IncomeVal, myMap: Map<Income, IncomeVal>) {
  const existingKey = [...myMap.keys()].find((x) => {
    return x.NAME === name.NAME;
  });
  const existingEntry = existingKey ? myMap.get(existingKey) : undefined;

  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.incomeVal += val.incomeVal;
  }
}

function makeDataGridForTodaysIncomes(
  myMap: Map<Income, IncomeVal>,
  model: ModelData,
  tableID: string,
) {
  return (
    <DataGridFinKitty
      tableID={tableID}
      rows={addIndices(
        Array.from(myMap.entries())
          .filter((key) => {
            return key[1].incomeVal !== 0.0;
          })
          .map((key) => {
            /* istanbul ignore if  */
            if (printDebug()) {
              log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            }
            return {
              NAME: key[0].NAME,
              ERA: key[0].ERA,
              VALUE: `${key[1].incomeVal}`,
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

export function todaysIncomesTable(
  model: ModelData,
  todaysValues: Map<Income, IncomeVal>,
  doShowTodaysValueColumns: () => boolean,
) {
  if (todaysValues.size === 0 || !doShowTodaysValueColumns()) {
    return;
  }

  const categorisedValues = new Map<Income, IncomeVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    if (!key[1].hasEnded) {
      const cat = key[1].category;
      if (cat === '') {
        addToMap(key[0], key[1], categorisedValues);
      } else {
        const catName: string = key[1].category;
        addToMap(
          {
            ...simpleIncome,
            NAME: catName,
          },
          key[1],
          categorisedValues,
        );
      }
    }
  }

  const today = getTodaysDate(model);
  return (
    <>
      {collapsibleFragment(
         makeDataGridForTodaysIncomes(
           categorisedValues, 
           model, 
           'todaysIncomesTable'
         ),
        `Income values (categorised) at ${dateAsString(
          DateFormatType.View,
          today,
        )}`,
      )}
    </>
  );
}

export function incomesDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  doChecks: boolean,
  incomesChartData: ChartData,
  todaysValues: Map<Income, IncomeVal>,
  parentCallbacks: ViewCallbacks,
) {
  if (!getDisplay(incomesView)) {
    // log(`don't populate incomesView`);
    return;
  }
  // log(`do populate incomesView`);
  return (
    <div className="ml-3">
      {collapsibleFragment(
        incomesChartDivWithButtons(
          model,
          viewSettings,
          incomesChartData,
          getDefaultChartSettings(viewSettings, model.settings),
          parentCallbacks,
        ),
        'Incomes data chart',
      )}
      {incomesTableDivWithHeading(
        model,
        todaysValues,
        doChecks,
        parentCallbacks,
      )}
      {todaysIncomesTable(model, todaysValues, parentCallbacks.doShowTodaysValueColumns)}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueInc,
        'Income revaluations',
        parentCallbacks,
        'incomeRevalsTable',
      )}

      {collapsibleFragment(
        <div className="addNewIncome">
          <AddDeleteIncomeForm
            checkIncomeFunction={checkIncome}
            checkTransactionFunction={checkTransaction}
            submitIncomeFunction={parentCallbacks.submitIncome}
            submitTransactionFunction={parentCallbacks.submitTransaction}
            deleteFunction={parentCallbacks.deleteIncome}
            submitTriggerFunction={parentCallbacks.submitTrigger}
            model={model}
            showAlert={parentCallbacks.showAlert}
            doCheckBeforeOverwritingExistingData={parentCallbacks.doCheckBeforeOverwritingExistingData}
          />
        </div>,
        'Add an income, a defined-benefits pension, or revalue an income',
      )}
    </div>
  );
}
