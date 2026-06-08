import { log, printDebug, showObj } from "../../utils/utils";
import webdriver, { ThenableWebDriver, Key } from "selenium-webdriver";
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
  monitoringTag,
  waitForEvalReady,
  alertIsShowing,
  acceptAnyAlert,
  acceptAlertIfPresent,
} from "./browserTestUtils";
import { inspect } from 'util'
inspect
showObj;

export const serverUri = "http://localhost:3000/#";

/** Default Selenium window size; override with FINKITTY_BROWSER_WINDOW_WIDTH / _HEIGHT. */
export const defaultBrowserWindowWidth = 1280;
export const defaultBrowserWindowHeight = 720;

export const dBSleep = 1500; // time to round trip through DB
export const calcSleep = 1000; // time to recalculate charts etc
const shortSleep = 200;

function previewText(s: string, max = 80): string {
  if (s.length <= max) {
    return s;
  }
  return `${s.slice(0, max)}…`;
}

async function describeFillTarget(el: any): Promise<string> {
  try {
    const tag = await el.getTagName();
    const type = await el.getAttribute("type");
    const idAttr = await el.getAttribute("id");
    const nameAttr = await el.getAttribute("name");
    const displayed = await el.isDisplayed();
    const enabled = await el.isEnabled();
    return `element <${tag}> id="${idAttr ?? ""}" name="${nameAttr ?? ""}" type="${type ?? ""}" displayed=${displayed} enabled=${enabled}`;
  } catch (stateErr: unknown) {
    const m = stateErr instanceof Error ? stateErr.message : String(stateErr);
    return `(could not inspect element: ${m})`;
  }
}

/** Always visible in Jest; `log()` is often a no-op when doLogIncremental is false. */
function reportFillFailure(line: string): void {
  /* eslint-disable no-console */
  console.error(`[browser test fill] ${line}`);
  /* eslint-enable no-console */
  log(line);
}

async function scrollElementIntoViewWithContext(
  driver: ThenableWebDriver,
  el: any,
  contextLine: string,
): Promise<void> {
  try {
    await driver.executeScript(
      `arguments[0].scrollIntoView({ block: 'center' });`,
      el,
    );
  } catch (e: unknown) {
    const detail = await describeFillTarget(el);
    const orig = e instanceof Error ? e.message : String(e);
    const line = `${contextLine} | ${detail} | ${orig}`;
    reportFillFailure(line);
    throw new Error(line);
  }
}

async function sendKeysWithFillContext(
  el: any,
  keys: string,
  contextLine: string,
): Promise<unknown> {
  try {
    return await el.sendKeys(keys);
  } catch (e: unknown) {
    const detail = await describeFillTarget(el);
    const orig = e instanceof Error ? e.message : String(e);
    const line = `${contextLine} | ${detail} | ${orig}`;
    reportFillFailure(line);
    throw new Error(line);
  }
}

function parseBrowserWindowDimension(
  envName: string,
  defaultValue: number,
): number {
  const raw = process.env[envName];
  if (raw === undefined || raw.trim() === "") {
    return defaultValue;
  }
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n < 400) {
    /* eslint-disable no-console */
    console.warn(
      `[browser tests] Invalid ${envName}=${JSON.stringify(raw)}; using ${defaultValue}`,
    );
    /* eslint-enable no-console */
    return defaultValue;
  }
  return n;
}

export function getBrowserWindowSize(): { width: number; height: number } {
  return {
    width: parseBrowserWindowDimension(
      "FINKITTY_BROWSER_WINDOW_WIDTH",
      defaultBrowserWindowWidth,
    ),
    height: parseBrowserWindowDimension(
      "FINKITTY_BROWSER_WINDOW_HEIGHT",
      defaultBrowserWindowHeight,
    ),
  };
}

const seleniumDebugNoise =
  /Selenium Manager binary found at|^Driver path:|^Browser path:/;

let seleniumConsoleQuietInstalled = false;

/** Suppress Selenium Manager console.debug spam (browser tests only — not in jest.setup.js). */
function installSeleniumConsoleQuietOnce() {
  if (seleniumConsoleQuietInstalled) {
    return;
  }
  seleniumConsoleQuietInstalled = true;
  const originalDebug = console.debug.bind(console);
  console.debug = (...args: unknown[]) => {
    const message = args.map((a) => String(a)).join(" ");
    if (seleniumDebugNoise.test(message)) {
      return;
    }
    originalDebug(...args);
  };
}

/** True when FINKITTY_BROWSER_HEADLESS is 1, true, yes, or on (case-insensitive). */
export function isBrowserHeadless(): boolean {
  const raw = process.env.FINKITTY_BROWSER_HEADLESS;
  if (raw === undefined || raw.trim() === "") {
    return false;
  }
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

export function getDriver() {
  // from
  // https://jakebinstein.com/blog/how-to-set-browser-capabilities-in-webdriverjs-example-headless-mode/

  installSeleniumConsoleQuietOnce();

  const browserOptions: { args: string[] } = {
    args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"],
  };

  const headless = isBrowserHeadless();
  if (headless) {
    browserOptions.args.unshift("--headless=new");
  }

  const { width, height } = getBrowserWindowSize();
  if (headless) {
    browserOptions.args.push(`--window-size=${width},${height}`);
  }

  // Set up the browser capabilities.
  // Some lines could be condensed into one-liners if that's your preferred style.
  let browserCapabilities = webdriver.Capabilities.chrome();
  browserCapabilities = browserCapabilities.set(
    "goog:chromeOptions",
    browserOptions,
  );
  const builder = new webdriver.Builder().forBrowser("chrome");
  const driver = builder.withCapabilities(browserCapabilities).build();

  if (printDebug()) {
    const pageZoom = process.env.FINKITTY_BROWSER_PAGE_ZOOM?.trim();
    log(
      `[browser tests] ${headless ? "Headless, " : ""}window ${width}×${height}px` +
        (pageZoom ? `, page zoom ${pageZoom}` : ""),
    );
  }
  void driver.manage().window().setRect({ x: 0, y: 0, width, height });

  return driver;
}

/** Shrink page content for small screens (CSS zoom via FINKITTY_BROWSER_PAGE_ZOOM). */
export async function applyBrowserPageZoom(driver: ThenableWebDriver): Promise<void> {
  const pageZoom = process.env.FINKITTY_BROWSER_PAGE_ZOOM;
  if (pageZoom === undefined || pageZoom.trim() === "") {
    return;
  }
  await driver.executeScript(
    `document.documentElement.style.zoom = ${JSON.stringify(pageZoom.trim())}`,
  );
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

  await sleep(1000, "time for model buttons to appear");

  // await scrollIntoViewByID(driver, `btn-overview-${testDataModelName}`);
  await driver.executeScript(
    "setTimeout(function () {window.scrollBy(0, -10000);},200);",
  );

  const btnData = await driver.findElements(
    webdriver.By.id(`btn-overview-${testDataModelName}`),
  );

  // console.log(`after finding elements with id = btn-overview-${testDataModelName}`);

  if (btnData[0] !== undefined) {
    await driver.executeScript(
      "setTimeout(function () {window.scrollBy(0, -10000);},200);",
    );

    await sleep(
      1000,
      `time for button with id = btn-overview-${testDataModelName} to be ready`,
    );

    await btnData[0].click();
    await waitForEvalReady(driver);
  } else {
    log(`BUG : can't see model ${testDataModelName} in model list`);
    await bugSleep("BUG : can't see model in model list? lengthen dBSleep?");
  }
}

export const testUserID = "TestUserID";

export async function clickButton(driver: ThenableWebDriver, id: string) {
  let btn = [];
  for (let i = 0; i < 10; i = i + 1) {
    btn = await driver.findElements(webdriver.By.id(id));
    if (btn.length !== 1) {
      // log(`found ${btn.length} elements with id=${id}`);
      await sleep(1000, "button not present yet");
      continue; // try again
    }
    await sleep(100, `let button with id ${id} be ready`); // used to say 1000
    await driver.executeScript(
      `arguments[0].scrollIntoView({ block: 'center' });`,
      btn[0],
    );
    await sleep(100, `after scroll into view for button ${id}`);
    try {
      await btn[0].click();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("element click intercepted") ||
        msg.includes("not clickable")
      ) {
        // CSS zoom (FINKITTY_BROWSER_PAGE_ZOOM) can misalign native Selenium clicks.
        await driver.executeScript("arguments[0].click();", btn[0]);
      } else {
        throw err;
      }
    }
    return;
  }
  if (btn.length !== 1) {
    const msg = `clickButton: expected exactly 1 element with id="${id}", found ${btn.length}`;
    reportFillFailure(msg);
  }
  expect({ buttonId: id, elementCount: btn.length }).toEqual({
    buttonId: id,
    elementCount: 1,
  });
}

export async function fillInputById(
  driver: ThenableWebDriver,
  id: string,
  content: string,
) {
  let input: any[] = [];
  for (let i = 0; i < 10; i = i + 1) {
    input = await driver.findElements(webdriver.By.id(id));
    if (input.length === 1) {
      break;
    }
    await sleep(200, `input id=${id} not ready yet`);
  }
  if (input.length !== 1) {
    log(`found ${input.length} elements with id=${id} for content ${content}`);
  }
  expect(input.length === 1).toBe(true);
  await scrollElementIntoViewWithContext(
    driver,
    input[0],
    `fillInputById id="${id}" step="scroll into view" content="${previewText(content)}"`,
  );
  const byIdCtx = (step: string) =>
    `fillInputById id="${id}" step="${step}" content="${previewText(content)}"`;

  if (id === "liquidateForCash") {
    // clear away a default 'No' before adding new text
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear default (1/2)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear default (2/2)"),
    );
  }
  if (id === "fromValue") {
    // clear away a default '100%' before adding new text
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear fromValue (1/4)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear fromValue (2/4)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear fromValue (3/4)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear fromValue (4/4)"),
    );
  }
  if (id === "toValue") {
    // clear away a default '100%' before adding new text
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear toValue (1/4)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear toValue (2/4)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear toValue (3/4)"),
    );
    await sendKeysWithFillContext(
      input[0],
      Key.BACK_SPACE,
      byIdCtx("clear toValue (4/4)"),
    );
  }
  const result = await sendKeysWithFillContext(
    input[0],
    content,
    byIdCtx("type value"),
  );
  //log(`got ${result} from content ${content}`);
  return result;
}

async function clearTextInputElement(input: webdriver.IWebElement) {
  await input.click();
  const value = await input.getAttribute("value");
  const length = value ? value.length : 0;
  for (let i = 0; i < length + 8; i = i + 1) {
    await input.sendKeys(Key.BACK_SPACE);
  }
}

export async function clearInputById(
  driver: ThenableWebDriver,
  id: string,
) {
  if (id === "fromIncomeSelectIncomeForm") {
    return;
  }
  const input = await driver.findElements(webdriver.By.id(id));
  if (input.length === 1) {
    await clearTextInputElement(input[0]);
  }
}

export async function clearInputByName(
  driver: ThenableWebDriver,
  name: string,
) {
  const input = await driver.findElements(webdriver.By.name(name));
  if (input.length === 1) {
    await clearTextInputElement(input[0]);
  }
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
    input = await driver.findElements(
      byName ? webdriver.By.name(name) : webdriver.By.id(name),
    );
    if (input.length !== 1) {
      // log(`attempt ${i}; found ${input.length} elements with name=${name}`);
      await sleep(100, "button not present yet");
      continue; // try again
    }
    break;
  }
  if (input.length !== 1) {
    const msg = `scrollIntoView: expected 1 element for ${byName ? "name" : "id"}="${name}", found ${input.length}`;
    reportFillFailure(msg);
    log(`found ${input.length} elements for ${name}, expected 1 element`);
    // expect(input.length === 1).toBe(true);
  } else {
    const by = byName ? "name" : "id";
    await scrollElementIntoViewWithContext(
      driver,
      input[0],
      `scrollIntoView before fill (${by}="${name}")`,
    );
  }
}

export async function fillInputByName(
  driver: ThenableWebDriver,
  name: string,
  content: string,
) {
  await sleep(shortSleep, `--- before looking for input to type ${content}`);

  await scrollIntoView(driver, name, true);

  const input = await driver.findElements(webdriver.By.name(name));
  if (input.length === 1) {
    const byNameCtx = (step: string) =>
      `fillInputByName name="${name}" step="${step}" content="${previewText(content)}"`;
    await sendKeysWithFillContext(
      input[0],
      content,
      byNameCtx("type value"),
    );
  } else {
    log(
      `fillInputByName: expected 1 input name="${name}", found ${input.length}; content="${previewText(content)}"`,
    );
  }
}

export async function enterTextControl(
  driver: ThenableWebDriver,
  inputString: string,
) {
  await driver.executeScript("window.scrollBy(0, 1000)");
  await fillInputByName(driver, "replaceWithJSON", inputString);
  const input = await driver.findElements(webdriver.By.id("replaceWithJSON"));
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
  await clickButton(driver, "btn-clear-alert");
}

export async function beforeAllWork(
  driver: ThenableWebDriver,
  testDataModelName: string,
  modelString: string,
) {
  if (await alertIsShowing(driver)) {
    await acceptAlertIfPresent(driver, 1000);
  }
  await driver.get("about:blank");
  await driver.get(serverUri);
  await sleep(
    1500, // was calcSleep twice
    "--- after browser loads URI",
  );

  await applyBrowserPageZoom(driver);

  // Handle errors around SSL certificates
  // push through "Advanced" and "Proceed"
  let x = await driver.findElements(webdriver.By.id("details-button"));
  if (x[0] !== undefined) {
    // console.log('found details button!');
    await x[0].click();
    x = await driver.findElements(webdriver.By.id("proceed-link"));
    if (x[0] !== undefined) {
      // console.log('found proceed link!');
      await x[0].click();
    }
  }

  await clickButton(driver, "buttonTestLogin");
  await gotoTabPage(driver, homeTag);

  // tests overwrite data using input forms
  // even though we don't expect people to do this
  await enterTextControl(driver, "overwrite");
  await enterTextControl(driver, "advancedUI");

  await sleep(200, "wait for settings to take effect");

  if (testDataModelName !== "" && modelString !== "") {
    await deleteIfExists(testDataModelName, driver);
    await replaceWithTestModel(driver, testDataModelName, modelString);

    await selectModel(driver, testDataModelName);
    await sleep(calcSleep, "--- after model selected");
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

  await driver.executeScript("window.scrollBy(0, 100)");

  const deleteModelButton = await driver.findElement(
    webdriver.By.id(`btn-delete`),
  );
  await sleep(shortSleep, `wait for button with id btn-delete  to be ready`);

  await deleteModelButton.click();
  // log(`model name = ${content}`);
  // log(`go find delete model button`);
  await sleep(shortSleep, "after delete model is clicked");

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
  return sleep(calcSleep, "after refreshing a page");
}

export function makeTestCode(ary: any) {
  console.log(`writing test data for ${inspect(ary)}`);
  let result = "";
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
  const content = await divElement.getAttribute("value");
  // log(`content = ${content}`);
  // check the content matches our expectations
  try {
    const ary = JSON.parse(content);
    return ary;
  } catch(err) {
    console.log(`can't JSON-parse dumped data for ${label}, get ${content}`);
  }
}

async function getTypedDumpData(
  driver: ThenableWebDriver,
  switchButtonID: string,
  dataDumpName: string,
) {
  await gotoTabPage(driver, switchButtonID);
  return await getDumpedData(driver, dataDumpName);
}

export async function getDataDumpFromPage(
  driver: ThenableWebDriver,
  type: string,
) {
  const pageForDataDump = new Map<string, string>();
  pageForDataDump.set("assetChartDataDump", assetsTag);
  pageForDataDump.set("debtChartDataDump", debtsTag);
  pageForDataDump.set("expenseChartDataDump", expensesTag);
  pageForDataDump.set("incomeChartDataDump", incomesTag);
  pageForDataDump.set("debtChartDataDump", debtsTag);
  pageForDataDump.set("assetsTableDataDump", assetsTag);
  pageForDataDump.set("assetsOverviewTableDataDump", overviewTag);
  pageForDataDump.set("debtsTableDataDump", debtsTag);
  pageForDataDump.set("debtsOverviewTableDataDump", overviewTag);
  pageForDataDump.set("reportTableDataDump", reportTag);
  pageForDataDump.set("todaysSettingsTableDataDump", settingsTag);
  pageForDataDump.set("settingsTableDataDump", settingsTag);
  pageForDataDump.set("settingsTableOverviewDataDump", overviewTag);
  pageForDataDump.set("triggersTableDataDump", datesTag);
  pageForDataDump.set("triggersTableOverviewDataDump", overviewTag);
  pageForDataDump.set("customTransactionsTableDataDump", transactionsTag);
  pageForDataDump.set("customTransactionsOverviewTableDataDump", overviewTag);
  pageForDataDump.set("autogenTransactionsTableDataDump", transactionsTag);
  pageForDataDump.set("autogenTransactionsOverviewTableDataDump", overviewTag);
  pageForDataDump.set("bondTransactionsTableDataDump", transactionsTag);
  pageForDataDump.set("bondTransactionsOverviewTableDataDump", overviewTag);
  pageForDataDump.set("expensesSummaryexpensesMonitoringForSettingTableDataDump", monitoringTag);
  pageForDataDump.set("expensesSummaryexpensesMonitoring2024TableDataDump", monitoringTag);
  pageForDataDump.set("expensesDetailsexpensesMonitoringTableDataDump", monitoringTag);

  const tag = `${type}DataDump`;
  const page = pageForDataDump.get(tag);
  if (page === undefined) {
    throw new Error(`page should be defined for ${tag}`);
  } else {
    return getTypedDumpData(driver, page, tag);
  }
}
