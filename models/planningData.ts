import { allItems, viewDetail, coarseDetail, chartViewType, chartReductions, expensesView, assetsView, fineDetail, bondMature, generatedRecurrence, chartVals, revalue, conditional, growth, roiStart } from "../localization/stringConstants";
import { Asset, AssetOrDebtVal, ChartData, DataForView, Evaluation, Expense, ExpenseVal, Income, IncomeVal, ModelData, ReportDatum, Setting, SettingVal, Transaction } from "../types/interfaces";
import { Context, FinKittyDate, log, showObj } from "../utils/utils";
import { getDefaultViewSettings } from "../utils/viewUtils";
import { makeBarData } from "../views/chartPages";
import { makeChartData } from "./charting";
import { getCategory } from "./category";
import { getEvaluationAnchorDate, getROI } from "./modelUtils";
import dateFormat from "dateformat";

export const ISA_COMBINED_ALLOWANCE = 40_000;
export const ISA_CATEGORY = "ISA";

export type IsaAllowanceRow = {
  TAX_YEAR: string;
  USED: string;
  UNUSED: string;
};

type PlanningEvalsBundle = {
  evaluations: Evaluation[];
  todaysAssetValues: Map<Asset, AssetOrDebtVal>;
  todaysDebtValues: Map<Asset, AssetOrDebtVal>;
  todaysIncomeValues: Map<Income, IncomeVal>;
  todaysExpenseValues: Map<Expense, ExpenseVal>;
  todaysSettingValues: Map<Setting, SettingVal>;
  reportData: ReportDatum[];
};

function getYearOfTaxYear(d: Date) {
  if (d.getMonth() > 3) {
    return d.getFullYear();
  }
  if (d.getMonth() < 3) {
    return d.getFullYear() - 1;
  }
  if (d.getDate() > 5) {
    return d.getFullYear();
  }
  return d.getFullYear() - 1;
}

function formatUKTaxYearLabel(startYearOfTaxYear: number): string {
  const y1Short = (startYearOfTaxYear + 1) % 100;
  const y1p = y1Short < 10 ? `0${y1Short}` : `${y1Short}`;
  return `${startYearOfTaxYear}/${y1p}`;
}

function taxYearsOverlappingRange(start: Date, end: Date): number[] {
  const years = new Set<number>();
  const cursor = new Date(start);
  cursor.setDate(1);
  while (cursor.getTime() <= end.getTime()) {
    years.add(getYearOfTaxYear(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  years.add(getYearOfTaxYear(start));
  years.add(getYearOfTaxYear(end));
  return Array.from(years).sort((a, b) => a - b);
}

function transactionSourceForTo(t: Transaction): string {
  let source = t.NAME;
  if (source.startsWith(conditional)) {
    source = source.substring(conditional.length);
  }
  return source;
}

function findTransactionByEvalSource(
  source: string,
  model: ModelData,
): Transaction | undefined {
  return model.transactions.find((t) => {
    return transactionSourceForTo(t) === source || t.NAME === source;
  });
}

function isIsaSubscription(
  evaln: Evaluation,
  isaAssetNames: Set<string>,
  model: ModelData,
): number {
  if (!isaAssetNames.has(evaln.name)) {
    return 0;
  }
  if (evaln.source === growth) {
    return 0;
  }
  const contribution = evaln.value - evaln.oldValue;
  if (contribution <= 0) {
    return 0;
  }
  const transaction = findTransactionByEvalSource(evaln.source, model);
  if (transaction === undefined) {
    return 0;
  }
  if (transaction.TO !== evaln.name) {
    return 0;
  }
  if (transaction.FROM !== "" && isaAssetNames.has(transaction.FROM)) {
    return 0;
  }
  return contribution;
}

/**
 * UK tax-year ISA subscription totals for the Planning page: all transactions
 * into ISA assets except transfers from other ISAs and growth.
 */
export function getIsaAllowanceTableData(
  model: ModelData,
  evals: PlanningEvalsBundle,
  combinedAllowance = ISA_COMBINED_ALLOWANCE,
): IsaAllowanceRow[] {
  const isaAssetNames = new Set(
    model.assets
      .filter((a) => !a.IS_A_DEBT && a.CATEGORY === ISA_CATEGORY)
      .map((a) => a.NAME),
  );
  if (isaAssetNames.size === 0) {
    return [];
  }

  const usedByTaxYear = new Map<number, number>();
  for (const evaln of evals.evaluations) {
    const amount = isIsaSubscription(evaln, isaAssetNames, model);
    if (amount <= 0) {
      continue;
    }
    const taxYear = getYearOfTaxYear(evaln.date.d);
    usedByTaxYear.set(taxYear, (usedByTaxYear.get(taxYear) ?? 0) + amount);
  }

  const viewRange = getROI(model);
  const taxYears = taxYearsOverlappingRange(viewRange.start.d, viewRange.end.d);
  for (const taxYear of usedByTaxYear.keys()) {
    if (!taxYears.includes(taxYear)) {
      taxYears.push(taxYear);
    }
  }
  taxYears.sort((a, b) => a - b);

  return taxYears.map((taxYear) => {
    const used = usedByTaxYear.get(taxYear) ?? 0;
    const unused = Math.max(0, combinedAllowance - used);
    return {
      TAX_YEAR: formatUKTaxYearLabel(taxYear),
      USED: `${used}`,
      UNUSED: `${unused}`,
    };
  });
}

log;
showObj;

export function getPlanningTableData(
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
  viewRangeStart?: Date,
){
  const tableData = [];
  const viewStartYear = viewRangeStart?.getFullYear();

  const planningExpenses = planningExpensesChartData.datasets;

  const basicExpenses = planningExpenses.find((pe) => {
    return pe.label === "Basic";
  });
  const leisureExpenses = planningExpenses.find((pe) => {
    return pe.label === "Leisure";
  });
  // Values come from the planning chart (evaluation-anchor ROI). When
  // viewRangeStart is set, row dates are filtered to the view start year onward.
  for (let idx = 0; idx < planningExpensesChartData.labels.length; idx++) {
    const date = planningExpensesChartData.labels[idx];
    const dateObj = new Date(date);
    if (viewStartYear !== undefined && dateObj.getFullYear() < viewStartYear) {
      continue;
    }
    //console.log(`Expect Leisure = ${gemData[1].label}`);
    let basic = 0;
    if (basicExpenses) {
      basic = basicExpenses.data[idx] ?? 0;
    }
    let leisure = 0;
    if (leisureExpenses) {
      leisure = leisureExpenses.data[idx] ?? 0;
    }

    const combined = basic + leisure;
    // console.log(`basic = ${basic}, leisure = ${leisure}`);

    let bondsReleaseFunds = 0;
    let pbBasic = 0;
    let pbLeisure = 0;
    if (idx > 0) {
      const bondsIdx = idx - 1; // show bond funds one year later
      planningAssetsChartData.datasets.forEach((pscd) => {
        // console.log(`pscd = ${showObj(pscd)}`);
        const bondVal = pscd.data[bondsIdx] ?? 0;
        if ( pscd.label === "PremiumBondsBasic") {
          pbBasic += bondVal;
        } else if ( pscd.label === "PremiumBondsLeisure") {
          pbLeisure += bondVal;
        } else if (!pscd["label"].includes('growth') && bondVal < 0) {
          // console.log(`pscd.data[bondsIdx] = ${bondVal}`);
          // console.log(`increase bondsReleaseFunds from ${bondsReleaseFunds} using ${-bondVal} to ${bondsReleaseFunds - bondVal}`);
          bondsReleaseFunds += -bondVal;
        }
      });
    }

    const dateObjBefore = new Date(dateObj);
    dateObjBefore.setFullYear(dateObj.getFullYear() - 1);

    const reportsInYear = reportData.filter((d) => {
      const ddate = d.date;
      const ddateObj = new Date(ddate);
      const result =
        ddateObj.getTime() >= dateObjBefore.getTime() &&
        ddateObj.getTime() < dateObj.getTime();
      // console.log(`include report item ${d.date}, ${d.name}? ${result}`);
      return result;
    });

    let fixedIncome = 0;
    // log(`for date ${date}, accumulate from ${reportsInYear.length} reports`);
    reportsInYear.forEach((d) => {
      // log(`report's item ${d.date}, ${d.name}, ${d.newVal}`);
      if (d.newVal) {
        fixedIncome += d.newVal;
        // log(`after adding ${d.newVal} for `
        //   +`${d.name},${d.date} fixedIncome = ${fixedIncome}`)
      }
    });
    // log(`accumulated fixedIncome = ${fixedIncome}`)

    let surplus = fixedIncome + bondsReleaseFunds - combined;
    if (Math.abs(surplus) < 0.01) {
      surplus = 0;
    }
    // console.log(`fixedIncome ${fixedIncome} bondsReleaseFunds ${bondsReleaseFunds}`);
    tableData.push({
      DATE: date,
      BASIC: `${basic}`,
      LEISURE: `${leisure}`,
      COMBINED: `${combined}`,
      FIXED_INCOME: `${fixedIncome}`,
      BONDS: `${bondsReleaseFunds}`,
      INCOMING: `${fixedIncome + bondsReleaseFunds}`,
      SURPLUS: `${surplus}`,
      PBBASIC: `${pbBasic}`,
      PBLEISURE: `${pbLeisure}`,
    });
  }
  return tableData;
}

/**
 * Annual planning chart buckets are labelled at year-end so bar totals align
 * with calendar years (Jan–Dec). ROI start is the Dec 31 before the anchor
 * year, or Dec 31 of the anchor year when the anchor is already 31 Dec.
 */
export function snapPlanningChartRoiStart(anchor: FinKittyDate): FinKittyDate {
  const d = anchor.d;
  if (d.getMonth() === 11 && d.getDate() === 31) {
    return anchor;
  }
  return new FinKittyDate(new Date(d.getFullYear() - 1, 11, 31));
}

/** Chart ROI for bond planning surplus — anchored, not tied to view start. */
function modelForPlanningSurplusCharts(model: ModelData): ModelData {
  const chartStart = snapPlanningChartRoiStart(getEvaluationAnchorDate());
  return {
    ...model,
    settings: model.settings.map((s) => {
      if (s.NAME !== roiStart) {
        return s;
      }
      return {
        ...s,
        VALUE: `${chartStart.getDateString()}`,
      };
    }),
  };
}

export function getAnnualPlanningAssetData(
  model: ModelData,
  evals: PlanningEvalsBundle,
){
  const chartModel = modelForPlanningSurplusCharts(model);  // const chartModel = model;
  const viewSettings = getDefaultViewSettings();
  const chartData: DataForView = makeChartData(
    chartModel,
    viewSettings,
    evals,
  );
  const expensesChartData = makeBarData(chartData.labels, chartData.expensesData);

  const planningViewSettings = getDefaultViewSettings();
  planningViewSettings.setModel(model);
  planningViewSettings.toggleViewFilter(Context.Expense, allItems);
  planningViewSettings.toggleViewFilter(Context.Expense, "Basic"); // the Planning page works with this category
  planningViewSettings.toggleViewFilter(Context.Expense, "Leisure"); // the Planning page works with this category
  planningViewSettings.setViewSetting(`${viewDetail}${expensesView.lc}`, coarseDetail);
  planningViewSettings.toggleViewFilter(Context.Asset, allItems);
  planningViewSettings.toggleViewFilter(Context.Asset, "Bonds"); // the Planning page works with this category
  planningViewSettings.setViewSetting(`${viewDetail}${assetsView.lc}`, fineDetail);
  planningViewSettings.setViewSetting(chartViewType, chartReductions);

  const planningChartData: DataForView = makeChartData(
    chartModel,
    planningViewSettings,
    evals,
  );
  const planningExpensesChartData = makeBarData(
    planningChartData.labels,
    planningChartData.expensesData,
  );

  for(const assetData of planningChartData.assetData) {
    const assetChangeName = assetData.item.NAME;
    if (assetChangeName.includes('growth')) {
      continue;
    }

    // log(`before change one of planningChartData.assetData = ${showObj(assetData)}`);

    const nonZeroValues = assetData.chartDataPoints.filter((cdp) => {
      return cdp.y !== 0.0;
    })
    if (nonZeroValues.length > 1) {
      console.log(`nonZeroValues = ${showObj(nonZeroValues)}`);
      throw new Error(`bond maturing in multiple years?`);
      //continue;
    } else if (nonZeroValues.length === 0) {
      log(`bond never maturing?`);
      continue;
    }
    const y = nonZeroValues[0].y;
    assetData.chartDataPoints.map((cdp) => {
      cdp.y = 0;
    });

    let year = '1999';
    
    const parts = assetChangeName.split(bondMature);
    // log(`parts[0] = ${parts[0]}`);
    if (parts[0].includes(generatedRecurrence)) {
      // generated recurrences explicitly include the year they are for
      year = parts[0].split(generatedRecurrence)[1];
    } else {
      // for single bond assets we need to get the year from the generator
      const gen = model.generators.find((g) => {
        return g.NAME === parts[0];
      })
      if (gen === undefined) {
        // throw new Error(`can't find matching generator`);
        log(`can't find matching generator`);
        continue;
      }
      year = gen.DETAILS.YEAR;
    }
    // log(`amount = ${y} for year = ${year}`);
    for (let idx = 0; idx < planningChartData.labels.length; idx++) {
      const colLabel = planningChartData.labels[idx];
      const colDate = new Date(colLabel);
      if (`${colDate.getFullYear() + 1}` === year) {
        assetData.chartDataPoints[idx].y = y;
      }
    }
    // log(`after change one of planningChartData.assetData = ${showObj(assetData)}`);
  }

  const planningAssetsChartData = makeBarData(
    planningChartData.labels,
    planningChartData.assetData,
  );

  const planningViewSettingsPB = getDefaultViewSettings();
  planningViewSettingsPB.setModel(model);
  planningViewSettingsPB.toggleViewFilter(Context.Asset, allItems);
  planningViewSettingsPB.setViewSetting(`${viewDetail}${assetsView.lc}`, fineDetail);
  planningViewSettingsPB.toggleViewFilter(Context.Asset, "PremiumBonds"); // the Planning page works with this category

  const planningChartDataPB: DataForView = makeChartData(
    chartModel,
    planningViewSettingsPB,
    evals,
  );
  const planningAssetsPBChartData = makeBarData(
    planningChartDataPB.labels,
    planningChartDataPB.assetData,
  );

  planningAssetsChartData.datasets.push(
    ...planningAssetsPBChartData.datasets,
  );

  return {
    expensesChartData,
    planningExpensesChartData,
    planningAssetsChartData,
  }
}

function monitoringMonthStartMs(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getTime();
}

function monitoringMonthEndMs(year: number, monthIndex: number): number {
  if (monthIndex < 11) {
    return new Date(year, monthIndex + 1, 1).getTime();
  }
  return new Date(year + 1, 0, 1).getTime();
}

/**
 * Monthly Basic/Leisure "expected" spend for a single calendar year, used by the
 * Monitoring page charts. Buckets expense evaluations into calendar months from
 * the 1st of each month (inclusive) to the 1st of the next month (exclusive).
 */
export function getMonitoringChartData(
  model: ModelData,
  evals: PlanningEvalsBundle,
  year: number,
): {
  months: string[];
  expectedBasic: number[];
  expectedLeisure: number[];
} {
  const months: string[] = [];
  const expectedBasic: number[] = [];
  const expectedLeisure: number[] = [];

  for (let m = 0; m < 12; m++) {
    months.push(dateFormat(new Date(year, m, 1), "mmm yyyy"));
    expectedBasic.push(0);
    expectedLeisure.push(0);
  }

  const expenseNames = new Set(model.expenses.map((e) => e.NAME));
  const categoryCache = new Map<string, string>();

  for (const evaln of evals.evaluations) {
    if (evaln.source === revalue || !expenseNames.has(evaln.name)) {
      continue;
    }
    const category = getCategory(evaln.name, categoryCache, model);
    if (category !== "Basic" && category !== "Leisure") {
      continue;
    }

    const evalTime = evaln.date.getTime();
    for (let m = 0; m < 12; m++) {
      if (
        evalTime >= monitoringMonthStartMs(year, m) &&
        evalTime < monitoringMonthEndMs(year, m)
      ) {
        if (category === "Basic") {
          expectedBasic[m] += evaln.value;
        } else {
          expectedLeisure[m] += evaln.value;
        }
        break;
      }
    }
  }

  return { months, expectedBasic, expectedLeisure };
}

export function getAnnualPlanningSurplusData(
  model: ModelData,
  evals: PlanningEvalsBundle,
){
  // log(`getAnnualPlanningSurplusData received ${evals.evaluations.length} evaluations`);
  const {
    expensesChartData,
    planningExpensesChartData,
    planningAssetsChartData,
  } = getAnnualPlanningAssetData(
    model, 
    evals,
  );

  const tableData = getPlanningTableData(
    planningExpensesChartData,
    planningAssetsChartData,
    evals.reportData,
  );
  // for(const td of tableData) {
  //   log(`getAnnualPlanningSurplusData returns ${showObj(td)}`);
  // }
  return tableData;
}