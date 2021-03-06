export interface Item {
  NAME: string;
}
export interface ItemCategory extends Item {
  CATEGORY: string;
}
export interface Setting extends Item {
  VALUE: string;
  HINT: string;
  TYPE: string;
}
export interface Trigger extends Item {
  DATE: Date;
}
export interface Asset extends ItemCategory {
  START: string;
  VALUE: string;
  QUANTITY: string; // Quantised assets have unit prices on-screen for table value
  // Quantised assets can only be transacted in unit integer quantities
  GROWTH: string;
  CPI_IMMUNE: boolean;
  CAN_BE_NEGATIVE: boolean;
  IS_A_DEBT: boolean;
  LIABILITY: string; // e.g. IncomeTaxJoe if growth accumulates as income tax liability
  PURCHASE_PRICE: string;
}
export interface Expense extends ItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  GROWTH: string;
  CPI_IMMUNE: boolean;
  RECURRENCE: string;
}
export interface Income extends ItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  GROWTH: string;
  CPI_IMMUNE: boolean;
  LIABILITY: string; // e.g. "IncomeTaxJoe NIJoe"
}
// A transaction is an instant movement of value from
// one asset to another.
// The amount removed from the "from" asset can be an absolute value
// (from_value, with from_absolute = true)
// or a proportional value of the total value of the "from" asset
// (from_value between 0 and 1, with from_absolute = false)
// The amount added to the "to" asset can be an absolute value
// (to_value, with to_absolute = true)
// or a proportional value of the total value taken from the "from" asset
// (to_value between 0 and 1, with to_absolute = false).
// Example: invest in double glazing
//  name: "GetDoubleGlazing"
//  from: CASH_ASSET
//  from_value: 1200 // cost of installation etc
//  from_absolute: true
//  to: HOUSE_ASSET
//  to_value: 700 // rise in house value
//  to_absolute: true
//
// Example: sell a house
//  name: "SellHouse"
//  from: HOUSE_ASSET
//  from_value: 1 // proportion of value of house
//  from_absolute: false
//  to: CASH_ASSET
//  to_value: 0.95 // agents change 5% of house price for transaction
//  to_absolute: false
// If there's also a fixed value charge for SellHouse, we could
// log a separate transaction.
//
export interface Transaction extends ItemCategory {
  // NAME:
  // special starting words : Conditional, Pension, PensionSS
  // see tests for examples
  FROM: string;
  FROM_ABSOLUTE: boolean;
  FROM_VALUE: string;
  TO: string;
  TO_ABSOLUTE: boolean;
  TO_VALUE: string;
  DATE: string;
  STOP_DATE: string; // for regular transactions
  RECURRENCE: string; // e.g. 1m, 10y
  TYPE: string; // see string constants
}

export interface DatedThing {
  date: Date;
  name: string;
  type: string;
}
export interface Interval {
  start: Date;
  end: Date;
}
export interface ChartDataPoint {
  label: string;
  y: number;
  ttip: string;
}
export interface ChartData {
  type: string;
  name: string;
  dataPoints: ChartDataPoint[];
}
export interface ItemChartData {
  item: Item;
  chartDataPoints: ChartDataPoint[];
}

export interface DataForView {
  assetData: ItemChartData[];
  debtData: ItemChartData[];
  expensesData: ItemChartData[];
  incomesData: ItemChartData[];
  taxData: ItemChartData[];
  todaysAssetValues: Map<string, AssetVal>;
  todaysDebtValues: Map<string, DebtVal>;
  todaysIncomeValues: Map<string, IncomeVal>;
  todaysExpenseValues: Map<string, ExpenseVal>;
  todaysSettingValues: Map<string, SettingVal>;
}

export interface Evaluation {
  name: string; // what's being evaluated (e.g. Cash)
  date: Date;
  value: number;
  source: string; // the source of the change for this evaluation
}

export interface ModelData {
  triggers: Trigger[];
  expenses: Expense[];
  incomes: Income[];
  transactions: Transaction[];
  assets: Asset[];
  settings: Setting[];
  version: number;
  undoModel: ModelData | undefined;
  redoModel: ModelData | undefined;
}

export interface FormProps {
  model: ModelData;
  showAlert: (string) => void;
}

export interface SettingVal {
  settingVal: string;
}
export interface AssetVal {
  assetVal: number;
  category: string;
}
export interface DebtVal {
  debtVal: number;
  category: string;
}
export interface IncomeVal {
  incomeVal: number;
  category: string;
}
export interface ExpenseVal {
  expenseVal: number;
  expenseFreq: string;
  category: string;
}

export interface ChartSettings {
  height: number;
  width?: number | string;
  toolTip: {
    content: string;
  };
  title?: {
    display: boolean;
    text: string;
  };
  legend: {
    // fontSize: 30,
    fontFamily: string;
    fontWeight: string;
    horizontalAlign: string; // left, center ,right
    verticalAlign: string; // top, center, bottom
    display?: boolean;
  };

  axisX: {
    labelFormatter: ({ label: string }) => string;
  };
}
