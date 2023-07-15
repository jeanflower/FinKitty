import {
  ChartData,
  Item,
  ModelData,
  ExpenseVal,
  Expense,
  ViewCallbacks,
} from '../types/interfaces';
import { checkExpense, checkTransaction } from '../models/checks';
import {
  defaultColumn,
  expensesTableDivWithHeading,
  transactionFilteredTable,
  addIndices,
  faveColumn,
} from './tablePages';
import {
  deleteExpense,
  doShowTodaysValueColumns,
  submitExpense,
  submitTransaction,
  submitTrigger,
} from '../App';
import {
  expensesChartDivWithButtons,
  getDefaultChartSettings,
} from './chartPages';
import {
  expensesView,
  planningView,
  revalueExp,
} from '../localization/stringConstants';

import { AddDeleteExpenseForm } from './reactComponents/AddDeleteExpenseForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import React from 'react';
import { SimpleFormatter } from './reactComponents/NameFormatter';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { dateAsString, lessThan } from '../utils/stringUtils';
import { collapsibleFragment } from './tablePages';
import { DateFormatType, log, printDebug } from '../utils/utils';
import { getDisplay } from '../utils/viewUtils';
import { simpleExpense } from '../models/exampleModels';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';

function addToMap(
  name: Expense,
  val: ExpenseVal,
  myMap: Map<Expense, ExpenseVal>,
) {
  const existingKey = [...myMap.keys()].find((x) => {
    return x.NAME === name.NAME;
  });
  const existingEntry = existingKey ? myMap.get(existingKey) : undefined;

  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.expenseVal += val.expenseVal;
  }
}

function makeDataGrid(
  myMap: Map<Expense, ExpenseVal>,
  model: ModelData,
  tableID: string,
) {
  return (
    <DataGridFinKitty
      tableID={tableID}
      deleteFunction={undefined}
      setEraFunction={undefined}
      handleGridRowsUpdated={function () {
        return false;
      }}
      rows={addIndices(
        Array.from(myMap.entries())
          .filter((key) => {
            return key[1].expenseVal !== 0.0;
          })
          .map((key) => {
            /* istanbul ignore if  */
            if (printDebug()) {
              log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            }
            const result = {
              NAME: key[0].NAME,
              VALUE: `${key[1].expenseVal}`,
              FREQ: `${key[1].expenseFreq}`,
              CATEGORY: `${key[1].category}`,
            };
            return result;
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
      model={model}
    />
  );
}

export function todaysExpensesTable(
  model: ModelData,
  todaysValues: Map<Expense, ExpenseVal>,
) {
  if (todaysValues.size === 0 || !doShowTodaysValueColumns()) {
    return;
  }

  const categorisedValues = new Map<Expense, ExpenseVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    if (key[1].hasStarted && !key[1].hasEnded) {
      const cat = key[1].category;
      if (cat === '') {
        addToMap(key[0], key[1], categorisedValues);
      } else {
        const catName: string = key[1].category;
        const exp = {
          ...simpleExpense,
          NAME: `${catName}${key[1].expenseFreq}`,
        };
        addToMap(exp, key[1], categorisedValues);
      }
    }
  }

  const today = getTodaysDate(model);
  return (
    <>
      {collapsibleFragment(
        makeDataGrid(categorisedValues, model, 'todaysExpensesTable'),
        `Expense values (categorised) at ${dateAsString(
          DateFormatType.View,
          today,
        )}`,
      )}
    </>
  );
}

export function expensesDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  doChecks: boolean,
  expensesChartData: ChartData,
  todaysValues: Map<Expense, ExpenseVal>,
  planningExpensesChartData: ChartData,
  parentCallbacks: ViewCallbacks,
) {
  if (getDisplay(planningView)) {
    const gemData = planningExpensesChartData.datasets;
    if (gemData.length === 0) {
      return <>You need Basic and/or Leisure expense categories to plan</>;
    }
    let tableData = [];

    for (let idx = 0; idx < gemData[0].data.length; idx++) {
      //console.log(`Expect Basic = ${gemData[0].label}`);
      //console.log(`Expect Leisure = ${gemData[1].label}`);
      const basic = gemData[0].data[idx];
      const leisure = gemData[1].data[idx];
      const combined = basic + leisure;
      //console.log(`basic = ${basic}, leisure = ${leisure}`);
      const date = planningExpensesChartData.labels[idx];
      tableData.push({
        DATE: date,
        BASIC: `${basic}`,
        LEISURE: `${leisure}`,
        COMBINED: `${combined}`,
      });
    }
    tableData = tableData.reverse();

    return (
      <div className="ml-3">
        {
          <DataGridFinKitty
            tableID={'planningTable'}
            deleteFunction={undefined}
            setEraFunction={undefined}
            handleGridRowsUpdated={function () {
              return false;
            }}
            rows={addIndices(tableData)}
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
                key: 'DATE',
                name: 'date',
                formatter: (
                  <TriggerDateFormatter
                    name="date"
                    model={model}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'BASIC',
                name: 'Basic expenses',
                formatter: <CashValueFormatter name="basic" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'LEISURE',
                name: 'Leisure expenses',
                formatter: <CashValueFormatter name="basic" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'COMBINED',
                name: 'Basic + Leisure',
                formatter: <CashValueFormatter name="name" value="unset" />,
                editable: false,
              },
            ]}
            model={model}
          />
        }
      </div>
    );
  }

  if (!getDisplay(expensesView)) {
    // log(`don't populate expensesView`);
    return;
  }
  // log(`do populate expensesView`);
  return (
    <div className="ml-3">
      {collapsibleFragment(
        expensesChartDivWithButtons(
          model,
          viewSettings,
          expensesChartData,
          getDefaultChartSettings(viewSettings, model.settings),
          parentCallbacks,
        ),
        'Expenses data chart',
      )}
      {expensesTableDivWithHeading(
        model,
        todaysValues,
        doChecks,
        parentCallbacks,
        '',
      )}
      {todaysExpensesTable(model, todaysValues)}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueExp,
        'Expense revaluations',
        parentCallbacks,
        'expenseRevalsTable',
      )}
      {collapsibleFragment(
        <div className="addNewExpense">
          <AddDeleteExpenseForm
            checkFunction={checkExpense}
            submitFunction={submitExpense}
            deleteFunction={deleteExpense}
            submitTriggerFunction={submitTrigger}
            model={model}
            showAlert={parentCallbacks.showAlert}
            checkTransactionFunction={checkTransaction}
            submitTransactionFunction={submitTransaction}
          />
        </div>,
        'Add or revalue an expense',
      )}
    </div>
  );
}
