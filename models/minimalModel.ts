import {
  CASH_ASSET_NAME,
  cpi,
  cpiHint,
  constType,
  roiStart,
  roiStartHint,
  viewType,
  roiEnd,
  roiEndHint,
  birthDate,
  birthDateHint,
  valueFocusDate,
  valueFocusDateHint,
} from "../localization/stringConstants";
import { ModelData } from "../types/interfaces";
import { getCurrentVersion } from "./currentVersion";

export const minimalModel: ModelData = {
  name: "minimalModel",
  assets: [
    {
      NAME: CASH_ASSET_NAME,
      CATEGORY: "",
      START: "01 Jan 2017",
      VALUE: "0.0",
      QUANTITY: "",
      GROWTH: "0.0",
      CPI_IMMUNE: true,
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: false,
      LIABILITY: "",
      PURCHASE_PRICE: "0.0",
      ERA: 0,
    },
  ],
  incomes: [],
  expenses: [],
  triggers: [],
  monitors: [],
  settings: [
    {
      NAME: cpi,
      VALUE: "2.5",
      HINT: cpiHint,
      TYPE: constType,
      ERA: 0,
    },
    {
      NAME: roiStart,
      VALUE: "01 Jan 2017",
      HINT: roiStartHint,
      TYPE: viewType,
      ERA: 0,
    },
    {
      NAME: roiEnd,
      VALUE: "01 Jan 2023",
      HINT: roiEndHint,
      TYPE: viewType,
      ERA: 0,
    },
    {
      NAME: birthDate,
      VALUE: "",
      HINT: birthDateHint,
      TYPE: viewType,
      ERA: 0,
    },
    {
      NAME: valueFocusDate,
      VALUE: "",
      HINT: valueFocusDateHint,
      TYPE: viewType,
      ERA: 0,
    },
  ],
  transactions: [],
  version: getCurrentVersion(),
  undoModel: undefined,
  redoModel: undefined,
};

export function getMinimalModelCopy(): ModelData {
  // log('in getMinimalModelCopy');
  return JSON.parse(JSON.stringify(minimalModel));
}
