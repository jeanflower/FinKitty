import { log, printDebug, showObj } from '../../utils/utils';
import webdriver, { ThenableWebDriver, Key } from 'selenium-webdriver';
import {
  homeTag,
  assetsTag,
  debtsTag,
  expensesTag,
  gotoTabPage,
  incomesTag,
  reportTag,
  settingsTag,
  datesTag,
  transactionsTag,
  overviewTag,
  deleteIfExists,
  sleep,
} from './browserTestUtils';

showObj;

export const serverUri = 'http://localhost:3000/#';

export const dBSleep = 1500; // time to round trip through DB
export const calcSleep = 1000; // time to recalculate charts etc
const shortSleep = 200;

export function getDriver() {
  // from
  // https://jakebinstein.com/blog/how-to-set-browser-capabilities-in-webdriverjs-example-headless-mode/

  const browserOptions = {
    args: ['--disable-gpu', '--no-sandbox'],
  };

  // this hasn't worked for a long time - needs fresh attention
  //if (headless) {
  //  browserOptions.args.unshift('--headless');
  //}

  // Set up the browser capabilities.
  // Some lines could be condensed into one-liners if that's your preferred style.
  let browserCapabilities = webdriver.Capabilities.chrome();
  browserCapabilities = browserCapabilities.set(
    'goog:chromeOptions',
    browserOptions,
  );
  const builder = new webdriver.Builder().forBrowser('chrome');
  const driver = builder.withCapabilities(browserCapabilities).build();

  return driver;
}

export function bugSleep(message: string) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`sleep for a long time: ${message}`);
  }
  return new Promise((resolve) => setTimeout(resolve, 10000));
}

export async function selectModel(
  driver: ThenableWebDriver,
  testDataModelName: string,
) {
  await gotoTabPage(driver, homeTag);

  await sleep(1000, 'time for model buttons to appear');

  // await scrollIntoViewByID(driver, `btn-overview-${testDataModelName}`);
  await driver.executeScript('setTimeout(function () {window.scrollBy(0, -10000);},200);');

  const btnData = await driver.findElements(
    webdriver.By.id(`btn-overview-${testDataModelName}`),
  );

  // console.log(`after finding elements with id = btn-overview-${testDataModelName}`);

  if (btnData[0] !== undefined) {

    await driver.executeScript('setTimeout(function () {window.scrollBy(0, -10000);},200);');

    await sleep(1000, `time for button with id = btn-overview-${testDataModelName} to be ready`);

    await btnData[0].click();
  } else {
    log(`BUG : can't see model ${testDataModelName} in model list`);
    await bugSleep("BUG : can't see model in model list? lengthen dBSleep?");
  }
}

export const testUserID = 'TestUserID';

export async function clickButton(driver: ThenableWebDriver, id: string) {
  let btn = [];
  for (let i = 0; i < 10; i = i + 1) {
    btn = await driver.findElements(webdriver.By.id(id));
    if (btn.length !== 1) {
      // log(`found ${btn.length} elements with id=${id}`);
      await sleep(1000, 'button not present yet');
      continue; // try again
    }
    await sleep(1000, `let button with id ${id} be ready`);
    await btn[0].click();
    return;
  }
  if (btn.length !== 1) {
    log(`there is not one button with id = ${id} - test will fail`);
  }
  expect(btn.length === 1).toBe(true);
}

export async function fillInputById(
  driver: ThenableWebDriver,
  id: string,
  content: string,
) {
  const input = await driver.findElements(webdriver.By.id(id));
  if (input.length !== 1) {
    // log(`found ${input.length} elements with id=${id} for content ${content}`);
  }
  expect(input.length === 1).toBe(true);
  if (id === 'liquidateForCash') {
    // clear away a default 'No' before adding new text
    await input[0].sendKeys(Key.BACK_SPACE); //N
    await input[0].sendKeys(Key.BACK_SPACE); //o
  }
  if (id === 'fromValue') {
    // clear away a default '100%' before adding new text
    await input[0].sendKeys(Key.BACK_SPACE); //1
    await input[0].sendKeys(Key.BACK_SPACE); //0
    await input[0].sendKeys(Key.BACK_SPACE); //0
    await input[0].sendKeys(Key.BACK_SPACE); //%
  }
  if (id === 'toValue') {
    // clear away a default '100%' before adding new text
    await input[0].sendKeys(Key.BACK_SPACE); //1
    await input[0].sendKeys(Key.BACK_SPACE); //0
    await input[0].sendKeys(Key.BACK_SPACE); //0
    await input[0].sendKeys(Key.BACK_SPACE); //%
  }
  const result = await input[0].sendKeys(content);
  //log(`got ${result} from content ${content}`);
  return result;
}

export async function scrollIntoViewByID(
  driver: ThenableWebDriver,
  id: string,
) {
  return scrollIntoView(driver, id, false);
  /*
  const input = await driver.findElements(webdriver.By.id(id));
  if (input.length !== 1) {
    log(`found ${input.length} elements with id=${id}`);
  }
  expect(input.length === 1).toBe(true);

  await driver.executeScript('arguments[0].scrollIntoView(true);', input[0]);
  await driver.executeScript('window.scrollBy(0, -5000)');
  */
}

async function scrollIntoView(
  driver: ThenableWebDriver,
  name: string,
  byName: boolean,
) {
  let input: any[] = [];
  for (let i = 0; i < 10; i = i + 1) {
    input = await driver.findElements(byName ? webdriver.By.name(name) : webdriver.By.id(name));
    if (input.length !== 1) {
      // log(`attempt ${i}; found ${input.length} elements with name=${name}`);
      await sleep(100, 'button not present yet');
      continue; // try again
    }
    break;
  }
  if (input.length !== 1) {
    log(`found ${input.length} elements for ${name}, expected 1 element`);
    // expect(input.length === 1).toBe(true);
  } else {
    await driver.executeScript(`arguments[0].scrollIntoView({ block: 'center' });`, input[0]);
  }
}

export async function fillInputByName(
  driver: ThenableWebDriver,
  name: string,
  content: string,
) {
  await sleep(
    shortSleep,
    `--- before looking for input to type ${content}`,
  );

  await scrollIntoView(driver, name, true);

  const input = await driver.findElements(webdriver.By.name(name));
  if (input.length === 1) {
    await input[0].sendKeys(content);
  } else {
    log(`expected 1 input for ${name}, failed to sendKeys ${content}`);
  }
}

export async function enterTextControl(
  driver: ThenableWebDriver,
  inputString: string,
) {
  await driver.executeScript('window.scrollBy(0, 1000)');
  await fillInputByName(driver, 'replaceWithJSON', inputString);
  const input = await driver.findElements(webdriver.By.id('replaceWithJSON'));
  if (input.length !== 1) {
    // expect(input.length === 1).toBe(true);
    log(`expected 1 input for ${input}, failing to sendKeys ENTER`);
  } else {
    await input[0].sendKeys(Key.ENTER);
  }
}

export async function replaceWithTestModel(
  driver: ThenableWebDriver,
  testDataModelName: string,
  modelString: string,
) {
  await enterTextControl(driver, `${testDataModelName}${modelString}`);
  await clickButton(driver, 'btn-clear-alert');
}

export async function beforeAllWork(
  driver: ThenableWebDriver,
  testDataModelName: string,
  modelString: string,
) {
  await driver.get('about:blank');
  await driver.get(serverUri);
  await sleep(
    1500, // was calcSleep twice
    '--- after browser loads URI',
  );

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

  await clickButton(driver, 'buttonTestLogin');
  await gotoTabPage(driver, homeTag);

  // tests overwrite data using input forms
  // even though we don't expect people to do this
  await enterTextControl(driver, 'overwrite');
  await enterTextControl(driver, 'advancedUI');

  if (testDataModelName !== '' && modelString !== '') {
    await deleteIfExists(testDataModelName, driver);
    await replaceWithTestModel(driver, testDataModelName, modelString);

    await selectModel(driver, testDataModelName);
    await sleep(calcSleep, '--- after model selected');
    await gotoTabPage(driver, homeTag);
  }
}

export async function cleanUpWork(
  driver: ThenableWebDriver,
  testDataModelName: string,
) {
  await gotoTabPage(driver, homeTag);

  // log(`in clean up model`);
  // log(`seek btn-${testDataModelName}`);

  await selectModel(driver, testDataModelName);
  await gotoTabPage(driver, homeTag);

  await driver.executeScript('window.scrollBy(0, 100)');

  const deleteModelButton = await driver.findElement(
    webdriver.By.id(`btn-delete`),
  );
  await sleep(shortSleep, `wait for button with id btn-delete  to be ready`);

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
  // log(`deleted model`);
}

// click something to refresh page // hack!
export async function refreshPage(
  driver: ThenableWebDriver,
  testDataModelName: string,
) {
  // log('in refreshPage');
  await selectModel(driver, testDataModelName);
  await gotoTabPage(driver, homeTag);
  return sleep(calcSleep, 'after refreshing a page');
}

export function makeTestCode(ary: any) {
  let result = '';
  result += `expect(ary.labels.length).toEqual(${ary.labels.length});\n`;
  for (let i = 0; i < ary.labels.length; i += 1) {
    result += `expect(ary.labels[${i}]).toEqual('${ary.labels[i]}');\n`;
  }
  result += `expect(ary.datasets.length).toEqual(${ary.datasets.length});\n`;
  for (let i = 0; i < ary.datasets.length; i += 1) {
    result += `expect(ary.datasets[${i}].label).toEqual('${ary.datasets[i].label}');\n`;
    result +=
      `expect(ary.datasets[${i}].data.length).toEqual(` +
      `${ary.datasets[i].data.length});\n`;
    for (let j = 0; j < ary.datasets[i].data.length; j += 1) {
      result +=
        `expect(ary.datasets[${i}].data[${j}]).toBeCloseTo(` +
        `${ary.datasets[i].data[j]}, 6);\n`;
    }
  }

  return result;
}
export function writeTestCode(ary: any) {
  log(makeTestCode(ary));
}
export async function getDumpedData(driver: ThenableWebDriver, label: string) {
  // locate the asset text dump
  const divElement = await driver.findElement(webdriver.By.id(label));
  // extract the content
  const content = await divElement.getAttribute('value');
  // log(`content = ${content}`);
  // check the content matches our expectations
  const ary = JSON.parse(content);
  return ary;
}

async function getTypedDumpData(
  driver: ThenableWebDriver,
  switchButtonID: string,
  dataDumpName: string,
) {
  await driver.executeScript('window.scrollBy(0, -4000)');
  const btn = await driver.findElements(webdriver.By.id(switchButtonID));
  expect(btn.length === 1).toBe(true);
  await btn[0].click();
  await sleep(shortSleep, '--- after switching to correct context');
  return await getDumpedData(driver, dataDumpName);
}

export async function getDataDumpFromPage(
  driver: ThenableWebDriver,
  type: string,
) {
  const pageForDataDump = new Map<string, string>();
  pageForDataDump.set('assetChartDataDump', assetsTag);
  pageForDataDump.set('debtChartDataDump', debtsTag);
  pageForDataDump.set('expenseChartDataDump', expensesTag);
  pageForDataDump.set('incomeChartDataDump', incomesTag);
  pageForDataDump.set('debtChartDataDump', debtsTag);
  pageForDataDump.set('assetsTableDataDump', assetsTag);
  pageForDataDump.set('assetsOverviewTableDataDump', overviewTag);
  pageForDataDump.set('debtsTableDataDump', debtsTag);
  pageForDataDump.set('debtsOverviewTableDataDump', overviewTag);
  pageForDataDump.set('reportTableDataDump', reportTag);
  pageForDataDump.set('todaysSettingsTableDataDump', settingsTag);
  pageForDataDump.set('settingsTableDataDump', settingsTag);
  pageForDataDump.set('settingsTableOverviewDataDump', overviewTag);
  pageForDataDump.set('triggersTableDataDump', datesTag);
  pageForDataDump.set('triggersTableOverviewDataDump', overviewTag);
  pageForDataDump.set('customTransactionsTableDataDump', transactionsTag);
  pageForDataDump.set('customTransactionsOverviewTableDataDump', overviewTag);
  pageForDataDump.set('autogenTransactionsTableDataDump', transactionsTag);
  pageForDataDump.set('autogenTransactionsOverviewTableDataDump', overviewTag);
  pageForDataDump.set('bondTransactionsTableDataDump', transactionsTag);
  pageForDataDump.set('bondTransactionsOverviewTableDataDump', overviewTag);

  const tag = `${type}DataDump`;
  const page = pageForDataDump.get(tag);
  if (page === undefined) {
    throw new Error(`page should be defined for ${tag}`);
  } else {
    return getTypedDumpData(driver, page, tag);
  }
}
