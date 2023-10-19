import { CASH_ASSET_NAME, cpi, cpiHint, constType, roiStart, roiStartHint, viewType, roiEnd, roiEndHint, birthDate, birthDateHint, valueFocusDate, valueFocusDateHint } from "../localization/stringConstants";
import { ModelData } from "../types/interfaces";

import { makeModelFromJSONString } from "./modelFromJSON";
import { getCurrentVersion } from "./currentVersion";
import { ViewSettings } from "../utils/viewUtils";

export const minimalModel: ModelData = {
  name: 'minimalModel',
  assets: [
    {
      NAME: CASH_ASSET_NAME,
      ERA: undefined,
      CATEGORY: '',
      START: '1 Jan 2017',
      VALUE: '0.0',
      QUANTITY: '',
      GROWTH: '0.0',
      CPI_IMMUNE: true,
      CAN_BE_NEGATIVE: true,
      IS_A_DEBT: false,
      LIABILITY: '',
      PURCHASE_PRICE: '0.0',
    },
  ],
  incomes: [],
  expenses: [],
  triggers: [],
  settings: [
    {
      NAME: cpi,
      ERA: undefined,
      VALUE: '2.5',
      HINT: cpiHint,
      TYPE: constType,
    },
    {
      NAME: roiStart,
      ERA: undefined,
      VALUE: '1 Jan 2017',
      HINT: roiStartHint,
      TYPE: viewType,
    },
    {
      NAME: roiEnd,
      ERA: undefined,
      VALUE: '1 Jan 2023',
      HINT: roiEndHint,
      TYPE: viewType,
    },
    {
      NAME: birthDate,
      ERA: undefined,
      VALUE: '',
      HINT: birthDateHint,
      TYPE: viewType,
    },
    {
      NAME: valueFocusDate,
      ERA: undefined,
      VALUE: '',
      HINT: valueFocusDateHint,
      TYPE: viewType,
    },
  ],
  transactions: [],
  version: getCurrentVersion(),
  undoModel: undefined,
  redoModel: undefined,
};

export function getMinimalModelCopy(
  viewState: ViewSettings,
): ModelData {
  // log('in getMinimalModelCopy');
  return makeModelFromJSONString(JSON.stringify(minimalModel), viewState);
}