import { log, showObj, printDebug, getMinimalModelCopy } from '../../utils';
import {
  beforeAllWork,
  cleanUpWork,
  getAssetChartData,
  getDriver,
  getExpenseChartData,
  getIncomeChartData,
  writeTestCode,
  selectModel,
  calcSleep,
  allowExtraSleeps,
  clickButton,
  fillInputById,
  fillInputByName,
  serverUri,
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
  assetChartFocus,
  viewDetail,
  allItems,
  roiStart,
} from '../../localization/stringConstants';
import {
  getModelCoarseAndFine,
  getModelFutureExpense,
} from '../algoTests/evaluationsAndChart.test';

import webdriver from 'selenium-webdriver';
import { getThreeChryslerModel } from './threeChrysler';

// Use sleeps to hack page-not-yet-ready issues. TODO : do better - check awaits.
async function sleep(ms: number, message: string) {
  if (printDebug()) {
    log(`sleep for ${ms}ms: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}

// to easily switch these tests on and off...
const doActions = true;

// switch these values if you want to debug
// one of these tests and see the Chrome window
// alive
// const headless = true;
// const quitAfterAll = true;
const headless = false;
const quitAfterAll = false;

const debug = false;
const testDataModelName = 'SeleniumTestData';

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

async function checkMessage(driver: ThenableWebDriver, message: string) {
  const label = await driver.findElements(webdriver.By.id('pageTitle'));
  expect(label.length === 1).toBe(true);
  const labelText = await label[0].getText();
  expect(labelText).toBe(message);

  const btn = await driver.findElements(webdriver.By.id('btn-clear-alert'));
  if (btn.length !== 0) {
    await btn[0].click();
  }
}

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
  await Promise.all([
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
  // log(`added date`);

  await checkMessage(driver, inputs.message);
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
  await Promise.all([
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
  // log(`added date`);

  await checkMessage(driver, inputs.message);
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

async function addSetting(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, 'settingname', inputs.name),
    fillInputById(driver, 'settingvalue', inputs.value),
  ]);

  await clickButton(driver, 'addSetting');

  await checkMessage(driver, inputs.message);
}

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

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: roiEnd,
      value: '1 March 2018',
      message: 'added new setting End of view range',
    });
    await clickButton(driver, 'btn-Assets');

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

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: viewDetail,
      value: fine,
      message: `added new setting ${viewDetail}`,
    });
    await clickButton(driver, 'btn-Assets');

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
    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: assetChartFocus,
      value: CASH_ASSET_NAME,
      message: `added new setting ${assetChartFocus}`,
    });
    await clickButton(driver, 'btn-Assets');

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

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: assetChartView,
      value: assetChartAdditions,
      message: `added new setting ${assetChartView}`,
    });
    await clickButton(driver, 'btn-Assets');

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

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: assetChartView,
      value: assetChartReductions,
      message: `added new setting ${assetChartView}`,
    });
    await clickButton(driver, 'btn-Assets');

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

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: assetChartView,
      value: assetChartDeltas,
      message: `added new setting ${assetChartView}`,
    });
    await clickButton(driver, 'btn-Assets');

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

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: viewDetail,
      value: fine,
      message: `added new setting ${viewDetail}`,
    });

    if (printDebug()) {
      log(`submitted model settings`);
      log(`model settings = ${showObj(modelAndRoi.model.settings)}`);
    }
    // log(`submitted model settings`);
    // log(`model settings = ${showObj(modelAndRoi.model.settings)}`)

    await addSetting(driver, {
      name: assetChartFocus,
      value: 'Accessible',
      message: `added new setting ${assetChartFocus}`,
    });
    await clickButton(driver, 'btn-Assets');

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
    let input = await driver.findElements(webdriver.By.id('triggername'));
    expect(input.length === 1).toBe(true);
    input[0].sendKeys(name);
    input = await driver.findElements(webdriver.By.id('date'));
    expect(input.length === 1).toBe(true);
    input[0].sendKeys(date);

    await clickButton(driver, 'addTrigger');
    // log(`added date`);

    await checkMessage(driver, message);
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
    await Promise.all([
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
    // log(`added date`);

    await checkMessage(driver, inputs.message);
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
    await Promise.all([
      fillInputById(driver, 'incomename', inputs.name),
      fillInputByName(driver, 'income valuation date', inputs.revaluationDate),
      fillInputById(driver, 'incomevalue', inputs.revalue),
    ]);

    await clickButton(driver, 'revalueIncome');
    await checkMessage(driver, inputs.message);
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
      message: `added new income ${incomeInputs.name}`,
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
      message: `Income value should be a numerical value`,
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
      message: `added new income javaJob2`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: 'javaJob3',
      liability: 'Joe',
      category: 'programming',
      message: `added new income javaJob3`,
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
      message: `added new income ${incomeInputs.name}`,
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
      message: "Source income 'javaJob1' should have income tax liability",
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
      message: `added new income ${incomeInputs.name}`,
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
        'Transaction javaJob1 2 dated before start of affected income : javaJob1',
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
    await Promise.all([
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
    await checkMessage(driver, inputs.message);
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
    await Promise.all([
      fillInputById(driver, 'expensename', inputs.name),
      fillInputByName(driver, 'expense valuation date', inputs.revaluationDate),
      fillInputById(driver, 'expensevalue', inputs.revalue),
    ]);

    await clickButton(driver, 'revalueExpense');
    await checkMessage(driver, inputs.message);
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
      message: `Expense value should be a numerical value`,
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
      message: 'Transaction junk 1 to unrecognised thing : junk',
      // TODO : not a great message
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Expense value junk should be a numerical or % value',
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction broadband 2 dated before start of affected expense : broadband',
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
    await Promise.all([
      fillInputById(driver, 'assetname', inputs.name),
      fillInputByName(driver, 'start date', inputs.revaluationDate),
      fillInputById(driver, 'assetvalue', inputs.revalue),
    ]);

    await clickButton(driver, 'revalueAsset');
    await checkMessage(driver, inputs.message);
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
    await Promise.all([
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

    await checkMessage(driver, inputs.message);
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
      message: `Asset value should be a numerical value or built from a setting`,
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
      name: 'twoItems',
      quantity: '2',
      message: `added new asset`,
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
      message: `Growth value 'junk' should be a numerical or setting value`,
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
      message: `Asset purchase price \'junk\' is not a number`,
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
      message: 'Transaction junk 1 to unrecognised thing : junk',
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
      message: 'Transaction hifi 2 dated before start of affected asset : hifi',
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
      message: `added new income ${incomeInputs.name}`, //name: 'javaJob1'
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
      message:
        'Asset value junk should be a numerical value or built from a setting',
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
      message: `Transaction from unrecognised asset (could be typo or before asset start date?) : \"javaJob1\"`,
    }); // TODO : confusing error message : pension can't start before income

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
      message: `Transaction from unrecognised asset (could be typo or before asset start date?) : \"Pensiondcp6\"`,
    }); // TODO : what does this error mean?  I expected "start date after end date"

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp7',
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical or setting value`,
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
      message: `Transaction has bad date : \"junk\"`,
    }); // TODO : confusing error message about transactions?

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
      message: `Transaction has bad date : \"junk\"`,
    }); // TODO : confusing error message about transactions?

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
    await Promise.all([
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
    await checkMessage(driver, inputs.message);
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
    */

    await clickButton(driver, 'btn-Overview');
    await clickButton(driver, 'btn-Transactions');

    return;
  }

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
      message: `Transaction to value junk isn't a number or setting`,
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
    await Promise.all([
      fillInputById(driver, 'debtname', inputs.name),
      fillInputById(driver, 'debtvalue', inputs.value),
      fillInputById(driver, 'debtcategory', inputs.category),
      fillInputByName(driver, 'start date', inputs.startDate),
      fillInputById(driver, 'debtgrowth', inputs.growth),
      fillInputById(driver, 'debtpayoff', inputs.monthlyRepayment),
    ]);

    await clickButton(driver, 'addDebt');
    await checkMessage(driver, inputs.message);
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
    await checkMessage(driver, inputs.message);
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
      message: `Debt value should be a numerical value`,
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

  it('more crysler work with various values and adjustments', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getThreeChryslerModel();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: roiEnd,
      value: '1 March 2019',
      message: `added new setting ${roiEnd}`,
    });

    await addSetting(driver, {
      name: assetChartFocus,
      value: allItems,
      message: `added new setting ${assetChartFocus}`,
    });

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest1',
      startDate: 'January 2 2018',
      value: 'chrysler',
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest2',
      startDate: 'January 2 2018',
      value: 'twoChryslers',
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest3',
      startDate: 'January 2 2018',
      value: 'chrysler',
      quantity: '2',
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest4',
      startDate: 'January 2 2018',
      value: 'twoChryslers',
      quantity: '2',
      message: `added new asset`,
    });
    //await clickButton(driver, 'startNewModel2');
    //driver.switchTo().alert().sendKeys('banana');

    await clickButton(driver, 'btn-Home');

    // a bit of scrolling to ensure the check button
    // can be interacted with
    let toggleChart = await driver.findElements(
      webdriver.By.id(`WelcomeHeader`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await clickButton(driver, 'btn-check');

    let label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    let labelText = await label[0].getText();
    expect(labelText).toBe(`model check all good`);

    await clickButton(driver, 'btn-clear-alert');

    label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    labelText = await label[0].getText();
    expect(labelText).toBe(`Create or load a model`);

    // TODO edit model to make it fail check (e.g. edit value of
    // chrysler setting)

    await clickButton(driver, 'btn-Transactions');

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'Revalue USD',
      startDate: 'January 2 2018',
      fromAsset: '',
      toAsset: 'USD',
      reduction: '',
      addition: '105%',
      recurrence: '1m',
      category: 'currency trend',
      message: `added new transaction`,
    });

    // a bit of scrolling to ensure the ??? button
    // can be interacted with
    toggleChart = await driver.findElements(webdriver.By.id(`WelcomeHeader`));
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );

    const ary = await getAssetChartData(driver);
    //log(`ary = ${showObj(ary)}`);

    // writeTestCode(ary);

    expect(ary.length).toEqual(5);
    expect(ary[0].name).toEqual('carTest4');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(400);
    expect(ary[0].dataPoints[2].ttip).toEqual('400.00 at Thu Feb 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(420);
    expect(ary[0].dataPoints[3].ttip).toEqual('420.00 at Thu Mar 01 2018');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[4].y).toEqual(441);
    expect(ary[0].dataPoints[4].ttip).toEqual('441.00 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[5].y).toEqual(463.05000000000007);
    expect(ary[0].dataPoints[5].ttip).toEqual('463.05 at Tue May 01 2018');
    expect(ary[0].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[6].y).toEqual(486.2025000000001);
    expect(ary[0].dataPoints[6].ttip).toEqual('486.20 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[7].y).toEqual(510.5126250000001);
    expect(ary[0].dataPoints[7].ttip).toEqual('510.51 at Sun Jul 01 2018');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[0].dataPoints[8].y).toEqual(536.0382562500001);
    expect(ary[0].dataPoints[8].ttip).toEqual('536.04 at Wed Aug 01 2018');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[0].dataPoints[9].y).toEqual(562.8401690625002);
    expect(ary[0].dataPoints[9].ttip).toEqual('562.84 at Sat Sep 01 2018');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[0].dataPoints[10].y).toEqual(590.9821775156252);
    expect(ary[0].dataPoints[10].ttip).toEqual('590.98 at Mon Oct 01 2018');
    expect(ary[0].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[0].dataPoints[11].y).toEqual(620.5312863914065);
    expect(ary[0].dataPoints[11].ttip).toEqual('620.53 at Thu Nov 01 2018');
    expect(ary[0].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[0].dataPoints[12].y).toEqual(651.5578507109768);
    expect(ary[0].dataPoints[12].ttip).toEqual('651.56 at Sat Dec 01 2018');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[13].y).toEqual(684.1357432465256);
    expect(ary[0].dataPoints[13].ttip).toEqual('684.14 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[0].dataPoints[14].y).toEqual(718.342530408852);
    expect(ary[0].dataPoints[14].ttip).toEqual('718.34 at Fri Feb 01 2019');
    expect(ary[1].name).toEqual('carTest3');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(15);
    expect(ary[1].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[1].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(200);
    expect(ary[1].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(210);
    expect(ary[1].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[1].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[4].y).toEqual(220.5);
    expect(ary[1].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[1].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[1].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[1].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[1].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[1].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[1].dataPoints[8].y).toEqual(268.01912812500007);
    expect(ary[1].dataPoints[8].ttip).toEqual('268.02 at Wed Aug 01 2018');
    expect(ary[1].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[1].dataPoints[9].y).toEqual(281.4200845312501);
    expect(ary[1].dataPoints[9].ttip).toEqual('281.42 at Sat Sep 01 2018');
    expect(ary[1].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[1].dataPoints[10].y).toEqual(295.4910887578126);
    expect(ary[1].dataPoints[10].ttip).toEqual('295.49 at Mon Oct 01 2018');
    expect(ary[1].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[1].dataPoints[11].y).toEqual(310.26564319570326);
    expect(ary[1].dataPoints[11].ttip).toEqual('310.27 at Thu Nov 01 2018');
    expect(ary[1].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[1].dataPoints[12].y).toEqual(325.7789253554884);
    expect(ary[1].dataPoints[12].ttip).toEqual('325.78 at Sat Dec 01 2018');
    expect(ary[1].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[13].y).toEqual(342.0678716232628);
    expect(ary[1].dataPoints[13].ttip).toEqual('342.07 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[1].dataPoints[14].y).toEqual(359.171265204426);
    expect(ary[1].dataPoints[14].ttip).toEqual('359.17 at Fri Feb 01 2019');
    expect(ary[2].name).toEqual('carTest2');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(15);
    expect(ary[2].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[2].dataPoints[0].y).toEqual(0);
    expect(ary[2].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[2].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(0);
    expect(ary[2].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(400);
    expect(ary[2].dataPoints[2].ttip).toEqual('400.00 at Thu Feb 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(420);
    expect(ary[2].dataPoints[3].ttip).toEqual('420.00 at Thu Mar 01 2018');
    expect(ary[2].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[4].y).toEqual(441);
    expect(ary[2].dataPoints[4].ttip).toEqual('441.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[5].y).toEqual(463.05000000000007);
    expect(ary[2].dataPoints[5].ttip).toEqual('463.05 at Tue May 01 2018');
    expect(ary[2].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[6].y).toEqual(486.2025000000001);
    expect(ary[2].dataPoints[6].ttip).toEqual('486.20 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[7].y).toEqual(510.5126250000001);
    expect(ary[2].dataPoints[7].ttip).toEqual('510.51 at Sun Jul 01 2018');
    expect(ary[2].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[2].dataPoints[8].y).toEqual(536.0382562500001);
    expect(ary[2].dataPoints[8].ttip).toEqual('536.04 at Wed Aug 01 2018');
    expect(ary[2].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[2].dataPoints[9].y).toEqual(562.8401690625002);
    expect(ary[2].dataPoints[9].ttip).toEqual('562.84 at Sat Sep 01 2018');
    expect(ary[2].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[2].dataPoints[10].y).toEqual(590.9821775156252);
    expect(ary[2].dataPoints[10].ttip).toEqual('590.98 at Mon Oct 01 2018');
    expect(ary[2].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[2].dataPoints[11].y).toEqual(620.5312863914065);
    expect(ary[2].dataPoints[11].ttip).toEqual('620.53 at Thu Nov 01 2018');
    expect(ary[2].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[2].dataPoints[12].y).toEqual(651.5578507109768);
    expect(ary[2].dataPoints[12].ttip).toEqual('651.56 at Sat Dec 01 2018');
    expect(ary[2].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[2].dataPoints[13].y).toEqual(684.1357432465256);
    expect(ary[2].dataPoints[13].ttip).toEqual('684.14 at Tue Jan 01 2019');
    expect(ary[2].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[2].dataPoints[14].y).toEqual(718.342530408852);
    expect(ary[2].dataPoints[14].ttip).toEqual('718.34 at Fri Feb 01 2019');
    expect(ary[3].name).toEqual('carTest1');
    expect(ary[3].type).toEqual('stackedColumn');
    expect(ary[3].showInLegend).toEqual(true);
    expect(ary[3].dataPoints.length).toEqual(15);
    expect(ary[3].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[3].dataPoints[0].y).toEqual(0);
    expect(ary[3].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[3].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[3].dataPoints[1].y).toEqual(0);
    expect(ary[3].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[3].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[3].dataPoints[2].y).toEqual(200);
    expect(ary[3].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[3].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[3].dataPoints[3].y).toEqual(210);
    expect(ary[3].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[3].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[3].dataPoints[4].y).toEqual(220.5);
    expect(ary[3].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[3].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[3].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[3].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[3].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[3].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[3].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[3].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[3].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[3].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[3].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[3].dataPoints[8].y).toEqual(268.01912812500007);
    expect(ary[3].dataPoints[8].ttip).toEqual('268.02 at Wed Aug 01 2018');
    expect(ary[3].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[3].dataPoints[9].y).toEqual(281.4200845312501);
    expect(ary[3].dataPoints[9].ttip).toEqual('281.42 at Sat Sep 01 2018');
    expect(ary[3].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[3].dataPoints[10].y).toEqual(295.4910887578126);
    expect(ary[3].dataPoints[10].ttip).toEqual('295.49 at Mon Oct 01 2018');
    expect(ary[3].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[3].dataPoints[11].y).toEqual(310.26564319570326);
    expect(ary[3].dataPoints[11].ttip).toEqual('310.27 at Thu Nov 01 2018');
    expect(ary[3].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[3].dataPoints[12].y).toEqual(325.7789253554884);
    expect(ary[3].dataPoints[12].ttip).toEqual('325.78 at Sat Dec 01 2018');
    expect(ary[3].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[3].dataPoints[13].y).toEqual(342.0678716232628);
    expect(ary[3].dataPoints[13].ttip).toEqual('342.07 at Tue Jan 01 2019');
    expect(ary[3].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[3].dataPoints[14].y).toEqual(359.171265204426);
    expect(ary[3].dataPoints[14].ttip).toEqual('359.17 at Fri Feb 01 2019');
    expect(ary[4].name).toEqual('Cars');
    expect(ary[4].type).toEqual('stackedColumn');
    expect(ary[4].showInLegend).toEqual(true);
    expect(ary[4].dataPoints.length).toEqual(15);
    expect(ary[4].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[4].dataPoints[0].y).toEqual(0);
    expect(ary[4].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[4].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[4].dataPoints[1].y).toEqual(0);
    expect(ary[4].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[4].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[4].dataPoints[2].y).toEqual(300);
    expect(ary[4].dataPoints[2].ttip).toEqual('300.00 at Thu Feb 01 2018');
    expect(ary[4].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[4].dataPoints[3].y).toEqual(315);
    expect(ary[4].dataPoints[3].ttip).toEqual('315.00 at Thu Mar 01 2018');
    expect(ary[4].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[4].dataPoints[4].y).toEqual(330.75);
    expect(ary[4].dataPoints[4].ttip).toEqual('330.75 at Sun Apr 01 2018');
    expect(ary[4].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[4].dataPoints[5].y).toEqual(347.2875);
    expect(ary[4].dataPoints[5].ttip).toEqual('347.29 at Tue May 01 2018');
    expect(ary[4].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[4].dataPoints[6].y).toEqual(364.6518750000001);
    expect(ary[4].dataPoints[6].ttip).toEqual('364.65 at Fri Jun 01 2018');
    expect(ary[4].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[4].dataPoints[7].y).toEqual(382.8844687500001);
    expect(ary[4].dataPoints[7].ttip).toEqual('382.88 at Sun Jul 01 2018');
    expect(ary[4].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[4].dataPoints[8].y).toEqual(402.0286921875001);
    expect(ary[4].dataPoints[8].ttip).toEqual('402.03 at Wed Aug 01 2018');
    expect(ary[4].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[4].dataPoints[9].y).toEqual(422.1301267968752);
    expect(ary[4].dataPoints[9].ttip).toEqual('422.13 at Sat Sep 01 2018');
    expect(ary[4].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[4].dataPoints[10].y).toEqual(443.23663313671886);
    expect(ary[4].dataPoints[10].ttip).toEqual('443.24 at Mon Oct 01 2018');
    expect(ary[4].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[4].dataPoints[11].y).toEqual(465.3984647935549);
    expect(ary[4].dataPoints[11].ttip).toEqual('465.40 at Thu Nov 01 2018');
    expect(ary[4].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[4].dataPoints[12].y).toEqual(488.66838803323265);
    expect(ary[4].dataPoints[12].ttip).toEqual('488.67 at Sat Dec 01 2018');
    expect(ary[4].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[4].dataPoints[13].y).toEqual(513.1018074348942);
    expect(ary[4].dataPoints[13].ttip).toEqual('513.10 at Tue Jan 01 2019');
    expect(ary[4].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[4].dataPoints[14].y).toEqual(538.756897806639);
    expect(ary[4].dataPoints[14].ttip).toEqual('538.76 at Fri Feb 01 2019');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('more crysler work with various doublings', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getThreeChryslerModel();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: roiEnd,
      value: '1 March 2019',
      message: 'added new setting End of view range',
    });

    await addSetting(driver, {
      name: assetChartFocus,
      value: 'carTest1',
      message: 'added new setting Focus of assets chart',
    });

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest1',
      startDate: 'January 2 2018',
      value: 'chrysler',
      message: `added new asset`,
    });

    //await clickButton(driver, 'startNewModel2');
    //driver.switchTo().alert().sendKeys('banana');

    await clickButton(driver, 'btn-Home');

    // a bit of scrolling to ensure the check button
    // can be interacted with
    let toggleChart = await driver.findElements(
      webdriver.By.id(`WelcomeHeader`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await clickButton(driver, 'btn-check');

    let label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    let labelText = await label[0].getText();
    expect(labelText).toBe(`model check all good`);

    await clickButton(driver, 'btn-clear-alert');

    label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    labelText = await label[0].getText();
    expect(labelText).toBe(`Create or load a model`);

    // TODO edit model to make it fail check (e.g. edit value of
    // chrysler setting)

    await clickButton(driver, 'btn-Transactions');

    await addTransaction(driver, {
      ...transactionInputs,
      name: 'Revalue USD',
      startDate: 'January 2 2018',
      fromAsset: '',
      toAsset: 'USD',
      reduction: '',
      addition: '105%',
      recurrence: '1m',
      category: 'currency trend',
      message: `added new transaction`,
    });

    // a bit of scrolling to ensure the ??? button
    // can be interacted with
    toggleChart = await driver.findElements(webdriver.By.id(`WelcomeHeader`));
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );

    let ary = await getAssetChartData(driver);
    //log(`ary = ${showObj(ary)}`);

    // writeTestCode(ary);

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('carTest1');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(200);
    expect(ary[0].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(210);
    expect(ary[0].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[4].y).toEqual(220.5);
    expect(ary[0].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[0].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[0].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[0].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[0].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[0].dataPoints[8].y).toEqual(268.01912812500007);
    expect(ary[0].dataPoints[8].ttip).toEqual('268.02 at Wed Aug 01 2018');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[0].dataPoints[9].y).toEqual(281.4200845312501);
    expect(ary[0].dataPoints[9].ttip).toEqual('281.42 at Sat Sep 01 2018');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[0].dataPoints[10].y).toEqual(295.4910887578126);
    expect(ary[0].dataPoints[10].ttip).toEqual('295.49 at Mon Oct 01 2018');
    expect(ary[0].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[0].dataPoints[11].y).toEqual(310.26564319570326);
    expect(ary[0].dataPoints[11].ttip).toEqual('310.27 at Thu Nov 01 2018');
    expect(ary[0].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[0].dataPoints[12].y).toEqual(325.7789253554884);
    expect(ary[0].dataPoints[12].ttip).toEqual('325.78 at Sat Dec 01 2018');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[13].y).toEqual(342.0678716232628);
    expect(ary[0].dataPoints[13].ttip).toEqual('342.07 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[0].dataPoints[14].y).toEqual(359.171265204426);
    expect(ary[0].dataPoints[14].ttip).toEqual('359.17 at Fri Feb 01 2019');

    // log(`done first block of expectations`);

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: 'EUR',
      value: '1.1',
      message: 'added new setting EUR',
    });

    await clickButton(driver, 'btn-Transactions');
    await addTransaction(driver, {
      ...transactionInputs,
      name: 'Revalue carTest1 in Euros',
      startDate: 'July 2 2018',
      fromAsset: '',
      toAsset: 'carTest1',
      reduction: '',
      addition: '10EUR',
      recurrence: '',
      endDate: '',
      category: 'car',
      message: `added new transaction`,
    });

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('carTest1');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(200);
    expect(ary[0].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(210);
    expect(ary[0].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[4].y).toEqual(220.5);
    expect(ary[0].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[0].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[0].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[0].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[0].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[0].dataPoints[8].y).toEqual(22);
    expect(ary[0].dataPoints[8].ttip).toEqual('22.00 at Wed Aug 01 2018');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[0].dataPoints[9].y).toEqual(22);
    expect(ary[0].dataPoints[9].ttip).toEqual('22.00 at Sat Sep 01 2018');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[0].dataPoints[10].y).toEqual(22);
    expect(ary[0].dataPoints[10].ttip).toEqual('22.00 at Mon Oct 01 2018');
    expect(ary[0].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[0].dataPoints[11].y).toEqual(22);
    expect(ary[0].dataPoints[11].ttip).toEqual('22.00 at Thu Nov 01 2018');
    expect(ary[0].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[0].dataPoints[12].y).toEqual(22);
    expect(ary[0].dataPoints[12].ttip).toEqual('22.00 at Sat Dec 01 2018');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[13].y).toEqual(22);
    expect(ary[0].dataPoints[13].ttip).toEqual('22.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[0].dataPoints[14].y).toEqual(22);
    expect(ary[0].dataPoints[14].ttip).toEqual('22.00 at Fri Feb 01 2019');

    // log(`done second block of expectations`);

    await clickButton(driver, 'btn-Transactions');
    await addTransaction(driver, {
      ...transactionInputs,
      name: 'Revalue EUR',
      startDate: 'August 1 2018',
      fromAsset: '',
      toAsset: 'EUR',
      reduction: '',
      addition: '2.2',
      category: 'car',
      message: `added new transaction`,
    });

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('carTest1');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(200);
    expect(ary[0].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(210);
    expect(ary[0].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[4].y).toEqual(220.5);
    expect(ary[0].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[0].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[0].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[0].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[0].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[0].dataPoints[8].y).toEqual(22);
    expect(ary[0].dataPoints[8].ttip).toEqual('22.00 at Wed Aug 01 2018');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[0].dataPoints[9].y).toEqual(44);
    expect(ary[0].dataPoints[9].ttip).toEqual('44.00 at Sat Sep 01 2018');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[0].dataPoints[10].y).toEqual(44);
    expect(ary[0].dataPoints[10].ttip).toEqual('44.00 at Mon Oct 01 2018');
    expect(ary[0].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[0].dataPoints[11].y).toEqual(44);
    expect(ary[0].dataPoints[11].ttip).toEqual('44.00 at Thu Nov 01 2018');
    expect(ary[0].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[0].dataPoints[12].y).toEqual(44);
    expect(ary[0].dataPoints[12].ttip).toEqual('44.00 at Sat Dec 01 2018');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[13].y).toEqual(44);
    expect(ary[0].dataPoints[13].ttip).toEqual('44.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[0].dataPoints[14].y).toEqual(44);
    expect(ary[0].dataPoints[14].ttip).toEqual('44.00 at Fri Feb 01 2019');

    // log(`done third block of expectations`);

    await clickButton(driver, 'btn-Transactions');
    await addTransaction(driver, {
      ...transactionInputs,
      name: 'Revalue carTest1 doubles',
      startDate: 'September 2 2018',
      fromAsset: '',
      toAsset: 'carTest1',
      reduction: '',
      addition: '210%',
      recurrence: '',
      endDate: '',
      category: 'car',
      message: `added new transaction`,
    });

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('carTest1');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(200);
    expect(ary[0].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(210);
    expect(ary[0].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[4].y).toEqual(220.5);
    expect(ary[0].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[0].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[0].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[0].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[0].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[0].dataPoints[8].y).toEqual(22);
    expect(ary[0].dataPoints[8].ttip).toEqual('22.00 at Wed Aug 01 2018');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[0].dataPoints[9].y).toEqual(44);
    expect(ary[0].dataPoints[9].ttip).toEqual('44.00 at Sat Sep 01 2018');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[0].dataPoints[10].y).toEqual(92.4);
    expect(ary[0].dataPoints[10].ttip).toEqual('92.40 at Mon Oct 01 2018');
    expect(ary[0].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[0].dataPoints[11].y).toEqual(92.4);
    expect(ary[0].dataPoints[11].ttip).toEqual('92.40 at Thu Nov 01 2018');
    expect(ary[0].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[0].dataPoints[12].y).toEqual(92.4);
    expect(ary[0].dataPoints[12].ttip).toEqual('92.40 at Sat Dec 01 2018');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[13].y).toEqual(92.4);
    expect(ary[0].dataPoints[13].ttip).toEqual('92.40 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[0].dataPoints[14].y).toEqual(92.4);
    expect(ary[0].dataPoints[14].ttip).toEqual('92.40 at Fri Feb 01 2019');

    // log(`done fourth block of expectations`);

    await clickButton(driver, 'btn-Transactions');
    await addTransaction(driver, {
      ...transactionInputs,
      name: 'Revalue Euro doubles again',
      startDate: 'October 2 2018',
      fromAsset: '',
      toAsset: 'EUR',
      reduction: '',
      addition: '210%',
      recurrence: '',
      endDate: '',
      category: 'car',
      message: `added new transaction`,
    });

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('carTest1');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(15);
    expect(ary[0].dataPoints[0].label).toEqual('Fri Dec 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[2].y).toEqual(200);
    expect(ary[0].dataPoints[2].ttip).toEqual('200.00 at Thu Feb 01 2018');
    expect(ary[0].dataPoints[3].label).toEqual('Thu Mar 01 2018');
    expect(ary[0].dataPoints[3].y).toEqual(210);
    expect(ary[0].dataPoints[3].ttip).toEqual('210.00 at Thu Mar 01 2018');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Apr 01 2018');
    expect(ary[0].dataPoints[4].y).toEqual(220.5);
    expect(ary[0].dataPoints[4].ttip).toEqual('220.50 at Sun Apr 01 2018');
    expect(ary[0].dataPoints[5].label).toEqual('Tue May 01 2018');
    expect(ary[0].dataPoints[5].y).toEqual(231.52500000000003);
    expect(ary[0].dataPoints[5].ttip).toEqual('231.53 at Tue May 01 2018');
    expect(ary[0].dataPoints[6].label).toEqual('Fri Jun 01 2018');
    expect(ary[0].dataPoints[6].y).toEqual(243.10125000000005);
    expect(ary[0].dataPoints[6].ttip).toEqual('243.10 at Fri Jun 01 2018');
    expect(ary[0].dataPoints[7].label).toEqual('Sun Jul 01 2018');
    expect(ary[0].dataPoints[7].y).toEqual(255.25631250000006);
    expect(ary[0].dataPoints[7].ttip).toEqual('255.26 at Sun Jul 01 2018');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Aug 01 2018');
    expect(ary[0].dataPoints[8].y).toEqual(22);
    expect(ary[0].dataPoints[8].ttip).toEqual('22.00 at Wed Aug 01 2018');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Sep 01 2018');
    expect(ary[0].dataPoints[9].y).toEqual(44);
    expect(ary[0].dataPoints[9].ttip).toEqual('44.00 at Sat Sep 01 2018');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Oct 01 2018');
    expect(ary[0].dataPoints[10].y).toEqual(92.4);
    expect(ary[0].dataPoints[10].ttip).toEqual('92.40 at Mon Oct 01 2018');
    expect(ary[0].dataPoints[11].label).toEqual('Thu Nov 01 2018');
    expect(ary[0].dataPoints[11].y).toEqual(92.4);
    expect(ary[0].dataPoints[11].ttip).toEqual('92.40 at Thu Nov 01 2018');
    expect(ary[0].dataPoints[12].label).toEqual('Sat Dec 01 2018');
    expect(ary[0].dataPoints[12].y).toEqual(194.04000000000005);
    expect(ary[0].dataPoints[12].ttip).toEqual('194.04 at Sat Dec 01 2018');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[13].y).toEqual(194.04000000000005);
    expect(ary[0].dataPoints[13].ttip).toEqual('194.04 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[14].label).toEqual('Fri Feb 01 2019');
    expect(ary[0].dataPoints[14].y).toEqual(194.04000000000005);
    expect(ary[0].dataPoints[14].ttip).toEqual('194.04 at Fri Feb 01 2019');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('my first model browser test', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelName = 'Ben and Jerry';
    const model = getMinimalModelCopy();

    jest.setTimeout(1000000); // allow time for all these tests to run
    // log(`go to ensure model ${modelName}`);

    await beforeAllWork(driver, modelName, model);

    if (allowExtraSleeps()) {
      await sleep(
        1500, // was calcSleep twice
        '--- after browser loads URI',
      );
    }

    // Handle errors around SSL certificates
    // push through "Advanced" and "Proceed"
    let x = await driver.findElements(webdriver.By.id('details-button'));
    if (x[0] !== undefined) {
      // console.log('found details button!');
      await x[0].click();
      x = await driver.findElements(webdriver.By.id('proceed-link'));
      if (x[0] !== undefined) {
        // console.log('found proceed link!');
        await x[0].click();
      }
    }

    const btnData = await driver.findElements(
      webdriver.By.id('buttonTestLogin'),
    );
    if (btnData[0] !== undefined) {
      await btnData[0].click();
    }

    await selectModel(driver, modelName);
    if (allowExtraSleeps()) {
      await sleep(calcSleep, '--- after model selected');
    }

    await clickButton(driver, 'btn-Dates');

    await addDate(
      driver,
      'Jerry retires',
      '5/5/2030',
      'added important date OK',
    );

    await addDate(
      driver,
      'Ben retires',
      '28/7/2032',
      'added important date OK',
    );

    await addDate(
      driver,
      'Jerry state pension age',
      '5/5/2037',
      'added important date OK',
    );

    await addDate(
      driver,
      'Ben state pension age',
      '31/8/2040',
      'added important date OK',
    );

    await addDate(
      driver,
      'Downsize house',
      '28/2/2047',
      'added important date OK',
    );

    // Add incomes
    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      name: 'Ben salary',
      value: '3470',
      valuationDate: '21/2/2020',
      startDate: '21/2/2020',
      endDate: 'Ben retires',
      growth: '2',
      growsWithInflation: 'Y',
      liability: 'Ben',
      category: 'Salary',
      message: `added new income ${'Ben salary'}`,
    });
    // log('done Ben salary');

    // a bit of scrolling to ensure the toggle-incomesChart button
    // can be interacted with
    let toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-incomesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: 'Beginning of view range',
      value: '2020',
      message: 'added new setting Beginning of view range',
    });

    await addSetting(driver, {
      name: 'End of view range',
      value: '2069',
      message: 'added new setting End of view range',
    });

    await clickButton(driver, 'btn-Incomes');

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: 'View frequency',
      value: 'Annually',
      message: 'added new setting View frequency',
    });
    await clickButton(driver, 'btn-Incomes');
    await clickButton(driver, 'btn-Settings');
    /*
    await addSetting(driver, {
      name: 'Date of birth',
      value: '31 August 1973',
      message: 'added new setting Date of birth',
    },
    pauseBeforeOK);
    await pauseForDemo();
*/

    await clickButton(driver, 'btn-Incomes');

    await driver.executeScript('window.scrollBy(0, -400)'); // Adjust scrolling with a negative value here

    // log('go to toggle incomes chart off again...');

    await clickButton(driver, 'toggle-incomesChart');

    // log('toggled incomes chart off again');

    await addIncome(driver, {
      ...incomeInputs,
      name: 'Jerry salary',
      value: '2755',
      valuationDate: '21/2/2020',
      startDate: '21/2/2020',
      endDate: 'Jerry retires',
      growth: '2',
      growsWithInflation: 'Y',
      liability: 'Jerry',
      category: 'Salary',
      message: `added new income ${'Jerry salary'}`,
    });
    // log('done Jerry salary');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-incomesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -200)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'btn-Expenses');
    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'btn-Dates');

    await addDate(driver, 'Ben dies', '31/8/2068', 'added important date OK');

    await addDate(driver, 'Jerry dies', '5/5/2065', 'added important date OK');

    await clickButton(driver, 'btn-Incomes');
    await clickButton(driver, 'useDBPInputs');

    let DBPinputs = {
      name: 'Ben state pension',
      value: '730',
      valuationDate: '21/02/2020',
      contributionsEndDate: '',
      startDate: 'Ben state pension age',
      pensionEndOrTransferDate: 'Ben dies', //31/8/2068
      transferredStopDate: '',
      incomeSource: '',
      contributionSSIncome: '',
      contributionAmountPensionIncome: '',
      incomeaccrual: '',
      transferName: '',
      transferProportion: '',
      incomeGrowth: '0',
      incomecpiGrows: 'Y',
      liability: 'Ben',
      category: 'Pension',
    };

    await addDBPension(driver, {
      ...DBPinputs,
      message: 'added new data', // TODO "added pension information",
    });
    // log('done Ben state pension');

    // a bit of scrolling to ensure the toggle-incomesChart button
    // can be interacted with
    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-incomesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'useDBPInputs');

    DBPinputs = {
      name: 'Jerry state pension',
      value: '730',
      valuationDate: '21/02/2020',
      contributionsEndDate: '',
      startDate: 'Jerry state pension age',
      pensionEndOrTransferDate: 'Jerry dies', //5/5/2065
      transferredStopDate: '',
      incomeSource: '',
      contributionSSIncome: '',
      contributionAmountPensionIncome: '',
      incomeaccrual: '',
      transferName: '',
      transferProportion: '',
      incomeGrowth: '0',
      incomecpiGrows: 'Y',
      liability: 'Jerry',
      category: 'Pension',
    };

    await addDBPension(driver, {
      ...DBPinputs,
      message: 'added new data', // TODO "added pension information",
    });
    // log('done Jerry state pension');

    // a bit of scrolling to ensure the toggle-incomesChart button
    // can be interacted with
    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-incomesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'toggle-incomesChart');

    DBPinputs = {
      name: 'Jerry work',
      value: '2000',
      valuationDate: '21/02/2020',
      contributionsEndDate: 'Jerry retires',
      startDate: 'Jerry state pension age',
      pensionEndOrTransferDate: 'Jerry dies',
      transferredStopDate: 'Ben dies',
      incomeSource: 'Jerry salary',
      contributionSSIncome: 'N',
      contributionAmountPensionIncome: '0.05',
      incomeaccrual: '0.015',
      transferName: 'Ben',
      transferProportion: '0.5',
      incomeGrowth: '0',
      incomecpiGrows: 'Y',
      liability: 'Jerry',
      category: 'Pension',
    };
    await clickButton(driver, 'useDBPInputs');

    await addDBPension(driver, {
      ...DBPinputs,
      message: 'added new data', // TODO "added pension information",
    });
    // log('done Jerry work');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-incomesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'toggle-incomesChart');

    await clickButton(driver, 'btn-Expenses');

    let expenseInputs = {
      name: 'Basic expenses current house',
      value: '1850',
      valuationDate: '21/02/2020',
      startDate: '21/02/2020',
      endDate: 'Downsize house',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Basic',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Basic expenses working');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'Basic expenses small house',
      value: '1600',
      valuationDate: '21/02/2020',
      startDate: 'Downsize house',
      endDate: 'Ben dies',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Basic',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Basic expenses downsize');

    expenseInputs = {
      name: 'Leisure expenses working',
      value: '1000',
      valuationDate: '21/02/2020',
      startDate: '21/02/2020',
      endDate: 'Jerry retires',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Leisure',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Leisure expenses working');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'btn-Dates');

    await addDate(
      driver,
      'Care costs start',
      '20/2/2060',
      'added important date OK',
    );

    await clickButton(driver, 'btn-Expenses');

    expenseInputs = {
      name: 'Leisure expenses retired',
      value: '2000',
      valuationDate: '21/02/2020',
      startDate: 'Jerry retires',
      endDate: 'Care costs start', // 20/2/2060
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Leisure',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Leisure expenses retired');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'Care costs',
      value: '3000',
      valuationDate: '21/02/2020',
      startDate: 'Care costs start',
      endDate: 'Ben dies',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Care',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Care costs');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'House maintenance',
      value: '8000',
      valuationDate: '21/02/2020',
      startDate: '21/02/2020',
      endDate: 'Care costs start',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '4y',
      category: 'Major costs',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done House maintenance');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'Replace car',
      value: '20000',
      valuationDate: '21/02/2020',
      startDate: '21/02/2025',
      endDate: 'Care costs start',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '5y',
      category: 'Major costs',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Replace car');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'btn-Assets');

    let assetInputs = {
      name: 'House',
      value: '255000',
      quantity: '',
      category: 'Property',
      startDate: '21/02/2020',
      growth: '2',
      growsWithInflation: 'Y',
      liability: '',
      purchasePrice: '',
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done House');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'chooseAssetOrDebtChartSetting--asset-All');

    await clickButton(driver, 'toggleAssetsChart');

    assetInputs = {
      name: 'ISA',
      value: '9000',
      quantity: '',
      category: 'Investment',
      startDate: '21/02/2020',
      growth: '4',
      growsWithInflation: 'Y',
      liability: '',
      purchasePrice: '',
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done ISA');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    assetInputs = {
      name: 'Jerry stocks',
      value: '25000',
      quantity: '',
      category: 'Investment',
      startDate: '21/02/2020',
      growth: '4',
      growsWithInflation: 'Y',
      liability: 'Jerry',
      purchasePrice: '14000',
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done Jerry stocks');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    let pensionInputs = {
      name: 'Jerry Aegon',
      value: '56324',
      category: 'Pension',
      startDate: '21/02/2020',
      growth: '4',
      growsWithCPI: 'Y',
      contributionsStopDate: '',
      crystallizesDate: 'Jerry retires',
      pensionEndOrTransferDate: 'Jerry dies',
      contributionSSIncome: 'N',
      incomeSource: '',
      contributionAmountPensionIncome: '0',
      employerContribution: '0',
      liability: 'Jerry',
      transferName: 'Ben',
    };

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      message: 'added assets and transactions',
    });
    // log('done Jerry Aegon');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    pensionInputs = {
      name: 'Ben Prudential',
      value: '45000',
      category: 'Pension',
      startDate: '21/02/2020',
      growth: '4',
      growsWithCPI: 'Y',
      contributionsStopDate: 'Ben retires',
      crystallizesDate: 'Ben retires',
      pensionEndOrTransferDate: 'Ben dies',
      contributionSSIncome: 'N',
      incomeSource: 'Ben salary',
      contributionAmountPensionIncome: '0.06',
      employerContribution: '0.12',
      liability: 'Ben',
      transferName: 'Jerry',
    };

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      message: 'added assets and transactions',
    });
    // log('done Ben Prudential');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'btn-Debts');

    let debtInputs = {
      name: 'Mortgage',
      value: '150000',
      category: 'Property',
      startDate: '21/02/2020',
      growth: '3.5',
      monthlyRepayment: '700',
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });

    // log('done Mortgage');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleDebtsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'toggleDebtsChart');

    debtInputs = {
      name: 'Jerry loan',
      value: '5000',
      category: '',
      startDate: '21/02/2020',
      growth: '2.5',
      monthlyRepayment: '250',
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });
    // log('done Jerry loan');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleDebtsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'toggleDebtsChart');

    debtInputs = {
      name: 'Ben loan',
      value: '5000',
      category: '',
      startDate: '21/02/2020',
      growth: '0',
      monthlyRepayment: '500',
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });
    // log('done Ben loan');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleDebtsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'btn-Transactions');
    let transactionInputs = {
      name: 'Downsize house',
      startDate: 'Downsize house',
      fromAsset: 'House',
      toAsset: CASH_ASSET_NAME,
      reduction: '40%',
      addition: '87.5%',
      recurrence: '',
      liquidateForCash: 'N',
      endDate: '',
      category: '',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Downsize house');

    transactionInputs = {
      name: 'Sell ISAs for cash',
      startDate: '21/02/2020',
      fromAsset: 'ISA',
      toAsset: CASH_ASSET_NAME,
      reduction: '500',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell ISAs for cash');

    transactionInputs = {
      name: 'Sell stocks for cash',
      startDate: '21/02/2020',
      fromAsset: 'Jerry stocks',
      toAsset: CASH_ASSET_NAME,
      reduction: '500',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell stocks for cash');

    transactionInputs = {
      name: 'Sell AegonTaxFree',
      startDate: '21/02/2020',
      fromAsset: 'Jerry AegonTaxFree',
      toAsset: CASH_ASSET_NAME,
      reduction: '250',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell AegonTaxFree');

    transactionInputs = {
      name: 'Sell PrudentialTaxFree ',
      startDate: '21/02/2020',
      fromAsset: 'Ben PrudentialTaxFree',
      toAsset: CASH_ASSET_NAME,
      reduction: '250',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell PrudentialTaxFree');

    transactionInputs = {
      name: 'Sell CrystallizedPensionJerry ',
      startDate: '21/02/2020',
      fromAsset: 'CrystallizedPensionJerry',
      toAsset: CASH_ASSET_NAME,
      reduction: '1000',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell CrystallizedPensionJerry');

    transactionInputs = {
      name: 'Sell CrystallizedPensionBen ',
      startDate: '21/02/2020',
      fromAsset: 'CrystallizedPensionBen',
      toAsset: CASH_ASSET_NAME,
      reduction: '1000',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell CrystallizedPensionBen');

    // await cleanUpWork(driver, modelName);

    done();
  });

  async function alertIsShowing(): Promise<boolean> {
    try {
      await driver.switchTo().alert();
      return true;
    } catch (err) {
      // try
      return false;
    } // catch
  } // isAlertPresent()

  async function acceptAnyAlert(): Promise<boolean> {
    try {
      await driver
        .switchTo()
        .alert()
        .accept();
      return true;
    } catch (err) {
      // try
      return false;
    } // catch
  } // isAlertPresent()

  async function dismissAnyAlert(): Promise<boolean> {
    try {
      await driver
        .switchTo()
        .alert()
        .dismiss();
      return true;
    } catch (err) {
      // try
      return false;
    } // catch
  } // isAlertPresent()

  async function consumeAlert(message: string, accept: boolean) {
    expect(
      await driver
        .switchTo()
        .alert()
        .getText(),
    ).toBe(message);
    if (accept) {
      await driver
        .switchTo()
        .alert()
        .accept();
    } else {
      await driver
        .switchTo()
        .alert()
        .dismiss();
    }
  }

  async function deleteIfExists(name: string) {
    await clickButton(driver, 'btn-Home');
    // log(`delete ${name} if it exists...`);
    const btn = await driver.findElements(
      webdriver.By.id(`btn-overview-${name}`),
    );
    if (btn.length === 1) {
      // log(`${name} exists`);
      await btn[0].click();
      await acceptAnyAlert();
      await clickButton(driver, 'btn-Home');
      // await sleep(1000, 'pause');
      await clickButton(driver, 'btn-delete');
      await consumeAlert(`delete all data in model ${name} - you sure?`, true);
    } else {
      // log(`${name} didn't exist`);
    }
    await clickButton(driver, 'btn-Home');
  }

  async function testModelCreation(createButtonID: string) {
    const ex1Name = 'ex1Name';
    const ex2Name = 'ex2Name';

    // await checkMessage(driver, `wrong`);

    // clear away any old data!
    await deleteIfExists(ex1Name);
    await deleteIfExists(ex2Name);
    await clickButton(driver, `btn-overview-${testDataModelName}`);
    await clickButton(driver, 'btn-Home');

    // there's no model
    let btn = await driver.findElements(
      webdriver.By.id(`btn-overview-${ex1Name}`),
    );
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 0).toBe(true);

    // can't create a model with no name
    await clickButton(driver, createButtonID);
    await checkMessage(driver, 'Please provide a new name for the model');

    // warned if creating a model when existing model is not saved
    // choose to not switch
    // check the model did not get created
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(
      'Continue without saving unsaved model SeleniumTestData?',
      false,
    );

    // still looking at old model
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${testDataModelName}: Overview`);
    await clickButton(driver, 'btn-Home');

    // no button for not-saved model
    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 0).toBe(true);

    // warned if creating a model when existing model is not saved
    // choose to accept warning
    // check the model did get created
    await clickButton(driver, createButtonID);
    await consumeAlert(
      'Continue without saving unsaved model SeleniumTestData?',
      true,
    );
    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 1).toBe(true);
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex1Name}: Overview`);
    await clickButton(driver, 'btn-Home');

    await fillInputById(driver, 'createModel', ex2Name);

    // warned if creating a model when existing model is not saved
    // choose to not switch
    // check the model did not get created
    // save, go round again
    await clickButton(driver, createButtonID);
    await consumeAlert(
      `Continue without saving unsaved model ${ex1Name}?`,
      false,
    );
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex1Name}: Overview`);
    await clickButton(driver, 'btn-Home');

    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 0).toBe(true);
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex1Name}: Overview`);
    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-save-model');
    await clickButton(driver, createButtonID);
    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 1).toBe(true);
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex2Name}: Overview`);
    await clickButton(driver, 'btn-Home');

    // try to create ex1Name but we're in ex2Name and
    // ex2Name is not saved, ex1Name is present
    // try to create ex1Name
    // warn ex2 is unsaved
    // warn ex1 exists
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex1Name}, you sure?`, false);

    //await checkMessage(driver, 'wrong');

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex1Name}, you sure?`, true);
    await consumeAlert(
      `Continue without saving unsaved model ${ex2Name}?`,
      false,
    );

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex1Name}, you sure?`, true);
    await consumeAlert(
      `Continue without saving unsaved model ${ex2Name}?`,
      true,
    );

    await clickButton(driver, 'btn-save-model');

    // try to create ex2Name but we're in ex1Name and
    // ex1Name is saved, ex2Name is present
    // warn ex2 exists
    await fillInputById(driver, 'createModel', ex2Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, false);

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, true);

    // try to create ex2Name but we're in ex2Name and
    // ex2Name is not saved
    await fillInputById(driver, 'createModel', ex2Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, false);

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, true);

    // clear away any data
    await deleteIfExists(ex1Name);
    await deleteIfExists(ex2Name);
  }

  it('create new models', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await testModelCreation('btn-createMinimalModel');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('create examples', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await testModelCreation('btn-create-Simple-example');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('create new clones', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    await testModelCreation('btn-clone');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  async function expectCashValue(val: number) {
    const ary = await getAssetChartData(driver);
    if (val === 0) {
      expect(ary.length).toEqual(0);
    } else {
      expect(ary.length).toEqual(1);
      expect(ary[0].name).toEqual('Cash');
      expect(ary[0].type).toEqual('stackedColumn');
      expect(ary[0].showInLegend).toEqual(true);
      expect(ary[0].dataPoints.length).toEqual(1);
      expect(ary[0].dataPoints[0].label).toEqual('Sat Nov 02 2019');
      expect(ary[0].dataPoints[0].y).toEqual(val);
    }
  }

  async function setNarrowViewRange() {
    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: roiStart,
      value: '2 Nov 2019',
      message: 'added new setting Beginning of view range',
    });
    await addSetting(driver, {
      name: roiEnd,
      value: '1 Dec 2019',
      message: 'added new setting End of view range',
    });
  }
  async function setCashValue(val: number) {
    await clickButton(driver, 'btn-Assets');
    await addAsset(driver, {
      ...assetInputs,
      name: 'Cash',
      value: `${val}`,
      startDate: '1 Jan 2019',
      growth: '0',
      growsWithInflation: 'n',
      quantity: '',
      message: `added new asset`,
    });
  }

  async function makeNewModel(name: string) {
    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await fillInputById(driver, 'createModel', name);
    await clickButton(driver, 'btn-createMinimalModel');
    await acceptAnyAlert();
    await setNarrowViewRange();
  }

  async function assertCurrentModel(name: string, isDirty: boolean) {
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${name}: Overview`);

    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -1000)'); // Adjust scrolling with a negative value here
    await clickButton(driver, `btn-overview-${testDataModelName}`);
    if (isDirty) {
      if (name === testDataModelName) {
        // this check for dirty status doesn't work for
        // the testDataModelName model
        await checkMessage(driver, 'UNSUPPORTED TEST CODE');
      }
      expect(await alertIsShowing()).toBe(true);
      await dismissAnyAlert();
    } else {
      await clickButton(driver, 'btn-Home');
      await clickButton(driver, `btn-overview-${name}`);
      await acceptAnyAlert();
    }
    await clickButton(driver, 'btn-Home');
  }
  async function switchToModel(name: string) {
    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await clickButton(driver, `btn-overview-${name}`);
    await acceptAnyAlert();
    await clickButton(driver, 'btn-Home');
  }

  async function modelExists(name: string, exists: boolean) {
    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    const btn = await driver.findElements(
      webdriver.By.id(`btn-overview-${name}`),
    );
    // log(`found ${btn.length} elements with id=btn-overview-${name}`);
    if (exists) {
      expect(btn.length === 1).toBe(true);
    } else {
      expect(btn.length === 0).toBe(true);
    }
    await clickButton(driver, 'btn-Home');
  }

  it('new, clone, save, manipulate cash value', async done => {
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    const ex1Name = 'ex1Name';
    const ex2Name = 'ex2Name';
    await deleteIfExists(ex1Name);
    await deleteIfExists(ex2Name);

    await clickButton(driver, `btn-overview-${testDataModelName}`);
    await clickButton(driver, 'btn-Home');
    await clickButton(driver, `btn-save-model`);

    await makeNewModel(ex1Name);
    await assertCurrentModel(ex1Name, true);

    await expectCashValue(0);
    await setCashValue(10);
    await expectCashValue(10);

    await makeNewModel(ex2Name);
    await assertCurrentModel(ex2Name, true);

    await switchToModel(ex1Name);
    await assertCurrentModel(ex1Name, true);
    await expectCashValue(10);

    await switchToModel(ex2Name);
    await assertCurrentModel(ex2Name, true);

    await expectCashValue(0);
    await setCashValue(20);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-save-model');
    await assertCurrentModel(ex2Name, false);

    ///////
    // await checkMessage(driver, 'wrong');
    //////

    await clickButton(driver, 'btn-Home');

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);
    await expectCashValue(20);
    await setCashValue(30);
    await expectCashValue(30);

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, 'btn-clone');

    await modelExists(ex1Name, true);
    await modelExists(ex2Name, true);

    await switchToModel(ex1Name);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-delete');
    await consumeAlert(`delete all data in model ${ex1Name} - you sure?`, true);

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);

    // explore replace-with-new, ...

    // await checkMessage(driver, 'wrong');

    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await deleteIfExists(ex1Name);
    await deleteIfExists(ex2Name);
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
