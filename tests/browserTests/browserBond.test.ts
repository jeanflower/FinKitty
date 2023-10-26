import { bondModel } from "../../localization/stringConstants";
import { gotoTabPage, quitAfterAll, transactionsTag } from "./browserTestUtils";
import {
  getDriver,
  beforeAllWork,
  cleanUpWork,
  getDataDumpFromPage,
} from "./browserBaseTypes";
import { showObj } from "../../utils/utils";
showObj;

const testName = "BrowserBondTest";

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

  it("Browser bond model", async () => {
    const testDataModelName = "BrowserTestSimple01";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${bondModel}"}`,
    );

    await gotoTabPage(driver, transactionsTag);

    const data = await getDataDumpFromPage(driver, "bondTransactionsTable");
    expect(data.length).toBe(10);
    expect(data[0]).toEqual({
      DATE: "1 Jan 2024",
      FROM: "Bond",
      FROM_VALUE: "BMVBondTargetValue2",
      NAME: "BondMature5y",
      TO: "Cash",
      TO_VALUE: "100%",
      STOP_DATE: "1 Jan 2030",
      RECURRENCE: "1y",
      TYPE: "bondMature",
      CATEGORY: "",
      index: 0,
      ERA: 0,
    });
    expect(data[1]).toEqual({
      CATEGORY: "",
      DATE: "1 Jan 2023",
      ERA: 0,
      FROM: "Bond",
      FROM_VALUE: "BMVBondTargetValue",
      NAME: "BondMature4y",
      RECURRENCE: "",
      STOP_DATE: "",
      TO: "Cash",
      TO_VALUE: "100%",
      TYPE: "bondMature",
      index: 1,
    });
    /*
    data = await getDataDumpFromPage(driver, 'bondTransactionsOverviewTable');
    expect(data.length).toBe(10);
    expect(data[0]).toEqual({
      DATE: '1 Jan 2024',
      FROM: 'Bond',
      FROM_VALUE: 'BMVBondTargetValue2',
      NAME: 'BondMature5y',
      TO: 'Cash',
      TO_VALUE: '100%',
      STOP_DATE: '1 Jan 2030',
      RECURRENCE: '1y',
      TYPE: 'bondMature',
      CATEGORY: '',
      index: 0,
    });
    expect(data[9]).toEqual({
      DATE: '1 Jan 2019',
      FROM: 'Cash',
      FROM_VALUE: 'BMVBondTargetValue',
      NAME: 'BondInvest1y',
      TO: 'Bond',
      TO_VALUE: '100%',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'bondInvest',
      CATEGORY: '',
      index: 9,
    });
    */
    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
