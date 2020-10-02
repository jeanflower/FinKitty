import {
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

  it('should create examples', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-create-Simple-example');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should create new clones', async done => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-clone');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should create new models', async done => {
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
