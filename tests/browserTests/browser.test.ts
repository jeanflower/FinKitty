import { WebElement } from "selenium-webdriver";
import {
  TestModel01,
  FutureExpense,
  roiEnd,
  CoarseAndFine,
  ThreeChryslerModel,
  monitorModel1,
  monitorModel2,
} from "../../localization/stringConstants";
import {
  addSetting,
  assetsTag,
  addAsset,
  assetInputs,
  addTransaction,
  datesTag,
  expensesTag,
  gotoTabPage,
  homeTag,
  incomesTag,
  overviewTag,
  settingsTag,
  taxTag,
  transactionInputs,
  transactionsTag,
  quitAfterAll,
  reportTag,
  debtsTag,
} from "./browserTestUtils";
import {
  getDriver,
  beforeAllWork,
  cleanUpWork,
  clickButton,
  writeTestCode,
  getDataDumpFromPage,
  scrollIntoViewByID,
} from "./browserBaseTypes";

import webdriver from "selenium-webdriver";

writeTestCode;

const testName = "BrowserTestSimple";

let alreadyRunning = false;

describe(testName, () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver();
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;
  jest.setTimeout(200000); // allow time for all these tests to run

  it("should load the home page and get title", async () => {
    const testDataModelName = "BrowserTestSimple01";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    const title = await driver.getTitle();
    expect(title).toEqual(`FinKitty`);

    await cleanUpWork(driver, testDataModelName);
  });

  // the page should include a chart
  // (maybe not visible, but loaded in the document)
  it("should show a chart", () =>
    new Promise<void>(async (resolve) => {
      const testDataModelName = "BrowserTestSimple02";
      await beforeAllWork(
        driver,
        testDataModelName,
        `{"testName":"${TestModel01}"}`,
      );

      await gotoTabPage(driver, incomesTag);

      let foundChart = false;
      let chartNumber = 0;
      while (chartNumber < 15) {
        const chartID = `chart-container-${chartNumber}`; // nth chart drawn?
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

  it("should show asset chart data extends with bigger roi", async () => {
    const testDataModelName = "BrowserTestSimple03";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${FutureExpense}"}`,
    );

    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");

    let ary = await getDataDumpFromPage(driver, "assetChart");
    // console.log(`ary = ${JSON.stringify(ary)}`);

    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(3);
    expect(ary.labels[0]).toEqual("Thu Dec 01 2016");
    expect(ary.labels[1]).toEqual("Sun Jan 01 2017");
    expect(ary.labels[2]).toEqual("Wed Feb 01 2017");
    expect(ary.datasets.length).toEqual(0);

    await gotoTabPage(driver, settingsTag);
    await addSetting(driver, {
      name: roiEnd,
      value: "1 March 2018",
      message: "added new setting End of view range",
    });
    await gotoTabPage(driver, assetsTag);

    // log('submitted new roi setting');

    ary = await getDataDumpFromPage(driver, "assetChart");
    // console.log(`ary = ${JSON.stringify(ary)}`);

    //if (debug) {
    //  writeTestCode(ary);
    //}

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Thu Dec 01 2016");
    expect(ary.labels[1]).toEqual("Sun Jan 01 2017");
    expect(ary.labels[2]).toEqual("Wed Feb 01 2017");
    expect(ary.labels[3]).toEqual("Wed Mar 01 2017");
    expect(ary.labels[4]).toEqual("Sat Apr 01 2017");
    expect(ary.labels[5]).toEqual("Mon May 01 2017");
    expect(ary.labels[6]).toEqual("Thu Jun 01 2017");
    expect(ary.labels[7]).toEqual("Sat Jul 01 2017");
    expect(ary.labels[8]).toEqual("Tue Aug 01 2017");
    expect(ary.labels[9]).toEqual("Fri Sep 01 2017");
    expect(ary.labels[10]).toEqual("Sun Oct 01 2017");
    expect(ary.labels[11]).toEqual("Wed Nov 01 2017");
    expect(ary.labels[12]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[13]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[14]).toEqual("Thu Feb 01 2018");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("Cash");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(-99, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(-198, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("should show coarse, categorised, chart data view", async () => {
    const testDataModelName = "BrowserTestSimple04";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");
    await clickButton(driver, "chooseViewDetailTypeCategorised");

    let ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual("Accessible");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(494, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(468, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(942, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(930, 2);
    expect(ary.datasets[1].label).toEqual("stocks");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(500, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(500, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(500, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(500, 2);

    await gotoTabPage(driver, expensesTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    ary = await getDataDumpFromPage(driver, "expenseChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual('Sun Apr 01 2018');
    expect(ary.labels[1]).toEqual('Tue May 01 2018');
    expect(ary.labels[2]).toEqual('Fri Jun 01 2018');
    expect(ary.labels[3]).toEqual('Sun Jul 01 2018');
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual('broadband');
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(12, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(12, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(12, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].label).toEqual('pet food');
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(12, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(12, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(12, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(12, 6);
    expect(ary.datasets[2].label).toEqual('Phon');
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(12, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(12, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(12, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 6);

    await clickButton(driver, "chooseViewDetailTypeCategorised");

    ary = await getDataDumpFromPage(driver, "expenseChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual("comms");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(24, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(24, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(24, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("pet food");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(12, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(12, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(12, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(12, 2);

    await gotoTabPage(driver, incomesTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    ary = await getDataDumpFromPage(driver, "incomeChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual('Sun Apr 01 2018');
    expect(ary.labels[1]).toEqual('Tue May 01 2018');
    expect(ary.labels[2]).toEqual('Fri Jun 01 2018');
    expect(ary.labels[3]).toEqual('Sun Jul 01 2018');
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual('PRn1');
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(10, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].label).toEqual('PRn2');
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(10, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(10, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(10, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].label).toEqual('PRn3');
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(10, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 6);

    await clickButton(driver, "chooseViewDetailTypeCategorised");

    ary = await getDataDumpFromPage(driver, "incomeChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual("PaperRound");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(20, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(10, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(10, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("PRn3");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(10, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("should show fine, uncategorised, chart data view", async () => {
    const testDataModelName = "BrowserTestSimple05";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

    await gotoTabPage(driver, assetsTag);

    await scrollIntoViewByID(driver, "chooseViewDetailTypeDetailed");
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    await clickButton(driver, "chooseViewFrequencyTypeMonthly");

    let ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual("Cash");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(494, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(468, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(442, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(430, 2);
    expect(ary.datasets[1].label).toEqual("savings");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(500, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(500, 2);
    expect(ary.datasets[2].label).toEqual("stocks");
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(500, 2);
    expect(ary.datasets[2].data[1]).toBeCloseTo(500, 2);
    expect(ary.datasets[2].data[2]).toBeCloseTo(500, 2);
    expect(ary.datasets[2].data[3]).toBeCloseTo(500, 2);

    await gotoTabPage(driver, expensesTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    ary = await getDataDumpFromPage(driver, "expenseChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual("broadband");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(12, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(12, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(12, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("pet food");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(12, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(12, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(12, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(12, 2);
    expect(ary.datasets[2].label).toEqual("Phon");
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(12, 2);
    expect(ary.datasets[2].data[1]).toBeCloseTo(12, 2);
    expect(ary.datasets[2].data[2]).toBeCloseTo(12, 2);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 2);

    await gotoTabPage(driver, incomesTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    ary = await getDataDumpFromPage(driver, "incomeChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual("PRn1");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(10, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("PRn2");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(10, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(10, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(10, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].label).toEqual("PRn3");
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(10, 2);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("should show coarse asset view for cash asset, vals, delta view", async () => {
    const testDataModelName = "BrowserTestSimple06";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

    // existing value for singleAssetName was allAssets;
    // now overwrite that for cash

    await gotoTabPage(driver, assetsTag);

    await scrollIntoViewByID(
      driver,
      "chooseAssetOrDebtChartSetting--asset-All",
    );
    await clickButton(driver, "chooseAssetOrDebtChartSetting--asset-All");

    await scrollIntoViewByID(
      driver,
      "chooseAssetOrDebtChartSetting--asset-Cash",
    );
    await clickButton(driver, "chooseAssetOrDebtChartSetting--asset-Cash");

    await clickButton(driver, "chooseViewFrequencyTypeMonthly");

    await clickButton(driver, "chooseViewDetailTypeCategorised");

    let ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("Accessible");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(494, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(468, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(442, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(430, 2);

    await scrollIntoViewByID(driver, "chooseAssetChartType+");
    await clickButton(driver, "chooseAssetChartType+");

    ary = await getDataDumpFromPage(driver, "assetChart");

    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual("Accessible/Accessible");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(500, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("PaperRound/Accessible");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(20, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(10, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(10, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].label).toEqual("PRn3/Accessible");
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(10, 2);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 2);

    await scrollIntoViewByID(driver, "chooseAssetChartType-");
    await clickButton(driver, "chooseAssetChartType-");

    ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual("comms/Accessible");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(-24, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(-24, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(-24, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("pet food/Accessible");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(-12, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(-12, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(-12, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(-12, 2);

    await scrollIntoViewByID(driver, "chooseAssetChartType+-");
    await clickButton(driver, "chooseAssetChartType+-");

    ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(5);
    expect(ary.datasets[0].label).toEqual("Accessible/Accessible");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(500, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].label).toEqual("comms/Accessible");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(-24, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(-24, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(-24, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].label).toEqual("PaperRound/Accessible");
    expect(ary.datasets[2].data.length).toEqual(4);
    expect(ary.datasets[2].data[0]).toBeCloseTo(20, 2);
    expect(ary.datasets[2].data[1]).toBeCloseTo(10, 2);
    expect(ary.datasets[2].data[2]).toBeCloseTo(10, 2);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 2);
    expect(ary.datasets[3].label).toEqual("pet food/Accessible");
    expect(ary.datasets[3].data.length).toEqual(4);
    expect(ary.datasets[3].data[0]).toBeCloseTo(-12, 2);
    expect(ary.datasets[3].data[1]).toBeCloseTo(-12, 2);
    expect(ary.datasets[3].data[2]).toBeCloseTo(-12, 2);
    expect(ary.datasets[3].data[3]).toBeCloseTo(-12, 2);
    expect(ary.datasets[4].label).toEqual("PRn3/Accessible");
    expect(ary.datasets[4].data.length).toEqual(4);
    expect(ary.datasets[4].data[0]).toBeCloseTo(10, 2);
    expect(ary.datasets[4].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[4].data[2]).toBeCloseTo(0, 2);
    expect(ary.datasets[4].data[3]).toBeCloseTo(0, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("should show fine asset view for selected category, vals", async () => {
    const testDataModelName = "BrowserTestSimple07";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${CoarseAndFine}"}`,
    );

    await gotoTabPage(driver, assetsTag);

    await scrollIntoViewByID(
      driver,
      "chooseAssetOrDebtChartSetting--asset-All",
    );
    await clickButton(driver, "chooseAssetOrDebtChartSetting--asset-All");

    await scrollIntoViewByID(
      driver,
      "chooseAssetOrDebtChartSetting--asset-Accessible",
    );
    await clickButton(
      driver,
      "chooseAssetOrDebtChartSetting--asset-Accessible",
    );

    await scrollIntoViewByID(driver, "chooseViewDetailTypeDetailed");
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    await clickButton(driver, "chooseViewFrequencyTypeMonthly");

    const ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(4);
    expect(ary.labels[0]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[1]).toEqual("Tue May 01 2018");
    expect(ary.labels[2]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[3]).toEqual("Sun Jul 01 2018");
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual("Cash");
    expect(ary.datasets[0].data.length).toEqual(4);
    expect(ary.datasets[0].data[0]).toBeCloseTo(494, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(468, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(442, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(430, 2);
    expect(ary.datasets[1].label).toEqual("savings");
    expect(ary.datasets[1].data.length).toEqual(4);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(500, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(500, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("should navigate headers", async () => {
    //log(`navigate headers test`);
    const testDataModelName = "should navigate headers test";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await gotoTabPage(driver, homeTag);
    await gotoTabPage(driver, overviewTag);
    await gotoTabPage(driver, incomesTag);
    await gotoTabPage(driver, expensesTag);
    await gotoTabPage(driver, assetsTag);
    await gotoTabPage(driver, debtsTag);
    await gotoTabPage(driver, taxTag);
    await gotoTabPage(driver, datesTag);
    await gotoTabPage(driver, transactionsTag);
    await gotoTabPage(driver, reportTag);

    await gotoTabPage(driver, settingsTag);

    await cleanUpWork(driver, testDataModelName);
  });

  it("more crysler work with various values and adjustments", async () => {
    const testDataModelName = "BrowserTestSimple09";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${ThreeChryslerModel}"}`,
    );

    await gotoTabPage(driver, settingsTag);
    await addSetting(driver, {
      name: roiEnd,
      value: "1 March 2019",
      message: `added new setting ${roiEnd}`,
    });

    await gotoTabPage(driver, assetsTag);

    await clickButton(driver, "chooseViewFrequencyTypeMonthly");

    await addAsset(driver, {
      ...assetInputs,
      name: "carTest1",
      startDate: "January 2 2018",
      value: "chrysler",
      growth: "0.0",
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: "carTest2",
      startDate: "January 2 2018",
      value: "twoChryslers",
      growth: "0.0",
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: "carTest3",
      startDate: "January 2 2018",
      value: "chrysler",
      growth: "0.0",
      quantity: "2",
      message: `added new asset`,
    });
    await addAsset(driver, {
      ...assetInputs,
      name: "carTest4",
      startDate: "January 2 2018",
      value: "twoChryslers",
      growth: "0.0",
      quantity: "2",
      message: `added new asset`,
    });
    //await clickButton(driver, 'startNewModel2');
    //driver.switchTo().alert().sendKeys('banana');

    await gotoTabPage(driver, homeTag);

    // scrolling
    await driver.executeScript("window.scrollBy(0, -1000)");
    await clickButton(driver, "btn-check");

    const label = await driver.findElements(webdriver.By.id("pageTitle"));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();
    expect(labelText).toBe(`model check all good`);

    await clickButton(driver, "btn-clear-alert");

    // TODO edit model to make it fail check (e.g. edit value of
    // chrysler setting)

    await gotoTabPage(driver, transactionsTag);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "Revalue USD",
      startDate: "January 2 2018",
      fromAsset: "",
      toAsset: "USD",
      reduction: "",
      addition: "105%",
      recurrence: "1m",
      category: "currency trend",
      message: `added new transaction`,
    });

    // scrolling

    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    const ary = await getDataDumpFromPage(driver, "assetChart");
    // log(`ary = ${showObj(ary)}`);

    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[1]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[2]).toEqual("Thu Feb 01 2018");
    expect(ary.labels[3]).toEqual("Thu Mar 01 2018");
    expect(ary.labels[4]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[5]).toEqual("Tue May 01 2018");
    expect(ary.labels[6]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[7]).toEqual("Sun Jul 01 2018");
    expect(ary.labels[8]).toEqual("Wed Aug 01 2018");
    expect(ary.labels[9]).toEqual("Sat Sep 01 2018");
    expect(ary.labels[10]).toEqual("Mon Oct 01 2018");
    expect(ary.labels[11]).toEqual("Thu Nov 01 2018");
    expect(ary.labels[12]).toEqual("Sat Dec 01 2018");
    expect(ary.labels[13]).toEqual("Tue Jan 01 2019");
    expect(ary.labels[14]).toEqual("Fri Feb 01 2019");
    expect(ary.datasets.length).toEqual(5);
    expect(ary.datasets[0].label).toEqual("Cars");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(300, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(315, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(330.75, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(347.2875, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(364.6518750000001, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(382.8844687500001, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(402.0286921875001, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(422.1301267968752, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(443.23663313671886, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(465.3984647935549, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(488.66838803323265, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(513.1018074348942, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(538.756897806639, 2);
    expect(ary.datasets[1].label).toEqual("carTest1");
    expect(ary.datasets[1].data.length).toEqual(15);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[1].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[1].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[1].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[1].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[1].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[1].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[1].data[8]).toBeCloseTo(268.01912812500007, 2);
    expect(ary.datasets[1].data[9]).toBeCloseTo(281.4200845312501, 2);
    expect(ary.datasets[1].data[10]).toBeCloseTo(295.4910887578126, 2);
    expect(ary.datasets[1].data[11]).toBeCloseTo(310.26564319570326, 2);
    expect(ary.datasets[1].data[12]).toBeCloseTo(325.7789253554884, 2);
    expect(ary.datasets[1].data[13]).toBeCloseTo(342.0678716232628, 2);
    expect(ary.datasets[1].data[14]).toBeCloseTo(359.171265204426, 2);
    expect(ary.datasets[2].label).toEqual("carTest2");
    expect(ary.datasets[2].data.length).toEqual(15);
    expect(ary.datasets[2].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[2].data[2]).toBeCloseTo(400, 2);
    expect(ary.datasets[2].data[3]).toBeCloseTo(420, 2);
    expect(ary.datasets[2].data[4]).toBeCloseTo(441, 2);
    expect(ary.datasets[2].data[5]).toBeCloseTo(463.05000000000007, 2);
    expect(ary.datasets[2].data[6]).toBeCloseTo(486.2025000000001, 2);
    expect(ary.datasets[2].data[7]).toBeCloseTo(510.5126250000001, 2);
    expect(ary.datasets[2].data[8]).toBeCloseTo(536.0382562500001, 2);
    expect(ary.datasets[2].data[9]).toBeCloseTo(562.8401690625002, 2);
    expect(ary.datasets[2].data[10]).toBeCloseTo(590.9821775156252, 2);
    expect(ary.datasets[2].data[11]).toBeCloseTo(620.5312863914065, 2);
    expect(ary.datasets[2].data[12]).toBeCloseTo(651.5578507109768, 2);
    expect(ary.datasets[2].data[13]).toBeCloseTo(684.1357432465256, 2);
    expect(ary.datasets[2].data[14]).toBeCloseTo(718.342530408852, 2);
    expect(ary.datasets[3].label).toEqual("carTest3");
    expect(ary.datasets[3].data.length).toEqual(15);
    expect(ary.datasets[3].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[3].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[3].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[3].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[3].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[3].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[3].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[3].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[3].data[8]).toBeCloseTo(268.01912812500007, 2);
    expect(ary.datasets[3].data[9]).toBeCloseTo(281.4200845312501, 2);
    expect(ary.datasets[3].data[10]).toBeCloseTo(295.4910887578126, 2);
    expect(ary.datasets[3].data[11]).toBeCloseTo(310.26564319570326, 2);
    expect(ary.datasets[3].data[12]).toBeCloseTo(325.7789253554884, 2);
    expect(ary.datasets[3].data[13]).toBeCloseTo(342.0678716232628, 2);
    expect(ary.datasets[3].data[14]).toBeCloseTo(359.171265204426, 2);
    expect(ary.datasets[4].label).toEqual("carTest4");
    expect(ary.datasets[4].data.length).toEqual(15);
    expect(ary.datasets[4].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[4].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[4].data[2]).toBeCloseTo(400, 2);
    expect(ary.datasets[4].data[3]).toBeCloseTo(420, 2);
    expect(ary.datasets[4].data[4]).toBeCloseTo(441, 2);
    expect(ary.datasets[4].data[5]).toBeCloseTo(463.05000000000007, 2);
    expect(ary.datasets[4].data[6]).toBeCloseTo(486.2025000000001, 2);
    expect(ary.datasets[4].data[7]).toBeCloseTo(510.5126250000001, 2);
    expect(ary.datasets[4].data[8]).toBeCloseTo(536.0382562500001, 2);
    expect(ary.datasets[4].data[9]).toBeCloseTo(562.8401690625002, 2);
    expect(ary.datasets[4].data[10]).toBeCloseTo(590.9821775156252, 2);
    expect(ary.datasets[4].data[11]).toBeCloseTo(620.5312863914065, 2);
    expect(ary.datasets[4].data[12]).toBeCloseTo(651.5578507109768, 2);
    expect(ary.datasets[4].data[13]).toBeCloseTo(684.1357432465256, 2);
    expect(ary.datasets[4].data[14]).toBeCloseTo(718.342530408852, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("more crysler work with various doublings", async () => {
    const testDataModelName = "BrowserTestSimple10";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${ThreeChryslerModel}"}`,
    );

    await gotoTabPage(driver, settingsTag);
    await addSetting(driver, {
      name: roiEnd,
      value: "1 March 2019",
      message: "added new setting End of view range",
    });

    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewFrequencyTypeMonthly");

    await addAsset(driver, {
      ...assetInputs,
      name: "carTest1",
      startDate: "January 2 2018",
      value: "chrysler",
      message: `added new asset`,
      growth: "0.0",
    });

    await scrollIntoViewByID(
      driver,
      "chooseAssetOrDebtChartSetting--asset-All",
    );
    await clickButton(driver, "chooseAssetOrDebtChartSetting--asset-All");

    await scrollIntoViewByID(
      driver,
      "chooseAssetOrDebtChartSetting--asset-carTest1",
    );
    await clickButton(driver, "chooseAssetOrDebtChartSetting--asset-carTest1");

    /*
    await gotoTabPage(driver, settingsTag);
    await addSetting(driver, {
      name: assetChartFocus,
      value: 'carTest1',
      message: 'added new setting Focus of assets chart',
    });
    */

    //await clickButton(driver, 'startNewModel2');
    //driver.switchTo().alert().sendKeys('banana');

    await gotoTabPage(driver, homeTag);

    // scrolling
    await driver.executeScript("window.scrollBy(0, -1000)"); // Adjust scrolling with a negative value here

    await clickButton(driver, "btn-check");

    const label = await driver.findElements(webdriver.By.id("pageTitle"));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();
    expect(labelText).toBe(`model check all good`);

    await clickButton(driver, "btn-clear-alert");

    // TODO edit model to make it fail check (e.g. edit value of
    // chrysler setting)

    await gotoTabPage(driver, transactionsTag);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "Revalue USD",
      startDate: "January 2 2018",
      fromAsset: "",
      toAsset: "USD",
      reduction: "",
      addition: "105%",
      recurrence: "1m",
      category: "currency trend",
      message: `added new transaction`,
    });

    // scrolling
    
    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");

    let ary = await getDataDumpFromPage(driver, "assetChart");
    //log(`ary = ${showObj(ary)}`);

    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[1]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[2]).toEqual("Thu Feb 01 2018");
    expect(ary.labels[3]).toEqual("Thu Mar 01 2018");
    expect(ary.labels[4]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[5]).toEqual("Tue May 01 2018");
    expect(ary.labels[6]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[7]).toEqual("Sun Jul 01 2018");
    expect(ary.labels[8]).toEqual("Wed Aug 01 2018");
    expect(ary.labels[9]).toEqual("Sat Sep 01 2018");
    expect(ary.labels[10]).toEqual("Mon Oct 01 2018");
    expect(ary.labels[11]).toEqual("Thu Nov 01 2018");
    expect(ary.labels[12]).toEqual("Sat Dec 01 2018");
    expect(ary.labels[13]).toEqual("Tue Jan 01 2019");
    expect(ary.labels[14]).toEqual("Fri Feb 01 2019");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("carTest1");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(268.01912812500007, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(281.4200845312501, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(295.4910887578126, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(310.26564319570326, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(325.7789253554884, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(342.0678716232628, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(359.171265204426, 2);

    // log(`done first block of expectations`);

    await gotoTabPage(driver, settingsTag);
    await addSetting(driver, {
      name: "EUR",
      value: "1.1",
      message: "added new setting EUR",
    });

    await gotoTabPage(driver, transactionsTag);
    await addTransaction(driver, {
      ...transactionInputs,
      name: "Revalue carTest1 in Euros",
      startDate: "July 2 2018",
      fromAsset: "",
      toAsset: "carTest1",
      reduction: "",
      addition: "10EUR",
      recurrence: "",
      endDate: "",
      category: "car",
      message: `added new transaction`,
    });

    ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[1]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[2]).toEqual("Thu Feb 01 2018");
    expect(ary.labels[3]).toEqual("Thu Mar 01 2018");
    expect(ary.labels[4]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[5]).toEqual("Tue May 01 2018");
    expect(ary.labels[6]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[7]).toEqual("Sun Jul 01 2018");
    expect(ary.labels[8]).toEqual("Wed Aug 01 2018");
    expect(ary.labels[9]).toEqual("Sat Sep 01 2018");
    expect(ary.labels[10]).toEqual("Mon Oct 01 2018");
    expect(ary.labels[11]).toEqual("Thu Nov 01 2018");
    expect(ary.labels[12]).toEqual("Sat Dec 01 2018");
    expect(ary.labels[13]).toEqual("Tue Jan 01 2019");
    expect(ary.labels[14]).toEqual("Fri Feb 01 2019");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("carTest1");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(22, 2);

    // log(`done second block of expectations`);

    await gotoTabPage(driver, transactionsTag);
    await addTransaction(driver, {
      ...transactionInputs,
      name: "Revalue EUR",
      startDate: "August 1 2018",
      fromAsset: "",
      toAsset: "EUR",
      reduction: "",
      addition: "2.2",
      category: "car",
      message: `added new transaction`,
    });

    ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[1]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[2]).toEqual("Thu Feb 01 2018");
    expect(ary.labels[3]).toEqual("Thu Mar 01 2018");
    expect(ary.labels[4]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[5]).toEqual("Tue May 01 2018");
    expect(ary.labels[6]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[7]).toEqual("Sun Jul 01 2018");
    expect(ary.labels[8]).toEqual("Wed Aug 01 2018");
    expect(ary.labels[9]).toEqual("Sat Sep 01 2018");
    expect(ary.labels[10]).toEqual("Mon Oct 01 2018");
    expect(ary.labels[11]).toEqual("Thu Nov 01 2018");
    expect(ary.labels[12]).toEqual("Sat Dec 01 2018");
    expect(ary.labels[13]).toEqual("Tue Jan 01 2019");
    expect(ary.labels[14]).toEqual("Fri Feb 01 2019");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("carTest1");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(44, 2);

    // log(`done third block of expectations`);

    await gotoTabPage(driver, transactionsTag);
    await addTransaction(driver, {
      ...transactionInputs,
      name: "Revalue carTest1 doubles",
      startDate: "September 2 2018",
      fromAsset: "",
      toAsset: "carTest1",
      reduction: "",
      addition: "210%",
      recurrence: "",
      endDate: "",
      category: "car",
      message:
        `Transaction 'Revalue carTest1 doubles we dont allow ` +
        `a proportional transaction to a word-valued asset`,
    });

    ary = await getDataDumpFromPage(driver, "assetChart");
    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[1]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[2]).toEqual("Thu Feb 01 2018");
    expect(ary.labels[3]).toEqual("Thu Mar 01 2018");
    expect(ary.labels[4]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[5]).toEqual("Tue May 01 2018");
    expect(ary.labels[6]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[7]).toEqual("Sun Jul 01 2018");
    expect(ary.labels[8]).toEqual("Wed Aug 01 2018");
    expect(ary.labels[9]).toEqual("Sat Sep 01 2018");
    expect(ary.labels[10]).toEqual("Mon Oct 01 2018");
    expect(ary.labels[11]).toEqual("Thu Nov 01 2018");
    expect(ary.labels[12]).toEqual("Sat Dec 01 2018");
    expect(ary.labels[13]).toEqual("Tue Jan 01 2019");
    expect(ary.labels[14]).toEqual("Fri Feb 01 2019");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("carTest1");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(44, 2);

    // log(`done fourth block of expectations`);

    await gotoTabPage(driver, transactionsTag);
    await addTransaction(driver, {
      ...transactionInputs,
      name: "Revalue Euro doubles again",
      startDate: "October 2 2018",
      fromAsset: "",
      toAsset: "EUR",
      reduction: "",
      addition: "210%",
      recurrence: "",
      endDate: "",
      category: "car",
      message: `added new transaction`,
    });

    ary = await getDataDumpFromPage(driver, "assetChart");

    // writeTestCode(ary);

    expect(ary.labels.length).toEqual(15);
    expect(ary.labels[0]).toEqual("Fri Dec 01 2017");
    expect(ary.labels[1]).toEqual("Mon Jan 01 2018");
    expect(ary.labels[2]).toEqual("Thu Feb 01 2018");
    expect(ary.labels[3]).toEqual("Thu Mar 01 2018");
    expect(ary.labels[4]).toEqual("Sun Apr 01 2018");
    expect(ary.labels[5]).toEqual("Tue May 01 2018");
    expect(ary.labels[6]).toEqual("Fri Jun 01 2018");
    expect(ary.labels[7]).toEqual("Sun Jul 01 2018");
    expect(ary.labels[8]).toEqual("Wed Aug 01 2018");
    expect(ary.labels[9]).toEqual("Sat Sep 01 2018");
    expect(ary.labels[10]).toEqual("Mon Oct 01 2018");
    expect(ary.labels[11]).toEqual("Thu Nov 01 2018");
    expect(ary.labels[12]).toEqual("Sat Dec 01 2018");
    expect(ary.labels[13]).toEqual("Tue Jan 01 2019");
    expect(ary.labels[14]).toEqual("Fri Feb 01 2019");
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual("carTest1");
    expect(ary.datasets[0].data.length).toEqual(15);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 2);
    expect(ary.datasets[0].data[2]).toBeCloseTo(200, 2);
    expect(ary.datasets[0].data[3]).toBeCloseTo(210, 2);
    expect(ary.datasets[0].data[4]).toBeCloseTo(220.5, 2);
    expect(ary.datasets[0].data[5]).toBeCloseTo(231.52500000000003, 2);
    expect(ary.datasets[0].data[6]).toBeCloseTo(243.10125000000005, 2);
    expect(ary.datasets[0].data[7]).toBeCloseTo(255.25631250000006, 2);
    expect(ary.datasets[0].data[8]).toBeCloseTo(22, 2);
    expect(ary.datasets[0].data[9]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[10]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[11]).toBeCloseTo(44, 2);
    expect(ary.datasets[0].data[12]).toBeCloseTo(92.4, 2);
    expect(ary.datasets[0].data[13]).toBeCloseTo(92.4, 2);
    expect(ary.datasets[0].data[14]).toBeCloseTo(92.4, 2);

    await cleanUpWork(driver, testDataModelName);
  });

  it("should show monitoring data1", async () => {
    const testDataModelName = "ShowMonitoring1";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${monitorModel1}"}`,
    );

    await gotoTabPage(driver, assetsTag);

    let ary2 = await getDataDumpFromPage(driver, "expensesSummaryexpensesMonitoring2024Table");
    // console.log(`ary2 = ${JSON.stringify(ary2)}`);
    expect(ary2[0].key).toEqual('Basic');
    expect(ary2[0].actualSpend).toEqual('9');
    expect(ary2[0].allowedBudget).toEqual('150');
    expect(ary2[0].remainingBudget).toEqual('141');
    expect(ary2[0].proportion).toEqual('6');
    expect(ary2[1].key).toEqual('Leisure');
    expect(ary2[1].actualSpend).toEqual('12');
    expect(ary2[1].allowedBudget).toEqual('160');
    expect(ary2[1].remainingBudget).toEqual('148');
    expect(ary2[1].proportion).toEqual('8');
  });

  it("should show monitoring data2", async () => {
    const testDataModelName = "ShowMonitoring2";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${monitorModel2}"}`,
    );

    await gotoTabPage(driver, assetsTag);
    
    let ary2 = await getDataDumpFromPage(driver, "expensesSummaryexpensesMonitoring2024Table");
    // console.log(`ary2 = ${JSON.stringify(ary2)}`);
    expect(ary2[0].key).toEqual('Basics');
    expect(ary2[0].actualSpend).toEqual('0');
    expect(ary2[0].allowedBudget).toEqual("undefined");
    expect(ary2[0].remainingBudget).toEqual('NaN');
    expect(ary2[0].proportion).toEqual('');
    expect(ary2[1].key).toEqual('Leisure');
    expect(ary2[1].actualSpend).toEqual('0');
    expect(ary2[1].allowedBudget).toEqual('0');
    expect(ary2[1].remainingBudget).toEqual('0');
    expect(ary2[1].proportion).toEqual('');

    let ary3 = await getDataDumpFromPage(driver, "expensesDetailsexpensesMonitoringTable");
    expect(ary3.length).toEqual(3);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

// todo next
// add +, -, +-
