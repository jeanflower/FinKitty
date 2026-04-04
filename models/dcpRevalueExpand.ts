/**
 * Expand a DCP revalue generator into one `revalueAsset` transaction per sub-asset.
 *
 * Each transaction repeats the generator's VALUE in `TO_VALUE`. That string is the
 * target *sum* of all sub-assets after revaluation, not the target for that
 * transaction's `TO` alone. At evaluation time `applyRevalueDCPBatch` (evaluations)
 * groups those transactions by CATEGORY + DATE, reads T from the lexicographically first
 * NAME only, and sets each asset i to prev_i * T / S where S is the sum of
 * current sub-asset values (so proportions are preserved). Example: values
 * 1, 2, 3 and T = 3 gives 0.5, 1, 1.5.
 *
 * `TO_ABSOLUTE: true` satisfies `checkTransaction`; the batch handler applies
 * the scaled per-asset amounts, not a literal assignment of T to each asset.
 */
import {
  Generator,
  Transaction,
  DCGeneratorDetails,
  DCPRevalueDetails,
  ModelData,
} from "../types/interfaces";
import {
  crystallizedPension,
  dot,
  dcpRevalueBatchCategoryPrefix,
  generatorTypeDCPRevalue,
  pensionPrefix,
  revalue,
  revalueAsset,
  taxFree,
} from "../localization/stringConstants";

function dcpAccumulatedAssetName(pensionGenName: string): string {
  return pensionPrefix + pensionGenName;
}
function dcpTaxFreeAssetName(pensionGenName: string): string {
  return taxFree + pensionGenName;
}
function dcpTaxableAssetName(
  pensionGenName: string,
  liabilityLabel: string,
): string {
  return crystallizedPension + liabilityLabel + dot + pensionGenName;
}

/**
 * If `category` is from {@link expandDCPRevalueGeneratorToTransactions}, returns
 * the `NAME` prefix shared by every expanded transaction (`Revalue<genName> `).
 * Used so `applyRevalueDCPBatch` batches only DCP expansion transactions, not
 * unrelated `revalueAsset` transactions that might reuse the same category and date.
 */
export function expectedDCPRevalueTransactionNamePrefixFromCategory(
  category: string,
): string | undefined {
  if (!category.startsWith(dcpRevalueBatchCategoryPrefix)) {
    return undefined;
  }
  const genName = category.slice(dcpRevalueBatchCategoryPrefix.length);
  if (genName === "") {
    return undefined;
  }
  return `${revalue}${genName} `;
}

export function isDCPRevalueBatchTransaction(t: Transaction): boolean {
  return (
    t.TYPE === revalueAsset &&
    t.CATEGORY.startsWith(dcpRevalueBatchCategoryPrefix)
  );
}

/** Defined Contributions generator `NAME` (`DETAILS.FROM`) for this batch, if known. */
export function getDCPPensionNameForBatchTransaction(
  model: ModelData,
  t: Transaction,
): string | undefined {
  if (!isDCPRevalueBatchTransaction(t)) {
    return undefined;
  }
  const revalueGenName = t.CATEGORY.slice(dcpRevalueBatchCategoryPrefix.length);
  const revGen = model.generators.find(
    (g) => g.NAME === revalueGenName && g.TYPE === generatorTypeDCPRevalue,
  );
  if (revGen === undefined) {
    return undefined;
  }
  return (revGen.DETAILS as DCPRevalueDetails).FROM;
}

/** One array per batch (same CATEGORY + DATE). */
export function groupDCPRevalueBatchMemberGroups(
  transactions: Transaction[],
): Transaction[][] {
  const batchMembers = transactions.filter(isDCPRevalueBatchTransaction);
  const byKey = new Map<string, Transaction[]>();
  for (const tx of batchMembers) {
    const key = `${tx.CATEGORY}\0${tx.DATE}`;
    let g = byKey.get(key);
    if (g === undefined) {
      g = [];
      byKey.set(key, g);
    }
    g.push(tx);
  }
  return [...byKey.values()].map((members) =>
    [...members].sort((a, b) => a.NAME.localeCompare(b.NAME)),
  );
}

export function getDCPPensionSubAssetNames(dcpGen: Generator): string[] {
  const details = dcpGen.DETAILS as DCGeneratorDetails;
  const from = dcpGen.NAME;
  const names = [
    dcpAccumulatedAssetName(from),
    dcpTaxFreeAssetName(from),
    dcpTaxableAssetName(from, details.TAX_LIABILITY),
  ];
  if (details.TRANSFER_TO !== "") {
    names.push(dcpTaxableAssetName(from, details.TRANSFER_TO));
  }
  return names;
}

/**
 * How many `revalueAsset` transactions {@link expandDCPRevalueGeneratorToTransactions}
 * emits for this batch `CATEGORY` (today 3 without pension transfer, 4 with `TRANSFER_TO`).
 * `undefined` if `category` does not correspond to a present DCP revalue generator and DC pair.
 */
export function expectedDCPRevalueBatchTransactionCount(
  model: ModelData,
  category: string,
): number | undefined {
  if (!category.startsWith(dcpRevalueBatchCategoryPrefix)) {
    return undefined;
  }
  const revalueGenName = category.slice(dcpRevalueBatchCategoryPrefix.length);
  if (revalueGenName === "") {
    return undefined;
  }
  const revGen = model.generators.find(
    (g) => g.NAME === revalueGenName && g.TYPE === generatorTypeDCPRevalue,
  );
  if (revGen === undefined) {
    return undefined;
  }
  const details = revGen.DETAILS as DCPRevalueDetails;
  const dcpGen = model.generators.find(
    (gen) => gen.TYPE === "Defined Contributions" && gen.NAME === details.FROM,
  );
  if (dcpGen === undefined) {
    return undefined;
  }
  return getDCPPensionSubAssetNames(dcpGen).length;
}

export function expandDCPRevalueGeneratorToTransactions(
  g: Generator,
  model: ModelData,
): Transaction[] {
  if (g.TYPE !== generatorTypeDCPRevalue) {
    throw new Error("expandDCPRevalueGeneratorToTransactions: wrong TYPE");
  }
  const details = g.DETAILS as DCPRevalueDetails;
  const dcpGen = model.generators.find(
    (gen) => gen.TYPE === "Defined Contributions" && gen.NAME === details.FROM,
  );
  if (dcpGen === undefined) {
    return [];
  }
  const assetNames = getDCPPensionSubAssetNames(dcpGen);
  const category = `${dcpRevalueBatchCategoryPrefix}${g.NAME}`;
  const txs: Transaction[] = [];
  for (const assetName of assetNames) {
    // Same pension total T on every transaction; batch evaluation scales per asset.
    txs.push({
      NAME: `${revalue}${g.NAME} ${assetName}`,
      ERA: g.ERA,
      FROM: "",
      FROM_ABSOLUTE: false,
      FROM_VALUE: "0.0",
      TO: assetName,
      TO_ABSOLUTE: true,
      TO_VALUE: details.VALUE,
      DATE: details.DATE,
      STOP_DATE: "",
      RECURRENCE: "",
      CATEGORY: category,
      TYPE: revalueAsset,
    });
  }
  return txs;
}
