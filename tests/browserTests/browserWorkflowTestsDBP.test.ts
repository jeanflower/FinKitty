import { getDriver, clickButton, beforeAllWork } from "./browserBaseTypes";
import { quitAfterAll, testModelContent } from "./browserTestUtils";

describe("BrowserWorkflowTests DBP", () => {
  const driver = getDriver();
  jest.setTimeout(50000); // allow time for all these tests to run

  it("should have right content for DBP example", async () => {
    const testDataModelName = "testName04";
    await beforeAllWork(driver, testDataModelName, "");

    await clickButton(driver, "btn-save-model");
    await testModelContent(
      driver,
      "btn-create-Defined Benefits Pension-example",
    );
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
