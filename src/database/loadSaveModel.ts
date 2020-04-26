import { DbExpense, DbIncome, DbTrigger, DbAsset, DbTransaction, DbSetting, DbItem, DbModelData } from "../types/interfaces";

import { log, printDebug, showObj } from "../utils";

import { getDB } from "./database";

import { modelName } from "../App";

import { custom } from "../localization/stringConstants";

const showDBInteraction = false;

export async function getModelNames(userID: string){
  if(showDBInteraction){
    log(`get model names for user ${userID}`)
  }
  let modelNames: string[] = [];
  try {
    modelNames = await getDB().getModelNames(userID);
  } catch (error) {
    alert(`error contacting database ${error}`);
  }
  if(showDBInteraction){
    log(`getModelNames returning ${modelNames}`)
  }
  return modelNames;
}

export async function loadModel(
  userID: string,
  modelName: string,
){
  if(showDBInteraction){
    log(`load model for user ${userID}`)
  }
  let model: DbModelData|undefined = undefined;
  try {
    model = await getDB().loadModel(userID, modelName);
  } catch (err) {
    alert(`Cannot load ${modelName}; consider 'Force delete'?`);
  }
  if(showDBInteraction){
    log(`loaded model ${modelName}`)
  }
  return model;
}

export async function ensureModel(
  userID: string,
  modelName: string,
){
  if(showDBInteraction){
    log(`ensure model for user ${userID}`)
  }
  const result = await getDB().ensureModel(userID, modelName);
  if(showDBInteraction){
    log(`loaded model ${modelName}`)
  }
  return result;
}

export async function saveModelLSM(
  modelName: string,
  model: DbModelData,
  userID: string,
){
  if(showDBInteraction){
    log(`save model for user ${userID}`)
  }
  const result = getDB().saveModel( userID, modelName, model );
  if(showDBInteraction){
    log(`saved model ${modelName}`)
  }
  return result;
}

function updateItemList(
  itemList: DbItem[], 
  newData: DbItem,
) {
  const idx = itemList.findIndex((i: DbItem) => {
    return i.NAME === newData.NAME;
  });
  if (idx !== -1) {
    itemList.splice(idx, 1);
  }
  itemList.push(newData);
}

export async function submitExpenseLSM(
  expenseInput: DbExpense,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitExpense with input : ${showObj(expenseInput)}`);
  }
  updateItemList(modelData.expenses, expenseInput);
  await getDB().saveModel(
    userID,
    modelName,
    modelData,
  );
  if(showDBInteraction){
    log(`saved model ${modelName}`)
  }
}

export async function submitIncomeLSM(
  incomeInput: DbIncome,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitIncome with input : ${showObj(incomeInput)}`);
  }
  updateItemList(modelData.incomes, incomeInput);
  await getDB().saveModel(
    userID,
    modelName,
    modelData,
  );
}

export async function submitTriggerLSM(
  trigger: DbTrigger,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`go to submitTriggers with input : ${showObj(trigger)}`);
  }
  updateItemList(modelData.triggers, trigger);
  await getDB().saveModel(
    userID,
    modelName,
    modelData,
  );
}

export async function submitNewTriggerLSM(
  name: string,
  modelData: DbModelData,
  userID: string,
) {
  submitTriggerLSM(
    {
      NAME: name,
      DATE: new Date(),
    },
    modelData,
    userID,
  );
}

export async function submitAssetLSM(
  assetInput: DbAsset,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitAsset with input : ${showObj(assetInput)}`);
  }
  updateItemList(modelData.assets, assetInput);
  await getDB().saveModel(
    userID,
    modelName,
    modelData,
  );
}

export async function submitNewAssetLSM(
  name: string,
  modelData: DbModelData,
  userID: string,
  ) {
  submitAssetLSM(
    {
      NAME: name,
      CATEGORY: '',
      START: '1 January 2018',
      VALUE: '0',
      QUANTITY: '',
      GROWTH: '0',
      CPI_IMMUNE: false,
      CAN_BE_NEGATIVE: false,
      IS_A_DEBT: false,
      LIABILITY: '',
      PURCHASE_PRICE: '0',
    },
    modelData, 
    userID,
  );
}

export async function submitTransactionLSM(
  input: DbTransaction,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitTransaction with input : ${showObj(input)}`);
  }
  updateItemList(modelData.transactions, input);
  await getDB().saveModel(
    userID,
    modelName,
    modelData,
  );
}

export async function submitNewTransactionLSM(
  name: string,
  modelData: DbModelData,
  userID: string,
) {
  submitTransactionLSM(
    {
      NAME: name,
      CATEGORY: '',
      FROM: '',
      TO: '',
      FROM_VALUE: '0',
      TO_VALUE: '0',
      FROM_ABSOLUTE: true,
      TO_ABSOLUTE: true,
      DATE: '1 January 2018',
      STOP_DATE: '1 January 2018',
      RECURRENCE: '',
      TYPE: custom,
    },
    modelData,
    userID,
  );
}

export async function submitSettingLSM(
  input: DbSetting,
  modelData: DbModelData,
  userID: string,
) {
  if (printDebug()) {
    log(`in submitSetting with input : ${showObj(input)}`);
  }
  updateItemList(modelData.settings, input);
  await getDB().saveModel(
    userID,
    modelName,
    modelData,
  );
}

export async function submitNewSettingLSM(
  name: string,
  modelData: DbModelData,
  userID: string,
  ) {
  submitSettingLSM(
    {
      NAME: name,
      VALUE: '',
      HINT: '',
    },
    modelData,
    userID,
  );
}

export async function deleteModel(
  userID: string,
  modelName: string,
){
  return await getDB().deleteModel(userID, modelName);
}