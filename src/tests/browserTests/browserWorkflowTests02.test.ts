import { TestModel01 } from '../../localization/stringConstants';
import { showObj } from '../../utils/utils';
import {
  getDriver,
  beforeAllWork,
  cleanUpWork,
  getDataDumpFromPage,
} from './browserBaseTypes';
import { quitAfterAll, testModelCreation } from './browserTestUtils';

showObj;

describe('BrowserWorkflowTests 02', () => {
  const driver = getDriver();
  jest.setTimeout(90000); // allow time for all these tests to run

  it('should create examples', async () => {
    const testDataModelName = 'testName03';
    await beforeAllWork(
      driver,
      testDataModelName,
      `{"testName":"${TestModel01}"}`,
    );

    await testModelCreation(
      driver,
      'btn-create-Simple-example',
      testDataModelName,
      'should create examples',
    );

    let data = await getDataDumpFromPage(driver, 'reportTable');
    expect(data.length).toBe(40);
    expect(data[0]).toEqual({
      DATE: '01 Jan 2026',
      NAME: 'Cash',
      CHANGE: '-78650.30',
      OLD_VALUE: '-237411.99',
      NEW_VALUE: '-316062.29',
      QCHANGE: '',
      QOLD_VALUE: '',
      QNEW_VALUE: '',
      SOURCE: 'BuyBondFlat5y',
      index: 0,
    });
    expect(data[39]).toEqual({
      CHANGE: '406.74',
      DATE: '06 Mar 2023',
      NAME: 'Cash',
      NEW_VALUE: '-322744.31',
      OLD_VALUE: '-323151.05',
      QCHANGE: '',
      QNEW_VALUE: '',
      QOLD_VALUE: '',
      SOURCE: 'growth',
      index: 39,
    });
    data = await getDataDumpFromPage(driver, 'todaysSettingsTable');
    //console.log(`data.length = ${data.length}`);
    expect(data.length).toBe(13);
    expect(data[0]).toEqual({
      NAME: 'windfall',
      VALUE: '100000',
      index: 0,
    });
    expect(data[12]).toEqual({
      NAME: 'ADSKStock',
      VALUE: '198USD',
      index: 12,
    });
    data = await getDataDumpFromPage(driver, 'settingsTable');
    expect(data.length).toBe(5);
    expect(data[0]).toEqual({
      NAME: 'Type of view for asset chart',
      VALUE: 'val',
      index: 0,
      HINT: "Asset chart uses setting '+', '-', '+-' or 'val'",
    });
    expect(data[4]).toEqual({
      NAME: 'Beginning of view range',
      VALUE: '10 Apr 2019',
      index: 4,
      HINT: 'Date at the start of range to be plotted',
    });
    data = await getDataDumpFromPage(driver, 'triggersTable');
    expect(data.length).toBe(48);
    expect(data[0]).toEqual({
      DATE: '01 Jan 2030',
      NAME: 'UpSpend',
      index: 0,
    });
    expect(data[47]).toEqual({
      DATE: 'GemDies<JeanDies?JeanDies:GemDies',
      NAME: 'BothDead',
      index: 47,
    });
    data = await getDataDumpFromPage(driver, 'customTransactionsTable');

    expect(data.length).toBe(11);
    expect(data[0]).toEqual({
      DATE: 'BothDead',
      FROM: 'Bonds',
      FROM_VALUE: '100%',
      NAME: 'CreateEstate',
      TO: 'Estate',
      TO_VALUE: '100%',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'custom',
      CATEGORY: '',
      index: 0,
    });
    expect(data[10]).toEqual({
      DATE: 'SoldFlat',
      FROM: 'Cash',
      FROM_VALUE: '68046',
      NAME: 'BondBuy1y',
      TO: 'BondsFixedTerm',
      TO_VALUE: '68046',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'custom',
      CATEGORY: '',
      index: 10,
    });

    data = await getDataDumpFromPage(driver, 'customTransactionsOverviewTable');

    expect(data.length).toBe(11);
    expect(data[0]).toEqual({
      DATE: 'BothDead',
      FROM: 'Bonds',
      FROM_VALUE: '100%',
      NAME: 'CreateEstate',
      TO: 'Estate',
      TO_VALUE: '100%',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'custom',
      CATEGORY: '',
      index: 0,
    });
    expect(data[10]).toEqual({
      DATE: 'SoldFlat',
      FROM: 'Cash',
      FROM_VALUE: '68046',
      NAME: 'BondBuy1y',
      TO: 'BondsFixedTerm',
      TO_VALUE: '68046',
      STOP_DATE: '',
      RECURRENCE: '',
      TYPE: 'custom',
      CATEGORY: '',
      index: 10,
    });

    await cleanUpWork(driver, testDataModelName);
  });

  afterAll(async () => {
    if (quitAfterAll) {
      await driver.quit();
    }
  });
});
