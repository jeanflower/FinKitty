import { ModelData } from "../types/interfaces";

export interface DbInterface {
  getModelNames(userID: string): Promise<string[]>;
  loadModel(
    userID: string, 
    modelName: string,
  ): Promise<ModelData>;
  ensureModel(userID: string, modelName: string): Promise<void>;
  saveModel(
    userID: string,
    modelName: string,
    model: ModelData,
  ): Promise<boolean>;
  deleteModel(userID: string, modelName: string): Promise<void>;
}
