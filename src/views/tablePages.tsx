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
  bondMaturity,
  optimizerView,
  custom,
  bondInvest,
  bondMature,
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
  ReportMatcher,
  IncomeVal,
  ExpenseVal,
  AssetOrDebtVal,
  ChartData,
  ChartDataPoint,
  ItemChartData,
  ViewCallbacks,
} from '../types/interfaces';
import {
  attemptRename,
  deleteAsset,
  deleteExpense,
  deleteIncome,
  deleteSetting,
  deleteTransaction,
  deleteTrigger,
  doShowTodaysValueColumns,
  editSetting,
  setFavouriteAsset,
  setFavouriteExpense,
  setFavouriteIncome,
  setFavouriteSetting,
  setFavouriteTransaction,
  setFavouriteTrigger,
  setReportKey,
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
import { Context, DateFormatType, log, showObj } from '../utils/utils';

import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGridFinKitty from './reactComponents/DataGridFinKitty';
import GrowthFormatter from './reactComponents/GrowthFormatter';
import React, { ReactNode } from 'react';
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
  getTodaysDate,
  getSettings,
  makeModelFromJSON,
  setSetting,
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
  lessThan,
  makeTwoDP,
  dateAsString,
} from '../utils/stringUtils';
import { Accordion, Button, Card, useAccordionButton } from 'react-bootstrap';
import {
  filtersList,
  getDefaultChartSettings,
  makeBarData,
  makeContainedBarChart,
} from './chartPages';
import { ReportMatcherForm } from './reactComponents/ReportMatcherForm';
import { getDisplay } from '../utils/viewUtils';
import { EvaluationHelper, getEvaluations } from '../models/evaluations';

function CustomToggle({ children, eventKey }: any) {
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log('totally custom!'),
  );

  return (
    <Button onClick={decoratedOnClick} variant={'link'}>
      {children}
    </Button>
  );
}

export function collapsibleFragment(
  fragment: JSX.Element | undefined,
  title: string,
): ReactNode {
  if (fragment === undefined) {
    return <></>;
  }
  return (
    <Accordion defaultActiveKey="0">
      <Card>
        <Card.Header>
          <CustomToggle eventKey="0">{title}</CustomToggle>
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
  doChecks: boolean,
  args: any,
) {
  // log('handleExpenseGridRowsUpdated', arguments);
  const expense = args[0].fromRowData;
  const oldValue = expense[args[0].cellKey];
  const newValue = args[0].updated[args[0].cellKey];
  if (oldValue === newValue) {
    return;
  }

  // log('old expense '+showObj(expense));
  if (args[0].cellKey === 'NAME') {
    if (expense.NAME !== args[0].updated.NAME) {
      if (doChecks) {
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
      }
      attemptRename(model, doChecks, expense.NAME, args[0].updated.NAME);
    }
    return;
  }

  expense[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new expense '+showObj(expense));
  const parsedGrowsWithCPI = makeBooleanFromYesNo(expense.GROWS_WITH_CPI);

  const valueIsSetting = model.settings.find((s) => {
    return s.NAME === expense.VALUE;
  });
  const parsedValue = makeCashValueFromString(expense.VALUE);
  if (doChecks) {
    if (!parsedGrowsWithCPI.checksOK) {
      showAlert("Whether expense grows with CPI should be 'y' or 'n'");
      expense[args[0].cellKey] = oldValue;
    } else if (!valueIsSetting && !parsedValue.checksOK) {
      showAlert(`Value ${expense.VALUE} can't be understood as a cash value`);
      expense[args[0].cellKey] = oldValue;
    } else {
      const expenseForSubmission: Expense = {
        NAME: expense.NAME,
        FAVOURITE: undefined,
        CATEGORY: expense.CATEGORY,
        START: expense.START,
        END: expense.END,
        VALUE: valueIsSetting ? expense.VALUE : `${parsedValue.value}`,
        VALUE_SET: expense.VALUE_SET,
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
  } else {
    const expenseForSubmission: Expense = {
      NAME: expense.NAME,
      FAVOURITE: undefined,
      CATEGORY: expense.CATEGORY,
      START: expense.START,
      END: expense.END,
      VALUE: `${parsedValue.value}`,
      VALUE_SET: expense.VALUE_SET,
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      RECURRENCE: expense.RECURRENCE,
    };
    // log(`expenseForSubmission = ${showObj(expenseForSubmission)}`);
    submitExpense(expenseForSubmission, model);
  }
}

function handleIncomeGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  args: any,
) {
  // log('handleIncomeGridRowsUpdated');
  const income = args[0].fromRowData;
  const oldValue = income[args[0].cellKey];
  const newValue = args[0].updated[args[0].cellKey];
  if (oldValue === newValue) {
    return;
  }

  // log('old income '+showObj(income));
  if (args[0].cellKey === 'NAME') {
    if (doChecks) {
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
      }
      attemptRename(model, doChecks, income.NAME, args[0].updated.NAME);
    }
    return;
  }

  income[args[0].cellKey] = args[0].updated[args[0].cellKey];
  // log('new income '+showObj(income));
  const parsedGrowsWithCPI = makeBooleanFromYesNo(income.GROWS_WITH_CPI);
  const parsedValue = makeCashValueFromString(income.VALUE);
  if (doChecks) {
    if (!parsedGrowsWithCPI.checksOK) {
      showAlert("Whether income grows with CPI should be 'y' or 'n'");
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
        FAVOURITE: undefined,
        CATEGORY: income.CATEGORY,
        START: income.START,
        END: income.END,
        VALUE: incValue,
        VALUE_SET: income.VALUE_SET,
        CPI_IMMUNE: !parsedGrowsWithCPI.value,
        RECURRENCE: income.RECURRENCE,
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
  } else {
    let incValue = '';
    if (parsedValue.checksOK) {
      incValue = `${parsedValue.value}`;
    } else {
      incValue = income.VALUE;
    }

    const incomeForSubmission: Income = {
      NAME: income.NAME,
      FAVOURITE: undefined,
      CATEGORY: income.CATEGORY,
      START: income.START,
      END: income.END,
      VALUE: incValue,
      VALUE_SET: income.VALUE_SET,
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      RECURRENCE: income.RECURRENCE,
      LIABILITY: income.LIABILITY,
    };
    submitIncome(incomeForSubmission, model);
  }
}

function handleTriggerGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  args: any,
) {
  // log('handleTriggerGridRowsUpdated', arguments);
  const trigger = args[0].fromRowData;
  const oldValue = trigger[args[0].cellKey];
  const newValue = args[0].updated[args[0].cellKey];
  if (oldValue === newValue) {
    return;
  }

  if (args[0].cellKey === 'NAME') {
    if (trigger.NAME !== args[0].updated.NAME) {
      if (doChecks) {
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
      }
      attemptRename(model, doChecks, trigger.NAME, args[0].updated.NAME);
    }
    return;
  }
  trigger[args[0].cellKey] = args[0].updated[args[0].cellKey];
  const forSubmit: Trigger = {
    NAME: trigger.NAME,
    FAVOURITE: trigger.FAVOURITE,
    DATE: trigger.DATE,
  };
  if (doChecks) {
    const checks = checkTrigger(forSubmit, model);
    if (checks === '') {
      submitTrigger(forSubmit, model);
    } else {
      showAlert(checks);
      trigger[args[0].cellKey] = oldValue;
    }
  } else {
    submitTrigger(forSubmit, model);
  }
}

function handleAssetGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  args: any,
) {
  // log('handleAssetGridRowsUpdated', args);
  const asset = args[0].fromRowData;
  const oldValue = asset[args[0].cellKey];
  const newValue = args[0].updated[args[0].cellKey];
  if (oldValue === newValue) {
    return;
  }

  if (args[0].cellKey === 'NAME') {
    if (doChecks) {
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
      }
    }
    attemptRename(model, doChecks, asset.NAME, args[0].updated.NAME);
    return;
  }
  const matchedAsset = model.assets.filter((a) => {
    return a.NAME === asset.NAME;
  });
  if (matchedAsset.length !== 1) {
    log(`Error: asset ${asset.NAME} not found in model?`);
    return;
  }
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

  if (doChecks) {
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
        FAVOURITE: asset.FAVOURITE,
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
  } else {
    // log(`parsedValue = ${showObj(parsedValue)}`);
    const valueForSubmission = parsedValue.checksOK
      ? `${parsedValue.value}`
      : asset.VALUE;
    // log(`valueForSubmission = ${valueForSubmission}`);
    const assetForSubmission: Asset = {
      NAME: asset.NAME,
      FAVOURITE: undefined,
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
    type === revalueInc ||
    type === revalueSetting
  ) {
    prefix = revalue;
  }
  return prefix + name;
}

function handleTransactionGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  type: string,
  args: any,
) {
  // log('handleTransactionGridRowsUpdated', args);
  const gridData = args[0].fromRowData;
  const oldValue = gridData[args[0].cellKey];
  const newValue = args[0].updated[args[0].cellKey];
  if (oldValue === newValue) {
    return;
  }

  gridData[args[0].cellKey] = newValue;

  // log(`gridData.FROM_VALUE = ${gridData.FROM_VALUE}`);
  // revalue tables have a hidden FROM_VALUE column
  if (gridData.FROM_VALUE === undefined) {
    gridData.FROM_VALUE = 0.0;
  }

  const parseFrom = makeValueAbsPropFromString(gridData.FROM_VALUE);

  const transactionType = gridData.TYPE;
  const parseTo = makeValueAbsPropFromString(gridData.TO_VALUE);
  if (
    doChecks &&
    transactionType !== revalueSetting &&
    !parseFrom.checksOK &&
    !model.settings.find((s) => {
      return s.NAME === gridData.FROM_VALUE;
    }) &&
    !(
      gridData.FROM_VALUE.startsWith(bondMaturity) &&
      model.settings.find((s) => {
        return s.NAME === gridData.FROM_VALUE.substring(bondMaturity.length);
      }) !== undefined
    )
  ) {
    showAlert(
      `From value ${gridData.FROM_VALUE} should be a number or a number with % symbol`,
    );
    gridData[args[0].cellKey] = oldValue;
  } else if (
    doChecks &&
    transactionType !== revalueSetting &&
    !parseTo.checksOK
  ) {
    showAlert(
      `To value ${gridData.TO_VALUE} should be a number or a number with % symbol`,
    );
    gridData[args[0].cellKey] = oldValue;
  } else {
    let type = gridData.TYPE;
    // log(`type = ${type}`);
    if (
      type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc ||
      type === revalueSetting
    ) {
      // enable auto-switch of revalue types if TO changes
      if (isADebt(gridData.TO, model)) {
        type = revalueDebt;
        parseTo.value = `${-parseFloat(parseTo.value)}`;
      } else if (isAnAssetOrAssets(gridData.TO, model)) {
        type = revalueAsset;
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
      if (doChecks) {
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
        }
        attemptRename(model, doChecks, oldtName, tName);
      }
      return;
    }

    const transaction: Transaction = {
      DATE: gridData.DATE,
      FROM: gridData.FROM,
      FROM_VALUE: parseFrom.value,
      FROM_ABSOLUTE: parseFrom.absolute,
      NAME: tName,
      FAVOURITE: gridData.FAVOURITE,
      TO: gridData.TO,
      TO_ABSOLUTE: parseTo.absolute,
      TO_VALUE: parseTo.value,
      STOP_DATE: gridData.STOP_DATE,
      RECURRENCE: gridData.RECURRENCE,
      TYPE: type,
      CATEGORY: gridData.CATEGORY,
    };
    if (doChecks) {
      const checks = checkTransaction(transaction, model);
      if (checks === '') {
        // log(`checks OK, submitting transaction`);
        submitTransaction(transaction, model);
      } else {
        showAlert(checks);
        gridData[args[0].cellKey] = oldValue;
      }
    } else {
      submitTransaction(transaction, model);
    }
  }
}
function handleSettingGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  args: any,
) {
  // log('handleSettingGridRowsUpdated', args);
  const x = args[0].fromRowData;
  const oldValue = x[args[0].cellKey];
  const newValue = args[0].updated[args[0].cellKey];
  if (oldValue === newValue) {
    return;
  }

  if (args[0].cellKey === 'NAME') {
    if (x.NAME !== args[0].updated.NAME) {
      if (doChecks) {
        if (
          minimalModel.settings.filter((obj) => {
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
      }

      attemptRename(model, doChecks, x.NAME, args[0].updated.NAME);
    }
    return;
  }
  x[args[0].cellKey] = args[0].updated[args[0].cellKey];
  const forSubmission = {
    NAME: x.NAME,
    FAVOURITE: x.FAVOURITE,
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
export const faveColumn = {
  ...defaultColumn,
  key: 'FAVE',
  name: '',
  suppressSizeToFit: true,
  width: 40,
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
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
  ];
  if (doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
        formatter: <CashValueFormatter name="focus value" value="unset" />,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'VALUE',
      name: 'start value',
      formatter: <CashValueFormatter name="start value" value="unset" />,
    },
  ]);
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

function assetsOrDebtsForTable(
  model: ModelData,
  todaysValues: Map<Asset, AssetOrDebtVal>,
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
): any[] {
  const unindexedResult = model.assets
    .filter((obj: Asset) => {
      return obj.IS_A_DEBT === isDebt;
    })
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForFavourites(obj) &&
        parentCallbacks.filterForAge(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
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
      const todaysValkey = [...todaysValues.keys()].find((a) => {
        return a.NAME === obj.NAME;
      });
      const mapResult = {
        GROWTH: obj.GROWTH,
        NAME: obj.NAME,
        FAVOURITE: obj.FAVOURITE,
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
        TODAYSVALUE: todaysValkey
          ? `${todaysValues.get(todaysValkey)?.val}`
          : ``,
      };
      return mapResult;
    })
    .sort((a: Item, b: Item) => lessThan(b.NAME, a.NAME));
  return addIndices(unindexedResult);
}

export function assetsOrDebtsTableDiv(
  model: ModelData,
  rowData: any[],
  doChecks: boolean,
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridAssets">
          <DataGridFinKitty
            handleGridRowsUpdated={function () {
              return handleAssetGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                arguments,
              );
            }}
            rows={rowData}
            columns={getAssetOrDebtCols(model, isDebt)}
            deleteFunction={deleteAsset}
            setFavouriteFunction={setFavouriteAsset}
            model={model}
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
    result = obj.substring(conditional.length);
  } else if (
    (type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc ||
      type === revalueSetting) &&
    obj.startsWith(revalue)
  ) {
    result = obj.substring(revalue.length);
    //if (result.startsWith(' ')) {
    //  alert(`revalue starts with a space '${result}'`);
    //}
  } else {
    result = obj;
  }
  // log(`display ${result}`);
  return result;
}

export function transactionsForTable(
  model: ModelData,
  type: string,
  parentCallbacks: ViewCallbacks,
) {
  const unindexedRows = model.transactions
    .filter((t) => {
      if (t.TYPE === type) {
        return true;
      }
      if (type === bondInvest && t.TYPE === bondMature) {
        return true;
      }
      return false;
    })
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForFavourites(obj) &&
        parentCallbacks.filterForAge(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
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
      if (obj.TO === '' && (toValueEntry === '0' || toValueEntry === '0.0')) {
        toValueEntry = '';
      }
      const mapResult = {
        DATE: obj.DATE,
        FROM: obj.FROM,
        FROM_VALUE: fromValueEntry,
        NAME: getDisplayName(obj.NAME, type),
        FAVOURITE: obj.FAVOURITE,
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
    faveColumn,
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
    type === revalueDebt ||
    type === revalueSetting
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
  } else if (type === revalueSetting) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'setting',
        formatter: <SimpleFormatter name="setting" value="unset" />,
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
        formatter: <SimpleFormatter name="new value" value="unset" />,
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

export function transactionsTableDiv(
  contents: any[],
  model: ModelData,
  doChecks: boolean,
  type: string,
  headingText: string,
  parentCallbacks: ViewCallbacks,
) {
  if (contents.length === 0) {
    return <></>;
  }
  return collapsibleFragment(
    <div
      className={`dataGridTransactions${type}`}
      style={{
        display: 'block',
      }}
    >
      {/*
      <Button
        onClick={() => {
          deleteTransactions(
            contents
              .filter((x) => {
                if (
                  model.transactions.find((t) => {
                    return t.FROM_VALUE.startsWith(`${bondMaturity}${x.TO}`);
                  }) === undefined
                ) {
                  // there is no transaction from Bond Maturity + this name
                  // so do include it for delete
                  //log(
                  //  `no transaction from-value ${bondMaturity}${
                  //    x.TO
                  //  }, do delete ${getTransactionName(x.NAME, type)}`,
                  //);
                  return true;
                } else {
                  //log(
                  //  `found transaction from-value ${bondMaturity}${
                  //    x.TO
                  //  }, do not delete ${getTransactionName(x.NAME, type)}`,
                  //);
                  return false;
                }
              })
              .map((x) => {
                const completeName = getTransactionName(x.NAME, type);
                return completeName;
              }),
          );
        }}
      >
        delete all transactions
      </Button>
      */}

      <DataGridFinKitty
        handleGridRowsUpdated={function () {
          return handleTransactionGridRowsUpdated(
            model,
            parentCallbacks.showAlert,
            doChecks,
            type,
            arguments,
          );
        }}
        rows={contents}
        columns={makeTransactionCols(model, type)}
        deleteFunction={(name: string) => {
          const completeName = getTransactionName(name, type);
          log(`delete transaction`);
          return deleteTransaction(completeName);
        }}
        setFavouriteFunction={(name: string, val: boolean) => {
          const completeName = getTransactionName(name, type);
          log(`set Favourite for transaction`);
          return setFavouriteTransaction(completeName, val);
        }}
        model={model}
      />
    </div>,
    headingText,
  );
}

export function transactionFilteredTable(
  model: ModelData,
  doChecks: boolean,
  type: string,
  headingText: string,
  parentCallbacks: ViewCallbacks,
) {
  const contents = transactionsForTable(model, type, parentCallbacks);
  return transactionsTableDiv(
    contents,
    model,
    doChecks,
    type,
    headingText,
    parentCallbacks,
  );
}

export function debtsDivWithHeadings(
  model: ModelData,
  todaysDebtValues: Map<Asset, AssetOrDebtVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const debtData = assetsOrDebtsForTable(
    model,
    todaysDebtValues,
    true,
    parentCallbacks,
  );
  if (debtData.length === 0) {
    return;
  }
  return (
    <>
      {collapsibleFragment(
        assetsOrDebtsTableDiv(model, debtData, doChecks, true, parentCallbacks),
        'Debt definitions',
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueDebt,
        'Revalue debts',
        parentCallbacks,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        payOffDebt,
        'Pay off debts',
        parentCallbacks,
      )}
    </>
  );
}

export function assetsDivWithHeadings(
  model: ModelData,
  todaysAssetValues: Map<Asset, AssetOrDebtVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const assetData = assetsOrDebtsForTable(
    model,
    todaysAssetValues,
    false,
    parentCallbacks,
  );
  if (assetData.length === 0) {
    return;
  }
  return (
    <>
      {collapsibleFragment(
        assetsOrDebtsTableDiv(
          model,
          assetData,
          doChecks,
          false,
          parentCallbacks,
        ),
        `Asset definition table`,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        liquidateAsset,
        'Liquidate assets to keep cash afloat',
        parentCallbacks,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueAsset,
        'Revalue assets',
        parentCallbacks,
      )}
    </>
  );
}

function triggersForTable(model: ModelData, parentCallbacks: ViewCallbacks) {
  const unindexedResult = model.triggers
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForFavourites(obj) &&
        parentCallbacks.filterForAge(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
    })

    .map((obj: Trigger) => {
      const mapResult = {
        DATE: obj.DATE,
        NAME: obj.NAME,
        FAVOURITE: obj.FAVOURITE,
      };
      return mapResult;
    })
    .sort((a: Item, b: Item) => lessThan(b.NAME, a.NAME));
  return addIndices(unindexedResult);
}

function triggersTableDiv(
  model: ModelData,
  trigData: any[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridTriggers">
          <DataGridFinKitty
            deleteFunction={deleteTrigger}
            setFavouriteFunction={setFavouriteTrigger}
            handleGridRowsUpdated={function () {
              return handleTriggerGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                arguments,
              );
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
              faveColumn,
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
            model={model}
          />
        </div>
      </fieldset>
    </div>
  );
}

export function triggersTableDivWithHeading(
  model: ModelData,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const trigData = triggersForTable(model, parentCallbacks);
  if (trigData.length === 0) {
    return;
  }
  return collapsibleFragment(
    triggersTableDiv(model, trigData, doChecks, parentCallbacks),
    `Important dates`,
  );
}

function incomesForTable(
  model: ModelData,
  todaysValues: Map<Income, IncomeVal>,
  parentCallbacks: ViewCallbacks,
) {
  const unindexedResult = model.incomes
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForFavourites(obj) &&
        parentCallbacks.filterForAge(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
    })

    .map((obj: Income) => {
      let todaysVForTable = 0.0;
      const todaysValkey = [...todaysValues.keys()].find((i) => {
        return i.NAME === obj.NAME;
      });

      const todaysV = todaysValkey ? todaysValues.get(todaysValkey) : undefined;
      if (todaysV !== undefined) {
        if (!todaysV.hasEnded) {
          todaysVForTable = todaysV.incomeVal;
        }
      }
      const mapResult = {
        END: obj.END,
        GROWS_WITH_CPI: makeYesNoFromBoolean(!obj.CPI_IMMUNE),
        NAME: obj.NAME,
        FAVOURITE: obj.FAVOURITE,
        START: obj.START,
        VALUE: obj.VALUE,
        VALUE_SET: obj.VALUE_SET,
        LIABILITY: obj.LIABILITY,
        RECURRENCE: obj.RECURRENCE,
        CATEGORY: obj.CATEGORY,
        TODAYSVALUE: `${todaysVForTable}`,
      };
      // log(`passing ${showObj(result)}`);
      return mapResult;
    });
  return addIndices(unindexedResult);
}

function incomesTableDiv(
  model: ModelData,
  incData: any[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  if (incData.length === 0) {
    return;
  }
  let columns = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
    */
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
  ];
  if (doShowTodaysValueColumns()) {
    columns = columns.concat([
      {
        ...defaultColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
        formatter: <CashValueFormatter name="focus value" value="unset" />,
      },
    ]);
  }
  columns = columns.concat([
    {
      ...defaultColumn,
      key: 'VALUE',
      name: 'value definition',
      formatter: <CashValueFormatter name="value definition" value="unset" />,
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
        <TriggerDateFormatter name="start" model={model} value="unset" />
      ),
    },
    {
      ...defaultColumn,
      key: 'END',
      name: 'end',
      formatter: (
        <TriggerDateFormatter name="end" model={model} value="unset" />
      ),
    },
    {
      ...defaultColumn,
      key: 'GROWS_WITH_CPI',
      name: 'grows with CPI',
      formatter: <SimpleFormatter name="grows with CPI" value="unset" />,
    },
    {
      ...defaultColumn,
      key: 'LIABILITY',
      name: 'tax Liability',
      formatter: <SimpleFormatter name="tax Liability" value="unset" />,
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
  ]);
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <fieldset>
        <div className="dataGridIncomes">
          <DataGridFinKitty
            deleteFunction={deleteIncome}
            setFavouriteFunction={setFavouriteIncome}
            handleGridRowsUpdated={function () {
              return handleIncomeGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                arguments,
              );
            }}
            rows={incData}
            columns={columns}
            model={model}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function incomesTableDivWithHeading(
  model: ModelData,
  todaysValues: Map<Income, IncomeVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const incData: any[] = incomesForTable(model, todaysValues, parentCallbacks);
  if (incData.length === 0) {
    return;
  }
  return collapsibleFragment(
    incomesTableDiv(model, incData, doChecks, parentCallbacks),
    `Income definitions`,
  );
}

function expensesForTable(
  model: ModelData,
  todaysValues: Map<Expense, ExpenseVal>,
  parentCallbacks: ViewCallbacks,
) {
  const unindexedResult = model.expenses
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForFavourites(obj) &&
        parentCallbacks.filterForAge(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
    })

    .map((obj: Expense) => {
      let todaysVForTable = 0.0;
      const todaysValkey = [...todaysValues.keys()].find((e) => {
        return e.NAME === obj.NAME;
      });

      const todaysV = todaysValkey ? todaysValues.get(todaysValkey) : undefined;
      if (todaysV !== undefined) {
        if (!todaysV.hasEnded) {
          todaysVForTable = todaysV.expenseVal;
        }
      }
      const mapResult = {
        END: obj.END,
        GROWS_WITH_CPI: makeYesNoFromBoolean(!obj.CPI_IMMUNE),
        CATEGORY: obj.CATEGORY,
        NAME: obj.NAME,
        FAVOURITE: obj.FAVOURITE,
        START: obj.START,
        VALUE: obj.VALUE,
        VALUE_SET: obj.VALUE_SET,
        RECURRENCE: obj.RECURRENCE,
        TODAYSVALUE: `${todaysVForTable}`,
      };
      return mapResult;
    });
  return addIndices(unindexedResult);
}

function expensesTableDiv(
  model: ModelData,
  expData: any[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  let cols = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
    */
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
      formatter: <SimpleFormatter name="name" value="unset" />,
    },
  ];
  if (doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
        formatter: <CashValueFormatter name="focus value" value="unset" />,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'VALUE',
      name: 'value definition',
      formatter: <CashValueFormatter name="value definition" value="unset" />,
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
        <TriggerDateFormatter name="start" model={model} value="unset" />
      ),
    },
    {
      ...defaultColumn,
      key: 'END',
      name: 'end',
      formatter: (
        <TriggerDateFormatter name="end" model={model} value="unset" />
      ),
    },
    {
      ...defaultColumn,
      key: 'GROWS_WITH_CPI',
      name: 'grows with CPI',
      formatter: <SimpleFormatter name="grows with CPI" value="unset" />,
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
  ]);
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      {/*
      <Button
        onClick={() => {
          deleteAll(
            expData.map((x) => {
              return x.NAME;
            }),
          );
        }}
      >
        delete all expenses
      </Button>
      */}
      <fieldset>
        <div className="dataGridExpenses">
          <DataGridFinKitty
            deleteFunction={deleteExpense}
            setFavouriteFunction={setFavouriteExpense}
            handleGridRowsUpdated={function () {
              return handleExpenseGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                arguments,
              );
            }}
            rows={expData}
            columns={cols}
            model={model}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

export function expensesTableDivWithHeading(
  model: ModelData,
  todaysValues: Map<Expense, ExpenseVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const expData = expensesForTable(model, todaysValues, parentCallbacks);
  if (expData.length === 0) {
    return;
  }
  return collapsibleFragment(
    expensesTableDiv(model, expData, doChecks, parentCallbacks),
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
  doShow: (s: Setting) => boolean,
  parentCallbacks: ViewCallbacks,
) {
  const data = model.settings;
  const unindexedResult = data
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForFavourites(obj) &&
        parentCallbacks.filterForAge(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
    })

    .filter(doShow)
    .filter((obj: Setting) => {
      return (
        settingsToExcludeFromTableView.find((s) => {
          return obj.NAME === s;
        }) === undefined
      );
    })
    .map((obj: Setting) => {
      showObj(`obj = ${obj}`);
      const mapResult = {
        NAME: obj.NAME,
        FAVOURITE: obj.FAVOURITE,
        VALUE: obj.VALUE,
        HINT: obj.HINT,
      };
      return mapResult;
    })
    .sort((a, b) => {
      return a.NAME < b.NAME ? 1 : -1;
    });
  return addIndices(unindexedResult);
}

function customSettingsTable(
  model: ModelData,
  constSettings: any[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  if (constSettings.length === 0) {
    return;
  }
  return (
    <DataGridFinKitty
      deleteFunction={deleteSetting}
      setFavouriteFunction={setFavouriteSetting}
      handleGridRowsUpdated={function () {
        return handleSettingGridRowsUpdated(
          model,
          parentCallbacks.showAlert,
          doChecks,
          arguments,
        );
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
        faveColumn,
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
      model={model}
    />
  );
}
function adjustSettingsTable(
  model: ModelData,
  adjustSettings: any[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  if (adjustSettings.length === 0) {
    return;
  }
  return (
    <DataGridFinKitty
      deleteFunction={deleteSetting}
      setFavouriteFunction={setFavouriteSetting}
      handleGridRowsUpdated={function () {
        return handleSettingGridRowsUpdated(
          model,
          parentCallbacks.showAlert,
          doChecks,
          arguments,
        );
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
        faveColumn,
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
      model={model}
    />
  );
}

function settingsTables(
  model: ModelData,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const constSettings = settingsForTable(
    model,
    (s) => {
      return s.TYPE === constType;
    },
    parentCallbacks,
  );
  const adjustSettings = settingsForTable(
    model,
    (s) => {
      return s.TYPE === adjustableType;
    },
    parentCallbacks,
  );

  if (constSettings.length === 0 && adjustSettings.length === 0) {
    return;
  }

  return collapsibleFragment(
    <>
      {customSettingsTable(model, constSettings, doChecks, parentCallbacks)}
      {adjustSettingsTable(model, adjustSettings, doChecks, parentCallbacks)}
    </>,
    `Other settings affecting the model`,
  );
}

export function settingsTableDiv(
  model: ModelData,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  return (
    <div
      className="dataGridSettings"
      style={{
        display: 'block',
      }}
    >
      {collapsibleFragment(
        <DataGridFinKitty
          deleteFunction={deleteSetting}
          setFavouriteFunction={setFavouriteSetting}
          handleGridRowsUpdated={function () {
            return handleSettingGridRowsUpdated(
              model,
              parentCallbacks.showAlert,
              doChecks,
              arguments,
            );
          }}
          rows={settingsForTable(
            model,
            (s) => {
              return s.TYPE === viewType;
            },
            parentCallbacks,
          )}
          columns={[
            /*
            {
              ...defaultColumn,
              key: 'index',
              name: 'index',
              formatter: <SimpleFormatter name="name" value="unset" />,
            },
            */
            faveColumn,
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
          model={model}
        />,
        `Settings about the view of the model`,
      )}
      {settingsTables(model, doChecks, parentCallbacks)}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueSetting,
        'Revalue settings',
        parentCallbacks,
      )}
    </div>
  );
}

export function reportDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  reportMatcher: ReportMatcher,
  maxReportSize: number,
  reportIncludesSettings: boolean,
  reportIncludesExpenses: boolean,
  reportData: ReportDatum[],
) {
  if (!getDisplay(reportView)) {
    // log(`don't populate reportView`);
    return;
  }
  // log(`do populate reportView`);
  // log(`display report of length ${reportData.length}`);
  const unindexedResult = reportData
    .slice(0, 100)
    .filter((d) => {
      return d.name !== 'Estate final value';
    })
    .map((x) => {
      const make2dpCanBeUndefined: (input: number | undefined) => string = (
        input,
      ) => {
        return input ? makeTwoDP(input) : '';
      };
      const makeQCanBeUndefined: (input: number | undefined) => string = (
        input,
      ) => {
        return input ? `${input}` : '';
      };
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
  unindexedResult.reverse();
  const reportDataTable = addIndices(unindexedResult);

  // log(`display reportDataTable of length ${reportDataTable.length}`);
  // var util = require('util');
  // log(`display reportDataTable ${util.inspect(reportDataTable)}`);

  const context = Context.Asset;
  const itemsForFilterButtons = model.assets.filter((obj) => {
    return obj.IS_A_DEBT === false;
  });

  return (
    <div className="ml-3">
      {filtersList(itemsForFilterButtons, viewSettings, context, true)}
      <ReportMatcherForm
        reportMatcher={reportMatcher}
        setReportKey={setReportKey}
        maxReportSize={maxReportSize}
        reportIncludesSettings={reportIncludesSettings}
        reportIncludesExpenses={reportIncludesExpenses}
      />
      <DataGridFinKitty
        deleteFunction={undefined}
        setFavouriteFunction={undefined}
        handleGridRowsUpdated={function () {
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
              <TriggerDateFormatter name="date" model={model} value="unset" />
            ),
          },
          faveColumn,
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
          },
          {
            ...defaultColumn,
            key: 'SOURCE',
            name: 'source',
            formatter: <SimpleFormatter name="source" value="unset" />,
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
        ]}
        model={model}
      />
      {
        //`Table data in text form :
        //${util.inspect(reportDataTable)}`
        //}
      }
    </div>
  );
}
/*
interface StateProps {
  texts: string[];
}

class StateUpdater extends Component<StateProps> {
  public constructor(props: StateProps) {
    super(props);
  }

  public render(): JSX.Element[] {
    return this.props.texts.map((t) => {
      return <div key={t}>{t}</div>;
    });
  }
}
*/
function performOneCalc(
  model: ModelData,
  varVal: number,
  unindexedResult: {
    VAR: number;
    ESTATE: string;
    ESTATE_VAL: number;
  }[],
  helper: EvaluationHelper,
  showAlert: (msg: string) => void,
) {
  // log(`calculate optimisation task for varVal = ${varVal}`);
  const tempModel = makeModelFromJSON(JSON.stringify(model));

  setSetting(tempModel.settings, 'variable', `${varVal}`, custom);
  const evalResult = getEvaluations(tempModel, helper);
  const errorMsg = evalResult.reportData.find((d) => {
    return d.name === 'Error from evaluations';
  });
  if (errorMsg !== undefined) {
    showAlert(errorMsg.source);
  }
  const estateVal = evalResult.reportData.find((d) => {
    return d.name === 'Estate final value';
  });
  let textToDisplay = 'unknown';
  let estateValueForChart = 0.0;
  if (estateVal !== undefined) {
    if (estateVal.newVal !== undefined) {
      estateValueForChart = estateVal.newVal;
      textToDisplay = `${makeTwoDP(estateValueForChart)}`;
    }
  }
  //log(`variable = ${varVal}, estate = ${textToDisplay}`);
  unindexedResult.push({
    VAR: varVal,
    ESTATE: textToDisplay,
    ESTATE_VAL: estateValueForChart,
  });
  //log(
  //  `unindexedResult vars = ${unindexedResult.map((x) => {
  //    return x.VAR;
  //  })}`,
  //);
}

export function calcOptimizer(
  model: ModelData,
  helper: EvaluationHelper,
  showAlert: (msg: string) => void,
): ChartData {
  const noData: ChartData = {
    labels: [],
    datasets: [],
    displayLegend: false,
  };

  const varSetting = getSettings(model.settings, 'variable', 'missing', false);
  if (varSetting === 'missing') {
    alert(`optimiser needs a setting called 'variable'`);
    return noData;
  }
  if (!isNumberString(varSetting)) {
    alert(`optimiser needs a number setting called 'variable'`);
    return noData;
  }
  const varLowSetting = getSettings(
    model.settings,
    'variableLow',
    'missing',
    false,
  );
  if (varLowSetting === 'missing') {
    alert(`optimiser needs a setting called 'variableLow'`);
    return noData;
  }
  if (!isNumberString(varLowSetting)) {
    alert(`optimiser needs a number setting called 'variableLow'`);
    return noData;
  }
  const varHighSetting = getSettings(
    model.settings,
    'variableHigh',
    'missing',
    false,
  );
  if (varHighSetting === 'missing') {
    alert(`optimiser needs a setting called 'variableHigh'`);
    return noData;
  }
  if (!isNumberString(varHighSetting)) {
    alert(`optimiser needs a number setting called 'variableHigh'`);
    return noData;
  }
  let varCount = 10;
  const varCountSetting = getSettings(
    model.settings,
    'variableCount',
    'missing',
    false,
  );
  if (varCountSetting !== 'missing') {
    // log(`found varCount setting ${varCountSetting}`);
    if (isNumberString(varCountSetting)) {
      const parsed = parseInt(varCountSetting);
      if (parsed !== undefined && parsed > 0) {
        // log(`set varCount = ${varCount}`);
        varCount = parsed - 1;
      }
    }
  }
  const low = parseFloat(varLowSetting);
  const high = parseFloat(varHighSetting);

  const varVals = [];
  for (let step = 0; step <= varCount; step++) {
    const varVal = low + ((high - low) * step) / varCount;
    varVals.push(Math.floor(varVal * 100.0) / 100.0);
  }
  // showAlert(`starting compute...`);
  const unindexedResult: {
    VAR: number;
    ESTATE: string;
    ESTATE_VAL: number;
  }[] = [];
  for (const varVal of varVals) {
    // this doesn't display results right away - shame
    // log(`calc for variable = ${varVal}`);
    performOneCalc(model, varVal, unindexedResult, helper, showAlert);
  }
  // showAlert(`done compute...`);
  const data = addIndices(
    unindexedResult.sort((a, b) => {
      return a.VAR < b.VAR ? -1 : 1;
    }),
  );
  // log(`optimised data = ${showObj(data)}`);
  const cdps: ChartDataPoint[] = data.map((d) => {
    return {
      label: d.VAR,
      y: d.ESTATE_VAL,
      ttip: d.ESTATE,
    };
  });
  const icd: ItemChartData = {
    item: {
      NAME: 'optimisation result',
      FAVOURITE: undefined,
    },
    chartDataPoints: cdps,
  };

  const cd: ChartData = makeBarData(
    data.map((d) => {
      return d.VAR;
    }),
    [icd],
  );

  // log(`cd = ${showObj(cd)}`);
  return cd;
}
export function optimizerDiv(
  model: ModelData,
  settings: ViewSettings,
  cd: ChartData,
  parentCallbacks: ViewCallbacks,
) {
  if (!getDisplay(optimizerView)) {
    return;
  }
  const chartSettings = getDefaultChartSettings(settings, model.settings);

  /*
  return (
    <div className="ml-3">
      <StateUpdater texts={stateTexts}></StateUpdater>
    </div>
  );
  */
  const rows = Array.from(Array(cd.labels.length).keys())
    .map((i) => {
      return {
        ESTATE: `${cd.datasets[0].data[i]}`,
        VAR: cd.labels[i],
      };
    })
    .sort((a, b) => {
      return a.VAR < b.VAR ? 1 : -1;
    });
  return (
    <div className="ml-3">
      {adjustSettingsTable(
        model,
        settingsForTable(
          model,
          (s) => {
            return s.TYPE === adjustableType && s.NAME.startsWith('variable');
          },
          parentCallbacks,
        ),
        true,
        parentCallbacks,
      )}
      <DataGridFinKitty
        deleteFunction={undefined}
        setFavouriteFunction={undefined}
        handleGridRowsUpdated={function () {
          return false;
        }}
        rows={Array.from(Array(cd.labels.length).keys()).map((i) => {
          return {
            ...rows[i],
            index: i,
          };
        })}
        columns={[
          {
            ...defaultColumn,
            key: 'VAR',
            name: 'variable',
          },
          {
            ...defaultColumn,
            key: 'ESTATE',
            name: 'estate',
            formatter: <CashValueFormatter name="change" value="unset" />,
          },
        ]}
        model={model}
      />
      {makeContainedBarChart(cd, chartSettings, settings)}
    </div>
  );
}
