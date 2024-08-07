export interface Item {
  NAME: string;
  ERA: number | undefined;
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
  DATE: string;
}
export interface MonitorValue {
  MONTH: string;
  EXPRESSION: string;
}
export interface Monitor extends Item {
  NAME: string; // should match an expense name
  VALUES: MonitorValue[];
}
export interface Generator extends Item {
  TYPE: string,
  DETAILS: any;
}

export interface DBPGeneratorDetails {
  VALUE: string,
  VALUE_SET: string,
  STOP_SOURCE: string,
  START: string,
  END: string,
  GROWS_WITH_CPI: string,
  TRANSFERRED_STOP: string,
  INCOME_SOURCE: string,
  SALARY_SACRIFICED: string,
  CONTRIBUTION_AMOUNT: string,
  ACCRUAL: string,
  TRANSFER_TO: string,
  TRANSFER_PROPORTION: string,
  TAX_LIABILITY: string,
  CATEGORY: string,
}

export interface DCGeneratorDetails {
  VALUE: string,
  GROWS_WITH_CPI: string,
  GROWTH: string,
  TAX_LIABILITY: string,
  CATEGORY: string,
  START: string,
  STOP: string,
  CRYSTALLIZE: string,
  SS: string,
  INCOME_SOURCE: string,
  CONTRIBUTION_AMOUNT: string,
  EMP_CONTRIBUTION_AMOUNT: string,
  TRANSFER_TO: string,
  TRANSFER_DATE: string,
}

export interface BondGeneratorDetails {
  VALUE: string,
  GROWTH: string,
  CATEGORY: string,
  START: string,
  DURATION: string;
  SOURCE: string;
  TARGET: string;
  YEAR: string;
  RECURRENCE: string;
  RECURRENCE_STOP: string;
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
export interface IncomeOrExpense extends ItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  CPI_IMMUNE: boolean;
  RECURRENCE: string;
}
export type Expense = IncomeOrExpense;
export interface Income extends IncomeOrExpense {
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
export interface ChartDataSet {
  label: string;
  data: number[]; // corresponds to ChartData.labels
  backgroundColor: string;
  //barThickness: number,
  barPercentage: number;
}
export interface ChartData {
  labels: string[];
  datasets: ChartDataSet[];
  displayLegend: boolean;
}
export interface ItemChartData {
  item: Item;
  chartDataPoints: ChartDataPoint[];
}
export interface ReportMatcher {
  sourceMatcher: string;
  sourceExcluder: string;
}
export type ReportValueChecker = (
  name: string, // name of thing which has a value
  val: number | string, // value of the thing
  date: Date,
  source: string,
) => boolean;
export interface ReportDatum {
  name: string;
  change: number | undefined;
  oldVal: number | undefined;
  newVal: number | undefined;
  qchange: string | undefined;
  qoldVal: number | undefined;
  qnewVal: number | undefined;
  date: string;
  source: string;
}

export interface DataForView {
  labels: string[];
  assetData: ItemChartData[];
  debtData: ItemChartData[];
  expensesData: ItemChartData[];
  incomesData: ItemChartData[];
  taxData: ItemChartData[];
  todaysAssetValues: Map<Asset, AssetVal>;
  todaysDebtValues: Map<Asset, DebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
  reportData: reportDataType;
  totalTaxPaid: number;
}

export interface Evaluation {
  name: string; // what's being evaluated (e.g. Cash)
  date: Date;
  oldValue: number; // as CPI can shift things over time, don't rely on a previous eval
  value: number;
  source: string; // the source of the change for this evaluation
}

interface IncomeFromFile extends Income {
  GROWTH: string | undefined;
}
interface ExpenseFromFile extends Expense {
  GROWTH: string | undefined;
}

export interface ModelDataFromFile {
  name: string;
  triggers: Trigger[];
  expenses: ExpenseFromFile[];
  incomes: IncomeFromFile[];
  transactions: Transaction[];
  assets: Asset[];
  monitors: Monitor[];
  generators: Generator[],
  settings: Setting[];
  version: number;
  undoModel: ModelData | undefined;
  redoModel: ModelData | undefined;
}

export interface ModelData {
  name: string;
  triggers: Trigger[];
  expenses: Expense[];
  incomes: Income[];
  transactions: Transaction[];
  assets: Asset[];
  settings: Setting[];
  monitors: Monitor[];
  generators: Generator[];
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
export interface AssetOrDebtVal {
  val: number;
  quantity: number | undefined;
  category: string;
}
export interface IncomeVal {
  incomeVal: number;
  hasStarted: boolean;
  hasEnded: boolean;
  category: string;
}
export interface ExpenseVal {
  expenseVal: number;
  expenseFreq: string;
  hasStarted: boolean;
  hasEnded: boolean;
  category: string;
}

export interface GrowthData {
  itemGrowth: string;
  powerByNumMonths: number;
  scale: number;
  applyCPI: boolean;
  annualCPI: boolean;
}

export interface ChartSettings {
  isSmall: boolean;
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
    label; //renderCell: ({ label: string }) => string;
  };
}

export type finkittyButtonType =
  | "primary"
  | "secondary"
  | "success"
  | "outline-primary"
  | "outline-secondary"
  | "outline-success";

export interface DeleteResult {
  itemsDeleted: string[];
  message: string;
}

export interface ViewCallbacks {
  showAlert: (arg0: string) => void;
  deleteTransactions: (arg: string[]) => void;
  deleteExpenses: (arg: string[]) => void;
  ROI: Interval,
  updateStartDate: (newDate: string) => Promise<{
    updated: boolean;
    value: string; // value after attempt (pre-existing if updated = false)
  }>;
  updateEndDate: (newDate: string) => Promise<{
    updated: boolean;
    value: string; // value after attempt (pre-existing if updated = false)
  }>;
  updateFrequency: (newVal: string) => boolean;
  filterForEra: (item: Item) => boolean;
  filterForSearch: (item: Item) => boolean;
  getSearchString: () => string;
  setSearchString: (s: string) => void;
  doCheckBeforeOverwritingExistingData: () => boolean;
  doShowTodaysValueColumns: () => boolean;

  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>;

  checkAsset: (a: Asset) => string;
  checkTransaction: (t: Transaction) => string;

  deleteAsset: (name: string) => Promise<DeleteResult>;
  deleteExpense: (name: string) => Promise<DeleteResult>;
  deleteIncome: (name: string) => Promise<DeleteResult>;
  deleteSetting: (name: string) => Promise<DeleteResult>;
  deleteTrigger: (name: string) => Promise<DeleteResult>;
  deleteTransaction: (name: string) => Promise<DeleteResult>;
  deleteGenerator: (name: string) => Promise<DeleteResult>;

  setEraAsset: (name: string, value: number) => Promise<boolean>;
  setEraExpense: (name: string, value: number) => Promise<boolean>;
  setEraIncome: (name: string, value: number) => Promise<boolean>;
  setEraSetting: (name: string, value: number) => Promise<boolean>;
  setEraTrigger: (name: string, value: number) => Promise<boolean>;
  setEraTransaction: (name: string, value: number) => Promise<boolean>;
  setEraGenerator: (name: string, value: number) => Promise<boolean>;

  submitAsset: (assetInput: Asset) => Promise<void>;
  submitExpense: (expenseInput: Expense) => Promise<void>;
  submitMonitor: (monitorInput: Monitor) => Promise<void>;
  submitIncome: (incomeInput: Income) => Promise<boolean>;
  submitTransaction: (
    transactionInput: Transaction,
  ) => Promise<void>;
  submitTrigger: (triggerInput: Trigger) => Promise<void>;
  submitGenerator: (generatorInput: Generator) => Promise<void>;

  editSetting: (
    settingInput: {
      NAME: string;
      ERA: number | undefined;
      VALUE: string;
      HINT: string;
    },
  ) => Promise<void>;

  attemptRename: (
    doChecks: boolean,
    old: string,
    replacement: string,
    showAlert: (message: string) => void,
    refreshData: (
      refreshModel: boolean,
      refreshChart: boolean,
      sourceID: number,
    ) => Promise<void>,
  ) => Promise<string>,
}
