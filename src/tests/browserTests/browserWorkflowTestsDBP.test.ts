import { getDriver, clickButton, beforeAllWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelContent } from './browserTestUtils';

describe('BrowserWorkflowTests DBP', () => {
  const driver = getDriver(headless);
  jest.setTimeout(40000); // allow time for all these tests to run

  it('should have right content for DBP example', async () => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(
      driver,
      'btn-create-Defined Benefits Pension-example',
    );
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
