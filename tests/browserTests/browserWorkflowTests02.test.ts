import { TestModel01 } from "../../localization/stringConstants";
import { showObj } from "../../utils/utils";
import {
  getDriver,
  beforeAllWork,
  cleanUpWork,
  clickButton,
  getDataDumpFromPage,
} from "./browserBaseTypes";
import { quitAfterAll, testModelCreation } from "./browserTestUtils";

showObj;

describe("BrowserWorkflowTests 02", () => {
  const driver = getDriver();
  jest.setTimeout(90000); // allow time for all these tests to run

  it("should create examples", async () => {
    const testDataModelName = "testName03";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(
      driver,
      "btn-create-Simple-example",
      testDataModelName,
      "should create examples",
    );

    await clickButton(driver, `btn-overview-${testDataModelName}`);

    let data = await getDataDumpFromPage(driver, "reportTable");
    /*
    // The report table contents depends upon "today"
    // Do not expect consistent results from one day to the next

    expect(data.length).toBe(40);
    expect(data[0]).toEqual({
      DATE: '06 Jan 2026',
      NAME: 'Cash',
      CHANGE: '397.82',
      OLD_VALUE: '-316062.29',
      NEW_VALUE: '-315664.47',
      QCHANGE: '',
      QOLD_VALUE: '',
      QNEW_VALUE: '',
      SOURCE: 'growth',
      index: 0,
    });
    expect(data[39]).toEqual({
      CHANGE: '406.23',
      DATE: '06 Apr 2023',
      NAME: 'Cash',
      NEW_VALUE: '-322338.08',
      OLD_VALUE: '-322744.31',
      QCHANGE: '',
      QNEW_VALUE: '',
      QOLD_VALUE: '',
      SOURCE: 'growth',
      index: 39,
    });
    */
    data = await getDataDumpFromPage(driver, "settingsTable");
    expect(data.length).toBe(32);
    expect(data[0]).toEqual({
      NAME: "View frequencyTransactions",
      TODAYSVALUE: "undefined",
      VALUE: "Annually",
      index: 0,
      HINT: "",
      ERA: 0,
    });
    expect(data[4]).toEqual({
      NAME: "View frequencyOverview",
      TODAYSVALUE: "undefined",
      VALUE: "Annually",
      index: 4,
      HINT: "",
      ERA: 0,
    });
    data = await getDataDumpFromPage(driver, "triggersTable");
    expect(data.length).toBe(3);
    expect(data[0]).toEqual({
      DATE: "01 Jan 2028",
      NAME: "TransferMortgage",
      index: 0,
      ERA: 0,
    });
    expect(data[2]).toEqual({
      DATE: "31 Dec 2025",
      NAME: "GetRidOfCar",
      index: 2,
      ERA: 0,
    });
    data = await getDataDumpFromPage(driver, "customTransactionsTable");

    expect(data.length).toBe(3);
    expect(data[0]).toEqual({
      CATEGORY: "",
      DATE: "TransferMortgage",
      ERA: 0,
      FROM: "EarlyMortgage",
      FROM_VALUE: "100%",
      NAME: "switchMortgage",
      RECURRENCE: "",
      STOP_DATE: "",
      TO: "LateMortgage",
      TO_VALUE: "100%",
      TYPE: "custom",
      index: 0,
    });
    expect(data[2]).toEqual({
      CATEGORY: "living costs",
      DATE: "January 2 2018",
      ERA: 0,
      FROM: "Cash",
      FROM_VALUE: "200",
      NAME: "Each month buy food",
      RECURRENCE: "1m",
      STOP_DATE: "",
      TO: "",
      TO_VALUE: "",
      TYPE: "custom",
      index: 2,
    });

    data = await getDataDumpFromPage(driver, "customTransactionsOverviewTable");

    expect(data.length).toBe(3);
    expect(data[0]).toEqual({
      CATEGORY: "",
      DATE: "TransferMortgage",
      ERA: 0,
      FROM: "EarlyMortgage",
      FROM_VALUE: "100%",
      NAME: "switchMortgage",
      RECURRENCE: "",
      STOP_DATE: "",
      TO: "LateMortgage",
      TO_VALUE: "100%",
      TYPE: "custom",
      index: 0,
    });
    expect(data[2]).toEqual({
      CATEGORY: "living costs",
      DATE: "January 2 2018",
      ERA: 0,
      FROM: "Cash",
      FROM_VALUE: "200",
      NAME: "Each month buy food",
      RECURRENCE: "1m",
      STOP_DATE: "",
      TO: "",
      TO_VALUE: "",
      TYPE: "custom",
      index: 2,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
