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

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
