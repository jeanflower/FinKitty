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
  pensionPrefix,
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
  optimizerView,
  custom,
  monitorEnd,
  monitorStart,
  valueFocusDate,
  roiStart,
} from "../localization/stringConstants";
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
  Monitor,
} from "../types/interfaces";
import {
  checkExpense,
  checkIncome,
  checkTransaction,
  checkTrigger,
} from "../models/checks";
import { Context, DateFormatType, log, showObj } from "../utils/utils";

import DataGridFinKitty, { GridRow } from "./reactComponents/DataGridFinKitty";
import GrowthFormatter from "./reactComponents/GrowthFormatter";
import React, { ReactNode } from "react";
import { SimpleFormatter } from "./reactComponents/NameFormatter";
import ToFromValueFormatter from "./reactComponents/ToFromValueFormatter";
import TriggerDateFormatter from "./reactComponents/TriggerDateFormatter";

import {
  isADebt,
  isAnAssetOrAssets,
  isAnIncome,
  isAnExpense,
  getSettings,
  isNumberString,
  getVarVal,
} from "../models/modelQueries";
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
  checkTriggerDate,
  isNumber,
} from "../utils/stringUtils";
import { Accordion, Button, Card, useAccordionButton } from "react-bootstrap";
import {
  filtersList,
  getDefaultChartSettings,
  makeBarData,
  makeContainedBarChart,
} from "./chartPages";
import { ReportMatcherForm } from "./reactComponents/ReportMatcherForm";
import { ViewSettings, getDisplay } from "../utils/viewUtils";
import { EvaluationHelper, generateSequenceOfDates, getEvaluations } from "../models/evaluations";
import { textEditor } from "react-data-grid";
import CashValueFormatter from "./reactComponents/CashValueFormatter";
import { minimalModel } from "../models/minimalModel";
import { makeModelFromJSON } from "../models/modelFromJSON";
import { getTodaysDate, setSetting } from "../models/modelUtils";
import dateFormat from "dateformat";
import CashExpressionFormatter from "./reactComponents/CashExpressionFormatter";
import { evaluate } from "mathjs";
import { inspect } from 'util';
import PcFormatter from "./reactComponents/PcFormatter";
import { getPlanningTableData } from "./../models/planningData";
inspect;

function CustomToggle({ children, eventKey }: any) {
  return (
    <Button 
      variant={"link"}>
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
  submitExpense: (expenseInput: Expense, modelData: ModelData) => Promise<void>,
  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  // log(`changedIndexes = ${showObj(changedIndexes)}`);

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  // log(`oldRow = ${showObj(oldRow)}`);
  // log(`newRow = ${showObj(newRow)}`);

  if (oldVal === newVal) {
    return;
  }

  // log('old expense '+showObj(expense));
  if (changedColumn.key === "NAME") {
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
          "already",
        );
        if (clashCheck !== "") {
          showAlert(clashCheck);
          return;
        }
      }
      log("rename expense");
      attemptRename(
        doChecks,
        oldRow.NAME,
        newRow.NAME,
        showAlert,
        refreshData,
      );
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
      if (checks === "") {
        submitExpense(expenseForSubmission, model);
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
    submitExpense(expenseForSubmission, model);
  }
}

function handleBudgetGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  year: string,
  submitMonitor: (monitorInput: Monitor, modelData: ModelData) => Promise<void>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  // log(`changedIndexes = ${showObj(changedIndexes)}`);

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  if (oldRow.key === "Basic" && changedColumn.key === "allowedBudget") {
    showAlert('Basic budget is not editable');
    return;
  }
  if (oldRow.key === "Leisure" && changedColumn.key === "allowedBudget") {
    showAlert('Leisure budget is not editable');
    return;
  }

  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  log(`oldRow = ${showObj(oldRow)}`);
  log(`newRow = ${showObj(newRow)}`);

  if (oldVal === newVal) {
    return;
  }

  let m = model.monitors.find((m) => {
    return m.NAME === `${newRow.key}Budget`;
  });

  if (!m) {
    console.log(`Error - editing a budget but can't find suitable monitor`);
//    return;
    m = {
      NAME:  `${newRow.key}Budget`,
      VALUES: [],
      ERA: 0,
    }
  }

  let v = m.VALUES.find((v) => {
    return v.MONTH === year;
  });
  if (!v) {
    v = {
      MONTH: year,
      EXPRESSION: '',
    };
    m.VALUES = m.VALUES.concat(v);
  }

  v.EXPRESSION = newRow.allowedBudget;
  
  // console.log(`new Monitor is ${showObj(m)}`);
  if (doChecks) {
    // console.log(`check data ${showObj(newRow)}`); //??
    submitMonitor(m, model);
  } else {
    console.log(`submit data ${showObj(newRow)}`);
    submitMonitor(m, model);
  }
}

function handleMonitoringGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  submitMonitor: (monitorInput: Monitor, modelData: ModelData) => Promise<void>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
    throw new Error(`don't handle multirow edits`);
  }

  // log(`changedIndexes = ${showObj(changedIndexes)}`);

  const oldRow = rows.find((r) => {
    return r.index === changedIndexes[0];
  });
  const oldVal = oldRow[changedColumn.key];

  const newRow = newTable.find((r: any) => {
    return r.index === changedIndexes[0];
  });
  const newVal = newRow[changedColumn.key];

  // log(`oldRow = ${showObj(oldRow)}`);
  // log(`newRow = ${showObj(newRow)}`);

  if (oldVal === newVal) {
    return;
  }

  const m: Monitor = {
    NAME: newRow.NAME,
    ERA: newRow.ERA,
    VALUES: [],
  }
  const keys = Object.keys(newRow);
  for(const key of keys){
    /*
      "NAME": "dog",
      "ERA": 0,
      "RECURRENCE": "1m",
      "TODAYSVALUE": "259.920149101385",
      "September 2023": "0.0",
      "August 2023": "0.0"      
    */
    if (key === 'NAME') {
      continue;
    }
    if (key === 'ERA') {
      continue;
    }
    if (key === 'RECURRENCE') {
      continue;
    }
    if (key === 'TODAYSVALUE') {
      continue;
    }
    if (key === 'index') {
      continue;
    }
    // console.log(`object[${key}] = ${newRow[key]}`);

    m.VALUES.push({
      MONTH: key,
      EXPRESSION: newRow[key],
    })
  }
  // console.log(`new Monitor is ${showObj(m)}`);
  if (doChecks) {
    // console.log(`check data ${showObj(newRow)}`); //??
    submitMonitor(m, model);
  } else {
    console.log(`submit data ${showObj(newRow)}`);
    submitMonitor(m, model);
  }
}

function handleIncomeGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  submitIncome: (incomeInput: Income, modelData: ModelData) => Promise<boolean>,
  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  // log(`handleIncomeGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
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

  if (changedColumn.key === "NAME") {
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
          "already",
        );
        if (clashCheck !== "") {
          showAlert(clashCheck);
          return;
        }
      }
      attemptRename(
        doChecks,
        oldRow.NAME,
        newRow.NAME,
        showAlert,
        refreshData,
      );
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
      let incValue = "";
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
      if (checks === "") {
        submitIncome(incomeForSubmission, model);
      } else {
        showAlert(checks);
      }
    }
  } else {
    let incValue = "";
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
    submitIncome(incomeForSubmission, model);
  }
}

function handleTriggerGridRowsUpdated(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  rows: any[],
  submitTrigger: (triggerInput: Trigger, modelData: ModelData) => Promise<void>,
  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  // log(`handleTriggerGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
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

  if (changedColumn.key === "NAME") {
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
          "already",
        );
        if (clashCheck !== "") {
          showAlert(clashCheck);
          return;
        }
      }
      attemptRename(
        doChecks,
        oldRow.NAME,
        newRow.NAME,
        showAlert,
        refreshData,
      );
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
    if (checks === "") {
      submitTrigger(forSubmit, model);
    } else {
      showAlert(checks);
    }
  } else {
    submitTrigger(forSubmit, model);
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
  submitAsset: (assetInput: Asset, modelData: ModelData) => Promise<void>,
  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  // log(`handleAssetGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
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

  if (changedColumn.key === "NAME") {
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
        if (newVal.startsWith(pensionPrefix)) {
          showAlert(`Don't rename assets beginning ${pensionPrefix}`);
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
        const clashCheck = checkForWordClashInModel(model, newVal, "already");
        if (clashCheck !== "") {
          showAlert(clashCheck);
          return;
        }
      }
    }
    attemptRename(doChecks, oldVal, newVal, showAlert, refreshData);
    return;
  }

  const matchedAsset = model.assets.filter((a) => {
    return a.NAME === oldRow.NAME;
  });
  if (matchedAsset.length !== 1) {
    log(`Error: asset ${oldRow.NAME} not found in model?`);
    return;
  }
  newRow[changedColumn.key] = newVal;
  const parsedValue = makeCashValueFromString(newRow.VALUE);
  const parsedQuantity = makeQuantityFromString(newRow.QUANTITY);
  const parsedGrowth = makeGrowthFromString(newRow.GROWTH, model.settings);
  const parsedPurchasePrice = makePurchasePriceFromString(
    newRow.PURCHASE_PRICE,
  );
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
      submitAsset(assetForSubmission, model);
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
    submitAsset(assetForSubmission, model);
  }
}

function getTransactionName(name: string, type: string) {
  let prefix = "";
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
  submitTransaction: (
    transactionInput: Transaction,
    modelData: ModelData,
  ) => Promise<void>,
  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
  args: any,
) {
  // log(`handleTransactionGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
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
    })
  ) {
    showAlert(
      `From value ${newRow.FROM_VALUE} should be a number` +
        ` or a number with % symbol`,
    );
  } else if (
    doChecks &&
    transactionType !== revalueSetting &&
    !parseTo.checksOK
  ) {
    showAlert(
      `To value ${newRow.TO_VALUE} should be a number or a number` +
        ` with % symbol`,
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

    if (changedColumn.key === "NAME") {
      log(`try to edit name from ${oldtName} to ${tName}`);
      if (doChecks) {
        if (tName !== oldtName) {
          const parsed = getNumberAndWordParts(oldtName);
          if (parsed.numberPart !== undefined) {
            showAlert(`Don't name a transaction beginning with a number`);
            return;
          }
          // log(`check for ${dbName} in model...`)
          const clashCheck = checkForWordClashInModel(model, tName, "already");
          if (clashCheck !== "") {
            showAlert(clashCheck);
            return;
          }
        }
        log(`attempt rename`);
        attemptRename(doChecks, oldtName, tName, showAlert, refreshData);
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
      if (checks === "") {
        // log(`checks OK, submitting transaction`);
        log(`submitting transaction after edit ${showObj(transaction)}`);
        submitTransaction(transaction, model);
      } else {
        showAlert(checks);
        // gridData[args[0].cellKey] = oldValue;
      }
    } else {
      log(`submitting transaction after edit ${showObj(transaction)}`);
      submitTransaction(transaction, model);
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
  ) => Promise<void>,
  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
  args: any,
) {
  // log(`handleTransactionGridRowsUpdated ${JSON.stringify(args)}`);
  const newTable = args[0];
  const change = args[1];
  const changedIndexes = change.indexes;
  const changedColumn = change.column;

  if (changedIndexes.length > 1) {
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

  if (changedColumn.key === "NAME") {
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
          "already",
        );
        if (clashCheck !== "") {
          showAlert(clashCheck);
          return;
        }
      }

      attemptRename(
        doChecks,
        oldRow.NAME,
        newRow.NAME,
        showAlert,
        refreshData,
      );
    }
    return;
  }
  if (newRow.NAME === valueFocusDate) {
    const startROI = getSettings(
      model.settings,
      roiStart,
      '',
      true,
    );
    if (new Date(newRow.VALUE) < new Date(startROI)) {
      const proceed = window.confirm(
        "proceed to set todays value focus date before the start of view range",
      );
      if (!proceed) {
        return;
      }
    }
  }

  if (newRow.NAME === roiStart) {
    const todaysDate = getSettings(
      model.settings,
      valueFocusDate,
      '',
      true,
    );
    if (todaysDate !== '' && new Date(todaysDate) < new Date(newRow.VALUE)) {
      const proceed = window.confirm(
        "proceed to set the start of view range after todays value focus date",
      );
      if (!proceed) {
        return;
      }
    }
  }

  const forSubmission = {
    NAME: newRow.NAME,
    ERA: newRow.ERA,
    VALUE: newRow.VALUE,
    HINT: newRow.HINT,
  };
  editSetting(forSubmission);
}

export const defaultColumn = {
  resizable: true,
  sortable: true,
  renderEditCell: textEditor,
  renderCell(props: any) {
    // log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <SimpleFormatter name={props.column.name} value={val} />;
  },
};
export function triggerDateColumn(model: ModelData) {
  return {
    ...defaultColumn,
    width: 120,
    renderCell(props: any) {
      //log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
      const val = props.row[props.column.key];

      return (
        <TriggerDateFormatter
          name={props.column.name}
          value={val}
          model={model}
        />
      );
    },
  };
}
export function growthColumn(settings: Setting[]) {
  return {
    ...defaultColumn,
    renderCell(props: any) {
      //log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
      const val = props.row[props.column.key];

      return (
        <GrowthFormatter
          name={props.column.name}
          value={val}
          settings={settings}
        />
      );
    },
  };
}

export const pcColumn = {
  ...defaultColumn,
  renderCell(props: any) {
    //log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <PcFormatter name={props.column.name} value={val} />;
  },
}


export const ToFromValueColumn = {
  ...defaultColumn,
  renderCell(props: any) {
    //log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <ToFromValueFormatter name={props.column.name} value={val} />;
  },
};
export const cashValueColumn = {
  ...defaultColumn,
  renderCell(props: any) {
    //log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <CashValueFormatter name={props.column.name} value={val} />;
  },
};
export const cashExpressionColumn = {
  ...defaultColumn,
  renderCell(props: any) {
    //log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
    const val = props.row[props.column.key];

    return <CashExpressionFormatter name={props.column.name} value={val} />;
  },
};
export function faveColumn(
  deleteFunction: undefined | ((name: string) => Promise<DeleteResult>),
  setEraFunction:
    | undefined
    | ((name: string, value: number) => Promise<boolean>),
  buttonKey: string,
) {
  return {
    ...defaultColumn,
    key: "FAVE",
    name: "",
    suppressSizeToFit: true,
    width: 120,
    renderCell(props: any) {
      // log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);

      return (
        <>
          {deleteFunction !== undefined && (
            <Button
              key={`del${buttonKey}${props.row.NAME}`}
              onClick={async () => {
                log("clicked!");
                const result = await deleteFunction(props.row.NAME);
                if (result.message) {
                  alert(result.message);
                } else if (result.itemsDeleted) {
                  alert(`deleted ${result.itemsDeleted}`);
                } else {
                  alert(`not sure what has happened with this delete attempt!`);
                }
              }}
              variant={`outline-secondary`}
            >
              del
            </Button>
          )}
          {setEraFunction !== undefined && (
            <Button
              key={`era${buttonKey}${props.row.NAME}`}
              disabled={deleteFunction === undefined}
              onClick={async () => {
                const oldVal = props.row["ERA"];

                let newVal = 0;
                if (oldVal === -1) {
                  newVal = 0;
                } else if (oldVal === 0) {
                  newVal = 1;
                } else if (oldVal === 1) {
                  newVal = -1;
                }

                await setEraFunction(props.row["NAME"], newVal);
                /*
          this.sortHandler(
            this.state.colSortIndex,
            this.state.sortDirection,
          );
          */
                //log(`this.props.rows.length = ${this.props.rows.length}`);
                //log(`this.sortedIndices = ${this.sortedIndices}`);
              }}
              variant={`outline-secondary`}
            >
              {props.row.ERA}
            </Button>
          )}
        </>
      );
    },
  };
}

function getAssetOrDebtCols(
  model: ModelData,
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
) {
  let cols: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */
    faveColumn(
      parentCallbacks.deleteAsset,
      parentCallbacks.setEraAsset,
      "assetDefTable",
    ),
    {
      ...defaultColumn,
      key: "NAME",
      name: "name",
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...cashValueColumn,
        key: "TODAYSVALUE",
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
      key: "VALUE",
      name: "start value",
    },
  ]);
  if (!isDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "QUANTITY",
        name: "quantity",
      },
    ]);
  }
  const growthName = isDebt ? "interest rate" : "growth";
  cols = cols.concat([
    {
      ...triggerDateColumn(model),
      key: "START",
      name: "start",
    },
    {
      ...growthColumn(model.settings),
      key: "GROWTH",
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
        key: "GROWS_WITH_CPI",
        name: "grows with CPI",
      },
      {
        ...defaultColumn,
        key: "LIABILITY",
        name: "tax Liability",
      },
      {
        ...cashValueColumn,
        key: "PURCHASE_PRICE",
        name: "purchase price",
      },
    ]);
  }
  cols = cols.concat([
    {
      ...defaultColumn,
      key: "CATEGORY",
      name: "category",
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
  GROWTH: string;
  START: string;
  VALUE: string;
  QUANTITY: string;
  LIABILITY: string;
  PURCHASE_PRICE: string;
  GROWS_WITH_CPI: string;
  IS_A_DEBT: string;
  CAN_BE_NEGATIVE: string;
  TODAYSVALUE: string;
}

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
) {
  return (
    <div
      style={{
        display: "block",
      }}
    >
      <fieldset>
        <div className="dataGridAssets">
          <DataGridFinKitty
            tableID={tableID}
            handleGridRowsUpdated={function (...args: any[]) {
              return handleAssetGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                rowData,
                parentCallbacks.submitAsset,
                parentCallbacks.attemptRename,
                parentCallbacks.refreshData,
                args,
              );
            }}
            rows={rowData}
            columns={getAssetOrDebtCols(model, isDebt, parentCallbacks)}
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
        obj.FROM === "" &&
        (fromValueEntry === "0" || fromValueEntry === "0.0")
      ) {
        fromValueEntry = "";
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
      if (obj.TO === "" && (toValueEntry === "0" || toValueEntry === "0.0")) {
        toValueEntry = "";
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

function makeTransactionCols(
  model: ModelData,
  type: string,
  parentCallbacks: ViewCallbacks,
) {
  let cols: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */

    faveColumn(
      (name: string) => {
        const completeName = getTransactionName(name, type);
        return parentCallbacks.deleteTransaction(completeName);
      }, // needs getTransactionName see above
      (name: string, value: number) => {
        const completeName = getTransactionName(name, type);
        return parentCallbacks.setEraTransaction(completeName, value);
      }, // needs getTransactionName see above
      "transactionDefTable",
    ),
    {
      ...defaultColumn,
      key: "NAME",
      name: "name",
    },
  ];
  if (type === payOffDebt) {
    cols = cols.concat([
      {
        ...triggerDateColumn(model),
        key: "DATE",
        name: "payments start date",
      },
    ]);
  } else {
    cols = cols.concat([
      {
        ...triggerDateColumn(model),
        key: "DATE",
        name: "date",
      },
    ]);
  }
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
        key: "FROM_VALUE",
        name: "amount",
      },
    ]);
  } else {
    // not revalues, not paying off debts,
    // default behaviour for FROM, FROM_VALUE
    // display
    cols = cols.concat([
      {
        ...defaultColumn,
        width: 200,
        key: "FROM",
        name: "coming from",
      },
      {
        ...defaultColumn,
        key: "FROM_VALUE",
        name: "from amount",
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
        key: "TO",
        name: "income",
      },
      {
        ...ToFromValueColumn,
        key: "TO_VALUE",
        name: "new value",
      },
    ]);
  } else if (type === revalueExp) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "TO",
        name: "expense",
      },
      {
        ...ToFromValueColumn,
        key: "TO_VALUE",
        name: "new value",
      },
    ]);
  } else if (type === revalueAsset) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "TO",
        name: "asset",
      },
      {
        ...defaultColumn,
        key: "TO_VALUE",
        name: "new value",
      },
    ]);
  } else if (type === revalueDebt) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "TO",
        name: "debt",
      },
      {
        ...defaultColumn,
        key: "TO_VALUE",
        name: "new value",
      },
    ]);
  } else if (type === revalueSetting) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "TO",
        name: "setting",
      },
      {
        ...defaultColumn,
        key: "TO_VALUE",
        name: "new value",
      },
    ]);
  } else {
    // all other kinds of transaction
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "TO",
        name: "going to",
      },
      {
        ...ToFromValueColumn,
        key: "TO_VALUE",
        name: "to amount",
      },
    ]);
  }
  if (type !== autogen) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "RECURRENCE",
        name: "recurrence",
      },
    ]);
  }
  if (type !== payOffDebt) {
    cols = cols.concat([
      {
        ...triggerDateColumn(model),
        key: "STOP_DATE",
        name: "recurrence end date",
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
        key: "CATEGORY",
        name: "category",
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
) {
  if (contents.length === 0) {
    return <></>;
  }
  return collapsibleFragment(
    <div
      className={`dataGridTransactions${type}`}
      style={{
        display: "block",
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
        handleGridRowsUpdated={function (...args: any[]) {
          return handleTransactionGridRowsUpdated(
            model,
            parentCallbacks.showAlert,
            doChecks,
            contents,
            parentCallbacks.submitTransaction,
            parentCallbacks.attemptRename,
            parentCallbacks.refreshData,
            args,
          );
        }}
        rows={contents}
        columns={makeTransactionCols(model, type, parentCallbacks)}
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
  );
}

export function debtsDivWithHeadings(
  model: ModelData,
  todaysDebtValues: Map<Asset, AssetOrDebtVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableIDEnding: string,
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
        ),
        "Debt definitions",
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueDebt,
        "Revalue debts",
        parentCallbacks,
        `debtRevals${tableIDEnding}`,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        payOffDebt,
        "Pay off debts",
        parentCallbacks,
        `payoffDebts${tableIDEnding}`,
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
        ),
        `Asset definition table`,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        liquidateAsset,
        "Liquidate assets to keep cash afloat",
        parentCallbacks,
        `liquidateAssets${tableIDEnding}`,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueAsset,
        "Revalue assets",
        parentCallbacks,
        `assetsRevals${tableIDEnding}`,
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
) {
  return (
    <div
      style={{
        display: "block",
      }}
    >
      <fieldset>
        <div className="dataGridTriggers">
          <DataGridFinKitty
            tableID={tableID}
            handleGridRowsUpdated={function (...args: any[]) {
              return handleTriggerGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                trigData,
                parentCallbacks.submitTrigger,
                parentCallbacks.attemptRename,
                parentCallbacks.refreshData,
                args,
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
              faveColumn(
                parentCallbacks.deleteTrigger,
                parentCallbacks.setEraTrigger,
                "triggerDefTable",
              ),
              {
                ...defaultColumn,
                key: "NAME",
                name: "name",
              },
              {
                ...triggerDateColumn(model),
                width: 'auto',
                key: "DATE",
                name: "date",
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
    faveColumn(
      parentCallbacks.deleteIncome,
      parentCallbacks.setEraIncome,
      "incomeDefTable",
    ),
    {
      ...defaultColumn,
      key: "NAME",
      name: "name",
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    columns = columns.concat([
      {
        ...cashValueColumn,
        key: "TODAYSVALUE",
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
      key: "VALUE",
      name: "value definition",
    },
    {
      ...triggerDateColumn(model),
      key: "VALUE_SET",
      name: "definition date",
    },
    {
      ...triggerDateColumn(model),
      key: "START",
      name: "start",
    },
    {
      ...triggerDateColumn(model),
      key: "END",
      name: "end",
    },
    {
      ...defaultColumn,
      key: "GROWS_WITH_CPI",
      name: "grows with CPI",
    },
    {
      ...defaultColumn,
      key: "LIABILITY",
      name: "tax Liability",
    },
    {
      ...defaultColumn,
      key: "RECURRENCE",
      name: "recurrence",
    },
    {
      ...defaultColumn,
      key: "CATEGORY",
      name: "category",
    },
  ]);
  return (
    <div
      style={{
        display: "block",
      }}
    >
      <fieldset>
        <div className="dataGridIncomes">
          <DataGridFinKitty
            tableID={tableID}
            handleGridRowsUpdated={function (...args: any[]) {
              return handleIncomeGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                incData,
                parentCallbacks.submitIncome,
                parentCallbacks.attemptRename,
                parentCallbacks.refreshData,
                args,
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
    incomesTableDiv(model, incData, doChecks, parentCallbacks, "incomesTable"),
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
) {
  let cols: any[] = [
    /*
    {
      ...defaultColumn,
      key: 'index',
      name: 'index',
    },
    */
    faveColumn(
      parentCallbacks.deleteExpense,
      parentCallbacks.setEraExpense,
      "expenseDefTable",
    ),
    {
      ...defaultColumn,
      key: "NAME",
      name: "name",
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...cashValueColumn,
        key: "TODAYSVALUE",
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
      key: "VALUE",
      name: "value definition",
    },
    {
      ...triggerDateColumn(model),
      key: "VALUE_SET",
      name: "definition date",
    },
    {
      ...triggerDateColumn(model),
      key: "START",
      name: "start",
    },
    {
      ...triggerDateColumn(model),
      key: "END",
      name: "end",
    },
    {
      ...defaultColumn,
      key: "GROWS_WITH_CPI",
      name: "grows with CPI",
    },
    {
      ...defaultColumn,
      key: "RECURRENCE",
      name: "recurrence",
    },
    {
      ...defaultColumn,
      key: "CATEGORY",
      name: "category",
    },
  ]);
  return (
    <div
      style={{
        display: "block",
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
            handleGridRowsUpdated={function (...args: any[]) {
              return handleExpenseGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                expData,
                parentCallbacks.submitExpense,
                parentCallbacks.attemptRename,
                parentCallbacks.refreshData,
                args,
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
    ),
    `Expense definitions`,
  );
}

// e.g. scaleFrom1m('1y') = 12
function scaleFrom1m(
  recur: string,
) {
  let scale = 1.0;
  const parsed = getNumberAndWordParts(recur);
  if (parsed.numberPart === undefined) {
    return NaN;
  } else {
    scale = parsed.numberPart;
  }
  if (parsed.wordPart === 'w') {
    scale *= 12/52;
  } else if (parsed.wordPart === 'y') {
    scale *= 12;
  } else if (parsed.wordPart !== 'm') {
    scale = NaN;
  }
  // console.log(`scaleFrom1m(${recur}) = ${scale}`);
  return scale;
}

// if we add up colMonths monthly contributions,
// what should we scale up by to get an annual estimate?
function getScale(obj: Expense, colMonths: string[]){
  // e.g. scaleFrom1m('1y') = 12
  // and if we have two columns,
  // we divide by 2
  //      and return 6.
  return scaleFrom1m(obj.RECURRENCE)/colMonths.length;
}

function expenseMonitoringForTable(
  model: ModelData,
  expensesChartData: ChartData,
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
  colMonths: string[],
  todaysValues: Map<Expense, ExpenseVal>,
  parentCallbacks: ViewCallbacks,
) {
  const v = getVarVal(model.settings);

  const startMonitorSetting = getSettings(model.settings, monitorStart, "noneFound", false);
  const endMonitorSetting = getSettings(model.settings, monitorEnd, "noneFound", false);

  const startMonitorDate = new Date(`01 ${startMonitorSetting}`);
  const endMonitorDate = new Date(`01 ${endMonitorSetting}`);

  const expenseMonitorDetailsRows = model.expenses
    .filter((e: Expense) => {
      let hasStarted = true;
      let hasEnded = false;
      const startDate = checkTriggerDate(e.START, model.triggers, v);
      if (startDate !== undefined && startDate > endMonitorDate) {
        hasStarted = false;
      }
      const endDate = checkTriggerDate(e.END, model.triggers, v);
      if (endDate !== undefined && endDate < startMonitorDate) {
          hasEnded = true;
      }
      return hasStarted && ! hasEnded;
    })
    .map((exp: Expense) => {
      let todaysVForTable = 0.0;
      const todaysValkey = [...todaysValues.keys()].find((e) => {
        return e.NAME === exp.NAME;
      });

      const todaysV = todaysValkey ? todaysValues.get(todaysValkey) : undefined;
      if (todaysV !== undefined) {
        if (!todaysV.hasEnded) {
          todaysVForTable = todaysV.expenseVal;
        }
      }
      let mapResult: any = {
        NAME: exp.NAME,
        ERA: exp.ERA,
        RECURRENCE: exp.RECURRENCE,
        TODAYSVALUE: `${todaysVForTable}`,
      };
      const monitor = model.monitors.find((m) => {
        return m.NAME === exp.NAME;
      });
      const monitorVals = monitor ? monitor.VALUES : [];
      let sumOfMonitorValues: number|undefined = 0.0;
      for (const colMonth of colMonths) {
        const val = monitorVals.find((v) => {
          return v.MONTH === colMonth;
        });
        if (val !== undefined && sumOfMonitorValues !== undefined && val.EXPRESSION !== '') {
          try{
            const x = evaluate(val.EXPRESSION);
            if (!isNaN(x)) {
              sumOfMonitorValues += x;
            } else {
              sumOfMonitorValues = undefined;
            }
            // console.log(`after adding '${val.EXPRESSION}', sum = ${sum}`)
          } catch (error) {
            sumOfMonitorValues = undefined;
          }  
        }
        const object: any = {}
        object[colMonth] = val ? val.EXPRESSION : '0.0';

        mapResult = {...mapResult, ...object};
      }
      mapResult = {
        ...mapResult,
        item: exp,
        sum: sumOfMonitorValues,
        RECURRENT_SPEND: (sumOfMonitorValues !== undefined) 
          ? `${sumOfMonitorValues * getScale(exp, colMonths)}`
          : '',
      };
      return mapResult;
    });
  // console.log(`expenseMonitorDetailsRows[0] = ${showObj(expenseMonitorDetailsRows[0])}`);
  
  const summaryRows: any = [];
  for (const detailRow of expenseMonitorDetailsRows) {
    const summaryKey = detailRow.item.CATEGORY === '' ? detailRow.item.NAME : detailRow.item.CATEGORY;
    let matchingSummaryRow = summaryRows.find((r: any) => {
      return r.key === summaryKey;    
    });
    // console.log(`matchingSummaryRow = ${showObj(matchingSummaryRow)}`);

    if (matchingSummaryRow === undefined) {
      // console.log(`1 scale ${ui.TODAYSVALUE} by ${getScale(ui.item, colMonths)}`);
      matchingSummaryRow = {
        key: summaryKey,
        count: 1,
        actualSpend: detailRow.sum,
        // if we have two months showing, expect to scale up by 6 ui.TODAYSVALUE
        predictedExpense: detailRow.TODAYSVALUE / getScale(detailRow.item, colMonths),
      }
      summaryRows.push(matchingSummaryRow);
      // console.log(`summaryRows = ${showObj(summaryRows)}`);
    } else {
      // console.log(`2 scale ${ui.TODAYSVALUE} by ${getScale(ui.item, colMonths)}`);
      matchingSummaryRow.count += 1;
      matchingSummaryRow.actualSpend += detailRow.sum;
      // if we have two months showing, expect to double ui.TODAYSVALUE
      matchingSummaryRow.predictedExpense += detailRow.TODAYSVALUE / getScale(detailRow.item, colMonths);
    }
  }
  // console.log(`summaryRows = ${showObj(summaryRows)}`);

  if (colMonths[colMonths.length - 1].startsWith('Jan ')) {
    const colMonth = colMonths[colMonths.length - 1];
    const year = colMonth.substring(colMonth.length - 4, colMonth.length);
    const planningTableData = getPlanningTableData(
      expensesChartData,
      planningExpensesChartData,
      planningAssetsChartData,
      reportData,
    );

    for (const summaryRow of summaryRows) {
      const summaryKey = summaryRow.key;
      
      // console.log(`colMonths[colMonths.length - 1] = ${colMonths[colMonths.length - 1]}`);
      // console.log(`summaryKey = ${inspect(summaryKey)}`);
      if (summaryKey === 'Basic' || summaryKey === 'Leisure') {
        const tRow = planningTableData.find((td) => {
          // Look for match
          //colMonths[colMonths.length - 1] = Jan 2024 
          //td.DATE = Tue Dec 31 2024
          return td.DATE.endsWith(year);
        });
        let budget = 0;
        if (tRow) {
          // console.log(`${inspect(tRow)}`);
          if (summaryKey === 'Basic') {
            budget = parseFloat(tRow.PBBASIC);
          } else if (summaryKey === 'Leisure') {
            budget = parseFloat(tRow.PBLEISURE);
          }

          const winnings = model.transactions.filter((t) => {
            if (!t.DATE.endsWith(year)) {
              // console.log(`wrong year ${inspect(t)}`)
              return false;
            }
            if (!t.NAME.includes('Winnings')){
              // console.log(`not Winnings ${inspect(t.NAME)}`)
              return false;
            }
            // console.log(`consider ${inspect(t.NAME)}`)
            if (t.TO !== `PremiumBonds${summaryKey}`){
              // console.log(`not PB for ${summaryKey} ${inspect(t.NAME)} ${inspect(t.TO)}`)
              return false;
            }
            return true
          });
          winnings.map((t) => {
            //console.log(`winnings transaction ${inspect(t)}`);
            // console.log(`budget adjusts for winnings, add ${inspect(t.TO_VALUE)}`);
            budget += parseFloat(t.TO_VALUE);
            console.log(`new budget is ${budget}`);
          })
        }
        summaryRow.allowedBudget = budget;
      } else {
        const monitor = model.monitors.find((m) => {
          return m.NAME === `${summaryKey}Budget`;
        });
        if (!monitor) {
          break;
        }
        
        const monitorVals = monitor ? monitor.VALUES : [];
        const val = monitorVals.find((v) => {
          return v.MONTH === colMonths[colMonths.length - 1];
        });
        if (!val) {
          break;
        }

        summaryRow.allowedBudget = val.EXPRESSION;
      }
    }
  }
  summaryRows.sort((a: {key:string}, b: {key:string}) => {
    if (a.key > b.key) {
      return 1;
    } else if (a.key < b.key) {
      return -1;
    } else {
      return 0;
    } 
  })
  //console.log(`summaryRows = ${inspect(summaryRows)}`);
  return {
    detailed: addIndices(expenseMonitorDetailsRows.filter((obj: any) => {
      return (
        parentCallbacks.filterForEra(obj.item) &&
        parentCallbacks.filterForSearch(obj.item)
      );
    })),
    summary: addIndices(summaryRows),
  }
}

function expensesMonitoringSummaryTableDiv(
  model: ModelData,
  expDataSummary: any[],
  colDates: string[],
  tableID: string,
) {
  return (
    <div
      style={{
        display: "block",
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
      <h4>Summary from {colDates[colDates.length - 1]} to {colDates[0]}</h4>
      <div className="dataGridExpensesSummary">
          <DataGridFinKitty
            tableID={tableID}
            rows={expDataSummary.map((r)=>{
              return {
                index: r.index,
                key: r.key,
                actualSpend: `${r.actualSpend}`,
                predictedExpense: `${r.predictedExpense}`,
              }
            })}
            columns={[
              {
                ...defaultColumn,
                key: 'key',
                name: 'category',
                renderEditCell: undefined,
              },
              // SUMMARY TABLE
              // The "actual expense" column here for Basic category is the sum of the 
              // Basic expenses in the Details table
              // for the time period displayed
              {
                ...cashExpressionColumn,
                key: 'actualSpend',
                name: 'actual spend',
                renderEditCell: undefined,
              },
              // SUMMARY TABLE
              // The "predicted expense" is the total amount we expect to pay from the 
              // modelled Expenses data
              // for the time period displayed
              {
                ...cashExpressionColumn,
                key: 'predictedExpense',
                name: 'predicted expense',
                renderEditCell: undefined,
              },
            ]}
            model={model}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

function expensesMonitoringYearSummaryTableDiv(
  model: ModelData,
  expDataSummary: any[],
  colDates: string[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableID: string,
) {
  const rows = expDataSummary.map((r)=>{
    return {
      index: r.index,
      key: r.key,
      actualSpend: `${r.actualSpend}`,
      allowedBudget: `${r.allowedBudget}`,
      remainingBudget: `${parseFloat(r.allowedBudget) - parseFloat(r.actualSpend)}`,
      proportion: 
        (r.allowedBudget && r.allowedBudget) > 0 ? 
        `${Math.round((r.actualSpend / r.allowedBudget) * 100)}` : 
        ''
    }
  });
  return (
    <div
      style={{
        display: "block",
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
      <h4>Summary from {colDates[colDates.length - 1]} to {colDates[0]}</h4>
      <div className="dataGridExpensesSummary">
          <DataGridFinKitty
            tableID={tableID}
            rows={rows}
            handleGridRowsUpdated={function (...args: any[]) {
              return handleBudgetGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                rows,
                colDates[colDates.length - 1],
                parentCallbacks.submitMonitor,
                parentCallbacks.refreshData,
                args,
              );
            }}
            columns={[
              {
                ...defaultColumn,
                key: 'key',
                name: 'category',
                renderEditCell: undefined,
              },
              // SUMMARY TABLE
              // The "actual expense" column here for Basic category is the sum of the 
              // Basic expenses in the Details table
              // for the time period displayed
              {
                ...cashExpressionColumn,
                key: 'actualSpend',
                name: 'actual spend',
                renderEditCell: undefined,
              },
              // SUMMARY TABLE
              {
                ...cashExpressionColumn,
                key: 'allowedBudget',
                name: 'allowed budget',
                renderEditCell: textEditor,
              },
              {
                ...cashExpressionColumn,
                key: 'remainingBudget',
                name: 'remaining budget',
                renderEditCell: textEditor,
              },
              {
                ...pcColumn,
                key: 'proportion',
                name: 'proportion spent',
                renderEditCell: undefined,
              },
            ]}
            model={model}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

function expensesMonitoringDetailTableDiv(
  model: ModelData,
  expDataDetails: any[],
  colDates: string[],
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableID: string,
) {

  let cols: any[] = [
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
      renderEditCell: undefined,
    },
    {
      ...cashValueColumn,
      key: "TODAYSVALUE",
      name: `current cost`,
      renderEditCell: undefined,
    },
    {
      ...defaultColumn,
      key: "RECURRENCE",
      name: "freq",
      renderEditCell: undefined,
    },
    // DETAILS TABLE
    // The "spent" column here is the average of the values in 
    // later displayed columns, averaged using the frequency of the expense
    {
      ...cashValueColumn,
      key: "RECURRENT_SPEND",
      name: "current spend",
      renderEditCell: undefined,
      renderCell(props: any) {
        // log(`in formatter, JSON.stringify(props) = ${JSON.stringify(props)}`);
        const val = props.row[props.column.key];
   
        const budgetParsed = isNumber(props.row['TODAYSVALUE']);
        const valParsed = isNumber(val);
        let highlightLow = false;
        let highlightHigh = false;
        if (budgetParsed.checksOK && valParsed.checksOK) {
          if (valParsed.value > 1.1 * budgetParsed.value) {
            //console.log(`highlightHigh ${props.row['TODAYSVALUE']}, ${val}`);
            highlightHigh = true;
          } else if (valParsed.value < 0.9 * budgetParsed.value) {
            //console.log(`highlightLow  ${props.row['TODAYSVALUE']}=${budgetParsed.value}, ${val}=${valParsed.value}`);
            highlightLow = true;
          } else {
            // console.log(`highlightNone ${props.row['TODAYSVALUE']}, ${val}`);
          }
        } else {
          console.log(`can't compare as numbers ${props.row['TODAYSVALUE']}, ${val}`);
        }

        if (highlightHigh) {
          return <CashExpressionFormatter name={props.column.name} value={val} highlightColor="red"/>;
        } else if (highlightLow) {
          return <CashExpressionFormatter name={props.column.name} value={val} highlightColor="green"/>;
        } else {
          return <CashExpressionFormatter name={props.column.name} value={val}/>;
        }
      },
    },
  ];
  colDates.map((cd) => {
    cols = cols.concat(
      {
        ...cashExpressionColumn,
        key: cd,
        name: cd,
      },
  
    )
  })
  // console.log(`colDates[0] = ${inspect(colDates[0])}`);

  return (
    <div
      style={{
        display: "block",
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
        <h4>Details from {colDates[colDates.length - 1]} to {colDates[0]}</h4>
        <div className="dataGridExpenses">
          <DataGridFinKitty
            tableID={tableID}
            handleGridRowsUpdated={function (...args: any[]) {
              return handleMonitoringGridRowsUpdated(
                model,
                parentCallbacks.showAlert,
                doChecks,
                expDataDetails,
                parentCallbacks.submitMonitor,
                parentCallbacks.refreshData,
                args,
              );
            }}
            rows={expDataDetails}
            columns={cols}
            model={model}
          />
        </div>
        <p />
      </fieldset>
    </div>
  );
}

function makeMonitoringColMonthsFromStartEnd(
  start: string, // e.g. "Jan 2024"
  end: string, // e.g. "May 2024"
) {
  let months: string[] = [];

  const dates = generateSequenceOfDates(
    {
      start: new Date(`01 ${start}`),
      end: new Date(`01 ${end}`),
    }, 
    '1m', 
    false);
  // console.log(`dates = ${dates}`);
  months = dates.map((d) => {
    return dateFormat(d, 'mmm yyyy');
  }).reverse();
 return months;
}


function makeMonitoringColMonths(
  model: ModelData,
) {
  let months: string[] = [];

  const start = getSettings(model.settings, monitorStart, "noneFound", false);
  const end = getSettings(model.settings, monitorEnd, "noneFound", false);
  if (start !== "noneFound" && end !== "noneFound") {
    months = makeMonitoringColMonthsFromStartEnd(start, end);
  }
  return months;
}

export function expensesMonitoringDivWithHeading(
  model: ModelData,
  expensesChartData: ChartData,
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
  todaysValues: Map<Expense, ExpenseVal>,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
  tableIDEnding: string,
) {
  // console.log(`monitors are ${showObj(model.monitors)}`);
  const colDatesForSettingTimeframe = makeMonitoringColMonths(model);
  const expDataForSettingTimeframe = expenseMonitoringForTable(
    model, 
    expensesChartData,
    planningExpensesChartData, // for Basic and Leisure for Planning
    planningAssetsChartData, // for maturing Bonds for Planning
    reportData,
    colDatesForSettingTimeframe,
    todaysValues, 
    parentCallbacks,
  );
  if (expDataForSettingTimeframe.detailed.length === 0) {
    return <>No data</>;
  }

  const colDatesFor2024 = makeMonitoringColMonthsFromStartEnd('Jan 2024', 'Jan 2025');
  const expDataFor2024 = expenseMonitoringForTable(
    model, 
    expensesChartData,
    planningExpensesChartData, // for Basic and Leisure for Planning
    planningAssetsChartData, // for maturing Bonds for Planning
    reportData,
    colDatesFor2024,
    todaysValues, 
    parentCallbacks,
  );

  const colDatesFor2025 = makeMonitoringColMonthsFromStartEnd('Jan 2025', 'Jan 2026');
  const expDataFor2025 = expenseMonitoringForTable(
    model, 
    expensesChartData,
    planningExpensesChartData, // for Basic and Leisure for Planning
    planningAssetsChartData, // for maturing Bonds for Planning
    reportData,
    colDatesFor2025,
    todaysValues, 
    parentCallbacks,
  );

  return collapsibleFragment(
    <>
      <Button
        onClick={() => {
          const start = getSettings(model.settings, monitorStart, "noneFound", false);
          const end = getSettings(model.settings, monitorEnd, "noneFound", false);
          if (start !== "noneFound" && end !== "noneFound") {
            const startDate = new Date(`01 ${start}`);
            const endDate = new Date(`01 ${end}`);
            startDate.setMonth(startDate.getMonth() + 1);
            endDate.setMonth(endDate.getMonth() + 1);
            parentCallbacks.editSetting(
              {
                NAME: monitorStart,
                ERA: 0,
                VALUE: dateFormat(startDate, 'mmm yyyy'),
                HINT: '',
              },
            );
            parentCallbacks.editSetting(
              {
                NAME: monitorEnd,
                ERA: 0,
                VALUE: dateFormat(endDate, 'mmm yyyy'),
                HINT: '',
              },
            );
          }
        }}
        variant={`outline-primary`}
        id="btn-advance-monitor"
        key="btn-advance-monitor"
      >
        Advance 1 month
      </Button>
      {expensesMonitoringYearSummaryTableDiv(
        model,
        expDataFor2025.summary,
        colDatesFor2025,
        doChecks,
        parentCallbacks,
        `expensesSummary${tableIDEnding}2025`,
      )}

      {expensesMonitoringDetailTableDiv(
        model,
        expDataForSettingTimeframe.detailed,
        colDatesForSettingTimeframe,
        doChecks,
        parentCallbacks,
        `expensesDetails${tableIDEnding}`,
      )}

      {expensesMonitoringYearSummaryTableDiv(
        model,
        expDataFor2024.summary,
        colDatesFor2024,
        doChecks,
        parentCallbacks,
        `expensesSummary${tableIDEnding}2024`,
      )}

    </>,
    `Expense monitoring`,
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
    faveColumn(
      parentCallbacks.deleteSetting,
      parentCallbacks.setEraSetting,
      "settingDefTable",
    ),
    {
      ...defaultColumn,
      key: "NAME",
      name: "name",
    },
  ];
  if (parentCallbacks.doShowTodaysValueColumns()) {
    cols = cols.concat([
      {
        ...defaultColumn,
        key: "TODAYSVALUE",
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
      ...defaultColumn,
      key: "VALUE",
      name: "defining value",
    },
    {
      ...defaultColumn,
      key: "HINT",
      name: "hint",
    },
  ]);
  return (
    <DataGridFinKitty
      tableID={tableID}
      handleGridRowsUpdated={function (...args: any[]) {
        return handleSettingGridRowsUpdated(
          model,
          parentCallbacks.showAlert,
          doChecks,
          constSettings,
          parentCallbacks.refreshData,
          parentCallbacks.editSetting,
          parentCallbacks.attemptRename,
          args,
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
) {
  if (adjustSettings.length === 0) {
    return;
  }
  return (
    <DataGridFinKitty
      tableID={tableID}
      handleGridRowsUpdated={function (...args: any[]) {
        return handleSettingGridRowsUpdated(
          model,
          parentCallbacks.showAlert,
          doChecks,
          adjustSettings,
          parentCallbacks.refreshData,
          parentCallbacks.editSetting,
          parentCallbacks.attemptRename,
          args,
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
        faveColumn(
          parentCallbacks.deleteSetting,
          parentCallbacks.setEraSetting,
          "settingAdjustTable",
        ),
        {
          ...defaultColumn,
          key: "NAME",
          name: "name",
        },
        // parentCallbacks.doShowTodaysValueColumns()...
        {
          ...defaultColumn,
          key: "TODAYSVALUE",
          name: `value\nat ${dateAsString(
            DateFormatType.View,
            getTodaysDate(model),
          )}`,
          renderEditCell: undefined,
        },
        {
          ...defaultColumn,
          key: "VALUE",
          name: "defining value",
        },
        {
          ...defaultColumn,
          key: "HINT",
          name: "hint",
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
        "customSettingsTable",
      )}
      {adjustSettingsTable(
        model,
        adjustSettings,
        doChecks,
        parentCallbacks,
        "adjustableSettingsTable",
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
) {
  const contents = settingsForTable(
    model,
    todaysValues,
    (s) => {
      return s.TYPE === viewType;
    },
    parentCallbacks,
  );
  return (
    <div
      className="dataGridSettings"
      style={{
        display: "block",
      }}
    >
      {collapsibleFragment(
        <DataGridFinKitty
          tableID={`settings${tableIDEnding}`}
          handleGridRowsUpdated={function (...args: any[]) {
            return handleSettingGridRowsUpdated(
              model,
              parentCallbacks.showAlert,
              doChecks,
              contents,
              parentCallbacks.refreshData,
              parentCallbacks.editSetting,
              parentCallbacks.attemptRename,
              args,
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
            faveColumn(
              parentCallbacks.deleteSetting,
              parentCallbacks.setEraSetting,
              "settingTableDiv",
            ),
            {
              ...defaultColumn,
              key: "NAME",
              name: "name",
            },
            {
              ...defaultColumn,
              key: "VALUE",
              name: "defining value",
            },
            {
              ...defaultColumn,
              key: "HINT",
              name: "hint",
            },
          ]}
          model={model}
        />,
        `Settings about the view of the model`,
      )}
      {settingsTables(model, todaysValues, doChecks, parentCallbacks)}
      {transactionFilteredTable(
        model,
        doChecks,
        revalueSetting,
        "Revalue settings",
        parentCallbacks,
        "settingsRevalsTable",
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
    .filter((d) => {
      return d.name !== "Estate final value";
    })
    .map((x) => {
      const make2dpCanBeUndefined: (input: number | undefined) => string = (
        input,
      ) => {
        return input ? makeTwoDP(input) : "";
      };
      const makeQCanBeUndefined: (input: number | undefined) => string = (
        input,
      ) => {
        return input ? `${input}` : "";
      };
      return {
        DATE: x.date,
        NAME: x.name,
        CHANGE: make2dpCanBeUndefined(x.change),
        OLD_VALUE: make2dpCanBeUndefined(x.oldVal),
        NEW_VALUE: make2dpCanBeUndefined(x.newVal),
        QCHANGE: x.qchange ? x.qchange : "",
        QOLD_VALUE: makeQCanBeUndefined(x.qoldVal),
        QNEW_VALUE: makeQCanBeUndefined(x.qnewVal),
        SOURCE: x.source,
      };
    });
    unindexedResult.reverse();

  //console.log(`unindexed dates = ${
  //  unindexedResult.map((uir) => {
  //    return new Date(uir.DATE).toDateString();
  //  })}`)

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
      {filtersList(
        itemsForFilterButtons,
        viewSettings,
        context,
        true,
        refreshData,
      )}
      <ReportMatcherForm
        reportMatcher={reportMatcher}
        setReportKey={setReportKey}
        maxReportSize={maxReportSize}
        reportIncludesSettings={reportIncludesSettings}
        reportIncludesExpenses={reportIncludesExpenses}
      />
      <DataGridFinKitty
        tableID={tableID}
        rows={reportDataTable}
        colSortIndex="index"
        sortDirection="DESC"
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
            ...defaultColumn,
            key: "NAME",
            name: "name",
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: "SOURCE",
            name: "source",
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: "CHANGE",
            name: "change",
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: "OLD_VALUE",
            name: "old value",
            renderEditCell: undefined,
          },
          {
            ...cashValueColumn,
            key: "NEW_VALUE",
            name: "new value",
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: "QCHANGE",
            name: "quantity change",
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: "QOLD_VALUE",
            name: "old quantity",
            renderEditCell: undefined,
          },
          {
            ...defaultColumn,
            key: "QNEW_VALUE",
            name: "new quantity",
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
) {
  // log(`calculate optimisation task for varVal = ${varVal}`);
  const tempModel = makeModelFromJSON(JSON.stringify(model));

  setSetting(tempModel.settings, "variable", `${varVal}`, custom);
  const evalResult = getEvaluations(tempModel, helper);
  const errorMsg = evalResult.reportData.find((d) => {
    return d.name === "Error from evaluations";
  });
  if (errorMsg !== undefined) {
    showAlert(errorMsg.source);
  }
  const estateVal = evalResult.reportData.find((d) => {
    return d.name === "Estate final value";
  });
  let textToDisplay = "unknown";
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

  const varSetting = getSettings(model.settings, "variable", "missing", false);
  if (varSetting === "missing") {
    alert(`optimiser needs a setting called 'variable'`);
    return noData;
  }
  if (!isNumberString(varSetting)) {
    alert(`optimiser needs a number setting called 'variable'`);
    return noData;
  }
  const varLowSetting = getSettings(
    model.settings,
    "variableLow",
    "missing",
    false,
  );
  if (varLowSetting === "missing") {
    alert(`optimiser needs a setting called 'variableLow'`);
    return noData;
  }
  if (!isNumberString(varLowSetting)) {
    alert(`optimiser needs a number setting called 'variableLow'`);
    return noData;
  }
  const varHighSetting = getSettings(
    model.settings,
    "variableHigh",
    "missing",
    false,
  );
  if (varHighSetting === "missing") {
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
    "variableCount",
    "missing",
    false,
  );
  if (varCountSetting !== "missing") {
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
      NAME: "optimisation result",
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
        VAR: `${cd.labels[i]}`,
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
            return s.TYPE === adjustableType && s.NAME.startsWith("variable");
          },
          parentCallbacks,
        ),
        true,
        parentCallbacks,
        "variableSettingsTable",
      )}
      <DataGridFinKitty
        tableID={tableID}
        rows={Array.from(Array(cd.labels.length).keys()).map((i) => {
          return {
            ...rows[i],
            index: i,
          };
        })}
        columns={[
          {
            ...defaultColumn,
            key: "VAR",
            name: "variable",
            renderEditCell: undefined,
          },
          {
            ...cashValueColumn,
            key: "ESTATE",
            name: "estate",
            renderEditCell: undefined,
          },
        ]}
        model={model}
      />
      {makeContainedBarChart(cd, chartSettings, settings)}
    </div>
  );
}
