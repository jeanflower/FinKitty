import {
  CASH_ASSET_NAME,
  adjustableType,
  assetChartFocus,
  chartViewType,
  autogen,
  conditional,
  constType,
  crystallizedPension,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  liquidateAsset,
  payOffDebt,
  pension,
  pensionDB,
  pensionTransfer,
  revalue,
  revalueAsset,
  revalueDebt,
  revalueExp,
  revalueInc,
  revalueSetting,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxFree,
  viewDetail,
  viewType,
  reportView,
} from '../localization/stringConstants';
import {
  Asset,
  Expense,
  Income,
  ModelData,
  Setting,
  Transaction,
  Trigger,
  Item,
  ReportDatum,
} from '../types/interfaces';
import {
  attemptRename,
  deleteAsset,
  deleteExpense,
  deleteIncome,
  deleteSetting,
  deleteTransaction,
  deleteTrigger,
  editSetting,
  getDisplay,
  submitAsset,
  submitExpense,
  submitIncome,
  submitTransaction,
  submitTrigger,
} from '../App';
import {
  checkExpense,
  checkIncome,
  checkTransaction,
  checkTrigger,
  isNumberString,
} from '../models/checks';
import { log, showObj } from '../utils';

import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import GrowthFormatter from './reactComponents/GrowthFormatter';
import React from 'react';
import { SimpleFormatter } from './reactComponents/NameFormatter';
import ToFromValueFormatter from './reactComponents/ToFromValueFormatter';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';
import { ViewSettings } from '../models/charting';
import { minimalModel } from '../models/exampleModels';
import {
  isADebt,
  isAnAssetOrAssets,
  isAnIncome,
  isAnExpense,
} from '../models/modelUtils';
import {
  getNumberAndWordParts,
  checkForWordClashInModel,
  makeBooleanFromYesNo,
  makeCashValueFromString,
  makeGrowthFromString,
  makeQuantityFromString,
  makePurchasePriceFromString,
  makeValueAbsPropFromString,
  makeStringFromPurchasePrice,
  makeYesNoFromBoolean,
  makeStringFromValueAbsProp,
  makeStringFromGrowth,
  lessThan,
  makeTwoDP,
} from '../stringUtils';
import { ReactFragment } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';

export function collapsibleFragment(
  fragment: ReactFragment | undefined,
  title: string,
) {
  if (fragment === undefined) {
    return;
  }
  return (
    <Accordion defaultActiveKey="0">
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey="0">
            <h4>{title}</h4>
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>{fragment}</Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
}

function handleExpenseGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleExpenseGridRowsUpdated', arguments);
  const expense = args[0].fromRowData;
  // log('old expense '+showObj(expense));
  if (args[0].cellKey === 'NAME') {
    if (expense.NAME !== args[0].updated.NAME) {
      const parsed = getNumberAndWordParts(args[0].updated.NAME);
      if (parsed.numberPart !== undefined) {
        showAlert(`Don't name an expense beginning with a number`);
        return;
      }
      const clashCheck = checkForWordClashInModel(
        model,
        args[0].updated.NAME,
        'already',
      );
      if (clashCheck !== '') {
        showAlert(clashCheck);
        return;
      }
      attemptRename(model, expense.NAME, args[0].updated.NAME);
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
    showAlert(`Value ${expense.VALUE} can't be understood as a cash value`);
    expense[args[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    showAlert(`Value ${expense.GROWTH} can't be understood as a growth}`);
    expense[args[0].cellKey] = oldValue;
  } else {
    const expenseForSubmission: Expense = {
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
  model: ModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleIncomeGridRowsUpdated');
  const income = args[0].fromRowData;
  // log('old income '+showObj(income));
  if (args[0].cellKey === 'NAME') {
    if (income.NAME !== args[0].updated.NAME) {
      if (args[0].updated.NAME.startsWith(pensionDB)) {
        showAlert(`Don't rename incomes beginning ${pensionDB}`);
        return;
      }
      if (args[0].updated.NAME.startsWith(pensionTransfer)) {
        showAlert(`Don't rename incomes beginning ${pensionTransfer}`);
        return;
      }
      const parsed = getNumberAndWordParts(args[0].updated.NAME);
      if (parsed.numberPart !== undefined) {
        showAlert(`Don't name an income beginning with a number`);
        return;
      }
      const clashCheck = checkForWordClashInModel(
        model,
        args[0].updated.NAME,
        'already',
      );
      if (clashCheck !== '') {
        showAlert(clashCheck);
        return;
      }
      attemptRename(model, income.NAME, args[0].updated.NAME);
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
  } else if (!parsedGrowth.checksOK) {
    showAlert(`Value ${income.GROWTH} can't be understood as a growth}`);
    income[args[0].cellKey] = oldValue;
  } else {
    let incValue = '';
    if (parsedValue.checksOK) {
      incValue = `${parsedValue.value}`;
    } else {
      incValue = income.VALUE;
    }

    const incomeForSubmission: Income = {
      NAME: income.NAME,
      CATEGORY: income.CATEGORY,
      START: income.START,
      END: income.END,
      VALUE: incValue,
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
  model: ModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleTriggerGridRowsUpdated', arguments);
  const trigger = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (trigger.NAME !== args[0].updated.NAME) {
      const parsed = getNumberAndWordParts(args[0].updated.NAME);
      if (parsed.numberPart !== undefined) {
        showAlert(`Don't name a date beginning with a number`);
        return;
      }
      const clashCheck = checkForWordClashInModel(
        model,
        args[0].updated.NAME,
        'already',
      );
      if (clashCheck !== '') {
        showAlert(clashCheck);
        return;
      }
      attemptRename(model, trigger.NAME, args[0].updated.NAME);
    }
    return;
  }
  const oldValue = trigger[args[0].cellKey];
  trigger[args[0].cellKey] = args[0].updated[args[0].cellKey];
  const forSubmit: Trigger = {
    NAME: trigger.NAME,
    DATE: trigger.DATE,
  };
  const checks = checkTrigger(forSubmit, model);
  if (checks === '') {
    submitTrigger(forSubmit, model);
  } else {
    showAlert(checks);
    trigger[args[0].cellKey] = oldValue;
  }
}

function handleAssetGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleAssetGridRowsUpdated', args);
  const asset = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (asset.NAME !== args[0].updated.NAME) {
      if (asset.NAME === CASH_ASSET_NAME) {
        showAlert(`Don't rename cash asset`);
        return;
      }
      if (args[0].updated.NAME.startsWith(pensionDB)) {
        showAlert(`Don't rename assets beginning ${pensionDB}`);
        return;
      }
      if (args[0].updated.NAME.startsWith(pension)) {
        showAlert(`Don't rename assets beginning ${pension}`);
        return;
      }
      if (args[0].updated.NAME.startsWith(taxFree)) {
        showAlert(`Don't rename assets beginning ${taxFree}`);
        return;
      }
      if (args[0].updated.NAME.startsWith(crystallizedPension)) {
        showAlert(`Don't rename assets beginning ${crystallizedPension}`);
        return;
      }
      const parsed = getNumberAndWordParts(args[0].updated.NAME);
      if (parsed.numberPart !== undefined) {
        showAlert(`Don't name an asset beginning with a number`);
        return;
      }
      const clashCheck = checkForWordClashInModel(
        model,
        args[0].updated.NAME,
        'already',
      );
      if (clashCheck !== '') {
        showAlert(clashCheck);
        return;
      }
      attemptRename(model, asset.NAME, args[0].updated.NAME);
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
    const assetForSubmission: Asset = {
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
    submitAsset(assetForSubmission, model);
  }
}

function getTransactionName(name: string, type: string) {
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
  model: ModelData,
  showAlert: (arg0: string) => void,
  type: string,
  args: any,
) {
  // log('handleTransactionGridRowsUpdated', args);
  const gridData = args[0].fromRowData;

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
  if (
    transactionType !== revalueSetting &&
    !parseFrom.checksOK &&
    !model.settings.find(s => {
      return s.NAME === gridData.FROM_VALUE;
    })
  ) {
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
    const tName = getTransactionName(gridData.NAME, type);
    const oldtName = getTransactionName(oldValue, type);

    if (args[0].cellKey === 'NAME') {
      // log(`try to edit name from ${oldtName} to ${tName}`);

      if (tName !== oldtName) {
        const parsed = getNumberAndWordParts(oldtName);
        if (parsed.numberPart !== undefined) {
          showAlert(`Don't name a transaction beginning with a number`);
          return;
        }
        // log(`check for ${dbName} in model...`)
        const clashCheck = checkForWordClashInModel(model, tName, 'already');
        if (clashCheck !== '') {
          showAlert(clashCheck);
          return;
        }
        attemptRename(model, oldtName, tName);
      }
      return;
    }

    const transaction: Transaction = {
      DATE: gridData.DATE,
      FROM: gridData.FROM,
      FROM_VALUE: parseFrom.value,
      FROM_ABSOLUTE: parseFrom.absolute,
      NAME: tName,
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
  model: ModelData,
  showAlert: (arg0: string) => void,
  args: any,
) {
  // log('handleSettingGridRowsUpdated', args);
  const x = args[0].fromRowData;
  if (args[0].cellKey === 'NAME') {
    if (x.NAME !== args[0].updated.NAME) {
      if (
        minimalModel.settings.filter(obj => {
          return obj.NAME === x.NAME;
        }).length > 0
      ) {
        showAlert(`Don't rename inbuilt settings`);
        return;
      }
      const parsed = getNumberAndWordParts(args[0].updated.NAME);
      if (parsed.numberPart !== undefined) {
        showAlert(`Don't name a setting beginning with a number`);
        return;
      }
      const clashCheck = checkForWordClashInModel(
        model,
        args[0].updated.NAME,
        'already',
      );
      if (clashCheck !== '') {
        showAlert(clashCheck);
        return;
      }
      attemptRename(model, x.NAME, args[0].updated.NAME);
    }
    return;
  }
  x[args[0].cellKey] = args[0].updated[args[0].cellKey];
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

function getAssetOrDebtCols(model: ModelData, isDebt: boolean) {
  let cols: any[] = [
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
        <TriggerDateFormatter
          name="start"
          model={model}
          value="unset"
          showTime={false}
        />
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

export function addIndices(unindexedResult: any[]) {
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

function assetsOrDebtsForTable(model: ModelData, isDebt: boolean): any[] {
  const unindexedResult = model.assets
    .filter((obj: Asset) => {
      return obj.IS_A_DEBT === isDebt;
    })
    .map((obj: Asset) => {
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
    })
    .sort((a: Item, b: Item) => lessThan(b.NAME, a.NAME));
  return addIndices(unindexedResult);
}

export function assetsOrDebtsTableDiv(
  model: ModelData,
  rowData: any[],
  showAlert: (arg0: string) => void,
  isDebt: boolean,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridAssets">
          <DataGrid
            handleGridRowsUpdated={function() {
              return handleAssetGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={rowData}
            columns={getAssetOrDebtCols(model, isDebt)}
            deleteFunction={deleteAsset}
            triggers={model.triggers}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function getDisplayName(obj: string, type: string) {
  // log(`obj = ${obj}`);
  let result: string;
  if (
    (type === liquidateAsset || type === payOffDebt) &&
    obj.startsWith(conditional)
  ) {
    result = obj.substring(conditional.length, obj.length);
  } else if (
    (type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc) &&
    obj.startsWith(revalue)
  ) {
    result = obj.substring(revalue.length, obj.length);
  } else {
    result = obj;
  }
  // log(`display ${result}`);
  return result;
}

export function transactionsForTable(model: ModelData, type: string) {
  const unindexedRows = model.transactions
    .filter(t => {
      return t.TYPE === type;
    })
    .map((obj: Transaction) => {
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
  unindexedRows.sort((a: Item, b: Item) => lessThan(b.NAME, a.NAME));
  return addIndices(unindexedRows);
}

function makeTransactionCols(model: ModelData, type: string) {
  let cols: any[] = [
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
            showTime={false}
          />
        ),
      },
    ]);
  } else if (type === liquidateAsset) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'DATE',
        name: 'date',
        formatter: (
          <TriggerDateFormatter
            name="date"
            model={model}
            value="unset"
            showTime={true}
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
          <TriggerDateFormatter
            name="date"
            model={model}
            value="unset"
            showTime={false}
          />
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
            showTime={false}
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

export function transactionsTableDiv(
  contents: any[],
  model: ModelData,
  showAlert: (arg0: string) => void,
  type: string,
  headingText: string,
) {
  return collapsibleFragment(
    <div
      className={`dataGridTransactions${type}`}
      style={{
        display: 'block',
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
        rows={contents}
        columns={makeTransactionCols(model, type)}
        deleteFunction={(name: string) => {
          const completeName = getTransactionName(name, type);
          return deleteTransaction(completeName);
        }}
        triggers={model.triggers}
      />
    </div>,
    headingText,
  );
}

export function transactionFilteredTable(
  model: ModelData,
  showAlert: (arg0: string) => void,
  type: string,
  headingText: string,
) {
  const contents = transactionsForTable(model, type);
  if (contents.length === 0) {
    return;
  }
  return transactionsTableDiv(contents, model, showAlert, type, headingText);
}

export function debtsDivWithHeadings(
  model: ModelData,
  showAlert: (arg0: string) => void,
) {
  const debtData = assetsOrDebtsForTable(model, true);
  if (debtData.length === 0) {
    return;
  }
  return (
    <>
      {collapsibleFragment(
        assetsOrDebtsTableDiv(model, debtData, showAlert, true),
        'Debt definitions',
      )}
      {transactionFilteredTable(model, showAlert, revalueDebt, 'Revalue debts')}
      {transactionFilteredTable(model, showAlert, payOffDebt, 'Pay off debts')}
    </>
  );
}

export function assetsDivWithHeadings(
  model: ModelData,
  showAlert: (arg0: string) => void,
) {
  const assetData = assetsOrDebtsForTable(model, false);
  if (assetData.length === 0) {
    return;
  }
  return (
    <>
      {collapsibleFragment(
        assetsOrDebtsTableDiv(model, assetData, showAlert, false),
        `Asset definition table`,
      )}
      {transactionFilteredTable(
        model,
        showAlert,
        liquidateAsset,
        'Liquidate assets to keep cash afloat',
      )}
      {transactionFilteredTable(
        model,
        showAlert,
        revalueAsset,
        'Revalue assets',
      )}
    </>
  );
}

function triggersForTable(model: ModelData) {
  const unindexedResult = model.triggers
    .map((obj: Trigger) => {
      const mapResult = {
        DATE: obj.DATE,
        NAME: obj.NAME,
      };
      return mapResult;
    })
    .sort((a: Item, b: Item) => lessThan(a.NAME, b.NAME));
  return addIndices(unindexedResult);
}

function triggersTableDiv(
  model: ModelData,
  trigData: any[],
  showAlert: (arg0: string) => void,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridTriggers">
          <DataGrid
            deleteFunction={deleteTrigger}
            handleGridRowsUpdated={function() {
              return handleTriggerGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={trigData}
            columns={[
              /*
              {
                ...defaultColumn,
                key: 'index',
                name: 'index',
                formatter: <SimpleFormatter name="name" value="unset" />,
              },
              */
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
                    showTime={false}
                  />
                ),
              },
            ]}
            triggers={model.triggers}
          />
        </div>
      </fieldset>
    </div>
  );
}

export function triggersTableDivWithHeading(
  model: ModelData,
  showAlert: (arg0: string) => void,
) {
  const trigData = triggersForTable(model);
  if (trigData.length === 0) {
    return;
  }
  return collapsibleFragment(
    triggersTableDiv(model, trigData, showAlert),
    `Important dates`,
  );
}

function incomesForTable(model: ModelData) {
  const unindexedResult = model.incomes.map((obj: Income) => {
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

function incomesTableDiv(
  model: ModelData,
  incData: any[],
  showAlert: (arg0: string) => void,
) {
  if (incData.length === 0) {
    return;
  }
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridIncomes">
          <DataGrid
            deleteFunction={deleteIncome}
            handleGridRowsUpdated={function() {
              return handleIncomeGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={incData}
            columns={[
              /*
              {
                ...defaultColumn,
                key: 'index',
                name: 'index',
                formatter: <SimpleFormatter name="name" value="unset" />,
              },
              */
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
                    showTime={false}
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
                    showTime={false}
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
                    showTime={false}
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
            triggers={model.triggers}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function incomesTableDivWithHeading(
  model: ModelData,
  showAlert: (arg0: string) => void,
) {
  const incData: any[] = incomesForTable(model);
  if (incData.length === 0) {
    return;
  }
  return collapsibleFragment(
    incomesTableDiv(model, incData, showAlert),
    `Income definitions`,
  );
}

function expensesForTable(model: ModelData) {
  const unindexedResult = model.expenses.map((obj: Expense) => {
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

function expensesTableDiv(
  model: ModelData,
  expData: any[],
  showAlert: (arg0: string) => void,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridExpenses">
          <DataGrid
            deleteFunction={deleteExpense}
            handleGridRowsUpdated={function() {
              return handleExpenseGridRowsUpdated(model, showAlert, arguments);
            }}
            rows={expData}
            columns={[
              /*
              {
                ...defaultColumn,
                key: 'index',
                name: 'index',
                formatter: <SimpleFormatter name="name" value="unset" />,
              },
              */
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
                    showTime={false}
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
                    showTime={false}
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
                    showTime={false}
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
            triggers={model.triggers}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function expensesTableDivWithHeading(
  model: ModelData,
  showAlert: (arg0: string) => void,
) {
  const expData = expensesForTable(model);
  if (expData.length === 0) {
    return;
  }
  return collapsibleFragment(
    expensesTableDiv(model, expData, showAlert),
    `Expense definitions`,
  );
}

const settingsToExcludeFromTableView: string[] = [
  chartViewType,
  viewDetail,
  assetChartFocus,
  debtChartFocus,
  expenseChartFocus,
  incomeChartFocus,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
];

function settingsForTable(
  model: ModelData,
  viewSettings: ViewSettings,
  type: string,
) {
  const data = model.settings;
  const unindexedResult = data
    .filter((obj: Setting) => {
      return obj.TYPE === type;
    })
    .filter((obj: Setting) => {
      return (
        settingsToExcludeFromTableView.find(s => {
          return obj.NAME === s;
        }) === undefined
      );
    })
    .map((obj: Setting) => {
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

function customSettingsTable(
  model: ModelData,
  constSettings: any[],
  showAlert: (arg0: string) => void,
) {
  if (constSettings.length === 0) {
    return;
  }
  return (
    <DataGrid
      deleteFunction={deleteSetting}
      handleGridRowsUpdated={function() {
        return handleSettingGridRowsUpdated(model, showAlert, arguments);
      }}
      rows={constSettings}
      columns={[
        /*
        {
          ...defaultColumn,
          key: 'index',
          name: 'index',
          formatter: <SimpleFormatter name="name" value="unset" />,
        },
        */
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
      triggers={model.triggers}
    />
  );
}
function adjustSettingsTable(
  model: ModelData,
  adjustSettings: any[],
  showAlert: (arg0: string) => void,
) {
  if (adjustSettings.length === 0) {
    return;
  }
  return (
    <DataGrid
      deleteFunction={deleteSetting}
      handleGridRowsUpdated={function() {
        return handleSettingGridRowsUpdated(model, showAlert, arguments);
      }}
      rows={adjustSettings}
      columns={[
        /*
        {
          ...defaultColumn,
          key: 'index',
          name: 'index',
          formatter: <SimpleFormatter name="name" value="unset" />,
        },
        */
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
      triggers={model.triggers}
    />
  );
}

function settingsTables(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
) {
  const constSettings = settingsForTable(model, viewSettings, constType);
  const adjustSettings = settingsForTable(model, viewSettings, adjustableType);

  if (constSettings.length === 0 && adjustSettings.length === 0) {
    return;
  }

  return collapsibleFragment(
    <>
      {customSettingsTable(model, constSettings, showAlert)}
      {adjustSettingsTable(model, adjustSettings, showAlert)}
    </>,
    `Other settings affecting the model`,
  );
}

export function settingsTableDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
) {
  return (
    <div
      className="dataGridSettings"
      style={{
        display: 'block',
      }}
    >
      {collapsibleFragment(
        <DataGrid
          deleteFunction={deleteSetting}
          handleGridRowsUpdated={function() {
            return handleSettingGridRowsUpdated(model, showAlert, arguments);
          }}
          rows={settingsForTable(model, viewSettings, viewType)}
          columns={[
            /*
          {
            ...defaultColumn,
            key: 'index',
            name: 'index',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          */
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
              formatter: (
                <SimpleFormatter name="defining value" value="unset" />
              ),
            },
            {
              ...defaultColumn,
              key: 'HINT',
              name: 'hint',
              formatter: <SimpleFormatter name="hint" value="unset" />,
            },
          ]}
          triggers={model.triggers}
        />,
        `Settings about the view of the model`,
      )}
      {settingsTables(model, viewSettings, showAlert)}
      {transactionFilteredTable(
        model,
        showAlert,
        revalueSetting,
        'Revalue settings',
      )}
    </div>
  );
}

export function reportDiv(model: ModelData, reportData: ReportDatum[]) {
  if (!getDisplay(reportView)) {
    return;
  }
  const unindexedResult = reportData.map(x => {
    const make2dpCanBeUndefined : (input: number | undefined)=>string = 
    (input) => {
      return input ? makeTwoDP(input) : '';
    }
    const makeQCanBeUndefined : (input: number | undefined)=>string = 
    (input) => {
      return input ? `${input}` : '';
    }
    return {
      DATE: x.date,
      NAME: x.name,
      CHANGE: make2dpCanBeUndefined(x.change),
      OLD_VALUE: make2dpCanBeUndefined(x.oldVal),
      NEW_VALUE: make2dpCanBeUndefined(x.newVal),
      QCHANGE: makeQCanBeUndefined(x.qchange),
      QOLD_VALUE: makeQCanBeUndefined(x.qoldVal),
      QNEW_VALUE: makeQCanBeUndefined(x.qnewVal),
      SOURCE: x.source,
    };
  });
  const reportDataTable = addIndices(unindexedResult);

  return (
    <div className="ml-3">
      <DataGrid
        deleteFunction={undefined}
        handleGridRowsUpdated={function() {
          return false;
        }}
        rows={reportDataTable}
        columns={[
          /*
          {
            ...defaultColumn,
            key: 'index',
            name: 'index',
            formatter: <SimpleFormatter name="name" value="unset" />,
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
                showTime={false}
              />
            ),
          },
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'CHANGE',
            name: 'change',
            formatter: <CashValueFormatter name="change" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'OLD_VALUE',
            name: 'old value',
            formatter: <CashValueFormatter name="old value" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'NEW_VALUE',
            name: 'new value',
            formatter: <CashValueFormatter name="new value" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'QCHANGE',
            name: 'quantity change',
            formatter: <SimpleFormatter name="quantity change" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'QOLD_VALUE',
            name: 'old quantity',
            formatter: <SimpleFormatter name="old quantity" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'QNEW_VALUE',
            name: 'new quantity',
            formatter: <SimpleFormatter name="new quantity" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'SOURCE',
            name: 'source',
            formatter: <SimpleFormatter name="source" value="unset" />,
          },
        ]}
        triggers={model.triggers}
      />
    </div>
  );
}
