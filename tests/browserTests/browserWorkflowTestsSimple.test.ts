import { getDriver, clickButton, beforeAllWork, fillInputById, cleanUpWork } from "./browserBaseTypes";
import {
  assetsTag,
  deleteIfExists,
  expensesTag,
  gotoTabPage,
  homeTag,
  incomesTag,
  quitAfterAll,
  testModelContent,
  waitForEvalReady,
} from "./browserTestUtils";

describe("BrowserWorkflowTests Simple", () => {
  const driver = getDriver();
  jest.setTimeout(60000); // allow time for all these tests to run

  it("should have right content for Simple example", async () => {
    const testDataModelName = "testName09";
    await beforeAllWork(driver, testDataModelName, "");

    const exampleModelName = "tempExample";
    await deleteIfExists(exampleModelName, driver);

    await fillInputById(driver, "createModel", exampleModelName);
    await driver.executeScript("window.scrollBy(0, -500)");
    await clickButton(driver, "btn-create-Simple-example");
    await waitForEvalReady(driver);

    await clickButton(driver, "btn-save-model");
    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    //await gotoTabPage(driver, debtsTag);
    //await clickButton(driver, "chooseViewDetailTypeDetailed");
    await gotoTabPage(driver, incomesTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    await gotoTabPage(driver, expensesTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    await cleanUpWork(driver, exampleModelName);
    
    await testModelContent(driver, "btn-create-Simple-example");
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
