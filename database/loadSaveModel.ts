import {
  Expense,
  Income,
  Trigger,
  Asset,
  Transaction,
  Setting,
  Item,
  ModelData,
} from "../types/interfaces";

import { log, printDebug, showObj } from "../utils/utils";

import { getDB } from "./database";

import { adjustableType } from "../localization/stringConstants";

import { diffModels } from "../models/diffModels";
import { checkData, CheckResult } from "../models/checks";
import { simpleExampleData } from "../models/exampleModels";
import { markForUndo, revertToUndoModel } from "../models/modelUtils";
import { minimalModel } from "../models/minimalModel";
import { makeModelFromJSON } from "../models/modelFromJSON";

const showDBInteraction = false;

interface ModelStatus {
  isDirty: boolean;
}

interface CacheModel {
  modelName: string;
  status: ModelStatus;
  model: ModelData;
}

// First time user X requests anything from this cache,
// user X will be absent and all user X models will be loaded.
// Models will be in 'clean' status
// After that they can become dirty through local edits
// or become clean through save to db

const localCache: Map<string, CacheModel[]> = new Map<string, CacheModel[]>();

async function getModelNamesDB(userID: string) {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`getDB get model names for user ${userID}`);
  }
  let modelNames: string[] = [];
  try {
    modelNames = await getDB().getModelNames(userID);
  } catch (error) {
    /* istanbul ignore next */
    log(`error contacting database ${error}`); // TODO alert!!
  }
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`getModelNames returning ${modelNames}`);
  }
  return modelNames;
}

async function loadModelFromDB(
  userID: string,
  modelName: string,
): Promise<ModelData | undefined> {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`loadModelFromDB for ${userID}, name = ${modelName}`);
  }
  let model: ModelData | undefined;
  try {
    model = await getDB().loadModel(userID, modelName);
  } catch (err) {
    /* istanbul ignore next */
    alert(
      `Cannot load ${modelName}; err = ${err} - will create a simple model instead`,
    );
    /* istanbul ignore next */
    model = makeModelFromJSON(simpleExampleData, modelName);
  }
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`loaded model ${modelName}`);
  }
  return model;
}

function logCache() {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(
      `set up ${Array.from(localCache.keys()).map((k) => {
        const cachedModel = localCache.get(k);
        if (!cachedModel) {
          return "";
        } else {
          return `[${k}, ${cachedModel.map((cm) => {
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
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`fill cache with these models ${modelNames}`);
  }
  async function getModel(modelName: string) {
    /* istanbul ignore if  */
    if (showDBInteraction) {
      log(`get this model ${modelName}`);
    }
    const model = await loadModelFromDB(userID, modelName);
    if (model !== undefined) {
      /* istanbul ignore if  */
      if (showDBInteraction) {
        log(`got model for ${modelName}, go to add to cache`);
      }
      cachedModels.push({
        modelName: modelName,
        model: model,
        status: { isDirty: false },
      });
      /* istanbul ignore if  */
      if (showDBInteraction) {
        log(`got this model ${showObj(model)}`);
      }
    } else {
      /* istanbul ignore next */
      // don't let toxic models prevent all other models from loading
      //throw new Error(
      //  `model name ${modelName} from DB but no model present???`,
      //);
    }
    return;
  }
  // log('go to Promise.all(...)');
  const result = await Promise.all(
    modelNames.map((modelName) => {
      return getModel(modelName);
    }),
  );
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`result from Promise.all(...) is ${result}`);
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
  return cachedModels.map((cm) => {
    return cm.modelName;
  });
}

export async function loadModel(
  userID: string,
  modelName: string,
  validateCache = false,
) {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`loadModel for ${userID}, name = ${modelName}`);
  }
  if (localCache.get(userID) === undefined) {
    /* istanbul ignore if  */
    if (showDBInteraction) {
      log(`no data yet - go to fill cache`);
    }
    await fillCacheFromDB(userID);
  }

  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`filled cache - now go use it!`);
  }
  const cachedModels = localCache.get(userID);
  let cachedModel = undefined;
  if (cachedModels) {
    cachedModel = cachedModels.find((cm) => {
      return cm.modelName === modelName;
    });
  }
  if (cachedModel) {
    /* istanbul ignore if  */
    if (showDBInteraction) {
      log(`from cache load model ${modelName} for user ${userID}`);
    }
    if (validateCache && !cachedModel.status.isDirty) {
      const dbModel = await loadModelFromDB(userID, modelName);
      if (dbModel === undefined) {
        /* istanbul ignore next */
        throw new Error(`DBValidation error: cache has clean model 
          but DB has no model for ${modelName}`);
      } else {
        const diff = diffModels(
          dbModel,
          cachedModel.model,
          true,
          "this model",
          "cached model",
        );
        if (diff.length !== 0) {
          /* istanbul ignore next */
          throw new Error(`DBValidation error: ${diff} for ${modelName}`);
        }
      }
    }
    return cachedModel;
  } else {
    /* istanbul ignore if  */
    if (showDBInteraction) {
      log(`didn't find ${modelName} in cache`);
    }
    return undefined;
  }
}
async function saveModelToCache(
  userID: string,
  modelName: string,
  modelData: ModelData,
) {
  let cachedModels = localCache.get(userID);
  if (!cachedModels) {
    cachedModels = [];
    localCache.set(userID, cachedModels);
  }

  const cachedModel = {
    modelName: modelName,
    model: modelData,
    status: { isDirty: true },
  };
  const idx = cachedModels.findIndex((cm) => {
    return cm.modelName === modelName;
  });
  if (idx !== -1) {
    cachedModels.splice(idx, 1, cachedModel);
  } else {
    cachedModels.push(cachedModel);
  }
}

export async function ensureModel(userID: string, modelName: string) {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`ensure model ${modelName} for user ${userID}`);
  }
  let cachedModels = localCache.get(userID);
  if (!cachedModels) {
    cachedModels = [];
    localCache.set(userID, cachedModels);
  }

  const cachedModel = cachedModels.find((cm) => {
    return cm.modelName === modelName;
  });
  if (cachedModel) {
    /* istanbul ignore if  */
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
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`added to cache:`);
  }
  logCache();
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`ensured model ${modelName}`);
  }
  return;
}

export async function saveModelLSM(
  userID: string,
  modelName: string,
  model: ModelData,
) {
  // log(`save model ${showObj(model)}`);
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`save model ${modelName} for user ${userID}`);
    log(
      `saving : diff to undo is ${diffModels(
        model,
        model.undoModel,
        true,
        "this model",
        "undo model",
      )}`,
    );
  }
  saveModelToCache(userID, modelName, model);
  return true;
}

function updateItemList(itemList: Item[], newData: Item) {
  const idx = itemList.findIndex((i: Item) => {
    return i.NAME === newData.NAME;
  });
  if (idx !== -1) {
    itemList.splice(idx, 1);
  }
  itemList.push(newData);
}

async function submitItemLSM(
  inputItem: Item,
  itemList: Item[],
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
): Promise<CheckResult> {
  markForUndo(modelData);
  updateItemList(itemList, inputItem);

  if (doChecks) {
    const outcome = checkData(modelData);
    if (outcome.message !== "") {
      revertToUndoModel(modelData);
      return outcome;
    }
  }

  await saveModelLSM(userID, modelName, modelData);
  return {
    type: undefined,
    itemName: undefined,
    message: "",
  };
}

export async function submitExpenseLSM(
  expenseInput: Expense,
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
): Promise<CheckResult> {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`in submitExpense with input : ${showObj(expenseInput)}`);
  }
  return submitItemLSM(
    expenseInput,
    modelData.expenses,
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function submitIncomeLSM(
  incomeInput: Income,
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
): Promise<CheckResult> {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`in submitIncome with input : ${showObj(incomeInput)}`);
  }
  return submitItemLSM(
    incomeInput,
    modelData.incomes,
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function submitTriggerLSM(
  trigger: Trigger,
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`go to submitTriggers with input : ${showObj(trigger)}`);
  }
  return submitItemLSM(
    trigger,
    modelData.triggers,
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function submitAssetLSM(
  assetInput: Asset,
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
): Promise<CheckResult> {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`in submitAsset with input : ${showObj(assetInput)}`);
  }
  return submitItemLSM(
    assetInput,
    modelData.assets,
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function submitTransactionLSM(
  input: Transaction,
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`in submitTransaction with input : ${showObj(input)}`);
  }
  return submitItemLSM(
    input,
    modelData.transactions,
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function saveModelToDBLSM(
  userID: string,
  modelName: string,
  modelData: ModelData,
) {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`getDB go to save model ${modelName}`);
  }
  await saveModelLSM(userID, modelName, modelData);
  const cachedModels = localCache.get(userID);
  let status;
  if (cachedModels) {
    const cachedModel = cachedModels.find((cm) => {
      return cm.modelName === modelName;
    });
    if (cachedModel) {
      status = cachedModel.status;
    }
  }
  getDB().ensureModel(userID, modelName);
  const savedOK = await getDB().saveModel(userID, modelName, modelData);
  if (savedOK && status) {
    status.isDirty = false;
  }
  return savedOK;
}

export async function submitSettingLSM(
  input: Setting, // if HINT or TYPE are empty, leave pre-existing values
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`in submitSettingLSM with input : ${showObj(input)}`);
  }
  const idx = modelData.settings.find((i: Item) => {
    return i.NAME === input.NAME;
  });
  if (idx !== undefined) {
    if (input.HINT === "") {
      input.HINT = idx.HINT;
    }
    if (input.TYPE === "") {
      input.TYPE = idx.TYPE;
    }
  }
  return submitItemLSM(
    input,
    modelData.settings,
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function submitNewSettingLSM(
  setting: Setting,
  modelName: string,
  modelData: ModelData,
  doChecks: boolean,
  userID: string,
) {
  let type = adjustableType;
  const matchingSettings = modelData.settings.filter((s) => {
    return s.NAME === setting.NAME;
  });
  if (matchingSettings.length > 0) {
    type = matchingSettings[0].TYPE;
  }

  return submitSettingLSM(
    {
      NAME: setting.NAME,
      ERA: setting.ERA,
      VALUE: setting.VALUE,
      HINT: setting.HINT,
      TYPE: type,
    },
    modelName,
    modelData,
    doChecks,
    userID,
  );
}

export async function deleteModel(
  userID: string,
  modelName: string,
  expectModelPresent: boolean,
) {
  /* istanbul ignore if  */
  if (showDBInteraction) {
    log(`getDB delete model ${modelName}`);
  }
  const cachedModels = localCache.get(userID);
  if (cachedModels === undefined) {
    /* istanbul ignore if  */
    if (expectModelPresent) {
      log(`unexpected empty local cache - no models for ${userID}??`);
    }
  } else {
    const idx = cachedModels.findIndex((cm) => {
      return cm.modelName === modelName;
    });
    if (idx === -1) {
      /* istanbul ignore if  */
      if (expectModelPresent) {
        log(
          `unexpected local cache - no model for ${userID} and ${modelName}??`,
        );
      }
    } else {
      cachedModels.splice(idx, 1);
    }
  }
  return await getDB().deleteModel(userID, modelName);
}
