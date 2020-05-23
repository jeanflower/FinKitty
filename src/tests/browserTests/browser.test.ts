import { log, showObj, printDebug } from '../../utils';
import {
  beforeAllWork,
  cleanUpWork,
  getAssetChartData,
  getDriver,
  getExpenseChartData,
  getIncomeChartData,
  submitSettingChange,
  writeTestCode,
} from './browserBaseTypes';
import { getTestModel01 } from './browserTestData01';
import { getTestModel02 } from './browserTestData02';

import { WebElement, ThenableWebDriver } from 'selenium-webdriver';
import {
  assetChartAdditions,
  assetChartDeltas,
  assetChartReductions,
  assetChartView,
  CASH_ASSET_NAME,
  fine,
  roiEnd,
  roiEndHint,
  assetChartFocus,
  assetChartFocusHint,
  viewDetail,
  viewDetailHint,
  constType,
  viewType,
} from '../../localization/stringConstants';
import {
  getModelCoarseAndFine,
  getModelFutureExpense,
} from '../algoTests/evaluationsAndChart.test';

import webdriver from 'selenium-webdriver';
import { DbSetting } from '../../types/interfaces';

const simpleSetting: DbSetting = {
  NAME: 'NoName',
  VALUE: 'NoValue',
  HINT: 'NoHint',
  TYPE: constType,
};
const viewSetting: DbSetting = {
  ...simpleSetting,
  TYPE: viewType,
};

// Use sleeps to hack page-not-yet-ready issues. TODO : do better - check awaits.
function sleep(ms: number, message: string) {
  if (printDebug()) {
    log(`sleep for ${ms}ms: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function clickButton(driver: ThenableWebDriver, id: string) {
  const btn = await driver.findElements(webdriver.By.id(id));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 1).toBe(true);
  return await btn[0].click();
}

// to easily switch these tests on and off...
const doActions = true;

// switch these values if you want to debug
// one of these tests and see the Chrome window
// alive
// const headless = true;
const quitAfterAll = true;
const headless = false;
// const quitAfterAll = false;

const debug = false;
const testDataModelName = 'SeleniumTestData';

async function fillInputById(
  driver: ThenableWebDriver,
  id: string,
  content: string,
) {
  const input = await driver.findElements(webdriver.By.id(id));
  // log(`found ${input.length} elements with id = ${id}`);
  expect(input.length === 1).toBe(true);
  const result = await input[0].sendKeys(content);
  //log(`got ${result} from content ${content}`);
  return result;
}

async function fillInputByName(
  driver: ThenableWebDriver,
  name: string,
  content: string,
) {
  const input = await driver.findElements(webdriver.By.name(name));
  // log(`found ${input.length} elements with name = ${name}`);
  expect(input.length === 1).toBe(true);
  const result = await input[0].sendKeys(content);
  //log(`got ${result} from content ${content}`);
  return result;
}
/*
async function clearInputById(id: string) {
  const input = await driver.findElements(webdriver.By.id(id));
  //log(`found ${input.length} elements with id = ${id}`);
  expect(input.length === 1).toBe(true);
  const result = await input[0].clear();
  //log(`got ${result} from clear`);
  return result;
}

async function clearInputByName(name: string) {
  const input = await driver.findElements(webdriver.By.name(name));
  //log(`found ${input.length} elements with name = ${name}`);
  expect(input.length === 1).toBe(true);
  const result = await input[0].clear();
  //log(`got ${result} from clear`);
  return result;
}
*/

async function addAsset(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string; // TODO why no valuation date?
    quantity: string;
    category: string; // TODO why so early?
    startDate: string;
    growth: string;
    growsWithInflation: string;
    liability: string;
    purchasePrice: string;
    message: string;
  },
) {
  Promise.all([
    fillInputById(driver, 'assetname', inputs.name),
    fillInputById(driver, 'assetvalue', inputs.value),
    fillInputById(driver, 'assetquantity', inputs.quantity),
    fillInputByName(driver, 'start date', inputs.startDate),
    fillInputById(driver, 'assetgrowth', inputs.growth),
    fillInputById(driver, 'assetcpi-grows', inputs.growsWithInflation),
    fillInputById(driver, 'liabilityCGT', inputs.liability),
    fillInputById(driver, 'purchase', inputs.purchasePrice),
    fillInputById(driver, 'assetcategory', inputs.category),
  ]);

  await clickButton(driver, 'addAsset');
  await sleep(500, 'waiting');
  // log(`added date`);

  const alert = driver.switchTo().alert();
  const alertText = await alert.getText();
  expect(alertText).toEqual(inputs.message);
  // log(`alertText = ${alertText}`);
  await alert.accept();
}

const assetInputs = {
  name: 'hifi',
  value: '2500',
  quantity: '2',
  category: 'audio',
  startDate: '2021',
  growth: '2.0',
  growsWithInflation: 'N',
  liability: 'Joe',
  purchasePrice: '10',
};

async function addIncome(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    valuationDate: string;
    startDate: string;
    endDate: string;
    growth: string;
    growsWithInflation: string;
    liability: string;
    category: string;
    message: string;
  },
) {
  Promise.all([
    fillInputById(driver, 'incomename', inputs.name),
    fillInputByName(driver, 'income valuation date', inputs.valuationDate),
    fillInputById(driver, 'incomevalue', inputs.value),
    fillInputByName(driver, 'income start date', inputs.startDate),
    fillInputByName(driver, 'income end date', inputs.endDate),
    fillInputById(driver, 'incomegrowth', inputs.growth),
    fillInputById(driver, 'incomecpi-grows', inputs.growsWithInflation),
    fillInputById(driver, 'taxable', inputs.liability),
    fillInputById(driver, 'incomecategory', inputs.category),
  ]);

  await clickButton(driver, 'addIncome');
  await sleep(500, 'waiting');
  // log(`added date`);

  const alert = driver.switchTo().alert();
  const alertText = await alert.getText();
  expect(alertText).toEqual(inputs.message);
  // log(`alertText = ${alertText}`);
  await alert.accept();
}

const incomeInputs = {
  name: 'javaJob1',
  value: '2500',
  valuationDate: '2020',
  startDate: '2021',
  endDate: '2022',
  growth: '2.0',
  growsWithInflation: 'N',
  liability: 'Joe',
  category: 'programming',
};

let alreadyRunning = false;

describe('Chrome Interaction simple', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }

  const driver = driverSimple;
  it('Should load the home page and get title', () =>
    new Promise(async resolve => {
      const modelAndRoi = getTestModel01();
      await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

      if (!doActions) {
        resolve();
        return;
      }

      const title = await driver.getTitle();
      expect(title).toEqual(`FinKitty`);
      await cleanUpWork(driver, testDataModelName);

      resolve();
    }));

  // the page should include a chart
  // (maybe not visible, but loaded in the document)
  it('CISimple Should show a chart', () =>
    new Promise(async resolve => {
      if (!doActions) {
        resolve();
        return;
      }
      const modelAndRoi = getTestModel01();
      await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

      await clickButton(driver, 'btn-Incomes');

      const chartID = 'canvasjs-react-chart-container-9'; // why 9? 9th chart drawn?
      // log(`check for chart ${idToSeek}`);
      const elts: WebElement[] = await driver.findElements({ id: chartID });
      expect(elts.length === 1).toBe(true);
      expect(elts[0] !== undefined).toBe(true);

      await cleanUpWork(driver, testDataModelName);

      resolve();
    }));

  it('CISimple Check asset chart data extends with bigger roi', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getModelFutureExpense();

    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    let ary = await getAssetChartData(driver);
    //log(`ary = ${showObj(ary)}`);

    // writeTestCode(ary);

    expect(ary.length).toEqual(0);

    const forSubmission = {
      ...viewSetting,
      NAME: roiEnd,
      VALUE: '1 March 2018',
      HINT: roiEndHint,
    };

    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );

    // log('submitted new roi setting');

    ary = await getAssetChartData(driver);
    if (debug) {
      writeTestCode(ary);
    }

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('Cash');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Thu Dec 01 2016');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Thu Dec 01 2016');
    expect(ary[0].dataPoints[1].label).toEqual('Sun Jan 01 2017');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[0].dataPoints[2].label).toEqual('Wed Feb 01 2017');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Wed Feb 01 2017');
    expect(ary[0].dataPoints[3].label).toEqual('Wed Mar 01 2017');
    expect(ary[0].dataPoints[3].y).toEqual(0);
    expect(ary[0].dataPoints[3].ttip).toEqual('0.00 at Wed Mar 01 2017');
    expect(ary[0].dataPoints[4].label).toEqual('Sat Apr 01 2017');
    expect(ary[0].dataPoints[4].y).toEqual(0);
    expect(ary[0].dataPoints[4].ttip).toEqual('0.00 at Sat Apr 01 2017');
    expect(ary[0].dataPoints[5].label).toEqual('Mon May 01 2017');
    expect(ary[0].dataPoints[5].y).toEqual(0);
    expect(ary[0].dataPoints[5].ttip).toEqual('0.00 at Mon May 01 2017');
    expect(ary[0].dataPoints[6].label).toEqual('Thu Jun 01 2017');
    expect(ary[0].dataPoints[6].y).toEqual(0);
    expect(ary[0].dataPoints[6].ttip).toEqual('0.00 at Thu Jun 01 2017');
    expect(ary[0].dataPoints[7].label).toEqual('Sat Jul 01 2017');
    expect(ary[0].dataPoints[7].y).toEqual(0);
    expect(ary[0].dataPoints[7].ttip).toEqual('0.00 at Sat Jul 01 2017');
    expect(ary[0].dataPoints[8].label).toEqual('Tue Aug 01 2017');
    expect(ary[0].dataPoints[8].y).toEqual(0);
    expect(ary[0].dataPoints[8].ttip).toEqual('0.00 at Tue Aug 01 2017');
    expect(ary[0].dataPoints[9].label).toEqual('Fri Sep 01 2017');
    expect(ary[0].dataPoints[9].y).toEqual(0);
    expect(ary[0].dataPoints[9].ttip).toEqual('0.00 at Fri Sep 01 2017');
    expect(ary[0].dataPoints[10].label).toEqual('Sun Oct 01 2017');
    expect(ary[0].dataPoints[10].y).toEqual(0);
    expect(ary[0].dataPoints[10].ttip).toEqual('0.00 at Sun Oct 01 2017');
    expect(ary[0].dataPoints[11].label).toEqual('Wed Nov 01 2017');
    expect(ary[0].dataPoints[11].y).toEqual(0);
    expect(ary[0].dataPoints[11].ttip).toEqual('0.00 at Wed Nov 01 2017');
    expect(ary[0].dataPoints[12].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[12].y).toEqual(0);
    expect(ary[0].dataPoints[12].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[13].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[13].y).toEqual(-99);
    expect(ary[0].dataPoints[13].ttip).toEqual('-99.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[14].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[14].y).toEqual(-198.93939050052373);
    expect(ary[0].dataPoints[14].ttip).toEqual('-198.94 at Thu Feb 01 2018');
    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CISimple Check coarse, categorised, chart data view', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getModelCoarseAndFine();

    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    let ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('stocks');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(500);
    expect(ary[0].dataPoints[0].ttip).toEqual('500.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(500);
    expect(ary[0].dataPoints[1].ttip).toEqual('500.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(500);
    expect(ary[0].dataPoints[2].ttip).toEqual('500.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(500);
    expect(ary[0].dataPoints[3].ttip).toEqual('500.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('Accessible');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(494);
    expect(ary[1].dataPoints[0].ttip).toEqual('494.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(468);
    expect(ary[1].dataPoints[1].ttip).toEqual('468.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(942);
    expect(ary[1].dataPoints[2].ttip).toEqual('942.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(930);
    expect(ary[1].dataPoints[3].ttip).toEqual('930.00 at Sun Jul 01 2018');

    ary = await getExpenseChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('pet food');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(12);
    expect(ary[0].dataPoints[0].ttip).toEqual('12.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(12);
    expect(ary[0].dataPoints[1].ttip).toEqual('12.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(12);
    expect(ary[0].dataPoints[2].ttip).toEqual('12.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(12);
    expect(ary[0].dataPoints[3].ttip).toEqual('12.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('comms');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(24);
    expect(ary[1].dataPoints[0].ttip).toEqual('24.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(24);
    expect(ary[1].dataPoints[1].ttip).toEqual('24.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(24);
    expect(ary[1].dataPoints[2].ttip).toEqual('24.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    ary = await getIncomeChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('PaperRound');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(20);
    expect(ary[0].dataPoints[0].ttip).toEqual('20.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(10);
    expect(ary[0].dataPoints[1].ttip).toEqual('10.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(10);
    expect(ary[0].dataPoints[2].ttip).toEqual('10.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(0);
    expect(ary[0].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('PRn3');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(10);
    expect(ary[1].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(0);
    expect(ary[1].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CISimple Check fine, uncategorised, chart data view', async done => {
    if (!doActions) {
      done();
      return;
    }

    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    const forSubmission = {
      ...viewSetting,
      NAME: viewDetail,
      VALUE: fine,
      HINT: viewDetailHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );

    let ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('stocks');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(500);
    expect(ary[0].dataPoints[0].ttip).toEqual('500.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(500);
    expect(ary[0].dataPoints[1].ttip).toEqual('500.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(500);
    expect(ary[0].dataPoints[2].ttip).toEqual('500.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(500);
    expect(ary[0].dataPoints[3].ttip).toEqual('500.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('savings');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(500);
    expect(ary[1].dataPoints[2].ttip).toEqual('500.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(500);
    expect(ary[1].dataPoints[3].ttip).toEqual('500.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('Cash');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(494);
    expect(ary[2].dataPoints[0].ttip).toEqual('494.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(468);
    expect(ary[2].dataPoints[1].ttip).toEqual('468.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(442);
    expect(ary[2].dataPoints[2].ttip).toEqual('442.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(430);
    expect(ary[2].dataPoints[3].ttip).toEqual('430.00 at Sun Jul 01 2018');

    ary = await getExpenseChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('pet food');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(12);
    expect(ary[0].dataPoints[0].ttip).toEqual('12.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(12);
    expect(ary[0].dataPoints[1].ttip).toEqual('12.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(12);
    expect(ary[0].dataPoints[2].ttip).toEqual('12.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(12);
    expect(ary[0].dataPoints[3].ttip).toEqual('12.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('broadband');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(12);
    expect(ary[1].dataPoints[0].ttip).toEqual('12.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(12);
    expect(ary[1].dataPoints[1].ttip).toEqual('12.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(12);
    expect(ary[1].dataPoints[2].ttip).toEqual('12.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('Phon');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(12);
    expect(ary[2].dataPoints[0].ttip).toEqual('12.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(12);
    expect(ary[2].dataPoints[1].ttip).toEqual('12.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(12);
    expect(ary[2].dataPoints[2].ttip).toEqual('12.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    ary = await getIncomeChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('PRn3');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(10);
    expect(ary[0].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(0);
    expect(ary[0].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('PRn2');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(10);
    expect(ary[1].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(10);
    expect(ary[1].dataPoints[1].ttip).toEqual('10.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(10);
    expect(ary[1].dataPoints[2].ttip).toEqual('10.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('PRn1');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(10);
    expect(ary[2].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(0);
    expect(ary[2].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(0);
    expect(ary[2].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CISimple Coarse asset view for cash asset, vals, +, -, +- view', async done => {
    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    // existing value for singleAssetName was allAssets;
    // now overwrite that for cash
    let forSubmission = {
      ...viewSetting,
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
      HINT: assetChartFocusHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );

    let ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('Accessible');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(494);
    expect(ary[0].dataPoints[0].ttip).toEqual('494.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(468);
    expect(ary[0].dataPoints[1].ttip).toEqual('468.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(442);
    expect(ary[0].dataPoints[2].ttip).toEqual('442.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(430);
    expect(ary[0].dataPoints[3].ttip).toEqual('430.00 at Sun Jul 01 2018');

    forSubmission = {
      ...viewSetting,
      NAME: assetChartView,
      VALUE: assetChartAdditions,
      HINT: assetChartFocusHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );

    ary = await getAssetChartData(driver);

    // writeTestCode(ary);

    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('PaperRound/Accessible');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(20);
    expect(ary[0].dataPoints[0].ttip).toEqual('20.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(10);
    expect(ary[0].dataPoints[1].ttip).toEqual('10.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(10);
    expect(ary[0].dataPoints[2].ttip).toEqual('10.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(0);
    expect(ary[0].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('PRn3/Accessible');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(10);
    expect(ary[1].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(0);
    expect(ary[1].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('Accessible/Accessible');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(500);
    expect(ary[2].dataPoints[0].ttip).toEqual('500.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(0);
    expect(ary[2].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(0);
    expect(ary[2].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    forSubmission = {
      ...viewSetting,
      NAME: assetChartView,
      VALUE: assetChartReductions,
      HINT: assetChartFocusHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('pet food/Accessible');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(-12);
    expect(ary[0].dataPoints[0].ttip).toEqual('-12.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(-12);
    expect(ary[0].dataPoints[1].ttip).toEqual('-12.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(-12);
    expect(ary[0].dataPoints[2].ttip).toEqual('-12.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(-12);
    expect(ary[0].dataPoints[3].ttip).toEqual('-12.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('comms/Accessible');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(-24);
    expect(ary[1].dataPoints[0].ttip).toEqual('-24.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(-24);
    expect(ary[1].dataPoints[1].ttip).toEqual('-24.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(-24);
    expect(ary[1].dataPoints[2].ttip).toEqual('-24.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    forSubmission = {
      ...viewSetting,
      NAME: assetChartView,
      VALUE: assetChartDeltas,
      HINT: assetChartFocusHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(5);
    expect(ary[0].name).toEqual('pet food/Accessible');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(-12);
    expect(ary[0].dataPoints[0].ttip).toEqual('-12.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(-12);
    expect(ary[0].dataPoints[1].ttip).toEqual('-12.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(-12);
    expect(ary[0].dataPoints[2].ttip).toEqual('-12.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(-12);
    expect(ary[0].dataPoints[3].ttip).toEqual('-12.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('comms/Accessible');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(-24);
    expect(ary[1].dataPoints[0].ttip).toEqual('-24.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(-24);
    expect(ary[1].dataPoints[1].ttip).toEqual('-24.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(-24);
    expect(ary[1].dataPoints[2].ttip).toEqual('-24.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('PaperRound/Accessible');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(20);
    expect(ary[2].dataPoints[0].ttip).toEqual('20.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(10);
    expect(ary[2].dataPoints[1].ttip).toEqual('10.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(10);
    expect(ary[2].dataPoints[2].ttip).toEqual('10.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[3].name).toEqual('PRn3/Accessible');
    expect(ary[3].type).toEqual('stackedColumn');
    expect(ary[3].showInLegend).toEqual(true);
    expect(ary[3].dataPoints.length).toEqual(4);
    expect(ary[3].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[3].dataPoints[0].y).toEqual(10);
    expect(ary[3].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[3].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[3].dataPoints[1].y).toEqual(0);
    expect(ary[3].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[3].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[3].dataPoints[2].y).toEqual(0);
    expect(ary[3].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[3].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[3].dataPoints[3].y).toEqual(0);
    expect(ary[3].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[4].name).toEqual('Accessible/Accessible');
    expect(ary[4].type).toEqual('stackedColumn');
    expect(ary[4].showInLegend).toEqual(true);
    expect(ary[4].dataPoints.length).toEqual(4);
    expect(ary[4].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[4].dataPoints[0].y).toEqual(500);
    expect(ary[4].dataPoints[0].ttip).toEqual('500.00 at Sun Apr 01 2018');
    expect(ary[4].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[4].dataPoints[1].y).toEqual(0);
    expect(ary[4].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[4].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[4].dataPoints[2].y).toEqual(0);
    expect(ary[4].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[4].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[4].dataPoints[3].y).toEqual(0);
    expect(ary[4].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CISimple Fine asset view for selected category, vals', async done => {
    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    let forSubmission = {
      ...viewSetting,
      NAME: viewDetail,
      VALUE: fine,
      HINT: viewDetailHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );
    if (printDebug()) {
      log(`submitted model settings`);
      log(`model settings = ${showObj(modelAndRoi.model.settings)}`);
    }
    forSubmission = {
      ...viewSetting,
      NAME: assetChartFocus,
      VALUE: 'Accessible',
      HINT: assetChartFocusHint,
    };
    modelAndRoi.model = await submitSettingChange(
      driver,
      testDataModelName,
      modelAndRoi.model,
      forSubmission,
    );
    // log(`submitted model settings`);
    // log(`model settings = ${showObj(modelAndRoi.model.settings)}`)

    const ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('savings');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(4);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(500);
    expect(ary[0].dataPoints[2].ttip).toEqual('500.00 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(500);
    expect(ary[0].dataPoints[3].ttip).toEqual('500.00 at Sun Jul 01 2018');
    expect(ary[1].name).toEqual('Cash');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(494);
    expect(ary[1].dataPoints[0].ttip).toEqual('494.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(468);
    expect(ary[1].dataPoints[1].ttip).toEqual('468.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(442);
    expect(ary[1].dataPoints[2].ttip).toEqual('442.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(430);
    expect(ary[1].dataPoints[3].ttip).toEqual('430.00 at Sun Jul 01 2018');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CISimple Navigate headers', async done => {
    //log(`navigate headers test`);
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();

    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Dates');
    await clickButton(driver, 'btn-Incomes');
    await clickButton(driver, 'btn-Assets');
    await clickButton(driver, 'btn-Transactions');
    await clickButton(driver, 'btn-Expenses');
    await clickButton(driver, 'btn-Tax');
    await clickButton(driver, 'btn-Settings');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  async function addDate(
    driver: ThenableWebDriver,
    name: string,
    date: string,
    message: string,
  ) {
    await clickButton(driver, 'btn-Dates');

    let input = await driver.findElements(webdriver.By.id('triggername'));
    expect(input.length === 1).toBe(true);
    input[0].sendKeys(name);
    input = await driver.findElements(webdriver.By.id('date'));
    expect(input.length === 1).toBe(true);
    input[0].sendKeys(date);

    await clickButton(driver, 'addTrigger');
    await sleep(500, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
  }

  it('CISimple add dates', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Overview');

    const label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();

    expect(labelText).toBe(`${testDataModelName}: Overview`);

    await clickButton(driver, 'btn-Dates');

    await addDate(driver, 'testDate', '2020', 'added important date OK');
    await addDate(
      driver,
      'testDate2',
      'junk',
      'Your important date is not valid : Invalid Date',
    );
    await addDate(
      driver,
      // overwrites without qualms
      'testDate',
      '2021',
      'added important date OK',
    );
    await addDate(
      driver,
      '', // no name
      '2021',
      'Date name needs some characters',
    );

    await cleanUpWork(driver, testDataModelName);
    done();
  });
  /*
  afterAll(async () => {
    if (quitAfterAll) {
      await driverSimple.quit();
    }
  });
});

describe('Chrome Interaction incomes', () => {
  const driverIncomes = getDriver(headless);
  const driver = driverIncomes;
*/
  async function clearIncomeFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('incomename');
    await clearInputByName('income valuation date');
    await clearInputById('incomevalue');
    await clearInputByName('income start date');
    await clearInputByName('income end date');
    await clearInputById('incomegrowth');
    await clearInputById('incomecpi-grows');
    await clearInputById('taxable');
    await clearInputById('incomecategory');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Incomes');
    return;
  }

  async function addDBPension(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      value: string;
      valuationDate: string;
      contributionsEndDate: string;
      startDate: string;
      pensionEndOrTransferDate: string;
      transferredStopDate: string;
      incomeSource: string;
      contributionSSIncome: string;
      contributionAmountPensionIncome: string;
      incomeaccrual: string;
      transferName: string;
      transferProportion: string;
      incomeGrowth: string;
      incomecpiGrows: string;
      liability: string;
      category: string;
      message: string;
    },
  ): Promise<boolean> {
    Promise.all([
      fillInputById(driver, 'incomename', inputs.name),
      fillInputByName(driver, 'income valuation date', inputs.valuationDate),
      fillInputById(driver, 'incomevalue', inputs.value),
      fillInputByName(driver, 'end date', inputs.contributionsEndDate),
      fillInputByName(driver, 'pension start date', inputs.startDate),
      fillInputByName(
        driver,
        'pension end/transfer date',
        inputs.pensionEndOrTransferDate,
      ),
      fillInputByName(
        driver,
        'transferred stop date',
        inputs.transferredStopDate,
      ),
      fillInputByName(
        driver,
        'contributionSSIncome',
        inputs.contributionSSIncome,
      ),
      fillInputById(
        driver,
        'contributionAmountPensionIncome',
        inputs.contributionAmountPensionIncome,
      ),
      fillInputById(driver, 'incomeaccrual', inputs.incomeaccrual),
      fillInputById(driver, 'transferName', inputs.transferName),
      fillInputById(driver, 'transferProportion', inputs.transferProportion),
      fillInputById(driver, 'incomegrowth', inputs.incomeGrowth),
      fillInputById(driver, 'incomecpi-grows', inputs.incomecpiGrows),
      fillInputById(driver, 'taxable', inputs.liability),
      fillInputById(driver, 'incomecategory', inputs.category),
    ]);

    if (inputs.incomeSource !== '') {
      await fillInputById(
        driver,
        'fromIncomeSelectIncomeForm',
        inputs.incomeSource,
      );
    }

    await clickButton(driver, 'addIncome');
    await sleep(1000, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
    return true;
  }

  async function clearPensionFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('incomename');
    await clearInputByName('income valuation date');
    await clearInputById('incomevalue');
    await clearInputByName('end date');
    await clearInputByName('pension start date');
    await clearInputByName('pension end/transfer date');
    await clearInputByName('transferred stop date');
    await clearInputById('fromIncomeSelectIncomeForm');
    await clearInputByName('contributionSSIncome');
    await clearInputById('contributionAmountPensionIncome');
    await clearInputById('incomeaccrual');
    await clearInputById('transferName');
    await clearInputById('transferProportion');
    await clearInputById('incomegrowth');
    await clearInputById('incomecpi-grows');
    await clearInputById('taxable');
    */
    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Incomes');

    // a bit of scrolling to ensure the useDBPInputs button
    // can be interacted with
    const toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-incomesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );

    await clickButton(driver, 'useDBPInputs');

    // log(`cleared ready for next pension inputs`);
    return;
  }

  async function revalueIncome(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      revalue: string;
      revaluationDate: string;
      message: string;
    },
  ): Promise<boolean> {
    Promise.all([
      fillInputById(driver, 'incomename', inputs.name),
      fillInputByName(driver, 'income valuation date', inputs.revaluationDate),
      fillInputById(driver, 'incomevalue', inputs.revalue),
    ]);

    await clickButton(driver, 'revalueIncome');
    await sleep(500, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
    return true;
  }

  async function clearRevalueIncomeFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('incomename');
    await clearInputByName('income valuation date');
    await clearInputById('incomevalue');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Incomes');
    await clickButton(driver, 'useRevalueInputs');

    return;
  }

  it('CIIncomes add incomes', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: '',
      message: `Income name should be non-empty`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      value: '',
      message: `Income value  should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      valuationDate: '',
      message: `Value set date should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growth: '',
      message: `Growth value '' should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growsWithInflation: '',
      message: `Grows with inflation '' should be a Y/N value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      endDate: '',
      message: `End date '' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      name: 'javaJob2',
      liability: '',
      category: '',
      message: `added new income`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: 'javaJob3',
      liability: 'Joe',
      category: 'programming',
      message: `added new income`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      value: 'junkforvalue',
      message: `Income value junkforvalue should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      valuationDate: 'junkjunk',
      message: `Value set date should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      startDate: 'junkjunk',
      message: `Start date 'junkjunk' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      endDate: 'junkjunk',
      message: `End date 'junkjunk' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growth: 'junkjunk',
      message: `Growth value 'junkjunk' should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growsWithInflation: 'junkjunk',
      message: `Grows with inflation 'junkjunk' should be a Y/N value`,
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CIIncomes DB pension inputs', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income`,
    });

    await clickButton(driver, 'useDBPInputs');

    const inputs = {
      name: 'pensionName',
      value: '2500',
      valuationDate: '2022',
      contributionsEndDate: '2025',
      startDate: '2030',
      pensionEndOrTransferDate: '2035',
      transferredStopDate: '2040',
      incomeSource: 'javaJob1',
      contributionSSIncome: 'N',
      contributionAmountPensionIncome: '0.05',
      incomeaccrual: '0.02',
      transferName: 'Jack',
      transferProportion: '0.5',
      incomeGrowth: '2.0',
      incomecpiGrows: 'N',
      liability: 'Joe',
      category: 'pension',
    };

    await addDBPension(driver, {
      ...inputs,
      name: 'penName',
      message: 'added new data', // TODO "added pension information",
    });

    await clickButton(driver, 'useDBPInputs');

    await addDBPension(driver, {
      ...inputs,
      name: '',
      message: 'Income name should be non-empty', // TODO "Pension..." not "Income..."
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      value: 'junkjunk',
      message: 'Income value junkjunk should be a numerical value',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      valuationDate: 'junkjunk',
      message: 'Value set date should be a date',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      name: 'xyzJunk',
      contributionsEndDate: 'junkjunk',
      message: 'added new data', // BUGS!!  this junkjunk entry should be blocked at UI
      // should trigger model check failure
      // and, internally, the date here should be used
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      startDate: 'junkjunk',
      message: 'Income start date doesn\'t make sense : "junkjunk"', // TODO 'Pension' not 'Income'
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      pensionEndOrTransferDate: 'junkjunk',
      message: 'Income end date doesn\'t make sense : "junkjunk"', // TODO 'Pension' not 'Income'
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      transferredStopDate: 'junkjunk',
      message: 'Income end date doesn\'t make sense : "junkjunk"', // TODO needs a better message
      // it is the end date of the transferred pension
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      valuationDate: '2020', // date is before javaJob1 begins
      message:
        'Transaction from unrecognised asset (could be typo or before asset start date?) : "javaJob1"',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      name: 'badEndDate',
      valuationDate: '2023',
      contributionsEndDate: '2022', // stop before start,
      message: 'added new data', // BUG the end date for contributions is being ignored
      // we should enforce it's after the start date
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      startDate: '2033',
      pensionEndOrTransferDate: '2032', // transfer pension before pension begins paying out?
      message:
        'Transaction from unrecognised asset ' +
        '(could be typo or before asset start date?) : "PensionDBpensionName"',
      // TODO this message is mysterious
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      name: 'pension',
      pensionEndOrTransferDate: '2037',
      transferredStopDate: '2035', // transferred pension stops before transfer occurred?
      message: 'added new data', // BUG :this probably shouldn't be allowed?
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      contributionSSIncome: 'junk',
      message: "Salary sacrifice 'junk' should be a Y/N value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      contributionAmountPensionIncome: 'junk',
      message: "Contribution amount 'junk' should be a numerical value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      incomeaccrual: 'junk',
      message: "Accrual value 'junk' should be a numerical value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      transferProportion: 'junk',
      message: 'Transfer proportion junk should be a numerical value',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      incomeGrowth: 'junk',
      message: "Growth value 'junk' should be a numerical value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      liability: '',
      message: "Source income 'javaJob1' should have income tax liability ",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      liability: 'Susan',
      message:
        "Source income 'javaJob1' should have income tax liability Susan(incomeTax)",
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CIIncomes revalue incomes', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income`,
    });

    await clickButton(driver, 'useRevalueInputs');

    const revalueInputs = {
      name: 'javaJob1',
      revalue: '12500',
      revaluationDate: '2022',
    };
    await revalueIncome(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of income",
    });

    await clickButton(driver, 'useRevalueInputs');

    await revalueIncome(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Income name junk should be an existing income',
    });

    await clearRevalueIncomeFields(driver);
    await revalueIncome(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Income value junk should be a numerical or % value',
    });

    await clearRevalueIncomeFields(driver);
    await revalueIncome(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction  javaJob1 2 dated before start of affected income : javaJob1',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });
  /*
  afterAll(async () => {
    if (quitAfterAll) {
      await driverIncomes.quit();
    }
  });
});

describe('Chrome Interaction expenses', () => {

  const driverExpenses = getDriver(headless);
  const driver = driverExpenses;
*/
  async function addExpense(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      value: string;
      valuationDate: string;
      startDate: string;
      endDate: string;
      growth: string;
      growsWithInflation: string;
      recurrence: string;
      category: string;
      message: string;
    },
  ) {
    Promise.all([
      fillInputById(driver, 'expensename', inputs.name),
      fillInputByName(driver, 'expense valuation date', inputs.valuationDate),
      fillInputById(driver, 'expensevalue', inputs.value),
      fillInputByName(driver, 'start date', inputs.startDate),
      fillInputByName(driver, 'end date', inputs.endDate),
      fillInputById(driver, 'expensegrowth', inputs.growth),
      fillInputById(driver, 'expensecpi-grows', inputs.growsWithInflation),
      fillInputById(driver, 'expenserecurrence', inputs.recurrence),
      fillInputById(driver, 'expensecategory', inputs.category),
    ]);

    await clickButton(driver, 'addExpense');
    await sleep(500, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
  }

  async function clearExpenseFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('expensename');
    await clearInputByName('expense valuation date');
    await clearInputById('expensevalue');
    await clearInputByName('start date');
    await clearInputByName('end date');
    await clearInputById('expensegrowth');
    await clearInputById('expensecpi-grows');
    await clearInputById('expenserecurrence');
    await clearInputById('expensecategory');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Expenses');
    return;
  }

  async function revalueExpense(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      revalue: string;
      revaluationDate: string;
      message: string;
    },
  ): Promise<boolean> {
    Promise.all([
      fillInputById(driver, 'expensename', inputs.name),
      fillInputByName(driver, 'expense valuation date', inputs.revaluationDate),
      fillInputById(driver, 'expensevalue', inputs.revalue),
    ]);

    await clickButton(driver, 'revalueExpense');
    await sleep(500, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
    return true;
  }

  async function clearRevalueExpenseFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('expensename');
    await clearInputByName('expense valuation date');
    await clearInputById('expensevalue');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Expenses');
    await clickButton(driver, 'useRevalueInputs');

    return;
  }

  const expenseInputs = {
    name: 'broadband',
    value: '56.13',
    valuationDate: '2020',
    startDate: '2021',
    endDate: '2022',
    growth: '2.0',
    growsWithInflation: 'N',
    recurrence: '1m',
    category: 'connectivity',
  };

  it('CIExpenses add expenses', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Expenses');

    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      name: '',
      message: `Expense name needs some characters`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      value: '',
      message: `Expense value  should be a numerical value`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      valuationDate: '',
      message: `Value set date should be a date`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      endDate: '',
      message: `End date '' should be a date`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      growth: '',
      message: `Growth value '' should be a numerical value`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      growsWithInflation: '',
      message: `Grows with inflation '' should be a Y/N value`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      recurrence: 'junk',
      message: `transaction recurrence 'junk' must end in m or y`,
      // TODO not a great message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CIExpenses revalue expenses', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Expenses');

    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });

    await clickButton(driver, 'useRevalueInputs');

    const revalueInputs = {
      name: 'broadband',
      revalue: '60.14',
      revaluationDate: '2022',
    };
    await revalueExpense(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of expense",
    });

    await clickButton(driver, 'useRevalueInputs');

    await revalueExpense(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Transaction  junk 1 to unrecognised thing : junk',
      // TODO : not a great message
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Income value junk should be a numerical or % value',
      // TODO : not a great message
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction  broadband 2 dated before start of affected expense : broadband',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });
  /*
  afterAll(async () => {
    if (quitAfterAll) {
      await driverExpenses.quit();
    }
  });
});

describe('Chrome Interaction assets', () => {

  const driverAssets = getDriver(headless);
  const driver = driverAssets;
*/
  async function clearAssetFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('assetname');
    await clearInputById('assetvalue');
    await clearInputById('assetquantity');
    await clearInputByName('start date');
    await clearInputById('assetgrowth');
    await clearInputById('assetcpi-grows');
    await clearInputById('liabilityCGT');
    await clearInputById('assetcategory');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Assets');
    return;
  }

  async function revalueAsset(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      revalue: string;
      revaluationDate: string;
      message: string;
    },
  ): Promise<boolean> {
    Promise.all([
      fillInputById(driver, 'assetname', inputs.name),
      fillInputByName(driver, 'start date', inputs.revaluationDate),
      fillInputById(driver, 'assetvalue', inputs.revalue),
    ]);

    await clickButton(driver, 'revalueAsset');
    await sleep(1000, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
    return true;
  }

  async function clearRevalueAssetFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('assetname');
    await clearInputByName('asset valuation date');
    await clearInputById('assetvalue');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Assets');
    await clickButton(driver, 'revalueAssetInputs');

    return;
  }

  async function addDCPension(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      value: string;
      category: string; // TODO why so early?
      startDate: string;
      growth: string;
      growsWithCPI: string;
      contributionsStopDate: string;
      crystallizesDate: string;
      pensionEndOrTransferDate: string;
      contributionSSIncome: string;
      incomeSource: string;
      contributionAmountPensionIncome: string;
      employerContribution: string;
      liability: string;
      transferName: string;
      message: string;
    },
  ): Promise<boolean> {
    Promise.all([
      fillInputById(driver, 'assetname', inputs.name),
      fillInputByName(driver, 'assetvalue', inputs.value),
      fillInputById(driver, 'assetcategory', inputs.category),
      fillInputByName(driver, 'start date', inputs.startDate),
      fillInputByName(driver, 'assetgrowth', inputs.growth),
      fillInputByName(driver, 'assetcpi-grows', inputs.growsWithCPI),
      fillInputByName(driver, 'stop date', inputs.contributionsStopDate),
      fillInputByName(driver, 'crystallize date', inputs.crystallizesDate),
      fillInputByName(
        driver,
        'transferred stop date',
        inputs.pensionEndOrTransferDate,
      ),
      fillInputById(driver, 'contributionSSAsset', inputs.contributionSSIncome),
      fillInputById(
        driver,
        'contributionAmountPensionAsset',
        inputs.contributionAmountPensionIncome,
      ),
      fillInputById(driver, 'contributionAmount', inputs.employerContribution),
      fillInputById(driver, 'liabilityIC', inputs.liability),
      fillInputById(driver, 'transferName', inputs.transferName),
    ]);

    if (inputs.incomeSource !== '') {
      await fillInputById(
        driver,
        'fromIncomeSelectAssetForm',
        inputs.incomeSource,
      );
    }

    await clickButton(driver, 'addPension');
    await sleep(4000, 'waiting'); // a longer sleep
    // because more to check

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
    return true;
  }

  async function clearDCPension(driver: ThenableWebDriver): Promise<void> {
    /*
    await clearInputById('assetname');
    await clearInputByName('assetvalue');
    await clearInputById('assetcategory');
    await clearInputByName('start date');
    await clearInputByName('assetgrowth');
    await clearInputByName('assetcpi-grows');
    await clearInputByName('stop date');
    await clearInputByName('crystallize date');
    await clearInputByName('transferred stop date');
    await clearInputById('contributionSSAsset');
    if (inputs.incomeSource !== '') {
      await clearInputById('fromIncomeSelectAssetForm');
    }
    await clearInputById('contributionAmountPensionAsset');
    await clearInputById('contributionAmount');
    await clearInputById('liabilityIC');
    await clearInputById('transferName');

    await clickButton(driver, 'addPension');
    await sleep(1000, 'waiting');
    // log(`added date`);
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Assets');
    // a bit of scrolling to ensure the useDBPInputs button
    // can be interacted with
    const toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await clickButton(driver, 'useDCPInputs');

    return;
  }

  it('CIAssets add asset', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });

    await addAsset(driver, {
      ...assetInputs,
      name: '',
      message: `Asset name needs some characters`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      value: '',
      message: `Asset value  should be a numerical value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      quantity: 'junk',
      message: `Quantity 'junk' should empty or a whole number value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      startDate: 'junk',
      message: `Start date 'junk' should be a date`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      growsWithInflation: 'junk',
      message: `Grows with CPI: 'junk' should be a Y/N value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      purchasePrice: 'junk',
      message: `Asset purchase price \'junk\'\n      is not a number`,
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CIAssets revalue assets', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });

    await clickButton(driver, 'revalueAssetInputs');

    const revalueInputs = {
      name: 'hifi',
      revalue: '12500',
      revaluationDate: '2022',
    };
    await revalueAsset(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of asset",
    });

    await clickButton(driver, 'revalueAssetInputs');

    await revalueAsset(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Transaction  junk 1 to unrecognised thing : junk',
      // TODO : unhelpful error message
    });

    await clearRevalueAssetFields(driver);

    await revalueAsset(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Income value junk should be a numerical or % value',
      // TODO Income -> Asset
    });

    await clearRevalueAssetFields(driver);
    await revalueAsset(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction  hifi 2 dated before start of affected asset : hifi',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CIAssets runTest DC Pension inputs', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income`, //name: 'javaJob1'
    });

    await clickButton(driver, 'btn-Assets');
    await clickButton(driver, 'useDCPInputs');

    const pensionInputs = {
      name: 'dcpension',
      value: '0',
      category: 'pension',
      startDate: '2021',
      growth: '2.0',
      growsWithCPI: 'N',
      contributionsStopDate: '2025',
      crystallizesDate: '2030',
      pensionEndOrTransferDate: '2035',
      contributionSSIncome: 'N',
      incomeSource: 'javaJob1',
      contributionAmountPensionIncome: '0.05',
      employerContribution: '0.5',
      liability: 'Joe',
      transferName: 'Jack',
    };

    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp1',
      message: 'added assets and transactions',
    });

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: '',
      message: 'added assets and transactions',
    }); // BUG : don't allow DCP pensions with empty names

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp2',
      value: 'junk',
      message: 'Asset value junk should be a numerical value',
    }); // TODO : confusing error message : it's a pension not an asset?

    await clearDCPension(driver);

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp3',
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp4',
      startDate: '2020',
      message: `edited  model fails checks :'Transaction CrystallizedPension to unrecognised thing : CrystallizedPensionJoe', reverting`,
    }); // TODO : confusing error message : pension can't start before income

    let alert = driver.switchTo().alert();
    await alert.accept();
    alert = driver.switchTo().alert();
    await alert.accept();

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp5',
      startDate: '2026',
      message: `added assets and transactions`,
    }); // BUG : start date after contributions end date?

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp6',
      startDate: '2036',
      message: `edited  model fails checks :'Transaction CrystallizedPension dated before start of affected asset : CrystallizedPensionJoe', reverting`,
    }); // TODO : what does this error mean?  I expected "start date after end date"

    alert = driver.switchTo().alert();
    await alert.accept();
    alert = driver.switchTo().alert();
    await alert.accept();
    alert = driver.switchTo().alert();
    await alert.accept();
    alert = driver.switchTo().alert();
    await alert.accept();

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp7',
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp8',
      growsWithCPI: 'junk',
      message: `added assets and transactions`,
    }); // BUG : junk shouldn't be recognised as an input here

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp9',
      contributionsStopDate: 'junk',
      message: `added assets and transactions`,
    }); // BUG : junk shouldn't be recognised as an input here

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp10',
      contributionsStopDate: '2036',
      message: `added assets and transactions`,
    }); // BUG : contributionsStopDate after pensionEndOrTransferDate?

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp11',
      crystallizesDate: 'junk',
      message: `edited  model fails checks :'Transaction CrystallizedPension to unrecognised thing : CrystallizedPensionJoe', reverting`,
    }); // TODO : confusing error message about transactions?

    alert = driver.switchTo().alert();
    await alert.accept();
    alert = driver.switchTo().alert();
    await alert.accept();

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp12',
      crystallizesDate: '2036',
      message: `added assets and transactions`,
    }); // TODO : crystallizes after transfers??

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp13',
      pensionEndOrTransferDate: 'junk',
      message: `edited  model fails checks :'Transaction CrystallizedPension to unrecognised thing : CrystallizedPensionJoe', reverting`,
    }); // TODO : confusing error message about transactions?

    alert = driver.switchTo().alert();
    await alert.accept();
    alert = driver.switchTo().alert();
    await alert.accept();

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp14',
      contributionSSIncome: 'junk',
      message: `Salary sacrifice 'junk' should be a Y/N value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp15',
      incomeSource: 'junk',
      message: `added assets and transactions`,
    }); // BUG : income source should be an income

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp16',
      contributionAmountPensionIncome: 'junk',
      message: `Contribution amount 'junk' should be a numerical value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp17',
      contributionAmountPensionIncome: '1000',
      message: `added assets and transactions`,
    }); // TODO : shouldn't be allowed to contribut more than 1
    /**/

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp18',
      employerContribution: 'junk',
      message: `Contribution amount 'junk' should be a numerical value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp19',
      employerContribution: '1000',
      message: `added assets and transactions`,
    }); // TODO : shouldn't be allowed to contribut more than 1

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp20',
      liability: 'junk',
      message: `added assets and transactions`,
    }); // TODO : liability should match the income liability

    await cleanUpWork(driver, testDataModelName);
    done();
  });
  /*
  afterAll(async () => {
    if (quitAfterAll) {
      await driverAssets.quit();
    }
  });
});

describe('Chrome Interaction transactions', () => {

  const driverTransactions = getDriver(headless);
  const driver = driverTransactions;
*/

  async function addTransaction(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      startDate: string;
      fromAsset: string;
      toAsset: string;
      reduction: string;
      addition: string;
      recurrence: string;
      liquidateForCash: string;
      endDate: string;
      category: string;
      message: string;
    },
  ) {
    Promise.all([
      fillInputById(driver, 'transactionname', inputs.name),
      fillInputByName(driver, 'date', inputs.startDate),
      fillInputById(driver, 'fromValue', inputs.reduction),
      fillInputById(driver, 'toValue', inputs.addition),
      fillInputById(driver, 'recurrence', inputs.recurrence),
      fillInputById(driver, 'liquidateForCash', inputs.liquidateForCash),
      fillInputByName(driver, 'stopDate', inputs.endDate),
      fillInputById(driver, 'transactioncategory', inputs.category),
    ]);

    if (inputs.fromAsset !== '') {
      await fillInputById(driver, 'fromAssetSelect', inputs.fromAsset);
    }
    if (inputs.toAsset !== '') {
      await fillInputById(driver, 'toAssetSelect', inputs.toAsset);
    }

    await clickButton(driver, 'addTransaction');
    await sleep(500, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
  }

  async function clearTransactionFields(driver: ThenableWebDriver) {
    /*
    await fillInputById('transactionname', inputs.name);
    await fillInputByName('date', inputs.startDate);

    if (inputs.fromAsset !== '') {
      await fillInputById('fromAssetSelect', inputs.fromAsset);
    }
    if (inputs.toAsset !== '') {
      await fillInputById('toAssetSelect', inputs.toAsset);
    }
    await fillInputById('fromValue', inputs.reduction);
    await fillInputById('toValue', inputs.addition);
    await fillInputById('recurrence', inputs.recurrence);
    await fillInputById('liquidateForCash', inputs.liquidateForCash);
    await fillInputByName('stopDate', inputs.endDate);
    await fillInputById('transactioncategory', inputs.category);

    await clickButton(driver, 'addTransaction');
    await sleep(500, 'waiting');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Transactions');

    return;
  }

  it('CITransactions add transactions', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });

    await clickButton(driver, 'btn-Transactions');

    const transactionInputs = {
      name: 'trans1',
      startDate: '2023',
      fromAsset: CASH_ASSET_NAME,
      toAsset: 'hifi',
      reduction: '100',
      addition: '90%',
      recurrence: '1y',
      liquidateForCash: 'N',
      endDate: '2027',
      category: 'upgradeHifi',
    };

    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });

    await addTransaction(driver, {
      ...transactionInputs,
      name: '',
      message: `Transaction name needs some characters`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      startDate: 'junk',
      message: `Transaction has bad date : "junk"`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'fromJunk',
      fromAsset: 'junk',
      message: `added new transaction`,
    }); // BUG! ignores 'from'

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'toJunk',
      toAsset: 'junk',
      message: `added new transaction`,
    }); // BUG! ignores 'to'

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      reduction: 'junk',
      message: `Transaction from value junk isn't a number`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'fromAsPercentage',
      reduction: '90%',
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      addition: 'junk',
      message: `Transaction to value junk isn't a number`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'toAsAbsolute',
      reduction: '90',
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'no recurrence',
      recurrence: '',
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      recurrence: 'junk',
      message: `transaction recurrence 'junk' must end in m or y`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      recurrence: 'mmm',
      message: `transaction recurrence 'mmm' must be a number ending in m or y`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'partMonths',
      recurrence: '5.5m',
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      liquidateForCash: 'junk',
      message: `Whether we're keeping cash afloat should be 'y' or 'n'`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      liquidateForCash: 'Y',
      message: `If we're liquidating assets to keep cash afloat, the TO asset should be CASH`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'junkEndDate',
      endDate: 'junk',
      message: `added new transaction`,
    }); // BUG! accepted junk

    await cleanUpWork(driver, testDataModelName);
    done();
  });
  /*
  afterAll(async () => {
    if (quitAfterAll) {
      await driverTransactions.quit();
    }
  });
});

describe('Chrome Interaction debts', () => {

  const driverDebts = getDriver(headless);
  const driver = driverDebts;
*/

  async function addDebt(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      value: string;
      category: string;
      startDate: string;
      growth: string;
      monthlyRepayment: string;
      message: string;
    },
  ) {
    Promise.all([
      fillInputById(driver, 'debtname', inputs.name),
      fillInputById(driver, 'debtvalue', inputs.value),
      fillInputById(driver, 'debtcategory', inputs.category),
      fillInputByName(driver, 'start date', inputs.startDate),
      fillInputById(driver, 'debtgrowth', inputs.growth),
      fillInputById(driver, 'debtpayoff', inputs.monthlyRepayment),
    ]);

    await clickButton(driver, 'addDebt');
    await sleep(500, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
  }

  async function clearDebtFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('debtname');
    await clearInputById('debtvalue');
    await clearInputById('debtcategory');
    await clearInputByName('start date');
    await clearInputById('debtgrowth');
    await clearInputById('debtpayoff');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Debts');
    return;
  }

  async function revalueDebt(
    driver: ThenableWebDriver,
    inputs: {
      name: string;
      revalue: string;
      revaluationDate: string;
      message: string;
    },
  ): Promise<boolean> {
    await fillInputById(driver, 'debtname', inputs.name);
    await fillInputByName(driver, 'start date', inputs.revaluationDate);
    await fillInputById(driver, 'debtvalue', inputs.revalue);

    await clickButton(driver, 'revalueDebt');
    await sleep(1000, 'waiting');
    // log(`added date`);

    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(inputs.message);
    // log(`alertText = ${alertText}`);
    await alert.accept();
    return true;
  }

  async function clearRevalueDebtFields(driver: ThenableWebDriver) {
    /*
    await clearInputById('debtname');
    await clearInputByName('start date');
    await clearInputById('debtvalue');
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Debts');
    await clickButton(driver, 'revalueDebtInputs');

    return;
  }

  const debtInputs = {
    name: 'creditCard',
    value: '2500',
    category: 'highInterest',
    startDate: '2021',
    growth: '20.0',
    monthlyRepayment: '10',
  };

  it('CIDebts add debts', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();

    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Debts');

    await addDebt(driver, {
      ...debtInputs,
      name: `debt1`,
      message: `added new debt and payment`,
    });

    await addDebt(driver, {
      ...debtInputs,
      name: '',
      message: `Asset name needs some characters`, // TODO Asset name?
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      value: '',
      message: `Debt value  should be a numerical value`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical value`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      monthlyRepayment: 'junk',
      message: `Payment value 'junk' should be a numerical value`,
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('CIDebts revalue debts', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel02();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Debts');

    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });

    await clickButton(driver, 'revalueDebtInputs');

    const revalueInputs = {
      name: 'creditCard',
      revalue: '1700',
      revaluationDate: '2022',
    };
    await revalueDebt(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of asset",
    });
    await clickButton(driver, 'revalueDebtInputs');

    await revalueDebt(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Transaction  junk 1 to unrecognised thing : junk',
      // TODO : unhelpful error message
    });

    await clearRevalueDebtFields(driver);

    await revalueDebt(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Income value junk should be a numerical or % value',
      // TODO Income -> Asset
    });

    await clearRevalueDebtFields(driver);
    await revalueDebt(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction  creditCard 2 dated before start of affected asset : creditCard',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

// todo next
// add +, -, +-
