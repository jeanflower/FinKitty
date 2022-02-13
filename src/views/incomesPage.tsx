import { ChartData, Item, ModelData, IncomeVal } from '../types/interfaces';
import { checkIncome, checkTransaction } from '../models/checks';
import {
  collapsibleFragment,
  defaultColumn,
  incomesTableDivWithHeading,
  transactionFilteredTable,
  addIndices,
} from './tablePages';
import {
  deleteIncome,
  getDisplay,
  submitIncome,
  submitTransaction,
  submitTrigger,
} from '../App';
import {
  getDefaultChartSettings,
  incomesChartDivWithButtons,
} from './chartPages';
import { incomesView, revalueInc } from '../localization/stringConstants';

import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React from 'react';
import { SimpleFormatter } from './reactComponents/NameFormatter';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { lessThan } from '../stringUtils';
import { log, printDebug } from '../utils';

function addToMap(name: string, val: IncomeVal, myMap: Map<string, IncomeVal>) {
  const existingEntry = myMap.get(name);
  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.incomeVal += val.incomeVal;
  }
}

function makeDataGrid(myMap: Map<string, IncomeVal>, model: ModelData) {
  return (
    <DataGrid
      deleteFunction={undefined}
      handleGridRowsUpdated={function() {
        return false;
      }}
      rows={addIndices(
        Array.from(myMap.entries())
          .filter(key => {
            return key[1].incomeVal !== 0.0;
          })
          .map(key => {
            if (printDebug()) {
              log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            }
            return {
              NAME: key[0],
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

export function todaysIncomesTable(
  model: ModelData,
  todaysValues: Map<string, IncomeVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }

  const categorisedValues = new Map<string, IncomeVal>();

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
        `Income values at ${today.toDateString()}`,
      )}
      {collapsibleFragment(
        makeDataGrid(categorisedValues, model),
        `Income values (categorised) at ${today.toDateString()}`,
      )}
    </>
  );
}

export function incomesDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  incomesChartData: ChartData,
  todaysValues: Map<string, IncomeVal>,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
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
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        ),
        'Incomes data chart',
      )}
      {todaysIncomesTable(model, todaysValues)}
      {incomesTableDivWithHeading(model, showAlert, doChecks)}
      {transactionFilteredTable(
        model,
        showAlert,
        doChecks,
        revalueInc,
        'Income revaluations',
      )}

      {collapsibleFragment(
        <div className="addNewIncome">
          <AddDeleteIncomeForm
            checkIncomeFunction={checkIncome}
            checkTransactionFunction={checkTransaction}
            submitIncomeFunction={submitIncome}
            submitTransactionFunction={submitTransaction}
            deleteFunction={deleteIncome}
            submitTriggerFunction={submitTrigger}
            model={model}
            showAlert={showAlert}
          />
        </div>,
        'Add an income, a defined-benefits pension, or revalue an income',
      )}
    </div>
  );
}
