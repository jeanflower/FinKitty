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

import webdriver from 'selenium-webdriver';

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

  it('new, switch, cancel', async done => {
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

    await makeNewModel(ex2Name);
    await assertCurrentModel(ex2Name, true);

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
    await clickButton(driver, 'btn-toggle-check-overwrite');

    await modelExists(ex1Name, false);
    await modelExists(ex2Name, true);

    await switchToModel(ex2Name);
    await expectCashValue(20);
    await setCashValue(30);
    await expectCashValue(30);

    await driver.get('about:blank');
    await driver.get(serverUri);
    await clickButton(driver, 'buttonTestLogin');
    await clickButton(driver, 'btn-toggle-check-overwrite');

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
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation('btn-create-Simple-example');

    await cleanUpWork(driver, testDataModelName);
    done();
  });

  function assertAssetData(
    ary: any, 
    createButtonID: string,
  ){
    if(createButtonID === 'btn-create-Simple-example'){
      expect(ary.length).toEqual(3);
      expect(ary[0].name).toEqual('Stocks');
      expect(ary[0].type).toEqual('stackedColumn');
      expect(ary[0].showInLegend).toEqual(true);
      expect(ary[0].dataPoints.length).toEqual(23);
      expect(ary[0].dataPoints[0].label).toEqual('Tue Jan 01 2019');
      expect(ary[0].dataPoints[0].y).toEqual(4379.9026415574035);
      expect(ary[0].dataPoints[0].ttip).toEqual('4379.90 at Tue Jan 01 2019');
      expect(ary[0].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[0].dataPoints[1].y).toEqual(4762.530936323855);
      expect(ary[0].dataPoints[1].ttip).toEqual('4762.53 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[2].y).toEqual(3262.079999999997);
      expect(ary[0].dataPoints[2].ttip).toEqual('3262.08 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[3].y).toEqual(3547.055308799993);
      expect(ary[0].dataPoints[3].ttip).toEqual('3547.06 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[4].y).toEqual(3856.926060576756);
      expect(ary[0].dataPoints[4].ttip).toEqual('3856.93 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[5].y).toEqual(4193.867121228736);
      expect(ary[0].dataPoints[5].ttip).toEqual('4193.87 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[6].y).toEqual(4560.243352939273);
      expect(ary[0].dataPoints[6].ttip).toEqual('4560.24 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[7].y).toEqual(4958.626212252042);
      expect(ary[0].dataPoints[7].ttip).toEqual('4958.63 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(5391.8117981543755);
      expect(ary[0].dataPoints[8].ttip).toEqual('5391.81 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(5862.840476841135);
      expect(ary[0].dataPoints[9].ttip).toEqual('5862.84 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(6375.018220897967);
      expect(ary[0].dataPoints[10].ttip).toEqual('6375.02 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[11].y).toEqual(6931.939812675606);
      expect(ary[0].dataPoints[11].ttip).toEqual('6931.94 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[12].y).toEqual(7537.51407471094);
      expect(ary[0].dataPoints[12].ttip).toEqual('7537.51 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[13].y).toEqual(8195.991304277679);
      expect(ary[0].dataPoints[13].ttip).toEqual('8195.99 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[14].y).toEqual(8911.993104619367);
      expect(ary[0].dataPoints[14].ttip).toEqual('8911.99 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[15].y).toEqual(9690.544822238906);
      expect(ary[0].dataPoints[15].ttip).toEqual('9690.54 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[16].y).toEqual(10537.110817909685);
      expect(ary[0].dataPoints[16].ttip).toEqual('10537.11 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[17].y).toEqual(11457.632818962262);
      expect(ary[0].dataPoints[17].ttip).toEqual('11457.63 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[18].y).toEqual(12458.571622026793);
      expect(ary[0].dataPoints[18].ttip).toEqual('12458.57 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[19].y).toEqual(13546.952438927041);
      expect(ary[0].dataPoints[19].ttip).toEqual('13546.95 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[20].y).toEqual(14730.414203991691);
      expect(ary[0].dataPoints[20].ttip).toEqual('14730.41 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[21].y).toEqual(16017.263188852387);
      expect(ary[0].dataPoints[21].ttip).toEqual('16017.26 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[22].y).toEqual(17416.531301030518);
      expect(ary[0].dataPoints[22].ttip).toEqual('17416.53 at Tue Jan 01 2041');
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
      expect(ary[2].name).toEqual('Cash');
      expect(ary[2].type).toEqual('stackedColumn');
      expect(ary[2].showInLegend).toEqual(true);
      expect(ary[2].dataPoints.length).toEqual(23);
      expect(ary[2].dataPoints[0].label).toEqual('Tue Jan 01 2019');
      expect(ary[2].dataPoints[0].y).toEqual(10610.87950251122);
      expect(ary[2].dataPoints[0].ttip).toEqual('10610.88 at Tue Jan 01 2019');
      expect(ary[2].dataPoints[1].label).toEqual('Wed Jan 01 2020');
      expect(ary[2].dataPoints[1].y).toEqual(15562.480530672263);
      expect(ary[2].dataPoints[1].ttip).toEqual('15562.48 at Wed Jan 01 2020');
      expect(ary[2].dataPoints[2].label).toEqual('Fri Jan 01 2021');
      expect(ary[2].dataPoints[2].y).toEqual(21068.72340743249);
      expect(ary[2].dataPoints[2].ttip).toEqual('21068.72 at Fri Jan 01 2021');
      expect(ary[2].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[2].dataPoints[3].y).toEqual(27131.151753378013);
      expect(ary[2].dataPoints[3].ttip).toEqual('27131.15 at Sat Jan 01 2022');
      expect(ary[2].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[2].dataPoints[4].y).toEqual(33748.95106313611);
      expect(ary[2].dataPoints[4].ttip).toEqual('33748.95 at Sun Jan 01 2023');
      expect(ary[2].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[2].dataPoints[5].y).toEqual(40918.65713692358);
      expect(ary[2].dataPoints[5].ttip).toEqual('40918.66 at Mon Jan 01 2024');
      expect(ary[2].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[2].dataPoints[6].y).toEqual(48633.83773302775);
      expect(ary[2].dataPoints[6].ttip).toEqual('48633.84 at Wed Jan 01 2025');
      expect(ary[2].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[2].dataPoints[7].y).toEqual(59112.87046636595);
      expect(ary[2].dataPoints[7].ttip).toEqual('59112.87 at Thu Jan 01 2026');
      expect(ary[2].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[2].dataPoints[8].y).toEqual(83417.94260756831);
      expect(ary[2].dataPoints[8].ttip).toEqual('83417.94 at Fri Jan 01 2027');
      expect(ary[2].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[2].dataPoints[9].y).toEqual(111276.76159855736);
      expect(ary[2].dataPoints[9].ttip).toEqual('111276.76 at Sat Jan 01 2028');
      expect(ary[2].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[2].dataPoints[10].y).toEqual(139798.3417396427);
      expect(ary[2].dataPoints[10].ttip).toEqual('139798.34 at Mon Jan 01 2029');
      expect(ary[2].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[2].dataPoints[11].y).toEqual(152242.0959264844);
      expect(ary[2].dataPoints[11].ttip).toEqual('152242.10 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[12].y).toEqual(159695.81780965527);
      expect(ary[2].dataPoints[12].ttip).toEqual('159695.82 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[13].y).toEqual(168086.2178462586);
      expect(ary[2].dataPoints[13].ttip).toEqual('168086.22 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[14].y).toEqual(177461.91539805898);
      expect(ary[2].dataPoints[14].ttip).toEqual('177461.92 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[15].y).toEqual(190924.48800277797);
      expect(ary[2].dataPoints[15].ttip).toEqual('190924.49 at Sun Jan 01 2034');
      expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[2].dataPoints[16].y).toEqual(220706.8712440887);
      expect(ary[2].dataPoints[16].ttip).toEqual('220706.87 at Mon Jan 01 2035');
      expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[2].dataPoints[17].y).toEqual(252090.6247431317);
      expect(ary[2].dataPoints[17].ttip).toEqual('252090.62 at Tue Jan 01 2036');
      expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[2].dataPoints[18].y).toEqual(285144.88764922763);
      expect(ary[2].dataPoints[18].ttip).toEqual('285144.89 at Thu Jan 01 2037');
      expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[2].dataPoints[19].y).toEqual(319941.6010209209);
      expect(ary[2].dataPoints[19].ttip).toEqual('319941.60 at Fri Jan 01 2038');
      expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[2].dataPoints[20].y).toEqual(356555.62027083884);
      expect(ary[2].dataPoints[20].ttip).toEqual('356555.62 at Sat Jan 01 2039');
      expect(ary[2].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[2].dataPoints[21].y).toEqual(395064.8321818642);
      expect(ary[2].dataPoints[21].ttip).toEqual('395064.83 at Sun Jan 01 2040');
      expect(ary[2].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[2].dataPoints[22].y).toEqual(435550.27668441756);
      expect(ary[2].dataPoints[22].ttip).toEqual('435550.28 at Tue Jan 01 2041');
    } else if(createButtonID === 'btn-create-Defined Benefits Pension-example'){
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
      expect(ary[0].dataPoints[4].y).toEqual(32708.81573005839);
      expect(ary[0].dataPoints[4].ttip).toEqual('32708.82 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(57564.61476932003);
      expect(ary[0].dataPoints[5].ttip).toEqual('57564.61 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(81596.05944786617);
      expect(ary[0].dataPoints[6].ttip).toEqual('81596.06 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(106338.3177402786);
      expect(ary[0].dataPoints[7].ttip).toEqual('106338.32 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(131595.42087523692);
      expect(ary[0].dataPoints[8].ttip).toEqual('131595.42 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(157378.16574150953);
      expect(ary[0].dataPoints[9].ttip).toEqual('157378.17 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(183697.57766543803);
      expect(ary[0].dataPoints[10].ttip).toEqual('183697.58 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(207782.2242623034);
      expect(ary[0].dataPoints[11].ttip).toEqual('207782.22 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(205097.18894587876);
      expect(ary[0].dataPoints[12].ttip).toEqual('205097.19 at Mon Jan 01 2029');
      expect(ary[0].dataPoints[13].label).toEqual('Tue Jan 01 2030');
      expect(ary[0].dataPoints[13].y).toEqual(205462.8872718772);
      expect(ary[0].dataPoints[13].ttip).toEqual('205462.89 at Tue Jan 01 2030');
      expect(ary[0].dataPoints[14].label).toEqual('Wed Jan 01 2031');
      expect(ary[0].dataPoints[14].y).toEqual(209898.66413723546);
      expect(ary[0].dataPoints[14].ttip).toEqual('209898.66 at Wed Jan 01 2031');
      expect(ary[0].dataPoints[15].label).toEqual('Thu Jan 01 2032');
      expect(ary[0].dataPoints[15].y).toEqual(214423.15653990096);
      expect(ary[0].dataPoints[15].ttip).toEqual('214423.16 at Thu Jan 01 2032');
      expect(ary[0].dataPoints[16].label).toEqual('Sat Jan 01 2033');
      expect(ary[0].dataPoints[16].y).toEqual(219038.13879061976);
      expect(ary[0].dataPoints[16].ttip).toEqual('219038.14 at Sat Jan 01 2033');
      expect(ary[0].dataPoints[17].label).toEqual('Sun Jan 01 2034');
      expect(ary[0].dataPoints[17].y).toEqual(223745.42068635288);
      expect(ary[0].dataPoints[17].ttip).toEqual('223745.42 at Sun Jan 01 2034');
      expect(ary[0].dataPoints[18].label).toEqual('Mon Jan 01 2035');
      expect(ary[0].dataPoints[18].y).toEqual(228143.0877185034);
      expect(ary[0].dataPoints[18].ttip).toEqual('228143.09 at Mon Jan 01 2035');
      expect(ary[0].dataPoints[19].label).toEqual('Tue Jan 01 2036');
      expect(ary[0].dataPoints[19].y).toEqual(230587.77815564882);
      expect(ary[0].dataPoints[19].ttip).toEqual('230587.78 at Tue Jan 01 2036');
      expect(ary[0].dataPoints[20].label).toEqual('Thu Jan 01 2037');
      expect(ary[0].dataPoints[20].y).toEqual(233081.3624015372);
      expect(ary[0].dataPoints[20].ttip).toEqual('233081.36 at Thu Jan 01 2037');
      expect(ary[0].dataPoints[21].label).toEqual('Fri Jan 01 2038');
      expect(ary[0].dataPoints[21].y).toEqual(235624.81833234327);
      expect(ary[0].dataPoints[21].ttip).toEqual('235624.82 at Fri Jan 01 2038');
      expect(ary[0].dataPoints[22].label).toEqual('Sat Jan 01 2039');
      expect(ary[0].dataPoints[22].y).toEqual(238219.1433817655);
      expect(ary[0].dataPoints[22].ttip).toEqual('238219.14 at Sat Jan 01 2039');
      expect(ary[0].dataPoints[23].label).toEqual('Sun Jan 01 2040');
      expect(ary[0].dataPoints[23].y).toEqual(240642.83034023465);
      expect(ary[0].dataPoints[23].ttip).toEqual('240642.83 at Sun Jan 01 2040');
      expect(ary[0].dataPoints[24].label).toEqual('Tue Jan 01 2041');
      expect(ary[0].dataPoints[24].y).toEqual(240642.83034023465);
      expect(ary[0].dataPoints[24].ttip).toEqual('240642.83 at Tue Jan 01 2041');
      expect(ary[0].dataPoints[25].label).toEqual('Wed Jan 01 2042');
      expect(ary[0].dataPoints[25].y).toEqual(240642.83034023465);
      expect(ary[0].dataPoints[25].ttip).toEqual('240642.83 at Wed Jan 01 2042');
      expect(ary[0].dataPoints[26].label).toEqual('Thu Jan 01 2043');
      expect(ary[0].dataPoints[26].y).toEqual(240642.83034023465);
      expect(ary[0].dataPoints[26].ttip).toEqual('240642.83 at Thu Jan 01 2043');
      expect(ary[0].dataPoints[27].label).toEqual('Fri Jan 01 2044');
      expect(ary[0].dataPoints[27].y).toEqual(240642.83034023465);
      expect(ary[0].dataPoints[27].ttip).toEqual('240642.83 at Fri Jan 01 2044');
    } else if(createButtonID === 'btn-create-Defined Contributions Pension-example'){
      expect(ary.length).toEqual(5);
      expect(ary[0].name).toEqual('PensionAegon');
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
      expect(ary[0].dataPoints[2].y).toEqual(1402.5000000000011);
      expect(ary[0].dataPoints[2].ttip).toEqual('1402.50 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[3].y).toEqual(18824.213141790475);
      expect(ary[0].dataPoints[3].ttip).toEqual('18824.21 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[4].y).toEqual(37377.075387797355);
      expect(ary[0].dataPoints[4].ttip).toEqual('37377.08 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[5].y).toEqual(57118.93188796712);
      expect(ary[0].dataPoints[5].ttip).toEqual('57118.93 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[6].y).toEqual(78110.3696927989);
      expect(ary[0].dataPoints[6].ttip).toEqual('78110.37 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[7].y).toEqual(100414.84391624565);
      expect(ary[0].dataPoints[7].ttip).toEqual('100414.84 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[8].y).toEqual(124098.80963149293);
      expect(ary[0].dataPoints[8].ttip).toEqual('124098.81 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[9].y).toEqual(147620.82810982852);
      expect(ary[0].dataPoints[9].ttip).toEqual('147620.83 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[10].y).toEqual(154263.76537477088);
      expect(ary[0].dataPoints[10].ttip).toEqual('154263.77 at Mon Jan 01 2029');
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
      expect(ary[1].name).toEqual('CrystallizedPensionJoe');
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
      expect(ary[1].dataPoints[11].y).toEqual(120904.22611247684);
      expect(ary[1].dataPoints[11].ttip).toEqual('120904.23 at Tue Jan 01 2030');
      expect(ary[1].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[1].dataPoints[12].y).toEqual(110352.26980059283);
      expect(ary[1].dataPoints[12].ttip).toEqual('110352.27 at Wed Jan 01 2031');
      expect(ary[1].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[1].dataPoints[13].y).toEqual(102474.2381184969);
      expect(ary[1].dataPoints[13].ttip).toEqual('102474.24 at Thu Jan 01 2032');
      expect(ary[1].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[1].dataPoints[14].y).toEqual(93441.94018590859);
      expect(ary[1].dataPoints[14].ttip).toEqual('93441.94 at Sat Jan 01 2033');
      expect(ary[1].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[1].dataPoints[15].y).toEqual(83140.36095530601);
      expect(ary[1].dataPoints[15].ttip).toEqual('83140.36 at Sun Jan 01 2034');
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
      expect(ary[2].name).toEqual('CrystallizedPensionJack');
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
      expect(ary[2].dataPoints[11].y).toEqual(0);
      expect(ary[2].dataPoints[11].ttip).toEqual('0.00 at Tue Jan 01 2030');
      expect(ary[2].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[2].dataPoints[12].y).toEqual(0);
      expect(ary[2].dataPoints[12].ttip).toEqual('0.00 at Wed Jan 01 2031');
      expect(ary[2].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[2].dataPoints[13].y).toEqual(0);
      expect(ary[2].dataPoints[13].ttip).toEqual('0.00 at Thu Jan 01 2032');
      expect(ary[2].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[2].dataPoints[14].y).toEqual(0);
      expect(ary[2].dataPoints[14].ttip).toEqual('0.00 at Sat Jan 01 2033');
      expect(ary[2].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[2].dataPoints[15].y).toEqual(0);
      expect(ary[2].dataPoints[15].ttip).toEqual('0.00 at Sun Jan 01 2034');
      expect(ary[2].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[2].dataPoints[16].y).toEqual(71443.85574776577);
      expect(ary[2].dataPoints[16].ttip).toEqual('71443.86 at Mon Jan 01 2035');
      expect(ary[2].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[2].dataPoints[17].y).toEqual(55817.27161250854);
      expect(ary[2].dataPoints[17].ttip).toEqual('55817.27 at Tue Jan 01 2036');
      expect(ary[2].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[2].dataPoints[18].y).toEqual(40690.744518382104);
      expect(ary[2].dataPoints[18].ttip).toEqual('40690.74 at Thu Jan 01 2037');
      expect(ary[2].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[2].dataPoints[19].y).toEqual(23699.077947302947);
      expect(ary[2].dataPoints[19].ttip).toEqual('23699.08 at Fri Jan 01 2038');
      expect(ary[2].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[2].dataPoints[20].y).toEqual(4661.8155453833015);
      expect(ary[2].dataPoints[20].ttip).toEqual('4661.82 at Sat Jan 01 2039');
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
      expect(ary[3].name).toEqual('Cash');
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
      expect(ary[3].dataPoints[2].y).toEqual(2422.500000000002);
      expect(ary[3].dataPoints[2].ttip).toEqual('2422.50 at Fri Jan 01 2021');
      expect(ary[3].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[3].dataPoints[3].y).toEqual(31694.40606585764);
      expect(ary[3].dataPoints[3].ttip).toEqual('31694.41 at Sat Jan 01 2022');
      expect(ary[3].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[3].dataPoints[4].y).toEqual(55932.39274498258);
      expect(ary[3].dataPoints[4].ttip).toEqual('55932.39 at Sun Jan 01 2023');
      expect(ary[3].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[3].dataPoints[5].y).toEqual(80674.65103739502);
      expect(ary[3].dataPoints[5].ttip).toEqual('80674.65 at Mon Jan 01 2024');
      expect(ary[3].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[3].dataPoints[6].y).toEqual(105931.75417235334);
      expect(ary[3].dataPoints[6].ttip).toEqual('105931.75 at Wed Jan 01 2025');
      expect(ary[3].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[3].dataPoints[7].y).toEqual(131714.49903862592);
      expect(ary[3].dataPoints[7].ttip).toEqual('131714.50 at Thu Jan 01 2026');
      expect(ary[3].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[3].dataPoints[8].y).toEqual(158033.91096255445);
      expect(ary[3].dataPoints[8].ttip).toEqual('158033.91 at Fri Jan 01 2027');
      expect(ary[3].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[3].dataPoints[9].y).toEqual(182118.55755941983);
      expect(ary[3].dataPoints[9].ttip).toEqual('182118.56 at Sat Jan 01 2028');
      expect(ary[3].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[3].dataPoints[10].y).toEqual(179433.52224299518);
      expect(ary[3].dataPoints[10].ttip).toEqual('179433.52 at Mon Jan 01 2029');
      expect(ary[3].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[3].dataPoints[11].y).toEqual(179433.52224299518);
      expect(ary[3].dataPoints[11].ttip).toEqual('179433.52 at Tue Jan 01 2030');
      expect(ary[3].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[3].dataPoints[12].y).toEqual(194906.82843283238);
      expect(ary[3].dataPoints[12].ttip).toEqual('194906.83 at Wed Jan 01 2031');
      expect(ary[3].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[3].dataPoints[13].y).toEqual(207333.6239118733);
      expect(ary[3].dataPoints[13].ttip).toEqual('207333.62 at Thu Jan 01 2032');
      expect(ary[3].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[3].dataPoints[14].y).toEqual(220534.20322281477);
      expect(ary[3].dataPoints[14].ttip).toEqual('220534.20 at Sat Jan 01 2033');
      expect(ary[3].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[3].dataPoints[15].y).toEqual(234569.59121649756);
      expect(ary[3].dataPoints[15].ttip).toEqual('234569.59 at Sun Jan 01 2034');
      expect(ary[3].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[3].dataPoints[16].y).toEqual(249506.08958798726);
      expect(ary[3].dataPoints[16].ttip).toEqual('249506.09 at Mon Jan 01 2035');
      expect(ary[3].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[3].dataPoints[17].y).toEqual(267735.7922676291);
      expect(ary[3].dataPoints[17].ttip).toEqual('267735.79 at Tue Jan 01 2036');
      expect(ary[3].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[3].dataPoints[18].y).toEqual(284801.31569956656);
      expect(ary[3].dataPoints[18].ttip).toEqual('284801.32 at Thu Jan 01 2037');
      expect(ary[3].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[3].dataPoints[19].y).toEqual(303012.82156095176);
      expect(ary[3].dataPoints[19].ttip).toEqual('303012.82 at Fri Jan 01 2038');
      expect(ary[3].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[3].dataPoints[20].y).toEqual(322463.70040344936);
      expect(ary[3].dataPoints[20].ttip).toEqual('322463.70 at Sat Jan 01 2039');
      expect(ary[3].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[3].dataPoints[21].y).toEqual(327177.0988935511);
      expect(ary[3].dataPoints[21].ttip).toEqual('327177.10 at Sun Jan 01 2040');
      expect(ary[3].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[3].dataPoints[22].y).toEqual(327177.0988935511);
      expect(ary[3].dataPoints[22].ttip).toEqual('327177.10 at Tue Jan 01 2041');
      expect(ary[3].dataPoints[23].label).toEqual('Wed Jan 01 2042');
      expect(ary[3].dataPoints[23].y).toEqual(327177.0988935511);
      expect(ary[3].dataPoints[23].ttip).toEqual('327177.10 at Wed Jan 01 2042');
      expect(ary[3].dataPoints[24].label).toEqual('Thu Jan 01 2043');
      expect(ary[3].dataPoints[24].y).toEqual(327177.0988935511);
      expect(ary[3].dataPoints[24].ttip).toEqual('327177.10 at Thu Jan 01 2043');
      expect(ary[3].dataPoints[25].label).toEqual('Fri Jan 01 2044');
      expect(ary[3].dataPoints[25].y).toEqual(327177.0988935511);
      expect(ary[3].dataPoints[25].ttip).toEqual('327177.10 at Fri Jan 01 2044');
      expect(ary[3].dataPoints[26].label).toEqual('Sun Jan 01 2045');
      expect(ary[3].dataPoints[26].y).toEqual(327177.0988935511);
      expect(ary[3].dataPoints[26].ttip).toEqual('327177.10 at Sun Jan 01 2045');
      expect(ary[4].name).toEqual('AegonTaxFree');
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
      expect(ary[4].dataPoints[2].y).toEqual(0);
      expect(ary[4].dataPoints[2].ttip).toEqual('0.00 at Fri Jan 01 2021');
      expect(ary[4].dataPoints[3].label).toEqual('Sat Jan 01 2022');
      expect(ary[4].dataPoints[3].y).toEqual(0);
      expect(ary[4].dataPoints[3].ttip).toEqual('0.00 at Sat Jan 01 2022');
      expect(ary[4].dataPoints[4].label).toEqual('Sun Jan 01 2023');
      expect(ary[4].dataPoints[4].y).toEqual(0);
      expect(ary[4].dataPoints[4].ttip).toEqual('0.00 at Sun Jan 01 2023');
      expect(ary[4].dataPoints[5].label).toEqual('Mon Jan 01 2024');
      expect(ary[4].dataPoints[5].y).toEqual(0);
      expect(ary[4].dataPoints[5].ttip).toEqual('0.00 at Mon Jan 01 2024');
      expect(ary[4].dataPoints[6].label).toEqual('Wed Jan 01 2025');
      expect(ary[4].dataPoints[6].y).toEqual(0);
      expect(ary[4].dataPoints[6].ttip).toEqual('0.00 at Wed Jan 01 2025');
      expect(ary[4].dataPoints[7].label).toEqual('Thu Jan 01 2026');
      expect(ary[4].dataPoints[7].y).toEqual(0);
      expect(ary[4].dataPoints[7].ttip).toEqual('0.00 at Thu Jan 01 2026');
      expect(ary[4].dataPoints[8].label).toEqual('Fri Jan 01 2027');
      expect(ary[4].dataPoints[8].y).toEqual(0);
      expect(ary[4].dataPoints[8].ttip).toEqual('0.00 at Fri Jan 01 2027');
      expect(ary[4].dataPoints[9].label).toEqual('Sat Jan 01 2028');
      expect(ary[4].dataPoints[9].y).toEqual(0);
      expect(ary[4].dataPoints[9].ttip).toEqual('0.00 at Sat Jan 01 2028');
      expect(ary[4].dataPoints[10].label).toEqual('Mon Jan 01 2029');
      expect(ary[4].dataPoints[10].y).toEqual(0);
      expect(ary[4].dataPoints[10].ttip).toEqual('0.00 at Mon Jan 01 2029');
      expect(ary[4].dataPoints[11].label).toEqual('Tue Jan 01 2030');
      expect(ary[4].dataPoints[11].y).toEqual(40301.408704158945);
      expect(ary[4].dataPoints[11].ttip).toEqual('40301.41 at Tue Jan 01 2030');
      expect(ary[4].dataPoints[12].label).toEqual('Wed Jan 01 2031');
      expect(ary[4].dataPoints[12].y).toEqual(42114.97209584614);
      expect(ary[4].dataPoints[12].ttip).toEqual('42114.97 at Wed Jan 01 2031');
      expect(ary[4].dataPoints[13].label).toEqual('Thu Jan 01 2032');
      expect(ary[4].dataPoints[13].y).toEqual(44010.14584015927);
      expect(ary[4].dataPoints[13].ttip).toEqual('44010.15 at Thu Jan 01 2032');
      expect(ary[4].dataPoints[14].label).toEqual('Sat Jan 01 2033');
      expect(ary[4].dataPoints[14].y).toEqual(45990.60240296647);
      expect(ary[4].dataPoints[14].ttip).toEqual('45990.60 at Sat Jan 01 2033');
      expect(ary[4].dataPoints[15].label).toEqual('Sun Jan 01 2034');
      expect(ary[4].dataPoints[15].y).toEqual(48060.17951110002);
      expect(ary[4].dataPoints[15].ttip).toEqual('48060.18 at Sun Jan 01 2034');
      expect(ary[4].dataPoints[16].label).toEqual('Mon Jan 01 2035');
      expect(ary[4].dataPoints[16].y).toEqual(50222.88758909957);
      expect(ary[4].dataPoints[16].ttip).toEqual('50222.89 at Mon Jan 01 2035');
      expect(ary[4].dataPoints[17].label).toEqual('Tue Jan 01 2036');
      expect(ary[4].dataPoints[17].y).toEqual(52482.9175306091);
      expect(ary[4].dataPoints[17].ttip).toEqual('52482.92 at Tue Jan 01 2036');
      expect(ary[4].dataPoints[18].label).toEqual('Thu Jan 01 2037');
      expect(ary[4].dataPoints[18].y).toEqual(54844.648819486574);
      expect(ary[4].dataPoints[18].ttip).toEqual('54844.65 at Thu Jan 01 2037');
      expect(ary[4].dataPoints[19].label).toEqual('Fri Jan 01 2038');
      expect(ary[4].dataPoints[19].y).toEqual(57312.65801636352);
      expect(ary[4].dataPoints[19].ttip).toEqual('57312.66 at Fri Jan 01 2038');
      expect(ary[4].dataPoints[20].label).toEqual('Sat Jan 01 2039');
      expect(ary[4].dataPoints[20].y).toEqual(59891.72762709994);
      expect(ary[4].dataPoints[20].ttip).toEqual('59891.73 at Sat Jan 01 2039');
      expect(ary[4].dataPoints[21].label).toEqual('Sun Jan 01 2040');
      expect(ary[4].dataPoints[21].y).toEqual(62586.85537031951);
      expect(ary[4].dataPoints[21].ttip).toEqual('62586.86 at Sun Jan 01 2040');
      expect(ary[4].dataPoints[22].label).toEqual('Tue Jan 01 2041');
      expect(ary[4].dataPoints[22].y).toEqual(65403.26386198394);
      expect(ary[4].dataPoints[22].ttip).toEqual('65403.26 at Tue Jan 01 2041');
      expect(ary[4].dataPoints[23].label).toEqual('Wed Jan 01 2042');
      expect(ary[4].dataPoints[23].y).toEqual(68346.4107357733);
      expect(ary[4].dataPoints[23].ttip).toEqual('68346.41 at Wed Jan 01 2042');
      expect(ary[4].dataPoints[24].label).toEqual('Thu Jan 01 2043');
      expect(ary[4].dataPoints[24].y).toEqual(71421.99921888315);
      expect(ary[4].dataPoints[24].ttip).toEqual('71422.00 at Thu Jan 01 2043');
      expect(ary[4].dataPoints[25].label).toEqual('Fri Jan 01 2044');
      expect(ary[4].dataPoints[25].y).toEqual(74635.98918373296);
      expect(ary[4].dataPoints[25].ttip).toEqual('74635.99 at Fri Jan 01 2044');
      expect(ary[4].dataPoints[26].label).toEqual('Sun Jan 01 2045');
      expect(ary[4].dataPoints[26].y).toEqual(77994.60869700105);
      expect(ary[4].dataPoints[26].ttip).toEqual('77994.61 at Sun Jan 01 2045');
    } else if(createButtonID === 'btn-create-National Savings Income Bonds-example'){
      expect(ary.length).toEqual(2);
      expect(ary[0].name).toEqual('NI');
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
      expect(ary[0].dataPoints[3].y).toEqual(1000000);
      expect(ary[0].dataPoints[3].ttip).toEqual('1000000.00 at Wed Jan 01 2020');
      expect(ary[0].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[0].dataPoints[4].y).toEqual(1024999.9999999986);
      expect(ary[0].dataPoints[4].ttip).toEqual('1025000.00 at Fri Jan 01 2021');
      expect(ary[0].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[0].dataPoints[5].y).toEqual(1050624.9999999972);
      expect(ary[0].dataPoints[5].ttip).toEqual('1050625.00 at Sat Jan 01 2022');
      expect(ary[0].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[0].dataPoints[6].y).toEqual(1076890.6249999956);
      expect(ary[0].dataPoints[6].ttip).toEqual('1076890.62 at Sun Jan 01 2023');
      expect(ary[0].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[0].dataPoints[7].y).toEqual(1103812.890624994);
      expect(ary[0].dataPoints[7].ttip).toEqual('1103812.89 at Mon Jan 01 2024');
      expect(ary[0].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[0].dataPoints[8].y).toEqual(1131408.2128906175);
      expect(ary[0].dataPoints[8].ttip).toEqual('1131408.21 at Wed Jan 01 2025');
      expect(ary[0].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[0].dataPoints[9].y).toEqual(1159693.4182128813);
      expect(ary[0].dataPoints[9].ttip).toEqual('1159693.42 at Thu Jan 01 2026');
      expect(ary[0].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[0].dataPoints[10].y).toEqual(1188685.7536682012);
      expect(ary[0].dataPoints[10].ttip).toEqual('1188685.75 at Fri Jan 01 2027');
      expect(ary[0].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[0].dataPoints[11].y).toEqual(1218402.8975099048);
      expect(ary[0].dataPoints[11].ttip).toEqual('1218402.90 at Sat Jan 01 2028');
      expect(ary[0].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[0].dataPoints[12].y).toEqual(1248862.9699476508);
      expect(ary[0].dataPoints[12].ttip).toEqual('1248862.97 at Mon Jan 01 2029');
      expect(ary[1].name).toEqual('Cash');
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
      expect(ary[1].dataPoints[3].y).toEqual(341);
      expect(ary[1].dataPoints[3].ttip).toEqual('341.00 at Wed Jan 01 2020');
      expect(ary[1].dataPoints[4].label).toEqual('Fri Jan 01 2021');
      expect(ary[1].dataPoints[4].y).toEqual(4199.999058417312);
      expect(ary[1].dataPoints[4].ttip).toEqual('4200.00 at Fri Jan 01 2021');
      expect(ary[1].dataPoints[5].label).toEqual('Sat Jan 01 2022');
      expect(ary[1].dataPoints[5].y).toEqual(6541.3385736786095);
      expect(ary[1].dataPoints[5].ttip).toEqual('6541.34 at Sat Jan 01 2022');
      expect(ary[1].dataPoints[6].label).toEqual('Sun Jan 01 2023');
      expect(ary[1].dataPoints[6].y).toEqual(8337.38930771126);
      expect(ary[1].dataPoints[6].ttip).toEqual('8337.39 at Sun Jan 01 2023');
      expect(ary[1].dataPoints[7].label).toEqual('Mon Jan 01 2024');
      expect(ary[1].dataPoints[7].y).toEqual(9529.232370801286);
      expect(ary[1].dataPoints[7].ttip).toEqual('9529.23 at Mon Jan 01 2024');
      expect(ary[1].dataPoints[8].label).toEqual('Wed Jan 01 2025');
      expect(ary[1].dataPoints[8].y).toEqual(10053.079400728117);
      expect(ary[1].dataPoints[8].ttip).toEqual('10053.08 at Wed Jan 01 2025');
      expect(ary[1].dataPoints[9].label).toEqual('Thu Jan 01 2026');
      expect(ary[1].dataPoints[9].y).toEqual(9839.896088432135);
      expect(ary[1].dataPoints[9].ttip).toEqual('9839.90 at Thu Jan 01 2026');
      expect(ary[1].dataPoints[10].label).toEqual('Fri Jan 01 2027');
      expect(ary[1].dataPoints[10].y).toEqual(8814.997186509936);
      expect(ary[1].dataPoints[10].ttip).toEqual('8815.00 at Fri Jan 01 2027');
      expect(ary[1].dataPoints[11].label).toEqual('Sat Jan 01 2028');
      expect(ary[1].dataPoints[11].y).toEqual(6897.610854709465);
      expect(ary[1].dataPoints[11].ttip).toEqual('6897.61 at Sat Jan 01 2028');
      expect(ary[1].dataPoints[12].label).toEqual('Mon Jan 01 2029');
      expect(ary[1].dataPoints[12].y).toEqual(4000.410035484002);
      expect(ary[1].dataPoints[12].ttip).toEqual('4000.41 at Mon Jan 01 2029');
    } else {
      expect(false).toBe(true);
    }
  }

  function assertExpenseData(
    ary: any, 
    createButtonID: string,
  ){
    if(createButtonID === 'btn-create-Simple-example'){
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
    } else if(createButtonID === 'btn-create-Defined Benefits Pension-example'){
      expect(ary.length).toEqual(0);
    } else if(createButtonID === 'btn-create-Defined Contributions Pension-example'){
      expect(ary.length).toEqual(0);
    } else if(createButtonID === 'btn-create-National Savings Income Bonds-example'){
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

    // we don't need to switch but it helps when we're validating
    // the test as we watch it
    await clickButton(driver, 'btn-Assets');
    let ary = await getAssetChartData(driver);
    if(createButtonID === 'btn-create-fakename-example'){
      writeTestCode(ary);
    }
    // console.log(`go to assert asset data for ${createButtonID}`);
    assertAssetData(ary, createButtonID);
    // console.log(`asserted asset data for ${createButtonID}`);

    // we don't need to switch but it helps when we're validating
    // the test as we watch it
    await clickButton(driver, 'btn-Expenses');
    ary = await getExpenseChartData(driver);
    if(createButtonID === 'btn-create-fakename-example'){
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
