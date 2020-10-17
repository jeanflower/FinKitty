import {
  incomeTax,
  CASH_ASSET_NAME,
  revalueAsset,
  payOffDebt,
  roiStart,
  viewType,
  roiEnd,
  constType,
  coarse,
  viewDetail,
  TestModel01,
  TestModel02,
  CoarseAndFine,
  FutureExpense,
  ThreeChryslerModel,
  MinimalModel,
} from '../localization/stringConstants';
import { DbModelData } from '../types/interfaces';
import {
  //  log,
  simpleExpense,
  simpleIncome,
  simpleAsset,
  simpleTransaction,
  browserTestSettings,
  makeDateFromString,
  setSetting,
  defaultSettings,
  emptyModel,
  getMinimalModelCopy,
  setROI,
} from '../utils';

export const simpleExampleData =
  '{"triggers":[{"NAME":"GetRidOfCar","DATE":"2025-12-31T00:00:00.000Z"},{"NAME":"StopMainWork","DATE":"2050-12-31T00:00:00.000Z"},{"NAME":"TransferMortgage","DATE":"2028-01-01T00:00:00.000Z"}],"expenses":[{"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"},{"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"5","RECURRENCE":"1m"},{"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"}],"incomes":[{"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"2","LIABILITY":"Joe(incomeTax)"},{"NAME":"Side hustle income","CATEGORY":"hustle","START":"1 March 2018","END":"2 April 2025","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""},{"NAME":"Side hustle income later","CATEGORY":"hustle","START":"2 April 2025","END":"2 April 2029","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""}],"assets":[{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"EarlyMortgage","VALUE":"-234000","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"2.33","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},{"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"LateMortgage","VALUE":"0","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"4.66","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},{"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],"transactions":[{"DATE":"1 January 2018","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay early mortgage","TO":"EarlyMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"TransferMortgage","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},{"DATE":"TransferMortgage","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay late mortgage","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},{"NAME":"Each month buy food","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"200","TO":"","TO_ABSOLUTE":true,"TO_VALUE":"0.0","DATE":"January 2 2018","STOP_DATE":"","RECURRENCE":"1m","CATEGORY":"living costs","TYPE":"custom"},{"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},{"NAME":"SellCar","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"0.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"1000","DATE":"GetRidOfCar","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"},{"NAME":"switchMortgage","FROM":"EarlyMortgage","FROM_ABSOLUTE":false,"FROM_VALUE":"1","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"TransferMortgage","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"}],"settings":[{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"},{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or `All`","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or `All`","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or `All`","TYPE":"view"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or `All`","TYPE":"view"},{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail (`Categorised view` or `Detailed view`)","TYPE":"view"},{"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted `monthly` or `annually`","TYPE":"view"},{"NAME": "Asset value focus date", "VALUE": "", "HINT": "Date to use for Asset value table (defaults to \'\' meaning today)", "TYPE": "view"},{"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]}';
export const billAndBenExampleData =
  '{"triggers":[{"NAME":"BenDies","DATE":"2064-12-12T00:00:00.000Z"},{"NAME":"BenRetires","DATE":"2037-07-27T23:00:00.000Z"},{"NAME":"BenStatePensionAge","DATE":"2040-08-30T23:00:00.000Z"},{"NAME":"BillDies","DATE":"2071-07-19T23:00:00.000Z"},{"NAME":"BillRetires","DATE":"2040-05-04T23:00:00.000Z"},{"NAME":"BillStatePensionAge","DATE":"2047-05-04T23:00:00.000Z"},{"NAME":"CareCostsStart","DATE":"2055-12-12T00:00:00.000Z"},{"NAME":"DownsizeHouse","DATE":"2047-02-28T00:00:00.000Z"},{"NAME":"start","DATE":"2021-01-01T00:00:00.000Z"}],"expenses":[{"NAME":"BasicExpensesDownsize","VALUE":"1600","VALUE_SET":"25/11/2019","START":"DownsizeHouse","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Basic","RECURRENCE":"1m"},{"NAME":"BasicExpensesWorking","VALUE":"1850","VALUE_SET":"25/11/2019","START":"25/11/2019","END":"DownsizeHouse","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":"Basic","RECURRENCE":"1m"},{"NAME":"CareCosts","CATEGORY":"Care","START":"CareCostsStart","END":"BillDies","VALUE":"3500","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"},{"NAME":"LeisureExpensesRetired","CATEGORY":"Leisure","START":"BillRetires","END":"BillDies","VALUE":"1500","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"},{"NAME":"LeisureExpensesWorking","VALUE":"1000","VALUE_SET":"25/11/2019","START":"25/11/2019","END":"CareCostsStart","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Leisure","RECURRENCE":"1m"}],"incomes":[{"NAME":"BenSalary","CATEGORY":"Salary","START":"25/11/2019","END":"BenRetires","VALUE":"4000","VALUE_SET":"25/11/2019","GROWTH":"2","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)/Ben(NI)"},{"NAME":"BenStatePension","VALUE":"730","VALUE_SET":"25/11/2019","START":"BenStatePensionAge","END":"BenDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)","CATEGORY":"Pension"},{"NAME":"BillDBPension","VALUE":"2000","VALUE_SET":"25/11/2019","START":"BillStatePensionAge","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)","CATEGORY":"Pension"},{"NAME":"BillSalary","CATEGORY":"Salary","START":"25/11/2019","END":"BillRetires","VALUE":"3000","VALUE_SET":"25/11/2019","GROWTH":"2","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)/Bill(NI)"},{"NAME":"BillStatePension","VALUE":"730","VALUE_SET":"25/11/2019","START":"BillStatePensionAge","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)","CATEGORY":"Pension"}],"transactions":[{"DATE":"DownsizeHouse","FROM":"Cash","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"Conditional clear mortgage","TO":"Mortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"payOffDebt","CATEGORY":""},{"DATE":"start","FROM":"Cash","FROM_VALUE":"400","FROM_ABSOLUTE":true,"NAME":"Conditional Pay Ben Loan","TO":"BenLoan","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"Clear Debts"},{"DATE":"start","FROM":"Cash","FROM_VALUE":"300","FROM_ABSOLUTE":true,"NAME":"Conditional Pay Bill Loan","TO":"BillLoan","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"Clear Debts"},{"DATE":"start","FROM":"Cash","FROM_VALUE":"750","FROM_ABSOLUTE":true,"NAME":"Conditional Pay Mortgage","TO":"Mortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"Clear Debts"},{"DATE":"BenRetires","FROM":"CrystallizedPensionBen","FROM_VALUE":"2000","FROM_ABSOLUTE":true,"NAME":"Conditional Sell Ben Pension For Cash","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset","CATEGORY":""},{"DATE":"BillRetires","FROM":"CrystallizedPensionBill","FROM_VALUE":"2000","FROM_ABSOLUTE":true,"NAME":"Conditional Sell Bill Pension For Cash","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset","CATEGORY":""},{"DATE":"start","FROM":"BillStocks","FROM_VALUE":"2000","FROM_ABSOLUTE":true,"NAME":"Conditional Sell Stock For Cash","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset","CATEGORY":""},{"DATE":"BenRetires","FROM":"PensionBenDC","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CrystallizedPension Ben","TO":"CrystallizedPensionBen","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"auto","CATEGORY":""},{"DATE":"BillRetires","FROM":"PensionBillDC","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CrystallizedPension Bill","TO":"CrystallizedPensionBill","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"auto","CATEGORY":""},{"DATE":"DownsizeHouse","FROM":"House","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"Sell House","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"0.95","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"}],"assets":[{"NAME":"BenLoan","VALUE":"-5000","QUANTITY":"","START":"start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"Debt"},{"NAME":"BillLoan","VALUE":"-5000","QUANTITY":"","START":"start","LIABILITY":"","GROWTH":"2.5","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"Debt"},{"NAME":"BillStocks","VALUE":"25000","START":"start","LIABILITY":"Bill(CGT)","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"14000","CATEGORY":"Investment","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"Cash","START":"1 Jan 1990","VALUE":"0","GROWTH":"0.0","CPI_IMMUNE":false,"LIABILITY":"","PURCHASE_PRICE":"0","CATEGORY":"","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"CrystallizedPensionBen","VALUE":"0","START":"start","GROWTH":"2","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0","LIABILITY":"","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"CrystallizedPensionBill","VALUE":"0","START":"start","GROWTH":"2","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0","LIABILITY":"","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"House","VALUE":"275000","START":"start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Property","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"ISA","VALUE":"9000","START":"start","LIABILITY":"","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Investment","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"Mortgage","VALUE":"-250000","QUANTITY":"","START":"start","LIABILITY":"","GROWTH":"3.5","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"Debt"},{"NAME":"PensionBenDC","VALUE":"75000","START":"start","LIABILITY":"","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Pension","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"PensionBillDC","VALUE":"90000","START":"start","LIABILITY":"","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Pension","IS_A_DEBT":false,"QUANTITY":""}],"settings":[{"NAME":"Beginning of view range","VALUE":"1 Jan 2020","HINT":"Date at the start of range to be plotted","TYPE":"view"},{"NAME":"cpi","VALUE":"0.5","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"End of view range","VALUE":"1 Jan 2075","HINT":"Date at the end of range to be plotted","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or `All`","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or `All`","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or `All`","TYPE":"view"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or `All`","TYPE":"view"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail (`Categorised view` or `Detailed view`)","TYPE":"view"},{"NAME":"View frequency","VALUE":"Annual","HINT":"Data plotted `monthly` or `annually`","TYPE":"view"},{"NAME": "Asset value focus date", "VALUE": "", "HINT": "Date to use for Asset value table (defaults to \'\' meaning today)", "TYPE": "view"}, {"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]}';
export const mortgageSwitchExampleData =
  '{"triggers":[{"NAME":"GetRidOfCar","DATE":"2025-12-31T00:00:00.000Z"},{"NAME":"StopMainWork","DATE":"2050-12-31T00:00:00.000Z"},{"NAME":"TransferMortgage","DATE":"2028-01-01T00:00:00.000Z"}],"expenses":[{"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"},{"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"5","RECURRENCE":"1m"},{"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"}],"incomes":[{"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"2","LIABILITY":"Joe(incomeTax)"},{"NAME":"Side hustle income","CATEGORY":"hustle","START":"1 March 2018","END":"2 April 2025","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""},{"NAME":"Side hustle income later","CATEGORY":"hustle","START":"2 April 2025","END":"2 April 2029","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""}],"assets":[{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"EarlyMortgage","VALUE":"-234000","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"2.33","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},{"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},{"NAME":"LateMortgage","VALUE":"0","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"4.66","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},{"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],"transactions":[{"DATE":"1 January 2018","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay early mortgage","TO":"EarlyMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"TransferMortgage","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},{"DATE":"TransferMortgage","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay late mortgage","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"1 January 2040","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},{"NAME":"Each month buy food","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"200","TO":"","TO_ABSOLUTE":true,"TO_VALUE":"0.0","DATE":"January 2 2018","STOP_DATE":"","RECURRENCE":"1m","CATEGORY":"living costs","TYPE":"custom"},{"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},{"NAME":"SellCar","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"0.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"1000","DATE":"GetRidOfCar","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"},{"NAME":"switchMortgage","FROM":"EarlyMortgage","FROM_ABSOLUTE":false,"FROM_VALUE":"1","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"TransferMortgage","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"}],"settings":[{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"},{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or `All`","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or `All`","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or `All`","TYPE":"view"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or `All`","TYPE":"view"},{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting `+`, `-`, `+-` or `val`","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail (`Categorised view` or `Detailed view`)","TYPE":"view"},{"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted `monthly` or `annually`","TYPE":"view"},{"NAME": "Asset value focus date", "VALUE": "", "HINT": "Date to use for Asset value table (defaults to \'\' meaning today)", "TYPE": "view"}, {"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]}';
export const definedBenefitsPension = `{"assets":[{"NAME":"Cash","CATEGORY":"","START":"1 Jan 1990","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],"incomes":[{"NAME":"TeachingJob","VALUE":"2500","VALUE_SET":"JobStart","START":"JobStart","END":"JobStop","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},{"START":"PensionBegins","END":"PensionStops","NAME":"PensionTransferTeachersPensionScheme","VALUE":"0.0","VALUE_SET":"PensionExists","LIABILITY":"Jack(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""},{"START":"PensionBegins","END":"PensionTransfers","NAME":"PensionDBTeachersPensionScheme","VALUE":"0","VALUE_SET":"PensionExists","LIABILITY":"Joe(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""}],"expenses":[],"triggers":[{"NAME":"PensionTransfers","DATE":"2035-01-01T00:00:00.000Z"},{"NAME":"PensionStops","DATE":"2040-01-01T00:00:00.000Z"},{"NAME":"PensionExists","DATE":"2022-01-01T00:00:00.000Z"},{"NAME":"PensionBegins","DATE":"2030-01-01T00:00:00.000Z"},{"NAME":"JobStop","DATE":"2028-01-01T00:00:00.000Z"},{"NAME":"JobStart","DATE":"2020-01-01T00:00:00.000Z"}],"settings":[{"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},{"NAME":"Tax chart, whether to include net income/gains","VALUE":"Y","HINT":"Show net can be 'Y', 'N', 'y', 'n', 'yes', 'no'","TYPE":"view"},{"NAME":"Focus of tax chart, type","VALUE":"All","HINT":"Tax chart can show data for 'income', 'gain' or 'All'","TYPE":"view"},{"NAME":"Focus of tax chart, person","VALUE":"All","HINT":"Tax chart can show data pertinent to a named individual or 'All'","TYPE":"view"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},{"NAME":"End of view range","VALUE":"1 Jan 2045","HINT":"Date at the end of range to be plotted","TYPE":"view"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],"transactions":[{"NAME":"PensionTransferTeachersPensionScheme","FROM":"PensionDBTeachersPensionScheme","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"PensionTransferTeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"PensionTransfers","STOP_DATE":"PensionStops","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},{"NAME":"PensionTeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},{"NAME":"PensionDBTeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"PensionDBTeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"}],"version":4}`;
export const definedContributionsPension = `{"expenses":[],"incomes":[{"NAME":"javaJob1","CATEGORY":"programming","START":"2021","END":"2028","VALUE":"2500","VALUE_SET":"2020","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)"}],"assets":[{"NAME":"PensionAegon","VALUE":"0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},{"NAME":"CrystallizedPensionJoe","VALUE":"0.0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},{"NAME":"CrystallizedPensionJack","VALUE":"0.0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},{"NAME":"Cash","CATEGORY":"","START":"1 Jan 1990","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"},{"NAME":"AegonTaxFree","VALUE":"0.0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""}],"transactions":[{"NAME":"TransferCrystallizedPensionAegon","FROM":"CrystallizedPensionJoe","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJack","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"2035","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},{"NAME":"PensionAegon","FROM":"javaJob1","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"PensionAegon","TO_ABSOLUTE":false,"TO_VALUE":"11","DATE":"2021","STOP_DATE":"2025","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},{"NAME":"MoveTaxFreePartAegon","FROM":"PensionAegon","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"AegonTaxFree","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"2030","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},{"NAME":"CrystallizedPensionAegon","FROM":"PensionAegon","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJoe","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"2030","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"}],"settings":[{"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},{"NAME":"Tax chart, whether to include net income/gains","VALUE":"Y","HINT":"Show net can be 'Y', 'N', 'y', 'n', 'yes', 'no'","TYPE":"view"},{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"const"},{"NAME":"Focus of tax chart, type","VALUE":"All","HINT":"Tax chart can show data for 'income', 'gain' or 'All'","TYPE":"view"},{"NAME":"Focus of tax chart, person","VALUE":"All","HINT":"Tax chart can show data pertinent to a named individual or 'All'","TYPE":"view"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"PensionAegon","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},{"NAME":"End of view range","VALUE":"1 Feb 2045","HINT":"","TYPE":"const"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"","TYPE":"const"}],"triggers":[],"version":4}`;
export const nationalSavings = `{"assets":[{"NAME":"NI","VALUE":"1000000","QUANTITY":"","START":"startDate","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},{"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"startDate","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""}],"incomes":[{"NAME":"NIinterest","CATEGORY":"","START":"startDate","END":"stopDate","VALUE":"0.001241NI","VALUE_SET":"startDate","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)"}],"expenses":[{"NAME":"LivingCosts","CATEGORY":"","START":"startDate","END":"stopDate","VALUE":"900","VALUE_SET":"startDate","GROWTH":"5","CPI_IMMUNE":false,"RECURRENCE":"1m"}],"triggers":[{"NAME":"stopDate","DATE":"2040-01-01T00:00:00.000Z"},{"NAME":"startDate","DATE":"2020-01-01T00:00:00.000Z"}],"settings":[{"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},{"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},{"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},{"NAME":"Type of view for asset chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},{"NAME":"Tax chart, whether to include net income/gains","VALUE":"Y","HINT":"Show net can be 'Y', 'N', 'y', 'n', 'yes', 'no'","TYPE":"view"},{"NAME":"Focus of tax chart, type","VALUE":"All","HINT":"Tax chart can show data for 'income', 'gain' or 'All'","TYPE":"view"},{"NAME":"Focus of tax chart, person","VALUE":"All","HINT":"Tax chart can show data pertinent to a named individual or 'All'","TYPE":"view"},{"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},{"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},{"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},{"NAME":"Focus of assets chart","VALUE":"Cash","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},{"NAME":"End of view range","VALUE":"1 Jan 2030","HINT":"Date at the end of range to be plotted","TYPE":"view"},{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},{"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],"transactions":[],"version":4}`;

function getTestModel01() {
  const model: DbModelData = {
    expenses: [
      {
        ...simpleExpense,
        NAME: 'Look after dogs',
        VALUE: '500',
        VALUE_SET: '1 April 2018',
        START: '1 April 2018',
        END: '2 February 2047',
        GROWTH: '2',
        CATEGORY: 'living costs',
      },
      {
        ...simpleExpense,
        NAME: 'Run car',
        VALUE: '700',
        VALUE_SET: '1 April 2018',
        START: '1 April 2018',
        END: 'GetRidOfCar',
        GROWTH: '5',
        CATEGORY: 'living costs',
      },
      {
        ...simpleExpense,
        NAME: 'Run house',
        VALUE: '1300',
        VALUE_SET: '1 April 2018',
        START: '1 April 2018',
        END: '2 February 2099',
        GROWTH: '2',
        CATEGORY: 'living costs',
      },
    ],
    incomes: [
      {
        ...simpleIncome,
        NAME: 'Main income',
        VALUE: '3500',
        VALUE_SET: '1 March 2018',
        START: '1 March 2018',
        END: 'StopMainWork',
        GROWTH: '2',
        LIABILITY: `Joe${incomeTax}`,
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        START: 'December 2017',
        VALUE: '2000',
      },
      {
        ...simpleAsset,
        NAME: 'Stocks',
        START: 'December 2017',
        VALUE: '4000',
        GROWTH: 'stockMarketGrowth',
        CATEGORY: 'stock',
      },
      {
        ...simpleAsset,
        NAME: 'ISAs',
        START: 'December 2019',
        VALUE: '2000',
        GROWTH: 'stockMarketGrowth',
        CATEGORY: 'stock',
      },
      {
        ...simpleAsset,
        NAME: 'EarlyMortgage',
        START: '1 January 2018',
        VALUE: '-234000', // how much was borrowed
        IS_A_DEBT: true,
        GROWTH: '2.33', // good rate for early part of deal (excl cpi)
        CATEGORY: 'mortgage',
        CAN_BE_NEGATIVE: true,
      },
      {
        ...simpleAsset,
        NAME: 'LateMortgage',
        START: '1 January 2018',
        GROWTH: '4.66', // after rate goes up (excl cpi)
        IS_A_DEBT: true,
        CATEGORY: 'mortgage',
      },
    ],
    transactions: [
      {
        ...simpleTransaction,
        NAME: 'Each month buy food',
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: '200',
        DATE: 'January 2 2018',
        RECURRENCE: '1m',
        CATEGORY: 'living costs',
      },
      {
        ...simpleTransaction,
        NAME: 'Revalue stocks after loss in 2020 market crash',
        TO: 'Stocks',
        TO_ABSOLUTE: true,
        TO_VALUE: '3000',
        DATE: 'January 2 2020',
        TYPE: revalueAsset,
      },
      {
        ...simpleTransaction,
        NAME: 'SellCar',
        TO: CASH_ASSET_NAME,
        TO_ABSOLUTE: true,
        TO_VALUE: '1000',
        DATE: 'GetRidOfCar',
      },
      {
        ...simpleTransaction,
        NAME: 'switchMortgage', // at a predetermined time, rate switched
        FROM: 'EarlyMortgage',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1', // all of debt at old rate
        TO: 'LateMortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1', // becomes all of debt at new rate
        DATE: 'TransferMortgage',
      },
      {
        ...simpleTransaction,
        NAME: 'Conditional pay early mortgage',
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: '1500', // a regular monthly payment
        TO: 'EarlyMortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1', // all of amount paid goes to mortgage
        DATE: '1 January 2018',
        STOP_DATE: 'TransferMortgage',
        RECURRENCE: '1m',
        CATEGORY: 'pay mortgage',
        TYPE: payOffDebt,
      },
      {
        ...simpleTransaction,
        NAME: 'Conditional pay late mortgage',
        FROM: CASH_ASSET_NAME,
        FROM_VALUE: '1500',
        TO: 'LateMortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: 'TransferMortgage',
        STOP_DATE: '1 January 2040',
        RECURRENCE: '1m',
        CATEGORY: 'pay mortgage',
        TYPE: payOffDebt,
      },
    ],
    settings: [...browserTestSettings],
    triggers: [
      {
        NAME: 'TransferMortgage',
        DATE: makeDateFromString('Jan 01 2028'),
      },
      {
        NAME: 'StopMainWork',
        DATE: makeDateFromString('Dec 31 2050'),
      },
      {
        NAME: 'GetRidOfCar',
        DATE: makeDateFromString('Dec 31 2025'),
      },
    ],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setSetting(model.settings, roiStart, '1 Jan 2019', viewType);
  setSetting(model.settings, roiEnd, '1 Feb 2019', viewType);
  return model;
}

function getTestModel02() {
  const model: DbModelData = {
    expenses: [],
    incomes: [],
    assets: [],
    transactions: [],
    settings: [...browserTestSettings],
    triggers: [],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setSetting(model.settings, roiStart, '1 Jan 2019', constType);
  setSetting(model.settings, roiEnd, '1 Feb 2019', constType);
  return model;
}

export function getModelCoarseAndFine(): DbModelData {
  const roi = {
    start: 'April 1, 2018',
    end: 'July 10, 2018',
  };
  const model: DbModelData = {
    ...emptyModel,
    incomes: [
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'April 2 2018',
        NAME: 'PRn1',
        VALUE: '10',
        VALUE_SET: 'January 1 2018',
        CATEGORY: 'PaperRound',
      },
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'June 2 2018',
        NAME: 'PRn2',
        VALUE: '10', // single payment
        VALUE_SET: 'January 1 2018',
        CATEGORY: 'PaperRound',
      },
      {
        ...simpleIncome,
        START: 'April 1 2018',
        END: 'April 2 2018',
        NAME: 'PRn3',
        VALUE: '10', // single payment
        VALUE_SET: 'January 1 2018',
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: 'April 1 2018',
        VALUE: '500',
        CATEGORY: 'Accessible',
      },
      {
        ...simpleAsset,
        NAME: 'stocks',
        START: 'April 1 2018',
        VALUE: '500',
      },
      {
        ...simpleAsset,
        NAME: 'savings',
        START: 'June 1 2018',
        VALUE: '500',
        CATEGORY: 'Accessible',
      },
    ],
    settings: [...defaultSettings],
    expenses: [
      {
        ...simpleExpense,
        START: 'April 1 2018',
        END: 'June 2 2018',
        NAME: 'Phon',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
        CATEGORY: 'comms',
      },
      {
        ...simpleExpense,
        START: 'February 1 2018',
        END: 'June 2 2018',
        NAME: 'broadband',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
        CATEGORY: 'comms',
      },
      {
        ...simpleExpense,
        START: 'January 1 2018',
        END: 'July 2 2018',
        NAME: 'pet food',
        VALUE_SET: 'January 1 2018',
        VALUE: '12.0',
      },
    ],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };

  setROI(model, roi);
  setSetting(model.settings, viewDetail, coarse, viewType);

  return model;
}

function getModelFutureExpense() {
  const roi = {
    start: 'Dec 1, 2016 00:00:00',
    end: 'March 1, 2017 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: DbModelData = {
    ...minimalModel,
    expenses: [
      {
        ...simpleExpense,
        START: 'January 1 2018',
        END: 'July 2 2018',
        NAME: 'Phon',
        VALUE: '99',
        VALUE_SET: 'January 1 2018',
        GROWTH: '12.0',
      },
    ],
    settings: [...defaultSettings],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setROI(model, roi);
  return model;
}
export function getThreeChryslerModel(): DbModelData {
  const roi = {
    start: 'Dec 1, 2017 00:00:00',
    end: 'June 1, 2018 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: DbModelData = {
    ...minimalModel,
    assets: [
      ...minimalModel.assets,
      {
        ...simpleAsset,
        NAME: 'Cars',
        START: 'January 2 2018',
        VALUE: 'chrysler',
        QUANTITY: '3',
        CPI_IMMUNE: true,
      },
    ],
    settings: [
      ...minimalModel.settings,
      {
        NAME: 'twoChryslers',
        VALUE: '2chrysler',
        HINT: '',
        TYPE: 'const',
      },
      {
        NAME: 'chrysler',
        VALUE: '50USD',
        HINT: '',
        TYPE: 'const',
      },
      {
        NAME: 'USD',
        VALUE: '2',
        HINT: '',
        TYPE: 'adjustable',
      },
    ],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  model.assets.filter(a => {
    return a.NAME === CASH_ASSET_NAME;
  })[0].START = '1 Jan 2018';

  setROI(model, roi);
  return model;
}

export function getTestModel(input: string): DbModelData {
  // log(`getTestModel making model for ${input}`);
  if (input === TestModel01) {
    return getTestModel01();
  } else if (input === TestModel02) {
    return getTestModel02();
  } else if (input === CoarseAndFine) {
    return getModelCoarseAndFine();
  } else if (input === FutureExpense) {
    return getModelFutureExpense();
  } else if (input === ThreeChryslerModel) {
    return getThreeChryslerModel();
  } else if (input === MinimalModel) {
    return getMinimalModelCopy();
  }
  throw new Error('test model name not recognised');
}
