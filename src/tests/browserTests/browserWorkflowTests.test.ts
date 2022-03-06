import {
  roiStart,
  roiEnd,
  TestModel01,
} from '../../localization/stringConstants';
import {
  getDriver,
  clickButton,
  fillInputById,
  getAssetChartData,
  beforeAllWork,
  cleanUpWork,
  serverUri,
  enterTextControl,
} from './browserBaseTypes';
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
  gotoTabPage,
  consumeAlert,
  quitAfterAll,
  settingsTag,
  assetsTag,
  homeTag,
  overviewTag,
} from './browserTestUtils';
import { log } from '../../utils/utils';

import webdriver from 'selenium-webdriver';

let alreadyRunning = false;

async function setNarrowViewRange(driver: any) {
  await gotoTabPage(driver, settingsTag);
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

async function setCashValue(driver: any, val: number) {
  await gotoTabPage(driver, assetsTag);
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

async function makeNewModel(driver: any, name: string) {
  await gotoTabPage(driver, homeTag);
  await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
  await fillInputById(driver, 'createModel', name);
  await clickButton(driver, 'btn-createMinimalModel');
  await acceptAnyAlert(driver);
  await setNarrowViewRange(driver);
}

async function assertCurrentModel(
  driver: any,
  name: string,
  isDirty: boolean,
  testDataModelName: string,
) {
  await gotoTabPage(driver, overviewTag);
  await checkMessage(driver, `${name}`);

  await gotoTabPage(driver, homeTag);
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
    await gotoTabPage(driver, homeTag);
    await clickButton(driver, `btn-overview-${name}`);
    await acceptAnyAlert(driver);
  }
  await gotoTabPage(driver, homeTag);
}

async function switchToModel(driver: any, name: string) {
  await gotoTabPage(driver, homeTag);
  await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
  await clickButton(driver, `btn-overview-${name}`);
  await acceptAnyAlert(driver);
  await gotoTabPage(driver, homeTag);
}

async function modelExists(driver: any, name: string, exists: boolean) {
  await gotoTabPage(driver, homeTag);
  await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
  const btn = await driver.findElements(
    webdriver.By.id(`btn-overview-${name}`),
  );
  // log(`found ${btn.length} elements with id=btn-overview-${name}`);
  if (exists) {
    if (btn.length !== 1) {
      log(`mulitple buttons for ${name}`);
    }
    expect(btn.length === 1).toBe(true);
  } else {
    if (btn.length !== 0) {
      log(`found buttons for ${name}`);
    }
    expect(btn.length === 0).toBe(true);
  }
  await gotoTabPage(driver, homeTag);
}

async function expectCashValue(driver: any, val: number) {
  const ary = await getAssetChartData(driver);
  if (val === 0) {
    expect(ary.datasets.length).toEqual(0);
  } else {
    expect(ary.datasets.length).toEqual(1);
    expect(ary.datasets[0].label).toEqual('Cash');
    expect(ary.datasets[0].data.length).toEqual(1);
    expect(ary.datasets[0].data[0]).toBeCloseTo(val);
  }
}

describe('BrowserWorkflowTests 01', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;
  jest.setTimeout(1000000); // allow time for all these tests to run

  it('new, switch, cancel', async () => {
    const testDataModelName = 'testName1';
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
    await gotoTabPage(driver, homeTag);
    await clickButton(driver, `btn-save-model`);

    await makeNewModel(driver, ex1Name);
    await assertCurrentModel(driver, ex1Name, true, testDataModelName);

    await makeNewModel(driver, ex2Name);
    await assertCurrentModel(driver, ex2Name, true, testDataModelName);

    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await clickButton(driver, `btn-overview-${ex1Name}`);
    await consumeAlert(
      `Continue without saving unsaved model ${ex2Name}?`,
      false,
      driver,
    );

    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
    await cleanUpWork(driver, testDataModelName);
  });

  it('new, clone, save, manipulate cash value', async () => {
    const testDataModelName = 'testName2';
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
    await gotoTabPage(driver, homeTag);
    await clickButton(driver, `btn-save-model`);

    await makeNewModel(driver, ex1Name);
    await assertCurrentModel(driver, ex1Name, true, testDataModelName);

    await expectCashValue(driver, 0);
    await setCashValue(driver, 10);
    await expectCashValue(driver, 10);

    await makeNewModel(driver, ex2Name);
    await assertCurrentModel(driver, ex2Name, true, testDataModelName);

    await switchToModel(driver, ex1Name);
    await assertCurrentModel(driver, ex1Name, true, testDataModelName);
    await expectCashValue(driver, 10);

    await switchToModel(driver, ex2Name);
    await assertCurrentModel(driver, ex2Name, true, testDataModelName);

    await expectCashValue(driver, 0);
    await setCashValue(driver, 20);
    await expectCashValue(driver, 20);

    await gotoTabPage(driver, homeTag);
    await clickButton(driver, 'btn-save-model');
    await assertCurrentModel(driver, ex2Name, false, testDataModelName);

    ///////
    // await checkMessage(driver, 'got this far');
    //////

    await gotoTabPage(driver, homeTag);

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');
    await enterTextControl(driver, 'overwrite');

    ///////
    // await checkMessage(driver, 'got this far');
    //////

    await modelExists(driver, ex1Name, false);
    await modelExists(driver, ex2Name, true);

    await switchToModel(driver, ex2Name);
    await expectCashValue(driver, 20);
    await setCashValue(driver, 30);
    await expectCashValue(driver, 30);

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');
    await enterTextControl(driver, 'overwrite');

    await modelExists(driver, ex1Name, false);
    await modelExists(driver, ex2Name, true);

    await switchToModel(driver, ex2Name);
    await expectCashValue(driver, 20);

    await gotoTabPage(driver, homeTag);
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, 'btn-clone');

    await modelExists(driver, ex1Name, true);
    await modelExists(driver, ex2Name, true);

    await switchToModel(driver, ex1Name);
    await expectCashValue(driver, 20);

    await gotoTabPage(driver, homeTag);
    await clickButton(driver, 'btn-delete');
    await consumeAlert(
      `delete all data in model ${ex1Name} - you sure?`,
      true,
      driver,
    );

    await modelExists(driver, ex1Name, false);
    await modelExists(driver, ex2Name, true);

    await switchToModel(driver, ex2Name);

    // explore replace-with-new, ...

    // await checkMessage(driver, 'got this far');

    await gotoTabPage(driver, homeTag);
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
