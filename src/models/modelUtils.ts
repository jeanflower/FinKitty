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
} from '../localization/stringConstants';
import {
  getSpecialWord,
  checkForWordClashInModel,
  replaceWholeString,
  replaceNumberValueString,
  replaceSeparatedString,
} from '../stringUtils';
import { ModelData, Setting } from '../types/interfaces';
import { log, showObj } from '../utils';
import { checkData } from './checks';
import { getTestModel } from './exampleModels';
import { migrateOldVersions } from './versioningUtils';

// breaks dates (and functions too but we don't have these)
function cleanUpDates(modelFromJSON: ModelData): void {
  for (const t of modelFromJSON.triggers) {
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
    t.DATE = new Date(t.DATE);
    //log(`type of ${t.DATE} = ${typeof t.DATE}`);
  }
  if (modelFromJSON.undoModel) {
    cleanUpDates(modelFromJSON.undoModel);
  }
  if (modelFromJSON.redoModel) {
    cleanUpDates(modelFromJSON.redoModel);
  }
  // log(`cleaned up model assets ${showObj(result.assets)}`);
}

export function makeModelFromJSONString(input: string): ModelData {
  const matches = input.match(/PensionDBC/g);
  if (matches !== null && matches.length > 0) {
    log(`Old string 'PensionDBC' in loaded data!!`);
  }

  let result = JSON.parse(input);
  // log(`parsed JSON and found ${showObj(result)}`);
  if (result.testName !== undefined) {
    // log("this isn't JSON but refers to test data we can look up");
    result = getTestModel(result.testName);
  }

  // log(`loaded model, version =${result.version}`);

  if (result.version === undefined) {
    // log(`missing version, setting as 0`);
    result.version = 0;
  }

  cleanUpDates(result);

  // log(`result from makeModelFromJSON = ${showObj(result)}`);
  return result;
}
export function isSetting(input: string, settings: Setting[]) {
  const result = {
    value: '',
    numFound: 1,
  };
  const x = settings.filter(pr => pr.NAME === input);
  if (x.length === 1) {
    // log(`got setting ${showObj(result)}`);
    result.value = x[0].VALUE;
  } else {
    result.numFound = x.length;
    if (result.numFound > 1) {
      log(`multiple settings: ${showObj(x)}`);
    }
  }
  return result;
}

export function getSettings(
  settings: Setting[],
  key: string,
  fallbackVal: string,
  expectValue = true,
) {
  const searchResult = isSetting(key, settings);
  if (searchResult.numFound === 1) {
    return searchResult.value;
  }
  if (searchResult.numFound === 0) {
    if (expectValue) {
      log(`BUG!!! '${key}' value not found in settings list`);
      // throw new Error(`BUG!!! '${key}' value not found in settings list`);
    }
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    return fallbackVal;
  }
  if (searchResult.numFound > 1) {
    log(`BUG!!! multiple '${key}' values found in settings list`);
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    throw new Error(); // serious!! shows failure in browser!!
    //return fallbackVal;
  }
  return fallbackVal;
}

export function setSetting(
  settings: Setting[],
  key: string,
  val: string,
  type: string,
  hint = '',
) {
  const idx = settings.findIndex(x => x.NAME === key);
  if (idx === -1) {
    // add new object
    settings.push({
      NAME: key,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  } else {
    // replace with a new object
    settings.splice(idx, 1, {
      NAME: key,
      VALUE: val,
      HINT: hint,
      TYPE: type,
    });
  }
}

// might be today or might be set using a setting
export function getTodaysDate(model: ModelData) {
  let today = new Date();
  if (model.settings.length === 0) {
    return today;
  }
  const todaysDate = getSettings(model.settings, valueFocusDate, '');
  if (todaysDate !== '') {
    today = new Date(todaysDate);
  }
  return today;
}

export function setROI(model: ModelData, roi: { start: string; end: string }) {
  setSetting(model.settings, roiStart, roi.start, viewType);
  setSetting(model.settings, roiEnd, roi.end, viewType);
}

export function makeModelFromJSON(input: string): ModelData {
  // log('in makeModelFromJSON');
  const model: ModelData = makeModelFromJSONString(input);
  migrateOldVersions(model);
  return model;
}

export function isADebt(name: string, model: ModelData) {
  const matchingAsset = model.assets.find(a => {
    return a.NAME === name;
  });
  if (matchingAsset === undefined) {
    return false;
  }
  return matchingAsset.IS_A_DEBT;
}
export function isAnIncome(name: string, model: ModelData) {
  return model.incomes.filter(a => a.NAME === name).length > 0;
}
export function isAnExpense(name: string, model: ModelData) {
  return model.expenses.filter(a => a.NAME === name).length > 0;
}
function isAnAsset(name: string, model: ModelData) {
  return (
    model.assets.filter(a => a.NAME === name || a.CATEGORY === name).length > 0
  );
}
export function isAnAssetOrAssets(name: string, model: ModelData) {
  const words = name.split(separator);
  let ok = true;
  words.forEach(word => {
    if (!isAnAsset(word, model)) {
      ok = false;
    }
  });
  return ok;
}
export function isATransaction(name: string, model: ModelData) {
  return model.transactions.filter(t => t.NAME === name).length > 0;
}

export function replaceCategoryWithAssetNames(
  words: string[],
  model: ModelData,
) {
  // log(`start replaceCategoryWithAssetNames with words = ${showObj(words)}`);
  let wordsNew: string[] = [];
  words.forEach(w => {
    // log(`look at word "${w}" - is it a category?`);
    // if w is a category of one or more assets
    // then remove w from the list and
    // if the assets are not already on the list
    // then add the asset Names.
    const assetsWithCategory = model.assets.filter(a => {
      return a.CATEGORY === w;
    });
    if (assetsWithCategory.length === 0) {
      wordsNew.push(w);
    } else {
      wordsNew = wordsNew.concat(
        assetsWithCategory.map(a => {
          return a.NAME;
        }),
      );
    }
  });
  // log(`return from replaceCategoryWithAssetNames with wordsNew = ${showObj(wordsNew)}`);
  return wordsNew;
}

export function getLiabilityPeople(model: ModelData): string[] {
  const liabilityPeople: string[] = [];
  if (model.assets === undefined) {
    return [];
  }
  // console.log(`model for tax buttons is ${showObj(model)}`);
  model.assets.forEach(obj => {
    const words = obj.LIABILITY.split(separator);
    for (const word of words) {
      // console.log(`liability word = ${word}`);
      let person: string | undefined = undefined;
      if (word.endsWith(cgt)) {
        person = word.substring(0, word.length - cgt.length);
      } else if (word.endsWith(incomeTax)) {
        person = word.substring(0, word.length - incomeTax.length);
      }
      if (person !== undefined) {
        if (
          liabilityPeople.findIndex(name => {
            return person === name;
          }) === -1
        ) {
          // console.log(`person = ${person}`);
          liabilityPeople.push(person);
        }
      }
    }
  });
  model.incomes.forEach(obj => {
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
          liabilityPeople.findIndex(name => {
            return person === name;
          }) === -1
        ) {
          // console.log(`person = ${person}`);
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
      assets: model.assets,
      expenses: model.expenses,
      incomes: model.incomes,
      settings: model.settings,
      transactions: model.transactions,
      triggers: model.triggers,
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
      assets: model.assets,
      expenses: model.expenses,
      incomes: model.incomes,
      settings: model.settings,
      transactions: model.transactions,
      triggers: model.triggers,
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
  old: string,
  replacement: string,
): string {
  // log(`attempt rename from ${old} to ${replacement}`);

  // prevent a change which alters a special word
  const oldSpecialWord = getSpecialWord(old);
  const newSpecialWord = getSpecialWord(replacement);
  if (oldSpecialWord !== newSpecialWord) {
    if (oldSpecialWord !== '') {
      return `Must maintain special formatting using ${oldSpecialWord}`;
    } else {
      return `Must not introduce special formatting using ${newSpecialWord}`;
    }
  }
  // prevent a change which clashes with an existing word
  let message = checkForWordClashInModel(model, replacement, 'already');
  if (message.length > 0) {
    // log(`found word clash ${message}`);
    return message;
  }

  // log(`get ready to make changes, be ready to undo...`);
  // be ready to undo
  markForUndo(model);
  model.settings.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
  });
  model.triggers.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
  });
  model.assets.forEach(obj => {
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
  model.incomes.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.END = replaceWholeString(obj.END, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.VALUE_SET = replaceWholeString(obj.VALUE_SET, old, replacement);
    obj.GROWTH = replaceWholeString(obj.GROWTH, old, replacement);
    obj.LIABILITY = replaceSeparatedString(obj.LIABILITY, old, replacement);
  });
  model.expenses.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.START = replaceWholeString(obj.START, old, replacement);
    obj.END = replaceWholeString(obj.END, old, replacement);
    obj.VALUE = replaceNumberValueString(obj.VALUE, old, replacement);
    obj.VALUE_SET = replaceWholeString(obj.VALUE_SET, old, replacement);
    obj.GROWTH = replaceWholeString(obj.GROWTH, old, replacement);
  });
  model.transactions.forEach(obj => {
    obj.NAME = replaceWholeString(obj.NAME, old, replacement);
    obj.FROM = replaceSeparatedString(obj.FROM, old, replacement);
    obj.FROM_VALUE = replaceNumberValueString(obj.FROM_VALUE, old, replacement);
    obj.TO = replaceSeparatedString(obj.TO, old, replacement);
    obj.TO_VALUE = replaceNumberValueString(obj.TO_VALUE, old, replacement);
    obj.DATE = replaceWholeString(obj.DATE, old, replacement);
    obj.STOP_DATE = replaceWholeString(obj.STOP_DATE, old, replacement);
  });
  message = checkForWordClashInModel(model, old, 'still');
  if (message.length > 0) {
    // log(`old word still present in adjusted model`);
    revertToUndoModel(model);
    return message;
  }
  const checkResult = checkData(model);
  if (checkResult !== '') {
    // log(`revert adjusted model`);
    revertToUndoModel(model);
    return checkResult;
  } else {
    // log(`save adjusted model`);
    return '';
  }
}
