import { getDriver, clickButton, beforeAllWork, fillInputById, cleanUpWork } from "./browserBaseTypes";
import { assetsTag, debtsTag, expensesTag, gotoTabPage, homeTag, incomesTag, quitAfterAll, testModelContent } from "./browserTestUtils";

describe("BrowserWorkflowTests Simple", () => {
  const driver = getDriver();
  jest.setTimeout(60000); // allow time for all these tests to run

  it("should have right content for Simple example", async () => {
    const testDataModelName = "testName09";
    await beforeAllWork(driver, testDataModelName, "");
    
    await fillInputById(driver, "createModel", 'tempExample');
    await driver.executeScript("window.scrollBy(0, -500)");
    await clickButton(driver, "btn-create-Simple-example");

    await clickButton(driver, "btn-save-model");
    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    //await gotoTabPage(driver, debtsTag);
    //await clickButton(driver, "chooseViewDetailTypeDetailed");
    await gotoTabPage(driver, incomesTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    await gotoTabPage(driver, expensesTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    await cleanUpWork(driver, 'tempExample');
    
    await testModelContent(driver, "btn-create-Simple-example");
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
