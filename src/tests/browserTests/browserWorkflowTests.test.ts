import {
  roiStart,
  roiEnd,
  TestModel01,
  pensionDB,
  pension,
  crystallizedPension,
  taxFree,
  pensionTransfer,
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

describe('BrowserWorkflowTests', () => {
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

  async function assertCurrentModel(
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

    await makeNewModel(ex1Name);
    await assertCurrentModel(ex1Name, true, testDataModelName);

    await makeNewModel(ex2Name);
    await assertCurrentModel(ex2Name, true, testDataModelName);

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

    await makeNewModel(ex1Name);
    await assertCurrentModel(ex1Name, true, testDataModelName);

    await expectCashValue(0);
    await setCashValue(10);
    await expectCashValue(10);

    await makeNewModel(ex2Name);
    await assertCurrentModel(ex2Name, true, testDataModelName);

    await switchToModel(ex1Name);
    await assertCurrentModel(ex1Name, true, testDataModelName);
    await expectCashValue(10);

    await switchToModel(ex2Name);
    await assertCurrentModel(ex2Name, true, testDataModelName);

    await expectCashValue(0);
    await setCashValue(20);
    await expectCashValue(20);

    await clickButton(driver, 'btn-Home');
    await clickButton(driver, 'btn-save-model');
    await assertCurrentModel(ex2Name, false, testDataModelName);

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

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);
    await expectCashValue(20);
    await setCashValue(30);
    await expectCashValue(30);

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');
    await enterTextControl(driver, 'overwrite');
    await enterTextControl(driver, 'overview');

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

    // await checkMessage(driver, 'got this far');

    await clickButton(driver, 'btn-Home');
    await driver.executeScript('window.scrollBy(0, -500)'); // Adjust scrolling with a negative value here
    await deleteIfExists(ex1Name, driver);
    await deleteIfExists(ex2Name, driver);
    await cleanUpWork(driver, testDataModelName);
    done();
  });

  async function testModelCreation(
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

  it('should create examples', async done => {
    const testDataModelName = 'testName3';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-create-Simple-example', testDataModelName);

    await cleanUpWork(driver, testDataModelName);
    done();
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
      expect(ary[0].dataPoints[0].y).toEqual(6524.736846535166);
      expect(ary[0].dataPoints[0].ttip).toEqual('6524.74 at Tue Jan 01 2019');
      expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[0].dataPoints[1].y).toEqual(11082.638320111877);
      expect(ary[0].dataPoints[1].ttip).toEqual('11082.64 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[2].y).toEqual(16110.390349595242);
      expect(ary[0].dataPoints[2].ttip).toEqual('16110.39 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[3].y).toEqual(21711.087554896756);
      expect(ary[0].dataPoints[3].ttip).toEqual('21711.09 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[4].y).toEqual(27842.500177030317);
      expect(ary[0].dataPoints[4].ttip).toEqual('27842.50 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[5].y).toEqual(34494.8675173499);
      expect(ary[0].dataPoints[5].ttip).toEqual('34494.87 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[6].y).toEqual(41590.856629898946);
      expect(ary[0].dataPoints[6].ttip).toEqual('41590.86 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[7].y).toEqual(51350.173461193626);
      expect(ary[0].dataPoints[7].ttip).toEqual('51350.17 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(74734.17014123617);
      expect(ary[0].dataPoints[8].ttip).toEqual('74734.17 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(101379.60212180954);
      expect(ary[0].dataPoints[9].ttip).toEqual('101379.60 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(128402.27315806808);
      expect(ary[0].dataPoints[10].ttip).toEqual('128402.27 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(139265.61739980965);
      expect(ary[0].dataPoints[11].ttip).toEqual('139265.62 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[12].y).toEqual(145053.6666960908);
      expect(ary[0].dataPoints[12].ttip).toEqual('145053.67 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[13].y).toEqual(151689.27495568254);
      expect(ary[0].dataPoints[13].ttip).toEqual('151689.27 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[14].y).toEqual(159217.02623624608);
      expect(ary[0].dataPoints[14].ttip).toEqual('159217.03 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[15].y).toEqual(170734.2500489279);
      expect(ary[0].dataPoints[15].ttip).toEqual('170734.25 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[16].y).toEqual(198469.52712059196);
      expect(ary[0].dataPoints[16].ttip).toEqual('198469.53 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[17].y).toEqual(227699.78099891223);
      expect(ary[0].dataPoints[17].ttip).toEqual('227699.78 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[18].y).toEqual(258489.3890581752);
      expect(ary[0].dataPoints[18].ttip).toEqual('258489.39 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[19].y).toEqual(290905.2901891765);
      expect(ary[0].dataPoints[19].ttip).toEqual('290905.29 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[20].y).toEqual(325017.1424773556);
      expect(ary[0].dataPoints[20].ttip).toEqual('325017.14 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[21].y).toEqual(360897.3850621578);
      expect(ary[0].dataPoints[21].ttip).toEqual('360897.39 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[22].y).toEqual(398621.4045484122);
      expect(ary[0].dataPoints[22].ttip).toEqual('398621.40 at Tue Jan 01 2041');
      expect(ary[1].name).toEqual('ISAs');
      expect(ary[1].type).toEqual('stackedColumn');
      expect(ary[1].showInLegend).toEqual(true);
      expect(ary[1].dataPoints.length).toEqual(23);
      expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
      expect(ary[1].dataPoints[0].y).toEqual(0);
      expect(ary[1].dataPoints[0].ttip).toEqual('0.00 at Tue Jan 01 2019');
      expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[1].dataPoints[1].y).toEqual(2014.0076154895382);
      expect(ary[1].dataPoints[1].ttip).toEqual('2014.01 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[2].y).toEqual(2189.9513207787018);
      expect(ary[1].dataPoints[2].ttip).toEqual('2189.95 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[3].y).toEqual(2381.2654681619274);
      expect(ary[1].dataPoints[3].ttip).toEqual('2381.27 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[4].y).toEqual(2589.2928194605506);
      expect(ary[1].dataPoints[4].ttip).toEqual('2589.29 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[5].y).toEqual(2815.4934401686214);
      expect(ary[1].dataPoints[5].ttip).toEqual('2815.49 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[6].y).toEqual(3061.454947101749);
      expect(ary[1].dataPoints[6].ttip).toEqual('3061.45 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[7].y).toEqual(3328.903651280554);
      expect(ary[1].dataPoints[7].ttip).toEqual('3328.90 at Thu Jan 01 2026');
      expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[1].dataPoints[8].y).toEqual(3619.7166742564204);
      expect(ary[1].dataPoints[8].ttip).toEqual('3619.72 at Fri Jan 01 2027');
      expect(ary[1].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[1].dataPoints[9].y).toEqual(3935.935122919457);
      expect(ary[1].dataPoints[9].ttip).toEqual('3935.94 at Sat Jan 01 2028');
      expect(ary[1].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[1].dataPoints[10].y).toEqual(4279.778415257696);
      expect(ary[1].dataPoints[10].ttip).toEqual('4279.78 at Mon Jan 01 2029');
      expect(ary[1].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[1].dataPoints[11].y).toEqual(4653.659857614603);
      expect(ary[1].dataPoints[11].ttip).toEqual('4653.66 at Tue Jan 01 2030');
      expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[1].dataPoints[12].y).toEqual(5060.203582775809);
      expect(ary[1].dataPoints[12].ttip).toEqual('5060.20 at Wed Jan 01 2031');
      expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[1].dataPoints[13].y).toEqual(5502.262967767099);
      expect(ary[1].dataPoints[13].ttip).toEqual('5502.26 at Thu Jan 01 2032');
      expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[1].dataPoints[14].y).toEqual(5982.940660631226);
      expect(ary[1].dataPoints[14].ttip).toEqual('5982.94 at Sat Jan 01 2033');
      expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[1].dataPoints[15].y).toEqual(6505.610356743961);
      expect(ary[1].dataPoints[15].ttip).toEqual('6505.61 at Sun Jan 01 2034');
      expect(ary[1].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[1].dataPoints[16].y).toEqual(7073.940477509107);
      expect(ary[1].dataPoints[16].ttip).toEqual('7073.94 at Mon Jan 01 2035');
      expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[1].dataPoints[17].y).toEqual(7691.919917624294);
      expect(ary[1].dataPoints[17].ttip).toEqual('7691.92 at Tue Jan 01 2036');
      expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[1].dataPoints[18].y).toEqual(8363.886041627944);
      expect(ary[1].dataPoints[18].ttip).toEqual('8363.89 at Thu Jan 01 2037');
      expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[1].dataPoints[19].y).toEqual(9094.555126224548);
      expect(ary[1].dataPoints[19].ttip).toEqual('9094.56 at Fri Jan 01 2038');
      expect(ary[1].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[1].dataPoints[20].y).toEqual(9889.055462051518);
      expect(ary[1].dataPoints[20].ttip).toEqual('9889.06 at Sat Jan 01 2039');
      expect(ary[1].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[1].dataPoints[21].y).toEqual(10752.963347216324);
      expect(ary[1].dataPoints[21].ttip).toEqual('10752.96 at Sun Jan 01 2040');
      expect(ary[1].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[1].dataPoints[22].y).toEqual(11692.342225229128);
      expect(ary[1].dataPoints[22].ttip).toEqual('11692.34 at Tue Jan 01 2041');
      expect(ary[2].name).toEqual('Stocks');
      expect(ary[2].type).toEqual('stackedColumn');
      expect(ary[2].showInLegend).toEqual(true);
      expect(ary[2].dataPoints.length).toEqual(23);
      expect(ary[2].dataPoints[0].label).toEqual('Tue Jan 01 2019');
      expect(ary[2].dataPoints[0].y).toEqual(4379.9026415574035);
      expect(ary[2].dataPoints[0].ttip).toEqual('4379.90 at Tue Jan 01 2019');
      expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[2].dataPoints[1].y).toEqual(4762.530936323855);
      expect(ary[2].dataPoints[1].ttip).toEqual('4762.53 at Wed Jan 01 2020');
      expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[2].dataPoints[2].y).toEqual(3262.079999999997);
      expect(ary[2].dataPoints[2].ttip).toEqual('3262.08 at Fri Jan 01 2021');
      expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[2].dataPoints[3].y).toEqual(3547.055308799993);
      expect(ary[2].dataPoints[3].ttip).toEqual('3547.06 at Sat Jan 01 2022');
      expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[2].dataPoints[4].y).toEqual(3856.926060576756);
      expect(ary[2].dataPoints[4].ttip).toEqual('3856.93 at Sun Jan 01 2023');
      expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[2].dataPoints[5].y).toEqual(4193.867121228736);
      expect(ary[2].dataPoints[5].ttip).toEqual('4193.87 at Mon Jan 01 2024');
      expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[2].dataPoints[6].y).toEqual(4560.243352939273);
      expect(ary[2].dataPoints[6].ttip).toEqual('4560.24 at Wed Jan 01 2025');
      expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[2].dataPoints[7].y).toEqual(4958.626212252042);
      expect(ary[2].dataPoints[7].ttip).toEqual('4958.63 at Thu Jan 01 2026');
      expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[2].dataPoints[8].y).toEqual(5391.8117981543755);
      expect(ary[2].dataPoints[8].ttip).toEqual('5391.81 at Fri Jan 01 2027');
      expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[2].dataPoints[9].y).toEqual(5862.840476841135);
      expect(ary[2].dataPoints[9].ttip).toEqual('5862.84 at Sat Jan 01 2028');
      expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[2].dataPoints[10].y).toEqual(6375.018220897967);
      expect(ary[2].dataPoints[10].ttip).toEqual('6375.02 at Mon Jan 01 2029');
      expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[2].dataPoints[11].y).toEqual(6931.939812675606);
      expect(ary[2].dataPoints[11].ttip).toEqual('6931.94 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[12].y).toEqual(7537.51407471094);
      expect(ary[2].dataPoints[12].ttip).toEqual('7537.51 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[13].y).toEqual(8195.991304277679);
      expect(ary[2].dataPoints[13].ttip).toEqual('8195.99 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[14].y).toEqual(8911.993104619367);
      expect(ary[2].dataPoints[14].ttip).toEqual('8911.99 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[15].y).toEqual(9690.544822238906);
      expect(ary[2].dataPoints[15].ttip).toEqual('9690.54 at Sun Jan 01 2034');
      expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[2].dataPoints[16].y).toEqual(10537.110817909685);
      expect(ary[2].dataPoints[16].ttip).toEqual('10537.11 at Mon Jan 01 2035');
      expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[2].dataPoints[17].y).toEqual(11457.632818962262);
      expect(ary[2].dataPoints[17].ttip).toEqual('11457.63 at Tue Jan 01 2036');
      expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[2].dataPoints[18].y).toEqual(12458.571622026793);
      expect(ary[2].dataPoints[18].ttip).toEqual('12458.57 at Thu Jan 01 2037');
      expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[2].dataPoints[19].y).toEqual(13546.952438927041);
      expect(ary[2].dataPoints[19].ttip).toEqual('13546.95 at Fri Jan 01 2038');
      expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[2].dataPoints[20].y).toEqual(14730.414203991691);
      expect(ary[2].dataPoints[20].ttip).toEqual('14730.41 at Sat Jan 01 2039');
      expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[2].dataPoints[21].y).toEqual(16017.263188852387);
      expect(ary[2].dataPoints[21].ttip).toEqual('16017.26 at Sun Jan 01 2040');
      expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[2].dataPoints[22].y).toEqual(17416.531301030518);
      expect(ary[2].dataPoints[22].ttip).toEqual('17416.53 at Tue Jan 01 2041');
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
      expect(ary[0].dataPoints[3].y).toEqual(2500);
      expect(ary[0].dataPoints[3].ttip).toEqual('2500.00 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[4].y).toEqual(27843.426751018316);
      expect(ary[0].dataPoints[4].ttip).toEqual('27843.43 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(52419.281282821335);
      expect(ary[0].dataPoints[5].ttip).toEqual('52419.28 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(76375.1128835597);
      expect(ary[0].dataPoints[6].ttip).toEqual('76375.11 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(100828.8043694032);
      expect(ary[0].dataPoints[7].ttip).toEqual('100828.80 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(125790.75161777607);
      expect(ary[0].dataPoints[8].ttip).toEqual('125790.75 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(151271.61607224922);
      expect(ary[0].dataPoints[9].ttip).toEqual('151271.62 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(177282.31761847308);
      expect(ary[0].dataPoints[10].ttip).toEqual('177282.32 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(201051.20853346863);
      expect(ary[0].dataPoints[11].ttip).toEqual('201051.21 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(202116.03883526605);
      expect(ary[0].dataPoints[12].ttip).toEqual('202116.04 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[13].y).toEqual(202481.7371612645);
      expect(ary[0].dataPoints[13].ttip).toEqual('202481.74 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[14].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[14].y).toEqual(206917.51402662275);
      expect(ary[0].dataPoints[14].ttip).toEqual('206917.51 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[15].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[15].y).toEqual(211442.00642928825);
      expect(ary[0].dataPoints[15].ttip).toEqual('211442.01 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[16].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[16].y).toEqual(216056.98868000705);
      expect(ary[0].dataPoints[16].ttip).toEqual('216056.99 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[17].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[17].y).toEqual(220764.27057574017);
      expect(ary[0].dataPoints[17].ttip).toEqual('220764.27 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[18].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[18].y).toEqual(225161.9376078907);
      expect(ary[0].dataPoints[18].ttip).toEqual('225161.94 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[19].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[19].y).toEqual(227606.6280450361);
      expect(ary[0].dataPoints[19].ttip).toEqual('227606.63 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[20].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[20].y).toEqual(230100.21229092448);
      expect(ary[0].dataPoints[20].ttip).toEqual('230100.21 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[21].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[21].y).toEqual(232643.66822173056);
      expect(ary[0].dataPoints[21].ttip).toEqual('232643.67 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[22].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[22].y).toEqual(235237.99327115278);
      expect(ary[0].dataPoints[22].ttip).toEqual('235237.99 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[23].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[23].y).toEqual(237661.68022962194);
      expect(ary[0].dataPoints[23].ttip).toEqual('237661.68 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[24].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[24].y).toEqual(237661.68022962194);
      expect(ary[0].dataPoints[24].ttip).toEqual('237661.68 at Tue Jan 01 2041');
      expect(ary[0].dataPoints[25].label).toEqual('Wed Jan 01 2042');
      expect(ary[0].dataPoints[25].y).toEqual(237661.68022962194);
      expect(ary[0].dataPoints[25].ttip).toEqual('237661.68 at Wed Jan 01 2042');
      expect(ary[0].dataPoints[26].label).toEqual('Thu Jan 01 2043');
      expect(ary[0].dataPoints[26].y).toEqual(237661.68022962194);
      expect(ary[0].dataPoints[26].ttip).toEqual('237661.68 at Thu Jan 01 2043');
      expect(ary[0].dataPoints[27].label).toEqual('Fri Jan 01 2044');
      expect(ary[0].dataPoints[27].y).toEqual(237661.68022962194);
      expect(ary[0].dataPoints[27].ttip).toEqual('237661.68 at Fri Jan 01 2044');
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
      expect(ary[0].dataPoints[2].y).toEqual(2422.500000000002);
      expect(ary[0].dataPoints[2].ttip).toEqual('2422.50 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[3].y).toEqual(26937.71223173677);
      expect(ary[0].dataPoints[3].ttip).toEqual('26937.71 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[4].y).toEqual(50893.52583305394);
      expect(ary[0].dataPoints[4].ttip).toEqual('50893.53 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[5].y).toEqual(75347.21731889744);
      expect(ary[0].dataPoints[5].ttip).toEqual('75347.22 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[6].y).toEqual(100309.16456727032);
      expect(ary[0].dataPoints[6].ttip).toEqual('100309.16 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[7].y).toEqual(125790.02902174348);
      expect(ary[0].dataPoints[7].ttip).toEqual('125790.03 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(151800.73056796734);
      expect(ary[0].dataPoints[8].ttip).toEqual('151800.73 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(175569.6214829629);
      expect(ary[0].dataPoints[9].ttip).toEqual('175569.62 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(176634.4517847603);
      expect(ary[0].dataPoints[10].ttip).toEqual('176634.45 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(176634.4517847603);
      expect(ary[0].dataPoints[11].ttip).toEqual('176634.45 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[12].y).toEqual(192635.50858721478);
      expect(ary[0].dataPoints[12].ttip).toEqual('192635.51 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[13].y).toEqual(209036.5918097306);
      expect(ary[0].dataPoints[13].ttip).toEqual('209036.59 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[14].y).toEqual(225847.70211280932);
      expect(ary[0].dataPoints[14].ttip).toEqual('225847.70 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[15].y).toEqual(243079.090173465);
      expect(ary[0].dataPoints[15].ttip).toEqual('243079.09 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[16].y).toEqual(260741.26293563706);
      expect(ary[0].dataPoints[16].ttip).toEqual('260741.26 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[17].y).toEqual(278844.9900168634);
      expect(ary[0].dataPoints[17].ttip).toEqual('278844.99 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[18].y).toEqual(297401.3102751204);
      expect(ary[0].dataPoints[18].ttip).toEqual('297401.31 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[19].y).toEqual(316421.5385398339);
      expect(ary[0].dataPoints[19].ttip).toEqual('316421.54 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[20].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[20].ttip).toEqual('319959.47 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[21].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[21].ttip).toEqual('319959.47 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[22].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[22].ttip).toEqual('319959.47 at Tue Jan 01 2041');
      expect(ary[0].dataPoints[23].label).toEqual('Wed Jan 01 2042');
      expect(ary[0].dataPoints[23].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[23].ttip).toEqual('319959.47 at Wed Jan 01 2042');
      expect(ary[0].dataPoints[24].label).toEqual('Thu Jan 01 2043');
      expect(ary[0].dataPoints[24].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[24].ttip).toEqual('319959.47 at Thu Jan 01 2043');
      expect(ary[0].dataPoints[25].label).toEqual('Fri Jan 01 2044');
      expect(ary[0].dataPoints[25].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[25].ttip).toEqual('319959.47 at Fri Jan 01 2044');
      expect(ary[0].dataPoints[26].label).toEqual('Sun Jan 01 2045');
      expect(ary[0].dataPoints[26].y).toEqual(319959.4668592783);
      expect(ary[0].dataPoints[26].ttip).toEqual('319959.47 at Sun Jan 01 2045');
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
      expect(ary[1].dataPoints[16].y).toEqual(55761.63664094069);
      expect(ary[1].dataPoints[16].ttip).toEqual('55761.64 at Mon Jan 01 2035');
      expect(ary[1].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[1].dataPoints[17].y).toEqual(39559.556442448484);
      expect(ary[1].dataPoints[17].ttip).toEqual('39559.56 at Tue Jan 01 2036');
      expect(ary[1].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[1].dataPoints[18].y).toEqual(22160.598788840758);
      expect(ary[1].dataPoints[18].ttip).toEqual('22160.60 at Thu Jan 01 2037');
      expect(ary[1].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[1].dataPoints[19].y).toEqual(3499.2095984826806);
      expect(ary[1].dataPoints[19].ttip).toEqual('3499.21 at Fri Jan 01 2038');
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
      expect(ary[2].dataPoints[11].y).toEqual(120904.22611247684);
      expect(ary[2].dataPoints[11].ttip).toEqual('120904.23 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[12].y).toEqual(109806.80596259289);
      expect(ary[2].dataPoints[12].ttip).toEqual('109806.81 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[13].y).toEqual(97796.54914784055);
      expect(ary[2].dataPoints[13].ttip).toEqual('97796.55 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[14].y).toEqual(84822.04169934758);
      expect(ary[2].dataPoints[14].ttip).toEqual('84822.04 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[15].y).toEqual(70829.29761166878);
      expect(ary[2].dataPoints[15].ttip).toEqual('70829.30 at Sun Jan 01 2034');
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
      expect(ary[3].dataPoints[11].y).toEqual(40301.408704158945);
      expect(ary[3].dataPoints[11].ttip).toEqual('40301.41 at Tue Jan 01 2030');
      expect(ary[3].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[3].dataPoints[12].y).toEqual(42114.97209584614);
      expect(ary[3].dataPoints[12].ttip).toEqual('42114.97 at Wed Jan 01 2031');
      expect(ary[3].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[3].dataPoints[13].y).toEqual(44010.14584015927);
      expect(ary[3].dataPoints[13].ttip).toEqual('44010.15 at Thu Jan 01 2032');
      expect(ary[3].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[3].dataPoints[14].y).toEqual(45990.60240296647);
      expect(ary[3].dataPoints[14].ttip).toEqual('45990.60 at Sat Jan 01 2033');
      expect(ary[3].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[3].dataPoints[15].y).toEqual(48060.17951110002);
      expect(ary[3].dataPoints[15].ttip).toEqual('48060.18 at Sun Jan 01 2034');
      expect(ary[3].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[3].dataPoints[16].y).toEqual(50222.88758909957);
      expect(ary[3].dataPoints[16].ttip).toEqual('50222.89 at Mon Jan 01 2035');
      expect(ary[3].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[3].dataPoints[17].y).toEqual(52482.9175306091);
      expect(ary[3].dataPoints[17].ttip).toEqual('52482.92 at Tue Jan 01 2036');
      expect(ary[3].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[3].dataPoints[18].y).toEqual(54844.648819486574);
      expect(ary[3].dataPoints[18].ttip).toEqual('54844.65 at Thu Jan 01 2037');
      expect(ary[3].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[3].dataPoints[19].y).toEqual(57312.65801636352);
      expect(ary[3].dataPoints[19].ttip).toEqual('57312.66 at Fri Jan 01 2038');
      expect(ary[3].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[3].dataPoints[20].y).toEqual(59891.72762709994);
      expect(ary[3].dataPoints[20].ttip).toEqual('59891.73 at Sat Jan 01 2039');
      expect(ary[3].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[3].dataPoints[21].y).toEqual(62586.85537031951);
      expect(ary[3].dataPoints[21].ttip).toEqual('62586.86 at Sun Jan 01 2040');
      expect(ary[3].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[3].dataPoints[22].y).toEqual(65403.26386198394);
      expect(ary[3].dataPoints[22].ttip).toEqual('65403.26 at Tue Jan 01 2041');
      expect(ary[3].dataPoints[23].label).toEqual('Wed Jan 01 2042');
      expect(ary[3].dataPoints[23].y).toEqual(68346.4107357733);
      expect(ary[3].dataPoints[23].ttip).toEqual('68346.41 at Wed Jan 01 2042');
      expect(ary[3].dataPoints[24].label).toEqual('Thu Jan 01 2043');
      expect(ary[3].dataPoints[24].y).toEqual(71421.99921888315);
      expect(ary[3].dataPoints[24].ttip).toEqual('71422.00 at Thu Jan 01 2043');
      expect(ary[3].dataPoints[25].label).toEqual('Fri Jan 01 2044');
      expect(ary[3].dataPoints[25].y).toEqual(74635.98918373296);
      expect(ary[3].dataPoints[25].ttip).toEqual('74635.99 at Fri Jan 01 2044');
      expect(ary[3].dataPoints[26].label).toEqual('Sun Jan 01 2045');
      expect(ary[3].dataPoints[26].y).toEqual(77994.60869700105);
      expect(ary[3].dataPoints[26].ttip).toEqual('77994.61 at Sun Jan 01 2045');
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
      expect(ary[4].dataPoints[2].y).toEqual(1402.5000000000011);
      expect(ary[4].dataPoints[2].ttip).toEqual('1402.50 at Fri Jan 01 2021');
      expect(ary[4].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[4].dataPoints[3].y).toEqual(18824.213141790475);
      expect(ary[4].dataPoints[3].ttip).toEqual('18824.21 at Sat Jan 01 2022');
      expect(ary[4].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[4].dataPoints[4].y).toEqual(37377.075387797355);
      expect(ary[4].dataPoints[4].ttip).toEqual('37377.08 at Sun Jan 01 2023');
      expect(ary[4].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[4].dataPoints[5].y).toEqual(57118.93188796712);
      expect(ary[4].dataPoints[5].ttip).toEqual('57118.93 at Mon Jan 01 2024');
      expect(ary[4].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[4].dataPoints[6].y).toEqual(78110.3696927989);
      expect(ary[4].dataPoints[6].ttip).toEqual('78110.37 at Wed Jan 01 2025');
      expect(ary[4].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[4].dataPoints[7].y).toEqual(100414.84391624565);
      expect(ary[4].dataPoints[7].ttip).toEqual('100414.84 at Thu Jan 01 2026');
      expect(ary[4].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[4].dataPoints[8].y).toEqual(124098.80963149293);
      expect(ary[4].dataPoints[8].ttip).toEqual('124098.81 at Fri Jan 01 2027');
      expect(ary[4].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[4].dataPoints[9].y).toEqual(147620.82810982852);
      expect(ary[4].dataPoints[9].ttip).toEqual('147620.83 at Sat Jan 01 2028');
      expect(ary[4].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[4].dataPoints[10].y).toEqual(154263.76537477088);
      expect(ary[4].dataPoints[10].ttip).toEqual('154263.77 at Mon Jan 01 2029');
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
      expect(ary[0].dataPoints[3].y).toEqual(341);
      expect(ary[0].dataPoints[3].ttip).toEqual('341.00 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[4].y).toEqual(3078.1790584173127);
      expect(ary[0].dataPoints[4].ttip).toEqual('3078.18 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(5188.505818263784);
      expect(ary[0].dataPoints[5].ttip).toEqual('5188.51 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(6747.755477996236);
      expect(ary[0].dataPoints[6].ttip).toEqual('6747.76 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(7696.890189928556);
      expect(ary[0].dataPoints[7].ttip).toEqual('7696.89 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(7971.941659918729);
      expect(ary[0].dataPoints[8].ttip).toEqual('7971.94 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(7503.764898687669);
      expect(ary[0].dataPoints[9].ttip).toEqual('7503.76 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(6217.493461607022);
      expect(ary[0].dataPoints[10].ttip).toEqual('6217.49 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(4032.194031269135);
      expect(ary[0].dataPoints[11].ttip).toEqual('4032.19 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(860.3580360428191);
      expect(ary[0].dataPoints[12].ttip).toEqual('860.36 at Mon Jan 01 2029');
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
      expect(ary[1].dataPoints[3].y).toEqual(1000000);
      expect(ary[1].dataPoints[3].ttip).toEqual('1000000.00 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[4].y).toEqual(1024999.9999999986);
      expect(ary[1].dataPoints[4].ttip).toEqual('1025000.00 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[5].y).toEqual(1050624.9999999972);
      expect(ary[1].dataPoints[5].ttip).toEqual('1050625.00 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[6].y).toEqual(1076890.6249999956);
      expect(ary[1].dataPoints[6].ttip).toEqual('1076890.62 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[7].y).toEqual(1103812.890624994);
      expect(ary[1].dataPoints[7].ttip).toEqual('1103812.89 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[8].y).toEqual(1131408.2128906175);
      expect(ary[1].dataPoints[8].ttip).toEqual('1131408.21 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[9].y).toEqual(1159693.4182128813);
      expect(ary[1].dataPoints[9].ttip).toEqual('1159693.42 at Thu Jan 01 2026');
      expect(ary[1].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[1].dataPoints[10].y).toEqual(1188685.7536682012);
      expect(ary[1].dataPoints[10].ttip).toEqual('1188685.75 at Fri Jan 01 2027');
      expect(ary[1].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[1].dataPoints[11].y).toEqual(1218402.8975099048);
      expect(ary[1].dataPoints[11].ttip).toEqual('1218402.90 at Sat Jan 01 2028');
      expect(ary[1].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[1].dataPoints[12].y).toEqual(1248862.9699476508);
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
      expect(ary[0].dataPoints[0].y).toEqual(13217.096616563362);
      expect(ary[0].dataPoints[0].ttip).toEqual('13217.10 at Tue Jan 01 2019');
      expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[0].dataPoints[1].y).toEqual(16513.962324950404);
      expect(ary[0].dataPoints[1].ttip).toEqual('16513.96 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[2].y).toEqual(17257.090629573195);
      expect(ary[0].dataPoints[2].ttip).toEqual('17257.09 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[3].y).toEqual(18033.659707904008);
      expect(ary[0].dataPoints[3].ttip).toEqual('18033.66 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[4].y).toEqual(18845.174394759717);
      expect(ary[0].dataPoints[4].ttip).toEqual('18845.17 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[5].y).toEqual(19693.20724252392);
      expect(ary[0].dataPoints[5].ttip).toEqual('19693.21 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[6].y).toEqual(20579.401568437515);
      expect(ary[0].dataPoints[6].ttip).toEqual('20579.40 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[7].y).toEqual(21505.474639017222);
      expect(ary[0].dataPoints[7].ttip).toEqual('21505.47 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(22473.220997773027);
      expect(ary[0].dataPoints[8].ttip).toEqual('22473.22 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(23484.515942672835);
      expect(ary[0].dataPoints[9].ttip).toEqual('23484.52 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(24541.31916009313);
      expect(ary[0].dataPoints[10].ttip).toEqual('24541.32 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(25645.678522297345);
      expect(ary[0].dataPoints[11].ttip).toEqual('25645.68 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[12].y).toEqual(26799.73405580075);
      expect(ary[0].dataPoints[12].ttip).toEqual('26799.73 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[13].y).toEqual(28005.722088311813);
      expect(ary[0].dataPoints[13].ttip).toEqual('28005.72 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[14].y).toEqual(29265.97958228587);
      expect(ary[0].dataPoints[14].ttip).toEqual('29265.98 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[15].y).toEqual(30582.948663488758);
      expect(ary[0].dataPoints[15].ttip).toEqual('30582.95 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[16].y).toEqual(31959.181353345793);
      expect(ary[0].dataPoints[16].ttip).toEqual('31959.18 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[17].y).toEqual(33397.34451424639);
      expect(ary[0].dataPoints[17].ttip).toEqual('33397.34 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[18].y).toEqual(34900.22501738751);
      expect(ary[0].dataPoints[18].ttip).toEqual('34900.23 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[19].y).toEqual(36470.73514316998);
      expect(ary[0].dataPoints[19].ttip).toEqual('36470.74 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[20].y).toEqual(38111.91822461266);
      expect(ary[0].dataPoints[20].ttip).toEqual('38111.92 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[21].y).toEqual(39826.95454472027);
      expect(ary[0].dataPoints[21].ttip).toEqual('39826.95 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[22].y).toEqual(41619.16749923273);
      expect(ary[0].dataPoints[22].ttip).toEqual('41619.17 at Tue Jan 01 2041');
      expect(ary[1].name).toEqual('Run car');
      expect(ary[1].type).toEqual('stackedColumn');
      expect(ary[1].showInLegend).toEqual(true);
      expect(ary[1].dataPoints.length).toEqual(23);
      expect(ary[1].dataPoints[0].label).toEqual('Tue Jan 01 2019');
      expect(ary[1].dataPoints[0].y).toEqual(7193.517104345055);
      expect(ary[1].dataPoints[0].ttip).toEqual('7193.52 at Tue Jan 01 2019');
      expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[1].dataPoints[1].y).toEqual(9224.493645918672);
      expect(ary[1].dataPoints[1].ttip).toEqual('9224.49 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[2].y).toEqual(9916.330669362571);
      expect(ary[1].dataPoints[2].ttip).toEqual('9916.33 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[3].y).toEqual(10660.055469564766);
      expect(ary[1].dataPoints[3].ttip).toEqual('10660.06 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[4].y).toEqual(11459.559629782123);
      expect(ary[1].dataPoints[4].ttip).toEqual('11459.56 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[5].y).toEqual(12319.026602015787);
      expect(ary[1].dataPoints[5].ttip).toEqual('12319.03 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[6].y).toEqual(13242.953597166968);
      expect(ary[1].dataPoints[6].ttip).toEqual('13242.95 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[7].y).toEqual(13010.109713272253);
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
      expect(ary[2].dataPoints[0].y).toEqual(5083.498698678214);
      expect(ary[2].dataPoints[0].ttip).toEqual('5083.50 at Tue Jan 01 2019');
      expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[2].dataPoints[1].y).toEqual(6351.523971134771);
      expect(ary[2].dataPoints[1].ttip).toEqual('6351.52 at Wed Jan 01 2020');
      expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[2].dataPoints[2].y).toEqual(6637.342549835845);
      expect(ary[2].dataPoints[2].ttip).toEqual('6637.34 at Fri Jan 01 2021');
      expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[2].dataPoints[3].y).toEqual(6936.022964578465);
      expect(ary[2].dataPoints[3].ttip).toEqual('6936.02 at Sat Jan 01 2022');
      expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[2].dataPoints[4].y).toEqual(7248.143997984505);
      expect(ary[2].dataPoints[4].ttip).toEqual('7248.14 at Sun Jan 01 2023');
      expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[2].dataPoints[5].y).toEqual(7574.310477893816);
      expect(ary[2].dataPoints[5].ttip).toEqual('7574.31 at Mon Jan 01 2024');
      expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[2].dataPoints[6].y).toEqual(7915.154449399044);
      expect(ary[2].dataPoints[6].ttip).toEqual('7915.15 at Wed Jan 01 2025');
      expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[2].dataPoints[7].y).toEqual(8271.336399622009);
      expect(ary[2].dataPoints[7].ttip).toEqual('8271.34 at Thu Jan 01 2026');
      expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[2].dataPoints[8].y).toEqual(8643.546537605005);
      expect(ary[2].dataPoints[8].ttip).toEqual('8643.55 at Fri Jan 01 2027');
      expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[2].dataPoints[9].y).toEqual(9032.506131797238);
      expect(ary[2].dataPoints[9].ttip).toEqual('9032.51 at Sat Jan 01 2028');
      expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[2].dataPoints[10].y).toEqual(9438.968907728122);
      expect(ary[2].dataPoints[10].ttip).toEqual('9438.97 at Mon Jan 01 2029');
      expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[2].dataPoints[11].y).toEqual(9863.722508575898);
      expect(ary[2].dataPoints[11].ttip).toEqual('9863.72 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[12].y).toEqual(10307.590021461823);
      expect(ary[2].dataPoints[12].ttip).toEqual('10307.59 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[13].y).toEqual(10771.431572427617);
      expect(ary[2].dataPoints[13].ttip).toEqual('10771.43 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[14].y).toEqual(11256.145993186869);
      expect(ary[2].dataPoints[14].ttip).toEqual('11256.15 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[15].y).toEqual(11762.672562880292);
      expect(ary[2].dataPoints[15].ttip).toEqual('11762.67 at Sun Jan 01 2034');
      expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[2].dataPoints[16].y).toEqual(12291.992828209915);
      expect(ary[2].dataPoints[16].ttip).toEqual('12291.99 at Mon Jan 01 2035');
      expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[2].dataPoints[17].y).toEqual(12845.13250547937);
      expect(ary[2].dataPoints[17].ttip).toEqual('12845.13 at Tue Jan 01 2036');
      expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[2].dataPoints[18].y).toEqual(13423.16346822596);
      expect(ary[2].dataPoints[18].ttip).toEqual('13423.16 at Thu Jan 01 2037');
      expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[2].dataPoints[19].y).toEqual(14027.205824296141);
      expect(ary[2].dataPoints[19].ttip).toEqual('14027.21 at Fri Jan 01 2038');
      expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[2].dataPoints[20].y).toEqual(14658.430086389482);
      expect(ary[2].dataPoints[20].ttip).toEqual('14658.43 at Sat Jan 01 2039');
      expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[2].dataPoints[21].y).toEqual(15318.059440277028);
      expect(ary[2].dataPoints[21].ttip).toEqual('15318.06 at Sun Jan 01 2040');
      expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[2].dataPoints[22].y).toEqual(16007.372115089514);
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
      expect(ary[0].dataPoints[3].y).toEqual(900);
      expect(ary[0].dataPoints[3].ttip).toEqual('900.00 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[4].y).toEqual(11233.902681119303);
      expect(ary[0].dataPoints[4].ttip).toEqual('11233.90 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(12076.445382203248);
      expect(ary[0].dataPoints[5].ttip).toEqual('12076.45 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(12982.178785868495);
      expect(ary[0].dataPoints[6].ttip).toEqual('12982.18 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(13955.842194808632);
      expect(ary[0].dataPoints[7].ttip).toEqual('13955.84 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(15002.530359419286);
      expect(ary[0].dataPoints[8].ttip).toEqual('15002.53 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(16127.720136375734);
      expect(ary[0].dataPoints[9].ttip).toEqual('16127.72 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(17337.29914660392);
      expect(ary[0].dataPoints[10].ttip).toEqual('17337.30 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(18637.596582599217);
      expect(ary[0].dataPoints[11].ttip).toEqual('18637.60 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(20035.416326294162);
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
      expect(ary[0].dataPoints[7].y).toEqual(16213.44240294964);
      expect(ary[0].dataPoints[7].ttip).toEqual('16213.44 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(22090.328742548965);
      expect(ary[0].dataPoints[8].ttip).toEqual('22090.33 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(22642.586961112658);
      expect(ary[0].dataPoints[9].ttip).toEqual('22642.59 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(23208.651635140446);
      expect(ary[0].dataPoints[10].ttip).toEqual('23208.65 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(5892.261200237232);
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
      expect(ary[1].dataPoints[0].y).toEqual(16670.990954981648);
      expect(ary[1].dataPoints[0].ttip).toEqual('16670.99 at Tue Jan 01 2019');
      expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[1].dataPoints[1].y).toEqual(18622.105240679455);
      expect(ary[1].dataPoints[1].ttip).toEqual('18622.11 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[2].y).toEqual(19087.657871696414);
      expect(ary[1].dataPoints[2].ttip).toEqual('19087.66 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[3].y).toEqual(19564.8493184888);
      expect(ary[1].dataPoints[3].ttip).toEqual('19564.85 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[4].y).toEqual(20053.97055145099);
      expect(ary[1].dataPoints[4].ttip).toEqual('20053.97 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[5].y).toEqual(20555.31981523724);
      expect(ary[1].dataPoints[5].ttip).toEqual('20555.32 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[6].y).toEqual(21069.20281061814);
      expect(ary[1].dataPoints[6].ttip).toEqual('21069.20 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[7].y).toEqual(5349.093441213316);
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
      expect(ary[2].dataPoints[0].y).toEqual(39215.257112382584);
      expect(ary[2].dataPoints[0].ttip).toEqual('39215.26 at Tue Jan 01 2019');
      expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[2].dataPoints[1].y).toEqual(44624.05227791697);
      expect(ary[2].dataPoints[1].ttip).toEqual('44624.05 at Wed Jan 01 2020');
      expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[2].dataPoints[2].y).toEqual(46632.13463042329);
      expect(ary[2].dataPoints[2].ttip).toEqual('46632.13 at Fri Jan 01 2021');
      expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[2].dataPoints[3].y).toEqual(48730.58068879238);
      expect(ary[2].dataPoints[3].ttip).toEqual('48730.58 at Sat Jan 01 2022');
      expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[2].dataPoints[4].y).toEqual(50923.45681978809);
      expect(ary[2].dataPoints[4].ttip).toEqual('50923.46 at Sun Jan 01 2023');
      expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[2].dataPoints[5].y).toEqual(53215.0123766786);
      expect(ary[2].dataPoints[5].ttip).toEqual('53215.01 at Mon Jan 01 2024');
      expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[2].dataPoints[6].y).toEqual(55609.68793362918);
      expect(ary[2].dataPoints[6].ttip).toEqual('55609.69 at Wed Jan 01 2025');
      expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[2].dataPoints[7].y).toEqual(58112.12389064255);
      expect(ary[2].dataPoints[7].ttip).toEqual('58112.12 at Thu Jan 01 2026');
      expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[2].dataPoints[8].y).toEqual(60727.169465721556);
      expect(ary[2].dataPoints[8].ttip).toEqual('60727.17 at Fri Jan 01 2027');
      expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[2].dataPoints[9].y).toEqual(63459.8920916791);
      expect(ary[2].dataPoints[9].ttip).toEqual('63459.89 at Sat Jan 01 2028');
      expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[2].dataPoints[10].y).toEqual(66315.58723580472);
      expect(ary[2].dataPoints[10].ttip).toEqual('66315.59 at Mon Jan 01 2029');
      expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[2].dataPoints[11].y).toEqual(69299.788661416);
      expect(ary[2].dataPoints[11].ttip).toEqual('69299.79 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[12].y).toEqual(72418.27915117978);
      expect(ary[2].dataPoints[12].ttip).toEqual('72418.28 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[13].y).toEqual(75677.10171298299);
      expect(ary[2].dataPoints[13].ttip).toEqual('75677.10 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[14].y).toEqual(79082.5712900673);
      expect(ary[2].dataPoints[14].ttip).toEqual('79082.57 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[15].y).toEqual(82641.28699812043);
      expect(ary[2].dataPoints[15].ttip).toEqual('82641.29 at Sun Jan 01 2034');
      expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[2].dataPoints[16].y).toEqual(86360.14491303594);
      expect(ary[2].dataPoints[16].ttip).toEqual('86360.14 at Mon Jan 01 2035');
      expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[2].dataPoints[17].y).toEqual(90246.35143412265);
      expect(ary[2].dataPoints[17].ttip).toEqual('90246.35 at Tue Jan 01 2036');
      expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[2].dataPoints[18].y).toEqual(94307.43724865826);
      expect(ary[2].dataPoints[18].ttip).toEqual('94307.44 at Thu Jan 01 2037');
      expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[2].dataPoints[19].y).toEqual(98551.27192484797);
      expect(ary[2].dataPoints[19].ttip).toEqual('98551.27 at Fri Jan 01 2038');
      expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[2].dataPoints[20].y).toEqual(102986.07916146623);
      expect(ary[2].dataPoints[20].ttip).toEqual(
        '102986.08 at Sat Jan 01 2039',
      );
      expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[2].dataPoints[21].y).toEqual(107620.45272373235);
      expect(ary[2].dataPoints[21].ttip).toEqual(
        '107620.45 at Sun Jan 01 2040',
      );
      expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[2].dataPoints[22].y).toEqual(112463.37309630039);
      expect(ary[2].dataPoints[22].ttip).toEqual(
        '112463.37 at Tue Jan 01 2041',
      );
    } else if (
      createButtonID === 'btn-create-Defined Benefits Pension-example'
    ) {
      expect(ary.length).toEqual(3);
      expect(ary[0].name).toEqual('TeachingJob');
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
      expect(ary[0].dataPoints[3].y).toEqual(2500);
      expect(ary[0].dataPoints[3].ttip).toEqual('2500.00 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[4].y).toEqual(30324.01675101832);
      expect(ary[0].dataPoints[4].ttip).toEqual('30324.02 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(30930.497086038697);
      expect(ary[0].dataPoints[5].ttip).toEqual('30930.50 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(31549.10702775949);
      expect(ary[0].dataPoints[6].ttip).toEqual('31549.11 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(32180.089168314702);
      expect(ary[0].dataPoints[7].ttip).toEqual('32180.09 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(32823.69095168102);
      expect(ary[0].dataPoints[8].ttip).toEqual('32823.69 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(33480.16477071466);
      expect(ary[0].dataPoints[9].ttip).toEqual('33480.16 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(34149.768066128985);
      expect(ary[0].dataPoints[10].ttip).toEqual('34149.77 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(31903.614974945907);
      expect(ary[0].dataPoints[11].ttip).toEqual('31903.61 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(0);
      expect(ary[0].dataPoints[12].ttip).toEqual('0.00 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[13].y).toEqual(0);
      expect(ary[0].dataPoints[13].ttip).toEqual('0.00 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[14].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[14].y).toEqual(0);
      expect(ary[0].dataPoints[14].ttip).toEqual('0.00 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[15].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[15].y).toEqual(0);
      expect(ary[0].dataPoints[15].ttip).toEqual('0.00 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[16].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[16].y).toEqual(0);
      expect(ary[0].dataPoints[16].ttip).toEqual('0.00 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[17].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[17].y).toEqual(0);
      expect(ary[0].dataPoints[17].ttip).toEqual('0.00 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[18].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[18].y).toEqual(0);
      expect(ary[0].dataPoints[18].ttip).toEqual('0.00 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[19].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[19].y).toEqual(0);
      expect(ary[0].dataPoints[19].ttip).toEqual('0.00 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[20].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[20].y).toEqual(0);
      expect(ary[0].dataPoints[20].ttip).toEqual('0.00 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[21].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[21].y).toEqual(0);
      expect(ary[0].dataPoints[21].ttip).toEqual('0.00 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[22].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[22].y).toEqual(0);
      expect(ary[0].dataPoints[22].ttip).toEqual('0.00 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[23].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[23].y).toEqual(0);
      expect(ary[0].dataPoints[23].ttip).toEqual('0.00 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[24].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[24].y).toEqual(0);
      expect(ary[0].dataPoints[24].ttip).toEqual('0.00 at Tue Jan 01 2041');
      expect(ary[0].dataPoints[25].label).toEqual('Wed Jan 01 2042');
      expect(ary[0].dataPoints[25].y).toEqual(0);
      expect(ary[0].dataPoints[25].ttip).toEqual('0.00 at Wed Jan 01 2042');
      expect(ary[0].dataPoints[26].label).toEqual('Thu Jan 01 2043');
      expect(ary[0].dataPoints[26].y).toEqual(0);
      expect(ary[0].dataPoints[26].ttip).toEqual('0.00 at Thu Jan 01 2043');
      expect(ary[0].dataPoints[27].label).toEqual('Fri Jan 01 2044');
      expect(ary[0].dataPoints[27].y).toEqual(0);
      expect(ary[0].dataPoints[27].ttip).toEqual('0.00 at Fri Jan 01 2044');
      expect(ary[1].name).toEqual(`${pensionDB}TeachersPensionScheme`);
      expect(ary[1].type).toEqual('stackedColumn');
      expect(ary[1].showInLegend).toEqual(true);
      expect(ary[1].dataPoints.length).toEqual(28);
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
      expect(ary[1].dataPoints[3].y).toEqual(0);
      expect(ary[1].dataPoints[3].ttip).toEqual('0.00 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[4].y).toEqual(0);
      expect(ary[1].dataPoints[4].ttip).toEqual('0.00 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[5].y).toEqual(0);
      expect(ary[1].dataPoints[5].ttip).toEqual('0.00 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[6].y).toEqual(0);
      expect(ary[1].dataPoints[6].ttip).toEqual('0.00 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[7].y).toEqual(0);
      expect(ary[1].dataPoints[7].ttip).toEqual('0.00 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[8].y).toEqual(0);
      expect(ary[1].dataPoints[8].ttip).toEqual('0.00 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[9].y).toEqual(0);
      expect(ary[1].dataPoints[9].ttip).toEqual('0.00 at Thu Jan 01 2026');
      expect(ary[1].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[1].dataPoints[10].y).toEqual(0);
      expect(ary[1].dataPoints[10].ttip).toEqual('0.00 at Fri Jan 01 2027');
      expect(ary[1].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[1].dataPoints[11].y).toEqual(0);
      expect(ary[1].dataPoints[11].ttip).toEqual('0.00 at Sat Jan 01 2028');
      expect(ary[1].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[1].dataPoints[12].y).toEqual(0);
      expect(ary[1].dataPoints[12].ttip).toEqual('0.00 at Mon Jan 01 2029');
      expect(ary[1].dataPoints[13].label).toEqual('Tue Jan 01 2030');
      expect(ary[1].dataPoints[13].y).toEqual(365.6983259984293);
      expect(ary[1].dataPoints[13].ttip).toEqual('365.70 at Tue Jan 01 2030');
      expect(ary[1].dataPoints[14].label).toEqual('Wed Jan 01 2031');
      expect(ary[1].dataPoints[14].y).toEqual(4435.776865358291);
      expect(ary[1].dataPoints[14].ttip).toEqual('4435.78 at Wed Jan 01 2031');
      expect(ary[1].dataPoints[15].label).toEqual('Thu Jan 01 2032');
      expect(ary[1].dataPoints[15].y).toEqual(4524.49240266546);
      expect(ary[1].dataPoints[15].ttip).toEqual('4524.49 at Thu Jan 01 2032');
      expect(ary[1].dataPoints[16].label).toEqual('Sat Jan 01 2033');
      expect(ary[1].dataPoints[16].y).toEqual(4614.98225071877);
      expect(ary[1].dataPoints[16].ttip).toEqual('4614.98 at Sat Jan 01 2033');
      expect(ary[1].dataPoints[17].label).toEqual('Sun Jan 01 2034');
      expect(ary[1].dataPoints[17].y).toEqual(4707.281895733147);
      expect(ary[1].dataPoints[17].ttip).toEqual('4707.28 at Sun Jan 01 2034');
      expect(ary[1].dataPoints[18].label).toEqual('Mon Jan 01 2035');
      expect(ary[1].dataPoints[18].y).toEqual(4397.66703215057);
      expect(ary[1].dataPoints[18].ttip).toEqual('4397.67 at Mon Jan 01 2035');
      expect(ary[1].dataPoints[19].label).toEqual('Tue Jan 01 2036');
      expect(ary[1].dataPoints[19].y).toEqual(0);
      expect(ary[1].dataPoints[19].ttip).toEqual('0.00 at Tue Jan 01 2036');
      expect(ary[1].dataPoints[20].label).toEqual('Thu Jan 01 2037');
      expect(ary[1].dataPoints[20].y).toEqual(0);
      expect(ary[1].dataPoints[20].ttip).toEqual('0.00 at Thu Jan 01 2037');
      expect(ary[1].dataPoints[21].label).toEqual('Fri Jan 01 2038');
      expect(ary[1].dataPoints[21].y).toEqual(0);
      expect(ary[1].dataPoints[21].ttip).toEqual('0.00 at Fri Jan 01 2038');
      expect(ary[1].dataPoints[22].label).toEqual('Sat Jan 01 2039');
      expect(ary[1].dataPoints[22].y).toEqual(0);
      expect(ary[1].dataPoints[22].ttip).toEqual('0.00 at Sat Jan 01 2039');
      expect(ary[1].dataPoints[23].label).toEqual('Sun Jan 01 2040');
      expect(ary[1].dataPoints[23].y).toEqual(0);
      expect(ary[1].dataPoints[23].ttip).toEqual('0.00 at Sun Jan 01 2040');
      expect(ary[1].dataPoints[24].label).toEqual('Tue Jan 01 2041');
      expect(ary[1].dataPoints[24].y).toEqual(0);
      expect(ary[1].dataPoints[24].ttip).toEqual('0.00 at Tue Jan 01 2041');
      expect(ary[1].dataPoints[25].label).toEqual('Wed Jan 01 2042');
      expect(ary[1].dataPoints[25].y).toEqual(0);
      expect(ary[1].dataPoints[25].ttip).toEqual('0.00 at Wed Jan 01 2042');
      expect(ary[1].dataPoints[26].label).toEqual('Thu Jan 01 2043');
      expect(ary[1].dataPoints[26].y).toEqual(0);
      expect(ary[1].dataPoints[26].ttip).toEqual('0.00 at Thu Jan 01 2043');
      expect(ary[1].dataPoints[27].label).toEqual('Fri Jan 01 2044');
      expect(ary[1].dataPoints[27].y).toEqual(0);
      expect(ary[1].dataPoints[27].ttip).toEqual('0.00 at Fri Jan 01 2044');
      expect(ary[2].name).toEqual(`${pensionTransfer}TeachersPensionScheme`);
      expect(ary[2].type).toEqual('stackedColumn');
      expect(ary[2].showInLegend).toEqual(true);
      expect(ary[2].dataPoints.length).toEqual(28);
      expect(ary[2].dataPoints[0].label).toEqual('Sun Jan 01 2017');
      expect(ary[2].dataPoints[0].y).toEqual(0);
      expect(ary[2].dataPoints[0].ttip).toEqual('0.00 at Sun Jan 01 2017');
      expect(ary[2].dataPoints[1].label).toEqual('Mon Jan 01 2018');
      expect(ary[2].dataPoints[1].y).toEqual(0);
      expect(ary[2].dataPoints[1].ttip).toEqual('0.00 at Mon Jan 01 2018');
      expect(ary[2].dataPoints[2].label).toEqual('Tue Jan 01 2019');
      expect(ary[2].dataPoints[2].y).toEqual(0);
      expect(ary[2].dataPoints[2].ttip).toEqual('0.00 at Tue Jan 01 2019');
      expect(ary[2].dataPoints[3].label).toEqual('Wed Jan 01 2020');
      expect(ary[2].dataPoints[3].y).toEqual(0);
      expect(ary[2].dataPoints[3].ttip).toEqual('0.00 at Wed Jan 01 2020');
      expect(ary[2].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[2].dataPoints[4].y).toEqual(0);
      expect(ary[2].dataPoints[4].ttip).toEqual('0.00 at Fri Jan 01 2021');
      expect(ary[2].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[2].dataPoints[5].y).toEqual(0);
      expect(ary[2].dataPoints[5].ttip).toEqual('0.00 at Sat Jan 01 2022');
      expect(ary[2].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[2].dataPoints[6].y).toEqual(0);
      expect(ary[2].dataPoints[6].ttip).toEqual('0.00 at Sun Jan 01 2023');
      expect(ary[2].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[2].dataPoints[7].y).toEqual(0);
      expect(ary[2].dataPoints[7].ttip).toEqual('0.00 at Mon Jan 01 2024');
      expect(ary[2].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[2].dataPoints[8].y).toEqual(0);
      expect(ary[2].dataPoints[8].ttip).toEqual('0.00 at Wed Jan 01 2025');
      expect(ary[2].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[2].dataPoints[9].y).toEqual(0);
      expect(ary[2].dataPoints[9].ttip).toEqual('0.00 at Thu Jan 01 2026');
      expect(ary[2].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[2].dataPoints[10].y).toEqual(0);
      expect(ary[2].dataPoints[10].ttip).toEqual('0.00 at Fri Jan 01 2027');
      expect(ary[2].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[2].dataPoints[11].y).toEqual(0);
      expect(ary[2].dataPoints[11].ttip).toEqual('0.00 at Sat Jan 01 2028');
      expect(ary[2].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[2].dataPoints[12].y).toEqual(0);
      expect(ary[2].dataPoints[12].ttip).toEqual('0.00 at Mon Jan 01 2029');
      expect(ary[2].dataPoints[13].label).toEqual('Tue Jan 01 2030');
      expect(ary[2].dataPoints[13].y).toEqual(0);
      expect(ary[2].dataPoints[13].ttip).toEqual('0.00 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[14].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[14].y).toEqual(0);
      expect(ary[2].dataPoints[14].ttip).toEqual('0.00 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[15].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[15].y).toEqual(0);
      expect(ary[2].dataPoints[15].ttip).toEqual('0.00 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[16].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[16].y).toEqual(0);
      expect(ary[2].dataPoints[16].ttip).toEqual('0.00 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[17].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[17].y).toEqual(0);
      expect(ary[2].dataPoints[17].ttip).toEqual('0.00 at Sun Jan 01 2034');
      expect(ary[2].dataPoints[18].label).toEqual('Mon Jan 01 2035');
      expect(ary[2].dataPoints[18].y).toEqual(201.54737886623457);
      expect(ary[2].dataPoints[18].ttip).toEqual('201.55 at Mon Jan 01 2035');
      expect(ary[2].dataPoints[19].label).toEqual('Tue Jan 01 2036');
      expect(ary[2].dataPoints[19].y).toEqual(2444.6904371454134);
      expect(ary[2].dataPoints[19].ttip).toEqual('2444.69 at Tue Jan 01 2036');
      expect(ary[2].dataPoints[20].label).toEqual('Thu Jan 01 2037');
      expect(ary[2].dataPoints[20].y).toEqual(2493.584245888323);
      expect(ary[2].dataPoints[20].ttip).toEqual('2493.58 at Thu Jan 01 2037');
      expect(ary[2].dataPoints[21].label).toEqual('Fri Jan 01 2038');
      expect(ary[2].dataPoints[21].y).toEqual(2543.4559308060902);
      expect(ary[2].dataPoints[21].ttip).toEqual('2543.46 at Fri Jan 01 2038');
      expect(ary[2].dataPoints[22].label).toEqual('Sat Jan 01 2039');
      expect(ary[2].dataPoints[22].y).toEqual(2594.325049422213);
      expect(ary[2].dataPoints[22].ttip).toEqual('2594.33 at Sat Jan 01 2039');
      expect(ary[2].dataPoints[23].label).toEqual('Sun Jan 01 2040');
      expect(ary[2].dataPoints[23].y).toEqual(2423.6869584691717);
      expect(ary[2].dataPoints[23].ttip).toEqual('2423.69 at Sun Jan 01 2040');
      expect(ary[2].dataPoints[24].label).toEqual('Tue Jan 01 2041');
      expect(ary[2].dataPoints[24].y).toEqual(0);
      expect(ary[2].dataPoints[24].ttip).toEqual('0.00 at Tue Jan 01 2041');
      expect(ary[2].dataPoints[25].label).toEqual('Wed Jan 01 2042');
      expect(ary[2].dataPoints[25].y).toEqual(0);
      expect(ary[2].dataPoints[25].ttip).toEqual('0.00 at Wed Jan 01 2042');
      expect(ary[2].dataPoints[26].label).toEqual('Thu Jan 01 2043');
      expect(ary[2].dataPoints[26].y).toEqual(0);
      expect(ary[2].dataPoints[26].ttip).toEqual('0.00 at Thu Jan 01 2043');
      expect(ary[2].dataPoints[27].label).toEqual('Fri Jan 01 2044');
      expect(ary[2].dataPoints[27].y).toEqual(0);
      expect(ary[2].dataPoints[27].ttip).toEqual('0.00 at Fri Jan 01 2044');
    } else if (
      createButtonID === 'btn-create-Defined Contributions Pension-example'
    ) {
      expect(ary.length).toEqual(1);
      expect(ary[0].name).toEqual('javaJob1');
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
      expect(ary[0].dataPoints[2].y).toEqual(2550.000000000002);
      expect(ary[0].dataPoints[2].ttip).toEqual('2550.00 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[3].y).toEqual(30930.497086038704);
      expect(ary[0].dataPoints[3].ttip).toEqual('30930.50 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[4].y).toEqual(31549.1070277595);
      expect(ary[0].dataPoints[4].ttip).toEqual('31549.11 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[5].y).toEqual(32180.08916831471);
      expect(ary[0].dataPoints[5].ttip).toEqual('32180.09 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[6].y).toEqual(32823.69095168103);
      expect(ary[0].dataPoints[6].ttip).toEqual('32823.69 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[7].y).toEqual(33480.16477071467);
      expect(ary[0].dataPoints[7].ttip).toEqual('33480.16 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(34149.768066128985);
      expect(ary[0].dataPoints[8].ttip).toEqual('34149.77 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(31903.614974945907);
      expect(ary[0].dataPoints[9].ttip).toEqual('31903.61 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(0);
      expect(ary[0].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(0);
      expect(ary[0].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
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
      expect(ary[0].dataPoints[23].label).toEqual('Wed Jan 01 2042');
      expect(ary[0].dataPoints[23].y).toEqual(0);
      expect(ary[0].dataPoints[23].ttip).toEqual('0.00 at Wed Jan 01 2042');
      expect(ary[0].dataPoints[24].label).toEqual('Thu Jan 01 2043');
      expect(ary[0].dataPoints[24].y).toEqual(0);
      expect(ary[0].dataPoints[24].ttip).toEqual('0.00 at Thu Jan 01 2043');
      expect(ary[0].dataPoints[25].label).toEqual('Fri Jan 01 2044');
      expect(ary[0].dataPoints[25].y).toEqual(0);
      expect(ary[0].dataPoints[25].ttip).toEqual('0.00 at Fri Jan 01 2044');
      expect(ary[0].dataPoints[26].label).toEqual('Sun Jan 01 2045');
      expect(ary[0].dataPoints[26].y).toEqual(0);
      expect(ary[0].dataPoints[26].ttip).toEqual('0.00 at Sun Jan 01 2045');
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
      expect(ary[0].dataPoints[3].y).toEqual(1241);
      expect(ary[0].dataPoints[3].ttip).toEqual('1241.00 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[4].y).toEqual(15092.901739536617);
      expect(ary[0].dataPoints[4].ttip).toEqual('15092.90 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(15470.22428302501);
      expect(ary[0].dataPoints[5].ttip).toEqual('15470.22 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(15856.979890100614);
      expect(ary[0].dataPoints[6].ttip).toEqual('15856.98 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(16253.404387353105);
      expect(ary[0].dataPoints[7].ttip).toEqual('16253.40 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(16659.739497036913);
      expect(ary[0].dataPoints[8].ttip).toEqual('16659.74 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(17076.232984462815);
      expect(ary[0].dataPoints[9].ttip).toEqual('17076.23 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(17503.138809074357);
      expect(ary[0].dataPoints[10].ttip).toEqual('17503.14 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(17940.71727930119);
      expect(ary[0].dataPoints[11].ttip).toEqual('17940.72 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(18389.235211283696);
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
      expect(ary[0].dataPoints[9].y).toEqual(91997.42392050933);
      expect(ary[0].dataPoints[9].ttip).toEqual('91997.42 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(77903.21537832021);
      expect(ary[0].dataPoints[10].ttip).toEqual('77903.22 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(63152.216718065065);
      expect(ary[0].dataPoints[11].ttip).toEqual('63152.22 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[12].y).toEqual(47713.82152024207);
      expect(ary[0].dataPoints[12].ttip).toEqual('47713.82 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[13].y).toEqual(31555.997106200528);
      expect(ary[0].dataPoints[13].ttip).toEqual('31556.00 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[14].y).toEqual(14645.218074464672);
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
      expect(ary[1].dataPoints[0].y).toEqual(219725.82439548898);
      expect(ary[1].dataPoints[0].ttip).toEqual('219725.82 at Tue Jan 01 2019');
      expect(ary[1].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[1].dataPoints[1].y).toEqual(206654.01049939278);
      expect(ary[1].dataPoints[1].ttip).toEqual('206654.01 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[2].y).toEqual(193277.62333951754);
      expect(ary[1].dataPoints[2].ttip).toEqual('193277.62 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[3].y).toEqual(179589.5663588172);
      expect(ary[1].dataPoints[3].ttip).toEqual('179589.57 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[4].y).toEqual(165582.57765046653);
      expect(ary[1].dataPoints[4].ttip).toEqual('165582.58 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[5].y).toEqual(151249.22610521133);
      expect(ary[1].dataPoints[5].ttip).toEqual('151249.23 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[6].y).toEqual(136581.90746895166);
      expect(ary[1].dataPoints[6].ttip).toEqual('136581.91 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[7].y).toEqual(121572.8403084671);
      expect(ary[1].dataPoints[7].ttip).toEqual('121572.84 at Thu Jan 01 2026');
      expect(ary[1].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[1].dataPoints[8].y).toEqual(106214.06188314324);
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

  async function testModelContent(createButtonID: string) {
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

  it('should have right content for examples', async done => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent('btn-create-Simple-example');
    await testModelContent('btn-create-Defined Benefits Pension-example');
    await testModelContent('btn-create-Defined Contributions Pension-example');
    await testModelContent('btn-create-National Savings Income Bonds-example');

    done();
  });

  it('should create new clones', async done => {
    const testDataModelName = 'testName4';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-clone', testDataModelName);

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

    await testModelCreation('btn-createMinimalModel', testDataModelName);

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
