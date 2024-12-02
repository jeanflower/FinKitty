import {
  ChartData,
  Item,
  ModelData,
  ExpenseVal,
  Expense,
  ViewCallbacks,
  ReportDatum,
} from "../types/interfaces";
import { checkExpense, checkTransaction } from "../models/checks";
import {
  defaultColumn,
  expensesTableDivWithHeading,
  transactionFilteredTable,
  addIndices,
  cashValueColumn,
  triggerDateColumn,
  expensesMonitoringDivWithHeading,
} from "./tablePages";

import {
  expensesChartDivWithButtons,
  getDefaultChartSettings,
} from "./chartPages";
import {
  expensesView,
  monitoringView,
  planningView,
  revalueExp,
} from "../localization/stringConstants";

import { AddDeleteExpenseForm } from "./reactComponents/AddDeleteExpenseForm";
import DataGridFinKitty from "./reactComponents/DataGridFinKitty";
import React from "react";

import { getTodaysDate } from "../models/modelUtils";
import { dateAsString, lessThan } from "../utils/stringUtils";
import { collapsibleFragment } from "./tablePages";
import { DateFormatType, log, printDebug } from "../utils/utils";
import { ViewSettings, getDisplay } from "../utils/viewUtils";
import { simpleExpense } from "../models/exampleModels";
import { getPlanningTableData } from "../models/planningData";
import { inspect } from 'util';
inspect;

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
        },
        */
        {
          ...defaultColumn,
          key: "NAME",
          name: "name",
        },
        {
          ...cashValueColumn,
          key: "VALUE",
          name: `value`,
        },
        {
          ...defaultColumn,
          key: "FREQ",
          name: `frequency`,
        },
        {
          ...defaultColumn,
          key: "CATEGORY",
          name: `category`,
        },
      ]}
      model={model}
    />
  );
}

export function todaysExpensesTable(
  model: ModelData,
  todaysValues: Map<Expense, ExpenseVal>,
  doShowTodaysValueColumns: () => boolean,
) {
  if (todaysValues.size === 0 || !doShowTodaysValueColumns()) {
    return;
  }

  const categorisedValues = new Map<Expense, ExpenseVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    if (key[1].hasStarted && !key[1].hasEnded) {
      const cat = key[1].category;
      if (cat === "") {
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
        makeDataGrid(categorisedValues, model, "todaysExpensesTable"),
        `Expense values (categorised) at ${dateAsString(
          DateFormatType.View,
          today,
        )}`,
      )}
    </>
  );
}

function getPlanningDiv(
  model: ModelData,
  expensesChartData: ChartData,
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
){
  const tableData = getPlanningTableData(
    expensesChartData,
    planningExpensesChartData,
    planningAssetsChartData,
    reportData,
  );

  return (
    <div className="ml-3">
      {
        <DataGridFinKitty
          tableID={"planningTable"}
          rows={addIndices(tableData)}
          columns={[
            /*
            {
              ...defaultColumn,
              key: 'index',
              name: 'index',
            },
            */
            {
              ...triggerDateColumn(model),
              key: "DATE",
              name: "date",
            },
            {
              ...cashValueColumn,
              key: "BASIC",
              name: "Basic expenses",
            },
            {
              ...cashValueColumn,
              key: "LEISURE",
              name: "Leisure expenses",
            },
            {
              ...cashValueColumn,
              key: "FIXED_INCOME",
              name: "Fixed income",
            },
            {
              ...cashValueColumn,
              key: "BONDS",
              name: "Bonds release",
            },
            {
              ...cashValueColumn,
              key: "INCOMING",
              name: "Incoming",
            },
            {
              ...cashValueColumn,
              key: "COMBINED",
              name: "Outgoings",
            },
            {
              ...cashValueColumn,
              key: "SURPLUS",
              name: "Surplus",
            },
          ]}
          model={model}
        />
      }
    </div>
  );
}

function getMonitoringDiv(
  model: ModelData,
  expensesChartData: ChartData,
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
  doChecks: boolean,
  todaysValues: Map<Expense, ExpenseVal>,
  parentCallbacks: ViewCallbacks,
){
  return expensesMonitoringDivWithHeading(
    model,
    expensesChartData,
    planningExpensesChartData, // for Basic and Leisure for Planning
    planningAssetsChartData, // for maturing Bonds for Planning
    reportData,
    todaysValues,
    doChecks,
    parentCallbacks,
    'expensesMonitoring',
  );
}

export function expensesDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  doChecks: boolean,
  expensesChartData: ChartData,
  todaysValues: Map<Expense, ExpenseVal>,
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
  parentCallbacks: ViewCallbacks,
) {
  // console.log(`reportData.length = ${reportData.length}`)
  //reportData.forEach((d) => {
  //  log(`report's item ${d.date}, ${d.name}, ${d.newVal}`);
  //});

  if (getDisplay(planningView)) {
    return getPlanningDiv(
      model,
      expensesChartData,
      planningExpensesChartData, // for Basic and Leisure for Planning
      planningAssetsChartData, // for maturing Bonds for Planning
      reportData,
    );
  }
  if (getDisplay(monitoringView)) {
    return getMonitoringDiv(
      model,
      expensesChartData,
      planningExpensesChartData, // for Basic and Leisure for Planning
      planningAssetsChartData, // for maturing Bonds for Planning
      reportData,
      doChecks,
      todaysValues,
      parentCallbacks,
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
        "Expenses data chart",
      )}
      {expensesTableDivWithHeading(
        model,
        todaysValues,
        doChecks,
        parentCallbacks,
        "",
      )}
      {todaysExpensesTable(
        model,
        todaysValues,
        parentCallbacks.doShowTodaysValueColumns,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueExp,
        "Expense revaluations",
        parentCallbacks,
        "expenseRevalsTable",
      )}
      {collapsibleFragment(
        <div className="addNewExpense">
          <AddDeleteExpenseForm
            checkFunction={checkExpense}
            submitFunction={parentCallbacks.submitExpense}
            deleteFunction={parentCallbacks.deleteExpense}
            submitTriggerFunction={parentCallbacks.submitTrigger}
            model={model}
            showAlert={parentCallbacks.showAlert}
            checkTransactionFunction={checkTransaction}
            submitTransactionFunction={parentCallbacks.submitTransaction}
            doCheckBeforeOverwritingExistingData={
              parentCallbacks.doCheckBeforeOverwritingExistingData
            }
          />
        </div>,
        "Add or revalue an expense",
      )}
    </div>
  );
}
