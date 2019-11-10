import React, { Component } from 'react';
import CanvasJSReact from './assets/js/canvasjs.react';
import {
  makeChartData,
} from './charting';
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
  makeDbCopy,
  submitIDbAssets,
  submitIDbExpenses,
  submitIDbIncomes,
  submitIDbSettings,
  submitIDbTransactions,
  submitIDbTriggers,
} from './database/dynamo';
import {
  sampleAssets,
  sampleExpenses,
  sampleIncomes,
  sampleSettings,
  sampleTransactions,
  sampleTriggers,
} from './models/sampleData';
// } from './models/outsideGit/RealData';
import {
  AddDeleteAssetForm,
} from './reactComponents/AddDeleteAssetForm';
import {
  AddDeleteEntryForm,
} from './reactComponents/AddDeleteEntryForm';
import {
  AddDeleteExpenseForm,
} from './reactComponents/AddDeleteExpenseForm';
import {
  AddDeleteIncomeForm,
} from './reactComponents/AddDeleteIncomeForm';
import {
  AddDeleteTransactionForm,
} from './reactComponents/AddDeleteTransactionForm';
import {
  AddDeleteTriggerForm,
} from './reactComponents/AddDeleteTriggerForm';
import Button from './reactComponents/Button';
import DataGrid from './reactComponents/DataGrid';
import { ModelManagementForm } from './reactComponents/ModelManagementForm';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';
/*
import {
  IReactVisChartPoint,
} from './reactComponents/ReactVisExample';
*/
import {
  allAssets,
  assetChartAdditions,
  assetChartDeltas,
  assetChartHint,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  CASH_ASSET_NAME,
  coarse,
  cpi,
  expenseChartFocus,
  expenseChartFocusAll,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusAll,
  incomeChartFocusHint,
  roiEnd,
  roiStart,
  singleAssetName,
  singleAssetNameHint,
  taxPot,
  viewDetail,
  viewDetailHint,
  viewFrequency,
} from './stringConstants';
import {
  IChartData,
//  IChartDataPoint,
  IDataForView,
  IDbAsset,
  IDbExpense,
  IDbIncome,
  IDbModelData,
  IDbSetting,
  IDbTransaction,
  IDbTrigger,
  IItemChartData,
} from './types/interfaces';
import {
  getSettings,
  log,
  makeBooleanFromString,
  makeStringFromBoolean,
  printDebug,
  showObj,
} from './utils';
// import './bootstrap.css'

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

export let modelName: string = 'default';

interface IViewType {
  lc: string;
}
const homeView: IViewType = { lc: 'Home' };
const expensesView: IViewType = { lc: 'Expenses' };
const incomesView: IViewType = { lc: 'Incomes' };
const transactionsView: IViewType = { lc: 'Transactions' };
const assetsView: IViewType = { lc: 'Assets' };
const triggersView: IViewType = { lc: 'Important dates' };
const manageModelsView: IViewType = { lc: 'Manage models' };
const settingsView: IViewType = { lc: 'Settings' };
const expensesChart: IViewType = { lc: 'Expenses chart' };
const incomesChart: IViewType = { lc: 'Incomes chart' };
const assetsChart: IViewType = { lc: 'Assets chart' };
const expensesTable: IViewType = { lc: 'Expenses table' };
const incomesTable: IViewType = { lc: 'Incomes table' };
const assetsTable: IViewType = { lc: 'Assets table' };
const transactionsTable: IViewType = { lc: 'Transactions table' };
const triggersTable: IViewType = { lc: 'Important dates' };
const settingsTable: IViewType = { lc: 'Settings table' };
const overview: IViewType = { lc: 'Overview' };

const helpText: Map<string, string> = new Map();
helpText.set(
  homeView.lc,
  'Help text for home page.',
);
helpText.set(
  expensesView.lc,
  'Help text for expenses page.',
);
helpText.set(
  incomesView.lc,
  'Help text for incomes page.',
);
helpText.set(
  transactionsView.lc,
  'Help text for transactions page.',
);
helpText.set(
  assetsView.lc,
  'Help text for assets page.',
);
helpText.set(
  triggersView.lc,
  'Help text for important dates page.',
);
helpText.set(
  manageModelsView.lc,
  'Help text for manage models page.',
);
helpText.set(
  settingsView.lc,
  'Help text for settings page.',
);
helpText.set(
  overview.lc,
  'Help text for overview page.',
);

const show = new Map<IViewType, any>([
  [homeView, { display: true }],
  [manageModelsView, { display: false }],
  [settingsView, { display: false }],
  [incomesView, { display: false }],
  [expensesView, { display: false }],
  [assetsView, { display: false }],
  [transactionsView, { display: false }],
  [triggersView, { display: false }],
  [overview, { display: false }],
]);
const showContent = new Map<IViewType, any>([
  [incomesChart, { display: false }],
  [expensesChart, { display: false }],
  [assetsChart, { display: false }],
  [incomesTable, { display: false }],
  [expensesTable, { display: false }],
  [assetsTable, { display: false }],
  [transactionsTable, { display: false }],
  [triggersTable, { display: false }],
  [settingsTable, { display: false }],
]);

let reactAppComponent: App;

function toggle(type: IViewType) {
  for (const k of show.keys()) {
    if (k !== type) {
      show.set(k, { display: false });
    }
  }
  show.set(type, { display: true });
  refreshData();
}
function toggleCharts(type: IViewType) {
  showContent.set(type, {
    display: !showContent.get(type).display,
  });
  refreshData();
}
function getDisplay(type: IViewType) {
  const result = show.get(type).display;
  return result;
}

async function refreshData() {
  // log('refreshData in App - get data and redraw content');
  // go to the DB to retreive updated data
  let modelNames: string[] = [];
  try{
    modelNames = await getDbModelNames();
  } catch(error){
    alert('error contacting database');
    return;
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

  model.assets.push({
    NAME: taxPot,
    ASSET_START: '1 Jan 2018',
    ASSET_VALUE: '0',
    ASSET_GROWTH: '0',
    ASSET_LIABILITY: '',
    ASSET_PURCHASE_PRICE: '0',
    CATEGORY: 'Tax',
    });

  // log(`modelNames = ${modelNames}`);

  const result: IDataForView = makeChartData(model);

  result.expensesData.sort((a, b) =>
    (a.item.NAME < b.item.NAME ? 1 : -1),
  );
  result.incomesData.sort((a, b) =>
    (a.item.NAME < b.item.NAME ? 1 : -1),
  );
  result.assetData.sort((a, b) =>
    (a.item.NAME < b.item.NAME ? 1 : -1),
  );

  if (printDebug()) {
    result.assetData.forEach((entry) => {
      log(
        `single asset item ${showObj(entry.item)} has chart points ` +
        `${showObj(entry.chartDataPoints)}`,
      );
    });
  }

  // get the data out of the object we got back
  // = result.triggers;
  const expensesData = result.expensesData;
  const incomesData = result.incomesData;
  const assetData = result.assetData;

  if (printDebug()) {
    log('in refreshData');
    log(` expensesData = ${expensesData}`);
    log(` incomesData = ${incomesData}`);
    log(` assetData = ${assetData}`);
  }

  const expensesChartData = expensesData.map((x: IItemChartData) => ({
    dataPoints: x.chartDataPoints,
    name: x.item.NAME,
    type: 'stackedColumn',
    showInLegend: true,
  }));
  const incomesChartData = incomesData.map((x: IItemChartData) => ({
    dataPoints: x.chartDataPoints,
    name: x.item.NAME,
    type: 'stackedColumn',
    showInLegend: true,
  }));
  const singleAssetChartData
    = assetData.map((x: IItemChartData) => ({
      dataPoints: x.chartDataPoints,
      name: x.item.NAME,
      type: 'stackedColumn',
      showInLegend: true,
    }));

  if (reactAppComponent !== undefined) {
    // log(`go setState with modelNames = ${modelNames}`);

    // setState on a reactComponent triggers update of view
    reactAppComponent.setState({
      modelData: model,
      expensesChartData,
      incomesChartData,
      singleAssetChartData,
      modelNamesData: modelNames,
    }, () => {
      // setState is async
      // do logging after setState using the 2nd argument
      // https://www.freecodecamp.org/news/get-pro-with-react-setstate-in-10-minutes-d38251d1c781/
      if (printDebug()) {
        log(
          `reactAppComponent.state.expensesChartDataValue = ${
          reactAppComponent.state.expensesChartData
          }`,
        );
        reactAppComponent.state.expensesChartData.map((obj: IChartData) =>
          log(`obj is ${showObj(obj)}`),
        );
      }
    });
  }
  // log('-------------end of refreshData-----------------');
}

function checkModelData() {
  const response = checkData(reactAppComponent.state.modelData);
  if (response === '') {
    alert('model check all good');
  } else {
    alert(response);
  }
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
async function submitExpense(expenseInput: IDbExpense) {
  if (printDebug()) {
    log(`in submitExpense with input : ${showObj(expenseInput)}`);
  }
  await submitIDbExpenses([expenseInput], modelName);
  await refreshData();
}
async function submitIncome(incomeInput: IDbIncome) {
  if (printDebug()) {
    log(`in submitIncome with input : ${showObj(incomeInput)}`);
  }
  await submitIDbIncomes([incomeInput], modelName);
  await refreshData();
}
export async function submitNewTrigger(name: string) {
  submitTrigger({
    NAME: name,
    TRIGGER_DATE: new Date(),
  });
}
async function submitTrigger(trigger: IDbTrigger) {
  if (printDebug()) {
    log(`go to submitTriggers with input : ${showObj(trigger)}`);
  }
  await submitIDbTriggers([trigger], modelName);
  await refreshData();
}
export async function submitNewAsset(name: string) {
  submitAsset({
    NAME: name,
    CATEGORY: '',
    ASSET_START: '1 January 2018',
    ASSET_VALUE: '0',
    ASSET_GROWTH: '0',
    ASSET_LIABILITY: '',
    ASSET_PURCHASE_PRICE: '0',
  });
}
async function submitAsset(assetInput: IDbAsset) {
  if (printDebug()) {
    log(`in submitAsset with input : ${showObj(assetInput)}`);
  }
  await submitIDbAssets([assetInput], modelName);
  await refreshData();
}
export async function submitNewTransaction(name: string) {
  submitTransaction({
    NAME: name,
    CATEGORY: '',
    TRANSACTION_FROM: '',
    TRANSACTION_TO: '',
    TRANSACTION_FROM_VALUE: '0',
    TRANSACTION_TO_VALUE: '0',
    TRANSACTION_FROM_ABSOLUTE: true,
    TRANSACTION_TO_ABSOLUTE: true,
    TRANSACTION_DATE: '1 January 2018',
    TRANSACTION_STOP_DATE: '1 January 2018',
    TRANSACTION_RECURRENCE: '',
  });
}
async function submitTransaction(input: IDbTransaction) {
  if (printDebug()) {
    log(`in submitTransaction with input : ${showObj(input)}`);
  }
  await submitIDbTransactions([input], modelName);
  await refreshData();
}
export async function submitNewSetting(name: string) {
  submitSetting({
    NAME: name,
    VALUE: '',
    HINT: '',
  });
}
async function submitSetting(input: IDbSetting) {
  if (printDebug()) {
    log(`in submitSetting with input : ${showObj(input)}`);
  }
  await submitIDbSettings([input], modelName);
  await refreshData();
}

function prohibitEditOfName() {
  alert('prohibit edit of name');
}

function handleExpenseGridRowsUpdated({ fromRow, toRow, updated }: any) {
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
  const checksOK = checkBoolean(expense.CPI_IMMUNE);
  if (!checksOK) {
    alert(`Whether expense is CPI-immune should be 't' or 'f'`);
    expense[arguments[0].cellKey] = oldValue;
  } else {
    const expenseForSubmission: IDbExpense = {
      NAME: expense.NAME,
      CATEGORY: expense.CATEGORY,
      START: expense.START,
      END: expense.END,
      VALUE: expense.VALUE,
      VALUE_SET: expense.VALUE_SET,
      GROWTH: expense.GROWTH,
      CPI_IMMUNE: makeBooleanFromString(expense.CPI_IMMUNE),
    };
    log(`expenseForSubmission = ${showObj(expenseForSubmission)}`);
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
function checkBoolean(input: string) {
  if (
    input !== 't'
    && input !== 'f'
    && input !== 'T'
    && input !== 'F'
  ) {
    return false;
  }
  return true;
}
function handleIncomeGridRowsUpdated({ fromRow, toRow, updated }: any) {
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
  const checksOK = checkBoolean(income.CPI_IMMUNE);
  if (!checksOK) {
    alert(`Whether income is CPI-immune should be 't' or 'f'`);
    income[arguments[0].cellKey] = oldValue;
  } else {
    const incomeForSubmission: IDbIncome = {
      NAME: income.NAME,
      CATEGORY: income.CATEGORY,
      START: income.START,
      END: income.END,
      VALUE: income.VALUE,
      VALUE_SET: income.VALUE_SET,
      GROWTH: income.GROWTH,
      CPI_IMMUNE: makeBooleanFromString(income.CPI_IMMUNE),
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
  // log('incomeForSubmission '+showObj(incomeForSubmission));
}
function handleTriggerGridRowsUpdated({ fromRow, toRow, updated }: any) {
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
  const forSubmit: IDbTrigger = {
    NAME: trigger.NAME,
    TRIGGER_DATE: new Date(trigger.TRIGGER_DATE),
  };
  const checks = checkTrigger(
    forSubmit,
  );
  if (checks === '') {
    submitTrigger(forSubmit);
  } else {
    alert(checks);
    trigger[arguments[0].cellKey] = oldValue;
  }
}
function handleAssetGridRowsUpdated({ fromRow, toRow, updated }: any) {
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
  const checks = checkAsset(asset, reactAppComponent.state.modelData);
  if (checks === '') {
    submitAsset(asset);
  } else {
    alert(checks);
    asset[arguments[0].cellKey] = oldValue;
  }
}
function handleTransactionGridRowsUpdated({ fromRow, toRow, updated }: any) {
  // log('handleTransactionGridRowsUpdated', arguments);
  const gridData = arguments[0].fromRowData;
  if (arguments[0].cellKey === 'NAME') {
    if (gridData.NAME !== arguments[0].updated.NAME) {
      prohibitEditOfName();
    }
    return;
  }
  const oldValue = gridData[arguments[0].cellKey];
  gridData[arguments[0].cellKey] =
    arguments[0].updated[arguments[0].cellKey];
  let checksOK = checkBoolean(gridData.TRANSACTION_FROM_ABSOLUTE);
  if (!checksOK) {
    alert(`From absolute value should be 't' or 'f'`);
    gridData[arguments[0].cellKey] = oldValue;
  } else {
    checksOK = checkBoolean(gridData.TRANSACTION_TO_ABSOLUTE);
    if (!checksOK) {
      alert(`To absolute value should be 't' or 'f'`);
      gridData[arguments[0].cellKey] = oldValue;
    } else {
      const transaction: IDbTransaction = {
        TRANSACTION_DATE: gridData.TRANSACTION_DATE,
        TRANSACTION_FROM: gridData.TRANSACTION_FROM,
        TRANSACTION_FROM_ABSOLUTE: makeBooleanFromString(
          gridData.TRANSACTION_FROM_ABSOLUTE,
        ),
        TRANSACTION_FROM_VALUE: gridData.TRANSACTION_FROM_VALUE,
        NAME: gridData.NAME,
        TRANSACTION_TO: gridData.TRANSACTION_TO,
        TRANSACTION_TO_ABSOLUTE: makeBooleanFromString(
          gridData.TRANSACTION_TO_ABSOLUTE,
        ),
        TRANSACTION_TO_VALUE: gridData.TRANSACTION_TO_VALUE,
        TRANSACTION_STOP_DATE: gridData.TRANSACTION_STOP_DATE,
        TRANSACTION_RECURRENCE: gridData.TRANSACTION_RECURRENCE,
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
}
function handleSettingGridRowsUpdated({ fromRow, toRow, updated }: any) {
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
  const forSubmission: IDbSetting = {
    NAME: x.NAME,
    VALUE: x.VALUE,
    HINT: x.HINT,
  };
  submitSetting(forSubmission);
}
export async function deleteTriggerFromTable(name: string) {
  // log('delete trigger '+name)
  if (deleteTrigger(name, modelName)) {
    await refreshData();
  }
}
export async function deleteAssetFromTable(name: string) {
  // log('delete asset '+name)
  if (deleteAsset(name, modelName)) {
    await refreshData();
  }
}
export async function deleteTransactionFromTable(name: string) {
  // log('delete transaction '+name)
  if (deleteTransaction(name, modelName)) {
    await refreshData();
  }
}
export async function deleteExpenseFromTable(name: string) {
  // log('delete expense '+name)
  if (deleteExpense(name, modelName)) {
    await refreshData();
  }
}
export async function deleteIncomeFromTable(name: string) {
  // log('delete income '+name)
  if (deleteIncome(name, modelName)) {
    await refreshData();
  }
}
export async function deleteSettingFromTable(name: string) {
  if (deleteSetting(name, modelName)) {
    await refreshData();
  }
}
async function saveModelAs(newName: string) {
  await makeDbCopy(modelName, newName);
  modelName = newName;
  refreshData();

  // note poor performance but assured consistency!!
  //
  // we could assuma that the same data in the DB
  // creates the same view of the App.
  // But we refresh in case we have
  // a heading like `chart showing incomes for ${modelName}`
  // where we now have a new modelName but the heading
  // won't update otherwise.
  // If there was any glitch or bug in writing to DB
  // calling refresh ensures what we see is a reflection of DB.
}
export async function updateModelName(newValue: string) {
  // log(`model name is now ${newValue}`);
  modelName = newValue;
  await ensureDbTables(modelName);
  await refreshData();
}

interface IAppState {
  modelData: IDbModelData;
  expensesChartData: IChartData[];
  incomesChartData: IChartData[];
  singleAssetChartData: IChartData[];
  modelNamesData: string[];
}

const defaultChartSettings = {
  height: 500,
  toolTip: {
    content: '{name}: {ttip}',
  },
  // width: 800,

  legend: {
    // fontSize: 30,
    fontFamily: 'Helvetica',
    fontWeight: 'normal',
    horizontalAlign: 'right', // left, center ,right
    verticalAlign: 'center',  // top, center, bottom
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
export class App extends Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);
    reactAppComponent = this;
    refreshData();
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
      singleAssetChartData: [],
      modelNamesData: [],
    };
  }
  public render() {
    if (printDebug()) {
      log('in render');
    }
    return (
      <div>
        <nav className="navbar fixed-top navbar-light bg-dark">
        <header>
        {this.navigationDiv()}
        </header>
        </nav>
        <div style={{paddingTop: '100px'}}>
        {this.homeDiv()}
        {this.overviewDiv()}
        {this.manageModelsDiv()}
        {this.settingsDiv()}
        {this.incomesDiv()}
        {this.expensesDiv()}
        {this.assetsDiv()}
        {this.transactionsDiv()}
        {this.triggersDiv()}
        </div>
      </div>
    );
  }

  private modelList(
    modelNames: string[],
    actionOnSelect: any,
    idKey: string,
  ) {
    // log(`models = ${models}`)
    const buttons = modelNames.map((model) =>
        <Button
          key={model}
          action={(e: any) => {
            e.persist();
            actionOnSelect(model);
          }}
          title={model}
          id={`btn-${idKey}-${model}`}
          type="secondary"
          />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
  }

  private modelListForOverview(modelNames: string[]) {
    return this.modelList(
      modelNames,
      (model: string) => {
        updateModelName(model);
        toggle(overview);
      },
      'overview',
    );
  }

  private modelListForDelete(modelNames: string[]) {
    return this.modelList(
      modelNames,
      async (model: string) => {
        await deleteAllTables(model);
        await updateModelName('default');
        await refreshData();
      },
      'del',
    );
  }
  private homeDiv() {
    if (!show.get(homeView).display) {
      return;
    }
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <div style={{ display: getDisplay(homeView) ? 'block' : 'none' }}>
        <h1 id="WelcomeHeader">Welcome!</h1>
        <Button
            id="startNewModel"
            action={async () => {
              const promptResponse = prompt('Provide a name for your model');
              if (promptResponse === null) {
                return;
              }
              if (this.state.modelNamesData.find((model) => {
                return model === promptResponse;
              })) {
                alert(`There's already a model with that name`);
                return;
              }
              await updateModelName(promptResponse);
              // log(`created new model`);
              toggle(triggersView);
            }}
            title="New model"
            type="secondary"
            />
        <br/><br/>
        Review or edit an existing model:
        {this.modelListForOverview(this.state.modelNamesData)}
        <br/><br/>
        Delete an existing model:
        {this.modelListForDelete(this.state.modelNamesData)}
      </div>
    );
  }
  private manageModelsDiv() {
    if (!show.get(manageModelsView).display) {
      return;
    }
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <div style={{ display: getDisplay(manageModelsView) ? 'block' : 'none' }}>
        <fieldset>
          <h2 id="ManageModelsHeader">Manage models</h2>
          <p />
          <Button
            id="useSampleData"
            action={() => {
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
                    submitIDbExpenses(sampleExpenses, modelName),
                    submitIDbIncomes(sampleIncomes, modelName),
                    submitIDbTriggers(sampleTriggers, modelName),
                    submitIDbAssets(sampleAssets, modelName),
                    submitIDbTransactions(sampleTransactions, modelName),
                    submitIDbSettings(sampleSettings, modelName),
                  ]).then(() => refreshData())));
            }}
            title="Replace with data from sample"
            type="secondary"
          />
          <Button
            id="clearData"
            action={() => {
              Promise.all([
                deleteAllExpenses(modelName),
                deleteAllIncomes(modelName),
                deleteAllTriggers(modelName),
                deleteAllAssets(modelName),
                deleteAllTransactions(modelName),
                deleteAllSettings(modelName),
              ]).then(
                () => ensureDbTables(modelName).then(
                  () => refreshData()));
            }}
            title="Clear data"
            type="secondary"
          />
          <Button
            id="checkData"
            action={() => {
              checkModelData();
            }}
            title="Check data integrity"
            type="secondary"
          />
          <Button
            id="logData"
            action={() => {
              stringifyDB().then((x) => log(x));
            }}
            title="Log data to console"
            type="secondary"
          />
          <ModelManagementForm
            name={modelName}
            models={this.state.modelNamesData}
            viewFunction={(name: string) => {
              // log(`view ${name}`);
              const oldName = modelName;
              updateModelName(name);
              return oldName;
            }}
            saveAsFunction={(name: string) => {
              // log(`save as ${name}`);
              saveModelAs(name);
            }}
            deleteFunction={async (name: string) => {
              // log(`delete model ${name}`);
              if (window.confirm(`delete all data in model ${name} - you sure?`)) {
                await deleteAllTables(name);
                if (modelName === name) {
                  // log('switch to default model');
                  await updateModelName('default');
                }
                // log(`deleted`);
                await refreshData(); // lazy! overkill if modelName !== name
                return true;
              }
              // log(`not deleted`);
              return false;
            }}
          />
        </fieldset>
      </div>
    );
  }
  private settingsDiv() {
    if (!show.get(settingsView).display) {
      return;
    }
    const tableVisible = showContent.get(settingsTable).display
      && this.state.modelData.settings.length > 0;
    return (
      <div style={{ display: getDisplay(settingsView) ? 'block' : 'none' }}>
        <fieldset>
          <h2 id="SettingsHeader">Model {modelName}: Settings</h2>
          <Button
            action={(event: any) => {
              event.persist();
              toggleCharts(settingsTable);
            }}
            title={`${showContent.get(settingsTable).display
              ? 'Hide '
              : 'Show '}${settingsTable.lc}`}
            type={showContent.get(settingsTable).display
              ? 'primary'
              : 'secondary'}
            key={settingsTable.lc}
            id="toggleSettingsChart"
          />
          <div
            className="dataGridSettings"
            style={{ display: tableVisible
              ? 'block'
              : 'none',
            }}
          >
            <DataGrid
              handleGridRowsUpdated={handleSettingGridRowsUpdated}
              rows={this.state.modelData.settings.map((obj: IDbSetting) => {
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
          <p/>
          <div className="addNewSetting">
            <h4> Add or delete setting </h4>
            <AddDeleteEntryForm
              submitFunction = {submitNewSetting}
              deleteFunction = {deleteSettingFromTable}
            />
          </div>
        </fieldset>
      </div>
    );
  }
  private getExpenseChartFocus() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return expenseChartFocusAll;
    }
    const categoryName = getSettings(
      this.state.modelData.settings,
      expenseChartFocus,
      expenseChartFocusAll, // default fallback
    );
    return categoryName;
  }
  private makeFiltersList(
    gridData: Array<{ CATEGORY: string, NAME: string }>,
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
    gridData.forEach((e) => {
      let candidate = defaultSetting;
      candidate = e.NAME;
      if (categories.indexOf(candidate) < 0) {
        categories.push(candidate);
      }
    });
    gridData.forEach((e) => {
      let candidate = defaultSetting;
      if (e.CATEGORY !== '') {
        candidate = e.CATEGORY;
        if (categories.indexOf(candidate) < 0) {
          categories.push(candidate);
        }
      }
    });
    const buttons = categories.map((category) =>
        <Button
          key={category}
          action={(e: any) => {
            e.persist();
            // when a button is clicked,
            // go to change the settings value
            const forSubmission: IDbSetting = {
              NAME: settingName,
              VALUE: category,
              HINT: hint,
            };
            submitSetting(forSubmission);
          }}
          title={category}
          type={(category === selectedChartFocus)
            ? 'primary' : 'secondary'}
          id={`select-${category}`}
        />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
  }
  private expensesDiv() {
    if (!show.get(expensesView).display) {
      return;
    }
    const chartVisible = showContent.get(expensesChart).display
      && this.state.modelData.expenses.length > 0;
    const tableVisible = showContent.get(expensesTable).display
      && this.state.modelData.expenses.length > 0;
    return (
      <div style={{ display: getDisplay(expensesView) ? 'block' : 'none' }}>
        <h2 id="ExpensesHeader">Model {modelName}: Expenses</h2>
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(expensesChart);
          }}
          title={`${showContent.get(expensesChart).display
            ? 'Hide '
            : 'Show '}${expensesChart.lc}`}
          type={showContent.get(expensesChart).display
            ? 'primary'
            : 'secondary'}
          key={expensesChart.lc}
          id={`toggle-expensesChart`}
        />
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(expensesTable);
          }}
          title={`${showContent.get(expensesTable).display
            ? 'Hide '
            : 'Show '}${expensesTable.lc}`}
          type={showContent.get(expensesTable).display
            ? 'primary'
            : 'secondary'}
          key={expensesTable.lc}
          id={`toggle-expensesTable`}
        />
        <div style={{ display: chartVisible
          ? 'block'
          : 'none'}}>
        <ReactiveTextArea
          identifier="expenseDataDump"
          message={showObj(this.state.expensesChartData)}
        />
        <h3>Expense types</h3>:
        {this.makeFiltersList(
            this.state.modelData.expenses,
            this.getExpenseChartFocus(),
            expenseChartFocus,
            expenseChartFocusAll,
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
        <div style={{ display: tableVisible
          ? 'block'
          : 'none'}}>
        <fieldset>
          <div className="dataGridExpenses">
            <DataGrid
              handleGridRowsUpdated={handleExpenseGridRowsUpdated}
              rows={this.state.modelData.expenses.map((obj: IDbExpense) => {
                const result = {
                  END: obj.END,
                  CPI_IMMUNE:
                    makeStringFromBoolean(obj.CPI_IMMUNE),
                  GROWTH: obj.GROWTH,
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
                },
                {
                  ...defaultColumn,
                  key: 'VALUE_SET',
                  name: 'value date',
                },
                {
                  ...defaultColumn,
                  key: 'START',
                  name: 'start',
                },
                {
                  ...defaultColumn,
                  key: 'END',
                  name: 'end',
                },
                {
                  ...defaultColumn,
                  key: 'GROWTH',
                  name: 'annual growth',
                },
                {
                  ...defaultColumn,
                  key: 'CPI_IMMUNE',
                  name: 'cpi-immune',
                },
                {
                  ...defaultColumn,
                  key: 'CATEGORY',
                  name: 'category',
                },
              ]}
            />
          </div>
          <p/>
        </fieldset>
        </div>
        <div className="addNewExpense">
          <h4> Add or delete expense </h4>
          <AddDeleteExpenseForm
            checkFunction = {checkExpense}
            submitFunction = {submitExpense}
            deleteFunction = {deleteExpenseFromTable}
            submitTrigger = {submitTrigger}
            model = {this.state.modelData}
          />
        </div>
      </div>
    );
  }
  private getIncomeChartFocus() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return incomeChartFocusAll;
    }
    const categoryName = getSettings(
      this.state.modelData.settings,
      incomeChartFocus,
      incomeChartFocusAll, // default fallback
    );
    return categoryName;
  }
  private incomesDiv() {
    if (!show.get(incomesView).display) {
      return;
    }
    // log('rendering an incomesDiv');
    const chartVisible = showContent.get(incomesChart).display
      && this.state.modelData.incomes.length > 0;
    const tableVisible = showContent.get(incomesTable).display
      && this.state.modelData.incomes.length > 0;
    return (
      <div style={{ display: getDisplay(incomesView) ? 'block' : 'none' }}>
        <h2 id="IncomesHeader">Model {modelName}: Incomes</h2>
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(incomesChart);
          }}
          title={`${showContent.get(incomesChart).display
            ? 'Hide '
            : 'Show '}${incomesChart.lc}`}
          type={showContent.get(incomesChart).display
            ? 'primary'
            : 'secondary'}
          key={incomesChart.lc}
          id={`toggle-incomesChart`}
        />
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(incomesTable);
          }}
          title={`${showContent.get(incomesTable).display
            ? 'Hide '
            : 'Show '}${incomesTable.lc}`}
          type={showContent.get(incomesTable).display
            ? 'primary'
            : 'secondary'}
          key={incomesTable.lc}
          id={`toggle-incomesTable`}
        />
        <div style={{ display: chartVisible
          ? 'block'
          : 'none'}}>
        <h3>Income types</h3>:
        {this.makeFiltersList(
            this.state.modelData.incomes,
            this.getIncomeChartFocus(),
            incomeChartFocus,
            incomeChartFocusAll,
            incomeChartFocusHint,
        )}
        {this.coarseFineList()}
        <fieldset>
          <ReactiveTextArea
            identifier="incomeDataDump"
            message={showObj(this.state.incomesChartData)}
          />
          <CanvasJSChart
            options={{
              ...defaultChartSettings,
              data: this.state.incomesChartData,
            }}
          />
          </fieldset>
          </div>
          <div style={{ display: tableVisible
          ? 'block'
          : 'none'}}>
          <fieldset>
          <div className="dataGridIncomes">
            <DataGrid
              handleGridRowsUpdated={handleIncomeGridRowsUpdated}
              rows={this.state.modelData.incomes.map((obj: IDbIncome) => {
                const result = {
                  END: obj.END,
                  CPI_IMMUNE:
                    makeStringFromBoolean(obj.CPI_IMMUNE),
                  GROWTH: obj.GROWTH,
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
                },
                {
                  ...defaultColumn,
                  key: 'VALUE_SET',
                  name: 'value date',
                },
                {
                  ...defaultColumn,
                  key: 'START',
                  name: 'start',
                },
                {
                  ...defaultColumn,
                  key: 'END',
                  name: 'end',
                },
                {
                  ...defaultColumn,
                  key: 'GROWTH',
                  name: 'annual growth',
                },
                {
                  ...defaultColumn,
                  key: 'CPI_IMMUNE',
                  name: 'cpi-immune',
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
          <p/>
        </fieldset>
      </div>
      <div className="addNewIncome">
        <h4> Add or delete income </h4>
        <AddDeleteIncomeForm
          checkFunction = {checkIncome}
          submitFunction = {submitIncome}
          deleteFunction = {deleteIncomeFromTable}
          submitTrigger = {submitTrigger}
          model = {this.state.modelData}
        />
      </div>
    </div>
    );
  }
  private overviewDiv() {
    if (!show.get(overview).display) {
      return;
    }
    return (
      <div style={{ display: getDisplay(overview) ? 'block' : 'none' }}>
        <h2 id="OverviewHeader">Model {modelName}: Overview</h2>
        This model has
        &nbsp;{this.state.modelData.triggers.length} important dates,
        &nbsp;{this.state.modelData.incomes.length} incomes,
        &nbsp;{this.state.modelData.expenses.length} expenses,
        &nbsp;{this.state.modelData.assets.length} assets,
        &nbsp;{this.state.modelData.transactions.length} transactions and
        &nbsp;{this.state.modelData.settings.length} settings.
        <br/><br/>
        The
        &nbsp;<Button
          action={() => {toggle(triggersView); }}
          type={'secondary'}
          title={'important dates'}
          id="switchToTriggers"
        />&nbsp;
        are called
        {this.state.modelData.triggers.map(t => ` "${t.NAME}"`)}
        <br/><br/>
        The
        &nbsp;<Button
          action={() => {toggle(incomesView); }}
          type={'secondary'}
          title={'incomes'}
          id="switchToIncomes"
        />&nbsp;
        are called
        {this.state.modelData.incomes.map(t => ` "${t.NAME}"`)}
        <br/><br/>
        The
        &nbsp;<Button
          action={() => {toggle(expensesView); }}
          type={'secondary'}
          title={'expenses'}
          id="switchToExpenses"
         />&nbsp;
         are called
        {this.state.modelData.expenses.map(t => ` "${t.NAME}"`)}
        <br/><br/>
        The
        &nbsp;<Button
          action={() => {toggle(assetsView); }}
          type={'secondary'}
          title={'assets'}
          id="switchToAssets"
        />&nbsp;
        are called
        {this.state.modelData.assets.map(t => ` "${t.NAME}"`)}
        <br/><br/>
        The
        &nbsp;<Button
          action={() => {toggle(transactionsView); }}
          type={'secondary'}
          title={'transactions'}
          id="switchToTransactions"
        />&nbsp;
        are called
        {this.state.modelData.transactions.map(t => ` "${t.NAME}"`)}
        <br/><br/>
        The
        &nbsp;<Button
          action={() => {toggle(settingsView); }}
          type={'secondary'}
          title={'settings'}
          id="switchToSettings"
        />&nbsp;
        are called
        {this.state.modelData.settings.map(t => ` "${t.NAME}"`)}
      </div>
    );
  }

  private triggersDiv() {
    if (!show.get(triggersView).display) {
      return;
    }
    const chartVisible = showContent.get(triggersTable).display
      && this.state.modelData.triggers.length > 0;
    return (
      <div style={{ display: getDisplay(triggersView) ? 'block' : 'none' }}>
        <h2 id="TriggersHeader">Model {modelName}: Important dates</h2>
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(triggersTable);
          }}
          title={`${showContent.get(triggersTable).display
            ? 'Hide '
            : 'Show '}${triggersTable.lc}`}
          type={showContent.get(triggersTable).display
            ? 'primary'
            : 'secondary'}
          key={triggersTable.lc}
          id={`toggle-triggersChart`}
        />
        <div style={{ display: chartVisible
          ? 'block'
          : 'none'}}>
        <fieldset>
          <div className="dataGridTriggers">
            <DataGrid
              handleGridRowsUpdated={handleTriggerGridRowsUpdated}
              rows={this.state.modelData.triggers.map((obj: IDbTrigger) => {
                const result = {
                  TRIGGER_DATE: obj.TRIGGER_DATE.toDateString(),
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
                  key: 'TRIGGER_DATE',
                  name: 'date',
                },
              ]}
            />
          </div>
          </fieldset>
        </div>
        <p/>
        <div className="addNewTrigger">
          <h4> Add or delete important date </h4>
          <AddDeleteTriggerForm
            checkFunction = {checkTrigger}
            submitFunction = {submitTrigger}
            deleteFunction = {deleteTriggerFromTable}
            showTriggerTable = {() => {
              // force show if we have exactly one trigger
              // log(`has ${this.state.modelData.triggers} triggers...`)
              if (this.state.modelData.triggers.length === 1) {
                showContent.set(triggersTable, {
                  display: true,
                });
              }
            }}
            model = {this.state.modelData}
          />
        </div>
      </div>
    );
  }
  private getSingleAssetName() {
    if (this.state.modelData.settings.length === 0) {
      // data not yet loaded
      return CASH_ASSET_NAME;
    }
    const assetName = getSettings(
      this.state.modelData.settings,
      singleAssetName,
      CASH_ASSET_NAME, // default fallback
    );
    return assetName;
  }
  private assetsList() {
    const assets: string[] = this.state.modelData.assets.map(
      (data) => {
        return data.NAME;
      },
    );
    assets.unshift(allAssets);
    this.state.modelData.assets.forEach(
      (data) => {
        const cat = data.CATEGORY;
        if (cat !== '') {
          if (assets.indexOf(cat) < 0) {
            assets.push(cat);
          }
        }
      },
    );
    const selectedAsset = this.getSingleAssetName();
    const buttons = assets.map((asset) =>
        <Button
          key={asset}
          action={(e: any) => {
            e.persist();
            // when a button is clicked,
            // go to change the settings value
            const forSubmission: IDbSetting = {
              NAME: singleAssetName,
              VALUE: asset,
              HINT: singleAssetNameHint,
            };
            submitSetting(forSubmission);
          }}
          title={asset}
          type={(asset === selectedAsset) ? 'primary' : 'secondary'}
          id={`chooseSingelAssetSetting`}
        />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
  }
  private getSingleAssetView() {
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
    const selectedSingleAssetView = this.getSingleAssetView();
    const buttons = viewTypes.map((viewType) =>
        <Button
          key={viewType}
          action={(e: any) => {
            e.persist();
            // when a button is clicked,
            // go to change the settings value
            const forSubmission: IDbSetting = {
              NAME: assetChartView,
              VALUE: viewType,
              HINT: assetChartHint,
            };
            submitSetting(forSubmission);
          }}
          title={viewType}
          type={(viewType === selectedSingleAssetView)
            ? 'primary' : 'secondary'}
          id="chooseAssetChartType"
        />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
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
    const viewTypes: string[] = [
      coarse,
      fine,
    ];
    const selectedCoarseFineView = this.getCoarseFineView();
    const buttons = viewTypes.map((viewType) =>
        <Button
          key={viewType}
          action={(e: any) => {
            e.persist();
            // when a button is clicked,
            // go to change the settings value
            const forSubmission: IDbSetting = {
              NAME: viewDetail,
              VALUE: viewType,
              HINT: viewDetailHint,
            };
            submitSetting(forSubmission);
          }}
          title={viewType}
          type={(viewType === selectedCoarseFineView)
            ? 'primary' : 'secondary'}
          id="chooseViewDetailType"
        />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
  }
  private assetsDiv() {
    if (!show.get(assetsView).display) {
      return;
    }
    const chartVisible = showContent.get(assetsChart).display
      && this.state.modelData.assets.length > 0;
    const tableVisible = showContent.get(assetsTable).display
      && this.state.modelData.assets.length > 0;
    return (
      <div style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}>
        <h2 id="AssetsHeader">Model {modelName}: Assets</h2>
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(assetsChart);
          }}
          title={`${showContent.get(assetsChart).display
            ? 'Hide '
            : 'Show '}${assetsChart.lc}`}
          type={showContent.get(assetsChart).display
            ? 'primary'
            : 'secondary'}
          key={assetsChart.lc}
          id="toggleAssetsChart"
        />
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(assetsTable);
          }}
          title={`${showContent.get(assetsTable).display
            ? 'Hide '
            : 'Show '}${assetsTable.lc}`}
          type={showContent.get(assetsTable).display
            ? 'primary'
            : 'secondary'}
          key={assetsTable.lc}
          id="toggleAssetsTable"
        />
        <div style={{ display: chartVisible
          ? 'block'
          : 'none'}}>
        {this.assetsList()}
        <h3>Asset view type:</h3>
        {this.assetViewTypeList()}
        {this.coarseFineList()}
        <ReactiveTextArea
            identifier="assetDataDump"
            message={showObj(this.state.singleAssetChartData)}
          />
        <CanvasJSChart
          options={{
            ...defaultChartSettings,
            data: this.state.singleAssetChartData,
          }}
        />
        </div>
        <div style={{ display: tableVisible
          ? 'block'
          : 'none'}}>
        <fieldset>
          <h3>Assets</h3>
          <div className="dataGridAssets">
            <DataGrid
              handleGridRowsUpdated={handleAssetGridRowsUpdated}
              rows={this.state.modelData.assets.map((obj: IDbAsset) => {
                const result: IDbAsset = {
                  ASSET_GROWTH: obj.ASSET_GROWTH,
                  NAME: obj.NAME,
                  CATEGORY: obj.CATEGORY,
                  ASSET_START: obj.ASSET_START,
                  ASSET_VALUE: obj.ASSET_VALUE,
                  ASSET_LIABILITY: obj.ASSET_LIABILITY,
                  ASSET_PURCHASE_PRICE: obj.ASSET_PURCHASE_PRICE,
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
                  key: 'ASSET_VALUE',
                  name: 'value',
                },
                {
                  ...defaultColumn,
                  key: 'ASSET_START',
                  name: 'start',
                },
                {
                  ...defaultColumn,
                  key: 'ASSET_GROWTH',
                  name: 'growth',
                },
                {
                  ...defaultColumn,
                  key: 'ASSET_LIABILITY',
                  name: 'liability',
                },
                {
                  ...defaultColumn,
                  key: 'ASSET_PURCHASE_PRICE',
                  name: 'purchase price',
                },
                {
                  ...defaultColumn,
                  key: 'CATEGORY',
                  name: 'category',
                },
              ]}
            />
          </div>
          <p/>
        </fieldset>
        </div>
        <div className="addNewAsset">
          <h4> Add or delete asset </h4>
          <AddDeleteAssetForm
            checkFunction = {checkAsset}
            submitFunction = {submitAsset}
            deleteFunction = {deleteAssetFromTable}
            submitTrigger = {submitTrigger}
            model = {this.state.modelData}
          />
        </div>
      </div>
    );
  }
  private transactionsDiv() {
    if (!show.get(transactionsView).display) {
      return;
    }
    const tableVisible = showContent.get(transactionsTable).display
      && this.state.modelData.transactions.length > 0;
    return (
      <div style={{ display: getDisplay(transactionsView) ? 'block' : 'none' }}>
        <h2 id="TransactionsHeader">Model {modelName}: Transactions</h2>
        <Button
          action={(event: any) => {
            event.persist();
            toggleCharts(transactionsTable);
          }}
          title={`${showContent.get(transactionsTable).display
            ? 'Hide '
            : 'Show '}${transactionsTable.lc}`}
          type={showContent.get(transactionsTable).display
            ? 'primary'
            : 'secondary'}
          key={transactionsTable.lc}
          id="toggleTransactionsChart"
        />
        <fieldset>
          <div
            className="dataGridTransactions"
            style={{ display: tableVisible
              ? 'block'
              : 'none',
            }}
          >
            <DataGrid
              handleGridRowsUpdated={handleTransactionGridRowsUpdated}
              rows={this.state.modelData.transactions.map(
                (obj: IDbTransaction) => {
                  // log(`obj.TRANSACTION_FROM_ABSOLUTE = ${obj.TRANSACTION_FROM_ABSOLUTE}`)
                  const result = {
                    TRANSACTION_DATE: obj.TRANSACTION_DATE,
                    TRANSACTION_FROM: obj.TRANSACTION_FROM,
                    TRANSACTION_FROM_VALUE: obj.TRANSACTION_FROM_VALUE,
                    TRANSACTION_FROM_ABSOLUTE:
                      makeStringFromBoolean(obj.TRANSACTION_FROM_ABSOLUTE),
                    NAME: obj.NAME,
                    TRANSACTION_TO: obj.TRANSACTION_TO,
                    TRANSACTION_TO_VALUE: obj.TRANSACTION_TO_VALUE,
                    TRANSACTION_TO_ABSOLUTE:
                      makeStringFromBoolean(obj.TRANSACTION_TO_ABSOLUTE),
                    TRANSACTION_STOP_DATE: obj.TRANSACTION_STOP_DATE,
                    TRANSACTION_RECURRENCE: obj.TRANSACTION_RECURRENCE,
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
                  key: 'TRANSACTION_FROM',
                  name: 'from asset',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_TO',
                  name: 'to asset',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_FROM_VALUE',
                  name: 'from value',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_FROM_ABSOLUTE',
                  name: 'absolute',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_TO_VALUE',
                  name: 'to value',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_TO_ABSOLUTE',
                  name: 'absolute',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_DATE',
                  name: 'date',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_RECURRENCE',
                  name: 'recurrence',
                },
                {
                  ...defaultColumn,
                  key: 'TRANSACTION_STOP_DATE',
                  name: 'stop',
                },
                {
                  ...defaultColumn,
                  key: 'CATEGORY',
                  name: 'category',
                },
              ]}
            />
          </div>
          <p/>
          <div className="addNewTransaction">
            <h4> Add or delete transaction </h4>
            <AddDeleteTransactionForm
              checkFunction = {checkTransaction}
              submitFunction = {submitTransaction}
              deleteFunction = {deleteTransactionFromTable}
              submitTrigger = {submitTrigger}
              model = {this.state.modelData}
            />
          </div>
        </fieldset>
      </div>
    );
  }

  private buttonList(views: any[]) {
    const buttons = views.map((view) =>
      <Button
        action={(event: any) => {
          event.persist();
          toggle(view);
        }}
        title={view.lc}
        type={show.get(view).display ? 'primary' : 'secondary'}
        key={view.lc}
        id={`btn-${view.lc}`}
    />,
    );
    return (
      <div role="group">
        {buttons}
      </div>
    );
  }
  private makeHelpText() {
    const it = show.keys();
    let entry = it.next();
    while (!entry.done) {
      if (getDisplay(entry.value)) {
        return (<h4 className="text-white">
          {helpText.get(entry.value.lc)}
        </h4>);
      }
      entry = it.next();
    }
    return;
  }
  private navigationDiv() {
    return (
      <div>
      {this.buttonList([ // this is show.keys() but this is ordered
        homeView,
        overview,
        triggersView,
        incomesView,
        expensesView,
        assetsView,
        transactionsView,
        settingsView,
        manageModelsView,
      ])
      }
      {this.makeHelpText()}
      </div>
    );
  }
}

// generates text for SampleData.ts
export async function stringifyDB(): Promise<string> {
  let result = '';
/* eslint-disable no-multi-str */
  result +=
    'import {\n\
      CASH_ASSET_NAME,\n\
      singleAssetChartView,\n\
      cpi,\n\
      roiEnd,\n\
      roiStart,\n\
      viewDetail,\n\
      viewFrequency,\n\
      birthDate,\n\
     } from \'./assets\';\n' +
    'import {\n\
      IDbAsset,\n\
      IDbExpense,\n\
      IDbIncome,\n\
      IDbSetting, \n\
      IDbTransaction,\n\
      IDbTrigger,\n\
    } from \'./common/interfaces\';\n\n';
/* eslint-disable no-multi-str */

  const model = await getDbModel(modelName);

  result += 'export const sampleTriggers: IDbTrigger[] = ';
  const trigs: IDbTrigger[] = model.triggers;
  result += '[\n';
  trigs.forEach((trig) => {
    result += '\t{\n';
    result += `\t\tNAME: '${trig.NAME}',\n`;
    result += `\t\tTRIGGER_DATE: new Date('${trig.TRIGGER_DATE.toDateString()}'),\n`;
    result += '\t},\n';
  });
  result += '];\n\n';

  result += 'export const sampleExpenses: IDbExpense[] = ';
  result += showObj(model.expenses);
  result += ';\n\n';

  result += 'export const sampleIncomes: IDbIncome[] = ';
  result += showObj(model.incomes);
  result += ';\n\n';

  result += 'export const sampleAssets: IDbAsset[] = ';
  result += showObj(model.assets);
  result += ';\n\n';

  result += 'export const sampleTransactions: IDbTransaction[] = ';
  result += showObj(model.transactions);
  result += ';\n';

  result += 'export const sampleSettings: IDbSetting[] = ';
  result += showObj(model.settings);
  result += ';\n';

  result = result.replace(/"NAME"/g, 'NAME');
  result = result.replace(/"VALUE"/g, 'VALUE');
  result = result.replace(/"HINT"/g, 'HINT');
  result = result.replace(/"VALUE_SET"/g, 'VALUE_SET');
  result = result.replace(/"CATEGORY"/g, 'CATEGORY');
  result = result.replace(/"START"/g, 'START');
  result = result.replace(/"END"/g, 'END');
  result = result.replace(/"GROWTH"/g, 'GROWTH');
  result = result.replace(/"CPI_IMMUNE"/g, 'CPI_IMMUNE');
  result = result.replace(/"LIABILITY"/g, 'LIABILITY');
  result = result.replace(/"ASSET_START"/g, 'ASSET_START');
  result = result.replace(/"ASSET_VALUE"/g, 'ASSET_VALUE');
  result = result.replace(/"ASSET_GROWTH"/g, 'ASSET_GROWTH');
  result = result.replace(/"ASSET_LIABILITY"/g, 'ASSET_LIABILITY');
  result = result.replace(/"ASSET_PURCHASE_PRICE"/g, 'ASSET_PURCHASE_PRICE');
  result = result.replace(/"TRANSACTION_FROM"/g, 'TRANSACTION_FROM');
  result = result.replace(/"TRANSACTION_FROM_ABSOLUTE"/g, 'TRANSACTION_FROM_ABSOLUTE');
  result = result.replace(/"TRANSACTION_FROM_VALUE"/g, 'TRANSACTION_FROM_VALUE');
  result = result.replace(/"TRANSACTION_TO"/g, 'TRANSACTION_TO');
  result = result.replace(/"TRANSACTION_TO_ABSOLUTE"/g, 'TRANSACTION_TO_ABSOLUTE');
  result = result.replace(/"TRANSACTION_TO_VALUE"/g, 'TRANSACTION_TO_VALUE');
  result = result.replace(/"TRANSACTION_DATE"/g, 'TRANSACTION_DATE');
  result = result.replace(/"TRANSACTION_STOP_DATE"/g, 'TRANSACTION_STOP_DATE');
  result = result.replace(/"TRANSACTION_RECURRENCE"/g, 'TRANSACTION_RECURRENCE');
  let re = new RegExp(`\"+${CASH_ASSET_NAME}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'CASH_ASSET_NAME');
  re = new RegExp(`\"+${assetChartView}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'assetChartView');
  re = new RegExp(`\"+${singleAssetName}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'singleAssetName');
  re = new RegExp(`\"+${expenseChartFocus}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'expenseChartFocus');
  re = new RegExp(`\"+${incomeChartFocus}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'incomeChartFocus');
  re = new RegExp(`\"+${roiEnd}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'roiEnd');
  re = new RegExp(`\"+${roiStart}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'roiStart');
  re = new RegExp(`\"+${viewFrequency}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'viewFrequency');
  re = new RegExp(`\"+${viewDetail}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'viewDetail');
  re = new RegExp(`\"+${cpi}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'cpi');
  re = new RegExp(`\"+${birthDate}\"`, 'g'); // eslint-disable-line no-useless-escape
  result = result.replace(re, 'birthDate');

  result = result.replace(/"/g, '\'');

  return result;
}

export default App;
