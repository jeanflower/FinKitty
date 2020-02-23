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
  makeQuantityFromString,
  isAnIncome,
  isAnExpense,
  isAnAssetOrAssets,
  isADebt,
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
  deleteAssetFromTable,
  deleteTransactionFromTable,
  deleteSettingFromTable,
  deleteIncomeFromTable,
  deleteExpenseFromTable,
  deleteTriggerFromTable,
} from '../App';
import {
  taxPot,
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
} from '../localization/stringConstants';
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
  const parsedGrowsWithCPI = makeBooleanFromYesNo(expense.GROWS_WITH_CPI);
  const parsedValue = makeCashValueFromString(expense.VALUE);
  const parsedGrowth = makeGrowthFromString(expense.GROWTH, model.settings);
  if (!parsedGrowsWithCPI.checksOK) {
    alert("Whether expense grows with CPI should be 'y' or 'n'");
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
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      RECURRENCE: expense.RECURRENCE,
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
  const parsedGrowsWithCPI = makeBooleanFromYesNo(income.GROWS_WITH_CPI);
  const parsedValue = makeCashValueFromString(income.VALUE);
  const parsedGrowth = makeGrowthFromString(income.GROWTH, model.settings);
  if (!parsedGrowsWithCPI.checksOK) {
    alert("Whether income grows with CPI should be 'y' or 'n'");
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
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
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
    alert(`asset growth ${asset.GROWTH} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`asset value ${asset.VALUE} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedQuantity.checksOK) {
    alert(`quantity value ${asset.QUANTITY} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedGrowsWithCPI.checksOK) {
    alert(`asset value ${asset.GROWS_WITH_CPI} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedIsADebt.checksOK) {
    alert(`asset value ${asset.IS_A_DEBT} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else if (!parsedCanBeNegative.checksOK) {
    alert(`asset value ${asset.CAN_BE_NEGATIVE} not understood`);
    asset[args[0].cellKey] = oldValue;
  } else {
    let numValueForSubmission = parsedValue.value;
    if (parsedQuantity.value !== '') {
      numValueForSubmission *= parseFloat(parsedQuantity.value);
    }
    const assetForSubmission: DbAsset = {
      NAME: asset.NAME,
      VALUE: `${numValueForSubmission}`,
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
      submitAsset(assetForSubmission);
    } else {
      alert(checks);
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
  type: string,
  args: any,
) {
  // log('handleTransactionGridRowsUpdated', arguments);
  const gridData = args[0].fromRowData;

  // for debugging, it can be useful to allow editing of the name
  if (args[0].cellKey === 'NAME') {
    if (gridData.NAME !== args[0].updated.NAME) {
      prohibitEditOfName();
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
  const parseTo = makeValueAbsPropFromString(gridData.TO_VALUE);
  if (!parseFrom.checksOK) {
    alert(
      `From value ${gridData.FROM_VALUE} should be a number or a number with % symbol`,
    );
    gridData[args[0].cellKey] = oldValue;
  } else if (!parseTo.checksOK) {
    alert(
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
  sortable: true,
};

function getCols(model: DbModelData, isDebt: boolean) {
  let cols: any[] = [
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
  ];
  if (!isDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'QUANTITY',
        name: 'quantity',
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'START',
      name: 'start',
      formatter: (
        <TriggerDateFormatter triggers={model.triggers} value="unset" />
      ),
    },
    {
      ...defaultColumn,
      key: 'GROWTH',
      name: isDebt ? 'interest rate' : 'growth',
      formatter: <GrowthFormatter settings={model.settings} value="unset" />,
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
      },
      {
        ...defaultColumn,
        key: 'LIABILITY',
        name: 'tax Liability',
      },
      {
        ...defaultColumn,
        key: 'PURCHASE_PRICE',
        name: 'purchase price',
        formatter: <CashValueFormatter value="unset" />,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'CATEGORY',
      name: 'category',
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
      return obj.NAME !== taxPot && obj.IS_A_DEBT === isDebt;
    })
    .map((obj: DbAsset) => {
      const dbStringValue = obj.VALUE;
      let displayValue = parseFloat(dbStringValue);
      if (obj.QUANTITY !== '') {
        const dbQuanValue = parseFloat(obj.QUANTITY);
        displayValue = displayValue / dbQuanValue;
      }
      if (isDebt) {
        displayValue = -displayValue;
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
            rows={assetsOrDebtsForTable(model, isDebt)}
            columns={getCols(model, isDebt)}
            deleteFunction={deleteAssetFromTable}
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
      formatter: <NameFormatter value="unset" />,
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
        formatter: <ToFromValueFormatter value="unset" />,
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
      },
      {
        ...defaultColumn,
        key: 'FROM_VALUE',
        name: 'from amount',
        formatter: <ToFromValueFormatter value="unset" />,
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
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter value="unset" />,
      },
    ]);
  } else if (type === revalueExp) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'expense',
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter value="unset" />,
      },
    ]);
  } else if (type === revalueAsset) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'asset',
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter value="unset" />,
      },
    ]);
  } else if (type === revalueDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'debt',
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <ToFromValueFormatter value="unset" />,
      },
    ]);
  } else {
    // all other kinds of transaction
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'going to',
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'to amount',
        formatter: <ToFromValueFormatter value="unset" />,
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
          <TriggerDateFormatter triggers={model.triggers} value="unset" />
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
          <TriggerDateFormatter triggers={model.triggers} value="unset" />
        ),
      },
    ]);
  }
  if (
    type !== revalueInc &&
    type !== revalueExp &&
    type !== revalueAsset &&
    type !== revalueDebt &&
    type !== autogen
  ) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'RECURRENCE',
        name: 'recurrence',
      },
    ]);
    if (type !== payOffDebt) {
      cols = cols.concat([
        {
          ...defaultColumn,
          key: 'STOP_DATE',
          name: 'recurrence end date',
          formatter: (
            <TriggerDateFormatter triggers={model.triggers} value="unset" />
          ),
        },
      ]);
    }
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'CATEGORY',
        name: 'category',
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

function getDisplayName(obj: any, type: string) {
  if (
    obj.NAME.startsWith(conditional) &&
    (type === liquidateAsset || type === payOffDebt)
  ) {
    return obj.NAME.substring(conditional.length, obj.NAME.length);
  }

  if (
    obj.NAME.startsWith(revalue) &&
    (type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc)
  ) {
    return obj.NAME.substring(revalue.length, obj.NAME.length);
  }

  return obj.NAME;
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
        NAME: getDisplayName(obj, type),
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

export function transactionsTableDiv(model: DbModelData, type: string) {
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
            return handleTransactionGridRowsUpdated(model, type, arguments);
          }}
          rows={transactionsForTable(model, type)}
          columns={makeTransactionCols(model, type)}
          deleteFunction={(name: string) => {
            const completeName = makeCompleteName(name, type);
            deleteTransactionFromTable(completeName);
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
            deleteFunction={deleteTriggerFromTable}
            handleGridRowsUpdated={handleTriggerGridRowsUpdated}
            rows={triggersForTable(model)}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <NameFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'DATE',
                name: 'date',
                formatter: (
                  <TriggerDateFormatter
                    triggers={model.triggers}
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
            deleteFunction={deleteIncomeFromTable}
            handleGridRowsUpdated={function() {
              return handleIncomeGridRowsUpdated(model, arguments);
            }}
            rows={incomesForTable(model)}
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
                name: 'value set date',
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
                key: 'GROWS_WITH_CPI',
                name: 'grows with CPI',
              },
              {
                ...defaultColumn,
                key: 'LIABILITY',
                name: 'tax Liability',
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
            deleteFunction={deleteExpenseFromTable}
            handleGridRowsUpdated={function() {
              return handleExpenseGridRowsUpdated(model, arguments);
            }}
            rows={expensesForTable(model)}
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
                name: 'value set date',
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
                key: 'GROWS_WITH_CPI',
                name: 'grows with CPI',
              },
              {
                ...defaultColumn,
                key: 'RECURRENCE',
                name: 'recurrence',
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

const settingsToExcludeFromTableView = [
  assetChartView,
  debtChartView,
  viewDetail,
  assetChartFocus,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
];

function settingsForTable(model: DbModelData) {
  const unindexedResult = model.settings
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
        deleteFunction={deleteSettingFromTable}
        handleGridRowsUpdated={handleSettingGridRowsUpdated}
        rows={settingsForTable(model)}
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