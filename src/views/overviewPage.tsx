import React from 'react';
import { DbModelData, ChartData } from '../types/interfaces';
import {
  assetsOrDebtsTableDiv,
  expensesTableDiv,
  incomesTableDiv,
  settingsTableDiv,
  transactionFilteredTable,
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
  if (
    incomesChartData.length === 0 &&
    assetChartData.length === 0 &&
    expensesChartData.length === 0 &&
    taxChartData.length === 0 &&
    debtChartData.length === 0
  ) {
    return;
  }
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
      {chartsForOverview(
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
      )}
      <div className="scrollClass resizeClass">
        <br />
        <h2>Important dates:</h2>
        {triggersTableDiv(model, showAlert)}
        <h4>Income definitions</h4>
        {incomesTableDiv(model, showAlert)}
        {transactionFilteredTable(
          model,
          showAlert,
          revalueInc,
          'Income revaluations',
        )}

        <h4>Expense definitions</h4>
        {expensesTableDiv(model, showAlert)}
        {transactionFilteredTable(
          model,
          showAlert,
          revalueExp,
          'Expense revaluations',
        )}

        <h4>Asset definitions</h4>
        {assetsOrDebtsTableDiv(model, showAlert, false)}
        {transactionFilteredTable(
          model,
          showAlert,
          liquidateAsset,
          'Liquidate assets to keep cash afloat',
        )}
        {transactionFilteredTable(
          model,
          showAlert,
          revalueAsset,
          'Revalue assets',
        )}

        <h4>Debt definitions</h4>
        {assetsOrDebtsTableDiv(model, showAlert, true)}
        {transactionFilteredTable(
          model,
          showAlert,
          revalueDebt,
          'Revalue debts',
        )}
        {transactionFilteredTable(
          model,
          showAlert,
          payOffDebt,
          'Pay off debts',
        )}

        <h2>Transactions:</h2>
        {transactionFilteredTable(
          model,
          showAlert,
          custom,
          'Custom transactions',
        )}
        {transactionFilteredTable(
          model,
          showAlert,
          autogen,
          'Auto-generated transactions',
        )}

        <h2>Settings:</h2>
        {settingsTableDiv(model, showAlert)}
      </div>
    </div>
  );
}
