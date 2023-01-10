import { pensionDB, TestModel02 } from '../../localization/stringConstants';
import {
  addIncome,
  incomeInputs,
  addDBPension,
  clearPensionFields,
  gotoTabPage,
  incomesTag,
  quitAfterAll,
} from './browserTestUtils';
import {
  getDriver,
  beforeAllWork,
  clickButton,
  cleanUpWork,
  scrollIntoViewByID,
} from './browserBaseTypes';

const testDataModelName = 'BrowserDBPensionTest';

let alreadyRunning = false;

describe(testDataModelName, () => {
  let driverSimple = undefined;
  if (!alreadyRunning) {
    alreadyRunning = true;
    driverSimple = getDriver();
  }
  if (driverSimple == undefined) {
    return;
  }
  const driver = driverSimple;
  jest.setTimeout(200000); // allow time for all these tests to run

  it('DB pension inputs problem path', async () => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`,
    });

    const inputs = {
      name: 'pensionName',
      value: '2500',
      valuationDate: '1 Jan 2022',
      contributionsEndDate: '1 Jan 2025',
      startDate: '1 Jan 2030',
      pensionEndOrTransferDate: '1 Jan 2035',
      transferredStopDate: '1 Jan 2040',
      incomeSource: 'javaJob1',
      contributionSSIncome: 'N',
      contributionAmountPensionIncome: '0.05',
      incomeaccrual: '0.02',
      transferName: 'Jack',
      transferProportion: '0.5',
      incomeGrowth: '2.0',
      incomecpiGrows: 'N',
      liability: 'Joe',
      category: 'pension',
    };

    await scrollIntoViewByID(driver, `useDBPInputs`);

    // console.log(`clicking...`);
    await clickButton(driver, 'useDBPInputs');
    // console.log(`clicked...`);

    await addDBPension(driver, {
      ...inputs,
      name: '',
      message: 'Income name should be non-empty', // TODO "Pension..." not "Income..."
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      value: 'junkjunk',
      message:
        'Income value junkjunk should be numerical or built from an Asset or setting',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      valuationDate: 'junkjunk',
      message: 'Value set date should be a date',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      name: 'xyzJunk',
      contributionsEndDate: 'junkjunk',
      message: `Transaction '-PEN xyzJunk' has bad stop date : "junkjunk"`,
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      startDate: 'junkjunk',
      message: `Income '-PDB pensionName' start date doesn't make sense : \"junkjunk\"`,
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      pensionEndOrTransferDate: 'junkjunk',
      message: `Income '-PDB pensionName' end date doesn\'t make sense : "junkjunk"`,
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      transferredStopDate: 'junkjunk',
      message: `Income '-PT pensionName' end date doesn't make sense : \"junkjunk\"`,
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      valuationDate: '1 Jan 2020', // date is before javaJob1 begins
      message: `Transaction '-PEN pensionName' from unrecognised asset (could be typo or before asset start date?) : "javaJob1"`,
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      name: 'badEndDate',
      valuationDate: '1 Jan 2023',
      contributionsEndDate: '1 Jan 2022', // stop before start,
      message: 'added new data', // BUG the end date for contributions is being ignored
      // we should enforce it's after the start date
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      startDate: '1 Jan 2033',
      pensionEndOrTransferDate: '1 Jan 2032', // transfer pension before pension begins paying out?
      message:
        `Transaction '-PT pensionName' from unrecognised asset ` +
        `(could be typo or before asset start date?) : "${pensionDB}pensionName"`,
      // TODO this message is mysterious
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      name: 'transferStopsBeforeTransfer',
      pensionEndOrTransferDate: '1 Jan 2037',
      transferredStopDate: '1 Jan 2035', // transferred pension stops before transfer occurred?
      message: 'added new data', // BUG :this probably shouldn't be allowed?
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      contributionSSIncome: 'junk',
      message: "Salary sacrifice 'junk' should be a Y/N value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      contributionAmountPensionIncome: 'junk',
      message: "Contribution amount 'junk' should be a numerical value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      incomeaccrual: 'junk',
      message: "Accrual value 'junk' should be a numerical value",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      transferProportion: 'junk',
      message: 'Transfer proportion junk should be a numerical value',
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      liability: '',
      message: "Source income 'javaJob1' should have income tax liability",
    });

    await clearPensionFields(driver);
    await addDBPension(driver, {
      ...inputs,
      liability: 'Susan',
      message:
        "Source income 'javaJob1' should have income tax liability Susan(incomeTax)",
    });

    await cleanUpWork(driver, testDataModelName);
  });

  it('DB pension inputs happy path', async () => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`,
    });

    await scrollIntoViewByID(driver, `useDBPInputs`);

    // console.log(`clicking...`);
    await clickButton(driver, 'useDBPInputs');
    // console.log(`clicked...`);

    const inputs = {
      name: 'pensionName',
      value: '2500',
      valuationDate: '1 Jan 2022',
      contributionsEndDate: '1 Jan 2025',
      startDate: '1 Jan 2030',
      pensionEndOrTransferDate: '1 Jan 2035',
      transferredStopDate: '1 Jan 2040',
      incomeSource: 'javaJob1',
      contributionSSIncome: 'N',
      contributionAmountPensionIncome: '0.05',
      incomeaccrual: '0.02',
      transferName: 'Jack',
      transferProportion: '0.5',
      incomeGrowth: '2.0',
      incomecpiGrows: 'N',
      liability: 'Joe',
      category: 'pension',
    };

    await addDBPension(driver, {
      ...inputs,
      name: 'TeachersPensionScheme',
      message: 'added new data', // TODO "added pension information",
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
