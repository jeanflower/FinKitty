import React from 'react';
import {
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
} from '../types/interfaces';

import {
  checkAsset,
  checkExpense,
  checkIncome,
  checkTransaction,
  checkTrigger,
} from '../models/checks';

import DataGrid from './reactComponents/DataGrid';

import {
  makeBooleanFromYesNo,
  makeCashValueFromString,
  makeDateFromString,
  makeGrowthFromString,
  makePurchasePriceFromString,
  makeStringFromGrowth,
  makeStringFromPurchasePrice,
  makeStringFromValueAbsProp,
  makeValueAbsPropFromString,
  makeYesNoFromBoolean,
  showObj,
} from '../utils';

import NameFormatter from './reactComponents/NameFormatter';
import ToFromValueFormatter from './reactComponents/ToFromValueFormatter';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';
import GrowthFormatter from './reactComponents/GrowthFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

import {
  assetsTable,
  expensesTable,
  incomesTable,
  settingsTable,
  showContent,
  submitAsset,
  submitExpense,
  submitIncome,
  submitTransaction,
  submitTrigger,
  submitSetting,
  transactionsTable,
  triggersTable,
  debtsTable,
} from '../App';
import { taxPot } from '../localization/stringConstants';
import { log } from 'util';

function prohibitEditOfName() {
  alert('prohibit edit of name');
}

function handleExpenseGridRowsUpdated(model: DbModelData, args: any) {
  // log('handleExpenseGridRowsUpdated', arguments);
  const expense = args[0].fromRowData;
  // log('old expense '+showObj(expense));
  if (args[0].cellKey === 'NAME') {
    if (expense.NAME !== args[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }

  const oldValue = expense[args[0].cellKey];
  expense[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new expense '+showObj(expense));
  const parsedCPIImmune = makeBooleanFromYesNo(expense.IS_CPI_IMMUNE);
  const parsedValue = makeCashValueFromString(expense.VALUE);
  const parsedGrowth = makeGrowthFromString(expense.GROWTH, model.settings);
  if (!parsedCPIImmune.checksOK) {
    alert("Whether expense is CPI-immune should be 'y' or 'n'");
    expense[args[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`Value ${expense.VALUE} can't be understood as a cash value}`);
    expense[args[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    alert(`Value ${expense.GROWTH} can't be understood as a growth}`);
    expense[args[0].cellKey] = oldValue;
  } else {
    const expenseForSubmission: DbExpense = {
      NAME: expense.NAME,
      CATEGORY: expense.CATEGORY,
      START: expense.START,
      END: expense.END,
      VALUE: `${parsedValue.value}`,
      VALUE_SET: expense.VALUE_SET,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: parsedCPIImmune.value,
    };
    // log(`expenseForSubmission = ${showObj(expenseForSubmission)}`);
    const checks = checkExpense(expenseForSubmission, model);
    if (checks === '') {
      submitExpense(expenseForSubmission);
    } else {
      alert(checks);
      expense[args[0].cellKey] = oldValue;
    }
  }
}

function handleIncomeGridRowsUpdated(model: DbModelData, args: any) {
  // log('handleIncomeGridRowsUpdated');
  const income = args[0].fromRowData;
  // log('old income '+showObj(income));
  if (args[0].cellKey === 'NAME') {
    if (income.NAME !== args[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }

  const oldValue = income[args[0].cellKey];
  income[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new income '+showObj(income));
  const parsedCPIImmune = makeBooleanFromYesNo(income.IS_CPI_IMMUNE);
  const parsedValue = makeCashValueFromString(income.VALUE);
  const parsedGrowth = makeGrowthFromString(income.GROWTH, model.settings);
  if (!parsedCPIImmune.checksOK) {
    alert("Whether income is CPI-immune should be 'y' or 'n'");
    income[args[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`Value ${income.VALUE} can't be understood as a cash value}`);
    income[args[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    alert(`Value ${income.GROWTH} can't be understood as a growth}`);
    income[args[0].cellKey] = oldValue;
  } else {
    const incomeForSubmission: DbIncome = {
      NAME: income.NAME,
      CATEGORY: income.CATEGORY,
      START: income.START,
      END: income.END,
      VALUE: `${parsedValue.value}`,
      VALUE_SET: income.VALUE_SET,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: parsedCPIImmune.value,
      LIABILITY: income.LIABILITY,
    };
    const checks = checkIncome(incomeForSubmission, model);
    if (checks === '') {
      submitIncome(incomeForSubmission);
    } else {
      alert(checks);
      income[args[0].cellKey] = oldValue;
    }
  }
}

function handleTriggerGridRowsUpdated() {
  // log('handleTriggerGridRowsUpdated', arguments);
  const trigger = arguments[0].fromRowData;
  if (arguments[0].cellKey === 'NAME') {
    if (trigger.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  const oldValue = trigger[arguments[0].cellKey];
  trigger[arguments[0].cellKey] = arguments[0].updated[arguments[0].cellKey];
  // log(`submitTrigger(trigger) has trigger = ${showObj(trigger)}`);
  const forSubmit: DbTrigger = {
    NAME: trigger.NAME,
    DATE: makeDateFromString(trigger.DATE),
  };
  const checks = checkTrigger(forSubmit);
  if (checks === '') {
    submitTrigger(forSubmit);
  } else {
    alert(checks);
    trigger[arguments[0].cellKey] = oldValue;
  }
}

function handleAssetGridRowsUpdated(model: DbModelData, args: any) {
  // log('handleAssetGridRowsUpdated', arguments);
  const asset = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (asset.NAME !== args[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  const matchedAsset = model.assets.filter(a => {
    return a.NAME === asset.NAME;
  });
  if (matchedAsset.length !== 1) {
    log(`Error: asset ${asset.NAME} not found in model?`);
    return;
  }
  const oldValue = asset[args[0].cellKey];
  asset[args[0].cellKey] = args[0].updated[args[0].cellKey];
  const parsedValue = makeCashValueFromString(asset.VALUE);
  const parsedGrowth = makeGrowthFromString(asset.GROWTH, model.settings);
  const parsedPurchasePrice = makePurchasePriceFromString(asset.PURCHASE_PRICE);
  const parsedCPIImmune = makeBooleanFromYesNo(asset.IS_CPI_IMMUNE);
  const parsedCanBeNegative = makeBooleanFromYesNo(asset.CAN_BE_NEGATIVE);

  // negate values before sending from table
  // to model
  if (matchedAsset[0].IS_A_DEBT && parsedValue.checksOK) {
    parsedValue.value = -parsedValue.value;
  }

  if (!parsedGrowth.checksOK) {
    alert(`asset growth ${asset.GROWTH} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`asset value ${asset.VALUE} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedCPIImmune.checksOK) {
    alert(`asset value ${asset.IS_CPI_IMMUNE} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedCanBeNegative.checksOK) {
    alert(`asset value ${asset.CAN_BE_NEGATIVE} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else {
    const assetForSubmission: DbAsset = {
      NAME: asset.NAME,
      VALUE: `${parsedValue.value}`,
      START: asset.START,
      LIABILITY: asset.LIABILITY,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: parsedCPIImmune.value,
      CAN_BE_NEGATIVE: parsedCanBeNegative.value,
      IS_A_DEBT: matchedAsset[0].IS_A_DEBT,
      PURCHASE_PRICE: parsedPurchasePrice,
      CATEGORY: asset.CATEGORY,
    };
    const checks = checkAsset(assetForSubmission, model);
    if (checks === '') {
      submitAsset(assetForSubmission);
    } else {
      alert(checks);
      asset[args[0].cellKey] = oldValue;
    }
  }
}

function handleTransactionGridRowsUpdated(model: DbModelData, args: any) {
  // log('handleTransactionGridRowsUpdated', arguments);
  const gridData = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (gridData.NAME !== args[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  const oldValue = gridData[args[0].cellKey];
  gridData[args[0].cellKey] = args[0].updated[args[0].cellKey];

  const parseFrom = makeValueAbsPropFromString(gridData.FROM_VALUE);
  const parseTo = makeValueAbsPropFromString(gridData.TO_VALUE);
  if (!parseFrom.checksOK) {
    alert('From value should be a number or a number with % symbol');
    gridData[args[0].cellKey] = oldValue;
  } else if (!parseTo.checksOK) {
    alert('To value should be a number or a number with % symbol');
    gridData[args[0].cellKey] = oldValue;
  } else {
    const transaction: DbTransaction = {
      DATE: gridData.DATE,
      FROM: gridData.FROM,
      FROM_VALUE: parseFrom.value,
      FROM_ABSOLUTE: parseFrom.absolute,
      NAME: gridData.NAME,
      TO: gridData.TO,
      TO_ABSOLUTE: parseTo.absolute,
      TO_VALUE: parseTo.value,
      STOP_DATE: gridData.STOP_DATE,
      RECURRENCE: gridData.RECURRENCE,
      CATEGORY: gridData.CATEGORY,
    };
    const checks = checkTransaction(transaction, model);
    if (checks === '') {
      submitTransaction(transaction);
    } else {
      alert(checks);
      gridData[args[0].cellKey] = oldValue;
    }
  }
}
function handleSettingGridRowsUpdated() {
  // log('handleSettingGridRowsUpdated', arguments);
  const x = arguments[0].fromRowData;
  if (arguments[0].cellKey === 'NAME') {
    if (x.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  // log('old expense '+showObj(expense));
  x[arguments[0].cellKey] = arguments[0].updated[arguments[0].cellKey];
  // log('new expense '+showObj(expense));
  const forSubmission: DbSetting = {
    NAME: x.NAME,
    VALUE: x.VALUE,
    HINT: x.HINT,
  };
  submitSetting(forSubmission);
}

const defaultColumn = {
  editable: true,
  resizable: true,
};

export function assetsOrDebtsTableDiv(model: DbModelData, isDebt: boolean) {
  const tableVisible = isDebt
    ? showContent.get(debtsTable).display
    : showContent.get(assetsTable).display;
  return (
    <div
      style={{
        display: tableVisible ? 'block' : 'none',
      }}
    >
      <fieldset>
        <div className="dataGridAssets">
          <DataGrid
            handleGridRowsUpdated={function() {
              return handleAssetGridRowsUpdated(model, arguments);
            }}
            rows={model.assets
              .filter((obj: DbAsset) => {
                return obj.NAME !== taxPot && obj.IS_A_DEBT === isDebt;
              })
              .map((obj: DbAsset) => {
                const dbValue = obj.VALUE;
                const tableValue = isDebt ? -parseFloat(dbValue) : dbValue;
                const result = {
                  GROWTH: obj.GROWTH,
                  NAME: obj.NAME,
                  CATEGORY: obj.CATEGORY,
                  START: obj.START,
                  VALUE: tableValue,
                  LIABILITY: obj.LIABILITY,
                  PURCHASE_PRICE: makeStringFromPurchasePrice(
                    obj.PURCHASE_PRICE,
                    obj.LIABILITY,
                  ),
                  IS_CPI_IMMUNE: makeYesNoFromBoolean(obj.CPI_IMMUNE),
                  CAN_BE_NEGATIVE: makeYesNoFromBoolean(obj.CAN_BE_NEGATIVE),
                };
                return result;
              })}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <NameFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE',
                name: 'value',
                formatter: <CashValueFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'START',
                name: 'start',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWTH',
                name: 'growth',
                formatter: (
                  <GrowthFormatter settings={model.settings} value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'IS_CPI_IMMUNE',
                name: 'Is immune from CPI?',
              },
              {
                ...defaultColumn,
                key: 'CAN_BE_NEGATIVE',
                name: 'Can go negative?',
              },
              {
                ...defaultColumn,
                key: 'LIABILITY',
                name: 'liability',
              },
              {
                ...defaultColumn,
                key: 'PURCHASE_PRICE',
                name: 'purchase price',
                formatter: <CashValueFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'CATEGORY',
                name: 'category',
              },
            ]}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function transactionsTableDiv(model: DbModelData) {
  const tableVisible = showContent.get(transactionsTable).display;
  return (
    <fieldset>
      <div
        className="dataGridTransactions"
        style={{
          display: tableVisible ? 'block' : 'none',
        }}
      >
        <DataGrid
          handleGridRowsUpdated={function() {
            return handleTransactionGridRowsUpdated(model, arguments);
          }}
          rows={model.transactions.map((obj: DbTransaction) => {
            // log(`obj.FROM_ABSOLUTE = ${obj.FROM_ABSOLUTE}`)
            let fromValueEntry = makeStringFromValueAbsProp(
              obj.FROM_VALUE,
              obj.FROM_ABSOLUTE,
            );
            // log(`obj.FROM = ${obj.FROM}, fromValueEntry = ${fromValueEntry}`);
            if (obj.FROM === '' && fromValueEntry === '0') {
              fromValueEntry = '';
            }
            let toValueEntry = makeStringFromValueAbsProp(
              obj.TO_VALUE,
              obj.TO_ABSOLUTE,
            );
            if (obj.TO === '' && toValueEntry === '0') {
              toValueEntry = '';
            }
            const result = {
              DATE: obj.DATE,
              FROM: obj.FROM,
              FROM_VALUE: fromValueEntry,
              NAME: obj.NAME,
              TO: obj.TO,
              TO_VALUE: toValueEntry,
              STOP_DATE: obj.STOP_DATE,
              RECURRENCE: obj.RECURRENCE,
              CATEGORY: obj.CATEGORY,
            };
            return result;
          })}
          columns={[
            {
              ...defaultColumn,
              key: 'NAME',
              name: 'name',
              formatter: <NameFormatter value="unset" />,
            },
            {
              ...defaultColumn,
              key: 'FROM',
              name: 'from asset',
            },
            {
              ...defaultColumn,
              key: 'FROM_VALUE',
              name: 'from value',
              formatter: <ToFromValueFormatter value="unset" />,
            },
            {
              ...defaultColumn,
              key: 'TO',
              name: 'to asset',
            },
            {
              ...defaultColumn,
              key: 'TO_VALUE',
              name: 'to value',
              formatter: <ToFromValueFormatter value="unset" />,
            },
            {
              ...defaultColumn,
              key: 'DATE',
              name: 'date',
              formatter: (
                <TriggerDateFormatter triggers={model.triggers} value="unset" />
              ),
            },
            {
              ...defaultColumn,
              key: 'RECURRENCE',
              name: 'recurrence',
            },
            {
              ...defaultColumn,
              key: 'STOP_DATE',
              name: 'stop',
              formatter: (
                <TriggerDateFormatter triggers={model.triggers} value="unset" />
              ),
            },
            {
              ...defaultColumn,
              key: 'CATEGORY',
              name: 'category',
            },
          ]}
        />
      </div>
    </fieldset>
  );
}

export function triggersTableDiv(model: DbModelData) {
  const tableVisible = showContent.get(triggersTable).display;
  return (
    <div
      style={{
        display: tableVisible ? 'block' : 'none',
      }}
    >
      <fieldset>
        <div className="dataGridTriggers">
          <DataGrid
            handleGridRowsUpdated={handleTriggerGridRowsUpdated}
            rows={model.triggers.map((obj: DbTrigger) => {
              const result = {
                DATE: obj.DATE.toDateString(),
                NAME: obj.NAME,
              };
              return result;
            })}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <NameFormatter value="unset" />,
                // sortable: true // TODO
              },
              {
                ...defaultColumn,
                key: 'DATE',
                name: 'date',
              },
            ]}
          />
        </div>
      </fieldset>
    </div>
  );
}

export function incomesTableDiv(model: DbModelData) {
  const tableVisible = showContent.get(incomesTable).display;
  return (
    <div
      style={{
        display: tableVisible ? 'block' : 'none',
      }}
    >
      <fieldset>
        <div className="dataGridIncomes">
          <DataGrid
            handleGridRowsUpdated={function() {
              return handleIncomeGridRowsUpdated(model, arguments);
            }}
            rows={model.incomes.map((obj: DbIncome) => {
              const result = {
                END: obj.END,
                IS_CPI_IMMUNE: makeYesNoFromBoolean(obj.CPI_IMMUNE),
                GROWTH: makeStringFromGrowth(obj.GROWTH, model.settings),
                NAME: obj.NAME,
                START: obj.START,
                VALUE: obj.VALUE,
                VALUE_SET: obj.VALUE_SET,
                LIABILITY: obj.LIABILITY,
                CATEGORY: obj.CATEGORY,
              };
              // log(`passing ${showObj(result)}`);
              return result;
            })}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <NameFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE',
                name: 'start value',
                formatter: <CashValueFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE_SET',
                name: 'value date',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'START',
                name: 'start',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'END',
                name: 'end',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWTH',
                name: 'annual growth',
                formatter: (
                  <GrowthFormatter settings={model.settings} value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'IS_CPI_IMMUNE',
                name: 'Is immune from CPI?',
              },
              {
                ...defaultColumn,
                key: 'LIABILITY',
                name: 'taxable?',
              },
              {
                ...defaultColumn,
                key: 'CATEGORY',
                name: 'category',
              },
            ]}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function expensesTableDiv(model: DbModelData) {
  const tableVisible = showContent.get(expensesTable).display;
  return (
    <div
      style={{
        display: tableVisible ? 'block' : 'none',
      }}
    >
      <fieldset>
        <div className="dataGridExpenses">
          <DataGrid
            handleGridRowsUpdated={function() {
              return handleExpenseGridRowsUpdated(model, arguments);
            }}
            rows={model.expenses.map((obj: DbExpense) => {
              const result = {
                END: obj.END,
                IS_CPI_IMMUNE: makeYesNoFromBoolean(obj.CPI_IMMUNE),
                GROWTH: makeStringFromGrowth(obj.GROWTH, model.settings),
                CATEGORY: obj.CATEGORY,
                NAME: obj.NAME,
                START: obj.START,
                VALUE: obj.VALUE,
                VALUE_SET: obj.VALUE_SET,
              };
              return result;
            })}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <NameFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE',
                name: 'start value',
                formatter: <CashValueFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE_SET',
                name: 'value date',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'START',
                name: 'start',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'END',
                name: 'end',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWTH',
                name: 'annual growth',
                formatter: (
                  <GrowthFormatter settings={model.settings} value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'IS_CPI_IMMUNE',
                name: 'Is immune from CPI?',
              },
              {
                ...defaultColumn,
                key: 'CATEGORY',
                name: 'category',
              },
            ]}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function settingsTableDiv(model: DbModelData) {
  const tableVisible = showContent.get(settingsTable).display;
  return (
    <div
      className="dataGridSettings"
      style={{
        display: tableVisible ? 'block' : 'none',
      }}
    >
      <DataGrid
        handleGridRowsUpdated={handleSettingGridRowsUpdated}
        rows={model.settings.map((obj: DbSetting) => {
          showObj(`obj = ${obj}`);
          const result = {
            NAME: obj.NAME,
            VALUE: obj.VALUE,
            HINT: obj.HINT,
          };
          return result;
        })}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <NameFormatter value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: 'value',
          },
          {
            ...defaultColumn,
            key: 'HINT',
            name: 'hint',
          },
        ]}
      />
    </div>
  );
}
