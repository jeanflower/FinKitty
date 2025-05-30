import {
  MinimalModel,
  CASH_ASSET_NAME,
  BenAndJerryModel,
} from "../../localization/stringConstants";
import {
  addAsset,
  addDate,
  addDBPension,
  addDCPension,
  addDebt,
  addExpense,
  addIncome,
  addSetting,
  addTransaction,
  gotoTabPage,
  incomeInputs,
  quitAfterAll,
  sleep,
  datesTag,
  incomesTag,
  settingsTag,
  expensesTag,
  assetsTag,
  debtsTag,
  transactionsTag,
} from "./browserTestUtils";
import {
  getDriver,
  beforeAllWork,
  selectModel,
  calcSleep,
  clickButton,
  scrollIntoViewByID,
} from "./browserBaseTypes";
import webdriver from "selenium-webdriver";

const testName = "BrowserBenAndJerryTest";

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

  it("my first model browser test", async () => {
    // log(`go to ensure model ${modelName}`);

    await beforeAllWork(
      driver,
      testName,
      `{"testName":"${MinimalModel}"}`,
    );

    await sleep(
      1500, // was calcSleep twice
      "--- after browser loads URI",
    );

    // Handle errors around SSL certificates
    // push through "Advanced" and "Proceed"
    let x = await driver.findElements(webdriver.By.id("details-button"));
    if (x[0] !== undefined) {
      // console.log('found details button!');
      await x[0].click();
      x = await driver.findElements(webdriver.By.id("proceed-link"));
      if (x[0] !== undefined) {
        // console.log('found proceed link!');
        await x[0].click();
      }
    }

    const btnData = await driver.findElements(
      webdriver.By.id("buttonTestLogin"),
    );
    if (btnData[0] !== undefined) {
      await btnData[0].click();
    }

    await selectModel(driver, testName);
    await sleep(calcSleep, "--- after model selected");

    await gotoTabPage(driver, datesTag);

    await addDate(
      driver,
      "Jerry retires",
      "5/5/2030",
      "added important date OK",
    );

    await addDate(
      driver,
      "Ben retires",
      "28/7/2032",
      "added important date OK",
    );

    await addDate(
      driver,
      "Jerry state pension age",
      "5/5/2037",
      "added important date OK",
    );

    await addDate(
      driver,
      "Ben state pension age",
      "31/8/2040",
      "added important date OK",
    );

    await addDate(
      driver,
      "Downsize house",
      "28/2/2047",
      "added important date OK",
    );

    // Add incomes
    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      name: "Ben salary",
      value: "3470",
      valuationDate: "21/2/2020",
      startDate: "21/2/2020",
      endDate: "Ben retires",
      growsWithInflation: "Y",
      liability: "Ben",
      category: "Salary",
      message: `added new income ${"Ben salary"}`,
    });
    // log('done Ben salary');

    await gotoTabPage(driver, settingsTag);
    await addSetting(driver, {
      name: "Beginning of view range",
      value: "1 Jan 2020",
      message: "added new setting Beginning of view range",
    });

    await addSetting(driver, {
      name: "End of view range",
      value: "1 Jan 2069",
      message: "added new setting End of view range",
    });

    await gotoTabPage(driver, incomesTag);

    await gotoTabPage(driver, settingsTag);

    await gotoTabPage(driver, incomesTag);
    await gotoTabPage(driver, settingsTag);
    /*
    await addSetting(driver, {
      name: 'Date of birth',
      value: '31 August 1973',
      message: 'added new setting Date of birth',
    },
    pauseBeforeOK);
    await pauseForDemo();
*/

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      name: "Jerry salary",
      value: "2755",
      valuationDate: "21/2/2020",
      startDate: "21/2/2020",
      endDate: "Jerry retires",
      growsWithInflation: "Y",
      liability: "Jerry",
      category: "Salary",
      message: `added new income ${"Jerry salary"}`,
    });
    // log('done Jerry salary');

    await gotoTabPage(driver, expensesTag);

    await gotoTabPage(driver, datesTag);

    await addDate(driver, "Ben dies", "31/8/2068", "added important date OK");

    await addDate(driver, "Jerry dies", "5/5/2065", "added important date OK");

    await gotoTabPage(driver, incomesTag);

    await scrollIntoViewByID(driver, "useDBPInputs");
    //await driver.executeScript("window.scrollBy(0, -2000)");
    // console.log('click1');
    await clickButton(driver, "useDBPInputs");

    let DBPinputs = {
      name: "Ben state pension",
      value: "730",
      valuationDate: "21/02/2020",
      contributionsEndDate: "",
      startDate: "Ben state pension age",
      pensionEndOrTransferDate: "Ben dies", //31/8/2068
      transferredStopDate: "",
      incomeSource: "",
      contributionSSIncome: "",
      contributionAmountPensionIncome: "",
      incomeaccrual: "",
      transferName: "",
      transferProportion: "",
      incomeGrowth: "0",
      incomecpiGrows: "Y",
      liability: "Ben",
      category: "Pension",
    };

    await addDBPension(driver, {
      ...DBPinputs,
      message: "added new data", // TODO "added pension information",
    });
    // log('done Ben state pension');

    await scrollIntoViewByID(driver, "useDBPInputs");
    //await driver.executeScript("window.scrollBy(0, -2000)");
    // console.log('click2');
    await clickButton(driver, "useDBPInputs");

    DBPinputs = {
      name: "Jerry state pension",
      value: "730",
      valuationDate: "21/02/2020",
      contributionsEndDate: "",
      startDate: "Jerry state pension age",
      pensionEndOrTransferDate: "Jerry dies", //5/5/2065
      transferredStopDate: "",
      incomeSource: "",
      contributionSSIncome: "",
      contributionAmountPensionIncome: "",
      incomeaccrual: "",
      transferName: "",
      transferProportion: "",
      incomeGrowth: "0",
      incomecpiGrows: "Y",
      liability: "Jerry",
      category: "Pension",
    };

    await addDBPension(driver, {
      ...DBPinputs,
      message: "added new data", // TODO "added pension information",
    });
    // log('done Jerry state pension');

    DBPinputs = {
      name: "Jerry work",
      value: "2000",
      valuationDate: "21/02/2020",
      contributionsEndDate: "Jerry retires",
      startDate: "Jerry state pension age",
      pensionEndOrTransferDate: "Jerry dies",
      transferredStopDate: "Ben dies",
      incomeSource: "Jerry salary",
      contributionSSIncome: "N",
      contributionAmountPensionIncome: "0.05",
      incomeaccrual: "0.015",
      transferName: "Ben",
      transferProportion: "0.5",
      incomeGrowth: "0",
      incomecpiGrows: "Y",
      liability: "Jerry",
      category: "Pension",
    };
    await scrollIntoViewByID(driver, "useDBPInputs");
    //await driver.executeScript("window.scrollBy(0, -2000)");
    // console.log('click3');
    await clickButton(driver, "useDBPInputs");

    await addDBPension(driver, {
      ...DBPinputs,
      message: "added new data", // TODO "added pension information",
    });
    // log('done Jerry work');

    await gotoTabPage(driver, expensesTag);

    let expenseInputs = {
      name: "Basic expenses current house",
      value: "1850",
      valuationDate: "21/02/2020",
      startDate: "21/02/2020",
      endDate: "Downsize house",
      growsWithInflation: "Y",
      recurrence: "1m",
      category: "Basic",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Basic expenses working');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    expenseInputs = {
      name: "Basic expenses small house",
      value: "1600",
      valuationDate: "21/02/2020",
      startDate: "Downsize house",
      endDate: "Ben dies",
      growsWithInflation: "Y",
      recurrence: "1m",
      category: "Basic",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Basic expenses downsize');

    expenseInputs = {
      name: "Leisure expenses working",
      value: "1000",
      valuationDate: "21/02/2020",
      startDate: "21/02/2020",
      endDate: "Jerry retires",
      growsWithInflation: "Y",
      recurrence: "1m",
      category: "Leisure",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Leisure expenses working');

    // scrolling???
    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    await gotoTabPage(driver, datesTag);

    await addDate(
      driver,
      "Care costs start",
      "20/2/2060",
      "added important date OK",
    );

    await gotoTabPage(driver, expensesTag);

    expenseInputs = {
      name: "Leisure expenses retired",
      value: "2000",
      valuationDate: "21/02/2020",
      startDate: "Jerry retires",
      endDate: "Care costs start", // 20/2/2060
      growsWithInflation: "Y",
      recurrence: "1m",
      category: "Leisure",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Leisure expenses retired');

    // scrolling??

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    expenseInputs = {
      name: "Care costs",
      value: "3000",
      valuationDate: "21/02/2020",
      startDate: "Care costs start",
      endDate: "Ben dies",
      growsWithInflation: "Y",
      recurrence: "1m",
      category: "Care",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Care costs');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    // scrolling??

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    expenseInputs = {
      name: "House maintenance",
      value: "8000",
      valuationDate: "21/02/2020",
      startDate: "21/02/2020",
      endDate: "Care costs start",
      growsWithInflation: "Y",
      recurrence: "4y",
      category: "Major costs",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done House maintenance');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    expenseInputs = {
      name: "Replace car",
      value: "20000",
      valuationDate: "21/02/2020",
      startDate: "21/02/2025",
      endDate: "Care costs start",
      growsWithInflation: "Y",
      recurrence: "5y",
      category: "Major costs",
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Replace car');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    await gotoTabPage(driver, assetsTag);

    let assetInputs = {
      name: "House",
      value: "255000",
      quantity: "",
      category: "Property",
      startDate: "21/02/2020",
      growth: "2",
      growsWithInflation: "Y",
      liability: "",
      purchasePrice: "",
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done House');

    // scrolling??

    await driver.executeScript("window.scrollBy(0, -2500)");

    await clickButton(driver, "chooseAssetOrDebtChartSetting--asset-All");

    assetInputs = {
      name: "ISA",
      value: "9000",
      quantity: "",
      category: "Investment",
      startDate: "21/02/2020",
      growth: "4",
      growsWithInflation: "Y",
      liability: "",
      purchasePrice: "",
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done ISA');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    assetInputs = {
      name: "Jerry stocks",
      value: "25000",
      quantity: "",
      category: "Investment",
      startDate: "21/02/2020",
      growth: "4",
      growsWithInflation: "Y",
      liability: "Jerry",
      purchasePrice: "14000",
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done Jerry stocks');

    // scrolling??

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    let pensionInputs = {
      name: "Jerry Aegon",
      value: "56324",
      category: "Pension",
      startDate: "21/02/2020",
      growth: "4",
      growsWithCPI: "Y",
      contributionsStopDate: "",
      crystallizesDate: "Jerry retires",
      pensionEndOrTransferDate: "Jerry dies",
      contributionSSIncome: "N",
      incomeSource: "",
      contributionAmountPensionIncome: "0",
      employerContribution: "0",
      liability: "Jerry",
      transferName: "Ben",
    };

    await clickButton(driver, "useDCPInputs");
    await addDCPension(driver, {
      ...pensionInputs,
      message: "added assets and transactions",
    });
    // log('done Jerry Aegon');
    // scrolling??

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    pensionInputs = {
      name: "Ben Prudential",
      value: "45000",
      category: "Pension",
      startDate: "21/02/2020",
      growth: "4",
      growsWithCPI: "Y",
      contributionsStopDate: "Ben retires",
      crystallizesDate: "Ben retires",
      pensionEndOrTransferDate: "Ben dies",
      contributionSSIncome: "N",
      incomeSource: "Ben salary",
      contributionAmountPensionIncome: "0.06",
      employerContribution: "0.12",
      liability: "Ben",
      transferName: "Jerry",
    };

    await clickButton(driver, "useDCPInputs");
    await addDCPension(driver, {
      ...pensionInputs,
      message: "added assets and transactions",
    });
    // log('done Ben Prudential');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    await gotoTabPage(driver, debtsTag);

    let debtInputs = {
      name: "Mortgage",
      value: "150000",
      category: "Property",
      startDate: "21/02/2020",
      growth: "3.5",
      monthlyRepayment: "700",
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });

    // log('done Mortgage');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    debtInputs = {
      name: "Jerry loan",
      value: "5000",
      category: "",
      startDate: "21/02/2020",
      growth: "2.5",
      monthlyRepayment: "250",
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });
    // log('done Jerry loan');
    // scrolling??

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    debtInputs = {
      name: "Ben loan",
      value: "5000",
      category: "",
      startDate: "21/02/2020",
      growth: "0",
      monthlyRepayment: "500",
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });
    // log('done Ben loan');

    await driver.executeScript("window.scrollBy(0, -100)"); // Adjust scrolling with a negative value here

    await gotoTabPage(driver, transactionsTag);
    let transactionInputs = {
      name: "Downsize house",
      startDate: "Downsize house",
      fromAsset: "House",
      toAsset: CASH_ASSET_NAME,
      reduction: "40%",
      addition: "87.5%",
      recurrence: "",
      liquidateForCash: "N",
      endDate: "",
      category: "",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Downsize house');

    transactionInputs = {
      name: "Sell ISAs for cash",
      startDate: "21/02/2020",
      fromAsset: "ISA",
      toAsset: CASH_ASSET_NAME,
      reduction: "500",
      addition: "100%",
      recurrence: "1m",
      liquidateForCash: "Y",
      endDate: "",
      category: "Cashflow",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell ISAs for cash');

    transactionInputs = {
      name: "Sell stocks for cash",
      startDate: "21/02/2020",
      fromAsset: "Jerry stocks",
      toAsset: CASH_ASSET_NAME,
      reduction: "500",
      addition: "100%",
      recurrence: "1m",
      liquidateForCash: "Y",
      endDate: "",
      category: "Cashflow",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell stocks for cash');

    transactionInputs = {
      name: "Sell AegonTaxFree",
      startDate: "21/02/2020",
      fromAsset: "Jerry AegonTaxFree",
      toAsset: CASH_ASSET_NAME,
      reduction: "250",
      addition: "100%",
      recurrence: "1m",
      liquidateForCash: "Y",
      endDate: "",
      category: "Cashflow",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell AegonTaxFree');

    transactionInputs = {
      name: "Sell PrudentialTaxFree ",
      startDate: "21/02/2020",
      fromAsset: "Ben PrudentialTaxFree",
      toAsset: CASH_ASSET_NAME,
      reduction: "250",
      addition: "100%",
      recurrence: "1m",
      liquidateForCash: "Y",
      endDate: "",
      category: "Cashflow",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell PrudentialTaxFree');

    transactionInputs = {
      name: "Sell CrystallizedPensionJerry ",
      startDate: "21/02/2020",
      fromAsset: "CrystallizedPensionJerry",
      toAsset: CASH_ASSET_NAME,
      reduction: "1000",
      addition: "100%",
      recurrence: "1m",
      liquidateForCash: "Y",
      endDate: "",
      category: "Cashflow",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell CrystallizedPensionJerry');

    transactionInputs = {
      name: "Sell CrystallizedPensionBen ",
      startDate: "21/02/2020",
      fromAsset: "CrystallizedPensionBen",
      toAsset: CASH_ASSET_NAME,
      reduction: "1000",
      addition: "100%",
      recurrence: "1m",
      liquidateForCash: "Y",
      endDate: "",
      category: "Cashflow",
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell CrystallizedPensionBen');
  });

  it("should browse Ben and Jerry model", async () => {
    const testDataModelName = "Ben and Jerry";

    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${BenAndJerryModel}"}`,
    );

    await gotoTabPage(driver, settingsTag);

    await driver.executeScript("window.scrollBy(0, -500)"); // Adjust scrolling with a negative value here

    for (let i = 0; i < 2; i = i + 1) {
      await gotoTabPage(driver, expensesTag);
      await gotoTabPage(driver, incomesTag);
      await clickButton(driver, "chooseViewDetailTypeTotalled");
      await clickButton(driver, "select-Pension");
      await clickButton(driver, "select-Salary");
      await clickButton(driver, "select-All");
      await clickButton(driver, "select-Ben salary");
      await clickButton(driver, "select-Jerry salary");
      await clickButton(driver, "chooseViewDetailTypeDetailed");
      await clickButton(driver, "select-Pension");
      await clickButton(driver, "select-Salary");
      await clickButton(driver, "select-All");
      await clickButton(driver, "select-Ben salary");
      await clickButton(driver, "select-Jerry salary");
    }
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
