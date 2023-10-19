import { ModelData, Setting } from "../types/interfaces";
import { separator } from "../localization/stringConstants";
import { log, showObj } from "../utils/utils";


export function isAnIncome(name: string, model: ModelData) {
  return model.incomes.find((a) => a.NAME === name) !== undefined;
}

export function isAnExpense(name: string, model: ModelData) {
  return model.expenses.find((a) => a.NAME === name) !== undefined;
}

export function isASetting(name: string, model: ModelData) {
  return model.settings.find((s) => s.NAME === name) !== undefined;
}

function isAnAsset(name: string, model: ModelData) {
  return (
    model.assets.find((a) => a.NAME === name || a.CATEGORY === name) !==
    undefined
  );

}
export function isAnAssetOrAssets(name: string, model: ModelData) {
  const words = name.split(separator);
  let ok = true;
  words.forEach((word) => {
    if (!isAnAsset(word, model)) {
      ok = false;
    }
  });
  return ok;
}

export function isATransaction(name: string, model: ModelData) {
  return model.transactions.filter((t) => t.NAME === name).length > 0;
}

export function isSetting(input: string, settings: Setting[]) {
  const result = {
    value: '',
    numFound: 1,
  };
  const x = settings.filter((pr) => pr.NAME === input);
  if (x.length === 1) {
    // log(`got setting ${showObj(result)}`);
    result.value = x[0].VALUE;
  } else {
    result.numFound = x.length;
    /* istanbul ignore if */
    if (result.numFound > 1) {
      log(`Error: multiple settings: ${showObj(x)}`);
    }
  }
  return result;
}

export function isADebt(name: string, model: ModelData) {
  const matchingAsset = model.assets.find((a) => {
    return a.NAME === name;
  });
  /* istanbul ignore if */
  if (matchingAsset === undefined) {
    log(`Error: expect to be passed an asset name to isADebt`);
    return false;
  }
  return matchingAsset.IS_A_DEBT;
}

export function replaceCategoryWithAssetNames(
  words: string[],
  model: ModelData,
) {
  // log(`start replaceCategoryWithAssetNames with words = ${showObj(words)}`);
  let wordsNew: string[] = [];
  words.forEach((w) => {
    // log(`look at word "${w}" - is it a category?`);
    // if w is a category of one or more assets
    // then remove w from the list and
    // if the assets are not already on the list
    // then add the asset Names.
    const assetsWithCategory = model.assets.filter((a) => {
      return a.CATEGORY === w;
    });
    if (assetsWithCategory.length === 0) {
      wordsNew.push(w);
    } else {
      wordsNew = wordsNew.concat(
        assetsWithCategory.map((a) => {
          return a.NAME;
        }),
      );
    }
  });
  // log(`return from replaceCategoryWithAssetNames with wordsNew = ${showObj(wordsNew)}`);
  return wordsNew;
}

export function getSettings(
  settings: Setting[],
  key: string,
  fallbackVal: string,
  expectValue = true,
) {
  const searchResult = isSetting(key, settings);
  /* istanbul ignore else */
  if (searchResult.numFound === 1) {
    return searchResult.value;
  } else if (searchResult.numFound === 0) {
    /* istanbul ignore if */
    if (expectValue) {
      log(`Error: '${key}' value not found in settings list`);
      // throw new Error(`BUG!!! '${key}' value not found in settings list`);
    }
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    return fallbackVal;
  } else {
    log(`BUG!!! multiple '${key}' values found in settings list`);
    // log(`couldn't find ${key} in ${showObj(settings)}`);
    throw new Error(); // serious!! shows failure in browser!!
    //return fallbackVal;
  }
}

export function getVarVal(settings: Setting[]) {
  let varVal = 1.0;
  const varSetting = getSettings(settings, 'variable', 'missing', false);
  if (varSetting !== 'missing' && isNumberString(varSetting)) {
    const val = parseInt(varSetting);
    varVal = val;
  }
  return varVal;
}

const numberStringCache = new Map<string, boolean>();

// let numCachedResults = 0;
// let numComputedResults = 0;
export function isNumberString(input: string) {
  if (input === '' || input === undefined) {
    log(`Error: don't expect empty or undefined inputs to isNumberString`);
    return false;
  }
  const numberStringCacheResult = numberStringCache.get(input);
  if (numberStringCacheResult !== undefined) {
    // numCachedResults = numCachedResults + 1;
    // log(`cached = ${numCachedResults}, computed = ${numComputedResults}`);
    return numberStringCacheResult;
  }
  // numComputedResults = numComputedResults + 1;
  // log(`cached = ${numCachedResults}, computed = ${numComputedResults}`);

  const re = new RegExp('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$');
  const result = input.replace(re, '');
  const outcome = result === '';
  numberStringCache.set(input, outcome);
  return outcome;
}
