import { allItems, viewDetail, coarseDetail, chartViewType, chartReductions, expensesView, assetsView, fineDetail, bondMature, generatedRecurrence } from "../localization/stringConstants";
import { Asset, AssetOrDebtVal, ChartData, DataForView, Evaluation, Expense, ExpenseVal, Income, IncomeVal, ModelData, ReportDatum, Setting, SettingVal } from "../types/interfaces";
import { Context, log, showObj } from "../utils/utils";
import { getDefaultViewSettings } from "../utils/viewUtils";
import { makeBarData } from "../views/chartPages";
import { makeChartData } from "./charting";

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
      basic = basicExpenses.data[idx];
    }
    let leisure = 0;
    if (leisureExpenses) {
      leisure = leisureExpenses.data[idx];
    }

    const combined = basic + leisure;
    // console.log(`basic = ${basic}, leisure = ${leisure}`);
    const date = expensesChartData.labels[idx];

    let bondsReleaseFunds = 0;
    if (idx > 0) {
      const bondsIdx = idx - 1; // show bond funds one year later
      planningAssetsChartData.datasets.forEach((pscd) => {
        // console.log(`pscd = ${showObj(pscd)}`);
        if (!pscd["label"].includes('growth') && pscd.data[bondsIdx] < 0) {
          // console.log(`pscd.data[bondsIdx] = ${pscd.data[bondsIdx]}`);
          // console.log(`increase bondsReleaseFunds from ${bondsReleaseFunds} using ${-pscd.data[bondsIdx]} to ${bondsReleaseFunds - pscd.data[bondsIdx]}`);
          bondsReleaseFunds += -pscd.data[bondsIdx];
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

  return {
    expensesChartData,
    planningExpensesChartData,
    planningAssetsChartData,
  }
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