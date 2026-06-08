import {
  getDriver,
  clickButton,
  beforeAllWork,
  fillInputById,
  cleanUpWork,
} from "./browserBaseTypes";
import {
  assetsTag,
  deleteIfExists,
  gotoTabPage,
  incomesTag,
  quitAfterAll,
  testModelContent,
  waitForEvalReady,
} from "./browserTestUtils";

describe("BrowserWorkflowTests DCP", () => {
  const driver = getDriver();
  jest.setTimeout(60000); // allow time for all these tests to run

  it("should have right content for DCP example", async () => {
    const testDataModelName = "testName05";
    await beforeAllWork(driver, testDataModelName, "");

    const exampleModelName = "tempDcpExample";
    const createButtonID = "btn-create-Defined Contributions Pension-example";
    await deleteIfExists(exampleModelName, driver);

    await fillInputById(driver, "createModel", exampleModelName);
    await clickButton(driver, createButtonID);
    await waitForEvalReady(driver);

    await clickButton(driver, "btn-save-model");
    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, "chooseViewDetailTypeDetailed");
    await gotoTabPage(driver, incomesTag);
    // can't choose detailed view unless there are some incomes
    await cleanUpWork(driver, exampleModelName);

    await testModelContent(driver, createButtonID);
  });
  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
