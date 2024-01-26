import FileSaver from "file-saver";
import moment from "moment";

const doLogToFile = false;
let doLogIncremental = true;

let logText = "";

export function log(obj: string | Map<any, any> | boolean) {
  if (doLogIncremental) {
    /* eslint-disable no-console */ // all console calls routed through here
    // tslint:disable-next-line:no-console
    console.log(obj);
    /* eslint-enable no-console */
  }
  if (doLogToFile) {
    logText = `${logText}${obj}\n`;
  }
}

/* istanbul ignore next */
export function saveLogs() {
  /* istanbul ignore next */
  const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
  /* istanbul ignore next */
  FileSaver.saveAs(blob, `logs.txt`);
}

export function printAllLogs() {
  console.log(logText);  
}
export function suppressLogs() {
  doLogIncremental = false;
}
export function unSuppressLogs() {
  doLogIncremental = true;
}

export function printDebug(): boolean {
  return false;
}

export function showObj(obj: any) {
  const result = JSON.stringify(obj, null, 4);
  return result; //.substring(0, 1000); // cropping can be useful for debugging but breaks 'data dump' tests
}

export function endOfTime() {
  return makeDateFromString("1 Jan 2100");
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
  // log(`calculated monthly growth = ${monthlyGrowth}, `
  //   +`from annualPercentage = ${annualPercentage}`);
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

export function makeDateFromString(input: string) {
  if (input === "tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  // special-case parsing for DD/MM/YYYY
  let regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (input.match(regex) !== null) {
    const dateMomentObject = moment(input, "DD/MM/YYYY");
    const dateObject = dateMomentObject.toDate();
    if (!Number.isNaN(dateObject.getTime())) {
      // log(`converted ${input} into ${dateObject)}`);
      return dateObject;
    }
  } else {
    // process '12 May 2021' format
    regex = /^\d{1,2} [a-zA-Z]* \d{2,4}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'Sat 12 May 2021' format
    regex = /^[a-zA-Z]* \d{1,2} [a-zA-Z]* \d*$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'Sat May 12 2021' format
    regex = /^[a-zA-Z]* [a-zA-Z]* \d{1,2} \d*$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'May 12 2021' , 'May 12, 2021' format
    regex = /^[a-zA-Z]* \d{1,2},{0,1} \d*$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'May 2021' format
    regex = /^[a-zA-Z]* \d{4}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process 'May 1, 2018 00:00:00'
    regex = /^[a-zA-Z]* \d{1,2}, \d{4} \d{2}:\d{2}:\d{2}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
    // process '9 September 2021 8:00'
    regex = /^\d{1,2} [a-zA-Z]* \d{4} \d{1,2}:\d{2}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }

    // process '2021' format - dangerous but common for e.g. start / end of view
    regex = /^\d{4}$/;
    if (input.match(regex) !== null) {
      return new Date(input);
    }
  }

  // log(`Invalid Date : ${input}`);
  return new Date("Invalid Date");
}

// shift forward d according to the end of name
// e.g. if it ends '2y'
export function getMaturityDate(dInput: Date, n: string) {
  const d = new Date(dInput);
  if (n.endsWith("5y")) {
    d.setFullYear(d.getFullYear() + 5);
  } else if (n.endsWith("4y")) {
    d.setFullYear(d.getFullYear() + 4);
  } else if (n.endsWith("3y")) {
    d.setFullYear(d.getFullYear() + 3);
  } else if (n.endsWith("2y")) {
    d.setFullYear(d.getFullYear() + 2);
  } else if (n.endsWith("1y")) {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    /* istanbul ignore if */
    log(
      `BUG - could not infer duration of bond from ${n} (does not end 1y etc)`,
    );
  }
  return d;
}
