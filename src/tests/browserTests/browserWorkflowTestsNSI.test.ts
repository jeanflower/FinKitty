import { getDriver, clickButton, beforeAllWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelContent } from './browserTestUtils';

describe('BrowserWorkflowTests NSI', () => {
  const driver = getDriver(headless);
  jest.setTimeout(1000000); // allow time for all these tests to run

  it('should have right content for NSI example', async () => {
    await beforeAllWork(driver, '', '');

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
