import { TestModel01 } from '../../localization/stringConstants';
import { getDriver, beforeAllWork, cleanUpWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelCreation } from './browserTestUtils';

describe('BrowserWorkflowTests 02', () => {
  const driver = getDriver(headless);
  jest.setTimeout(1000000); // allow time for all these tests to run

  it('should create examples', async () => {
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
      'should create examples',
    );

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
