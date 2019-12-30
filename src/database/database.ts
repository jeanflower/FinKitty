import { DbModelData } from './../types/interfaces';
import { AWSDB } from './aws_db';

export interface DbInterface {
  getModelNames(userID: string): Promise<string[]>;
  loadModel(userID: string, modelName: string): Promise<DbModelData>;
  ensureModel(userID: string, modelName: string): any;
  saveModel(userID: string, modelName: string, model: DbModelData): any;
  deleteModel(userID: string, modelName: string): any;
}

// note JSON stringify and back for serialisation is OK but
// breaks dates (and functions too but we don't have these)
export function cleanUp(modelFromJSON: any): DbModelData {
  return {
    ...modelFromJSON,
    triggers: modelFromJSON.triggers.map((t: any) => {
      return {
        ...t,
        DATE: new Date(t['DATE']), // This is required!
      };
    }),
  };
}

const db = new AWSDB();

export function getDB(): DbInterface {
  return db;
}
