import React, { Component } from 'react';
import { simpleExampleData, pension1ExampleData } from './models/exampleModels';
import { useAuth0 } from './contexts/auth0-context';
import { makeChartData } from './models/charting';
import { checkData, checkTransaction, checkTrigger } from './models/checks';
import { AddDeleteTransactionForm } from './views/reactComponents/AddDeleteTransactionForm';
import { AddDeleteTriggerForm } from './views/reactComponents/AddDeleteTriggerForm';
import Button from './views/reactComponents/Button';
import {
  exampleModelName,
  custom,
  autogen,
  roiEnd,
  roiStart,
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
import {
  log,
  makeModelFromJSON,
  printDebug,
  showObj,
  lessThan,
  getTodaysDate,
  emptyModel,
  attemptRenameLong,
  revertToUndoModel,
  applyRedoToModel,
} from './utils';
import { loginPage } from './views/loginPage';
import { screenshotsDiv } from './views/screenshotsPage';
import {
  settingsTableDiv,
  transactionsTableDiv,
  triggersTableDiv,
  defaultColumn,
} from './views/tablePages';
import { overviewDiv } from './views/overviewPage';
import { taxDiv } from './views/chartPages';
import { incomesDiv } from './views/incomesPage';
import { expensesDiv } from './views/expensesPage';
import { assetsDiv } from './views/assetsPage';
import { debtsDiv } from './views/debtsPage';

import CryptoJS from 'crypto-js';
import {
  submitNewSettingLSM,
  submitTriggerLSM,
  submitTransactionLSM,
  submitAssetLSM,
  submitExpenseLSM,
  submitIncomeLSM,
  submitSettingLSM,
  getModelNames,
  loadModel,
  ensureModel,
  deleteModel,
  saveModelLSM,
  saveModelToDBLSM,
} from './database/loadSaveModel';
import DataGrid from './views/reactComponents/DataGrid';
import SimpleFormatter from './views/reactComponents/NameFormatter';
import { AddDeleteSettingForm } from './views/reactComponents/AddDeleteSettingForm';
import { ReplaceWithJSONForm } from './views/reactComponents/ReplaceWithJSONForm';
import { CreateModelForm } from './views/reactComponents/CloneModelForm';
import { Form, Nav, Navbar } from 'react-bootstrap';
import FinKittyCat from './views/cat.png';

// import './bootstrap.css'

let modelName: string = exampleModelName;
let userID = '';
let isDirty = false; // does the model need saving?

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
export const triggersView: ViewType = { lc: 'Dates' };
export const settingsView: ViewType = { lc: 'Settings' };
export const taxView: ViewType = { lc: 'Tax' };

export const expensesChart: ViewType = { lc: 'Expenses chart' };
export const incomesChart: ViewType = { lc: 'Incomes chart' };
export const assetsChart: ViewType = { lc: 'Assets chart' };
export const debtsChart: ViewType = { lc: 'Debts chart' };

export const expensesTable: ViewType = { lc: 'Expenses table' };
export const incomesTable: ViewType = { lc: 'Incomes table' };
export const assetsTable: ViewType = { lc: 'Assets table' };
export const debtsTable: ViewType = { lc: 'Debts table' };
export const transactionsTable: ViewType = { lc: 'Transactions table' };
export const triggersTable: ViewType = { lc: 'Dates table' };
export const settingsTable: ViewType = { lc: 'Settings table' };

export const overview: ViewType = { lc: 'Overview' };

const views = new Map<
  ViewType,
  {
    display: boolean;
  }
>([
  [
    homeView,
    {
      display: true,
    },
  ],
  [
    overview,
    {
      display: false,
    },
  ],
  [
    triggersView,
    {
      display: false,
    },
  ],
  [
    incomesView,
    {
      display: false,
    },
  ],
  [
    expensesView,
    {
      display: false,
    },
  ],
  [
    assetsView,
    {
      display: false,
    },
  ],
  [
    debtsView,
    {
      display: false,
    },
  ],
  [
    transactionsView,
    {
      display: false,
    },
  ],
  [
    taxView,
    {
      display: false,
    },
  ],
  [
    settingsView,
    {
      display: false,
    },
  ],
]);

const exampleModels = [
  {
    name: exampleModelName,
    model: simpleExampleData,
  },
  {
    name: 'Pension example',
    model: pension1ExampleData,
  },
];

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

function getUserID() {
  return userID;
}

function getExampleModel(modelString: string) {
  return makeModelFromJSON(modelString);
}

function showAlert(text: string) {
  reactAppComponent.setState({
    alertText: text,
  });
}

export async function refreshData(goToDB = true) {
  // log('refreshData in AppContent - get data and redraw content');
  if (goToDB) {
    // log('refreshData do visit db');
    // go to the DB to refresh available model names
    let modelNames = await getModelNames(getUserID());
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
        // log(`no model called ${exampleModelName}, so just choose the 1st one`);
        modelName = modelNames.sort((a, b) => lessThan(a, b))[0];
        // log(`switch to a different modelName ${modelName}`);

        const modelAndStatus = await loadModel(getUserID(), modelName);
        if (modelAndStatus === undefined) {
          const response = 'problem with model data';
          showAlert(response);
          return;
        }
        isDirty = modelAndStatus.status.isDirty;
        model = modelAndStatus.model;
      } else {
        // log('recreate example models');
        // force us to have the example models
        await Promise.all(
          exampleModels.map(async x => {
            return await saveModelLSM(
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
        const modelAndStatus = await loadModel(getUserID(), modelName);
        if (modelAndStatus) {
          isDirty = modelAndStatus.status.isDirty;
          model = modelAndStatus.model;
        }
      } catch (err) {
        // log('no model found');
        log(`Cannot load ${modelName}, err = ${err}. Consider 'Force delete'?`);
        gotModelOK = false;
      }
      if (!gotModelOK || model === undefined) {
        // log('no model found - do not try to display anything');
        return;
      }
    }

    // log(`got ${model}`);

    model.triggers.sort((a: DbTrigger, b: DbTrigger) =>
      lessThan(b.NAME, a.NAME),
    );
    model.expenses.sort((a: DbExpense, b: DbExpense) =>
      lessThan(b.NAME, a.NAME),
    );
    model.settings.sort((a: DbSetting, b: DbSetting) =>
      lessThan(b.NAME, a.NAME),
    );
    model.incomes.sort((a: DbIncome, b: DbIncome) => lessThan(b.NAME, a.NAME));
    model.transactions.sort((a: DbTransaction, b: DbTransaction) =>
      lessThan(b.NAME, a.NAME),
    );
    model.assets.sort((a: DbAsset, b: DbAsset) => lessThan(b.NAME, a.NAME));
    modelNames.sort((a: string, b: string) => lessThan(a, b));

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
    const {
      expensesData,
      incomesData,
      assetData,
      debtData,
      taxData,
      todaysAssetValues,
      todaysDebtValues,
      todaysIncomeValues,
      todaysExpenseValues,
      todaysSettingValues,
    } = result;

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
          todaysAssetValues: todaysAssetValues,
          todaysDebtValues: todaysDebtValues,
          todaysIncomeValues: todaysIncomeValues,
          todaysExpenseValues: todaysExpenseValues,
          todaysSettingValues: todaysSettingValues,
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

export async function submitAsset(assetInput: DbAsset, modelData: DbModelData) {
  const message = await submitAssetLSM(
    assetInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
}
export async function submitExpense(
  expenseInput: DbExpense,
  modelData: DbModelData,
) {
  const message = await submitExpenseLSM(
    expenseInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
}
export async function submitIncome(
  incomeInput: DbIncome,
  modelData: DbModelData,
) {
  const message = await submitIncomeLSM(
    incomeInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
}
export async function submitTransaction(
  transactionInput: DbTransaction,
  modelData: DbModelData,
) {
  const message = await submitTransactionLSM(
    transactionInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
}
export async function submitTrigger(
  triggerInput: DbTrigger,
  modelData: DbModelData,
) {
  const message = await submitTriggerLSM(
    triggerInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
}

// if HINT or TYPE are empty, leave pre-existing values
export async function editSetting(
  settingInput: {
    NAME: string;
    VALUE: string;
  },
  modelData: DbModelData,
) {
  const settingWithBlanks = {
    ...settingInput,
    HINT: '',
    TYPE: '',
  };
  const message = await submitSettingLSM(
    settingWithBlanks,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
}

export async function submitNewSetting(
  setting: DbSetting,
  modelData: DbModelData,
) {
  await submitNewSettingLSM(setting, modelName, modelData, getUserID());
  return await refreshData(
    true, // gotoDB
  );
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
  refreshData(
    false, // gotoDB
  );
}

function checkModelData(givenModel: DbModelData): string {
  const response = checkData(givenModel);
  if (response === '') {
    return 'model check all good';
  } else {
    return response;
  }
}

export async function deleteItemFromModel(
  name: string,
  itemList: DbItem[],
  modelName: string,
  model: DbModelData,
): Promise<boolean> {
  // log('delete item '+name)
  const idx = itemList.findIndex((i: DbItem) => {
    return i.NAME === name;
  });
  if (idx !== -1) {
    const oldItem = itemList[idx];
    // log(`before delete itemList = ${showObj(itemList)}`);
    itemList.splice(idx, 1);
    // log(`after delete itemList = ${showObj(itemList)}`);

    const checkResponse = checkData(model);
    if (checkResponse !== '') {
      const response = `edited  model fails checks :${checkResponse}', reverting`;
      reactAppComponent.setState({
        alertText: response,
      });
      itemList.splice(idx, 0, oldItem);
      // log(`after putback itemList = ${showObj(itemList)}`);
      return false;
    }

    await saveModelLSM(getUserID(), modelName, model);
    await refreshData(
      true, // gotoDB
    );
    return true;
  }
  return false;
}

export async function deleteTrigger(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.triggers,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteAsset(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.assets,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteTransaction(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.transactions,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteExpense(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.expenses,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteIncome(name: string) {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.incomes,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function deleteSetting(name: string): Promise<boolean> {
  return deleteItemFromModel(
    name,
    reactAppComponent.state.modelData.settings,
    modelName,
    reactAppComponent.state.modelData,
  );
}

export async function updateModelName(newValue: string): Promise<boolean> {
  // log(`model name is now ${newValue}`);
  if (modelName === newValue) {
    // log(`no need to update name - already working with ${newValue}`);
    return true;
  }
  const check = isDirty;
  if (check) {
    if (
      !window.confirm(`Continue without saving unsaved model ${modelName}?`)
    ) {
      // log(`don't update name - user wants to continue with ${modelName}`);
      return false;
    }
  }
  // log(`switch model name to ${newValue}`);
  modelName = newValue;
  await ensureModel(getUserID(), modelName);
  await refreshData(
    true, // gotoDB
  );
  return true;
}

export async function replaceWithModel(
  userName: string | undefined,
  thisModelName: string,
  newModel: DbModelData,
  confirmBeforeReplace: boolean,
): Promise<boolean> {
  // log(`replaceWithModel...`);
  if (userName === undefined) {
    userName = getUserID();
  }
  const check = confirmBeforeReplace && isDirty;
  if (check) {
    if (
      !window.confirm(`Continue without saving unsaved model ${modelName}?`)
    ) {
      return false;
    }
  }
  modelName = thisModelName;
  // log(`save ${modelName} with new model data ${newModel}`);
  await saveModelLSM(userName, modelName, newModel);
  await refreshData(
    true, // gotoDB
  );
  return true;
}

interface AppState {
  modelData: DbModelData;
  expensesChartData: ChartData[];
  incomesChartData: ChartData[];
  assetChartData: ChartData[];
  debtChartData: ChartData[];
  taxChartData: ChartData[];
  modelNamesData: string[];
  todaysAssetValues: Map<string, number>;
  todaysDebtValues: Map<string, number>;
  todaysIncomeValues: Map<string, number>;
  todaysExpenseValues: Map<string, number>;
  todaysSettingValues: Map<string, string>;
  alertText: string;
}
interface AppProps {
  logOutAction: any; // TODO type for function
  user: any; // TODO
}

export class AppContent extends Component<AppProps, AppState> {
  public constructor(props: AppProps) {
    super(props);
    //this.handleUnload = this.handleUnload.bind(this);

    reactAppComponent = this;
    this.state = {
      modelData: emptyModel,
      expensesChartData: [],
      incomesChartData: [],
      assetChartData: [],
      debtChartData: [],
      taxChartData: [],
      modelNamesData: [],
      todaysAssetValues: new Map<string, number>(),
      todaysDebtValues: new Map<string, number>(),
      todaysIncomeValues: new Map<string, number>(),
      todaysExpenseValues: new Map<string, number>(),
      todaysSettingValues: new Map<string, string>(),
      alertText: '',
    };
    refreshData(
      true, // gotoDB
    );
  }

  public componentWillUnmount() {
    //log('in componentWillUnmount');
    //window.removeEventListener('beforeunload', this.handleUnload);
  }
  /*
  public handleUnload(e: any) {
    //log('in handleUnload');
    if (isDirty) {
      const message = 'o/';

      (e || window.event).returnValue = message; //Gecko + IE
      return message;
    }
  }
*/
  public componentDidMount() {
    //log('in componentDidMount');
    toggle(homeView);
    //window.addEventListener('beforeunload', this.handleUnload);
  }

  public render() {
    if (printDebug()) {
      log('in render');
    }

    const getSettingValue = (settingName: string) => {
      let value = '';
      const s = this.state.modelData.settings.find(s => {
        return s.NAME === settingName;
      });
      if (s !== undefined) {
        value = s.VALUE;
      }
      return value;
    };
    const getStartDate = () => {
      return getSettingValue(roiStart);
    };
    const getEndDate = () => {
      return getSettingValue(roiEnd);
    };
    const updateSettingValue = (settingName: string, newDate: string) => {
      const s = this.state.modelData.settings.find(s => {
        return s.NAME === settingName;
      });
      if (s !== undefined) {
        s.VALUE = newDate;
        submitNewSetting(s, this.state.modelData);
      }
    };
    const updateStartDate = async (newDate: string) => {
      updateSettingValue(roiStart, newDate);
    };
    const updateEndDate = async (newDate: string) => {
      updateSettingValue(roiEnd, newDate);
    };

    return (
      <div>
        <Navbar expand="lg" bg="light" sticky="top">
          <Navbar.Brand href="#home" id="finkitty-brand">
            <div className="col">
              <div className="row">
                <h3>{`FinKitty`}</h3>
              </div>
              <div className="row">
                <img src={FinKittyCat} alt="FinKitty cat" width={70}></img>
              </div>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form
                inline
                onSubmit={(e: any) => {
                  e.preventDefault();
                  return false;
                }}
              >
                {
                  <div className="col">
                    <div className="row">{this.statusButtonList()}</div>
                    <div className="row">{this.viewButtonList()}</div>
                  </div>
                }
              </Form>
            </Nav>
            <Nav>
              <Form
                inline
                onSubmit={(e: any) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <div className="col">
                  <div className="row">{this.rhsTopButtonList()}</div>
                  <div className="row">{this.rhsBottomButtonList()}</div>
                </div>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div>
          {this.homeDiv()}
          {overviewDiv(
            this.state.modelData,
            showAlert,
            this.state.assetChartData,
            this.state.debtChartData,
            this.state.expensesChartData,
            this.state.incomesChartData,
            this.state.taxChartData,
            getStartDate,
            updateStartDate,
            getEndDate,
            updateEndDate,
          )}
          {this.settingsDiv(
            this.state.modelData,
            this.state.todaysSettingValues,
          )}
          {incomesDiv(
            this.state.modelData,
            showAlert,
            this.state.incomesChartData,
            this.state.todaysIncomeValues,
          )}
          {expensesDiv(
            this.state.modelData,
            showAlert,
            this.state.expensesChartData,
            this.state.todaysExpenseValues,
          )}
          {assetsDiv(
            this.state.modelData,
            showAlert,
            this.state.assetChartData,
            this.state.todaysAssetValues,
          )}
          {debtsDiv(
            this.state.modelData,
            showAlert,
            this.state.debtChartData,
            this.state.todaysDebtValues,
          )}
          {this.transactionsDiv()}
          {taxDiv(this.state.modelData, this.state.taxChartData)}
          {this.triggersDiv()}
        </div>
      </div>
    );
  }

  private modelList(modelNames: string[], actionOnSelect: any, idKey: string) {
    if (modelNames.length === 0) {
      return <div role="group">Loading models...</div>;
    }
    // log(`models = ${models}`)
    const buttons = modelNames.map(model => (
      <Button
        key={model}
        action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.persist();
          actionOnSelect(model);
        }}
        title={model}
        id={`btn-${idKey}-${model}`}
        type={idKey !== 'del' && modelName === model ? 'primary' : 'secondary'}
      />
    ));
    return (
      <form
        className="container-fluid"
        onSubmit={(e: any) => {
          e.preventDefault();
          return false;
        }}
      >
        Select an existing model:
        <br />
        {buttons}
      </form>
    );
  }

  private modelListForSelect(modelNames: string[]) {
    return this.modelList(
      modelNames,
      async (model: string) => {
        if (await updateModelName(model)) {
          await toggle(overview);
        }
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
    let promptResponse = prompt('Provide a name for your model');
    if (promptResponse === null) {
      return result;
    }
    if (promptResponse === '') {
      promptResponse = 'myModel';
    }
    // log(`set new model name to ${promptResponse}`);
    const regex = RegExp('[a-zA-Z0-9_\\-\\. ]+');
    const whatsLeft = promptResponse.replace(regex, '');
    // log(`whatsLeft = ${whatsLeft}`);
    if (whatsLeft !== '') {
      const response =
        'Model names can only contain a-z, A-Z, 0-9, _, - and . characters';
      reactAppComponent.setState({
        alertText: response,
      });
      return result;
    } else if (
      this.state.modelNamesData.find(model => model === promptResponse)
    ) {
      showAlert("There's already a model with that name");
      return result;
    }
    result.gotNameOK = true;
    result.newName = promptResponse;
    return result;
  }

  private async deleteModel(modelNameForDelete: string) {
    if (
      window.confirm(
        `delete all data in model ${modelNameForDelete} - you sure?`,
      )
    ) {
      // log(`delete model ${modelNameForDelete}`);
      const modelNames = await getModelNames(getUserID());
      await deleteModel(getUserID(), modelNameForDelete);
      const idx = modelNames.findIndex(i => {
        return i === modelNameForDelete;
      });
      if (idx !== -1) {
        modelNames.splice(idx, 1);
      } else {
        log(`error, deleted ${modelNameForDelete} found in ${modelNames}`);
      }
      // log(`model names after delete are ${modelNames}`);
      if (modelNames.length === 0) {
        showAlert('no data left: recreating example model');
        modelName = exampleModelName;
        await saveModelLSM(
          getUserID(),
          modelName,
          makeModelFromJSON(simpleExampleData),
        );
      } else {
        modelName = modelNames.sort()[0];
        // log(`model name after delete is ${modelName}`);
      }
      await refreshData(
        true, // gotoDB
      );
    }
  }

  private async cloneModel(
    name: string,
    fromModel: DbModelData,
  ): Promise<boolean> {
    // log(`going to clone a model and give it name ${name}`);
    // log(`stringify model for clone`);
    const currentData = JSON.stringify(fromModel);
    const updatedOK = await updateModelName(name);
    if (updatedOK) {
      const newModel = makeModelFromJSON(currentData);
      const replacedOK = await replaceWithModel(
        undefined,
        modelName,
        newModel,
        false,
      );
      return replacedOK;
    } else {
      return false; // didn't update name OK
    }
  }

  private homeDiv() {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <div style={{ display: getDisplay(homeView) ? 'block' : 'none' }}>
        <div className="row">
          <div className="col-sm mb-4">
            <form
              className="container-fluid"
              onSubmit={(e: any) => {
                e.preventDefault();
                return false;
              }}
            >
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
            </form>
            <br />
            {this.modelListForSelect(this.state.modelNamesData)}
            <br />
            <CreateModelForm
              userID={userID}
              currentModelName={modelName}
              modelData={this.state.modelData}
              saveModel={async (
                userID: string,
                modelName: string,
                modelData: DbModelData,
              ) => {
                await saveModelToDBLSM(userID, modelName, modelData);
                refreshData();
              }}
              showAlert={showAlert}
              cloneModel={this.cloneModel}
              exampleModels={exampleModels}
              getExampleModel={getExampleModel}
              getModelNames={getModelNames}
            />
            <br></br>
            <form
              className="container-fluid"
              onSubmit={(e: any) => {
                e.preventDefault();
                return false;
              }}
            >
              Other actions:
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
                  const response = checkModelData(
                    reactAppComponent.state.modelData,
                  );
                  reactAppComponent.setState({
                    alertText: response,
                  });
                }}
                title="Check model"
                id={`btn-check`}
                type="secondary"
              />
              <Button
                action={() => {
                  const text = JSON.stringify(this.state.modelData);
                  navigator.clipboard.writeText(text).then(
                    function() {
                      showAlert(`model as JSON on clipboard`);
                    },
                    function(err) {
                      console.error('Async: Could not copy text: ', err);
                      showAlert(
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
                      showAlert('could not decode this data');
                    } else {
                      const decipheredModel = makeModelFromJSON(decipherString);
                      const response = checkModelData(decipheredModel);
                      reactAppComponent.setState({
                        alertText: response,
                      });
                    }
                  } catch (err) {
                    showAlert('could not decode this data');
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
                id={`btn-force-delete`}
                type="secondary"
              />
            </form>
            <br></br>
            <ReplaceWithJSONForm
              modelName={modelName}
              userID={userID}
              showAlert={showAlert}
            />
          </div>
          <div className="col-md mb-4">{screenshotsDiv()}</div>
        </div>
      </div>
    );
  }

  private settingsDiv(model: DbModelData, todaysValues: Map<string, string>) {
    if (!getDisplay(settingsView)) {
      return;
    }
    const today = getTodaysDate(model);
    return (
      <div style={{ display: getDisplay(settingsView) ? 'block' : 'none' }}>
        <fieldset>
          {settingsTableDiv(this.state.modelData, showAlert)}
          <p />

          <h4>Values at {today.toDateString()}</h4>
          <DataGrid
            deleteFunction={async function() {
              return false;
            }}
            handleGridRowsUpdated={function() {
              return false;
            }}
            rows={Array.from(todaysValues.entries())
              .map(key => {
                // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
                return {
                  NAME: key[0],
                  VALUE: `${key[1]}`,
                };
              })
              .sort((a: DbItem, b: DbItem) => lessThan(a.NAME, b.NAME))}
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
                name: `today's value`,
                formatter: (
                  <SimpleFormatter name="today's value" value="unset" />
                ),
              },
            ]}
          />

          <div className="addNewSetting">
            <h4> Add setting </h4>
            <AddDeleteSettingForm
              submitSettingFunction={submitNewSetting}
              checkTransactionFunction={checkTransaction}
              submitTransactionFunction={submitTransaction}
              submitTriggerFunction={submitTrigger}
              model={this.state.modelData}
              showAlert={showAlert}
            />
            {/*
            // adding this wierdly makes tooltips work!
            <AddDeleteTransactionForm
              checkFunction={checkTransaction}
              submitFunction={submitTransaction}
              deleteFunction={deleteTransaction}
              submitTriggerFunction={submitTrigger}
              model={this.state.modelData}
              showAlert={showAlert}
            />*/}
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
        {triggersTableDiv(this.state.modelData, showAlert)}
        <p />
        <div className="addNewTrigger">
          <h4> Add an important date </h4>
          <AddDeleteTriggerForm
            checkFunction={checkTrigger}
            submitFunction={submitTrigger}
            deleteFunction={deleteTrigger}
            model={this.state.modelData}
            showAlert={showAlert}
          />
        </div>
      </div>
    );
  }

  private transactionsDiv() {
    if (!getDisplay(transactionsView)) {
      return;
    }

    return (
      <div style={{ display: getDisplay(transactionsView) ? 'block' : 'none' }}>
        <h4>Custom transactions</h4>
        {transactionsTableDiv(this.state.modelData, showAlert, custom)}
        <h4>Auto-generated transactions</h4>
        {transactionsTableDiv(this.state.modelData, showAlert, autogen)}
        <p />
        <div className="addNewTransaction">
          <h4> Add a transaction </h4>
          <AddDeleteTransactionForm
            checkFunction={checkTransaction}
            submitFunction={submitTransaction}
            deleteFunction={deleteTransaction}
            submitTriggerFunction={submitTrigger}
            model={this.state.modelData}
            showAlert={showAlert}
          />
        </div>
      </div>
    );
  }
  private rhsTopButtonList() {
    const buttons: JSX.Element[] = [];
    buttons.push(
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          this.props.logOutAction();
        }}
        title="Log out"
        type="primary"
        key="Log out"
        id={`btn-LogOut`}
      />,
    );
    return buttons;
  }

  private rhsBottomButtonList() {
    const buttons: JSX.Element[] = [];
    buttons.push(this.makeUndoButton());
    buttons.push(this.makeRedoButton());
    buttons.push(this.makeSaveButton());
    return buttons;
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
          action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.persist();
            toggle(view);
          }}
          title={view.lc}
          type={display ? 'secondary-on' : 'secondary'}
          key={view.lc}
          id={`btn-${view.lc}`}
        />,
      );
      entry = it.next();
    }

    return buttons;
  }

  private statusButtonList() {
    let buttons: JSX.Element[] = [];
    buttons = buttons.concat(this.makeHelpText(this.state.alertText));
    return buttons;
  }

  private makeUndoButton() {
    return (
      <Button
        key={'undoButton'}
        action={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.persist();
          if (await revertToUndoModel(this.state.modelData)) {
            await saveModelLSM(userID, modelName, this.state.modelData);
            refreshData();
          }
        }}
        title={'Undo'}
        id={`btn-undo-model`}
        type={
          this.state.modelData.undoModel !== undefined
            ? 'primary'
            : 'primary-off'
        }
      />
    );
  }
  private makeRedoButton() {
    return (
      <Button
        key={'redoButton'}
        action={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.persist();
          if (await applyRedoToModel(this.state.modelData)) {
            await saveModelLSM(userID, modelName, this.state.modelData);
            refreshData();
          }
        }}
        title={'Redo'}
        id={`btn-redo-model`}
        type={
          this.state.modelData.redoModel !== undefined
            ? 'primary'
            : 'primary-off'
        }
      />
    );
  }

  private makeSaveButton() {
    // log(`isDirty = ${isDirty}`);
    return (
      <Button
        key={'saveButton'}
        action={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.persist();
          await saveModelToDBLSM(userID, modelName, this.state.modelData);
          refreshData();
        }}
        title={'Save model'}
        id={`btn-save-model`}
        type={isDirty ? 'primary' : 'primary-off'}
      />
    );
  }

  private makeHelpText(alertText: string): JSX.Element[] {
    const result: JSX.Element[] = [];
    let messageText = alertText;
    if (messageText === '') {
      messageText = `${modelName}`;
      result.push(
        <h4 className="text" id="pageTitle">
          {messageText}
        </h4>,
      );
    } else {
      result.push(
        <h4 className="text-warning" id="pageTitle">
          {messageText}
        </h4>,
      );
    }
    // log('display alert text');
    if (alertText !== '') {
      result.push(
        <Button
          key={'alert'}
          action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            // log('clear alert text');
            e.persist();
            this.setState({ alertText: '' });
          }}
          title={'clear alert'}
          id={`btn-clear-alert`}
          type={'secondary'}
        />,
      );
    }
    return result;
  }
}

export async function attemptRename(
  model: DbModelData,
  old: string,
  replacement: string,
): Promise<string> {
  const message = attemptRenameLong(model, old, replacement);
  // log(`message from attemptRenameLong is ${message}`);
  if (message === '') {
    // log(`message is empty, go to refreshData`);
    await saveModelLSM(getUserID(), modelName, model);
    refreshData(
      true, // gotoDB
    );
  } else {
    showAlert(message);
  }
  return message;
}

export default App;
