import { log, printDebug } from '../../utils';
import webdriver, { ThenableWebDriver, Key } from 'selenium-webdriver';

export function allowExtraSleeps() {
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

export const serverUri = 'https://localhost:3000/#';

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

async function gotoHomePage(driver: ThenableWebDriver) {
  const btnHome = await driver.findElements(webdriver.By.id('btn-Home'));
  // log(`btnMms.length = ${btnMms.length}`);
  expect(btnHome.length === 1).toBe(true);
  await btnHome[0].click();
  if (allowExtraSleeps()) {
    await sleep(shortSleep, '--- on home page');
  }
}

export async function selectModel(
  driver: ThenableWebDriver,
  testDataModelName: string,
) {
  await gotoHomePage(driver);

  if (allowExtraSleeps()) {
    await sleep(1000, 'time for buttons to appear');
  }

  const btnData = await driver.findElements(
    webdriver.By.id(`btn-overview-${testDataModelName}`),
  );

  if (btnData[0] !== undefined) {
    // scrolling
    await driver.executeScript('window.scrollBy(0, -1000)'); // Adjust scrolling with a negative value here

    await btnData[0].click();
  } else {
    log(`BUG : can't see model ${testDataModelName} in model list`);
    await bugSleep("BUG : can't see model in model list? lengthen dBSleep?");
  }
}

export const testUserID = 'TestUserID';

export async function clickButton(driver: ThenableWebDriver, id: string) {
  let btn = [];
  for(let i = 0; i < 10; i = i + 1){
    btn = await driver.findElements(webdriver.By.id(id));
    if (btn.length !== 1) {
      // log(`found ${btn.length} elements with id=${id}`);
      sleep(100, 'button not present yet');
      continue; // try again
    }
    await btn[0].click();
    return;
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
    log(`found ${input.length} elements with id=${id}`);
  }
  expect(input.length === 1).toBe(true);
  const result = await input[0].sendKeys(content);
  //log(`got ${result} from content ${content}`);
  return result;
}

export async function scrollIntoViewByID(
  driver: ThenableWebDriver,
  id: string,
) {
  const input = await driver.findElements(webdriver.By.id(id));
  if (input.length !== 1) {
    log(`found ${input.length} elements with id=${id}`);
  }
  expect(input.length === 1).toBe(true);

  await driver.executeScript('arguments[0].scrollIntoView(true);', input[0]);
  await driver.executeScript('window.scrollBy(0, -5000)');
}

export async function scrollIntoViewByName(
  driver: ThenableWebDriver,
  name: string,
) {
  let input: any[] = [];
  for(let i = 0; i < 10; i = i + 1){
    input = await driver.findElements(webdriver.By.name(name));
    if (input.length !== 1) {
      // log(`attempt ${i}; found ${input.length} elements with name=${name}`);
      sleep(100, 'button not present yet');
      continue; // try again
    }
    break;
  }
  expect(input.length === 1).toBe(true);
  
  await driver.executeScript('arguments[0].scrollIntoView(true);', input[0]);
}

export async function fillInputByName(
  driver: ThenableWebDriver,
  name: string,
  content: string,
) {
  await scrollIntoViewByName(driver, name);

  const input = await driver.findElements(webdriver.By.name(name));
  const result = await input[0].sendKeys(content);
  // log(`got ${result} from content ${content}`);
  return result;
}

export async function replaceWithTestModel(
  driver: ThenableWebDriver,
  testDataModelName: string,
  modelString: string,
) {
  await enterTextControl(driver, `${testDataModelName}${modelString}`);
  await clickButton(driver, 'btn-clear-alert');
}

export async function enterTextControl(
  driver: ThenableWebDriver,
  inputString: string,
){
  await fillInputByName(
    driver,
    'replaceWithJSON',
    inputString,
  );
  const input = await driver.findElements(webdriver.By.id('replaceWithJSON'));
  expect(input.length === 1).toBe(true);
  await input[0].sendKeys(Key.ENTER);
}

export async function beforeAllWork(
  driver: ThenableWebDriver,
  testDataModelName: string,
  modelString: string,
) {
  jest.setTimeout(1000000); // allow time for all these tests to run

  await driver.get('about:blank');
  await driver.get(serverUri);
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

  await clickButton(driver, 'buttonTestLogin');
  await clickButton(driver, 'btn-Home');

  // tests overwrite data using input forms
  // even though we don't expect people to do this
  await enterTextControl(driver, 'overwrite');
  await enterTextControl(driver, 'overview');

  if (testDataModelName !== '' && modelString !== '') {
    await replaceWithTestModel(driver, testDataModelName, modelString);

    await selectModel(driver, testDataModelName);
    if (allowExtraSleeps()) {
      await sleep(calcSleep, '--- after model selected');
    }
    await clickButton(driver, 'btn-Home');
  }
}

export async function cleanUpWork(
  driver: ThenableWebDriver,
  testDataModelName: string,
) {
  await gotoHomePage(driver);

  return new Promise<void>(async resolve => {
    // log(`in clean up model`);
    // log(`go seek model_input name`);
    // log(`seek btn-${testDataModelName}`);

    await selectModel(driver, testDataModelName);
    await clickButton(driver, 'btn-Home');

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
    // log(`deleted model`);
    resolve();
  });
}

// click something to refresh page // hack!
export async function refreshPage(
  driver: ThenableWebDriver,
  testDataModelName: string,
) {
  // log('in refreshPage');
  await selectModel(driver, testDataModelName);
  await clickButton(driver, 'btn-Home');
  return sleep(calcSleep, 'after refreshing a page');
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

export async function getChartData(driver: ThenableWebDriver, label: string) {
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
  driver: ThenableWebDriver,
  switchButtonID: string,
  dataDumpName: string,
) {
  const btn = await driver.findElements(webdriver.By.id(switchButtonID));
  expect(btn.length === 1).toBe(true);
  await btn[0].click();
  if (allowExtraSleeps()) {
    await sleep(shortSleep, '--- after switching to correct context');
  }
  return getChartData(driver, dataDumpName);
}
export async function getAssetChartData(driver: ThenableWebDriver) {
  return getTypedChartData(driver, 'btn-Assets', 'assetDataDump');
}
export async function getDebtChartData(driver: ThenableWebDriver) {
  return getTypedChartData(driver, 'btn-Debts', 'debtDataDump');
}
export async function getExpenseChartData(driver: ThenableWebDriver) {
  return getTypedChartData(driver, 'btn-Expenses', 'expenseDataDump');
}
export async function getIncomeChartData(driver: ThenableWebDriver) {
  return getTypedChartData(driver, 'btn-Incomes', 'incomeDataDump');
}
