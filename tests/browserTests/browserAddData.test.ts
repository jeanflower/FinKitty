import { TestModel02 } from "../../localization/stringConstants";
import {
  addDate,
  addAsset,
  assetInputs,
  clearAssetFields,
  clearRevalueAssetFields,
  addDebt,
  debtInputs,
  clearDebtFields,
  gotoTabPage,
  quitAfterAll,
  revalueAsset,
  overviewTag,
  datesTag,
  assetsTag,
  debtsTag,
} from "./browserTestUtils";
import {
  getDriver,
  beforeAllWork,
  clickButton,
  cleanUpWork,
} from "./browserBaseTypes";

import webdriver from "selenium-webdriver";

const testName = "BrowserAddDataTest";

let alreadyRunning = false;

describe(testName, () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver();
  }
  if (driverSimple === undefined) {
    return;
  }
  const driver = driverSimple;
  jest.setTimeout(200000); // allow time for all these tests to run

  it("should add data dates", async () => {
    const testDataModelName = "BrowserAddDataTest01";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, overviewTag);

    const label = await driver.findElements(webdriver.By.id("pageTitle"));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();

    expect(labelText).toBe(`${testDataModelName}`);

    await gotoTabPage(driver, datesTag);

    await addDate(driver, "testDate", "1 Jan 2020", "added important date OK");
    await addDate(
      driver,
      "testDate2",
      "junk",
      `Date 'testDate2' is not valid : 'junk'`,
    );
    await addDate(
      driver,
      // overwrites without qualms
      "testDate",
      "1 Jan 2021",
      "added important date OK",
    );
    await addDate(
      driver,
      "", // no name
      "1 Jan 2021",
      "Name should be not empty",
    );

    await cleanUpWork(driver, testDataModelName);
  });

  it("add asset", async () => {
    const testDataModelName = "BrowserAddDataTest06";
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

    await addAsset(driver, {
      ...assetInputs,
      name: "",
      message: `Name should be not empty`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      value: "",
      message: `Asset value should be a numerical value or built from a setting`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      quantity: "junk",
      message: `Quantity 'junk' should empty or a whole number value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      name: "twoItems",
      quantity: "2",
      message: `added new asset`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      startDate: "junk",
      message: `Start date 'junk' should be a date`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      growth: "junk",
      message: `Growth value 'junk' should be a numerical or setting value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      growsWithInflation: "junk",
      message: `Grows with CPI: 'junk' should be a Y/N value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      purchasePrice: "junk",
      message: `Asset 'hifi' purchase price 'junk' should be a numerical or setting value`,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  it("revalue assets", async () => {
    const testDataModelName = "BrowserAddDataTest07";
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

    await driver.executeScript("window.scrollBy(0, 1000)");
    await clickButton(driver, "revalueAssetInputs");

    const revalueInputs = {
      name: "hifi",
      revalue: "12500",
      revaluationDate: "1 Jan 2022",
    };
    await revalueAsset(driver, {
      ...revalueInputs,
      message: "added new data", // TODO "added revaluation of asset",
    });

    await driver.executeScript("window.scrollBy(0, 1000)");
    await clickButton(driver, "revalueAssetInputs");

    await revalueAsset(driver, {
      ...revalueInputs,
      revalue: "junk",
      message: "Asset value junk should be a numerical or % value",
    });

    await clearRevalueAssetFields(driver);
    await revalueAsset(driver, {
      ...revalueInputs,
      revaluationDate: "1 Jan 2020",
      message: `Transaction 'hifi 2' dated before start of affected asset : 'hifi'`,
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
  });

  it("add debts", async () => {
    const testDataModelName = "BrowserAddDataTest08";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, debtsTag);

    await addDebt(driver, {
      ...debtInputs,
      name: `debt1`,
      message: `added new debt and payment`,
    });

    await addDebt(driver, {
      ...debtInputs,
      name: "",
      message: `Name should be not empty`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      value: "",
      message: `Debt value should be a numerical value`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      startDate: "",
      message: `Start date '' should be a date`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      growth: "junk",
      message: `Growth value 'junk' should be a numerical value`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      monthlyRepayment: "junk",
      message: `Payment value 'junk' should be a numerical value`,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
