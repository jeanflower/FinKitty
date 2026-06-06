# Expression symmetry probe

Property-based regression checks for numeric expression parsing and evaluation.
When enabled, every algo test that calls `getTestEvaluations` runs these checks automatically.

**Implementation:** `tests/algoTests/expressionProbe.ts` (guard IDs `G-xx` in code comments)  
**Wiring:** `tests/algoTests/algoTestUtils.ts` (`maybeAssertZeroIdentitySymmetry`)  
**Unit tests:** `tests/algoTests/expressionSymmetry.test.ts`

**Last updated:** 2026-06-06 — **PARKED:** automatic symmetry off by default.

**Suite:** 427/427 algo tests with symmetry enabled (`npm run test:algo:symmetry`); vanilla `npm run test:algo` skips automatic checks.

---

## Parked (2026-06-06)

Automatic symmetry on every `getTestEvaluations` is **off** (`EXPRESSION_SYMMETRY_AUTO_CHECK_PARKED = true` in `expressionProbe.ts`). Production fixes from this work (`cpiInitialValue`, identity wraps, alias checks, etc.) **remain active**.

| To run | Command |
|--------|---------|
| Vanilla algo tests | `npm run test:algo` |
| Algo tests **with** symmetry | `npm run test:algo:symmetry` |
| Full CI suite | `npm run test:ci` |

To unpark: set `EXPRESSION_SYMMETRY_AUTO_CHECK_PARKED = false`, or use `FINKITTY_EXPR_SYMMETRY_ENABLE=1`.

---

## How it works

On each `getTestEvaluations` call:

1. Inject probe settings `Zero=0` and `One=1` (skipped if the model already defines those names).
2. Evaluate a **baseline** with probe settings present (fields unchanged).
3. Re-evaluate the same model **12 times**, applying one transform per run.
4. Assert every baseline evaluation row matches the probed run at the same name+date.
   Extra rows in the probed run are allowed **only** for settings named `Zero` or `One`.

Recursion is prevented via `symmetryCheckDepth`; results are cached per model JSON.

**Probe guards do not block user model edits** — they only skip wrapping during symmetry checks. Production validation lives in `models/checks.ts`.

### Environment controls

| Variable | Effect |
|----------|--------|
| *(default, parked)* | **No** automatic symmetry on algo tests |
| `FINKITTY_EXPR_SYMMETRY_ENABLE=1` | Enable automatic symmetry (or `npm run test:algo:symmetry`) |
| `FINKITTY_EXPR_SYMMETRY_DISABLE=1` | Force off even when unparked |
| `FINKITTY_EXPR_PROBE=<transform>` | Apply one transform to the test run itself (stress mode); disables automatic symmetry for that run |

### Commands

```bash
npm run test:algo
npm run test:algo:symmetry
FINKITTY_EXPR_SYMMETRY_ENABLE=1 npm run test:algo
FINKITTY_EXPR_PROBE=prefixZero npm run test:algo
```

---

## The 12 transforms

### Zero family (9) — evaluations should be unchanged

| Transform | `68` → |
|-----------|--------|
| `suffixZero` | `68+Zero` |
| `prefixZero` | `Zero+68` |
| `sandwichZero` | `Zero+68+Zero` |
| `suffixZeroMinus` | `68-Zero` |
| `sandwichZeroPlusMinus` | `Zero+68-Zero` |
| `suffixZeroPlusMinus` | `68+Zero-Zero` |
| `suffixDoubleZero` | `68+Zero+Zero` |
| `prefixDoubleZero` | `Zero+Zero+68` |
| `interleaveZero` | `A+Zero+700+Zero+A` |

### One family (3) — identity when `One=1`

| Transform | `68` → |
|-----------|--------|
| `suffixOne` | `68One` |
| `prefixZeroSuffixOne` | `Zero+68One` |
| `interleaveOneOnNumbers` | `A+700One+A` |

**Never probed:** `2xOne` and similar — not identity wraps.

---

## Coverage matrix (field × probes)

Legend: **Z** = all 9 Zero transforms · **O** = all 3 One transforms · **Z\*** / **O\*** = with field guards · **—** = not probed · **Oʳ** = One via `interleaveOneOnNumbers` only on expressions/scaled

| Field | Z | O | Status | Notes |
|-------|---|---|--------|-------|
| Income `VALUE` | Z | O | Done | G-00 only |
| Expense `VALUE` | Z | O | Done | G-00 only |
| Transaction `TO_VALUE` | Z\* | O\* | Done | G-00, G-40, G-41 |
| Transaction `FROM_VALUE` | — | O\* | Partial | G-42: `suffixOne` only; Zero family deferred |
| Asset `VALUE` | Z\* | O\* | Done | G-10–G-14 |
| Asset `PURCHASE_PRICE` | Z\* | O\* | Done | G-20–G-23, CGT only |
| Adjustable setting `VALUE` | Z\* | O\* | Done | G-30–G-36 |
| `GROWTH` | — | — | Not started | Roadmap |
| `QUANTITY` | — | — | Not started | Roadmap |
| Income/expense `START`/`END`/`VALUE_SET` | — | — | Not started | Roadmap |
| Transaction `DATE` | — | — | Not started | — |
| View / const settings | — | — | N/A | G-30, G-33 |

---

## Guard reference

Each guard is implemented in `expressionProbe.ts` (search for the `G-xx` comment). Guards are **probe-only** unless noted.

| ID | Applies to | Condition (skip probing when…) | Rationale |
|----|------------|--------------------------------|-----------|
| **G-00** | All fields via `shouldTransformValue` | Value is empty | Nothing to wrap |
| **G-01** | All fields | Transform is One-family and value is not a plain number | `68One` / `Zero+68One` require plain numerics |
| **G-02** | All fields | `interleaveZero` and value has no `+`/`-` expression | Nothing to interleave |
| **G-03** | All fields | `interleaveOneOnNumbers` would not change the string | Avoid no-op transforms |
| **G-10** | Asset `VALUE` | Bare setting alias (`ShareVal`, `mini`) or word without numeric part | Unit price lives in setting; asset field is symbolic |
| **G-11** | Asset `VALUE` | Plain numeric and value &lt; 0 | Negative literals excluded |
| **G-12** | Asset `VALUE` | Plain numeric and numeric `GROWTH` ≠ 0 | Growth path needs literal start value |
| **G-13** | Asset `VALUE` | `GROWTH` is a setting name (e.g. `shareGrowth`) | Symbolic growth chain |
| **G-14** | Asset `VALUE` | Plain numeric + zero growth and transform is Zero-family | Literal kept for growth; **One only** on plain zero-growth numerics |
| **G-20** | `PURCHASE_PRICE` | Asset liability does not include CGT | Purchase-price tracking is CGT-specific |
| **G-21** | `PURCHASE_PRICE` | Empty or `0` / `0.0` | No purchase basis |
| **G-22** | `PURCHASE_PRICE` | Bare setting alias (`SharePurchasePrice`) | Price lives in adjustable setting |
| **G-23** | `PURCHASE_PRICE` | Scaled/word value and One transform other than `interleaveOneOnNumbers` | Avoid `50000One` on whole alias field |
| **G-30** | Setting `VALUE` | `TYPE` is view | Dates/chart config, not economic values |
| **G-31** | Setting `VALUE` | Name is `Zero` or `One` | Injected probe constants |
| **G-32** | Setting `VALUE` | Name is `cpi` | **Engine** now resolves CPI via `cpiInitialValue()` (`evaluations.ts`), but wrapping `cpi` still perturbs `generateMoments` scheduling (e.g. missing `ShareVal` rows). Probe skip retained until scheduling fix (roadmap). |
| **G-33** | Setting `VALUE` | `TYPE` is not adjustable | Const/custom formula settings |
| **G-34** | Setting `VALUE` | Value is scaled chain (`50USD`) or bare alias | Dependency / resolution chains |
| **G-35** | Setting `VALUE` | `isReferencedInModelNumericFields(name)` | Referenced settings must not be rewritten (scheduling, optimizer, linked assets) |
| **G-36** | Setting `VALUE` | Optimizer control quartet present (`variable`, `variableLow`, `variableHigh`, `variableCount`) | Optimizer regression if probed |
| **G-40** | `TO_VALUE`, `FROM_VALUE` | Quantised setting-alias **quantity operand** (see below) | Plain number is unit count, not value transfer |
| **G-41** | `TO_VALUE` only | Proportional + plain numeric + prefix-Zero family (`prefixZero`, `sandwichZero`, `sandwichZeroPlusMinus`, `prefixDoubleZero`) | `generateMoments` uses `TO_VALUE.includes(settingName)`; `Zero+1.0` falsely links `Zero` setting |
| **G-42** | `FROM_VALUE` | Transform is not `suffixOne` | Zero family on `FROM_VALUE` breaks many models (eval rows missing); revisit after scheduling fix. One: plain numeric + G-40 only. G-41 **not** applied to `FROM` yet. |

### G-40 detail (quantised setting-alias quantity operand)

Skip when **all** of:

1. Transaction is **not** a revalue (`revalueAsset`, `revalueSetting`, `revalueInc`, `revalueExp`, `revalueDebt`, or `NAME` starts with `Revalue`).
2. Linked asset (`TO` or `FROM`) has **non-empty `QUANTITY`**.
3. Linked asset `VALUE` is a **bare setting alias** (`ShareVal`, not `50One` or `2x`).
4. `TO_VALUE` / `FROM_VALUE` is a plain number or `+`/`-` expression.

**Still probed:** revalue unit-price updates, alias assets without `QUANTITY`, scaled terms (`2x`).

**Example:** Buy `TO_VALUE: "100"` → `Shrs` with `VALUE: ShareVal`, `QUANTITY: "100"` = buy 100 shares (skipped). `revalueAsset` `TO_VALUE: "50"` on same asset = unit price (probed).

---

## Eligibility by context (summary)

### Income / expense `VALUE`

All 12 transforms subject to G-00–G-03 only.

### Transaction `TO_VALUE`

All 12 transforms subject to G-00–G-03, G-40, G-41.

### Transaction `FROM_VALUE`

`suffixOne` only (G-42), subject to G-40. Zero family not enabled.

### Asset `VALUE`

- **Zero:** expressions, scaled (`2x`, `mini`); not bare aliases; not plain numerics (G-14).
- **One:** plain zero-growth numerics; `interleaveOneOnNumbers` on chains.

### Asset `PURCHASE_PRICE`

CGT assets only (G-20). Plain numerics: all Zero + One. Expressions/scaled: Zero + Oʳ.

### Adjustable setting `VALUE`

Plain numerics and `+`/`-` expressions only, subject to G-30–G-36.

---

## Production code touched for probe support

| Area | File | Purpose |
|------|------|---------|
| CPI expression resolution | `models/evaluations.ts` — `cpiInitialValue()` | `Zero+0`, `0One` resolve correctly at eval start |
| Identity wrap coercion at asset start | `models/evaluations.ts` — `assetStartValueForMoment()` | `68One`, `Zero+68One` → numeric |
| CGT purchase price at start | `models/evaluations.ts` — `logPurchaseValues()` | Uses `assetStartValueForMoment` |
| Asset value string logging | `models/evaluations.ts` — `logAssetValueString()` | `number+suffix` paths |
| Bare alias vs scaled ref | `utils/stringUtils.ts` | `valueIsPlainSettingAlias()`, `fieldReferencesSettingName()` |
| CPI check for resolvable values | `models/checks.ts` | Allow `0One`-style values where resolvable |

---

## Known limitations

1. **Chart/report stress mode** — symmetry compares evaluations only; charts may use the unprobed model.
2. **`cpi` probe skip (G-32)** — engine parses expressions; probe still skips until `generateMoments` scheduling is fixed.
3. **`generateMoments` `.includes()`** — false setting↔transaction links when probe wraps values with `Zero`.
4. **`FROM_VALUE` Zero shapes (G-42)** — only `suffixOne` today; full Zero family caused widespread eval row loss.
5. **Fields not in matrix** — `GROWTH`, `QUANTITY`, date fields not yet probed.

---

## Roadmap

- [x] Quantised setting-alias guard tightened (quantity + revalue exception)
- [x] Guard ID catalog and coverage matrix (this doc)
- [x] `cpiInitialValue()` in evaluation engine
- [ ] **`generateMoments` scheduling fix** — `fieldReferencesSettingName` for `TO_VALUE`/`FROM_VALUE` (narrow); unblocks G-32 and G-41 reduction
- [ ] **`FROM_VALUE` Zero family** — after scheduling fix; extend G-42
- [ ] **Widen contexts:** `GROWTH` as setting name, `QUANTITY`, income/expense `START`/`END`/`VALUE_SET`
- [ ] **Chart symmetry** — optional baseline compare under probe

---

## Maintaining this document

Update when changing `expressionProbe.ts` guards, transforms, or suite count:

1. **Last updated** line and **Suite** count
2. **Coverage matrix** status column
3. **Guard reference** table (add row per new `G-xx`)
4. **Roadmap** checkboxes
5. **Production code touched** if evaluation/check code changes

Keep the file-header comment in `expressionProbe.ts` pointing here.
