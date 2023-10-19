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
  Item,
  IncomeVal,
  ExpenseVal,
  AssetOrDebtVal,
  ChartData,
  ChartDataPoint,
  ItemChartData,
  ReportDatum,
  ReportMatcher,
  Setting,
  SettingVal,
  Transaction,
  Trigger,
  ViewCallbacks,
  DeleteResult,
} from '../types/interfaces';
import {
  checkExpense,
  checkIncome,
  checkTransaction,
  checkTrigger,
} from '../models/checks';
import { Context, DateFormatType, log, showObj } from '../utils/utils';

import DataGridFinKitty, { GridRow } from './reactComponents/DataGridFinKitty';
import GrowthFormatter from './reactComponents/GrowthFormatter';
import React, { ReactNode } from 'react';
import { SimpleFormatter } from './reactComponents/NameFormatter';
import ToFromValueFormatter from './reactComponents/ToFromValueFormatter';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';

import {
  isADebt,
  isAnAssetOrAssets,
  isAnIncome,
  isAnExpense,
  getSettings,
  isNumberString,
} from '../models/modelQueries';
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
  makeStringFromGrowth,
  getDisplayName,
} from '../utils/stringUtils';
import { Accordion, Button, Card, useAccordionButton } from 'react-bootstrap';
import {
  filtersList,
  getDefaultChartSettings,
  makeBarData,
  makeContainedBarChart,
} from './chartPages';
import { ReportMatcherForm } from './reactComponents/ReportMatcherForm';
import { ViewSettings, getDisplay } from '../utils/viewUtils';
import { EvaluationHelper, getEvaluations } from '../models/evaluations';
import { textEditor } from 'react-data-grid';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import { minimalModel } from '../models/minimalModel';
import { makeModelFromJSON } from '../models/modelFromJSON';
import { attemptRename } from '../utils/appActions';
import { getTodaysDate, setSetting } from '../models/modelUtils';
import { viewSetting } from 'models/exampleSettings';

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
  rows: any[],
  submitExpense: (
    expenseInput: Expense, 
    modelData: ModelData,
    viewState: ViewSettings,
  ) => Promise<void>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>, 
  viewState: ViewSettings,
  args: any,
) {
  // log('handleExpenseGridRowsUpdated', arguments);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if(changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  if (oldVal === newVal) {
    return;
  }

  // log('old expense '+showObj(expense));
  if (changedColumn.key === 'NAME') {

    if (oldRow.NAME !== newRow.NAME) {
      if (doChecks) {
        const parsed = getNumberAndWordParts(newRow.NAME);
        if (parsed.numberPart !== undefined) {
          showAlert(`Don't name an expense beginning with a number`);
          return;
        }
        const clashCheck = checkForWordClashInModel(
          model,
          newRow.NAME,
          'already',
        );
        if (clashCheck !== '') {
          showAlert(clashCheck);
          return;
        }
      }
      console.log('rename expense');
      attemptRename(model, doChecks, oldRow.NAME, newRow.NAME, showAlert, refreshData, viewState);
    }
    return;
  }

  // log('new expense '+showObj(expense));
  const parsedGrowsWithCPI = makeBooleanFromYesNo(newRow.GROWS_WITH_CPI);

  const valueIsSetting = model.settings.find((s) => {
    return s.NAME === newRow.VALUE;
  });
  const parsedValue = makeCashValueFromString(newRow.VALUE);
  if (doChecks) {
    if (!parsedGrowsWithCPI.checksOK) {
      showAlert("Whether expense grows with CPI should be 'y' or 'n'");
    } else if (!valueIsSetting && !parsedValue.checksOK) {
      showAlert(`Value ${newRow.VALUE} can't be understood as a cash value`);
    } else {
      const expenseForSubmission: Expense = {
        NAME: newRow.NAME,
        ERA: undefined,
        CATEGORY: newRow.CATEGORY,
        START: newRow.START,
        END: newRow.END,
        VALUE: valueIsSetting ? newRow.VALUE : `${parsedValue.value}`,
        VALUE_SET: newRow.VALUE_SET,
        CPI_IMMUNE: !parsedGrowsWithCPI.value,
        RECURRENCE: newRow.RECURRENCE,
      };
      // log(`expenseForSubmission = ${showObj(expenseForSubmission)}`);
      const checks = checkExpense(expenseForSubmission, model);
      if (checks === '') {
        submitExpense(expenseForSubmission, model, viewState);
      } else {
        showAlert(checks);
      }
    }
  } else {
    const expenseForSubmission: Expense = {
      NAME: newRow.NAME,
      ERA: undefined,
      CATEGORY: newRow.CATEGORY,
      START: newRow.START,
      END: newRow.END,
      VALUE: `${parsedValue.value}`,
      VALUE_SET: newRow.VALUE_SET,
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      RECURRENCE: newRow.RECURRENCE,
    };
    // log(`expenseForSubmission = ${showObj(expenseForSubmission)}`);
    submitExpense(expenseForSubmission, model, viewState);
  }
}

function handleIncomeGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  submitIncome: (
    incomeInput: Income, 
    modelData: ModelData,
    viewState: ViewSettings,
  ) => Promise<boolean>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,  
  viewState: ViewSettings,
  args: any,
) {
  log(`handleIncomeGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if(changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  if (oldVal === newVal) {
    return;
  }

  if (changedColumn.key === 'NAME') {
    if (doChecks) {
      if (newRow.NAME !== oldRow.NAME) {
        if (newRow.NAME.startsWith(pensionDB)) {
          showAlert(`Don't rename incomes beginning ${pensionDB}`);
          return;
        }
        if (newRow.NAME.startsWith(pensionTransfer)) {
          showAlert(`Don't rename incomes beginning ${pensionTransfer}`);
          return;
        }
        const parsed = getNumberAndWordParts(newRow.NAME);
        if (parsed.numberPart !== undefined) {
          showAlert(`Don't name an income beginning with a number`);
          return;
        }
        const clashCheck = checkForWordClashInModel(
          model,
          newRow.NAME,
          'already',
        );
        if (clashCheck !== '') {
          showAlert(clashCheck);
          return;
        }
      }
      attemptRename(model, doChecks, oldRow.NAME, newRow.NAME, showAlert, refreshData, viewState);
    }
    return;
  }

  // log('new income '+showObj(income));
  const parsedGrowsWithCPI = makeBooleanFromYesNo(newRow.GROWS_WITH_CPI);
  const parsedValue = makeCashValueFromString(newRow.VALUE);
  if (doChecks) {
    if (!parsedGrowsWithCPI.checksOK) {
      showAlert("Whether income grows with CPI should be 'y' or 'n'");
      //newValue = oldValue;
    } else {
      let incValue = '';
      if (parsedValue.checksOK) {
        incValue = `${parsedValue.value}`;
      } else {
        incValue = newRow.VALUE;
      }

      const incomeForSubmission: Income = {
        NAME: newRow.NAME,
        ERA: undefined,
        CATEGORY: newRow.CATEGORY,
        START: newRow.START,
        END: newRow.END,
        VALUE: incValue,
        VALUE_SET: newRow.VALUE_SET,
        CPI_IMMUNE: !parsedGrowsWithCPI.value,
        RECURRENCE: newRow.RECURRENCE,
        LIABILITY: newRow.LIABILITY,
      };
      const checks = checkIncome(incomeForSubmission, model);
      if (checks === '') {
        submitIncome(incomeForSubmission, model, viewState);
      } else {
        showAlert(checks);
      }
    }
  } else {
    let incValue = '';
    if (parsedValue.checksOK) {
      incValue = `${parsedValue.value}`;
    } else {
      incValue = newRow.VALUE;
    }

    const incomeForSubmission: Income = {
      NAME: newRow.NAME,
      ERA: undefined,
      CATEGORY: newRow.CATEGORY,
      START: newRow.START,
      END: newRow.END,
      VALUE: incValue,
      VALUE_SET: newRow.VALUE_SET,
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      RECURRENCE: newRow.RECURRENCE,
      LIABILITY: newRow.LIABILITY,
    };
    submitIncome(incomeForSubmission, model, viewState);
  }
}

function handleTriggerGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  submitTrigger: (triggerInput: Trigger, modelData: ModelData, viewState: ViewSettings) => Promise<void>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  viewState: ViewSettings,
  args: any,
) {
  log(`handleTriggerGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if(changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  if (oldVal === newVal) {
    return;
  }

  if (changedColumn.key === 'NAME') {
    if (oldRow.NAME !== newRow.NAME) {
      if (doChecks) {
        const parsed = getNumberAndWordParts(newRow.NAME);
        if (parsed.numberPart !== undefined) {
          showAlert(`Don't name a date beginning with a number`);
          return;
        }
        const clashCheck = checkForWordClashInModel(
          model,
          newRow.NAME,
          'already',
        );
        if (clashCheck !== '') {
          showAlert(clashCheck);
          return;
        }
      }
      attemptRename(model, doChecks, oldRow.NAME, newRow.NAME, showAlert, refreshData, viewState);
    }
    return;
  }
  const forSubmit: Trigger = {
    NAME: newRow.NAME,
    ERA: newRow.ERA,
    DATE: newRow.DATE,
  };
  if (doChecks) {
    const checks = checkTrigger(forSubmit, model);
    if (checks === '') {
      submitTrigger(forSubmit, model, viewState);
    } else {
      showAlert(checks);
    }
  } else {
    submitTrigger(forSubmit, model, viewState);
  }
}

export interface AssetGridRow {
  id: string;
  avatar: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
  street: string;
  zipCode: string;
  date: string;
  bs: string;
  catchPhrase: string;
  companyName: string;
  words: string;
  sentence: string;
}

function handleAssetGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  submitAsset: (assetInput: Asset, modelData: ModelData, viewState: ViewSettings) => Promise<void>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  viewState: ViewSettings,
  args: any,
) {
  log(`handleAssetGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if(changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  if (oldVal === newVal) {
    return;
  }

  if (changedColumn.key === 'NAME') {
    if (doChecks) {
      if (oldVal !== newVal) {
        if (oldVal === CASH_ASSET_NAME) {
          showAlert(`Don't rename cash asset`);
          return;
        }
        if (newVal.startsWith(pensionDB)) {
          showAlert(`Don't rename assets beginning ${pensionDB}`);
          return;
        }
        if (newVal.startsWith(pension)) {
          showAlert(`Don't rename assets beginning ${pension}`);
          return;
        }
        if (newVal.startsWith(taxFree)) {
          showAlert(`Don't rename assets beginning ${taxFree}`);
          return;
        }
        if (newVal.startsWith(crystallizedPension)) {
          showAlert(`Don't rename assets beginning ${crystallizedPension}`);
          return;
        }
        const parsed = getNumberAndWordParts(newVal);
        if (parsed.numberPart !== undefined) {
          showAlert(`Don't name an asset beginning with a number`);
          return;
        }
        const clashCheck = checkForWordClashInModel(
          model,
          newVal,
          'already',
        );
        if (clashCheck !== '') {
          showAlert(clashCheck);
          return;
        }
      }
    }
    attemptRename(model, doChecks, oldVal, newVal, showAlert, refreshData, viewState);
    return;
  }

  const matchedAsset = model.assets.filter((a) => {
    return a.NAME === oldRow.NAME;
  });
  if (matchedAsset.length !== 1) {
    log(`Error: asset ${oldRow.NAME} not found in model?`);
    return;
  }
  newRow[changedColumn.key] = args[0].updated[changedColumn.key];
  const parsedValue = makeCashValueFromString(newRow.VALUE);
  const parsedQuantity = makeQuantityFromString(newRow.QUANTITY);
  const parsedGrowth = makeGrowthFromString(newRow.GROWTH, model.settings);
  const parsedPurchasePrice = makePurchasePriceFromString(newRow.PURCHASE_PRICE);
  const parsedGrowsWithCPI = makeBooleanFromYesNo(newRow.GROWS_WITH_CPI);
  const parsedIsADebt = makeBooleanFromYesNo(newRow.IS_A_DEBT);
  const parsedCanBeNegative = makeBooleanFromYesNo(newRow.CAN_BE_NEGATIVE);

  // negate values before sending from table
  // to model
  if (matchedAsset[0].IS_A_DEBT && parsedValue.checksOK) {
    parsedValue.value = -parsedValue.value;
  }

  if (doChecks) {
    if (!parsedGrowth.checksOK) {
      showAlert(`asset growth ${newRow.GROWTH} not understood`);
      newRow[changedColumn.key] = oldVal;
    } else if (!parsedQuantity.checksOK) {
      showAlert(`quantity value ${newRow.QUANTITY} not understood`);
      newRow[changedColumn.key] = oldVal;
    } else if (!parsedGrowsWithCPI.checksOK) {
      showAlert(`asset value ${newRow.GROWS_WITH_CPI} not understood`);
      newRow[changedColumn.key] = oldVal;
    } else if (!parsedIsADebt.checksOK) {
      showAlert(`asset value ${newRow.IS_A_DEBT} not understood`);
      newRow[changedColumn.key] = oldVal;
    } else if (!parsedCanBeNegative.checksOK) {
      showAlert(`asset value ${newRow.CAN_BE_NEGATIVE} not understood`);
      newRow[changedColumn.key] = oldVal;
    } else {
      // log(`parsedValue = ${showObj(parsedValue)}`);
      const valueForSubmission = parsedValue.checksOK
        ? `${parsedValue.value}`
        : newRow.VALUE;
      // log(`valueForSubmission = ${valueForSubmission}`);
      const assetForSubmission: Asset = {
        NAME: newRow.NAME,
        ERA: newRow.ERA,
        VALUE: valueForSubmission,
        QUANTITY: newRow.QUANTITY,
        START: newRow.START,
        LIABILITY: newRow.LIABILITY,
        GROWTH: parsedGrowth.value,
        CPI_IMMUNE: !parsedGrowsWithCPI.value,
        CAN_BE_NEGATIVE: parsedCanBeNegative.value,
        IS_A_DEBT: parsedIsADebt.value,
        PURCHASE_PRICE: parsedPurchasePrice,
        CATEGORY: newRow.CATEGORY,
      };
      submitAsset(assetForSubmission, model, viewState);
    }
  } else {
    // log(`parsedValue = ${showObj(parsedValue)}`);
    const valueForSubmission = parsedValue.checksOK
      ? `${parsedValue.value}`
      : newRow.VALUE;
    // log(`valueForSubmission = ${valueForSubmission}`);
    const assetForSubmission: Asset = {
      NAME: newRow.NAME,
      ERA: undefined,
      VALUE: valueForSubmission,
      QUANTITY: newRow.QUANTITY,
      START: newRow.START,
      LIABILITY: newRow.LIABILITY,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: !parsedGrowsWithCPI.value,
      CAN_BE_NEGATIVE: parsedCanBeNegative.value,
      IS_A_DEBT: parsedIsADebt.value,
      PURCHASE_PRICE: parsedPurchasePrice,
      CATEGORY: newRow.CATEGORY,
    };
    submitAsset(assetForSubmission, model, viewState);
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
  rows: any[],
  submitTransaction: (transactionInput: Transaction, modelData: ModelData, viewState: ViewSettings) => Promise<void>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  viewState: ViewSettings,
  args: any,
) {
  log(`handleTransactionGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if(changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  if (oldVal === newVal) {
    return;
  }

  // log(`gridData.FROM_VALUE = ${gridData.FROM_VALUE}`);
  // revalue tables have a hidden FROM_VALUE column
  if (newRow.FROM_VALUE === undefined) {
    newRow.FROM_VALUE = 0.0;
  }

  const parseFrom = makeValueAbsPropFromString(newRow.FROM_VALUE);

  const transactionType = newRow.TYPE;
  const parseTo = makeValueAbsPropFromString(newRow.TO_VALUE);
  if (
    doChecks &&
    transactionType !== revalueSetting &&
    !parseFrom.checksOK &&
    !model.settings.find((s) => {
      return s.NAME === newRow.FROM_VALUE;
    }) &&
    !(
      newRow.FROM_VALUE.startsWith(bondMaturity) &&
      model.settings.find((s) => {
        return s.NAME === newRow.FROM_VALUE.substring(bondMaturity.length);
      }) !== undefined
    )
  ) {
    showAlert(
      `From value ${newRow.FROM_VALUE} should be a number or a number with % symbol`,
    );
  } else if (
    doChecks &&
    transactionType !== revalueSetting &&
    !parseTo.checksOK
  ) {
    showAlert(
      `To value ${newRow.TO_VALUE} should be a number or a number with % symbol`,
    );
  } else {
    let type = newRow.TYPE;
    // log(`type = ${type}`);
    if (
      type === revalueAsset ||
      type === revalueDebt ||
      type === revalueExp ||
      type === revalueInc ||
      type === revalueSetting
    ) {
      // enable auto-switch of revalue types if TO changes
      if (isADebt(newRow.TO, model)) {
        type = revalueDebt;
        parseTo.value = `${-parseFloat(parseTo.value)}`;
      } else if (isAnAssetOrAssets(newRow.TO, model)) {
        type = revalueAsset;
      } else if (isAnIncome(newRow.TO, model)) {
        type = revalueInc;
      } else if (isAnExpense(newRow.TO, model)) {
        type = revalueExp;
      }
    }
    const tName = getTransactionName(newRow.NAME, type);
    const oldtName = getTransactionName(oldRow.NAME, type);

    if (changedColumn.key === 'NAME') {
      log(`try to edit name from ${oldtName} to ${tName}`);
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
        log(`attempt rename`);
        attemptRename(model, doChecks, oldtName, tName, showAlert, refreshData, viewState);
      }
      return;
    }

    const transaction: Transaction = {
      DATE: newRow.DATE,
      FROM: newRow.FROM,
      FROM_VALUE: parseFrom.value,
      FROM_ABSOLUTE: parseFrom.absolute,
      NAME: tName,
      ERA: newRow.ERA,
      TO: newRow.TO,
      TO_ABSOLUTE: parseTo.absolute,
      TO_VALUE: parseTo.value,
      STOP_DATE: newRow.STOP_DATE,
      RECURRENCE: newRow.RECURRENCE,
      TYPE: type,
      CATEGORY: newRow.CATEGORY,
    };
    if (doChecks) {
      const checks = checkTransaction(transaction, model);
      if (checks === '') {
        // log(`checks OK, submitting transaction`);
        console.log(`submitting transaction after edit ${showObj(transaction)}`);
        submitTransaction(transaction, model, viewState);
      } else {
        showAlert(checks);
        // gridData[args[0].cellKey] = oldValue;
      }
    } else {
      console.log(`submitting transaction after edit ${showObj(transaction)}`);
      submitTransaction(transaction, model, viewState);
    }
  }
}
function handleSettingGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,  
  editSetting: (
    settingInput: {
      NAME: string;
      ERA: number | undefined;
      VALUE: string;
      HINT: string;
    },
    modelData: ModelData,
    viewState: ViewSettings,
  ) => Promise<void>,
  viewState: ViewSettings,
  args: any,
) {
  log(`handleTransactionGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if(changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  if (oldVal === newVal) {
    return;
  }

  if (changedColumn.key === 'NAME') {
    if (oldRow.NAME !== newRow.NAME) {
      if (doChecks) {
        if (
          minimalModel.settings.filter((obj) => {
            return obj.NAME === oldRow.NAME;
          }).length > 0
        ) {
          showAlert(`Don't rename inbuilt settings`);
          return;
        }
        const parsed = getNumberAndWordParts(newRow.NAME);
        if (parsed.numberPart !== undefined) {
          showAlert(`Don't name a setting beginning with a number`);
          return;
        }
        const clashCheck = checkForWordClashInModel(
          model,
          newRow.NAME,
          'already',
        );
        if (clashCheck !== '') {
          showAlert(clashCheck);
          return;
        }
      }

      attemptRename(model, doChecks, oldRow.NAME, newRow.NAME, showAlert, refreshData, viewState);
    }
    return;
  }
  const forSubmission = {
    NAME: newRow.NAME,
    ERA: newRow.ERA,
    VALUE: newRow.VALUE,
    HINT: newRow.HINT,
  };
  editSetting(forSubmission, model, viewState);
}

export const defaultColumn = {
  resizable: true,
  sortable: true,
  renderEditCell: textEditor,
  renderCell(props: any) {
    //console.log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <SimpleFormatter 
        name={props.column.name}
        value={val}
      />;
    },
};
export function triggerDateColumn(model: ModelData){
  return {
    resizable: true,
    sortable: true,
    renderEditCell: textEditor,
    renderCell(props: any) {
      //console.log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
      const val = props.row[props.column.key];

      return <TriggerDateFormatter 
          name={props.column.name}
          value={val}
          model={model}
        />;
      },
    }
};
export function growthColumn(settings: Setting[]){
  return {
    resizable: true,
    sortable: true,
    renderEditCell: textEditor,
    renderCell(props: any) {
      //console.log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
      const val = props.row[props.column.key];

      return <GrowthFormatter 
          name={props.column.name}
          value={val}
          settings={settings}
        />;
      },
    }
};

export const ToFromValueColumn = {
  resizable: true,
  sortable: true,
  renderEditCell: textEditor,
  renderCell(props: any) {
    //console.log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <ToFromValueFormatter 
        name={props.column.name}
        value={val}
      />;
    },
};
export const cashValueColumn = {
  resizable: true,
  sortable: true,
  renderEditCell: textEditor,
  renderCell(props: any) {
    //console.log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <CashValueFormatter 
        name={props.column.name}
        value={val}
      />;
    },
};
export function faveColumn(
  deleteFunction: (name:string, viewState: ViewSettings)=>Promise<DeleteResult>,
  buttonKey: string,
  viewState: ViewSettings,
) {
  return {
    ...defaultColumn,
    key: 'FAVE',
    name: '',
    suppressSizeToFit: true,
    width: 40,
    renderCell(props: any) {
      // console.log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
      const val = props.row[props.column.key];

      return <><Button
        key={`${buttonKey}${props.row.NAME}`}
        onClick={async ()=>{
          console.log("clicked!");
          const result = await deleteFunction(props.row.NAME, viewState);
          if(result.message){
            alert(result.message);
          } else if(result.itemsDeleted){
            alert(`deleted ${result.itemsDeleted}`);
          } else {
            alert(`not sure what has happened with this delete attempt!`)
          }
        }}
      >del<i className="fa fa-trash-o"></i></Button>;
      </>

      }
  };
}

function getAssetOrDebtCols(
  model: ModelData, 
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
  viewState: ViewSettings,
) {

  let cols: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */
    faveColumn(parentCallbacks.deleteAsset, 'assetDefTable', viewState),
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...cashValueColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
        renderEditCell: undefined,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...cashValueColumn,
      key: 'VALUE',
      name: 'start value',
    },
  ]);
  if (!isDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'QUANTITY',
        name: 'quantity',
      },
    ]);
  }
  const growthName = isDebt ? 'interest rate' : 'growth';
  cols = cols.concat([
    {
      ...triggerDateColumn(model),
      key: 'START',
      name: 'start',
    },
    {
      ...growthColumn(model.settings),
      key: 'GROWTH',
      name: growthName,
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
        ...cashValueColumn,
        key: 'PURCHASE_PRICE',
        name: 'purchase price',
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

interface AssetRow extends GridRow {
    GROWTH: string,
    START: string,
    VALUE: string,
    QUANTITY: string,
    LIABILITY: string,
    PURCHASE_PRICE: string,
    GROWS_WITH_CPI: string,
    IS_A_DEBT: string,
    CAN_BE_NEGATIVE: string,
    TODAYSVALUE: string,
};

function assetsOrDebtsForTable(
  model: ModelData,
  todaysValues: Map<Asset, AssetOrDebtVal>,
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
): AssetRow[] {
  const unindexedResult = model.assets
    .filter((obj: Asset) => {
      return obj.IS_A_DEBT === isDebt;
    })
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForEra(obj) &&
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
        GROWTH: makeStringFromGrowth(obj.GROWTH, model.settings),
        NAME: obj.NAME,
        ERA: obj.ERA,
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
  rowData: AssetRow[],
  doChecks: boolean,
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
  tableID: string,
  viewState: ViewSettings,
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
            tableID={tableID}
            handleGridRowsUpdated={function () {
              return handleAssetGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                rowData,
                parentCallbacks.submitAsset,
                parentCallbacks.refreshData,
                viewState,
                arguments,
              );
            }}
            rows={rowData}
            columns={getAssetOrDebtCols(
              model, 
              isDebt,
              parentCallbacks,
              viewState,
            )}
            deleteFunction={parentCallbacks.deleteAsset}
            setEraFunction={parentCallbacks.setEraAsset}
            model={model}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
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
        parentCallbacks.filterForEra(obj) &&
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
        ERA: obj.ERA,
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
    },
    */
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
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
        ...ToFromValueColumn,
        key: 'FROM_VALUE',
        name: 'amount',
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
        ...ToFromValueColumn,
        key: 'TO_VALUE',
        name: 'new value',
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
        ...ToFromValueColumn,
        key: 'TO_VALUE',
        name: 'new value',
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
      },
    ]);
  } else if (type === revalueSetting) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TO',
        name: 'setting',
      },
      {
        ...defaultColumn,
        key: 'TO_VALUE',
        name: 'new value',
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
        ...ToFromValueColumn,
        key: 'TO_VALUE',
        name: 'to amount',
      },
    ]);
  }
  if (type === payOffDebt) {
    cols = cols.concat([
      {
        ...triggerDateColumn(model),
        key: 'DATE',
        name: 'payments start date',
      },
    ]);
  } else {
    cols = cols.concat([
      {
        ...triggerDateColumn(model),
        key: 'DATE',
        name: 'date',
      },
    ]);
  }
  if (type !== autogen) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'RECURRENCE',
        name: 'recurrence',
      },
    ]);
  }
  if (type !== payOffDebt) {
    cols = cols.concat([
      {
        ...triggerDateColumn(model),
        key: 'STOP_DATE',
        name: 'recurrence end date',
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
  tableID: string,
  viewState: ViewSettings,
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
        tableID={tableID}
        handleGridRowsUpdated={function () {
          return handleTransactionGridRowsUpdated(
            model,
            parentCallbacks.showAlert,
            doChecks,
            contents,
            parentCallbacks.submitTransaction,
            parentCallbacks.refreshData,
            viewState,
            arguments,
          );
        }}
        rows={contents}
        columns={makeTransactionCols(model, type)}
        deleteFunction={(name: string) => {
          const completeName = getTransactionName(name, type);
          log(`delete transaction`);
          return parentCallbacks.deleteTransaction(completeName, viewState);
        }}
        setEraFunction={(name: string, val: number) => {
          const completeName = getTransactionName(name, type);
          // log(`set Favourite for transaction`);
          return parentCallbacks.setEraTransaction(completeName, val);
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
  tableID: string,
  viewState: ViewSettings,
) {
  const contents = transactionsForTable(model, type, parentCallbacks);
  return transactionsTableDiv(
    contents,
    model,
    doChecks,
    type,
    headingText,
    parentCallbacks,
    tableID,
    viewState,
  );
}

export function debtsDivWithHeadings(
  model: ModelData,
  todaysDebtValues: Map<Asset, AssetOrDebtVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableIDEnding: string,
  viewState: ViewSettings,
) {
  const debtData: AssetRow[] = assetsOrDebtsForTable(
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
        assetsOrDebtsTableDiv(
          model,
          debtData,
          doChecks,
          true,
          parentCallbacks,
          `debts${tableIDEnding}`,
          viewState,
        ),
        'Debt definitions',
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueDebt,
        'Revalue debts',
        parentCallbacks,
        `debtRevals${tableIDEnding}`,
        viewState,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        payOffDebt,
        'Pay off debts',
        parentCallbacks,
        `payoffDebts${tableIDEnding}`,
        viewState,
      )}
    </>
  );
}

export function assetsDivWithHeadings(
  model: ModelData,
  todaysAssetValues: Map<Asset, AssetOrDebtVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableIDEnding: string,
  viewState: ViewSettings,
) {
  const assetData: AssetRow[] = assetsOrDebtsForTable(
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
          `assets${tableIDEnding}`,
          viewState,
        ),
        `Asset definition table`,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        liquidateAsset,
        'Liquidate assets to keep cash afloat',
        parentCallbacks,
        `liquidateAssets${tableIDEnding}`,
        viewState,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueAsset,
        'Revalue assets',
        parentCallbacks,
        `assetsRevals${tableIDEnding}`,
        viewState,
      )}
    </>
  );
}

function triggersForTable(model: ModelData, parentCallbacks: ViewCallbacks) {
  const unindexedResult = model.triggers
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForEra(obj) &&
        parentCallbacks.filterForSearch(obj)
      );
    })

    .map((obj: Trigger) => {
      const mapResult = {
        DATE: obj.DATE,
        NAME: obj.NAME,
        ERA: obj.ERA,
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
  tableID: string,
  viewState: ViewSettings,
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
            tableID={tableID}
            deleteFunction={parentCallbacks.deleteTrigger}
            setEraFunction={parentCallbacks.setEraTrigger}
            handleGridRowsUpdated={function () {
              return handleTriggerGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                trigData,
                parentCallbacks.submitTrigger,
                parentCallbacks.refreshData,
                viewState,
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
              },
              */
              faveColumn,
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
              },
              {
                ...triggerDateColumn(model),
                key: 'DATE',
                name: 'date',
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
  tableIDEnding: string,
  viewState: ViewSettings,
) {
  const trigData = triggersForTable(model, parentCallbacks);
  if (trigData.length === 0) {
    return;
  }
  return collapsibleFragment(
    triggersTableDiv(
      model,
      trigData,
      doChecks,
      parentCallbacks,
      `triggers${tableIDEnding}`,
      viewState,
    ),
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
        parentCallbacks.filterForEra(obj) &&
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
        ERA: obj.ERA,
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
  tableID: string,
  viewState: ViewSettings,
) {
  if (incData.length === 0) {
    return;
  }
  let columns: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    columns = columns.concat([
      {
        ...cashValueColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
        renderEditCell: undefined,
      },
    ]);
  }
  columns = columns.concat([
    {
      ...cashValueColumn,
      key: 'VALUE',
      name: 'value definition',
    },
    {
      ...triggerDateColumn(model),
      key: 'VALUE_SET',
      name: 'definition date',
    },
    {
      ...triggerDateColumn(model),
      key: 'START',
      name: 'start',
    },
    {
      ...triggerDateColumn(model),
      key: 'END',
      name: 'end',
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
      key: 'RECURRENCE',
      name: 'recurrence',
    },
    {
      ...defaultColumn,
      key: 'CATEGORY',
      name: 'category',
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
            tableID={tableID}
            deleteFunction={parentCallbacks.deleteIncome}
            setEraFunction={parentCallbacks.setEraIncome}
            handleGridRowsUpdated={function () {
              return handleIncomeGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                incData,
                parentCallbacks.submitIncome,
                parentCallbacks.refreshData,
                viewState,
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
  viewState: ViewSettings,
) {
  const incData: any[] = incomesForTable(model, todaysValues, parentCallbacks);
  if (incData.length === 0) {
    return;
  }
  return collapsibleFragment(
    incomesTableDiv(model, incData, doChecks, parentCallbacks, 'incomesTable', viewState),
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
        parentCallbacks.filterForEra(obj) &&
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
        ERA: obj.ERA,
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
  tableID: string,
  viewState: ViewSettings,
) {
  let cols: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...cashValueColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
        renderEditCell: undefined,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...cashValueColumn,
      key: 'VALUE',
      name: 'value definition',
    },
    {
      ...triggerDateColumn(model),
      key: 'VALUE_SET',
      name: 'definition date',
    },
    {
      ...triggerDateColumn(model),
      key: 'START',
      name: 'start',
    },
    {
      ...triggerDateColumn(model),
      key: 'END',
      name: 'end',
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
            tableID={tableID}
            deleteFunction={parentCallbacks.deleteExpense}
            setEraFunction={parentCallbacks.setEraExpense}
            handleGridRowsUpdated={function () {
              return handleExpenseGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                expData,
                parentCallbacks.submitExpense,
                parentCallbacks.refreshData,
                viewState,
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
  tableIDEnding: string,
  viewState: ViewSettings,
) {
  const expData = expensesForTable(model, todaysValues, parentCallbacks);
  if (expData.length === 0) {
    return;
  }
  return collapsibleFragment(
    expensesTableDiv(
      model,
      expData,
      doChecks,
      parentCallbacks,
      `expenses${tableIDEnding}`,
      viewState,
    ),
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
  todaysValues: Map<Setting, SettingVal>,
  doShow: (s: Setting) => boolean,
  parentCallbacks: ViewCallbacks,
) {
  const data = model.settings;
  const unindexedResult = data
    .filter((obj: Item) => {
      return (
        parentCallbacks.filterForEra(obj) &&
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
      const todaysValkey = [...todaysValues.keys()].find((e) => {
        return e.NAME === obj.NAME;
      });
      const todaysVForTable = todaysValkey
        ? todaysValues.get(todaysValkey)
        : undefined;
      const mapResult = {
        NAME: obj.NAME,
        ERA: obj.ERA,
        VALUE: obj.VALUE,
        HINT: obj.HINT,
        TODAYSVALUE: `${todaysVForTable?.settingVal}`,
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
  tableID: string,
  viewState: ViewSettings,
) {
  if (constSettings.length === 0) {
    return;
  }
  let cols: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */
    faveColumn,
    {
      ...defaultColumn,
      key: 'NAME',
      name: 'name',
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: 'TODAYSVALUE',
        name: `value\nat ${dateAsString(
          DateFormatType.View,
          getTodaysDate(model),
        )}`,
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: 'VALUE',
      name: 'defining value',
    },
    {
      ...defaultColumn,
      key: 'HINT',
      name: 'hint',
    },
  ]);
  return (
    <DataGridFinKitty
      tableID={tableID}
      deleteFunction={parentCallbacks.deleteSetting}
      setEraFunction={parentCallbacks.setEraSetting}
      handleGridRowsUpdated={function () {
        return handleSettingGridRowsUpdated(
          model,
          parentCallbacks.showAlert,
          doChecks,
          constSettings,
          parentCallbacks.refreshData,
          parentCallbacks.editSetting,
          viewState,
          arguments,
        );
      }}
      rows={constSettings}
      columns={cols}
      model={model}
    />
  );
}
function adjustSettingsTable(
  model: ModelData,
  adjustSettings: any[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableID: string,
  viewState: ViewSettings,
) {
  if (adjustSettings.length === 0) {
    return;
  }
  return (
    <DataGridFinKitty
      tableID={tableID}
      deleteFunction={parentCallbacks.deleteSetting}
      setEraFunction={parentCallbacks.setEraSetting}
      handleGridRowsUpdated={function () {
        return handleSettingGridRowsUpdated(
          model,
          parentCallbacks.showAlert,
          doChecks,
          adjustSettings,
          parentCallbacks.refreshData,
          parentCallbacks.editSetting,
          viewState,
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
        },
        */
        faveColumn,
        {
          ...defaultColumn,
          key: 'NAME',
          name: 'name',
        },
        // parentCallbacks.doShowTodaysValueColumns()...
        {
          ...defaultColumn,
          key: 'TODAYSVALUE',
          name: `value\nat ${dateAsString(
            DateFormatType.View,
            getTodaysDate(model),
          )}`,
          //renderCell: <SettingValueFormatter name="focus value" value="unset" />,
        },
        {
          ...defaultColumn,
          key: 'VALUE',
          name: 'defining value',
        },
        {
          ...defaultColumn,
          key: 'HINT',
          name: 'hint',
        },
      ]}
      model={model}
    />
  );
}

function settingsTables(
  model: ModelData,
  todaysValues: Map<Setting, SettingVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  viewState: ViewSettings,
) {
  const constSettings = settingsForTable(
    model,
    todaysValues,
    (s) => {
      return s.TYPE === constType;
    },
    parentCallbacks,
  );
  const adjustSettings = settingsForTable(
    model,
    todaysValues,
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
      {customSettingsTable(
        model,
        constSettings,
        doChecks,
        parentCallbacks,
        'customSettingsTable',
        viewState,
      )}
      {adjustSettingsTable(
        model,
        adjustSettings,
        doChecks,
        parentCallbacks,
        'adjustableSettingsTable',
        viewState,
      )}
    </>,
    `Other settings affecting the model`,
  );
}

export function settingsTableDiv(
  model: ModelData,
  todaysValues: Map<Setting, SettingVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableIDEnding: string,
  viewState: ViewSettings,
) {
  const contents = settingsForTable(
    model,
    todaysValues,
    (s) => {
      return s.TYPE === viewType;
    },
    parentCallbacks,
  )
  return (
    <div
      className="dataGridSettings"
      style={{
        display: 'block',
      }}
    >
      {collapsibleFragment(
        <DataGridFinKitty
          tableID={`settings${tableIDEnding}`}
          deleteFunction={parentCallbacks.deleteSetting}
          setEraFunction={parentCallbacks.setEraSetting}
          handleGridRowsUpdated={function () {
            return handleSettingGridRowsUpdated(
              model,
              parentCallbacks.showAlert,
              doChecks,
              contents,
              parentCallbacks.refreshData,
              parentCallbacks.editSetting,
              viewState,
              arguments,
            );
          }}
          rows={contents}
          columns={[
            /*
            {
              ...defaultColumn,
              key: 'index',
              name: 'index',
            },
            */
            faveColumn,
            {
              ...defaultColumn,
              key: 'NAME',
              name: 'name',
            },
            {
              ...defaultColumn,
              key: 'VALUE',
              name: 'defining value',
            },
            {
              ...defaultColumn,
              key: 'HINT',
              name: 'hint',
            },
          ]}
          model={model}
        />,
        `Settings about the view of the model`,
      )}
      {settingsTables(
        model, 
        todaysValues, 
        doChecks, 
        parentCallbacks, 
        viewState,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueSetting,
        'Revalue settings',
        parentCallbacks,
        'settingsRevalsTable',
        viewState,
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
  tableID: string,
  setReportKey: (
    textInput: string,
    maxSize: number,
    saveAsCSV: boolean,
    reportIncludesSettings: boolean,
    reportIncludesExpenses: boolean,
  ) => void,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
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
        QCHANGE: x.qchange ? x.qchange : '',
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
      {filtersList(itemsForFilterButtons, viewSettings, context, true, refreshData)}
      <ReportMatcherForm
        reportMatcher={reportMatcher}
        setReportKey={setReportKey}
        maxReportSize={maxReportSize}
        reportIncludesSettings={reportIncludesSettings}
        reportIncludesExpenses={reportIncludesExpenses}
      />
      <DataGridFinKitty
        tableID={tableID}
        deleteFunction={undefined}
        setEraFunction={undefined}
        rows={reportDataTable}
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
            key: 'DATE',
            name: 'date',
            renderEditCell: undefined,
          },
          faveColumn,
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'SOURCE',
            name: 'source',
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'CHANGE',
            name: 'change',
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'OLD_VALUE',
            name: 'old value',
            renderEditCell: undefined,
          },
          {
            ...cashValueColumn,
            key: 'NEW_VALUE',
            name: 'new value',
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'QCHANGE',
            name: 'quantity change',
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'QOLD_VALUE',
            name: 'old quantity',
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: 'QNEW_VALUE',
            name: 'new quantity',
            renderEditCell: undefined,
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
  viewState: ViewSettings,
) {
  // log(`calculate optimisation task for varVal = ${varVal}`);
  const tempModel = makeModelFromJSON(JSON.stringify(model), viewState);

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
  viewState: ViewSettings,
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
    performOneCalc(model, varVal, unindexedResult, helper, showAlert, viewState);
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
      ERA: undefined,
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
  todaysSettingValues: Map<Setting, SettingVal>,
  settings: ViewSettings,
  cd: ChartData,
  parentCallbacks: ViewCallbacks,
  tableID: string,
  viewState: ViewSettings,
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
          todaysSettingValues,
          (s) => {
            return s.TYPE === adjustableType && s.NAME.startsWith('variable');
          },
          parentCallbacks,
        ),
        true,
        parentCallbacks,
        'variableSettingsTable',
        viewState,
      )}
      <DataGridFinKitty
        tableID={tableID}
        deleteFunction={undefined}
        setEraFunction={undefined}
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
            renderEditCell: undefined,
          },
          {
            ...cashValueColumn,
            key: 'ESTATE',
            name: 'estate',
            renderEditCell: undefined,
          },
        ]}
        model={model}
      />
      {makeContainedBarChart(cd, chartSettings, settings)}
    </div>
  );
}