import { makeModelFromJSON } from '../../models/modelUtils';
import { log, printDebug } from '../../utils/utils';
import {
  printTestCodeForEvals,
  expectEvals,
  expectChartData,
  printTestCodeForChart,
  getTestEvaluations,
} from './algoTestUtils';

expectEvals;
expectChartData;
printTestCodeForChart;
makeModelFromJSON;

describe('debug test', () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it('debug test', () => {
    const json = `{"triggers":[
{"NAME":"StartBonds50k","DATE":"Tue Jan 01 2030"},
{"NAME":"Start","DATE":"Sat Apr 06 2019"},
{"NAME":"BothDead","DATE":"Tue Jan 01 2034"}],
"expenses":[],
"incomes":[],
"transactions":[{"NAME":"Revaluecpi 6","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"0","DATE":"6 April 2027","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
{"NAME":"Revaluecpi 1","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"cpi","TO_ABSOLUTE":true,"TO_VALUE":"0.8","DATE":"Wed Apr 01 2020","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
{"NAME":"RevalueBondMediumTargetValue 1","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0","TO":"BondMediumTargetValue","TO_ABSOLUTE":true,"TO_VALUE":"50000","DATE":"Start","TYPE":"revalueSetting","RECURRENCE":"","STOP_DATE":"","CATEGORY":""},
{"DATE":"StartBonds50k+5y","FROM":"FixedTermBonds","FROM_VALUE":"BMVBondMediumTargetValue","FROM_ABSOLUTE":true,"NAME":"MatureBondJeanPension5y","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"StartBonds50k+11y","RECURRENCE":"","TYPE":"bondMature","CATEGORY":""},
{"DATE":"BothDead","FROM":"Cash/Bonds","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CreateEstate","TO":"Estate","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"custom","CATEGORY":""},
{"DATE":"StartBonds50k","FROM":"Cash","FROM_VALUE":"BMVBondMediumTargetValue","FROM_ABSOLUTE":true,"NAME":"BuyBondJeanPension5y","TO":"FixedTermBonds","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"StartBonds50k+6y","RECURRENCE":"","TYPE":"bondInvest","CATEGORY":""}],
"assets":[{"NAME":"FixedTermBonds","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":"Bonds"},
{"NAME":"Estate","VALUE":"0","QUANTITY":"","START":"BothDead","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
{"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"Start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""}],
"settings":[{"NAME":"variableLow","VALUE":"0","HINT":"","TYPE":"adjustable"},
{"NAME":"variableHigh","VALUE":"1","HINT":"","TYPE":"adjustable"},
{"NAME":"variableCount","VALUE":"2","HINT":"","TYPE":"adjustable"},
{"NAME":"variable","VALUE":"0","HINT":"","TYPE":"adjustable"},
{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"Fri Dec 01 2035","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"BondMediumTargetValue","VALUE":"0","HINT":"","TYPE":"adjustable"},
{"NAME":"bondInterest","VALUE":"-3.15","HINT":"","TYPE":"adjustable"},
{"NAME":"Beginning of view range","VALUE":"Sat Jan 05 2019+variable1d","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
"version":9,"name":"x"}`;

    const model = makeModelFromJSON(json);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    evals;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
  });
});

/*


  ●  chart data tests › early view end date

    expect(received).toBeCloseTo(expected, precision)

    Expected: -7260
    Received: -7317.892259513855

    Expected precision:    2
    Expected difference: < 0.005
    Received difference:   57.8922595138547

      117 |     expect(pts[i].y).toBeCloseTo(val, undefined);
      118 |   } else {
    > 119 |     expect(pts[i].y).toBeCloseTo(val, numDigits);
          |                      ^
      120 |   }
      121 | }
      122 |

      at expectChartData (src/tests/algoTests/algoTestUtils.ts:119:22)
      at Object.<anonymous> (src/tests/algoTests/algoChart.test.ts:2626:7)

Test Suites: 2 failed, 2 total
Tests:       4 failed, 53 passed, 57 total
Snapshots:   0 total
Time:        3.255 s, estimated 6 s
Ran all test suites related to changed files.

Watch Usage: Press w to show more.

*/
