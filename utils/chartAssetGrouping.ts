/**
 * Collapses multiple physical {@link Asset} names onto one chart filter key
 * (show/hide buttons, category dependencies, series visibility).
 *
 * Keep this aligned with generator naming in `models/evaluations.ts`:
 * - Defined Contributions: several prefixed assets share one logical pension;
 *   handled by prefix stripping in {@link getNameForChart} (see viewUtils).
 * - Recurrent bond generators: each instance is
 *   `generatorName + mmmyy + generatedRecurrence + year`; strip that suffix so
 *   all instances share the generator name as the filter key.
 *
 * When adding another “one generator → many assets” product, add its rule
 * here (or delegate from here) so chart behaviour stays consistent.
 */

import { generatedRecurrence } from "../localization/stringConstants";

function escapeRegExpLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Suffix appended in `processBondGenerators` for each recurrent instance. */
const RECURRENT_BOND_INSTANCE_SUFFIX = new RegExp(
  `[a-zA-Z]{3}\\d{2}${escapeRegExpLiteral(generatedRecurrence)}\\d+$`,
);

/**
 * If `name` is a recurrent bond instance asset name, returns the bond
 * generator's `NAME`; otherwise returns `name` unchanged.
 */
export function stripRecurrentBondInstanceSuffix(name: string): string {
  if (!name.includes(generatedRecurrence)) {
    return name;
  }
  const stripped = name.replace(RECURRENT_BOND_INSTANCE_SUFFIX, "");
  return stripped.length > 0 ? stripped : name;
}
