export const NO_ASSET_NAME = '';
export const separator = '/';

// All models have a Cash asset and this is its name
export const CASH_ASSET_NAME = 'Cash';

// All models have a taxPot which keeps a tally of payments for
// income tax, NI, or CGT
// useful to monitor and determine ways to
// optimize the size or timing of payments.
export const taxPot = 'TaxPot';

// All models have a value for CPI (can be zero),
// which controls how values of incomes/expenses/assets
// naturally grow over time
export const cpi = 'cpi';
export const cpiHint = 'Annual rate of inflation';

// All models include these settings which control the view:
// date range for charts
export const roiEnd = 'End of view range';
export const roiEndHint = 'Date at the end of range to be plotted';
export const roiStart = 'Beginning of view range';
export const roiStartHint = 'Date at the start of range to be plotted';
// dates can be plotted as dates or as an age based on a given
// date of birth (leave DOB as '' to see dates not ages)
export const birthDate = 'Date of birth';
export const birthDateHint = 'Date used for representing dates as ages';
// whether bars on the charts show monthly or annual values
export const viewFrequency = 'View frequency';
export const viewFrequencyHint = "Data plotted 'monthly' or 'annually'";
export const annually = 'Annually';
export const monthly = 'Monthly';
// whether charts bundle items into categories
// a coarse view uses categories and is simpler to look at
// a detailed view ignores categories and represents everything
// separately
export const viewDetail = 'View detail';
export const viewDetailHint =
  "View detail ('Categorised view' or 'Detailed view')";
export const total = 'Totalled view';
export const coarse = 'Categorised view';
export const fine = 'Detailed view';
// The asset chart can show all assets/expenses/incomes
// (set focus to All)
// or all things in a given category
// or an individual named thing
export const assetChartFocus = 'Focus of assets chart';
export const assetChartFocusHint =
  "Assets chart can display a category, a single asset, or 'All'";
export const debtChartFocus = 'Focus of debts chart';
export const debtChartFocusHint =
  "Debts chart can display a category, a single debt, or 'All'";

export const expenseChartFocus = 'Focus of expenses chart';
export const expenseChartFocusHint =
  "Expenses chart can display a category, a single expense, or 'All'";
export const incomeChartFocus = 'Focus of incomes chart';
export const incomeChartFocusHint =
  "Incomes chart can display a category, a single income, or 'All'";
export const allItems = 'All';
// Asset chart bars represent the value of the asset
// or the delta (additions, reductions or both)
export const assetChartView = 'Type of view for asset chart';
export const assetChartHint =
  "Asset chart uses setting '+', '-', '+-' or 'val'";
export const assetChartVal = 'val';
export const assetChartAdditions = '+';
export const assetChartReductions = '-';
export const assetChartDeltas = '+-';
export const debtChartView = 'Type of view for debt chart';
export const debtChartHint = "Debt chart uses setting '+', '-', '+-' or 'val'";
export const debtChartVal = 'val';
export const debtChartAdditions = '+';
export const debtChartReductions = '-';
export const debtChartDeltas = '+-';

// The app ships with a sample model that covers some of the
// types of assets, incomee, expenses and transactions.
// The sample data can be loaded into a model.
export const exampleModelName = 'Simple';

// Incomes can be liable to incomeTax or NI
// concatenate with liable person's name
// e.g. IncomeTaxJoe or NIJane
export const incomeTax = '(incomeTax)';
export const nationalInsurance = '(NI)';
export const taxableBenefit = 'TaxableBenefit';

// Assets can of the form CrystallizedPension
// and transfer to cash is liable to income tax for
// the named owner
// (i.e. named CrystallizedPensionJack)
// generates income tax liability for Jack
export const crystallizedPension = 'CrystallizedPension';
// Assets can be liable to CGT
// CGT calculations depend upon a PurchasePrice having been set
// for the asset. Then, upon sale, a gain can be calculated
// and allowed for in CGT calculation
export const cgt = '(CGT)';

// Some transactions behave in special ways regarding income tax
// name then
// PensionNorwich
// (transfers here out of income reduce income tax liability),
// or PensionSSNorwich
// (transfers here out of income reduce income tax + NI liability),
// or PensionDBTeachers
// (amounts here take proportion of income and add to accruing benefit value)
export const pension = 'Pension';
export const pensionSS = 'PensionSS';
export const pensionDB = 'PensionDB';
export const pensionTransfer = 'PensionTransfer';

// Transactions can be Conditional
// (i.e. they're named ConditionalDoSomething)
// the condition is that they only execute if the
// target asset is negative
// (so used to keep a cash float positive, fvor example)
export const conditional = 'Conditional';

// Transactions can be Revalue
// which simply replaces the value of an existing
// asset/income/expense
// with a new value obtained on a given date.
// Supply no FROM, a name for TO
// and an absolute value for TO
// Useful for recalibrating a model back with true values.
export const revalue = 'Revalue';

// Reported deltas on assets can be flagged as 'growth'
export const growth = 'growth';

// Track quantities or discrete assets using this string
export const quantity = 'quantity';

// Transaction types:
//  Auto-generated (e.g. about pension)
export const autogen = 'auto';
//  Custom transaction (are still staying as transactions)
export const custom = 'custom';
//  Revalue incomes
export const revalueInc = 'revalueInc';
//  Revalue expenses
export const revalueExp = 'revalueExp';
//  Revalue assets
export const revalueAsset = 'revalueAsset';
//  Revalue debts
export const revalueDebt = 'revalueDebt';
//  Revalue settings
export const revalueSetting = 'revalueSetting';
//  Liquidate assets to keep cash afloat
// (Conditional sell to cash)
export const liquidateAsset = 'liquidateAsset';
//  Use cash to pay off debts
// (Conditional cash to debt)
export const payOffDebt = 'payOffDebt';

// settings types
export const constType = 'const';
export const viewType = 'view';
export const adjustableType = 'adjustable';
