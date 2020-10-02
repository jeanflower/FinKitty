import {
  CASH_ASSET_NAME,
  MinimalModel,
  roiEnd,
  roiStart,
  TestModel01,
} from '../../localization/stringConstants';
import {
  beforeAllWork,
  clickButton,
  serverUri,
  fillInputById,
  cleanUpWork,
  getDriver,
  getAssetChartData,
  allowExtraSleeps,
  selectModel,
  calcSleep,
} from './browserBaseTypes';

import webdriver from 'selenium-webdriver';
import {
  headless,
  addSetting,
  addAsset,
  assetInputs,
  acceptAnyAlert,
  checkMessage,
  alertIsShowing,
  dismissAnyAlert,
  deleteIfExists,
  consumeAlert,
  quitAfterAll,
  addTransaction,
  sleep,
  addDate,
  addIncome,
  incomeInputs,
  toggleIncomesChart,
  addDBPension,
  addExpense,
  addDCPension,
  addDebt,
} from './ browsertestUtils';

const testDataModelName = 'BrowserWorkflowTest';

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

  async function setNarrowViewRange() {
    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: roiStart,
      value: '2 Nov 2019',
      message: 'added new setting Beginning of view range',
    });
    await addSetting(driver, {
      name: roiEnd,
      value: '1 Dec 2019',
      message: 'added new setting End of view range',
    });
  }
  async function setCashValue(val: number) {
    await clickButton(driver, 'btn-Assets');
    await addAsset(driver, {
      ...assetInputs,
      name: 'Cash',
      value: `${val}`,
      startDate: '1 Jan 2019',
      growth: '0',
      growsWithInflation: 'n',
      quantity: '',
      message: `added new asset`,
    });
  }

  async function makeNewModel(name: string) {
    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await fillInputById(driver, 'createModel', name);
    await clickButton(driver, 'btn-createMinimalModel');
    await acceptAnyAlert(driver);
    await setNarrowViewRange();
  }

  async function assertCurrentModel(name: string, isDirty: boolean) {
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${name}: Overview`);

    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -1000)'); // Adjust scrolling with a negative value here
    await clickButton(driver, `btn-overview-${testDataModelName}`);
    if (isDirty) {
      if (name === testDataModelName) {
        // this check for dirty status doesn't work for
        // the testDataModelName model
        await checkMessage(driver, 'UNSUPPORTED TEST CODE');
      }
      expect(await alertIsShowing(driver)).toBe(true);
      await dismissAnyAlert(driver);
    } else {
      await clickButton(driver, 'btn-Home');
      await clickButton(driver, `btn-overview-${name}`);
      await acceptAnyAlert(driver);
    }
    await clickButton(driver, 'btn-Home');
  }
  async function switchToModel(name: string) {
    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await clickButton(driver, `btn-overview-${name}`);
    await acceptAnyAlert(driver);
    await clickButton(driver, 'btn-Home');
  }

  async function modelExists(name: string, exists: boolean) {
    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    const btn = await driver.findElements(
      webdriver.By.id(`btn-overview-${name}`),
    );
    // log(`found ${btn.length} elements with id=btn-overview-${name}`);
    if (exists) {
      expect(btn.length === 1).toBe(true);
    } else {
      expect(btn.length === 0).toBe(true);
    }
    await clickButton(driver, 'btn-Home');
  }

  async function expectCashValue(val: number) {
    const ary = await getAssetChartData(driver);
    if (val === 0) {
      expect(ary.length).toEqual(0);
    } else {
      expect(ary.length).toEqual(1);
      expect(ary[0].name).toEqual('Cash');
      expect(ary[0].type).toEqual('stackedColumn');
      expect(ary[0].showInLegend).toEqual(true);
      expect(ary[0].dataPoints.length).toEqual(1);
      expect(ary[0].dataPoints[0].label).toEqual('Sat Nov 02 2019');
      expect(ary[0].dataPoints[0].y).toEqual(val);
    }
  }

  it('new, clone, save, manipulate cash value', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    const ex1Name = 'ex1Name';
    const ex2Name = 'ex2Name';
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);

    await clickButton(driver, `btn-overview-${testDataModelName}`);
    await clickButton(driver, 'btn-Home');
    await clickButton(driver, `btn-save-model`);

    await makeNewModel(ex1Name);
    await assertCurrentModel(ex1Name, true);

    await expectCashValue(0);
    await setCashValue(10);
    await expectCashValue(10);

    await makeNewModel(ex2Name);
    await assertCurrentModel(ex2Name, true);

    await switchToModel(ex1Name);
    await assertCurrentModel(ex1Name, true);
    await expectCashValue(10);

    await switchToModel(ex2Name);
    await assertCurrentModel(ex2Name, true);

    await expectCashValue(0);
    await setCashValue(20);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-save-model');
    await assertCurrentModel(ex2Name, false);

    ///////
    // await checkMessage(driver, 'wrong');
    //////

    await clickButton(driver, 'btn-Home');

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);
    await expectCashValue(20);
    await setCashValue(30);
    await expectCashValue(30);

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, 'btn-clone');

    await modelExists(ex1Name, true);
    await modelExists(ex2Name, true);

    await switchToModel(ex1Name);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-delete');
    await consumeAlert(
      `delete all data in model ${ex1Name} - you sure?`,
      true,
      driver,
    );

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);

    // explore replace-with-new, ...

    // await checkMessage(driver, 'wrong');

    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('my first model browser test', async done => {
    const modelName = 'Ben and Jerry';

    jest.setTimeout(1000000); // allow time for all these tests to run
    // log(`go to ensure model ${modelName}`);

    await beforeAllWork(driver, modelName, `{"testName":"${MinimalModel}"}`);

    if (allowExtraSleeps()) {
      await sleep(
        1500, // was calcSleep twice
        '--- after browser loads URI',
      );
    }

    // Handle errors around SSL certificates
    // push through "Advanced" and "Proceed"
    let x = await driver.findElements(webdriver.By.id('details-button'));
    if (x[0] !== undefined) {
      // console.log('found details button!');
      await x[0].click();
      x = await driver.findElements(webdriver.By.id('proceed-link'));
      if (x[0] !== undefined) {
        // console.log('found proceed link!');
        await x[0].click();
      }
    }

    const btnData = await driver.findElements(
      webdriver.By.id('buttonTestLogin'),
    );
    if (btnData[0] !== undefined) {
      await btnData[0].click();
    }

    await selectModel(driver, modelName);
    if (allowExtraSleeps()) {
      await sleep(calcSleep, '--- after model selected');
    }

    await clickButton(driver, 'btn-Dates');

    await addDate(
      driver,
      'Jerry retires',
      '5/5/2030',
      'added important date OK',
    );

    await addDate(
      driver,
      'Ben retires',
      '28/7/2032',
      'added important date OK',
    );

    await addDate(
      driver,
      'Jerry state pension age',
      '5/5/2037',
      'added important date OK',
    );

    await addDate(
      driver,
      'Ben state pension age',
      '31/8/2040',
      'added important date OK',
    );

    await addDate(
      driver,
      'Downsize house',
      '28/2/2047',
      'added important date OK',
    );

    // Add incomes
    await clickButton(driver, 'btn-Incomes');

    await addIncome(driver, {
      ...incomeInputs,
      name: 'Ben salary',
      value: '3470',
      valuationDate: '21/2/2020',
      startDate: '21/2/2020',
      endDate: 'Ben retires',
      growth: '2',
      growsWithInflation: 'Y',
      liability: 'Ben',
      category: 'Salary',
      message: `added new income ${'Ben salary'}`,
    });
    // log('done Ben salary');

    await toggleIncomesChart(driver);

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: 'Beginning of view range',
      value: '2020',
      message: 'added new setting Beginning of view range',
    });

    await addSetting(driver, {
      name: 'End of view range',
      value: '2069',
      message: 'added new setting End of view range',
    });

    await clickButton(driver, 'btn-Incomes');

    await clickButton(driver, 'btn-Settings');
    await addSetting(driver, {
      name: 'View frequency',
      value: 'Annually',
      message: 'added new setting View frequency',
    });
    await clickButton(driver, 'btn-Incomes');
    await clickButton(driver, 'btn-Settings');
    /*
    await addSetting(driver, {
      name: 'Date of birth',
      value: '31 August 1973',
      message: 'added new setting Date of birth',
    },
    pauseBeforeOK);
    await pauseForDemo();
*/

    await clickButton(driver, 'btn-Incomes');

    await toggleIncomesChart(driver);

    // log('toggled incomes chart off again');

    await addIncome(driver, {
      ...incomeInputs,
      name: 'Jerry salary',
      value: '2755',
      valuationDate: '21/2/2020',
      startDate: '21/2/2020',
      endDate: 'Jerry retires',
      growth: '2',
      growsWithInflation: 'Y',
      liability: 'Jerry',
      category: 'Salary',
      message: `added new income ${'Jerry salary'}`,
    });
    // log('done Jerry salary');

    await toggleIncomesChart(driver);
    await toggleIncomesChart(driver);

    await clickButton(driver, 'btn-Expenses');
    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'btn-Dates');

    await addDate(driver, 'Ben dies', '31/8/2068', 'added important date OK');

    await addDate(driver, 'Jerry dies', '5/5/2065', 'added important date OK');

    await clickButton(driver, 'btn-Incomes');
    await clickButton(driver, 'useDBPInputs');

    let DBPinputs = {
      name: 'Ben state pension',
      value: '730',
      valuationDate: '21/02/2020',
      contributionsEndDate: '',
      startDate: 'Ben state pension age',
      pensionEndOrTransferDate: 'Ben dies', //31/8/2068
      transferredStopDate: '',
      incomeSource: '',
      contributionSSIncome: '',
      contributionAmountPensionIncome: '',
      incomeaccrual: '',
      transferName: '',
      transferProportion: '',
      incomeGrowth: '0',
      incomecpiGrows: 'Y',
      liability: 'Ben',
      category: 'Pension',
    };

    await addDBPension(driver, {
      ...DBPinputs,
      message: 'added new data', // TODO "added pension information",
    });
    // log('done Ben state pension');

    await toggleIncomesChart(driver);
    await toggleIncomesChart(driver);

    await clickButton(driver, 'useDBPInputs');

    DBPinputs = {
      name: 'Jerry state pension',
      value: '730',
      valuationDate: '21/02/2020',
      contributionsEndDate: '',
      startDate: 'Jerry state pension age',
      pensionEndOrTransferDate: 'Jerry dies', //5/5/2065
      transferredStopDate: '',
      incomeSource: '',
      contributionSSIncome: '',
      contributionAmountPensionIncome: '',
      incomeaccrual: '',
      transferName: '',
      transferProportion: '',
      incomeGrowth: '0',
      incomecpiGrows: 'Y',
      liability: 'Jerry',
      category: 'Pension',
    };

    await addDBPension(driver, {
      ...DBPinputs,
      message: 'added new data', // TODO "added pension information",
    });
    // log('done Jerry state pension');

    await toggleIncomesChart(driver);
    await toggleIncomesChart(driver);

    DBPinputs = {
      name: 'Jerry work',
      value: '2000',
      valuationDate: '21/02/2020',
      contributionsEndDate: 'Jerry retires',
      startDate: 'Jerry state pension age',
      pensionEndOrTransferDate: 'Jerry dies',
      transferredStopDate: 'Ben dies',
      incomeSource: 'Jerry salary',
      contributionSSIncome: 'N',
      contributionAmountPensionIncome: '0.05',
      incomeaccrual: '0.015',
      transferName: 'Ben',
      transferProportion: '0.5',
      incomeGrowth: '0',
      incomecpiGrows: 'Y',
      liability: 'Jerry',
      category: 'Pension',
    };
    await clickButton(driver, 'useDBPInputs');

    await addDBPension(driver, {
      ...DBPinputs,
      message: 'added new data', // TODO "added pension information",
    });
    // log('done Jerry work');

    await toggleIncomesChart(driver);
    await toggleIncomesChart(driver);

    await clickButton(driver, 'btn-Expenses');

    let expenseInputs = {
      name: 'Basic expenses current house',
      value: '1850',
      valuationDate: '21/02/2020',
      startDate: '21/02/2020',
      endDate: 'Downsize house',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Basic',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Basic expenses working');

    let toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'Basic expenses small house',
      value: '1600',
      valuationDate: '21/02/2020',
      startDate: 'Downsize house',
      endDate: 'Ben dies',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Basic',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Basic expenses downsize');

    expenseInputs = {
      name: 'Leisure expenses working',
      value: '1000',
      valuationDate: '21/02/2020',
      startDate: '21/02/2020',
      endDate: 'Jerry retires',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Leisure',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Leisure expenses working');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'btn-Dates');

    await addDate(
      driver,
      'Care costs start',
      '20/2/2060',
      'added important date OK',
    );

    await clickButton(driver, 'btn-Expenses');

    expenseInputs = {
      name: 'Leisure expenses retired',
      value: '2000',
      valuationDate: '21/02/2020',
      startDate: 'Jerry retires',
      endDate: 'Care costs start', // 20/2/2060
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Leisure',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Leisure expenses retired');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'Care costs',
      value: '3000',
      valuationDate: '21/02/2020',
      startDate: 'Care costs start',
      endDate: 'Ben dies',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '1m',
      category: 'Care',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Care costs');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'House maintenance',
      value: '8000',
      valuationDate: '21/02/2020',
      startDate: '21/02/2020',
      endDate: 'Care costs start',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '4y',
      category: 'Major costs',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done House maintenance');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    expenseInputs = {
      name: 'Replace car',
      value: '20000',
      valuationDate: '21/02/2020',
      startDate: '21/02/2025',
      endDate: 'Care costs start',
      growth: '0',
      growsWithInflation: 'Y',
      recurrence: '5y',
      category: 'Major costs',
    };
    await addExpense(driver, {
      ...expenseInputs,
      message: `added new expense`,
    });
    // log('done Replace car');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggle-expensesChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'toggle-expensesChart');

    await clickButton(driver, 'btn-Assets');

    let assetInputs = {
      name: 'House',
      value: '255000',
      quantity: '',
      category: 'Property',
      startDate: '21/02/2020',
      growth: '2',
      growsWithInflation: 'Y',
      liability: '',
      purchasePrice: '',
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done House');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'chooseAssetOrDebtChartSetting--asset-All');

    await clickButton(driver, 'toggleAssetsChart');

    assetInputs = {
      name: 'ISA',
      value: '9000',
      quantity: '',
      category: 'Investment',
      startDate: '21/02/2020',
      growth: '4',
      growsWithInflation: 'Y',
      liability: '',
      purchasePrice: '',
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done ISA');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    assetInputs = {
      name: 'Jerry stocks',
      value: '25000',
      quantity: '',
      category: 'Investment',
      startDate: '21/02/2020',
      growth: '4',
      growsWithInflation: 'Y',
      liability: 'Jerry',
      purchasePrice: '14000',
    };
    await addAsset(driver, {
      ...assetInputs,
      message: `added new asset`,
    });
    // log('done Jerry stocks');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    let pensionInputs = {
      name: 'Jerry Aegon',
      value: '56324',
      category: 'Pension',
      startDate: '21/02/2020',
      growth: '4',
      growsWithCPI: 'Y',
      contributionsStopDate: '',
      crystallizesDate: 'Jerry retires',
      pensionEndOrTransferDate: 'Jerry dies',
      contributionSSIncome: 'N',
      incomeSource: '',
      contributionAmountPensionIncome: '0',
      employerContribution: '0',
      liability: 'Jerry',
      transferName: 'Ben',
    };

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      message: 'added assets and transactions',
    });
    // log('done Jerry Aegon');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    pensionInputs = {
      name: 'Ben Prudential',
      value: '45000',
      category: 'Pension',
      startDate: '21/02/2020',
      growth: '4',
      growsWithCPI: 'Y',
      contributionsStopDate: 'Ben retires',
      crystallizesDate: 'Ben retires',
      pensionEndOrTransferDate: 'Ben dies',
      contributionSSIncome: 'N',
      incomeSource: 'Ben salary',
      contributionAmountPensionIncome: '0.06',
      employerContribution: '0.12',
      liability: 'Ben',
      transferName: 'Jerry',
    };

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      message: 'added assets and transactions',
    });
    // log('done Ben Prudential');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleAssetsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'toggleAssetsChart');

    await clickButton(driver, 'btn-Debts');

    let debtInputs = {
      name: 'Mortgage',
      value: '150000',
      category: 'Property',
      startDate: '21/02/2020',
      growth: '3.5',
      monthlyRepayment: '700',
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });

    // log('done Mortgage');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleDebtsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'toggleDebtsChart');

    debtInputs = {
      name: 'Jerry loan',
      value: '5000',
      category: '',
      startDate: '21/02/2020',
      growth: '2.5',
      monthlyRepayment: '250',
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });
    // log('done Jerry loan');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleDebtsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'toggleDebtsChart');

    debtInputs = {
      name: 'Ben loan',
      value: '5000',
      category: '',
      startDate: '21/02/2020',
      growth: '0',
      monthlyRepayment: '500',
    };
    await addDebt(driver, {
      ...debtInputs,
      message: `added new debt and payment`,
    });
    // log('done Ben loan');

    toggleChart = await driver.findElements(
      webdriver.By.id(`toggleDebtsChart`),
    );
    await driver.executeScript(
      'arguments[0].scrollIntoView(true);',
      toggleChart[0],
    );
    await driver.executeScript('window.scrollBy(0, -100)'); // Adjust scrolling with a negative value here

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'toggleDebtsChart');

    await clickButton(driver, 'btn-Transactions');
    let transactionInputs = {
      name: 'Downsize house',
      startDate: 'Downsize house',
      fromAsset: 'House',
      toAsset: CASH_ASSET_NAME,
      reduction: '40%',
      addition: '87.5%',
      recurrence: '',
      liquidateForCash: 'N',
      endDate: '',
      category: '',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Downsize house');

    transactionInputs = {
      name: 'Sell ISAs for cash',
      startDate: '21/02/2020',
      fromAsset: 'ISA',
      toAsset: CASH_ASSET_NAME,
      reduction: '500',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell ISAs for cash');

    transactionInputs = {
      name: 'Sell stocks for cash',
      startDate: '21/02/2020',
      fromAsset: 'Jerry stocks',
      toAsset: CASH_ASSET_NAME,
      reduction: '500',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell stocks for cash');

    transactionInputs = {
      name: 'Sell AegonTaxFree',
      startDate: '21/02/2020',
      fromAsset: 'Jerry AegonTaxFree',
      toAsset: CASH_ASSET_NAME,
      reduction: '250',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell AegonTaxFree');

    transactionInputs = {
      name: 'Sell PrudentialTaxFree ',
      startDate: '21/02/2020',
      fromAsset: 'Ben PrudentialTaxFree',
      toAsset: CASH_ASSET_NAME,
      reduction: '250',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell PrudentialTaxFree');

    transactionInputs = {
      name: 'Sell CrystallizedPensionJerry ',
      startDate: '21/02/2020',
      fromAsset: 'CrystallizedPensionJerry',
      toAsset: CASH_ASSET_NAME,
      reduction: '1000',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell CrystallizedPensionJerry');

    transactionInputs = {
      name: 'Sell CrystallizedPensionBen ',
      startDate: '21/02/2020',
      fromAsset: 'CrystallizedPensionBen',
      toAsset: CASH_ASSET_NAME,
      reduction: '1000',
      addition: '100%',
      recurrence: '1m',
      liquidateForCash: 'Y',
      endDate: '',
      category: 'Cashflow',
    };
    await addTransaction(driver, {
      ...transactionInputs,
      message: `added new transaction`,
    });
    // log('done Sell CrystallizedPensionBen');

    // await cleanUpWork(driver, modelName);

    done();
  });

  async function testModelCreation(createButtonID: string) {
    const ex1Name = 'ex1Name';
    const ex2Name = 'ex2Name';

    // await checkMessage(driver, `wrong`);

    // clear away any old data!
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
    await clickButton(driver, `btn-overview-${testDataModelName}`);
    await clickButton(driver, 'btn-Home');

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
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${testDataModelName}: Overview`);
    await clickButton(driver, 'btn-Home');

    // no button for not-saved model
    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 0).toBe(true);

    // warned if creating a model when existing model is not saved
    // choose to accept warning
    // check the model did get created
    await clickButton(driver, createButtonID);
    await consumeAlert(
      `Continue without saving unsaved model ${testDataModelName}?`,
      true,
      driver,
    );
    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex1Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 1).toBe(true);
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex1Name}: Overview`);
    await clickButton(driver, 'btn-Home');

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
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex1Name}: Overview`);
    await clickButton(driver, 'btn-Home');

    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 0).toBe(true);
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex1Name}: Overview`);
    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-save-model');
    await clickButton(driver, createButtonID);
    btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
    // log(`found ${btn.length} elements with id=${id}`);
    expect(btn.length === 1).toBe(true);
    await clickButton(driver, 'btn-Overview');
    await checkMessage(driver, `${ex2Name}: Overview`);
    await clickButton(driver, 'btn-Home');

    // try to create ex1Name but we're in ex2Name and
    // ex2Name is not saved, ex1Name is present
    // try to create ex1Name
    // warn ex2 is unsaved
    // warn ex1 exists
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex1Name}, you sure?`, false, driver);

    //await checkMessage(driver, 'wrong');

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex1Name}, you sure?`, true, driver);
    await consumeAlert(
      `Continue without saving unsaved model ${ex2Name}?`,
      false,
      driver,
    );

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex1Name}, you sure?`, true, driver);
    await consumeAlert(
      `Continue without saving unsaved model ${ex2Name}?`,
      true,
      driver,
    );

    await clickButton(driver, 'btn-save-model');

    // try to create ex2Name but we're in ex1Name and
    // ex1Name is saved, ex2Name is present
    // warn ex2 exists
    await fillInputById(driver, 'createModel', ex2Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);

    // try to create ex2Name but we're in ex2Name and
    // ex2Name is not saved
    await fillInputById(driver, 'createModel', ex2Name);
    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);

    await clickButton(driver, createButtonID);
    await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);

    // clear away any data
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
  }

  it('create examples', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-create-Simple-example');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('create new clones', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-clone');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('create new models', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-createMinimalModel');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
