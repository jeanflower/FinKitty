import { ChartData, Item, ModelData, ExpenseVal } from '../types/interfaces';
import { checkExpense, checkTransaction } from '../models/checks';
import {
  defaultColumn,
  expensesTableDivWithHeading,
  transactionFilteredTable,
} from './tablePages';
import {
  deleteExpense,
  getDisplay,
  submitExpense,
  submitTransaction,
  submitTrigger,
} from '../App';
import {
  expensesChartDivWithButtons,
  getDefaultChartSettings,
} from './chartPages';
import { expensesView, revalueExp } from '../localization/stringConstants';

import { AddDeleteExpenseForm } from './reactComponents/AddDeleteExpenseForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React from 'react';
import SimpleFormatter from './reactComponents/NameFormatter';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { lessThan } from '../stringUtils';
import { collapsibleFragment } from './tablePages';

function addToMap(
  name: string,
  val: ExpenseVal,
  myMap: Map<string, ExpenseVal>,
) {
  const existingEntry = myMap.get(name);
  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.expenseVal += val.expenseVal;
  }
}

function makeDataGrid(myMap: Map<string, ExpenseVal>) {
  return (
    <DataGrid
      deleteFunction={undefined}
      handleGridRowsUpdated={function() {
        return false;
      }}
      rows={Array.from(myMap.entries())
        .filter(key => {
          return key[1].expenseVal !== 0.0;
        })
        .map(key => {
          // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
          return {
            NAME: key[0],
            VALUE: `${key[1].expenseVal}`,
            FREQ: `${key[1].expenseFreq}`,
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
          key: 'FREQ',
          name: `frequency`,
          formatter: <SimpleFormatter name="frequency" value="unset" />,
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

export function todaysExpensesTable(
  model: ModelData,
  todaysValues: Map<string, ExpenseVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }

  const categorisedValues = new Map<string, ExpenseVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    const cat = key[1].category;
    if (cat === '') {
      addToMap(key[0], key[1], categorisedValues);
    } else {
      const catName: string = key[1].category;
      addToMap(`${catName}${key[1].expenseFreq}`, key[1], categorisedValues);
    }
  }

  const today = getTodaysDate(model);
  return (
    <>
      {collapsibleFragment(
        makeDataGrid(todaysValues),
        `Expense values at ${today.toDateString()}`,
      )}
      {collapsibleFragment(
        makeDataGrid(categorisedValues),
        `Expense values (categorised) at ${today.toDateString()}`,
      )}
    </>
  );
}

export function expensesDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  expensesChartData: ChartData[],
  todaysValues: Map<string, ExpenseVal>,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (!getDisplay(expensesView)) {
    return;
  }
  return (
    <div
      className="ml-3"
      style={{ display: getDisplay(expensesView) ? 'block' : 'none' }}
    >
      {collapsibleFragment(
        expensesChartDivWithButtons(
          model,
          viewSettings,
          expensesChartData,
          getDefaultChartSettings(viewSettings, model.settings),
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        ),
        'Expenses data chart',
      )}
      {todaysExpensesTable(model, todaysValues)}
      {expensesTableDivWithHeading(model, showAlert)}
      {transactionFilteredTable(
        model,
        showAlert,
        revalueExp,
        'Expense revaluations',
      )}
      {collapsibleFragment(
        <div className="addNewExpense">
          <AddDeleteExpenseForm
            checkFunction={checkExpense}
            submitFunction={submitExpense}
            deleteFunction={deleteExpense}
            submitTriggerFunction={submitTrigger}
            model={model}
            showAlert={showAlert}
            checkTransactionFunction={checkTransaction}
            submitTransactionFunction={submitTransaction}
          />
        </div>,
        'Add or revalue an expense',
      )}
    </div>
  );
}
