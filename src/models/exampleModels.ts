import {
  CASH_ASSET_NAME,
  CoarseAndFine,
  FutureExpense,
  MinimalModel,
  TestModel01,
  TestModel02,
  ThreeChryslerModel,
  allItems,
  annually,
  assetChartFocus,
  chartVals,
  chartViewType,
  birthDate,
  birthDateHint,
  coarse,
  constType,
  cpi,
  cpiHint,
  debtChartFocus,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  incomeTax,
  monthly,
  payOffDebt,
  revalueAsset,
  roiEnd,
  roiEndHint,
  roiStart,
  roiStartHint,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  valueFocusDate,
  valueFocusDateHint,
  viewDetail,
  viewFrequency,
  viewType,
  BenAndJerryModel,
} from '../localization/stringConstants';
import { ModelData, Setting } from '../types/interfaces';
import {
  defaultModelSettings,
  emptyModel,
  getMinimalModelCopy,
  makeDateFromString,
  setROI,
  setSetting,
  simpleAsset,
  simpleExpense,
  simpleIncome,
  simpleSetting,
  simpleTransaction,
  viewSetting,
} from '../utils';

export const simpleExampleData = `{"triggers":[
{"NAME":"GetRidOfCar","DATE":"2025-12-31T00:00:00.000Z"},
{"NAME":"StopMainWork","DATE":"2050-12-31T00:00:00.000Z"},
{"NAME":"TransferMortgage","DATE":"2028-01-01T00:00:00.000Z"}],
"expenses":[
{"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"},
{"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"5","RECURRENCE":"1m"},
{"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"}],
"incomes":[
{"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"2","LIABILITY":"Joe(incomeTax)"},
{"NAME":"Side hustle income","CATEGORY":"hustle","START":"1 March 2018","END":"2 April 2025","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""},
{"NAME":"Side hustle income later","CATEGORY":"hustle","START":"2 April 2025","END":"2 April 2029","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""}],
"assets":[
{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"EarlyMortgage","VALUE":"-234000","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"2.33","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},
{"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"LateMortgage","VALUE":"0","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"4.66","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},
{"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],
"transactions":[
{"DATE":"1 January 2018","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay early mortgage","TO":"EarlyMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"TransferMortgage","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},
{"DATE":"TransferMortgage","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay late mortgage","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},
{"NAME":"Each month buy food","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"200","TO":"","TO_ABSOLUTE":true,"TO_VALUE":"0.0","DATE":"January 2 2018","STOP_DATE":"","RECURRENCE":"1m","CATEGORY":"living costs","TYPE":"custom"},
{"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},
{"NAME":"SellCar","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"0.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"1000","DATE":"GetRidOfCar","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"},
{"NAME":"switchMortgage","FROM":"EarlyMortgage","FROM_ABSOLUTE":false,"FROM_VALUE":"1","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"TransferMortgage","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"}],
"settings":[
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
{"NAME": "Today's value focus date","VALUE": "","HINT": "Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE": "view"}
]}`;

export const billAndBenExampleData = `{"triggers":[
{"NAME":"BenDies","DATE":"2064-12-12T00:00:00.000Z"},
{"NAME":"BenRetires","DATE":"2037-07-27T23:00:00.000Z"},
{"NAME":"BenStatePensionAge","DATE":"2040-08-30T23:00:00.000Z"},
{"NAME":"BillDies","DATE":"2071-07-19T23:00:00.000Z"},
{"NAME":"BillRetires","DATE":"2040-05-04T23:00:00.000Z"},
{"NAME":"BillStatePensionAge","DATE":"2047-05-04T23:00:00.000Z"},
{"NAME":"CareCostsStart","DATE":"2055-12-12T00:00:00.000Z"},
{"NAME":"DownsizeHouse","DATE":"2047-02-28T00:00:00.000Z"},
{"NAME":"start","DATE":"2021-01-01T00:00:00.000Z"}],
"expenses":[
{"NAME":"BasicExpensesDownsize","VALUE":"1600","VALUE_SET":"25/11/2019","START":"DownsizeHouse","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Basic","RECURRENCE":"1m"},
{"NAME":"BasicExpensesWorking","VALUE":"1850","VALUE_SET":"25/11/2019","START":"25/11/2019","END":"DownsizeHouse","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":"Basic","RECURRENCE":"1m"},
{"NAME":"CareCosts","CATEGORY":"Care","START":"CareCostsStart","END":"BillDies","VALUE":"3500","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"},
{"NAME":"LeisureExpensesRetired","CATEGORY":"Leisure","START":"BillRetires","END":"BillDies","VALUE":"1500","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"},
{"NAME":"LeisureExpensesWorking","VALUE":"1000","VALUE_SET":"25/11/2019","START":"25/11/2019","END":"CareCostsStart","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Leisure","RECURRENCE":"1m"}],
"incomes":[
{"NAME":"BenSalary","CATEGORY":"Salary","START":"25/11/2019","END":"BenRetires","VALUE":"4000","VALUE_SET":"25/11/2019","GROWTH":"2","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)/Ben(NI)"},
{"NAME":"BenStatePension","VALUE":"730","VALUE_SET":"25/11/2019","START":"BenStatePensionAge","END":"BenDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)","CATEGORY":"Pension"},
{"NAME":"BillDBPension","VALUE":"2000","VALUE_SET":"25/11/2019","START":"BillStatePensionAge","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)","CATEGORY":"Pension"},
{"NAME":"BillSalary","CATEGORY":"Salary","START":"25/11/2019","END":"BillRetires","VALUE":"3000","VALUE_SET":"25/11/2019","GROWTH":"2","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)/Bill(NI)"},
{"NAME":"BillStatePension","VALUE":"730","VALUE_SET":"25/11/2019","START":"BillStatePensionAge","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)","CATEGORY":"Pension"}],
"transactions":[
{"DATE":"DownsizeHouse","FROM":"Cash","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"Conditional clear mortgage","TO":"Mortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"payOffDebt","CATEGORY":""},
{"DATE":"start","FROM":"Cash","FROM_VALUE":"400","FROM_ABSOLUTE":true,"NAME":"Conditional Pay Ben Loan","TO":"BenLoan","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"Clear Debts"},
{"DATE":"start","FROM":"Cash","FROM_VALUE":"300","FROM_ABSOLUTE":true,"NAME":"Conditional Pay Bill Loan","TO":"BillLoan","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"Clear Debts"},
{"DATE":"start","FROM":"Cash","FROM_VALUE":"750","FROM_ABSOLUTE":true,"NAME":"Conditional Pay Mortgage","TO":"Mortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"Clear Debts"},
{"DATE":"BenRetires","FROM":"CrystallizedPensionBen","FROM_VALUE":"2000","FROM_ABSOLUTE":true,"NAME":"Conditional Sell Ben Pension For Cash","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset","CATEGORY":""},
{"DATE":"BillRetires","FROM":"CrystallizedPensionBill","FROM_VALUE":"2000","FROM_ABSOLUTE":true,"NAME":"Conditional Sell Bill Pension For Cash","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset","CATEGORY":""},
{"DATE":"start","FROM":"BillStocks","FROM_VALUE":"2000","FROM_ABSOLUTE":true,"NAME":"Conditional Sell Stock For Cash","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset","CATEGORY":""},
{"DATE":"BenRetires","FROM":"PensionBenDC","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CrystallizedPension Ben","TO":"CrystallizedPensionBen","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"auto","CATEGORY":""},
{"DATE":"BillRetires","FROM":"PensionBillDC","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"CrystallizedPension Bill","TO":"CrystallizedPensionBill","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"auto","CATEGORY":""},
{"DATE":"DownsizeHouse","FROM":"House","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"Sell House","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"0.95","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"}],
"assets":[
{"NAME":"BenLoan","VALUE":"-5000","QUANTITY":"","START":"start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"Debt"},
{"NAME":"BillLoan","VALUE":"-5000","QUANTITY":"","START":"start","LIABILITY":"","GROWTH":"2.5","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"Debt"},
{"NAME":"BillStocks","VALUE":"25000","START":"start","LIABILITY":"Bill(CGT)","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"14000","CATEGORY":"Investment","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"Cash","START":"1 Jan 1990","VALUE":"0","GROWTH":"0.0","CPI_IMMUNE":false,"LIABILITY":"","PURCHASE_PRICE":"0","CATEGORY":"","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"CrystallizedPensionBen","VALUE":"0","START":"start","GROWTH":"2","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0","LIABILITY":"","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"CrystallizedPensionBill","VALUE":"0","START":"start","GROWTH":"2","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0","LIABILITY":"","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"House","VALUE":"275000","START":"start","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Property","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"ISA","VALUE":"9000","START":"start","LIABILITY":"","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Investment","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"Mortgage","VALUE":"-250000","QUANTITY":"","START":"start","LIABILITY":"","GROWTH":"3.5","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"Debt"},
{"NAME":"PensionBenDC","VALUE":"75000","START":"start","LIABILITY":"","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Pension","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"PensionBillDC","VALUE":"90000","START":"start","LIABILITY":"","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"PURCHASE_PRICE":"0","CATEGORY":"Pension","IS_A_DEBT":false,"QUANTITY":""}],
"settings":[
{"NAME":"Beginning of view range","VALUE":"1 Jan 2020","HINT":"Date at the start of range to be plotted","TYPE":"view"},
{"NAME":"cpi","VALUE":"0.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2075","HINT":"Date at the end of range to be plotted","TYPE":"view"},
 {"NAME": "Today's value focus date","VALUE": "","HINT": "Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE": "view"}]}`;

export const mortgageSwitchExampleData = `{"triggers":[
{"NAME":"GetRidOfCar","DATE":"2025-12-31T00:00:00.000Z"},
{"NAME":"StopMainWork","DATE":"2050-12-31T00:00:00.000Z"},
{"NAME":"TransferMortgage","DATE":"2028-01-01T00:00:00.000Z"}],
"expenses":[
{"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"},
{"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"5","RECURRENCE":"1m"},
{"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"}],
"incomes":[
{"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"2","LIABILITY":"Joe(incomeTax)"},
{"NAME":"Side hustle income","CATEGORY":"hustle","START":"1 March 2018","END":"2 April 2025","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""},
{"NAME":"Side hustle income later","CATEGORY":"hustle","START":"2 April 2025","END":"2 April 2029","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""}],
"assets":[
{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"EarlyMortgage","VALUE":"-234000","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"2.33","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},
{"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"LateMortgage","VALUE":"0","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"4.66","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},
{"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],
"transactions":[
{"DATE":"1 January 2018","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay early mortgage","TO":"EarlyMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"TransferMortgage","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},
{"DATE":"TransferMortgage","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay late mortgage","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"1 January 2040","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},
{"NAME":"Each month buy food","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"200","TO":"","TO_ABSOLUTE":true,"TO_VALUE":"0.0","DATE":"January 2 2018","STOP_DATE":"","RECURRENCE":"1m","CATEGORY":"living costs","TYPE":"custom"},
{"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},
{"NAME":"SellCar","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"0.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"1000","DATE":"GetRidOfCar","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"},
{"NAME":"switchMortgage","FROM":"EarlyMortgage","FROM_ABSOLUTE":false,"FROM_VALUE":"1","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"TransferMortgage","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"}],
"settings":[
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
 {"NAME": "Today's value focus date","VALUE": "","HINT": "Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE": "view"}]}`;

export const definedBenefitsPension = `{"assets":[
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 1990","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
"incomes":[
{"NAME":"TeachingJob","VALUE":"2500","VALUE_SET":"JobStart","START":"JobStart","END":"JobStop","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
{"START":"PensionBegins","END":"PensionStops","NAME":"PensionTransferTeachersPensionScheme","VALUE":"0.0","VALUE_SET":"PensionExists","LIABILITY":"Jack(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""},
{"START":"PensionBegins","END":"PensionTransfers","NAME":"PensionDBTeachersPensionScheme","VALUE":"0","VALUE_SET":"PensionExists","LIABILITY":"Joe(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""}],
"expenses":[
],"triggers":[
{"NAME":"PensionTransfers","DATE":"2035-01-01T00:00:00.000Z"},
{"NAME":"PensionStops","DATE":"2040-01-01T00:00:00.000Z"},
{"NAME":"PensionExists","DATE":"2022-01-01T00:00:00.000Z"},
{"NAME":"PensionBegins","DATE":"2030-01-01T00:00:00.000Z"},
{"NAME":"JobStop","DATE":"2028-01-01T00:00:00.000Z"},
{"NAME":"JobStart","DATE":"2020-01-01T00:00:00.000Z"}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2045","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
"transactions":[
{"NAME":"PensionTransferTeachersPensionScheme","FROM":"PensionDBTeachersPensionScheme","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"PensionTransferTeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"PensionTransfers","STOP_DATE":"PensionStops","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
{"NAME":"PensionTeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
{"NAME":"PensionDBTeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"PensionDBTeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"}],
"version":4}`;

export const definedContributionsPension = `{"expenses":[
],"incomes":[
{"NAME":"javaJob1","CATEGORY":"programming","START":"2021","END":"2028","VALUE":"2500","VALUE_SET":"2020","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)"}],
"assets":[
{"NAME":"PensionAegon","VALUE":"0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"CrystallizedPensionJoe","VALUE":"0.0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"CrystallizedPensionJack","VALUE":"0.0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 1990","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"},
{"NAME":"AegonTaxFree","VALUE":"0.0","QUANTITY":"","START":"2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""}],
"transactions":[
{"NAME":"TransferCrystallizedPensionAegon","FROM":"CrystallizedPensionJoe","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJack","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"2035","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},
{"NAME":"PensionAegon","FROM":"javaJob1","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"PensionAegon","TO_ABSOLUTE":false,"TO_VALUE":"11","DATE":"2021","STOP_DATE":"2025","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},
{"NAME":"MoveTaxFreePartAegon","FROM":"PensionAegon","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"AegonTaxFree","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"2030","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},
{"NAME":"CrystallizedPensionAegon","FROM":"PensionAegon","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJoe","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"2030","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"const"},
{"NAME":"End of view range","VALUE":"1 Feb 2045","HINT":"","TYPE":"const"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"","TYPE":"const"}],
"triggers":[
],"version":4}`;

export const nationalSavings = `{"assets":[
{"NAME":"NI","VALUE":"1000000","QUANTITY":"","START":"startDate","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
{"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"startDate","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""}],
"incomes":[
{"NAME":"NIinterest","CATEGORY":"","START":"startDate","END":"stopDate","VALUE":"0.001241NI","VALUE_SET":"startDate","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)"}],
"expenses":[
{"NAME":"LivingCosts","CATEGORY":"","START":"startDate","END":"stopDate","VALUE":"900","VALUE_SET":"startDate","GROWTH":"5","CPI_IMMUNE":false,"RECURRENCE":"1m"}],
"triggers":[
{"NAME":"stopDate","DATE":"2040-01-01T00:00:00.000Z"},
{"NAME":"startDate","DATE":"2020-01-01T00:00:00.000Z"}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2030","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
"transactions":[
],"version":4}`;

export const benAndJerryExampleData = `
{"assets":[
{"NAME":"PensionJerry Aegon","VALUE":"56324","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"PensionBen Prudential","VALUE":"45000","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Mortgage","VALUE":"-150000","QUANTITY":"","START":"21/02/2020","GROWTH":"3.5","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"CATEGORY":"Property","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Jerry stocks","VALUE":"25000","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Investment","PURCHASE_PRICE":"14000","LIABILITY":"Jerry(CGT)"},
{"NAME":"Jerry loan","VALUE":"-5000","QUANTITY":"","START":"21/02/2020","GROWTH":"2.5","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Jerry AegonTaxFree","VALUE":"0.0","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"ISA","VALUE":"9000","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Investment","PURCHASE_PRICE":"0","LIABILITY":""},
{"NAME":"House","VALUE":"255000","QUANTITY":"","START":"21/02/2020","GROWTH":"2","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Property","PURCHASE_PRICE":"0","LIABILITY":""},
{"NAME":"CrystallizedPensionJerry","VALUE":"0.0","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"CrystallizedPensionBen","VALUE":"0.0","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 1990","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"},
{"NAME":"Ben PrudentialTaxFree","VALUE":"0.0","QUANTITY":"","START":"21/02/2020","GROWTH":"4","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"Pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Ben loan","VALUE":"-5000","QUANTITY":"","START":"21/02/2020","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""}],"incomes":[
{"START":"Jerry state pension age","END":"Ben dies","NAME":"PensionTransferJerry work","VALUE":"0.0","VALUE_SET":"21/02/2020","LIABILITY":"Ben(incomeTax)","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Pension"},
{"START":"Jerry state pension age","END":"Jerry dies","NAME":"PensionDBJerry work","VALUE":"2000","VALUE_SET":"21/02/2020","LIABILITY":"Jerry(incomeTax)","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Pension"},
{"START":"Jerry state pension age","END":"Jerry dies","NAME":"PensionDBJerry state pension","VALUE":"730","VALUE_SET":"21/02/2020","LIABILITY":"Jerry(incomeTax)","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Pension"},
{"START":"Ben state pension age","END":"Ben dies","NAME":"PensionDBBen state pension","VALUE":"730","VALUE_SET":"21/02/2020","LIABILITY":"Ben(incomeTax)","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Pension"},
{"NAME":"Jerry salary","VALUE":"2755","VALUE_SET":"21/2/2020","START":"21/2/2020","END":"Jerry retires","GROWTH":"2","CPI_IMMUNE":false,"LIABILITY":"Jerry(incomeTax)/Jerry(NI)","CATEGORY":"Salary"},
{"NAME":"Ben salary","VALUE":"3470","VALUE_SET":"21/2/2020","START":"21/2/2020","END":"Ben retires","GROWTH":"2","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)/Ben(NI)","CATEGORY":"Salary"}],"expenses":[
{"NAME":"Replace car","VALUE":"20000","VALUE_SET":"21/02/2020","START":"21/02/2025","END":"Care costs start","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Major costs","RECURRENCE":"5y"},
{"NAME":"Leisure expenses working","VALUE":"1000","VALUE_SET":"21/02/2020","START":"21/02/2020","END":"Jerry retires","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Leisure","RECURRENCE":"1m"},
{"NAME":"Leisure expenses retired","VALUE":"2000","VALUE_SET":"21/02/2020","START":"Jerry retires","END":"Care costs start","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Leisure","RECURRENCE":"1m"},
{"NAME":"House maintenance","VALUE":"8000","VALUE_SET":"21/02/2020","START":"21/02/2020","END":"Care costs start","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Major costs","RECURRENCE":"4y"},
{"NAME":"Care costs","VALUE":"3000","VALUE_SET":"21/02/2020","START":"Care costs start","END":"Ben dies","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Care","RECURRENCE":"1m"},
{"NAME":"Basic expenses small house","VALUE":"1600","VALUE_SET":"21/02/2020","START":"Downsize house","END":"Ben dies","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Basic","RECURRENCE":"1m"},
{"NAME":"Basic expenses current house","VALUE":"1850","VALUE_SET":"21/02/2020","START":"21/02/2020","END":"Downsize house","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Basic","RECURRENCE":"1m"}],
"triggers":[
{"NAME":"Ben dies","DATE":"2068-08-30T23:00:00.000Z"},
{"NAME":"Ben retires","DATE":"2032-07-27T23:00:00.000Z"},
{"NAME":"Ben state pension age","DATE":"2040-08-30T23:00:00.000Z"},
{"NAME":"Care costs start","DATE":"2060-02-20T00:00:00.000Z"},
{"NAME":"Downsize house","DATE":"2047-02-28T00:00:00.000Z"},
{"NAME":"Jerry dies","DATE":"2065-05-04T23:00:00.000Z"},
{"NAME":"Jerry retires","DATE":"2030-05-04T23:00:00.000Z"},
{"NAME":"Jerry state pension age","DATE":"2037-05-04T23:00:00.000Z"}],"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"2069","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"2020","HINT":"Date at the start of range to be plotted","TYPE":"view"}],"transactions":[
{"NAME":"TransferCrystallizedPensionJerry Aegon","FROM":"CrystallizedPensionJerry","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionBen","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Jerry dies","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"TransferCrystallizedPensionBen Prudential","FROM":"CrystallizedPensionBen","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJerry","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Ben dies","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"PensionTransferJerry work","FROM":"PensionDBJerry work","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"PensionTransferJerry work","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"Jerry dies","STOP_DATE":"Ben dies","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"PensionJerry work","FROM":"Jerry salary","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"21/02/2020","STOP_DATE":"Jerry retires","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"PensionJerry Aegon","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"0","TO":"PensionJerry Aegon","TO_ABSOLUTE":false,"TO_VALUE":"0","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"PensionDBJerry work","FROM":"Jerry salary","FROM_ABSOLUTE":false,"FROM_VALUE":"0.00125","TO":"PensionDBJerry work","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"21/02/2020","STOP_DATE":"Jerry retires","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"PensionBen Prudential","FROM":"Ben salary","FROM_ABSOLUTE":false,"FROM_VALUE":"0.06","TO":"PensionBen Prudential","TO_ABSOLUTE":false,"TO_VALUE":"3","DATE":"21/02/2020","STOP_DATE":"Ben retires","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"MoveTaxFreePartJerry Aegon","FROM":"PensionJerry Aegon","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"Jerry AegonTaxFree","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Jerry retires","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"MoveTaxFreePartBen Prudential","FROM":"PensionBen Prudential","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"Ben PrudentialTaxFree","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Ben retires","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"CrystallizedPensionJerry Aegon","FROM":"PensionJerry Aegon","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJerry","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Jerry retires","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"CrystallizedPensionBen Prudential","FROM":"PensionBen Prudential","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionBen","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Ben retires","STOP_DATE":"","RECURRENCE":"","CATEGORY":"Pension","TYPE":"auto"},
{"NAME":"ConditionalSell stocks for cash","CATEGORY":"Cashflow","FROM":"Jerry stocks","FROM_ABSOLUTE":true,"FROM_VALUE":"500","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset"},
{"NAME":"ConditionalSell PrudentialTaxFree ","CATEGORY":"Cashflow","FROM":"Ben PrudentialTaxFree","FROM_ABSOLUTE":true,"FROM_VALUE":"250","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset"},
{"NAME":"ConditionalSell ISAs for cash","CATEGORY":"Cashflow","FROM":"ISA","FROM_ABSOLUTE":true,"FROM_VALUE":"500","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset"},
{"NAME":"ConditionalSell CrystallizedPensionJerry ","CATEGORY":"Cashflow","FROM":"CrystallizedPensionJerry","FROM_ABSOLUTE":true,"FROM_VALUE":"1000","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset"},
{"NAME":"ConditionalSell CrystallizedPensionBen ","CATEGORY":"Cashflow","FROM":"CrystallizedPensionBen","FROM_ABSOLUTE":true,"FROM_VALUE":"1000","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset"},
{"NAME":"ConditionalSell AegonTaxFree","CATEGORY":"Cashflow","FROM":"Jerry AegonTaxFree","FROM_ABSOLUTE":true,"FROM_VALUE":"250","TO":"Cash","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"liquidateAsset"},
{"NAME":"ConditionalPayment to Mortgage 1","CATEGORY":"Property","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"700","TO":"Mortgage","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt"},
{"NAME":"ConditionalPayment to Jerry loan 1","CATEGORY":"","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"250","TO":"Jerry loan","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt"},
{"NAME":"ConditionalPayment to Ben loan 1","CATEGORY":"","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"500","TO":"Ben loan","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"21/02/2020","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt"}],
"version":5,
}`;

const browserTestSettingsForMigration: Setting[] = [
  {
    ...viewSetting,
    NAME: roiStart,
    VALUE: '1 Jan 2019',
    HINT: roiStartHint,
  },
  {
    ...viewSetting,
    NAME: roiEnd,
    VALUE: '1 Feb 2019',
    HINT: roiEndHint,
  },
  {
    ...viewSetting,
    NAME: chartViewType,
    VALUE: chartVals, // could be 'deltas'
  },
  {
    ...viewSetting,
    NAME: viewFrequency,
    VALUE: annually, // could be 'Monthly'
  },
  {
    ...viewSetting,
    NAME: viewDetail,
    VALUE: fine, // could be coarse
  },
  {
    ...simpleSetting,
    NAME: cpi,
    VALUE: '2.5',
    HINT: cpiHint,
  },
  {
    ...simpleSetting,
    NAME: 'stockMarketGrowth',
    VALUE: '6.236',
    HINT: 'Custom setting for stock market growth',
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
    VALUE: '',
    HINT: birthDateHint,
  },
  {
    ...viewSetting,
    NAME: valueFocusDate,
    VALUE: '',
    HINT: valueFocusDateHint,
  },
];

function getTestModel01ForMigration() {
  const model: ModelData = {
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
    settings: [...browserTestSettingsForMigration],
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

function getTestModel02ForMigration() {
  const model: ModelData = {
    expenses: [],
    incomes: [],
    assets: [],
    transactions: [],
    settings: [...browserTestSettingsForMigration],
    triggers: [],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  setSetting(model.settings, roiStart, '1 Jan 2019', constType);
  setSetting(model.settings, roiEnd, '1 Feb 2019', constType);
  return model;
}

export function getModelCoarseAndFine(): ModelData {
  const roi = {
    start: 'April 1, 2018',
    end: 'July 10, 2018',
  };

  const model: ModelData = {
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
    settings: [...defaultModelSettings(roi)],
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

  return model;
}

const defaultModelSettingsForMigration: Setting[] = [
  { ...viewSetting, NAME: viewDetail, VALUE: fine },
  { ...viewSetting, NAME: chartViewType, VALUE: chartVals },
  {
    ...viewSetting,
    NAME: assetChartFocus,
    VALUE: allItems,
  },
  {
    ...viewSetting,
    NAME: debtChartFocus,
    VALUE: allItems,
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
    NAME: taxChartFocusPerson,
    VALUE: allItems,
  },
  {
    ...viewSetting,
    NAME: taxChartFocusType,
    VALUE: allItems,
  },
  {
    ...viewSetting,
    NAME: taxChartShowNet,
    VALUE: 'Y',
  },
  {
    ...simpleSetting,
    NAME: cpi,
    VALUE: '0.0',
    HINT: cpiHint,
  },
  {
    ...viewSetting,
    NAME: birthDate,
    VALUE: '',
    HINT: birthDateHint,
  },
  {
    ...viewSetting,
    NAME: valueFocusDate,
    VALUE: '',
    HINT: valueFocusDateHint,
  },
];

export function getModelCoarseAndFineForMigration(): ModelData {
  const roi = {
    start: 'April 1, 2018',
    end: 'July 10, 2018',
  };

  const settings = defaultModelSettingsForMigration;
  setSetting(settings, viewDetail, coarse, viewType);
  setSetting(settings, viewFrequency, monthly, viewType);

  const model: ModelData = {
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
    settings: settings,
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

  return model;
}

function getModelFutureExpenseForMigration() {
  const roi = {
    start: 'Dec 1, 2016 00:00:00',
    end: 'March 1, 2017 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: ModelData = {
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

  //log(`future expense settings ${model.settings.map(showObj)}`);
  return model;
}
export function getThreeChryslerModel(): ModelData {
  const roi = {
    start: 'Dec 1, 2017 00:00:00',
    end: 'June 1, 2018 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: ModelData = {
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

export function getThreeChryslerModelForMigration(): ModelData {
  const roi = {
    start: 'Dec 1, 2017 00:00:00',
    end: 'June 1, 2018 00:00:00',
  };
  const minimalModel = getMinimalModelCopy();
  const model: ModelData = {
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
      {
        ...viewSetting,
        NAME: viewFrequency,
        VALUE: monthly,
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

export function getBenAndJerryModel(): ModelData {
  const model: ModelData = {
    assets: [
      {
        NAME: 'PensionJerry Aegon',
        VALUE: '56324',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Pension',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'PensionBen Prudential',
        VALUE: '45000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Pension',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'Mortgage',
        VALUE: '-150000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '3.5',
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: true,
        CATEGORY: 'Property',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'Jerry stocks',
        VALUE: '25000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Investment',
        PURCHASE_PRICE: '14000',
        LIABILITY: 'Jerry(CGT)',
      },
      {
        NAME: 'Jerry loan',
        VALUE: '-5000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '2.5',
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: true,
        CATEGORY: '',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'Jerry AegonTaxFree',
        VALUE: '0.0',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Pension',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'ISA',
        VALUE: '9000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Investment',
        PURCHASE_PRICE: '0',
        LIABILITY: '',
      },
      {
        NAME: 'House',
        VALUE: '255000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '2',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Property',
        PURCHASE_PRICE: '0',
        LIABILITY: '',
      },
      {
        NAME: 'CrystallizedPensionJerry',
        VALUE: '0.0',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Pension',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'CrystallizedPensionBen',
        VALUE: '0.0',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Pension',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'Cash',
        CATEGORY: '',
        START: '1 Jan 1990',
        VALUE: '0.0',
        QUANTITY: '',
        GROWTH: '0.0',
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: false,
        LIABILITY: '',
        PURCHASE_PRICE: '0.0',
      },
      {
        NAME: 'Ben PrudentialTaxFree',
        VALUE: '0.0',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '4',
        CPI_IMMUNE: false,
        CAN_BE_NEGATIVE: false,
        IS_A_DEBT: false,
        CATEGORY: 'Pension',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
      {
        NAME: 'Ben loan',
        VALUE: '-5000',
        QUANTITY: '',
        START: '21/02/2020',
        GROWTH: '0',
        CPI_IMMUNE: true,
        CAN_BE_NEGATIVE: true,
        IS_A_DEBT: true,
        CATEGORY: '',
        PURCHASE_PRICE: '0.0',
        LIABILITY: '',
      },
    ],
    incomes: [
      {
        START: 'Jerry state pension age',
        END: 'Ben dies',
        NAME: 'PensionTransferJerry work',
        VALUE: '0.0',
        VALUE_SET: '21/02/2020',
        LIABILITY: 'Ben(incomeTax)',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Pension',
      },
      {
        START: 'Jerry state pension age',
        END: 'Jerry dies',
        NAME: 'PensionDBJerry work',
        VALUE: '2000',
        VALUE_SET: '21/02/2020',
        LIABILITY: 'Jerry(incomeTax)',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Pension',
      },
      {
        START: 'Jerry state pension age',
        END: 'Jerry dies',
        NAME: 'PensionDBJerry state pension',
        VALUE: '730',
        VALUE_SET: '21/02/2020',
        LIABILITY: 'Jerry(incomeTax)',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Pension',
      },
      {
        START: 'Ben state pension age',
        END: 'Ben dies',
        NAME: 'PensionDBBen state pension',
        VALUE: '730',
        VALUE_SET: '21/02/2020',
        LIABILITY: 'Ben(incomeTax)',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Pension',
      },
      {
        NAME: 'Jerry salary',
        VALUE: '2755',
        VALUE_SET: '21/2/2020',
        START: '21/2/2020',
        END: 'Jerry retires',
        GROWTH: '2',
        CPI_IMMUNE: false,
        LIABILITY: 'Jerry(incomeTax)/Jerry(NI)',
        CATEGORY: 'Salary',
      },
      {
        NAME: 'Ben salary',
        VALUE: '3470',
        VALUE_SET: '21/2/2020',
        START: '21/2/2020',
        END: 'Ben retires',
        GROWTH: '2',
        CPI_IMMUNE: false,
        LIABILITY: 'Ben(incomeTax)/Ben(NI)',
        CATEGORY: 'Salary',
      },
    ],
    expenses: [
      {
        NAME: 'Replace car',
        VALUE: '20000',
        VALUE_SET: '21/02/2020',
        START: '21/02/2025',
        END: 'Care costs start',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Major costs',
        RECURRENCE: '5y',
      },
      {
        NAME: 'Leisure expenses working',
        VALUE: '1000',
        VALUE_SET: '21/02/2020',
        START: '21/02/2020',
        END: 'Jerry retires',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Leisure',
        RECURRENCE: '1m',
      },
      {
        NAME: 'Leisure expenses retired',
        VALUE: '2000',
        VALUE_SET: '21/02/2020',
        START: 'Jerry retires',
        END: 'Care costs start',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Leisure',
        RECURRENCE: '1m',
      },
      {
        NAME: 'House maintenance',
        VALUE: '8000',
        VALUE_SET: '21/02/2020',
        START: '21/02/2020',
        END: 'Care costs start',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Major costs',
        RECURRENCE: '4y',
      },
      {
        NAME: 'Care costs',
        VALUE: '3000',
        VALUE_SET: '21/02/2020',
        START: 'Care costs start',
        END: 'Ben dies',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Care',
        RECURRENCE: '1m',
      },
      {
        NAME: 'Basic expenses small house',
        VALUE: '1600',
        VALUE_SET: '21/02/2020',
        START: 'Downsize house',
        END: 'Ben dies',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Basic',
        RECURRENCE: '1m',
      },
      {
        NAME: 'Basic expenses current house',
        VALUE: '1850',
        VALUE_SET: '21/02/2020',
        START: '21/02/2020',
        END: 'Downsize house',
        GROWTH: '0',
        CPI_IMMUNE: false,
        CATEGORY: 'Basic',
        RECURRENCE: '1m',
      },
    ],
    triggers: [
      { NAME: 'Ben dies', DATE: new Date('2068-08-30T23:00:00.000Z') },
      { NAME: 'Ben retires', DATE: new Date('2032-07-27T23:00:00.000Z') },
      {
        NAME: 'Ben state pension age',
        DATE: new Date('2040-08-30T23:00:00.000Z'),
      },
      { NAME: 'Care costs start', DATE: new Date('2060-02-20T00:00:00.000Z') },
      { NAME: 'Downsize house', DATE: new Date('2047-02-28T00:00:00.000Z') },
      { NAME: 'Jerry dies', DATE: new Date('2065-05-04T23:00:00.000Z') },
      { NAME: 'Jerry retires', DATE: new Date('2030-05-04T23:00:00.000Z') },
      {
        NAME: 'Jerry state pension age',
        DATE: new Date('2037-05-04T23:00:00.000Z'),
      },
    ],
    settings: [
      {
        NAME: "Today's value focus date",
        VALUE: '',
        HINT:
          "Date to use for 'today's value' tables (defaults to '' meaning today)",
        TYPE: 'view',
      },
      {
        NAME: 'End of view range',
        VALUE: '2069',
        HINT: 'Date at the end of range to be plotted',
        TYPE: 'view',
      },
      {
        NAME: 'Date of birth',
        VALUE: '',
        HINT: 'Date used for representing dates as ages',
        TYPE: 'view',
      },
      {
        NAME: 'cpi',
        VALUE: '2.5',
        HINT: 'Annual rate of inflation',
        TYPE: 'const',
      },
      {
        NAME: 'Beginning of view range',
        VALUE: '2020',
        HINT: 'Date at the start of range to be plotted',
        TYPE: 'view',
      },
    ],
    transactions: [
      {
        NAME: 'TransferCrystallizedPensionJerry Aegon',
        FROM: 'CrystallizedPensionJerry',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1.0',
        TO: 'CrystallizedPensionBen',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: 'Jerry dies',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'TransferCrystallizedPensionBen Prudential',
        FROM: 'CrystallizedPensionBen',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1.0',
        TO: 'CrystallizedPensionJerry',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: 'Ben dies',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'PensionTransferJerry work',
        FROM: 'PensionDBJerry work',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1.0',
        TO: 'PensionTransferJerry work',
        TO_ABSOLUTE: false,
        TO_VALUE: '0.5',
        DATE: 'Jerry dies',
        STOP_DATE: 'Ben dies',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'PensionJerry work',
        FROM: 'Jerry salary',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.05',
        TO: '',
        TO_ABSOLUTE: false,
        TO_VALUE: '0.0',
        DATE: '21/02/2020',
        STOP_DATE: 'Jerry retires',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'PensionJerry Aegon',
        FROM: '',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0',
        TO: 'PensionJerry Aegon',
        TO_ABSOLUTE: false,
        TO_VALUE: '0',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'PensionDBJerry work',
        FROM: 'Jerry salary',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.00125',
        TO: 'PensionDBJerry work',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: '21/02/2020',
        STOP_DATE: 'Jerry retires',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'PensionBen Prudential',
        FROM: 'Ben salary',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.06',
        TO: 'PensionBen Prudential',
        TO_ABSOLUTE: false,
        TO_VALUE: '3',
        DATE: '21/02/2020',
        STOP_DATE: 'Ben retires',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'MoveTaxFreePartJerry Aegon',
        FROM: 'PensionJerry Aegon',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.25',
        TO: 'Jerry AegonTaxFree',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: 'Jerry retires',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'MoveTaxFreePartBen Prudential',
        FROM: 'PensionBen Prudential',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '0.25',
        TO: 'Ben PrudentialTaxFree',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: 'Ben retires',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'CrystallizedPensionJerry Aegon',
        FROM: 'PensionJerry Aegon',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1.0',
        TO: 'CrystallizedPensionJerry',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: 'Jerry retires',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'CrystallizedPensionBen Prudential',
        FROM: 'PensionBen Prudential',
        FROM_ABSOLUTE: false,
        FROM_VALUE: '1.0',
        TO: 'CrystallizedPensionBen',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: 'Ben retires',
        STOP_DATE: '',
        RECURRENCE: '',
        CATEGORY: 'Pension',
        TYPE: 'auto',
      },
      {
        NAME: 'ConditionalSell stocks for cash',
        CATEGORY: 'Cashflow',
        FROM: 'Jerry stocks',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '500',
        TO: 'Cash',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'liquidateAsset',
      },
      {
        NAME: 'ConditionalSell PrudentialTaxFree ',
        CATEGORY: 'Cashflow',
        FROM: 'Ben PrudentialTaxFree',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '250',
        TO: 'Cash',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'liquidateAsset',
      },
      {
        NAME: 'ConditionalSell ISAs for cash',
        CATEGORY: 'Cashflow',
        FROM: 'ISA',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '500',
        TO: 'Cash',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'liquidateAsset',
      },
      {
        NAME: 'ConditionalSell CrystallizedPensionJerry ',
        CATEGORY: 'Cashflow',
        FROM: 'CrystallizedPensionJerry',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '1000',
        TO: 'Cash',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'liquidateAsset',
      },
      {
        NAME: 'ConditionalSell CrystallizedPensionBen ',
        CATEGORY: 'Cashflow',
        FROM: 'CrystallizedPensionBen',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '1000',
        TO: 'Cash',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'liquidateAsset',
      },
      {
        NAME: 'ConditionalSell AegonTaxFree',
        CATEGORY: 'Cashflow',
        FROM: 'Jerry AegonTaxFree',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '250',
        TO: 'Cash',
        TO_ABSOLUTE: false,
        TO_VALUE: '1',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'liquidateAsset',
      },
      {
        NAME: 'ConditionalPayment to Mortgage 1',
        CATEGORY: 'Property',
        FROM: 'Cash',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '700',
        TO: 'Mortgage',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'payOffDebt',
      },
      {
        NAME: 'ConditionalPayment to Jerry loan 1',
        CATEGORY: '',
        FROM: 'Cash',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '250',
        TO: 'Jerry loan',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'payOffDebt',
      },
      {
        NAME: 'ConditionalPayment to Ben loan 1',
        CATEGORY: '',
        FROM: 'Cash',
        FROM_ABSOLUTE: true,
        FROM_VALUE: '500',
        TO: 'Ben loan',
        TO_ABSOLUTE: false,
        TO_VALUE: '1.0',
        DATE: '21/02/2020',
        STOP_DATE: '',
        RECURRENCE: '1m',
        TYPE: 'payOffDebt',
      },
    ],
    version: 5,
    undoModel: undefined,
    redoModel: undefined,
  };
  return model;
}

export function getTestModel(input: string): ModelData {
  // log(`getTestModel making model for ${input}`);
  if (input === TestModel01) {
    return getTestModel01ForMigration();
  } else if (input === TestModel02) {
    return getTestModel02ForMigration();
  } else if (input === CoarseAndFine) {
    return getModelCoarseAndFineForMigration();
  } else if (input === FutureExpense) {
    return getModelFutureExpenseForMigration();
  } else if (input === ThreeChryslerModel) {
    return getThreeChryslerModelForMigration();
  } else if (input === MinimalModel) {
    return getMinimalModelCopy();
  } else if (input === BenAndJerryModel) {
    return getBenAndJerryModel();
  }
  throw new Error('test model name not recognised');
}
