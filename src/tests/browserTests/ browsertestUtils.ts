import { ThenableWebDriver } from 'selenium-webdriver';
import {
  clickButton,
  fillInputById,
  fillInputByName,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';
import { CASH_ASSET_NAME } from '../../localization/stringConstants';
import { printDebug } from '../../utils';

// switch these values if you want to debug
// one of these tests and see the Chrome window
// alive
// export const headless = true;
export const quitAfterAll = true;
export const headless = false;
//  export const quitAfterAll = false;

export async function alertIsShowing(driver: any): Promise<boolean> {
  try {
    await driver.switchTo().alert();
    return true;
  } catch (err) {
    // try
    return false;
  } // catch
} // isAlertPresent()

export async function acceptAnyAlert(driver: any): Promise<boolean> {
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

export async function dismissAnyAlert(driver: any): Promise<boolean> {
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
  driver: any,
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

export async function deleteIfExists(name: string, driver: any) {
  await clickButton(driver, 'btn-Home');
  // log(`delete ${name} if it exists...`);
  const btn = await driver.findElements(
    webdriver.By.id(`btn-overview-${name}`),
  );
  if (btn.length === 1) {
    // log(`${name} exists`);
    await btn[0].click();
    await acceptAnyAlert(driver);
    await clickButton(driver, 'btn-Home');
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
  await clickButton(driver, 'btn-Home');
}

export async function checkMessage(driver: ThenableWebDriver, message: string) {
  const label = await driver.findElements(webdriver.By.id('pageTitle'));
  expect(label.length === 1).toBe(true);
  const labelText = await label[0].getText();
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Incomes');
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
  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Incomes');
  await clickButton(driver, 'useDBPInputs');

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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Incomes');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Expenses');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Expenses');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Assets');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Assets');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Assets');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Transactions');

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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Debts');
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

  await clickButton(driver, 'btn-Overview');
  await clickButton(driver, 'btn-Debts');
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

export async function scrollToTop(driver: any) {
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
