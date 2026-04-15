import FileSaver from "file-saver";
import moment from "moment";
import { valueFocusDate } from "../localization/stringConstants";
import { ModelData } from "../types/interfaces";
import { dateAsString } from "./stringUtils";

export class FinKittyDate {
  static getTaxYearDate(y: number): FinKittyDate
  {
    return new FinKittyDate(new Date(y, 3, 5))
  }
  public constructor(d: Date)
  {
    this.d = d;
  }
  public d: Date;
  private finKittyTime: number | undefined;
  private description: string | undefined;
  private debugDescription: string | undefined;
  private testDescription: string | undefined;
  private viewDescription: string | undefined;
  private dateString: string | undefined;
  public getDescription(): string
  {
    if (this.description)
    {
      return this.description;
    }
    this.description = dateAsString(DateFormatType.Test, this.d);
    return this.description;
  }
  public getDebugDescription(): string
  {
    if (this.debugDescription)
    {
      return this.debugDescription;
    }
    this.debugDescription = dateAsString(DateFormatType.Debug, this.d);
    return this.debugDescription;
  }
  public getViewDescription(): string
  {
    if (this.viewDescription)
    {
      return this.viewDescription;
    }
    this.viewDescription = dateAsString(DateFormatType.View, this.d);
    return this.viewDescription;
  }
  public getTestDescription(): string
  {
    if (this.testDescription)
    {
      return this.testDescription;
    }
    this.testDescription = dateAsString(DateFormatType.Test, this.d);
    return this.testDescription;
  }
  public getDateString(): string
  {
    if (this.dateString)
    {
      return this.dateString;
    }
    this.dateString = this.d.toDateString();
    return this.dateString;
  }
  getTime(): number
  {
    if (this.finKittyTime)
    {
      return this.finKittyTime;
    }
    this.finKittyTime = this.d.getTime();
    return this.finKittyTime;
  }
  setFullYear(y: number)
  {
    this.finKittyTime = undefined;
    this.dateString = undefined;
    this.description = undefined;
    this.debugDescription = undefined;
    this.viewDescription = undefined;
    this.d.setFullYear(y);
  }
}

const doLogToFile = true;
let doLogIncremental = true;

/** Cap in-memory log size so huge evaluations cannot hit RangeError (invalid string length). */
const MAX_LOG_BUFFER_CHARS = 16 * 1024 * 1024;

const logChunks: string[] = [];
let logCharCount = 0;

function getLogText(): string {
  return logChunks.join("");
}

function appendLogLineForFile(line: string): void {
  const safeLine =
    line.length > MAX_LOG_BUFFER_CHARS
      ? `${line.slice(0, MAX_LOG_BUFFER_CHARS)}\n...[truncated]\n`
      : line;

  logChunks.push(safeLine);
  logCharCount += safeLine.length;

  while (logCharCount > MAX_LOG_BUFFER_CHARS && logChunks.length > 0) {
    const removed = logChunks.shift()!;
    logCharCount -= removed.length;
  }
}

export function log(obj: string | Map<any, any> | boolean) {
  if (doLogIncremental) {
    /* eslint-disable no-console */ // all console calls routed through here
    // tslint:disable-next-line:no-console
    console.log(obj);
    /* eslint-enable no-console */
  }
  if (doLogToFile) {
    const line =
      typeof obj === "string"
        ? obj.length > MAX_LOG_BUFFER_CHARS
          ? `${obj.slice(0, MAX_LOG_BUFFER_CHARS)}\n...[truncated]\n`
          : `${obj}\n`
        : `${obj as Map<any, any> | boolean}\n`;
    appendLogLineForFile(line);
  }
}

/* istanbul ignore next */
export function saveLogsFromBrowser() {
  /* istanbul ignore next */
  const text = getLogText();
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  /* istanbul ignore next */
  log(`saving logs to file, length ${text.length}`);
  FileSaver.saveAs(blob, `logs.txt`);
}

export function saveLogsUsingFs() {
  // Node only (browser has no fs; Jest uses jsdom so `window` exists — use `process.versions.node`).
  if (typeof process === "undefined" || !process.versions?.node) {
    return;
  }
  const fs = require("fs") as typeof import("fs");
  const text = getLogText();
  console.log(`saving logs to file, length ${text.length}`);
  fs.writeFile("logs.txt", text, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("File written successfully\n");
    }
  });
}

export function printAllLogs() {
  console.log(getLogText());
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
  return makeDateFromString("1 Jan 2100", undefined);
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
  Monitor,
  Generator
}

export enum DateFormatType {
  View,
  Test,
  Data,
  Debug,
  Unknown,
}

/** When `model` is set, "tomorrow" is one day after the same anchor as getTodaysDate (value focus date or real clock). */
function dateAnchorForTomorrow(model: ModelData | undefined): Date {
  if (model === undefined) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  let today = new Date();
  const named = model.settings.filter((s) => s.NAME === valueFocusDate);
  if (named.length > 1) {
    throw new Error(
      `BUG!!! multiple '${valueFocusDate}' values found in settings list`,
    );
  }
  if (named.length === 1 && named[0].VALUE !== "") {
    today = new Date(named[0].VALUE);
  } else {
    today.setHours(0, 0, 0, 0);
  }
  return today;
}

export function makeDateFromString(input: string, model?: ModelData) {
  if (input === "tomorrow") {
    const base = dateAnchorForTomorrow(model);
    const tomorrow = new Date(base);
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
    // process 'May 2021' / 'Mar 2025' — WebKit/Safari often returns Invalid Date for new Date(monthYear)
    regex = /^[a-zA-Z]+ \d{4}$/;
    if (input.match(regex) !== null) {
      const parsed = moment(input, ["MMM YYYY", "MMMM YYYY"], true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
      return new Date("Invalid Date");
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
