import { makeDateFromString } from './stringUtils';
import FileSaver from 'file-saver';

let doLog = true;

let logText = '';

export function log(obj: string | Map<any, any> | boolean) {
  if (doLog) {
    /* eslint-disable no-console */ // all console calls routed through here
    // tslint:disable-next-line:no-console
    console.log(obj);
    logText = `${logText}${obj}\n`;
    /* eslint-enable no-console */
  }
}

/* istanbul ignore next */
export function saveLogs() {
  /* istanbul ignore next */
  const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
  /* istanbul ignore next */
  FileSaver.saveAs(blob, `logs.txt`);
}

export function suppressLogs() {
  doLog = false;
}
export function unSuppressLogs() {
  doLog = true;
}

export function printDebug(): boolean {
  return false;
}

export function showObj(obj: any) {
  return JSON.stringify(obj, null, 4);
}

export function endOfTime() {
  return makeDateFromString('2100');
}

// Something like 12 as input (for 12%pa)
// gives 0.009488... as output
// Then x * (1.009488)^12 === x * 1.12
export function getMonthlyGrowth(annualPercentage: number) {
  // log(`annual_percentage = ${annualPercentage}`);
  const annualProportion = annualPercentage / 100.0;
  const annualScale = annualProportion + 1.0;
  const logAnnualScale = Math.log(annualScale);
  const monthlyGrowth = Math.exp(logAnnualScale / 12.0) - 1.0;
  // log(`calculated monthly growth = ${monthlyGrowth}, from annualPercentage = ${annualPercentage}`);
  return monthlyGrowth;
}

export enum Context {
  Asset,
  Debt,
  Income,
  Expense,
  Transaction,
  Trigger,
  Setting,
}

export enum DateFormatType {
  View,
  Test,
  Data,
  Debug,
  Unknown,
}
