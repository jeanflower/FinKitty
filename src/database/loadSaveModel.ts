import {
  DbExpense,
  DbIncome,
  DbTrigger,
  DbAsset,
  DbTransaction,
  DbSetting,
  DbItem,
  DbModelData,
} from '../types/interfaces';

import {
  log,
  printDebug,
  showObj,
  minimalModel,
  markForUndo,
  convertToUndoModel,
} from '../utils';

import { getDB } from './database';

import { adjustableType } from '../localization/stringConstants';

import { diffModels } from '../diffModels';
import { checkData } from '../models/checks';

const showDBInteraction = false;
const validateCache = false;

interface ModelStatus {
  isDirty: boolean;
}

interface CacheModel {
  modelName: string;
  status: ModelStatus;
  model: DbModelData;
}

// First time user X requests anything from this cache,
// user X will be absent and all user X models will be loaded.
// Models will be in 'clean' status
// After that they can become dirty through local edits
// or become clean through save to db

const localCache: Map<string, CacheModel[]> = new Map<string, CacheModel[]>();

async function getModelNamesDB(userID: string) {
  if (showDBInteraction) {
    log(`getDB get model names for user ${userID}`);
  }
  let modelNames: string[] = [];
  try {
    modelNames = await getDB().getModelNames(userID);
  } catch (error) {
    alert(`error contacting database ${error}`);
  }
  if (showDBInteraction) {
    log(`getModelNames returning ${modelNames}`);
  }
  return modelNames;
}

async function loadModelFromDB(
  userID: string,
  modelName: string,
): Promise<DbModelData | undefined> {
  let model: DbModelData | undefined;
  try {
    model = await getDB().loadModel(userID, modelName);
  } catch (err) {
    alert(`Cannot load ${modelName}; err = ${err}`);
  }
  if (showDBInteraction) {
    log(`loaded model ${modelName}`);
  }
  return model;
}

function logCache() {
  if (showDBInteraction) {
    log(
      `set up ${Array.from(localCache.keys()).map(k => {
        const cachedModel = localCache.get(k);
        if (!cachedModel) {
          return '';
        } else {
          return `[${k}, ${cachedModel.map(cm => {
            return `${cm.modelName}${cm.status.isDirty}${cm.model.assets.length}`;
          })}]`;
        }
      })}`,
    );
    //return `[${k}, ${showObj(localCache.get(k))}]`})}`);
  }
}

async function fillCacheFromDB(userID: string) {
  const cachedModels: CacheModel[] = [];
  const modelNames = await getModelNamesDB(userID);
  if (showDBInteraction) {
    log(`fill cache with these models ${modelNames}`);
  }
  for (let idx = 0; idx < modelNames.length; idx = idx + 1) {
    const modelName = modelNames[idx];
    const model = await loadModelFromDB(userID, modelName);
    if (model !== undefined) {
      if (showDBInteraction) {
        log(`got model for ${modelName}, go to add to cache`);
      }
      cachedModels.push({
        modelName: modelName,
        model: model,
        status: { isDirty: false },
      });
    } else {
      throw new Error(
        `model name ${modelName} from DB but no model present???`,
      );
    }
  }
  localCache.set(userID, cachedModels);
  logCache();
  return cachedModels;
}

export async function getModelNames(userID: string) {
  let cachedModels = localCache.get(userID);
  if (!cachedModels) {
    cachedModels = await fillCacheFromDB(userID);
  }
  return cachedModels.map(cm => {
    return cm.modelName;
  });
}

export async function loadModel(userID: string, modelName: string) {
  if (showDBInteraction) {
    log(`loadModel for ${userID}, name = ${modelName}`);
  }
  if (localCache.get(userID) === undefined) {
    await fillCacheFromDB(userID);
  }

  if (showDBInteraction) {
    log(`filled cache - now go use it!`);
  }
  const cachedModels = localCache.get(userID);
  let cachedModel = undefined;
  if (cachedModels) {
    cachedModel = cachedModels.find(cm => {
      return cm.modelName === modelName;
    });
  }
  if (cachedModel) {
    if (showDBInteraction) {
      log(`from cache load model ${modelName} for user ${userID}`);
    }
    if (validateCache && !cachedModel.status.isDirty) {
      const dbModel = await loadModelFromDB(userID, modelName);
      if (dbModel === undefined) {
        throw new Error(`DBValidation error: cache has clean model 
          but DB has no model for ${modelName}`);
      } else {
        const diff = diffModels(dbModel, cachedModel.model);
        if (diff !== '') {
          throw new Error(`DBValidation error: ${diff} for ${modelName}`);
        }
      }
    }
    return cachedModel;
  } else {
    if (showDBInteraction) {
      log(`didn't find ${modelName} in cache`);
    }
    return undefined;
  }
}
async function saveModelToCache(
  userID: string,
  modelName: string,
  modelData: DbModelData,
) {
  let cachedModels = localCache.get(userID);
  if (!cachedModels) {
    cachedModels = [];
  }

  const cachedModel = {
    modelName: modelName,
    model: modelData,
    status: { isDirty: true },
  };
  const idx = cachedModels.findIndex(cm => {
    return cm.modelName === modelName;
  });
  if (idx !== -1) {
    cachedModels.splice(idx, 1, cachedModel);
  } else {
    cachedModels.push(cachedModel);
  }
}

export async function ensureModel(userID: string, modelName: string) {
  if (showDBInteraction) {
    log(`ensure model ${modelName} for user ${userID}`);
  }
  let cachedModels = localCache.get(userID);
  if (!cachedModels) {
    cachedModels = [];
  }

  const cachedModel = cachedModels.find(cm => {
    return cm.modelName === modelName;
  });
  if (cachedModel) {
    if (showDBInteraction) {
      log(`nothing to do - model already exists in cache`);
    }
    return;
  }
  cachedModels.push({
    modelName: modelName,
    model: minimalModel,
    status: { isDirty: true },
  });
  if (showDBInteraction) {
    log(`added to cache:`);
  }
  logCache();
  if (showDBInteraction) {
    log(`ensured model ${modelName}`);
  }
  return;
}

export async function saveModelLSM(
  userID: string,
  modelName: string,
  model: DbModelData,
) {
  // log(`save model ${showObj(model)}`);
  if (showDBInteraction) {
    log(`save model ${modelName} for user ${userID}`);
  }
  saveModelToCache(userID, modelName, model);
  return true;
}

function updateItemList(itemList: DbItem[], newData: DbItem) {
  const idx = itemList.findIndex((i: DbItem) => {
    return i.NAME === newData.NAME;
  });
  if (idx !== -1) {
    itemList.splice(idx, 1);
  }
  itemList.push(newData);
}

async function submitItemLSM(
  inputItem: DbItem,
  itemList: DbItem[],
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  markForUndo(modelData);
  updateItemList(itemList, inputItem);

  const checkResult = checkData(modelData);
  if (checkResult !== '') {
    convertToUndoModel(modelData);
    return checkResult;
  }

  await saveModelLSM(userID, modelName, modelData);
  return '';
}

export async function submitExpenseLSM(
  expenseInput: DbExpense,
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitExpense with input : ${showObj(expenseInput)}`);
  }
  return submitItemLSM(
    expenseInput,
    modelData.expenses,
    modelName,
    modelData,
    userID,
  );
}

export async function submitIncomeLSM(
  incomeInput: DbIncome,
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitIncome with input : ${showObj(incomeInput)}`);
  }
  return submitItemLSM(
    incomeInput,
    modelData.incomes,
    modelName,
    modelData,
    userID,
  );
}

export async function submitTriggerLSM(
  trigger: DbTrigger,
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`go to submitTriggers with input : ${showObj(trigger)}`);
  }
  return submitItemLSM(
    trigger,
    modelData.triggers,
    modelName,
    modelData,
    userID,
  );
}

export async function submitAssetLSM(
  assetInput: DbAsset,
  modelName: string,
  modelData: DbModelData,
  userID: string,
): Promise<string> {
  if (printDebug()) {
    log(`in submitAsset with input : ${showObj(assetInput)}`);
  }
  return submitItemLSM(
    assetInput,
    modelData.assets,
    modelName,
    modelData,
    userID,
  );
}

export async function submitTransactionLSM(
  input: DbTransaction,
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitTransaction with input : ${showObj(input)}`);
  }
  return submitItemLSM(
    input,
    modelData.transactions,
    modelName,
    modelData,
    userID,
  );
}

export async function saveModelToDBLSM(
  userID: string,
  modelName: string,
  modelData: DbModelData,
) {
  if (showDBInteraction) {
    log(`getDB go to save model ${modelName}`);
  }
  await saveModelLSM(userID, modelName, modelData);
  const cachedModels = localCache.get(userID);
  let status;
  if (cachedModels) {
    const cachedModel = cachedModels.find(cm => {
      return cm.modelName === modelName;
    });
    if (cachedModel) {
      status = cachedModel.status;
    }
  }
  getDB().ensureModel(userID, modelName);
  const result = getDB().saveModel(userID, modelName, modelData);
  if (result && status) {
    status.isDirty = false;
  }
  return result;
}

export async function submitSettingLSM(
  input: DbSetting, // if HINT or TYPE are empty, leave pre-existing values
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitSettingLSM with input : ${showObj(input)}`);
  }
  const idx = modelData.settings.find((i: DbItem) => {
    return i.NAME === input.NAME;
  });
  if (idx !== undefined) {
    if (input.HINT === '') {
      input.HINT = idx.HINT;
    }
    if (input.TYPE === '') {
      input.TYPE = idx.TYPE;
    }
  }
  return submitItemLSM(input, modelData.settings, modelName, modelData, userID);
}

export async function submitNewSettingLSM(
  setting: DbSetting,
  modelName: string,
  modelData: DbModelData,
  userID: string,
) {
  let type = adjustableType;
  const matchingSettings = modelData.settings.filter(s => {
    return s.NAME === setting.NAME;
  });
  if (matchingSettings.length > 0) {
    type = matchingSettings[0].TYPE;
  }

  submitSettingLSM(
    {
      NAME: setting.NAME,
      VALUE: setting.VALUE,
      HINT: setting.HINT,
      TYPE: type,
    },
    modelName,
    modelData,
    userID,
  );
}

export async function deleteModel(userID: string, modelName: string) {
  if (showDBInteraction) {
    log(`getDB delete model ${modelName}`);
  }
  const cachedModels = localCache.get(userID);
  if (cachedModels === undefined) {
    log(`unexpected empty local cache - no models for ${userID}??`);
  } else {
    const idx = cachedModels.findIndex(cm => {
      return cm.modelName === modelName;
    });
    if (idx === -1) {
      log(`unexpected local cache - no model for ${userID} and ${modelName}??`);
    } else {
      cachedModels.splice(idx, 1);
    }
  }
  return await getDB().deleteModel(userID, modelName);
}
