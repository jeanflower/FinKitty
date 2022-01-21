import { TestModel01 } from '../../localization/stringConstants';
import { getDriver, beforeAllWork, cleanUpWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelCreation } from './browserTestUtils';

describe('BrowserWorkflowTests new models', () => {
  const driver = getDriver(headless);
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
