import {
  getVariableDateExampleData,
  getVariableDateExampleData2,
} from '../../models/exampleModels';
import { ChartData } from '../../types/interfaces';
import { log, printDebug, showObj } from '../../utils/utils';
import { calcOptimizer } from '../../views/tablePages';
import {
  printTestCodeForEvals,
  printTestCodeForChart,
  getTestEvaluations,
  expectEvals,
} from './algoTestUtils';

log;
printDebug;
printTestCodeForEvals;
printTestCodeForChart;
showObj;

describe('optimizer tests', () => {
  it('should load optimizer model', (done) => {
    const model = getVariableDateExampleData();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(34);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 01 2019', 0, -1);
    expectEvals(evals, 1, 'Estate', 'Tue Jan 01 2019', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 01 2019', 0, -1);
    expectEvals(evals, 3, 'Estate', 'Fri Feb 01 2019', 0, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 5, 'Estate', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 6, 'Cash', 'Mon Apr 01 2019', 0, -1);
    expectEvals(evals, 7, 'Estate', 'Mon Apr 01 2019', 0, -1);
    expectEvals(evals, 8, 'Cash', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 9, 'Estate', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 01 2019', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Jun 01 2019', 100, -1);
    expectEvals(evals, 12, 'Estate', 'Sat Jun 01 2019', 0, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Jun 01 2019', 200, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Jul 01 2019', 200, -1);
    expectEvals(evals, 15, 'Estate', 'Mon Jul 01 2019', 0, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Jul 01 2019', 300, -1);
    expectEvals(evals, 17, 'Cash', 'Thu Aug 01 2019', 300, -1);
    expectEvals(evals, 18, 'Estate', 'Thu Aug 01 2019', 0, -1);
    expectEvals(evals, 19, 'Cash', 'Thu Aug 01 2019', 400, -1);
    expectEvals(evals, 20, 'Cash', 'Sun Sep 01 2019', 400, -1);
    expectEvals(evals, 21, 'Estate', 'Sun Sep 01 2019', 0, -1);
    expectEvals(evals, 22, 'Cash', 'Sun Sep 01 2019', 500, -1);
    expectEvals(evals, 23, 'Cash', 'Tue Oct 01 2019', 500, -1);
    expectEvals(evals, 24, 'Estate', 'Tue Oct 01 2019', 0, -1);
    expectEvals(evals, 25, 'Cash', 'Tue Oct 01 2019', 600, -1);
    expectEvals(evals, 26, 'Cash', 'Fri Nov 01 2019', 600, -1);
    expectEvals(evals, 27, 'Estate', 'Fri Nov 01 2019', 0, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Nov 01 2019', 700, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Nov 01 2019', 0, -1);
    expectEvals(evals, 30, 'Estate', 'Fri Nov 01 2019', 700, -1);
    expectEvals(evals, 31, 'Cash', 'Sun Dec 01 2019', 0, -1);
    expectEvals(evals, 32, 'Estate', 'Sun Dec 01 2019', 700, -1);
    expectEvals(evals, 33, 'Cash', 'Sun Dec 01 2019', 100, -1);

    let errorMsg = '';
    const cd: ChartData = calcOptimizer(model, (msg: string) => {
      errorMsg = msg;
    });
    expect(errorMsg).toEqual('');

    // log(`cd === \n${showObj(cd)}`);

    expect(JSON.stringify(cd)).toEqual(
      JSON.stringify({
        labels: [1, 2, 3, 4, 5],
        datasets: [
          {
            label: 'optimisation result',
            data: [1000, 900, 800, 700, 600],
            backgroundColor: 'rgb(78,129,188)',
            barPercentage: 1,
          },
        ],
        displayLegend: true,
      }),
    );
    done();
  });

  it('should load second optimizer model', (done) => {
    const model = getVariableDateExampleData2();

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;

    // printTestCodeForEvals(evals);

    expect(evals.length).toBe(34);
    expectEvals(evals, 0, 'Cash', 'Tue Jan 01 2019', 0, -1);
    expectEvals(evals, 1, 'Estate', 'Tue Jan 01 2019', 0, -1);
    expectEvals(evals, 2, 'Cash', 'Fri Feb 01 2019', 0, -1);
    expectEvals(evals, 3, 'Estate', 'Fri Feb 01 2019', 0, -1);
    expectEvals(evals, 4, 'Cash', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 5, 'Estate', 'Fri Mar 01 2019', 0, -1);
    expectEvals(evals, 6, 'Cash', 'Mon Apr 01 2019', 0, -1);
    expectEvals(evals, 7, 'Estate', 'Mon Apr 01 2019', 0, -1);
    expectEvals(evals, 8, 'Cash', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 9, 'Estate', 'Wed May 01 2019', 0, -1);
    expectEvals(evals, 10, 'Cash', 'Wed May 01 2019', 100, -1);
    expectEvals(evals, 11, 'Cash', 'Sat Jun 01 2019', 100, -1);
    expectEvals(evals, 12, 'Estate', 'Sat Jun 01 2019', 0, -1);
    expectEvals(evals, 13, 'Cash', 'Sat Jun 01 2019', 200, -1);
    expectEvals(evals, 14, 'Cash', 'Mon Jul 01 2019', 200, -1);
    expectEvals(evals, 15, 'Estate', 'Mon Jul 01 2019', 0, -1);
    expectEvals(evals, 16, 'Cash', 'Mon Jul 01 2019', 300, -1);
    expectEvals(evals, 17, 'Cash', 'Thu Aug 01 2019', 300, -1);
    expectEvals(evals, 18, 'Estate', 'Thu Aug 01 2019', 0, -1);
    expectEvals(evals, 19, 'Cash', 'Thu Aug 01 2019', 400, -1);
    expectEvals(evals, 20, 'Cash', 'Sun Sep 01 2019', 400, -1);
    expectEvals(evals, 21, 'Estate', 'Sun Sep 01 2019', 0, -1);
    expectEvals(evals, 22, 'Cash', 'Sun Sep 01 2019', 500, -1);
    expectEvals(evals, 23, 'Cash', 'Tue Oct 01 2019', 500, -1);
    expectEvals(evals, 24, 'Estate', 'Tue Oct 01 2019', 0, -1);
    expectEvals(evals, 25, 'Cash', 'Tue Oct 01 2019', 600, -1);
    expectEvals(evals, 26, 'Cash', 'Fri Nov 01 2019', 600, -1);
    expectEvals(evals, 27, 'Estate', 'Fri Nov 01 2019', 0, -1);
    expectEvals(evals, 28, 'Cash', 'Fri Nov 01 2019', 700, -1);
    expectEvals(evals, 29, 'Cash', 'Fri Nov 01 2019', 0, -1);
    expectEvals(evals, 30, 'Estate', 'Fri Nov 01 2019', 700, -1);
    expectEvals(evals, 31, 'Cash', 'Sun Dec 01 2019', 0, -1);
    expectEvals(evals, 32, 'Estate', 'Sun Dec 01 2019', 700, -1);
    expectEvals(evals, 33, 'Cash', 'Sun Dec 01 2019', 100, -1);

    let errorMsg = '';
    const cd: ChartData = calcOptimizer(model, (msg: string) => {
      errorMsg = msg;
    });
    expect(errorMsg).toEqual('');

    // log(`cd === \n${showObj(cd)}`);

    expect(JSON.stringify(cd)).toEqual(
      JSON.stringify({
        labels: [1, 2, 3, 4, 5],
        datasets: [
          {
            label: 'optimisation result',
            data: [1000, 900, 800, 700, 600],
            backgroundColor: 'rgb(78,129,188)',
            barPercentage: 1,
          },
        ],
        displayLegend: true,
      }),
    );
    done();
  });
});
