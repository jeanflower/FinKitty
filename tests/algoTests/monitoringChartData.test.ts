import { getMonitoringChartData } from "../../models/planningData";
import {
  Asset,
  Expense,
  Income,
  ModelData,
  Setting,
} from "../../types/interfaces";
import { FinKittyDate } from "../../utils/utils";

function emptyMonitoringEvals() {
  return {
    evaluations: [],
    todaysAssetValues: new Map(),
    todaysDebtValues: new Map(),
    todaysIncomeValues: new Map(),
    todaysExpenseValues: new Map(),
    todaysSettingValues: new Map(),
    reportData: [],
  };
}

describe("getMonitoringChartData", () => {
  it("buckets expected Basic/Leisure spend by calendar month from the 1st", () => {
    const model: ModelData = {
      name: "monitoring-bucket-test",
      triggers: [],
      expenses: [
        {
          NAME: "Food",
          CATEGORY: "Basic",
          START: "1 Jan 2026",
          END: "1 Jan 2027",
          VALUE: "10",
          VALUE_SET: "1 Jan 2026",
          CPI_IMMUNE: false,
          RECURRENCE: "1m",
          ERA: 0,
        } as Expense,
        {
          NAME: "Fun",
          CATEGORY: "Leisure",
          START: "1 Jan 2026",
          END: "1 Jan 2027",
          VALUE: "5",
          VALUE_SET: "1 Jan 2026",
          CPI_IMMUNE: false,
          RECURRENCE: "1m",
          ERA: 0,
        } as Expense,
      ],
      incomes: [] as Income[],
      transactions: [],
      assets: [] as Asset[],
      settings: [] as Setting[],
      monitors: [],
      generators: [],
      version: 12,
      undoModel: undefined,
      redoModel: undefined,
    };

    const evals = {
      ...emptyMonitoringEvals(),
      evaluations: [
        {
          name: "Food",
          date: new FinKittyDate(new Date(2026, 0, 15)),
          oldValue: 0,
          value: 100,
          source: "expense",
        },
        {
          name: "Food",
          date: new FinKittyDate(new Date(2026, 1, 1)),
          oldValue: 0,
          value: 110,
          source: "expense",
        },
        {
          name: "Fun",
          date: new FinKittyDate(new Date(2026, 1, 20)),
          oldValue: 0,
          value: 50,
          source: "expense",
        },
      ],
    };

    const result = getMonitoringChartData(model, evals, 2026);

    expect(result.months[0]).toBe("Jan 2026");
    expect(result.months[1]).toBe("Feb 2026");
    expect(result.expectedBasic[0]).toBe(100);
    expect(result.expectedBasic[1]).toBe(110);
    expect(result.expectedLeisure[1]).toBe(50);
    expect(result.expectedLeisure[0]).toBe(0);
  });
});
