import { expect } from "@jest/globals";
import { pensionDB } from "../../localization/stringConstants";
import { makeModelFromJSONString } from "../../models/modelFromJSON";
import { makeChartDataFromEvaluations } from "../../models/charting";
import {
  defaultTestViewSettings,
  getTestEvaluations,
} from "./algoTestUtils";
import { CASH_ASSET_NAME } from "../../localization/stringConstants";
import { defaultModelSettings } from "../../models/testModel";

describe("DBP income growth with setting VALUE", () => {
  it("applies IncomeGrowth when VALUE references a setting", () => {
    const modelString = `
    {
      "name":"test",
      "expenses":[],
      "incomes":[],
      "assets":[{
        "NAME":"${CASH_ASSET_NAME}",
        "CATEGORY":"",
        "START":"01 Jan 2020",
        "VALUE":"0",
        "QUANTITY":"",
        "GROWTH":"0",
        "CPI_IMMUNE":true,
        "CAN_BE_NEGATIVE":true,
        "IS_A_DEBT":false,
        "LIABILITY":"",
        "PURCHASE_PRICE":"0",
        "ERA":0
      }],
      "transactions":[],
      "settings":[],
      "monitors":[],
      "triggers":[
        {"NAME":"ZumaAnnuityPayoutStarts","ERA":0,"DATE":"01 Feb 2025"},
        {"NAME":"JeanDies","ERA":0,"DATE":"01 Jan 2030"}
      ],
      "generators":[{
        "NAME":"AnnuityJean",
        "ERA":0,
        "TYPE":"Defined Benefits",
        "DETAILS":{
          "VALUE":"ZumaAnnuityJean",
          "VALUE_SET":"01 Jan 2020",
          "STOP_SOURCE":"01 Jan 2025",
          "START":"ZumaAnnuityPayoutStarts",
          "END":"JeanDies",
          "GROWS_WITH_CPI":"N",
          "IncomeGrowth":"10",
          "TRANSFERRED_STOP":"01 Jan 2035",
          "INCOME_SOURCE":"",
          "SALARY_SACRIFICED":"N",
          "CONTRIBUTION_AMOUNT":"",
          "ACCRUAL":"",
          "TRANSFER_TO":"",
          "TRANSFER_PROPORTION":"0",
          "TAX_LIABILITY":"Joe",
          "CATEGORY":"pension"
        }
      }],
      "version":13
    }`;
    const model = makeModelFromJSONString(modelString);
    const roi = { start: "01 Jan 2025", end: "01 Jan 2028" };
    model.settings = [
      ...defaultModelSettings(roi),
      {
        NAME: "ZumaAnnuityJean",
        VALUE: "1000",
        HINT: "",
        TYPE: "adjustable",
        ERA: 0,
      },
    ];
    const evalsAndValues = getTestEvaluations(model, false);
    const pdbName = pensionDB + "AnnuityJean";

    const may2025 = evalsAndValues.evaluations.find(
      (e) =>
        e.name === pdbName &&
        e.date.d.getFullYear() === 2025 &&
        e.date.d.getMonth() === 4,
    );
    const may2026 = evalsAndValues.evaluations.find(
      (e) =>
        e.name === pdbName &&
        e.date.d.getFullYear() === 2026 &&
        e.date.d.getMonth() === 4,
    );
    expect(may2025?.value).toBeCloseTo(1771.56, 2);
    expect(may2026?.value).toBeCloseTo(1948.72, 2);

    const viewSettings = defaultTestViewSettings();
    const result = makeChartDataFromEvaluations(model, viewSettings, evalsAndValues);
    const pdbChart = result.incomesData.find((i) => i.item.NAME === pdbName);
    expect(pdbChart).toBeDefined();
    const chartPts = pdbChart!.chartDataPoints;
    const may2025Chart = chartPts.find((p) => p.label === "Thu May 01 2025");
    const may2026Chart = chartPts.find((p) => p.label === "Fri May 01 2026");
    expect(may2025Chart?.y).toBeCloseTo(1771.56, 2);
    expect(may2026Chart?.y).toBeCloseTo(1948.72, 2);
    expect(may2026Chart!.y).toBeGreaterThan(may2025Chart!.y);
  });
});
