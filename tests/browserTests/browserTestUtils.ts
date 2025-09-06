import { ThenableWebDriver } from "selenium-webdriver";
import {
  clickButton,
  fillInputById,
  fillInputByName,
  scrollIntoViewByID,
  getDataDumpFromPage,
  makeTestCode,
} from "./browserBaseTypes";

import webdriver from "selenium-webdriver";
import { CASH_ASSET_NAME } from "../../localization/stringConstants";
import { log, printDebug } from "../../utils/utils";

// switch this value if you want to debug
// one of these tests and see the Chrome window
// stay alive
export const quitAfterAll = true;

export const homeTag = "btn-Home";
export const settingsTag = "btn-Settings";
export const transactionsTag = "btn-Transactions";
export const datesTag = "btn-Dates";
export const overviewTag = "btn-Overview";
export const expensesTag = "btn-Expenses";
export const incomesTag = "btn-Incomes";
export const assetsTag = "btn-Assets";
export const debtsTag = "btn-Debts";
export const taxTag = "btn-Tax";
export const monitoringTag = "btn-Monitoring"; 
export const reportTag = "btn-Asset actions";
export const optimizerTag = "btn-Optimizer";

export async function gotoTabPage(driver: ThenableWebDriver, tag: string) {
  // log(`go to tab page with tag = ${tag}`);
  await driver.executeScript("window.scrollBy(0, -4000)");
  const btn = await driver.findElements(webdriver.By.id(tag));
  // log(`btnMms.length = ${btnMms.length}`);
  expect(btn.length === 1).toBe(true);
  await btn[0].click();
}

export async function alertIsShowing(
  driver: webdriver.ThenableWebDriver,
): Promise<boolean> {
  try {
    await driver.switchTo().alert();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function acceptAnyAlert(
  driver: webdriver.ThenableWebDriver,
): Promise<boolean> {
  try {
    await driver.switchTo().alert().accept();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function dismissAnyAlert(
  driver: webdriver.ThenableWebDriver,
): Promise<boolean> {
  try {
    await driver.switchTo().alert().dismiss();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function consumeAlert(
  message: string,
  accept: boolean,
  driver: webdriver.ThenableWebDriver,
) {
  // log(`expect alert with message ${message}`);
  expect(await driver.switchTo().alert().getText()).toBe(message);
  if (accept) {
    await driver.switchTo().alert().accept();
  } else {
    await driver.switchTo().alert().dismiss();
  }
}

export async function deleteIfExists(
  name: string,
  driver: webdriver.ThenableWebDriver,
) {
  await gotoTabPage(driver, homeTag);
  // log(`delete ${name} if it exists...`);
  const btn = await driver.findElements(
    webdriver.By.id(`btn-overview-${name}`),
  );
  if (btn.length === 1) {
    // log(`${name} exists`);
    await driver.executeScript(
      `arguments[0].scrollIntoView({ block: 'center' });`,
      btn[0],
    );

    await sleep(100, `before selecting model ${name}`);
    await btn[0].click();
    await sleep(100, `after selecting model ${name}`);

    await acceptAnyAlert(driver);
    await gotoTabPage(driver, homeTag);

    await clickButton(driver, "btn-delete");
    await consumeAlert(
      `delete all data in model ${name} - you sure?`,
      true,
      driver,
    );
  } else {
    // log(`${name} didn't exist`);
  }
  await gotoTabPage(driver, homeTag);
}

export async function checkMessage(driver: ThenableWebDriver, message: string) {
  const label = await driver.findElements(webdriver.By.id("pageTitle"));
  expect(label.length === 1).toBe(true);
  const labelText = await label[0].getText();
  //log(`compare expected ${message} against found ${labelText}`);
  expect(labelText).toBe(message);

  const btn = await driver.findElements(webdriver.By.id("btn-clear-alert"));
  if (btn.length !== 0) {
    await btn[0].click();
  }
}

export async function addAsset(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string; // TODO why no valuation date?
    quantity: string;
    startDate: string;
    growth: string;
    growsWithInflation: string;
    liability: string;
    purchasePrice: string;
    message: string;
    category: string;
  },
) {
  await Promise.all([
    fillInputById(driver, "assetname", inputs.name),
    fillInputById(driver, "assetvalue", inputs.value),
    fillInputById(driver, "assetquantity", inputs.quantity),
    fillInputByName(driver, "start date", inputs.startDate),
    fillInputById(driver, "assetgrowth", inputs.growth),
    fillInputById(driver, "assetcpi-grows", inputs.growsWithInflation),
    fillInputById(driver, "liabilityCGT", inputs.liability),
    fillInputById(driver, "purchase", inputs.purchasePrice),
    fillInputById(driver, "assetcategory", inputs.category),
  ]);

  await driver.executeScript("window.scrollBy(0, 1000)");

  await clickButton(driver, "addAsset");
  // log(`added date`);

  await checkMessage(driver, inputs.message);
}

export const assetInputs = {
  name: "hifi",
  value: "2500",
  quantity: "2",
  category: "audio",
  startDate: "1 Jan 2021",
  growth: "2.0",
  growsWithInflation: "N",
  liability: "Joe",
  purchasePrice: "10",
};

export async function addIncome(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    valuationDate: string;
    startDate: string;
    endDate: string;
    growsWithInflation: string;
    liability: string;
    category: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, "incomename", inputs.name),
    fillInputByName(driver, "income valuation date", inputs.valuationDate),
    fillInputById(driver, "incomevalue", inputs.value),
    fillInputByName(driver, "income start date", inputs.startDate),
    fillInputByName(driver, "income end date", inputs.endDate),
    fillInputById(driver, "incomecpi-grows", inputs.growsWithInflation),
    fillInputById(driver, "taxable", inputs.liability),
    fillInputById(driver, "incomecategory", inputs.category),
  ]);

  await clickButton(driver, "addIncome");
  // log(`added date`);

  await checkMessage(driver, inputs.message);
}

export const incomeInputs = {
  name: "javaJob1",
  value: "2500",
  valuationDate: "1 Jan 2020",
  startDate: "1 Jan 2021",
  endDate: "1 Jan 2022",
  growth: "2.0",
  growsWithInflation: "N",
  liability: "Joe",
  category: "programming",
};

export async function addSetting(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, "settingname", inputs.name),
    fillInputById(driver, "settingvalue", inputs.value),
  ]);

  await clickButton(driver, "addSetting");

  await checkMessage(driver, inputs.message);
}

export async function clearIncomeFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('incomename');
  await clearInputByName('income valuation date');
  await clearInputById('incomevalue');
  await clearInputByName('income start date');
  await clearInputByName('income end date');
  await clearInputById('incomegrowth');
  await clearInputById('incomecpi-grows');
  await clearInputById('taxable');
  await clearInputById('incomecategory');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, incomesTag);
  return;
}

export async function addDBPension(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    valuationDate: string;
    contributionsEndDate: string;
    startDate: string;
    pensionEndOrTransferDate: string;
    transferredStopDate: string;
    incomeSource: string;
    contributionSSIncome: string;
    contributionAmountPensionIncome: string;
    incomeaccrual: string;
    transferName: string;
    transferProportion: string;
    incomecpiGrows: string;
    liability: string;
    category: string;
    message: string;
  },
): Promise<boolean> {
  await Promise.all([
    fillInputById(driver, "incomename", inputs.name),
    fillInputByName(driver, "income valuation date", inputs.valuationDate),
    fillInputById(driver, "incomevalue", inputs.value),
    fillInputByName(driver, "end date", inputs.contributionsEndDate),
    fillInputByName(driver, "pension start date", inputs.startDate),
    fillInputByName(
      driver,
      "pension end/transfer date",
      inputs.pensionEndOrTransferDate,
    ),
    fillInputByName(
      driver,
      "transferred stop date",
      inputs.transferredStopDate,
    ),
    fillInputByName(
      driver,
      "contributionSSIncome",
      inputs.contributionSSIncome,
    ),
    fillInputById(
      driver,
      "contributionAmountPensionIncome",
      inputs.contributionAmountPensionIncome,
    ),
    fillInputById(driver, "incomeaccrual", inputs.incomeaccrual),
    fillInputById(driver, "transferNameIncome", inputs.transferName),
    fillInputById(driver, "transferProportion", inputs.transferProportion),
    fillInputById(driver, "incomecpi-grows", inputs.incomecpiGrows),
    fillInputById(driver, "taxable", inputs.liability),
    fillInputById(driver, "incomecategory", inputs.category),
  ]);

  if (inputs.incomeSource !== "") {
    await fillInputById(
      driver,
      "fromIncomeSelectIncomeForm",
      inputs.incomeSource,
    );
  }

  await clickButton(driver, "addIncome");
  // log(`added date`);

  await checkMessage(driver, inputs.message);
  return true;
}

export async function clearPensionFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('incomename');
  await clearInputByName('income valuation date');
  await clearInputById('incomevalue');
  await clearInputByName('end date');
  await clearInputByName('pension start date');
  await clearInputByName('pension end/transfer date');
  await clearInputByName('transferred stop date');
  await clearInputById('fromIncomeSelectIncomeForm');
  await clearInputByName('contributionSSIncome');
  await clearInputById('contributionAmountPensionIncome');
  await clearInputById('incomeaccrual');
  await clearInputById('transferNameIncome');
  await clearInputById('transferProportion');
  await clearInputById('incomegrowth');
  await clearInputById('incomecpi-grows');
  await clearInputById('taxable');
  */
  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, incomesTag);
  await scrollIntoViewByID(driver, `useDBPInputs`);

  // console.log(`clicking...`);
  await clickButton(driver, "useDBPInputs");
  // console.log(`clicked...`);

  // log(`cleared ready for next pension inputs`);
  return;
}

export async function revalueIncome(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    revalue: string;
    revaluationDate: string;
    message: string;
  },
): Promise<boolean> {
  await Promise.all([
    fillInputById(driver, "incomenameselect", inputs.name),
    fillInputByName(driver, "income valuation date", inputs.revaluationDate),
    fillInputById(driver, "incomevalue", inputs.revalue),
  ]);

  await clickButton(driver, "revalueIncome");
  await checkMessage(driver, inputs.message);
  return true;
}

export async function clearRevalueIncomeFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('incomename');
  await clearInputByName('income valuation date');
  await clearInputById('incomevalue');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, incomesTag);
  await clickButton(driver, "useRevalueInputsIncome");

  return;
}

export async function addExpense(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    valuationDate: string;
    startDate: string;
    endDate: string;
    growsWithInflation: string;
    recurrence: string;
    category: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, "expensename", inputs.name),
    fillInputByName(driver, "expense valuation date", inputs.valuationDate),
    fillInputById(driver, "expensevalue", inputs.value),
    fillInputByName(driver, "start date", inputs.startDate),
    fillInputByName(driver, "end date", inputs.endDate),
    fillInputById(driver, "expensecpi-grows", inputs.growsWithInflation),
    fillInputById(driver, "expenserecurrence", inputs.recurrence),
    fillInputById(driver, "expensecategory", inputs.category),
  ]);

  await clickButton(driver, "addExpense");
  await checkMessage(driver, inputs.message);
}

export async function clearExpenseFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('expensename');
  await clearInputByName('expense valuation date');
  await clearInputById('expensevalue');
  await clearInputByName('start date');
  await clearInputByName('end date');
  await clearInputById('expensegrowth');
  await clearInputById('expensecpi-grows');
  await clearInputById('expenserecurrence');
  await clearInputById('expensecategory');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, expensesTag);
  return;
}

export async function revalueExpense(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    revalue: string;
    revaluationDate: string;
    message: string;
  },
): Promise<boolean> {
  await Promise.all([
    fillInputById(driver, "expensename", inputs.name),
    fillInputByName(driver, "expense valuation date", inputs.revaluationDate),
    fillInputById(driver, "expensevalue", inputs.revalue),
  ]);

  await clickButton(driver, "revalueExpense");
  await checkMessage(driver, inputs.message);
  return true;
}

export async function clearRevalueExpenseFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('expensename');
  await clearInputByName('expense valuation date');
  await clearInputById('expensevalue');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, expensesTag);
  await clickButton(driver, "useRevalueInputsExpense");

  return;
}

export const expenseInputs = {
  name: "broadband",
  value: "56.13",
  valuationDate: "1 Jan 2020",
  startDate: "1 Jan 2021",
  endDate: "1 Jan 2022",
  growth: "2.0",
  growsWithInflation: "N",
  recurrence: "1m",
  category: "connectivity",
};

export async function clearAssetFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('assetname');
  await clearInputById('assetvalue');
  await clearInputById('assetquantity');
  await clearInputByName('start date');
  await clearInputById('assetgrowth');
  await clearInputById('assetcpi-grows');
  await clearInputById('liabilityCGT');
  await clearInputById('assetcategory');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, assetsTag);
  return;
}

export async function revalueAsset(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    revalue: string;
    revaluationDate: string;
    message: string;
  },
): Promise<boolean> {
  await Promise.all([
    fillInputById(driver, "assetname", inputs.name),
    fillInputByName(driver, "start date", inputs.revaluationDate),
    fillInputById(driver, "assetvalue", inputs.revalue),
  ]);

  await clickButton(driver, "revalueAsset");
  await checkMessage(driver, inputs.message);
  return true;
}

export async function clearRevalueAssetFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('assetname');
  await clearInputByName('asset valuation date');
  await clearInputById('assetvalue');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, assetsTag);
  await clickButton(driver, "revalueAssetInputs");

  return;
}

export async function addDCPension(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    category: string; // TODO why so early?
    startDate: string;
    growth: string;
    growsWithCPI: string;
    contributionsStopDate: string;
    crystallizesDate: string;
    pensionEndOrTransferDate: string;
    contributionSSIncome: string;
    incomeSource: string;
    contributionAmountPensionIncome: string;
    employerContribution: string;
    liability: string;
    transferName: string;
    message: string;
  },
): Promise<boolean> {
  await Promise.all([
    fillInputById(driver, "assetname", inputs.name),
    fillInputByName(driver, "assetvalue", inputs.value),
    fillInputById(driver, "assetcategory", inputs.category),
    fillInputByName(driver, "start date", inputs.startDate),
    fillInputByName(driver, "assetgrowth", inputs.growth),
    fillInputByName(driver, "assetcpi-grows", inputs.growsWithCPI),
    fillInputByName(driver, "stop date", inputs.contributionsStopDate),
    fillInputByName(driver, "crystallize date", inputs.crystallizesDate),
    fillInputByName(
      driver,
      "transferred stop date",
      inputs.pensionEndOrTransferDate,
    ),
    fillInputById(driver, "contributionSSAsset", inputs.contributionSSIncome),
    fillInputById(
      driver,
      "contributionAmountPensionAsset",
      inputs.contributionAmountPensionIncome,
    ),
    fillInputById(driver, "contributionAmount", inputs.employerContribution),
    fillInputById(driver, "liabilityIC", inputs.liability),
    fillInputById(driver, "transferNameAsset", inputs.transferName),
  ]);

  if (inputs.incomeSource !== "") {
    await fillInputById(
      driver,
      "fromIncomeSelectAssetForm",
      inputs.incomeSource,
    );
  }

  await clickButton(driver, "addPension");

  await checkMessage(driver, inputs.message);
  return true;
}

export async function clearDCPension(driver: ThenableWebDriver): Promise<void> {
  /*
  await clearInputById('assetname');
  await clearInputByName('assetvalue');
  await clearInputById('assetcategory');
  await clearInputByName('start date');
  await clearInputByName('assetgrowth');
  await clearInputByName('assetcpi-grows');
  await clearInputByName('stop date');
  await clearInputByName('crystallize date');
  await clearInputByName('transferred stop date');
  await clearInputById('contributionSSAsset');
  if (inputs.incomeSource !== '') {
    await clearInputById('fromIncomeSelectAssetForm');
  }
  await clearInputById('contributionAmountPensionAsset');
  await clearInputById('contributionAmount');
  await clearInputById('liabilityIC');
  await clearInputById('transferNameAsset');

  await clickButton(driver, 'addPension');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, assetsTag);
  // need scroll?
  await clickButton(driver, "useDCPInputs");

  return;
}

export async function addTransaction(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    startDate: string;
    fromAsset: string;
    toAsset: string;
    reduction: string;
    addition: string;
    recurrence: string;
    liquidateForCash: string;
    endDate: string;
    category: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, "transactionname", inputs.name),
    fillInputByName(driver, "date", inputs.startDate),
    fillInputById(driver, "fromValue", inputs.reduction),
    fillInputById(driver, "toValue", inputs.addition),
    fillInputById(driver, "recurrence", inputs.recurrence),
    fillInputById(driver, "liquidateForCash", inputs.liquidateForCash),
    fillInputByName(driver, "stopDate", inputs.endDate),
    fillInputById(driver, "transactioncategory", inputs.category),
  ]);

  if (inputs.fromAsset !== "") {
    await fillInputById(driver, "fromAssetSelect", inputs.fromAsset);
  }
  if (inputs.toAsset !== "") {
    await fillInputById(driver, "toAssetSelect", inputs.toAsset);
  }

  await clickButton(driver, "addTransaction");
  await checkMessage(driver, inputs.message);
}

export async function clearTransactionFields(driver: ThenableWebDriver) {
  /*
  await fillInputById('transactionname', inputs.name);
  await fillInputByName('date', inputs.startDate);

  if (inputs.fromAsset !== '') {
    await fillInputById('fromAssetSelect', inputs.fromAsset);
  }
  if (inputs.toAsset !== '') {
    await fillInputById('toAssetSelect', inputs.toAsset);
  }
  await fillInputById('fromValue', inputs.reduction);
  await fillInputById('toValue', inputs.addition);
  await fillInputById('recurrence', inputs.recurrence);
  await fillInputById('liquidateForCash', inputs.liquidateForCash);
  await fillInputByName('stopDate', inputs.endDate);
  await fillInputById('transactioncategory', inputs.category);

  await clickButton(driver, 'addTransaction');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, transactionsTag);

  return;
}

export const transactionInputs = {
  name: "trans1",
  startDate: "1 Jan 2023",
  fromAsset: CASH_ASSET_NAME,
  toAsset: "hifi",
  reduction: "100",
  addition: "90%",
  recurrence: "1y",
  liquidateForCash: "N",
  endDate: "1 Jan 2027",
  category: "upgradeHifi",
};

export async function addDebt(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    category: string;
    startDate: string;
    growth: string;
    monthlyRepayment: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, "debtname", inputs.name),
    fillInputById(driver, "debtvalue", inputs.value),
    fillInputById(driver, "debtcategory", inputs.category),
    fillInputByName(driver, "start date", inputs.startDate),
    fillInputById(driver, "debtgrowth", inputs.growth),
    fillInputById(driver, "debtpayoff", inputs.monthlyRepayment),
  ]);

  await sleep(200, "wait for addDebt button to be ready");

  await driver.executeScript("window.scrollBy(0, 1000)");

  await clickButton(driver, "addDebt");
  await checkMessage(driver, inputs.message);
}

export async function clearDebtFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('debtname');
  await clearInputById('debtvalue');
  await clearInputById('debtcategory');
  await clearInputByName('start date');
  await clearInputById('debtgrowth');
  await clearInputById('debtpayoff');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, debtsTag);
  return;
}

export async function revalueDebt(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    revalue: string;
    revaluationDate: string;
    message: string;
  },
): Promise<boolean> {
  await fillInputById(driver, "debtname", inputs.name);
  await fillInputByName(driver, "start date", inputs.revaluationDate);
  await fillInputById(driver, "debtvalue", inputs.revalue);

  await clickButton(driver, "revalueDebt");
  await checkMessage(driver, inputs.message);
  return true;
}

export async function clearRevalueDebtFields(driver: ThenableWebDriver) {
  /*
  await clearInputById('debtname');
  await clearInputByName('start date');
  await clearInputById('debtvalue');
  */

  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, debtsTag);
  await clickButton(driver, "revalueDebtInputs");

  return;
}

export const debtInputs = {
  name: "creditCard",
  value: "2500",
  category: "highInterest",
  startDate: "1 Jan 2021",
  growth: "20.0",
  monthlyRepayment: "10",
};

export async function scrollToTop(driver: webdriver.ThenableWebDriver) {
  await driver.executeScript("window.scrollBy(0, -1000)");
}

// Use sleeps to hack page-not-yet-ready issues. TODO : do better - check awaits.
export async function sleep(ms: number, message: string) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`sleep for ${ms}ms: ${message}`);
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
async function clearInputById(id: string) {
  const input = await driver.findElements(webdriver.By.id(id));
  //log(`found ${input.length} elements with id = ${id}`);
  expect(input.length === 1).toBe(true);
  const result = await input[0].clear();
  //log(`got ${result} from clear`);
  return result;
}

async function clearInputByName(name: string) {
  const input = await driver.findElements(webdriver.By.name(name));
  //log(`found ${input.length} elements with name = ${name}`);
  expect(input.length === 1).toBe(true);
  const result = await input[0].clear();
  //log(`got ${result} from clear`);
  return result;
}
*/

export async function addDate(
  driver: ThenableWebDriver,
  name: string,
  date: string,
  message: string,
) {
  await gotoTabPage(driver, overviewTag);
  await gotoTabPage(driver, datesTag);
  let input = await driver.findElements(webdriver.By.id("triggername"));
  expect(input.length === 1).toBe(true);
  input[0].sendKeys(name);
  input = await driver.findElements(webdriver.By.id("date"));
  expect(input.length === 1).toBe(true);
  input[0].sendKeys(date);

  await driver.executeScript("window.scrollBy(0, 2000)");
  await sleep(100, "wait for addTrigger before going to click");
  await clickButton(driver, "addTrigger");
  // log(`added date`);

  await checkMessage(driver, message);
}

export async function testModelCreation(
  driver: any,
  createButtonID: string,
  testDataModelName: string,
  testID: string,
) {
  const ex1Name = `${testID} ex1`;
  const ex2Name = `${testID} ex2`;

  const showLogs = false;

  // await checkMessage(driver, `wrong`);

  // clear away any old data!
  if (showLogs) {
    log(`delete any preexisting ${ex1Name}, ${ex2Name}`);
  }
  await deleteIfExists(ex1Name, driver);
  await deleteIfExists(ex2Name, driver);
  await clickButton(driver, `btn-overview-${testDataModelName}`);
  await gotoTabPage(driver, homeTag);

  // there's no model
  if (showLogs) {
    log(`check there's no button for ${ex1Name}`);
  }
  let btn = await driver.findElements(
    webdriver.By.id(`btn-overview-${ex1Name}`),
  );
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);

  // can't create a model with no name
  if (showLogs) {
    log(`check we fail to create a model with empty name`);
  }
  await clickButton(driver, createButtonID);
  await checkMessage(driver, "Please provide a new name for the model");

  // warned if creating a model when existing model is not saved
  // choose to not switch
  // check the model did not get created
  if (showLogs) {
    log(
      `try to create a model ${ex1Name} when we haven't saved current one - stop`,
    );
  }
  await fillInputById(driver, "createModel", ex1Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(
    `Continue without saving unsaved model ${testDataModelName}?`,
    false,
    driver,
  );

  // still looking at old model
  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${testDataModelName}`);
  await gotoTabPage(driver, homeTag);

  // no button for not-saved model
  if (showLogs) {
    log(`check we didn't create a model ${ex1Name}`);
  }
  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);

  //expect(true).toBe(false);

  // warned if creating a model when existing model is not saved
  // choose to accept warning
  // check the model did get created
  if (showLogs) {
    log(
      `try to create a model ${ex1Name} when we haven't saved current one - continue`,
    );
  }
  await fillInputById(driver, "createModel", ex1Name);

  await clickButton(driver, createButtonID);
  await consumeAlert(
    `Continue without saving unsaved model ${testDataModelName}?`,
    true,
    driver,
  );

  if (showLogs) {
    log(`check we did create a model ${ex1Name}`);
  }
  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true); ///??

  if (showLogs) {
    log(`check ${ex1Name} is active model`);
  }

  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${ex1Name}`);
  await gotoTabPage(driver, homeTag);

  await fillInputById(driver, "createModel", ex2Name);

  // warned if creating a model when existing model is not saved
  // choose to not switch
  // check the model did not get created
  // save, go round again
  if (showLogs) {
    log(
      `try to create a model ${ex2Name} when we haven't saved current one - stop`,
    );
  }
  await clickButton(driver, createButtonID);
  await consumeAlert(
    `Continue without saving unsaved model ${ex1Name}?`,
    false,
    driver,
  );
  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${ex1Name}`);
  await gotoTabPage(driver, homeTag);

  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
  // log(`found ${btn.length} elements with id=${ex2Name}`);
  expect(btn.length === 0).toBe(true);

  if (showLogs) {
    log(`go to save ${ex1Name}`);
  }
  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${ex1Name}`);
  await gotoTabPage(driver, homeTag);
  await clickButton(driver, "btn-save-model");
  if (showLogs) {
    log(`we have saved ${ex1Name}`);
    log(`try to create a model ${ex2Name} when we have saved current one`);
  }
  await fillInputById(driver, "createModel", ex2Name);
  await clickButton(driver, createButtonID);

  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);

  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${ex2Name}`);
  await gotoTabPage(driver, homeTag);

  // try to create ex1Name but we're in ex2Name and
  // ex2Name is not saved, ex1Name is present
  // try to create ex1Name
  // warn ex2 is unsaved
  // warn ex1 exists
  await fillInputById(driver, "createModel", ex1Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex1Name}, you sure?`, false, driver);
  await gotoTabPage(driver, homeTag);

  //await checkMessage(driver, 'wrong');

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex1Name}, you sure?`, true, driver);
  await consumeAlert(
    `Continue without saving unsaved model ${ex2Name}?`,
    false,
    driver,
  );
  await gotoTabPage(driver, homeTag);

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex1Name}, you sure?`, true, driver);
  await consumeAlert(
    `Continue without saving unsaved model ${ex2Name}?`,
    true,
    driver,
  );
  await gotoTabPage(driver, homeTag);

  await clickButton(driver, "btn-save-model");

  // try to create ex2Name but we're in ex1Name and
  // ex1Name is saved, ex2Name is present
  // warn ex2 exists
  await fillInputById(driver, "createModel", ex2Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);
  await gotoTabPage(driver, homeTag);

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);
  await gotoTabPage(driver, homeTag);

  // try to create ex2Name but we're in ex2Name and
  // ex2Name is not saved
  await fillInputById(driver, "createModel", ex2Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);
  await gotoTabPage(driver, homeTag);

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);
  await gotoTabPage(driver, homeTag);

  // clear away any data
  await deleteIfExists(ex1Name, driver);
  await deleteIfExists(ex2Name, driver);
}

/* eslint-disable */
function assertData(
  assetData: any,
  debtData: any,
  incomeData: any,
  expenseData: any,
  createButtonID: string,
) {
  if (printDebug()) {
    let result = "";
    result += "let ary = assetData;";
    result += makeTestCode(assetData);
    result += "ary = debtData;";
    result += makeTestCode(debtData);
    result += "ary = incomeData;";
    result += makeTestCode(incomeData);
    result += "ary = expenseData;";
    result += makeTestCode(expenseData);
    log(result);
  }

  if (createButtonID === 'btn-create-Simple-example') {
    let ary = assetData;
    expect(ary.labels.length).toEqual(23);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual('Cash');
    expect(ary.datasets[0].data.length).toEqual(23);
    expect(ary.datasets[0].data[0]).toBeCloseTo(6517.38, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(11762.79, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(17718.99, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(24418.32, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(31903.52, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(40204.83, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(49353.48, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(61067.79, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(82091.16, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(105825.52, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(129355.85, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(136229.6, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(137950.57, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(140188.27, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(142967.43, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(149364.58, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(171586.27, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(194886.41, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(219304.98, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(244883.35, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(271664.28, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(299691.86, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(329011.75, 6);
    expect(ary.datasets[1].label).toEqual('ISAs');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(2014.01, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(2189.95, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(2381.27, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(2589.29, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(2815.49, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(3061.45, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(3328.9, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(3619.72, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(3935.94, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(4279.78, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(4653.66, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(5060.2, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(5502.26, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(5982.94, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(6505.61, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(7073.94, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(7691.92, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(8363.89, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(9094.56, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(9889.06, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(10752.96, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(11692.34, 6);
    expect(ary.datasets[2].label).toEqual('Stocks');
    expect(ary.datasets[2].data.length).toEqual(23);
    expect(ary.datasets[2].data[0]).toBeCloseTo(4379.9, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(4762.53, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(3255.37, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(3539.76, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(3849, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(4185.25, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(4550.87, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(4948.43, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(5380.73, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(5850.79, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(6361.91, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(6917.69, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(7522.02, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(8179.14, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(8893.67, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(9670.62, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(10515.45, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(11434.08, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(12432.96, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(13519.11, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(14700.13, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(15984.34, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(17380.73, 6);
    ary = debtData;
    expect(ary.labels.length).toEqual(23);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual('LateMortgage');
    expect(ary.datasets[0].data.length).toEqual(23);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(91997.42, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(77903.22, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(63152.22, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(47713.82, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(31556, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(14645.22, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].label).toEqual('EarlyMortgage');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(219725.82, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(206654.01, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(193277.62, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(179589.57, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(165582.58, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(151249.23, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(136581.91, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(121572.84, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(106214.06, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(0, 6);
    ary = incomeData;
    expect(ary.labels.length).toEqual(23);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual('Main income');
    expect(ary.datasets[0].data.length).toEqual(23);
    expect(ary.datasets[0].data[0]).toBeCloseTo(39287.5, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(43857.19, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(44953.62, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(46077.46, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(47229.39, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(48410.13, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(49620.38, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(50860.89, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(52132.41, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(53435.72, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(54771.62, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(56140.91, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(57544.43, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(58983.04, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(60457.62, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(61969.06, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(63518.28, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(65106.24, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(66733.9, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(68402.24, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(70112.3, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(71865.11, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(73661.74, 6);
    expect(ary.datasets[1].label).toEqual('Side hustle income');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(16837.5, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(18795.94, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(19265.84, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(19747.48, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(20241.17, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(20747.2, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(21265.88, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(5349.09, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].label).toEqual('Side hustle income later');
    expect(ary.datasets[2].data.length).toEqual(23);
    expect(ary.datasets[2].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(16403.86, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(22296.77, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(22854.19, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(23425.55, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(5904.39, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(0, 6);
    ary = expenseData;
    expect(ary.labels.length).toEqual(23);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual('Look after dogs');
    expect(ary.datasets[0].data.length).toEqual(23);
    expect(ary.datasets[0].data[0]).toBeCloseTo(5046.6, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(6194.61, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(6349.47, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(6508.21, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(6670.92, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(6837.69, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(7008.63, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(7183.85, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(7363.44, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(7547.53, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(7736.22, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(7929.62, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(8127.86, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(8331.06, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(8539.34, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(8752.82, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(8971.64, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(9195.93, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(9425.83, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(9661.48, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(9903.01, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(10150.59, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(10404.35, 6);
    expect(ary.datasets[1].label).toEqual('Run car');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(7065.24, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(8672.45, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(8889.26, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(9111.49, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(9339.28, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(9572.76, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(9812.08, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(9209.75, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].label).toEqual('Run house');
    expect(ary.datasets[2].data.length).toEqual(23);
    expect(ary.datasets[2].data[0]).toBeCloseTo(13121.16, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(16105.98, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(16508.63, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(16921.35, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(17344.38, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(17777.99, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(18222.44, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(18678, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(19144.95, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(19623.58, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(20114.16, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(20617.02, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(21132.44, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(21660.76, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(22202.27, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(22757.33, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(23326.26, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(23909.42, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(24507.16, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(25119.84, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(25747.83, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(26391.53, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(27051.32, 6);
  } else if (createButtonID === 'btn-create-Defined Benefits Pension-example') {
    let ary = assetData;
    expect(ary.labels.length).toEqual(28);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[13]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[14]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[15]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[16]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[17]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[18]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[19]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[20]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[21]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[22]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[23]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[24]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[25]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[26]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[27]).toEqual('Fri Jan 01 2044');
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual('Cash');
    expect(ary.datasets[0].data.length).toEqual(28);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(2500, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(26727.1, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(50537.46, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(73214.66, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(96030.46, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(118930.06, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(142509.98, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(166430.06, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(187975.14, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(188813.14, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(189113.14, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(192713.14, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(196313.14, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(199913.14, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(203513.14, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(206813.14, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(208613.14, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(210413.14, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(212213.14, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(214013.14, 6);
    expect(ary.datasets[0].data[23]).toBeCloseTo(215663.14, 6);
    expect(ary.datasets[0].data[24]).toBeCloseTo(215663.14, 6);
    expect(ary.datasets[0].data[25]).toBeCloseTo(215663.14, 6);
    expect(ary.datasets[0].data[26]).toBeCloseTo(215663.14, 6);
    expect(ary.datasets[0].data[27]).toBeCloseTo(215663.14, 6);
    ary = debtData;
    expect(ary.labels.length).toEqual(28);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[13]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[14]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[15]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[16]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[17]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[18]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[19]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[20]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[21]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[22]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[23]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[24]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[25]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[26]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[27]).toEqual('Fri Jan 01 2044');
    expect(ary.datasets.length).toEqual(0);
    ary = incomeData;
    expect(ary.labels.length).toEqual(28);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[13]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[14]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[15]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[16]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[17]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[18]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[19]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[20]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[21]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[22]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[23]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[24]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[25]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[26]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[27]).toEqual('Fri Jan 01 2044');
    expect(ary.datasets.length).toEqual(3);
    expect(ary.datasets[0].label).toEqual('TeachingJob');
    expect(ary.datasets[0].data.length).toEqual(28);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(2500, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(27500, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[23]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[26]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[27]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].label).toEqual('-PDB TeachersPensionScheme');
    expect(ary.datasets[1].data.length).toEqual(28);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(300, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(3600, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(3600, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(3600, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(3600, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(3300, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[23]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[26]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[27]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].label).toEqual('-PT TeachersPensionScheme');
    expect(ary.datasets[2].data.length).toEqual(28);
    expect(ary.datasets[2].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(150, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(1800, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(1800, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(1800, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(1800, 6);
    expect(ary.datasets[2].data[23]).toBeCloseTo(1650, 6);
    expect(ary.datasets[2].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[26]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[27]).toBeCloseTo(0, 6);
    ary = expenseData;
    expect(ary.labels.length).toEqual(28);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[13]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[14]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[15]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[16]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[17]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[18]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[19]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[20]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[21]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[22]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[23]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[24]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[25]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[26]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[27]).toEqual('Fri Jan 01 2044');
    expect(ary.datasets.length).toEqual(0);
  } else if (
    createButtonID === 'btn-create-Defined Contributions Pension-example'
  ) {
    let ary = assetData;
    expect(ary.labels.length).toEqual(27);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[23]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[24]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[25]).toEqual('Fri Jan 01 2044');
    expect(ary.labels[26]).toEqual('Sun Jan 01 2045');
    expect(ary.datasets.length).toEqual(5);
    expect(ary.datasets[0].label).toEqual('Cash');
    expect(ary.datasets[0].label).toEqual('Cash');
    expect(ary.datasets[0].data.length).toEqual(27);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(2375, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(25377.1, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(48054.3, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(70870.1, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(93769.7, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(118574.62, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(143694.7, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(166314.78, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(167152.78, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(167152.78, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(180359.14, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(193895.65, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(207770.58, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(221992.38, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(236569.73, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(241994.41, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(244093.81, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(244938.67, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(245291.39, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(245443.82, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(245511.88, 6);
    expect(ary.datasets[0].data[23]).toBeCloseTo(245543.22, 6);
    expect(ary.datasets[0].data[24]).toBeCloseTo(245558.08, 6);
    expect(ary.datasets[0].data[25]).toBeCloseTo(245565.32, 6);
    expect(ary.datasets[0].data[26]).toBeCloseTo(245568.95, 6);
    expect(ary.datasets[1].label).toEqual('-CPTaxable Jack.Aegon');
    expect(ary.datasets[1].data.length).toEqual(27);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(8630.38, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(3423.52, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(1412.18, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(604.3, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(267.69, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(122.51, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(57.82, 6);
    expect(ary.datasets[1].data[23]).toBeCloseTo(28.1, 6);
    expect(ary.datasets[1].data[24]).toBeCloseTo(14.04, 6);
    expect(ary.datasets[1].data[25]).toBeCloseTo(7.2, 6);
    expect(ary.datasets[1].data[26]).toBeCloseTo(3.79, 6);

    expect(ary.datasets[2].label).toEqual('-CPTaxable Joe.Aegon');
    expect(ary.datasets[2].data.length).toEqual(27);
    expect(ary.datasets[2].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(69796.38, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(59165.73, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(47866.1, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(35708.94, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(22646.92, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[23]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[26]).toBeCloseTo(0, 6);

    expect(ary.datasets[3].label).toEqual('-CPTaxFree Aegon');
    expect(ary.datasets[3].data.length).toEqual(27);
    expect(ary.datasets[3].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[3]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[4]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[5]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[6]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[7]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[8]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[9]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[3].data[11]).toBeCloseTo(23217.64, 6);
    expect(ary.datasets[3].data[12]).toBeCloseTo(24262.43, 6);
    expect(ary.datasets[3].data[13]).toBeCloseTo(25354.24, 6);
    expect(ary.datasets[3].data[14]).toBeCloseTo(26495.18, 6);
    expect(ary.datasets[3].data[15]).toBeCloseTo(27687.46, 6);
    expect(ary.datasets[3].data[16]).toBeCloseTo(28933.4, 6);
    expect(ary.datasets[3].data[17]).toBeCloseTo(30235.4, 6);
    expect(ary.datasets[3].data[18]).toBeCloseTo(31595.99, 6);
    expect(ary.datasets[3].data[19]).toBeCloseTo(33017.81, 6);
    expect(ary.datasets[3].data[20]).toBeCloseTo(34503.61, 6);
    expect(ary.datasets[3].data[21]).toBeCloseTo(36056.28, 6);
    expect(ary.datasets[3].data[22]).toBeCloseTo(37678.81, 6);
    expect(ary.datasets[3].data[23]).toBeCloseTo(39374.36, 6);
    expect(ary.datasets[3].data[24]).toBeCloseTo(41146.2, 6);
    expect(ary.datasets[3].data[25]).toBeCloseTo(42997.78, 6);
    expect(ary.datasets[3].data[26]).toBeCloseTo(44932.68, 6);


    expect(ary.datasets[4].label).toEqual('-PEN Aegon');
    expect(ary.datasets[4].data.length).toEqual(27);
    expect(ary.datasets[4].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[2]).toBeCloseTo(1400.7, 6);
    expect(ary.datasets[4].data[3]).toBeCloseTo(18528.7, 6);
    expect(ary.datasets[4].data[4]).toBeCloseTo(36427.47, 6);
    expect(ary.datasets[4].data[5]).toBeCloseTo(55131.67, 6);
    expect(ary.datasets[4].data[6]).toBeCloseTo(74677.57, 6);
    expect(ary.datasets[4].data[7]).toBeCloseTo(77877.65, 6);
    expect(ary.datasets[4].data[8]).toBeCloseTo(81382.14, 6);
    expect(ary.datasets[4].data[9]).toBeCloseTo(85044.34, 6);
    expect(ary.datasets[4].data[10]).toBeCloseTo(88871.33, 6);
    expect(ary.datasets[4].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[23]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[26]).toBeCloseTo(0, 6);

    ary = debtData;
    expect(ary.labels.length).toEqual(27);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[23]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[24]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[25]).toEqual('Fri Jan 01 2044');
    expect(ary.labels[26]).toEqual('Sun Jan 01 2045');
    expect(ary.datasets.length).toEqual(0);
    ary = incomeData;
    expect(ary.labels.length).toEqual(27);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[23]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[24]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[25]).toEqual('Fri Jan 01 2044');
    expect(ary.labels[26]).toEqual('Sun Jan 01 2045');
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual('javaJob1');
    expect(ary.datasets[0].data.length).toEqual(27);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(2500, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(30000, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(27500, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[23]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[26]).toBeCloseTo(0, 6);
    ary = expenseData;
    expect(ary.labels.length).toEqual(27);
    expect(ary.labels[0]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[1]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[2]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[3]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[4]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[5]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[6]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[7]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[8]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[9]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[10]).toEqual('Mon Jan 01 2029');
    expect(ary.labels[11]).toEqual('Tue Jan 01 2030');
    expect(ary.labels[12]).toEqual('Wed Jan 01 2031');
    expect(ary.labels[13]).toEqual('Thu Jan 01 2032');
    expect(ary.labels[14]).toEqual('Sat Jan 01 2033');
    expect(ary.labels[15]).toEqual('Sun Jan 01 2034');
    expect(ary.labels[16]).toEqual('Mon Jan 01 2035');
    expect(ary.labels[17]).toEqual('Tue Jan 01 2036');
    expect(ary.labels[18]).toEqual('Thu Jan 01 2037');
    expect(ary.labels[19]).toEqual('Fri Jan 01 2038');
    expect(ary.labels[20]).toEqual('Sat Jan 01 2039');
    expect(ary.labels[21]).toEqual('Sun Jan 01 2040');
    expect(ary.labels[22]).toEqual('Tue Jan 01 2041');
    expect(ary.labels[23]).toEqual('Wed Jan 01 2042');
    expect(ary.labels[24]).toEqual('Thu Jan 01 2043');
    expect(ary.labels[25]).toEqual('Fri Jan 01 2044');
    expect(ary.labels[26]).toEqual('Sun Jan 01 2045');
    expect(ary.datasets.length).toEqual(0);
  } else if (
    createButtonID === 'btn-create-National Savings Income Bonds-example'
  ) {
    let ary = assetData;
    expect(ary.labels.length).toEqual(13);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.datasets.length).toEqual(2);
    expect(ary.datasets[0].label).toEqual('Cash');
    expect(ary.datasets[0].data.length).toEqual(13);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(341, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(3245.26, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(6091.26, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(8979.45, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(11928.92, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(14886.19, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(18161.49, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(21600.29, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(25037.1, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(28471.78, 6);
    expect(ary.datasets[1].label).toEqual('NI');
    expect(ary.datasets[1].data.length).toEqual(13);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(1000000, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(1025000, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(1050625, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(1076890.62, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(1103812.89, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(1131408.21, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(1159693.42, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(1188685.75, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(1218402.9, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(1248862.97, 6);
    ary = debtData;
    expect(ary.labels.length).toEqual(13);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.datasets.length).toEqual(0);
    ary = incomeData;
    expect(ary.labels.length).toEqual(13);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual('NIinterest');
    expect(ary.datasets[0].data.length).toEqual(13);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(1241, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(15092.9, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(15470.22, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(15856.98, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(16253.4, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(16659.74, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(17076.23, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(17503.14, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(17940.72, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(18389.24, 6);
    ary = expenseData;
    expect(ary.labels.length).toEqual(13);
    expect(ary.labels[0]).toEqual('Sun Jan 01 2017');
    expect(ary.labels[1]).toEqual('Mon Jan 01 2018');
    expect(ary.labels[2]).toEqual('Tue Jan 01 2019');
    expect(ary.labels[3]).toEqual('Wed Jan 01 2020');
    expect(ary.labels[4]).toEqual('Fri Jan 01 2021');
    expect(ary.labels[5]).toEqual('Sat Jan 01 2022');
    expect(ary.labels[6]).toEqual('Sun Jan 01 2023');
    expect(ary.labels[7]).toEqual('Mon Jan 01 2024');
    expect(ary.labels[8]).toEqual('Wed Jan 01 2025');
    expect(ary.labels[9]).toEqual('Thu Jan 01 2026');
    expect(ary.labels[10]).toEqual('Fri Jan 01 2027');
    expect(ary.labels[11]).toEqual('Sat Jan 01 2028');
    expect(ary.labels[12]).toEqual('Mon Jan 01 2029');
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual('LivingCosts');
    expect(ary.datasets[0].data.length).toEqual(13);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(900, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(10945.7, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(11219.34, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(11499.82, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(11787.32, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(12082, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(12384.05, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(12693.65, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(13011, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(13336.27, 6);
  } else {
    expect(false).toBe(true);
  }
}
/* eslint-enable */

export async function testModelContent(driver: any, createButtonID: string) {
  const ex1Name = "ex1Name";
  await deleteIfExists(ex1Name, driver);

  // console.log(`provide name for ${createButtonID}`);
  await fillInputById(driver, "createModel", ex1Name);
  // console.log(`create model ${createButtonID}`);
  await clickButton(driver, createButtonID);
  // console.log(`save model ${createButtonID}`);
  await clickButton(driver, "btn-save-model");

  await gotoTabPage(driver, homeTag);
  await clickButton(driver, "btn-check");

  // console.log(`go to check model for ${createButtonID}`);
  await checkMessage(driver, "model check all good");
  // console.log(`checked model for ${createButtonID}`);

  const assetData = await getDataDumpFromPage(driver, "assetChart");
  const debtData = await getDataDumpFromPage(driver, "debtChart");
  const incomeData = await getDataDumpFromPage(driver, "incomeChart");
  const expenseData = await getDataDumpFromPage(driver, "expenseChart");

  assertData(assetData, debtData, incomeData, expenseData, createButtonID);

  await deleteIfExists(ex1Name, driver);
}
