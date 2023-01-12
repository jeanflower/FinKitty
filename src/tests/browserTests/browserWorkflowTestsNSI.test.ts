import { getDriver, clickButton, beforeAllWork } from './browserBaseTypes';
import { quitAfterAll, testModelContent } from './browserTestUtils';

describe('BrowserWorkflowTests NSI', () => {
  const driver = getDriver();
  jest.setTimeout(40000); // allow time for all these tests to run

  it('should have right content for NSI example', async () => {
    const testDataModelName = 'testName08';
    await beforeAllWork(driver, testDataModelName, '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(
      driver,
      'btn-create-National Savings Income Bonds-example',
    );
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
