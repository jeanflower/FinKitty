import React, { Component } from 'react';
import {
  definedBenefitsPension,
  definedContributionsPension,
  emptyModel,
  nationalSavings,
  simpleExampleData,
} from './models/exampleModels';
import { useAuth0 } from './contexts/auth0-context';
import { makeChartData, ViewSettings } from './models/charting';
import { checkData, checkTransaction, checkTrigger } from './models/checks';
import { AddDeleteTransactionForm } from './views/reactComponents/AddDeleteTransactionForm';
import { AddDeleteTriggerForm } from './views/reactComponents/AddDeleteTriggerForm';
import Button from './views/reactComponents/Button';
import {
  allItems,
  annually,
  assetChartFocus,
  chartVals,
  chartViewType,
  assetsView,
  autogen,
  custom,
  debtChartFocus,
  debtsView,
  exampleModelName,
  expenseChartFocus,
  expensesView,
  fine,
  homeView,
  incomeChartFocus,
  incomesView,
  overview,
  roiEnd,
  roiStart,
  settingsView,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxView,
  transactionsView,
  triggersView,
  ViewType,
  viewDetail,
  viewFrequency,
  viewType,
  snapshot,
} from './localization/stringConstants';
import {
  AssetVal,
  ChartData,
  DataForView,
  Asset,
  Expense,
  Income,
  Item,
  ModelData,
  Setting,
  Transaction,
  Trigger,
  DebtVal,
  Evaluation,
  ExpenseVal,
  IncomeVal,
  ItemChartData,
  SettingVal,
} from './types/interfaces';
import { log, printDebug, showObj } from './utils';
import { loginPage, navbarContent } from './views/loginPage';
import { screenshotsDiv } from './views/screenshotsPage';
import {
  defaultColumn,
  settingsTableDiv,
  transactionFilteredTable,
  triggersTableDivWithHeading,
} from './views/tablePages';
import { overviewDiv } from './views/overviewPage';
import { snapshotDiv } from './views/snapshotPage';
import { taxDiv } from './views/chartPages';
import { incomesDiv } from './views/incomesPage';
import { expensesDiv } from './views/expensesPage';
import { assetsDiv } from './views/assetsPage';
import { debtsDiv } from './views/debtsPage';

import CryptoJS from 'crypto-js';
import {
  deleteModel,
  ensureModel,
  getModelNames,
  loadModel,
  saveModelLSM,
  saveModelToDBLSM,
  submitNewSettingLSM,
  submitTriggerLSM,
  submitTransactionLSM,
  submitAssetLSM,
  submitExpenseLSM,
  submitIncomeLSM,
  submitSettingLSM,
} from './database/loadSaveModel';
import DataGrid from './views/reactComponents/DataGrid';
import SimpleFormatter from './views/reactComponents/NameFormatter';
import { AddDeleteSettingForm } from './views/reactComponents/AddDeleteSettingForm';
import { ReplaceWithJSONForm } from './views/reactComponents/ReplaceWithJSONForm';
import { CreateModelForm } from './views/reactComponents/NewModelForm';
import { Form, Nav, Navbar } from 'react-bootstrap';
import { getEvaluations } from './models/evaluations';
import {
  applyRedoToModel,
  attemptRenameLong,
  getTodaysDate,
  makeModelFromJSON,
  markForUndo,
  revertToUndoModel,
} from './models/modelUtils';
import { lessThan } from './stringUtils';

// import FinKittyCat from './views/cat.png';

// import './bootstrap.css'

let modelName: string = exampleModelName;
let userID = '';
let isDirty = false; // does the model need saving?
let checkModelBeforeChange = true; // stop people making good models bad
let checkBeforeOverwritingExistingData = true; // stop people overwriting

export function getDefaultViewSettings(): ViewSettings {
  const result = new ViewSettings([
    {
      NAME: viewFrequency,
      VALUE: annually,
    },
    {
      NAME: chartViewType,
      VALUE: chartVals,
    },
    {
      NAME: viewDetail,
      VALUE: fine,
    },
    {
      NAME: assetChartFocus,
      VALUE: allItems,
    },
    {
      NAME: debtChartFocus,
      VALUE: allItems,
    },
    {
      NAME: expenseChartFocus,
      VALUE: allItems,
    },
    {
      NAME: incomeChartFocus,
      VALUE: allItems,
    },
    {
      NAME: taxChartFocusPerson,
      VALUE: allItems,
    },
    {
      NAME: taxChartFocusType,
      VALUE: allItems,
    },
    {
      NAME: taxChartShowNet,
      VALUE: 'Y',
    },
  ]);
  return result;
}

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
    snapshot,
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
    taxView,
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
    transactionsView,
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
    name: 'Defined Benefits Pension',
    model: definedBenefitsPension,
  },
  {
    name: 'Defined Contributions Pension',
    model: definedContributionsPension,
  },
  {
    name: 'National Savings Income Bonds',
    model: nationalSavings,
  },
];

let reactAppComponent: AppContent;

export function setViewSetting(input: Setting): boolean {
  // log(`setview setting being processed`);
  if (reactAppComponent) {
    return reactAppComponent.state.viewState.setViewSetting(
      input.NAME,
      input.VALUE,
    );
  } else {
    return false;
  }
}

// When loading in an old model, set the view from the
// old-style settings data
// This only matters for keeping tests passing.
export function migrateViewSetting(input: Setting): boolean {
  // log(`setview setting being processed`);
  if (reactAppComponent) {
    return reactAppComponent.state.viewState.migrateViewSettingString(
      input.NAME,
      input.VALUE,
    );
  } else {
    return false;
  }
}

export function getDisplay(type: ViewType): boolean {
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

export async function refreshData(
  refreshModel: boolean,
  refreshChart: boolean,
) {
  //log(`refreshData with refreshModel = `
  //  +`${refreshModel}, refreshChart = ${refreshChart}`);
  const viewSettings = reactAppComponent.state.viewState;

  let modelNames = reactAppComponent.state.modelNamesData;
  let model = reactAppComponent.state.modelData;
  let evaluationsAndVals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<string, AssetVal>;
    todaysDebtValues: Map<string, DebtVal>;
    todaysIncomeValues: Map<string, IncomeVal>;
    todaysExpenseValues: Map<string, ExpenseVal>;
    todaysSettingValues: Map<string, SettingVal>;
  } = {
    evaluations: reactAppComponent.state.evaluations,
    todaysAssetValues: reactAppComponent.state.todaysAssetValues,
    todaysDebtValues: reactAppComponent.state.todaysDebtValues,
    todaysIncomeValues: reactAppComponent.state.todaysIncomeValues,
    todaysExpenseValues: reactAppComponent.state.todaysExpenseValues,
    todaysSettingValues: reactAppComponent.state.todaysSettingValues,
  };

  // log('refreshData in AppContent - get data and redraw content');
  if (refreshModel) {
    // log(`refresh model evaluation data`);

    modelNames = await getModelNames(getUserID());
    // log(`got ${modelNames.length} modelNames`);

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

    model.triggers.sort((a: Trigger, b: Trigger) => lessThan(b.NAME, a.NAME));
    model.expenses.sort((a: Expense, b: Expense) => lessThan(b.NAME, a.NAME));
    model.settings.sort((a: Setting, b: Setting) => lessThan(b.NAME, a.NAME));
    model.incomes.sort((a: Income, b: Income) => lessThan(b.NAME, a.NAME));
    model.transactions.sort((a: Transaction, b: Transaction) =>
      lessThan(b.NAME, a.NAME),
    );
    model.assets.sort((a: Asset, b: Asset) => lessThan(b.NAME, a.NAME));
    modelNames.sort((a: string, b: string) => lessThan(a, b));

    evaluationsAndVals = getEvaluations(model);
  }
  if (refreshModel) {
    viewSettings.setModel(model);
  }
  if (refreshModel || refreshChart) {
    // log(`refresh chart data`);
    const result: DataForView = makeChartData(
      model,
      viewSettings,
      evaluationsAndVals,
      getDisplay,
    );

    result.expensesData.sort((a, b) => (a.item.NAME < b.item.NAME ? 1 : -1)); // TODO rerevse values
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
          evaluations: evaluationsAndVals.evaluations,
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
  // log(`finished refreshData`);
}

export async function submitAsset(assetInput: Asset, modelData: ModelData) {
  const message = await submitAssetLSM(
    assetInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  } else {
    showAlert(message);
  }
}
export async function submitExpense(
  expenseInput: Expense,
  modelData: ModelData,
) {
  const message = await submitExpenseLSM(
    expenseInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  } else {
    showAlert(message);
  }
}
export async function submitIncome(
  incomeInput: Income,
  modelData: ModelData,
): Promise<boolean> {
  const message = await submitIncomeLSM(
    incomeInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    await refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
    return true;
  } else {
    showAlert(message);
    return false;
  }
}
export async function submitTransaction(
  transactionInput: Transaction,
  modelData: ModelData,
) {
  const message = await submitTransactionLSM(
    transactionInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  } else {
    showAlert(message);
  }
}
export async function submitTrigger(
  triggerInput: Trigger,
  modelData: ModelData,
) {
  const message = await submitTriggerLSM(
    triggerInput,
    modelName,
    modelData,
    getUserID(),
  );
  if (message === '') {
    return await refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
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
  modelData: ModelData,
) {
  if (
    setViewSetting({
      NAME: settingInput.NAME,
      VALUE: settingInput.VALUE,
      TYPE: viewType,
      HINT: '',
    })
  ) {
    return await refreshData(
      false, // or false refreshModel = true,
      true, // refreshChart = true,
    );
  }
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
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  } else {
    showAlert(message);
  }
}

export async function submitNewSetting(
  setting: Setting,
  modelData: ModelData,
  viewSettings: ViewSettings,
) {
  if (viewSettings.migrateViewSettingString(setting.NAME, setting.VALUE)) {
    return await refreshData(
      false, // or false refreshModel = true,
      true, // refreshChart = true,
    );
  } else {
    await submitNewSettingLSM(setting, modelName, modelData, getUserID());
    return await refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  }
}

export function toggle(type: ViewType) {
  if (reactAppComponent === undefined) {
    return;
  }
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
    false, // refreshModel = true,
    true, // refreshChart = true,
  );
}

function checkModelData(givenModel: ModelData): string {
  const response = checkData(givenModel);
  if (response === '') {
    return 'model check all good';
  } else {
    return response;
  }
}

export async function deleteItemFromModel(
  name: string,
  itemList: Item[],
  modelName: string,
  model: ModelData,
): Promise<boolean> {
  // log('delete item '+name)
  const idx = itemList.findIndex((i: Item) => {
    return i.NAME === name;
  });
  if (idx !== -1) {
    markForUndo(model);
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
      true, // refreshModel = true,
      true, // refreshChart = true,
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
    true, // refreshModel = true,
    true, // refreshChart = true,
  );
  return true;
}

export async function replaceWithModel(
  userName: string | undefined,
  thisModelName: string,
  newModel: ModelData,
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
    true, // refreshModel = true,
    true, // refreshChart = true,
  );
  return true;
}

interface AppState {
  modelNamesData: string[];
  modelData: ModelData;
  evaluations: Evaluation[];
  viewState: ViewSettings;
  expensesChartData: ChartData[];
  incomesChartData: ChartData[];
  assetChartData: ChartData[];
  debtChartData: ChartData[];
  taxChartData: ChartData[];
  todaysAssetValues: Map<string, AssetVal>;
  todaysDebtValues: Map<string, DebtVal>;
  todaysIncomeValues: Map<string, IncomeVal>;
  todaysExpenseValues: Map<string, ExpenseVal>;
  todaysSettingValues: Map<string, SettingVal>;
  alertText: string;
}
interface AppProps {
  logOutAction: () => {};
  user: string;
}

export class AppContent extends Component<AppProps, AppState> {
  public constructor(props: AppProps) {
    super(props);
    //this.handleUnload = this.handleUnload.bind(this);

    const viewSettings = getDefaultViewSettings();
    // log(`frequency is ${viewSettings.getViewSetting(viewFrequency, 'none')}`);

    reactAppComponent = this;
    this.state = {
      modelData: emptyModel,
      evaluations: [],
      viewState: viewSettings,
      expensesChartData: [],
      incomesChartData: [],
      assetChartData: [],
      debtChartData: [],
      taxChartData: [],
      modelNamesData: [],
      todaysAssetValues: new Map<string, AssetVal>(),
      todaysDebtValues: new Map<string, DebtVal>(),
      todaysIncomeValues: new Map<string, IncomeVal>(),
      todaysExpenseValues: new Map<string, ExpenseVal>(),
      todaysSettingValues: new Map<string, SettingVal>(),
      alertText: '',
    };
    refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  }

  public componentWillUnmount() {
    //log('in componentWillUnmount');
    //window.removeEventListener('beforeunload', this.handleUnload);
  }
  /*
  public handleUnload(e) {
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

  private navbarDiv() {
    return navbarContent(() => {
      return (
        <>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form
                inline
                onSubmit={(e: React.FormEvent<Element>) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <div className="col">
                  <div className="row">{this.statusButtonList()}</div>
                  <div className="row">{this.viewButtonList()}</div>
                </div>
              </Form>
            </Nav>
            <Nav>
              <Form
                inline
                onSubmit={(e: React.FormEvent<Element>) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <div className="col">
                  <div className="d-flex flex-row-reverse">
                    {this.rhsTopButtonList()}
                  </div>
                  <div className="d-flex flex-row-reverse">
                    {this.rhsBottomButtonList()}
                  </div>
                </div>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </>
      );
    });
  }

  public render() {
    if (printDebug()) {
      log('in render');
    }
    try {
      // throw new Error('pretend something went wrong');

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
          submitNewSetting(s, this.state.modelData, this.state.viewState);
        }
      };
      const updateStartDate = async (newDate: string) => {
        updateSettingValue(roiStart, newDate);
      };
      const updateEndDate = async (newDate: string) => {
        updateSettingValue(roiEnd, newDate);
      };

      return (
        <>
          {this.navbarDiv()}
          <>
            {this.homeDiv()}
            {overviewDiv(
              this.state.modelData,
              this.state.viewState,
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
            {snapshotDiv(
              this.state.modelData,
              this.state.viewState,
              showAlert,
              this.state.assetChartData,
              this.state.todaysAssetValues,
              this.state.debtChartData,
              this.state.todaysDebtValues,
              this.state.expensesChartData,
              this.state.todaysExpenseValues,
              this.state.incomesChartData,
              this.state.todaysIncomeValues,
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
              this.state.viewState,
              showAlert,
              this.state.incomesChartData,
              this.state.todaysIncomeValues,
              getStartDate,
              updateStartDate,
              getEndDate,
              updateEndDate,
            )}
            {expensesDiv(
              this.state.modelData,
              this.state.viewState,
              showAlert,
              this.state.expensesChartData,
              this.state.todaysExpenseValues,
              getStartDate,
              updateStartDate,
              getEndDate,
              updateEndDate,
            )}
            {assetsDiv(
              this.state.modelData,
              this.state.viewState,
              showAlert,
              this.state.assetChartData,
              this.state.todaysAssetValues,
              getStartDate,
              updateStartDate,
              getEndDate,
              updateEndDate,
            )}
            {debtsDiv(
              this.state.modelData,
              this.state.viewState,
              showAlert,
              this.state.debtChartData,
              this.state.todaysDebtValues,
              getStartDate,
              updateStartDate,
              getEndDate,
              updateEndDate,
            )}
            {this.transactionsDiv()}
            {taxDiv(
              this.state.modelData,
              this.state.viewState,
              this.state.taxChartData,
            )}
            {this.triggersDiv()}
          </>
        </>
      );
    } catch (e) {
      return this.internalErrorDiv(e);
    }
  }

  private internalErrorDiv(e: Error) {
    return (
      <>
        {this.navbarDiv()}
        <h1>
          Oops! something has gone wrong with FinKitty. Sad FinKitty apologises.
        </h1>
        {e.message}
      </>
    );
  }

  private modelList(
    modelNames: string[],
    actionOnSelect: (arg0: string) => {},
    idKey: string,
  ) {
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
      <div className="ml-3">
        Select an existing model:
        <br />
        {buttons}
      </div>
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
        true, // refreshModel = true,
        true, // refreshChart = true,
      );
    }
  }

  private async cloneModel(
    name: string,
    fromModel: ModelData,
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
      if (replacedOK) {
        await toggle(overview);
        return true;
      } else {
        return false;
      }
    } else {
      return false; // didn't update name OK
    }
  }

  private homeDiv() {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    return (
      <div
        className="ml-3"
        style={{ display: getDisplay(homeView) ? 'block' : 'none' }}
      >
        <div className="row">
          <div className="col-sm mb-4">
            <div className="ml-3">
              <Button
                id="startNewModel"
                action={async () => {
                  const newNameFromUser = this.getNewName();
                  if (!newNameFromUser.gotNameOK) {
                    return;
                  }
                  if (await updateModelName(newNameFromUser.newName)) {
                    // log(`created new model`);
                    toggle(overview);
                  }
                }}
                title="Create a new model"
                type="secondary"
              />
            </div>
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
                modelData: ModelData,
              ) => {
                await saveModelToDBLSM(userID, modelName, modelData);
                refreshData(
                  true, // refreshModel = true,
                  true, // refreshChart = true,
                );
              }}
              showAlert={showAlert}
              cloneModel={this.cloneModel}
              exampleModels={exampleModels}
              getExampleModel={getExampleModel}
              getModelNames={getModelNames}
            />
            <br></br>
            <div className="btn-group ml-3" role="group">
              <Button
                action={async () => {
                  this.deleteModel(modelName);
                }}
                title="Delete model"
                id={`btn-delete`}
                type="secondary"
              />
            </div>
            <br></br>
            <br></br>
            <div className="ml-3">
              Developer tools:
              <br />
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
                  checkModelBeforeChange = !checkModelBeforeChange;
                  refreshData(
                    false, // refreshModel = true,
                    false, // refreshChart = true,
                  );
                }}
                title={
                  checkModelBeforeChange
                    ? 'Suppress check-before-change'
                    : 'Enable check-before-change'
                }
                id={`btn-toggle-check-edited-model`}
                type="secondary"
              />
              <Button
                action={() => {
                  log(`toggle checkBeforeOverwritingExistingData`);
                  checkBeforeOverwritingExistingData = !checkBeforeOverwritingExistingData;
                  refreshData(
                    false, // refreshModel = true,
                    false, // refreshChart = true,
                  );
                }}
                title={
                  checkBeforeOverwritingExistingData
                    ? 'Suppress check-before-overwrite'
                    : 'Enable check-before-overwrite'
                }
                id={`btn-toggle-check-overwrite`}
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
            </div>
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

  private todaysSettingsTable(
    model: ModelData,
    todaysValues: Map<string, SettingVal>,
  ) {
    if (todaysValues.size === 0) {
      return;
    }
    const today = getTodaysDate(model);
    return (
      <>
        <h4>Settings values at {today.toDateString()}</h4>
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
                VALUE: `${key[1].settingVal}`,
              };
            })
            .sort((a: Item, b: Item) => lessThan(a.NAME, b.NAME))}
          columns={[
            {
              ...defaultColumn,
              key: 'NAME',
              name: 'name',
              formatter: <SimpleFormatter name="name" value="unset" />,
              editable: false,
            },
            {
              ...defaultColumn,
              key: 'VALUE',
              name: `value`,
              formatter: <SimpleFormatter name="value" value="unset" />,
              editable: false,
            },
          ]}
        />
      </>
    );
  }

  private settingsDiv(model: ModelData, todaysValues: Map<string, SettingVal>) {
    if (!getDisplay(settingsView)) {
      return;
    }
    return (
      <div
        className="ml-3"
        style={{ display: getDisplay(settingsView) ? 'block' : 'none' }}
      >
        <fieldset>
          {this.todaysSettingsTable(model, todaysValues)}
          {settingsTableDiv(
            this.state.modelData,
            this.state.viewState,
            showAlert,
          )}
          <p />

          <div className="addNewSetting">
            <h4> Add setting </h4>
            <AddDeleteSettingForm
              submitSettingFunction={submitNewSetting}
              checkTransactionFunction={checkTransaction}
              submitTransactionFunction={submitTransaction}
              submitTriggerFunction={submitTrigger}
              model={this.state.modelData}
              viewSettings={this.state.viewState}
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
      <div
        className="ml-3"
        style={{ display: getDisplay(triggersView) ? 'block' : 'none' }}
      >
        {triggersTableDivWithHeading(this.state.modelData, showAlert)}
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
      <div
        className="ml-3"
        style={{ display: getDisplay(transactionsView) ? 'block' : 'none' }}
      >
        {transactionFilteredTable(
          this.state.modelData,
          showAlert,
          custom,
          'Custom transactions',
        )}
        {transactionFilteredTable(
          this.state.modelData,
          showAlert,
          autogen,
          'Auto-generated transactions',
        )}
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
    let viewIterator = it.next();
    while (!viewIterator.done) {
      const view = viewIterator.value;
      if (view === homeView) {
        // We use the image for Home
        // don't need a button
        viewIterator = it.next();
        continue;
      }
      const viewValue = views.get(view);
      if (viewValue === undefined) {
        log(`Error : unrecognised view ${view}`);
        viewIterator = it.next();
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
      viewIterator = it.next();
    }

    return buttons;
  }

  private statusButtonList() {
    let buttons: JSX.Element[] = [];
    buttons = buttons.concat(this.makeHelpText(this.state.alertText));
    return buttons;
  }

  private makeUndoButton() {
    let numUndosAvailable = 0;
    let undoModel = this.state.modelData.undoModel;
    while (undoModel !== undefined && numUndosAvailable < 100) {
      undoModel = undoModel.undoModel;
      numUndosAvailable = numUndosAvailable + 1;
    }
    let buttonTitle = 'Undo';
    if (numUndosAvailable > 0) {
      buttonTitle = `Undo(${numUndosAvailable})`;
    }
    return (
      <Button
        key={'undoButton'}
        action={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.persist();
          if (await revertToUndoModel(this.state.modelData)) {
            await saveModelLSM(userID, modelName, this.state.modelData);
            refreshData(
              true, // refreshModel = true,
              true, // refreshChart = true,
            );
          }
        }}
        title={buttonTitle}
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
    let numRedosAvailable = 0;
    let redoModel = this.state.modelData.redoModel;
    while (redoModel !== undefined && numRedosAvailable < 100) {
      redoModel = redoModel.redoModel;
      numRedosAvailable = numRedosAvailable + 1;
    }
    let buttonTitle = 'Redo';
    if (numRedosAvailable > 0) {
      buttonTitle = `Redo(${numRedosAvailable})`;
    }
    return (
      <Button
        key={'redoButton'}
        action={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.persist();
          if (await applyRedoToModel(this.state.modelData)) {
            await saveModelLSM(userID, modelName, this.state.modelData);
            refreshData(
              true, // refreshModel = true,
              true, // refreshChart = true,
            );
          }
        }}
        title={buttonTitle}
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
          refreshData(
            true, // refreshModel = true,
            true, // refreshChart = true,
          );
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
        <h4 className="text" id="pageTitle" key="pageTitle">
          {messageText}
        </h4>,
      );
    } else {
      result.push(
        <h4 className="text-warning" id="pageTitle" key="pageTitle">
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
  model: ModelData,
  old: string,
  replacement: string,
): Promise<string> {
  const message = attemptRenameLong(model, old, replacement);
  // log(`message from attemptRenameLong is ${message}`);
  if (message === '') {
    // log(`message is empty, go to refreshData`);
    await saveModelLSM(getUserID(), modelName, model);
    refreshData(
      true, // refreshModel = true,
      true, // refreshChart = true,
    );
  } else {
    showAlert(message);
  }
  return message;
}

export function doCheckModelBeforeChange() {
  return checkModelBeforeChange;
}
export function doCheckBeforeOverwritingExistingData() {
  return checkBeforeOverwritingExistingData;
}

export default App;
