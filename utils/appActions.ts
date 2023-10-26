import { saveModelLSM } from "../database/loadSaveModel";
import {
  attemptRenameLong,
  markForUndo,
  revertToUndoModel,
} from "../models/modelUtils";
import { DeleteResult, Item, ModelData } from "../types/interfaces";
import { getUserID } from "./user";
import { checkData } from "../models/checks";
import { Context, log } from "./utils";

export async function attemptRename(
  model: ModelData,
  doChecks: boolean,
  old: string,
  replacement: string,
  showAlert: (message: string) => void,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
): Promise<string> {
  const message = attemptRenameLong(model, doChecks, old, replacement);
  // log(`message from attemptRenameLong is ${message}`);
  if (message === "") {
    // log(`message is empty, go to refreshData`);
    await saveModelLSM(getUserID(), model.name, model);
    refreshData(
      true, // refreshModel
      true, // refreshChart
      28, //sourceID
    );
  } else {
    showAlert(message);
  }
  return message;
}

function checkItemsFoundInList(
  names: string[],
  itemList: Item[],
): string | undefined {
  let nameFound = true;
  let nameIndex = 0;
  while (nameIndex < names.length && nameFound) {
    // dependentsFound = false;
    nameFound = false;
    const name = names[nameIndex];
    // we expect this to be a name of something
    const idx = itemList.findIndex((i: Item) => {
      return i.NAME === name;
    });
    if (idx === -1) {
      nameFound = false;
      break;
    }

    nameFound = true;
    nameIndex = nameIndex + 1;
  }
  if (!nameFound) {
    return names[nameIndex];
  } else {
    return undefined;
  }
}

function getListFromModel(type: Context, model: ModelData): Item[] {
  let result: Item[] = [];

  if (type === Context.Asset) {
    result = model.assets;
  } else if (type === Context.Expense) {
    result = model.expenses;
  } else if (type === Context.Income) {
    result = model.incomes;
  } else if (type === Context.Transaction) {
    result = model.transactions;
  } else if (type === Context.Trigger) {
    result = model.triggers;
  } else if (type === Context.Setting) {
    result = model.settings;
  } else {
    log("Error : unexpected outcome.type");
  }
  return result;
}

// assumes that the names are present in the itemList
async function deleteItemsRecursive(
  names: string[],
  itemList: Item[],
  model: ModelData,
  doChecks: boolean,
  allowRecursion: boolean,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
): Promise<DeleteResult> {
  names.map((name) => {
    const idx = itemList.findIndex((i: Item) => {
      return i.NAME === name;
    });
    // remove from the given list
    if (idx !== -1) {
      // log(`before delete ${name}, itemList = ${showObj(itemList)}`);
      itemList.splice(idx, 1);
      // log(`after delete ${name}, itemList = ${showObj(itemList)}`);
    } else {
      throw new Error(`we didn't find ${name}, should have noticed earlier`);
    }
  });

  if (!doChecks) {
    return {
      itemsDeleted: names,
      message: "",
    };
  }

  // is the model still good? do we need to delete recursively?
  let itemsDeleted: string[] = names;
  let message = "";
  let checksClean = false;
  while (!checksClean) {
    const outcome = checkData(model);
    checksClean = outcome.message === "";
    if (checksClean) {
      break;
    }
    if (!allowRecursion) {
      // log(`delete makes bad model : recursion blocked`);
      message = `edited  model fails checks :${outcome.message}', reverting`;
      break;
    }
    if (outcome.itemName === undefined || outcome.type === undefined) {
      // log(`delete makes bad model : no obvious item to delete next`);
      message = `edited  model fails checks :${outcome.message}', reverting`;
      break;
    }
    // log(`try removing ${outcome.itemName}...`);
    const secondLevelResult: DeleteResult = await deleteItemsRecursive(
      [outcome.itemName],
      getListFromModel(outcome.type, model),
      model,
      doChecks,
      allowRecursion,
      refreshData,
    );
    if (secondLevelResult.message === "") {
      // log(`attempt to delete dependents - fails checks`);
      itemsDeleted = itemsDeleted.concat(secondLevelResult.itemsDeleted);
      continue;
    }
    log(`recursive delete makes bad model : stop`);
    message = `edited  model fails checks :${outcome.message}', reverting`;
  }
  if (checksClean) {
    return {
      itemsDeleted: itemsDeleted,
      message: "",
    };
  } else {
    return {
      itemsDeleted: [],
      message: message,
    };
  }
}

// returns '' for success and an error message
// if the deletion would cause a checker error
export async function deleteItemsFromModelInternal(
  names: string[],
  itemList: Item[],
  modelName: string,
  model: ModelData,
  doChecks: boolean,
  allowRecursion: boolean,
  showAlert: (message: string) => void,
  refreshData: (
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => Promise<void>,
): Promise<DeleteResult> {
  // log(`delete items ${names}`);
  //log(`before itemList ${itemList.map((i)=>{return i.NAME})}`);

  const missingName = checkItemsFoundInList(names, itemList);
  if (missingName !== undefined) {
    const response = `item not found for delete :${missingName}`;
    // log(`setState for delete item alert`);
    showAlert(response);
    return {
      itemsDeleted: [],
      message: `Item ${missingName} not found in model`,
    };
  }

  // If we are to delete something, there might be dependent
  // items.  We could just refuse to delete and let the customer
  // go and delete the dependenta manually, first.
  // What follows is an attempt to be more helpful...

  markForUndo(model);
  const response = await deleteItemsRecursive(
    names,
    itemList,
    model,
    doChecks,
    allowRecursion,
    refreshData,
  );

  if (response.message !== "") {
    revertToUndoModel(model);
    showAlert(response.message);
    return {
      itemsDeleted: [],
      message: response.message,
    };
  } else {
    await saveModelLSM(getUserID(), modelName, model);
    await refreshData(
      true, // refreshModel
      true, // refreshChart
      13, //sourceID
    );

    return {
      itemsDeleted: response.itemsDeleted,
      message: "",
    };
  }
}
