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
  MonitoringChartData,
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

import { getTodaysDate, getROI } from "../models/modelUtils";
import { dateAsString, lessThan } from "../utils/stringUtils";
import { collapsibleFragment } from "./tablePages";
import { DateFormatType, log, printDebug } from "../utils/utils";
import { ViewSettings, getDisplay } from "../utils/viewUtils";
import { simpleExpense } from "../models/exampleModels";
import { getPlanningTableData, IsaAllowanceRow } from "../models/planningData";
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
  filterForEra: (item: Item) => boolean,
) {
  if (todaysValues.size === 0 || !doShowTodaysValueColumns()) {
    return;
  }

  const categorisedValues = new Map<Expense, ExpenseVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    if (!filterForEra(key[0])) {
      continue;
    }
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
        `Expense values (categorised) at ${today.getViewDescription()}`,
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
  isaAllowanceTableData: IsaAllowanceRow[],
){
  const tableData = getPlanningTableData(
    planningExpensesChartData,
    planningAssetsChartData,
    reportData,
    getROI(model).start.d,
  );

  return (
    <div className="ml-3">
      {collapsibleFragment(
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
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "BASIC",
              name: "Basic expenses",
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "LEISURE",
              name: "Leisure expenses",
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "FIXED_INCOME",
              name: "Fixed income",
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "BONDS",
              name: "Bonds release",
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "INCOMING",
              name: "Incoming",
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "COMBINED",
              name: "Outgoings",
              renderEditCell: undefined,
            },
            {
              ...cashValueColumn,
              key: "SURPLUS",
              name: "Surplus",
              renderEditCell: undefined,
            },
          ]}
          model={model}
        />,
        "Planning",
      )}
      {isaAllowanceTableData.length > 0 &&
        collapsibleFragment(
          <DataGridFinKitty
            tableID={"isaAllowanceTable"}
            rows={addIndices(isaAllowanceTableData)}
            columns={[
              {
                ...defaultColumn,
                key: "TAX_YEAR",
                name: "Tax year",
                renderEditCell: undefined,
              },
              {
                ...cashValueColumn,
                key: "USED",
                name: "Used allowance",
                renderEditCell: undefined,
              },
              {
                ...cashValueColumn,
                key: "UNUSED",
                name: "Unused allowance",
                renderEditCell: undefined,
              },
            ]}
            model={model}
          />,
          "ISA allowance by tax year (£40,000 combined)",
        )}
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
  monitoringChartData: MonitoringChartData,
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
    monitoringChartData,
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
  isaAllowanceTableData: IsaAllowanceRow[],
  monitoringChartData: MonitoringChartData,
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
      isaAllowanceTableData,
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
      monitoringChartData,
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
        parentCallbacks.filterForEra,
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
