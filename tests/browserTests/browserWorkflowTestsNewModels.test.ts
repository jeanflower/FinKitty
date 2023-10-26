import { TestModel01 } from "../../localization/stringConstants";
import { getDriver, beforeAllWork, cleanUpWork } from "./browserBaseTypes";
import { quitAfterAll, testModelCreation } from "./browserTestUtils";

describe("BrowserWorkflowTests new models", () => {
  const driver = getDriver();
  jest.setTimeout(80000); // allow time for all these tests to run

  it("should create new clones", async () => {
    const testDataModelName = "testName06";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(
      driver,
      "btn-clone",
      testDataModelName,
      "should create new clones",
    );

    await cleanUpWork(driver, testDataModelName);
  });

  it("should create new models", async () => {
    const testDataModelName = "testName07";
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(
      driver,
      "btn-createMinimalModel",
      testDataModelName,
      "should create new models",
    );

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
