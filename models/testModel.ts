import {
  TestModel01,
  TestModel02,
  CoarseAndFine,
  FutureExpense,
  ThreeChryslerModel,
  MinimalModel,
  BenAndJerryModel,
  CASH_ASSET_NAME,
  birthDate,
  birthDateHint,
  constType,
  cpi,
  cpiHint,
  incomeTax,
  payOffDebt,
  revalueAsset,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  valueFocusDate,
  valueFocusDateHint,
  viewType,
  allItems,
  annually,
  assetChartFocus,
  chartVals,
  chartViewType,
  expenseChartFocus,
  fineDetail,
  incomeChartFocus,
  viewDetail,
  viewFrequency,
  monthly,
  crystallizedPension,
  moveTaxFreePart,
  pensionPrefix,
  pensionDB,
  pensionTransfer,
  taxFree,
  transferCrystallizedPension,
  adjustableType,
  monitorEnd,
  monitorStart,
  DBPModel,
  monitorModel,
} from "../localization/stringConstants";
import { ModelData, Setting } from "../types/interfaces";
import {
  getModelCoarseAndFineForMigration,
  getThreeChryslerModelForMigration,
  definedBenefitsPension,
  definedContributionsPension,
  pensionExampleData,
  getPensionExampleData,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleTransaction,
  emptyModel,
  getDefinedBenefitsPension,
  getDefinedContributionsPension,
  getMonitorExampleData,
} from "./exampleModels";
import { setSetting } from "./modelUtils";
import { simpleSetting, viewSetting } from "./exampleSettings";
import { allViews } from "../utils/allViews";
import { getMinimalModelCopy } from "./minimalModel";
import { makeModelFromJSON } from "./modelFromJSON";

const browserTestSettingsForMigration: Setting[] = [
  {
    ...viewSetting,
    NAME: roiStart,
    VALUE: "1 Jan 2019",
    HINT: roiStartHint,
  },
  {
    ...viewSetting,
    NAME: roiEnd,
    VALUE: "1 Feb 2019",
    HINT: roiEndHint,
  },
  {
    ...viewSetting,
    NAME: chartViewType,
    VALUE: chartVals, // could be 'deltas'
  },
].concat(
  allViews.map((v) => {
    return {
      ...viewSetting,
      NAME: `${viewFrequency}${v.lc}`,
      VALUE: annually, // could be 'Monthly'
    };
  }),
  allViews.map((v) => {
    return {
      ...viewSetting,
      NAME: `${viewDetail}${v.lc}`,
      VALUE: fineDetail, // could be coarse
    };
  }),
  [
    {
      ...simpleSetting,
      NAME: cpi,
      VALUE: "2.5",
      HINT: cpiHint,
    },
    {
      ...simpleSetting,
      NAME: "stockMarketGrowth",
      VALUE: "6.236",
      HINT: "Custom setting for stock market growth",
    },
    {
      ...viewSetting,
      NAME: assetChartFocus,
      VALUE: CASH_ASSET_NAME,
    },
    {
      ...viewSetting,
      NAME: expenseChartFocus,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: incomeChartFocus,
      VALUE: allItems,
    },
    {
      ...viewSetting,
      NAME: birthDate,
      VALUE: "",
      HINT: birthDateHint,
    },
    {
      ...viewSetting,
      NAME: valueFocusDate,
      VALUE: "",
      HINT: valueFocusDateHint,
    },
  ],
);

function getTestModel01ForMigration() {
  const model: ModelData = {
    name: "TestModel01ForMigration",
    expenses: [
      {
        ...simpleExpense,
        NAME: "Look after dogs",
        VALUE: "500",
        VALUE_SET: "1 April 2018",
        START: "1 April 2018",
        END: "2 February 2047",
        CATEGORY: "living costs",
      },
      {
        ...simpleExpense,
        NAME: "Run car",
        VALUE: "700",
        VALUE_SET: "1 April 2018",
        START: "1 April 2018",
        END: "GetRidOfCar",
        CATEGORY: "living costs",
      },
      {
        ...simpleExpense,
        NAME: "Run house",
        VALUE: "1300",
        VALUE_SET: "1 April 2018",
        START: "1 April 2018",
        END: "2 February 2099",
        CATEGORY: "living costs",
      },
    ],
    incomes: [
      {
        ...simpleIncome,
        NAME: "Main income",
        VALUE: "3500",
        VALUE_SET: "1 March 2018",
        START: "1 March 2018",
        END: "StopMainWork",
        LIABILITY: `Joe${incomeTax}`,
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        START: "December 2017",
        VALUE: "2000",
      },
      {
        ...simpleAsset,
        NAME: "Stocks",
        START: "December 2017",
        VALUE: "4000",
        GROWTH: "stockMarketGrowth",
        CATEGORY: "stock",
      },
      {
        ...simpleAsset,
        NAME: "ISAs",
        START: "December 2019",
        VALUE: "2000",
        GROWTH: "stockMarketGrowth",
        CATEGORY: "stock",
      },
      {
        ...simpleAsset,
        NAME: "EarlyMortgage",
        START: "1 January 2018",
        VALUE: "-234000", // how much was borrowed
        IS_A_DEBT: true,
        GROWTH: "2.33", // good rate for early part of deal (excl cpi)
        CATEGORY: "mortgage",
        CAN_BE_NEGATIVE: true,
      },
      {
        ...simpleAsset,
        NAME: "LateMortgage",
        START: "1 January 2018",
        GROWTH: "4.66", // after rate goes up (excl cpi)
        IS_A_DEBT: true,
        CATEGORY: "mortgage",
      },
    ],
    transactions: [
      {
        ...simpleTransaction,
        NAME: "Each month buy food",
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: "200",
        DATE: "January 2 2018",
        RECURRENCE: "1m",
        CATEGORY: "living costs",
      },
      {
        ...simpleTransaction,
        NAME: "Revalue stocks after loss in 2020 market crash",
        TO: "Stocks",
        TO_ABSOLUTE: true,
        TO_VALUE: "3000",
        DATE: "January 2 2020",
        TYPE: revalueAsset,
      },
      {
        ...simpleTransaction,
        NAME: "SellCar",
        TO: CASH_ASSET_NAME,
        TO_ABSOLUTE: true,
        TO_VALUE: "1000",
        DATE: "GetRidOfCar",
      },
      {
        ...simpleTransaction,
        NAME: "switchMortgage", // at a predetermined time, rate switched
        FROM: "EarlyMortgage",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1", // all of debt at old rate
        TO: "LateMortgage",
        TO_ABSOLUTE: false,
        TO_VALUE: "1", // becomes all of debt at new rate
        DATE: "TransferMortgage",
      },
      {
        ...simpleTransaction,
        NAME: "Conditional pay early mortgage",
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: "1500", // a regular monthly payment
        TO: "EarlyMortgage",
        TO_ABSOLUTE: false,
        TO_VALUE: "1", // all of amount paid goes to mortgage
        DATE: "1 January 2018",
        STOP_DATE: "TransferMortgage",
        RECURRENCE: "1m",
        CATEGORY: "pay mortgage",
        TYPE: payOffDebt,
      },
      {
        ...simpleTransaction,
        NAME: "Conditional pay late mortgage",
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: "1500",
        TO: "LateMortgage",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "TransferMortgage",
        STOP_DATE: "1 January 2040",
        RECURRENCE: "1m",
        CATEGORY: "pay mortgage",
        TYPE: payOffDebt,
      },
    ],
    settings: [...browserTestSettingsForMigration],
    triggers: [
      {
        NAME: "TransferMortgage",
        ERA: undefined,
        DATE: "Jan 01 2028",
      },
      {
        NAME: "StopMainWork",
        ERA: undefined,
        DATE: "Dec 31 2050",
      },
      {
        NAME: "GetRidOfCar",
        ERA: undefined,
        DATE: "Dec 31 2025",
      },
    ],
    monitors: [],
    generators: [],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setSetting(model.settings, roiStart, "1 Jan 2019", viewType);
  setSetting(model.settings, roiEnd, "1 Feb 2019", viewType);
  return model;
}

function getTestModel02ForMigration() {
  const ss = JSON.parse(JSON.stringify(browserTestSettingsForMigration));
  const model: ModelData = {
    name: "TestModel02ForMigration",
    expenses: [],
    incomes: [],
    assets: [],
    transactions: [],
    settings: [...ss],
    monitors: [],
    triggers: [],
    generators: [],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setSetting(model.settings, roiStart, "1 Jan 2019", constType);
  setSetting(model.settings, roiEnd, "1 Feb 2019", constType);
  return model;
}

function getDBPModel() {
  const ss = JSON.parse(JSON.stringify(browserTestSettingsForMigration));
  const model: ModelData = {
    name: "DBPModel",
    expenses: [],
    incomes: [],
    assets: [],
    transactions: [],
    settings: [...ss],
    monitors: [],
    triggers: [],
    generators: [],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setSetting(model.settings, roiStart, "1 Jan 2019", constType);
  setSetting(model.settings, roiEnd, "1 Feb 2034", constType);
  return model;
}

export function defaultModelSettings(roi: { start: string; end: string }) {
  return [
    {
      ...simpleSetting,
      NAME: cpi,
      VALUE: "0.0",
      HINT: cpiHint,
    },
    {
      ...viewSetting,
      NAME: birthDate,
      VALUE: "",
      HINT: birthDateHint,
    },
    {
      ...viewSetting,
      NAME: valueFocusDate,
      VALUE: "",
      HINT: valueFocusDateHint,
    },
    {
      ...viewSetting,
      NAME: roiStart,
      VALUE: roi.start,
      HINT: roiStartHint,
    },
    {
      ...viewSetting,
      NAME: roiEnd,
      VALUE: roi.end,
      HINT: roiEndHint,
    },
    {
      NAME: monitorStart,
      VALUE: "Nov 2022",
      HINT: '',
      TYPE: adjustableType,
      ERA: 0,
    },
    {
      NAME: monitorEnd,
      VALUE: "Nov 2023",
      HINT: '',
      TYPE: adjustableType,
      ERA: 0,
    },
  ];
}

function getModelFutureExpenseForMigration() {
  const roi = {
    start: "Dec 1, 2016 00:00:00",
    end: "March 1, 2017 00:00:00",
  };
  const minimalModel = getMinimalModelCopy();
  const model: ModelData = {
    ...minimalModel,
    expenses: [
      {
        ...simpleExpense,
        START: "January 1 2018",
        END: "July 2 2018",
        NAME: "Phon",
        VALUE: "99",
        VALUE_SET: "January 1 2018",
      },
    ],
    settings: [...defaultModelSettings(roi)],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  model.settings.push({
    ...viewSetting,
    NAME: viewFrequency,
    VALUE: monthly,
  });
  allViews.map((v) => {
    model.settings.push({
      ...viewSetting,
      NAME: `${viewFrequency}${v.lc}`,
      VALUE: monthly,
    });
  });
  model.name = "ModelFutureExpenseForMigration";

  // log(`future expense settings ${model.settings.map(showObj)}`);
  return model;
}

function getBenAndJerryModel(): ModelData {
  const model: ModelData = {
    name: "BenAndJerryModel",
    assets: [
      {
        NAME: "PensionJerry Aegon",
        ERA: undefined,
        VALUE: "56324",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Pension",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: "PensionBen Prudential",
        ERA: undefined,
        VALUE: "45000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Pension",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: "Mortgage",
        ERA: undefined,
        VALUE: "-150000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "3.5",
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: true,
        CATEGORY: "Property",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: "Jerry stocks",
        ERA: undefined,
        VALUE: "25000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Investment",
        PURCHASE_PRICE: "14000",
        LIABILITY: "Jerry(CGT)",
      },
      {
        NAME: "Jerry loan",
        ERA: undefined,
        VALUE: "-5000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "2.5",
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: true,
        CATEGORY: "",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: `${taxFree}Jerry Aegon`,
        ERA: undefined,
        VALUE: "0.0",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Pension",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: "ISA",
        ERA: undefined,
        VALUE: "9000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Investment",
        PURCHASE_PRICE: "0",
        LIABILITY: "",
      },
      {
        NAME: "House",
        ERA: undefined,
        VALUE: "255000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "2",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Property",
        PURCHASE_PRICE: "0",
        LIABILITY: "",
      },
      {
        NAME: `${crystallizedPension}Jerry`,
        ERA: undefined,
        VALUE: "0.0",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Pension",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: `${crystallizedPension}Ben`,
        ERA: undefined,
        VALUE: "0.0",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Pension",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: "Cash",
        ERA: undefined,
        CATEGORY: "",
        START: "1 Jan 2017",
        VALUE: "0.0",
        QUANTITY: "",
        GROWTH: "0.0",
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: false,
        LIABILITY: "",
        PURCHASE_PRICE: "0.0",
      },
      {
        NAME: `${taxFree}Ben Prudential`,
        ERA: undefined,
        VALUE: "0.0",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "4",
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: "Pension",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
      {
        NAME: "Ben loan",
        ERA: undefined,
        VALUE: "-5000",
        QUANTITY: "",
        START: "21 Feb 2020",
        GROWTH: "0",
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: true,
        CATEGORY: "",
        PURCHASE_PRICE: "0.0",
        LIABILITY: "",
      },
    ],
    incomes: [
      {
        ...simpleIncome,
        START: "Jerry state pension age",
        END: "Ben dies",
        NAME: `${pensionTransfer}Jerry work`,
        ERA: undefined,
        VALUE: "0.0",
        VALUE_SET: "21 Feb 2020",
        LIABILITY: "Ben(incomeTax)",
        CPI_IMMUNE: false,
        CATEGORY: "Pension",
      },
      {
        ...simpleIncome,
        START: "Jerry state pension age",
        END: "Jerry dies",
        NAME: `${pensionDB}Jerry work`,
        ERA: undefined,
        VALUE: "2000",
        VALUE_SET: "21 Feb 2020",
        LIABILITY: "Jerry(incomeTax)",
        CPI_IMMUNE: false,
        CATEGORY: "Pension",
      },
      {
        ...simpleIncome,
        START: "Jerry state pension age",
        END: "Jerry dies",
        NAME: `${pensionDB}Jerry state pension`,
        ERA: undefined,
        VALUE: "730",
        VALUE_SET: "21 Feb 2020",
        LIABILITY: "Jerry(incomeTax)",
        CPI_IMMUNE: false,
        CATEGORY: "Pension",
      },
      {
        ...simpleIncome,
        START: "Ben state pension age",
        END: "Ben dies",
        NAME: `${pensionDB}Ben state pension`,
        ERA: undefined,
        VALUE: "730",
        VALUE_SET: "21 Feb 2020",
        LIABILITY: "Ben(incomeTax)",
        CPI_IMMUNE: false,
        CATEGORY: "Pension",
      },
      {
        ...simpleIncome,
        NAME: "Jerry salary",
        ERA: undefined,
        VALUE: "2755",
        VALUE_SET: "21/2/2020",
        START: "21/2/2020",
        END: "Jerry retires",
        CPI_IMMUNE: false,
        LIABILITY: "Jerry(incomeTax)/Jerry(NI)",
        CATEGORY: "Salary",
      },
      {
        ...simpleIncome,
        NAME: "Ben salary",
        ERA: undefined,
        VALUE: "3470",
        VALUE_SET: "21/2/2020",
        START: "21/2/2020",
        END: "Ben retires",
        CPI_IMMUNE: false,
        LIABILITY: "Ben(incomeTax)/Ben(NI)",
        CATEGORY: "Salary",
      },
    ],
    expenses: [
      {
        NAME: "Replace car",
        ERA: undefined,
        VALUE: "20000",
        VALUE_SET: "21 Feb 2020",
        START: "21/02/2025",
        END: "Care costs start",
        CPI_IMMUNE: false,
        CATEGORY: "Major costs",
        RECURRENCE: "5y",
      },
      {
        NAME: "Leisure expenses working",
        ERA: undefined,
        VALUE: "1000",
        VALUE_SET: "21 Feb 2020",
        START: "21 Feb 2020",
        END: "Jerry retires",
        CPI_IMMUNE: false,
        CATEGORY: "Leisure",
        RECURRENCE: "1m",
      },
      {
        NAME: "Leisure expenses retired",
        ERA: undefined,
        VALUE: "2000",
        VALUE_SET: "21 Feb 2020",
        START: "Jerry retires",
        END: "Care costs start",
        CPI_IMMUNE: false,
        CATEGORY: "Leisure",
        RECURRENCE: "1m",
      },
      {
        NAME: "House maintenance",
        ERA: undefined,
        VALUE: "8000",
        VALUE_SET: "21 Feb 2020",
        START: "21 Feb 2020",
        END: "Care costs start",
        CPI_IMMUNE: false,
        CATEGORY: "Major costs",
        RECURRENCE: "4y",
      },
      {
        NAME: "Care costs",
        ERA: undefined,
        VALUE: "3000",
        VALUE_SET: "21 Feb 2020",
        START: "Care costs start",
        END: "Ben dies",
        CPI_IMMUNE: false,
        CATEGORY: "Care",
        RECURRENCE: "1m",
      },
      {
        NAME: "Basic expenses small house",
        ERA: undefined,
        VALUE: "1600",
        VALUE_SET: "21 Feb 2020",
        START: "Downsize house",
        END: "Ben dies",
        CPI_IMMUNE: false,
        CATEGORY: "Basic",
        RECURRENCE: "1m",
      },
      {
        NAME: "Basic expenses current house",
        ERA: undefined,
        VALUE: "1850",
        VALUE_SET: "21 Feb 2020",
        START: "21 Feb 2020",
        END: "Downsize house",
        CPI_IMMUNE: false,
        CATEGORY: "Basic",
        RECURRENCE: "1m",
      },
    ],
    triggers: [
      { NAME: "Ben dies", ERA: undefined, DATE: "30 Aug 2068" },
      { NAME: "Ben retires", ERA: undefined, DATE: "27 July 2032" },
      {
        NAME: "Ben state pension age",
        ERA: undefined,
        DATE: "30 Aug 2040",
      },
      { NAME: "Care costs start", ERA: undefined, DATE: "20 Feb 2060" },
      { NAME: "Downsize house", ERA: undefined, DATE: "28 Feb 2047" },
      { NAME: "Jerry dies", ERA: undefined, DATE: "4 May 2065" },
      { NAME: "Jerry retires", ERA: undefined, DATE: "4 May 2030" },
      {
        NAME: "Jerry state pension age",
        ERA: undefined,
        DATE: "4 May 2037",
      },
    ],
    settings: [
      {
        NAME: "Today's value focus date",
        ERA: undefined,
        VALUE: "",
        HINT: "Date to use for 'today's value' tables (defaults to '' meaning today)",
        TYPE: "view",
      },
      {
        NAME: "End of view range",
        ERA: undefined,
        VALUE: "1 Jan 2069",
        HINT: "Date at the end of range to be plotted",
        TYPE: "view",
      },
      {
        NAME: "Date of birth",
        ERA: undefined,
        VALUE: "",
        HINT: "Date used for representing dates as ages",
        TYPE: "view",
      },
      {
        NAME: "cpi",
        ERA: undefined,
        VALUE: "2.5",
        HINT: "Annual rate of inflation",
        TYPE: "const",
      },
      {
        NAME: "Beginning of view range",
        ERA: undefined,
        VALUE: "1 Jan 2020",
        HINT: "Date at the start of range to be plotted",
        TYPE: "view",
      },
    ],
    transactions: [
      {
        NAME: `${transferCrystallizedPension}Jerry Aegon`,
        ERA: undefined,
        FROM: `${crystallizedPension}Jerry`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: `${crystallizedPension}Ben`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "Jerry dies",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${transferCrystallizedPension}Ben Prudential`,
        ERA: undefined,
        FROM: `${crystallizedPension}Ben`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: `${crystallizedPension}Jerry`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "Ben dies",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${pensionTransfer}Jerry work`,
        ERA: undefined,
        FROM: `${pensionDB}Jerry work`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: `${pensionTransfer}Jerry work`,
        TO_ABSOLUTE: false,
        TO_VALUE: "0.5",
        DATE: "Jerry dies",
        STOP_DATE: "Ben dies",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: "-PEN Jerry work",
        ERA: undefined,
        FROM: "Jerry salary",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.05",
        TO: "",
        TO_ABSOLUTE: false,
        TO_VALUE: "0.0",
        DATE: "21 Feb 2020",
        STOP_DATE: "Jerry retires",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: "PensionJerry Aegon",
        ERA: undefined,
        FROM: "",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0",
        TO: "PensionJerry Aegon",
        TO_ABSOLUTE: false,
        TO_VALUE: "0",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${pensionDB}Jerry work`,
        ERA: undefined,
        FROM: "Jerry salary",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.00125",
        TO: `${pensionDB}Jerry work`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "21 Feb 2020",
        STOP_DATE: "Jerry retires",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${pensionPrefix}Ben Prudential`,
        ERA: undefined,
        FROM: "Ben salary",
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.06",
        TO: `${pensionPrefix}Ben Prudential`,
        TO_ABSOLUTE: false,
        TO_VALUE: "3",
        DATE: "21 Feb 2020",
        STOP_DATE: "Ben retires",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${moveTaxFreePart}Jerry Aegon`,
        ERA: undefined,
        FROM: `${pensionPrefix}Jerry Aegon`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.25",
        TO: `${taxFree}Jerry Aegon`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "Jerry retires",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${moveTaxFreePart}Ben Prudential`,
        ERA: undefined,
        FROM: `${pensionPrefix}Ben Prudential`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "0.25",
        TO: `${taxFree}Ben Prudential`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "Ben retires",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${crystallizedPension}Jerry Aegon`,
        ERA: undefined,
        FROM: `${pensionPrefix}Jerry Aegon`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: `${crystallizedPension}Jerry`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "Jerry retires",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: `${crystallizedPension}Ben Prudential`,
        ERA: undefined,
        FROM: `${pensionPrefix}Ben Prudential`,
        FROM_ABSOLUTE: false,
        FROM_VALUE: "1.0",
        TO: `${crystallizedPension}Ben`,
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "Ben retires",
        STOP_DATE: "",
        RECURRENCE: "",
        CATEGORY: "Pension",
        TYPE: "auto",
      },
      {
        NAME: "ConditionalSell stocks for cash",
        ERA: undefined,
        CATEGORY: "Cashflow",
        FROM: "Jerry stocks",
        FROM_ABSOLUTE: true,
        FROM_VALUE: "500",
        TO: "Cash",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "liquidateAsset",
      },
      {
        NAME: `ConditionalSell ${taxFree}Ben Prudential`,
        ERA: undefined,
        CATEGORY: "Cashflow",
        FROM: `${taxFree}Ben Prudential`,
        FROM_ABSOLUTE: true,
        FROM_VALUE: "250",
        TO: "Cash",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "liquidateAsset",
      },
      {
        NAME: "ConditionalSell ISAs for cash",
        ERA: undefined,
        CATEGORY: "Cashflow",
        FROM: "ISA",
        FROM_ABSOLUTE: true,
        FROM_VALUE: "500",
        TO: "Cash",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "liquidateAsset",
      },
      {
        NAME: `ConditionalSell ${crystallizedPension}Jerry`,
        ERA: undefined,
        CATEGORY: "Cashflow",
        FROM: `${crystallizedPension}Jerry`,
        FROM_ABSOLUTE: true,
        FROM_VALUE: "1000",
        TO: "Cash",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "liquidateAsset",
      },
      {
        NAME: `ConditionalSell ${crystallizedPension}Ben`,
        ERA: undefined,
        CATEGORY: "Cashflow",
        FROM: `${crystallizedPension}Ben`,
        FROM_ABSOLUTE: true,
        FROM_VALUE: "1000",
        TO: "Cash",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "liquidateAsset",
      },
      {
        NAME: `ConditionalSell ${taxFree}Jerry Aegon`,
        ERA: undefined,
        CATEGORY: "Cashflow",
        FROM: `${taxFree}Jerry Aegon`,
        FROM_ABSOLUTE: true,
        FROM_VALUE: "250",
        TO: "Cash",
        TO_ABSOLUTE: false,
        TO_VALUE: "1",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "liquidateAsset",
      },
      {
        NAME: "ConditionalPayment to Mortgage 1",
        ERA: undefined,
        CATEGORY: "Property",
        FROM: "Cash",
        FROM_ABSOLUTE: true,
        FROM_VALUE: "700",
        TO: "Mortgage",
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "payOffDebt",
      },
      {
        NAME: "ConditionalPayment to Jerry loan 1",
        ERA: undefined,
        CATEGORY: "",
        FROM: "Cash",
        FROM_ABSOLUTE: true,
        FROM_VALUE: "250",
        TO: "Jerry loan",
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "payOffDebt",
      },
      {
        NAME: "ConditionalPayment to Ben loan 1",
        ERA: undefined,
        CATEGORY: "",
        FROM: "Cash",
        FROM_ABSOLUTE: true,
        FROM_VALUE: "500",
        TO: "Ben loan",
        TO_ABSOLUTE: false,
        TO_VALUE: "1.0",
        DATE: "21 Feb 2020",
        STOP_DATE: "",
        RECURRENCE: "1m",
        TYPE: "payOffDebt",
      },
    ],
    monitors: [],
    generators: [],
    version: 5,
    undoModel: undefined,
    redoModel: undefined,
  };
  return model;
}

export function getTestModel(input: string): ModelData {
  // log(`getTestModel making model for ${input}`);
  let model: ModelData | undefined;
  if (input === TestModel01) {
    model = getTestModel01ForMigration();
  } else if (input === TestModel02) {
    model = getTestModel02ForMigration();
  } else if (input === CoarseAndFine) {
    model = getModelCoarseAndFineForMigration();
  } else if (input === DBPModel) {
    model = getDBPModel();
  } else if (input === FutureExpense) {
    // log(`converting to from string`);
    model = makeModelFromJSON(
      JSON.stringify(getModelFutureExpenseForMigration()),
      "FutureExpenseForMigration",
    );
  } else if (input === ThreeChryslerModel) {
    model = getThreeChryslerModelForMigration();
  } else if (input === MinimalModel) {
    model = getMinimalModelCopy();
  } else if (input === BenAndJerryModel) {
    model = getBenAndJerryModel();
  } else if (input === definedBenefitsPension) {
    model = getDefinedBenefitsPension();
  } else if (input === definedContributionsPension) {
    model = getDefinedContributionsPension();
  } else if (input === pensionExampleData) {
    model = getPensionExampleData();
  } else if (input === monitorModel) {
    model = getMonitorExampleData();
  }
  
  // TODO : should we make a copy here for more stable tests?
  // even with this JSON round-trip change, I'm seeing failure of
  //   my first model browser test
  // with
  //   Expected: "added new setting Beginning of view range"
  //   Received: "There's already a setting called Beginning of view range"
  //   127 |   const labelText = await label[0].getText();
  //   128 |   //log(`compare expected ${message} against found ${labelText}`);
  //   > 129 |   expect(labelText).toBe(message);
  // but all tests pass in sequential mode

  //if (model !== undefined) {
  //  model = JSON.parse(JSON.stringify(model));
  //}
  if (model !== undefined) {
    return model;
  }
  /* istanbul ignore next */
  throw new Error("test model name not recognised");
}

export function getModelCoarseAndFine(): ModelData {
  const roi = {
    start: "April 1, 2018",
    end: "July 10, 2018",
  };

  const model: ModelData = {
    ...emptyModel,
    incomes: [
      {
        ...simpleIncome,
        START: "April 1 2018",
        END: "April 2 2018",
        NAME: "PRn1",
        VALUE: "10",
        VALUE_SET: "January 1 2018",
        CATEGORY: "PaperRound",
      },
      {
        ...simpleIncome,
        START: "April 1 2018",
        END: "June 2 2018",
        NAME: "PRn2",
        VALUE: "10", // single payment
        VALUE_SET: "January 1 2018",
        CATEGORY: "PaperRound",
      },
      {
        ...simpleIncome,
        START: "April 1 2018",
        END: "April 2 2018",
        NAME: "PRn3",
        VALUE: "10", // single payment
        VALUE_SET: "January 1 2018",
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: "April 1 2018",
        VALUE: "500",
        CATEGORY: "Accessible",
      },
      {
        ...simpleAsset,
        NAME: "stocks",
        START: "April 1 2018",
        VALUE: "500",
      },
      {
        ...simpleAsset,
        NAME: "savings",
        START: "June 1 2018",
        VALUE: "500",
        CATEGORY: "Accessible",
      },
    ],
    settings: [...defaultModelSettings(roi)],
    expenses: [
      {
        ...simpleExpense,
        START: "April 1 2018",
        END: "June 2 2018",
        NAME: "Phon",
        VALUE_SET: "January 1 2018",
        VALUE: "12.0",
        CATEGORY: "comms",
      },
      {
        ...simpleExpense,
        START: "February 1 2018",
        END: "June 2 2018",
        NAME: "broadband",
        VALUE_SET: "January 1 2018",
        VALUE: "12.0",
        CATEGORY: "comms",
      },
      {
        ...simpleExpense,
        START: "January 1 2018",
        END: "July 2 2018",
        NAME: "pet food",
        VALUE_SET: "January 1 2018",
        VALUE: "12.0",
      },
    ],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };

  return model;
}
