import React from 'react';
import { DbModelData, ChartData } from '../types/interfaces';
import Button from './reactComponents/Button';
import {
  assetsTableDiv,
  expensesTableDiv,
  incomesTableDiv,
  settingsTableDiv,
  transactionsTableDiv,
  triggersTableDiv,
} from './tablePages';
import {
  assetsView,
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
  assetsChartDiv,
  expensesChartDiv,
  incomesChartDiv,
} from './chartPages';

export function overviewDiv(
  model: DbModelData,
  assetsChartData: ChartData[],
  expensesChartData: ChartData[],
  incomesChartData: ChartData[],
) {
  return (
    <div style={{ display: getDisplay(overview) ? 'block' : 'none' }}>
      This model has &nbsp;
      {model.triggers.length} &nbsp;
      <Button
        action={() => {
          toggle(triggersView);
        }}
        type="secondary"
        title="important dates"
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
      {model.assets.length} &nbsp;
      <Button
        action={() => {
          toggle(assetsView);
        }}
        type="secondary"
        title="assets"
        id="switchToAssets"
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
      {triggersTableDiv(model)}
      <h2>Incomes:</h2>
      {incomesTableDiv(model)}
      {incomesChartDiv(model, incomesChartData)}
      <h2>Expenses:</h2>
      {expensesTableDiv(model)}
      {expensesChartDiv(model, expensesChartData)}
      <h2>Assets:</h2>
      {assetsTableDiv(model)}
      {assetsChartDiv(model, assetsChartData)}
      <h2>Transactions:</h2>
      {transactionsTableDiv(model)}
      <h2>Settings:</h2>
      {settingsTableDiv(model)}
    </div>
  );
}