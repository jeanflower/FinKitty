import { allItems, viewDetail, coarseDetail, chartViewType, chartReductions, expensesView, assetsView, fineDetail, bondMature, generatedRecurrence, chartVals, revalue } from "../localization/stringConstants";
import { Asset, AssetOrDebtVal, ChartData, DataForView, Evaluation, Expense, ExpenseVal, Income, IncomeVal, ModelData, ReportDatum, Setting, SettingVal } from "../types/interfaces";
import { Context, log, showObj } from "../utils/utils";
import { getDefaultViewSettings } from "../utils/viewUtils";
import { makeBarData } from "../views/chartPages";
import { makeChartData } from "./charting";
import { getCategory } from "./category";
import dateFormat from "dateformat";

log;
showObj;

export function getPlanningTableData(
  expensesChartData: ChartData,
  planningExpensesChartData: ChartData, // for Basic and Leisure for Planning
  planningAssetsChartData: ChartData, // for maturing Bonds for Planning
  reportData: ReportDatum[],
){
  const tableData = [];

  const planningExpenses = planningExpensesChartData.datasets;

  const basicExpenses = planningExpenses.find((pe) => {
    return pe.label === "Basic";
  });
  const leisureExpenses = planningExpenses.find((pe) => {
    return pe.label === "Leisure";
  });
  for (let idx = 0; idx < expensesChartData.labels.length; idx++) {
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
    const date = expensesChartData.labels[idx];

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

    const dateObj = new Date(date);
    const dateObjBefore = new Date(date);
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

export function getAnnualPlanningAssetData(
  model: ModelData,
  evals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<Asset, AssetOrDebtVal>;
    todaysDebtValues: Map<Asset, AssetOrDebtVal>;
    todaysIncomeValues: Map<Income, IncomeVal>;
    todaysExpenseValues: Map<Expense, ExpenseVal>;
    todaysSettingValues: Map<Setting, SettingVal>;
    reportData: ReportDatum[];
  },
){
  const viewSettings = getDefaultViewSettings();
  const chartData: DataForView = makeChartData(
    model,
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
    model,
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
    model,
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
  evals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<Asset, AssetOrDebtVal>;
    todaysDebtValues: Map<Asset, AssetOrDebtVal>;
    todaysIncomeValues: Map<Income, IncomeVal>;
    todaysExpenseValues: Map<Expense, ExpenseVal>;
    todaysSettingValues: Map<Setting, SettingVal>;
    reportData: ReportDatum[];
  },
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
  evals: {
    evaluations: Evaluation[];
    todaysAssetValues: Map<Asset, AssetOrDebtVal>;
    todaysDebtValues: Map<Asset, AssetOrDebtVal>;
    todaysIncomeValues: Map<Income, IncomeVal>;
    todaysExpenseValues: Map<Expense, ExpenseVal>;
    todaysSettingValues: Map<Setting, SettingVal>;
    reportData: ReportDatum[];
  },
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
    expensesChartData,
    planningExpensesChartData,
    planningAssetsChartData,
    evals.reportData,
  );
  // for(const td of tableData) {
  //   log(`getAnnualPlanningSurplusData returns ${showObj(td)}`);
  // }
  return tableData;
}