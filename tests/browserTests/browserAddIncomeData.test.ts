import {
  TestModel02,
  CASH_ASSET_NAME,
} from "../../localization/stringConstants";
import {
  addIncome,
  incomeInputs,
  clearIncomeFields,
  revalueIncome,
  clearRevalueIncomeFields,
  gotoTabPage,
  quitAfterAll,
  incomesTag,
  sleep,
} from "./browserTestUtils";
import {
  getDriver,
  beforeAllWork,
  clickButton,
  cleanUpWork,
  scrollIntoViewByID,
} from "./browserBaseTypes";

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

  it("should add data incomes", async () => {
    const testDataModelName = "BrowserAddDataTest02";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: "",
      message: `Income name should be non-empty`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      value: "",
      message: `Income value should be numerical or built from an Asset or setting`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      valuationDate: "",
      message: `Value set date should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growsWithInflation: "",
      message: `Grows with inflation '' should be a Y/N value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      startDate: "",
      message: `Start date '' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      endDate: "",
      message: `End date '' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      name: "javaJob2",
      liability: "",
      category: "",
      message: `added new income javaJob2`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: "javaJob3",
      liability: "Joe",
      category: "programming",
      message: `added new income javaJob3`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      value: "junkforvalue",
      message: `Income value junkforvalue should be numerical or built from an Asset or setting`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      valuationDate: "junkjunk",
      message: `Value set date should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      startDate: "junkjunk",
      message: `Start date 'junkjunk' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      endDate: "junkjunk",
      message: `End date 'junkjunk' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growsWithInflation: "junkjunk",
      message: `Grows with inflation 'junkjunk' should be a Y/N value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      name: "proportionOfAsset",
      value: `0.5${CASH_ASSET_NAME}`,
      growsWithInflation: "Y",
      message:
        `Income 'proportionOfAsset' value '0.5Cash' ` + `may not grow with CPI`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      name: "proportionOfAsset",
      value: `0.5${CASH_ASSET_NAME}`,
      category: "",
      message: "added new income proportionOfAsset",
    });

    await cleanUpWork(driver, testDataModelName);
  });

  it("should revalue incomes", async () => {
    const testDataModelName = "BrowserAddDataTest03";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`,
    });

    await scrollIntoViewByID(driver, `useRevalueInputsIncome`);
    await clickButton(driver, "useRevalueInputsIncome");

    const revalueInputs = {
      name: "javaJob1",
      revalue: "12500",
      revaluationDate: "1 Jan 2022",
    };
    await revalueIncome(driver, {
      ...revalueInputs,
      message: "added new data", // TODO "added revaluation of income",
    });

    await scrollIntoViewByID(driver, `useRevalueInputsIncome`);
    await clickButton(driver, "useRevalueInputsIncome");

    await revalueIncome(driver, {
      ...revalueInputs,
      revalue: "junk",
      message: "Income value junk should be a numerical or % value",
    });

    await clearRevalueIncomeFields(driver);
    await revalueIncome(driver, {
      ...revalueInputs,
      revaluationDate: "1 Jan 2020",
      message: `Transaction 'javaJob1 2' dated before start of affected income : 'javaJob1'`,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
