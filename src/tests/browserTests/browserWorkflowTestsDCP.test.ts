import { getDriver, clickButton, beforeAllWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelContent } from './browserTestUtils';

describe('BrowserWorkflowTests DCP', () => {
  const driver = getDriver(headless);
  jest.setTimeout(40000); // allow time for all these tests to run

  it('should have right content for DCP example', async () => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(
      driver,
      'btn-create-Defined Contributions Pension-example',
    );
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});