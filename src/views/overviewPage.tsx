import React from 'react';
import { DbModelData, ChartData } from '../types/interfaces';
import {
  assetsOrDebtsTableDiv,
  expensesTableDiv,
  incomesTableDiv,
  settingsTableDiv,
  transactionsTableDiv,
  triggersTableDiv,
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
  liquidateAsset,
  payOffDebt,
  revalueInc,
  revalueExp,
  revalueAsset,
  revalueDebt,
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
  const doDisplay = getDisplay(overview);
  return (
    <div
      style={{
        display: doDisplay ? 'block' : 'none',
      }}
    >
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
              getSmallerChartSettings(model, 'Assets'),
            )}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {taxChartDiv(
              model,
              suppressLegend(taxChartData),
              getSmallerChartSettings(model, 'Tax'),
            )}
          </div>
          <div className="col">
            {assetsOrDebtsChartDiv(
              suppressLegend(debtChartData),
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
      <div className="scrollClass resizeClass">
        <br />
        <h2>Important dates:</h2>
        {triggersTableDiv(model, showAlert)}
        <h4>Income definitions</h4>
        {incomesTableDiv(model, showAlert)}
        <h4>Income revaluations</h4>
        {transactionsTableDiv(model, showAlert, revalueInc)}
        <h4>Expense definitions</h4>
        {expensesTableDiv(model, showAlert)}
        <h4>Expense revaluations</h4>
        {transactionsTableDiv(model, showAlert, revalueExp)}
        <h4>Asset definitions</h4>
        {assetsOrDebtsTableDiv(model, showAlert, false)}
        <h4>Liquidate assets to keep cash afloat</h4>
        {transactionsTableDiv(model, showAlert, liquidateAsset)}
        <h4>Revalue assets</h4>
        {transactionsTableDiv(model, showAlert, revalueAsset)}
        <h4>Debt definitions</h4>
        {assetsOrDebtsTableDiv(model, showAlert, true)}
        <h4>Revalue debts</h4>
        {transactionsTableDiv(model, showAlert, revalueDebt)}
        <h4>Pay off debts</h4>
        {transactionsTableDiv(model, showAlert, payOffDebt)}
        <h2>Transactions:</h2>
        <h4>Custom transactions</h4>
        {transactionsTableDiv(model, showAlert, custom)}
        <h4>Auto-generated transactions</h4>
        {transactionsTableDiv(model, showAlert, autogen)}
        <h2>Settings:</h2>
        {settingsTableDiv(model, showAlert)}
      </div>
    </div>
  );
}
