export interface IDbItem {
  NAME: string;
}
export interface IDbItemCategory extends IDbItem {
  CATEGORY: string;
}
export interface IDbSetting extends IDbItem {
  VALUE: string;
  HINT: string;
}
export interface IDbDynamoItem {
  NAME: { S: string };
}
export interface IDbDynamoItemCategory extends IDbDynamoItem {
  CATEGORY: { S: string };
}
export interface IDbSettingDynamo extends IDbDynamoItem {
  VALUE: { S: string };
  HINT: { S: string };
}
export interface IDbTrigger extends IDbItem {
  TRIGGER_DATE: Date;
}
export interface IDbTriggerDynamo extends IDbDynamoItem {
  TRIGGER_DATE: { N: string };
}
export interface IDbAsset extends IDbItemCategory {
  ASSET_START: string;
  ASSET_VALUE: string;
  ASSET_GROWTH: string;
  ASSET_LIABILITY: string; // e.g. JoeIncome if growth accumulates as income tax liability
  ASSET_PURCHASE_PRICE: string;
}
export interface IDbAssetDynamo extends IDbDynamoItemCategory {
  ASSET_START: { S: string };
  ASSET_VALUE: { N: string };
  ASSET_GROWTH: { S: string };
  ASSET_LIABILITY: { S: string };
  ASSET_PURCHASE_PRICE: { N: string };
}
export interface IDbExpense extends IDbItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  GROWTH: string;
  CPI_IMMUNE: boolean;
}
export interface IDbExpenseDynamo extends IDbDynamoItemCategory {
  START: { S: string };
  END: { S: string };
  VALUE: { N: string };
  VALUE_SET: { S: string };
  GROWTH: { N: string };
  CPI_IMMUNE: { S: string };
}
export interface IDbIncome extends IDbItemCategory {
  START: string;
  END: string;
  VALUE: string;
  VALUE_SET: string;
  GROWTH: string;
  CPI_IMMUNE: boolean;
  LIABILITY: string; // e.g. "IncomeTaxJoe NIJoe"
}
export interface IDbIncomeDynamo extends IDbDynamoItemCategory {
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
export interface IDbTransaction extends IDbItemCategory {
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
export interface IDbTransactionDynamo extends IDbDynamoItemCategory {
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

export interface IDatedThing {
  date: Date | undefined;
  name: string;
  type: string;
}
export interface IInterval {
  start: Date;
  end: Date;
}
export interface IIntervalAndChange {
  bucket: IInterval;
  from_value_abs: number;
  to_value_abs: number;
}
export interface IChartDataPoint {
  label: string;
  y: number;
  ttip: string;
}
export interface IChartData {
  type: string;
  name: string;
  dataPoints: IChartDataPoint[];
}
export interface IItemChartData {
  item: IDbItem;
  chartDataPoints: IChartDataPoint[];
}

export interface IDataForView {
  assetData: IItemChartData[]; // for chart views
  expensesData: IItemChartData[]; // for chart view
  incomesData: IItemChartData[]; // for chart view
}

export interface IEvaluation {
  name: string; // what's being evaluated (e.g. Cash)
  date: Date;
  value: number;
  source: string; // the source of the change for this evaluation
}

export interface IDbModelData {
  triggers: IDbTrigger[];
  expenses: IDbExpense[];
  incomes: IDbIncome[];
  transactions: IDbTransaction[];
  assets: IDbAsset[];
  settings: IDbSetting[];
}
