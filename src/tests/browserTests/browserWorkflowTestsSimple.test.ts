import { getDriver, clickButton, beforeAllWork } from './browserBaseTypes';
import { quitAfterAll, testModelContent } from './browserTestUtils';

describe('BrowserWorkflowTests Simple', () => {
  const driver = getDriver();
  jest.setTimeout(60000); // allow time for all these tests to run

  it('should have right content for Simple example', async () => {
    const testDataModelName = 'testName09';
    await beforeAllWork(driver, testDataModelName, '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(driver, 'btn-create-Simple-example');
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
