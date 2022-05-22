import {
  emptyModel,
  simpleExpense,
  defaultModelSettings,
} from '../../models/exampleModels';
import { ModelData } from '../../types/interfaces';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  expectEvals,
  getTestEvaluations,
} from './algoTestUtils';

expectEvals;

describe('debug test', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('should one expense 6m recurrence set oddly displaced', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2018 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2018',
          END: 'February 2 2019',
          NAME: 'Phon',
          VALUE: '12.12',
          VALUE_SET: 'May 15 2017',
          RECURRENCE: '6m',
        },
      ],
      settings: [...defaultModelSettings(roi)],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(1);
    expectEvals(evals, 0, 'Phon', 'Mon Jan 01 2018', 12.12, 2);

    done();
  });
});
