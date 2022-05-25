import { revalueSetting } from '../../localization/stringConstants';
import { makeChartDataFromEvaluations } from '../../models/charting';
import {
  emptyModel,
  simpleExpense,
  defaultModelSettings,
  simpleTransaction,
} from '../../models/exampleModels';
import { ModelData } from '../../types/interfaces';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  expectEvals,
  getTestEvaluations,
  defaultTestViewSettings,
  expectChartData,
  printTestCodeForChart,
} from './algoTestUtils';

expectEvals;
expectChartData;
printTestCodeForChart;

describe('debug test', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('debugTest', (done) => {
    const roi = {
      start: 'Dec 1, 2017 00:00:00',
      end: 'March 2, 2039 00:00:00',
    };
    const model: ModelData = {
      ...emptyModel,
      expenses: [
        {
          ...simpleExpense,
          START: 'January 1 2028',
          END: 'February 2 2039',
          NAME: 'Phon',
          VALUE: '100.0',
          VALUE_SET: 'January 1 2019',
          RECURRENCE: '10y',
          CPI_IMMUNE: false,
        },
      ],
      settings: [...defaultModelSettings(roi)],
      transactions: [
        {
          ...simpleTransaction,
          NAME: 'Revalue of cpi 1',
          TO: 'cpi',
          TO_VALUE: '10',
          DATE: '1 March 2020',
          TYPE: revalueSetting,
        },
        {
          ...simpleTransaction,
          NAME: 'Revalue of cpi 2',
          TO: 'cpi',
          TO_VALUE: '0',
          DATE: '1 July 2020',
          TYPE: revalueSetting,
        },
      ],
    };

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    evals;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);

    const viewSettings = defaultTestViewSettings();

    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
    result;

    // printTestCodeForChart(result);

    done();
  });
});
