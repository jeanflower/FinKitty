
import { simpleExpense, simpleIncome, simpleTransaction } from "../../models/exampleModels";
import { viewFrequency, annually, viewType, chartDeltas, chartViewType, revalueSetting } from "../../localization/stringConstants";
import { makeChartDataFromEvaluations } from "../../models/charting";
import { makeModelFromJSON, makeModelFromJSONString } from "../../models/modelFromJSON";
import { setSetting } from "../../models/modelUtils";
import { log, printAllLogs, printDebug, saveLogs } from "../../utils/utils";
import {
  defaultTestViewSettings,
  expectChartData,
  getTestEvaluations,
  printTestCodeForChart,
  printTestCodeForEvals,
} from "./algoTestUtils";

describe("bonds tests", () => {
  /* istanbul ignore if  */
  if (printDebug()) {
    log;
    printTestCodeForEvals;
    printTestCodeForChart;
  }

  it('bond generator Cash to Cash Growth 0', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
  
    const modelString = `
    {
      "name":"DPBModel",
      "expenses":[],
      "incomes":[],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"1000.0",
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
        {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
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
            "START": "01 Jul 2020",
            "DURATION": "4y",
            "SOURCE": "Cash",
            "TARGET": "Cash",
            "YEAR": "2026",
            "RECURRENCE": "",
            "RECURRENCE_STOP": ""
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSONString(modelString);
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "April 1 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "April 1 2026",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Wed Apr 01 2020', 1000, -1);
    expectChartData(chartPts, 1, 'Thu Apr 01 2021', 900, -1);
    expectChartData(chartPts, 2, 'Fri Apr 01 2022', 900, -1);
    expectChartData(chartPts, 3, 'Sat Apr 01 2023', 900, -1);
    expectChartData(chartPts, 4, 'Mon Apr 01 2024', 900, -1);
    expectChartData(chartPts, 5, 'Tue Apr 01 2025', 1000, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('MyFirstBond');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Apr 01 2021', 100, 2);
    expectChartData(chartPts, 2, 'Fri Apr 01 2022', 100, 2);
    expectChartData(chartPts, 3, 'Sat Apr 01 2023', 100, 2);
    expectChartData(chartPts, 4, 'Mon Apr 01 2024', 100, 2);
    expectChartData(chartPts, 5, 'Tue Apr 01 2025', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('bond generator Cash to Cash Growth 2', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
  
    const modelString = `
    {
      "name":"DPBModel",
      "expenses":[],
      "incomes":[],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"1000.0",
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
        {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
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
            "GROWTH": "2",
            "CATEGORY": "Bonds",
            "START": "01 Jul 2020",
            "DURATION": "4y",
            "SOURCE": "Cash",
            "TARGET": "Cash",
            "YEAR": "2026",
            "RECURRENCE": "",
            "RECURRENCE_STOP": ""
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSONString(modelString);
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "April 1 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "April 1 2026",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(2);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Wed Apr 01 2020', 1000, -1);
    expectChartData(chartPts, 1, 'Thu Apr 01 2021', 900, -1);
    expectChartData(chartPts, 2, 'Fri Apr 01 2022', 900, -1);
    expectChartData(chartPts, 3, 'Sat Apr 01 2023', 900, -1);
    expectChartData(chartPts, 4, 'Mon Apr 01 2024', 900, -1);
    expectChartData(chartPts, 5, 'Tue Apr 01 2025', 1008.24, 2);
    }
    
    expect(result.assetData[1].item.NAME).toBe('MyFirstBond');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(6);
    expectChartData(chartPts, 0, 'Wed Apr 01 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Apr 01 2021', 101.50, 2);
    expectChartData(chartPts, 2, 'Fri Apr 01 2022', 103.53, 2);
    expectChartData(chartPts, 3, 'Sat Apr 01 2023', 105.60, 2);
    expectChartData(chartPts, 4, 'Mon Apr 01 2024', 107.71, 2);
    expectChartData(chartPts, 5, 'Tue Apr 01 2025', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });
  
  it('bond generator Recurring for phone no cpi no growth', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
  
    const modelString = `
    {
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
            "RECURRENCE_STOP": "02 Jul 2024"
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "100",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
    ];
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(3);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 100000, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 98800, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 97600, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 97600, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 97600, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 97600, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 97600, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 96400, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 96400, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 96400, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 1200, -1); // No cpi, no growth 
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 1200, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 1200, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 1200, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 1200, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 1200, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 1200, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('bond generator Recurring for phone no cpi 10 growth', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);

    const modelString = `
    {
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
            "GROWTH": "10",
            "CATEGORY": "Bonds",
            "START": "01 Jul 2021",
            "DURATION": "4y",
            "SOURCE": "Cash",
            "TARGET": "Cash",
            "YEAR": "2026",
            "RECURRENCE": "1y",
            "RECURRENCE_STOP": "2 Jul 2024"
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "100",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
    ];
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(11);
    expect(result.assetData[0].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', -819.62, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 819.62, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('growth/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 33.20, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 85.28, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 93.81, 2);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 103.19, 2);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 64.90, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[3].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/Cash');
    {
    const chartPts = result.assetData[3].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', -819.62, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[4].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[4].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 819.62, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[5].item.NAME).toBe('growth/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[5].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 33.20, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 85.28, 2);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 93.81, 2);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 103.19, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 64.90, 2);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[6].item.NAME).toBe('Phon/Cash');
    {
    const chartPts = result.assetData[6].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', -1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[7].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[7].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200.00, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[8].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/Cash');
    {
    const chartPts = result.assetData[8].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[9].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[9].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200.00, 2);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[10].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/Cash');
    {
    const chartPts = result.assetData[10].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('bond generator Recurring for phone no cpi -10 growth', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);

    const modelString = `
    {
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
            "GROWTH": "-10",
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
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "100",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
    ];
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
      expect(result.expensesData.length).toBe(1);
      expect(result.expensesData[0].item.NAME).toBe('Phon');
      {
      const chartPts = result.expensesData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 1200, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.incomesData.length).toBe(0);
      expect(result.assetData.length).toBe(11);
      expect(result.assetData[0].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/Cash');
      {
      const chartPts = result.assetData[0].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', -1828.99, 2);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[1].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/MyFirstBondJul21GenFor2026');
      {
      const chartPts = result.assetData[1].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 1828.99, 2);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[2].item.NAME).toBe('growth/MyFirstBondJul21GenFor2026');
      {
      const chartPts = result.assetData[2].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', -78.56, 2);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', -175.04, 2);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', -157.54, 2);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', -141.79, 2);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', -76.07, 2);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[3].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/Cash');
      {
      const chartPts = result.assetData[3].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', -1828.99, 2);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[4].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/MyFirstBondJul22GenFor2027');
      {
      const chartPts = result.assetData[4].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 1828.99, 2);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[5].item.NAME).toBe('growth/MyFirstBondJul22GenFor2027');
      {
      const chartPts = result.assetData[5].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', -78.56, 2);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', -175.04, 2);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', -157.54, 2);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', -141.79, 2);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', -76.07, 2);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[6].item.NAME).toBe('Phon/Cash');
      {
      const chartPts = result.assetData[6].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', -1200, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[7].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/MyFirstBondJul21GenFor2026');
      {
      const chartPts = result.assetData[7].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200.00, 2);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[8].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/Cash');
      {
      const chartPts = result.assetData[8].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[9].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/MyFirstBondJul22GenFor2027');
      {
      const chartPts = result.assetData[9].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200.00, 2);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.assetData[10].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/Cash');
      {
      const chartPts = result.assetData[10].chartDataPoints;
      expect(chartPts.length).toBe(10);
      expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
      expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
      expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
      expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
      expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
      expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
      expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
      expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
      expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
      expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
      }
      
      expect(result.debtData.length).toBe(0);
      expect(result.taxData.length).toBe(0);
  });

  it('bond generator Recurring for phone 15 cpi -10 growth', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);

    const modelString = `
    {
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
        {"NAME":"cpi","VALUE":"15","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
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
            "GROWTH": "-10",
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
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "100",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
    ];
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(11);
    expect(result.assetData[0].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', -987.24, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 987.24, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('growth/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 20.28, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 50.38, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 52.89, 2);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 55.54, 2);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 33.67, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[3].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/Cash');
    {
    const chartPts = result.assetData[3].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', -987.24, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[4].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[4].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 987.24, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[5].item.NAME).toBe('growth/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[5].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 20.28, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 50.38, 2);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 52.89, 2);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 55.54, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 33.67, 2);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[6].item.NAME).toBe('Phon/Cash');
    {
    const chartPts = result.assetData[6].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', -1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[7].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[7].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200.00, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[8].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/Cash');
    {
    const chartPts = result.assetData[8].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[9].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[9].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200.00, 2);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[10].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/Cash');
    {
    const chartPts = result.assetData[10].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('bond generator Recurring A to B no cpi no growth', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
  
    const modelString = `
    {
      "name":"DPBModel",
      "expenses":[],
      "incomes":[],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"0.0",
          "QUANTITY":"",
          "GROWTH":"0.0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":true,
          "IS_A_DEBT":false,
          "LIABILITY":"",
          "PURCHASE_PRICE":"0.0",
          "ERA":0
        },
        {
          "NAME":"A",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"10000.0",
          "QUANTITY":"",
          "GROWTH":"0.0",
          "CPI_IMMUNE":true,
          "CAN_BE_NEGATIVE":true,
          "IS_A_DEBT":false,
          "LIABILITY":"",
          "PURCHASE_PRICE":"0.0",
          "ERA":0
        },
        {
          "NAME":"B",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"0.0",
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
            "SOURCE": "A",
            "TARGET": "B",
            "YEAR": "2026",
            "RECURRENCE": "1y",
            "RECURRENCE_STOP": "02 Jul 2024"
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "30",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
      {
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Food",
        VALUE: "30",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
      {
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Dining",
        VALUE: "30",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Leisure',
      },
      {
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Cinema",
        VALUE: "30",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Leisure',
      },    
    ];
    model.incomes = [{
      ...simpleIncome,
      START: "January 1 2025",
      END: "January 1 2028",
      NAME: "PRound",
      VALUE: "20",
      VALUE_SET: "January 1 2018",
      CPI_IMMUNE: true,
    }]
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(4);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 360, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 360, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 360, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.expensesData[1].item.NAME).toBe('Food');
    {
    const chartPts = result.expensesData[1].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 360, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 360, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 360, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.expensesData[2].item.NAME).toBe('Dining');
    {
    const chartPts = result.expensesData[2].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 360, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 360, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 360, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.expensesData[3].item.NAME).toBe('Cinema');
    {
    const chartPts = result.expensesData[3].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 360, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 360, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 360, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(1);
    expect(result.incomesData[0].item.NAME).toBe('PRound');
    {
    const chartPts = result.incomesData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 240, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 240, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 240, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData.length).toBe(5);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -2400, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', -3600, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', -3600, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', -3600, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('A');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 10000, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 8560, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 7120, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 7120, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 7120, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 7120, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 7120, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 7120, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 7120, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 7120, -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('B');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1440, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 2880, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 2880, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 2880, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 2880, -1);
    }
    
    expect(result.assetData[3].item.NAME).toBe('MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[3].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 1440, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 1440, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 1440, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 1440, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[4].item.NAME).toBe('MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[4].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 1440, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 1440, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 1440, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1440, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('bond generator Recurring uses setting', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
    viewSettings.setViewSetting(chartViewType, chartDeltas);

    const modelString = `
    {
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
        {"NAME":"cpi","VALUE":"15","HINT":"Annual rate of inflation","TYPE":"const","ERA":0},

        {"NAME":"bondRate","VALUE":"0","HINT":"Bond rate","TYPE":"adjustable","ERA":0}
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
            "GROWTH": "bondRate",
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
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "100",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
    ];
    model.transactions = [
      {
        ...simpleTransaction,
        NAME: "Revalue of bond rate 1",
        TO: "bondRate",
        TO_VALUE: "-10",
        DATE: "30 Jun 2021",
        TYPE: revalueSetting,
      },
      {
        ...simpleTransaction,
        NAME: "Revalue of bond rate 2",
        TO: "bondRate",
        TO_VALUE: "0",
        DATE: "30 Jun 2022",
        TYPE: revalueSetting,
      },   
    ];
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2020",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(1);
    expect(result.expensesData[0].item.NAME).toBe('Phon');
    {
    const chartPts = result.expensesData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(11);
    expect(result.assetData[0].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', -987.24, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[1].item.NAME).toBe('MyFirstBondJul21GenFor2026Invest/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[1].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 987.24, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[2].item.NAME).toBe('growth/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[2].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 20.28, 2);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 50.38, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 52.89, 2);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 55.54, 2);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 33.67, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[3].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/Cash');
    {
    const chartPts = result.assetData[3].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', -686.10, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[4].item.NAME).toBe('MyFirstBondJul22GenFor2027Invest/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[4].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 686.10, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[5].item.NAME).toBe('growth/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[5].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 41.14, 2);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 109.09, 2);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 125.45, 2);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 144.27, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 93.95, 2);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[6].item.NAME).toBe('Phon/Cash');
    {
    const chartPts = result.assetData[6].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', -1200, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[7].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/MyFirstBondJul21GenFor2026');
    {
    const chartPts = result.assetData[7].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', -1200.00, 2);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[8].item.NAME).toBe('MyFirstBondJul21GenFor2026Mature/Cash');
    {
    const chartPts = result.assetData[8].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 1200, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 0, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[9].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/MyFirstBondJul22GenFor2027');
    {
    const chartPts = result.assetData[9].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', -1200.00, 2);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.assetData[10].item.NAME).toBe('MyFirstBondJul22GenFor2027Mature/Cash');
    {
    const chartPts = result.assetData[10].chartDataPoints;
    expect(chartPts.length).toBe(10);
    expectChartData(chartPts, 0, 'Wed Dec 30 2020', 0, -1);
    expectChartData(chartPts, 1, 'Thu Dec 30 2021', 0, -1);
    expectChartData(chartPts, 2, 'Fri Dec 30 2022', 0, -1);
    expectChartData(chartPts, 3, 'Sat Dec 30 2023', 0, -1);
    expectChartData(chartPts, 4, 'Mon Dec 30 2024', 0, -1);
    expectChartData(chartPts, 5, 'Tue Dec 30 2025', 0, -1);
    expectChartData(chartPts, 6, 'Wed Dec 30 2026', 1200, -1);
    expectChartData(chartPts, 7, 'Thu Dec 30 2027', 0, -1);
    expectChartData(chartPts, 8, 'Sat Dec 30 2028', 0, -1);
    expectChartData(chartPts, 9, 'Sun Dec 30 2029', 0, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });

  it('bond generator view start after bonds', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);
  
    const modelString = `
    {
      "name":"DPBModel",
      "expenses":[],
      "incomes":[],
      "assets":[
        {
          "NAME":"Cash",
          "CATEGORY":"",
          "START":"01 Jan 2017",
          "VALUE":"1000.0",
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
        {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0}
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
            "GROWTH": "2",
            "CATEGORY": "Bonds",
            "START": "01 Jul 2020",
            "DURATION": "4y",
            "SOURCE": "Cash",
            "TARGET": "Cash",
            "YEAR": "2026",
            "RECURRENCE": "",
            "RECURRENCE_STOP": ""
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSONString(modelString);
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "April 1 2025",
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "April 1 2026",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );
  
    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(1);
    expectChartData(chartPts, 0, 'Tue Apr 01 2025', 1008.24, 2);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });


  it('bond generator Recurring for phone no cpi 10 growth view start after bonds', () => {
    const viewSettings = defaultTestViewSettings();
    viewSettings.setViewSetting(viewFrequency, annually);

    const modelString = `
    {
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
            "GROWTH": "10",
            "CATEGORY": "Bonds",
            "START": "01 Jul 2021",
            "DURATION": "4y",
            "SOURCE": "Cash",
            "TARGET": "Cash",
            "YEAR": "2026",
            "RECURRENCE": "1y",
            "RECURRENCE_STOP": "2 Jul 2024"
          }
        }
      ],
      "version":13
    }
    `;
    const model = makeModelFromJSON(modelString);
    model.expenses = [{
        ...simpleExpense,
        START: "January 1 2025",
        END: "January 1 2028",
        NAME: "Phon",
        VALUE: "100",
        VALUE_SET: "January 1 2018",
        CPI_IMMUNE: true,
        CATEGORY: 'Basic',
      },
    ];
  
    setSetting(
      model.settings,
      `Beginning of view range`,
      "Dec 30 2029", // start late but expect the same end cash value
      viewType,
    );
    setSetting(
      model.settings,
      `End of view range`,
      "Dec 30 2030",
      viewType,
    );
  
    const evalsAndValues = getTestEvaluations(
      model,
    );

    // log(evalsAndValues.todaysAssetValues);
    // log(evalsAndValues.todaysDebtValues);
    // log(evalsAndValues.todaysExpenseValues);
    // log(evalsAndValues.todaysIncomeValues);
    // log(evalsAndValues.todaysSettingValues);
  
    // printTestCodeForEvals(evalsAndValues.evaluations);
  
    const result = makeChartDataFromEvaluations(
      model,
      viewSettings,
      evalsAndValues,
    );
  
    // printTestCodeForChart(result);
  
    expect(result.expensesData.length).toBe(0);
    expect(result.incomesData.length).toBe(0);
    expect(result.assetData.length).toBe(1);
    expect(result.assetData[0].item.NAME).toBe('Cash');
    {
    const chartPts = result.assetData[0].chartDataPoints;
    expect(chartPts.length).toBe(1);
    expectChartData(chartPts, 0, 'Sun Dec 30 2029', 97160.77, -1);
    }
    
    expect(result.debtData.length).toBe(0);
    expect(result.taxData.length).toBe(0);
  });
})
