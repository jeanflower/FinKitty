import { TestModel01 } from '../../localization/stringConstants';
import { getDriver, beforeAllWork, cleanUpWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelCreation } from './browserTestUtils';

describe('BrowserWorkflowTests 02', () => {
  const driver = getDriver(headless);

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
