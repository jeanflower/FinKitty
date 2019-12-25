import React, { Component } from 'react';
import CanvasJSReact from './assets/js/canvasjs.react';
import { makeChartData } from './charting';
import {
  checkAsset,
  checkData,
  checkExpense,
  checkIncome,
  checkTransaction,
  checkTrigger,
} from './checks';
import {
  deleteAllAssets,
  deleteAllExpenses,
  deleteAllIncomes,
  deleteAllSettings,
  deleteAllTables,
  deleteAllTransactions,
  deleteAllTriggers,
  deleteAsset,
  deleteExpense,
  deleteIncome,
  deleteSetting,
  deleteTransaction,
  deleteTrigger,
  ensureDbTables,
  getDbModel,
  getDbModelNames,
  submitIDbAssets,
  submitIDbExpenses,
  submitIDbIncomes,
  submitIDbSettings,
  submitIDbTransactions,
  submitIDbTriggers,
  setupDDB,
  submitIDbModel,
} from './database/dynamo';
import { sampleModel } from './models/sampleData';
// } from './models/outsideGit/RealData';
import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';
import { AddDeleteExpenseForm } from './reactComponents/AddDeleteExpenseForm';
import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import { AddDeleteTransactionForm } from './reactComponents/AddDeleteTransactionForm';
import { AddDeleteTriggerForm } from './reactComponents/AddDeleteTriggerForm';
import Button from './reactComponents/Button';
import DataGrid from './reactComponents/DataGrid';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';
/*
import {
  IReactVisChartPoint,
} from './reactComponents/ReactVisExample';
*/
import {
  allItems,
  assetChartAdditions,
  assetChartDeltas,
  assetChartHint,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  CASH_ASSET_NAME,
  coarse,
  expenseChartFocus,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusHint,
  assetChartFocus,
  assetChartFocusHint,
  taxPot,
  viewDetail,
  viewDetailHint,
  sampleModelName,
} from './stringConstants';
import {
  ChartData,
  DataForView,
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
  DbTrigger,
  ItemChartData,
} from './types/interfaces';
import {
  getSettings,
  log,
  makeBooleanFromYesNo,
  makeYesNoFromBoolean,
  printDebug,
  showObj,
  makeValueAbsPropFromString,
  makeStringFromValueAbsProp,
  makeCashValueFromString,
  makeGrowthFromString,
  makeStringFromGrowth,
  makePurchasePriceFromString,
  makeStringFromPurchasePrice,
  makeDateFromString,
  makeModelFromJSON,
} from './utils';
import ToFromValueFormatter from './reactComponents/ToFromValueFormatter';
import TriggerDateFormatter from './reactComponents/TriggerDateFormatter';
import GrowthFormatter from './reactComponents/GrowthFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';
// import './bootstrap.css'

const { CanvasJSChart } = CanvasJSReact;

export let modelName: string = sampleModelName;

interface ViewType {
  lc: string;
}
const homeView: ViewType = { lc: 'Home' };
const expensesView: ViewType = { lc: 'Expenses' };
const incomesView: ViewType = { lc: 'Incomes' };
const transactionsView: ViewType = { lc: 'Transactions' };
const assetsView: ViewType = { lc: 'Assets' };
const triggersView: ViewType = { lc: 'Important dates' };
const settingsView: ViewType = { lc: 'Settings' };
const taxView: ViewType = { lc: 'Tax payments' };

const expensesChart: ViewType = { lc: 'Expenses chart' };
const incomesChart: ViewType = { lc: 'Incomes chart' };
const assetsChart: ViewType = { lc: 'Assets chart' };

const expensesTable: ViewType = { lc: 'Expenses table' };
const incomesTable: ViewType = { lc: 'Incomes table' };
const assetsTable: ViewType = { lc: 'Assets table' };
const transactionsTable: ViewType = { lc: 'Transactions table' };
const triggersTable: ViewType = { lc: 'Important dates table' };
const settingsTable: ViewType = { lc: 'Settings table' };

const overview: ViewType = { lc: 'Overview' };

const views = new Map<
  ViewType,
  {
    display: boolean;
    helpText: string;
  }
>([
  [
    homeView,
    {
      display: true,
      helpText: 'Create or load a model',
    },
  ],
  [
    overview,
    {
      display: true,
      helpText: 'Overview',
    },
  ],
  [
    triggersView,
    {
      display: true,
      helpText: 'Create, view or update important dates',
    },
  ],
  [
    incomesView,
    {
      display: true,
      helpText: 'Create, view or edit incomes',
    },
  ],
  [
    expensesView,
    {
      display: true,
      helpText: 'Create, view or edit expenses',
    },
  ],
  [
    assetsView,
    {
      display: true,
      helpText: 'Create, view or edit assets',
    },
  ],
  [
    transactionsView,
    {
      display: true,
      helpText: 'Create, view or edit transactions',
    },
  ],
  [
    taxView,
    {
      display: true,
      helpText: 'Chart of tax payments',
    },
  ],
  [
    settingsView,
    {
      display: true,
      helpText: 'Settings',
    },
  ],
]);

const showContent = new Map<ViewType, any>([
  [incomesChart, { display: false }],
  [expensesChart, { display: false }],
  [assetsChart, { display: false }],
  [incomesTable, { display: true }],
  [expensesTable, { display: true }],
  [assetsTable, { display: true }],
  [transactionsTable, { display: true }],
  [triggersTable, { display: true }],
  [settingsTable, { display: true }],
]);

let reactAppComponent: App;

function getDisplay(type: ViewType) {
  const view = views.get(type);
  if (view === undefined) {
    console.log(`Error : unrecognised view ${type}`);
    return false;
  }
  const result = view.display;
  return result;
}
function makeJChartData(data: ItemChartData[]) {
  let chartData;
  if (data.length > 1) {
    chartData = data.map((x: ItemChartData) => ({
      dataPoints: x.chartDataPoints,
      name: x.item.NAME,
      type: 'stackedColumn',
      showInLegend: true,
    }));
  } else {
    chartData = data.map((x: ItemChartData) => ({
      dataPoints: x.chartDataPoints,
      name: x.item.NAME,
      type: 'stackedColumn',
      showInLegend: true,
      color: '#ff9933',
    }));
  }
  return chartData;
}
async function refreshData(goToDB = true) {
  // log('refreshData in App - get data and redraw content');
  if (goToDB) {
    // go to the DB to retreive updated data
    let modelNames: string[] = [];
    try {
      modelNames = await getDbModelNames();
    } catch (error) {
      alert('error contacting database');
      return;
    }

    //log(`modelNames are ${modelNames}`);
    if (
      modelNames.find(x => {
        return x === sampleModelName;
      }) === undefined
    ) {
      log(`recreate sample model`);
      // force us to have at least the sample model
      await ensureDbTables(sampleModelName);
      await submitIDbModel(sampleModel, sampleModelName);
      modelNames = await getDbModelNames();
    }

    const model = await getDbModel(modelName);

    // log(`got ${modelNames.length} modelNames`);

    model.triggers.sort((a, b) => (a.NAME < b.NAME ? -1 : 1));
    model.expenses.sort((a, b) => (a.NAME < b.NAME ? -1 : 1));
    model.settings.sort((a, b) => (a.NAME < b.NAME ? -1 : 1));
    model.incomes.sort((a, b) => (a.NAME < b.NAME ? -1 : 1));
    model.transactions.sort((a, b) => (a.NAME < b.NAME ? -1 : 1));
    model.assets.sort((a, b) => (a.NAME < b.NAME ? -1 : 1));
    modelNames.sort();

    if (
      model.assets.filter(a => {
        return a.NAME === taxPot;
      }).length === 0
    ) {
      model.assets.push({
        NAME: taxPot,
        START: '1 Jan 2017',
        VALUE: '0',
        GROWTH: '0',
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: false,
        LIABILITY: '',
        PURCHASE_PRICE: '0',
        CATEGORY: '',
      });
    }

    const result: DataForView = makeChartData(model);

    result.expensesData.sort((a, b) => (a.item.NAME < b.item.NAME ? 1 : -1));
    result.incomesData.sort((a, b) => (a.item.NAME < b.item.NAME ? 1 : -1));
    result.assetData.sort((a, b) => (a.item.NAME < b.item.NAME ? 1 : -1));
    result.taxData.sort((a, b) => (a.item.NAME < b.item.NAME ? 1 : -1));

    if (printDebug()) {
      result.assetData.forEach(entry => {
        log(
          `asset item ${showObj(entry.item)} has chart points ` +
            `${showObj(entry.chartDataPoints)}`,
        );
      });
    }

    // get the data out of the object we got back
    const { expensesData, incomesData, assetData, taxData } = result;

    if (printDebug()) {
      log('in refreshData');
      log(` expensesData = ${expensesData}`);
      log(` incomesData = ${incomesData}`);
      log(` assetData = ${assetData}`);
      log(` taxData = ${taxData}`);
    }

    const expensesChartData = makeJChartData(expensesData);
    const incomesChartData = makeJChartData(incomesData);
    const assetChartData = makeJChartData(assetData);
    const taxChartData = makeJChartData(taxData);

    if (reactAppComponent !== undefined) {
      // log(`go setState with modelNames = ${modelNames}`);

      // setState on a reactComponent triggers update of view
      reactAppComponent.setState(
        {
          modelData: model,
          expensesChartData,
          incomesChartData,
          assetChartData,
          taxChartData,
          modelNamesData: modelNames,
        },
        () => {
          // setState is async
          // do logging after setState using the 2nd argument
          // https://www.freecodecamp.org/news/get-pro-with-react-setstate-in-10-minutes-d38251d1c781/
          if (printDebug()) {
            log(
              'reactAppComponent.state.expensesChartDataValue = ' +
                `${reactAppComponent.state.expensesChartData}`,
            );
            reactAppComponent.state.expensesChartData.map((obj: ChartData) =>
              log(`obj is ${showObj(obj)}`),
            );
          }
        },
      );
    }
  } else {
    reactAppComponent.setState({ ...reactAppComponent.state });
  }
}

function toggle(type: ViewType) {
  for (const k of views.keys()) {
    if (k !== type) {
      const view = views.get(k);
      if (view === undefined) {
        console.log(`Error : unrecognised view ${type}`);
        return;
      }
      view.display = false;
    }
  }
  const view = views.get(type);
  if (view === undefined) {
    console.log(`Error : unrecognised view ${type}`);
    return false;
  }
  view.display = true;
  refreshData(false);
}

function toggleDisplay(type: ViewType) {
  showContent.set(type, {
    display: !showContent.get(type).display,
  });
  refreshData(false);
}

function checkModelData() {
  const response = checkData(reactAppComponent.state.modelData);
  if (response === '') {
    alert('model check all good');
  } else {
    alert(response);
  }
}
async function submitExpense(expenseInput: DbExpense) {
  if (printDebug()) {
    log(`in submitExpense with input : ${showObj(expenseInput)}`);
  }
  await submitIDbExpenses([expenseInput], modelName);
  await refreshData();
}
export async function submitNewExpense(name: string) {
  submitExpense({
    NAME: name,
    CATEGORY: '',
    VALUE: '0',
    VALUE_SET: '1 January 2018',
    START: '1 January 2018',
    END: '1 January 2018',
    GROWTH: '0',
    CPI_IMMUNE: false,
  });
}
async function submitIncome(incomeInput: DbIncome) {
  if (printDebug()) {
    log(`in submitIncome with input : ${showObj(incomeInput)}`);
  }
  await submitIDbIncomes([incomeInput], modelName);
  await refreshData();
}
async function submitTrigger(trigger: DbTrigger) {
  if (printDebug()) {
    log(`go to submitTriggers with input : ${showObj(trigger)}`);
  }
  await submitIDbTriggers([trigger], modelName);
  await refreshData();
}
export async function submitNewTrigger(name: string) {
  submitTrigger({
    NAME: name,
    DATE: new Date(),
  });
}
async function submitAsset(assetInput: DbAsset) {
  if (printDebug()) {
    log(`in submitAsset with input : ${showObj(assetInput)}`);
  }
  await submitIDbAssets([assetInput], modelName);
  await refreshData();
}
export async function submitNewAsset(name: string) {
  submitAsset({
    NAME: name,
    CATEGORY: '',
    START: '1 January 2018',
    VALUE: '0',
    GROWTH: '0',
    CPI_IMMUNE: false,
    CAN_BE_NEGATIVE: false,
    LIABILITY: '',
    PURCHASE_PRICE: '0',
  });
}
async function submitTransaction(input: DbTransaction) {
  if (printDebug()) {
    log(`in submitTransaction with input : ${showObj(input)}`);
  }
  await submitIDbTransactions([input], modelName);
  await refreshData();
}
export async function submitNewTransaction(name: string) {
  submitTransaction({
    NAME: name,
    CATEGORY: '',
    FROM: '',
    TO: '',
    FROM_VALUE: '0',
    TO_VALUE: '0',
    FROM_ABSOLUTE: true,
    TO_ABSOLUTE: true,
    DATE: '1 January 2018',
    STOP_DATE: '1 January 2018',
    RECURRENCE: '',
  });
}

async function submitSetting(input: DbSetting) {
  if (printDebug()) {
    log(`in submitSetting with input : ${showObj(input)}`);
  }
  await submitIDbSettings([input], modelName);
  await refreshData();
}
export async function submitNewSetting(name: string) {
  submitSetting({
    NAME: name,
    VALUE: '',
    HINT: '',
  });
}

function prohibitEditOfName() {
  alert('prohibit edit of name');
}

function handleExpenseGridRowsUpdated() {
  // log('handleExpenseGridRowsUpdated', arguments);
  const expense = arguments[0].fromRowData;
  // log('old expense '+showObj(expense));
  if (arguments[0].cellKey === 'NAME') {
    if (expense.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }

  const oldValue = expense[arguments[0].cellKey];
  expense[arguments[0].cellKey] = arguments[0].updated[arguments[0].cellKey];
  // log('new expense '+showObj(expense));
  const parsedCPIImmune = makeBooleanFromYesNo(expense.IS_CPI_IMMUNE);
  const parsedValue = makeCashValueFromString(expense.VALUE);
  const parsedGrowth = makeGrowthFromString(
    expense.GROWTH,
    reactAppComponent.state.modelData.settings,
  );
  if (!parsedCPIImmune.checksOK) {
    alert("Whether expense is CPI-immune should be 'y' or 'n'");
    expense[arguments[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`Value ${expense.VALUE} can't be understood as a cash value}`);
    expense[arguments[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    alert(`Value ${expense.GROWTH} can't be understood as a growth}`);
    expense[arguments[0].cellKey] = oldValue;
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
    const checks = checkExpense(
      expenseForSubmission,
      reactAppComponent.state.modelData,
    );
    if (checks === '') {
      submitExpense(expenseForSubmission);
    } else {
      alert(checks);
      expense[arguments[0].cellKey] = oldValue;
    }
  }
}
function handleIncomeGridRowsUpdated() {
  // log('handleIncomeGridRowsUpdated', arguments);
  const income = arguments[0].fromRowData;
  // log('old income '+showObj(income));
  if (arguments[0].cellKey === 'NAME') {
    if (income.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }

  const oldValue = income[arguments[0].cellKey];
  income[arguments[0].cellKey] = arguments[0].updated[arguments[0].cellKey];
  // log('new income '+showObj(income));
  const parsedCPIImmune = makeBooleanFromYesNo(income.IS_CPI_IMMUNE);
  const parsedValue = makeCashValueFromString(income.VALUE);
  const parsedGrowth = makeGrowthFromString(
    income.GROWTH,
    reactAppComponent.state.modelData.settings,
  );
  if (!parsedCPIImmune.checksOK) {
    alert("Whether income is CPI-immune should be 'y' or 'n'");
    income[arguments[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`Value ${income.VALUE} can't be understood as a cash value}`);
    income[arguments[0].cellKey] = oldValue;
  } else if (!parsedGrowth.checksOK) {
    alert(`Value ${income.GROWTH} can't be understood as a growth}`);
    income[arguments[0].cellKey] = oldValue;
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
    const checks = checkIncome(
      incomeForSubmission,
      reactAppComponent.state.modelData,
    );
    if (checks === '') {
      submitIncome(incomeForSubmission);
    } else {
      alert(checks);
      income[arguments[0].cellKey] = oldValue;
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
function handleAssetGridRowsUpdated() {
  // log('handleAssetGridRowsUpdated', arguments);
  const asset = arguments[0].fromRowData;
  if (arguments[0].cellKey === 'NAME') {
    if (asset.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  const oldValue = asset[arguments[0].cellKey];
  asset[arguments[0].cellKey] = arguments[0].updated[arguments[0].cellKey];
  const parsedValue = makeCashValueFromString(asset.VALUE);
  const parsedGrowth = makeGrowthFromString(
    asset.GROWTH,
    reactAppComponent.state.modelData.settings,
  );
  const parsedPurchasePrice = makePurchasePriceFromString(asset.PURCHASE_PRICE);
  const parsedCPIImmune = makeBooleanFromYesNo(asset.IS_CPI_IMMUNE);
  const parsedCanBeNegative = makeBooleanFromYesNo(asset.CAN_BE_NEGATIVE);
  if (!parsedGrowth.checksOK) {
    alert(`asset growth ${asset.GROWTH} not understood`);
    asset[arguments[0].cellKey] = oldValue;
  } else if (!parsedValue.checksOK) {
    alert(`asset value ${asset.VALUE} not understood`);
    asset[arguments[0].cellKey] = oldValue;
  } else if (!parsedCPIImmune.checksOK) {
    alert(`asset value ${asset.IS_CPI_IMMUNE} not understood`);
    asset[arguments[0].cellKey] = oldValue;
  } else {
    const assetForSubmission: DbAsset = {
      NAME: asset.NAME,
      VALUE: `${parsedValue.value}`,
      START: asset.START,
      LIABILITY: asset.LIABILITY,
      GROWTH: parsedGrowth.value,
      CPI_IMMUNE: parsedCPIImmune.value,
      CAN_BE_NEGATIVE: parsedCanBeNegative.value,
      PURCHASE_PRICE: parsedPurchasePrice,
      CATEGORY: asset.CATEGORY,
    };
    const checks = checkAsset(
      assetForSubmission,
      reactAppComponent.state.modelData,
    );
    if (checks === '') {
      submitAsset(assetForSubmission);
    } else {
      alert(checks);
      asset[arguments[0].cellKey] = oldValue;
    }
  }
}

function handleTransactionGridRowsUpdated() {
  // log('handleTransactionGridRowsUpdated', arguments);
  const gridData = arguments[0].fromRowData;
  if (arguments[0].cellKey === 'NAME') {
    if (gridData.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  const oldValue = gridData[arguments[0].cellKey];
  gridData[arguments[0].cellKey] = arguments[0].updated[arguments[0].cellKey];

  const parseFrom = makeValueAbsPropFromString(gridData.FROM_VALUE);
  const parseTo = makeValueAbsPropFromString(gridData.TO_VALUE);
  if (!parseFrom.checksOK) {
    alert('From value should be a number or a number with % symbol');
    gridData[arguments[0].cellKey] = oldValue;
  } else if (!parseTo.checksOK) {
    alert('To value should be a number or a number with % symbol');
    gridData[arguments[0].cellKey] = oldValue;
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
    const checks = checkTransaction(
      transaction,
      reactAppComponent.state.modelData,
    );
    if (checks === '') {
      submitTransaction(transaction);
    } else {
      alert(checks);
      gridData[arguments[0].cellKey] = oldValue;
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
export async function deleteTriggerFromTable(name: string) {
  // log('delete trigger '+name)
  if (await deleteTrigger(name, modelName)) {
    log(`deleted trigger returned true`);
    await refreshData();
    return true;
  }
  log(`deleted trigger returned false`);
  return false;
}
export async function deleteAssetFromTable(name: string) {
  // log('delete asset '+name)
  if (await deleteAsset(name, modelName)) {
    await refreshData();
    return true;
  }
  return false;
}
export async function deleteTransactionFromTable(name: string) {
  // log('delete transaction '+name)
  if (await deleteTransaction(name, modelName)) {
    await refreshData();
    return true;
  }
  return false;
}
export async function deleteExpenseFromTable(name: string) {
  // log('delete expense '+name)
  if (await deleteExpense(name, modelName)) {
    await refreshData();
    return true;
  }
  return false;
}
export async function deleteIncomeFromTable(name: string) {
  // log('delete income '+name)
  if (await deleteIncome(name, modelName)) {
    await refreshData();
    return true;
  }
  return false;
}
export async function deleteSettingFromTable(name: string) {
  if (await deleteSetting(name, modelName)) {
    await refreshData();
    return true;
  }
  return false;
}

export async function updateModelName(newValue: string) {
  // log(`model name is now ${newValue}`);
  modelName = newValue;
  await ensureDbTables(modelName);
  await refreshData();
}

interface AppState {
  modelData: DbModelData;
  expensesChartData: ChartData[];
  incomesChartData: ChartData[];
  assetChartData: ChartData[];
  taxChartData: ChartData[];
  modelNamesData: string[];
}

const defaultChartSettings = {
  height: 400,
  toolTip: {
    content: '{name}: {ttip}',
  },
  // width: 800,

  legend: {
    // fontSize: 30,
    fontFamily: 'Helvetica',
    fontWeight: 'normal',
    horizontalAlign: 'right', // left, center ,right
    verticalAlign: 'center', // top, center, bottom
  },
};

const defaultColumn = {
  editable: true,
  resizable: true,
};
/*
function convertChartDatum(z: IChartDataPoint, name: string): IReactVisChartPoint {
  log(`IChartDataPoint z is ${showObj(z)}`);
  const result: IReactVisChartPoint = {
    x: z.label,
    y: z.y,
    ttip: `${name} ${z.ttip}`,
  };
  log(`converted result is ${showObj(result)}`);
  return result;
}

function makeReactVisChartData(x: IChartData): IReactVisChartPoint[] {
  const result = x.dataPoints.map(w => convertChartDatum(w, x.name));
  // log(`${result}`);
  return result;
}
*/

export class App extends Component<{}, AppState> {
  public constructor(props: {}) {
    super(props);

    const accessKeyID = prompt('Type DB access key id');
    if (accessKeyID !== null) {
      setupDDB(accessKeyID);
    }

    reactAppComponent = this;
    this.state = {
      modelData: {
        assets: [],
        expenses: [],
        incomes: [],
        transactions: [],
        triggers: [],
        settings: [],
      },
      expensesChartData: [],
      incomesChartData: [],
      assetChartData: [],
      taxChartData: [],
      modelNamesData: [],
    };
    refreshData();
  }
  public componentDidMount() {
    toggle(homeView);
  }

  public render() {
    if (printDebug()) {
      log('in render');
    }

    return (
      <div>
        <nav className="navbar fixed-top navbar-light bg-dark">
          <header>{this.navigationDiv()}</header>
        </nav>
        <div style={{ paddingTop: '100px' }}>
          {this.homeDiv()}
          {this.overviewDiv()}
          {this.settingsDiv()}
          {this.incomesDiv()}
          {this.expensesDiv()}
          {this.assetsDiv()}
          {this.transactionsDiv()}
          {this.taxDiv()}
          {this.triggersDiv()}
        </div>
      </div>
    );
  }

  private modelList(modelNames: string[], actionOnSelect: any, idKey: string) {
    // log(`models = ${models}`)
    const buttons = modelNames.map(model => (
      <Button
        key={model}
        action={(e: any) => {
          e.persist();
          actionOnSelect(model);
        }}
        title={model}
        id={`btn-${idKey}-${model}`}
        type={idKey !== 'del' && modelName === model ? 'primary' : 'secondary'}
      />
    ));
    return <div role="group">{buttons}</div>;
  }

  private modelListForSelect(modelNames: string[]) {
    return this.modelList(
      modelNames,
      async (model: string) => {
        await updateModelName(model);
      },
      'overview',
    );
  }

  private getNewName(): {
    gotNameOK: boolean;
    newName: string;
  } {
    const result = {
      gotNameOK: false,
      newName: '',
    };
    const promptResponse = prompt('Provide a name for your model');
    if (promptResponse === null) {
      return result;
    }
    const regex = RegExp('[a-zA-Z0-9_\\-\\.]+');
    const whatsLeft = promptResponse.replace(regex, '');
    // log(`whatsLeft = ${whatsLeft}`);
    if (whatsLeft !== '') {
      alert(
        'Model names can only contain a-z, A-Z, 0-9, _, - and . characters',
      );
      return result;
    } else if (
      this.state.modelNamesData.find(model => model === promptResponse)
    ) {
      alert("There's already a model with that name");
      return result;
    }
    result.gotNameOK = true;
    result.newName = promptResponse;
    return result;
  }

  private replaceWithModel(modelName: string, newModel: DbModelData) {
    Promise.all([
      deleteAllExpenses(modelName),
      deleteAllIncomes(modelName),
      deleteAllTriggers(modelName),
      deleteAllAssets(modelName),
      deleteAllTransactions(modelName),
      deleteAllSettings(modelName),
    ]).then(() =>
      ensureDbTables(modelName).then(() =>
        Promise.all([
          submitIDbExpenses(newModel.expenses, modelName),
          submitIDbIncomes(newModel.incomes, modelName),
          submitIDbTriggers(newModel.triggers, modelName),
          submitIDbAssets(newModel.assets, modelName),
          submitIDbTransactions(newModel.transactions, modelName),
          submitIDbSettings(newModel.settings, modelName),
        ]).then(() => refreshData()),
      ),
    );
  }

  private homeDiv() {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <div style={{ display: getDisplay(homeView) ? 'block' : 'none' }}>
        <h1 id="WelcomeHeader">Welcome!</h1>
        <Button
          id="startNewModel"
          action={async () => {
            const newNameFromUser = this.getNewName();
            if (!newNameFromUser.gotNameOK) {
              return;
            }
            await updateModelName(newNameFromUser.newName);
            // log(`created new model`);
            // toggle(triggersView);
          }}
          title="New model"
          type="secondary"
        />
        <br />
        <br />
        Or select an existing model (for further actions below):
        {this.modelListForSelect(this.state.modelNamesData)}
        <br />
        <Button
          action={async () => {
            if (
              window.confirm(
                `delete all data in model ${modelName} - you sure?`,
              )
            ) {
              await deleteAllTables(modelName);
              if (modelName === sampleModelName) {
                alert(`recreating sample model as default`); // TODO make "create sample" button
                await updateModelName(sampleModelName);
                await ensureDbTables(sampleModelName);
                await submitIDbModel(sampleModel, sampleModelName);
              } else {
                await updateModelName(sampleModelName); // always exists??
              }
              await refreshData();
            }
          }}
          title="Delete model"
          id={`btn-delete`}
          type="secondary"
        />
        <Button
          action={async () => {
            const userNewName = this.getNewName();
            if (!userNewName.gotNameOK) {
              return;
            }
            const currentData = JSON.stringify(this.state.modelData);
            await updateModelName(userNewName.newName);
            const newModel = makeModelFromJSON(currentData);
            this.replaceWithModel(modelName, newModel);
          }}
          title="Clone model"
          id={`btn-clone`}
          type="secondary"
        />
        <Button
          action={async () => {
            checkModelData();
          }}
          title="Check model"
          id={`btn-check`}
          type="secondary"
        />
        <Button
          action={() => {
            log(JSON.stringify(this.state.modelData));
          }}
          title="Dump JSON to console"
          id={`btn-log`}
          type="secondary"
        />
        <Button
          action={() => {
            const input = prompt('Paste in JSON here');
            if (input === null) {
              return;
            }
            const newModel = makeModelFromJSON(input);
            this.replaceWithModel(modelName, newModel);
          }}
          title="Replace model with JSON"
          id={`btn-JSON-replace`}
          type="secondary"
        />
      </div>
    );
  }

  private settingsTableDiv() {
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
          rows={this.state.modelData.settings.map((obj: DbSetting) => {
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

  private settingsDiv() {
    return (
      <div style={{ display: getDisplay(settingsView) ? 'block' : 'none' }}>
        <fieldset>
          <Button
            action={(event: any) => {
              event.persist();
              toggleDisplay(settingsTable);
            }}
            title={`${
              showContent.get(settingsTable).display ? 'Hide ' : 'Show '
            }${settingsTable.lc}`}
            type={
              showContent.get(settingsTable).display ? 'primary' : 'secondary'
            }
            key={settingsTable.lc}
            id="toggleSettingsChart"
          />
          {this.settingsTableDiv()}
          <p />
          <div className="addNewSetting">
            <h4> Add or delete setting </h4>
            <AddDeleteEntryForm
              submitFunction={submitNewSetting}
              deleteFunction={deleteSettingFromTable}
            />
          </div>
        </fieldset>
      </div>
    );
  }

  private getExpenseChartFocus() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return allItems;
    }
    const categoryName = getSettings(
      this.state.modelData.settings,
      expenseChartFocus,
      allItems, // default fallback
    );
    return categoryName;
  }

  private makeFiltersList(
    gridData: { CATEGORY: string; NAME: string }[],
    selectedChartFocus: string,
    settingName: string,
    defaultSetting: string,
    hint: string,
  ) {
    // selectedChartFocus = this.getExpenseChartFocus()
    // settingName = expenseChartFocus
    // defaultSetting = expenseChartFocusAll
    // hint = expenseChartFocusHint
    const categories = [defaultSetting];
    gridData.forEach(e => {
      let candidate = defaultSetting;
      candidate = e.NAME;
      if (categories.indexOf(candidate) < 0) {
        categories.push(candidate);
      }
    });
    gridData.forEach(e => {
      let candidate = defaultSetting;
      if (e.CATEGORY !== '') {
        candidate = e.CATEGORY;
        if (categories.indexOf(candidate) < 0) {
          categories.push(candidate);
        }
      }
    });
    const buttons = categories.map(category => (
      <Button
        key={category}
        action={(e: any) => {
          e.persist();
          // when a button is clicked,
          // go to change the settings value
          const forSubmission: DbSetting = {
            NAME: settingName,
            VALUE: category,
            HINT: hint,
          };
          submitSetting(forSubmission);
        }}
        title={category}
        type={category === selectedChartFocus ? 'primary' : 'secondary'}
        id={`select-${category}`}
      />
    ));
    return <div role="group">{buttons}</div>;
  }

  private expensesTableDiv() {
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
              handleGridRowsUpdated={handleExpenseGridRowsUpdated}
              rows={this.state.modelData.expenses.map((obj: DbExpense) => {
                const result = {
                  END: obj.END,
                  IS_CPI_IMMUNE: makeYesNoFromBoolean(obj.CPI_IMMUNE),
                  GROWTH: makeStringFromGrowth(
                    obj.GROWTH,
                    this.state.modelData.settings,
                  ),
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
                      triggers={this.state.modelData.triggers}
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
                      triggers={this.state.modelData.triggers}
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
                      triggers={this.state.modelData.triggers}
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
                      settings={this.state.modelData.settings}
                      value="unset"
                    />
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

  private expensesChartDiv() {
    const chartVisible = showContent.get(expensesChart).display;
    return (
      <div
        style={{
          display: chartVisible ? 'block' : 'none',
        }}
      >
        <ReactiveTextArea
          identifier="expenseDataDump"
          message={showObj(this.state.expensesChartData)}
        />
        {this.makeFiltersList(
          this.state.modelData.expenses,
          this.getExpenseChartFocus(),
          expenseChartFocus,
          allItems,
          expenseChartFocusHint,
        )}
        {this.coarseFineList()}
        <fieldset>
          <ReactiveTextArea
            identifier="expensesDataDump"
            message={showObj(this.state.expensesChartData)}
          />
          <CanvasJSChart
            options={{
              ...defaultChartSettings,
              data: this.state.expensesChartData,
            }}
          />
        </fieldset>
      </div>
    );
  }

  private expensesDiv() {
    return (
      <div style={{ display: getDisplay(expensesView) ? 'block' : 'none' }}>
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(expensesChart);
          }}
          title={`${
            showContent.get(expensesChart).display ? 'Hide ' : 'Show '
          }${expensesChart.lc}`}
          type={
            showContent.get(expensesChart).display ? 'primary' : 'secondary'
          }
          key={expensesChart.lc}
          id="toggle-expensesChart"
        />
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(expensesTable);
          }}
          title={`${
            showContent.get(expensesTable).display ? 'Hide ' : 'Show '
          }${expensesTable.lc}`}
          type={
            showContent.get(expensesTable).display ? 'primary' : 'secondary'
          }
          key={expensesTable.lc}
          id="toggle-expensesTable"
        />
        {this.expensesChartDiv()}
        {this.expensesTableDiv()}
        <div className="addNewExpense">
          <h4> Add or delete expense </h4>
          <AddDeleteExpenseForm
            checkFunction={checkExpense}
            submitFunction={submitExpense}
            deleteFunction={deleteExpenseFromTable}
            submitTrigger={submitTrigger}
            model={this.state.modelData}
          />
        </div>
      </div>
    );
  }

  private getIncomeChartFocus() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return allItems;
    }
    const categoryName = getSettings(
      this.state.modelData.settings,
      incomeChartFocus,
      allItems, // default fallback
    );
    return categoryName;
  }

  private incomesChartDiv() {
    const chartVisible = showContent.get(incomesChart).display;
    return (
      <div
        style={{
          display: chartVisible ? 'block' : 'none',
        }}
      >
        <ReactiveTextArea
          identifier="incomeDataDump"
          message={showObj(this.state.incomesChartData)}
        />
        {this.makeFiltersList(
          this.state.modelData.incomes,
          this.getIncomeChartFocus(),
          incomeChartFocus,
          allItems,
          incomeChartFocusHint,
        )}
        {this.coarseFineList()}
        <fieldset>
          <CanvasJSChart
            options={{
              ...defaultChartSettings,
              data: this.state.incomesChartData,
            }}
          />
        </fieldset>
      </div>
    );
  }

  private incomesTableDiv() {
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
              handleGridRowsUpdated={handleIncomeGridRowsUpdated}
              rows={this.state.modelData.incomes.map((obj: DbIncome) => {
                const result = {
                  END: obj.END,
                  IS_CPI_IMMUNE: makeYesNoFromBoolean(obj.CPI_IMMUNE),
                  GROWTH: makeStringFromGrowth(
                    obj.GROWTH,
                    this.state.modelData.settings,
                  ),
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
                      triggers={this.state.modelData.triggers}
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
                      triggers={this.state.modelData.triggers}
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
                      triggers={this.state.modelData.triggers}
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
                      settings={this.state.modelData.settings}
                      value="unset"
                    />
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

  private incomesDiv() {
    // log('rendering an incomesDiv');
    return (
      <div style={{ display: getDisplay(incomesView) ? 'block' : 'none' }}>
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(incomesChart);
          }}
          title={`${showContent.get(incomesChart).display ? 'Hide ' : 'Show '}${
            incomesChart.lc
          }`}
          type={showContent.get(incomesChart).display ? 'primary' : 'secondary'}
          key={incomesChart.lc}
          id="toggle-incomesChart"
        />
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(incomesTable);
          }}
          title={`${showContent.get(incomesTable).display ? 'Hide ' : 'Show '}${
            incomesTable.lc
          }`}
          type={showContent.get(incomesTable).display ? 'primary' : 'secondary'}
          key={incomesTable.lc}
          id="toggle-incomesTable"
        />
        {this.incomesChartDiv()}
        {this.incomesTableDiv()}
        <div className="addNewIncome">
          <h4> Add or delete income </h4>
          <AddDeleteIncomeForm
            checkFunction={checkIncome}
            submitFunction={submitIncome}
            deleteFunction={deleteIncomeFromTable}
            submitTrigger={submitTrigger}
            model={this.state.modelData}
          />
        </div>
      </div>
    );
  }

  private triggersTableDiv() {
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
              rows={this.state.modelData.triggers.map((obj: DbTrigger) => {
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

  private assetsChartDiv() {
    const chartVisible = showContent.get(assetsChart).display;
    return (
      <div
        style={{
          display: chartVisible ? 'block' : 'none',
        }}
      >
        {this.assetsList()}
        {this.assetViewTypeList()}
        {this.coarseFineList()}
        <ReactiveTextArea
          identifier="assetDataDump"
          message={showObj(this.state.assetChartData)}
        />
        <CanvasJSChart
          options={{
            ...defaultChartSettings,
            data: this.state.assetChartData,
          }}
        />
      </div>
    );
  }

  private assetsTableDiv() {
    const tableVisible = showContent.get(assetsTable).display;
    return (
      <div
        style={{
          display: tableVisible ? 'block' : 'none',
        }}
      >
        <fieldset>
          <div className="dataGridAssets">
            <DataGrid
              handleGridRowsUpdated={handleAssetGridRowsUpdated}
              rows={this.state.modelData.assets
                .filter((obj: DbAsset) => {
                  return obj.NAME !== taxPot;
                })
                .map((obj: DbAsset) => {
                  const result = {
                    GROWTH: obj.GROWTH,
                    NAME: obj.NAME,
                    CATEGORY: obj.CATEGORY,
                    START: obj.START,
                    VALUE: obj.VALUE,
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
                      triggers={this.state.modelData.triggers}
                      value="unset"
                    />
                  ),
                },
                {
                  ...defaultColumn,
                  key: 'GROWTH',
                  name: 'growth',
                  formatter: (
                    <GrowthFormatter
                      settings={this.state.modelData.settings}
                      value="unset"
                    />
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

  private transactionsTableDiv() {
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
            handleGridRowsUpdated={handleTransactionGridRowsUpdated}
            rows={this.state.modelData.transactions.map(
              (obj: DbTransaction) => {
                // log(`obj.FROM_ABSOLUTE = ${obj.FROM_ABSOLUTE}`)
                let fromValueEntry = makeStringFromValueAbsProp(
                  obj.FROM_VALUE,
                  obj.FROM_ABSOLUTE,
                );
                // console.log(`obj.FROM = ${obj.FROM}, fromValueEntry = ${fromValueEntry}`);
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
              },
            )}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
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
                  <TriggerDateFormatter
                    triggers={this.state.modelData.triggers}
                    value="unset"
                  />
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
                  <TriggerDateFormatter
                    triggers={this.state.modelData.triggers}
                    value="unset"
                  />
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

  private overviewDiv() {
    return (
      <div style={{ display: getDisplay(overview) ? 'block' : 'none' }}>
        This model has &nbsp;
        {this.state.modelData.triggers.length} &nbsp;
        <Button
          action={() => {
            toggle(triggersView);
          }}
          type="secondary"
          title="important dates"
          id="switchToTriggers"
        />
        , &nbsp;
        {this.state.modelData.incomes.length} &nbsp;
        <Button
          action={() => {
            toggle(incomesView);
          }}
          type="secondary"
          title="incomes"
          id="switchToIncomes"
        />
        ,&nbsp;
        {this.state.modelData.expenses.length} &nbsp;
        <Button
          action={() => {
            toggle(expensesView);
          }}
          type="secondary"
          title="expenses"
          id="switchToExpenses"
        />
        , &nbsp;
        {this.state.modelData.assets.length} &nbsp;
        <Button
          action={() => {
            toggle(assetsView);
          }}
          type="secondary"
          title="assets"
          id="switchToAssets"
        />
        , &nbsp;
        {this.state.modelData.transactions.length} &nbsp;
        <Button
          action={() => {
            toggle(transactionsView);
          }}
          type="secondary"
          title="transactions"
          id="switchToTransactions"
        />
        &nbsp; and &nbsp;
        {this.state.modelData.settings.length} &nbsp;
        <Button
          action={() => {
            toggle(settingsView);
          }}
          type="secondary"
          title="settings"
          id="switchToSettings"
        />
        &nbsp;.
        <br />
        <h2>Important dates:</h2>
        {this.triggersTableDiv()}
        <h2>Incomes:</h2>
        {this.incomesTableDiv()}
        {this.incomesChartDiv()}
        <h2>Expenses:</h2>
        {this.expensesTableDiv()}
        {this.expensesChartDiv()}
        <h2>Assets:</h2>
        {this.assetsTableDiv()}
        {this.assetsChartDiv()}
        <h2>Transactions:</h2>
        {this.transactionsTableDiv()}
        <h2>Settings:</h2>
        {this.settingsTableDiv()}
      </div>
    );
  }

  private triggersDiv() {
    return (
      <div style={{ display: getDisplay(triggersView) ? 'block' : 'none' }}>
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(triggersTable);
          }}
          title={`${
            showContent.get(triggersTable).display ? 'Hide ' : 'Show '
          }${triggersTable.lc}`}
          type={
            showContent.get(triggersTable).display ? 'primary' : 'secondary'
          }
          key={triggersTable.lc}
          id="toggle-triggersChart"
        />
        {this.triggersTableDiv()}
        <p />
        <div className="addNewTrigger">
          <h4> Add or delete important date </h4>
          <AddDeleteTriggerForm
            checkFunction={checkTrigger}
            submitFunction={submitTrigger}
            deleteFunction={deleteTriggerFromTable}
            showTriggerTable={() => {
              // force show if we have exactly one trigger
              // log(`has ${this.state.modelData.triggers} triggers...`)
              if (this.state.modelData.triggers.length === 1) {
                showContent.set(triggersTable, {
                  display: true,
                });
              }
            }}
            model={this.state.modelData}
          />
        </div>
      </div>
    );
  }

  private getAssetChartName() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return CASH_ASSET_NAME;
    }
    const assetName = getSettings(
      this.state.modelData.settings,
      assetChartFocus,
      CASH_ASSET_NAME, // default fallback
    );
    return assetName;
  }

  private assetsList() {
    const assets: string[] = this.state.modelData.assets
      .filter(obj => {
        return obj.NAME !== taxPot;
      })
      .map(data => data.NAME);
    // log(`assets = ${assets}`);
    assets.unshift(allItems);
    this.state.modelData.assets.forEach(data => {
      const cat = data.CATEGORY;
      if (cat !== '') {
        if (assets.indexOf(cat) < 0) {
          assets.push(cat);
        }
      }
    });
    const selectedAsset = this.getAssetChartName();
    const buttons = assets.map(asset => (
      <Button
        key={asset}
        action={(e: any) => {
          e.persist();
          // when a button is clicked,
          // go to change the settings value
          const forSubmission: DbSetting = {
            NAME: assetChartFocus,
            VALUE: asset,
            HINT: assetChartFocusHint,
          };
          submitSetting(forSubmission);
        }}
        title={asset}
        type={asset === selectedAsset ? 'primary' : 'secondary'}
        id="chooseAssetChartSetting"
      />
    ));
    return <div role="group">{buttons}</div>;
  }

  private getAssetChartView() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return assetChartVal;
    }
    const assetName = getSettings(
      this.state.modelData.settings,
      assetChartView,
      assetChartVal, // default fallback
    );
    return assetName;
  }

  private assetViewTypeList() {
    const viewTypes: string[] = [
      assetChartVal,
      assetChartAdditions,
      assetChartReductions,
      assetChartDeltas,
    ];
    const selectedAssetView = this.getAssetChartView();
    const buttons = viewTypes.map(viewType => (
      <Button
        key={viewType}
        action={(e: any) => {
          e.persist();
          // when a button is clicked,
          // go to change the settings value
          const forSubmission: DbSetting = {
            NAME: assetChartView,
            VALUE: viewType,
            HINT: assetChartHint,
          };
          submitSetting(forSubmission);
        }}
        title={viewType}
        type={viewType === selectedAssetView ? 'primary' : 'secondary'}
        id="chooseAssetChartType"
      />
    ));
    return <div role="group">{buttons}</div>;
  }

  private getCoarseFineView() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return fine;
    }
    const assetName = getSettings(
      this.state.modelData.settings,
      viewDetail,
      fine, // default fallback
    );
    return assetName;
  }

  private coarseFineList() {
    const viewTypes: string[] = [coarse, fine];
    const selectedCoarseFineView = this.getCoarseFineView();
    const buttons = viewTypes.map(viewType => (
      <Button
        key={viewType}
        action={(e: any) => {
          e.persist();
          // when a button is clicked,
          // go to change the settings value
          const forSubmission: DbSetting = {
            NAME: viewDetail,
            VALUE: viewType,
            HINT: viewDetailHint,
          };
          submitSetting(forSubmission);
        }}
        title={viewType}
        type={viewType === selectedCoarseFineView ? 'primary' : 'secondary'}
        id="chooseViewDetailType"
      />
    ));
    return <div role="group">{buttons}</div>;
  }

  private assetsDiv() {
    return (
      <div style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}>
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(assetsChart);
          }}
          title={`${showContent.get(assetsChart).display ? 'Hide ' : 'Show '}${
            assetsChart.lc
          }`}
          type={showContent.get(assetsChart).display ? 'primary' : 'secondary'}
          key={assetsChart.lc}
          id="toggleAssetsChart"
        />
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(assetsTable);
          }}
          title={`${showContent.get(assetsTable).display ? 'Hide ' : 'Show '}${
            assetsTable.lc
          }`}
          type={showContent.get(assetsTable).display ? 'primary' : 'secondary'}
          key={assetsTable.lc}
          id="toggleAssetsTable"
        />
        {this.assetsChartDiv()}
        {this.assetsTableDiv()}
        <div className="addNewAsset">
          <h4> Add or delete asset </h4>
          <AddDeleteAssetForm
            checkFunction={checkAsset}
            submitFunction={submitAsset}
            deleteFunction={deleteAssetFromTable}
            submitTrigger={submitTrigger}
            model={this.state.modelData}
          />
        </div>
      </div>
    );
  }

  private transactionsDiv() {
    return (
      <div style={{ display: getDisplay(transactionsView) ? 'block' : 'none' }}>
        <Button
          action={(event: any) => {
            event.persist();
            toggleDisplay(transactionsTable);
          }}
          title={`${
            showContent.get(transactionsTable).display ? 'Hide ' : 'Show '
          }${transactionsTable.lc}`}
          type={
            showContent.get(transactionsTable).display ? 'primary' : 'secondary'
          }
          key={transactionsTable.lc}
          id="toggleTransactionsChart"
        />
        {this.transactionsTableDiv()}
        <p />
        <div className="addNewTransaction">
          <h4> Add or delete transaction </h4>
          <AddDeleteTransactionForm
            checkFunction={checkTransaction}
            submitFunction={submitTransaction}
            deleteFunction={deleteTransactionFromTable}
            submitTrigger={submitTrigger}
            model={this.state.modelData}
          />
        </div>
      </div>
    );
  }

  private taxDiv() {
    return (
      <div style={{ display: getDisplay(taxView) ? 'block' : 'none' }}>
        <CanvasJSChart
          options={{
            ...defaultChartSettings,
            data: this.state.taxChartData,
          }}
        />
      </div>
    );
  }

  private buttonList() {
    const buttons: JSX.Element[] = [];
    const it = views.keys();
    let entry = it.next();
    while (!entry.done) {
      const view = entry.value;
      const viewValue = views.get(view);
      if (viewValue === undefined) {
        console.log(`Error : unrecognised view ${view}`);
        entry = it.next();
        continue;
      }
      const display = viewValue.display;

      buttons.push(
        <Button
          action={(event: any) => {
            event.persist();
            toggle(view);
          }}
          title={view.lc}
          type={display ? 'primary' : 'secondary'}
          key={view.lc}
          id={`btn-${view.lc}`}
        />,
      );
      entry = it.next();
    }
    return <div role="group">{buttons}</div>;
  }

  private makeHelpText() {
    const it = views.keys();
    let entry = it.next();
    while (!entry.done) {
      if (getDisplay(entry.value)) {
        // console.log(`views.get(entry.value) = ${showObj(views.get(entry.value))}`);
        const view = views.get(entry.value);
        if (view === undefined) {
          log('Error: unrecognised view');
          return;
        }
        return (
          <h4 className="text-white">
            {(entry.value !== homeView ? modelName + ': ' : '') + view.helpText}
          </h4>
        );
      }
      entry = it.next();
    }
  }

  private navigationDiv() {
    return (
      <div>
        {this.buttonList()}
        {this.makeHelpText()}
      </div>
    );
  }
}

export default App;
