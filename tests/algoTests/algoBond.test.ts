import { makeModelFromJSONString } from '../../models/modelFromJSON';
import { defaultModelSettings } from '../../models/testModel';
import {
  revalueSetting,
  cpi,
  constType,
  bondMature,
  bondInvest,
  bondInterest,
} from '../../localization/stringConstants';
import { getEvaluations } from '../../models/evaluations';
import {
  emptyModel,
  simpleAsset,
  simpleTransaction,
} from '../../models/exampleModels';
import { setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
  defaultTestViewSettings,
} from './algoTestUtils';

describe('bonds tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('bond invest simple with 100% bond interest', () => {
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
          CAN_BE_NEGATIVE: true,
        },
        {
          ...simpleAsset,
          NAME: 'Bond',
          START: 'January 1 2018',
          VALUE: '0',
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);
    setSetting(model.settings, `${bondInterest}`, '100', constType);

    const evalsAndValues = getEvaluations(
      makeModelFromJSONString(JSON.stringify(model)),
      undefined, // no key for a values report
    );

    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(44);
    expectEvals(evals, 0, 'bondInterest', 'Fri Dec 01 2017', 100, -1);
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 0, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 0, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 0, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', -53.84, 2);
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 114.14, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', -53.84, 2);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 114.14, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', -54.35, 2);
    expectEvals(evals, 17, 'Bond', 'Fri Jun 01 2018', 114.14, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jul 01 2018', -54.86, 2);
    expectEvals(evals, 19, 'Bond', 'Sun Jul 01 2018', 114.14, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', -55.38, 2);
    expectEvals(evals, 21, 'Bond', 'Wed Aug 01 2018', 114.14, 2);
    expectEvals(evals, 22, 'Cash', 'Sat Sep 01 2018', -55.91, 2);
    expectEvals(evals, 23, 'Bond', 'Sat Sep 01 2018', 114.14, 2);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', -56.44, 2);
    expectEvals(evals, 25, 'Bond', 'Mon Oct 01 2018', 114.14, 2);
    expectEvals(evals, 26, 'Cash', 'Thu Nov 01 2018', -56.98, 2);
    expectEvals(evals, 27, 'Bond', 'Thu Nov 01 2018', 114.14, 2);
    expectEvals(evals, 28, 'Cash', 'Sat Dec 01 2018', -57.52, 2);
    expectEvals(evals, 29, 'Bond', 'Sat Dec 01 2018', 114.14, 2);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', -58.06, 2);
    expectEvals(evals, 31, 'Bond', 'Tue Jan 01 2019', 114.14, 2);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', -58.61, 2);
    expectEvals(evals, 33, 'Bond', 'Fri Feb 01 2019', 114.14, 2);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', -59.17, 2);
    expectEvals(evals, 35, 'Bond', 'Fri Mar 01 2019', 114.14, 2);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', -59.73, 2);
    expectEvals(evals, 37, 'Bond', 'Mon Apr 01 2019', 114.14, 2);
    expectEvals(evals, 38, 'Bond', 'Fri Apr 12 2019', 0, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 12 2019', 53.84, 2);
    expectEvals(evals, 40, 'Cash', 'Wed May 01 2019', 53.84, 2);
    expectEvals(evals, 41, 'Bond', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 42, 'Cash', 'Sat Jun 01 2019', 54.35, 2);
    expectEvals(evals, 43, 'Bond', 'Sat Jun 01 2019', 0, -1);
  });

  it('bond invest once mature once', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond invest has 0% bond interest', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);
    setSetting(model.settings, `${bondInterest}`, '0', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(44);
    expectEvals(evals, 0, 'bondInterest', 'Fri Dec 01 2017', 0, -1);
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1009.49, 2);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 1019.07, 2);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 1028.74, 2);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', 936.59, 2);
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 1114.14, 2);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 936.59, 2);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 1114.14, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 945.48, 2);
    expectEvals(evals, 17, 'Bond', 'Fri Jun 01 2018', 1114.14, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jul 01 2018', 954.45, 2);
    expectEvals(evals, 19, 'Bond', 'Sun Jul 01 2018', 1114.14, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 963.51, 2);
    expectEvals(evals, 21, 'Bond', 'Wed Aug 01 2018', 1114.14, 2);
    expectEvals(evals, 22, 'Cash', 'Sat Sep 01 2018', 972.65, 2);
    expectEvals(evals, 23, 'Bond', 'Sat Sep 01 2018', 1114.14, 2);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 981.88, 2);
    expectEvals(evals, 25, 'Bond', 'Mon Oct 01 2018', 1114.14, 2);
    expectEvals(evals, 26, 'Cash', 'Thu Nov 01 2018', 991.2, 2);
    expectEvals(evals, 27, 'Bond', 'Thu Nov 01 2018', 1114.14, 2);
    expectEvals(evals, 28, 'Cash', 'Sat Dec 01 2018', 1000.6, 2);
    expectEvals(evals, 29, 'Bond', 'Sat Dec 01 2018', 1114.14, 2);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', 1010.1, 2);
    expectEvals(evals, 31, 'Bond', 'Tue Jan 01 2019', 1114.14, 2);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', 1019.68, 2);
    expectEvals(evals, 33, 'Bond', 'Fri Feb 01 2019', 1114.14, 2);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 1029.36, 2);
    expectEvals(evals, 35, 'Bond', 'Fri Mar 01 2019', 1114.14, 2);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', 1039.12, 2);
    expectEvals(evals, 37, 'Bond', 'Mon Apr 01 2019', 1114.14, 2); // 114.14 = 100.00*(1.12^(14/12))
    expectEvals(evals, 38, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 12 2019', 1163.12, 2);
    expectEvals(evals, 40, 'Cash', 'Wed May 01 2019', 1163.12, 2);
    expectEvals(evals, 41, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 42, 'Cash', 'Sat Jun 01 2019', 1174.16, 2);
    expectEvals(evals, 43, 'Bond', 'Sat Jun 01 2019', 1000, -1);
  });

  it('bond invest has 100% bond interest', () => {
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
          VALUE: '945.05',
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);
    setSetting(model.settings, `${bondInterest}`, '100', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(44);
    expectEvals(evals, 0, 'bondInterest', 'Fri Dec 01 2017', 100, -1);
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 945.05, 2); // start with inflated 100 / 2 less than 1000
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 954.02, 2);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 963.07, 2);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 972.21, 2);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', 927.6, 2); // invest about 50
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 1114.14, 2); // will relase about 100 upon maturity
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 927.6, 2);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 1114.14, 2);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 936.4, 2);
    expectEvals(evals, 17, 'Bond', 'Fri Jun 01 2018', 1114.14, 2);
    expectEvals(evals, 18, 'Cash', 'Sun Jul 01 2018', 945.28, 2);
    expectEvals(evals, 19, 'Bond', 'Sun Jul 01 2018', 1114.14, 2);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 954.25, 2);
    expectEvals(evals, 21, 'Bond', 'Wed Aug 01 2018', 1114.14, 2);
    expectEvals(evals, 22, 'Cash', 'Sat Sep 01 2018', 963.31, 2);
    expectEvals(evals, 23, 'Bond', 'Sat Sep 01 2018', 1114.14, 2);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 972.45, 2);
    expectEvals(evals, 25, 'Bond', 'Mon Oct 01 2018', 1114.14, 2);
    expectEvals(evals, 26, 'Cash', 'Thu Nov 01 2018', 981.68, 2);
    expectEvals(evals, 27, 'Bond', 'Thu Nov 01 2018', 1114.14, 2);
    expectEvals(evals, 28, 'Cash', 'Sat Dec 01 2018', 990.99, 2);
    expectEvals(evals, 29, 'Bond', 'Sat Dec 01 2018', 1114.14, 2);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', 1000.39, 2);
    expectEvals(evals, 31, 'Bond', 'Tue Jan 01 2019', 1114.14, 2);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', 1009.89, 2);
    expectEvals(evals, 33, 'Bond', 'Fri Feb 01 2019', 1114.14, 2);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 1019.47, 2);
    expectEvals(evals, 35, 'Bond', 'Fri Mar 01 2019', 1114.14, 2);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', 1029.14, 2);
    expectEvals(evals, 37, 'Bond', 'Mon Apr 01 2019', 1114.14, 2); // 114.14 = 100.00*(1.12^(14/12))
    expectEvals(evals, 38, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 12 2019', 1153.04, 2); // will relase about 100 upon maturity
    expectEvals(evals, 40, 'Cash', 'Wed May 01 2019', 1153.04, 2);
    expectEvals(evals, 41, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 42, 'Cash', 'Sat Jun 01 2019', 1163.98, 2);
    expectEvals(evals, 43, 'Bond', 'Sat Jun 01 2019', 1000, -1);
  });

  it(`bond not enough cash to invest so don't mature`, () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond zero cpi', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond zero cpi with interest', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);
    setSetting(model.settings, `${bondInterest}`, '100', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(44);
    expectEvals(evals, 0, 'bondInterest', 'Fri Dec 01 2017', 100, -1);
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
    expectEvals(evals, 3, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 4, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 5, 'Cash', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 6, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 7, 'BondTargetValue', 'Sat Feb 10 2018', 100, -1);
    expectEvals(evals, 8, 'Cash', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 9, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 10, 'Cash', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 11, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Cash', 'Thu Apr 12 2018', 950, -1);
    expectEvals(evals, 13, 'Bond', 'Thu Apr 12 2018', 1100, -1);
    expectEvals(evals, 14, 'Cash', 'Tue May 01 2018', 950, -1);
    expectEvals(evals, 15, 'Bond', 'Tue May 01 2018', 1100, -1);
    expectEvals(evals, 16, 'Cash', 'Fri Jun 01 2018', 950, -1);
    expectEvals(evals, 17, 'Bond', 'Fri Jun 01 2018', 1100, -1);
    expectEvals(evals, 18, 'Cash', 'Sun Jul 01 2018', 950, -1);
    expectEvals(evals, 19, 'Bond', 'Sun Jul 01 2018', 1100, -1);
    expectEvals(evals, 20, 'Cash', 'Wed Aug 01 2018', 950, -1);
    expectEvals(evals, 21, 'Bond', 'Wed Aug 01 2018', 1100, -1);
    expectEvals(evals, 22, 'Cash', 'Sat Sep 01 2018', 950, -1);
    expectEvals(evals, 23, 'Bond', 'Sat Sep 01 2018', 1100, -1);
    expectEvals(evals, 24, 'Cash', 'Mon Oct 01 2018', 950, -1);
    expectEvals(evals, 25, 'Bond', 'Mon Oct 01 2018', 1100, -1);
    expectEvals(evals, 26, 'Cash', 'Thu Nov 01 2018', 950, -1);
    expectEvals(evals, 27, 'Bond', 'Thu Nov 01 2018', 1100, -1);
    expectEvals(evals, 28, 'Cash', 'Sat Dec 01 2018', 950, -1);
    expectEvals(evals, 29, 'Bond', 'Sat Dec 01 2018', 1100, -1);
    expectEvals(evals, 30, 'Cash', 'Tue Jan 01 2019', 950, -1);
    expectEvals(evals, 31, 'Bond', 'Tue Jan 01 2019', 1100, -1);
    expectEvals(evals, 32, 'Cash', 'Fri Feb 01 2019', 950, -1);
    expectEvals(evals, 33, 'Bond', 'Fri Feb 01 2019', 1100, -1);
    expectEvals(evals, 34, 'Cash', 'Fri Mar 01 2019', 950, -1);
    expectEvals(evals, 35, 'Bond', 'Fri Mar 01 2019', 1100, -1);
    expectEvals(evals, 36, 'Cash', 'Mon Apr 01 2019', 950, -1);
    expectEvals(evals, 37, 'Bond', 'Mon Apr 01 2019', 1100, -1);
    expectEvals(evals, 38, 'Bond', 'Fri Apr 12 2019', 1000, -1);
    expectEvals(evals, 39, 'Cash', 'Fri Apr 12 2019', 1050, -1);
    expectEvals(evals, 40, 'Cash', 'Wed May 01 2019', 1050, -1);
    expectEvals(evals, 41, 'Bond', 'Wed May 01 2019', 1000, -1);
    expectEvals(evals, 42, 'Cash', 'Sat Jun 01 2019', 1050, -1);
    expectEvals(evals, 43, 'Bond', 'Sat Jun 01 2019', 1000, -1);
  });

  it('bond roi stops before bond matures', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1.14,
      2,
    );
    expectEvals(evals, 1, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond repeat overlap', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 May 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond repeat cash too short for both', () => {
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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 May 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond repeat disjoint', () => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'June 1, 2021',
    };
    const settingRevalueDate = 'February 10 2018';

    const investDateString = 'April 12 2018';
    const investDateStopString = 'June 12 2021';
    const matureDateString = 'April 12 2019';
    const matureDateStopString = 'June 12 2022';

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
          TYPE: bondInvest,
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
          TYPE: bondMature,
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
      'BMVBondTargetValue/12 Apr 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/12 Apr 2021/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 2, 'BondTargetValue', 'Sat Feb 10 2018', 1, -1);
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
  });

  it('bond 5yr rolling plan no cpi', () => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'June 1, 2031',
    };

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
          DATE: '1 Jan 2018',
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest5y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          RECURRENCE: '1y',
          STOP_DATE: '1 Jan 2025',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest4y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest3y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest2y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature5y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2024',
          RECURRENCE: '1y',
          STOP_DATE: '1 Jan 2030',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature4y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2023',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature3y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2022',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature2y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2021',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature1y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2020',
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '0', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    // log(`model ${JSON.stringify(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(374);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/01 Jan 2020/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/01 Jan 2021/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      2,
      'BMVBondTargetValue/01 Jan 2022/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      3,
      'BMVBondTargetValue/01 Jan 2023/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      4,
      'BMVBondTargetValue/01 Jan 2024/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      5,
      'BMVBondTargetValue/01 Jan 2025/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      6,
      'BMVBondTargetValue/01 Jan 2026/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      7,
      'BMVBondTargetValue/01 Jan 2027/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      8,
      'BMVBondTargetValue/01 Jan 2028/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      9,
      'BMVBondTargetValue/01 Jan 2029/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(evals, 10, 'BondTargetValue', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 11, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 13, 'BondTargetValue', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 14, 'Cash', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 15, 'Bond', 'Thu Feb 01 2018', 1000, -1);

    expectEvals(evals, 36, 'Cash', 'Tue Jan 01 2019', 1000, -1);
    expectEvals(evals, 37, 'Bond', 'Tue Jan 01 2019', 1000, -1);
    expectEvals(evals, 38, 'Cash', 'Tue Jan 01 2019', 990, -1);
    expectEvals(evals, 39, 'Bond', 'Tue Jan 01 2019', 1010, -1);
    expectEvals(evals, 40, 'Cash', 'Tue Jan 01 2019', 980, -1);
    expectEvals(evals, 41, 'Bond', 'Tue Jan 01 2019', 1020, -1);
    expectEvals(evals, 42, 'Cash', 'Tue Jan 01 2019', 970, -1);
    expectEvals(evals, 43, 'Bond', 'Tue Jan 01 2019', 1030, -1);
    expectEvals(evals, 44, 'Cash', 'Tue Jan 01 2019', 960, -1);
    expectEvals(evals, 45, 'Bond', 'Tue Jan 01 2019', 1040, -1);
    expectEvals(evals, 46, 'Cash', 'Tue Jan 01 2019', 950, -1);
    expectEvals(evals, 47, 'Bond', 'Tue Jan 01 2019', 1050, -1);
    expectEvals(evals, 48, 'Cash', 'Fri Feb 01 2019', 950, -1);
    expectEvals(evals, 49, 'Bond', 'Fri Feb 01 2019', 1050, -1);

    expectEvals(evals, 68, 'Cash', 'Sun Dec 01 2019', 950, -1);
    expectEvals(evals, 69, 'Bond', 'Sun Dec 01 2019', 1050, -1);
    expectEvals(evals, 70, 'Cash', 'Wed Jan 01 2020', 950, -1);
    expectEvals(evals, 71, 'Bond', 'Wed Jan 01 2020', 1050, -1);
    expectEvals(evals, 72, 'Cash', 'Wed Jan 01 2020', 940, -1);
    expectEvals(evals, 73, 'Bond', 'Wed Jan 01 2020', 1060, -1);
    expectEvals(evals, 74, 'Bond', 'Wed Jan 01 2020', 1050, -1);
    expectEvals(evals, 75, 'Cash', 'Wed Jan 01 2020', 950, -1);
    expectEvals(evals, 76, 'Cash', 'Sat Feb 01 2020', 950, -1);
    expectEvals(evals, 77, 'Bond', 'Sat Feb 01 2020', 1050, -1);

    expectEvals(evals, 96, 'Cash', 'Tue Dec 01 2020', 950, -1);
    expectEvals(evals, 97, 'Bond', 'Tue Dec 01 2020', 1050, -1);
    expectEvals(evals, 98, 'Cash', 'Fri Jan 01 2021', 950, -1);
    expectEvals(evals, 99, 'Bond', 'Fri Jan 01 2021', 1050, -1);
    expectEvals(evals, 100, 'Cash', 'Fri Jan 01 2021', 940, -1);
    expectEvals(evals, 101, 'Bond', 'Fri Jan 01 2021', 1060, -1);
    expectEvals(evals, 102, 'Bond', 'Fri Jan 01 2021', 1050, -1);
    expectEvals(evals, 103, 'Cash', 'Fri Jan 01 2021', 950, -1);
    expectEvals(evals, 104, 'Cash', 'Mon Feb 01 2021', 950, -1);
    expectEvals(evals, 105, 'Bond', 'Mon Feb 01 2021', 1050, -1);

    expectEvals(evals, 124, 'Cash', 'Wed Dec 01 2021', 950, -1);
    expectEvals(evals, 125, 'Bond', 'Wed Dec 01 2021', 1050, -1);
    expectEvals(evals, 126, 'Cash', 'Sat Jan 01 2022', 950, -1);
    expectEvals(evals, 127, 'Bond', 'Sat Jan 01 2022', 1050, -1);
    expectEvals(evals, 128, 'Cash', 'Sat Jan 01 2022', 940, -1);
    expectEvals(evals, 129, 'Bond', 'Sat Jan 01 2022', 1060, -1);
    expectEvals(evals, 130, 'Bond', 'Sat Jan 01 2022', 1050, -1);
    expectEvals(evals, 131, 'Cash', 'Sat Jan 01 2022', 950, -1);
    expectEvals(evals, 132, 'Cash', 'Tue Feb 01 2022', 950, -1);
    expectEvals(evals, 133, 'Bond', 'Tue Feb 01 2022', 1050, -1);

    expectEvals(evals, 152, 'Cash', 'Thu Dec 01 2022', 950, -1);
    expectEvals(evals, 153, 'Bond', 'Thu Dec 01 2022', 1050, -1);
    expectEvals(evals, 154, 'Cash', 'Sun Jan 01 2023', 950, -1);
    expectEvals(evals, 155, 'Bond', 'Sun Jan 01 2023', 1050, -1);
    expectEvals(evals, 156, 'Cash', 'Sun Jan 01 2023', 940, -1);
    expectEvals(evals, 157, 'Bond', 'Sun Jan 01 2023', 1060, -1);
    expectEvals(evals, 158, 'Bond', 'Sun Jan 01 2023', 1050, -1);
    expectEvals(evals, 159, 'Cash', 'Sun Jan 01 2023', 950, -1);
    expectEvals(evals, 160, 'Cash', 'Wed Feb 01 2023', 950, -1);
    expectEvals(evals, 161, 'Bond', 'Wed Feb 01 2023', 1050, -1);

    expectEvals(evals, 180, 'Cash', 'Fri Dec 01 2023', 950, -1);
    expectEvals(evals, 181, 'Bond', 'Fri Dec 01 2023', 1050, -1);
    expectEvals(evals, 182, 'Cash', 'Mon Jan 01 2024', 950, -1);
    expectEvals(evals, 183, 'Bond', 'Mon Jan 01 2024', 1050, -1);
    expectEvals(evals, 184, 'Cash', 'Mon Jan 01 2024', 940, -1);
    expectEvals(evals, 185, 'Bond', 'Mon Jan 01 2024', 1060, -1);
    expectEvals(evals, 186, 'Bond', 'Mon Jan 01 2024', 1050, -1);
    expectEvals(evals, 187, 'Cash', 'Mon Jan 01 2024', 950, -1);
    expectEvals(evals, 188, 'Cash', 'Thu Feb 01 2024', 950, -1);
    expectEvals(evals, 189, 'Bond', 'Thu Feb 01 2024', 1050, -1);

    expectEvals(evals, 208, 'Cash', 'Sun Dec 01 2024', 950, -1);
    expectEvals(evals, 209, 'Bond', 'Sun Dec 01 2024', 1050, -1);
    expectEvals(evals, 210, 'Cash', 'Wed Jan 01 2025', 950, -1);
    expectEvals(evals, 211, 'Bond', 'Wed Jan 01 2025', 1050, -1);
    expectEvals(evals, 212, 'Bond', 'Wed Jan 01 2025', 1040, -1);
    expectEvals(evals, 213, 'Cash', 'Wed Jan 01 2025', 960, -1);
    expectEvals(evals, 214, 'Cash', 'Sat Feb 01 2025', 960, -1);
    expectEvals(evals, 215, 'Bond', 'Sat Feb 01 2025', 1040, -1);

    expectEvals(evals, 234, 'Cash', 'Mon Dec 01 2025', 960, -1);
    expectEvals(evals, 235, 'Bond', 'Mon Dec 01 2025', 1040, -1);
    expectEvals(evals, 236, 'Cash', 'Thu Jan 01 2026', 960, -1);
    expectEvals(evals, 237, 'Bond', 'Thu Jan 01 2026', 1040, -1);
    expectEvals(evals, 238, 'Bond', 'Thu Jan 01 2026', 1030, -1);
    expectEvals(evals, 239, 'Cash', 'Thu Jan 01 2026', 970, -1);
    expectEvals(evals, 240, 'Cash', 'Sun Feb 01 2026', 970, -1);
    expectEvals(evals, 241, 'Bond', 'Sun Feb 01 2026', 1030, -1);

    expectEvals(evals, 260, 'Cash', 'Tue Dec 01 2026', 970, -1);
    expectEvals(evals, 261, 'Bond', 'Tue Dec 01 2026', 1030, -1);
    expectEvals(evals, 262, 'Cash', 'Fri Jan 01 2027', 970, -1);
    expectEvals(evals, 263, 'Bond', 'Fri Jan 01 2027', 1030, -1);
    expectEvals(evals, 264, 'Bond', 'Fri Jan 01 2027', 1020, -1);
    expectEvals(evals, 265, 'Cash', 'Fri Jan 01 2027', 980, -1);
    expectEvals(evals, 266, 'Cash', 'Mon Feb 01 2027', 980, -1);
    expectEvals(evals, 267, 'Bond', 'Mon Feb 01 2027', 1020, -1);

    expectEvals(evals, 286, 'Cash', 'Wed Dec 01 2027', 980, -1);
    expectEvals(evals, 287, 'Bond', 'Wed Dec 01 2027', 1020, -1);
    expectEvals(evals, 288, 'Cash', 'Sat Jan 01 2028', 980, -1);
    expectEvals(evals, 289, 'Bond', 'Sat Jan 01 2028', 1020, -1);
    expectEvals(evals, 290, 'Bond', 'Sat Jan 01 2028', 1010, -1);
    expectEvals(evals, 291, 'Cash', 'Sat Jan 01 2028', 990, -1);
    expectEvals(evals, 292, 'Cash', 'Tue Feb 01 2028', 990, -1);
    expectEvals(evals, 293, 'Bond', 'Tue Feb 01 2028', 1010, -1);

    expectEvals(evals, 312, 'Cash', 'Fri Dec 01 2028', 990, -1);
    expectEvals(evals, 313, 'Bond', 'Fri Dec 01 2028', 1010, -1);
    expectEvals(evals, 314, 'Cash', 'Mon Jan 01 2029', 990, -1);
    expectEvals(evals, 315, 'Bond', 'Mon Jan 01 2029', 1010, -1);
    expectEvals(evals, 316, 'Bond', 'Mon Jan 01 2029', 1000, -1);
    expectEvals(evals, 317, 'Cash', 'Mon Jan 01 2029', 1000, -1);
    expectEvals(evals, 318, 'Cash', 'Thu Feb 01 2029', 1000, -1);
    expectEvals(evals, 319, 'Bond', 'Thu Feb 01 2029', 1000, -1);
    expectEvals(evals, 320, 'Cash', 'Thu Mar 01 2029', 1000, -1);
    expectEvals(evals, 321, 'Bond', 'Thu Mar 01 2029', 1000, -1);

    expectEvals(evals, 372, 'Cash', 'Thu May 01 2031', 1000, -1);
    expectEvals(evals, 373, 'Bond', 'Thu May 01 2031', 1000, -1);
  });

  it('bond 5yr rolling plan with target values cpi', () => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'June 1, 2031',
    };

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: true,
        },
        {
          ...simpleAsset,
          NAME: 'CPI.',
          START: '1 Jan 2018',
          VALUE: '1',
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
          DATE: '1 Jan 2018',
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest5y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          RECURRENCE: '1y',
          STOP_DATE: '1 Jan 2025',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest4y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest3y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest2y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature5y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2024',
          RECURRENCE: '1y',
          STOP_DATE: '1 Jan 2030',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature4y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2023',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature3y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2022',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature2y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2021',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature1y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2020',
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(535);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/01 Jan 2020/cpi',
      'Fri Dec 01 2017',
      1.25,
      2,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/01 Jan 2021/cpi',
      'Fri Dec 01 2017',
      1.4,
      2,
    );
    expectEvals(
      evals,
      2,
      'BMVBondTargetValue/01 Jan 2022/cpi',
      'Fri Dec 01 2017',
      1.57,
      2,
    );
    expectEvals(
      evals,
      3,
      'BMVBondTargetValue/01 Jan 2023/cpi',
      'Fri Dec 01 2017',
      1.76,
      2,
    );
    expectEvals(
      evals,
      4,
      'BMVBondTargetValue/01 Jan 2024/cpi',
      'Fri Dec 01 2017',
      1.97,
      2,
    );
    expectEvals(
      evals,
      5,
      'BMVBondTargetValue/01 Jan 2025/cpi',
      'Fri Dec 01 2017',
      2.21,
      2,
    );
    expectEvals(
      evals,
      6,
      'BMVBondTargetValue/01 Jan 2026/cpi',
      'Fri Dec 01 2017',
      2.48,
      2,
    );
    expectEvals(
      evals,
      7,
      'BMVBondTargetValue/01 Jan 2027/cpi',
      'Fri Dec 01 2017',
      2.77,
      2,
    );
    expectEvals(
      evals,
      8,
      'BMVBondTargetValue/01 Jan 2028/cpi',
      'Fri Dec 01 2017',
      3.11,
      2,
    );
    expectEvals(
      evals,
      9,
      'BMVBondTargetValue/01 Jan 2029/cpi',
      'Fri Dec 01 2017',
      3.48,
      2,
    );
    expectEvals(evals, 10, 'BondTargetValue', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 11, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 13, 'CPI.', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 14, 'BondTargetValue', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 16, 'Bond', 'Thu Feb 01 2018', 1000, -1);

    expectEvals(evals, 48, 'Cash', 'Tue Jan 01 2019', 1000, -1);
    expectEvals(evals, 49, 'Bond', 'Tue Jan 01 2019', 1000, -1);
    expectEvals(evals, 50, 'CPI.', 'Tue Jan 01 2019', 1.12, 2);
    expectEvals(evals, 51, 'Cash', 'Tue Jan 01 2019', 987.46, 2); // take out 12.54 ~ 10 * 1.25  for 2020
    expectEvals(evals, 52, 'Bond', 'Tue Jan 01 2019', 1012.54, 2); // invest   12.54
    expectEvals(evals, 53, 'Cash', 'Tue Jan 01 2019', 973.41, 2); // take out 14.05 ~ 10 * 1.40  for 2021
    expectEvals(evals, 54, 'Bond', 'Tue Jan 01 2019', 1026.59, 2); // invest   14.05
    expectEvals(evals, 55, 'Cash', 'Tue Jan 01 2019', 957.67, 2); // take out 15.74 ~ 10 * 1.57  for 2022
    expectEvals(evals, 56, 'Bond', 'Tue Jan 01 2019', 1042.33, 2); // invest   15.74
    expectEvals(evals, 57, 'Cash', 'Tue Jan 01 2019', 940.05, 2); // take out 17.62 ~ 10 * 1.76  for 2023
    expectEvals(evals, 58, 'Bond', 'Tue Jan 01 2019', 1059.95, 2); // invest   17.62
    expectEvals(evals, 59, 'Cash', 'Tue Jan 01 2019', 920.31, 2); // take out 19.74 ~ 10 * 1.97  for 2024
    expectEvals(evals, 60, 'Bond', 'Tue Jan 01 2019', 1079.69, 2); // invest   19.74
    expectEvals(evals, 61, 'Cash', 'Fri Feb 01 2019', 920.31, 2);
    expectEvals(evals, 62, 'Bond', 'Fri Feb 01 2019', 1079.69, 2);

    expectEvals(evals, 94, 'Cash', 'Wed Jan 01 2020', 920.31, 2);
    expectEvals(evals, 95, 'Bond', 'Wed Jan 01 2020', 1079.69, 2);
    expectEvals(evals, 96, 'CPI.', 'Wed Jan 01 2020', 1.25, 2); // matches the setting value
    expectEvals(evals, 97, 'Cash', 'Wed Jan 01 2020', 898.2, 2); // take out 22.11 ~ 10 * 2.21  for 2025
    expectEvals(evals, 98, 'Bond', 'Wed Jan 01 2020', 1101.8, 2); // invest   22.11
    expectEvals(evals, 99, 'Bond', 'Wed Jan 01 2020', 1089.25, 2); // release 12.55 ~ 10 * 1.25  for 2020
    expectEvals(evals, 100, 'Cash', 'Wed Jan 01 2020', 910.75, 2); // gain    12.55
    expectEvals(evals, 101, 'Cash', 'Sat Feb 01 2020', 910.75, 2);
    expectEvals(evals, 102, 'Bond', 'Sat Feb 01 2020', 1089.25, 2);

    expectEvals(evals, 134, 'Cash', 'Fri Jan 01 2021', 910.75, 2);
    expectEvals(evals, 135, 'Bond', 'Fri Jan 01 2021', 1089.25, 2);
    expectEvals(evals, 136, 'CPI.', 'Fri Jan 01 2021', 1.4, 2); // matches the setting value
    expectEvals(evals, 137, 'Cash', 'Fri Jan 01 2021', 885.99, 2); // take out 24.76 ~ 10 * 2.48 for 2026
    expectEvals(evals, 138, 'Bond', 'Fri Jan 01 2021', 1114.01, 2); // invest   24.76
    expectEvals(evals, 139, 'Bond', 'Fri Jan 01 2021', 1099.96, 2); // release 14.05 ~ 10 * 1.40  for 2021
    expectEvals(evals, 140, 'Cash', 'Fri Jan 01 2021', 900.04, 2); // gain    14.05
    expectEvals(evals, 141, 'Cash', 'Mon Feb 01 2021', 900.04, 2);
    expectEvals(evals, 142, 'Bond', 'Mon Feb 01 2021', 1099.96, 2);

    expectEvals(evals, 174, 'Cash', 'Sat Jan 01 2022', 900.04, 2);
    expectEvals(evals, 175, 'Bond', 'Sat Jan 01 2022', 1099.96, 2);
    expectEvals(evals, 176, 'CPI.', 'Sat Jan 01 2022', 1.57, 2); // matches the setting value
    expectEvals(evals, 177, 'Cash', 'Sat Jan 01 2022', 872.31, 2);
    expectEvals(evals, 178, 'Bond', 'Sat Jan 01 2022', 1127.69, 2);
    expectEvals(evals, 179, 'Bond', 'Sat Jan 01 2022', 1111.96, 2);
    expectEvals(evals, 180, 'Cash', 'Sat Jan 01 2022', 888.04, 2);
    expectEvals(evals, 181, 'Cash', 'Tue Feb 01 2022', 888.04, 2);
    expectEvals(evals, 182, 'Bond', 'Tue Feb 01 2022', 1111.96, 2);

    expectEvals(evals, 214, 'Cash', 'Sun Jan 01 2023', 888.04, 2);
    expectEvals(evals, 215, 'Bond', 'Sun Jan 01 2023', 1111.96, 2);
    expectEvals(evals, 216, 'CPI.', 'Sun Jan 01 2023', 1.76, 2); // matches the setting value
    expectEvals(evals, 217, 'Cash', 'Sun Jan 01 2023', 856.98, 2);
    expectEvals(evals, 218, 'Bond', 'Sun Jan 01 2023', 1143.02, 2);
    expectEvals(evals, 219, 'Bond', 'Sun Jan 01 2023', 1125.39, 2);
    expectEvals(evals, 220, 'Cash', 'Sun Jan 01 2023', 874.61, 2);
    expectEvals(evals, 221, 'Cash', 'Wed Feb 01 2023', 874.61, 2);
    expectEvals(evals, 222, 'Bond', 'Wed Feb 01 2023', 1125.39, 2);

    expectEvals(evals, 254, 'Cash', 'Mon Jan 01 2024', 874.61, 2);
    expectEvals(evals, 255, 'Bond', 'Mon Jan 01 2024', 1125.39, 2);
    expectEvals(evals, 256, 'CPI.', 'Mon Jan 01 2024', 1.97, 2); // matches the setting value
    expectEvals(evals, 257, 'Cash', 'Mon Jan 01 2024', 839.82, 2);
    expectEvals(evals, 258, 'Bond', 'Mon Jan 01 2024', 1160.18, 2);
    expectEvals(evals, 259, 'Bond', 'Mon Jan 01 2024', 1140.44, 2);
    expectEvals(evals, 260, 'Cash', 'Mon Jan 01 2024', 859.56, 2);
    expectEvals(evals, 261, 'Cash', 'Thu Feb 01 2024', 859.56, 2);
    expectEvals(evals, 262, 'Bond', 'Thu Feb 01 2024', 1140.44, 2);

    expectEvals(evals, 294, 'Cash', 'Wed Jan 01 2025', 859.56, 2);
    expectEvals(evals, 295, 'Bond', 'Wed Jan 01 2025', 1140.44, 2);
    expectEvals(evals, 296, 'CPI.', 'Wed Jan 01 2025', 2.21, 2); // matches the setting value
    expectEvals(evals, 297, 'Bond', 'Wed Jan 01 2025', 1118.33, 2);
    expectEvals(evals, 298, 'Cash', 'Wed Jan 01 2025', 881.67, 2);
    expectEvals(evals, 299, 'Cash', 'Sat Feb 01 2025', 881.67, 2);
    expectEvals(evals, 300, 'Bond', 'Sat Feb 01 2025', 1118.33, 2);

    expectEvals(evals, 332, 'Cash', 'Thu Jan 01 2026', 881.67, 2);
    expectEvals(evals, 333, 'Bond', 'Thu Jan 01 2026', 1118.33, 2);
    expectEvals(evals, 334, 'CPI.', 'Thu Jan 01 2026', 2.48, 2); // matches the setting value
    expectEvals(evals, 335, 'Bond', 'Thu Jan 01 2026', 1093.57, 2);
    expectEvals(evals, 336, 'Cash', 'Thu Jan 01 2026', 906.43, 2);
    expectEvals(evals, 337, 'Cash', 'Sun Feb 01 2026', 906.43, 2);
    expectEvals(evals, 338, 'Bond', 'Sun Feb 01 2026', 1093.57, 2);

    expectEvals(evals, 370, 'Cash', 'Fri Jan 01 2027', 906.43, 2);
    expectEvals(evals, 371, 'Bond', 'Fri Jan 01 2027', 1093.57, 2);
    expectEvals(evals, 372, 'CPI.', 'Fri Jan 01 2027', 2.77, 2); // matches the setting value
    expectEvals(evals, 373, 'Bond', 'Fri Jan 01 2027', 1065.84, 2);
    expectEvals(evals, 374, 'Cash', 'Fri Jan 01 2027', 934.16, 2);
    expectEvals(evals, 375, 'Cash', 'Mon Feb 01 2027', 934.16, 2);
    expectEvals(evals, 376, 'Bond', 'Mon Feb 01 2027', 1065.84, 2);

    expectEvals(evals, 408, 'Cash', 'Sat Jan 01 2028', 934.16, 2);
    expectEvals(evals, 409, 'Bond', 'Sat Jan 01 2028', 1065.84, 2);
    expectEvals(evals, 410, 'CPI.', 'Sat Jan 01 2028', 3.11, 2); // matches the setting value
    expectEvals(evals, 411, 'Bond', 'Sat Jan 01 2028', 1034.79, 2);
    expectEvals(evals, 412, 'Cash', 'Sat Jan 01 2028', 965.21, 2);
    expectEvals(evals, 413, 'Cash', 'Tue Feb 01 2028', 965.21, 2);
    expectEvals(evals, 414, 'Bond', 'Tue Feb 01 2028', 1034.79, 2);

    expectEvals(evals, 446, 'Cash', 'Mon Jan 01 2029', 965.21, 2);
    expectEvals(evals, 447, 'Bond', 'Mon Jan 01 2029', 1034.79, 2);
    expectEvals(evals, 448, 'CPI.', 'Mon Jan 01 2029', 3.48, 2); // matches the setting value
    expectEvals(evals, 449, 'Bond', 'Mon Jan 01 2029', 1000, -1);
    expectEvals(evals, 450, 'Cash', 'Mon Jan 01 2029', 1000, -1); // Cash does not grow, Bond does not grow, total effect = 0
  });

  it('bond 5yr rolling plan with cpi', () => {
    const roi = {
      start: 'Dec 1, 2017',
      end: 'June 1, 2031',
    };

    const model: ModelData = {
      ...emptyModel,
      assets: [
        {
          ...simpleAsset,
          NAME: 'Cash',
          START: 'January 1 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false, // grows more than bond
        },
        {
          ...simpleAsset,
          NAME: 'CPI.',
          START: '1 Jan 2018',
          VALUE: '1000',
          GROWTH: '0.0',
          CPI_IMMUNE: false, // grows like cash
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
          DATE: '1 Jan 2018',
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest5y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          RECURRENCE: '1y',
          STOP_DATE: '1 Jan 2025',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest4y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest3y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest2y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondInvest1y',
          FROM: 'Cash',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Bond',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2019',
          TYPE: bondInvest,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature5y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2024',
          RECURRENCE: '1y',
          STOP_DATE: '1 Jan 2030',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature4y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2023',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature3y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2022',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature2y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2021',
          TYPE: bondMature,
        },
        {
          ...simpleTransaction,
          NAME: 'BondMature1y',
          FROM: 'Bond',
          FROM_VALUE: 'BMVBondTargetValue',
          TO: 'Cash',
          TO_VALUE: '1.0',
          TO_ABSOLUTE: false,
          DATE: '1 Jan 2020',
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    // log(`model JSON ${JSON.stringify(model)}`);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(535);
    expectEvals(
      evals,
      0,
      'BMVBondTargetValue/01 Jan 2020/cpi',
      'Fri Dec 01 2017',
      1.25,
      2,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/01 Jan 2021/cpi',
      'Fri Dec 01 2017',
      1.4,
      2,
    );
    expectEvals(
      evals,
      2,
      'BMVBondTargetValue/01 Jan 2022/cpi',
      'Fri Dec 01 2017',
      1.57,
      2,
    );
    expectEvals(
      evals,
      3,
      'BMVBondTargetValue/01 Jan 2023/cpi',
      'Fri Dec 01 2017',
      1.76,
      2,
    );
    expectEvals(
      evals,
      4,
      'BMVBondTargetValue/01 Jan 2024/cpi',
      'Fri Dec 01 2017',
      1.97,
      2,
    );
    expectEvals(
      evals,
      5,
      'BMVBondTargetValue/01 Jan 2025/cpi',
      'Fri Dec 01 2017',
      2.21,
      2,
    );
    expectEvals(
      evals,
      6,
      'BMVBondTargetValue/01 Jan 2026/cpi',
      'Fri Dec 01 2017',
      2.48,
      2,
    );
    expectEvals(
      evals,
      7,
      'BMVBondTargetValue/01 Jan 2027/cpi',
      'Fri Dec 01 2017',
      2.77,
      2,
    );
    expectEvals(
      evals,
      8,
      'BMVBondTargetValue/01 Jan 2028/cpi',
      'Fri Dec 01 2017',
      3.11,
      2,
    );
    expectEvals(
      evals,
      9,
      'BMVBondTargetValue/01 Jan 2029/cpi',
      'Fri Dec 01 2017',
      3.48,
      2,
    );
    expectEvals(evals, 10, 'BondTargetValue', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 11, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 13, 'CPI.', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 14, 'BondTargetValue', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Feb 01 2018', 1009.49, 2);
    expectEvals(evals, 16, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 17, 'CPI.', 'Thu Feb 01 2018', 1009.49, 2);

    expectEvals(evals, 529, 'Cash', 'Tue Apr 01 2031', 4222.84, 2);
    expectEvals(evals, 530, 'Bond', 'Tue Apr 01 2031', 1000, -1);
    expectEvals(evals, 531, 'CPI.', 'Tue Apr 01 2031', 4488.89, 2);
    expectEvals(evals, 532, 'Cash', 'Thu May 01 2031', 4262.91, 2); // somewhat explained below
    expectEvals(evals, 533, 'Bond', 'Thu May 01 2031', 1000, -1);
    expectEvals(evals, 534, 'CPI.', 'Thu May 01 2031', 4531.48, 2); // = 1000*1.12^(160/12)
    // cash is worth less even though all bonds matured
    // because while money was in bonds, it was not growing

    /*
    // Split cash into post destined for various bonds etc.
    // initial amounts chosen so that there's a pre-growth compensating for
    // non-grwoth whilst in a bond, so that at end of bond time period,
    // the pot has the required value (10 scaled up without any growth gap)
    // Scale each pot over 160 months (for part never going into a bond)
    // or scale by (160 - length of bond in months).
    Bond
    1yr	  2yr  	3yr  	4yr  	5yr 1	5yr 2	5yr 3	5yr 4	5yr 5	5yr 6	rest
    Initial value
    11.20	12.54	14.05	15.74	17.62	17.62	17.62	17.62	17.62	17.62	840.73
    Number of months of growth
    148	  136	  124	  112	  100	  100	  100	  100	  100	  100	  160
    Add it all up
    11.20 * (1.12)^(1/12)^148 + 12.54 * (1.12)^(1/12)^148 +... = 4262.91
    */
  });
});
