import { pension, TestModel02 } from '../../localization/stringConstants';
import {
  addDCPension,
  addIncome,
  assetsTag,
  clearDCPension,
  gotoTabPage,
  incomeInputs,
  incomesTag,
  quitAfterAll,
} from './browserTestUtils';
import {
  beforeAllWork,
  cleanUpWork,
  clickButton,
  getDriver,
} from './browserBaseTypes';

const testDataModelName = 'BrowserDCPensionTest';

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

  it('DC Pension problem inputs', async () => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`, //name: 'javaJob1'
    });

    await gotoTabPage(driver, assetsTag);

    const pensionInputs = {
      name: 'dcpension',
      value: '0',
      category: 'pension',
      startDate: '1 Jan 2021',
      growth: '2.0',
      growsWithCPI: 'N',
      contributionsStopDate: '1 Jan 2025',
      crystallizesDate: '1 Jan 2030',
      pensionEndOrTransferDate: '1 Jan 2035',
      contributionSSIncome: 'N',
      incomeSource: 'javaJob1',
      contributionAmountPensionIncome: '0.05',
      employerContribution: '0.5',
      liability: 'Joe',
      transferName: 'Jack',
    };

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: '',
      message: 'Name should be not empty',
    });

    await clearDCPension(driver);

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp02',
      value: 'junk',
      message:
        'Asset value junk should be a numerical value or built from a setting',
    }); // TODO : confusing error message : it's a pension not an asset?

    await clearDCPension(driver);

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp03',
      startDate: '',
      message: `Start date '' should be a date`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp04',
      startDate: '1 Jan 2020',
      message: `Transaction '-PEN dcp04' from unrecognised asset (could be typo or before asset start date?) : \"javaJob1\"`,
    }); // TODO : confusing error message : pension can't start before income

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp05',
      startDate: '1 Jan 2026',
      message: `added assets and transactions`,
    }); // BUG : start date after contributions end date?

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp06',
      startDate: '1 Jan 2036',
      message: `Transaction '-CPTaxFreeM dcp06' from unrecognised asset (could be typo or before asset start date?) : \"${pension}dcp06\"`,
    }); // TODO : what does this error mean?  I expected "start date after end date"

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp07',
      growth: 'junk',
      message: `Growth value 'junk' should be a numerical or setting value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp08',
      growsWithCPI: 'junk',
      message: `added assets and transactions`,
    }); // BUG : junk shouldn't be recognised as an input here

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp09',
      contributionsStopDate: 'junk',
      message: `Transaction '-PEN dcp09' has bad stop date : "junk"`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp10',
      contributionsStopDate: '1 Jan 2036',
      message: `added assets and transactions`,
    }); // BUG : contributionsStopDate after pensionEndOrTransferDate?

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp11',
      crystallizesDate: 'junk',
      message: `Transaction '-CPTaxFreeM dcp11' has bad date : \"junk\"`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp12',
      crystallizesDate: '1 Jan 2036',
      message: `added assets and transactions`,
    }); // TODO : crystallizes after transfers??

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp13',
      pensionEndOrTransferDate: 'junk',
      message: `Transaction '-CPT dcp13' has bad date : \"junk\"`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp14',
      contributionSSIncome: 'junk',
      message: `Salary sacrifice 'junk' should be a Y/N value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp15',
      incomeSource: 'junk',
      message: `added assets and transactions`,
    }); // BUG : income source should be an income

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp16',
      contributionAmountPensionIncome: 'junk',
      message: `Contribution amount 'junk' should be a numerical value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp17',
      contributionAmountPensionIncome: '1000',
      message: `added assets and transactions`,
    }); // TODO : shouldn't be allowed to contribut more than 1
    /**/

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp18',
      employerContribution: 'junk',
      message: `Contribution amount 'junk' should be a numerical value`,
    });

    await clearDCPension(driver);
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp19',
      employerContribution: '1000',
      message: `added assets and transactions`,
    }); // TODO : shouldn't be allowed to contribut more than 1

    await clickButton(driver, 'useDCPInputs');
    await addDCPension(driver, {
      ...pensionInputs,
      name: 'dcp20',
      liability: 'junk',
      message: `added assets and transactions`,
    }); // TODO : liability should match the income liability

    await cleanUpWork(driver, testDataModelName);
  });

  it('DC Pension happy path', async () => {
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel02}"}`,
    );

    await gotoTabPage(driver, incomesTag);

    await addIncome(driver, {
      ...incomeInputs,
      message: `added new income ${incomeInputs.name}`, //name: 'javaJob1'
    });

    await gotoTabPage(driver, assetsTag);
    await clickButton(driver, 'useDCPInputs');

    const pensionInputs = {
      name: 'dcpension',
      value: '0',
      category: 'pension',
      startDate: '1 Jan 2021',
      growth: '2.0',
      growsWithCPI: 'N',
      contributionsStopDate: '1 Jan 2025',
      crystallizesDate: '1 Jan 2030',
      pensionEndOrTransferDate: '1 Jan 2035',
      contributionSSIncome: 'N',
      incomeSource: 'javaJob1',
      contributionAmountPensionIncome: '0.05',
      employerContribution: '0.5',
      liability: 'Joe',
      transferName: 'Jack',
    };

    await addDCPension(driver, {
      ...pensionInputs,
      name: 'Aegon',
      message: 'added assets and transactions',
    });

    //await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
