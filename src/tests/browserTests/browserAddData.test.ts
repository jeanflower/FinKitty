import { TestModel02 } from '../../localization/stringConstants';
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
  headless,
  quitAfterAll,
  revalueAsset,
} from './ browsertestUtils';
import {
  beforeAllWork,
  clickButton,
  cleanUpWork,
  getDriver,
  scrollIntoViewByID,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';

const testDataModelName = 'BrowserAddDataTest';

let alreadyRunning = false;

describe(testDataModelName, () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should add dates', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Overview');

    const label = await driver.findElements(webdriver.By.id('pageTitle'));
    expect(label.length === 1).toBe(true);
    const labelText = await label[0].getText();

    expect(labelText).toBe(`${testDataModelName}`);

    await clickButton(driver, 'btn-Dates');

    await addDate(driver, 'testDate', '2020', 'added important date OK');
    await addDate(
      driver,
      'testDate2',
      'junk',
      'Your important date is not valid : Invalid Date',
    );
    await addDate(
      driver,
      // overwrites without qualms
      'testDate',
      '2021',
      'added important date OK',
    );
    await addDate(
      driver,
      '', // no name
      '2021',
      'Date name needs some characters',
    );

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should add incomes', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: '',
      message: `Income name should be non-empty`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      value: '',
      message: `Income value should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      valuationDate: '',
      message: `Value set date should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growth: '',
      message: `Growth value '' should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growsWithInflation: '',
      message: `Grows with inflation '' should be a Y/N value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      endDate: '',
      message: `End date '' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      name: 'javaJob2',
      liability: '',
      category: '',
      message: `added new income javaJob2`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      name: 'javaJob3',
      liability: 'Joe',
      category: 'programming',
      message: `added new income javaJob3`,
    });

    await addIncome(driver, {
      ...incomeInputs,
      value: 'junkforvalue',
      message: `Income value junkforvalue should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      valuationDate: 'junkjunk',
      message: `Value set date should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      startDate: 'junkjunk',
      message: `Start date 'junkjunk' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      endDate: 'junkjunk',
      message: `End date 'junkjunk' should be a date`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growth: 'junkjunk',
      message: `Growth value 'junkjunk' should be a numerical value`,
    });

    await clearIncomeFields(driver);
    await addIncome(driver, {
      ...incomeInputs,
      growsWithInflation: 'junkjunk',
      message: `Grows with inflation 'junkjunk' should be a Y/N value`,
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should revalue incomes', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`,
    });

    await clickButton(driver, 'useRevalueInputsIncome');

    const revalueInputs = {
      name: 'javaJob1',
      revalue: '12500',
      revaluationDate: '2022',
    };
    await revalueIncome(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of income",
    });

    await clickButton(driver, 'useRevalueInputsIncome');

    await revalueIncome(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Income name junk should be an existing income',
    });

    await clearRevalueIncomeFields(driver);
    await revalueIncome(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Income value junk should be a numerical or % value',
    });

    await clearRevalueIncomeFields(driver);
    await revalueIncome(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction javaJob1 2 dated before start of affected income : javaJob1',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should add expenses', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Expenses');

    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });

    await clearExpenseFields(driver);
    await addExpense(driver, {
      ...expenseInputs,
      name: '',
      message: `Expense name needs some characters`,
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
      growth: '',
      message: `Growth value '' should be a numerical value`,
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
      message: `transaction recurrence 'junk' must end in m or y`,
      // TODO not a great message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should revalue expenses', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Expenses');

    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });

    await scrollIntoViewByID(driver, 'useRevalueInputsExpense');
    await clickButton(driver, 'useRevalueInputsExpense');

    const revalueInputs = {
      name: 'broadband',
      revalue: '60.14',
      revaluationDate: '2022',
    };
    await revalueExpense(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of expense",
    });

    await clickButton(driver, 'useRevalueInputsExpense');

    await revalueExpense(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Transaction junk 1 to unrecognised thing : junk',
      // TODO : not a great message
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Expense value junk should be a numerical or % value',
    });

    await clearRevalueExpenseFields(driver);
    await revalueExpense(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message:
        'Transaction broadband 2 dated before start of affected expense : broadband',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('add asset', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });

    await addAsset(driver, {
      ...assetInputs,
      name: '',
      message: `Name should be not empty`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      value: '',
      message: `Asset value should be a numerical value or built from a setting`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      quantity: 'junk',
      message: `Quantity 'junk' should empty or a whole number value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      name: 'twoItems',
      quantity: '2',
      message: `added new asset`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      startDate: 'junk',
      message: `Start date 'junk' should be a date`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical or setting value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      growsWithInflation: 'junk',
      message: `Grows with CPI: 'junk' should be a Y/N value`,
    });

    await clearAssetFields(driver);
    await addAsset(driver, {
      ...assetInputs,
      purchasePrice: 'junk',
      message: `Asset purchase price \'junk\' is not a number`,
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('revalue assets', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Assets');

    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });

    await clickButton(driver, 'revalueAssetInputs');

    const revalueInputs = {
      name: 'hifi',
      revalue: '12500',
      revaluationDate: '2022',
    };
    await revalueAsset(driver, {
      ...revalueInputs,
      message: 'added new data', // TODO "added revaluation of asset",
    });

    await clickButton(driver, 'revalueAssetInputs');

    await revalueAsset(driver, {
      ...revalueInputs,
      name: 'junk',
      message: 'Transaction junk 1 to unrecognised thing : junk',
      // TODO : unhelpful error message
    });

    await clearRevalueAssetFields(driver);

    await revalueAsset(driver, {
      ...revalueInputs,
      revalue: 'junk',
      message: 'Income value junk should be a numerical or % value',
      // TODO Income -> Asset
    });

    await clearRevalueAssetFields(driver);
    await revalueAsset(driver, {
      ...revalueInputs,
      revaluationDate: '2020',
      message: 'Transaction hifi 2 dated before start of affected asset : hifi',
      // TODO not a helpul error message
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('add debts', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await clickButton(driver, 'btn-Debts');

    await addDebt(driver, {
      ...debtInputs,
      name: `debt1`,
      message: `added new debt and payment`,
    });

    await addDebt(driver, {
      ...debtInputs,
      name: '',
      message: `Name should be not empty`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      value: '',
      message: `Debt value should be a numerical value`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical value`,
    });

    await clearDebtFields(driver);
    await addDebt(driver, {
      ...debtInputs,
      monthlyRepayment: 'junk',
      message: `Payment value 'junk' should be a numerical value`,
    });

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
