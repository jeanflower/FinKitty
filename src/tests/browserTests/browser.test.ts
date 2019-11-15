import { log } from '../../utils';
import {
  beforeAllWork,
  cleanUpWork,
  getAssetChartData,
  getDriver,
  getExpenseChartData,
  getIncomeChartData,
  shortSleep,
  sleep,
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
  separator,
  assetChartFocus,
  assetChartFocusHint,
  viewDetail,
  viewDetailHint,
} from '../../stringConstants';
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
  const headless = true;
  const quitAfterAll = true;
  // const headless = false;
  // const quitAfterAll = false;

  const driver = getDriver(headless); // one driver for all
  const debug = false;
  const testDataModelName = 'SeleniumTestData';

  it('Should load the home page and get title', () =>
    new Promise(async resolve => {
      const modelAndRoi = getTestModel01();
      await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

      // await sleep(dBSleep, 'set up tables');

      if (!doActions) {
        resolve();
        return;
      }

      const title = await driver.getTitle();
      expect(title).toEqual(`FinKitty`);
      await cleanUpWork(driver, testDataModelName);

      resolve();
    }));

  it('Check income chart attribute', async done => {
    if (doActions) {
      done();
      return;
    }
    const modelAndRoi = getTestModel01();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    // locate the asset text dump
    const divElement = await driver.findElement(
      webdriver.By.id('incomeDataDump'),
    );
    // extract the content
    const content = await divElement.getAttribute('value');
    // log(`content = ${content}`);
    // check the content matches our expectations
    const ary = JSON.parse(content);
    // writeTestCode(ary);

    if (ary.length !== 1) {
      log('BUG : unexpected data length');
      await sleep(100000, 'BUG : unexpected data length - expected one income');
    }

    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('Main income');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(1);
    expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[0].y).toEqual(39215.257112382584);
    expect(ary[0].dataPoints[0].ttip).toEqual('39215.26 at Tue Jan 01 2019');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

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
      await sleep(shortSleep, '--- after click Incomes');

      const chartID = 'canvasjs-react-chart-container-0';
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
    // log(`ary = ${showObj(ary)}`);

    // writeTestCode(ary);

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('TaxPot');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(3);
    expect(ary[0].dataPoints[0].label).toEqual('Thu Dec 01 2016');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Thu Dec 01 2016');
    expect(ary[0].dataPoints[1].label).toEqual('Sun Jan 01 2017');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[0].dataPoints[2].label).toEqual('Wed Feb 01 2017');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Wed Feb 01 2017');
    expect(ary[1].name).toEqual('Cash');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(3);
    expect(ary[1].dataPoints[0].label).toEqual('Thu Dec 01 2016');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Thu Dec 01 2016');
    expect(ary[1].dataPoints[1].label).toEqual('Sun Jan 01 2017');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[1].dataPoints[2].label).toEqual('Wed Feb 01 2017');
    expect(ary[1].dataPoints[2].y).toEqual(0);
    expect(ary[1].dataPoints[2].ttip).toEqual('0.00 at Wed Feb 01 2017');

    const forSubmission = {
      NAME: roiEnd,
      VALUE: '1 March 2018',
      HINT: roiEndHint,
    };
    await submitSettingChange(driver, testDataModelName, forSubmission);

    // sleep(2000, 'a bit of extra time');
    // log('submitted new roi setting');

    ary = await getAssetChartData(driver);
    if (debug) {
      writeTestCode(ary);
    }

    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('TaxPot');
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
    expect(ary[0].dataPoints[13].y).toEqual(0);
    expect(ary[0].dataPoints[13].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[14].label).toEqual('Thu Feb 01 2018');
    expect(ary[0].dataPoints[14].y).toEqual(0);
    expect(ary[0].dataPoints[14].ttip).toEqual('0.00 at Thu Feb 01 2018');
    expect(ary[1].name).toEqual('Cash');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(15);
    expect(ary[1].dataPoints[0].label).toEqual('Thu Dec 01 2016');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Thu Dec 01 2016');
    expect(ary[1].dataPoints[1].label).toEqual('Sun Jan 01 2017');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[1].dataPoints[2].label).toEqual('Wed Feb 01 2017');
    expect(ary[1].dataPoints[2].y).toEqual(0);
    expect(ary[1].dataPoints[2].ttip).toEqual('0.00 at Wed Feb 01 2017');
    expect(ary[1].dataPoints[3].label).toEqual('Wed Mar 01 2017');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Wed Mar 01 2017');
    expect(ary[1].dataPoints[4].label).toEqual('Sat Apr 01 2017');
    expect(ary[1].dataPoints[4].y).toEqual(0);
    expect(ary[1].dataPoints[4].ttip).toEqual('0.00 at Sat Apr 01 2017');
    expect(ary[1].dataPoints[5].label).toEqual('Mon May 01 2017');
    expect(ary[1].dataPoints[5].y).toEqual(0);
    expect(ary[1].dataPoints[5].ttip).toEqual('0.00 at Mon May 01 2017');
    expect(ary[1].dataPoints[6].label).toEqual('Thu Jun 01 2017');
    expect(ary[1].dataPoints[6].y).toEqual(0);
    expect(ary[1].dataPoints[6].ttip).toEqual('0.00 at Thu Jun 01 2017');
    expect(ary[1].dataPoints[7].label).toEqual('Sat Jul 01 2017');
    expect(ary[1].dataPoints[7].y).toEqual(0);
    expect(ary[1].dataPoints[7].ttip).toEqual('0.00 at Sat Jul 01 2017');
    expect(ary[1].dataPoints[8].label).toEqual('Tue Aug 01 2017');
    expect(ary[1].dataPoints[8].y).toEqual(0);
    expect(ary[1].dataPoints[8].ttip).toEqual('0.00 at Tue Aug 01 2017');
    expect(ary[1].dataPoints[9].label).toEqual('Fri Sep 01 2017');
    expect(ary[1].dataPoints[9].y).toEqual(0);
    expect(ary[1].dataPoints[9].ttip).toEqual('0.00 at Fri Sep 01 2017');
    expect(ary[1].dataPoints[10].label).toEqual('Sun Oct 01 2017');
    expect(ary[1].dataPoints[10].y).toEqual(0);
    expect(ary[1].dataPoints[10].ttip).toEqual('0.00 at Sun Oct 01 2017');
    expect(ary[1].dataPoints[11].label).toEqual('Wed Nov 01 2017');
    expect(ary[1].dataPoints[11].y).toEqual(0);
    expect(ary[1].dataPoints[11].ttip).toEqual('0.00 at Wed Nov 01 2017');
    expect(ary[1].dataPoints[12].label).toEqual('Fri Dec 01 2017');
    expect(ary[1].dataPoints[12].y).toEqual(0);
    expect(ary[1].dataPoints[12].ttip).toEqual('0.00 at Fri Dec 01 2017');
    expect(ary[1].dataPoints[13].label).toEqual('Mon Jan 01 2018');
    expect(ary[1].dataPoints[13].y).toEqual(-99);
    expect(ary[1].dataPoints[13].ttip).toEqual('-99.00 at Mon Jan 01 2018');
    expect(ary[1].dataPoints[14].label).toEqual('Thu Feb 01 2018');
    expect(ary[1].dataPoints[14].y).toEqual(-198.93939050052373);
    expect(ary[1].dataPoints[14].ttip).toEqual('-198.94 at Thu Feb 01 2018');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('Check coarse, categorised, chart data', async done => {
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

  it('Check fine, uncategorised, chart data', async done => {
    if (!doActions) {
      done();
      return;
    }
    await sleep(500, 'prep time...');

    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    const forSubmission = {
      NAME: viewDetail,
      VALUE: fine,
      HINT: viewDetailHint,
    };
    await submitSettingChange(driver, testDataModelName, forSubmission);

    let ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(4);
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
    expect(ary[2].name).toEqual('TaxPot');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(0);
    expect(ary[2].dataPoints[0].ttip).toEqual('0.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(0);
    expect(ary[2].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(0);
    expect(ary[2].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[3].name).toEqual('Cash');
    expect(ary[3].type).toEqual('stackedColumn');
    expect(ary[3].showInLegend).toEqual(true);
    expect(ary[3].dataPoints.length).toEqual(4);
    expect(ary[3].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[3].dataPoints[0].y).toEqual(494);
    expect(ary[3].dataPoints[0].ttip).toEqual('494.00 at Sun Apr 01 2018');
    expect(ary[3].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[3].dataPoints[1].y).toEqual(468);
    expect(ary[3].dataPoints[1].ttip).toEqual('468.00 at Tue May 01 2018');
    expect(ary[3].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[3].dataPoints[2].y).toEqual(442);
    expect(ary[3].dataPoints[2].ttip).toEqual('442.00 at Fri Jun 01 2018');
    expect(ary[3].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[3].dataPoints[3].y).toEqual(430);
    expect(ary[3].dataPoints[3].ttip).toEqual('430.00 at Sun Jul 01 2018');

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

  it('Coarse asset view for cash asset, vals, +, -, +-', async done => {
    const modelAndRoi = getModelCoarseAndFine();
    await beforeAllWork(driver, testDataModelName, modelAndRoi.model);

    // existing value for singleAssetName was allAssets;
    // now overwrite that for cash
    let forSubmission = {
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
      HINT: assetChartFocusHint,
    };

    await submitSettingChange(driver, testDataModelName, forSubmission);

    // await sleep(2000, 'extra');

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
    await submitSettingChange(driver, testDataModelName, forSubmission);

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(4);
    expect(ary[0].name).toEqual('PRn3' + separator + 'Cash');
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
    expect(ary[1].name).toEqual('PRn2' + separator + 'Cash');
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
    expect(ary[2].name).toEqual('PRn1' + separator + 'Cash');
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
    expect(ary[3].name).toEqual('Cash' + separator + 'Cash');
    expect(ary[3].type).toEqual('stackedColumn');
    expect(ary[3].showInLegend).toEqual(true);
    expect(ary[3].dataPoints.length).toEqual(4);
    expect(ary[3].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[3].dataPoints[0].y).toEqual(500);
    expect(ary[3].dataPoints[0].ttip).toEqual('500.00 at Sun Apr 01 2018');
    expect(ary[3].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[3].dataPoints[1].y).toEqual(0);
    expect(ary[3].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[3].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[3].dataPoints[2].y).toEqual(0);
    expect(ary[3].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[3].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[3].dataPoints[3].y).toEqual(0);
    expect(ary[3].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    forSubmission = {
      NAME: assetChartView,
      VALUE: assetChartReductions,
      HINT: assetChartFocusHint,
    };
    await submitSettingChange(driver, testDataModelName, forSubmission);

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('pet food' + separator + 'Cash');
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
    expect(ary[1].name).toEqual('broadband' + separator + 'Cash');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(-12);
    expect(ary[1].dataPoints[0].ttip).toEqual('-12.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(-12);
    expect(ary[1].dataPoints[1].ttip).toEqual('-12.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(-12);
    expect(ary[1].dataPoints[2].ttip).toEqual('-12.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('Phon' + separator + 'Cash');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(-12);
    expect(ary[2].dataPoints[0].ttip).toEqual('-12.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(-12);
    expect(ary[2].dataPoints[1].ttip).toEqual('-12.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(-12);
    expect(ary[2].dataPoints[2].ttip).toEqual('-12.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

    forSubmission = {
      NAME: assetChartView,
      VALUE: assetChartDeltas,
      HINT: assetChartFocusHint,
    };
    await submitSettingChange(driver, testDataModelName, forSubmission);

    ary = await getAssetChartData(driver);
    // writeTestCode(ary);

    expect(ary.length).toEqual(7);
    expect(ary[0].name).toEqual('pet food' + separator + 'Cash');
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
    expect(ary[1].name).toEqual('broadband' + separator + 'Cash');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(4);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[1].dataPoints[0].y).toEqual(-12);
    expect(ary[1].dataPoints[0].ttip).toEqual('-12.00 at Sun Apr 01 2018');
    expect(ary[1].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(-12);
    expect(ary[1].dataPoints[1].ttip).toEqual('-12.00 at Tue May 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[1].dataPoints[2].y).toEqual(-12);
    expect(ary[1].dataPoints[2].ttip).toEqual('-12.00 at Fri Jun 01 2018');
    expect(ary[1].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[2].name).toEqual('Phon' + separator + 'Cash');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(4);
    expect(ary[2].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[2].dataPoints[0].y).toEqual(-12);
    expect(ary[2].dataPoints[0].ttip).toEqual('-12.00 at Sun Apr 01 2018');
    expect(ary[2].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[2].dataPoints[1].y).toEqual(-12);
    expect(ary[2].dataPoints[1].ttip).toEqual('-12.00 at Tue May 01 2018');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[2].dataPoints[2].y).toEqual(-12);
    expect(ary[2].dataPoints[2].ttip).toEqual('-12.00 at Fri Jun 01 2018');
    expect(ary[2].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[3].name).toEqual('PRn3' + separator + 'Cash');
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
    expect(ary[4].name).toEqual('PRn2' + separator + 'Cash');
    expect(ary[4].type).toEqual('stackedColumn');
    expect(ary[4].showInLegend).toEqual(true);
    expect(ary[4].dataPoints.length).toEqual(4);
    expect(ary[4].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[4].dataPoints[0].y).toEqual(10);
    expect(ary[4].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[4].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[4].dataPoints[1].y).toEqual(10);
    expect(ary[4].dataPoints[1].ttip).toEqual('10.00 at Tue May 01 2018');
    expect(ary[4].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[4].dataPoints[2].y).toEqual(10);
    expect(ary[4].dataPoints[2].ttip).toEqual('10.00 at Fri Jun 01 2018');
    expect(ary[4].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[4].dataPoints[3].y).toEqual(0);
    expect(ary[4].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[5].name).toEqual('PRn1' + separator + 'Cash');
    expect(ary[5].type).toEqual('stackedColumn');
    expect(ary[5].showInLegend).toEqual(true);
    expect(ary[5].dataPoints.length).toEqual(4);
    expect(ary[5].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[5].dataPoints[0].y).toEqual(10);
    expect(ary[5].dataPoints[0].ttip).toEqual('10.00 at Sun Apr 01 2018');
    expect(ary[5].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[5].dataPoints[1].y).toEqual(0);
    expect(ary[5].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[5].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[5].dataPoints[2].y).toEqual(0);
    expect(ary[5].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[5].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[5].dataPoints[3].y).toEqual(0);
    expect(ary[5].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');
    expect(ary[6].name).toEqual('Cash' + separator + 'Cash');
    expect(ary[6].type).toEqual('stackedColumn');
    expect(ary[6].showInLegend).toEqual(true);
    expect(ary[6].dataPoints.length).toEqual(4);
    expect(ary[6].dataPoints[0].label).toEqual('Sun Apr 01 2018');
    expect(ary[6].dataPoints[0].y).toEqual(500);
    expect(ary[6].dataPoints[0].ttip).toEqual('500.00 at Sun Apr 01 2018');
    expect(ary[6].dataPoints[1].label).toEqual('Tue May 01 2018');
    expect(ary[6].dataPoints[1].y).toEqual(0);
    expect(ary[6].dataPoints[1].ttip).toEqual('0.00 at Tue May 01 2018');
    expect(ary[6].dataPoints[2].label).toEqual('Fri Jun 01 2018');
    expect(ary[6].dataPoints[2].y).toEqual(0);
    expect(ary[6].dataPoints[2].ttip).toEqual('0.00 at Fri Jun 01 2018');
    expect(ary[6].dataPoints[3].label).toEqual('Sun Jul 01 2018');
    expect(ary[6].dataPoints[3].y).toEqual(0);
    expect(ary[6].dataPoints[3].ttip).toEqual('0.00 at Sun Jul 01 2018');

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
    await submitSettingChange(driver, testDataModelName, forSubmission);
    forSubmission = {
      NAME: assetChartFocus,
      VALUE: 'Accessible',
      HINT: assetChartFocusHint,
    };
    await submitSettingChange(driver, testDataModelName, forSubmission);
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

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

// todo next
// add +, -, +-
