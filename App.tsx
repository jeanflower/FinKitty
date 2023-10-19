/* istanbul ignore file */
import React, { Component, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  definedBenefitsPension,
  definedContributionsPension,
  emptyModel,
  nationalSavings,
  simpleExampleData,
} from './models/exampleModels';
import { useAuth0 } from './contexts/auth0-context';
import { makeChartData } from './models/charting';
import { checkData, checkTransaction, checkTrigger } from './models/checks';
import { AddDeleteTransactionForm } from './views/reactComponents/AddDeleteTransactionForm';
import { AddDeleteTriggerForm } from './views/reactComponents/AddDeleteTriggerForm';
import { makeButton } from './views/reactComponents/Button';
import {
  autogen,
  custom,
  myFirstModelName,
  homeView,
  reportView,
  roiEnd,
  roiStart,
  settingsView,
  transactionsView,
  triggersView,
  ViewType,
  viewType,
  purchase,
  defaultSourceMatcher,
  defaultSourceExcluder,
  bondInvest,
  evalModeOption,
  checkModelOnEditOption,
  optimizerView,
  monthly,
  viewFrequency,
  uiMode,
  taxView,
  showHistoricalOption,
  showCurrentOption,
  showFutureOption,
  assetsView,
  defaultReportSize,
  advancedUI,
  annually,
  allItems,
  viewDetail,
  coarseDetail,
  chartViewType,
  chartDeltas,
  planningView,
} from './localization/stringConstants';
import {
  AssetOrDebtVal,
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
  Evaluation,
  ExpenseVal,
  IncomeVal,
  SettingVal,
  ReportDatum,
  ReportMatcher,
  ReportValueChecker,
  ViewCallbacks,
  DeleteResult,
} from './types/interfaces';
import {
  Context,
  DateFormatType,
  log,
  printDebug,
  saveLogs,
  showObj,
} from './utils/utils';
import { loginPage, navbarContent } from './views/loginPage';
import { screenshotsDiv } from './views/screenshotsPage';
import {
  settingsTableDiv,
  transactionFilteredTable,
  triggersTableDivWithHeading,
  reportDiv,
  optimizerDiv,
  calcOptimizer,
} from './views/tablePages';
import { overviewDiv } from './views/overviewPage';
import { makeBarData } from './views/chartPages';
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
  saveModelToDBLSM,
  submitNewSettingLSM,
  submitTriggerLSM,
  submitTransactionLSM,
  submitAssetLSM,
  submitExpenseLSM,
  submitIncomeLSM,
  submitSettingLSM,
  saveModelLSM,
} from './database/loadSaveModel';
import { AddDeleteSettingForm } from './views/reactComponents/AddDeleteSettingForm';
import { ReplaceWithJSONForm } from './views/reactComponents/ReplaceWithJSONForm';
import { CreateModelForm } from './views/reactComponents/NewModelForm';
import {
  Alert,
  Button,
  Form,
  Nav,
  Navbar,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { EvaluationHelper, getEvaluations } from './models/evaluations';
import {
  applyRedoToModel,
  getROI,
  getTodaysDate,
  markForUndo,
  revertToUndoModel,
  standardiseDates,
} from './models/modelUtils';
import { dateAsString, lessThan, makeTwoDP } from './utils/stringUtils';
import { diffModels } from './models/diffModels';
import { collapsibleFragment } from './views/tablePages';
import WaitGif from './views/catWait.gif';
import packageData from './package.json';
import {
  ViewSettings,
  getDefaultViewSettings,
  getDisplay,
  getDisplayedView,
  views,
} from './utils/viewUtils';
import dateFormat from 'dateformat';
import FileSaver from 'file-saver';
import { taxDiv } from './views/taxPage';
import Image from 'next/image'
import { minimalModel } from './models/minimalModel';
import { makeModelFromJSON } from './models/modelFromJSON';
import { setUserID, getUserID } from './utils/user';
import { deleteItemsFromModelInternal } from './utils/appActions';

let modelName = '';

let isDirty = false; // does the model need saving?

export function getAppVersion(): string {
  return packageData.version;
}

function App(): JSX.Element | null {
  const { isLoading, user, loginWithRedirect, loginForTesting, logout } =
    useAuth0();
  if (!isLoading && !user) {
    setUserID('');
    return loginPage(loginWithRedirect, loginForTesting);
  }
  if (!isLoading && user) {
    setUserID(user.sub);
    return (
      <AppContent
        logOutAction={() => {
          if (getUserID() === 'TestUserID') {
            log(`logout ${getUserID()}`);
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
          // alert(`window.location.origin = ${window.location.origin}`);
          return logout({
            returnTo:
              window.location.origin + process.env.NEXT_PUBLIC_REACT_APP_ORIGIN_APPENDAGE,
          });
        }}
        user={user}
      ></AppContent>
    );
  }
  setUserID('');
  return null;
}

const exampleModels = [
  {
    name: 'Simple',
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

const exampleModelsForNewUser: {
  name: string;
  model: string; // JSON
}[] = [
  {
    name: myFirstModelName,
    model: JSON.stringify({
      ...minimalModel,
      name: myFirstModelName,
    }),
  },
];

let reactAppComponent: AppContent;

function setViewSetting(input: Setting): boolean {
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

/*
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
*/

function showAlert(text: string) {
  // log(`setState for alert update : ${text}`);
  if(reactAppComponent) {
    reactAppComponent.setState({
      alertText: text,
    });
  }
}

function getMyFirstModel(viewState: ViewSettings) {
  const modelFromExamplesList = exampleModelsForNewUser.find((nAndM) => {
    return nAndM.name === modelName;
  });
  if (modelFromExamplesList) {
    return makeModelFromJSON(modelFromExamplesList.model, viewState);
  } else {
    throw new Error(
      `Error: ${myFirstModelName} should be in the exampleModelsForNewUser list`,
    );
  }
}

async function getModel(viewState: ViewSettings): Promise<{
  model: ModelData | undefined;
  modelNames: string[];
}> {
  let modelNames = await getModelNames(getUserID(), viewState);
  let model: ModelData | undefined = undefined;
  // log(`got ${modelNames.length} modelNames`);

  if (
    modelNames.length === 0 ||
    modelName === '' ||
    (modelName === myFirstModelName &&
      modelNames.find((x) => {
        return x === myFirstModelName;
      }) === undefined)
  ) {
    // log(`modelNames are ${modelNames}`);
    // log(`does not include ${myFirstModelName}, so`);
    if (modelNames.length > 0) {
      // log(`no model called ${myFirstModelName}, so just choose the 1st one`);
      modelName = modelNames.sort((a, b) => lessThan(a, b))[0];
      // log(`switch to a different modelName ${modelName}`);

      const modelAndStatus = await loadModel(getUserID(), modelName, viewState);
      if (modelAndStatus === undefined) {
        const response = 'problem with model data';
        showAlert(response);
        return { model, modelNames };
      }
      isDirty = modelAndStatus.status.isDirty;
      model = modelAndStatus.model;
    } else {
      // log('recreate new user models');
      await Promise.all(
        exampleModelsForNewUser.map(async (x) => {
          return await saveModelLSM(
            getUserID(),
            x.name,
            makeModelFromJSON(x.model, reactAppComponent.state.viewState),
          );
        }),
      );
      modelNames = exampleModelsForNewUser.map((x) => {
        return x.name;
      });
      modelName = myFirstModelName;
      model = getMyFirstModel(reactAppComponent.state.viewState);
    }
  } else {
    // log(`modelNames are ${modelNames}`);
    // log(`go load ${modelName}`);
    let gotModelOK = true;
    try {
      // log(`look for ${modelName} from ${modelNames}`);
      const modelAndStatus = await loadModel(getUserID(), modelName, reactAppComponent.state.viewState);
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
      return { model, modelNames };
    }
  }
  return { model, modelNames };
}
function evalMode(): boolean {
  if (reactAppComponent) {
    return reactAppComponent.options.evalMode;
  } else {
    return false;
  }
}
function showHistorical(): boolean {
  if (reactAppComponent) {
    return reactAppComponent.options.showHistorical;
  } else {
    return false;
  }
}
function showCurrent(): boolean {
  if (reactAppComponent) {
    return reactAppComponent.options.showCurrent;
  } else {
    return false;
  }
}
function showFuture(): boolean {
  if (reactAppComponent) {
    return reactAppComponent.options.showFuture;
  } else {
    return false;
  }
}
function getReporter(
  model: ModelData,
  viewSettings: ViewSettings,
  reportIncludesSettings: boolean,
  reportIncludesExpenses: boolean,
) {
  // define a 'reporter' function which will be
  // passed into the evaluation code to capture
  // data as we proceed with calculations
  let nameMatcher = '';
  model.assets.forEach((a) => {
    if (viewSettings.getShowItem(Context.Asset, a.NAME)) {
      // log(`show ${a.NAME}`);
      const name = a.NAME;
      if (nameMatcher === '') {
        nameMatcher = name;
      } else {
        nameMatcher = nameMatcher + '|' + name;
      }
    } else {
      // log(`do not show ${a.NAME}`);
    }
  });
  if (reportIncludesSettings) {
    // include settings changes in the report
    model.settings.forEach((s) => {
      const name = s.NAME;
      if (nameMatcher === '') {
        nameMatcher = name;
      } else {
        nameMatcher = nameMatcher + '|' + name;
      }
    });
  }
  // log(`nameMatcher for reporter = ${nameMatcher}`);

  const viewRange = getROI(model);
  const startDate = viewRange.start;
  const endDate = viewRange.end;
  //log(`startDate for reporter = ${startDate}`);
  //log(`endDate for reporter = ${endDate}`);
  return (name: string, val: number | string, date: Date, source: string) => {
    // log(`name for matching = ${name}`);
    if (!reactAppComponent.state.reportDefiner) {
      return false;
    }
    // log(`should we display ${name} at ${dateAsString(DateFormatType.Debug,date)}?`);
    if (!reportIncludesExpenses) {
      if (
        model.expenses.find((e) => {
          return e.NAME === source;
        })
      ) {
        // expenses just happen - do not include them in 'actions'
        // log(`do not display ${name} bcs it's an expense`);
        return false;
      }
    }

    // log(`sourceMatcher = ${reactAppComponent.reportDefiner.sourceMatcher}`)
    // log(`sourceExcluder = ${reactAppComponent.reportDefiner.sourceExcluder}`)
    if (nameMatcher === '') {
      return false;
    }
    const matcher = reactAppComponent.state.reportDefiner.sourceMatcher;
    const excluder = reactAppComponent.state.reportDefiner.sourceExcluder;

    /* istanbul ignore if  */
    if (printDebug()) {
      log(`report for name = ${name}`);
      log(`report for val = ${val}`);
      log(`report for date = ${date}`);
      log(`report for source = ${source}`);
    }
    if (date < getTodaysDate(model)) {
      // log(`do not display ${name} bcs date is before today's date`);
      return false;
    }
    if (date < startDate) {
      // log(`do not display ${name} bcs date is before startDate`);
      return false;
    }
    if (date > endDate) {
      // log(`do not display ${name} bcs date is aftee endDate`);
      return false;
    }
    if (name.startsWith(purchase)) {
      // log(`do not display ${name} bcs name starts with purchase`);
      return false;
    }
    if (nameMatcher) {
      const nameRegex = RegExp(nameMatcher, 'i');
      if (name.match(nameRegex) === null) {
        // log(`do not display ${name} bcs it doesn't match ${nameMatcher}`);
        return false;
      }
    }

    if (matcher) {
      try {
        const sourceRegex = RegExp(matcher, 'i');
        if (source.match(sourceRegex) === null) {
          // log(`do not show source ${source} bcs it doesn't match ${matcher}`);
          return false;
        }
      } catch (e) {
        alert('error processing regexp');
        return false;
      }
    }

    if (excluder) {
      try {
        const sourceRegex = RegExp(excluder, 'i');
        if (source.match(sourceRegex) !== null) {
          // log(`do not show source ${source} bcs it does match ${excluder}`);
          return false;
        }
      } catch (e) {
        alert('error processing regexp');
        return false;
      }
    }
    // log(`yes, do display ${name} at ${dateAsString(DateFormatType.Debug,date)}?`);
    return true;
  };
}

async function refreshDataInternal(
  refreshModel: boolean,
  refreshChart: boolean,
  sourceID: number,
): Promise<void> {
  if (!evalMode()) {
    log('skip evaluations and chart refresh - evalMode = false');
    reactAppComponent.setState({ ...reactAppComponent.state });
    return;
  }
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`entering refreshDataInternal from sourceID ${sourceID}`);
  }
  // log(`refreshData with refreshModel = `
  //   +`${refreshModel}, refreshChart = ${refreshChart}`);
  const viewSettings = reactAppComponent.state.viewState;

  let modelNames: string[];
  let model: ModelData;
  let evaluationsAndVals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<Asset, AssetOrDebtVal>;
    todaysDebtValues: Map<Asset, AssetOrDebtVal>;
    todaysIncomeValues: Map<Income, IncomeVal>;
    todaysExpenseValues: Map<Expense, ExpenseVal>;
    todaysSettingValues: Map<Setting, SettingVal>;
    reportData: ReportDatum[];
  } = {
    evaluations: reactAppComponent.state.evaluations,
    todaysAssetValues: reactAppComponent.state.todaysAssetValues,
    todaysDebtValues: reactAppComponent.state.todaysDebtValues,
    todaysIncomeValues: reactAppComponent.state.todaysIncomeValues,
    todaysExpenseValues: reactAppComponent.state.todaysExpenseValues,
    todaysSettingValues: reactAppComponent.state.todaysSettingValues,
    reportData: reactAppComponent.state.reportData,
  };

  // log('refreshData in AppContent - get data and redraw content');
  if (!refreshModel) {
    // use existing data
    modelNames = reactAppComponent.state.modelNamesData;
    model = reactAppComponent.state.modelData;
  } else {
    // log(`refresh the model - get the model and recalculate values`);
    const x = await getModel(viewSettings);
    if (x.model === undefined) {
      return;
    }
    model = x.model;
    modelNames = x.modelNames;

    model.triggers.sort((a: Trigger, b: Trigger) => lessThan(b.NAME, a.NAME));
    model.expenses.sort((a: Expense, b: Expense) => lessThan(b.NAME, a.NAME));
    model.settings.sort((a: Setting, b: Setting) => lessThan(b.NAME, a.NAME));
    model.incomes.sort((a: Income, b: Income) => lessThan(b.NAME, a.NAME));
    model.transactions.sort((a: Transaction, b: Transaction) =>
      lessThan(b.NAME, a.NAME),
    );
    model.assets.sort((a: Asset, b: Asset) => lessThan(b.NAME, a.NAME));
    modelNames.sort((a: string, b: string) => lessThan(a, b));

    if (refreshModel) {
      viewSettings.setModel(model);
    }
    // log(`go to make evaluations...`);
    let reporter: ReportValueChecker = () =>
      //name: string,
      //val: number | string,
      //date: Date,
      //source: string,
      {
        return false;
      };
    if (getDisplay(reportView)) {
      // log(`create the report data`);
      reporter = getReporter(
        model,
        viewSettings,
        reactAppComponent.state.reportIncludesSettings,
        reactAppComponent.state.reportIncludesExpenses,
      );
    } else if (getDisplay(planningView)) {
      // log('make reporter for planning view');
      reporter = (
        name: string,
        val: number | string,
        date: Date,
        source: string,
      ) => {
        val;
        date;
        source;
        const result =
          name.startsWith('taxForFixed') || name.startsWith('incomeFixed');
        // console.log(`include ${name} for report? ${result}`);
        return result;
      };
    } else if (getDisplay(taxView)) {
      // log('make reporter for planning view');
      reporter = (
        name: string,
        val: number | string,
        date: Date,
        source: string,
      ) => {
        val;
        date;
        source;
        const result = name.startsWith('taxBreakdown');
        // console.log(`include ${name} for report? ${result}`);
        return result;
      };
    }
    // go and do the actual modeling, the calculations
    const helper = new EvaluationHelper(
      reporter,
      reactAppComponent.state.maxReportSize,
      viewSettings.getViewSetting(viewFrequency, monthly),
    );
    evaluationsAndVals = getEvaluations(model, helper);
    if (reactAppComponent.state.saveReportAsCSV) {
      const data = evaluationsAndVals.reportData;

      const mapElementToColumns = (fieldNames: string[]) => {
        return function (element: any) {
          const fields = fieldNames.map((n) =>
            element[n] ? JSON.stringify(element[n]) : '""',
          );
          return fields.join(',');
        };
      };

      const fieldnames = Object.keys(data[0]);
      let csvtxt = fieldnames.join(',').concat('\n');
      csvtxt = csvtxt.concat(
        data.map(mapElementToColumns(fieldnames)).join('\n'),
      );

      if (confirm(`save as csv to... ${csvtxt}`)) {
        const d = new Date();
        const csvName =
          model.name + 'csv ' + dateFormat(d, 'yyyy-mm-dd HH:MM:ss');

        const blob = new Blob([csvtxt], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(blob, `${csvName}.csv`);
      }
    }

    // log(`evaluationsAndVals.reportData.length = ${evaluationsAndVals.reportData.length}`);
  }
  if (refreshModel || refreshChart) {
    // log(`refresh model or chart data`);
    const chartData: DataForView = makeChartData(
      model,
      viewSettings,
      evaluationsAndVals,
    );

    chartData.expensesData.sort((a, b) => lessThan(a.item.NAME, b.item.NAME));
    chartData.incomesData.sort((a, b) => lessThan(a.item.NAME, b.item.NAME));
    chartData.assetData.sort((a, b) => lessThan(a.item.NAME, b.item.NAME));
    chartData.taxData.sort((a, b) => lessThan(a.item.NAME, b.item.NAME));

    /* istanbul ignore if  */
    if (printDebug()) {
      chartData.assetData.forEach((entry) => {
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
      totalTaxPaid,
    } = chartData;

    /* istanbul ignore if  */
    if (printDebug()) {
      log('in refreshData');
      log(` expensesData = ${expensesData}`);
      log(` incomesData = ${incomesData}`);
      log(` assetData = ${assetData}`);
      log(` taxData = ${taxData}`);
    }

    const expensesChartData = makeBarData(chartData.labels, expensesData);
    const incomesChartData = makeBarData(chartData.labels, incomesData);
    const assetChartData = makeBarData(chartData.labels, assetData);
    const debtChartData = makeBarData(chartData.labels, debtData);
    const taxChartData = makeBarData(chartData.labels, taxData);

    const planningViewSettings = getDefaultViewSettings();
    planningViewSettings.setModel(model);
    planningViewSettings.toggleViewFilter(Context.Expense, allItems);
    planningViewSettings.toggleViewFilter(Context.Expense, 'Basic'); // the Planning page works with this category
    planningViewSettings.toggleViewFilter(Context.Expense, 'Leisure'); // the Planning page works with this category
    planningViewSettings.toggleViewFilter(Context.Asset, allItems);
    planningViewSettings.toggleViewFilter(Context.Asset, 'BondsFixedTerm'); // the Planning page works with this category
    planningViewSettings.setViewSetting(viewDetail, coarseDetail);
    planningViewSettings.setViewSetting(chartViewType, chartDeltas);

    const planningChartData: DataForView = makeChartData(
      model,
      planningViewSettings,
      evaluationsAndVals,
    );
    const planningExpensesChartData = makeBarData(
      planningChartData.labels,
      planningChartData.expensesData,
    );
    const planningAssetsChartData = makeBarData(
      planningChartData.labels,
      planningChartData.assetData,
    );
    if (printDebug()) {
      console.log(
        `evaluationsAndVals.reportData = ${JSON.stringify(
          evaluationsAndVals.reportData,
        )}`,
      );
    }
    if (reactAppComponent !== undefined) {
      // log(`go setState with modelNames = ${modelNames}`);

      // setState on a reactComponent triggers update of view
      // log(`setState for new data`);
      reactAppComponent.setState(
        {
          modelData: model,
          evaluations: evaluationsAndVals.evaluations,
          expensesChartData,
          incomesChartData,
          assetChartData,
          debtChartData,
          taxChartData,
          planningExpensesChartData,
          planningAssetsChartData,
          modelNamesData: modelNames,
          todaysAssetValues: todaysAssetValues,
          todaysDebtValues: todaysDebtValues,
          todaysIncomeValues: todaysIncomeValues,
          todaysExpenseValues: todaysExpenseValues,
          todaysSettingValues: todaysSettingValues,
          reportData: evaluationsAndVals.reportData,
          totalTaxPaid: totalTaxPaid,
        },
        () => {
          //alert('done!');
          // setState is async
          // do logging after setState using the 2nd argument
          // https://www.freecodecamp.org/news/get-pro-with-react-setstate-in-10-minutes-d38251d1c781/
          /* istanbul ignore if  */
          if (printDebug()) {
            log(
              'reactAppComponent.state.reportData.length = ' +
                `${reactAppComponent.state.reportData.length}`,
            );
          }
        },
      );
    }
  } else {
    // log('refreshData in no need to visit db');
    // log(`setState without new visit to db`);
    reactAppComponent.setState({ ...reactAppComponent.state });
  }
  // log(`finished refreshData`);
}

export async function refreshData(
  refreshModel: boolean,
  refreshChart: boolean,
  sourceID: number,
): Promise<void> {
  // log(
  //   `refreshData called refreshModel = ${refreshModel}, refreshChart = ${refreshChart} from sourceID = ${sourceID}`,
  // );
  if (refreshModel) {
    // log('in refreshData with refreshModel = true');
  }
  if (refreshChart) {
    // log('in refreshData with refreshChart = true');
  }
  if (getDisplay(optimizerView)) {
    const viewSettings = reactAppComponent.state.viewState;
    const reporter: ReportValueChecker = () =>
      //name: string,
      //val: number | string,
      //date: Date,
      //source: string,
      {
        return false;
      };
    const helper = new EvaluationHelper(
      reporter,
      reactAppComponent.state.maxReportSize,
      viewSettings.getViewSetting(viewFrequency, monthly),
    );
    const cd: ChartData = calcOptimizer(
      reactAppComponent.state.modelData,
      helper,
      showAlert,
      viewSettings,
    );
    reactAppComponent.setState({
      optimizationChartData: cd,
    });
    return;
  }
  if (refreshModel) {
    log(
      `go to refresh data - set as waiting...${new Date().toLocaleTimeString()}`,
    );
    return await reactAppComponent.setState(
      {
        isWaiting: true,
      },
      async () => {
        const result = await refreshDataInternal(
          refreshModel,
          refreshChart,
          sourceID,
        );
        log(
          `finished refresh data - set as not waiting...${new Date().toLocaleTimeString()}`,
        );
        reactAppComponent.setState({
          isWaiting: false,
        });
        return result;
      },
    );
  } else {
    if (refreshChart) {
      log('go to refresh chart');
    }
    return await refreshDataInternal(refreshModel, refreshChart, sourceID);
  }
}

function setReportKey(
  textInput: string,
  maxSize: number,
  saveAsCSV: boolean,
  reportIncludesSettings: boolean,
  reportIncludesExpenses: boolean,
): boolean {
  /*
  report:{"sourceExcluder":"growth"}
  */
  try {
    const inputObj = JSON.parse(textInput);

    // log(`setState for report writing`);
    reactAppComponent.setState(
      {
        reportDefiner: {
          sourceMatcher: inputObj.sourceMatcher,
          sourceExcluder: inputObj.sourceExcluder,
        },
        saveReportAsCSV: saveAsCSV,
        maxReportSize: maxSize,
        reportIncludesSettings: reportIncludesSettings,
        reportIncludesExpenses: reportIncludesExpenses,
      },
      async () => {
        log('set key for report : go refresh data');
        refreshData(
          true, // refreshModel
          true, // refreshChart
          1, //sourceID
        );
      },
    );
    return true;
  } catch (e) {
    alert('error processing JSON format');
    return false;
  }
}
export function getReportKey(): ReportMatcher {
  return reactAppComponent.state.reportDefiner;
}

async function submitAsset(
  assetInput: Asset,
  modelData: ModelData,
  viewState: ViewSettings,
): Promise<void> {
  const outcome = await submitAssetLSM(
    assetInput,
    modelName,
    modelData,
    reactAppComponent.options.checkModelOnEdit,
    getUserID(),
    viewState,
  );
  if (outcome.message === '') {
    return await refreshData(
      true, // refreshModel
      true, // refreshChart
      2, //sourceID
    );
  } else {
    showAlert(outcome.message);
  }
}
async function submitExpense(
  expenseInput: Expense,
  modelData: ModelData,
  viewState: ViewSettings,
): Promise<void> {
  const outcome = await submitExpenseLSM(
    expenseInput,
    modelName,
    modelData,
    reactAppComponent.options.checkModelOnEdit,
    getUserID(),
    viewState,
  );
  if (outcome.message === '') {
    return await refreshData(
      true, // refreshModel
      true, // refreshChart
      3, //sourceID
    );
  } else {
    showAlert(outcome.message);
  }
}
async function submitIncome(
  incomeInput: Income,
  modelData: ModelData,
  viewState: ViewSettings,
): Promise<boolean> {
  const message = await submitIncomeLSM(
    incomeInput,
    modelName,
    modelData,
    reactAppComponent.options.checkModelOnEdit,
    getUserID(),
    viewState,
  );
  if (message.message === '') {
    await refreshData(
      true, // refreshModel
      true, // refreshChart
      4, //sourceID
    );
    return true;
  } else {
    showAlert(message.message);
    return false;
  }
}
async function submitTransaction(
  transactionInput: Transaction,
  modelData: ModelData,
  viewState: ViewSettings,
): Promise<void> {
  const outcome = await submitTransactionLSM(
    transactionInput,
    modelName,
    modelData,
    reactAppComponent.options.checkModelOnEdit,
    getUserID(),
    viewState,
  );
  if (outcome.message === '') {
    return await refreshData(
      true, // refreshModel
      true, // refreshChart
      5, //sourceID
    );
  } else {
    showAlert(outcome.message);
  }
}
async function submitTrigger(
  triggerInput: Trigger,
  modelData: ModelData,
  viewState: ViewSettings,
): Promise<void> {
  const outcome = await submitTriggerLSM(
    triggerInput,
    modelName,
    modelData,
    reactAppComponent.options.checkModelOnEdit,
    getUserID(),
    viewState,
  );
  if (outcome.message === '') {
    return await refreshData(
      true, // refreshModel
      true, // refreshChart
      6, //sourceID
    );
  } else {
    showAlert(outcome.message);
  }
}

// if HINT or TYPE are empty, leave pre-existing values
export async function editSetting(
  settingInput: {
    NAME: string;
    ERA: number | undefined;
    VALUE: string;
    HINT: string;
  },
  modelData: ModelData,
  viewState: ViewSettings,
): Promise<void> {
  if (
    setViewSetting({
      NAME: settingInput.NAME,
      ERA: settingInput.ERA,
      VALUE: settingInput.VALUE,
      TYPE: viewType,
      HINT: '',
    })
  ) {
    return await refreshData(
      false, // refreshModel
      true, // refreshChart
      7, //sourceID
    );
  }
  const settingWithBlanks = {
    ...settingInput,
    TYPE: '',
  };
  const outcome = await submitSettingLSM(
    settingWithBlanks,
    modelName,
    modelData,
    reactAppComponent.options.checkModelOnEdit,
    getUserID(),
    viewState,
  );
  if (outcome.message === '') {
    return await refreshData(
      true, // refreshModel
      true, // refreshChart
      8, //sourceID
    );
  } else {
    showAlert(outcome.message);
  }
}

export async function submitNewSetting(
  setting: Setting,
  modelData: ModelData,
  viewSettings: ViewSettings,
): Promise<void> {
  if (viewSettings.migrateViewSettingString(setting.NAME, setting.VALUE)) {
    return await refreshData(
      false, // refreshModel
      true, // refreshChart
      9, //sourceID
    );
  } else {
    await submitNewSettingLSM(
      setting,
      modelName,
      modelData,
      reactAppComponent.options.checkModelOnEdit,
      getUserID(),
      viewSettings,
    );
    return await refreshData(
      true, // refreshModel
      true, // refreshChart
      10, //sourceID
    );
  }
}

export function toggle(
  type: ViewType,
  refreshModel: boolean,
  refreshChart: boolean,
  sourceID: number,
): void | boolean {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`toggle called from ${sourceID}`);
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
  if (reactAppComponent?.appContentIsMounted()) {
    refreshData(
      refreshModel, // refreshModel
      refreshChart, // refreshChart
      11, //sourceID
    );
  }
}

function checkModelData(givenModel: ModelData, expectedName: string): string {
  const outcome = checkData(givenModel);
  if (givenModel.name !== expectedName) {
    return `inconsistent model names; ${givenModel.name} and ${expectedName}`;
  }
  if (outcome.message === '') {
    return 'model check all good';
  } else {
    return outcome.message;
  }
}

function setSearchString(s: string): boolean {
  try {
    const regex = RegExp(s);
    if ('test'.match(regex) === null) {
      // log(`test does not match regex`);
    }
  } catch (e) {
    alert('error processing regexp');
    return false;
  }
  if (reactAppComponent) {
    reactAppComponent.options.searchString = s;
  }
  return true;
}
function setUIMode(type: string): void {
  if (reactAppComponent) {
    reactAppComponent.options[uiMode] = type;
    refreshData(
      true, // refreshModel
      true, // refreshChart
      99, //sourceID
    );
  } else {
    alert(`error: data not ready to set ${type} mode`);
  }
}
function toggleOption(type: string): void {
  if (reactAppComponent) {
    // log(
    //   `before toggle reactAppComponent.state.${type} = `
    //   +`${reactAppComponent.options[type]}`,
    // );
    reactAppComponent.options[type] = !reactAppComponent.options[type];
    // log(`after toggle state has ${type} is ${reactAppComponent.options[type]}`);

    // when we turn checks back on, check the model
    if (type === checkModelOnEditOption && reactAppComponent.options[type]) {
      const response = checkModelData(
        reactAppComponent.state.modelData,
        modelName,
      );
      // log(`setState for check result alert`);
      reactAppComponent.setState({
        alertText: response,
      });
    }

    // when we turn chart refresh back on, refresh the charts
    if (type === evalModeOption && reactAppComponent.options[type]) {
      refreshData(
        true, // refreshModel
        true, // refreshChart
        31, //sourceID
      );
    } else if (
      type === showHistoricalOption ||
      type === showCurrentOption ||
      type === showFutureOption
    ) {
      refreshData(
        true, // refreshModel
        true, // refreshChart
        33, //sourceID
      );
    } else if (type === uiMode) {
      refreshData(
        true, // refreshModel
        true, // refreshChart
        12, //sourceID
      );
    }
  } else {
    alert(`error: data not ready to set ${type} mode`);
  }
}
export function getOption(type: string): boolean {
  return reactAppComponent.options[type];
}
export function getUIMode(): string {
  return reactAppComponent.options[uiMode];
}
export async function setEraInModel(
  name: string,
  value: number,
  itemList: Item[],
  modelName: string,
  model: ModelData,
  viewSettings: ViewSettings,
): Promise<boolean> {
  markForUndo(model, viewSettings);
  let missingItem: string | undefined = undefined;
  const idx = itemList.findIndex((i: Item) => {
    return i.NAME === name;
  });
  // log(`idx of ${name} is ${idx}`);

  if (idx !== -1) {
    itemList[idx].ERA = value;
    // log(`item is now ${showObj(itemList[idx])})}`);
  } else {
    missingItem = name;
  }

  if (missingItem !== undefined) {
    const response = `item not found for setting era :${missingItem}`;
    // log(`setState for delete item alert`);
    reactAppComponent.setState({
      alertText: response,
    });
    // log(`revert attempt to set favourite - missing item`);
    revertToUndoModel(model);
    return false;
  }

  //log(
  //  `now itemList = ${itemList.map((i) => {
  //    return i.NAME;
  //  })}`,
  //);

  await saveModelLSM(getUserID(), modelName, model);
  await refreshData(
    true, // refreshModel
    false, // refreshChart
    32, //sourceID
  );
  return true;
}

async function deleteItemsFromModel(
  names: string[],
  itemList: Item[],
  modelName: string,
  model: ModelData,
  doChecks: boolean,
  allowRecursion: boolean,
  showAlert: (message: string) => void,
  viewState: ViewSettings,
): Promise<boolean> {
  const response = await deleteItemsFromModelInternal(
    names,
    itemList,
    modelName,
    model,
    doChecks,
    allowRecursion,
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
        return refreshData(a, b, c);
      }
    },
    viewState,
  );
  return response.message === '';
}
async function deleteTrigger(
  name: string,
  viewState: ViewSettings,
): Promise<DeleteResult> {
  return deleteItemsFromModelInternal(
    [name],
    reactAppComponent.state.modelData.triggers,
    modelName,
    reactAppComponent.state.modelData,
    reactAppComponent.options.checkModelOnEdit,
    true, // allowRecursion
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
      return refreshData(a, b, c);
    }},
    viewState,    
  );
}

async function deleteAsset(
  name: string,
  viewState: ViewSettings,
): Promise<DeleteResult> {
  return deleteItemsFromModelInternal(
    [name],
    reactAppComponent.state.modelData.assets,
    modelName,
    reactAppComponent.state.modelData,
    reactAppComponent.options.checkModelOnEdit,
    true, // allowRecursion
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
      return refreshData(a, b, c);
    }},
    viewState,
  );
}

async function deleteTransaction(
  name: string,
  viewState: ViewSettings,
): Promise<DeleteResult> {
  return deleteItemsFromModelInternal(
    [name],
    reactAppComponent.state.modelData.transactions,
    modelName,
    reactAppComponent.state.modelData,
    reactAppComponent.options.checkModelOnEdit,
    true, // allowRecursion
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
      return refreshData(a, b, c);
    }},
    viewState,
  );
}

async function deleteExpense(
  name: string,
  viewState: ViewSettings,
): Promise<DeleteResult> {
  return deleteItemsFromModelInternal(
    [name],
    reactAppComponent.state.modelData.expenses,
    modelName,
    reactAppComponent.state.modelData,
    reactAppComponent.options.checkModelOnEdit,
    true, // allowRecursion
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
      return refreshData(a, b, c);
    }},
    viewState,
  );
}

async function deleteIncome(
  name: string,
  viewState: ViewSettings,
): Promise<DeleteResult> {
  return deleteItemsFromModelInternal(
    [name],
    reactAppComponent.state.modelData.incomes,
    modelName,
    reactAppComponent.state.modelData,
    reactAppComponent.options.checkModelOnEdit,
    true, // allowRecursion
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
      return refreshData(a, b, c);
    }},
    viewState,
  );
}

async function deleteSetting(
  name: string,
  viewState: ViewSettings,
): Promise<DeleteResult> {
  return deleteItemsFromModelInternal(
    [name],
    reactAppComponent.state.modelData.settings,
    modelName,
    reactAppComponent.state.modelData,
    reactAppComponent.options.checkModelOnEdit,
    true, // allowRecursion
    showAlert,
    async (a, b, c)=>{ if(reactAppComponent){
      return refreshData(a, b, c);
    }},
    viewState,
  );
}
function okToContinue(newEraValue: number): boolean {
  // only change the era if it'll be visible
  if (newEraValue === -1) {
    if (showHistorical()) {
      return true;
    } else {
      const gotPermission = window.confirm(
        'make historical items visible in tables?',
      );
      if (gotPermission) {
        toggleOption(showHistoricalOption);
        return true;
      } else {
        return false;
      }
    }
  }
  if (newEraValue === 0) {
    if (showCurrent()) {
      return true;
    } else {
      const gotPermission = window.confirm(
        'make current items visible in tables?',
      );
      if (gotPermission) {
        toggleOption(showCurrentOption);
        return true;
      } else {
        return false;
      }
    }
  }
  if (newEraValue === -1) {
    if (showFuture()) {
      return true;
    } else {
      const gotPermission = window.confirm(
        'make future items visible in tables?',
      );
      if (gotPermission) {
        toggleOption(showFutureOption);
        return true;
      } else {
        return false;
      }
    }
  }
  return true;
}
async function setEraTrigger(
  name: string,
  value: number,
): Promise<boolean> {
  if (okToContinue(value)) {
    return setEraInModel(
      name,
      value,
      reactAppComponent.state.modelData.triggers,
      modelName,
      reactAppComponent.state.modelData,
      reactAppComponent.state.viewState,
    );
  } else {
    return false;
  }
}
async function setEraAsset(
  name: string,
  value: number,
): Promise<boolean> {
  if (okToContinue(value)) {
    return setEraInModel(
      name,
      value,
      reactAppComponent.state.modelData.assets,
      modelName,
      reactAppComponent.state.modelData,
      reactAppComponent.state.viewState,
    );
  } else {
    return false;
  }
}
async function setEraTransaction(
  name: string,
  value: number,
): Promise<boolean> {
  if (okToContinue(value)) {
    return setEraInModel(
      name,
      value,
      reactAppComponent.state.modelData.transactions,
      modelName,
      reactAppComponent.state.modelData,
      reactAppComponent.state.viewState,
    );
  } else {
    return false;
  }
}
async function setEraExpense(
  name: string,
  value: number,
): Promise<boolean> {
  if (okToContinue(value)) {
    return setEraInModel(
      name,
      value,
      reactAppComponent.state.modelData.expenses,
      modelName,
      reactAppComponent.state.modelData,
      reactAppComponent.state.viewState,
    );
  } else {
    return false;
  }
}
async function setEraIncome(
  name: string,
  value: number,
): Promise<boolean> {
  if (okToContinue(value)) {
    return setEraInModel(
      name,
      value,
      reactAppComponent.state.modelData.incomes,
      modelName,
      reactAppComponent.state.modelData,
      reactAppComponent.state.viewState,
    );
  } else {
    return false;
  }
}
async function setEraSetting(
  name: string,
  value: number,
): Promise<boolean> {
  if (okToContinue(value)) {
    return setEraInModel(
      name,
      value,
      reactAppComponent.state.modelData.settings,
      modelName,
      reactAppComponent.state.modelData,
      reactAppComponent.state.viewState,
    );
  } else {
    return false;
  }
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
    true, // refreshModel
    true, // refreshChart
    14, //sourceID
  );
  return true;
}

function goToAssetsPage(): boolean {
  if (reactAppComponent) {
    return reactAppComponent.options.goToAssetsPage;
  } else {
    return false;
  }
}
function checkOverwrite(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.checkOverwrite;
    // log(`should we check before overwrite? ${result}`);
    return result;
  } else {
    return false;
  }
}
function getSearchString(): string {
  if (reactAppComponent) {
    const result = reactAppComponent.options.searchString;
    // log(`should we check before overwrite? ${result}`);
    return result;
  } else {
    return '';
  }
}
function doShowTransactionsButton(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.uiMode === advancedUI;
    return result;
  } else {
    return false;
  }
}
function doShowTaxButton(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.uiMode === advancedUI;
    return result;
  } else {
    return false;
  }
}
function doShowAssetActionsButton(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.uiMode === advancedUI;
    return result;
  } else {
    return false;
  }
}
function doShowPlanningButton(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.uiMode === advancedUI;
    return result;
  } else {
    return false;
  }
}
function doShowOptimiserButton(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.uiMode === advancedUI;
    return result;
  } else {
    return false;
  }
}
function doShowTodaysValueColumns(): boolean {
  if (reactAppComponent) {
    const result = reactAppComponent.options.uiMode === advancedUI;
    return result;
  } else {
    return false;
  }
}
export async function replaceWithModel(
  userName: string | undefined,
  thisModelName: string,
  newModel: ModelData,
  confirmBeforeReplace: boolean,
): Promise<boolean> {
  log(`replaceWithModel, targetName = ${thisModelName}...`);
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
  console.log(`update model name to ${thisModelName}`);
  newModel.name = thisModelName;
  modelName = thisModelName;
  log(`save ${modelName} with new model data ${newModel}`);
  await saveModelLSM(userName, modelName, newModel);
  await refreshData(
    true, // refreshModel
    true, // refreshChart
    15, //sourceID
  );
  return true;
}

interface AppState {
  modelNamesData: string[];
  modelData: ModelData;
  evaluations: Evaluation[];
  viewState: ViewSettings;
  expensesChartData: ChartData;
  incomesChartData: ChartData;
  assetChartData: ChartData;
  debtChartData: ChartData;
  taxChartData: ChartData;
  planningExpensesChartData: ChartData; // to collect Basic and Leisure for Planning
  planningAssetsChartData: ChartData; // to collect maturing Bonds for Planning
  optimizationChartData: ChartData;
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
  reportDefiner: ReportMatcher;
  maxReportSize: number;
  reportIncludesSettings: boolean;
  reportIncludesExpenses: boolean;
  saveReportAsCSV: boolean;
  reportData: ReportDatum[];
  totalTaxPaid: number;
  alertText: string;
  isWaiting: boolean;
}
interface AppProps {
  logOutAction: () => void;
  user: {
    name: string;
  };
}

function AlertDismissibleExample(props: {
  message: string;
  dismissAction: () => void;
}) {
  const [show, setShow] = useState(true);
  let variant = 'success';
  if (!props.message.startsWith('added new')) {
    variant = 'warning';
  }

  return (
    <>
      <Alert show={show} variant={variant}>
        <div id="pageTitle" key="pageTitle">
          {props.message}
        </div>
        <Button
          onClick={() => {
            setShow(false);
            props.dismissAction();
          }}
          variant={`outline-${variant}`}
          id="btn-clear-alert"
          key="btn-clear-alert"
        >
          OK
        </Button>
      </Alert>

      {!show && <Button onClick={() => setShow(true)}>Show Alert</Button>}
    </>
  );
}

function needsChartRefresh(
  viewSettingsHolder: {
    viewState: ViewSettings;
  },
  oldViewType: ViewType | undefined,
  newViewType: ViewType | undefined,
) {
  let oldFrequency = annually;
  let newFrequency = monthly;
  if (viewSettingsHolder && viewSettingsHolder.viewState) {
    oldFrequency = viewSettingsHolder.viewState.getViewSetting(
      viewFrequency,
      'unknown1',
      oldViewType,
    );
    newFrequency = viewSettingsHolder.viewState.getViewSetting(
      viewFrequency,
      'unknown2',
      newViewType,
    );
  }
  const refreshChart = oldFrequency !== newFrequency;
  if (refreshChart) {
    log(`need to refresh chart oldF = ${oldFrequency}, newF = ${newFrequency}`);
  } else {
    log(`no need to refresh chart oldF = newF = ${newFrequency}`);
  }
  return refreshChart;
}

export class AppContent extends Component<AppProps, AppState> {
  options: any;
  private mounted = false;

  public appContentIsMounted() {
    return this.mounted;
  }

  public state = {
    modelData: emptyModel,
    evaluations: [],
    viewState: getDefaultViewSettings(),
    expensesChartData: {
      labels: [],
      datasets: [],
      displayLegend: true,
    },
    incomesChartData: {
      labels: [],
      datasets: [],
      displayLegend: true,
    },
    assetChartData: {
      labels: [],
      datasets: [],
      displayLegend: true,
    },
    debtChartData: {
      labels: [],
      datasets: [],
      displayLegend: true,
    },
    taxChartData: {
      labels: [],
      datasets: [],
      displayLegend: true,
    },
    optimizationChartData: {
      labels: [],
      datasets: [],
      displayLegend: false,
    },
    planningExpensesChartData: {
      labels: [],
      datasets: [],
      displayLegend: false,
    },
    planningAssetsChartData: {
      labels: [],
      datasets: [],
      displayLegend: false,
    },
    modelNamesData: [],
    todaysAssetValues: new Map<Asset, AssetOrDebtVal>(),
    todaysDebtValues: new Map<Asset, AssetOrDebtVal>(),
    todaysIncomeValues: new Map<Income, IncomeVal>(),
    todaysExpenseValues: new Map<Expense, ExpenseVal>(),
    todaysSettingValues: new Map<Setting, SettingVal>(),
    reportDefiner: {
      sourceMatcher: defaultSourceMatcher,
      sourceExcluder: defaultSourceExcluder,
    },
    maxReportSize: defaultReportSize,
    reportIncludesSettings: false,
    reportIncludesExpenses: true,
    saveReportAsCSV: false,
    reportData: [] as ReportDatum[],
    totalTaxPaid: 0,
    alertText: '',
    isWaiting: false,
  };

  public constructor(props: AppProps) {
    super(props);
    //this.handleUnload = this.handleUnload.bind(this);

    this.options = {
      goToAssetsPage: true,
      checkOverwrite: true,
      evalMode: true,
      checkModelOnEdit: true,
      favouritesOnly: false,
      uiMode: 'advancedUI',
      showHistorical: false,
      showCurrent: true,
      showFuture: true,
      searchString: '',
    };
    reactAppComponent = this;
  }

  public componentWillUnmount(): void {
    this.mounted = false;
    //log('in componentWillUnmount');
    //window.removeEventListener('beforeunload', this.handleUnload);
  }
  public componentDidMount(): void {
    this.mounted = true;
    //log('in componentDidMount');
    toggle(
      homeView,
      true, // refreshModel
      true, // refreshChart
      17, //sourceID
    );
    //window.addEventListener('beforeunload', this.handleUnload);
  }

  private navbarDiv(
    isWaiting: boolean,
    view: ViewType | undefined,
  ): JSX.Element {
    return navbarContent(isWaiting, () => {
      const estateVal = this.state.reportData.find((d) => {
        return d.name === 'Estate final value';
      });
      let textToDisplay = '';
      if (estateVal !== undefined) {
        if (estateVal.newVal !== undefined) {
          textToDisplay = `Estate: ${makeTwoDP(estateVal.newVal)}`;
        }
      }
      return (
        <>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form
                onSubmit={(e: React.FormEvent<Element>) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <Col>
                  <Row>{this.statusButtonList()}</Row>
                  <Row>{this.viewButtonList()}</Row>
                </Col>
              </Form>
            </Nav>
            <Nav>
              <Form
                onSubmit={(e: React.FormEvent<Element>) => {
                  e.preventDefault();
                  return false;
                }}
              >
                <Col>
                  <div className="d-flex flex-row-reverse">
                    {this.rhsTopButtonList(textToDisplay, view)}
                  </div>
                  <div className="d-flex flex-row-reverse">
                    {this.rhsBottomButtonList()}
                  </div>
                </Col>
              </Form>
            </Nav>
          </Navbar.Collapse>
        </>
      );
    });
  }

  public render(): JSX.Element {
    /* istanbul ignore if  */
    if (printDebug()) {
      log('in render');
    }
    // log(`this.state.reportData.length = ${this.state.reportData.length}`);
    try {
      // throw new Error('pretend something went wrong');
      const getStartDate = () => {
        const start: Date = getROI(this.state.modelData).start;
        return dateAsString(DateFormatType.View, start);
      };
      const getEndDate = () => {
        const end: Date = getROI(this.state.modelData).end;
        return dateAsString(DateFormatType.View, end);
      };
      const updateSettingValue = (settingName: string, newDate: string) => {
        const s = this.state.modelData.settings.find((s) => {
          return s.NAME === settingName;
        });
        if (s !== undefined) {
          s.VALUE = newDate;
          submitNewSetting(s, this.state.modelData, this.state.viewState);
        }
      };
      const deleteTransactions = (arg: string[]) => {
        const model = this.state.modelData;
        deleteItemsFromModel(
          arg,
          model.transactions,
          model.name,
          model,
          true,
          true,
          showAlert,
          this.state.viewState
        );
      };
      const deleteExpenses = (arg: string[]) => {
        const model = this.state.modelData;
        deleteItemsFromModel(
          arg,
          model.expenses,
          model.name,
          model,
          true,
          true,
          showAlert,
          this.state.viewState,
        );
      };

      const updateStartDate = async (newDate: string) => {
        updateSettingValue(roiStart, newDate);
      };
      const updateEndDate = async (newDate: string) => {
        updateSettingValue(roiEnd, newDate);
      };

      const filterForEra = (item: Item) => {
        if (showHistorical() && item.ERA === -1) {
          return true;
        } else if (
          showCurrent() &&
          (item.ERA === 0 || item.ERA === undefined)
        ) {
          return true;
        } else if (showFuture() && item.ERA === 1) {
          return true;
        } else {
          return false;
        }
      };

      const regexString = this.options.searchString;
      const regex = RegExp(regexString, 'i');

      const filterForSearch = (item: Item) => {
        if (regexString === undefined || regexString === '') {
          return true;
        }
        if (JSON.stringify(item).match(regex) === null) {
          return false;
        } else {
          return true;
        }
      };

      const parentCallbacks: ViewCallbacks = {
        showAlert,

        getStartDate,
        getEndDate,
        updateStartDate,
        updateEndDate,

        filterForEra,
        filterForSearch,
        getSearchString,
        setSearchString,

        doCheckBeforeOverwritingExistingData,
        doShowTodaysValueColumns,
        refreshData,

        deleteAsset,
        deleteExpense,
        deleteIncome,
        deleteSetting,
        deleteTrigger,
        deleteTransaction,

        deleteTransactions,
        deleteExpenses,

        setEraAsset,
        setEraExpense,
        setEraIncome,
        setEraSetting,
        setEraTrigger,
        setEraTransaction,

        submitAsset,
        submitExpense,
        submitIncome,
        submitTransaction,
        submitTrigger,

        editSetting,
      };

      return (
        <>
          {this.navbarDiv(this.state.isWaiting, getDisplayedView())}
          <>
            {this.homeDiv(
              this.state.viewState,
            )}
            {overviewDiv(
              this.state.modelData,
              this.props.user.name,
              this.state.todaysAssetValues,
              this.state.todaysIncomeValues,
              this.state.todaysExpenseValues,
              this.state.todaysSettingValues,
              this.state.viewState,
              this.options.checkModelOnEdit,
              this.state.assetChartData,
              this.state.debtChartData,
              this.state.expensesChartData,
              this.state.incomesChartData,
              this.state.taxChartData,
              parentCallbacks,
            )}
            {this.settingsDiv(
              this.state.modelData,
              this.state.todaysSettingValues,
              parentCallbacks,
              this.state.viewState,
            )}
            {incomesDiv(
              this.state.modelData,
              this.state.viewState,
              this.options.checkModelOnEdit,
              this.state.incomesChartData,
              this.state.todaysIncomeValues,
              parentCallbacks,
            )}
            {expensesDiv(
              this.state.modelData,
              this.state.viewState,
              this.options.checkModelOnEdit,
              this.state.expensesChartData,
              this.state.todaysExpenseValues,
              this.state.planningExpensesChartData,
              this.state.planningAssetsChartData,
              this.state.reportData,
              parentCallbacks,
            )}
            {assetsDiv(
              this.state.modelData,
              this.state.viewState,
              this.options.checkModelOnEdit,
              this.state.assetChartData,
              this.state.todaysAssetValues,
              parentCallbacks,
            )}
            {debtsDiv(
              this.state.modelData,
              this.state.viewState,
              this.options.checkModelOnEdit,
              this.state.debtChartData,
              this.state.todaysDebtValues,
              parentCallbacks,
            )}
            {this.transactionsDiv(
              parentCallbacks, 
              this.state.viewState,
            )}
            {taxDiv(
              this.state.modelData,
              this.state.viewState,
              this.state.taxChartData,
              this.state.totalTaxPaid,
              this.state.reportData,
              parentCallbacks,
            )}
            {this.triggersDiv(parentCallbacks)}
            {reportDiv(
              this.state.modelData,
              this.state.viewState,
              this.state.reportDefiner,
              this.state.maxReportSize,
              this.state.reportIncludesSettings,
              this.state.reportIncludesExpenses,
              this.state.reportData.slice(0, this.state.maxReportSize),
              'report',
              setReportKey,
              parentCallbacks.refreshData,
            )}
            {optimizerDiv(
              this.state.modelData,
              this.state.todaysSettingValues,
              this.state.viewState,
              this.state.optimizationChartData,
              parentCallbacks,
              'optimizer',
              this.state.viewState,
            )}{' '}
          </>
        </>
      );
    } catch (e) {
      const err: Error = e as Error;
      return this.internalErrorDiv(err);
    }
  }

  private internalErrorDiv(e: Error): JSX.Element {
    return (
      <>
        {this.navbarDiv(
          false, // is not waiting
          getDisplayedView(),
        )}
        <h1>
          Oops! something has gone wrong with FinKitty. Sad FinKitty apologises.
        </h1>
        {e.message}
      </>
    );
  }

  private modelList(
    modelNames: string[],
    actionOnSelect: (arg0: string) => void,
    idKey: string,
  ): JSX.Element {
    if (modelNames.length === 0) {
      return (
        <div role="group">
          <Image src={WaitGif} alt="FinKitty wait symbol" />
          Loading models...
        </div>
      );
    }
    // log(`modelNames = ${modelNames}`);
    const buttons = modelNames.map((model) => {
      return makeButton(
        model,
        (e: React.MouseEvent<HTMLButtonElement>) => {
          e.persist();
          actionOnSelect(model);
        },
        model,
        `btn-${idKey}-${model}`,
        idKey !== 'del' && modelName === model ? 'primary' : 'outline-primary',
      );
    });
    return (
      <Form>
      <div className="ml-3" id="selectLabel">
        Select an existing model
        <br />
        {buttons}
      </div>
      </Form>
    );
  }

  private modelListForSelect(modelNames: string[]): JSX.Element {
    return this.modelList(
      modelNames,
      async (model: string) => {
        if (await updateModelName(model)) {
          const oldView = getDisplayedView();
          if (goToAssetsPage()) {
            const newView = assetsView;
            await toggle(
              assetsView,
              false, // refreshModel
              needsChartRefresh(this.state, oldView, newView), // refreshChart
              19, //sourceID
            );
          }
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
      // log(`setState for regex item alert`);
      reactAppComponent.setState({
        alertText: response,
      });
      return result;
    } else if (
      this.state.modelNamesData.find((model) => model === promptResponse)
    ) {
      showAlert("There's already a model with that name");
      return result;
    }
    result.gotNameOK = true;
    result.newName = promptResponse;
    return result;
  }

  private async deleteModel(modelNameForDelete: string): Promise<void> {
    if (
      window.confirm(
        `delete all data in model ${modelNameForDelete} - you sure?`,
      )
    ) {
      // log(`delete model ${modelNameForDelete}`);
      const modelNames = this.state.modelNamesData;
      await deleteModel(getUserID(), modelNameForDelete, true);
      const idx = modelNames.findIndex((i) => {
        return i === modelNameForDelete;
      });
      if (idx !== -1) {
        modelNames.splice(idx, 1);
      } else {
        log(`error, deleted ${modelNameForDelete} found in ${modelNames}`);
      }
      // log(`model names after delete are ${modelNames}`);
      if (modelNames.length === 0) {
        showAlert('no data left: recreating a blank model');
        modelName = myFirstModelName;
        const model = getMyFirstModel(this.state.viewState);
        await saveModelLSM(getUserID(), modelName, model);
      } else {
        modelName = modelNames[0];
        // log(`model name after delete is ${modelName}`);
      }
      await refreshData(
        true, // refreshModel
        true, // refreshChart
        20, //sourceID
      );
    }
  }

  private async diffModel(modelNameForDiff: string): Promise<void> {
    const otherModelName: string | null = window.prompt(
      `diff ${modelNameForDiff} against which model?`,
      '',
    );
    if (otherModelName === null) {
      return;
    }
    const otherModelAndStatus = await loadModel(getUserID(), otherModelName, reactAppComponent.state.viewState);
    if (otherModelAndStatus === undefined) {
      const response = `Can't load a model named ${otherModelName}`;
      showAlert(response);
      return;
    }
    const otherModel = otherModelAndStatus.model;
    // log(`otherModel = ${showObj(otherModel)}`);
    if (!otherModel) {
      window.alert(`Can't load a model named ${otherModelName}`);
      return;
    }
    const diffResult = diffModels(
      this.state.modelData,
      otherModel,
      false,
      modelNameForDiff,
      otherModelName,
    );
    if (diffResult.length === 0) {
      window.alert('models are the same');
    } else {
      let s = '';
      for (const diff of diffResult) {
        s += diff + `\n`;
      }
      window.alert(s);
    }
  }

  private async cloneModel(
    name: string,
    fromModel: ModelData,
  ): Promise<boolean> {
    log(`going to clone a model and give it name ${name}`);
    // log(`stringify model for clone`);
    const currentData = JSON.stringify(fromModel);
    const updatedOK = await updateModelName(name);
    if (updatedOK) {
      const newModel = makeModelFromJSON(currentData, reactAppComponent.state.viewState, name);
      const replacedOK = await replaceWithModel(
        undefined,
        modelName,
        newModel,
        false,
      );
      if (replacedOK) {
        const oldView = getDisplayedView();
        if (goToAssetsPage()) {
          const newView = assetsView;
          await toggle(
            assetsView,
            false, // refreshModel
            needsChartRefresh(this.state, oldView, newView), // refreshChart
            21, //sourceID
          );
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false; // didn't update name OK
    }
  }
  private homeScreenButtons(): JSX.Element {
    return (
      <>
        <CreateModelForm
          userID={getUserID()}
          currentModelName={modelName}
          modelData={this.state.modelData}
          saveModel={async (
            userID: string,
            modelName: string,
            modelData: ModelData,
          ) => {
            const savedOK = await saveModelToDBLSM(
              userID,
              modelName,
              modelData,
            );
            if (savedOK) {
              refreshData(
                true, // refreshModel
                true, // refreshChart
                22, //sourceID
              );
            } else {
              alert('save failed!');
            }
          }}
          showAlert={showAlert}
          cloneModel={this.cloneModel}
          exampleModels={exampleModels}
          getExampleModel={(s) => {
            return makeModelFromJSON(s, reactAppComponent.state.viewState);
          }}
          getModelNames={(userID: string)=>{
            return getModelNames(userID, reactAppComponent.state.viewState);
          }}
        />
        <div className="btn-group ml-3" role="group">
          {makeButton(
            'Delete model',
            async () => {
              this.deleteModel(modelName);
            },
            `btn-delete`,
            `btn-delete`,
            'outline-secondary',
          )}
          {makeButton(
            'Diff model',
            async () => {
              this.diffModel(modelName);
            },
            `btn-diff`,
            `btn-diff`,
            'outline-secondary',
          )}
        </div>
        <br></br>
        <br></br>
        <div className="ml-3" id='devToolsDiv'>
          Developer tools:
          <br />
          {makeButton(
            'Check model',
            async () => {
              const response = checkModelData(
                reactAppComponent.state.modelData,
                modelName,
              );
              // log(`setState for check result alert`);
              reactAppComponent.setState({
                alertText: response,
              });
            },
            `btn-check`,
            `btn-check`,
            'outline-secondary',
          )}
          {makeButton(
            'Standardise dates',
            async () => {
              const response = standardiseDates(
                reactAppComponent.state.modelData,
                reactAppComponent.state.viewState,
              );
              // log(`setState for check result alert`);
              reactAppComponent.setState({
                alertText: response,
              });
            },
            `btn-standardise-dates`,
            `btn-standardise-dates`,
            'outline-secondary',
          )}
          <br></br>
          {makeButton(
            'Copy model as JSON to clipboard',
            () => {
              const text = JSON.stringify(this.state.modelData);
              navigator.clipboard.writeText(text).then(
                function () {
                  showAlert(`model as JSON on clipboard`);
                },
                function (err) {
                  console.error('Async: Could not copy text: ', err);
                  showAlert(
                    `sorry, something went wrong, no copy on clipboard - in console instead`,
                  );
                  log('-------- start of model --------');
                  log(text);
                  log('-------- end of model --------');
                },
              );
            },
            `btn-log`,
            `btn-log`,
            'outline-secondary',
          )}
          {makeButton(
            'Save log data',
            () => {
              saveLogs();
            },
            `btn-saveLogs`,
            `btnsaveLogs`,
            'outline-secondary',
          )}
          {makeButton(
            'Test encrypted JSON',
            () => {
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
                  const decipheredModel = makeModelFromJSON(
                    decipherString,
                    reactAppComponent.state.viewState,
                    'validatingModel',
                  );
                  const response = checkModelData(
                    decipheredModel,
                    'validatingModel',
                  );
                  // log(`setState for loaded model alert`);
                  reactAppComponent.setState({
                    alertText: response,
                  });
                }
              } catch (err) {
                showAlert('could not decode this data');
              }
            },
            `btn-JSON-encrypt-replace`,
            `btn-JSON-encrypt-replace`,
            'outline-secondary',
          )}
        </div>
        <ReplaceWithJSONForm
          modelName={modelName}
          modelNames={this.state.modelNamesData}
          userID={getUserID()}
          showAlert={showAlert}
          setReportKey={setReportKey}
          toggleOption={toggleOption}
          setUIMode={setUIMode}
          getOption={getOption}
          getUIMode={getUIMode}
          showHistorical={showHistorical}
          showCurrent={showCurrent}
          showFuture={showFuture}
          replaceWithModel={replaceWithModel}
          viewState={reactAppComponent.state.viewState}
        />
      </>
    );
  }

  private homeDiv(
    viewState: ViewSettings,
  ): JSX.Element {
    // log(`this.state.modelNamesData = ${this.state.modelNamesData}`);
    if (!getDisplay(homeView)) {
      // log(`don't populate homeView`);
      return <></>;
    }
    // log(`do populate homeView`);

    return (
      <div className="ml-3">
        <div className="row">
          <div className="col-sm mb-4">
            {this.modelListForSelect(this.state.modelNamesData)}
            <br />
            {this.state.modelNamesData.length > 0
              ? this.homeScreenButtons()
              : ''}
          </div>
          <div className="col-md mb-4">{screenshotsDiv()}</div>
        </div>
      </div>
    );
  }

  private settingsDiv(
    model: ModelData,
    todaysValues: Map<Setting, SettingVal>,
    parentCallbacks: ViewCallbacks,
    viewState: ViewSettings,
  ): JSX.Element {
    if (!getDisplay(settingsView)) {
      // log(`don't populate settingsView`);
      return <></>;
    }
    // log(`do populate settingsView`);
    return (
      <div className="ml-3">
        <fieldset>
          {settingsTableDiv(
            this.state.modelData,
            todaysValues,
            this.options.checkModelOnEdit,
            parentCallbacks,
            '',
            viewState,
          )}
          <p />

          {collapsibleFragment(
            <div className="addNewSetting">
              <AddDeleteSettingForm
                submitSettingFunction={submitNewSetting}
                checkTransactionFunction={checkTransaction}
                submitTransactionFunction={submitTransaction}
                submitTriggerFunction={submitTrigger}
                model={this.state.modelData}
                viewSettings={this.state.viewState}
                showAlert={showAlert}
                doCheckBeforeOverwritingExistingData={doCheckBeforeOverwritingExistingData}
                viewState={reactAppComponent.state.viewState}
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
            </div>,
            `Add setting`,
          )}
        </fieldset>
      </div>
    );
  }

  private triggersDiv(parentCallbacks: ViewCallbacks): JSX.Element {
    if (!getDisplay(triggersView)) {
      // log(`don't populate triggersView`);
      return <></>;
    }
    // log(`do populate triggersView`);

    return (
      <div className="ml-3">
        {triggersTableDivWithHeading(
          this.state.modelData,
          this.options.checkModelOnEdit,
          parentCallbacks,
          '',
          reactAppComponent.state.viewState
        )}
        <p />
        {collapsibleFragment(
          <div className="addNewTrigger">
            <AddDeleteTriggerForm
              checkFunction={checkTrigger}
              submitFunction={submitTrigger}
              deleteFunction={deleteTrigger}
              model={this.state.modelData}
              showAlert={showAlert}
              doCheckBeforeOverwritingExistingData={doCheckBeforeOverwritingExistingData}
              viewState={reactAppComponent.state.viewState}
              />
          </div>,
          `Add an important date`,
        )}
      </div>
    );
  }

  private transactionsDiv(
    parentCallbacks: ViewCallbacks,
    viewState: ViewSettings,
  ): JSX.Element {
    if (!getDisplay(transactionsView)) {
      // log(`don't populate transactionsView`);
      return <></>;
    }
    // log(`do populate transactionsView`);

    return (
      <div className="ml-3">
        {transactionFilteredTable(
          this.state.modelData,
          this.options.checkModelOnEdit,
          custom,
          'Custom transactions',
          parentCallbacks,
          'customTransactions',
          viewState,
        )}
        {transactionFilteredTable(
          this.state.modelData,
          this.options.checkModelOnEdit,
          autogen,
          'Auto-generated transactions',
          parentCallbacks,
          'autogenTransactions',
          viewState,
        )}
        {transactionFilteredTable(
          this.state.modelData,
          this.options.checkModelOnEdit,
          bondInvest,
          'Bond transactions',
          parentCallbacks,
          'bondTransactions',
          viewState,
        )}
        <p />
        <div className="addNewTransaction">
          <h4> Add a transaction </h4>
          <AddDeleteTransactionForm
            checkFunction={
              reactAppComponent.options.checkModelOnEdit
                ? checkTransaction
                : () => {
                    return '';
                  }
            }
            submitFunction={submitTransaction}
            deleteFunction={deleteTransaction}
            submitTriggerFunction={submitTrigger}
            model={this.state.modelData}
            showAlert={parentCallbacks.showAlert}
            doCheckBeforeOverwritingExistingData={doCheckBeforeOverwritingExistingData}
            viewState={reactAppComponent.state.viewState}
            />
        </div>
      </div>
    );
  }
  private rhsTopButtonList(
    estateText: string,
    view: ViewType | undefined,
  ): JSX.Element[] {
    const buttons: JSX.Element[] = [];
    buttons.push(
      makeButton(
        'Log out',
        (event: React.MouseEvent<HTMLButtonElement>) => {
          event.persist();
          this.props.logOutAction();
        },
        'Log out',
        `btn-LogOut`,
        'outline-secondary',
      ),
    );
    if (estateText !== '') {
      buttons.push(
        makeButton(
          estateText,
          () => {
            // do nothing
          },
          'estateText',
          `btn-estateText`,
          'outline-secondary',
        ),
      );
    }
    if (view === homeView) {
      buttons.push(
        makeButton(
          `v. ${getAppVersion()}`,
          () => {
            // do nothing
          },
          'versionButton',
          `btn-version`,
          'outline-secondary',
        ),
      );
    }
    return buttons;
  }

  private rhsBottomButtonList(): JSX.Element[] {
    const buttons: JSX.Element[] = [];
    buttons.push(this.makeRedoButton());
    buttons.push(this.makeUndoButton());
    buttons.push(this.makeSaveButton());
    return buttons;
  }

  private viewButtonList(): JSX.Element[] {
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
      let refreshModel = false;

      const viewValue = views.get(view);
      if (viewValue === undefined) {
        log(`Error : unrecognised view ${view}`);
        viewIterator = it.next();
        continue;
      }
      if (view.lc === transactionsView.lc && !doShowTransactionsButton()) {
        viewIterator = it.next();
        continue;
      }
      if (view.lc === taxView.lc && !doShowTaxButton()) {
        viewIterator = it.next();
        continue;
      }
      if (view.lc === reportView.lc) {
        if (!doShowAssetActionsButton()) {
          viewIterator = it.next();
          continue;
        }
        refreshModel = true;
      }
      if (view.lc === optimizerView.lc && !doShowOptimiserButton()) {
        viewIterator = it.next();
        continue;
      }
      if (view.lc === planningView.lc && !doShowPlanningButton()) {
        viewIterator = it.next();
        continue;
      }
      const display = viewValue.display;

      buttons.push(
        makeButton(
          view.lc,
          (event: React.MouseEvent<HTMLButtonElement>) => {
            event.persist();
            const oldView = getDisplayedView();
            toggle(
              view,
              view.lc === 'Planning' || view.lc === 'Tax' || refreshModel, // refreshModel
              needsChartRefresh(this.state, oldView, view), // refreshChart
              24, //sourceID
            );
          },
          view.lc,
          `btn-${view.lc}`,
          display ? 'secondary' : 'outline-secondary',
        ),
      );
      viewIterator = it.next();
    }

    return buttons;
  }

  private statusButtonList(): JSX.Element[] {
    let buttons: JSX.Element[] = [];
    buttons = buttons.concat(this.makeHelpText(this.state.alertText));
    return buttons;
  }

  private makeUndoButton(): JSX.Element {
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
    let undoTooltip = '';
    if (this.state.modelData.undoModel !== undefined) {
      const diffs = diffModels(
        this.state.modelData,
        this.state.modelData.undoModel,
        true,
        'current model',
        'previous model',
      );
      if (diffs.length > 0) {
        undoTooltip = diffs[0];
      }
    }

    const b = makeButton(
      buttonTitle,
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        if (await revertToUndoModel(this.state.modelData)) {
          await saveModelLSM(getUserID(), modelName, this.state.modelData);
          refreshData(
            true, // refreshModel
            true, // refreshChart
            25, //sourceID
          );
        }
      },
      `btn-undo-model`,
      `btn-undo-model`,
      this.state.modelData.undoModel !== undefined
        ? 'secondary'
        : 'outline-secondary',
    );

    if (undoTooltip === '') {
      return b;
    } else {
      return (
        <OverlayTrigger
          key="undoOverlay"
          overlay={(props) => (
            <Tooltip {...props} id="undoTooltip">
              {undoTooltip}
            </Tooltip>
          )}
          placement="bottom"
        >
          <div>{b}</div>
        </OverlayTrigger>
      );
    }
  }
  private makeRedoButton(): JSX.Element {
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
    let redoTooltip = '';
    if (this.state.modelData.redoModel !== undefined) {
      const diffs = diffModels(
        this.state.modelData.redoModel,
        this.state.modelData,
        true,
        'redo model',
        'current model',
      );
      if (diffs.length > 0) {
        redoTooltip = diffs[0];
      }
    }

    const b = makeButton(
      buttonTitle,
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        if (await applyRedoToModel(this.state.modelData)) {
          await saveModelLSM(getUserID(), modelName, this.state.modelData);
          refreshData(
            true, // refreshModel
            true, // refreshChart
            26, //sourceID
          );
        }
      },
      `btn-redo-model`,
      `btn-redo-model`,
      this.state.modelData.redoModel !== undefined
        ? 'secondary'
        : 'outline-secondary',
    );

    if (redoTooltip === '') {
      return b;
    } else {
      return (
        <OverlayTrigger
          key="redoOverlay"
          overlay={(props) => (
            <Tooltip {...props} id="redoTooltip">
              {redoTooltip}
            </Tooltip>
          )}
          placement="bottom"
        >
          <div>{b}</div>
        </OverlayTrigger>
      );
    }
  }

  private makeSaveButton(): JSX.Element {
    // log(`isDirty = ${isDirty}`);
    return makeButton(
      'Save model',
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        const savedOK = await saveModelToDBLSM(
          getUserID(),
          modelName,
          this.state.modelData,
        );
        if (savedOK) {
          refreshData(
            true, // refreshModel
            true, // refreshChart
            27, //sourceID
          );
        } else {
          alert(`save failed!`);
        }
      },
      `btn-save-model`,
      `btn-save-model`,
      isDirty ? 'secondary' : 'outline-secondary',
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
        <AlertDismissibleExample
          message={alertText}
          dismissAction={() => {
            // log(`setState for clear alert`);
            this.setState({ alertText: '' });
          }}
          key={'alert-button'}
        />,
      );
    }
    return result;
  }
}

function doCheckBeforeOverwritingExistingData(): boolean {
  const result = checkOverwrite();
  // log(`check overwrite = ${result}`);
  return result;
}

export default App;