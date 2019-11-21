import {
  deleteAllData,
  ensureDbTables,
  submitIDbModel,
  submitIDbSettings,
  setupDDB,
} from '../../database/dynamo';
import {
  allItems,
  annually,
  assetChartHint,
  assetChartVal,
  assetChartView,
  birthDate,
  birthDateHint,
  CASH_ASSET_NAME,
  cpi,
  cpiHint,
  expenseChartFocus,
  expenseChartFocusHint,
  fine,
  incomeChartFocus,
  incomeChartFocusHint,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  assetChartFocus,
  assetChartFocusHint,
  viewDetail,
  viewDetailHint,
  viewFrequency,
  viewFrequencyHint,
} from '../../stringConstants';
import {
  DbAsset,
  DbExpense,
  DbIncome,
  DbModelData,
  DbSetting,
  DbTransaction,
} from '../../types/interfaces';
import { log, printDebug } from '../../utils';
import webdriver from 'selenium-webdriver';

export const simpleAsset: DbAsset = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  VALUE: '0',
  GROWTH: '0',
  CPI_IMMUNE: false,
  LIABILITY: '',
  PURCHASE_PRICE: '0',
};
export const simpleExpense: DbExpense = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0.0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0.0',
};
export const simpleIncome: DbIncome = {
  NAME: 'NoName',
  CATEGORY: '',
  START: '1 Jan 2017',
  END: '1 Jan 2017',
  VALUE: '0.0',
  VALUE_SET: '1 Jan 2017',
  CPI_IMMUNE: false,
  GROWTH: '0.0',
  LIABILITY: '',
};
export const simpleTransaction: DbTransaction = {
  NAME: 'NoName',
  FROM: '',
  FROM_ABSOLUTE: true,
  FROM_VALUE: '0',
  TO: '',
  TO_ABSOLUTE: true,
  TO_VALUE: '0',
  DATE: '1 Jan 2017',
  STOP_DATE: '', // for regular transactions
  RECURRENCE: '',
  CATEGORY: '',
};
export const browserTestSettings: DbSetting[] = [
  {
    NAME: roiStart,
    VALUE: '1 Jan 2019',
    HINT: roiStartHint,
  },
  {
    NAME: roiEnd,
    VALUE: '1 Feb 2019',
    HINT: roiEndHint,
  },
  {
    NAME: assetChartView,
    VALUE: assetChartVal, // could be 'deltas'
    HINT: assetChartHint,
  },
  {
    NAME: viewFrequency,
    VALUE: annually, // could be 'Monthly'
    HINT: viewFrequencyHint,
  },
  {
    NAME: viewDetail,
    VALUE: fine, // could be coarse
    HINT: viewDetailHint,
  },
  {
    NAME: cpi,
    VALUE: '2.5',
    HINT: cpiHint,
  },
  {
    NAME: 'stockMarketGrowth',
    VALUE: '6.236',
    HINT: 'Custom setting for stock market growth',
  },
  {
    NAME: assetChartFocus,
    VALUE: CASH_ASSET_NAME,
    HINT: assetChartFocusHint,
  },
  {
    NAME: expenseChartFocus,
    VALUE: allItems,
    HINT: expenseChartFocusHint,
  },
  {
    NAME: incomeChartFocus,
    VALUE: allItems,
    HINT: incomeChartFocusHint,
  },
  {
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
];

const serverUri = 'http://localhost:3000/#';

export const dBSleep = 1500; // time to round trip through DB
export const calcSleep = 1000; // time to recalculate charts etc
export const shortSleep = 200;

export function getDriver(headless: boolean) {
  // from
  // https://jakebinstein.com/blog/how-to-set-browser-capabilities-in-webdriverjs-example-headless-mode/

  // User-set variables
  const browserName = 'chrome'; // Switch to 'firefox' if desired
  const capabilityName = 'goog:chromeOptions'; // Switch to 'moz:firefoxOptions' if desired

  // Set up the commandline options for launching the driver.
  // In this example, I'm using various headless options.
  const browserOptions = {
    args: ['--disable-gpu', '--no-sandbox'],
  };
  if (headless) {
    browserOptions.args.unshift('--headless');
  }
  // Set up the browser capabilities.
  // Some lines could be condensed into one-liners if that's your preferred style.
  let browserCapabilities =
    browserName === 'chrome'
      ? webdriver.Capabilities.chrome()
      : webdriver.Capabilities.firefox();
  browserCapabilities = browserCapabilities.set(capabilityName, browserOptions);
  const builder = new webdriver.Builder().forBrowser(browserName);
  const driver = builder.withCapabilities(browserCapabilities).build();

  return driver;
}

// Use sleeps to hack page-not-yet-ready issues. TODO : do better.
export function sleep(ms: number, message: string) {
  if (printDebug()) {
    log(`sleep for ${ms}ms: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function gotoHomePage(driver: any) {
  const btnHome = await driver.findElements(webdriver.By.id('btn-Home'));
  // log(`btnMms.length = ${btnMms.length}`);
  expect(btnHome.length === 1).toBe(true);
  await btnHome[0].click();
  await sleep(shortSleep, '--- on home page');
}

export async function selectModel(driver: any, testDataModelName: string) {
  await gotoHomePage(driver);

  const btnData = await driver.findElements(
    webdriver.By.id(`btn-overview-${testDataModelName}`),
  );
  if (btnData[0] !== undefined) {
    await btnData[0].click();
  } else {
    log(`BUG : can't see model ${testDataModelName} in model list`);
    await sleep(
      10000,
      "BUG : can't see model in model list? lengthen dBSleep?",
    );
  }
}
export async function beforeAllWork(
  driver: any,
  testDataModelName: string,
  model: DbModelData,
) {
  jest.setTimeout(60000); // allow time for all these tests to run

  await setupDDB('TestAccessKeyID');

  await deleteAllData(testDataModelName);
  await ensureDbTables(testDataModelName);
  await submitIDbModel(model, testDataModelName);
  await sleep(
    1000, // was dBSleep
    `--- after submit model ${testDataModelName} to DB`,
  );

  await driver.get('about:blank');
  await driver.get(serverUri);
  await sleep(
    2500, // was calcSleep twice
    '--- after browser loads URI',
  );

  const alert = driver.switchTo().alert();
  const alertText = await alert.getText();
  expect(alertText).toEqual(`Type DB access key id`);
  await alert.sendKeys('TestAccessKeyID');
  // log(`alertText = ${alertText}`);
  await alert.accept();

  await selectModel(driver, testDataModelName);
  await sleep(calcSleep, '--- after model selected');
}

export async function cleanUpWork(driver: any, testDataModelName: string) {
  await gotoHomePage(driver);

  return new Promise(async resolve => {
    // log(`in clean up model`);
    // log(`go seek model_input name`);
    // log(`seek btn-${testDataModelName}`);

    const deleteModelButton = await driver.findElement(
      webdriver.By.id(`btn-del-${testDataModelName}`),
    );
    await deleteModelButton.click();
    // log(`model name = ${content}`);
    // log(`go find delete model button`);
    await sleep(shortSleep, 'after delete model is clicked');
    const alert = driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toEqual(
      `delete all data in model ${testDataModelName} - you sure?`,
    );
    // log(`alertText = ${alertText}`);
    await alert.accept();
    // log(`accepted alert`);
    await sleep(
      1000, // dBSleep, e.g. 6 Get coarse view charts 03
      'after accepting confirm dialog',
    );
    // log(`deleted model`);
    resolve();
  });
}

// click something to refresh page // hack!
export async function refreshPage(driver: any, testDataModelName: string) {
  // log('in refreshPage');
  await selectModel(driver, testDataModelName);
  await sleep(calcSleep, 'after refreshing a page');
}

export function writeTestCode(ary: any[]) {
  let result = '';
  result += `expect(ary.length).toEqual(${ary.length});\n`;
  for (let i = 0; i < ary.length; i += 1) {
    result += `expect(ary[${i}].name).toEqual('${ary[i].name}');\n`;
    result += `expect(ary[${i}].type).toEqual('${ary[i].type}');\n`;
    result += `expect(ary[${i}].showInLegend).toEqual(${ary[i].showInLegend});\n`;
    result +=
      `expect(ary[${i}].dataPoints.length).toEqual(` +
      `${ary[i].dataPoints.length});\n`;
    for (let j = 0; j < ary[i].dataPoints.length; j += 1) {
      result +=
        `expect(ary[${i}].dataPoints[${j}].label).toEqual('` +
        `${ary[i].dataPoints[j].label}');\n`;
      result +=
        `expect(ary[${i}].dataPoints[${j}].y).toEqual(` +
        `${ary[i].dataPoints[j].y});\n`;
      result +=
        `expect(ary[${i}].dataPoints[${j}].ttip).toEqual('` +
        `${ary[i].dataPoints[j].ttip}');\n`;
    }
  }

  log(result);
}

export async function getChartData(driver: any, label: string) {
  // locate the asset text dump
  const divElement = await driver.findElement(webdriver.By.id(label));
  // extract the content
  const content = await divElement.getAttribute('value');
  // log(`content = ${content}`);
  // check the content matches our expectations
  const ary = JSON.parse(content);
  return ary;
}

export async function getAssetChartData(driver: any) {
  const header = await driver.findElements(webdriver.By.id('AssetsHeader'));
  if (header.length === 0) {
    const btn = await driver.findElements(webdriver.By.id('btn-Assets'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();
    await sleep(shortSleep, '--- after click Assets');
    // log('switched to assets view');
  } else {
    // log('already in assets view');
  }

  return getChartData(driver, 'assetDataDump');
}
export async function getExpenseChartData(driver: any) {
  const header = await driver.findElements(webdriver.By.id('ExpensesHeader'));
  if (header.length === 0) {
    const btn = await driver.findElements(webdriver.By.id('btn-Expenses'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();
    await sleep(shortSleep, '--- after click Expenses');
  }
  return getChartData(driver, 'expenseDataDump');
}
export async function getIncomeChartData(driver: any) {
  const header = await driver.findElements(webdriver.By.id('IncomesHeader'));
  if (header.length === 0) {
    const btn = await driver.findElements(webdriver.By.id('btn-Incomes'));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();
    await sleep(shortSleep, '--- after click Incomes');
  }
  return getChartData(driver, 'incomeDataDump');
}

export async function submitSettingChange(
  driver: any,
  testDataModelName: string,
  forSubmission: DbSetting,
) {
  await submitIDbSettings([forSubmission], testDataModelName);
  sleep(
    2500, // was dBSleep 6 Get coarse view charts 03
    'after submitting a new setting',
  ); // go to DB and back - takes longer
  // log('go to refreshPage');
  await refreshPage(driver, testDataModelName);
  // log('page refreshed');
}
