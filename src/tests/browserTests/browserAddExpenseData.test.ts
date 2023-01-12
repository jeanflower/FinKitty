import {
  TestModel02,
  CASH_ASSET_NAME,
} from '../../localization/stringConstants';
import {
  addDate,
  addIncome,
  incomeInputs,
  clearIncomeFields,
  revalueIncome,
  clearRevalueIncomeFields,
  addExpense,
  expenseInputs,
  clearExpenseFields,
  revalueExpense,
  clearRevalueExpenseFields,
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
  incomesTag,
  assetsTag,
  expensesTag,
  debtsTag,
} from './browserTestUtils';
import {
  getDriver,
  beforeAllWork,
  clickButton,
  cleanUpWork,
  scrollIntoViewByID,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';

const testName = 'BrowserAddDataTest';

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

  it('should add expenses', async () => {
    const testDataModelName = 'BrowserAddDataTest04';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, expensesTag);

    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      name: '',
      message: `Name should be not empty`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      value: '',
      message: `Expense value should be a numerical value`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      valuationDate: '',
      message: `Value set date should be a date`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      endDate: '',
      message: `End date '' should be a date`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      growsWithInflation: '',
      message: `Grows with inflation '' should be a Y/N value`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      recurrence: 'junk',
      message: `Expense 'broadband' recurrence 'junk' must end in w, m or y`,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  it('should revalue expenses', async () => {
    const testDataModelName = 'BrowserAddDataTest05';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, expensesTag);

    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });

    await scrollIntoViewByID(driver, 'useRevalueInputsExpense');
    await clickButton(driver, 'useRevalueInputsExpense');

    const revalueInputs = {
      name: 'broadband',
      revalue: '60.14',
      revaluationDate: '1 Jan 2022',
    };
    await revalueExpense(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of expense",
    });

    await clickButton(driver, 'useRevalueInputsExpense');

    await revalueExpense(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Expense value junk should be a numerical or % value',
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revaluationDate: '1 Jan 2020',
      message: `Transaction 'broadband 2' dated before start of affected expense : 'broadband'`,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
