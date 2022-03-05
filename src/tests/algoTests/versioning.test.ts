import {
  CASH_ASSET_NAME,
  custom,
  viewType,
  taxPot,
  viewFrequency,
} from '../../localization/stringConstants';
import { checkData } from '../../models/checks';
import {
  makeModelFromJSON,
  makeModelFromJSONString,
  getSettings,
} from '../../models/modelUtils';
import { log } from '../../utils';

const emptyModelJSON = `{
    "triggers":[],
    "expenses":[],
    "incomes":[],
    "assets":[],
    "transactions":[],
    "settings":[]
  }`;

const v1ModelJSON = `{
    "version":1, 
    "triggers":[],
    "expenses":[
    {"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2"}],
    "incomes":[
    {"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"2","LIABILITY":"Joe(incomeTax)"}],
    "assets":[
    {"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0"}],
    "transactions":[
    {"NAME":"switchMortgage","FROM":"EarlyMortgage","FROM_ABSOLUTE":false,"FROM_VALUE":"1","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"TransferMortgage","STOP_DATE":"","RECURRENCE":"","CATEGORY":""}],
    "settings":[
    {"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted"},
    {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
    {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
    {"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},
    {"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},
    {"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},
    {"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},
    {"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},
    {"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
    {"NAME":"Type of view for chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},
    {"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},
    {"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]
  }`;

const v2ModelJSON = `{
    "version":2, 
    "triggers":[
    {"NAME":"GetRidOfCar","DATE":"2025-12-31"},
    {"NAME":"StopMainWork","DATE":"2050-12-31"},
    {"NAME":"TransferMortgage","DATE":"2028-01-01"}],
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
    {"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
    {"NAME":"TaxPot","START":"1 Jan 2017","VALUE":"0","GROWTH":"0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","CATEGORY":"","IS_A_DEBT":false,"QUANTITY":""}],
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
    {"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},
    {"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},
    {"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},
    {"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},
    {"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
    {"NAME":"Type of view for chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},
    {"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},
    {"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]
  }`;

const v3ModelJSON = `{
    "version":3, 
    "triggers":[
    {"NAME":"GetRidOfCar","DATE":"2025-12-31"},
    {"NAME":"StopMainWork","DATE":"2050-12-31"},
    {"NAME":"TransferMortgage","DATE":"2028-01-01"}],
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
    {"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},
    {"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},
    {"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},
    {"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},
    {"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
    {"NAME":"Type of view for chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},
    {"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},
    {"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]
  }`;

const v4ModelJSON = `{
    "version":4, 
    "triggers":[
    {"NAME":"TransferMortgage","DATE":"2028-01-01"},
    {"NAME":"StopMainWork","DATE":"2050-12-31"},
    {"NAME":"GetRidOfCar","DATE":"2025-12-31"}],
    "expenses":[
    {"NAME":"Run house","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2099","VALUE":"1300","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"},
    {"NAME":"Run car","CATEGORY":"living costs","START":"1 April 2018","END":"GetRidOfCar","VALUE":"700","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"5","RECURRENCE":"1m"},
    {"NAME":"Look after dogs","CATEGORY":"living costs","START":"1 April 2018","END":"2 February 2047","VALUE":"500","VALUE_SET":"1 April 2018","CPI_IMMUNE":false,"GROWTH":"2","RECURRENCE":"1m"}],
    "incomes":[
    {"NAME":"Side hustle income later","CATEGORY":"hustle","START":"2 April 2025","END":"2 April 2029","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""},
    {"NAME":"Side hustle income","CATEGORY":"hustle","START":"1 March 2018","END":"2 April 2025","VALUE":"1500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"0","LIABILITY":""},
    {"NAME":"Main income","CATEGORY":"","START":"1 March 2018","END":"StopMainWork","VALUE":"3500","VALUE_SET":"1 March 2018","CPI_IMMUNE":false,"GROWTH":"2","LIABILITY":"Joe(incomeTax)"}],
    "assets":[
    {"NAME":"Stocks","CATEGORY":"stock","START":"December 2017","VALUE":"4000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
    {"NAME":"LateMortgage","VALUE":"0","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"4.66","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},
    {"NAME":"ISAs","CATEGORY":"stock","START":"December 2019","VALUE":"2000","GROWTH":"stockMarketGrowth","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":false,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""},
    {"NAME":"EarlyMortgage","VALUE":"-234000","QUANTITY":"","START":"1 January 2018","LIABILITY":"","GROWTH":"2.33","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":true,"PURCHASE_PRICE":"0","CATEGORY":"mortgage"},
    {"NAME":"Cash","CATEGORY":"","START":"December 2017","VALUE":"2000","GROWTH":"0","CPI_IMMUNE":false,"CAN_BE_NEGATIVE":true,"LIABILITY":"","PURCHASE_PRICE":"0","IS_A_DEBT":false,"QUANTITY":""}],
    "transactions":[
    {"NAME":"switchMortgage","FROM":"EarlyMortgage","FROM_ABSOLUTE":false,"FROM_VALUE":"1","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","DATE":"TransferMortgage","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"},
    {"NAME":"SellCar","FROM":"","FROM_ABSOLUTE":true,"FROM_VALUE":"0.0","TO":"Cash","TO_ABSOLUTE":true,"TO_VALUE":"1000","DATE":"GetRidOfCar","STOP_DATE":"","RECURRENCE":"","CATEGORY":"","TYPE":"custom"},
    {"DATE":"January 2 2020","FROM":"","FROM_VALUE":"0","FROM_ABSOLUTE":true,"NAME":"Revalue stocks after loss in 2020 market crash","TO":"Stocks","TO_ABSOLUTE":true,"TO_VALUE":"3000","STOP_DATE":"","RECURRENCE":"","TYPE":"revalueAsset","CATEGORY":""},
    {"NAME":"Each month buy food","FROM":"Cash","FROM_ABSOLUTE":true,"FROM_VALUE":"200","TO":"","TO_ABSOLUTE":true,"TO_VALUE":"0.0","DATE":"January 2 2018","STOP_DATE":"","RECURRENCE":"1m","CATEGORY":"living costs","TYPE":"custom"},
    {"DATE":"TransferMortgage","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay late mortgage","TO":"LateMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"},
    {"DATE":"1 January 2018","FROM":"Cash","FROM_VALUE":"1500","FROM_ABSOLUTE":true,"NAME":"Conditional pay early mortgage","TO":"EarlyMortgage","TO_ABSOLUTE":false,"TO_VALUE":"1","STOP_DATE":"TransferMortgage","RECURRENCE":"1m","TYPE":"payOffDebt","CATEGORY":"pay mortgage"}],
    "settings":[
    {"NAME":"View frequency","VALUE":"Annually","HINT":"Data plotted 'monthly' or 'annually'","TYPE":"view"},
    {"NAME":"View detail","VALUE":"Detailed view","HINT":"View detail ('Categorised view' or 'Detailed view')","TYPE":"view"},
    {"NAME":"Type of view for debt chart","VALUE":"val","HINT":"Debt chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Type of view for chart","VALUE":"val","HINT":"Asset chart uses setting '+', '-', '+-' or 'val'","TYPE":"view"},
    {"NAME":"Today\'s value focus date","VALUE":"","HINT":"Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE":"view"},
    {"NAME":"Tax chart, whether to include net income/gains","VALUE":"Y","HINT":"Show net can be \'Y\', \'N\', \'y\', \'n\', \'yes\', \'no\'","TYPE":"view"},
    {"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
    {"NAME":"Focus of tax chart, type","VALUE":"All","HINT":"Tax chart can show data for \'income\', \'gain\' or \'All\'","TYPE":"view"},
    {"NAME":"Focus of tax chart, person","VALUE":"All","HINT":"Tax chart can show data pertinent to a named individual or \'All\'","TYPE":"view"},
    {"NAME":"Focus of incomes chart","VALUE":"All","HINT":"Incomes chart can display a category, a single income, or 'All'","TYPE":"view"},
    {"NAME":"Focus of expenses chart","VALUE":"All","HINT":"Expenses chart can display a category, a single expense, or 'All'","TYPE":"view"},
    {"NAME":"Focus of debts chart","VALUE":"All","HINT":"Debts chart can display a category, a single debt, or 'All'","TYPE":"view"},
    {"NAME":"Focus of assets chart","VALUE":"All","HINT":"Assets chart can display a category, a single asset, or 'All'","TYPE":"view"},
    {"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},
    {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
    {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
    {"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}]
  }`;

const v5ModelJSON = `{
    "version":5, 
    "triggers":[
    {"NAME":"GetRidOfCar","DATE":"2025-12-31"},
    {"NAME":"StopMainWork","DATE":"2050-12-31"},
    {"NAME":"TransferMortgage","DATE":"2028-01-01"}],
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
      {"NAME":"Today\'s value focus date","VALUE":"","HINT":"Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE":"view"},
      {"NAME":"stockMarketGrowth","VALUE":"6.236","HINT":"Custom setting for stock market growth","TYPE":"adjustable"},
      {"NAME":"End of view range","VALUE":"1 Jan 2042","HINT":"Date at the end of range to be plotted","TYPE":"view"},
      {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
      {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
      {"NAME":"Beginning of view range","VALUE":"1 Jan 2019","HINT":"Date at the start of range to be plotted","TYPE":"view"}]
    }`;

const v6ModelJSON = `{
    "version":6, 
    "triggers":[
    {"NAME":"GetRidOfCar","DATE":"2025-12-31"},
    {"NAME":"StopMainWork","DATE":"2050-12-31"},
    {"NAME":"TransferMortgage","DATE":"2028-01-01"}],
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
    {"NAME": "Today\'s value focus date","VALUE": "","HINT": "Date to use for \'today\'s value\' tables (defaults to \'\' meaning today)","TYPE": "view"}]
  }`;
const v7ModelJSON = `{
  "assets":
  [{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2019","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
  "incomes":
  [{"NAME":"TeachingJob","VALUE":"2500","VALUE_SET":"JobStart","START":"JobStart","END":"JobStop","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
  {"START":"PensionBegins","END":"PensionStops","NAME":"-PT TeachersPensionScheme","VALUE":"0.0","VALUE_SET":"PensionExists","LIABILITY":"Jack(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""},
  {"START":"PensionBegins","END":"PensionTransfers","NAME":"-PDB TeachersPensionScheme","VALUE":"0","VALUE_SET":"PensionExists","LIABILITY":"Joe(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""}],
  "expenses":[],
  "triggers":
  [{"NAME":"PensionTransfers","DATE":"2035-01-01"},
  {"NAME":"PensionStops","DATE":"2040-01-01"},
  {"NAME":"PensionExists","DATE":"2022-01-01"},
  {"NAME":"PensionBegins","DATE":"2030-01-01"},
  {"NAME":"JobStop","DATE":"2028-01-01"},
  {"NAME":"JobStart","DATE":"2020-01-01"}],
  "settings":
  [{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
  {"NAME":"End of view range","VALUE":"1 Jan 2045","HINT":"Date at the end of range to be plotted","TYPE":"view"},
  {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
  {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
  {"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
  "transactions":
  [{"NAME":"-PEN TeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PT TeachersPensionScheme","FROM":"-PDB TeachersPensionScheme","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-PT TeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"PensionTransfers","STOP_DATE":"PensionStops","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PDB TeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"-PDB TeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"}],
  "version":7}`;
const v8ModelJSON = `{
  "assets":
  [{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2019","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
  "incomes":
  [{"NAME":"TeachingJob","VALUE":"2500","VALUE_SET":"JobStart","START":"JobStart","END":"JobStop","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
  {"START":"PensionBegins","END":"PensionStops","NAME":"-PT TeachersPensionScheme","VALUE":"0.0","VALUE_SET":"PensionExists","LIABILITY":"Jack(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""},
  {"START":"PensionBegins","END":"PensionTransfers","NAME":"-PDB TeachersPensionScheme","VALUE":"0","VALUE_SET":"PensionExists","LIABILITY":"Joe(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""}],
  "expenses":[],
  "triggers":
  [{"NAME":"PensionTransfers","DATE":"2035-01-01"},
  {"NAME":"PensionStops","DATE":"2040-01-01"},
  {"NAME":"PensionExists","DATE":"2022-01-01"},
  {"NAME":"PensionBegins","DATE":"2030-01-01"},
  {"NAME":"JobStop","DATE":"2028-01-01"},
  {"NAME":"JobStart","DATE":"2020-01-01"}],
  "settings":
  [{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
  {"NAME":"End of view range","VALUE":"1 Jan 2045","HINT":"Date at the end of range to be plotted","TYPE":"view"},
  {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
  {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
  {"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
  "transactions":
  [{"NAME":"-PEN TeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PT TeachersPensionScheme","FROM":"-PDB TeachersPensionScheme","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-PT TeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"PensionTransfers","STOP_DATE":"PensionStops","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PDB TeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"-PDB TeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"}],
  "version":8}`;

const v9ModelJSON = `{
  "assets":
  [{"NAME":"Cash","CATEGORY":"","START":"1 Jan 2019","VALUE":"0.0","QUANTITY":"","GROWTH":"0.0","CPI_IMMUNE":true,"CAN_BE_NEGATIVE":true,"IS_A_DEBT":false,"LIABILITY":"","PURCHASE_PRICE":"0.0"}],
  "incomes":
  [{"NAME":"TeachingJob","VALUE":"2500","VALUE_SET":"JobStart","START":"JobStart","END":"JobStop","GROWTH":"2","CPI_IMMUNE":true,"LIABILITY":"Joe(incomeTax)/Joe(NI)","CATEGORY":""},
  {"START":"PensionBegins","END":"PensionStops","NAME":"-PT TeachersPensionScheme","VALUE":"0.0","VALUE_SET":"PensionExists","LIABILITY":"Jack(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""},
  {"START":"PensionBegins","END":"PensionTransfers","NAME":"-PDB TeachersPensionScheme","VALUE":"0","VALUE_SET":"PensionExists","LIABILITY":"Joe(incomeTax)","GROWTH":"2","CPI_IMMUNE":true,"CATEGORY":""}],
  "expenses":[],
  "triggers":
  [{"NAME":"PensionTransfers","DATE":"2035-01-01"},
  {"NAME":"PensionStops","DATE":"2040-01-01"},
  {"NAME":"PensionExists","DATE":"2022-01-01"},
  {"NAME":"PensionBegins","DATE":"2030-01-01"},
  {"NAME":"JobStop","DATE":"2028-01-01"},
  {"NAME":"JobStart","DATE":"2020-01-01"}],
  "settings":
  [{"NAME":"Today's value focus date","VALUE":"","HINT":"Date to use for 'today's value' tables (defaults to '' meaning today)","TYPE":"view"},
  {"NAME":"End of view range","VALUE":"1 Jan 2045","HINT":"Date at the end of range to be plotted","TYPE":"view"},
  {"NAME":"Date of birth","VALUE":"","HINT":"Date used for representing dates as ages","TYPE":"view"},
  {"NAME":"cpi","VALUE":"2.5","HINT":"Annual rate of inflation","TYPE":"const"},
  {"NAME":"Beginning of view range","VALUE":"1 Jan 2017","HINT":"Date at the start of range to be plotted","TYPE":"view"}],
  "transactions":
  [{"NAME":"-PEN TeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.05","TO":"","TO_ABSOLUTE":false,"TO_VALUE":"0.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PT TeachersPensionScheme","FROM":"-PDB TeachersPensionScheme","FROM_ABSOLUTE":false,"FROM_VALUE":"1.0","TO":"-PT TeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"0.5","DATE":"PensionTransfers","STOP_DATE":"PensionStops","RECURRENCE":"","CATEGORY":"","TYPE":"auto"},
  {"NAME":"-PDB TeachersPensionScheme","FROM":"TeachingJob","FROM_ABSOLUTE":false,"FROM_VALUE":"0.0016666666666666668","TO":"-PDB TeachersPensionScheme","TO_ABSOLUTE":false,"TO_VALUE":"1.0","DATE":"PensionExists","STOP_DATE":"JobStop","RECURRENCE":"","CATEGORY":"","TYPE":"auto"}],
  "version":9}`;

describe('loadModelsFromJSON', () => {
  it('cleanedModel', () => {
    const jsonString = emptyModelJSON;
    const model = makeModelFromJSON(jsonString);
    expect(model.assets.length).toBe(1);
  });
  it('migrateModelMustHaveCash', () => {
    const jsonString = emptyModelJSON;
    const model = makeModelFromJSON(jsonString);
    expect(model.assets.length).toBe(1);
    expect(model.assets[0].NAME).toEqual(CASH_ASSET_NAME);
  });
  it('migrateModelfromv1', () => {
    const jsonString = v1ModelJSON;
    const plainModel = makeModelFromJSONString(jsonString);
    const model = makeModelFromJSON(jsonString);

    // will include expense recurrence, asset/debt,
    // asset quantity, transaction and settings types
    expect(plainModel.expenses.length).toBe(1);
    expect(plainModel.expenses[0].RECURRENCE).toBeUndefined();
    expect(plainModel.assets.length).toBe(1);
    expect(plainModel.assets[0].IS_A_DEBT).toBeUndefined();
    expect(plainModel.assets[0].QUANTITY).toBeUndefined();
    expect(plainModel.transactions.length).toBe(1);
    expect(plainModel.transactions[0].TYPE).toBeUndefined();
    expect(plainModel.settings.length).toBe(14);
    expect(plainModel.settings[0].NAME).toEqual('Beginning of view range');
    expect(plainModel.settings[0].TYPE).toBeUndefined();

    expect(model.expenses.length).toBe(1);
    expect(model.expenses[0].RECURRENCE).toEqual('1m');
    expect(model.assets.length).toBe(1);
    expect(model.assets[0].IS_A_DEBT).toEqual(false);
    expect(model.assets[0].QUANTITY).toEqual('');
    expect(model.transactions.length).toBe(1);
    expect(model.transactions[0].TYPE).toEqual(custom);
    expect(model.settings.length).toBe(6);
    expect(model.settings[0].NAME).toEqual('Beginning of view range');
    expect(model.settings[0].TYPE).toEqual(viewType);
  });
  it('migrateModelfromv2', () => {
    const jsonString = v2ModelJSON;
    const model2 = makeModelFromJSON(jsonString);
    const index = model2.assets.find((a) => {
      return a.NAME === taxPot;
    });
    expect(index).toEqual(undefined);
  });

  it('migrateModelfromv3', () => {
    const jsonString = v3ModelJSON;
    const model = makeModelFromJSON(jsonString);
    // from v3 to v4 we added tax view settings
    // but fromv4 to v5 we lost those settings again
    expect(checkData(model).length).toEqual(0);
  });

  // from v4 to v5, we remove various view settings
  // which are no longer persistent
  it('migrateModelfromv4', () => {
    const jsonString = v4ModelJSON;
    const model = makeModelFromJSON(jsonString);
    // after loading, the view settings have been added
    expect(
      getSettings(model.settings, viewFrequency, 'missing', false),
    ).toEqual('missing');
    expect(checkData(model).length).toEqual(0);
  });
  // current version loads
  it('migrateModelfromv5', () => {
    const jsonString = v5ModelJSON;
    const model = makeModelFromJSON(jsonString);
    const checkResult = checkData(model);
    if (checkResult.length > 0) {
      log(`checkResult = ${checkResult}`);
    }
    expect(checkResult.length).toEqual(0);
  });

  it('migrateModelfromv6', () => {
    const jsonString = v6ModelJSON;
    const model = makeModelFromJSON(jsonString);
    const checkResult = checkData(model);
    if (checkResult.length > 0) {
      log(`checkResult = ${checkResult}`);
    }
    expect(checkResult.length).toEqual(0);
  });

  it('migrateModelfromv7', () => {
    const jsonString = v7ModelJSON;
    const model = makeModelFromJSON(jsonString);
    const checkResult = checkData(model);
    if (checkResult.length > 0) {
      log(`checkResult = ${checkResult}`);
    }
    expect(checkResult.length).toEqual(0);
  });

  it('migrateModelfromv8', () => {
    const jsonString = v8ModelJSON;
    const model = makeModelFromJSON(jsonString);
    const checkResult = checkData(model);
    if (checkResult.length > 0) {
      log(`checkResult = ${checkResult}`);
    }
    expect(checkResult.length).toEqual(0);
  });

  // future versions should not load - expect an error message to come out
  it('migrateModelfromv9', () => {
    const jsonString = v9ModelJSON;
    let foundError = 'error thrown in migrateModelfromv9';
    try {
      makeModelFromJSON(jsonString);
    } catch (e) {
      if ((e as Error).message) {
        foundError = (e as Error).message;
      }
    }
    expect(foundError).toBe('code not properly handling versions');
  });
});
