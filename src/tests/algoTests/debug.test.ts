import {
  revalueSetting,
  cpi,
  constType,
  bondMature,
  bondInvest,
  bondInterest,
} from '../../localization/stringConstants';
import {
  emptyModel,
  simpleAsset,
  simpleTransaction,
  defaultModelSettings,
} from '../../models/exampleModels';
import { setSetting } from '../../models/modelUtils';
import { ModelData } from '../../types/interfaces';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  getTestEvaluations,
  expectEvals,
} from './algoTestUtils';

describe('bonds tests', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('debugTest', (done) => {
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

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    done();
  });
});
