import { separator, growth, revalue } from "../localization/stringConstants";
import { ItemCategory, ModelData } from "../types/interfaces";
import { makeSourceForFromChange } from "./evaluations";


function getCategoryFromItems(name: string, items: ItemCategory[]) {
  const found = items.find(i => i.NAME === name);
  if (found !== undefined) {
    if (found.CATEGORY.length > 0) {
      return found.CATEGORY;
    } else {
      return name;
    }
  }
  return undefined;
}

function getCategorySub(name: string, model: ModelData) {
  // log(`look for category for ${name}`);
  let category: string | undefined = getCategoryFromItems(name, model.incomes);
  if (category === undefined) {
    category = getCategoryFromItems(name, model.expenses);
  }
  if (category === undefined) {
    category = getCategoryFromItems(name, model.assets);
  }
  if (category === undefined) {
    category = getCategoryFromItems(name, model.transactions);
  }
  const foundTransaction = model.transactions.find(i => {
    const source1 = makeSourceForFromChange(i);
    if (source1 === name) {
      return true;
    }
    return false;
  });
  if (foundTransaction !== undefined) {
    if (foundTransaction.CATEGORY.length > 0) {
      // log(`returning transaction ${category}`);
      return foundTransaction.CATEGORY;
    }
    // log(`no transaction category`);
    return name;
  }
  if (category === undefined) {
    // log(`no category`);
    return name;
  }
  // log(`returning ${category}`);
  return category;
}

//let numCacheHits = 0;
//let numComputed = 0;
export function getCategory(
  name: string,
  cache: Map<string, string>,
  model: ModelData,
) {
  const cachedResult = cache.get(name);
  if (cachedResult !== undefined) {
    //numCacheHits = numCacheHits + 1;
    //log(`numComputed = ${numComputed}, numCacheHits = ${numCacheHits}`);
    return cachedResult;
  }
  //numComputed = numComputed + 1;
  //log(`numComputed = ${numComputed}, numCacheHits = ${numCacheHits}`);
  // log(`get category for ${name}`);
  const words = name.split(separator);
  if (words.length === 0) {
    cache.set(name, '');
    return '';
  }
  const firstPart = words[0];
  const firstPartCat = getCategorySub(firstPart, model);
  if (words.length === 1) {
    if (firstPartCat !== firstPart) {
      cache.set(name, firstPartCat);
      return firstPartCat;
    }
  }
  // maybe use second part? for growth or revalue
  if (words.length > 1 && (firstPart === growth || firstPart === revalue)) {
    const secondPart = words[1];
    const secondPartCat = getCategorySub(secondPart, model);
    if (secondPartCat !== secondPart) {
      const cat = firstPart + separator + secondPartCat;
      cache.set(name, cat);
      return cat;
    }
  }
  // maybe use second part? for deltas
  if (words.length > 1) {
    const secondPart = words[1];
    const secondPartCat = getCategorySub(secondPart, model);
    const cat = firstPartCat + separator + secondPartCat;
    cache.set(name, cat);
    return cat;
  }
  // log(`no category for ${name}`);
  cache.set(name, name);
  return name;
}