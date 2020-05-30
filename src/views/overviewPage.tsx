import React from 'react';
import { DbModelData, ChartData } from '../types/interfaces';
import Button from './reactComponents/Button';
import {
  assetsOrDebtsTableDiv,
  expensesTableDiv,
  incomesTableDiv,
  settingsTableDiv,
  transactionsTableDiv,
  triggersTableDiv,
} from './tablePages';
import {
  assetsView,
  debtsView,
  expensesView,
  getDisplay,
  incomesView,
  overview,
  settingsView,
  toggle,
  triggersView,
  transactionsView,
} from '../App';
import {
  assetsOrDebtsChartDiv,
  expensesChartDiv,
  incomesChartDiv,
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

export function overviewDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  debtChartData: ChartData[],
  expensesChartData: ChartData[],
  incomesChartData: ChartData[],
) {
  const doDisplay = getDisplay(overview);
  return (
    <div style={{ display: doDisplay ? 'block' : 'none' }}>
      This model has &nbsp;
      {model.triggers.length} &nbsp;
      <Button
        action={() => {
          toggle(triggersView);
        }}
        type="secondary"
        title="dates"
        id="switchToTriggers"
      />
      , &nbsp;
      {model.incomes.length} &nbsp;
      <Button
        action={() => {
          toggle(incomesView);
        }}
        type="secondary"
        title="incomes"
        id="switchToIncomes"
      />
      ,&nbsp;
      {model.expenses.length} &nbsp;
      <Button
        action={() => {
          toggle(expensesView);
        }}
        type="secondary"
        title="expenses"
        id="switchToExpenses"
      />
      , &nbsp;
      {
        model.assets.filter(a => {
          return a.IS_A_DEBT === false;
        }).length
      }{' '}
      &nbsp;
      <Button
        action={() => {
          toggle(assetsView);
        }}
        type="secondary"
        title="assets"
        id="switchToAssets"
      />
      , &nbsp;
      {
        model.assets.filter(a => {
          return a.IS_A_DEBT === true;
        }).length
      }{' '}
      &nbsp;
      <Button
        action={() => {
          toggle(debtsView);
        }}
        type="secondary"
        title="debts"
        id="switchToDebts"
      />
      , &nbsp;
      {model.transactions.length} &nbsp;
      <Button
        action={() => {
          toggle(transactionsView);
        }}
        type="secondary"
        title="transactions"
        id="switchToTransactions"
      />
      &nbsp; and &nbsp;
      {model.settings.length} &nbsp;
      <Button
        action={() => {
          toggle(settingsView);
        }}
        type="secondary"
        title="settings"
        id="switchToSettings"
      />
      &nbsp;.
      <br />
      <h2>Important dates:</h2>
      {triggersTableDiv(model, showAlert)}
      <h2>Incomes:</h2>
      {incomesChartDiv(model, incomesChartData)}
      <h4>Income definitions</h4>
      {incomesTableDiv(model, showAlert)}
      <h4>Income revaluations</h4>
      {transactionsTableDiv(model, showAlert, revalueInc)}
      <h2>Expenses:</h2>
      {expensesChartDiv(model, expensesChartData)}
      <h4>Expense definitions</h4>
      {expensesTableDiv(model, showAlert)}
      <h4>Expense revaluations</h4>
      {transactionsTableDiv(model, showAlert, revalueExp)}
      <h2>Assets:</h2>
      {assetsOrDebtsChartDiv(model, assetChartData, false)}
      <h4>Asset definitions</h4>
      {assetsOrDebtsTableDiv(model, showAlert, false)}
      <h4>Liquidate assets to keep cash afloat</h4>
      {transactionsTableDiv(model, showAlert, liquidateAsset)}
      <h4>Revalue assets</h4>
      {transactionsTableDiv(model, showAlert, revalueAsset)}
      <h2>Debts:</h2>
      {assetsOrDebtsChartDiv(model, debtChartData, true)}
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
  );
}
