import React from 'react';
import { DbModelData, ChartData } from '../types/interfaces';
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
import { getDisplay, overview } from '../App';
import {
  incomesChartDiv,
  taxChartDiv,
  getSmallerChartSettings,
  expensesChartDiv,
  assetsOrDebtsChartDiv,
  coarseFineList,
} from './chartPages';
import {
  custom,
  autogen,
  revalueInc,
  revalueExp,
} from '../localization/stringConstants';

import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';

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
            getSmallerChartSettings(model, 'Incomes'),
          )}
        </div>
        <div className="col">
          {expensesChartDiv(
            suppressLegend(expensesChartData),
            getSmallerChartSettings(model, 'Expenses'),
          )}
        </div>
        <div className="col">
          {assetsOrDebtsChartDiv(
            suppressLegend(assetChartData),
            false,
            getSmallerChartSettings(model, 'Assets'),
          )}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {taxChartDiv(
            suppressLegend(taxChartData),
            getSmallerChartSettings(model, 'Tax'),
          )}
        </div>
        <div className="col">
          {assetsOrDebtsChartDiv(
            suppressLegend(debtChartData),
            true,
            getSmallerChartSettings(model, 'Debts'),
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
          {coarseFineList(model)}
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
        {settingsTableDiv(model, showAlert)}
      </div>
    </>
  );
}
