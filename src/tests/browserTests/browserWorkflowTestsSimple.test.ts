import { getDriver, clickButton, beforeAllWork } from './browserBaseTypes';
import { headless, quitAfterAll, testModelContent } from './browserTestUtils';

describe('BrowserWorkflowTests Simple', () => {
  const driver = getDriver(headless);

  it('should have right content for Simple example', async done => {
    await beforeAllWork(driver, '', '');

    await clickButton(driver, 'btn-save-model');
    await testModelContent(driver, 'btn-create-Simple-example');

    done();
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
