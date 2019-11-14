export interface DbItem {
  NAME: string;
}
export interface DbItemCategory extends DbItem {
  CATEGORY: string;
}
export interface DbSetting extends DbItem {
  VALUE: string;
  HINT: string;
}
export interface DbDynamoItem {
  NAME: { S: string };
}
export interface DbDynamoItemCategory extends DbDynamoItem {
  CATEGORY: { S: string };
}
export interface DbSettingDynamo extends DbDynamoItem {
  VALUE: { S: string };
  HINT: { S: string };
}
export interface DbTrigger extends DbItem {
  TRIGGER_DATE: Date;
}
export interface DbTriggerDynamo extends DbDynamoItem {
  TRIGGER_DATE: { N: string };
}
export interface DbAsset extends DbItemCategory {
  ASSET_START: string;
  ASSET_VALUE: string;
  ASSET_GROWTH: string;
  ASSET_LIABILITY: string; // e.g. JoeIncome if growth accumulates as income tax liability
  ASSET_PURCHASE_PRICE: string;
}
export interface DbAssetDynamo extends DbDynamoItemCategory {
  ASSET_START: { S: string };
  ASSET_VALUE: { N: string };
  ASSET_GROWTH: { S: string };
  ASSET_LIABILITY: { S: string };
  ASSET_PURCHASE_PRICE: { N: string };
}
export interface DbExpense extends DbItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  GROWTH: string;
  CPI_IMMUNE: boolean;
}
export interface DbExpenseDynamo extends DbDynamoItemCategory {
  START: { S: string };
  END: { S: string };
  VALUE: { N: string };
  VALUE_SET: { S: string };
  GROWTH: { N: string };
  CPI_IMMUNE: { S: string };
}
export interface DbIncome extends DbItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  GROWTH: string;
  CPI_IMMUNE: boolean;
  LIABILITY: string; // e.g. "IncomeTaxJoe NIJoe"
}
export interface DbIncomeDynamo extends DbDynamoItemCategory {
  START: { S: string };
  END: { S: string };
  VALUE: { N: string };
  VALUE_SET: { S: string };
  GROWTH: { N: string };
  CPI_IMMUNE: { S: string };
  LIABILITY: { S: string };
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
export interface DbTransaction extends DbItemCategory {
  // NAME:
  // special starting words : Conditional, Pension, PensionSS
  // see tests for examples
  TRANSACTION_FROM: string;
  TRANSACTION_FROM_ABSOLUTE: boolean;
  TRANSACTION_FROM_VALUE: string;
  TRANSACTION_TO: string;
  TRANSACTION_TO_ABSOLUTE: boolean;
  TRANSACTION_TO_VALUE: string;
  TRANSACTION_DATE: string;
  TRANSACTION_STOP_DATE: string; // for regular transactions
  TRANSACTION_RECURRENCE: string;
}
export interface DbTransactionDynamo extends DbDynamoItemCategory {
  TRANSACTION_DATE: { S: string };
  TRANSACTION_FROM: { S: string }; // can be 'None' e.g. for windfalls to cash
  TRANSACTION_FROM_ABSOLUTE: { BOOL: boolean };
  TRANSACTION_FROM_VALUE: { N: string };
  TRANSACTION_RECURRENCE: { S: string };
  TRANSACTION_STOP_DATE: { S: string }; // can be 'None' e.g. for non-recurrent cases
  TRANSACTION_TO: { S: string }; // can be 'None' e.g. for one-off expenses out of cash
  TRANSACTION_TO_ABSOLUTE: { BOOL: boolean };
  TRANSACTION_TO_VALUE: { N: string };
}

export interface DatedThing {
  date: Date | undefined;
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
  item: DbItem;
  chartDataPoints: ChartDataPoint[];
}

export interface DataForView {
  assetData: ItemChartData[]; // for chart views
  expensesData: ItemChartData[]; // for chart view
  incomesData: ItemChartData[]; // for chart view
}

export interface Evaluation {
  name: string; // what's being evaluated (e.g. Cash)
  date: Date;
  value: number;
  source: string; // the source of the change for this evaluation
}

export interface DbModelData {
  triggers: DbTrigger[];
  expenses: DbExpense[];
  incomes: DbIncome[];
  transactions: DbTransaction[];
  assets: DbAsset[];
  settings: DbSetting[];
}
