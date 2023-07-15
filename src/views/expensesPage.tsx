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
import {
  ValuesContainer,
  calculateIncomeTaxPayable,
} from '../models/evaluations';

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
  planningIncomesChartData: ChartData,
  planningAssetsChartData: ChartData,
  parentCallbacks: ViewCallbacks,
) {
  if (getDisplay(planningView)) {
    const planningExpenses = planningExpensesChartData.datasets;
    if (planningExpenses.length !== 2) {
      return <>You need Basic and/or Leisure expense categories to plan</>;
    }
    const planningIncomes = planningIncomesChartData.datasets;
    if (planningIncomes.length !== 1) {
      return <>You need Pension income categories to plan</>;
    }
    if (planningExpenses[0].label !== 'Basic') {
      throw new Error('Error: Basic not in planningExpensesChartData');
    }
    if (planningExpenses[1].label !== 'Leisure') {
      throw new Error('Error: Leisure not in planningExpensesChartData');
    }
    if (planningExpenses[0].data.length !== planningExpenses[1].data.length) {
      throw new Error(
        'Error: mismatch Basic/Leisure in planningExpensesChartData',
      );
    }
    if (planningIncomes[0].label !== 'Pension') {
      throw new Error('Error: Pension not in planningIncomesChartData');
    }
    if (planningExpenses[0].data.length !== planningIncomes[0].data.length) {
      throw new Error(
        'Error: mismatch Expense/Income in planningExpensesChartData',
      );
    }
    let tableData = [];

    for (let idx = 0; idx < planningExpenses[0].data.length; idx++) {
      //console.log(`Expect Leisure = ${gemData[1].label}`);
      const basic = planningExpenses[0].data[idx];
      const leisure = planningExpenses[1].data[idx];
      const combined = basic + leisure;
      //console.log(`basic = ${basic}, leisure = ${leisure}`);
      const date = planningExpensesChartData.labels[idx];
      const date2 = planningIncomesChartData.labels[idx];
      const date3 = planningAssetsChartData.labels[idx];
      if (date !== date2) {
        throw new Error(
          'Error: mismatch Expense/Income dates in planningExpensesChartData',
        );
      }
      if (date !== date3) {
        throw new Error(
          'Error: mismatch Expense/Asset dates in planningExpensesChartData',
        );
      }
      const pension = planningIncomes[0].data[idx];
      const taxBands = calculateIncomeTaxPayable(
        pension,
        2023,
        new ValuesContainer(model),
      );
      let tax = 0.0;
      taxBands.forEach((b) => {
        tax += b.amountLiable * b.rate;
      });

      let bondsReleaseFunds = 0;
      planningAssetsChartData.datasets.forEach((pscd) => {
        console.log(`pscd.data[idx] = ${pscd.data[idx]}`);
        if (pscd.data[idx] < 0) {
          bondsReleaseFunds += -pscd.data[idx];
        }
      });

      tableData.push({
        DATE: date,
        BASIC: `${basic}`,
        LEISURE: `${leisure}`,
        COMBINED: `${combined}`,
        PENSION: `${pension}`,
        TAX: `${tax}`,
        PENSION_NET: `${pension - tax}`,
        BONDS: `${bondsReleaseFunds}`,
        INCOMING: `${pension - tax + bondsReleaseFunds}`,
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
                key: 'PENSION',
                name: 'Pension income',
                formatter: <CashValueFormatter name="pension" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'TAX',
                name: 'Tax estimate',
                formatter: <CashValueFormatter name="tax" value="unset" />,
                editable: false,
              },
              {
                ...defaultColumn,
                key: 'PENSION_NET',
                name: 'Pension after tax',
                formatter: (
                  <CashValueFormatter name="net pension" value="unset" />
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
