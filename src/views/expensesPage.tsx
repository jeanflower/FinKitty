import {
  ChartData,
  Item,
  ModelData,
  ExpenseVal,
  Expense,
  ViewCallbacks,
  ReportDatum,
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
  planningExpensesChartData: ChartData, // to collect Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // to collect maturing Bonds for Planning
  reportData: ReportDatum[],
  parentCallbacks: ViewCallbacks,
) {
  //reportData.forEach((d) => {
  //  log(`report's item ${d.date}, ${d.name}, ${d.newVal}`);
  //});

  if (getDisplay(planningView)) {
    const planningExpenses = planningExpensesChartData.datasets;

    let tableData = [];

    const basicExpenses = planningExpenses.find((pe) => {
      return pe.label === 'Basic'
    });
    const leisureExpenses = planningExpenses.find((pe) => {
      return pe.label === 'Leisure'
    });
    for (let idx = 0; idx < expensesChartData.labels.length; idx++) {
      //console.log(`Expect Leisure = ${gemData[1].label}`);
      let basic = 0;
      if (basicExpenses) {
        basic = basicExpenses.data[idx];
      }
      let leisure = 0;
      if (leisureExpenses) {
        leisure = leisureExpenses.data[idx];
      }
  
      const combined = basic + leisure;
      //console.log(`basic = ${basic}, leisure = ${leisure}`);
      const date = expensesChartData.labels[idx];

      let bondsReleaseFunds = 0;
      if (idx > 0) {
        const bondsIdx = idx - 1; // show bond funds one year later
        planningAssetsChartData.datasets.forEach((pscd) => {
          // console.log(`pscd.data[idx] = ${pscd.data[idx]}`);
          if (pscd.data[bondsIdx] < 0) {
            bondsReleaseFunds += -pscd.data[bondsIdx];
          }
        });
      }

      const dateObj = new Date(date);
      const dateObjBefore = new Date(date);
      dateObjBefore.setFullYear(dateObj.getFullYear() - 1);

      const reportsInYear = reportData.filter((d) => {
        const ddate = d.date;
        const ddateObj = new Date(ddate);
        const result =
          ddateObj.getTime() >= dateObjBefore.getTime() &&
          ddateObj.getTime() < dateObj.getTime();
        // console.log(`include report item ${d.date}, ${d.name}? ${result}`);
        return result;
      });

      let fixedIncome = 0;
      // log(`for date ${date}`);
      reportsInYear.forEach((d) => {
        // log(`report's item ${d.date}, ${d.name}, ${d.newVal}`);
        if (d.newVal) {
          fixedIncome += d.newVal;
          // log(`after adding ${d.newVal} for ${d.name},${d.date} fixedIncome = ${fixedIncome}`)
        }
      });
      // log(`accumulated fixedIncome = ${fixedIncome}`)

      tableData.push({
        DATE: date,
        BASIC: `${basic}`,
        LEISURE: `${leisure}`,
        COMBINED: `${combined}`,
        FIXED_INCOME: `${fixedIncome}`,
        BONDS: `${bondsReleaseFunds}`,
        INCOMING: `${fixedIncome + bondsReleaseFunds}`,
        SURPLUS: `${fixedIncome + bondsReleaseFunds - combined}`,
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
                formatter: <CashValueFormatter name="leisure" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'FIXED_INCOME',
                name: 'Fixed income',
                formatter: (
                  <CashValueFormatter name="fixedIncome" value="unset" />
                ),
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'BONDS',
                name: 'Bonds release',
                formatter: <CashValueFormatter name="bonds" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'INCOMING',
                name: 'Incoming',
                formatter: <CashValueFormatter name="incoming" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'COMBINED',
                name: 'Outgoings',
                formatter: <CashValueFormatter name="outgoing" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'SURPLUS',
                name: 'Surplus',
                formatter: <CashValueFormatter name="outgoing" value="unset" />,
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
