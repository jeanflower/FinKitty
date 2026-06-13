import {
  CASH_ASSET_NAME,
  custom,
} from "../../localization/stringConstants";
import {
  getIsaAllowanceTableData,
  ISA_COMBINED_ALLOWANCE,
  IsaAllowanceRow,
} from "../../models/planningData";
import { simpleAsset, simpleTransaction } from "../../models/exampleModels";
import { defaultModelSettings } from "../../models/testModel";
import { ModelData } from "../../types/interfaces";
import { getTestEvaluations } from "./algoTestUtils";

function isaAllowanceRowsForModel(model: ModelData): IsaAllowanceRow[] {
  const evals = getTestEvaluations(model, false);
  return getIsaAllowanceTableData(model, { ...evals, reportData: [] });
}

function expectIsaRow(
  rows: IsaAllowanceRow[],
  taxYear: string,
  used: number,
  unused: number,
) {
  const row = rows.find((r) => r.TAX_YEAR === taxYear);
  expect(row).toBeDefined();
  expect(parseFloat(row!.USED)).toBeCloseTo(used, 2);
  expect(parseFloat(row!.UNUSED)).toBeCloseTo(unused, 2);
  expect(
    parseFloat(row!.USED) + parseFloat(row!.UNUSED),
  ).toBeCloseTo(ISA_COMBINED_ALLOWANCE, 2);
}

function makeIsaModel(overrides: Partial<ModelData> = {}): ModelData {
  const roi = {
    start: "1 Jan 2026",
    end: "1 Jan 2028",
  };
  return {
    name: "isa-allowance-test",
    triggers: [],
    expenses: [],
    incomes: [],
    transactions: [],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        START: "1 Jan 2026",
        VALUE: "10000",
        CAN_BE_NEGATIVE: true,
      },
      {
        ...simpleAsset,
        NAME: "StocksISA",
        CATEGORY: "ISA",
        START: "1 Jan 2026",
        VALUE: "0",
        GROWTH: "12",
      },
      {
        ...simpleAsset,
        NAME: "CashISA",
        CATEGORY: "ISA",
        START: "1 Jan 2026",
        VALUE: "0",
      },
    ],
    settings: [...defaultModelSettings(roi)],
    monitors: [],
    generators: [],
    version: 12,
    undoModel: undefined,
    redoModel: undefined,
    ...overrides,
  };
}

describe("getIsaAllowanceTableData", () => {
  it("counts Cash to ISA subscriptions by UK tax year", () => {
    const model = makeIsaModel({
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Invest in stocks ISA",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "5000",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "5000",
          DATE: "10 Apr 2026",
          TYPE: custom,
        },
        {
          ...simpleTransaction,
          NAME: "Invest in cash ISA",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "3000",
          TO: "CashISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "3000",
          DATE: "1 Mar 2027",
          TYPE: custom,
        },
      ],
    });

    const evals = getTestEvaluations(model, false);
    const rows = getIsaAllowanceTableData(model, {
      ...evals,
      reportData: [],
    });

    const y2026 = rows.find((r) => r.TAX_YEAR === "2026/27");
    expect(y2026).toBeDefined();
    expect(parseFloat(y2026!.USED)).toBeCloseTo(8000, 0);
    expect(parseFloat(y2026!.UNUSED)).toBeCloseTo(
      ISA_COMBINED_ALLOWANCE - 8000,
      0,
    );
  });

  it("counts subscriptions from any non-ISA source into an ISA", () => {
    const model = makeIsaModel({
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2026",
          VALUE: "10000",
          CAN_BE_NEGATIVE: true,
        },
        {
          ...simpleAsset,
          NAME: "TaxableStocks",
          CATEGORY: "stock",
          START: "1 Jan 2026",
          VALUE: "5000",
        },
        {
          ...simpleAsset,
          NAME: "StocksISA",
          CATEGORY: "ISA",
          START: "1 Jan 2026",
          VALUE: "0",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Move taxable stocks into ISA",
          FROM: "TaxableStocks",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "1500",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "1500",
          DATE: "10 Apr 2026",
          TYPE: custom,
        },
      ],
    });

    const evals = getTestEvaluations(model, false);
    const rows = getIsaAllowanceTableData(model, {
      ...evals,
      reportData: [],
    });

    const y2026 = rows.find((r) => r.TAX_YEAR === "2026/27");
    expect(y2026).toBeDefined();
    expect(parseFloat(y2026!.USED)).toBeCloseTo(1500, 0);
  });

  it("excludes ISA-to-ISA transfers and growth", () => {
    const model = makeIsaModel({
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Cash to stocks ISA",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "2000",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "2000",
          DATE: "10 Apr 2026",
          TYPE: custom,
        },
        {
          ...simpleTransaction,
          NAME: "Move between ISAs",
          FROM: "StocksISA",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "500",
          TO: "CashISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "500",
          DATE: "1 May 2026",
          TYPE: custom,
        },
      ],
    });

    const evals = getTestEvaluations(model, false);
    const rows = getIsaAllowanceTableData(model, {
      ...evals,
      reportData: [],
    });

    const y2026 = rows.find((r) => r.TAX_YEAR === "2026/27");
    expect(y2026).toBeDefined();
    expect(parseFloat(y2026!.USED)).toBeCloseTo(2000, 0);
  });

  it("returns no rows when the model has no ISA-category assets", () => {
    const model = makeIsaModel({
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2026",
          VALUE: "1000",
          CAN_BE_NEGATIVE: true,
        },
        {
          ...simpleAsset,
          NAME: "Stocks",
          CATEGORY: "stock",
          START: "1 Jan 2026",
          VALUE: "0",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "Invest in stocks",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "100",
          TO: "Stocks",
          TO_ABSOLUTE: true,
          TO_VALUE: "100",
          DATE: "10 Apr 2026",
          TYPE: custom,
        },
      ],
    });

    const rows = isaAllowanceRowsForModel(model);
    expect(rows).toEqual([]);
  });
});

describe("getIsaAllowanceTableData table contents", () => {
  it("returns tax years in range with zero used and full unused allowance", () => {
    const model = makeIsaModel({
      settings: [...defaultModelSettings({ start: "1 Apr 2026", end: "1 Apr 2028" })],
      transactions: [],
    });

    const rows = isaAllowanceRowsForModel(model);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.TAX_YEAR).toMatch(/^\d{4}\/\d{2}$/);
      expect(parseFloat(row.USED)).toBe(0);
      expect(parseFloat(row.UNUSED)).toBe(ISA_COMBINED_ALLOWANCE);
    }
  });

  it("formats 2024/25 as cash subscription plus pension tax-free routings", () => {
    const roi = { start: "1 Apr 2024", end: "1 Apr 2027" };
    const taxFreeDates = [
      { date: "25 Apr 2024", suffix: "Apr" },
      { date: "25 May 2024", suffix: "May" },
      { date: "25 Jun 2024", suffix: "Jun" },
      { date: "25 Jul 2024", suffix: "Jul" },
      { date: "25 Aug 2024", suffix: "Aug" },
      { date: "25 Sept 2024", suffix: "Sept" },
    ];
    const model = makeIsaModel({
      settings: [...defaultModelSettings(roi)],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Apr 2024",
          VALUE: "50000",
          CAN_BE_NEGATIVE: true,
        },
        {
          ...simpleAsset,
          NAME: "-CPTaxFree JeanRoyalLondon",
          START: "1 Apr 2024",
          VALUE: "10000",
        },
        {
          ...simpleAsset,
          NAME: "StocksISA",
          CATEGORY: "ISA",
          START: "1 Apr 2024",
          VALUE: "0",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "ISAUseJean24-25Allowance",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "16752",
          TO: "StocksISA",
          TO_ABSOLUTE: false,
          TO_VALUE: "1",
          DATE: "31 Aug 2024",
          TYPE: custom,
        },
        ...taxFreeDates.map(({ date, suffix }) => ({
          ...simpleTransaction,
          NAME: `TaxReduceJeanPensionSaleForBondsNewTaxFree ${suffix}`,
          FROM: "-CPTaxFree JeanRoyalLondon",
          FROM_ABSOLUTE: true,
          FROM_VALUE: "765",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "765",
          DATE: date,
          TYPE: custom,
        })),
      ],
    });

    const rows = isaAllowanceRowsForModel(model);
    expectIsaRow(rows, "2024/25", 21342, 18658);
  });

  it("formats 2025/26 from a full non-ISA to ISA consolidation transfer", () => {
    const model = makeIsaModel({
      settings: [...defaultModelSettings({ start: "1 Apr 2025", end: "1 Apr 2028" })],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Apr 2025",
          VALUE: "0",
          CAN_BE_NEGATIVE: true,
        },
        {
          ...simpleAsset,
          NAME: "YorkshireCushion",
          CATEGORY: "Savings",
          START: "1 Apr 2025",
          VALUE: "22691.56",
        },
        {
          ...simpleAsset,
          NAME: "StocksISA",
          CATEGORY: "ISA",
          START: "1 Apr 2025",
          VALUE: "20890",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "YorkshireConsolidate2026",
          FROM: "YorkshireCushion",
          FROM_ABSOLUTE: false,
          FROM_VALUE: "1",
          TO: "StocksISA",
          TO_ABSOLUTE: false,
          TO_VALUE: "1",
          DATE: "5 Apr 2026",
          TYPE: custom,
        },
      ],
    });

    const rows = isaAllowanceRowsForModel(model);
    expectIsaRow(rows, "2025/26", 22691.56, ISA_COMBINED_ALLOWANCE - 22691.56);
  });

  it("lists multiple tax years with independent used and unused totals", () => {
    const model = makeIsaModel({
      settings: [...defaultModelSettings({ start: "1 Apr 2020", end: "1 Apr 2028" })],
      assets: [
        {
          ...simpleAsset,
          NAME: CASH_ASSET_NAME,
          START: "1 Jan 2017",
          VALUE: "100000",
          CAN_BE_NEGATIVE: true,
        },
        {
          ...simpleAsset,
          NAME: "StocksISA",
          CATEGORY: "ISA",
          START: "1 Jan 2017",
          VALUE: "0",
        },
        {
          ...simpleAsset,
          NAME: "CashISA",
          CATEGORY: "ISA",
          START: "1 Jan 2017",
          VALUE: "0",
        },
      ],
      transactions: [
        {
          ...simpleTransaction,
          NAME: "ISA 2020",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "20000",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "20000",
          DATE: "10 Apr 2020",
          TYPE: custom,
        },
        {
          ...simpleTransaction,
          NAME: "ISA 2021",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "20000",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "20000",
          DATE: "10 Apr 2021",
          TYPE: custom,
        },
        {
          ...simpleTransaction,
          NAME: "ISA 2026",
          FROM: CASH_ASSET_NAME,
          FROM_ABSOLUTE: true,
          FROM_VALUE: "5000",
          TO: "StocksISA",
          TO_ABSOLUTE: true,
          TO_VALUE: "5000",
          DATE: "10 Apr 2026",
          TYPE: custom,
        },
      ],
    });

    const rows = isaAllowanceRowsForModel(model);
    expectIsaRow(rows, "2020/21", 20000, 20000);
    expectIsaRow(rows, "2021/22", 20000, 20000);
    expectIsaRow(rows, "2026/27", 5000, ISA_COMBINED_ALLOWANCE - 5000);
  });
});
