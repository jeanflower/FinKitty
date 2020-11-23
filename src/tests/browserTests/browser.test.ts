import { WebElement } from 'selenium-webdriver';
import {
  TestModel01,
  FutureExpense,
  roiEnd,
  CoarseAndFine,
  viewDetail,
  fine,
  assetChartFocus,
  CASH_ASSET_NAME,
  chartViewType,
  chartAdditions,
  chartReductions,
  chartDeltas,
  ThreeChryslerModel,
  allItems,
} from '../../localization/stringConstants';
import {
  headless,
  addSetting,
  addAsset,
  assetInputs,
  addTransaction,
  transactionInputs,
  quitAfterAll,
} from './browserTestUtils';
import {
  getDriver,
  beforeAllWork,
  cleanUpWork,
  clickButton,
  getAssetChartData,
  writeTestCode,
  getExpenseChartData,
  getIncomeChartData,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';

const debug = false;
const testDataModelName = 'BrowserTestSimple';

let alreadyRunning = false;

describe(testDataModelName, () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should load the home page and get title', () =>
    new Promise(async resolve => {
      await beforeAllWork(
        driver,
        testDataModelName,
        `{"testName":"${TestModel01}"}`,
      );

      const title = await driver.getTitle();
      expect(title).toEqual(`FinKitty`);
      await cleanUpWork(driver, testDataModelName);

      resolve();
    }));

  // the page should include a chart
  // (maybe not visible, but loaded in the document)
  it('should show a chart', () =>
    new Promise(async resolve => {
      await beforeAllWork(
        driver,
        testDataModelName,
        `{"testName":"${TestModel01}"}`,
      );

      await clickButton(driver, 'btn-Incomes');

      let foundChart = false;
      let chartNumber = 0;
      while (chartNumber < 15) {
        const chartID = `canvasjs-react-chart-container-${chartNumber}`; // nth chart drawn?
        // log(`check for chart ${chartID}`);
        const elts: WebElement[] = await driver.findElements({ id: chartID });
        if (elts.length === 1) {
          // log(`found chart ${chartNumber}`);
          expect(elts[0] !== undefined).toBe(true);
          foundChart = true;
          break;
        }
        chartNumber = chartNumber + 1;
      }
      expect(foundChart);

      await cleanUpWork(driver, testDataModelName);

      resolve();
    }));

  it('should show asset chart data extends with bigger roi', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${FutureExpense}"}`,
    );

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

  it('should show coarse, categorised, chart data view', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

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

  it('should show fine, uncategorised, chart data view', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

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

  it('should show coarse asset view for cash asset, vals, +, -, +- view', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

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
      name: chartViewType,
      value: chartAdditions,
      message: `added new setting ${chartViewType}`,
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
      name: chartViewType,
      value: chartReductions,
      message: `added new setting ${chartViewType}`,
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
      name: chartViewType,
      value: chartDeltas,
      message: `added new setting ${chartViewType}`,
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

  it('should show fine asset view for selected category, vals', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: viewDetail,
      value: fine,
      message: `added new setting ${viewDetail}`,
    });

    // log(`submitted model settings`);

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

  it('should navigate headers', async done => {
    //log(`navigate headers test`);
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

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

  it('more crysler work with various values and adjustments', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${ThreeChryslerModel}"}`,
    );

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
      growth: '0.0',
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest2',
      startDate: 'January 2 2018',
      value: 'twoChryslers',
      growth: '0.0',
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest3',
      startDate: 'January 2 2018',
      value: 'chrysler',
      growth: '0.0',
      quantity: '2',
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest4',
      startDate: 'January 2 2018',
      value: 'twoChryslers',
      growth: '0.0',
      quantity: '2',
      message: `added new asset`,
    });
    //await clickButton(driver, 'startNewModel2');
    //driver.switchTo().alert().sendKeys('banana');

    await clickButton(driver, 'btn-Home');

    // scrolling
    await driver.executeScript('window.scrollBy(0, -1000)'); // Adjust scrolling with a negative value here
    await clickButton(driver, 'btn-check');

    const label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();
    expect(labelText).toBe(`model check all good`);

    await clickButton(driver, 'btn-clear-alert');

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

    // scrolling

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
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${ThreeChryslerModel}"}`,
    );

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: roiEnd,
      value: '1 March 2019',
      message: 'added new setting End of view range',
    });

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      name: 'carTest1',
      startDate: 'January 2 2018',
      value: 'chrysler',
      message: `added new asset`,
      growth: '0.0',
    });

    await clickButton(driver, 'btn-Settings');

    await addSetting(driver, {
      name: assetChartFocus,
      value: 'carTest1',
      message: 'added new setting Focus of assets chart',
    });

    //await clickButton(driver, 'startNewModel2');
    //driver.switchTo().alert().sendKeys('banana');

    await clickButton(driver, 'btn-Home');

    // scrolling
    await driver.executeScript('window.scrollBy(0, -1000)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'btn-check');

    const label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();
    expect(labelText).toBe(`model check all good`);

    await clickButton(driver, 'btn-clear-alert');

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

    // scrolling

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

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

// todo next
// add +, -, +-
