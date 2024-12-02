import { allViews } from "../utils/allViews";
import {
  CASH_ASSET_NAME,
  allItems,
  assetChartFocus,
  chartVals,
  chartViewType,
  birthDate,
  birthDateHint,
  coarseDetail,
  cpi,
  cpiHint,
  debtChartFocus,
  expenseChartFocus,
  fineDetail,
  incomeChartFocus,
  monthly,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  valueFocusDate,
  valueFocusDateHint,
  viewDetail,
  viewFrequency,
  viewType,
  custom,
} from "../localization/stringConstants";
import {
  Asset,
  Expense,
  Income,
  ModelData,
  Setting,
  Transaction,
} from "../types/interfaces";
import { log, showObj } from "../utils/utils";
import { viewSetting, simpleSetting } from "./exampleSettings";
import { setSetting, setROI } from "./modelUtils";
import { getMinimalModelCopy } from "./minimalModel";
import { makeModelFromJSON } from "./modelFromJSON";

log;
showObj;

export const simpleExampleData = `{
"name": "Simple",
"triggers":[
{"NAME":"GetRidOfCar","DATE":"31 Dec 2025"},
{"NAME":"StopMainWork","DATE":"31 Dec 2050"},
{"NAME":"TransferMortgage","DATE":"1 Jan 2028"}],
"expenses":[
{"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"0","RECURRENCE":"1m"},
{"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"0","RECURRENCE":"1m"},
{"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"0","RECURRENCE":"1m"}],
"incomes":[
{"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":"Joe(incomeTax)"},
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

export const billAndBenExampleData = `{
"name": "Bill and Ben",
"triggers":[
{"NAME":"BenDies","DATE":"12 Dec 2064"},
{"NAME":"BenRetires","DATE":"27 July 2037"},
{"NAME":"BenStatePensionAge","DATE":"30 Aug 2040"},
{"NAME":"BillDies","DATE":"19 Jul 2071"},
{"NAME":"BillRetires","DATE":"4 May 2040"},
{"NAME":"BillStatePensionAge","DATE":"4 May 2047"},
{"NAME":"CareCostsStart","DATE":"12 Dec 2055"},
{"NAME":"DownsizeHouse","DATE":"28 Feb 2047"},
{"NAME":"start","DATE":"1 Jan 2021"}],
"expenses":[
{"NAME":"BasicExpensesDownsize","VALUE":"1600","VALUE_SET":"25/11/2019","START":"DownsizeHouse","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Basic","RECURRENCE":"1m"},
{"NAME":"BasicExpensesWorking","VALUE":"1850","VALUE_SET":"25/11/2019","START":"25/11/2019","END":"DownsizeHouse","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":"Basic","RECURRENCE":"1m"},
{"NAME":"CareCosts","CATEGORY":"Care","START":"CareCostsStart","END":"BillDies","VALUE":"3500","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"},
{"NAME":"LeisureExpensesRetired","CATEGORY":"Leisure","START":"BillRetires","END":"BillDies","VALUE":"1500","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"},
{"NAME":"LeisureExpensesWorking","VALUE":"1000","VALUE_SET":"25/11/2019","START":"25/11/2019","END":"CareCostsStart","GROWTH":"0","CPI_IMMUNE":false,"CATEGORY":"Leisure","RECURRENCE":"1m"}],
"incomes":[
{"NAME":"BenSalary","CATEGORY":"Salary","START":"25/11/2019","END":"BenRetires","VALUE":"4000","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)/Ben(NI)"},
{"NAME":"BenStatePension","VALUE":"730","VALUE_SET":"25/11/2019","START":"BenStatePensionAge","END":"BenDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Ben(incomeTax)","CATEGORY":"Pension"},
{"NAME":"BillDBPension","VALUE":"2000","VALUE_SET":"25/11/2019","START":"BillStatePensionAge","END":"BillDies","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)","CATEGORY":"Pension"},
{"NAME":"BillSalary","CATEGORY":"Salary","START":"25/11/2019","END":"BillRetires","VALUE":"3000","VALUE_SET":"25/11/2019","GROWTH":"0","CPI_IMMUNE":false,"LIABILITY":"Bill(incomeTax)/Bill(NI)"},
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
{"NAME":"Cash","START":"1 Jan 2017","VALUE":"0","GROWTH":"0.0","CPI_IMMUNE":false,"LIABILITY":"","PURCHASE_PRICE":"0","CATEGORY":"","IS_A_DEBT":false,"QUANTITY":""},
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

export const mortgageSwitchExampleData = `{
"name": "Mortgage switch",
"triggers":[
  {"NAME":"GetRidOfCar","DATE":"31 Dec 2025"},
  {"NAME":"StopMainWork","DATE":"31 Dec 2050"},
  {"NAME":"TransferMortgage","DATE":"1 Jan 2028"}],
"expenses":[
{"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"0","RECURRENCE":"1m"},
{"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"0","RECURRENCE":"1m"},
{"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"0","RECURRENCE":"1m"}],
"incomes":[
{"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":"Joe(incomeTax)"},
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

export const definedBenefitsPension = `{
"name":"Defined Benefits Pension",
"assets":[
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2019","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
"incomes":[
{"NAME":"TeachingJob","VALUE":"2500","VALUE_SET":"JobStart","START":"JobStart","END":"JobStop","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
{"START":"PensionBegins","END":"PensionStops","NAME":"PensionTransferTeachersPensionScheme","VALUE":"0.0","VALUE_SET":"PensionExists","LIABILITY":"Jack(incomeTax)","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":""},
{"START":"PensionBegins","END":"PensionTransfers","NAME":"PensionDBTeachersPensionScheme","VALUE":"0","VALUE_SET":"PensionExists","LIABILITY":"Joe(incomeTax)","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":""}],
"expenses":[
],"triggers":[
{"NAME":"PensionTransfers","DATE":"1 Jan 2035"},
{"NAME":"PensionStops","DATE":"1 Jan 2040"},
{"NAME":"PensionExists","DATE":"1 Jan 2022"},
{"NAME":"PensionBegins","DATE":"1 Jan 2030"},
{"NAME":"JobStop","DATE":"1 Jan 2028"},
{"NAME":"JobStart","DATE":"1 Jan 2020"}],
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

export const definedContributionsPension = `{
"name":"Defined Contributions Pension",
"expenses":[
],"incomes":[
{"NAME":"javaJob1","CATEGORY":"programming","START":"01 Jan 2021","END":"01 Jan 2028","VALUE":"2500","VALUE_SET":"01 Jan 2020","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)"}],
"assets":[
{"NAME":"PensionAegon","VALUE":"0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"CrystallizedPensionJoe","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"CrystallizedPensionJack","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""},
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2017","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"},
{"NAME":"AegonTaxFree","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"2.0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"pension","PURCHASE_PRICE":"0.0","LIABILITY":""}],
"transactions":[
{"NAME":"TransferCrystallizedPensionAegon","FROM":"CrystallizedPensionJoe","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJack","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2035","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},
{"NAME":"PensionAegon","FROM":"javaJob1","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"PensionAegon","TO_ABSOLUTE":false,"TO_VALUE":"11","DATE":"01 Jan 2021","STOP_DATE":"01 Jan 2025","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},
{"NAME":"MoveTaxFreePartAegon","FROM":"PensionAegon","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"AegonTaxFree","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2030","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"},
{"NAME":"CrystallizedPensionAegon","FROM":"PensionAegon","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"CrystallizedPensionJoe","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2030","STOP_DATE":"","RECURRENCE":"","CATEGORY":"pension","TYPE":"auto"}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"const"},
{"NAME":"End of view range","VALUE":"1 Feb 2045","HINT":"","TYPE":"const"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"2019","HINT":"","TYPE":"const"}],
"triggers":[
],"version":4}`;

export const nationalSavings = `{
"name": "National Savings Income Bonds",
"assets":[
{"NAME":"NI","VALUE":"1000000","QUANTITY":"","START":"startDate","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""},
{"NAME":"Cash","VALUE":"0","QUANTITY":"","START":"startDate","LIABILITY":"","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"PURCHASE_PRICE":"0","CATEGORY":""}],
"incomes":[
{"NAME":"NIinterest","CATEGORY":"","START":"startDate","END":"stopDate","VALUE":"0.001241NI","VALUE_SET":"startDate","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)"}],
"expenses":[
{"NAME":"LivingCosts","CATEGORY":"","START":"startDate","END":"stopDate","VALUE":"900","VALUE_SET":"startDate","GROWTH":"0","CPI_IMMUNE":false,"RECURRENCE":"1m"}],
"triggers":[
{"NAME":"stopDate","DATE":"1 Jan 2040"},
{"NAME":"startDate","DATE":"1 Jan 2020"}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2030","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
"transactions":[
],"version":4}`;

export const pensionExampleData = `
{
  "name":"Pension",
  "assets":[
  {"NAME":"Cash","CATEGORY":"","START":"1 Jan 2017","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"},
  {"NAME":"-PEN javaDCP","VALUE":"0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-PEN cppDCP","VALUE":"0","QUANTITY":"","START":"01 Jan 2022","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-CPTaxFree javaDCP","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-CPTaxFree cppDCP","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2022","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-CPTaxable Joe.javaDCP","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-CPTaxable Joe.cppDCP","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2022","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-CPTaxable Jen.cppDCP","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2022","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""},
  {"NAME":"-CPTaxable Jane.javaDCP","VALUE":"0.0","QUANTITY":"","START":"01 Jan 2021","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0.0","LIABILITY":""}],
  "incomes":[
  {"NAME":"JoeBasic","VALUE":"1050","VALUE_SET":"01 Jan 2020","START":"01 Jan 2020","END":"01 Jan 2030","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
  {"NAME":"JenBasic","VALUE":"1050","VALUE_SET":"01 Jan 2020","START":"01 Jan 2020","END":"01 Jan 2030","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Jen(incomeTax)/Jen(NI)","CATEGORY":""},
  {"NAME":"JeffBasic","VALUE":"1050","VALUE_SET":"01 Jan 2020","START":"01 Jan 2020","END":"01 Jan 2030","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Jeff(incomeTax)/Jeff(NI)","CATEGORY":""},
  {"NAME":"java","VALUE":"3000","VALUE_SET":"01 Jan 2020","START":"01 Jan 2021","END":"01 Jan 2022","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
  {"NAME":"JaneBasic","VALUE":"1050","VALUE_SET":"01 Jan 2020","START":"01 Jan 2020","END":"01 Jan 2030","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Jane(incomeTax)/Jane(NI)","CATEGORY":""},
  {"NAME":"JakeBasic","VALUE":"1050","VALUE_SET":"01 Jan 2020","START":"01 Jan 2020","END":"01 Jan 2030","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Jake(incomeTax)/Jake(NI)","CATEGORY":""},
  {"NAME":"cpp","VALUE":"4000","VALUE_SET":"01 Jan 2020","START":"01 Jan 2022","END":"01 Jan 2023","GROWTH":"0","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
  {"START":"01 Jan 2026","END":"01 Jan 2028","NAME":"-PT javaPensh","VALUE":"0.0","VALUE_SET":"01 Jan 2021","LIABILITY":"Jeff(incomeTax)","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":""},
  {"START":"01 Jan 2026","END":"01 Jan 2028","NAME":"-PT cppPensh","VALUE":"0.0","VALUE_SET":"01 Jan 2022","LIABILITY":"Jake(incomeTax)","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":""},
  {"START":"01 Jan 2026","END":"01 Jan 2027","NAME":"-PDB javaPensh","VALUE":"0","VALUE_SET":"01 Jan 2021","LIABILITY":"Joe(incomeTax)","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":""},
  {"START":"01 Jan 2026","END":"01 Jan 2027","NAME":"-PDB cppPensh","VALUE":"0","VALUE_SET":"01 Jan 2022","LIABILITY":"Joe(incomeTax)","GROWTH":"0","CPI_IMMUNE":true,"CATEGORY":""}],
  "expenses":[],
  "triggers":[],
  "settings":[
  {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
  {"NAME":"End of view range","VALUE":"1 Jan 2030","HINT":"Date at the end of range to be plotted","TYPE":"view"},
  {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
  {"NAME":"cpi","VALUE":"0","HINT":"Annual rate of inflation","TYPE":"const"},
  {"NAME":"Beginning of view range","VALUE":"30 Dec 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
  "transactions":[
  {"NAME":"-PT javaPensh","FROM":"-PDB javaPensh","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-PT javaPensh","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"01 Jan 2027","STOP_DATE":"01 Jan 2028","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PT cppPensh","FROM":"-PDB cppPensh","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-PT cppPensh","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"01 Jan 2027","STOP_DATE":"01 Jan 2028","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PEN javaPensh","FROM":"java","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"01 Jan 2021","STOP_DATE":"01 Jan 2022","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PEN javaDCP","FROM":"java","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"-PEN javaDCP","TO_ABSOLUTE":false,"TO_VALUE":"2","DATE":"01 Jan 2021","STOP_DATE":"01 Jan 2022","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PEN cppPensh","FROM":"cpp","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"01 Jan 2022","STOP_DATE":"01 Jan 2023","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PEN cppDCP","FROM":"cpp","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"-PEN cppDCP","TO_ABSOLUTE":false,"TO_VALUE":"2","DATE":"01 Jan 2022","STOP_DATE":"01 Jan 2025","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PDB javaPensh","FROM":"java","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"-PDB javaPensh","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2021","STOP_DATE":"01 Jan 2022","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PDB cppPensh","FROM":"cpp","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"-PDB cppPensh","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2022","STOP_DATE":"01 Jan 2023","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-CPTaxFreeM javaDCP","FROM":"-PEN javaDCP","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"-CPTaxFree javaDCP","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2023","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-CPTaxFreeM cppDCP","FROM":"-PEN cppDCP","FROM_ABSOLUTE":false,"FROM_VALUE":"0.25","TO":"-CPTaxFree cppDCP","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2024","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-CPTaxable javaDCP","FROM":"-PEN javaDCP","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-CPTaxable Joe.javaDCP","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2023","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-CPTaxable cppDCP","FROM":"-PEN cppDCP","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-CPTaxable Joe.cppDCP","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2024","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-CPT javaDCP","FROM":"-CPTaxable Joe.javaDCP","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-CPTaxable Jane.javaDCP","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2024","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-CPT cppDCP","FROM":"-CPTaxable Joe.cppDCP","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-CPTaxable Jen.cppDCP","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"01 Jan 2025","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"auto"}],
  "version":8}
`;

export const monitorExampleData = `{
"name":"monitorTest",
"assets":[
  {"NAME":"PremiumBondsLeisure","ERA":0,"VALUE":"0","QUANTITY":"","START":"01 Jun 2022","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0","LIABILITY":""},
  {"NAME":"PremiumBondsBasic","ERA":0,"VALUE":"0","QUANTITY":"","START":"01 Jun 2022","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0","LIABILITY":""},
  {"NAME":"Cash","CATEGORY":"","START":"01 Jan 2017","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0","ERA":0}],
"incomes":[
  {"NAME":"Inc","ERA":0,"VALUE":"10","VALUE_SET":"1 July 2023","START":"01 Jul 2023","END":"01 Jul 2025","CPI_IMMUNE":true,"LIABILITY":"Frank(incomeTax)/Frank(NI)","RECURRENCE":"1m","CATEGORY":""}],
"expenses":[
  {"NAME":"Holiday","ERA":0,"VALUE":"5","VALUE_SET":"1 August 2023","START":"1 August 2023","END":"1 August 2025","CPI_IMMUNE":true,"CATEGORY":"Leisure","RECURRENCE":"1m"},
  {"NAME":"Food","CATEGORY":"Basic","START":"1 Aug 2023","END":"1 Aug 2025","VALUE":"10","VALUE_SET":"1 Aug 2023","CPI_IMMUNE":true,"RECURRENCE":"1m","ERA":0}],"triggers":[],
"monitors":[
  {"NAME":"Food","ERA":0,"VALUES":[
    {"MONTH":"Mar 2024","EXPRESSION":"3"},
    {"MONTH":"Feb 2024","EXPRESSION":"3"},
    {"MONTH":"Jan 2024","EXPRESSION":"3"},
    {"MONTH":"Dec 2023","EXPRESSION":"3"},
    {"MONTH":"Nov 2023","EXPRESSION":"3"},
    {"MONTH":"item","EXPRESSION":
      {"NAME":"Food","CATEGORY":"Basic","START":"1 Aug 2023","END":"1 Aug 2025","VALUE":"10","VALUE_SET":"1 Aug 2023","CPI_IMMUNE":true,"RECURRENCE":"1m","ERA":0}
    },
    {"MONTH":"sum","EXPRESSION":27},
    {"MONTH":"RECURRENT_SPEND","EXPRESSION":"2.25"}
    ]
  },
  {"NAME":"Holiday","ERA":0,"VALUES":[
    {"MONTH":"Mar 2024","EXPRESSION":"4"},
    {"MONTH":"Feb 2024","EXPRESSION":"4"},
    {"MONTH":"Jan 2024","EXPRESSION":"4"},
    {"MONTH":"Dec 2023","EXPRESSION":"4"},
    {"MONTH":"Nov 2023","EXPRESSION":"4"},
    {"MONTH":"item","EXPRESSION":
      {"NAME":"Holiday","ERA":0,"VALUE":"5","VALUE_SET":"1 August 2023","START":"1 August 2023","END":"1 August 2025","CPI_IMMUNE":true,"CATEGORY":"Leisure","RECURRENCE":"1m"}
    },
    {"MONTH":"sum","EXPRESSION":36},
    {"MONTH":"RECURRENT_SPEND","EXPRESSION":"3"}
    ]
  }
],
"generators":[
  {"NAME":"early","ERA":0,"TYPE":"Bonds","DETAILS":{"VALUE":"5","GROWTH":"0","CATEGORY":"Bonds","START":"1 June 2022","DURATION":"1y","SOURCE":"Cash","TARGET":"Cash","YEAR":"2023","RECURRENCE":"","RECURRENCE_STOP":""}},
  {"NAME":"late","ERA":0,"TYPE":"Bonds","DETAILS":{"VALUE":"4","GROWTH":"0","CATEGORY":"Bonds","START":"1 Jun 2023","DURATION":"1y","SOURCE":"Cash","TARGET":"Cash","YEAR":"2025","RECURRENCE":"","RECURRENCE_STOP":""}},
  {"TYPE":"Bonds","NAME":"early 2","ERA":0,"DETAILS":{"VALUE":"100","GROWTH":"0","CATEGORY":"Bonds","START":"1 June 2022","DURATION":"1y","SOURCE":"Cash","TARGET":"Cash","YEAR":"2024","RECURRENCE":"","RECURRENCE_STOP":""}},
  {"TYPE":"Bonds","NAME":"right","ERA":0,"DETAILS":{"VALUE":"200","GROWTH":"0","CATEGORY":"Bonds","START":"1 June 2023","DURATION":"1y","SOURCE":"Cash","TARGET":"Cash","YEAR":"2024","RECURRENCE":"","RECURRENCE_STOP":""}}
],
"settings":[
  {"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view","ERA":0},
  {"NAME":"End of view range","ERA":0,"VALUE":"01 Jan 2027","HINT":"Date at the end of range to be plotted","TYPE":"view"},
  {"NAME":"End of monitor range","ERA":0,"VALUE":"Apr 2024","HINT":"","TYPE":"adjustable"},
  {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view","ERA":0},
  {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const","ERA":0},
  {"NAME":"Beginning of view range","ERA":0,"VALUE":"31 Dec 2022","HINT":"Date at the start of range to be plotted","TYPE":"view"},
  {"NAME":"Beginning of monitor range","ERA":0,"VALUE":"Apr 2023","HINT":"","TYPE":"adjustable"}
],
"transactions":[
  {"NAME":"PBLWinnings 3","ERA":0,"CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"","TO":"PremiumBondsLeisure","TO_ABSOLUTE":true,"TO_VALUE":"9","DATE":"1 July 2025","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
  {"NAME":"PBLWinnings 2","ERA":0,"CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"","TO":"PremiumBondsLeisure","TO_ABSOLUTE":true,"TO_VALUE":"160","DATE":"1 July 2024","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
  {"NAME":"PBLWinnings 1","ERA":0,"CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"","TO":"PremiumBondsLeisure","TO_ABSOLUTE":true,"TO_VALUE":"8","DATE":"1 July 2023","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
  {"NAME":"PBBWinnings 3","ERA":0,"CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"","TO":"PremiumBondsBasic","TO_ABSOLUTE":true,"TO_VALUE":"7","DATE":"1 July 2025","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
  {"NAME":"PBBWinnings 2","ERA":0,"CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"","TO":"PremiumBondsBasic","TO_ABSOLUTE":true,"TO_VALUE":"150","DATE":"1 July 2024","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
  {"NAME":"PBBWinnings 1","ERA":0,"CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"","TO":"PremiumBondsBasic","TO_ABSOLUTE":true,"TO_VALUE":"6","DATE":"1 July 2023","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"}
]
,"version":13}
`;

const variableDateExampleData = `{
  "name":"test",
  "assets":[
{"NAME":"Estate","VALUE":"0","QUANTITY":"","START":"2019","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0","LIABILITY":""},
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2019","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
  "incomes":[],
  "expenses":[],
  "triggers":[],
  "settings":[
{"NAME":"variableLow","VALUE":"1","HINT":"","TYPE":"adjustable"},
{"NAME":"variableHigh","VALUE":"5","HINT":"","TYPE":"adjustable"},
{"NAME":"variableCount","VALUE":"5","HINT":"","TYPE":"adjustable"},
{"NAME":"variable","VALUE":"4","HINT":"","TYPE":"adjustable"},
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2020","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
  "transactions":[
{"DATE":"1 Nov 2019","FROM":"Cash","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"makeEstate","TO":"Estate","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"custom","CATEGORY":""},
{"DATE":"1 Jan 2019+variable1m","FROM":"","FROM_VALUE":"0.0","FROM_ABSOLUTE":true,"NAME":"getCash","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"100","STOP_DATE":"","RECURRENCE":"1m","TYPE":"custom","CATEGORY":""}],
"version":9
}`;

const variableDateExampleData2 = `{
  "name":"test",
  "assets":[
{"NAME":"Estate","VALUE":"0","QUANTITY":"","START":"2019","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"IS_A_DEBT":false,"CATEGORY":"","PURCHASE_PRICE":"0","LIABILITY":""},
{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2019","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
  "incomes":[],
  "expenses":[],
  "triggers":[
{"NAME":"getCashDate","DATE":"1 Jan 2019+variable1m"}],
  "settings":[
{"NAME":"variableLow","VALUE":"1","HINT":"","TYPE":"adjustable"},
{"NAME":"variableHigh","VALUE":"5","HINT":"","TYPE":"adjustable"},
{"NAME":"variableCount","VALUE":"5","HINT":"","TYPE":"adjustable"},
{"NAME":"variable","VALUE":"4","HINT":"","TYPE":"adjustable"},
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"End of view range","VALUE":"1 Jan 2020","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
  "transactions":[
{"DATE":"1 Nov 2019","FROM":"Cash","FROM_VALUE":"1","FROM_ABSOLUTE":false,"NAME":"makeEstate","TO":"Estate","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"","TYPE":"custom","CATEGORY":""},
{"DATE":"getCashDate","FROM":"","FROM_VALUE":"0.0","FROM_ABSOLUTE":true,"NAME":"getCash","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"100","STOP_DATE":"","RECURRENCE":"1m","TYPE":"custom","CATEGORY":""}],
"version":9
}`;

export const simpleExpense: Expense = {
  NAME: "NoName",
  ERA: undefined,
  CATEGORY: "",
  START: "1 Jan 2017",
  END: "1 Jan 2017",
  VALUE: "0.0",
  VALUE_SET: "1 Jan 2017",
  CPI_IMMUNE: false,
  RECURRENCE: "1m",
};
export const simpleIncome: Income = {
  NAME: "NoName",
  ERA: undefined,
  CATEGORY: "",
  START: "1 Jan 2017",
  END: "1 Jan 2017",
  VALUE: "0",
  VALUE_SET: "1 Jan 2017",
  CPI_IMMUNE: false,
  RECURRENCE: "1m",
  LIABILITY: "",
};
export const simpleTransaction: Transaction = {
  NAME: "NoName",
  ERA: undefined,
  FROM: "",
  FROM_ABSOLUTE: true,
  FROM_VALUE: "0.0",
  TO: "",
  TO_ABSOLUTE: true,
  TO_VALUE: "0.0",
  DATE: "1 Jan 2017",
  STOP_DATE: "", // for regular transactions
  RECURRENCE: "",
  CATEGORY: "",
  TYPE: custom,
};

export const emptyModel: ModelData = {
  name: "emptyModel",
  triggers: [],
  incomes: [],
  expenses: [],
  transactions: [],
  assets: [],
  settings: [],
  monitors: [],
  generators: [],
  version: 0,
  undoModel: undefined,
  redoModel: undefined,
};

const defaultModelSettingsForMigration: Setting[] = [
  { ...viewSetting, NAME: viewDetail, VALUE: fineDetail },
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
    VALUE: "Y",
  },
  {
    ...simpleSetting,
    NAME: cpi,
    VALUE: "0.0",
    HINT: cpiHint,
  },
  {
    ...viewSetting,
    NAME: birthDate,
    VALUE: "",
    HINT: birthDateHint,
  },
  {
    ...viewSetting,
    NAME: valueFocusDate,
    VALUE: "",
    HINT: valueFocusDateHint,
  },
];

export const simpleAsset: Asset = {
  NAME: "NoName",
  ERA: undefined,
  CATEGORY: "",
  START: "1 Jan 2017",
  VALUE: "0",
  QUANTITY: "",
  GROWTH: "0",
  CPI_IMMUNE: false,
  CAN_BE_NEGATIVE: false,
  IS_A_DEBT: false,
  LIABILITY: "",
  PURCHASE_PRICE: "0",
};

export function getModelCoarseAndFineForMigration(): ModelData {
  const roi = {
    start: "April 1, 2018",
    end: "July 10, 2018",
  };

  const settings = defaultModelSettingsForMigration;

  allViews.map((v) => {
    setSetting(settings, `${viewFrequency}${v.lc}`, monthly, viewType);
  });

  allViews.map((v) => {
    setSetting(settings, `${viewDetail}${v.lc}`, coarseDetail, viewType);
  });

  const model: ModelData = {
    ...emptyModel,
    incomes: [
      {
        ...simpleIncome,
        START: "April 1 2018",
        END: "April 2 2018",
        NAME: "PRn1",
        VALUE: "10",
        VALUE_SET: "January 1 2018",
        CATEGORY: "PaperRound",
      },
      {
        ...simpleIncome,
        START: "April 1 2018",
        END: "June 2 2018",
        NAME: "PRn2",
        VALUE: "10", // single payment
        VALUE_SET: "January 1 2018",
        CATEGORY: "PaperRound",
      },
      {
        ...simpleIncome,
        START: "April 1 2018",
        END: "April 2 2018",
        NAME: "PRn3",
        VALUE: "10", // single payment
        VALUE_SET: "January 1 2018",
      },
    ],
    assets: [
      {
        ...simpleAsset,
        NAME: CASH_ASSET_NAME,
        CAN_BE_NEGATIVE: true,
        START: "April 1 2018",
        VALUE: "500",
        CATEGORY: "Accessible",
      },
      {
        ...simpleAsset,
        NAME: "stocks",
        START: "April 1 2018",
        VALUE: "500",
      },
      {
        ...simpleAsset,
        NAME: "savings",
        START: "June 1 2018",
        VALUE: "500",
        CATEGORY: "Accessible",
      },
    ],
    settings: settings,
    expenses: [
      {
        ...simpleExpense,
        START: "April 1 2018",
        END: "June 2 2018",
        NAME: "Phon",
        VALUE_SET: "January 1 2018",
        VALUE: "12.0",
        CATEGORY: "comms",
      },
      {
        ...simpleExpense,
        START: "February 1 2018",
        END: "June 2 2018",
        NAME: "broadband",
        VALUE_SET: "January 1 2018",
        VALUE: "12.0",
        CATEGORY: "comms",
      },
      {
        ...simpleExpense,
        START: "January 1 2018",
        END: "July 2 2018",
        NAME: "pet food",
        VALUE_SET: "January 1 2018",
        VALUE: "12.0",
      },
    ],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };

  setROI(model, roi);

  return model;
}

export function getThreeChryslerModel(): ModelData {
  const roi = {
    start: "Dec 1, 2017 00:00:00",
    end: "June 1, 2018 00:00:00",
  };
  const minimalModel = getMinimalModelCopy();
  const model: ModelData = {
    ...minimalModel,
    assets: [
      ...minimalModel.assets,
      {
        ...simpleAsset,
        NAME: "Cars",
        START: "January 2 2018",
        VALUE: "chrysler",
        QUANTITY: "3",
        CPI_IMMUNE: true,
      },
    ],
    settings: [
      ...minimalModel.settings,
      {
        NAME: "twoChryslers",
        ERA: undefined,
        VALUE: "2chrysler",
        HINT: "",
        TYPE: "const",
      },
      {
        NAME: "chrysler",
        ERA: undefined,
        VALUE: "50USD",
        HINT: "",
        TYPE: "const",
      },
      {
        NAME: "USD",
        ERA: undefined,
        VALUE: "2",
        HINT: "",
        TYPE: "adjustable",
      },
    ],
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  model.assets.filter((a) => {
    return a.NAME === CASH_ASSET_NAME;
  })[0].START = "1 Jan 2018";

  setROI(model, roi);
  model.name = "ThreeChryslerModel";
  return model;
}

export function getThreeChryslerModelForMigration(): ModelData {
  const roi = {
    start: "Dec 1, 2017 00:00:00",
    end: "June 1, 2018 00:00:00",
  };
  const minimalModel = getMinimalModelCopy();
  const model: ModelData = {
    ...minimalModel,
    assets: [
      ...minimalModel.assets,
      {
        ...simpleAsset,
        NAME: "Cars",
        START: "January 2 2018",
        VALUE: "chrysler",
        QUANTITY: "3",
        CPI_IMMUNE: true,
      },
    ],
    settings: [
      ...minimalModel.settings,
      {
        NAME: "twoChryslers",
        ERA: undefined,
        VALUE: "2chrysler",
        HINT: "",
        TYPE: "const",
      },
      {
        NAME: "chrysler",
        ERA: undefined,
        VALUE: "50USD",
        HINT: "",
        TYPE: "const",
      },
      {
        NAME: "USD",
        ERA: undefined,
        VALUE: "2",
        HINT: "",
        TYPE: "adjustable",
      },
      {
        ...viewSetting,
        NAME: viewFrequency,
        VALUE: monthly,
      },
    ].concat(
      allViews.map((v) => {
        return {
          ...viewSetting,
          NAME: `${viewFrequency}${v.lc}`,
          VALUE: monthly,
        };
      }),
    ),
    version: 0,
    undoModel: undefined,
    redoModel: undefined,
  };
  model.assets.filter((a) => {
    return a.NAME === CASH_ASSET_NAME;
  })[0].START = "1 Jan 2018";

  setROI(model, roi);
  model.name = "ThreeChryslerModelForMigration";
  return model;
}

export function getDefinedBenefitsPension(): ModelData {
  return makeModelFromJSON(definedBenefitsPension, "definedBenefitsPension");
}

export function getDefinedContributionsPension(): ModelData {
  return makeModelFromJSON(
    definedContributionsPension,
    "definedContributionsPension",
  );
}

export function getPensionExampleData(): ModelData {
  return makeModelFromJSON(pensionExampleData, "pensionExampleData");
}

export function getMonitorExampleData(): ModelData {
  return makeModelFromJSON(monitorExampleData, "pensionExampleData");
}
export function getVariableDateExampleData(): ModelData {
  return makeModelFromJSON(variableDateExampleData, "variableDateExample");
}

export function getVariableDateExampleData2(): ModelData {
  return makeModelFromJSON(variableDateExampleData2, "variableDateExample2");
}

export function transactionFromUndefinedModel(): ModelData {
  return makeModelFromJSON(
    `{"name":"x",
"triggers":[
{"NAME":"TransferMortgage","DATE":"Sat Jan 01 2028"},
{"NAME":"StopMainWork","DATE":"Sat Dec 31 2050"},
{"NAME":"GetRidOfCar","DATE":"Wed Dec 31 2025"}],
"expenses":[],
"incomes":[],
"assets":[
{"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],
"transactions":[
{"NAME":"t1","CATEGORY":"","FROM":"","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"100","DATE":"Sat Nov 05 2022","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
{"NAME":"t2","CATEGORY":"","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"1.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"100","DATE":"Sat Nov 05 2022","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
{"DATE":"1 March 2022","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueCouncil Tax Paying Month 2","TO":"Council Tax Paying Month","TO_ABSOLUTE":true,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},
{"DATE":"1 Jan 2022","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueCouncil Tax Paying Month 1","TO":"Council Tax Paying Month","TO_ABSOLUTE":true,"TO_VALUE":"0","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},
{"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},
{"DATE":"15 October 2022","FROM":"Cash","FROM_VALUE":"Council Tax Amount","FROM_ABSOLUTE":true,"NAME":"Council Tax","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"custom","CATEGORY":""}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
{"NAME":"End of view range","VALUE":"1 Jan 2026","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Council Tax Paying Month","VALUE":"1","HINT":"","TYPE":"adjustable"},
{"NAME":"Council Tax Amount","VALUE":"55Council Tax Paying Month","HINT":"","TYPE":"adjustable"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
"version":10
}`,
  );
}

export function transactionToUndefinedModel(): ModelData {
  return makeModelFromJSON(
    `{"name":"x",
"triggers":[
{"NAME":"TransferMortgage","DATE":"Sat Jan 01 2028"},
{"NAME":"StopMainWork","DATE":"Sat Dec 31 2050"},
{"NAME":"GetRidOfCar","DATE":"Wed Dec 31 2025"}],
"expenses":[],
"incomes":[],
"assets":[
{"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
{"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],
"transactions":[
{"NAME":"t1","CATEGORY":"","FROM":"ISAs","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"Sat Nov 05 2022","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
{"NAME":"t2","CATEGORY":"","FROM":"ISAs","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"","TO_ABSOLUTE":true,"TO_VALUE":"1.0","DATE":"Sat Nov 05 2022","STOP_DATE":"","RECURRENCE":"","TYPE":"custom"},
{"DATE":"1 March 2022","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueCouncil Tax Paying Month 2","TO":"Council Tax Paying Month","TO_ABSOLUTE":true,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},
{"DATE":"1 Jan 2022","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":false,"NAME":"RevalueCouncil Tax Paying Month 1","TO":"Council Tax Paying Month","TO_ABSOLUTE":true,"TO_VALUE":"0","STOP_DATE":"","RECURRENCE":"1y","TYPE":"revalueSetting","CATEGORY":""},
{"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},
{"DATE":"15 October 2022","FROM":"Cash","FROM_VALUE":"Council Tax Amount","FROM_ABSOLUTE":true,"NAME":"Council Tax","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"custom","CATEGORY":""}],
"settings":[
{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
{"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
{"NAME":"End of view range","VALUE":"1 Jan 2026","HINT":"Date at the end of range to be plotted","TYPE":"view"},
{"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
{"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
{"NAME":"Council Tax Paying Month","VALUE":"1","HINT":"","TYPE":"adjustable"},
{"NAME":"Council Tax Amount","VALUE":"55Council Tax Paying Month","HINT":"","TYPE":"adjustable"},
{"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
"version":10
}`,
  );
}
