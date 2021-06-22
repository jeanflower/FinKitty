import {
  AssetVal,
  ChartData,
  DebtVal,
  ExpenseVal,
  IncomeVal,
  ModelData,
} from '../types/interfaces';
import {
  assetsOrDebtsChartDiv,
  coarseFineList,
  expensesChartDiv,
  frequencyList,
  getSmallerChartSettings,
  incomesChartDiv,
  taxChartDiv,
} from './chartPages';
import { snapshot } from '../localization/stringConstants';

import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';
import React from 'react';
import { getDisplay } from '../App';
import { ViewSettings } from '../models/charting';
import { todaysIncomesTable } from './incomesPage';
import { todaysExpensesTable } from './expensesPage';
import { todaysAssetsTable } from './assetsPage';
import { todaysDebtsTable } from './debtsPage';

function suppressLegend(chartDataPoints: ChartData[]) {
  return chartDataPoints.map(dp => {
    return {
      ...dp,
      showInLegend: false,
    };
  });
}

function chartsForOverview(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  debtChartData: ChartData[],
  expensesChartData: ChartData[],
  incomesChartData: ChartData[],
  taxChartData: ChartData[],
  getStartDate: () => string,
  updateStartDate: (newDate: string) => Promise<void>,
  getEndDate: () => string,
  updateEndDate: (newDate: string) => Promise<void>,
) {
  return (
    <div className="scrollClass">
      <div className="row">
        <div className="col">
          {incomesChartDiv(
            suppressLegend(incomesChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Incomes'),
          )}
        </div>
        <div className="col">
          {expensesChartDiv(
            suppressLegend(expensesChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Expenses'),
          )}
        </div>
        <div className="col">
          {assetsOrDebtsChartDiv(
            suppressLegend(assetChartData),
            false,
            getSmallerChartSettings(viewSettings, model.settings, 'Assets'),
          )}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {taxChartDiv(
            suppressLegend(taxChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Tax'),
          )}
        </div>
        <div className="col">
          {assetsOrDebtsChartDiv(
            suppressLegend(debtChartData),
            true,
            getSmallerChartSettings(viewSettings, model.settings, 'Debts'),
          )}
        </div>
        <div className="col">
          <AddDeleteEntryForm
            name="view start date"
            getValue={getStartDate}
            submitFunction={updateStartDate}
            showAlert={showAlert}
          />
          <AddDeleteEntryForm
            name="view end date"
            getValue={getEndDate}
            submitFunction={updateEndDate}
            showAlert={showAlert}
          />
          {coarseFineList(viewSettings)}
          {frequencyList(viewSettings)}
        </div>
      </div>
    </div>
  );
}

export function snapshotDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  todaysAssetValues: Map<string, AssetVal>,
  debtChartData: ChartData[],
  todaysDebtValues: Map<string, DebtVal>,
  expensesChartData: ChartData[],
  todaysExpenseValues: Map<string, ExpenseVal>,
  incomesChartData: ChartData[],
  todaysIncomeValues: Map<string, IncomeVal>,
  taxChartData: ChartData[],
  getStartDate: () => string,
  updateStartDate: (newDate: string) => Promise<void>,
  getEndDate: () => string,
  updateEndDate: (newDate: string) => Promise<void>,
) {
  // log(`called snapshotDiv with a model with ${model.assets.length} assets`);
  const chartDataExists =
    incomesChartData.length !== 0 ||
    assetChartData.length !== 0 ||
    expensesChartData.length !== 0 ||
    taxChartData.length !== 0 ||
    debtChartData.length !== 0;

  const doDisplay = getDisplay(snapshot);
  if (!doDisplay) {
    return;
  }
  return (
    <div className="ml-3">
      {chartDataExists ? (
        chartsForOverview(
          model,
          viewSettings,
          showAlert,
          assetChartData,
          debtChartData,
          expensesChartData,
          incomesChartData,
          taxChartData,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        )
      ) : (
        <></>
      )}
      <div className={chartDataExists ? 'scrollClass resizeClass' : ''}>
        <br />
        {todaysIncomesTable(model, todaysIncomeValues)}
        {todaysExpensesTable(model, todaysExpenseValues)}
        {todaysAssetsTable(model, todaysAssetValues)}
        {todaysDebtsTable(model, todaysDebtValues)}
      </div>
    </div>
  );
}
