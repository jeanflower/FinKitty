import { getDriver, clickButton, beforeAllWork } from "./browserBaseTypes";
import { assetsTag, gotoTabPage, incomesTag, quitAfterAll, testModelContent } from "./browserTestUtils";

describe("BrowserWorkflowTests DCP", () => {
  const driver = getDriver();
  jest.setTimeout(60000); // allow time for all these tests to run

  it("should have right content for DCP example", async () => {
    const testDataModelName = "testName05";
    await beforeAllWork(driver, testDataModelName, "");

    await clickButton(driver, "btn-save-model");

    await clickButton(driver, "btn-save-model");
    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    //await gotoTabPage(driver, debtsTag);
    //await clickButton(driver, "chooseViewDetailTypeDetailed");
    await gotoTabPage(driver, incomesTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    //await gotoTabPage(driver, expensesTag);
    //await clickButton(driver, "chooseViewDetailTypeDetailed");

    await testModelContent(
      driver,
      "btn-create-Defined Contributions Pension-example",
    );
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
