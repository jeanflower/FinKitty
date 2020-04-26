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

import { WebElement } from 'selenium-webdriver';
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
} from '../../localization/stringConstants';
import {
  getModelCoarseAndFine,
  getModelFutureExpense,
} from '../algoTests/evaluationsAndChart.test';

import webdriver from 'selenium-webdriver';

// to easily switch these tests on and off...
const doActions = true;

describe('Chrome Interaction', () => {
  // switch these values if you want to debug
  // one of these tests and see the Chrome window
  // alive
  // const headless = true;
  const quitAfterAll = true;
  const headless = false;
  // const quitAfterAll = false;

  const driver = getDriver(headless); // one driver for all
  const debug = false;
  const testDataModelName = 'SeleniumTestData';

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
  it('Should show a chart', () =>
    new Promise(async resolve => {
      if (!doActions) {
        resolve();
        return;
      }
      const modelAndRoi = getTestModel01();
      await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

      const btn = await driver.findElements(webdriver.By.id('btn-Incomes'));
      expect(btn.length === 1).toBe(true);
      await btn[0].click();

      const chartID = 'canvasjs-react-chart-container-9'; // why 9? 9th chart drawn?
      // log(`check for chart ${idToSeek}`);
      const elts: WebElement[] = await driver.findElements({ id: chartID });
      expect(elts.length === 1).toBe(true);
      expect(elts[0] !== undefined).toBe(true);

      await cleanUpWork(driver, testDataModelName);

      resolve();
    }));

  it('Check asset chart data extends with bigger roi', async done => {
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

  it('Check coarse, categorised, chart data view', async done => {
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

  it('Check fine, uncategorised, chart data view', async done => {
    if (!doActions) {
      done();
      return;
    }

    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    const forSubmission = {
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

  it('Coarse asset view for cash asset, vals, +, -, +- view', async done => {
    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    // existing value for singleAssetName was allAssets;
    // now overwrite that for cash
    let forSubmission = {
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

  it('Fine asset view for selected category, vals', async done => {
    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    let forSubmission = {
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

  it('Navigate headers', async done => {
    //log(`navigate headers test`);
    if (!doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    let btn = await driver.findElements(webdriver.By.id('btn-Home'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Overview'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Dates'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Incomes'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Expenses'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Assets'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Transactions'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Tax'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

    btn = await driver.findElements(webdriver.By.id('btn-Settings'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();

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
