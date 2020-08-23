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
  isNumberString,
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
  makeQuantityFromString,
  isAnIncome,
  isAnExpense,
  isAnAssetOrAssets,
  isADebt,
} from '../utils';

import SimpleFormatter from './reactComponents/NameFormatter';
import ToFromValueFormatter from './reactComponents/ToFromValueFormatter';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';
import GrowthFormatter from './reactComponents/GrowthFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';

import {
  assetsTable,
  debtsTable,
  deleteAsset,
  deleteExpense,
  deleteIncome,
  deleteSetting,
  deleteTransaction,
  deleteTrigger,
  expensesTable,
  incomesTable,
  settingsTable,
  showContent,
  submitAsset,
  submitExpense,
  submitIncome,
  submitTransaction,
  submitTrigger,
  transactionsTable,
  triggersTable,
  editSetting,
} from '../App';
import {
  liquidateAsset,
  conditional,
  payOffDebt,
  revalueAsset,
  revalueExp,
  revalueInc,
  revalue,
  autogen,
  revalueDebt,
  assetChartView,
  debtChartView,
  viewDetail,
  assetChartFocus,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  viewType,
  constType,
  adjustableType,
  revalueSetting,
} from '../localization/stringConstants';
import { log } from 'util';

function prohibitEditOfName(showAlert: (arg0: string) => void) {
  showAlert('prohibit edit of name');
}

function handleExpenseGridRowsUpdated(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleExpenseGridRowsUpdated', arguments);
  const expense = args[0].fromRowData;
  // log('old expense '+showObj(expense));
  if (args[0].cellKey === 'NAME') {
    if (expense.NAME !== args[0].updated.NAME) {
      prohibitEditOfName(showAlert);
    }
    return;
  }

  const oldValue = expense[args[0].cellKey];
  expense[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new expense '+showObj(expense));
  const parsedGrowsWithCPI = makeBooleanFromYesNo(expense.GROWS_WITH_CPI);
  const parsedValue = makeCashValueFromString(expense.VALUE);
  const parsedGrowth = makeGrowthFromString(expense.GROWTH, model.settings);
  if (!parsedGrowsWithCPI.checksOK) {
    showAlert("Whether expense grows with CPI should be 'y' or 'n'");
    expense[args[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    showAlert(`Value ${expense.VALUE} can't be understood as a cash value}`);
    expense[args[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    showAlert(`Value ${expense.GROWTH} can't be understood as a growth}`);
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
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      RECURRENCE: expense.RECURRENCE,
    };
    // log(`expenseForSubmission = ${showObj(expenseForSubmission)}`);
    const checks = checkExpense(expenseForSubmission, model);
    if (checks === '') {
      submitExpense(expenseForSubmission, model);
    } else {
      showAlert(checks);
      expense[args[0].cellKey] = oldValue;
    }
  }
}

function handleIncomeGridRowsUpdated(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleIncomeGridRowsUpdated');
  const income = args[0].fromRowData;
  // log('old income '+showObj(income));
  if (args[0].cellKey === 'NAME') {
    if (income.NAME !== args[0].updated.NAME) {
      prohibitEditOfName(showAlert);
    }
    return;
  }

  const oldValue = income[args[0].cellKey];
  income[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new income '+showObj(income));
  const parsedGrowsWithCPI = makeBooleanFromYesNo(income.GROWS_WITH_CPI);
  const parsedValue = makeCashValueFromString(income.VALUE);
  const parsedGrowth = makeGrowthFromString(income.GROWTH, model.settings);
  if (!parsedGrowsWithCPI.checksOK) {
    showAlert("Whether income grows with CPI should be 'y' or 'n'");
    income[args[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    showAlert(`Value ${income.VALUE} can't be understood as a cash value}`);
    income[args[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    showAlert(`Value ${income.GROWTH} can't be understood as a growth}`);
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
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      LIABILITY: income.LIABILITY,
    };
    const checks = checkIncome(incomeForSubmission, model);
    if (checks === '') {
      submitIncome(incomeForSubmission, model);
    } else {
      showAlert(checks);
      income[args[0].cellKey] = oldValue;
    }
  }
}

function handleTriggerGridRowsUpdated(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleTriggerGridRowsUpdated', arguments);
  const trigger = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (trigger.NAME !== args[0].updated.NAME) {
      prohibitEditOfName(showAlert);
    }
    return;
  }
  const oldValue = trigger[args[0].cellKey];
  trigger[args[0].cellKey] = args[0].updated[args[0].cellKey];
  const forSubmit: DbTrigger = {
    NAME: trigger.NAME,
    DATE: makeDateFromString(trigger.DATE),
  };
  const checks = checkTrigger(forSubmit);
  if (checks === '') {
    submitTrigger(forSubmit, model);
  } else {
    showAlert(checks);
    trigger[args[0].cellKey] = oldValue;
  }
}

function handleAssetGridRowsUpdated(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleAssetGridRowsUpdated', args);
  const asset = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (asset.NAME !== args[0].updated.NAME) {
      prohibitEditOfName(showAlert);
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
  const parsedQuantity = makeQuantityFromString(asset.QUANTITY);
  const parsedGrowth = makeGrowthFromString(asset.GROWTH, model.settings);
  const parsedPurchasePrice = makePurchasePriceFromString(asset.PURCHASE_PRICE);
  const parsedGrowsWithCPI = makeBooleanFromYesNo(asset.GROWS_WITH_CPI);
  const parsedIsADebt = makeBooleanFromYesNo(asset.IS_A_DEBT);
  const parsedCanBeNegative = makeBooleanFromYesNo(asset.CAN_BE_NEGATIVE);

  // negate values before sending from table
  // to model
  if (matchedAsset[0].IS_A_DEBT && parsedValue.checksOK) {
    parsedValue.value = -parsedValue.value;
  }

  if (!parsedGrowth.checksOK) {
    showAlert(`asset growth ${asset.GROWTH} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedQuantity.checksOK) {
    showAlert(`quantity value ${asset.QUANTITY} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedGrowsWithCPI.checksOK) {
    showAlert(`asset value ${asset.GROWS_WITH_CPI} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedIsADebt.checksOK) {
    showAlert(`asset value ${asset.IS_A_DEBT} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedCanBeNegative.checksOK) {
    showAlert(`asset value ${asset.CAN_BE_NEGATIVE} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else {
    // log(`parsedValue = ${showObj(parsedValue)}`);
    const valueForSubmission = parsedValue.checksOK
      ? `${parsedValue.value}`
      : asset.VALUE;
    // log(`valueForSubmission = ${valueForSubmission}`);
    const assetForSubmission: DbAsset = {
      NAME: asset.NAME,
      VALUE: valueForSubmission,
      QUANTITY: asset.QUANTITY,
      START: asset.START,
      LIABILITY: asset.LIABILITY,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      CAN_BE_NEGATIVE: parsedCanBeNegative.value,
      IS_A_DEBT: parsedIsADebt.value,
      PURCHASE_PRICE: parsedPurchasePrice,
      CATEGORY: asset.CATEGORY,
    };
    const checks = checkAsset(assetForSubmission, model);
    if (checks === '') {
      submitAsset(assetForSubmission, model);
    } else {
      showAlert(checks);
      asset[args[0].cellKey] = oldValue;
    }
  }
}

function getDbName(name: string, type: string) {
  let prefix = '';
  if (type === liquidateAsset || type === payOffDebt) {
    prefix = conditional;
  } else if (
    type === revalueAsset ||
    type === revalueDebt ||
    type === revalueExp ||
    type === revalueInc
  ) {
    prefix = revalue;
  }
  return prefix + name;
}

function handleTransactionGridRowsUpdated(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  type: string,
  args: any,
) {
  // log('handleTransactionGridRowsUpdated', args);
  const gridData = args[0].fromRowData;

  // for debugging, it can be useful to allow editing of the name
  if (args[0].cellKey === 'NAME') {
    if (gridData.NAME !== args[0].updated.NAME) {
      prohibitEditOfName(showAlert);
    }
    return;
  }
  const oldValue = gridData[args[0].cellKey];
  gridData[args[0].cellKey] = args[0].updated[args[0].cellKey];

  // log(`gridData.FROM_VALUE = ${gridData.FROM_VALUE}`);
  // revalue tables have a hidden FROM_VALUE column
  if (gridData.FROM_VALUE === undefined) {
    gridData.FROM_VALUE = 0.0;
  }

  const parseFrom = makeValueAbsPropFromString(gridData.FROM_VALUE);

  const transactionType = gridData.TYPE;
  const parseTo = makeValueAbsPropFromString(gridData.TO_VALUE);
  if (transactionType !== revalueSetting && !parseFrom.checksOK) {
    showAlert(
      `From value ${gridData.FROM_VALUE} should be a number or a number with % symbol`,
    );
    gridData[args[0].cellKey] = oldValue;
  } else if (transactionType !== revalueSetting && !parseTo.checksOK) {
    showAlert(
      `To value ${gridData.TO_VALUE} should be a number or a number with % symbol`,
    );
    gridData[args[0].cellKey] = oldValue;
  } else {
    let type = gridData.TYPE;
    if (
      type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc
    ) {
      // enable auto-switch of revalue types if TO changes
      if (isADebt(gridData.TO, model)) {
        type = revalueDebt;
      } else if (isAnAssetOrAssets(gridData.TO, model)) {
        type = revalueAsset;
      } else if (isADebt(gridData.TO, model)) {
        type = revalueDebt;
        parseTo.value = `${-parseFloat(parseTo.value)}`;
      } else if (isAnIncome(gridData.TO, model)) {
        type = revalueInc;
      } else if (isAnExpense(gridData.TO, model)) {
        type = revalueExp;
      }
    }
    const transaction: DbTransaction = {
      DATE: gridData.DATE,
      FROM: gridData.FROM,
      FROM_VALUE: parseFrom.value,
      FROM_ABSOLUTE: parseFrom.absolute,
      NAME: getDbName(gridData.NAME, type),
      TO: gridData.TO,
      TO_ABSOLUTE: parseTo.absolute,
      TO_VALUE: parseTo.value,
      STOP_DATE: gridData.STOP_DATE,
      RECURRENCE: gridData.RECURRENCE,
      TYPE: type,
      CATEGORY: gridData.CATEGORY,
    };
    const checks = checkTransaction(transaction, model);
    if (checks === '') {
      // log(`checks OK, submitting transaction`);
      submitTransaction(transaction, model);
    } else {
      showAlert(checks);
      gridData[args[0].cellKey] = oldValue;
    }
  }
}
function handleSettingGridRowsUpdated(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleSettingGridRowsUpdated', args);
  const x = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (x.NAME !== args[0].updated.NAME) {
      prohibitEditOfName(showAlert);
    }
    return;
  }
  // log('old expense '+showObj(expense));
  x[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new expense '+showObj(expense));
  const forSubmission = {
    NAME: x.NAME,
    VALUE: x.VALUE,
    HINT: x.HINT,
  };
  editSetting(forSubmission, model);
}

export const defaultColumn = {
  editable: true,
  resizable: true,
  sortable: true,
};

function getAssetOrDebtCols(model: DbModelData, isDebt: boolean) {
  let cols: any[] = [
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
    {
      ...defaultColumn,
      key: 'VALUE',
      name: 'start value',
      formatter: <CashValueFormatter name="start value" value="unset" />,
    },
  ];
  if (!isDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'QUANTITY',
        name: 'quantity',
        formatter: <SimpleFormatter name="quantity" value="unset" />,
      },
    ]);
  }
  const growthName = isDebt ? 'interest rate' : 'growth';
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'START',
      name: 'start',
      formatter: (
        <TriggerDateFormatter name="start" model={model} value="unset" />
      ),
    },
    {
      ...defaultColumn,
      key: 'GROWTH',
      name: growthName,
      formatter: (
        <GrowthFormatter
          name={growthName}
          settings={model.settings}
          value="unset"
        />
      ),
    },
    // for debugging, we can find it useful to see this column
    /*
    {
      ...defaultColumn,
      key: 'IS_A_DEBT',
      name: 'is debt?',
    },
    */
  ]);
  if (!isDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'GROWS_WITH_CPI',
        name: 'grows with CPI',
        formatter: <SimpleFormatter name="name" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'LIABILITY',
        name: 'tax Liability',
        formatter: <SimpleFormatter name="tax liability" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'PURCHASE_PRICE',
        name: 'purchase price',
        formatter: <CashValueFormatter name="purchase price" value="unset" />,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'CATEGORY',
      name: 'category',
      formatter: <SimpleFormatter name="category" value="unset" />,
    },
  ]);
  return cols;
}

function addIndices(unindexedResult: any[]) {
  const result = [];
  for (let index = 0; index < unindexedResult.length; index++) {
    const elt = {
      ...unindexedResult[index],
      index: index,
    };
    result.push(elt);
  }
  return result;
}

function assetsOrDebtsForTable(model: DbModelData, isDebt: boolean): any[] {
  const unindexedResult = model.assets
    .filter((obj: DbAsset) => {
      obj.IS_A_DEBT === isDebt;
    })
    .map((obj: DbAsset) => {
      const dbStringValue = obj.VALUE;
      let displayValue: number | string;
      if (isNumberString(dbStringValue)) {
        displayValue = parseFloat(dbStringValue);
        if (isDebt) {
          displayValue = -displayValue;
        }
      } else {
        displayValue = obj.VALUE;
      }
      const tableValue = `${displayValue}`;
      const mapResult = {
        GROWTH: obj.GROWTH,
        NAME: obj.NAME,
        CATEGORY: obj.CATEGORY,
        START: obj.START,
        VALUE: tableValue,
        QUANTITY: obj.QUANTITY,
        LIABILITY: obj.LIABILITY,
        PURCHASE_PRICE: makeStringFromPurchasePrice(
          obj.PURCHASE_PRICE,
          obj.LIABILITY,
        ),
        GROWS_WITH_CPI: makeYesNoFromBoolean(!obj.CPI_IMMUNE),
        IS_A_DEBT: makeYesNoFromBoolean(obj.IS_A_DEBT),
        CAN_BE_NEGATIVE: makeYesNoFromBoolean(obj.CAN_BE_NEGATIVE),
      };
      return mapResult;
    });
  return addIndices(unindexedResult);
}

export function assetsOrDebtsTableDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  isDebt: boolean,
) {
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
              return handleAssetGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={assetsOrDebtsForTable(model, isDebt)}
            columns={getAssetOrDebtCols(model, isDebt)}
            deleteFunction={deleteAsset}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

function makeTransactionCols(model: DbModelData, type: string) {
  let cols: any[] = [
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
  ];
  // FROM, FROM_VALUE display rules
  if (
    type === revalueInc ||
    type === revalueExp ||
    type === revalueAsset ||
    type === revalueDebt
  ) {
    // revalues don't show FROM
  } else if (type === payOffDebt) {
    // we show the FROM_VALUE
    // (from cash)
    // as an "amount" to pay back
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'FROM_VALUE',
        name: 'amount',
        formatter: <ToFromValueFormatter name="amount" value="unset" />,
      },
    ]);
  } else {
    // not revalues, not paying off debts,
    // default behaviour for FROM, FROM_VALUE
    // display
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'FROM',
        name: 'coming from',
        formatter: <SimpleFormatter name="coming from" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'FROM_VALUE',
        name: 'from amount',
        formatter: <ToFromValueFormatter name="from amount" value="unset" />,
      },
    ]);
  }

  // TO, TO_VALUE display rules
  if (type === revalueInc) {
    // each revalue type in turn
    // shows the revalue income/expense/asset/debt
    // and the amount
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'income',
        formatter: <SimpleFormatter name="income" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter name="new value" value="unset" />,
      },
    ]);
  } else if (type === revalueExp) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'expense',
        formatter: <SimpleFormatter name="expense" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter name="new value" value="unset" />,
      },
    ]);
  } else if (type === revalueAsset) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'asset',
        formatter: <SimpleFormatter name="asset" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter name="new value" value="unset" />,
      },
    ]);
  } else if (type === revalueDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'debt',
        formatter: <SimpleFormatter name="debt" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter name="new value" value="unset" />,
      },
    ]);
  } else {
    // all other kinds of transaction
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'going to',
        formatter: <SimpleFormatter name="going to" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'to amount',
        formatter: <ToFromValueFormatter name="to amount" value="unset" />,
      },
    ]);
  }
  if (type === payOffDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'DATE',
        name: 'payments start date',
        formatter: (
          <TriggerDateFormatter
            name="payments start date"
            model={model}
            value="unset"
          />
        ),
      },
    ]);
  } else {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'DATE',
        name: 'date',
        formatter: (
          <TriggerDateFormatter name="date" model={model} value="unset" />
        ),
      },
    ]);
  }
  if (type !== autogen) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'RECURRENCE',
        name: 'recurrence',
        formatter: <SimpleFormatter name="recurrence" value="unset" />,
      },
    ]);
  }
  if (type !== payOffDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'STOP_DATE',
        name: 'recurrence end date',
        formatter: (
          <TriggerDateFormatter
            name="recurrence end date"
            model={model}
            value="unset"
          />
        ),
      },
    ]);
  }
  if (
    type !== revalueInc &&
    type !== revalueExp &&
    type !== revalueAsset &&
    type !== revalueDebt
  ) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'CATEGORY',
        name: 'category',
        formatter: <SimpleFormatter name="category" value="unset" />,
      },
    ]);
  }
  cols = cols.concat([
    // for debugging, it can be useful to see the type column
    /*
    {
      ...defaultColumn,
      key: 'TYPE',
      name: 'type',
    },
    */
  ]);
  return cols;
}

export function getDisplayName(obj: string, type: string) {
  // log(`obj = ${obj}`);
  let result: string;
  if (
    obj.startsWith(conditional) &&
    (type === liquidateAsset || type === payOffDebt)
  ) {
    result = obj.substring(conditional.length, obj.length);
  } else if (
    obj.startsWith(revalue) &&
    (type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc)
  ) {
    result = obj.substring(revalue.length, obj.length);
  } else {
    result = obj;
  }
  // log(`display ${result}`);
  return result;
}

function transactionsForTable(model: DbModelData, type: string) {
  const unindexedRows = model.transactions
    .filter(t => {
      return t.TYPE === type;
    })
    .map((obj: DbTransaction) => {
      // log(`obj.FROM_ABSOLUTE = ${obj.FROM_ABSOLUTE}`)
      let fromValueEntry = makeStringFromValueAbsProp(
        obj.FROM_VALUE,
        obj.FROM_ABSOLUTE,
        obj.FROM,
        model,
        obj.NAME,
      );
      // log(`obj.FROM = ${obj.FROM}, fromValueEntry = ${fromValueEntry}`);
      if (
        obj.FROM === '' &&
        (fromValueEntry === '0' || fromValueEntry === '0.0')
      ) {
        fromValueEntry = '';
      }
      let toNumber = obj.TO_VALUE;
      if (type === revalueDebt) {
        toNumber = `${-parseFloat(toNumber)}`;
      }
      let toValueEntry = makeStringFromValueAbsProp(
        toNumber,
        obj.TO_ABSOLUTE,
        obj.TO,
        model,
        obj.NAME,
      );
      if (obj.TO === '' && toValueEntry === '0') {
        toValueEntry = '';
      }
      const mapResult = {
        DATE: obj.DATE,
        FROM: obj.FROM,
        FROM_VALUE: fromValueEntry,
        NAME: getDisplayName(obj.NAME, type),
        TO: obj.TO,
        TO_VALUE: toValueEntry,
        STOP_DATE: obj.STOP_DATE,
        RECURRENCE: obj.RECURRENCE,
        TYPE: obj.TYPE,
        CATEGORY: obj.CATEGORY,
      };
      return mapResult;
    });
  return addIndices(unindexedRows);
}

function makeCompleteName(name: string, type: string) {
  if (
    type === revalueInc ||
    type === revalueExp ||
    type === revalueAsset ||
    type === revalueDebt
  ) {
    return `${revalue}${name}`;
  }
  if (type === liquidateAsset || type === payOffDebt) {
    return `${conditional}${name}`;
  }
  return name;
}

export function transactionsTableDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  type: string,
) {
  const tableVisible = showContent.get(transactionsTable).display;
  return (
    <fieldset>
      <div
        className={`dataGridTransactions${type}`}
        style={{
          display: tableVisible ? 'block' : 'none',
        }}
      >
        <DataGrid
          handleGridRowsUpdated={function() {
            return handleTransactionGridRowsUpdated(
              model,
              showAlert,
              type,
              arguments,
            );
          }}
          rows={transactionsForTable(model, type)}
          columns={makeTransactionCols(model, type)}
          deleteFunction={(name: string) => {
            const completeName = makeCompleteName(name, type);
            return deleteTransaction(completeName);
          }}
        />
      </div>
    </fieldset>
  );
}
function triggersForTable(model: DbModelData) {
  const unindexedResult = model.triggers.map((obj: DbTrigger) => {
    const mapResult = {
      DATE: obj.DATE.toDateString(),
      NAME: obj.NAME,
    };
    return mapResult;
  });
  return addIndices(unindexedResult);
}

export function triggersTableDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
) {
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
            deleteFunction={deleteTrigger}
            handleGridRowsUpdated={function() {
              return handleTriggerGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={triggersForTable(model)}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <SimpleFormatter name="name" value="unset" />,
              },
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
            ]}
          />
        </div>
      </fieldset>
    </div>
  );
}

function incomesForTable(model: DbModelData) {
  const unindexedResult = model.incomes.map((obj: DbIncome) => {
    const mapResult = {
      END: obj.END,
      GROWS_WITH_CPI: makeYesNoFromBoolean(!obj.CPI_IMMUNE),
      GROWTH: makeStringFromGrowth(obj.GROWTH, model.settings),
      NAME: obj.NAME,
      START: obj.START,
      VALUE: obj.VALUE,
      VALUE_SET: obj.VALUE_SET,
      LIABILITY: obj.LIABILITY,
      CATEGORY: obj.CATEGORY,
    };
    // log(`passing ${showObj(result)}`);
    return mapResult;
  });
  return addIndices(unindexedResult);
}

export function incomesTableDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
) {
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
            deleteFunction={deleteIncome}
            handleGridRowsUpdated={function() {
              return handleIncomeGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={incomesForTable(model)}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <SimpleFormatter name="name" value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE',
                name: 'value definition',
                formatter: (
                  <CashValueFormatter name="value definition" value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'VALUE_SET',
                name: 'definition date',
                formatter: (
                  <TriggerDateFormatter
                    name="definition date"
                    model={model}
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
                    name="start"
                    model={model}
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
                    name="end"
                    model={model}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWTH',
                name: 'annual growth',
                formatter: (
                  <GrowthFormatter
                    name="annual growth"
                    settings={model.settings}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWS_WITH_CPI',
                name: 'grows with CPI',
                formatter: (
                  <SimpleFormatter name="grows with CPI" value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'LIABILITY',
                name: 'tax Liability',
                formatter: (
                  <SimpleFormatter name="tax Liability" value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'CATEGORY',
                name: 'category',
                formatter: <SimpleFormatter name="category" value="unset" />,
              },
            ]}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

function expensesForTable(model: DbModelData) {
  const unindexedResult = model.expenses.map((obj: DbExpense) => {
    const mapResult = {
      END: obj.END,
      GROWS_WITH_CPI: makeYesNoFromBoolean(!obj.CPI_IMMUNE),
      GROWTH: makeStringFromGrowth(obj.GROWTH, model.settings),
      CATEGORY: obj.CATEGORY,
      NAME: obj.NAME,
      START: obj.START,
      VALUE: obj.VALUE,
      VALUE_SET: obj.VALUE_SET,
      RECURRENCE: obj.RECURRENCE,
    };
    return mapResult;
  });
  return addIndices(unindexedResult);
}

export function expensesTableDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
) {
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
            deleteFunction={deleteExpense}
            handleGridRowsUpdated={function() {
              return handleExpenseGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={expensesForTable(model)}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <SimpleFormatter name="name" value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE',
                name: 'value definition',
                formatter: (
                  <CashValueFormatter name="value definition" value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'VALUE_SET',
                name: 'definition date',
                formatter: (
                  <TriggerDateFormatter
                    name="definition date"
                    model={model}
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
                    name="start"
                    model={model}
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
                    name="end"
                    model={model}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWTH',
                name: 'annual growth',
                formatter: (
                  <GrowthFormatter
                    name="annual growth"
                    settings={model.settings}
                    value="unset"
                  />
                ),
              },
              {
                ...defaultColumn,
                key: 'GROWS_WITH_CPI',
                name: 'grows with CPI',
                formatter: (
                  <SimpleFormatter name="grows with CPI" value="unset" />
                ),
              },
              {
                ...defaultColumn,
                key: 'RECURRENCE',
                name: 'recurrence',
                formatter: <SimpleFormatter name="recurrence" value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'CATEGORY',
                name: 'category',
                formatter: <SimpleFormatter name="category" value="unset" />,
              },
            ]}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

const settingsToExcludeFromTableView = [
  assetChartView,
  debtChartView,
  viewDetail,
  assetChartFocus,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
];

function settingsForTable(model: DbModelData, type: string) {
  const unindexedResult = model.settings
    .filter((obj: DbSetting) => {
      return obj.TYPE === type;
    })
    .filter((obj: DbSetting) => {
      return (
        settingsToExcludeFromTableView.find(s => {
          return obj.NAME === s;
        }) === undefined
      );
    })
    .map((obj: DbSetting) => {
      showObj(`obj = ${obj}`);
      const mapResult = {
        NAME: obj.NAME,
        VALUE: obj.VALUE,
        HINT: obj.HINT,
      };
      return mapResult;
    });
  return addIndices(unindexedResult);
}

export function settingsTableDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
) {
  const tableVisible = showContent.get(settingsTable).display;
  return (
    <div
      className="dataGridSettings"
      style={{
        display: tableVisible ? 'block' : 'none',
      }}
    >
      <h4>Settings about the view of the model</h4>
      <DataGrid
        deleteFunction={deleteSetting}
        handleGridRowsUpdated={function() {
          return handleSettingGridRowsUpdated(model, showAlert, arguments);
        }}
        rows={settingsForTable(model, viewType)}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: 'defining value',
            formatter: <SimpleFormatter name="defining value" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'HINT',
            name: 'hint',
            formatter: <SimpleFormatter name="hint" value="unset" />,
          },
        ]}
      />
      <h4>Other settings affecting the model</h4>
      <DataGrid
        deleteFunction={deleteSetting}
        handleGridRowsUpdated={function() {
          return handleSettingGridRowsUpdated(model, showAlert, arguments);
        }}
        rows={settingsForTable(model, constType)}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: 'defining value',
            formatter: <SimpleFormatter name="defining value" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'HINT',
            name: 'hint',
            formatter: <SimpleFormatter name="hint" value="unset" />,
          },
        ]}
      />
      <DataGrid
        deleteFunction={deleteSetting}
        handleGridRowsUpdated={function() {
          return handleSettingGridRowsUpdated(model, showAlert, arguments);
        }}
        rows={settingsForTable(model, adjustableType)}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: 'defining value',
            formatter: <SimpleFormatter name="defining value" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'HINT',
            name: 'hint',
            formatter: <SimpleFormatter name="hint" value="unset" />,
          },
        ]}
      />
      <h4>Revalue settings</h4>
      {transactionsTableDiv(model, showAlert, revalueSetting)}
    </div>
  );
}
