// note JSON stringify and back for serialisation is OK but

import {
  valueFocusDate,
  roiStart,
  viewType,
  roiEnd,
  separator,
  cgt,
  incomeTax,
  nationalInsurance,
  revalue,
  viewFrequency,
} from "../localization/stringConstants";
import {
  getSpecialWord,
  checkForWordClashInModel,
  replaceWholeString,
  replaceNumberValueString,
  replaceSeparatedString,
  checkTriggerDate,
  getTriggerDate,
  dateAsString,
} from "../utils/stringUtils";
import {
  Asset,
  Expense,
  Income,
  Interval,
  Item,
  ModelData,
  Setting,
  Transaction,
} from "../types/interfaces";
import { DateFormatType, log, makeDateFromString, showObj } from "../utils/utils";
import { checkModel } from "./checks";

import { makeModelFromJSONString } from "./modelFromJSON";
import { getSettings, getVarVal, isATransaction } from "./modelQueries";

export function setSetting(
  settings: Setting[],
  key: string,
  val: string,
  type: string,
  hint = "",
) {
  if (key === viewFrequency) {
    /* istanbul ignore next  */ //error
    throw new Error("set setting for frequency");
  }
  const idx = settings.findIndex((x) => x.NAME === key);
  if (idx === -1) {
    // add new object
    settings.push({
      NAME: key,
      ERA: undefined,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  } else {
    // replace with a new object
    settings.splice(idx, 1, {
      NAME: key,
      ERA: settings[idx].ERA,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  }
}

export function setNonsenseSetting(
  settings: Setting[],
  key: string,
  val: string,
  type: string,
  hint = "",
) {
  const idx = settings.findIndex((x) => x.NAME === key);
  if (idx === -1) {
    // add new object
    settings.push({
      NAME: key,
      ERA: undefined,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  } else {
    // replace with a new object
    settings.splice(idx, 1, {
      NAME: key,
      ERA: settings[idx].ERA,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  }
}

// might be today or might be set using a setting
export function getTodaysDate(model: ModelData) {
  let today = new Date();
  const todaysDate = getSettings(model.settings, valueFocusDate, "", false);
  if (todaysDate !== "") {
    today = new Date(todaysDate);
  }
  return today;
}

export function getROI(model: ModelData): Interval {
  const start = getSettings(model.settings, roiStart, "noneFound");
  const end = getSettings(model.settings, roiEnd, "noneFound");
  const v = getVarVal(model.settings);

  const startDate = checkTriggerDate(start, model.triggers, v);
  const endDate = checkTriggerDate(end, model.triggers, v);
  return {
    start: startDate !== undefined ? startDate : new Date("1999"),
    end: endDate !== undefined ? endDate : new Date("2099"),
  };
}

export function setROI(model: ModelData, roi: { start: string; end: string }) {
  setSetting(model.settings, roiStart, roi.start, viewType);
  setSetting(model.settings, roiEnd, roi.end, viewType);
}

export function getLiabilityPeople(model: ModelData): string[] {
  const liabilityPeople: string[] = [];
  // log(`model for getLiabilityPeople is ${showObj(model)}`);
  model.assets.forEach((obj) => {
    const words = obj.LIABILITY.split(separator);
    for (const word of words) {
      // log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(cgt)) {
        person = word.substring(0, word.length - cgt.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex((name) => {
            return person === name;
          }) === -1
        ) {
          // log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  model.incomes.forEach((obj) => {
    const words = obj.LIABILITY.split(separator);
    // log(`words = ${words}`);
    for (const word of words) {
      // log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(nationalInsurance)) {
        person = word.substring(0, word.length - nationalInsurance.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex((name) => {
            return person === name;
          }) === -1
        ) {
          // log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  return liabilityPeople;
}

export function markForUndo(model: ModelData) {
  const modelClone = makeModelFromJSONString(JSON.stringify(model));
  model.undoModel = modelClone;
  model.redoModel = undefined;
}
export function revertToUndoModel(model: ModelData): boolean {
  if (model.undoModel !== undefined) {
    // log(`before undo, model has model.undoModel = ${model.undoModel}`);
    // log(`before undo, model has model.redoModel = ${model.redoModel}`);
    // log(`before undo, model has ${model.settings.length} settings`);
    const targetModel = model.undoModel;
    model.undoModel = undefined;
    targetModel.redoModel = {
      name: model.name,
      assets: model.assets,
      expenses: model.expenses,
      incomes: model.incomes,
      settings: model.settings,
      transactions: model.transactions,
      triggers: model.triggers,
      monitors: model.monitors,
      generators: model.generators,
      version: model.version,
      undoModel: model.undoModel,
      redoModel: model.redoModel,
    };
    Object.assign(model, targetModel);
    // log(`after undo, model has model.undoModel = ${model.undoModel}`);
    // log(`after undo, model has model.redoModel = ${model.redoModel}`);
    // log(`after undo, model has ${model.settings.length} settings`);
    return true;
  }
  return false;
}
export function applyRedoToModel(model: ModelData): boolean {
  if (model.redoModel !== undefined) {
    // log(`before redo, model has model.undoModel = ${model.undoModel}`);
    // log(`before redo, model has model.redoModel = ${model.redoModel}`);
    // log(`before redo, model has ${model.settings.length} settings`);
    const targetModel = model.redoModel;
    model.redoModel = undefined;
    targetModel.undoModel = {
      name: model.name,
      assets: model.assets,
      expenses: model.expenses,
      incomes: model.incomes,
      settings: model.settings,
      transactions: model.transactions,
      triggers: model.triggers,
      monitors: model.monitors,
      generators: model.generators,
      version: model.version,
      undoModel: model.undoModel,
      redoModel: model.redoModel,
    };
    Object.assign(model, targetModel);
    // log(`after redo, model has model.undoModel = ${model.undoModel}`);
    // log(`after redo, model has model.redoModel = ${model.redoModel}`);
    // log(`after redo, model has ${model.settings.length} settings`);
    return true;
  }
  return false;
}
export function attemptRenameLong(
  model: ModelData,
  doChecks: boolean,
  old: string,
  replacement: string,
): string {
  // log(`attempt rename from ${old} to ${replacement}`);

  const outcome = checkModel(model);
  /* istanbul ignore if */
  if (outcome.message !== "") {
    return `Error: pre-rename model ${showObj(model)} fails checks with ${showObj(outcome)}`;
  }

  if (doChecks) {
    // prevent a change which alters a special word
    const oldSpecialWord = getSpecialWord(old, model);
    const newSpecialWord = getSpecialWord(replacement, model);
    if (oldSpecialWord !== newSpecialWord) {
      // log(`old = ${old}, replacement = ${replacement}`);
      // log(`oldSpecialWord = ${oldSpecialWord}, newSpecialWord = ${newSpecialWord}`);
      if (oldSpecialWord !== "") {
        return `Must maintain special formatting using ${oldSpecialWord}`;
      } else {
        /* istanbul ignore next */ // don't add special words as part of a test system!
        return `Error: Must not introduce special formatting using ${newSpecialWord}`;
      }
    }
    // prevent a change which clashes with an existing word
    const message = checkForWordClashInModel(model, replacement, "already");
    if (message.length > 0) {
      // log(`found word clash ${message}`);
      /* istanbul ignore next */ // don't expect abcd names as part of our test system!
      return message;
    }
  }

  // log(`get ready to make changes, be ready to undo...`);
  // be ready to undo
  markForUndo(model);
  // log(`making changes to nodel... `);
  model.settings.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
  });
  model.triggers.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
  });
  model.assets.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.QUANTITY = replaceWholeString(obj.QUANTITY, old, replacement);
    obj.GROWTH = replaceWholeString(obj.GROWTH, old, replacement);
    obj.LIABILITY = replaceSeparatedString(obj.LIABILITY, old, replacement);
    obj.PURCHASE_PRICE = replaceNumberValueString(
      obj.PURCHASE_PRICE,
      old,
      replacement,
    );
  });
  model.incomes.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.END = replaceWholeString(obj.END, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.VALUE_SET = replaceWholeString(obj.VALUE_SET, old, replacement);
    obj.LIABILITY = replaceSeparatedString(obj.LIABILITY, old, replacement);
  });
  model.expenses.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.END = replaceWholeString(obj.END, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.VALUE_SET = replaceWholeString(obj.VALUE_SET, old, replacement);
  });
  model.transactions.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.FROM = replaceSeparatedString(obj.FROM, old, replacement);
    obj.FROM_VALUE = replaceNumberValueString(obj.FROM_VALUE, old, replacement);
    obj.TO = replaceSeparatedString(obj.TO, old, replacement);
    obj.TO_VALUE = replaceNumberValueString(obj.TO_VALUE, old, replacement);
    obj.DATE = replaceWholeString(obj.DATE, old, replacement);
    obj.STOP_DATE = replaceWholeString(obj.STOP_DATE, old, replacement);
  });  
  model.generators.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    Object.keys(obj.DETAILS).forEach((k) => {
      obj.DETAILS[k] = replaceWholeString(obj.DETAILS[k], old, replacement);
    })
  });
  model.monitors.forEach((obj) => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
  })
  const message = checkForWordClashInModel(model, old, "still");
  /* istanbul ignore if */
  if (message.length > 0) {
    log(`Error: old word still present in adjusted model`);
    revertToUndoModel(model);
    return message;
  }
  if (doChecks) {
    const outcome = checkModel(model);
    /* istanbul ignore if */
    if (outcome.message !== "") {
      log(`Error: reverted model fails checks with ${showObj(outcome)}`);
      revertToUndoModel(model);
      return outcome.message;
    } else {
      // log(`save adjusted model`);
      return "";
    }
  } else {
    return "";
  }
}

function standardiseDate(dateString: string): string {
  const dateObj = makeDateFromString(dateString);
  if (isNaN(dateObj.getTime())) {
    return dateString;
  }
  //log(
  //  `standardised ${dateString} to ${dateObj}, with time ${dateObj.getTime()}`,
  //);
  return dateAsString(DateFormatType.Unknown, dateObj);
}

export function standardiseDates(model: ModelData): string {
  // log(`get ready to make changes, be ready to undo...`);
  // be ready to undo
  markForUndo(model);
  // log(`making changes to nodel... `);
  model.triggers.forEach((obj) => {
    obj.DATE = standardiseDate(obj.DATE);
  });
  model.assets.forEach((obj) => {
    obj.START = standardiseDate(obj.START);
  });
  model.incomes.forEach((obj) => {
    obj.VALUE_SET = standardiseDate(obj.VALUE_SET);
    obj.START = standardiseDate(obj.START);
    obj.END = standardiseDate(obj.END);
  });
  model.expenses.forEach((obj) => {
    obj.VALUE_SET = standardiseDate(obj.VALUE_SET);
    obj.START = standardiseDate(obj.START);
    obj.END = standardiseDate(obj.END);
  });
  model.transactions.forEach((obj) => {
    obj.DATE = standardiseDate(obj.DATE);
    obj.STOP_DATE = standardiseDate(obj.STOP_DATE);
  });
  const outcome = checkModel(model);
  /* istanbul ignore if */
  if (outcome.message !== "") {
    log(`Error: model fails checks with ${outcome.message}`);
    //revertToUndoModel(model);
    return outcome.message;
  } else {
    return "";
  }
}

export function makeRevalueName(name: string, model: ModelData) {
  let isDoubleDigit = false;
  let hasSpace = true;
  if (isATransaction(`${revalue}${name} 1`, model)) {
    isDoubleDigit = false;
    hasSpace = true;
  } else if (isATransaction(`${revalue}${name}1`, model)) {
    isDoubleDigit = false;
    hasSpace = false;
  } else if (isATransaction(`${revalue}${name} 01`, model)) {
    isDoubleDigit = true;
    hasSpace = true;
  } else if (isATransaction(`${revalue}${name}01`, model)) {
    isDoubleDigit = true;
    hasSpace = false;
  }
  // log(`isDoubleDigit = ${isDoubleDigit}, hasSpace = ${hasSpace}`);

  let count = 1;
  const spacePart = hasSpace ? " " : "";
  const makeNumberPart = (n: number) => {
    if (isDoubleDigit) {
      if (n < 10) {
        return `0${n}`;
      } else {
        return `${n}`;
      }
    } else {
      return `${n}`;
    }
  };
  const makeName = (n: number, spacePart: string) => {
    return `${revalue}${name}` + `${spacePart}${makeNumberPart(count)}`;
  };

  // log(`spacePart = '${spacePart}'`);
  // log(`makeNumberPart(1) = '${makeNumberPart(1)}'`);
  while (isATransaction(`${makeName(count, spacePart)}`, model)) {
    count += 1;
  }
  const newName = makeName(count, spacePart);
  return newName;
}

function determineIfIsAsset(toBeDetermined: Item): toBeDetermined is Asset {
  if ((toBeDetermined as Asset).CAN_BE_NEGATIVE !== undefined) {
    return true;
  }
  return false;
}
function determineIfIsIncome(toBeDetermined: Item): toBeDetermined is Income {
  if ((toBeDetermined as Income).LIABILITY !== undefined) {
    return true;
  }
  return false;
}
function determineIfIsExpense(toBeDetermined: Item): toBeDetermined is Expense {
  if (
    (toBeDetermined as Expense).CPI_IMMUNE !== undefined &&
    (toBeDetermined as Expense).RECURRENCE !== undefined
  ) {
    return true;
  }
  return false;
}
function determineIfIsTransaction(
  toBeDetermined: Item,
): toBeDetermined is Transaction {
  if ((toBeDetermined as Transaction).FROM_ABSOLUTE !== undefined) {
    return true;
  }
  return false;
}
export function isHistorical(obj: Item, model: ModelData) {
  if (determineIfIsAsset(obj)) {
    return false;
  } else {
    const date = getTodaysDate(model);
    const v = getVarVal(model.settings);
    if (determineIfIsIncome(obj)) {
      const i = obj as Income;
      const hasFinished = getTriggerDate(i.END, model.triggers, v) < date;
      if (hasFinished) {
        return true;
      } else {
        return false;
      }
    } else {
      if (determineIfIsExpense(obj)) {
        const e = obj as Expense;
        const hasFinished = getTriggerDate(e.END, model.triggers, v) < date;
        if (hasFinished) {
          return true;
        } else {
          return false;
        }
      } else {
        if (determineIfIsTransaction(obj)) {
          const t = obj as Transaction;
          if (t.NAME.startsWith(revalue)) {
            const itemName = t.TO;

            const matchedExpense = model.expenses.find((e) => {
              return e.NAME === itemName;
            });
            if (matchedExpense && isHistorical(matchedExpense, model)) {
              return true;
            }
            const matchedIncome = model.incomes.find((e) => {
              return e.NAME === itemName;
            });
            if (matchedIncome && isHistorical(matchedIncome, model)) {
              return true;
            }

            const tDate = getTriggerDate(t.DATE, model.triggers, v);
            if (tDate < date) {
              // this feels old - is this the latest revalue of this asset?
              const laterOldRevalue = model.transactions.find((lor) => {
                if (lor === t) {
                  return false;
                }
                if (!lor.NAME.startsWith(revalue)) {
                  return false;
                }
                if (lor.TO !== itemName) {
                  return false;
                }
                const lorDate = getTriggerDate(lor.DATE, model.triggers, v);
                if (lorDate > date) {
                  return false;
                }
                if (lorDate <= tDate) {
                  return false;
                }
                return true;
              });
              if (laterOldRevalue) {
                return true;
              } else {
                return false;
              }
            }
          } else if (t.RECURRENCE === "") {
            const tDate = getTriggerDate(t.DATE, model.triggers, v);
            if (tDate < date) {
              return true;
            }
          }
          // TODO more filtering here
          return false;
        }
      }
    }
  }
  // include this thing
  return false;
}
