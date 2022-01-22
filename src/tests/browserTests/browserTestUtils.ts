import { ThenableWebDriver } from 'selenium-webdriver';
import {
  clickButton,
  fillInputById,
  fillInputByName,
  getAssetChartData,
  getDebtChartData,
  getIncomeChartData,
  getExpenseChartData,
  scrollIntoViewByID,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';
import { CASH_ASSET_NAME } from '../../localization/stringConstants';
import { log, printDebug } from '../../utils';

// switch these values if you want to debug
// one of these tests and see the Chrome window
// alive
// export const headless = true;
export const quitAfterAll = true;
export const headless = false;
// export const quitAfterAll = false;

export const homeTag = 'btn-Home';
export const settingsTag = 'btn-Settings';
export const transactionsTag = 'btn-Transactions';
export const datesTag = 'btn-Dates';
export const overviewTag = 'btn-Overview';
export const expensesTag = 'btn-Expenses';
export const incomesTag = 'btn-Incomes';
export const assetsTag = 'btn-Assets';
export const debtsTag = 'btn-Debts';
export const taxTag = 'btn-Tax';

export async function gotoTabPage(driver: ThenableWebDriver, tag: string) {
  await driver.executeScript('window.scrollBy(0, -4000)');
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
    await driver
      .switchTo()
      .alert()
      .accept();
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
    await driver
      .switchTo()
      .alert()
      .dismiss();
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
  expect(
    await driver
      .switchTo()
      .alert()
      .getText(),
  ).toBe(message);
  if (accept) {
    await driver
      .switchTo()
      .alert()
      .accept();
  } else {
    await driver
      .switchTo()
      .alert()
      .dismiss();
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
    await scrollIntoViewByID(driver, `btn-overview-${name}`);
    // log(`${name} exists`);
    await btn[0].click();
    await acceptAnyAlert(driver);
    await gotoTabPage(driver, homeTag);
    // await sleep(1000, 'pause');
    await clickButton(driver, 'btn-delete');
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
  const label = await driver.findElements(webdriver.By.id('pageTitle'));
  expect(label.length === 1).toBe(true);
  const labelText = await label[0].getText();
  //log(`compare expected ${message} against found ${labelText}`);
  expect(labelText).toBe(message);

  const btn = await driver.findElements(webdriver.By.id('btn-clear-alert'));
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
    category: string; // TODO why so early?
    startDate: string;
    growth: string;
    growsWithInflation: string;
    liability: string;
    purchasePrice: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, 'assetname', inputs.name),
    fillInputById(driver, 'assetvalue', inputs.value),
    fillInputById(driver, 'assetquantity', inputs.quantity),
    fillInputByName(driver, 'start date', inputs.startDate),
    fillInputById(driver, 'assetgrowth', inputs.growth),
    fillInputById(driver, 'assetcpi-grows', inputs.growsWithInflation),
    fillInputById(driver, 'liabilityCGT', inputs.liability),
    fillInputById(driver, 'purchase', inputs.purchasePrice),
    fillInputById(driver, 'assetcategory', inputs.category),
  ]);

  await clickButton(driver, 'addAsset');
  // log(`added date`);

  await checkMessage(driver, inputs.message);
}

export const assetInputs = {
  name: 'hifi',
  value: '2500',
  quantity: '2',
  category: 'audio',
  startDate: '2021',
  growth: '2.0',
  growsWithInflation: 'N',
  liability: 'Joe',
  purchasePrice: '10',
};

export async function addIncome(
  driver: ThenableWebDriver,
  inputs: {
    name: string;
    value: string;
    valuationDate: string;
    startDate: string;
    endDate: string;
    growth: string;
    growsWithInflation: string;
    liability: string;
    category: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, 'incomename', inputs.name),
    fillInputByName(driver, 'income valuation date', inputs.valuationDate),
    fillInputById(driver, 'incomevalue', inputs.value),
    fillInputByName(driver, 'income start date', inputs.startDate),
    fillInputByName(driver, 'income end date', inputs.endDate),
    fillInputById(driver, 'incomegrowth', inputs.growth),
    fillInputById(driver, 'incomecpi-grows', inputs.growsWithInflation),
    fillInputById(driver, 'taxable', inputs.liability),
    fillInputById(driver, 'incomecategory', inputs.category),
  ]);

  await clickButton(driver, 'addIncome');
  // log(`added date`);

  await checkMessage(driver, inputs.message);
}

export const incomeInputs = {
  name: 'javaJob1',
  value: '2500',
  valuationDate: '2020',
  startDate: '2021',
  endDate: '2022',
  growth: '2.0',
  growsWithInflation: 'N',
  liability: 'Joe',
  category: 'programming',
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
    fillInputById(driver, 'settingname', inputs.name),
    fillInputById(driver, 'settingvalue', inputs.value),
  ]);

  await clickButton(driver, 'addSetting');

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
    incomeGrowth: string;
    incomecpiGrows: string;
    liability: string;
    category: string;
    message: string;
  },
): Promise<boolean> {
  await Promise.all([
    fillInputById(driver, 'incomename', inputs.name),
    fillInputByName(driver, 'income valuation date', inputs.valuationDate),
    fillInputById(driver, 'incomevalue', inputs.value),
    fillInputByName(driver, 'end date', inputs.contributionsEndDate),
    fillInputByName(driver, 'pension start date', inputs.startDate),
    fillInputByName(
      driver,
      'pension end/transfer date',
      inputs.pensionEndOrTransferDate,
    ),
    fillInputByName(
      driver,
      'transferred stop date',
      inputs.transferredStopDate,
    ),
    fillInputByName(
      driver,
      'contributionSSIncome',
      inputs.contributionSSIncome,
    ),
    fillInputById(
      driver,
      'contributionAmountPensionIncome',
      inputs.contributionAmountPensionIncome,
    ),
    fillInputById(driver, 'incomeaccrual', inputs.incomeaccrual),
    fillInputById(driver, 'transferNameIncome', inputs.transferName),
    fillInputById(driver, 'transferProportion', inputs.transferProportion),
    fillInputById(driver, 'incomegrowth', inputs.incomeGrowth),
    fillInputById(driver, 'incomecpi-grows', inputs.incomecpiGrows),
    fillInputById(driver, 'taxable', inputs.liability),
    fillInputById(driver, 'incomecategory', inputs.category),
  ]);

  if (inputs.incomeSource !== '') {
    await fillInputById(
      driver,
      'fromIncomeSelectIncomeForm',
      inputs.incomeSource,
    );
  }

  await clickButton(driver, 'addIncome');
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
  await clickButton(driver, 'useDBPInputs');
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
    fillInputById(driver, 'incomename', inputs.name),
    fillInputByName(driver, 'income valuation date', inputs.revaluationDate),
    fillInputById(driver, 'incomevalue', inputs.revalue),
  ]);

  await clickButton(driver, 'revalueIncome');
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
  await clickButton(driver, 'useRevalueInputsIncome');

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
    growth: string;
    growsWithInflation: string;
    recurrence: string;
    category: string;
    message: string;
  },
) {
  await Promise.all([
    fillInputById(driver, 'expensename', inputs.name),
    fillInputByName(driver, 'expense valuation date', inputs.valuationDate),
    fillInputById(driver, 'expensevalue', inputs.value),
    fillInputByName(driver, 'start date', inputs.startDate),
    fillInputByName(driver, 'end date', inputs.endDate),
    fillInputById(driver, 'expensegrowth', inputs.growth),
    fillInputById(driver, 'expensecpi-grows', inputs.growsWithInflation),
    fillInputById(driver, 'expenserecurrence', inputs.recurrence),
    fillInputById(driver, 'expensecategory', inputs.category),
  ]);

  await clickButton(driver, 'addExpense');
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
    fillInputById(driver, 'expensename', inputs.name),
    fillInputByName(driver, 'expense valuation date', inputs.revaluationDate),
    fillInputById(driver, 'expensevalue', inputs.revalue),
  ]);

  await clickButton(driver, 'revalueExpense');
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
  await clickButton(driver, 'useRevalueInputsExpense');

  return;
}

export const expenseInputs = {
  name: 'broadband',
  value: '56.13',
  valuationDate: '2020',
  startDate: '2021',
  endDate: '2022',
  growth: '2.0',
  growsWithInflation: 'N',
  recurrence: '1m',
  category: 'connectivity',
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
    fillInputById(driver, 'assetname', inputs.name),
    fillInputByName(driver, 'start date', inputs.revaluationDate),
    fillInputById(driver, 'assetvalue', inputs.revalue),
  ]);

  await clickButton(driver, 'revalueAsset');
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
  await clickButton(driver, 'revalueAssetInputs');

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
    fillInputById(driver, 'assetname', inputs.name),
    fillInputByName(driver, 'assetvalue', inputs.value),
    fillInputById(driver, 'assetcategory', inputs.category),
    fillInputByName(driver, 'start date', inputs.startDate),
    fillInputByName(driver, 'assetgrowth', inputs.growth),
    fillInputByName(driver, 'assetcpi-grows', inputs.growsWithCPI),
    fillInputByName(driver, 'stop date', inputs.contributionsStopDate),
    fillInputByName(driver, 'crystallize date', inputs.crystallizesDate),
    fillInputByName(
      driver,
      'transferred stop date',
      inputs.pensionEndOrTransferDate,
    ),
    fillInputById(driver, 'contributionSSAsset', inputs.contributionSSIncome),
    fillInputById(
      driver,
      'contributionAmountPensionAsset',
      inputs.contributionAmountPensionIncome,
    ),
    fillInputById(driver, 'contributionAmount', inputs.employerContribution),
    fillInputById(driver, 'liabilityIC', inputs.liability),
    fillInputById(driver, 'transferNameAsset', inputs.transferName),
  ]);

  if (inputs.incomeSource !== '') {
    await fillInputById(
      driver,
      'fromIncomeSelectAssetForm',
      inputs.incomeSource,
    );
  }

  await clickButton(driver, 'addPension');

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
  await clickButton(driver, 'useDCPInputs');

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
    fillInputById(driver, 'transactionname', inputs.name),
    fillInputByName(driver, 'date', inputs.startDate),
    fillInputById(driver, 'fromValue', inputs.reduction),
    fillInputById(driver, 'toValue', inputs.addition),
    fillInputById(driver, 'recurrence', inputs.recurrence),
    fillInputById(driver, 'liquidateForCash', inputs.liquidateForCash),
    fillInputByName(driver, 'stopDate', inputs.endDate),
    fillInputById(driver, 'transactioncategory', inputs.category),
  ]);

  if (inputs.fromAsset !== '') {
    await fillInputById(driver, 'fromAssetSelect', inputs.fromAsset);
  }
  if (inputs.toAsset !== '') {
    await fillInputById(driver, 'toAssetSelect', inputs.toAsset);
  }

  await clickButton(driver, 'addTransaction');
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
  name: 'trans1',
  startDate: '2023',
  fromAsset: CASH_ASSET_NAME,
  toAsset: 'hifi',
  reduction: '100',
  addition: '90%',
  recurrence: '1y',
  liquidateForCash: 'N',
  endDate: '2027',
  category: 'upgradeHifi',
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
    fillInputById(driver, 'debtname', inputs.name),
    fillInputById(driver, 'debtvalue', inputs.value),
    fillInputById(driver, 'debtcategory', inputs.category),
    fillInputByName(driver, 'start date', inputs.startDate),
    fillInputById(driver, 'debtgrowth', inputs.growth),
    fillInputById(driver, 'debtpayoff', inputs.monthlyRepayment),
  ]);

  await clickButton(driver, 'addDebt');
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
  await fillInputById(driver, 'debtname', inputs.name);
  await fillInputByName(driver, 'start date', inputs.revaluationDate);
  await fillInputById(driver, 'debtvalue', inputs.revalue);

  await clickButton(driver, 'revalueDebt');
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
  await clickButton(driver, 'revalueDebtInputs');

  return;
}

export const debtInputs = {
  name: 'creditCard',
  value: '2500',
  category: 'highInterest',
  startDate: '2021',
  growth: '20.0',
  monthlyRepayment: '10',
};

export async function scrollToTop(driver: webdriver.ThenableWebDriver) {
  await driver.executeScript('window.scrollBy(0, -1000)');
}

// Use sleeps to hack page-not-yet-ready issues. TODO : do better - check awaits.
export async function sleep(ms: number, message: string) {
  if (printDebug()) {
    log(`sleep for ${ms}ms: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
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
  let input = await driver.findElements(webdriver.By.id('triggername'));
  expect(input.length === 1).toBe(true);
  input[0].sendKeys(name);
  input = await driver.findElements(webdriver.By.id('date'));
  expect(input.length === 1).toBe(true);
  input[0].sendKeys(date);

  await clickButton(driver, 'addTrigger');
  // log(`added date`);

  await checkMessage(driver, message);
}

export async function testModelCreation(
  driver: any,
  createButtonID: string,
  testDataModelName: string,
  testID: string,
) {
  const ex1Name = `${testID}ex1`;
  const ex2Name = `${testID}ex2`;

  // await checkMessage(driver, `wrong`);

  // clear away any old data!
  await deleteIfExists(ex1Name, driver);
  await deleteIfExists(ex2Name, driver);
  await clickButton(driver, `btn-overview-${testDataModelName}`);
  await gotoTabPage(driver, homeTag);

  // there's no model
  let btn = await driver.findElements(
    webdriver.By.id(`btn-overview-${ex1Name}`),
  );
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);

  // can't create a model with no name
  await clickButton(driver, createButtonID);
  await checkMessage(driver, 'Please provide a new name for the model');

  // warned if creating a model when existing model is not saved
  // choose to not switch
  // check the model did not get created
  await fillInputById(driver, 'createModel', ex1Name);
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
  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);

  //expect(true).toBe(false);

  // warned if creating a model when existing model is not saved
  // choose to accept warning
  // check the model did get created
  await fillInputById(driver, 'createModel', ex1Name);

  await clickButton(driver, createButtonID);
  await consumeAlert(
    `Continue without saving unsaved model ${testDataModelName}?`,
    true,
    driver,
  );

  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);
  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${ex1Name}`);
  await gotoTabPage(driver, homeTag);

  await fillInputById(driver, 'createModel', ex2Name);

  // warned if creating a model when existing model is not saved
  // choose to not switch
  // check the model did not get created
  // save, go round again
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

  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${ex1Name}`);
  await gotoTabPage(driver, homeTag);
  await clickButton(driver, 'btn-save-model');

  await fillInputById(driver, 'createModel', ex2Name);
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
  await fillInputById(driver, 'createModel', ex1Name);
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

  await clickButton(driver, 'btn-save-model');

  // try to create ex2Name but we're in ex1Name and
  // ex1Name is saved, ex2Name is present
  // warn ex2 exists
  await fillInputById(driver, 'createModel', ex2Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);
  await gotoTabPage(driver, homeTag);

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);
  await gotoTabPage(driver, homeTag);

  // try to create ex2Name but we're in ex2Name and
  // ex2Name is not saved
  await fillInputById(driver, 'createModel', ex2Name);
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
  createButtonID: string
) {
  /*
  if(printDebug()){
    let result = '';
    result += 'let ary = assetData;';
    result += makeTestCode(assetData);
    result += 'ary = debtData;';
    result += makeTestCode(debtData);
    result += 'ary = incomeData;';
    result += makeTestCode(incomeData);
    result += 'ary = expenseData;';
    result += makeTestCode(expenseData);
    log(result);
  }

  if (createButtonID === 'btn-create-Simple-example') {

    let ary = assetData;expect(ary.labels.length).toEqual(23);
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
    expect(ary.datasets[0].data[0]).toBeCloseTo(6038.469044913888, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(10603.114601659505, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(15639.097584714547, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(21144.01906312721, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(26965.42399012256, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(33386.36097312963, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(40020.91296968243, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(49105.62736566618, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(71693.82064274294, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(97505.78098182745, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(123655.90438314785, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(133643.40263537547, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(138528.26306716906, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(144219.8562582113, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(150761.3273838321, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(161248.5832092718, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(187908.57620900346, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(216016.7750693102, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(245635.89482701942, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(276831.182548349, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(309670.6037914873, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(344224.84374693455, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(380567.44160202995, 6);
    expect(ary.datasets[1].label).toEqual('ISAs');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(2014.007615489538, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(2189.951320778699, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(2381.265468161921, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(2589.2928194605424, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(2815.4934401686073, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(3061.45494710173, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(3328.9036512805305, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(3619.7166742563895, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(3935.93512291942, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(4279.778415257652, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(4653.659857614551, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(5060.203582775748, 6);
    expect(ary.datasets[1].data[13]).toBeCloseTo(5502.262967767026, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(5982.9406606311395, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(6505.610356743861, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(7073.940477508989, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(7691.919917624158, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(8363.886041627788, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(9094.555126224368, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(9889.055462051305, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(10752.963347216084, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(11692.342225228855, 6);
    expect(ary.datasets[2].label).toEqual('Stocks');
    expect(ary.datasets[2].data.length).toEqual(23);
    expect(ary.datasets[2].data[0]).toBeCloseTo(4379.902641557401, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(4762.530936323844, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(3255.3744616120443, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(3539.7639745784654, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(3848.997755397634, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(4185.24619930916, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(4550.869307280797, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(4948.433249964835, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(5380.7283786817525, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(5850.788809843376, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(6361.913720271283, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(6917.690502874165, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(7522.019945205234, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(8179.143607618342, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(8893.673593179856, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(9670.624918280027, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(10515.450711140957, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(11434.080485266206, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(12432.961756459039, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(13519.105295503266, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(14700.134334118395, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(15984.338069546942, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(17380.729843302524, 6);
    ary = debtData;expect(ary.labels.length).toEqual(23);
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
    expect(ary.datasets[0].data[9]).toBeCloseTo(91997.42392050933, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(77903.21537832021, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(63152.216718065065, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(47713.82152024207, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(31555.997106200528, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(14645.218074464672, 6);
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
    expect(ary.datasets[1].data[0]).toBeCloseTo(219725.82439548898, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(206654.01049939278, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(193277.62333951754, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(179589.5663588172, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(165582.57765046653, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(151249.22610521133, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(136581.90746895166, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(121572.8403084671, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(106214.06188314324, 6);
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
    ary = incomeData;expect(ary.labels.length).toEqual(23);
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
    expect(ary.datasets[0].data[0]).toBeCloseTo(39215.257112382526, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(44624.052277916766, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(46632.13463042288, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(48730.580688791786, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(50923.45681978733, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(53215.01237667765, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(55609.687933627996, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(58112.123890641116, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(60727.16946571984, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(63459.89209167708, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(66315.58723580242, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(69299.78866141335, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(72418.27915117677, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(75677.10171297955, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(79082.57129006341, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(82641.28699811605, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(86360.14491303108, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(90246.35143411724, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(94307.4372486523, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(98551.27192484142, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(102986.079161459, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(107620.45272372437, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(112463.37309629166, 6);
    expect(ary.datasets[1].label).toEqual('Side hustle income');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(16670.990954981644, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(18622.10524067946, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(19087.657871696414, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(19564.8493184888, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(20053.970551451, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(20555.319815237253, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(21069.202810618146, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(5349.093441213319, 6);
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
    expect(ary.datasets[2].data[7]).toBeCloseTo(16213.442402949651, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(22090.328742548976, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(22642.586961112673, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(23208.65163514046, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(5892.261200237236, 6);
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
    ary = expenseData;expect(ary.labels.length).toEqual(23);
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
    expect(ary.datasets[0].data[0]).toBeCloseTo(5083.498698678208, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(6351.52397113474, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(6637.342549835786, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(6936.022964578379, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(7248.14399798439, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(7574.310477893673, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(7915.154449398868, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(8271.336399621798, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(8643.546537604758, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(9032.506131796948, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(9438.968907727789, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(9863.722508575509, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(10307.590021461385, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(10771.431572427118, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(11256.145993186306, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(11762.672562879661, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(12291.992828209217, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(12845.13250547861, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(13423.163468225112, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(14027.20582429521, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(14658.430086388455, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(15318.059440275896, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(16007.372115088268, 6);
    expect(ary.datasets[1].label).toEqual('Run car');
    expect(ary.datasets[1].data.length).toEqual(23);
    expect(ary.datasets[1].data[0]).toBeCloseTo(7193.517104345051, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(9224.493645918652, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(9916.330669362535, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(10660.055469564708, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(11459.559629782045, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(12319.026602015685, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(13242.95359716684, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(13010.109713272113, 6);
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
    expect(ary.datasets[2].data[0]).toBeCloseTo(13217.09661656334, 6);
    expect(ary.datasets[2].data[1]).toBeCloseTo(16513.96232495033, 6);
    expect(ary.datasets[2].data[2]).toBeCloseTo(17257.090629573046, 6);
    expect(ary.datasets[2].data[3]).toBeCloseTo(18033.659707903793, 6);
    expect(ary.datasets[2].data[4]).toBeCloseTo(18845.174394759422, 6);
    expect(ary.datasets[2].data[5]).toBeCloseTo(19693.207242523546, 6);
    expect(ary.datasets[2].data[6]).toBeCloseTo(20579.401568437053, 6);
    expect(ary.datasets[2].data[7]).toBeCloseTo(21505.474639016666, 6);
    expect(ary.datasets[2].data[8]).toBeCloseTo(22473.220997772354, 6);
    expect(ary.datasets[2].data[9]).toBeCloseTo(23484.515942672053, 6);
    expect(ary.datasets[2].data[10]).toBeCloseTo(24541.319160092244, 6);
    expect(ary.datasets[2].data[11]).toBeCloseTo(25645.678522296337, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(26799.734055799596, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(28005.722088310504, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(29265.97958228439, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(30582.94866348711, 6);
    expect(ary.datasets[2].data[16]).toBeCloseTo(31959.181353343956, 6);
    expect(ary.datasets[2].data[17]).toBeCloseTo(33397.34451424435, 6);
    expect(ary.datasets[2].data[18]).toBeCloseTo(34900.225017385266, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(36470.735143167505, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(38111.91822460995, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(39826.95454471731, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(41619.16749922948, 6);
  } else if (
    createButtonID === 'btn-create-Defined Benefits Pension-example'
  ) {
    let ary = assetData;expect(ary.labels.length).toEqual(28);
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
    expect(ary.datasets[0].data[4]).toBeCloseTo(26965.96675101832, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(51420.38128282136, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(74971.93038355975, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(98971.71530690325, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(123463.09282871362, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(148463.6633134603, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(173984.09354071438, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(197252.63060376595, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(198248.57720732078, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(198564.5310624803, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(202396.92706104272, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(206305.9709795764, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(210293.19577648072, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(214360.16506932315, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(218159.6351618438, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(220271.78420211864, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(222426.176223199, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(224623.6560847009, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(226865.08554343288, 6);
    expect(ary.datasets[0].data[23]).toBeCloseTo(228959.08812366743, 6);
    expect(ary.datasets[0].data[24]).toBeCloseTo(228959.08812366743, 6);
    expect(ary.datasets[0].data[25]).toBeCloseTo(228959.08812366743, 6);
    expect(ary.datasets[0].data[26]).toBeCloseTo(228959.08812366743, 6);
    expect(ary.datasets[0].data[27]).toBeCloseTo(228959.08812366743, 6);
    ary = debtData;expect(ary.labels.length).toEqual(28);
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
    ary = incomeData;expect(ary.labels.length).toEqual(28);
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
    expect(ary.datasets[0].data[4]).toBeCloseTo(30324.01675101832, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(30930.497086038697, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(31549.10702775949, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(32180.089168314702, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(32823.69095168102, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(33480.16477071466, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(34149.768066128985, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(31903.614974945907, 6);
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
    expect(ary.datasets[1].data[13]).toBeCloseTo(315.953855159517, 6);
    expect(ary.datasets[1].data[14]).toBeCloseTo(3832.395998562404, 6);
    expect(ary.datasets[1].data[15]).toBeCloseTo(3909.0439185336545, 6);
    expect(ary.datasets[1].data[16]).toBeCloseTo(3987.2247969043315, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(4066.9692928424192, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(3799.470092520613, 6);
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
    expect(ary.datasets[2].data[18]).toBeCloseTo(174.1317004288287, 6);
    expect(ary.datasets[2].data[19]).toBeCloseTo(2112.149040274842, 6);
    expect(ary.datasets[2].data[20]).toBeCloseTo(2154.392021080341, 6);
    expect(ary.datasets[2].data[21]).toBeCloseTo(2197.4798615019486, 6);
    expect(ary.datasets[2].data[22]).toBeCloseTo(2241.4294587319896, 6);
    expect(ary.datasets[2].data[23]).toBeCloseTo(2094.0025802345867, 6);
    expect(ary.datasets[2].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[26]).toBeCloseTo(0, 6);
    expect(ary.datasets[2].data[27]).toBeCloseTo(0, 6);
    ary = expenseData;expect(ary.labels.length).toEqual(28);
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
    let ary = assetData;expect(ary.labels.length).toEqual(27);
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
    expect(ary.datasets[0].data.length).toEqual(27);
    expect(ary.datasets[0].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[0].data[2]).toBeCloseTo(2422.5000000000014, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(26047.88223173676, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(49599.42333305394, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(73599.20825639744, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(98090.58577820781, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(123091.1562629544, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(148611.5864902085, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(171880.12355326005, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(172876.07015681488, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(172876.07015681488, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(188106.1063756887, 6);
    expect(ary.datasets[0].data[13]).toBeCloseTo(203716.89350003432, 6);
    expect(ary.datasets[0].data[14]).toBeCloseTo(219717.95030248858, 6);
    expect(ary.datasets[0].data[15]).toBeCloseTo(236119.03352500417, 6);
    expect(ary.datasets[0].data[16]).toBeCloseTo(252930.14382808263, 6);
    expect(ary.datasets[0].data[17]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[18]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[19]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[20]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[21]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[22]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[23]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[24]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[25]).toBeCloseTo(265019.1035009843, 6);
    expect(ary.datasets[0].data[26]).toBeCloseTo(265019.1035009843, 6);
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
    expect(ary.datasets[1].data[16]).toBeCloseTo(18763.7829077336, 6);
    expect(ary.datasets[1].data[17]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[18]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[19]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[20]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[21]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[22]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[23]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[24]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[25]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[26]).toBeCloseTo(0, 6);
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
    expect(ary.datasets[2].data[11]).toBeCloseTo(120904.22611247441, 6);
    expect(ary.datasets[2].data[12]).toBeCloseTo(104251.39927410962, 6);
    expect(ary.datasets[2].data[13]).toBeCloseTo(86003.57386552489, 6);
    expect(ary.datasets[2].data[14]).toBeCloseTo(65773.30243327307, 6);
    expect(ary.datasets[2].data[15]).toBeCloseTo(43412.58440359995, 6);
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
    expect(ary.datasets[3].data[11]).toBeCloseTo(40218.5650451571, 6);
    expect(ary.datasets[3].data[12]).toBeCloseTo(42028.40047218907, 6);
    expect(ary.datasets[3].data[13]).toBeCloseTo(43919.67849343746, 6);
    expect(ary.datasets[3].data[14]).toBeCloseTo(45896.06402564202, 6);
    expect(ary.datasets[3].data[15]).toBeCloseTo(47961.38690679582, 6);
    expect(ary.datasets[3].data[16]).toBeCloseTo(50119.649317601514, 6);
    expect(ary.datasets[3].data[17]).toBeCloseTo(52375.033536893454, 6);
    expect(ary.datasets[3].data[18]).toBeCloseTo(54731.91004605352, 6);
    expect(ary.datasets[3].data[19]).toBeCloseTo(57194.84599812577, 6);
    expect(ary.datasets[3].data[20]).toBeCloseTo(59768.61406804126, 6);
    expect(ary.datasets[3].data[21]).toBeCloseTo(62458.20170110296, 6);
    expect(ary.datasets[3].data[22]).toBeCloseTo(65268.82077765242, 6);
    expect(ary.datasets[3].data[23]).toBeCloseTo(68205.91771264662, 6);
    expect(ary.datasets[3].data[24]).toBeCloseTo(71275.18400971554, 6);
    expect(ary.datasets[3].data[25]).toBeCloseTo(74482.56729015255, 6);
    expect(ary.datasets[3].data[26]).toBeCloseTo(77834.2828182092, 6);
    expect(ary.datasets[4].label).toEqual('-PEN Aegon');
    expect(ary.datasets[4].data.length).toEqual(27);
    expect(ary.datasets[4].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[4].data[2]).toBeCloseTo(1402.5000000000007, 6);
    expect(ary.datasets[4].data[3]).toBeCloseTo(18824.213141790442, 6);
    expect(ary.datasets[4].data[4]).toBeCloseTo(37377.0753877972, 6);
    expect(ary.datasets[4].data[5]).toBeCloseTo(57118.93188796677, 6);
    expect(ary.datasets[4].data[6]).toBeCloseTo(78110.3696927983, 6);
    expect(ary.datasets[4].data[7]).toBeCloseTo(100414.84391624467, 6);
    expect(ary.datasets[4].data[8]).toBeCloseTo(124098.80963149152, 6);
    expect(ary.datasets[4].data[9]).toBeCloseTo(147317.3784305572, 6);
    expect(ary.datasets[4].data[10]).toBeCloseTo(153946.66045993188, 6);
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
    ary = debtData;expect(ary.labels.length).toEqual(27);
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
    ary = incomeData;expect(ary.labels.length).toEqual(27);
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
    expect(ary.datasets[0].data[2]).toBeCloseTo(2550.0000000000014, 6);
    expect(ary.datasets[0].data[3]).toBeCloseTo(30930.497086038697, 6);
    expect(ary.datasets[0].data[4]).toBeCloseTo(31549.10702775949, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(32180.089168314702, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(32823.69095168102, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(33480.16477071466, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(34149.768066128985, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(31903.614974945907, 6);
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
    ary = expenseData;expect(ary.labels.length).toEqual(27);
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
    let ary = assetData;expect(ary.labels.length).toEqual(13);
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
    expect(ary.datasets[0].data[4]).toBeCloseTo(2957.655658146692, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(4948.344863237661, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(6237.406153388995, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(6936.129635133435, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(6948.752265938316, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(6213.218419913436, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(4654.766431826654, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(2192.5645913597737, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(-1260.8357107207837, 6);
    expect(ary.datasets[1].label).toEqual('NI');
    expect(ary.datasets[1].data.length).toEqual(13);
    expect(ary.datasets[1].data[0]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[1]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[2]).toBeCloseTo(0, 6);
    expect(ary.datasets[1].data[3]).toBeCloseTo(1000000, 6);
    expect(ary.datasets[1].data[4]).toBeCloseTo(1024999.9999999986, 6);
    expect(ary.datasets[1].data[5]).toBeCloseTo(1050624.9999999972, 6);
    expect(ary.datasets[1].data[6]).toBeCloseTo(1076890.6249999953, 6);
    expect(ary.datasets[1].data[7]).toBeCloseTo(1103812.890624994, 6);
    expect(ary.datasets[1].data[8]).toBeCloseTo(1131408.2128906178, 6);
    expect(ary.datasets[1].data[9]).toBeCloseTo(1159693.4182128815, 6);
    expect(ary.datasets[1].data[10]).toBeCloseTo(1188685.7536682019, 6);
    expect(ary.datasets[1].data[11]).toBeCloseTo(1218402.8975099053, 6);
    expect(ary.datasets[1].data[12]).toBeCloseTo(1248862.9699476513, 6);
    ary = debtData;expect(ary.labels.length).toEqual(13);
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
    ary = incomeData;expect(ary.labels.length).toEqual(13);
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
    expect(ary.datasets[0].data[4]).toBeCloseTo(15092.901739536614, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(15470.22428302501, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(15856.979890100612, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(16253.404387353103, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(16659.739497036913, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(17076.23298446282, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(17503.13880907436, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(17940.717279301196, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(18389.235211283707, 6);
    ary = expenseData;expect(ary.labels.length).toEqual(13);
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
    expect(ary.datasets[0].data[4]).toBeCloseTo(11233.902681119294, 6);
    expect(ary.datasets[0].data[5]).toBeCloseTo(12076.445382203221, 6);
    expect(ary.datasets[0].data[6]).toBeCloseTo(12982.17878586844, 6);
    expect(ary.datasets[0].data[7]).toBeCloseTo(13955.842194808549, 6);
    expect(ary.datasets[0].data[8]).toBeCloseTo(15002.53035941918, 6);
    expect(ary.datasets[0].data[9]).toBeCloseTo(16127.720136375592, 6);
    expect(ary.datasets[0].data[10]).toBeCloseTo(17337.299146603724, 6);
    expect(ary.datasets[0].data[11]).toBeCloseTo(18637.596582598973, 6);
    expect(ary.datasets[0].data[12]).toBeCloseTo(20035.416326293867, 6);
  } else {
    expect(false).toBe(true);
  }
  */
}
/* eslint-enable */

export async function testModelContent(driver: any, createButtonID: string) {
  const ex1Name = 'ex1Name';
  await deleteIfExists(ex1Name, driver);

  // console.log(`provide name for ${createButtonID}`);
  await fillInputById(driver, 'createModel', ex1Name);
  // console.log(`create model ${createButtonID}`);
  await clickButton(driver, createButtonID);
  // console.log(`save model ${createButtonID}`);
  await clickButton(driver, 'btn-save-model');

  await gotoTabPage(driver, homeTag);
  await clickButton(driver, 'btn-check');

  // console.log(`go to check model for ${createButtonID}`);
  await checkMessage(driver, 'model check all good');
  // console.log(`checked model for ${createButtonID}`);

  const assetData = await getAssetChartData(driver);
  const debtData = await getDebtChartData(driver);
  const incomeData = await getIncomeChartData(driver);
  const expenseData = await getExpenseChartData(driver);

  assertData(assetData, debtData, incomeData, expenseData, createButtonID);

  await deleteIfExists(ex1Name, driver);
}
