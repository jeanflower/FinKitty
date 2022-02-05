import {
  revalueSetting,
  cpi,
  constType,
  bondMature,
  bondInvest,
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

  it('bond invest once mature once', done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
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

  it(`bond not enough cash to invest so don't mature`, done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
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

  it('bond zero cpi', done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
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

  it('bond roi stops before bond matures', done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
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

  it('bond repeat overlap', done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Sun May 12 2019/cpi',
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

  it('bond repeat cash too short for both', done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Sun May 12 2019/cpi',
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

  it('bond repeat disjoint', done => {
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
      'BMVBondTargetValue/Fri Apr 12 2019/cpi',
      'Fri Dec 01 2017',
      1,
      -1,
    );
    expectEvals(
      evals,
      1,
      'BMVBondTargetValue/Mon Apr 12 2021/cpi',
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

  it('bond 5yr rolling plan no cpi', done => {
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
          DATE: '2018',
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
          DATE: '2019',
          RECURRENCE: '1y',
          STOP_DATE: '2025',
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
          DATE: '2019',
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
          DATE: '2019',
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
          DATE: '2019',
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
          DATE: '2019',
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
          DATE: '2024',
          RECURRENCE: '1y',
          STOP_DATE: '2030',
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
          DATE: '2023',
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
          DATE: '2022',
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
          DATE: '2021',
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
          DATE: '2020',
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

    expect(evals.length).toBe(374);
    expectEvals(evals, 0, 'BMVBondTargetValue/Wed Jan 01 2020/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 1, 'BMVBondTargetValue/Fri Jan 01 2021/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 2, 'BMVBondTargetValue/Sat Jan 01 2022/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 3, 'BMVBondTargetValue/Sun Jan 01 2023/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 4, 'BMVBondTargetValue/Mon Jan 01 2024/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 5, 'BMVBondTargetValue/Wed Jan 01 2025/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 6, 'BMVBondTargetValue/Thu Jan 01 2026/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 7, 'BMVBondTargetValue/Fri Jan 01 2027/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 8, 'BMVBondTargetValue/Sat Jan 01 2028/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 9, 'BMVBondTargetValue/Mon Jan 01 2029/cpi', 'Fri Dec 01 2017', 1, -1);
    expectEvals(evals, 10, 'BondTargetValue', 'Fri Jan 01 2021', 1, -1);
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

    done();
  });

  it('bond 5yr rolling plan with cpi', done => {
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
          NAME: 'CPI.',
          START: '2018',
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
          DATE: '2018',
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
          DATE: '2019',
          RECURRENCE: '1y',
          STOP_DATE: '2025',
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
          DATE: '2019',
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
          DATE: '2019',
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
          DATE: '2019',
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
          DATE: '2019',
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
          DATE: '2024',
          RECURRENCE: '1y',
          STOP_DATE: '2030',
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
          DATE: '2023',
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
          DATE: '2022',
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
          DATE: '2021',
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
          DATE: '2020',
          TYPE: bondMature,
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };
    setSetting(model.settings, cpi, '12', constType);
    setSetting(model.settings, 'BondTargetValue', '1', constType);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    printTestCodeForEvals(evals);

    expect(evals.length).toBe(535);
    expectEvals(evals, 0, 'BMVBondTargetValue/Wed Jan 01 2020/cpi', 'Fri Dec 01 2017', 1.25, 2);
    expectEvals(evals, 1, 'BMVBondTargetValue/Fri Jan 01 2021/cpi', 'Fri Dec 01 2017', 1.40, 2);
    expectEvals(evals, 2, 'BMVBondTargetValue/Sat Jan 01 2022/cpi', 'Fri Dec 01 2017', 1.57, 2);
    expectEvals(evals, 3, 'BMVBondTargetValue/Sun Jan 01 2023/cpi', 'Fri Dec 01 2017', 1.76, 2);
    expectEvals(evals, 4, 'BMVBondTargetValue/Mon Jan 01 2024/cpi', 'Fri Dec 01 2017', 1.97, 2);
    expectEvals(evals, 5, 'BMVBondTargetValue/Wed Jan 01 2025/cpi', 'Fri Dec 01 2017', 2.21, 2);
    expectEvals(evals, 6, 'BMVBondTargetValue/Thu Jan 01 2026/cpi', 'Fri Dec 01 2017', 2.48, 2);
    expectEvals(evals, 7, 'BMVBondTargetValue/Fri Jan 01 2027/cpi', 'Fri Dec 01 2017', 2.77, 2);
    expectEvals(evals, 8, 'BMVBondTargetValue/Sat Jan 01 2028/cpi', 'Fri Dec 01 2017', 3.11, 2);
    expectEvals(evals, 9, 'BMVBondTargetValue/Mon Jan 01 2029/cpi', 'Fri Dec 01 2017', 3.48, 2);
    expectEvals(evals, 10, 'BondTargetValue', 'Fri Jan 01 2021', 1, -1);
    expectEvals(evals, 11, 'Cash', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 12, 'Bond', 'Mon Jan 01 2018', 1000, -1);
    expectEvals(evals, 13, 'CPI.', 'Mon Jan 01 2018', 1, -1);
    expectEvals(evals, 14, 'BondTargetValue', 'Mon Jan 01 2018', 10, -1);
    expectEvals(evals, 15, 'Cash', 'Thu Feb 01 2018', 1009.49, 2);
    expectEvals(evals, 16, 'Bond', 'Thu Feb 01 2018', 1000, -1);
    expectEvals(evals, 17, 'CPI.', 'Thu Feb 01 2018', 1.01, 2);
    expectEvals(evals, 18, 'Cash', 'Thu Mar 01 2018', 1019.07, 2);
    expectEvals(evals, 19, 'Bond', 'Thu Mar 01 2018', 1000, -1);
    expectEvals(evals, 20, 'CPI.', 'Thu Mar 01 2018', 1.02, 2);
    expectEvals(evals, 21, 'Cash', 'Sun Apr 01 2018', 1028.74, 2);
    expectEvals(evals, 22, 'Bond', 'Sun Apr 01 2018', 1000, -1);
    expectEvals(evals, 23, 'CPI.', 'Sun Apr 01 2018', 1.03, 2);
    expectEvals(evals, 24, 'Cash', 'Tue May 01 2018', 1038.50, 2);
    expectEvals(evals, 25, 'Bond', 'Tue May 01 2018', 1000, -1);
    expectEvals(evals, 26, 'CPI.', 'Tue May 01 2018', 1.04, 2);
    expectEvals(evals, 27, 'Cash', 'Fri Jun 01 2018', 1048.35, 2);
    expectEvals(evals, 28, 'Bond', 'Fri Jun 01 2018', 1000, -1);
    expectEvals(evals, 29, 'CPI.', 'Fri Jun 01 2018', 1.05, 2);
    expectEvals(evals, 30, 'Cash', 'Sun Jul 01 2018', 1058.30, 2);
    expectEvals(evals, 31, 'Bond', 'Sun Jul 01 2018', 1000, -1);
    expectEvals(evals, 32, 'CPI.', 'Sun Jul 01 2018', 1.06, 2);
    expectEvals(evals, 33, 'Cash', 'Wed Aug 01 2018', 1068.34, 2);
    expectEvals(evals, 34, 'Bond', 'Wed Aug 01 2018', 1000, -1);
    expectEvals(evals, 35, 'CPI.', 'Wed Aug 01 2018', 1.07, 2);
    expectEvals(evals, 36, 'Cash', 'Sat Sep 01 2018', 1078.48, 2);
    expectEvals(evals, 37, 'Bond', 'Sat Sep 01 2018', 1000, -1);
    expectEvals(evals, 38, 'CPI.', 'Sat Sep 01 2018', 1.08, 2);
    expectEvals(evals, 39, 'Cash', 'Mon Oct 01 2018', 1088.71, 2);
    expectEvals(evals, 40, 'Bond', 'Mon Oct 01 2018', 1000, -1);
    expectEvals(evals, 41, 'CPI.', 'Mon Oct 01 2018', 1.09, 2);
    expectEvals(evals, 42, 'Cash', 'Thu Nov 01 2018', 1099.04, 2);
    expectEvals(evals, 43, 'Bond', 'Thu Nov 01 2018', 1000, -1);
    expectEvals(evals, 44, 'CPI.', 'Thu Nov 01 2018', 1.10, 2);
    expectEvals(evals, 45, 'Cash', 'Sat Dec 01 2018', 1109.47, 2);
    expectEvals(evals, 46, 'Bond', 'Sat Dec 01 2018', 1000, -1);
    expectEvals(evals, 47, 'CPI.', 'Sat Dec 01 2018', 1.11, 2);
    expectEvals(evals, 48, 'Cash', 'Tue Jan 01 2019', 1120.00, 2);
    expectEvals(evals, 49, 'Bond', 'Tue Jan 01 2019', 1000, -1);
    expectEvals(evals, 50, 'CPI.', 'Tue Jan 01 2019', 1.12, 2);
    expectEvals(evals, 51, 'Cash', 'Tue Jan 01 2019', 1107.46, 2); // = 1130 - 22.54?
    expectEvals(evals, 52, 'Bond', 'Tue Jan 01 2019', 1012.54, 2); // adds 12.54?
    expectEvals(evals, 53, 'Cash', 'Tue Jan 01 2019', 1093.41, 2);
    expectEvals(evals, 54, 'Bond', 'Tue Jan 01 2019', 1026.59, 2);
    expectEvals(evals, 55, 'Cash', 'Tue Jan 01 2019', 1077.67, 2);
    expectEvals(evals, 56, 'Bond', 'Tue Jan 01 2019', 1042.33, 2);
    expectEvals(evals, 57, 'Cash', 'Tue Jan 01 2019', 1060.05, 2);
    expectEvals(evals, 58, 'Bond', 'Tue Jan 01 2019', 1059.95, 2);
    expectEvals(evals, 59, 'Cash', 'Tue Jan 01 2019', 1040.31, 2);
    expectEvals(evals, 60, 'Bond', 'Tue Jan 01 2019', 1079.69, 2);
    expectEvals(evals, 61, 'Cash', 'Fri Feb 01 2019', 1050.18, 2);
    expectEvals(evals, 62, 'Bond', 'Fri Feb 01 2019', 1079.69, 2);
    expectEvals(evals, 63, 'CPI.', 'Fri Feb 01 2019', 1.13, 2);
    expectEvals(evals, 64, 'Cash', 'Fri Mar 01 2019', 1060.15, 2);
    expectEvals(evals, 65, 'Bond', 'Fri Mar 01 2019', 1079.69, 2);
    expectEvals(evals, 66, 'CPI.', 'Fri Mar 01 2019', 1.14, 2);
    expectEvals(evals, 67, 'Cash', 'Mon Apr 01 2019', 1070.21, 2);
    expectEvals(evals, 68, 'Bond', 'Mon Apr 01 2019', 1079.69, 2);
    expectEvals(evals, 69, 'CPI.', 'Mon Apr 01 2019', 1.15, 2);
    expectEvals(evals, 70, 'Cash', 'Wed May 01 2019', 1080.36, 2);
    expectEvals(evals, 71, 'Bond', 'Wed May 01 2019', 1079.69, 2);
    expectEvals(evals, 72, 'CPI.', 'Wed May 01 2019', 1.16, 2);
    expectEvals(evals, 73, 'Cash', 'Sat Jun 01 2019', 1090.61, 2);
    expectEvals(evals, 74, 'Bond', 'Sat Jun 01 2019', 1079.69, 2);
    expectEvals(evals, 75, 'CPI.', 'Sat Jun 01 2019', 1.17, 2);
    expectEvals(evals, 76, 'Cash', 'Mon Jul 01 2019', 1100.96, 2);
    expectEvals(evals, 77, 'Bond', 'Mon Jul 01 2019', 1079.69, 2);
    expectEvals(evals, 78, 'CPI.', 'Mon Jul 01 2019', 1.19, 2);
    expectEvals(evals, 79, 'Cash', 'Thu Aug 01 2019', 1111.41, 2);
    expectEvals(evals, 80, 'Bond', 'Thu Aug 01 2019', 1079.69, 2);
    expectEvals(evals, 81, 'CPI.', 'Thu Aug 01 2019', 1.20, 2);
    expectEvals(evals, 82, 'Cash', 'Sun Sep 01 2019', 1121.95, 2);
    expectEvals(evals, 83, 'Bond', 'Sun Sep 01 2019', 1079.69, 2);
    expectEvals(evals, 84, 'CPI.', 'Sun Sep 01 2019', 1.21, 2);
    expectEvals(evals, 85, 'Cash', 'Tue Oct 01 2019', 1132.60, 2);
    expectEvals(evals, 86, 'Bond', 'Tue Oct 01 2019', 1079.69, 2);
    expectEvals(evals, 87, 'CPI.', 'Tue Oct 01 2019', 1.22, 2);
    expectEvals(evals, 88, 'Cash', 'Fri Nov 01 2019', 1143.35, 2);
    expectEvals(evals, 89, 'Bond', 'Fri Nov 01 2019', 1079.69, 2);
    expectEvals(evals, 90, 'CPI.', 'Fri Nov 01 2019', 1.23, 2);
    expectEvals(evals, 91, 'Cash', 'Sun Dec 01 2019', 1154.20, 2);
    expectEvals(evals, 92, 'Bond', 'Sun Dec 01 2019', 1079.69, 2);
    expectEvals(evals, 93, 'CPI.', 'Sun Dec 01 2019', 1.24, 2);
    expectEvals(evals, 94, 'Cash', 'Wed Jan 01 2020', 1165.15, 2);
    expectEvals(evals, 95, 'Bond', 'Wed Jan 01 2020', 1079.69, 2);
    expectEvals(evals, 96, 'CPI.', 'Wed Jan 01 2020', 1.25, 2); // matches the setting value
    expectEvals(evals, 97, 'Cash', 'Wed Jan 01 2020', 1143.04, 2);
    expectEvals(evals, 98, 'Bond', 'Wed Jan 01 2020', 1101.80, 2);
    expectEvals(evals, 99, 'Bond', 'Wed Jan 01 2020', 1089.25, 2);
    expectEvals(evals, 100, 'Cash', 'Wed Jan 01 2020', 1155.58, 2);
    expectEvals(evals, 101, 'Cash', 'Sat Feb 01 2020', 1166.55, 2);
    expectEvals(evals, 102, 'Bond', 'Sat Feb 01 2020', 1089.25, 2);
    expectEvals(evals, 103, 'CPI.', 'Sat Feb 01 2020', 1.27, 2);
    expectEvals(evals, 104, 'Cash', 'Sun Mar 01 2020', 1177.62, 2);
    expectEvals(evals, 105, 'Bond', 'Sun Mar 01 2020', 1089.25, 2);
    expectEvals(evals, 106, 'CPI.', 'Sun Mar 01 2020', 1.28, 2);
    expectEvals(evals, 107, 'Cash', 'Wed Apr 01 2020', 1188.79, 2);
    expectEvals(evals, 108, 'Bond', 'Wed Apr 01 2020', 1089.25, 2);
    expectEvals(evals, 109, 'CPI.', 'Wed Apr 01 2020', 1.29, 2);
    expectEvals(evals, 110, 'Cash', 'Fri May 01 2020', 1200.07, 2);
    expectEvals(evals, 111, 'Bond', 'Fri May 01 2020', 1089.25, 2);
    expectEvals(evals, 112, 'CPI.', 'Fri May 01 2020', 1.30, 2);
    expectEvals(evals, 113, 'Cash', 'Mon Jun 01 2020', 1211.46, 2);
    expectEvals(evals, 114, 'Bond', 'Mon Jun 01 2020', 1089.25, 2);
    expectEvals(evals, 115, 'CPI.', 'Mon Jun 01 2020', 1.32, 2);
    expectEvals(evals, 116, 'Cash', 'Wed Jul 01 2020', 1222.96, 2);
    expectEvals(evals, 117, 'Bond', 'Wed Jul 01 2020', 1089.25, 2);
    expectEvals(evals, 118, 'CPI.', 'Wed Jul 01 2020', 1.33, 2);
    expectEvals(evals, 119, 'Cash', 'Sat Aug 01 2020', 1234.56, 2);
    expectEvals(evals, 120, 'Bond', 'Sat Aug 01 2020', 1089.25, 2);
    expectEvals(evals, 121, 'CPI.', 'Sat Aug 01 2020', 1.34, 2);
    expectEvals(evals, 122, 'Cash', 'Tue Sep 01 2020', 1246.27, 2);
    expectEvals(evals, 123, 'Bond', 'Tue Sep 01 2020', 1089.25, 2);
    expectEvals(evals, 124, 'CPI.', 'Tue Sep 01 2020', 1.35, 2);
    expectEvals(evals, 125, 'Cash', 'Thu Oct 01 2020', 1258.10, 2);
    expectEvals(evals, 126, 'Bond', 'Thu Oct 01 2020', 1089.25, 2);
    expectEvals(evals, 127, 'CPI.', 'Thu Oct 01 2020', 1.37, 2);
    expectEvals(evals, 128, 'Cash', 'Sun Nov 01 2020', 1270.04, 2);
    expectEvals(evals, 129, 'Bond', 'Sun Nov 01 2020', 1089.25, 2);
    expectEvals(evals, 130, 'CPI.', 'Sun Nov 01 2020', 1.38, 2);
    expectEvals(evals, 131, 'Cash', 'Tue Dec 01 2020', 1282.09, 2);
    expectEvals(evals, 132, 'Bond', 'Tue Dec 01 2020', 1089.25, 2);
    expectEvals(evals, 133, 'CPI.', 'Tue Dec 01 2020', 1.39, 2);
    expectEvals(evals, 134, 'Cash', 'Fri Jan 01 2021', 1294.25, 2);
    expectEvals(evals, 135, 'Bond', 'Fri Jan 01 2021', 1089.25, 2);
    expectEvals(evals, 136, 'CPI.', 'Fri Jan 01 2021', 1.40, 2);// matches the setting value
    expectEvals(evals, 137, 'Cash', 'Fri Jan 01 2021', 1269.49, 2);
    expectEvals(evals, 138, 'Bond', 'Fri Jan 01 2021', 1114.01, 2);
    expectEvals(evals, 139, 'Bond', 'Fri Jan 01 2021', 1099.96, 2);
    expectEvals(evals, 140, 'Cash', 'Fri Jan 01 2021', 1283.54, 2);
    expectEvals(evals, 141, 'Cash', 'Mon Feb 01 2021', 1295.72, 2);
    expectEvals(evals, 142, 'Bond', 'Mon Feb 01 2021', 1099.96, 2);
    expectEvals(evals, 143, 'CPI.', 'Mon Feb 01 2021', 1.42, 2);
    expectEvals(evals, 144, 'Cash', 'Mon Mar 01 2021', 1308.02, 2);
    expectEvals(evals, 145, 'Bond', 'Mon Mar 01 2021', 1099.96, 2);
    expectEvals(evals, 146, 'CPI.', 'Mon Mar 01 2021', 1.43, 2);
    expectEvals(evals, 147, 'Cash', 'Thu Apr 01 2021', 1320.43, 2);
    expectEvals(evals, 148, 'Bond', 'Thu Apr 01 2021', 1099.96, 2);
    expectEvals(evals, 149, 'CPI.', 'Thu Apr 01 2021', 1.45, 2);
    expectEvals(evals, 150, 'Cash', 'Sat May 01 2021', 1332.96, 2);
    expectEvals(evals, 151, 'Bond', 'Sat May 01 2021', 1099.96, 2);
    expectEvals(evals, 152, 'CPI.', 'Sat May 01 2021', 1.46, 2);
    expectEvals(evals, 153, 'Cash', 'Tue Jun 01 2021', 1345.61, 2);
    expectEvals(evals, 154, 'Bond', 'Tue Jun 01 2021', 1099.96, 2);
    expectEvals(evals, 155, 'CPI.', 'Tue Jun 01 2021', 1.47, 2);
    expectEvals(evals, 156, 'Cash', 'Thu Jul 01 2021', 1358.38, 2);
    expectEvals(evals, 157, 'Bond', 'Thu Jul 01 2021', 1099.96, 2);
    expectEvals(evals, 158, 'CPI.', 'Thu Jul 01 2021', 1.49, 2);
    expectEvals(evals, 159, 'Cash', 'Sun Aug 01 2021', 1371.26, 2);
    expectEvals(evals, 160, 'Bond', 'Sun Aug 01 2021', 1099.96, 2);
    expectEvals(evals, 161, 'CPI.', 'Sun Aug 01 2021', 1.50, 2);
    expectEvals(evals, 162, 'Cash', 'Wed Sep 01 2021', 1384.28, 2);
    expectEvals(evals, 163, 'Bond', 'Wed Sep 01 2021', 1099.96, 2);
    expectEvals(evals, 164, 'CPI.', 'Wed Sep 01 2021', 1.52, 2);
    expectEvals(evals, 165, 'Cash', 'Fri Oct 01 2021', 1397.41, 2);
    expectEvals(evals, 166, 'Bond', 'Fri Oct 01 2021', 1099.96, 2);
    expectEvals(evals, 167, 'CPI.', 'Fri Oct 01 2021', 1.53, 2);
    expectEvals(evals, 168, 'Cash', 'Mon Nov 01 2021', 1410.67, 2);
    expectEvals(evals, 169, 'Bond', 'Mon Nov 01 2021', 1099.96, 2);
    expectEvals(evals, 170, 'CPI.', 'Mon Nov 01 2021', 1.54, 2);
    expectEvals(evals, 171, 'Cash', 'Wed Dec 01 2021', 1424.06, 2);
    expectEvals(evals, 172, 'Bond', 'Wed Dec 01 2021', 1099.96, 2);
    expectEvals(evals, 173, 'CPI.', 'Wed Dec 01 2021', 1.56, 2);
    expectEvals(evals, 174, 'Cash', 'Sat Jan 01 2022', 1437.57, 2);
    expectEvals(evals, 175, 'Bond', 'Sat Jan 01 2022', 1099.96, 2);
    expectEvals(evals, 176, 'CPI.', 'Sat Jan 01 2022', 1.57, 2);// matches the setting value
    expectEvals(evals, 177, 'Cash', 'Sat Jan 01 2022', 1409.84, 2);
    expectEvals(evals, 178, 'Bond', 'Sat Jan 01 2022', 1127.69, 2);
    expectEvals(evals, 179, 'Bond', 'Sat Jan 01 2022', 1111.96, 2);
    expectEvals(evals, 180, 'Cash', 'Sat Jan 01 2022', 1425.57, 2);
    expectEvals(evals, 181, 'Cash', 'Tue Feb 01 2022', 1439.10, 2);
    expectEvals(evals, 182, 'Bond', 'Tue Feb 01 2022', 1111.96, 2);
    expectEvals(evals, 183, 'CPI.', 'Tue Feb 01 2022', 1.59, 2);
    expectEvals(evals, 184, 'Cash', 'Tue Mar 01 2022', 1452.76, 2);
    expectEvals(evals, 185, 'Bond', 'Tue Mar 01 2022', 1111.96, 2);
    expectEvals(evals, 186, 'CPI.', 'Tue Mar 01 2022', 1.60, 2);
    expectEvals(evals, 187, 'Cash', 'Fri Apr 01 2022', 1466.54, 2);
    expectEvals(evals, 188, 'Bond', 'Fri Apr 01 2022', 1111.96, 2);
    expectEvals(evals, 189, 'CPI.', 'Fri Apr 01 2022', 1.62, 2);
    expectEvals(evals, 190, 'Cash', 'Sun May 01 2022', 1480.46, 2);
    expectEvals(evals, 191, 'Bond', 'Sun May 01 2022', 1111.96, 2);
    expectEvals(evals, 192, 'CPI.', 'Sun May 01 2022', 1.63, 2);
    expectEvals(evals, 193, 'Cash', 'Wed Jun 01 2022', 1494.50, 2);
    expectEvals(evals, 194, 'Bond', 'Wed Jun 01 2022', 1111.96, 2);
    expectEvals(evals, 195, 'CPI.', 'Wed Jun 01 2022', 1.65, 2);
    expectEvals(evals, 196, 'Cash', 'Fri Jul 01 2022', 1508.69, 2);
    expectEvals(evals, 197, 'Bond', 'Fri Jul 01 2022', 1111.96, 2);
    expectEvals(evals, 198, 'CPI.', 'Fri Jul 01 2022', 1.67, 2);
    expectEvals(evals, 199, 'Cash', 'Mon Aug 01 2022', 1523.00, 2);
    expectEvals(evals, 200, 'Bond', 'Mon Aug 01 2022', 1111.96, 2);
    expectEvals(evals, 201, 'CPI.', 'Mon Aug 01 2022', 1.68, 2);
    expectEvals(evals, 202, 'Cash', 'Thu Sep 01 2022', 1537.45, 2);
    expectEvals(evals, 203, 'Bond', 'Thu Sep 01 2022', 1111.96, 2);
    expectEvals(evals, 204, 'CPI.', 'Thu Sep 01 2022', 1.70, 2);
    expectEvals(evals, 205, 'Cash', 'Sat Oct 01 2022', 1552.04, 2);
    expectEvals(evals, 206, 'Bond', 'Sat Oct 01 2022', 1111.96, 2);
    expectEvals(evals, 207, 'CPI.', 'Sat Oct 01 2022', 1.71, 2);
    expectEvals(evals, 208, 'Cash', 'Tue Nov 01 2022', 1566.77, 2);
    expectEvals(evals, 209, 'Bond', 'Tue Nov 01 2022', 1111.96, 2);
    expectEvals(evals, 210, 'CPI.', 'Tue Nov 01 2022', 1.73, 2);
    expectEvals(evals, 211, 'Cash', 'Thu Dec 01 2022', 1581.63, 2);
    expectEvals(evals, 212, 'Bond', 'Thu Dec 01 2022', 1111.96, 2);
    expectEvals(evals, 213, 'CPI.', 'Thu Dec 01 2022', 1.75, 2);
    expectEvals(evals, 214, 'Cash', 'Sun Jan 01 2023', 1596.64, 2);
    expectEvals(evals, 215, 'Bond', 'Sun Jan 01 2023', 1111.96, 2);
    expectEvals(evals, 216, 'CPI.', 'Sun Jan 01 2023', 1.76, 2);// matches the setting value
    expectEvals(evals, 217, 'Cash', 'Sun Jan 01 2023', 1565.58, 2);
    expectEvals(evals, 218, 'Bond', 'Sun Jan 01 2023', 1143.02, 2);
    expectEvals(evals, 219, 'Bond', 'Sun Jan 01 2023', 1125.39, 2);
    expectEvals(evals, 220, 'Cash', 'Sun Jan 01 2023', 1583.21, 2);
    expectEvals(evals, 221, 'Cash', 'Wed Feb 01 2023', 1598.23, 2);
    expectEvals(evals, 222, 'Bond', 'Wed Feb 01 2023', 1125.39, 2);
    expectEvals(evals, 223, 'CPI.', 'Wed Feb 01 2023', 1.78, 2);
    expectEvals(evals, 224, 'Cash', 'Wed Mar 01 2023', 1613.40, 2);
    expectEvals(evals, 225, 'Bond', 'Wed Mar 01 2023', 1125.39, 2);
    expectEvals(evals, 226, 'CPI.', 'Wed Mar 01 2023', 1.80, 2);
    expectEvals(evals, 227, 'Cash', 'Sat Apr 01 2023', 1628.70, 2);
    expectEvals(evals, 228, 'Bond', 'Sat Apr 01 2023', 1125.39, 2);
    expectEvals(evals, 229, 'CPI.', 'Sat Apr 01 2023', 1.81, 2);
    expectEvals(evals, 230, 'Cash', 'Mon May 01 2023', 1644.16, 2);
    expectEvals(evals, 231, 'Bond', 'Mon May 01 2023', 1125.39, 2);
    expectEvals(evals, 232, 'CPI.', 'Mon May 01 2023', 1.83, 2);
    expectEvals(evals, 233, 'Cash', 'Thu Jun 01 2023', 1659.76, 2);
    expectEvals(evals, 234, 'Bond', 'Thu Jun 01 2023', 1125.39, 2);
    expectEvals(evals, 235, 'CPI.', 'Thu Jun 01 2023', 1.85, 2);
    expectEvals(evals, 236, 'Cash', 'Sat Jul 01 2023', 1675.51, 2);
    expectEvals(evals, 237, 'Bond', 'Sat Jul 01 2023', 1125.39, 2);
    expectEvals(evals, 238, 'CPI.', 'Sat Jul 01 2023', 1.87, 2);
    expectEvals(evals, 239, 'Cash', 'Tue Aug 01 2023', 1691.41, 2);
    expectEvals(evals, 240, 'Bond', 'Tue Aug 01 2023', 1125.39, 2);
    expectEvals(evals, 241, 'CPI.', 'Tue Aug 01 2023', 1.88, 2);
    expectEvals(evals, 242, 'Cash', 'Fri Sep 01 2023', 1707.46, 2);
    expectEvals(evals, 243, 'Bond', 'Fri Sep 01 2023', 1125.39, 2);
    expectEvals(evals, 244, 'CPI.', 'Fri Sep 01 2023', 1.90, 2);
    expectEvals(evals, 245, 'Cash', 'Sun Oct 01 2023', 1723.66, 2);
    expectEvals(evals, 246, 'Bond', 'Sun Oct 01 2023', 1125.39, 2);
    expectEvals(evals, 247, 'CPI.', 'Sun Oct 01 2023', 1.92, 2);
    expectEvals(evals, 248, 'Cash', 'Wed Nov 01 2023', 1740.01, 2);
    expectEvals(evals, 249, 'Bond', 'Wed Nov 01 2023', 1125.39, 2);
    expectEvals(evals, 250, 'CPI.', 'Wed Nov 01 2023', 1.94, 2);
    expectEvals(evals, 251, 'Cash', 'Fri Dec 01 2023', 1756.53, 2);
    expectEvals(evals, 252, 'Bond', 'Fri Dec 01 2023', 1125.39, 2);
    expectEvals(evals, 253, 'CPI.', 'Fri Dec 01 2023', 1.96, 2);
    expectEvals(evals, 254, 'Cash', 'Mon Jan 01 2024', 1773.19, 2);
    expectEvals(evals, 255, 'Bond', 'Mon Jan 01 2024', 1125.39, 2);
    expectEvals(evals, 256, 'CPI.', 'Mon Jan 01 2024', 1.97, 2);// matches the setting value
    expectEvals(evals, 257, 'Cash', 'Mon Jan 01 2024', 1738.41, 2);
    expectEvals(evals, 258, 'Bond', 'Mon Jan 01 2024', 1160.18, 2);
    expectEvals(evals, 259, 'Bond', 'Mon Jan 01 2024', 1140.44, 2);
    expectEvals(evals, 260, 'Cash', 'Mon Jan 01 2024', 1758.15, 2);
    expectEvals(evals, 261, 'Cash', 'Thu Feb 01 2024', 1774.83, 2);
    expectEvals(evals, 262, 'Bond', 'Thu Feb 01 2024', 1140.44, 2);
    expectEvals(evals, 263, 'CPI.', 'Thu Feb 01 2024', 1.99, 2);
    expectEvals(evals, 264, 'Cash', 'Fri Mar 01 2024', 1791.67, 2);
    expectEvals(evals, 265, 'Bond', 'Fri Mar 01 2024', 1140.44, 2);
    expectEvals(evals, 266, 'CPI.', 'Fri Mar 01 2024', 2.01, 2);
    expectEvals(evals, 267, 'Cash', 'Mon Apr 01 2024', 1808.67, 2);
    expectEvals(evals, 268, 'Bond', 'Mon Apr 01 2024', 1140.44, 2);
    expectEvals(evals, 269, 'CPI.', 'Mon Apr 01 2024', 2.03, 2);
    expectEvals(evals, 270, 'Cash', 'Wed May 01 2024', 1825.83, 2);
    expectEvals(evals, 271, 'Bond', 'Wed May 01 2024', 1140.44, 2);
    expectEvals(evals, 272, 'CPI.', 'Wed May 01 2024', 2.05, 2);
    expectEvals(evals, 273, 'Cash', 'Sat Jun 01 2024', 1843.16, 2);
    expectEvals(evals, 274, 'Bond', 'Sat Jun 01 2024', 1140.44, 2);
    expectEvals(evals, 275, 'CPI.', 'Sat Jun 01 2024', 2.07, 2);
    expectEvals(evals, 276, 'Cash', 'Mon Jul 01 2024', 1860.65, 2);
    expectEvals(evals, 277, 'Bond', 'Mon Jul 01 2024', 1140.44, 2);
    expectEvals(evals, 278, 'CPI.', 'Mon Jul 01 2024', 2.09, 2);
    expectEvals(evals, 279, 'Cash', 'Thu Aug 01 2024', 1878.30, 2);
    expectEvals(evals, 280, 'Bond', 'Thu Aug 01 2024', 1140.44, 2);
    expectEvals(evals, 281, 'CPI.', 'Thu Aug 01 2024', 2.11, 2);
    expectEvals(evals, 282, 'Cash', 'Sun Sep 01 2024', 1896.12, 2);
    expectEvals(evals, 283, 'Bond', 'Sun Sep 01 2024', 1140.44, 2);
    expectEvals(evals, 284, 'CPI.', 'Sun Sep 01 2024', 2.13, 2);
    expectEvals(evals, 285, 'Cash', 'Tue Oct 01 2024', 1914.12, 2);
    expectEvals(evals, 286, 'Bond', 'Tue Oct 01 2024', 1140.44, 2);
    expectEvals(evals, 287, 'CPI.', 'Tue Oct 01 2024', 2.15, 2);
    expectEvals(evals, 288, 'Cash', 'Fri Nov 01 2024', 1932.28, 2);
    expectEvals(evals, 289, 'Bond', 'Fri Nov 01 2024', 1140.44, 2);
    expectEvals(evals, 290, 'CPI.', 'Fri Nov 01 2024', 2.17, 2);
    expectEvals(evals, 291, 'Cash', 'Sun Dec 01 2024', 1950.61, 2);
    expectEvals(evals, 292, 'Bond', 'Sun Dec 01 2024', 1140.44, 2);
    expectEvals(evals, 293, 'CPI.', 'Sun Dec 01 2024', 2.19, 2);
    expectEvals(evals, 294, 'Cash', 'Wed Jan 01 2025', 1969.12, 2);
    expectEvals(evals, 295, 'Bond', 'Wed Jan 01 2025', 1140.44, 2);
    expectEvals(evals, 296, 'CPI.', 'Wed Jan 01 2025', 2.21, 2);// matches the setting value
    expectEvals(evals, 297, 'Bond', 'Wed Jan 01 2025', 1118.33, 2);
    expectEvals(evals, 298, 'Cash', 'Wed Jan 01 2025', 1991.23, 2);
    expectEvals(evals, 299, 'Cash', 'Sat Feb 01 2025', 2010.12, 2);
    expectEvals(evals, 300, 'Bond', 'Sat Feb 01 2025', 1118.33, 2);
    expectEvals(evals, 301, 'CPI.', 'Sat Feb 01 2025', 2.23, 2);
    expectEvals(evals, 302, 'Cash', 'Sat Mar 01 2025', 2029.20, 2);
    expectEvals(evals, 303, 'Bond', 'Sat Mar 01 2025', 1118.33, 2);
    expectEvals(evals, 304, 'CPI.', 'Sat Mar 01 2025', 2.25, 2);
    expectEvals(evals, 305, 'Cash', 'Tue Apr 01 2025', 2048.45, 2);
    expectEvals(evals, 306, 'Bond', 'Tue Apr 01 2025', 1118.33, 2);
    expectEvals(evals, 307, 'CPI.', 'Tue Apr 01 2025', 2.27, 2);
    expectEvals(evals, 308, 'Cash', 'Thu May 01 2025', 2067.89, 2);
    expectEvals(evals, 309, 'Bond', 'Thu May 01 2025', 1118.33, 2);
    expectEvals(evals, 310, 'CPI.', 'Thu May 01 2025', 2.30, 2);
    expectEvals(evals, 311, 'Cash', 'Sun Jun 01 2025', 2087.51, 2);
    expectEvals(evals, 312, 'Bond', 'Sun Jun 01 2025', 1118.33, 2);
    expectEvals(evals, 313, 'CPI.', 'Sun Jun 01 2025', 2.32, 2);
    expectEvals(evals, 314, 'Cash', 'Tue Jul 01 2025', 2107.32, 2);
    expectEvals(evals, 315, 'Bond', 'Tue Jul 01 2025', 1118.33, 2);
    expectEvals(evals, 316, 'CPI.', 'Tue Jul 01 2025', 2.34, 2);
    expectEvals(evals, 317, 'Cash', 'Fri Aug 01 2025', 2127.31, 2);
    expectEvals(evals, 318, 'Bond', 'Fri Aug 01 2025', 1118.33, 2);
    expectEvals(evals, 319, 'CPI.', 'Fri Aug 01 2025', 2.36, 2);
    expectEvals(evals, 320, 'Cash', 'Mon Sep 01 2025', 2147.50, 2);
    expectEvals(evals, 321, 'Bond', 'Mon Sep 01 2025', 1118.33, 2);
    expectEvals(evals, 322, 'CPI.', 'Mon Sep 01 2025', 2.38, 2);
    expectEvals(evals, 323, 'Cash', 'Wed Oct 01 2025', 2167.88, 2);
    expectEvals(evals, 324, 'Bond', 'Wed Oct 01 2025', 1118.33, 2);
    expectEvals(evals, 325, 'CPI.', 'Wed Oct 01 2025', 2.41, 2);
    expectEvals(evals, 326, 'Cash', 'Sat Nov 01 2025', 2188.45, 2);
    expectEvals(evals, 327, 'Bond', 'Sat Nov 01 2025', 1118.33, 2);
    expectEvals(evals, 328, 'CPI.', 'Sat Nov 01 2025', 2.43, 2);
    expectEvals(evals, 329, 'Cash', 'Mon Dec 01 2025', 2209.21, 2);
    expectEvals(evals, 330, 'Bond', 'Mon Dec 01 2025', 1118.33, 2);
    expectEvals(evals, 331, 'CPI.', 'Mon Dec 01 2025', 2.45, 2);
    expectEvals(evals, 332, 'Cash', 'Thu Jan 01 2026', 2230.18, 2);
    expectEvals(evals, 333, 'Bond', 'Thu Jan 01 2026', 1118.33, 2);
    expectEvals(evals, 334, 'CPI.', 'Thu Jan 01 2026', 2.48, 2);// matches the setting value
    expectEvals(evals, 335, 'Bond', 'Thu Jan 01 2026', 1093.57, 2);
    expectEvals(evals, 336, 'Cash', 'Thu Jan 01 2026', 2254.94, 2);
    expectEvals(evals, 337, 'Cash', 'Sun Feb 01 2026', 2276.33, 2);
    expectEvals(evals, 338, 'Bond', 'Sun Feb 01 2026', 1093.57, 2);
    expectEvals(evals, 339, 'CPI.', 'Sun Feb 01 2026', 2.50, 2);
    expectEvals(evals, 340, 'Cash', 'Sun Mar 01 2026', 2297.93, 2);
    expectEvals(evals, 341, 'Bond', 'Sun Mar 01 2026', 1093.57, 2);
    expectEvals(evals, 342, 'CPI.', 'Sun Mar 01 2026', 2.52, 2);
    expectEvals(evals, 343, 'Cash', 'Wed Apr 01 2026', 2319.74, 2);
    expectEvals(evals, 344, 'Bond', 'Wed Apr 01 2026', 1093.57, 2);
    expectEvals(evals, 345, 'CPI.', 'Wed Apr 01 2026', 2.55, 2);
    expectEvals(evals, 346, 'Cash', 'Fri May 01 2026', 2341.75, 2);
    expectEvals(evals, 347, 'Bond', 'Fri May 01 2026', 1093.57, 2);
    expectEvals(evals, 348, 'CPI.', 'Fri May 01 2026', 2.57, 2);
    expectEvals(evals, 349, 'Cash', 'Mon Jun 01 2026', 2363.97, 2);
    expectEvals(evals, 350, 'Bond', 'Mon Jun 01 2026', 1093.57, 2);
    expectEvals(evals, 351, 'CPI.', 'Mon Jun 01 2026', 2.60, 2);
    expectEvals(evals, 352, 'Cash', 'Wed Jul 01 2026', 2386.40, 2);
    expectEvals(evals, 353, 'Bond', 'Wed Jul 01 2026', 1093.57, 2);
    expectEvals(evals, 354, 'CPI.', 'Wed Jul 01 2026', 2.62, 2);
    expectEvals(evals, 355, 'Cash', 'Sat Aug 01 2026', 2409.04, 2);
    expectEvals(evals, 356, 'Bond', 'Sat Aug 01 2026', 1093.57, 2);
    expectEvals(evals, 357, 'CPI.', 'Sat Aug 01 2026', 2.65, 2);
    expectEvals(evals, 358, 'Cash', 'Tue Sep 01 2026', 2431.90, 2);
    expectEvals(evals, 359, 'Bond', 'Tue Sep 01 2026', 1093.57, 2);
    expectEvals(evals, 360, 'CPI.', 'Tue Sep 01 2026', 2.67, 2);
    expectEvals(evals, 361, 'Cash', 'Thu Oct 01 2026', 2454.98, 2);
    expectEvals(evals, 362, 'Bond', 'Thu Oct 01 2026', 1093.57, 2);
    expectEvals(evals, 363, 'CPI.', 'Thu Oct 01 2026', 2.70, 2);
    expectEvals(evals, 364, 'Cash', 'Sun Nov 01 2026', 2478.27, 2);
    expectEvals(evals, 365, 'Bond', 'Sun Nov 01 2026', 1093.57, 2);
    expectEvals(evals, 366, 'CPI.', 'Sun Nov 01 2026', 2.72, 2);
    expectEvals(evals, 367, 'Cash', 'Tue Dec 01 2026', 2501.79, 2);
    expectEvals(evals, 368, 'Bond', 'Tue Dec 01 2026', 1093.57, 2);
    expectEvals(evals, 369, 'CPI.', 'Tue Dec 01 2026', 2.75, 2);
    expectEvals(evals, 370, 'Cash', 'Fri Jan 01 2027', 2525.53, 2);
    expectEvals(evals, 371, 'Bond', 'Fri Jan 01 2027', 1093.57, 2);
    expectEvals(evals, 372, 'CPI.', 'Fri Jan 01 2027', 2.77, 2);// matches the setting value
    expectEvals(evals, 373, 'Bond', 'Fri Jan 01 2027', 1065.84, 2);
    expectEvals(evals, 374, 'Cash', 'Fri Jan 01 2027', 2553.26, 2);
    expectEvals(evals, 375, 'Cash', 'Mon Feb 01 2027', 2577.49, 2);
    expectEvals(evals, 376, 'Bond', 'Mon Feb 01 2027', 1065.84, 2);
    expectEvals(evals, 377, 'CPI.', 'Mon Feb 01 2027', 2.80, 2);
    expectEvals(evals, 378, 'Cash', 'Mon Mar 01 2027', 2601.94, 2);
    expectEvals(evals, 379, 'Bond', 'Mon Mar 01 2027', 1065.84, 2);
    expectEvals(evals, 380, 'CPI.', 'Mon Mar 01 2027', 2.83, 2);
    expectEvals(evals, 381, 'Cash', 'Thu Apr 01 2027', 2626.63, 2);
    expectEvals(evals, 382, 'Bond', 'Thu Apr 01 2027', 1065.84, 2);
    expectEvals(evals, 383, 'CPI.', 'Thu Apr 01 2027', 2.85, 2);
    expectEvals(evals, 384, 'Cash', 'Sat May 01 2027', 2651.56, 2);
    expectEvals(evals, 385, 'Bond', 'Sat May 01 2027', 1065.84, 2);
    expectEvals(evals, 386, 'CPI.', 'Sat May 01 2027', 2.88, 2);
    expectEvals(evals, 387, 'Cash', 'Tue Jun 01 2027', 2676.72, 2);
    expectEvals(evals, 388, 'Bond', 'Tue Jun 01 2027', 1065.84, 2);
    expectEvals(evals, 389, 'CPI.', 'Tue Jun 01 2027', 2.91, 2);
    expectEvals(evals, 390, 'Cash', 'Thu Jul 01 2027', 2702.12, 2);
    expectEvals(evals, 391, 'Bond', 'Thu Jul 01 2027', 1065.84, 2);
    expectEvals(evals, 392, 'CPI.', 'Thu Jul 01 2027', 2.93, 2);
    expectEvals(evals, 393, 'Cash', 'Sun Aug 01 2027', 2727.76, 2);
    expectEvals(evals, 394, 'Bond', 'Sun Aug 01 2027', 1065.84, 2);
    expectEvals(evals, 395, 'CPI.', 'Sun Aug 01 2027', 2.96, 2);
    expectEvals(evals, 396, 'Cash', 'Wed Sep 01 2027', 2753.64, 2);
    expectEvals(evals, 397, 'Bond', 'Wed Sep 01 2027', 1065.84, 2);
    expectEvals(evals, 398, 'CPI.', 'Wed Sep 01 2027', 2.99, 2);
    expectEvals(evals, 399, 'Cash', 'Fri Oct 01 2027', 2779.77, 2);
    expectEvals(evals, 400, 'Bond', 'Fri Oct 01 2027', 1065.84, 2);
    expectEvals(evals, 401, 'CPI.', 'Fri Oct 01 2027', 3.02, 2);
    expectEvals(evals, 402, 'Cash', 'Mon Nov 01 2027', 2806.14, 2);
    expectEvals(evals, 403, 'Bond', 'Mon Nov 01 2027', 1065.84, 2);
    expectEvals(evals, 404, 'CPI.', 'Mon Nov 01 2027', 3.05, 2);
    expectEvals(evals, 405, 'Cash', 'Wed Dec 01 2027', 2832.77, 2);
    expectEvals(evals, 406, 'Bond', 'Wed Dec 01 2027', 1065.84, 2);
    expectEvals(evals, 407, 'CPI.', 'Wed Dec 01 2027', 3.08, 2);
    expectEvals(evals, 408, 'Cash', 'Sat Jan 01 2028', 2859.65, 2);
    expectEvals(evals, 409, 'Bond', 'Sat Jan 01 2028', 1065.84, 2);
    expectEvals(evals, 410, 'CPI.', 'Sat Jan 01 2028', 3.11, 2);// matches the setting value
    expectEvals(evals, 411, 'Bond', 'Sat Jan 01 2028', 1034.79, 2);
    expectEvals(evals, 412, 'Cash', 'Sat Jan 01 2028', 2890.71, 2);
    expectEvals(evals, 413, 'Cash', 'Tue Feb 01 2028', 2918.14, 2);
    expectEvals(evals, 414, 'Bond', 'Tue Feb 01 2028', 1034.79, 2);
    expectEvals(evals, 415, 'CPI.', 'Tue Feb 01 2028', 3.14, 2);
    expectEvals(evals, 416, 'Cash', 'Wed Mar 01 2028', 2945.83, 2);
    expectEvals(evals, 417, 'Bond', 'Wed Mar 01 2028', 1034.79, 2);
    expectEvals(evals, 418, 'CPI.', 'Wed Mar 01 2028', 3.17, 2);
    expectEvals(evals, 419, 'Cash', 'Sat Apr 01 2028', 2973.78, 2);
    expectEvals(evals, 420, 'Bond', 'Sat Apr 01 2028', 1034.79, 2);
    expectEvals(evals, 421, 'CPI.', 'Sat Apr 01 2028', 3.20, 2);
    expectEvals(evals, 422, 'Cash', 'Mon May 01 2028', 3002.00, 2);
    expectEvals(evals, 423, 'Bond', 'Mon May 01 2028', 1034.79, 2);
    expectEvals(evals, 424, 'CPI.', 'Mon May 01 2028', 3.23, 2);
    expectEvals(evals, 425, 'Cash', 'Thu Jun 01 2028', 3030.48, 2);
    expectEvals(evals, 426, 'Bond', 'Thu Jun 01 2028', 1034.79, 2);
    expectEvals(evals, 427, 'CPI.', 'Thu Jun 01 2028', 3.26, 2);
    expectEvals(evals, 428, 'Cash', 'Sat Jul 01 2028', 3059.24, 2);
    expectEvals(evals, 429, 'Bond', 'Sat Jul 01 2028', 1034.79, 2);
    expectEvals(evals, 430, 'CPI.', 'Sat Jul 01 2028', 3.29, 2);
    expectEvals(evals, 431, 'Cash', 'Tue Aug 01 2028', 3088.27, 2);
    expectEvals(evals, 432, 'Bond', 'Tue Aug 01 2028', 1034.79, 2);
    expectEvals(evals, 433, 'CPI.', 'Tue Aug 01 2028', 3.32, 2);
    expectEvals(evals, 434, 'Cash', 'Fri Sep 01 2028', 3117.57, 2);
    expectEvals(evals, 435, 'Bond', 'Fri Sep 01 2028', 1034.79, 2);
    expectEvals(evals, 436, 'CPI.', 'Fri Sep 01 2028', 3.35, 2);
    expectEvals(evals, 437, 'Cash', 'Sun Oct 01 2028', 3147.15, 2);
    expectEvals(evals, 438, 'Bond', 'Sun Oct 01 2028', 1034.79, 2);
    expectEvals(evals, 439, 'CPI.', 'Sun Oct 01 2028', 3.38, 2);
    expectEvals(evals, 440, 'Cash', 'Wed Nov 01 2028', 3177.02, 2);
    expectEvals(evals, 441, 'Bond', 'Wed Nov 01 2028', 1034.79, 2);
    expectEvals(evals, 442, 'CPI.', 'Wed Nov 01 2028', 3.41, 2);
    expectEvals(evals, 443, 'Cash', 'Fri Dec 01 2028', 3207.16, 2);
    expectEvals(evals, 444, 'Bond', 'Fri Dec 01 2028', 1034.79, 2);
    expectEvals(evals, 445, 'CPI.', 'Fri Dec 01 2028', 3.45, 2);
    expectEvals(evals, 446, 'Cash', 'Mon Jan 01 2029', 3237.59, 2);
    expectEvals(evals, 447, 'Bond', 'Mon Jan 01 2029', 1034.79, 2);
    expectEvals(evals, 448, 'CPI.', 'Mon Jan 01 2029', 3.48, 2);// matches the setting value
    expectEvals(evals, 449, 'Bond', 'Mon Jan 01 2029', 1000, -1);
    expectEvals(evals, 450, 'Cash', 'Mon Jan 01 2029', 3272.38, 2);
    expectEvals(evals, 451, 'Cash', 'Thu Feb 01 2029', 3303.43, 2);
    expectEvals(evals, 452, 'Bond', 'Thu Feb 01 2029', 1000, -1);
    expectEvals(evals, 453, 'CPI.', 'Thu Feb 01 2029', 3.51, 2);
    expectEvals(evals, 454, 'Cash', 'Thu Mar 01 2029', 3334.78, 2);
    expectEvals(evals, 455, 'Bond', 'Thu Mar 01 2029', 1000, -1);
    expectEvals(evals, 456, 'CPI.', 'Thu Mar 01 2029', 3.54, 2);
    expectEvals(evals, 457, 'Cash', 'Sun Apr 01 2029', 3366.42, 2);
    expectEvals(evals, 458, 'Bond', 'Sun Apr 01 2029', 1000, -1);
    expectEvals(evals, 459, 'CPI.', 'Sun Apr 01 2029', 3.58, 2);
    expectEvals(evals, 460, 'Cash', 'Tue May 01 2029', 3398.36, 2);
    expectEvals(evals, 461, 'Bond', 'Tue May 01 2029', 1000, -1);
    expectEvals(evals, 462, 'CPI.', 'Tue May 01 2029', 3.61, 2);
    expectEvals(evals, 463, 'Cash', 'Fri Jun 01 2029', 3430.61, 2);
    expectEvals(evals, 464, 'Bond', 'Fri Jun 01 2029', 1000, -1);
    expectEvals(evals, 465, 'CPI.', 'Fri Jun 01 2029', 3.65, 2);
    expectEvals(evals, 466, 'Cash', 'Sun Jul 01 2029', 3463.16, 2);
    expectEvals(evals, 467, 'Bond', 'Sun Jul 01 2029', 1000, -1);
    expectEvals(evals, 468, 'CPI.', 'Sun Jul 01 2029', 3.68, 2);
    expectEvals(evals, 469, 'Cash', 'Wed Aug 01 2029', 3496.02, 2);
    expectEvals(evals, 470, 'Bond', 'Wed Aug 01 2029', 1000, -1);
    expectEvals(evals, 471, 'CPI.', 'Wed Aug 01 2029', 3.72, 2);
    expectEvals(evals, 472, 'Cash', 'Sat Sep 01 2029', 3529.20, 2);
    expectEvals(evals, 473, 'Bond', 'Sat Sep 01 2029', 1000, -1);
    expectEvals(evals, 474, 'CPI.', 'Sat Sep 01 2029', 3.75, 2);
    expectEvals(evals, 475, 'Cash', 'Mon Oct 01 2029', 3562.68, 2);
    expectEvals(evals, 476, 'Bond', 'Mon Oct 01 2029', 1000, -1);
    expectEvals(evals, 477, 'CPI.', 'Mon Oct 01 2029', 3.79, 2);
    expectEvals(evals, 478, 'Cash', 'Thu Nov 01 2029', 3596.49, 2);
    expectEvals(evals, 479, 'Bond', 'Thu Nov 01 2029', 1000, -1);
    expectEvals(evals, 480, 'CPI.', 'Thu Nov 01 2029', 3.82, 2);
    expectEvals(evals, 481, 'Cash', 'Sat Dec 01 2029', 3630.62, 2);
    expectEvals(evals, 482, 'Bond', 'Sat Dec 01 2029', 1000, -1);
    expectEvals(evals, 483, 'CPI.', 'Sat Dec 01 2029', 3.86, 2);
    expectEvals(evals, 484, 'Cash', 'Tue Jan 01 2030', 3665.07, 2);
    expectEvals(evals, 485, 'Bond', 'Tue Jan 01 2030', 1000, -1);
    expectEvals(evals, 486, 'CPI.', 'Tue Jan 01 2030', 3.90, 2);
    expectEvals(evals, 487, 'Cash', 'Fri Feb 01 2030', 3699.84, 2);
    expectEvals(evals, 488, 'Bond', 'Fri Feb 01 2030', 1000, -1);
    expectEvals(evals, 489, 'CPI.', 'Fri Feb 01 2030', 3.93, 2);
    expectEvals(evals, 490, 'Cash', 'Fri Mar 01 2030', 3734.95, 2);
    expectEvals(evals, 491, 'Bond', 'Fri Mar 01 2030', 1000, -1);
    expectEvals(evals, 492, 'CPI.', 'Fri Mar 01 2030', 3.97, 2);
    expectEvals(evals, 493, 'Cash', 'Mon Apr 01 2030', 3770.39, 2);
    expectEvals(evals, 494, 'Bond', 'Mon Apr 01 2030', 1000, -1);
    expectEvals(evals, 495, 'CPI.', 'Mon Apr 01 2030', 4.01, 2);
    expectEvals(evals, 496, 'Cash', 'Wed May 01 2030', 3806.17, 2);
    expectEvals(evals, 497, 'Bond', 'Wed May 01 2030', 1000, -1);
    expectEvals(evals, 498, 'CPI.', 'Wed May 01 2030', 4.05, 2);
    expectEvals(evals, 499, 'Cash', 'Sat Jun 01 2030', 3842.28, 2);
    expectEvals(evals, 500, 'Bond', 'Sat Jun 01 2030', 1000, -1);
    expectEvals(evals, 501, 'CPI.', 'Sat Jun 01 2030', 4.08, 2);
    expectEvals(evals, 502, 'Cash', 'Mon Jul 01 2030', 3878.74, 2);
    expectEvals(evals, 503, 'Bond', 'Mon Jul 01 2030', 1000, -1);
    expectEvals(evals, 504, 'CPI.', 'Mon Jul 01 2030', 4.12, 2);
    expectEvals(evals, 505, 'Cash', 'Thu Aug 01 2030', 3915.55, 2);
    expectEvals(evals, 506, 'Bond', 'Thu Aug 01 2030', 1000, -1);
    expectEvals(evals, 507, 'CPI.', 'Thu Aug 01 2030', 4.16, 2);
    expectEvals(evals, 508, 'Cash', 'Sun Sep 01 2030', 3952.70, 2);
    expectEvals(evals, 509, 'Bond', 'Sun Sep 01 2030', 1000, -1);
    expectEvals(evals, 510, 'CPI.', 'Sun Sep 01 2030', 4.20, 2);
    expectEvals(evals, 511, 'Cash', 'Tue Oct 01 2030', 3990.21, 2);
    expectEvals(evals, 512, 'Bond', 'Tue Oct 01 2030', 1000, -1);
    expectEvals(evals, 513, 'CPI.', 'Tue Oct 01 2030', 4.24, 2);
    expectEvals(evals, 514, 'Cash', 'Fri Nov 01 2030', 4028.07, 2);
    expectEvals(evals, 515, 'Bond', 'Fri Nov 01 2030', 1000, -1);
    expectEvals(evals, 516, 'CPI.', 'Fri Nov 01 2030', 4.28, 2);
    expectEvals(evals, 517, 'Cash', 'Sun Dec 01 2030', 4066.29, 2);
    expectEvals(evals, 518, 'Bond', 'Sun Dec 01 2030', 1000, -1);
    expectEvals(evals, 519, 'CPI.', 'Sun Dec 01 2030', 4.32, 2);
    expectEvals(evals, 520, 'Cash', 'Wed Jan 01 2031', 4104.87, 2);
    expectEvals(evals, 521, 'Bond', 'Wed Jan 01 2031', 1000, -1);
    expectEvals(evals, 522, 'CPI.', 'Wed Jan 01 2031', 4.36, 2);
    expectEvals(evals, 523, 'Cash', 'Sat Feb 01 2031', 4143.82, 2);
    expectEvals(evals, 524, 'Bond', 'Sat Feb 01 2031', 1000, -1);
    expectEvals(evals, 525, 'CPI.', 'Sat Feb 01 2031', 4.40, 2);
    expectEvals(evals, 526, 'Cash', 'Sat Mar 01 2031', 4183.14, 2);
    expectEvals(evals, 527, 'Bond', 'Sat Mar 01 2031', 1000, -1);
    expectEvals(evals, 528, 'CPI.', 'Sat Mar 01 2031', 4.45, 2);
    expectEvals(evals, 529, 'Cash', 'Tue Apr 01 2031', 4222.84, 2);
    expectEvals(evals, 530, 'Bond', 'Tue Apr 01 2031', 1000, -1);
    expectEvals(evals, 531, 'CPI.', 'Tue Apr 01 2031', 4.49, 2);
    expectEvals(evals, 532, 'Cash', 'Thu May 01 2031', 4262.91, 2);
    expectEvals(evals, 533, 'Bond', 'Thu May 01 2031', 1000, -1);
    expectEvals(evals, 534, 'CPI.', 'Thu May 01 2031', 4.53, 2);

    done();
  });  

});
