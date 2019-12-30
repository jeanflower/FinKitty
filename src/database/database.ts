import { DbModelData } from './../types/interfaces';
import { AWSDB } from './aws_db';

export interface dbInterface {
  getModelNames(userID: string): Promise<string[]>,
  loadModel(userID: string,modelName: string): Promise<DbModelData>,
  ensureModel(userID: string, modelName: string): any,
  saveModel(
    userID: string,
    modelName: string,
    model: DbModelData,
  ): any,
  deleteModel(userID: string, modelName: string): any,
}

export function cleanUp(modelFromJSON: any): DbModelData {
  return {
    ...modelFromJSON,
/*
    assets: modelFromJSON.assets.map((a: any) => {
      return {
        NAME: a['NAME'],
        CATEGORY: a['CATEGORY'],
        START: a['START'],
        VALUE: a['VALUE'],
        GROWTH: a['GROWTH'],
        CPI_IMMUNE: a['CPI_IMMUNE'],
        CAN_BE_NEGATIVE: a['CAN_BE_NEGATIVE'],
        LIABILITY: a['LIABILITY'],
        PURCHASE_PRICE: a['PURCHASE_PRICE'],
      };
    }),
*/
    triggers: modelFromJSON.triggers.map((t: any) => {
      return {
        NAME: t['NAME'],
        DATE: new Date(t['DATE']),
      };
    }),
    expenses: modelFromJSON.expenses.map((e: any) => {
      return {
        NAME: e['NAME'],
        CATEGORY: e['CATEGORY'],
        START: e['START'],
        END: e['END'],
        VALUE: e['VALUE'],
        VALUE_SET: e['VALUE_SET'],
        CPI_IMMUNE: e['CPI_IMMUNE'],
        GROWTH: e['GROWTH'],
      };
    }),
    incomes: modelFromJSON.incomes.map((i: any) => {
      return {
        NAME: i['NAME'],
        CATEGORY: i['CATEGORY'],
        START: i['START'],
        END: i['END'],
        VALUE: i['VALUE'],
        VALUE_SET: i['VALUE_SET'],
        CPI_IMMUNE: i['CPI_IMMUNE'],
        GROWTH: i['GROWTH'],
        LIABILITY: i['LIABILITY'],
      };
    }),
    settings: modelFromJSON.settings.map((i: any) => {
      return {
        NAME: i['NAME'],
        VALUE: i['VALUE'],
        HINT: i['HINT'],
      };
    }),
    transactions: modelFromJSON.transactions.map((t: any) => {
      return {
        NAME: t['NAME'],
        FROM: t['FROM'],
        FROM_ABSOLUTE: t['FROM_ABSOLUTE'],
        FROM_VALUE: t['FROM_VALUE'],
        TO: t['TO'],
        TO_ABSOLUTE: t['TO_ABSOLUTE'],
        TO_VALUE: t['TO_VALUE'],
        DATE: t['DATE'],
        STOP_DATE: t['STOP_DATE'],
        RECURRENCE: t['RECURRENCE'],
        CATEGORY: t['CATEGORY'],
      };
    }),
  };
}

const db = new AWSDB();

export function getDB(): dbInterface{
  return db;
}
