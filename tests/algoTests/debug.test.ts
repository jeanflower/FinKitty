import { makeModelFromJSON } from "../../models/modelFromJSON";
import { log, printDebug } from "../../utils/utils";
import {
  printTestCodeForEvals,
  expectEvals,
  expectChartData,
  printTestCodeForChart,
  getTestEvaluations,
} from "./algoTestUtils";

expectEvals;
expectChartData;
printTestCodeForChart;

describe("debug test", () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
  }

  it("debug test", () => {
    const json = `{
      "name":"DPBModel",
      "expenses":[],
      "incomes":[],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"100000.0",
          "QUANTITY":"",
          "GROWTH":"0.0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":true,
          "IS_A_DEBT":false,
          "LIABILITY":"",
          "PURCHASE_PRICE":"0.0",
          "ERA":0
        }
      ],
      "transactions":[],
      "settings":[
        {"NAME":"View frequencyTransactions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyTax","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencySettings","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyPlanning","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyOverview","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyOptimizer","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyMonitoring","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyIncomes","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyHome","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyExpenses","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyDebts","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyDates","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyAssets","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
        {"NAME":"View frequencyAsset actions","VALUE":"Annually","HINT":"","TYPE":"view","ERA":0},
  
        {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},
  
        {"NAME":"Beginning of view range","VALUE":"01 Jan 2019","HINT":"","TYPE":"const","ERA":0},
        {"NAME":"End of view range","VALUE":"01 Feb 2034","HINT":"","TYPE":"const","ERA":0},
  
        {"NAME":"Beginning of monitor range","VALUE":"Nov 2022","HINT":"","TYPE":"adjustable","ERA":0},
        {"NAME":"End of monitor range","VALUE":"Nov 2023","HINT":"","TYPE":"adjustable","ERA":0},
        {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
        {"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
      ],
      "monitors":[],
      "triggers":[],
      "generators":[
        {
          "NAME":"MyFirstBond",
          "ERA":"0",
          "TYPE":"Bonds",
          "DETAILS":{
            "VALUE": "100",
            "GROWTH": "0",
            "CATEGORY": "Bonds",
            "START": "01 Jul 2021",
            "DURATION": "4y",
            "SOURCE": "Cash",
            "TARGET": "Cash",
            "YEAR": "2026",
            "RECURRENCE": "1y",
            "RECURRENCE_STOP": "2024"
          }
        }
      ],
      "version":13
    }
    `;

    const model = makeModelFromJSON(json);

    const evalsAndValues = getTestEvaluations(model);
    const evals = evalsAndValues.evaluations;
    evals;
    // log(`evals = ${showObj(evals)}`);

    // printTestCodeForEvals(evals);
  });
});

/*
Put notes here

*/
