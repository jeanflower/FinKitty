import { ModelData, ModelDataFromFile } from "../types/interfaces";
import { log } from "../utils/utils";
import { migrateOldVersions } from "./versioningUtils";
import { roiStart, roiEnd } from "../localization/stringConstants";
import { checkTriggerDate } from "../utils/stringUtils";
import { getVarVal } from "./modelQueries";

function convertFavouriteToEra(i: any) {
  if (i.ERA !== undefined) {
    return;
  }
  if (i.FAVOURITE === true) {
    i.ERA = 1;
  } else if (i.FAVOURITE === false) {
    i.ERA = 0;
  } else {
    i.ERA = 0;
  }
}

function cleanUpDates(
  modelFromJSON: ModelData,
  cleanUndo: boolean,
  cleanRedo: boolean,
): void {
  const varVal = getVarVal(modelFromJSON.settings);
  const cleaningResult = {
    cleaned: '',
  };

  for (const t of modelFromJSON.triggers) {
    cleaningResult.cleaned = '';
    checkTriggerDate(t.DATE, modelFromJSON.triggers, varVal, cleaningResult);
    // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
    t.DATE = cleaningResult.cleaned;
  }
  for (const s of modelFromJSON.settings) {
    if (s.NAME === roiStart || s.NAME === roiEnd) {
      cleaningResult.cleaned = '';
      checkTriggerDate(s.VALUE, modelFromJSON.triggers, varVal, cleaningResult);
      // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
      s.VALUE = cleaningResult.cleaned;
    }
  }
  for (const x of modelFromJSON.assets) {
    cleaningResult.cleaned = '';
    checkTriggerDate(x.START, modelFromJSON.triggers, varVal, cleaningResult);
    // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
    x.START = cleaningResult.cleaned;
  }
  for (const x of modelFromJSON.incomes) {
    cleaningResult.cleaned = '';
    checkTriggerDate(x.START, modelFromJSON.triggers, varVal, cleaningResult);
    // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
    x.START = cleaningResult.cleaned;
    cleaningResult.cleaned = '';

    checkTriggerDate(x.END, modelFromJSON.triggers, varVal, cleaningResult);
    // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
    x.END = cleaningResult.cleaned;
  }
  for (const x of modelFromJSON.incomes) {
    cleaningResult.cleaned = '';
    checkTriggerDate(x.START, modelFromJSON.triggers, varVal, cleaningResult);
    // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
    x.START = cleaningResult.cleaned;
    cleaningResult.cleaned = '';
    checkTriggerDate(x.END, modelFromJSON.triggers, varVal, cleaningResult);
    // log(`cleaningResult from ${t.DATE} = ${cleaningResult.cleaned}`);
    x.END = cleaningResult.cleaned;
  }
  if (cleanUndo && modelFromJSON.undoModel) {
    cleanUpDates(modelFromJSON.undoModel, true, false);
  }
  if (cleanRedo && modelFromJSON.redoModel) {
    cleanUpDates(modelFromJSON.redoModel, false, true);
  }
  // log(`cleaned up model assets ${showObj(result.assets)}`);
}

// breaks dates (and functions too but we don't have these)
export function makeModelFromJSONString(
  input: string,
  modelName = '',
): ModelDataFromFile {
  const matches = input.match(/PensionDBC/g);
  /* istanbul ignore next */
  if (matches !== null && matches.length > 0) {
    /* istanbul ignore next */
    log(`Old string 'PensionDBC' in loaded data!!`);
  }

  let result = JSON.parse(input);
  // log(`parsed JSON and found ${showObj(result)}`);

  if (modelName !== '' || result.name === undefined) {
    result.name = modelName;
  }

  // log(`loaded model, version =${result.version}`);

  if (result.version === undefined) {
    // log(`missing version, setting as 0`);
    result.version = 0;
  }

  for (const asset of result.assets) {
    convertFavouriteToEra(asset);
  }
  for (const income of result.incomes) {
    convertFavouriteToEra(income);
  }
  for (const expense of result.expenses) {
    convertFavouriteToEra(expense);
  }
  for (const trigger of result.triggers) {
    convertFavouriteToEra(trigger);
  }
  for (const setting of result.settings) {
    convertFavouriteToEra(setting);
  }
  for (const transaction of result.transactions) {
    convertFavouriteToEra(transaction);
  }

  cleanUpDates(result, true, true);

  // log(`result from makeModelFromJSON = ${showObj(result)}`);
  return result;
}

export function makeModelFromJSON(
  input: string, 
  modelName = '',
): ModelData {
  // log('in makeModelFromJSON');
  const model: ModelDataFromFile = makeModelFromJSONString(input, modelName);
  migrateOldVersions(model);
  return model;
}
