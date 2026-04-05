/**
 * Maps model **asset** names (`Asset.NAME`) to **chartAsset** names: the strings
 * used for chart show/hide buttons, category dependencies, and series visibility.
 * Several model assets may share one chartAsset (e.g. DCP sub-assets, recurrent bonds).
 *
 * Align rules with generator code in `models/evaluations.ts`:
 * - **Defined Contributions family** (`processDCPGenerators`, withdrawals, etc.):
 *   assets use prefixes such as {@link pensionPrefix}, {@link taxFree},
 *   {@link crystallizedPension}, … — collapse to the shared chartAsset name.
 * - **Recurrent bond generators** (`processBondGenerators`): each instance is
 *   `generatorName + mmmyy + generatedRecurrence + year`; strip that suffix so
 *   all instances share the generator name as the chartAsset.
 *
 * Use {@link chartAssetNameFromAssetName} as the single entry point;
 * {@link recurrentBondAssetNameToChartAssetName} is exposed for focused tests.
 */

import {
  crystallizedPension,
  dot,
  generatedRecurrence,
  moveTaxFreePart,
  pensionPrefix,
  pensionTransfer,
  taxFree,
  transferCrystallizedPension,
} from "../localization/stringConstants";

function escapeRegExpLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Suffix appended in `processBondGenerators` for each recurrent instance. */
const RECURRENT_BOND_INSTANCE_SUFFIX = new RegExp(
  `[a-zA-Z]{3}\\d{2}${escapeRegExpLiteral(generatedRecurrence)}\\d+$`,
);

/**
 * If `assetName` is a recurrent bond instance, returns the bond generator name
 * (the chartAsset); otherwise returns `assetName` unchanged.
 */
export function recurrentBondAssetNameToChartAssetName(assetName: string): string {
  if (!assetName.includes(generatedRecurrence)) {
    return assetName;
  }
  const stripped = assetName.replace(RECURRENT_BOND_INSTANCE_SUFFIX, "");
  return stripped.length > 0 ? stripped : assetName;
}

function isDcpFamilyAssetName(assetName: string): boolean {
  return (
    assetName.startsWith(pensionPrefix) ||
    assetName.startsWith(crystallizedPension) ||
    assetName.startsWith(taxFree) ||
    assetName.startsWith(pensionTransfer) ||
    assetName.startsWith(moveTaxFreePart) ||
    assetName.startsWith(transferCrystallizedPension)
  );
}

/**
 * Maps a DC / pension-family asset name to its chartAsset name. Caller must
 * ensure {@link isDcpFamilyAssetName} is true for `assetName`.
 */
function dcpFamilyAssetNameToChartAssetName(assetName: string): string {
  let remainder = assetName;
  let splitAtDot = false;
  if (assetName.startsWith(pensionPrefix)) {
    remainder = assetName.substring(pensionPrefix.length);
  } else if (assetName.startsWith(crystallizedPension)) {
    remainder = assetName.substring(crystallizedPension.length);
    splitAtDot = true;
  } else if (assetName.startsWith(taxFree)) {
    remainder = assetName.substring(taxFree.length);
    splitAtDot = true;
  } else if (assetName.startsWith(pensionTransfer)) {
    remainder = assetName.substring(pensionTransfer.length);
    splitAtDot = true;
  } else if (assetName.startsWith(moveTaxFreePart)) {
    remainder = assetName.substring(moveTaxFreePart.length);
    splitAtDot = true;
  } else if (assetName.startsWith(transferCrystallizedPension)) {
    remainder = assetName.substring(transferCrystallizedPension.length);
    splitAtDot = true;
  }
  if (splitAtDot) {
    const parts = remainder.split(dot);
    if (parts.length === 1) {
      remainder = parts[0];
    } else if (parts.length === 2) {
      remainder = parts[1];
    } else {
      throw new Error(
        `unexpected taxFree asset name ${assetName} is not of form penName or personName.penName`,
      );
    }
  }
  return remainder;
}

/**
 * ChartAsset name for a model asset: DCP-family assets use prefix rules;
 * everything else uses recurrent-bond suffix removal (no-op if not a generated
 * bond instance).
 */
export function chartAssetNameFromAssetName(assetName: string): string {
  if (isDcpFamilyAssetName(assetName)) {
    return dcpFamilyAssetNameToChartAssetName(assetName);
  }
  return recurrentBondAssetNameToChartAssetName(assetName);
}
