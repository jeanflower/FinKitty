import React, { Component } from 'react';
import {
  billAndBenExampleData,
  mortgageSwitchExampleData,
  simpleExampleData,
  pension1ExampleData,
} from './models/exampleModels';
import { useAuth0 } from './contexts/auth0-context';
import { makeChartData } from './models/charting';
import { checkData, checkTransaction, checkTrigger } from './models/checks';
import { getDB } from './database/database';
import { AddDeleteEntryForm } from './views/reactComponents/AddDeleteEntryForm';
import { AddDeleteTransactionForm } from './views/reactComponents/AddDeleteTransactionForm';
import { AddDeleteTriggerForm } from './views/reactComponents/AddDeleteTriggerForm';
import Button from './views/reactComponents/Button';
import {
  taxPot,
  exampleModelName,
  custom,
  autogen,
} from './localization/stringConstants';
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
  DbItem,
} from './types/interfaces';
import { log, makeModelFromJSON, printDebug, showObj } from './utils';
import { loginPage } from './views/loginPage';
import { screenshotsDiv } from './views/screenshotsPage';
import {
  settingsTableDiv,
  transactionsTableDiv,
  triggersTableDiv,
} from './views/tablePages';
import { overviewDiv } from './views/overviewPage';
import { taxDiv } from './views/chartPages';
import { incomesDiv } from './views/incomesPage';
import { expensesDiv } from './views/expensesPage';
import { assetsDiv } from './views/assetsPage';
import ReactTooltip from 'react-tooltip';
import { debtsDiv } from './views/debtsPage';

import CryptoJS from 'crypto-js';

// import './bootstrap.css'

export let modelName: string = exampleModelName;
let userID = '';

function App() {
  const {
    isLoading,
    user,
    loginWithRedirect,
    loginForTesting,
    logout,
  } = useAuth0();
  if (!isLoading && !user) {
    userID = '';
    return loginPage(loginWithRedirect, loginForTesting);
  }
  if (!isLoading && user) {
    userID = user.sub;
    return (
      <AppContent
        logOutAction={() => {
          if (userID === 'TestUserID') {
            log(`logout ${userID}`);
            // try to be graceful without network connection...
            // userID = '';
            // return loginPage(loginWithRedirect, loginForTesting);
            // at the moment if there's no network access,
            // logging out takes you to a "no network" error page
            // but if we're using the testID we don't need to
            // contact Auth0 ...
            // current workaround is to navigate back in browser
            // to get back to login page
          }
          return logout({
            returnTo:
              window.location.origin + process.env.REACT_APP_ORIGIN_APPENDAGE,
          });
        }}
        user={user}
      ></AppContent>
    );
  }
  userID = '';
  return null;
}

interface ViewType {
  lc: string;
}
const homeView: ViewType = { lc: 'Home' };
export const expensesView: ViewType = { lc: 'Expenses' };
export const incomesView: ViewType = { lc: 'Incomes' };
export const transactionsView: ViewType = { lc: 'Transactions' };
export const assetsView: ViewType = { lc: 'Assets' };
export const debtsView: ViewType = { lc: 'Debts' };
export const triggersView: ViewType = { lc: 'Important dates' };
export const settingsView: ViewType = { lc: 'Settings' };
export const taxView: ViewType = { lc: 'Tax payments' };

export const expensesChart: ViewType = { lc: 'Expenses chart' };
export const incomesChart: ViewType = { lc: 'Incomes chart' };
export const assetsChart: ViewType = { lc: 'Assets chart' };
export const debtsChart: ViewType = { lc: 'Debts chart' };

export const expensesTable: ViewType = { lc: 'Expenses table' };
export const incomesTable: ViewType = { lc: 'Incomes table' };
export const assetsTable: ViewType = { lc: 'Assets table' };
export const debtsTable: ViewType = { lc: 'Debts table' };
export const transactionsTable: ViewType = { lc: 'Transactions table' };
export const triggersTable: ViewType = { lc: 'Important dates table' };
export const settingsTable: ViewType = { lc: 'Settings table' };

export const overview: ViewType = { lc: 'Overview' };

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
    debtsView,
    {
      display: true,
      helpText: 'Create, view or edit debts',
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

const exampleModels = [
  {
    name: exampleModelName,
    model: simpleExampleData,
  },
  {
    name: 'Bill and Ben',
    model: billAndBenExampleData,
  },
  {
    name: 'Mortgage Switch',
    model: mortgageSwitchExampleData,
  },
  {
    name: 'Pension',
    model: pension1ExampleData,
  },
];
export const showContent = new Map<ViewType, any>([
  [incomesChart, { display: false }],
  [expensesChart, { display: false }],
  [assetsChart, { display: false }],
  [debtsChart, { display: false }],
  [incomesTable, { display: true }],
  [expensesTable, { display: true }],
  [assetsTable, { display: true }],
  [debtsTable, { display: true }],
  [transactionsTable, { display: true }],
  [triggersTable, { display: true }],
  [settingsTable, { display: true }],
]);

let reactAppComponent: AppContent;

export function getDisplay(type: ViewType) {
  const view = views.get(type);
  if (view === undefined) {
    log(`Error : unrecognised view ${type}`);
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

function lessThan(a: string, b: string) {
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function getUserID() {
  return userID;
}

function getExampleModel(modelString: string) {
  return makeModelFromJSON(modelString);
}

async function refreshData(goToDB = true) {
  // log('refreshData in AppContent - get data and redraw content');
  if (goToDB) {
    // log('refreshData do visit db');
    // go to the DB to retreive updated data
    let modelNames: string[] = [];
    try {
      modelNames = await getDB().getModelNames(getUserID());
    } catch (error) {
      alert(`error contacting database ${error}`);
      return;
    }
    // log(`got ${modelNames.length} modelNames`);

    let model;
    if (
      modelNames.length === 0 ||
      (modelName === exampleModelName &&
        modelNames.find(x => {
          return x === exampleModelName;
        }) === undefined)
    ) {
      // log(`modelNames are ${modelNames}`);
      // log(`does not include ${exampleModelName}, so`);
      if (modelNames.length > 0) {
        modelName = modelNames.sort()[0];
        // log(`switch to a different modelName ${modelName}`);
        try {
          model = await getDB().loadModel(getUserID(), modelName);
        } catch (err) {
          alert(`Cannot load ${modelName}; consider 'Force delete'?`);
        }
        if (model === undefined) {
          alert('problem with model data');
          return;
        }
      } else {
        // log('recreate example models');
        // force us to have the example models
        Promise.all(
          exampleModels.map(async x => {
            await getDB().ensureModel(getUserID(), x.name);
            return getDB().saveModel(
              getUserID(),
              x.name,
              getExampleModel(x.model),
            );
          }),
        );
        modelNames = exampleModels.map(x => {
          return x.name;
        });
        model = getExampleModel(simpleExampleData);
        modelName = exampleModelName;
      }
    } else {
      // log(`modelNames are ${modelNames}`);
      // log(`go load ${modelName}`);
      let gotModelOK = true;
      try {
        // log(`look for ${modelName} from ${modelNames}`);
        model = await getDB().loadModel(getUserID(), modelName);
      } catch (err) {
        // log('no model found');
        log(`Cannot load ${modelName}. Consider 'Force delete'?`);
        gotModelOK = false;
      }
      if (!gotModelOK || model === undefined) {
        //log('no model found - do not try to display anything');
        return;
      }
    }

    // log(`got ${model}`);

    model.triggers.sort((a: any, b: any) => lessThan(a.NAME, b.NAME));
    model.expenses.sort((a: any, b: any) => lessThan(a.NAME, b.NAME));
    model.settings.sort((a: any, b: any) => lessThan(a.NAME, b.NAME));
    model.incomes.sort((a: any, b: any) => lessThan(a.NAME, b.NAME));
    model.transactions.sort((a: any, b: any) => lessThan(a.NAME, b.NAME));
    model.assets.sort((a: any, b: any) => lessThan(a.NAME, b.NAME));
    modelNames.sort((a: any, b: any) => lessThan(a, b));

    if (
      model.assets.filter((a: any) => {
        return a.NAME === taxPot;
      }).length === 0
    ) {
      model.assets.push({
        NAME: taxPot,
        START: '1 Jan 2017',
        VALUE: '0',
        QUANTITY: '',
        GROWTH: '0',
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
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
    const { expensesData, incomesData, assetData, debtData, taxData } = result;

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
    const debtChartData = makeJChartData(debtData);
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
          debtChartData,
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
    // log('refreshData in no need to visit db');
    reactAppComponent.setState({ ...reactAppComponent.state });
  }
}

export function toggle(type: ViewType) {
  for (const k of views.keys()) {
    if (k !== type) {
      const view = views.get(k);
      if (view === undefined) {
        log(`Error : unrecognised view ${type}`);
        return;
      }
      view.display = false;
    }
  }
  const view = views.get(type);
  if (view === undefined) {
    log(`Error : unrecognised view ${type}`);
    return false;
  }
  view.display = true;
  refreshData(false);
}

export function toggleDisplay(type: ViewType) {
  showContent.set(type, {
    display: !showContent.get(type).display,
  });
  refreshData(false);
}

function checkModelData(givenModel: DbModelData) {
  const response = checkData(givenModel);
  if (response === '') {
    alert('model check all good');
  } else {
    alert(response);
  }
}
function updateItemList(itemList: DbItem[], newData: DbItem) {
  const idx = itemList.findIndex((i: DbItem) => {
    return i.NAME === newData.NAME;
  });
  if (idx !== -1) {
    itemList.splice(idx, 1);
  }
  itemList.push(newData);
}

export async function submitExpense(expenseInput: DbExpense) {
  if (printDebug()) {
    log(`in submitExpense with input : ${showObj(expenseInput)}`);
  }
  updateItemList(reactAppComponent.state.modelData.expenses, expenseInput);
  await getDB().saveModel(
    getUserID(),
    modelName,
    reactAppComponent.state.modelData,
  );
  await refreshData();
}

export async function submitIncome(incomeInput: DbIncome) {
  if (printDebug()) {
    log(`in submitIncome with input : ${showObj(incomeInput)}`);
  }
  updateItemList(reactAppComponent.state.modelData.incomes, incomeInput);
  await getDB().saveModel(
    getUserID(),
    modelName,
    reactAppComponent.state.modelData,
  );
  await refreshData();
}

export async function submitTrigger(trigger: DbTrigger) {
  if (printDebug()) {
    log(`go to submitTriggers with input : ${showObj(trigger)}`);
  }
  updateItemList(reactAppComponent.state.modelData.triggers, trigger);
  await getDB().saveModel(
    getUserID(),
    modelName,
    reactAppComponent.state.modelData,
  );
  await refreshData();
}

export async function submitNewTrigger(name: string) {
  submitTrigger({
    NAME: name,
    DATE: new Date(),
  });
}

export async function submitAsset(assetInput: DbAsset) {
  if (printDebug()) {
    log(`in submitAsset with input : ${showObj(assetInput)}`);
  }
  updateItemList(reactAppComponent.state.modelData.assets, assetInput);
  await getDB().saveModel(
    getUserID(),
    modelName,
    reactAppComponent.state.modelData,
  );
  await refreshData();
}

export async function submitNewAsset(name: string) {
  submitAsset({
    NAME: name,
    CATEGORY: '',
    START: '1 January 2018',
    VALUE: '0',
    QUANTITY: '',
    GROWTH: '0',
    CPI_IMMUNE: false,
    CAN_BE_NEGATIVE: false,
    IS_A_DEBT: false,
    LIABILITY: '',
    PURCHASE_PRICE: '0',
  });
}

export async function submitTransaction(input: DbTransaction) {
  if (printDebug()) {
    log(`in submitTransaction with input : ${showObj(input)}`);
  }
  updateItemList(reactAppComponent.state.modelData.transactions, input);
  await getDB().saveModel(
    getUserID(),
    modelName,
    reactAppComponent.state.modelData,
  );
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
    TYPE: custom,
  });
}

export async function submitSetting(input: DbSetting) {
  if (printDebug()) {
    log(`in submitSetting with input : ${showObj(input)}`);
  }
  updateItemList(reactAppComponent.state.modelData.settings, input);
  await getDB().saveModel(
    getUserID(),
    modelName,
    reactAppComponent.state.modelData,
  );
  await refreshData();
}

export async function submitNewSetting(name: string) {
  submitSetting({
    NAME: name,
    VALUE: '',
    HINT: '',
  });
}

export async function deleteItemFromModel(
  name: string,
  itemList: DbItem[],
  modelName: string,
  model: DbModelData,
) {
  // log('delete item '+name)
  const idx = itemList.findIndex((i: DbItem) => {
    return i.NAME === name;
  });
  if (idx !== -1) {
    itemList.splice(idx, 1);
    await getDB().saveModel(getUserID(), modelName, model);
    await refreshData();
    return true;
  }
  return false;
}

export async function deleteTriggerFromTable(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.triggers,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteAssetFromTable(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.assets,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteTransactionFromTable(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.transactions,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteExpenseFromTable(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.expenses,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteIncomeFromTable(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.incomes,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteSettingFromTable(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.settings,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function updateModelName(newValue: string) {
  // log(`model name is now ${newValue}`);
  modelName = newValue;
  await getDB().ensureModel(getUserID(), modelName);
  await refreshData();
}

interface AppState {
  modelData: DbModelData;
  expensesChartData: ChartData[];
  incomesChartData: ChartData[];
  assetChartData: ChartData[];
  debtChartData: ChartData[];
  taxChartData: ChartData[];
  modelNamesData: string[];
}
interface AppProps {
  logOutAction: any; // TODO type for function
  user: any; // TODO
}

export class AppContent extends Component<AppProps, AppState> {
  public constructor(props: AppProps) {
    super(props);

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
      debtChartData: [],
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
          <ReactTooltip />
          {this.homeDiv()}
          {overviewDiv(
            this.state.modelData,
            this.state.assetChartData,
            this.state.debtChartData,
            this.state.expensesChartData,
            this.state.incomesChartData,
          )}
          {this.settingsDiv()}
          {incomesDiv(this.state.modelData, this.state.incomesChartData)}
          {expensesDiv(this.state.modelData, this.state.expensesChartData)}
          {assetsDiv(this.state.modelData, this.state.assetChartData)}
          {debtsDiv(this.state.modelData, this.state.debtChartData)}
          {this.transactionsDiv()}
          {taxDiv(this.state.taxChartData)}
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

  private async replaceWithModel(modelName: string, newModel: DbModelData) {
    // log(`replace ${modelName} with new model data`);
    await getDB().saveModel(getUserID(), modelName, newModel);
    await refreshData();
  }

  private async deleteModel(modelNameForDelete: string) {
    if (
      window.confirm(
        `delete all data in model ${modelNameForDelete} - you sure?`,
      )
    ) {
      // log(`delete model ${modelNameForDelete}`);
      const modelNames = await getDB().getModelNames(getUserID());
      await getDB().deleteModel(getUserID(), modelNameForDelete);
      const idx = modelNames.findIndex(i => {
        return i === modelNameForDelete;
      });
      if (idx !== -1) {
        modelNames.splice(idx, 1);
      } else {
        log(`error, deleted ${modelNameForDelete} not found in ${modelNames}`);
      }
      // log(`model names after delete are ${modelNames}`);
      if (modelNames.length === 0) {
        alert('no data left: recreating example model');
        modelName = exampleModelName;
        await getDB().ensureModel(getUserID(), modelName);
        await getDB().saveModel(
          getUserID(),
          modelName,
          makeModelFromJSON(simpleExampleData),
        );
      } else {
        modelName = modelNames.sort()[0];
        // log(`model name after delete is ${modelName}`);
      }
      await refreshData();
    }
  }

  private homeDiv() {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <div style={{ display: getDisplay(homeView) ? 'block' : 'none' }}>
        <h1 id="WelcomeHeader">Welcome</h1>
        <div className="row">
          <div className="col-sm mb-4">
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
              title="Create a new model"
              type="secondary"
            />
            <br />
            <br />
            Select an existing model (for further actions below):
            {this.modelListForSelect(this.state.modelNamesData)}
            <br />
            Actions:
            <br />
            <Button
              action={async () => {
                this.deleteModel(modelName);
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
                checkModelData(reactAppComponent.state.modelData);
              }}
              title="Check model"
              id={`btn-check`}
              type="secondary"
            />
            <br />
            <br />
            Create new models with example data:
            <br />
            {this.exampleButtonList()}
            <br />
            <br />
            Dump to a text format or restore from text format:
            <br />
            <Button
              action={() => {
                const text = JSON.stringify(this.state.modelData);
                navigator.clipboard.writeText(text).then(
                  function() {
                    alert(`model as JSON on clipboard`);
                  },
                  function(err) {
                    console.error('Async: Could not copy text: ', err);
                    alert(
                      `sorry, something went wrong, no copy on clipboard - in console instead`,
                    );
                    log('-------- start of model --------');
                    log(text);
                    log('-------- end of model --------');
                  },
                );
              }}
              title="Copy model as JSON to clipboard"
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
            <Button
              action={() => {
                const inputEnc = prompt('Enter encrypted JSON');
                if (inputEnc === null) {
                  return;
                }
                const secret = prompt('Enter secret key');
                if (secret === null) {
                  return;
                }
                try {
                  const decipher = CryptoJS.AES.decrypt(inputEnc, secret);
                  const decipherString = decipher.toString(CryptoJS.enc.Utf8);
                  log(`deciphered text ${decipherString}`);
                  if (decipherString === undefined) {
                    alert('could not decode this data');
                  } else {
                    const decipheredModel = makeModelFromJSON(decipherString);
                    checkModelData(decipheredModel);
                  }
                } catch (err) {
                  alert('could not decode this data');
                }
              }}
              title="Test encrypted JSON"
              id={`btn-JSON-encrypt-replace`}
              type="secondary"
            />
            <Button
              action={() => {
                const name = prompt('Force delete model name');
                if (name === null) {
                  return;
                }
                this.deleteModel(name);
              }}
              title="Force delete model"
              id={`btn-JSON-encrypt-replace`}
              type="secondary"
            />
          </div>
          <div className="col-md mb-4">{screenshotsDiv()}</div>
        </div>
      </div>
    );
  }

  private settingsDiv() {
    if (!getDisplay(settingsView)) {
      return;
    }
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
          {settingsTableDiv(this.state.modelData)}
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

  private triggersDiv() {
    if (!getDisplay(triggersView)) {
      return;
    }

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
        {triggersTableDiv(this.state.modelData)}
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

  private transactionsDiv() {
    if (!getDisplay(transactionsView)) {
      return;
    }
    const tableVisible = showContent.get(transactionsTable).display;

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
        {tableVisible ? <h4>Custom transactions</h4> : ''}
        {transactionsTableDiv(this.state.modelData, custom)}
        {tableVisible ? <h4>Auto-generated transactions</h4> : ''}
        {transactionsTableDiv(this.state.modelData, autogen)}
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

  private viewButtonList() {
    const buttons: JSX.Element[] = [];
    const it = views.keys();
    let entry = it.next();
    while (!entry.done) {
      const view = entry.value;
      const viewValue = views.get(view);
      if (viewValue === undefined) {
        log(`Error : unrecognised view ${view}`);
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
    buttons.push(
      <Button
        action={(event: any) => {
          event.persist();
          this.props.logOutAction();
        }}
        title="Log out"
        type="primary"
        key="Log out"
        id={`btn-LogOut`}
      />,
    );
    return <div role="group">{buttons}</div>;
  }
  private exampleButtonList() {
    const buttons: JSX.Element[] = exampleModels.map(x => {
      return (
        <Button
          action={async () => {
            const userNewName = this.getNewName();
            if (!userNewName.gotNameOK) {
              return;
            }
            await updateModelName(userNewName.newName);
            this.replaceWithModel(modelName, getExampleModel(x.model));
          }}
          title={`Create ${x.name} example`}
          id={`btn-create-${x.name}-example`}
          key={`btn-create-${x.name}-example`}
          type="secondary"
        />
      );
    });
    return <div role="group">{buttons}</div>;
  }

  private makeHelpText() {
    const it = views.keys();
    let entry = it.next();
    while (!entry.done) {
      if (getDisplay(entry.value)) {
        // log(`views.get(entry.value) = ${showObj(views.get(entry.value))}`);
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
        {this.viewButtonList()}
        {this.makeHelpText()}
      </div>
    );
  }
}

export default App;
