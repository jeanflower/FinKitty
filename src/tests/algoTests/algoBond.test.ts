import {
  revalueSetting,
  cpi,
  constType,
} from '../../localization/stringConstants';
import {
  emptyModel,
  simpleAsset,
  simpleTransaction,
  defaultModelSettings,
} from '../../models/exampleModels';
import { setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { printDebug } from '../../utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
} from './algotestUtils';

describe('bonds tests', () => {
  if (printDebug()) {
    printTestCodeForEvals;
  }

  it('special case bond maturity transactions', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'July 1, 2018',
    };
    const settingRevalueDate = 'February 10 2018';
    const transactionDateString = 'April 12 2018';
    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '0',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '100',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: transactionDateString, // after the setting change
          RECURRENCE: '1m',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(24);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Thu Apr 12 2018 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.02,
      2,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Sat May 12 2018 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.03,
      2,
    );
    expectEvals(
      evals,
      2,
      'BMVBondTargetValue/Tue Jun 12 2018 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.04,
      2,
    );
    expectEvals(
      evals,
      3,
      'BMVBondTargetValue/Thu Jul 12 2018 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.05,
      2,
    );
    expectEvals(evals, 4, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
    expectEvals(evals, 5, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 6, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 8, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 9, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 10, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 11, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 13, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 14, 'Bond', 'Thu Apr 12 2018', 1000, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Apr 12 2018', 0, -1);
    expectEvals(evals, 16, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 17, 'Bond', 'Tue May 01 2018', 1000, -1);
    expectEvals(evals, 18, 'Bond', 'Sat May 12 2018', 1000, -1);
    expectEvals(evals, 19, 'Cash', 'Sat May 12 2018', 0, -1);
    expectEvals(evals, 20, 'Cash', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 21, 'Bond', 'Fri Jun 01 2018', 1000, -1);
    expectEvals(evals, 22, 'Bond', 'Tue Jun 12 2018', 1000, -1);
    expectEvals(evals, 23, 'Cash', 'Tue Jun 12 2018', 0, -1);

    done();
  });

  it('special case bond investment transactions got enough cash', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'July 1, 2019',
    };
    const settingRevalueDate = 'February 10 2018';
    const matureDateString = 'April 12 2019';
    const investDateString = 'April 12 2018';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '100',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(43);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 1009.49, 2);
    expectEvals(evals, 5, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 1019.07, 2);
    expectEvals(evals, 8, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 1028.74, 2);
    expectEvals(evals, 10, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 12 2018', 924.36, 2);
    expectEvals(evals, 12, 'Bond', 'Thu Apr 12 2018', 1114.14, 2);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 924.36, 2);
    expectEvals(evals, 14, 'Bond', 'Tue May 01 2018', 1114.14, 2);
    expectEvals(evals, 15, 'Cash', 'Fri Jun 01 2018', 933.13, 2);
    expectEvals(evals, 16, 'Bond', 'Fri Jun 01 2018', 1114.14, 2);
    expectEvals(evals, 17, 'Cash', 'Sun Jul 01 2018', 941.99, 2);
    expectEvals(evals, 18, 'Bond', 'Sun Jul 01 2018', 1114.14, 2);
    expectEvals(evals, 19, 'Cash', 'Wed Aug 01 2018', 950.93, 2);
    expectEvals(evals, 20, 'Bond', 'Wed Aug 01 2018', 1114.14, 2);
    expectEvals(evals, 21, 'Cash', 'Sat Sep 01 2018', 959.95, 2);
    expectEvals(evals, 22, 'Bond', 'Sat Sep 01 2018', 1114.14, 2);
    expectEvals(evals, 23, 'Cash', 'Mon Oct 01 2018', 969.06, 2);
    expectEvals(evals, 24, 'Bond', 'Mon Oct 01 2018', 1114.14, 2);
    expectEvals(evals, 25, 'Cash', 'Thu Nov 01 2018', 978.25, 2);
    expectEvals(evals, 26, 'Bond', 'Thu Nov 01 2018', 1114.14, 2);
    expectEvals(evals, 27, 'Cash', 'Sat Dec 01 2018', 987.54, 2);
    expectEvals(evals, 28, 'Bond', 'Sat Dec 01 2018', 1114.14, 2);
    expectEvals(evals, 29, 'Cash', 'Tue Jan 01 2019', 996.91, 2);
    expectEvals(evals, 30, 'Bond', 'Tue Jan 01 2019', 1114.14, 2);
    expectEvals(evals, 31, 'Cash', 'Fri Feb 01 2019', 1006.37, 2);
    expectEvals(evals, 32, 'Bond', 'Fri Feb 01 2019', 1114.14, 2);
    expectEvals(evals, 33, 'Cash', 'Fri Mar 01 2019', 1015.92, 2);
    expectEvals(evals, 34, 'Bond', 'Fri Mar 01 2019', 1114.14, 2);
    expectEvals(evals, 35, 'Cash', 'Mon Apr 01 2019', 1025.56, 2);
    expectEvals(evals, 36, 'Bond', 'Mon Apr 01 2019', 1114.14, 2); // 114.14 = 100.00*(1.12^(14/12))
    expectEvals(evals, 37, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 38, 'Cash', 'Fri Apr 12 2019', 1149.42, 2);
    expectEvals(evals, 39, 'Cash', 'Wed May 01 2019', 1149.42, 2);
    expectEvals(evals, 40, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 41, 'Cash', 'Sat Jun 01 2019', 1160.33, 2); //109.91*(1.12^(5/12)) + (1000-109.91)*(1.12^(17/12))
    expectEvals(evals, 42, 'Bond', 'Sat Jun 01 2019', 1000, -1);

    done();
  });

  it('special case bond investment transactions not enough cash', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'July 1, 2019',
    };
    const settingRevalueDate = 'February 10 2018';
    const matureDateString = 'April 12 2019';
    const investDateString = 'April 12 2018';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '0',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '100',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(41);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 3, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 5, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 8, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 10, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Cash', 'Tue May 01 2018', 0, -1);
    expectEvals(evals, 12, 'Bond', 'Tue May 01 2018', 1000, -1);
    expectEvals(evals, 13, 'Cash', 'Fri Jun 01 2018', 0, -1);
    expectEvals(evals, 14, 'Bond', 'Fri Jun 01 2018', 1000, -1);
    expectEvals(evals, 15, 'Cash', 'Sun Jul 01 2018', 0, -1);
    expectEvals(evals, 16, 'Bond', 'Sun Jul 01 2018', 1000, -1);
    expectEvals(evals, 17, 'Cash', 'Wed Aug 01 2018', 0, -1);
    expectEvals(evals, 18, 'Bond', 'Wed Aug 01 2018', 1000, -1);
    expectEvals(evals, 19, 'Cash', 'Sat Sep 01 2018', 0, -1);
    expectEvals(evals, 20, 'Bond', 'Sat Sep 01 2018', 1000, -1);
    expectEvals(evals, 21, 'Cash', 'Mon Oct 01 2018', 0, -1);
    expectEvals(evals, 22, 'Bond', 'Mon Oct 01 2018', 1000, -1);
    expectEvals(evals, 23, 'Cash', 'Thu Nov 01 2018', 0, -1);
    expectEvals(evals, 24, 'Bond', 'Thu Nov 01 2018', 1000, -1);
    expectEvals(evals, 25, 'Cash', 'Sat Dec 01 2018', 0, -1);
    expectEvals(evals, 26, 'Bond', 'Sat Dec 01 2018', 1000, -1);
    expectEvals(evals, 27, 'Cash', 'Tue Jan 01 2019', 0, -1);
    expectEvals(evals, 28, 'Bond', 'Tue Jan 01 2019', 1000, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Feb 01 2019', 0, -1);
    expectEvals(evals, 30, 'Bond', 'Fri Feb 01 2019', 1000, -1);
    expectEvals(evals, 31, 'Cash', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 32, 'Bond', 'Fri Mar 01 2019', 1000, -1);
    expectEvals(evals, 33, 'Cash', 'Mon Apr 01 2019', 0, -1);
    expectEvals(evals, 34, 'Bond', 'Mon Apr 01 2019', 1000, -1);
    expectEvals(evals, 35, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 36, 'Cash', 'Fri Apr 12 2019', 0, -1);
    expectEvals(evals, 37, 'Cash', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 38, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 39, 'Cash', 'Sat Jun 01 2019', 0, -1);
    expectEvals(evals, 40, 'Bond', 'Sat Jun 01 2019', 1000, -1);

    done();
  });

  it('special case bond investment transactions zero cpi', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'July 1, 2019',
    };
    const settingRevalueDate = 'February 10 2018';
    const matureDateString = 'April 12 2019';
    const investDateString = 'April 12 2018';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '100',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(43);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 5, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 8, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 10, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 12 2018', 900, -1);
    expectEvals(evals, 12, 'Bond', 'Thu Apr 12 2018', 1100, -1);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 900, -1);
    expectEvals(evals, 14, 'Bond', 'Tue May 01 2018', 1100, -1);
    expectEvals(evals, 15, 'Cash', 'Fri Jun 01 2018', 900, -1);
    expectEvals(evals, 16, 'Bond', 'Fri Jun 01 2018', 1100, -1);
    expectEvals(evals, 17, 'Cash', 'Sun Jul 01 2018', 900, -1);
    expectEvals(evals, 18, 'Bond', 'Sun Jul 01 2018', 1100, -1);
    expectEvals(evals, 19, 'Cash', 'Wed Aug 01 2018', 900, -1);
    expectEvals(evals, 20, 'Bond', 'Wed Aug 01 2018', 1100, -1);
    expectEvals(evals, 21, 'Cash', 'Sat Sep 01 2018', 900, -1);
    expectEvals(evals, 22, 'Bond', 'Sat Sep 01 2018', 1100, -1);
    expectEvals(evals, 23, 'Cash', 'Mon Oct 01 2018', 900, -1);
    expectEvals(evals, 24, 'Bond', 'Mon Oct 01 2018', 1100, -1);
    expectEvals(evals, 25, 'Cash', 'Thu Nov 01 2018', 900, -1);
    expectEvals(evals, 26, 'Bond', 'Thu Nov 01 2018', 1100, -1);
    expectEvals(evals, 27, 'Cash', 'Sat Dec 01 2018', 900, -1);
    expectEvals(evals, 28, 'Bond', 'Sat Dec 01 2018', 1100, -1);
    expectEvals(evals, 29, 'Cash', 'Tue Jan 01 2019', 900, -1);
    expectEvals(evals, 30, 'Bond', 'Tue Jan 01 2019', 1100, -1);
    expectEvals(evals, 31, 'Cash', 'Fri Feb 01 2019', 900, -1);
    expectEvals(evals, 32, 'Bond', 'Fri Feb 01 2019', 1100, -1);
    expectEvals(evals, 33, 'Cash', 'Fri Mar 01 2019', 900, -1);
    expectEvals(evals, 34, 'Bond', 'Fri Mar 01 2019', 1100, -1);
    expectEvals(evals, 35, 'Cash', 'Mon Apr 01 2019', 900, -1);
    expectEvals(evals, 36, 'Bond', 'Mon Apr 01 2019', 1100, -1);
    expectEvals(evals, 37, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 38, 'Cash', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 39, 'Cash', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 40, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 41, 'Cash', 'Sat Jun 01 2019', 1000, -1);
    expectEvals(evals, 42, 'Bond', 'Sat Jun 01 2019', 1000, -1);

    done();
  });

  it('special case bond investment transactions roi long enough', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'July 1, 2019',
    };
    const settingRevalueDate = 'February 10 2018';
    const matureDateString = 'April 12 2019';
    const investDateString = 'April 12 2018';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '100',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(43);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 1009.49, 2);
    expectEvals(evals, 5, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 1019.07, 2);
    expectEvals(evals, 8, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 1028.74, 2);
    expectEvals(evals, 10, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 12 2018', 924.36, 2);
    expectEvals(evals, 12, 'Bond', 'Thu Apr 12 2018', 1114.14, 2);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 924.36, 2);
    expectEvals(evals, 14, 'Bond', 'Tue May 01 2018', 1114.14, 2);
    expectEvals(evals, 15, 'Cash', 'Fri Jun 01 2018', 933.13, 2);
    expectEvals(evals, 16, 'Bond', 'Fri Jun 01 2018', 1114.14, 2);
    expectEvals(evals, 17, 'Cash', 'Sun Jul 01 2018', 941.99, 2);
    expectEvals(evals, 18, 'Bond', 'Sun Jul 01 2018', 1114.14, 2);
    expectEvals(evals, 19, 'Cash', 'Wed Aug 01 2018', 950.93, 2);
    expectEvals(evals, 20, 'Bond', 'Wed Aug 01 2018', 1114.14, 2);
    expectEvals(evals, 21, 'Cash', 'Sat Sep 01 2018', 959.95, 2);
    expectEvals(evals, 22, 'Bond', 'Sat Sep 01 2018', 1114.14, 2);
    expectEvals(evals, 23, 'Cash', 'Mon Oct 01 2018', 969.06, 2);
    expectEvals(evals, 24, 'Bond', 'Mon Oct 01 2018', 1114.14, 2);
    expectEvals(evals, 25, 'Cash', 'Thu Nov 01 2018', 978.25, 2);
    expectEvals(evals, 26, 'Bond', 'Thu Nov 01 2018', 1114.14, 2);
    expectEvals(evals, 27, 'Cash', 'Sat Dec 01 2018', 987.54, 2);
    expectEvals(evals, 28, 'Bond', 'Sat Dec 01 2018', 1114.14, 2);
    expectEvals(evals, 29, 'Cash', 'Tue Jan 01 2019', 996.91, 2);
    expectEvals(evals, 30, 'Bond', 'Tue Jan 01 2019', 1114.14, 2);
    expectEvals(evals, 31, 'Cash', 'Fri Feb 01 2019', 1006.37, 2);
    expectEvals(evals, 32, 'Bond', 'Fri Feb 01 2019', 1114.14, 2);
    expectEvals(evals, 33, 'Cash', 'Fri Mar 01 2019', 1015.92, 2);
    expectEvals(evals, 34, 'Bond', 'Fri Mar 01 2019', 1114.14, 2);
    expectEvals(evals, 35, 'Cash', 'Mon Apr 01 2019', 1025.56, 2);
    expectEvals(evals, 36, 'Bond', 'Mon Apr 01 2019', 1114.14, 2);
    expectEvals(evals, 37, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 38, 'Cash', 'Fri Apr 12 2019', 1149.42, 2);
    expectEvals(evals, 39, 'Cash', 'Wed May 01 2019', 1149.42, 2);
    expectEvals(evals, 40, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 41, 'Cash', 'Sat Jun 01 2019', 1160.33, 2); // verified
    expectEvals(evals, 42, 'Bond', 'Sat Jun 01 2019', 1000, -1);

    done();
  });

  it('special case bond investment transactions roi stops early', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'July 1, 2018',
    };
    const settingRevalueDate = 'February 10 2018';
    const matureDateString = 'April 12 2019';
    const investDateString = 'April 12 2018';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '100',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(17);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 2, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 3, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Cash', 'Thu Feb 01 2018', 1009.49, 2);
    expectEvals(evals, 5, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 7, 'Cash', 'Thu Mar 01 2018', 1019.07, 2);
    expectEvals(evals, 8, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Cash', 'Sun Apr 01 2018', 1028.74, 2);
    expectEvals(evals, 10, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Cash', 'Thu Apr 12 2018', 924.36, 2);
    expectEvals(evals, 12, 'Bond', 'Thu Apr 12 2018', 1114.14, 2);
    expectEvals(evals, 13, 'Cash', 'Tue May 01 2018', 924.36, 2);
    expectEvals(evals, 14, 'Bond', 'Tue May 01 2018', 1114.14, 2);
    expectEvals(evals, 15, 'Cash', 'Fri Jun 01 2018', 933.13, 2);
    expectEvals(evals, 16, 'Bond', 'Fri Jun 01 2018', 1114.14, 2); // 114.14 = 109.91*(1.12^(4/12))

    done();
  });

  it('special case bond investment transactions repeat overlap', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'August 1, 2019',
    };
    const settingRevalueDate = 'February 10 2018';

    const investDateString = 'April 12 2018';
    const investDateStopString = 'June 12 2018';
    const matureDateString = 'April 12 2019';
    const matureDateStopString = 'June 12 2019';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '10',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
          RECURRENCE: '1m',
          STOP_DATE: investDateStopString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
          RECURRENCE: '1m',
          STOP_DATE: matureDateStopString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(50);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Sun May 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', 990, -1);
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 1010, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 990, -1);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 1010, -1);
    expectEvals(evals, 16, 'Cash', 'Sat May 12 2018', 980, -1);
    expectEvals(evals, 17, 'Bond', 'Sat May 12 2018', 1020, -1);
    expectEvals(evals, 18, 'Cash', 'Fri Jun 01 2018', 980, -1);
    expectEvals(evals, 19, 'Bond', 'Fri Jun 01 2018', 1020, -1);
    expectEvals(evals, 20, 'Cash', 'Sun Jul 01 2018', 980, -1);
    expectEvals(evals, 21, 'Bond', 'Sun Jul 01 2018', 1020, -1);
    expectEvals(evals, 22, 'Cash', 'Wed Aug 01 2018', 980, -1);
    expectEvals(evals, 23, 'Bond', 'Wed Aug 01 2018', 1020, -1);
    expectEvals(evals, 24, 'Cash', 'Sat Sep 01 2018', 980, -1);
    expectEvals(evals, 25, 'Bond', 'Sat Sep 01 2018', 1020, -1);
    expectEvals(evals, 26, 'Cash', 'Mon Oct 01 2018', 980, -1);
    expectEvals(evals, 27, 'Bond', 'Mon Oct 01 2018', 1020, -1);
    expectEvals(evals, 28, 'Cash', 'Thu Nov 01 2018', 980, -1);
    expectEvals(evals, 29, 'Bond', 'Thu Nov 01 2018', 1020, -1);
    expectEvals(evals, 30, 'Cash', 'Sat Dec 01 2018', 980, -1);
    expectEvals(evals, 31, 'Bond', 'Sat Dec 01 2018', 1020, -1);
    expectEvals(evals, 32, 'Cash', 'Tue Jan 01 2019', 980, -1);
    expectEvals(evals, 33, 'Bond', 'Tue Jan 01 2019', 1020, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Feb 01 2019', 980, -1);
    expectEvals(evals, 35, 'Bond', 'Fri Feb 01 2019', 1020, -1);
    expectEvals(evals, 36, 'Cash', 'Fri Mar 01 2019', 980, -1);
    expectEvals(evals, 37, 'Bond', 'Fri Mar 01 2019', 1020, -1);
    expectEvals(evals, 38, 'Cash', 'Mon Apr 01 2019', 980, -1);
    expectEvals(evals, 39, 'Bond', 'Mon Apr 01 2019', 1020, -1);
    expectEvals(evals, 40, 'Bond', 'Fri Apr 12 2019', 1010, -1);
    expectEvals(evals, 41, 'Cash', 'Fri Apr 12 2019', 990, -1);
    expectEvals(evals, 42, 'Cash', 'Wed May 01 2019', 990, -1);
    expectEvals(evals, 43, 'Bond', 'Wed May 01 2019', 1010, -1);
    expectEvals(evals, 44, 'Bond', 'Sun May 12 2019', 1000, -1);
    expectEvals(evals, 45, 'Cash', 'Sun May 12 2019', 1000, -1);
    expectEvals(evals, 46, 'Cash', 'Sat Jun 01 2019', 1000, -1);
    expectEvals(evals, 47, 'Bond', 'Sat Jun 01 2019', 1000, -1);
    expectEvals(evals, 48, 'Cash', 'Mon Jul 01 2019', 1000, -1);
    expectEvals(evals, 49, 'Bond', 'Mon Jul 01 2019', 1000, -1);

    done();
  });

  it('special case bond investment transactions cash short', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'August 1, 2019',
    };
    const settingRevalueDate = 'February 10 2018';

    const investDateString = 'April 12 2018';
    const investDateStopString = 'June 12 2018';
    const matureDateString = 'April 12 2019';
    const matureDateStopString = 'June 12 2019';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '15',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '15',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '10',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
          RECURRENCE: '1m',
          STOP_DATE: investDateStopString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
          RECURRENCE: '1m',
          STOP_DATE: matureDateStopString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(48);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Sun May 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 15, -1);
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 15, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 15, -1);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 15, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 15, -1);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 15, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 15, -1);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 15, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', 5, -1);
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 25, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 5, -1);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 25, -1);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 5, -1);
    expectEvals(evals, 17, 'Bond', 'Fri Jun 01 2018', 25, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Jul 01 2018', 5, -1);
    expectEvals(evals, 19, 'Bond', 'Sun Jul 01 2018', 25, -1);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 5, -1);
    expectEvals(evals, 21, 'Bond', 'Wed Aug 01 2018', 25, -1);
    expectEvals(evals, 22, 'Cash', 'Sat Sep 01 2018', 5, -1);
    expectEvals(evals, 23, 'Bond', 'Sat Sep 01 2018', 25, -1);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 5, -1);
    expectEvals(evals, 25, 'Bond', 'Mon Oct 01 2018', 25, -1);
    expectEvals(evals, 26, 'Cash', 'Thu Nov 01 2018', 5, -1);
    expectEvals(evals, 27, 'Bond', 'Thu Nov 01 2018', 25, -1);
    expectEvals(evals, 28, 'Cash', 'Sat Dec 01 2018', 5, -1);
    expectEvals(evals, 29, 'Bond', 'Sat Dec 01 2018', 25, -1);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', 5, -1);
    expectEvals(evals, 31, 'Bond', 'Tue Jan 01 2019', 25, -1);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', 5, -1);
    expectEvals(evals, 33, 'Bond', 'Fri Feb 01 2019', 25, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 5, -1);
    expectEvals(evals, 35, 'Bond', 'Fri Mar 01 2019', 25, -1);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', 5, -1);
    expectEvals(evals, 37, 'Bond', 'Mon Apr 01 2019', 25, -1);
    expectEvals(evals, 38, 'Bond', 'Fri Apr 12 2019', 15, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 12 2019', 15, -1);
    expectEvals(evals, 40, 'Cash', 'Wed May 01 2019', 15, -1);
    expectEvals(evals, 41, 'Bond', 'Wed May 01 2019', 15, -1);
    expectEvals(evals, 42, 'Bond', 'Sun May 12 2019', 15, -1);
    expectEvals(evals, 43, 'Cash', 'Sun May 12 2019', 15, -1);
    expectEvals(evals, 44, 'Cash', 'Sat Jun 01 2019', 15, -1);
    expectEvals(evals, 45, 'Bond', 'Sat Jun 01 2019', 15, -1);
    expectEvals(evals, 46, 'Cash', 'Mon Jul 01 2019', 15, -1);
    expectEvals(evals, 47, 'Bond', 'Mon Jul 01 2019', 15, -1);

    done();
  });

  it('special case bond investment transactions repeat disjoint', done => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'June 1, 2021',
    };
    const settingRevalueDate = 'February 10 2018';

    const investDateString = 'April 12 2018';
    const investDateStopString = 'June 12 2021';
    const matureDateString = 'April 12 2019';
    const matureDateStopString = 'August 12 2022';

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of BondTargetValue 1',
          TO: 'BondTargetValue',
          TO_VALUE: '10',
          DATE: settingRevalueDate,
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: investDateString,
          RECURRENCE: '2y',
          STOP_DATE: investDateStopString,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: matureDateString,
          RECURRENCE: '2y',
          STOP_DATE: matureDateStopString,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(94);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/Fri Apr 12 2019 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Mon Apr 12 2021 00:00:00 GMT+0100 (British Summer Time)/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Fri Apr 12 2019', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 10, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', 990, -1);
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 1010, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 990, -1);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 1010, -1);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 990, -1);
    expectEvals(evals, 17, 'Bond', 'Fri Jun 01 2018', 1010, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Jul 01 2018', 990, -1);
    expectEvals(evals, 19, 'Bond', 'Sun Jul 01 2018', 1010, -1);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 990, -1);
    expectEvals(evals, 21, 'Bond', 'Wed Aug 01 2018', 1010, -1);
    expectEvals(evals, 22, 'Cash', 'Sat Sep 01 2018', 990, -1);
    expectEvals(evals, 23, 'Bond', 'Sat Sep 01 2018', 1010, -1);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 990, -1);
    expectEvals(evals, 25, 'Bond', 'Mon Oct 01 2018', 1010, -1);
    expectEvals(evals, 26, 'Cash', 'Thu Nov 01 2018', 990, -1);
    expectEvals(evals, 27, 'Bond', 'Thu Nov 01 2018', 1010, -1);
    expectEvals(evals, 28, 'Cash', 'Sat Dec 01 2018', 990, -1);
    expectEvals(evals, 29, 'Bond', 'Sat Dec 01 2018', 1010, -1);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', 990, -1);
    expectEvals(evals, 31, 'Bond', 'Tue Jan 01 2019', 1010, -1);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', 990, -1);
    expectEvals(evals, 33, 'Bond', 'Fri Feb 01 2019', 1010, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 990, -1);
    expectEvals(evals, 35, 'Bond', 'Fri Mar 01 2019', 1010, -1);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', 990, -1);
    expectEvals(evals, 37, 'Bond', 'Mon Apr 01 2019', 1010, -1);
    expectEvals(evals, 38, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 40, 'Cash', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 41, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 42, 'Cash', 'Sat Jun 01 2019', 1000, -1);
    expectEvals(evals, 43, 'Bond', 'Sat Jun 01 2019', 1000, -1);
    expectEvals(evals, 44, 'Cash', 'Mon Jul 01 2019', 1000, -1);
    expectEvals(evals, 45, 'Bond', 'Mon Jul 01 2019', 1000, -1);
    expectEvals(evals, 46, 'Cash', 'Thu Aug 01 2019', 1000, -1);
    expectEvals(evals, 47, 'Bond', 'Thu Aug 01 2019', 1000, -1);
    expectEvals(evals, 48, 'Cash', 'Sun Sep 01 2019', 1000, -1);
    expectEvals(evals, 49, 'Bond', 'Sun Sep 01 2019', 1000, -1);
    expectEvals(evals, 50, 'Cash', 'Tue Oct 01 2019', 1000, -1);
    expectEvals(evals, 51, 'Bond', 'Tue Oct 01 2019', 1000, -1);
    expectEvals(evals, 52, 'Cash', 'Fri Nov 01 2019', 1000, -1);
    expectEvals(evals, 53, 'Bond', 'Fri Nov 01 2019', 1000, -1);
    expectEvals(evals, 54, 'Cash', 'Sun Dec 01 2019', 1000, -1);
    expectEvals(evals, 55, 'Bond', 'Sun Dec 01 2019', 1000, -1);
    expectEvals(evals, 56, 'Cash', 'Wed Jan 01 2020', 1000, -1);
    expectEvals(evals, 57, 'Bond', 'Wed Jan 01 2020', 1000, -1);
    expectEvals(evals, 58, 'Cash', 'Sat Feb 01 2020', 1000, -1);
    expectEvals(evals, 59, 'Bond', 'Sat Feb 01 2020', 1000, -1);
    expectEvals(evals, 60, 'Cash', 'Sun Mar 01 2020', 1000, -1);
    expectEvals(evals, 61, 'Bond', 'Sun Mar 01 2020', 1000, -1);
    expectEvals(evals, 62, 'Cash', 'Wed Apr 01 2020', 1000, -1);
    expectEvals(evals, 63, 'Bond', 'Wed Apr 01 2020', 1000, -1);
    expectEvals(evals, 64, 'Cash', 'Sun Apr 12 2020', 990, -1);
    expectEvals(evals, 65, 'Bond', 'Sun Apr 12 2020', 1010, -1);
    expectEvals(evals, 66, 'Cash', 'Fri May 01 2020', 990, -1);
    expectEvals(evals, 67, 'Bond', 'Fri May 01 2020', 1010, -1);
    expectEvals(evals, 68, 'Cash', 'Mon Jun 01 2020', 990, -1);
    expectEvals(evals, 69, 'Bond', 'Mon Jun 01 2020', 1010, -1);
    expectEvals(evals, 70, 'Cash', 'Wed Jul 01 2020', 990, -1);
    expectEvals(evals, 71, 'Bond', 'Wed Jul 01 2020', 1010, -1);
    expectEvals(evals, 72, 'Cash', 'Sat Aug 01 2020', 990, -1);
    expectEvals(evals, 73, 'Bond', 'Sat Aug 01 2020', 1010, -1);
    expectEvals(evals, 74, 'Cash', 'Tue Sep 01 2020', 990, -1);
    expectEvals(evals, 75, 'Bond', 'Tue Sep 01 2020', 1010, -1);
    expectEvals(evals, 76, 'Cash', 'Thu Oct 01 2020', 990, -1);
    expectEvals(evals, 77, 'Bond', 'Thu Oct 01 2020', 1010, -1);
    expectEvals(evals, 78, 'Cash', 'Sun Nov 01 2020', 990, -1);
    expectEvals(evals, 79, 'Bond', 'Sun Nov 01 2020', 1010, -1);
    expectEvals(evals, 80, 'Cash', 'Tue Dec 01 2020', 990, -1);
    expectEvals(evals, 81, 'Bond', 'Tue Dec 01 2020', 1010, -1);
    expectEvals(evals, 82, 'Cash', 'Fri Jan 01 2021', 990, -1);
    expectEvals(evals, 83, 'Bond', 'Fri Jan 01 2021', 1010, -1);
    expectEvals(evals, 84, 'Cash', 'Mon Feb 01 2021', 990, -1);
    expectEvals(evals, 85, 'Bond', 'Mon Feb 01 2021', 1010, -1);
    expectEvals(evals, 86, 'Cash', 'Mon Mar 01 2021', 990, -1);
    expectEvals(evals, 87, 'Bond', 'Mon Mar 01 2021', 1010, -1);
    expectEvals(evals, 88, 'Cash', 'Thu Apr 01 2021', 990, -1);
    expectEvals(evals, 89, 'Bond', 'Thu Apr 01 2021', 1010, -1);
    expectEvals(evals, 90, 'Bond', 'Mon Apr 12 2021', 1000, -1);
    expectEvals(evals, 91, 'Cash', 'Mon Apr 12 2021', 1000, -1);
    expectEvals(evals, 92, 'Cash', 'Sat May 01 2021', 1000, -1);
    expectEvals(evals, 93, 'Bond', 'Sat May 01 2021', 1000, -1);

    done();
  });
});
