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
  writeTestCode,
  getExpenseChartData,
  getIncomeChartData,
  getDebtChartData,
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
  consumeAlert,
  quitAfterAll,
} from './browserTestUtils';
import { log } from './../../utils';

import webdriver from 'selenium-webdriver';

let alreadyRunning = false;

async function setNarrowViewRange(driver: any) {
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

async function setCashValue(driver: any, val: number) {
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

async function makeNewModel(driver: any, name: string) {
  await clickButton(driver, 'btn-Home');
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
  await clickButton(driver, 'btn-Overview');
  await checkMessage(driver, `${name}`);

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

async function switchToModel(driver: any, name: string) {
  await clickButton(driver, 'btn-Home');
  await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
  await clickButton(driver, `btn-overview-${name}`);
  await acceptAnyAlert(driver);
  await clickButton(driver, 'btn-Home');
}

async function modelExists(driver: any, name: string, exists: boolean) {
  await clickButton(driver, 'btn-Home');
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
  await clickButton(driver, 'btn-Home');
}

async function expectCashValue(driver: any, val: number) {
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
    expect(ary[0].dataPoints[0].y).toBeCloseTo(val);
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

  it('new, switch, cancel', async done => {
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
    await clickButton(driver, 'btn-Home');
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
    done();
  });

  it('new, clone, save, manipulate cash value', async done => {
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
    await clickButton(driver, 'btn-Home');
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

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-save-model');
    await assertCurrentModel(driver, ex2Name, false, testDataModelName);

    ///////
    // await checkMessage(driver, 'got this far');
    //////

    await clickButton(driver, 'btn-Home');

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');
    await enterTextControl(driver, 'overwrite');
    await enterTextControl(driver, 'overview');

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
    await enterTextControl(driver, 'overview');

    await modelExists(driver, ex1Name, false);
    await modelExists(driver, ex2Name, true);

    await switchToModel(driver, ex2Name);
    await expectCashValue(driver, 20);

    await clickButton(driver, 'btn-Home');
    await fillInputById(driver, 'createModel', ex1Name);
    await clickButton(driver, 'btn-clone');

    await modelExists(driver, ex1Name, true);
    await modelExists(driver, ex2Name, true);

    await switchToModel(driver, ex1Name);
    await expectCashValue(driver, 20);

    await clickButton(driver, 'btn-Home');
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

    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

async function testModelCreation(
  driver: any,
  createButtonID: string,
  testDataModelName: string,
) {
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
  await checkMessage(driver, `${testDataModelName}`);
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
  await checkMessage(driver, `${ex1Name}`);
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
  await checkMessage(driver, `${ex1Name}`);
  await clickButton(driver, 'btn-Home');

  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 0).toBe(true);
  await clickButton(driver, 'btn-Overview');
  await checkMessage(driver, `${ex1Name}`);
  await clickButton(driver, 'btn-Home');
  await clickButton(driver, 'btn-save-model');
  await clickButton(driver, createButtonID);
  btn = await driver.findElements(webdriver.By.id(`btn-overview-${ex2Name}`));
  // log(`found ${btn.length} elements with id=${id}`);
  expect(btn.length === 1).toBe(true);
  await clickButton(driver, 'btn-Overview');
  await checkMessage(driver, `${ex2Name}`);
  await clickButton(driver, 'btn-Home');

  // try to create ex1Name but we're in ex2Name and
  // ex2Name is not saved, ex1Name is present
  // try to create ex1Name
  // warn ex2 is unsaved
  // warn ex1 exists
  await fillInputById(driver, 'createModel', ex1Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex1Name}, you sure?`, false, driver);
  await clickButton(driver, 'btn-Home');

  //await checkMessage(driver, 'wrong');

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex1Name}, you sure?`, true, driver);
  await consumeAlert(
    `Continue without saving unsaved model ${ex2Name}?`,
    false,
    driver,
  );
  await clickButton(driver, 'btn-Home');

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex1Name}, you sure?`, true, driver);
  await consumeAlert(
    `Continue without saving unsaved model ${ex2Name}?`,
    true,
    driver,
  );
  await clickButton(driver, 'btn-Home');

  await clickButton(driver, 'btn-save-model');

  // try to create ex2Name but we're in ex1Name and
  // ex1Name is saved, ex2Name is present
  // warn ex2 exists
  await fillInputById(driver, 'createModel', ex2Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);
  await clickButton(driver, 'btn-Home');

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);
  await clickButton(driver, 'btn-Home');

  // try to create ex2Name but we're in ex2Name and
  // ex2Name is not saved
  await fillInputById(driver, 'createModel', ex2Name);
  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, false, driver);
  await clickButton(driver, 'btn-Home');

  await clickButton(driver, createButtonID);
  await consumeAlert(`will replace ${ex2Name}, you sure?`, true, driver);
  await clickButton(driver, 'btn-Home');

  // clear away any data
  await deleteIfExists(ex1Name, driver);
  await deleteIfExists(ex2Name, driver);
}

describe('BrowserWorkflowTests 02', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should create examples', async done => {
    const testDataModelName = 'testName3';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(
      driver,
      'btn-create-Simple-example',
      testDataModelName,
    );

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

/* eslint-disable */
function assertAssetData(ary: any, createButtonID: string) {
  if (createButtonID === 'btn-create-Simple-example') {
    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('Cash');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(23);
    expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[0].y).toBeCloseTo(6038.469044913888, 6);
    expect(ary[0].dataPoints[0].ttip).toEqual('6038.47 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[1].y).toBeCloseTo(10603.114601659505, 6);
    expect(ary[0].dataPoints[1].ttip).toEqual('10603.11 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[2].y).toBeCloseTo(15639.097584714547, 6);
    expect(ary[0].dataPoints[2].ttip).toEqual('15639.10 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(21144.01906312721, 6);
    expect(ary[0].dataPoints[3].ttip).toEqual('21144.02 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(26965.42399012256, 6);
    expect(ary[0].dataPoints[4].ttip).toEqual('26965.42 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(33386.36097312963, 6);
    expect(ary[0].dataPoints[5].ttip).toEqual('33386.36 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(40020.91296968243, 6);
    expect(ary[0].dataPoints[6].ttip).toEqual('40020.91 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(49105.62736566618, 6);
    expect(ary[0].dataPoints[7].ttip).toEqual('49105.63 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(71693.82064274294, 6);
    expect(ary[0].dataPoints[8].ttip).toEqual('71693.82 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(97505.78098182745, 6);
    expect(ary[0].dataPoints[9].ttip).toEqual('97505.78 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(123655.90438314785, 6);
    expect(ary[0].dataPoints[10].ttip).toEqual('123655.90 at Mon Jan 01 2029');
    expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(133643.40263537547, 6);
    expect(ary[0].dataPoints[11].ttip).toEqual('133643.40 at Tue Jan 01 2030');
    expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(138528.26306716906, 6);
    expect(ary[0].dataPoints[12].ttip).toEqual('138528.26 at Wed Jan 01 2031');
    expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[0].dataPoints[13].y).toBeCloseTo(144219.8562582113, 6);
    expect(ary[0].dataPoints[13].ttip).toEqual('144219.86 at Thu Jan 01 2032');
    expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[0].dataPoints[14].y).toBeCloseTo(150761.3273838321, 6);
    expect(ary[0].dataPoints[14].ttip).toEqual('150761.33 at Sat Jan 01 2033');
    expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[0].dataPoints[15].y).toBeCloseTo(161248.5832092718, 6);
    expect(ary[0].dataPoints[15].ttip).toEqual('161248.58 at Sun Jan 01 2034');
    expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[0].dataPoints[16].y).toBeCloseTo(187908.57620900346, 6);
    expect(ary[0].dataPoints[16].ttip).toEqual('187908.58 at Mon Jan 01 2035');
    expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[0].dataPoints[17].y).toBeCloseTo(216016.7750693102, 6);
    expect(ary[0].dataPoints[17].ttip).toEqual('216016.78 at Tue Jan 01 2036');
    expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[0].dataPoints[18].y).toBeCloseTo(245635.89482701942, 6);
    expect(ary[0].dataPoints[18].ttip).toEqual('245635.89 at Thu Jan 01 2037');
    expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[0].dataPoints[19].y).toBeCloseTo(276831.182548349, 6);
    expect(ary[0].dataPoints[19].ttip).toEqual('276831.18 at Fri Jan 01 2038');
    expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[0].dataPoints[20].y).toBeCloseTo(309670.6037914873, 6);
    expect(ary[0].dataPoints[20].ttip).toEqual('309670.60 at Sat Jan 01 2039');
    expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[0].dataPoints[21].y).toBeCloseTo(344224.84374693455, 6);
    expect(ary[0].dataPoints[21].ttip).toEqual('344224.84 at Sun Jan 01 2040');
    expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[0].dataPoints[22].y).toBeCloseTo(380567.44160202995, 6);
    expect(ary[0].dataPoints[22].ttip).toEqual('380567.44 at Tue Jan 01 2041');
    expect(ary[1].name).toEqual('ISAs');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(23);
    expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[1].dataPoints[1].y).toBeCloseTo(2014.007615489538, 6);
    expect(ary[1].dataPoints[1].ttip).toEqual('2014.01 at Wed Jan 01 2020');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[1].dataPoints[2].y).toBeCloseTo(2189.951320778699, 6);
    expect(ary[1].dataPoints[2].ttip).toEqual('2189.95 at Fri Jan 01 2021');
    expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[1].dataPoints[3].y).toBeCloseTo(2381.265468161921, 6);
    expect(ary[1].dataPoints[3].ttip).toEqual('2381.27 at Sat Jan 01 2022');
    expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[1].dataPoints[4].y).toBeCloseTo(2589.2928194605424, 6);
    expect(ary[1].dataPoints[4].ttip).toEqual('2589.29 at Sun Jan 01 2023');
    expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[1].dataPoints[5].y).toBeCloseTo(2815.4934401686073, 6);
    expect(ary[1].dataPoints[5].ttip).toEqual('2815.49 at Mon Jan 01 2024');
    expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[1].dataPoints[6].y).toBeCloseTo(3061.45494710173, 6);
    expect(ary[1].dataPoints[6].ttip).toEqual('3061.45 at Wed Jan 01 2025');
    expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[1].dataPoints[7].y).toBeCloseTo(3328.9036512805305, 6);
    expect(ary[1].dataPoints[7].ttip).toEqual('3328.90 at Thu Jan 01 2026');
    expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[1].dataPoints[8].y).toBeCloseTo(3619.7166742563895, 6);
    expect(ary[1].dataPoints[8].ttip).toEqual('3619.72 at Fri Jan 01 2027');
    expect(ary[1].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[1].dataPoints[9].y).toBeCloseTo(3935.93512291942, 6);
    expect(ary[1].dataPoints[9].ttip).toEqual('3935.94 at Sat Jan 01 2028');
    expect(ary[1].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[1].dataPoints[10].y).toBeCloseTo(4279.778415257652, 6);
    expect(ary[1].dataPoints[10].ttip).toEqual('4279.78 at Mon Jan 01 2029');
    expect(ary[1].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[1].dataPoints[11].y).toBeCloseTo(4653.659857614551, 6);
    expect(ary[1].dataPoints[11].ttip).toEqual('4653.66 at Tue Jan 01 2030');
    expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[1].dataPoints[12].y).toBeCloseTo(5060.203582775748, 6);
    expect(ary[1].dataPoints[12].ttip).toEqual('5060.20 at Wed Jan 01 2031');
    expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[1].dataPoints[13].y).toBeCloseTo(5502.262967767026, 6);
    expect(ary[1].dataPoints[13].ttip).toEqual('5502.26 at Thu Jan 01 2032');
    expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[1].dataPoints[14].y).toBeCloseTo(5982.9406606311395, 6);
    expect(ary[1].dataPoints[14].ttip).toEqual('5982.94 at Sat Jan 01 2033');
    expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[1].dataPoints[15].y).toBeCloseTo(6505.610356743861, 6);
    expect(ary[1].dataPoints[15].ttip).toEqual('6505.61 at Sun Jan 01 2034');
    expect(ary[1].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[1].dataPoints[16].y).toBeCloseTo(7073.940477508989, 6);
    expect(ary[1].dataPoints[16].ttip).toEqual('7073.94 at Mon Jan 01 2035');
    expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[1].dataPoints[17].y).toBeCloseTo(7691.919917624158, 6);
    expect(ary[1].dataPoints[17].ttip).toEqual('7691.92 at Tue Jan 01 2036');
    expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[1].dataPoints[18].y).toBeCloseTo(8363.886041627788, 6);
    expect(ary[1].dataPoints[18].ttip).toEqual('8363.89 at Thu Jan 01 2037');
    expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[1].dataPoints[19].y).toBeCloseTo(9094.555126224368, 6);
    expect(ary[1].dataPoints[19].ttip).toEqual('9094.56 at Fri Jan 01 2038');
    expect(ary[1].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[1].dataPoints[20].y).toBeCloseTo(9889.055462051305, 6);
    expect(ary[1].dataPoints[20].ttip).toEqual('9889.06 at Sat Jan 01 2039');
    expect(ary[1].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[1].dataPoints[21].y).toBeCloseTo(10752.963347216084, 6);
    expect(ary[1].dataPoints[21].ttip).toEqual('10752.96 at Sun Jan 01 2040');
    expect(ary[1].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[1].dataPoints[22].y).toBeCloseTo(11692.342225228855, 6);
    expect(ary[1].dataPoints[22].ttip).toEqual('11692.34 at Tue Jan 01 2041');
    expect(ary[2].name).toEqual('Stocks');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(23);
    expect(ary[2].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[2].dataPoints[0].y).toBeCloseTo(4379.902641557401, 6);
    expect(ary[2].dataPoints[0].ttip).toEqual('4379.90 at Tue Jan 01 2019');
    expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[2].dataPoints[1].y).toBeCloseTo(4762.530936323844, 6);
    expect(ary[2].dataPoints[1].ttip).toEqual('4762.53 at Wed Jan 01 2020');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[2].dataPoints[2].y).toBeCloseTo(3255.3744616120443, 6);
    expect(ary[2].dataPoints[2].ttip).toEqual('3255.37 at Fri Jan 01 2021');
    expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[2].dataPoints[3].y).toBeCloseTo(3539.7639745784654, 6);
    expect(ary[2].dataPoints[3].ttip).toEqual('3539.76 at Sat Jan 01 2022');
    expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[2].dataPoints[4].y).toBeCloseTo(3848.997755397634, 6);
    expect(ary[2].dataPoints[4].ttip).toEqual('3849.00 at Sun Jan 01 2023');
    expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[2].dataPoints[5].y).toBeCloseTo(4185.24619930916, 6);
    expect(ary[2].dataPoints[5].ttip).toEqual('4185.25 at Mon Jan 01 2024');
    expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[2].dataPoints[6].y).toBeCloseTo(4550.869307280797, 6);
    expect(ary[2].dataPoints[6].ttip).toEqual('4550.87 at Wed Jan 01 2025');
    expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[2].dataPoints[7].y).toBeCloseTo(4948.433249964835, 6);
    expect(ary[2].dataPoints[7].ttip).toEqual('4948.43 at Thu Jan 01 2026');
    expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[2].dataPoints[8].y).toBeCloseTo(5380.7283786817525, 6);
    expect(ary[2].dataPoints[8].ttip).toEqual('5380.73 at Fri Jan 01 2027');
    expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[2].dataPoints[9].y).toBeCloseTo(5850.788809843376, 6);
    expect(ary[2].dataPoints[9].ttip).toEqual('5850.79 at Sat Jan 01 2028');
    expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[2].dataPoints[10].y).toBeCloseTo(6361.913720271283, 6);
    expect(ary[2].dataPoints[10].ttip).toEqual('6361.91 at Mon Jan 01 2029');
    expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[2].dataPoints[11].y).toBeCloseTo(6917.690502874165, 6);
    expect(ary[2].dataPoints[11].ttip).toEqual('6917.69 at Tue Jan 01 2030');
    expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[2].dataPoints[12].y).toBeCloseTo(7522.019945205234, 6);
    expect(ary[2].dataPoints[12].ttip).toEqual('7522.02 at Wed Jan 01 2031');
    expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[2].dataPoints[13].y).toBeCloseTo(8179.143607618342, 6);
    expect(ary[2].dataPoints[13].ttip).toEqual('8179.14 at Thu Jan 01 2032');
    expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[2].dataPoints[14].y).toBeCloseTo(8893.673593179856, 6);
    expect(ary[2].dataPoints[14].ttip).toEqual('8893.67 at Sat Jan 01 2033');
    expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[2].dataPoints[15].y).toBeCloseTo(9670.624918280027, 6);
    expect(ary[2].dataPoints[15].ttip).toEqual('9670.62 at Sun Jan 01 2034');
    expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[2].dataPoints[16].y).toBeCloseTo(10515.450711140957, 6);
    expect(ary[2].dataPoints[16].ttip).toEqual('10515.45 at Mon Jan 01 2035');
    expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[2].dataPoints[17].y).toBeCloseTo(11434.080485266206, 6);
    expect(ary[2].dataPoints[17].ttip).toEqual('11434.08 at Tue Jan 01 2036');
    expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[2].dataPoints[18].y).toBeCloseTo(12432.961756459039, 6);
    expect(ary[2].dataPoints[18].ttip).toEqual('12432.96 at Thu Jan 01 2037');
    expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[2].dataPoints[19].y).toBeCloseTo(13519.105295503266, 6);
    expect(ary[2].dataPoints[19].ttip).toEqual('13519.11 at Fri Jan 01 2038');
    expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[2].dataPoints[20].y).toBeCloseTo(14700.134334118395, 6);
    expect(ary[2].dataPoints[20].ttip).toEqual('14700.13 at Sat Jan 01 2039');
    expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[2].dataPoints[21].y).toBeCloseTo(15984.338069546942, 6);
    expect(ary[2].dataPoints[21].ttip).toEqual('15984.34 at Sun Jan 01 2040');
    expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[2].dataPoints[22].y).toBeCloseTo(17380.729843302524, 6);
    expect(ary[2].dataPoints[22].ttip).toEqual('17380.73 at Tue Jan 01 2041');
  } else if (
    createButtonID === 'btn-create-Defined Benefits Pension-example'
  ) {
    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('Cash');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(28);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Jan 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[3].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(2500, 6);
    expect(ary[0].dataPoints[3].ttip).toEqual('2500.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(26965.96675101832, 6);
    expect(ary[0].dataPoints[4].ttip).toEqual('26965.97 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(51420.38128282136, 6);
    expect(ary[0].dataPoints[5].ttip).toEqual('51420.38 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(74971.93038355975, 6);
    expect(ary[0].dataPoints[6].ttip).toEqual('74971.93 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(98971.71530690325, 6);
    expect(ary[0].dataPoints[7].ttip).toEqual('98971.72 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(123463.09282871362, 6);
    expect(ary[0].dataPoints[8].ttip).toEqual('123463.09 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(148463.6633134603, 6);
    expect(ary[0].dataPoints[9].ttip).toEqual('148463.66 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(173984.09354071438, 6);
    expect(ary[0].dataPoints[10].ttip).toEqual('173984.09 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(197252.63060376595, 6);
    expect(ary[0].dataPoints[11].ttip).toEqual('197252.63 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(198248.57720732078, 6);
    expect(ary[0].dataPoints[12].ttip).toEqual('198248.58 at Mon Jan 01 2029');
    expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2030');
    expect(ary[0].dataPoints[13].y).toBeCloseTo(198564.5310624803, 6);
    expect(ary[0].dataPoints[13].ttip).toEqual('198564.53 at Tue Jan 01 2030');
    expect(ary[0].dataPoints[14].label).toEqual('Wed Jan 01 2031');
    expect(ary[0].dataPoints[14].y).toBeCloseTo(202396.92706104272, 6);
    expect(ary[0].dataPoints[14].ttip).toEqual('202396.93 at Wed Jan 01 2031');
    expect(ary[0].dataPoints[15].label).toEqual('Thu Jan 01 2032');
    expect(ary[0].dataPoints[15].y).toBeCloseTo(206305.9709795764, 6);
    expect(ary[0].dataPoints[15].ttip).toEqual('206305.97 at Thu Jan 01 2032');
    expect(ary[0].dataPoints[16].label).toEqual('Sat Jan 01 2033');
    expect(ary[0].dataPoints[16].y).toBeCloseTo(210293.19577648072, 6);
    expect(ary[0].dataPoints[16].ttip).toEqual('210293.20 at Sat Jan 01 2033');
    expect(ary[0].dataPoints[17].label).toEqual('Sun Jan 01 2034');
    expect(ary[0].dataPoints[17].y).toBeCloseTo(214360.16506932315, 6);
    expect(ary[0].dataPoints[17].ttip).toEqual('214360.17 at Sun Jan 01 2034');
    expect(ary[0].dataPoints[18].label).toEqual('Mon Jan 01 2035');
    expect(ary[0].dataPoints[18].y).toBeCloseTo(218159.6351618438, 6);
    expect(ary[0].dataPoints[18].ttip).toEqual('218159.64 at Mon Jan 01 2035');
    expect(ary[0].dataPoints[19].label).toEqual('Tue Jan 01 2036');
    expect(ary[0].dataPoints[19].y).toBeCloseTo(220271.78420211864, 6);
    expect(ary[0].dataPoints[19].ttip).toEqual('220271.78 at Tue Jan 01 2036');
    expect(ary[0].dataPoints[20].label).toEqual('Thu Jan 01 2037');
    expect(ary[0].dataPoints[20].y).toBeCloseTo(222426.176223199, 6);
    expect(ary[0].dataPoints[20].ttip).toEqual('222426.18 at Thu Jan 01 2037');
    expect(ary[0].dataPoints[21].label).toEqual('Fri Jan 01 2038');
    expect(ary[0].dataPoints[21].y).toBeCloseTo(224623.6560847009, 6);
    expect(ary[0].dataPoints[21].ttip).toEqual('224623.66 at Fri Jan 01 2038');
    expect(ary[0].dataPoints[22].label).toEqual('Sat Jan 01 2039');
    expect(ary[0].dataPoints[22].y).toBeCloseTo(226865.08554343288, 6);
    expect(ary[0].dataPoints[22].ttip).toEqual('226865.09 at Sat Jan 01 2039');
    expect(ary[0].dataPoints[23].label).toEqual('Sun Jan 01 2040');
    expect(ary[0].dataPoints[23].y).toBeCloseTo(228959.08812366743, 6);
    expect(ary[0].dataPoints[23].ttip).toEqual('228959.09 at Sun Jan 01 2040');
    expect(ary[0].dataPoints[24].label).toEqual('Tue Jan 01 2041');
    expect(ary[0].dataPoints[24].y).toBeCloseTo(228959.08812366743, 6);
    expect(ary[0].dataPoints[24].ttip).toEqual('228959.09 at Tue Jan 01 2041');
    expect(ary[0].dataPoints[25].label).toEqual('Wed Jan 01 2042');
    expect(ary[0].dataPoints[25].y).toBeCloseTo(228959.08812366743, 6);
    expect(ary[0].dataPoints[25].ttip).toEqual('228959.09 at Wed Jan 01 2042');
    expect(ary[0].dataPoints[26].label).toEqual('Thu Jan 01 2043');
    expect(ary[0].dataPoints[26].y).toBeCloseTo(228959.08812366743, 6);
    expect(ary[0].dataPoints[26].ttip).toEqual('228959.09 at Thu Jan 01 2043');
    expect(ary[0].dataPoints[27].label).toEqual('Fri Jan 01 2044');
    expect(ary[0].dataPoints[27].y).toBeCloseTo(228959.08812366743, 6);
    expect(ary[0].dataPoints[27].ttip).toEqual('228959.09 at Fri Jan 01 2044');
  } else if (
    createButtonID === 'btn-create-Defined Contributions Pension-example'
  ) {
    expect(ary.length).toEqual(5);
    expect(ary[0].name).toEqual('Cash');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(27);
    expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[2].y).toBeCloseTo(2422.5000000000014, 6);
    expect(ary[0].dataPoints[2].ttip).toEqual('2422.50 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(26047.88223173676, 6);
    expect(ary[0].dataPoints[3].ttip).toEqual('26047.88 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(49599.42333305394, 6);
    expect(ary[0].dataPoints[4].ttip).toEqual('49599.42 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(73599.20825639744, 6);
    expect(ary[0].dataPoints[5].ttip).toEqual('73599.21 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(98090.58577820781, 6);
    expect(ary[0].dataPoints[6].ttip).toEqual('98090.59 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(123091.1562629544, 6);
    expect(ary[0].dataPoints[7].ttip).toEqual('123091.16 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(148611.5864902085, 6);
    expect(ary[0].dataPoints[8].ttip).toEqual('148611.59 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(171880.12355326005, 6);
    expect(ary[0].dataPoints[9].ttip).toEqual('171880.12 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(172876.07015681488, 6);
    expect(ary[0].dataPoints[10].ttip).toEqual('172876.07 at Mon Jan 01 2029');
    expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(172876.07015681488, 6);
    expect(ary[0].dataPoints[11].ttip).toEqual('172876.07 at Tue Jan 01 2030');
    expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(188106.1063756887, 6);
    expect(ary[0].dataPoints[12].ttip).toEqual('188106.11 at Wed Jan 01 2031');
    expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[0].dataPoints[13].y).toBeCloseTo(203716.89350003432, 6);
    expect(ary[0].dataPoints[13].ttip).toEqual('203716.89 at Thu Jan 01 2032');
    expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[0].dataPoints[14].y).toBeCloseTo(219717.95030248858, 6);
    expect(ary[0].dataPoints[14].ttip).toEqual('219717.95 at Sat Jan 01 2033');
    expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[0].dataPoints[15].y).toBeCloseTo(236119.03352500417, 6);
    expect(ary[0].dataPoints[15].ttip).toEqual('236119.03 at Sun Jan 01 2034');
    expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[0].dataPoints[16].y).toBeCloseTo(252930.14382808263, 6);
    expect(ary[0].dataPoints[16].ttip).toEqual('252930.14 at Mon Jan 01 2035');
    expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[0].dataPoints[17].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[17].ttip).toEqual('265019.10 at Tue Jan 01 2036');
    expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[0].dataPoints[18].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[18].ttip).toEqual('265019.10 at Thu Jan 01 2037');
    expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[0].dataPoints[19].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[19].ttip).toEqual('265019.10 at Fri Jan 01 2038');
    expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[0].dataPoints[20].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[20].ttip).toEqual('265019.10 at Sat Jan 01 2039');
    expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[0].dataPoints[21].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[21].ttip).toEqual('265019.10 at Sun Jan 01 2040');
    expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[0].dataPoints[22].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[22].ttip).toEqual('265019.10 at Tue Jan 01 2041');
    expect(ary[0].dataPoints[23].label).toEqual('Wed Jan 01 2042');
    expect(ary[0].dataPoints[23].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[23].ttip).toEqual('265019.10 at Wed Jan 01 2042');
    expect(ary[0].dataPoints[24].label).toEqual('Thu Jan 01 2043');
    expect(ary[0].dataPoints[24].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[24].ttip).toEqual('265019.10 at Thu Jan 01 2043');
    expect(ary[0].dataPoints[25].label).toEqual('Fri Jan 01 2044');
    expect(ary[0].dataPoints[25].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[25].ttip).toEqual('265019.10 at Fri Jan 01 2044');
    expect(ary[0].dataPoints[26].label).toEqual('Sun Jan 01 2045');
    expect(ary[0].dataPoints[26].y).toBeCloseTo(265019.1035009843, 6);
    expect(ary[0].dataPoints[26].ttip).toEqual('265019.10 at Sun Jan 01 2045');
    expect(ary[1].name).toEqual('-CPTaxable Jack.Aegon');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(27);
    expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[1].dataPoints[2].y).toEqual(0);
    expect(ary[1].dataPoints[2].ttip).toEqual('0.00 at Fri Jan 01 2021');
    expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[1].dataPoints[3].y).toEqual(0);
    expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Sat Jan 01 2022');
    expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[1].dataPoints[4].y).toEqual(0);
    expect(ary[1].dataPoints[4].ttip).toEqual('0.00 at Sun Jan 01 2023');
    expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[1].dataPoints[5].y).toEqual(0);
    expect(ary[1].dataPoints[5].ttip).toEqual('0.00 at Mon Jan 01 2024');
    expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[1].dataPoints[6].y).toEqual(0);
    expect(ary[1].dataPoints[6].ttip).toEqual('0.00 at Wed Jan 01 2025');
    expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[1].dataPoints[7].y).toEqual(0);
    expect(ary[1].dataPoints[7].ttip).toEqual('0.00 at Thu Jan 01 2026');
    expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[1].dataPoints[8].y).toEqual(0);
    expect(ary[1].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
    expect(ary[1].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[1].dataPoints[9].y).toEqual(0);
    expect(ary[1].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
    expect(ary[1].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[1].dataPoints[10].y).toEqual(0);
    expect(ary[1].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
    expect(ary[1].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[1].dataPoints[11].y).toEqual(0);
    expect(ary[1].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
    expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[1].dataPoints[12].y).toEqual(0);
    expect(ary[1].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
    expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[1].dataPoints[13].y).toEqual(0);
    expect(ary[1].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
    expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[1].dataPoints[14].y).toEqual(0);
    expect(ary[1].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
    expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[1].dataPoints[15].y).toEqual(0);
    expect(ary[1].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[1].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[1].dataPoints[16].y).toBeCloseTo(18763.7829077336, 6);
    expect(ary[1].dataPoints[16].ttip).toEqual('18763.78 at Mon Jan 01 2035');
    expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[1].dataPoints[17].y).toEqual(0);
    expect(ary[1].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[1].dataPoints[18].y).toEqual(0);
    expect(ary[1].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[1].dataPoints[19].y).toEqual(0);
    expect(ary[1].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[1].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[1].dataPoints[20].y).toEqual(0);
    expect(ary[1].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[1].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[1].dataPoints[21].y).toEqual(0);
    expect(ary[1].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[1].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[1].dataPoints[22].y).toEqual(0);
    expect(ary[1].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[1].dataPoints[23].label).toEqual('Wed Jan 01 2042');
    expect(ary[1].dataPoints[23].y).toEqual(0);
    expect(ary[1].dataPoints[23].ttip).toEqual('0.00 at Wed Jan 01 2042');
    expect(ary[1].dataPoints[24].label).toEqual('Thu Jan 01 2043');
    expect(ary[1].dataPoints[24].y).toEqual(0);
    expect(ary[1].dataPoints[24].ttip).toEqual('0.00 at Thu Jan 01 2043');
    expect(ary[1].dataPoints[25].label).toEqual('Fri Jan 01 2044');
    expect(ary[1].dataPoints[25].y).toEqual(0);
    expect(ary[1].dataPoints[25].ttip).toEqual('0.00 at Fri Jan 01 2044');
    expect(ary[1].dataPoints[26].label).toEqual('Sun Jan 01 2045');
    expect(ary[1].dataPoints[26].y).toEqual(0);
    expect(ary[1].dataPoints[26].ttip).toEqual('0.00 at Sun Jan 01 2045');
    expect(ary[2].name).toEqual('-CPTaxable Joe.Aegon');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(27);
    expect(ary[2].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[2].dataPoints[0].y).toEqual(0);
    expect(ary[2].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[2].dataPoints[1].y).toEqual(0);
    expect(ary[2].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[2].dataPoints[2].y).toEqual(0);
    expect(ary[2].dataPoints[2].ttip).toEqual('0.00 at Fri Jan 01 2021');
    expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[2].dataPoints[3].y).toEqual(0);
    expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Sat Jan 01 2022');
    expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[2].dataPoints[4].y).toEqual(0);
    expect(ary[2].dataPoints[4].ttip).toEqual('0.00 at Sun Jan 01 2023');
    expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[2].dataPoints[5].y).toEqual(0);
    expect(ary[2].dataPoints[5].ttip).toEqual('0.00 at Mon Jan 01 2024');
    expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[2].dataPoints[6].y).toEqual(0);
    expect(ary[2].dataPoints[6].ttip).toEqual('0.00 at Wed Jan 01 2025');
    expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[2].dataPoints[7].y).toEqual(0);
    expect(ary[2].dataPoints[7].ttip).toEqual('0.00 at Thu Jan 01 2026');
    expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[2].dataPoints[8].y).toEqual(0);
    expect(ary[2].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
    expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[2].dataPoints[9].y).toEqual(0);
    expect(ary[2].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
    expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[2].dataPoints[10].y).toEqual(0);
    expect(ary[2].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
    expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[2].dataPoints[11].y).toBeCloseTo(120904.22611247441, 6);
    expect(ary[2].dataPoints[11].ttip).toEqual('120904.23 at Tue Jan 01 2030');
    expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[2].dataPoints[12].y).toBeCloseTo(104251.39927410962, 6);
    expect(ary[2].dataPoints[12].ttip).toEqual('104251.40 at Wed Jan 01 2031');
    expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[2].dataPoints[13].y).toBeCloseTo(86003.57386552489, 6);
    expect(ary[2].dataPoints[13].ttip).toEqual('86003.57 at Thu Jan 01 2032');
    expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[2].dataPoints[14].y).toBeCloseTo(65773.30243327307, 6);
    expect(ary[2].dataPoints[14].ttip).toEqual('65773.30 at Sat Jan 01 2033');
    expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[2].dataPoints[15].y).toBeCloseTo(43412.58440359995, 6);
    expect(ary[2].dataPoints[15].ttip).toEqual('43412.58 at Sun Jan 01 2034');
    expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[2].dataPoints[16].y).toEqual(0);
    expect(ary[2].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[2].dataPoints[17].y).toEqual(0);
    expect(ary[2].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[2].dataPoints[18].y).toEqual(0);
    expect(ary[2].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[2].dataPoints[19].y).toEqual(0);
    expect(ary[2].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[2].dataPoints[20].y).toEqual(0);
    expect(ary[2].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[2].dataPoints[21].y).toEqual(0);
    expect(ary[2].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[2].dataPoints[22].y).toEqual(0);
    expect(ary[2].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[2].dataPoints[23].label).toEqual('Wed Jan 01 2042');
    expect(ary[2].dataPoints[23].y).toEqual(0);
    expect(ary[2].dataPoints[23].ttip).toEqual('0.00 at Wed Jan 01 2042');
    expect(ary[2].dataPoints[24].label).toEqual('Thu Jan 01 2043');
    expect(ary[2].dataPoints[24].y).toEqual(0);
    expect(ary[2].dataPoints[24].ttip).toEqual('0.00 at Thu Jan 01 2043');
    expect(ary[2].dataPoints[25].label).toEqual('Fri Jan 01 2044');
    expect(ary[2].dataPoints[25].y).toEqual(0);
    expect(ary[2].dataPoints[25].ttip).toEqual('0.00 at Fri Jan 01 2044');
    expect(ary[2].dataPoints[26].label).toEqual('Sun Jan 01 2045');
    expect(ary[2].dataPoints[26].y).toEqual(0);
    expect(ary[2].dataPoints[26].ttip).toEqual('0.00 at Sun Jan 01 2045');
    expect(ary[3].name).toEqual('-CPTaxFree Aegon');
    expect(ary[3].type).toEqual('stackedColumn');
    expect(ary[3].showInLegend).toEqual(true);
    expect(ary[3].dataPoints.length).toEqual(27);
    expect(ary[3].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[3].dataPoints[0].y).toEqual(0);
    expect(ary[3].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[3].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[3].dataPoints[1].y).toEqual(0);
    expect(ary[3].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[3].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[3].dataPoints[2].y).toEqual(0);
    expect(ary[3].dataPoints[2].ttip).toEqual('0.00 at Fri Jan 01 2021');
    expect(ary[3].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[3].dataPoints[3].y).toEqual(0);
    expect(ary[3].dataPoints[3].ttip).toEqual('0.00 at Sat Jan 01 2022');
    expect(ary[3].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[3].dataPoints[4].y).toEqual(0);
    expect(ary[3].dataPoints[4].ttip).toEqual('0.00 at Sun Jan 01 2023');
    expect(ary[3].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[3].dataPoints[5].y).toEqual(0);
    expect(ary[3].dataPoints[5].ttip).toEqual('0.00 at Mon Jan 01 2024');
    expect(ary[3].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[3].dataPoints[6].y).toEqual(0);
    expect(ary[3].dataPoints[6].ttip).toEqual('0.00 at Wed Jan 01 2025');
    expect(ary[3].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[3].dataPoints[7].y).toEqual(0);
    expect(ary[3].dataPoints[7].ttip).toEqual('0.00 at Thu Jan 01 2026');
    expect(ary[3].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[3].dataPoints[8].y).toEqual(0);
    expect(ary[3].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
    expect(ary[3].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[3].dataPoints[9].y).toEqual(0);
    expect(ary[3].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
    expect(ary[3].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[3].dataPoints[10].y).toEqual(0);
    expect(ary[3].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
    expect(ary[3].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[3].dataPoints[11].y).toBeCloseTo(40218.5650451571, 6);
    expect(ary[3].dataPoints[11].ttip).toEqual('40218.57 at Tue Jan 01 2030');
    expect(ary[3].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[3].dataPoints[12].y).toBeCloseTo(42028.40047218907, 6);
    expect(ary[3].dataPoints[12].ttip).toEqual('42028.40 at Wed Jan 01 2031');
    expect(ary[3].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[3].dataPoints[13].y).toBeCloseTo(43919.67849343746, 6);
    expect(ary[3].dataPoints[13].ttip).toEqual('43919.68 at Thu Jan 01 2032');
    expect(ary[3].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[3].dataPoints[14].y).toBeCloseTo(45896.06402564202, 6);
    expect(ary[3].dataPoints[14].ttip).toEqual('45896.06 at Sat Jan 01 2033');
    expect(ary[3].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[3].dataPoints[15].y).toBeCloseTo(47961.38690679582, 6);
    expect(ary[3].dataPoints[15].ttip).toEqual('47961.39 at Sun Jan 01 2034');
    expect(ary[3].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[3].dataPoints[16].y).toBeCloseTo(50119.649317601514, 6);
    expect(ary[3].dataPoints[16].ttip).toEqual('50119.65 at Mon Jan 01 2035');
    expect(ary[3].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[3].dataPoints[17].y).toBeCloseTo(52375.033536893454, 6);
    expect(ary[3].dataPoints[17].ttip).toEqual('52375.03 at Tue Jan 01 2036');
    expect(ary[3].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[3].dataPoints[18].y).toBeCloseTo(54731.91004605352, 6);
    expect(ary[3].dataPoints[18].ttip).toEqual('54731.91 at Thu Jan 01 2037');
    expect(ary[3].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[3].dataPoints[19].y).toBeCloseTo(57194.84599812577, 6);
    expect(ary[3].dataPoints[19].ttip).toEqual('57194.85 at Fri Jan 01 2038');
    expect(ary[3].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[3].dataPoints[20].y).toBeCloseTo(59768.61406804126, 6);
    expect(ary[3].dataPoints[20].ttip).toEqual('59768.61 at Sat Jan 01 2039');
    expect(ary[3].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[3].dataPoints[21].y).toBeCloseTo(62458.20170110296, 6);
    expect(ary[3].dataPoints[21].ttip).toEqual('62458.20 at Sun Jan 01 2040');
    expect(ary[3].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[3].dataPoints[22].y).toBeCloseTo(65268.82077765242, 6);
    expect(ary[3].dataPoints[22].ttip).toEqual('65268.82 at Tue Jan 01 2041');
    expect(ary[3].dataPoints[23].label).toEqual('Wed Jan 01 2042');
    expect(ary[3].dataPoints[23].y).toBeCloseTo(68205.91771264662, 6);
    expect(ary[3].dataPoints[23].ttip).toEqual('68205.92 at Wed Jan 01 2042');
    expect(ary[3].dataPoints[24].label).toEqual('Thu Jan 01 2043');
    expect(ary[3].dataPoints[24].y).toBeCloseTo(71275.18400971554, 6);
    expect(ary[3].dataPoints[24].ttip).toEqual('71275.18 at Thu Jan 01 2043');
    expect(ary[3].dataPoints[25].label).toEqual('Fri Jan 01 2044');
    expect(ary[3].dataPoints[25].y).toBeCloseTo(74482.56729015255, 6);
    expect(ary[3].dataPoints[25].ttip).toEqual('74482.57 at Fri Jan 01 2044');
    expect(ary[3].dataPoints[26].label).toEqual('Sun Jan 01 2045');
    expect(ary[3].dataPoints[26].y).toBeCloseTo(77834.2828182092, 6);
    expect(ary[3].dataPoints[26].ttip).toEqual('77834.28 at Sun Jan 01 2045');
    expect(ary[4].name).toEqual('-PEN Aegon');
    expect(ary[4].type).toEqual('stackedColumn');
    expect(ary[4].showInLegend).toEqual(true);
    expect(ary[4].dataPoints.length).toEqual(27);
    expect(ary[4].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[4].dataPoints[0].y).toEqual(0);
    expect(ary[4].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[4].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[4].dataPoints[1].y).toEqual(0);
    expect(ary[4].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[4].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[4].dataPoints[2].y).toBeCloseTo(1402.5000000000007, 6);
    expect(ary[4].dataPoints[2].ttip).toEqual('1402.50 at Fri Jan 01 2021');
    expect(ary[4].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[4].dataPoints[3].y).toBeCloseTo(18824.213141790442, 6);
    expect(ary[4].dataPoints[3].ttip).toEqual('18824.21 at Sat Jan 01 2022');
    expect(ary[4].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[4].dataPoints[4].y).toBeCloseTo(37377.0753877972, 6);
    expect(ary[4].dataPoints[4].ttip).toEqual('37377.08 at Sun Jan 01 2023');
    expect(ary[4].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[4].dataPoints[5].y).toBeCloseTo(57118.93188796677, 6);
    expect(ary[4].dataPoints[5].ttip).toEqual('57118.93 at Mon Jan 01 2024');
    expect(ary[4].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[4].dataPoints[6].y).toBeCloseTo(78110.3696927983, 6);
    expect(ary[4].dataPoints[6].ttip).toEqual('78110.37 at Wed Jan 01 2025');
    expect(ary[4].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[4].dataPoints[7].y).toBeCloseTo(100414.84391624467, 6);
    expect(ary[4].dataPoints[7].ttip).toEqual('100414.84 at Thu Jan 01 2026');
    expect(ary[4].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[4].dataPoints[8].y).toBeCloseTo(124098.80963149152, 6);
    expect(ary[4].dataPoints[8].ttip).toEqual('124098.81 at Fri Jan 01 2027');
    expect(ary[4].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[4].dataPoints[9].y).toBeCloseTo(147317.3784305572, 6);
    expect(ary[4].dataPoints[9].ttip).toEqual('147317.38 at Sat Jan 01 2028');
    expect(ary[4].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[4].dataPoints[10].y).toBeCloseTo(153946.66045993188, 6);
    expect(ary[4].dataPoints[10].ttip).toEqual('153946.66 at Mon Jan 01 2029');
    expect(ary[4].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[4].dataPoints[11].y).toEqual(0);
    expect(ary[4].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
    expect(ary[4].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[4].dataPoints[12].y).toEqual(0);
    expect(ary[4].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
    expect(ary[4].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[4].dataPoints[13].y).toEqual(0);
    expect(ary[4].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
    expect(ary[4].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[4].dataPoints[14].y).toEqual(0);
    expect(ary[4].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
    expect(ary[4].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[4].dataPoints[15].y).toEqual(0);
    expect(ary[4].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[4].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[4].dataPoints[16].y).toEqual(0);
    expect(ary[4].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[4].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[4].dataPoints[17].y).toEqual(0);
    expect(ary[4].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[4].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[4].dataPoints[18].y).toEqual(0);
    expect(ary[4].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[4].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[4].dataPoints[19].y).toEqual(0);
    expect(ary[4].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[4].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[4].dataPoints[20].y).toEqual(0);
    expect(ary[4].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[4].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[4].dataPoints[21].y).toEqual(0);
    expect(ary[4].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[4].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[4].dataPoints[22].y).toEqual(0);
    expect(ary[4].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[4].dataPoints[23].label).toEqual('Wed Jan 01 2042');
    expect(ary[4].dataPoints[23].y).toEqual(0);
    expect(ary[4].dataPoints[23].ttip).toEqual('0.00 at Wed Jan 01 2042');
    expect(ary[4].dataPoints[24].label).toEqual('Thu Jan 01 2043');
    expect(ary[4].dataPoints[24].y).toEqual(0);
    expect(ary[4].dataPoints[24].ttip).toEqual('0.00 at Thu Jan 01 2043');
    expect(ary[4].dataPoints[25].label).toEqual('Fri Jan 01 2044');
    expect(ary[4].dataPoints[25].y).toEqual(0);
    expect(ary[4].dataPoints[25].ttip).toEqual('0.00 at Fri Jan 01 2044');
    expect(ary[4].dataPoints[26].label).toEqual('Sun Jan 01 2045');
    expect(ary[4].dataPoints[26].y).toEqual(0);
    expect(ary[4].dataPoints[26].ttip).toEqual('0.00 at Sun Jan 01 2045');
  } else if (
    createButtonID === 'btn-create-National Savings Income Bonds-example'
  ) {
    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('Cash');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(13);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Jan 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[3].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(341, 6);
    expect(ary[0].dataPoints[3].ttip).toEqual('341.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(2957.655658146692, 6);
    expect(ary[0].dataPoints[4].ttip).toEqual('2957.66 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(4948.344863237661, 6);
    expect(ary[0].dataPoints[5].ttip).toEqual('4948.34 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(6237.406153388995, 6);
    expect(ary[0].dataPoints[6].ttip).toEqual('6237.41 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(6936.129635133435, 6);
    expect(ary[0].dataPoints[7].ttip).toEqual('6936.13 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(6948.752265938316, 6);
    expect(ary[0].dataPoints[8].ttip).toEqual('6948.75 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(6213.218419913436, 6);
    expect(ary[0].dataPoints[9].ttip).toEqual('6213.22 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(4654.766431826654, 6);
    expect(ary[0].dataPoints[10].ttip).toEqual('4654.77 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(2192.5645913597737, 6);
    expect(ary[0].dataPoints[11].ttip).toEqual('2192.56 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(-1260.8357107207837, 6);
    expect(ary[0].dataPoints[12].ttip).toEqual('-1260.84 at Mon Jan 01 2029');
    expect(ary[1].name).toEqual('NI');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(13);
    expect(ary[1].dataPoints[0].label).toEqual('Sun Jan 01 2017');
    expect(ary[1].dataPoints[0].y).toEqual(0);
    expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[1].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[1].dataPoints[1].y).toEqual(0);
    expect(ary[1].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[1].dataPoints[2].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[2].y).toEqual(0);
    expect(ary[1].dataPoints[2].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[3].label).toEqual('Wed Jan 01 2020');
    expect(ary[1].dataPoints[3].y).toBeCloseTo(1000000, 6);
    expect(ary[1].dataPoints[3].ttip).toEqual('1000000.00 at Wed Jan 01 2020');
    expect(ary[1].dataPoints[4].label).toEqual('Fri Jan 01 2021');
    expect(ary[1].dataPoints[4].y).toBeCloseTo(1024999.9999999986, 6);
    expect(ary[1].dataPoints[4].ttip).toEqual('1025000.00 at Fri Jan 01 2021');
    expect(ary[1].dataPoints[5].label).toEqual('Sat Jan 01 2022');
    expect(ary[1].dataPoints[5].y).toBeCloseTo(1050624.9999999972, 6);
    expect(ary[1].dataPoints[5].ttip).toEqual('1050625.00 at Sat Jan 01 2022');
    expect(ary[1].dataPoints[6].label).toEqual('Sun Jan 01 2023');
    expect(ary[1].dataPoints[6].y).toBeCloseTo(1076890.6249999953, 6);
    expect(ary[1].dataPoints[6].ttip).toEqual('1076890.62 at Sun Jan 01 2023');
    expect(ary[1].dataPoints[7].label).toEqual('Mon Jan 01 2024');
    expect(ary[1].dataPoints[7].y).toBeCloseTo(1103812.890624994, 6);
    expect(ary[1].dataPoints[7].ttip).toEqual('1103812.89 at Mon Jan 01 2024');
    expect(ary[1].dataPoints[8].label).toEqual('Wed Jan 01 2025');
    expect(ary[1].dataPoints[8].y).toBeCloseTo(1131408.2128906178, 6);
    expect(ary[1].dataPoints[8].ttip).toEqual('1131408.21 at Wed Jan 01 2025');
    expect(ary[1].dataPoints[9].label).toEqual('Thu Jan 01 2026');
    expect(ary[1].dataPoints[9].y).toBeCloseTo(1159693.4182128815, 6);
    expect(ary[1].dataPoints[9].ttip).toEqual('1159693.42 at Thu Jan 01 2026');
    expect(ary[1].dataPoints[10].label).toEqual('Fri Jan 01 2027');
    expect(ary[1].dataPoints[10].y).toBeCloseTo(1188685.7536682019, 6);
    expect(ary[1].dataPoints[10].ttip).toEqual('1188685.75 at Fri Jan 01 2027');
    expect(ary[1].dataPoints[11].label).toEqual('Sat Jan 01 2028');
    expect(ary[1].dataPoints[11].y).toBeCloseTo(1218402.8975099053, 6);
    expect(ary[1].dataPoints[11].ttip).toEqual('1218402.90 at Sat Jan 01 2028');
    expect(ary[1].dataPoints[12].label).toEqual('Mon Jan 01 2029');
    expect(ary[1].dataPoints[12].y).toBeCloseTo(1248862.9699476513, 6);
    expect(ary[1].dataPoints[12].ttip).toEqual('1248862.97 at Mon Jan 01 2029');
  } else {
    expect(false).toBe(true);
  }
}

function assertExpenseData(ary: any, createButtonID: string) {
  if (createButtonID === 'btn-create-Simple-example') {
    ary.reverse();
    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('Run house');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(23);
    expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[0].y).toBeCloseTo(13217.096616563362);
    expect(ary[0].dataPoints[0].ttip).toEqual('13217.10 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[1].y).toBeCloseTo(16513.962324950404);
    expect(ary[0].dataPoints[1].ttip).toEqual('16513.96 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[2].y).toBeCloseTo(17257.090629573195);
    expect(ary[0].dataPoints[2].ttip).toEqual('17257.09 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(18033.659707904008);
    expect(ary[0].dataPoints[3].ttip).toEqual('18033.66 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(18845.174394759717);
    expect(ary[0].dataPoints[4].ttip).toEqual('18845.17 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(19693.20724252392);
    expect(ary[0].dataPoints[5].ttip).toEqual('19693.21 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(20579.401568437515);
    expect(ary[0].dataPoints[6].ttip).toEqual('20579.40 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(21505.474639017222);
    expect(ary[0].dataPoints[7].ttip).toEqual('21505.47 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(22473.220997773027);
    expect(ary[0].dataPoints[8].ttip).toEqual('22473.22 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(23484.515942672835);
    expect(ary[0].dataPoints[9].ttip).toEqual('23484.52 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(24541.31916009313);
    expect(ary[0].dataPoints[10].ttip).toEqual('24541.32 at Mon Jan 01 2029');
    expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(25645.678522297345);
    expect(ary[0].dataPoints[11].ttip).toEqual('25645.68 at Tue Jan 01 2030');
    expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(26799.73405580075);
    expect(ary[0].dataPoints[12].ttip).toEqual('26799.73 at Wed Jan 01 2031');
    expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[0].dataPoints[13].y).toBeCloseTo(28005.722088311813);
    expect(ary[0].dataPoints[13].ttip).toEqual('28005.72 at Thu Jan 01 2032');
    expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[0].dataPoints[14].y).toBeCloseTo(29265.97958228587);
    expect(ary[0].dataPoints[14].ttip).toEqual('29265.98 at Sat Jan 01 2033');
    expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[0].dataPoints[15].y).toBeCloseTo(30582.948663488758);
    expect(ary[0].dataPoints[15].ttip).toEqual('30582.95 at Sun Jan 01 2034');
    expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[0].dataPoints[16].y).toBeCloseTo(31959.181353345793);
    expect(ary[0].dataPoints[16].ttip).toEqual('31959.18 at Mon Jan 01 2035');
    expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[0].dataPoints[17].y).toBeCloseTo(33397.34451424639);
    expect(ary[0].dataPoints[17].ttip).toEqual('33397.34 at Tue Jan 01 2036');
    expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[0].dataPoints[18].y).toBeCloseTo(34900.22501738751);
    expect(ary[0].dataPoints[18].ttip).toEqual('34900.23 at Thu Jan 01 2037');
    expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[0].dataPoints[19].y).toBeCloseTo(36470.73514316998);
    expect(ary[0].dataPoints[19].ttip).toEqual('36470.74 at Fri Jan 01 2038');
    expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[0].dataPoints[20].y).toBeCloseTo(38111.91822461266);
    expect(ary[0].dataPoints[20].ttip).toEqual('38111.92 at Sat Jan 01 2039');
    expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[0].dataPoints[21].y).toBeCloseTo(39826.95454472027);
    expect(ary[0].dataPoints[21].ttip).toEqual('39826.95 at Sun Jan 01 2040');
    expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[0].dataPoints[22].y).toBeCloseTo(41619.16749923273);
    expect(ary[0].dataPoints[22].ttip).toEqual('41619.17 at Tue Jan 01 2041');
    expect(ary[1].name).toEqual('Run car');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(23);
    expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[0].y).toBeCloseTo(7193.517104345055);
    expect(ary[1].dataPoints[0].ttip).toEqual('7193.52 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[1].dataPoints[1].y).toBeCloseTo(9224.493645918672);
    expect(ary[1].dataPoints[1].ttip).toEqual('9224.49 at Wed Jan 01 2020');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[1].dataPoints[2].y).toBeCloseTo(9916.330669362571);
    expect(ary[1].dataPoints[2].ttip).toEqual('9916.33 at Fri Jan 01 2021');
    expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[1].dataPoints[3].y).toBeCloseTo(10660.055469564766);
    expect(ary[1].dataPoints[3].ttip).toEqual('10660.06 at Sat Jan 01 2022');
    expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[1].dataPoints[4].y).toBeCloseTo(11459.559629782123);
    expect(ary[1].dataPoints[4].ttip).toEqual('11459.56 at Sun Jan 01 2023');
    expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[1].dataPoints[5].y).toBeCloseTo(12319.026602015787);
    expect(ary[1].dataPoints[5].ttip).toEqual('12319.03 at Mon Jan 01 2024');
    expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[1].dataPoints[6].y).toBeCloseTo(13242.953597166968);
    expect(ary[1].dataPoints[6].ttip).toEqual('13242.95 at Wed Jan 01 2025');
    expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[1].dataPoints[7].y).toBeCloseTo(13010.109713272253);
    expect(ary[1].dataPoints[7].ttip).toEqual('13010.11 at Thu Jan 01 2026');
    expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[1].dataPoints[8].y).toEqual(0);
    expect(ary[1].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
    expect(ary[1].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[1].dataPoints[9].y).toEqual(0);
    expect(ary[1].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
    expect(ary[1].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[1].dataPoints[10].y).toEqual(0);
    expect(ary[1].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
    expect(ary[1].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[1].dataPoints[11].y).toEqual(0);
    expect(ary[1].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
    expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[1].dataPoints[12].y).toEqual(0);
    expect(ary[1].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
    expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[1].dataPoints[13].y).toEqual(0);
    expect(ary[1].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
    expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[1].dataPoints[14].y).toEqual(0);
    expect(ary[1].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
    expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[1].dataPoints[15].y).toEqual(0);
    expect(ary[1].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[1].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[1].dataPoints[16].y).toEqual(0);
    expect(ary[1].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[1].dataPoints[17].y).toEqual(0);
    expect(ary[1].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[1].dataPoints[18].y).toEqual(0);
    expect(ary[1].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[1].dataPoints[19].y).toEqual(0);
    expect(ary[1].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[1].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[1].dataPoints[20].y).toEqual(0);
    expect(ary[1].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[1].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[1].dataPoints[21].y).toEqual(0);
    expect(ary[1].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[1].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[1].dataPoints[22].y).toEqual(0);
    expect(ary[1].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[2].name).toEqual('Look after dogs');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(23);
    expect(ary[2].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[2].dataPoints[0].y).toBeCloseTo(5083.498698678214);
    expect(ary[2].dataPoints[0].ttip).toEqual('5083.50 at Tue Jan 01 2019');
    expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[2].dataPoints[1].y).toBeCloseTo(6351.523971134771);
    expect(ary[2].dataPoints[1].ttip).toEqual('6351.52 at Wed Jan 01 2020');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[2].dataPoints[2].y).toBeCloseTo(6637.342549835845);
    expect(ary[2].dataPoints[2].ttip).toEqual('6637.34 at Fri Jan 01 2021');
    expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[2].dataPoints[3].y).toBeCloseTo(6936.022964578465);
    expect(ary[2].dataPoints[3].ttip).toEqual('6936.02 at Sat Jan 01 2022');
    expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[2].dataPoints[4].y).toBeCloseTo(7248.143997984505);
    expect(ary[2].dataPoints[4].ttip).toEqual('7248.14 at Sun Jan 01 2023');
    expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[2].dataPoints[5].y).toBeCloseTo(7574.310477893816);
    expect(ary[2].dataPoints[5].ttip).toEqual('7574.31 at Mon Jan 01 2024');
    expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[2].dataPoints[6].y).toBeCloseTo(7915.154449399044);
    expect(ary[2].dataPoints[6].ttip).toEqual('7915.15 at Wed Jan 01 2025');
    expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[2].dataPoints[7].y).toBeCloseTo(8271.336399622009);
    expect(ary[2].dataPoints[7].ttip).toEqual('8271.34 at Thu Jan 01 2026');
    expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[2].dataPoints[8].y).toBeCloseTo(8643.546537605005);
    expect(ary[2].dataPoints[8].ttip).toEqual('8643.55 at Fri Jan 01 2027');
    expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[2].dataPoints[9].y).toBeCloseTo(9032.506131797238);
    expect(ary[2].dataPoints[9].ttip).toEqual('9032.51 at Sat Jan 01 2028');
    expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[2].dataPoints[10].y).toBeCloseTo(9438.968907728122);
    expect(ary[2].dataPoints[10].ttip).toEqual('9438.97 at Mon Jan 01 2029');
    expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[2].dataPoints[11].y).toBeCloseTo(9863.722508575898);
    expect(ary[2].dataPoints[11].ttip).toEqual('9863.72 at Tue Jan 01 2030');
    expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[2].dataPoints[12].y).toBeCloseTo(10307.590021461823);
    expect(ary[2].dataPoints[12].ttip).toEqual('10307.59 at Wed Jan 01 2031');
    expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[2].dataPoints[13].y).toBeCloseTo(10771.431572427617);
    expect(ary[2].dataPoints[13].ttip).toEqual('10771.43 at Thu Jan 01 2032');
    expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[2].dataPoints[14].y).toBeCloseTo(11256.145993186869);
    expect(ary[2].dataPoints[14].ttip).toEqual('11256.15 at Sat Jan 01 2033');
    expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[2].dataPoints[15].y).toBeCloseTo(11762.672562880292);
    expect(ary[2].dataPoints[15].ttip).toEqual('11762.67 at Sun Jan 01 2034');
    expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[2].dataPoints[16].y).toBeCloseTo(12291.992828209915);
    expect(ary[2].dataPoints[16].ttip).toEqual('12291.99 at Mon Jan 01 2035');
    expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[2].dataPoints[17].y).toBeCloseTo(12845.13250547937);
    expect(ary[2].dataPoints[17].ttip).toEqual('12845.13 at Tue Jan 01 2036');
    expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[2].dataPoints[18].y).toBeCloseTo(13423.16346822596);
    expect(ary[2].dataPoints[18].ttip).toEqual('13423.16 at Thu Jan 01 2037');
    expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[2].dataPoints[19].y).toBeCloseTo(14027.205824296141);
    expect(ary[2].dataPoints[19].ttip).toEqual('14027.21 at Fri Jan 01 2038');
    expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[2].dataPoints[20].y).toBeCloseTo(14658.430086389482);
    expect(ary[2].dataPoints[20].ttip).toEqual('14658.43 at Sat Jan 01 2039');
    expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[2].dataPoints[21].y).toBeCloseTo(15318.059440277028);
    expect(ary[2].dataPoints[21].ttip).toEqual('15318.06 at Sun Jan 01 2040');
    expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[2].dataPoints[22].y).toBeCloseTo(16007.372115089514);
    expect(ary[2].dataPoints[22].ttip).toEqual('16007.37 at Tue Jan 01 2041');
  } else if (
    createButtonID === 'btn-create-Defined Benefits Pension-example'
  ) {
    expect(ary.length).toEqual(0);
  } else if (
    createButtonID === 'btn-create-Defined Contributions Pension-example'
  ) {
    expect(ary.length).toEqual(0);
  } else if (
    createButtonID === 'btn-create-National Savings Income Bonds-example'
  ) {
    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('LivingCosts');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(13);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Jan 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[3].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(900);
    expect(ary[0].dataPoints[3].ttip).toEqual('900.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(11233.902681119303);
    expect(ary[0].dataPoints[4].ttip).toEqual('11233.90 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(12076.445382203248);
    expect(ary[0].dataPoints[5].ttip).toEqual('12076.45 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(12982.178785868495);
    expect(ary[0].dataPoints[6].ttip).toEqual('12982.18 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(13955.842194808632);
    expect(ary[0].dataPoints[7].ttip).toEqual('13955.84 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(15002.530359419286);
    expect(ary[0].dataPoints[8].ttip).toEqual('15002.53 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(16127.720136375734);
    expect(ary[0].dataPoints[9].ttip).toEqual('16127.72 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(17337.29914660392);
    expect(ary[0].dataPoints[10].ttip).toEqual('17337.30 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(18637.596582599217);
    expect(ary[0].dataPoints[11].ttip).toEqual('18637.60 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(20035.416326294162);
    expect(ary[0].dataPoints[12].ttip).toEqual('20035.42 at Mon Jan 01 2029');
  } else {
    expect(false).toBe(true);
  }
}

function assertIncomeData(ary: any, createButtonID: string) {
  if (createButtonID === 'btn-create-Simple-example') {
    ary.reverse();
    expect(ary.length).toEqual(3);
    expect(ary[0].name).toEqual('Side hustle income later');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(23);
    expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[3].y).toEqual(0);
    expect(ary[0].dataPoints[3].ttip).toEqual('0.00 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[4].y).toEqual(0);
    expect(ary[0].dataPoints[4].ttip).toEqual('0.00 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[5].y).toEqual(0);
    expect(ary[0].dataPoints[5].ttip).toEqual('0.00 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[6].y).toEqual(0);
    expect(ary[0].dataPoints[6].ttip).toEqual('0.00 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(16213.44240294964);
    expect(ary[0].dataPoints[7].ttip).toEqual('16213.44 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(22090.328742548965);
    expect(ary[0].dataPoints[8].ttip).toEqual('22090.33 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(22642.586961112658);
    expect(ary[0].dataPoints[9].ttip).toEqual('22642.59 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(23208.651635140446);
    expect(ary[0].dataPoints[10].ttip).toEqual('23208.65 at Mon Jan 01 2029');
    expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(5892.261200237232);
    expect(ary[0].dataPoints[11].ttip).toEqual('5892.26 at Tue Jan 01 2030');
    expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[0].dataPoints[12].y).toEqual(0);
    expect(ary[0].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
    expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[0].dataPoints[13].y).toEqual(0);
    expect(ary[0].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
    expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[0].dataPoints[14].y).toEqual(0);
    expect(ary[0].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
    expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[0].dataPoints[15].y).toEqual(0);
    expect(ary[0].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[0].dataPoints[16].y).toEqual(0);
    expect(ary[0].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[0].dataPoints[17].y).toEqual(0);
    expect(ary[0].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[0].dataPoints[18].y).toEqual(0);
    expect(ary[0].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[0].dataPoints[19].y).toEqual(0);
    expect(ary[0].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[0].dataPoints[20].y).toEqual(0);
    expect(ary[0].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[0].dataPoints[21].y).toEqual(0);
    expect(ary[0].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[0].dataPoints[22].y).toEqual(0);
    expect(ary[0].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[1].name).toEqual('Side hustle income');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(23);
    expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[0].y).toBeCloseTo(16670.990954981648);
    expect(ary[1].dataPoints[0].ttip).toEqual('16670.99 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[1].dataPoints[1].y).toBeCloseTo(18622.105240679455);
    expect(ary[1].dataPoints[1].ttip).toEqual('18622.11 at Wed Jan 01 2020');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[1].dataPoints[2].y).toBeCloseTo(19087.657871696414);
    expect(ary[1].dataPoints[2].ttip).toEqual('19087.66 at Fri Jan 01 2021');
    expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[1].dataPoints[3].y).toBeCloseTo(19564.8493184888);
    expect(ary[1].dataPoints[3].ttip).toEqual('19564.85 at Sat Jan 01 2022');
    expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[1].dataPoints[4].y).toBeCloseTo(20053.97055145099);
    expect(ary[1].dataPoints[4].ttip).toEqual('20053.97 at Sun Jan 01 2023');
    expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[1].dataPoints[5].y).toBeCloseTo(20555.31981523724);
    expect(ary[1].dataPoints[5].ttip).toEqual('20555.32 at Mon Jan 01 2024');
    expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[1].dataPoints[6].y).toBeCloseTo(21069.20281061814);
    expect(ary[1].dataPoints[6].ttip).toEqual('21069.20 at Wed Jan 01 2025');
    expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[1].dataPoints[7].y).toBeCloseTo(5349.093441213316);
    expect(ary[1].dataPoints[7].ttip).toEqual('5349.09 at Thu Jan 01 2026');
    expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[1].dataPoints[8].y).toEqual(0);
    expect(ary[1].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
    expect(ary[1].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[1].dataPoints[9].y).toEqual(0);
    expect(ary[1].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
    expect(ary[1].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[1].dataPoints[10].y).toEqual(0);
    expect(ary[1].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
    expect(ary[1].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[1].dataPoints[11].y).toEqual(0);
    expect(ary[1].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
    expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[1].dataPoints[12].y).toEqual(0);
    expect(ary[1].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
    expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[1].dataPoints[13].y).toEqual(0);
    expect(ary[1].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
    expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[1].dataPoints[14].y).toEqual(0);
    expect(ary[1].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
    expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[1].dataPoints[15].y).toEqual(0);
    expect(ary[1].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[1].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[1].dataPoints[16].y).toEqual(0);
    expect(ary[1].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[1].dataPoints[17].y).toEqual(0);
    expect(ary[1].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[1].dataPoints[18].y).toEqual(0);
    expect(ary[1].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[1].dataPoints[19].y).toEqual(0);
    expect(ary[1].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[1].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[1].dataPoints[20].y).toEqual(0);
    expect(ary[1].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[1].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[1].dataPoints[21].y).toEqual(0);
    expect(ary[1].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[1].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[1].dataPoints[22].y).toEqual(0);
    expect(ary[1].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[2].name).toEqual('Main income');
    expect(ary[2].type).toEqual('stackedColumn');
    expect(ary[2].showInLegend).toEqual(true);
    expect(ary[2].dataPoints.length).toEqual(23);
    expect(ary[2].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[2].dataPoints[0].y).toBeCloseTo(39215.257112382584);
    expect(ary[2].dataPoints[0].ttip).toEqual('39215.26 at Tue Jan 01 2019');
    expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[2].dataPoints[1].y).toBeCloseTo(44624.05227791697);
    expect(ary[2].dataPoints[1].ttip).toEqual('44624.05 at Wed Jan 01 2020');
    expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[2].dataPoints[2].y).toBeCloseTo(46632.13463042329);
    expect(ary[2].dataPoints[2].ttip).toEqual('46632.13 at Fri Jan 01 2021');
    expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[2].dataPoints[3].y).toBeCloseTo(48730.58068879238);
    expect(ary[2].dataPoints[3].ttip).toEqual('48730.58 at Sat Jan 01 2022');
    expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[2].dataPoints[4].y).toBeCloseTo(50923.45681978809);
    expect(ary[2].dataPoints[4].ttip).toEqual('50923.46 at Sun Jan 01 2023');
    expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[2].dataPoints[5].y).toBeCloseTo(53215.0123766786);
    expect(ary[2].dataPoints[5].ttip).toEqual('53215.01 at Mon Jan 01 2024');
    expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[2].dataPoints[6].y).toBeCloseTo(55609.68793362918);
    expect(ary[2].dataPoints[6].ttip).toEqual('55609.69 at Wed Jan 01 2025');
    expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[2].dataPoints[7].y).toBeCloseTo(58112.12389064255);
    expect(ary[2].dataPoints[7].ttip).toEqual('58112.12 at Thu Jan 01 2026');
    expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[2].dataPoints[8].y).toBeCloseTo(60727.169465721556);
    expect(ary[2].dataPoints[8].ttip).toEqual('60727.17 at Fri Jan 01 2027');
    expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[2].dataPoints[9].y).toBeCloseTo(63459.8920916791);
    expect(ary[2].dataPoints[9].ttip).toEqual('63459.89 at Sat Jan 01 2028');
    expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[2].dataPoints[10].y).toBeCloseTo(66315.58723580472);
    expect(ary[2].dataPoints[10].ttip).toEqual('66315.59 at Mon Jan 01 2029');
    expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[2].dataPoints[11].y).toBeCloseTo(69299.788661416);
    expect(ary[2].dataPoints[11].ttip).toEqual('69299.79 at Tue Jan 01 2030');
    expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[2].dataPoints[12].y).toBeCloseTo(72418.27915117978);
    expect(ary[2].dataPoints[12].ttip).toEqual('72418.28 at Wed Jan 01 2031');
    expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[2].dataPoints[13].y).toBeCloseTo(75677.10171298299);
    expect(ary[2].dataPoints[13].ttip).toEqual('75677.10 at Thu Jan 01 2032');
    expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[2].dataPoints[14].y).toBeCloseTo(79082.5712900673);
    expect(ary[2].dataPoints[14].ttip).toEqual('79082.57 at Sat Jan 01 2033');
    expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[2].dataPoints[15].y).toBeCloseTo(82641.28699812043);
    expect(ary[2].dataPoints[15].ttip).toEqual('82641.29 at Sun Jan 01 2034');
    expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[2].dataPoints[16].y).toBeCloseTo(86360.14491303594);
    expect(ary[2].dataPoints[16].ttip).toEqual('86360.14 at Mon Jan 01 2035');
    expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[2].dataPoints[17].y).toBeCloseTo(90246.35143412265);
    expect(ary[2].dataPoints[17].ttip).toEqual('90246.35 at Tue Jan 01 2036');
    expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[2].dataPoints[18].y).toBeCloseTo(94307.43724865826);
    expect(ary[2].dataPoints[18].ttip).toEqual('94307.44 at Thu Jan 01 2037');
    expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[2].dataPoints[19].y).toBeCloseTo(98551.27192484797);
    expect(ary[2].dataPoints[19].ttip).toEqual('98551.27 at Fri Jan 01 2038');
    expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[2].dataPoints[20].y).toBeCloseTo(102986.07916146623);
    expect(ary[2].dataPoints[20].ttip).toEqual(
      '102986.08 at Sat Jan 01 2039',
    );
    expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[2].dataPoints[21].y).toBeCloseTo(107620.45272373235);
    expect(ary[2].dataPoints[21].ttip).toEqual(
      '107620.45 at Sun Jan 01 2040',
    );
    expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[2].dataPoints[22].y).toBeCloseTo(112463.37309630039);
    expect(ary[2].dataPoints[22].ttip).toEqual(
      '112463.37 at Tue Jan 01 2041',
    );
  } else if (
    createButtonID === 'btn-create-Defined Benefits Pension-example'
  ) {

  } else if (
    createButtonID === 'btn-create-Defined Contributions Pension-example'
  ) {

  } else if (
    createButtonID === 'btn-create-National Savings Income Bonds-example'
  ) {
    expect(ary.length).toEqual(1);
    expect(ary[0].name).toEqual('NIinterest');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(13);
    expect(ary[0].dataPoints[0].label).toEqual('Sun Jan 01 2017');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Sun Jan 01 2017');
    expect(ary[0].dataPoints[1].label).toEqual('Mon Jan 01 2018');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
    expect(ary[0].dataPoints[2].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[3].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[3].y).toBeCloseTo(1241);
    expect(ary[0].dataPoints[3].ttip).toEqual('1241.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[4].y).toBeCloseTo(15092.901739536617);
    expect(ary[0].dataPoints[4].ttip).toEqual('15092.90 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[5].y).toBeCloseTo(15470.22428302501);
    expect(ary[0].dataPoints[5].ttip).toEqual('15470.22 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[6].y).toBeCloseTo(15856.979890100614);
    expect(ary[0].dataPoints[6].ttip).toEqual('15856.98 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[7].y).toBeCloseTo(16253.404387353105);
    expect(ary[0].dataPoints[7].ttip).toEqual('16253.40 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[8].y).toBeCloseTo(16659.739497036913);
    expect(ary[0].dataPoints[8].ttip).toEqual('16659.74 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(17076.232984462815);
    expect(ary[0].dataPoints[9].ttip).toEqual('17076.23 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(17503.138809074357);
    expect(ary[0].dataPoints[10].ttip).toEqual('17503.14 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(17940.71727930119);
    expect(ary[0].dataPoints[11].ttip).toEqual('17940.72 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(18389.235211283696);
    expect(ary[0].dataPoints[12].ttip).toEqual('18389.24 at Mon Jan 01 2029');
  } else {
    expect(false).toBe(true);
  }
}

function assertDebtData(ary: any, createButtonID: string) {
  if (createButtonID === 'btn-create-Simple-example') {
    expect(ary.length).toEqual(2);
    expect(ary[0].name).toEqual('LateMortgage');
    expect(ary[0].type).toEqual('stackedColumn');
    expect(ary[0].showInLegend).toEqual(true);
    expect(ary[0].dataPoints.length).toEqual(23);
    expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[0].dataPoints[0].y).toEqual(0);
    expect(ary[0].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
    expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[0].dataPoints[1].y).toEqual(0);
    expect(ary[0].dataPoints[1].ttip).toEqual('0.00 at Wed Jan 01 2020');
    expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[0].dataPoints[2].y).toEqual(0);
    expect(ary[0].dataPoints[2].ttip).toEqual('0.00 at Fri Jan 01 2021');
    expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[0].dataPoints[3].y).toEqual(0);
    expect(ary[0].dataPoints[3].ttip).toEqual('0.00 at Sat Jan 01 2022');
    expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[0].dataPoints[4].y).toEqual(0);
    expect(ary[0].dataPoints[4].ttip).toEqual('0.00 at Sun Jan 01 2023');
    expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[0].dataPoints[5].y).toEqual(0);
    expect(ary[0].dataPoints[5].ttip).toEqual('0.00 at Mon Jan 01 2024');
    expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[0].dataPoints[6].y).toEqual(0);
    expect(ary[0].dataPoints[6].ttip).toEqual('0.00 at Wed Jan 01 2025');
    expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[0].dataPoints[7].y).toEqual(0);
    expect(ary[0].dataPoints[7].ttip).toEqual('0.00 at Thu Jan 01 2026');
    expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[0].dataPoints[8].y).toEqual(0);
    expect(ary[0].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
    expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[0].dataPoints[9].y).toBeCloseTo(91997.42392050933);
    expect(ary[0].dataPoints[9].ttip).toEqual('91997.42 at Sat Jan 01 2028');
    expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[0].dataPoints[10].y).toBeCloseTo(77903.21537832021);
    expect(ary[0].dataPoints[10].ttip).toEqual('77903.22 at Mon Jan 01 2029');
    expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[0].dataPoints[11].y).toBeCloseTo(63152.216718065065);
    expect(ary[0].dataPoints[11].ttip).toEqual('63152.22 at Tue Jan 01 2030');
    expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[0].dataPoints[12].y).toBeCloseTo(47713.82152024207);
    expect(ary[0].dataPoints[12].ttip).toEqual('47713.82 at Wed Jan 01 2031');
    expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[0].dataPoints[13].y).toBeCloseTo(31555.997106200528);
    expect(ary[0].dataPoints[13].ttip).toEqual('31556.00 at Thu Jan 01 2032');
    expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[0].dataPoints[14].y).toBeCloseTo(14645.218074464672);
    expect(ary[0].dataPoints[14].ttip).toEqual('14645.22 at Sat Jan 01 2033');
    expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[0].dataPoints[15].y).toEqual(0);
    expect(ary[0].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[0].dataPoints[16].y).toEqual(0);
    expect(ary[0].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[0].dataPoints[17].y).toEqual(0);
    expect(ary[0].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[0].dataPoints[18].y).toEqual(0);
    expect(ary[0].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[0].dataPoints[19].y).toEqual(0);
    expect(ary[0].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[0].dataPoints[20].y).toEqual(0);
    expect(ary[0].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[0].dataPoints[21].y).toEqual(0);
    expect(ary[0].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[0].dataPoints[22].y).toEqual(0);
    expect(ary[0].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
    expect(ary[1].name).toEqual('EarlyMortgage');
    expect(ary[1].type).toEqual('stackedColumn');
    expect(ary[1].showInLegend).toEqual(true);
    expect(ary[1].dataPoints.length).toEqual(23);
    expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
    expect(ary[1].dataPoints[0].y).toBeCloseTo(219725.82439548898);
    expect(ary[1].dataPoints[0].ttip).toEqual('219725.82 at Tue Jan 01 2019');
    expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
    expect(ary[1].dataPoints[1].y).toBeCloseTo(206654.01049939278);
    expect(ary[1].dataPoints[1].ttip).toEqual('206654.01 at Wed Jan 01 2020');
    expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
    expect(ary[1].dataPoints[2].y).toBeCloseTo(193277.62333951754);
    expect(ary[1].dataPoints[2].ttip).toEqual('193277.62 at Fri Jan 01 2021');
    expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
    expect(ary[1].dataPoints[3].y).toBeCloseTo(179589.5663588172);
    expect(ary[1].dataPoints[3].ttip).toEqual('179589.57 at Sat Jan 01 2022');
    expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
    expect(ary[1].dataPoints[4].y).toBeCloseTo(165582.57765046653);
    expect(ary[1].dataPoints[4].ttip).toEqual('165582.58 at Sun Jan 01 2023');
    expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
    expect(ary[1].dataPoints[5].y).toBeCloseTo(151249.22610521133);
    expect(ary[1].dataPoints[5].ttip).toEqual('151249.23 at Mon Jan 01 2024');
    expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
    expect(ary[1].dataPoints[6].y).toBeCloseTo(136581.90746895166);
    expect(ary[1].dataPoints[6].ttip).toEqual('136581.91 at Wed Jan 01 2025');
    expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
    expect(ary[1].dataPoints[7].y).toBeCloseTo(121572.8403084671);
    expect(ary[1].dataPoints[7].ttip).toEqual('121572.84 at Thu Jan 01 2026');
    expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
    expect(ary[1].dataPoints[8].y).toBeCloseTo(106214.06188314324);
    expect(ary[1].dataPoints[8].ttip).toEqual('106214.06 at Fri Jan 01 2027');
    expect(ary[1].dataPoints[9].label).toEqual('Sat Jan 01 2028');
    expect(ary[1].dataPoints[9].y).toEqual(0);
    expect(ary[1].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
    expect(ary[1].dataPoints[10].label).toEqual('Mon Jan 01 2029');
    expect(ary[1].dataPoints[10].y).toEqual(0);
    expect(ary[1].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
    expect(ary[1].dataPoints[11].label).toEqual('Tue Jan 01 2030');
    expect(ary[1].dataPoints[11].y).toEqual(0);
    expect(ary[1].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
    expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
    expect(ary[1].dataPoints[12].y).toEqual(0);
    expect(ary[1].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
    expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
    expect(ary[1].dataPoints[13].y).toEqual(0);
    expect(ary[1].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
    expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
    expect(ary[1].dataPoints[14].y).toEqual(0);
    expect(ary[1].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
    expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
    expect(ary[1].dataPoints[15].y).toEqual(0);
    expect(ary[1].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
    expect(ary[1].dataPoints[16].label).toEqual('Mon Jan 01 2035');
    expect(ary[1].dataPoints[16].y).toEqual(0);
    expect(ary[1].dataPoints[16].ttip).toEqual('0.00 at Mon Jan 01 2035');
    expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
    expect(ary[1].dataPoints[17].y).toEqual(0);
    expect(ary[1].dataPoints[17].ttip).toEqual('0.00 at Tue Jan 01 2036');
    expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
    expect(ary[1].dataPoints[18].y).toEqual(0);
    expect(ary[1].dataPoints[18].ttip).toEqual('0.00 at Thu Jan 01 2037');
    expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
    expect(ary[1].dataPoints[19].y).toEqual(0);
    expect(ary[1].dataPoints[19].ttip).toEqual('0.00 at Fri Jan 01 2038');
    expect(ary[1].dataPoints[20].label).toEqual('Sat Jan 01 2039');
    expect(ary[1].dataPoints[20].y).toEqual(0);
    expect(ary[1].dataPoints[20].ttip).toEqual('0.00 at Sat Jan 01 2039');
    expect(ary[1].dataPoints[21].label).toEqual('Sun Jan 01 2040');
    expect(ary[1].dataPoints[21].y).toEqual(0);
    expect(ary[1].dataPoints[21].ttip).toEqual('0.00 at Sun Jan 01 2040');
    expect(ary[1].dataPoints[22].label).toEqual('Tue Jan 01 2041');
    expect(ary[1].dataPoints[22].y).toEqual(0);
    expect(ary[1].dataPoints[22].ttip).toEqual('0.00 at Tue Jan 01 2041');
  } else if (
    createButtonID === 'btn-create-Defined Benefits Pension-example'
  ) {
    expect(ary.length).toEqual(0);
  } else if (
    createButtonID === 'btn-create-Defined Contributions Pension-example'
  ) {
    expect(ary.length).toEqual(0);
  } else if (
    createButtonID === 'btn-create-National Savings Income Bonds-example'
  ) {
    expect(ary.length).toEqual(0);
  } else {
    expect(false).toBe(true);
  }
}
/* eslint-enable */

async function testModelContent(driver: any, createButtonID: string) {
  const ex1Name = 'ex1Name';
  await deleteIfExists(ex1Name, driver);

  // console.log(`provide name for ${createButtonID}`);
  await fillInputById(driver, 'createModel', ex1Name);
  // console.log(`create model ${createButtonID}`);
  await clickButton(driver, createButtonID);
  // console.log(`save model ${createButtonID}`);
  await clickButton(driver, 'btn-save-model');

  await clickButton(driver, 'btn-Home');
  await clickButton(driver, 'btn-check');

  // console.log(`go to check model for ${createButtonID}`);
  await checkMessage(driver, 'model check all good');
  // console.log(`checked model for ${createButtonID}`);

  let ary = await getAssetChartData(driver);
  if (createButtonID === 'btn-create-fakename-example') {
    writeTestCode(ary);
  }
  // console.log(`go to assert asset data for ${createButtonID}`);
  assertAssetData(ary, createButtonID);
  // console.log(`asserted asset data for ${createButtonID}`);

  ary = await getDebtChartData(driver);
  if (createButtonID === 'btn-create-fakename-example') {
    writeTestCode(ary);
  }
  // console.log(`go to assert debt data for ${createButtonID}`);
  assertDebtData(ary, createButtonID);
  // console.log(`asserted debt data for ${createButtonID}`);

  ary = await getIncomeChartData(driver);
  if (createButtonID === 'btn-create-fakename-example') {
    writeTestCode(ary);
  }
  // console.log(`go to assert income data for ${createButtonID}`);
  assertIncomeData(ary, createButtonID);
  // console.log(`asserted income data for ${createButtonID}`);

  ary = await getExpenseChartData(driver);
  if (createButtonID === 'btn-create-fakename-example') {
    writeTestCode(ary);
  }
  // console.log(`go to assert expense data for ${createButtonID}`);
  assertExpenseData(ary, createButtonID);
  // console.log(`asserted expense data for ${createButtonID}`);

  await deleteIfExists(ex1Name, driver);
}

describe('BrowserWorkflowTests Simple', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should have right content for Simple example', async done => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(driver, 'btn-create-Simple-example');

    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

describe('BrowserWorkflowTests DBP', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should have right content for DBP example', async done => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(
      driver,
      'btn-create-Defined Benefits Pension-example',
    );

    done();
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

describe('BrowserWorkflowTests DCP', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;

  it('should have right content for DCP example', async done => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(
      driver,
      'btn-create-Defined Contributions Pension-example',
    );

    done();
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

describe('BrowserWorkflowTests NSI', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;
  it('should have right content for NSI example', async done => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(
      driver,
      'btn-create-National Savings Income Bonds-example',
    );

    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});

describe('BrowserWorkflowTests new models', () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver(headless);
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;
  it('should create new clones', async done => {
    const testDataModelName = 'testName4';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(driver, 'btn-clone', testDataModelName);

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  it('should create new models', async done => {
    const testDataModelName = 'testName5';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(
      driver,
      'btn-createMinimalModel',
      testDataModelName,
    );

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
