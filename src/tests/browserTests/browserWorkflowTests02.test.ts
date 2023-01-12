import { TestModel01 } from '../../localization/stringConstants';
import { getDriver, beforeAllWork, cleanUpWork } from './browserBaseTypes';
import { quitAfterAll, testModelCreation } from './browserTestUtils';

describe('BrowserWorkflowTests 02', () => {
  const driver = getDriver();
  jest.setTimeout(90000); // allow time for all these tests to run

  it('should create examples', async () => {
    const testDataModelName = 'testName03';
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
