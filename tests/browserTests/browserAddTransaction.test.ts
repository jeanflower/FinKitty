import { TestModel02 } from "../../localization/stringConstants";
import {
  addAsset,
  assetInputs,
  addTransaction,
  gotoTabPage,
  transactionInputs,
  clearTransactionFields,
  quitAfterAll,
  assetsTag,
  transactionsTag,
} from "./browserTestUtils";
import { getDriver, beforeAllWork, cleanUpWork } from "./browserBaseTypes";

const testName = "BrowserAddTransactionTest";

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
  jest.setTimeout(150000); // allow time for all these tests to run

  it("should do add transactions", async () => {
    const testDataModelName = "BrowserAddTransactionTest";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, assetsTag);

    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });

    await gotoTabPage(driver, transactionsTag);

    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });

    await addTransaction(driver, {
      ...transactionInputs,
      name: "",
      message: `Name should be not empty`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      startDate: "junk",
      message: `Transaction 'trans1' has bad date : \"junk\"`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "fromJunk",
      fromAsset: "junk",
      message: `added new transaction`,
    }); // BUG! ignores 'from'

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "toJunk",
      toAsset: "junk",
      message: `added new transaction`,
    }); // BUG! ignores 'to'

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      reduction: "junk",
      message: `Transaction 'trans1' 'from' value must be numbers or a setting, not 'junk'`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "fromAsPercentage",
      reduction: "90%",
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      addition: "junk",
      message: `Transaction 'trans1' to value 'junk' isn't a number or setting`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "toAsAbsolute",
      reduction: "90",
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "no recurrence",
      recurrence: "",
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      recurrence: "junk",
      message: `Transaction 'trans1' recurrence 'junk' must end in w, m or y`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      recurrence: "mmm",
      message: `Transaction 'trans1' recurrence 'mmm' must be a number ending in w, m or y`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "partMonths",
      recurrence: "5.5m",
      message: `added new transaction`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      liquidateForCash: "junk",
      message: `Whether we're keeping cash afloat should be 'y' or 'n'`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      liquidateForCash: "Y",
      message: `If we're liquidating assets to keep cash afloat, the TO asset should be CASH`,
    });

    await clearTransactionFields(driver);

    await addTransaction(driver, {
      ...transactionInputs,
      name: "junkEndDate",
      endDate: "junk",
      message: `Transaction 'junkEndDate' has bad stop date : "junk"`,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
