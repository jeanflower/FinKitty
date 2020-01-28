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
} from '../../localization/stringConstants';
import { DbModelData, DbSetting } from '../../types/interfaces';
import { log, printDebug } from '../../utils';
import webdriver from 'selenium-webdriver';
import { getDB } from '../../database/database';

function allowExtraSleeps() {
  if (
    process.env.REACT_APP_SERVER_URL_NOT_SECRET ===
    'http://localhost:3001/finkitty/'
  ) {
    // log(`don't need extra sleeps`);
    return false;
  }
  // log(`do need extra sleeps to get data`);
  return true;
}
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

const serverUri = 'https://localhost:3000/#';

export const dBSleep = 1500; // time to round trip through DB
export const calcSleep = 1000; // time to recalculate charts etc
const shortSleep = 200;

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

export function bugSleep(message: string) {
  if (printDebug()) {
    log(`sleep for a long time: ${message}`);
  }
  return new Promise(resolve => setTimeout(resolve, 10000));
}

// Use sleeps to hack page-not-yet-ready issues. TODO : do better.
function sleep(ms: number, message: string) {
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
  if (allowExtraSleeps()) {
    await sleep(shortSleep, '--- on home page');
  }
}

export async function selectModel(driver: any, testDataModelName: string) {
  await gotoHomePage(driver);

  if (allowExtraSleeps()) {
    await sleep(1000, 'time for buttons to appear');
  }

  const btnData = await driver.findElements(
    webdriver.By.id(`btn-overview-${testDataModelName}`),
  );
  if (btnData[0] !== undefined) {
    await btnData[0].click();
  } else {
    log(`BUG : can't see model ${testDataModelName} in model list`);
    await bugSleep("BUG : can't see model in model list? lengthen dBSleep?");
  }
}

export const testUserID = 'TestUserID';

export async function beforeAllWork(
  driver: any,
  testDataModelName: string,
  model: DbModelData,
) {
  jest.setTimeout(60000); // allow time for all these tests to run
  await getDB().ensureModel(testUserID, testDataModelName);
  await getDB().saveModel(testUserID, testDataModelName, model);

  await driver.get('about:blank');
  await driver.get(serverUri);
  if (allowExtraSleeps()) {
    await sleep(
      1500, // was calcSleep twice
      '--- after browser loads URI',
    );
  }
  const btnData = await driver.findElements(webdriver.By.id('buttonTestLogin'));
  if (btnData[0] !== undefined) {
    await btnData[0].click();
  }

  await selectModel(driver, testDataModelName);
  if (allowExtraSleeps()) {
    await sleep(calcSleep, '--- after model selected');
  }
}

export async function cleanUpWork(driver: any, testDataModelName: string) {
  await gotoHomePage(driver);

  return new Promise(async resolve => {
    // log(`in clean up model`);
    // log(`go seek model_input name`);
    // log(`seek btn-${testDataModelName}`);

    await selectModel(driver, testDataModelName);

    const deleteModelButton = await driver.findElement(
      webdriver.By.id(`btn-delete`),
    );
    await deleteModelButton.click();
    // log(`model name = ${content}`);
    // log(`go find delete model button`);
    if (allowExtraSleeps()) {
      await sleep(shortSleep, 'after delete model is clicked');
    }
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
  return sleep(calcSleep, 'after refreshing a page');
}

export async function submitModel(
  driver: any,
  testDataModelName: string,
  model: DbModelData,
) {
  // log(`submitModel data ${showObj(model)}`);
  await getDB().saveModel(testUserID, testDataModelName, model);
  await sleep(
    1000, // was dBSleep 6 Get coarse view charts 03
    'after submitting a model',
  ); // go to DB and back - takes longer
  // log('go to refreshPage');
  return refreshPage(driver, testDataModelName);
  // log('page refreshed');
}

export async function submitSettingChange(
  driver: any,
  testDataModelName: string,
  model: DbModelData,
  forSubmission: DbSetting,
) {
  // log('go to submit model with new settings');
  const newSettings: DbSetting[] = model.settings.map(s => {
    if (s.NAME === forSubmission.NAME) {
      return forSubmission;
    } else {
      return s;
    }
  });

  const newModel = {
    ...model,
    settings: newSettings,
  };
  await submitModel(driver, testDataModelName, newModel);
  return newModel;
}

export function writeTestCode(ary: any[]) {
  let result = 'AUTO_GENERATED_TEST_CODE:\n';
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

async function getTypedChartData(
  driver: any,
  headerID: string,
  switchButtonID: string,
  dataDumpName: string,
) {
  const header = await driver.findElements(webdriver.By.id(headerID));
  if (header.length === 0) {
    const btn = await driver.findElements(webdriver.By.id(switchButtonID));
    expect(btn.length === 1).toBe(true);
    await btn[0].click();
    if (allowExtraSleeps()) {
      await sleep(shortSleep, '--- after switching to correct context');
    }
  }
  return getChartData(driver, dataDumpName);
}
export async function getAssetChartData(driver: any) {
  return getTypedChartData(
    driver,
    'AssetsHeader',
    'btn-Assets',
    'assetDataDump',
  );
}
export async function getExpenseChartData(driver: any) {
  return getTypedChartData(
    driver,
    'ExpensesHeader',
    'btn-Expenses',
    'expenseDataDump',
  );
}
export async function getIncomeChartData(driver: any) {
  return getTypedChartData(
    driver,
    'IncomesHeader',
    'btn-Incomes',
    'incomeDataDump',
  );
}
