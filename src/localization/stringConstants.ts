export const NO_ASSET_NAME = '';
export const separator = '/';

// All models have a Cash asset and this is its name
export const CASH_ASSET_NAME = 'Cash';

// All models used to have a taxPot which keeps a tally of payments for
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
// The asset values table defaults to Today's value but you can set an
// alternative date here
export const valueFocusDate = `Today's value focus date`;
export const valueFocusDateHint = `Date to use for 'today's value' tables (defaults to '' meaning today)`;
// whether bars on the charts show monthly or annual values
export const viewFrequency = 'View frequency';
// "Data plotted 'monthly' or 'annually'";
export const annually = 'Annually';
export const monthly = 'Monthly';
// whether charts bundle items into categories
// a coarse view uses categories and is simpler to look at
// a detailed view ignores categories and represents everything
// separately
export const viewDetail = 'View detail';
//  "View detail ('Categorised view' or 'Detailed view')";
export const total = 'Totalled view';
export const coarse = 'Categorised view';
export const fine = 'Detailed view';
// The asset chart can show all assets/expenses/incomes
// (set focus to All)
// or all things in a given category
// or an individual named thing
export const assetChartFocus = 'Focus of assets chart';
//  "Assets chart can display a category, a single asset, or 'All'";
export const debtChartFocus = 'Focus of debts chart';
//  "Debts chart can display a category, a single debt, or 'All'";
export const expenseChartFocus = 'Focus of expenses chart';
//  "Expenses chart can display a category, a single expense, or 'All'";
export const incomeChartFocus = 'Focus of incomes chart';
//  "Incomes chart can display a category, a single income, or 'All'";
export const taxChartFocusPerson = 'Focus of tax chart, person';
//  "Tax chart can show data pertinent to a named individual or 'All'";
export const taxChartFocusType = 'Focus of tax chart, type';
//  "Tax chart can show data for 'income', 'gain' or 'All'";
export const taxChartShowNet = 'Tax chart, whether to include net income/gains';
//  "Show net can be 'Y', 'N', 'y', 'n', 'yes', 'no'";
export const allItems = 'All';
// Asset chart bars represent the value of the asset/debt
// or the delta (additions, reductions or both)
export const chartViewType = 'Type of view for chart';
//  "Chart uses setting '+', '-', '+-' or 'val'";
export const chartVals = 'val';
export const chartAdditions = '+';
export const chartReductions = '-';
export const chartDeltas = '+-';

// The app ships with a sample model that covers some of the
// types of assets, income, expenses and transactions.
// The sample data can be loaded into a model.
export const exampleModelName = 'Simple';

// Incomes can be liable to incomeTax or NI
// concatenate with liable person's name
// e.g. IncomeTaxJoe or NIJane
export const incomeTax = '(incomeTax)';
export const nationalInsurance = '(NI)';
export const taxableBenefit = 'TaxableBenefit';
export const income = 'income';
export const gain = 'gain';
export const net = '(net)';
// Assets can of the form CrystallizedPension
// and transfer to cash is liable to income tax for
// the named owner
// (i.e. named CrystallizedPensionJack)
// generates income tax liability for Jack
export const crystallizedPension = '-CPTaxable ';
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

export const pension = '-DC ';
export const pensionSS = '-PSS ';
export const pensionDB = '-DB ';
export const pensionTransfer = '-DBT ';
export const moveTaxFreePart = '-CPTaxFreeM ';
export const taxFree = '-CPTaxFree ';
export const transferCrystallizedPension = '-CPT ';

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

// Track purchase price of aasets liable to capital gains
export const purchase = 'Purchase';

// Flag certain assets as RSUs
export const rsu = 'RSU';

// Track vesting values for RSUs
export const vestedEval = 'VestedEval';
export const vestedNum = 'VestedNum';

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

export const EvaluateAllAssets = 'EvaluateAllAssets';

export const TestModel01 = 'TestModel01';
export const TestModel02 = 'TestModel02';
export const CoarseAndFine = 'CoarseAndFine';
export const FutureExpense = 'FutureExpense';
export const ThreeChryslerModel = 'ThreeChryslerModel';
export const MinimalModel = 'MinimalModel';
export const BenAndJerryModel = 'BenAndJerryModel';

export interface ViewType {
  lc: string;
}
export const homeView: ViewType = { lc: 'Home' };
export const expensesView: ViewType = { lc: 'Expenses' };
export const incomesView: ViewType = { lc: 'Incomes' };
export const transactionsView: ViewType = { lc: 'Transactions' };
export const assetsView: ViewType = { lc: 'Assets' };
export const debtsView: ViewType = { lc: 'Debts' };
export const triggersView: ViewType = { lc: 'Dates' };
export const settingsView: ViewType = { lc: 'Settings' };
export const taxView: ViewType = { lc: 'Tax' };

export const expensesChart: ViewType = { lc: 'Expenses chart' };
export const incomesChart: ViewType = { lc: 'Incomes chart' };
export const assetsChart: ViewType = { lc: 'Assets chart' };
export const debtsChart: ViewType = { lc: 'Debts chart' };

export const expensesTable: ViewType = { lc: 'Expenses table' };
export const incomesTable: ViewType = { lc: 'Incomes table' };
export const assetsTable: ViewType = { lc: 'Assets table' };
export const debtsTable: ViewType = { lc: 'Debts table' };
export const transactionsTable: ViewType = { lc: 'Transactions table' };
export const triggersTable: ViewType = { lc: 'Dates table' };
export const settingsTable: ViewType = { lc: 'Settings table' };

export const overview: ViewType = { lc: 'Overview' };
