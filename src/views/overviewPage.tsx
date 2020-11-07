import { ChartData, DbModelData } from '../types/interfaces';
import {
  assetsDivWithHeadings,
  debtsDivWithHeadings,
  expensesTableDivWithHeading,
  incomesTableDivWithHeading,
  settingsTableDiv,
  transactionFilteredTable,
  transactionsForTable,
  transactionsTableDiv,
  triggersTableDivWithHeading,
} from './tablePages';
import {
  assetsOrDebtsChartDiv,
  coarseFineList,
  expensesChartDiv,
  frequencyList,
  getSmallerChartSettings,
  incomesChartDiv,
  taxChartDiv,
} from './chartPages';
import {
  autogen,
  custom,
  overview,
  revalueExp,
  revalueInc,
} from '../localization/stringConstants';

import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';
import React from 'react';
import { getDisplay } from '../App';
import { ViewSettings } from '../models/charting';

function suppressLegend(chartDataPoints: ChartData[]) {
  return chartDataPoints.map(dp => {
    return {
      ...dp,
      showInLegend: false,
    };
  });
}

function chartsForOverview(
  model: DbModelData,
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

function transactionsOverviewDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
) {
  const customContents = transactionsForTable(model, custom);
  const autogenContents = transactionsForTable(model, autogen);
  if (customContents.length === 0 && autogenContents.length === 0) {
    return;
  }
  return (
    <>
      <h2>Transactions:</h2>
      {transactionsTableDiv(
        customContents,
        model,
        showAlert,
        'Custom transactions',
      )}
      {transactionsTableDiv(
        autogenContents,
        model,
        showAlert,
        'Auto-generated transactions',
      )}
    </>
  );
}

export function overviewDiv(
  model: DbModelData,
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
  // log(`called overviewDiv with a model with ${model.assets.length} assets`);
  const chartDataExists =
    incomesChartData.length !== 0 ||
    assetChartData.length !== 0 ||
    expensesChartData.length !== 0 ||
    taxChartData.length !== 0 ||
    debtChartData.length !== 0;

  const doDisplay = getDisplay(overview);
  if (!doDisplay) {
    return;
  }
  return (
    <>
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
        {triggersTableDivWithHeading(model, showAlert)}
        {incomesTableDivWithHeading(model, showAlert)}
        {transactionFilteredTable(
          model,
          showAlert,
          revalueInc,
          'Income revaluations',
        )}
        {expensesTableDivWithHeading(model, showAlert)}
        {transactionFilteredTable(
          model,
          showAlert,
          revalueExp,
          'Expense revaluations',
        )}
        {assetsDivWithHeadings(model, showAlert)}
        {debtsDivWithHeadings(model, showAlert)}
        {transactionsOverviewDiv(model, showAlert)}
        {settingsTableDiv(model, viewSettings, showAlert)}
      </div>
    </>
  );
}
