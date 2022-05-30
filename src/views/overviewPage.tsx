import {
  ChartData,
  AssetOrDebtVal,
  ExpenseVal,
  IncomeVal,
  ModelData,
} from '../types/interfaces';
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
import { ViewSettings } from '../models/charting';
import { Col, Container, Row } from 'react-bootstrap';
import { log, printDebug } from '../utils/utils';
import { getDisplay } from '../utils/viewUtils';

function suppressLegend(barData: ChartData) {
  return {
    ...barData,
    displayLegend: false,
  };
}
function chartsForOverview(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData,
  debtChartData: ChartData,
  expensesChartData: ChartData,
  incomesChartData: ChartData,
  taxChartData: ChartData,
  getStartDate: () => string,
  updateStartDate: (newDate: string) => Promise<void>,
  getEndDate: () => string,
  updateEndDate: (newDate: string) => Promise<void>,
) {
  return (
    <Container>
      <Row>
        <Col>
          {incomesChartDiv(
            suppressLegend(incomesChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Incomes'),
            viewSettings,
          )}
        </Col>
        <Col>
          {expensesChartDiv(
            suppressLegend(expensesChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Expenses'),
            viewSettings,
          )}
        </Col>
        <Col>
          {assetsOrDebtsChartDiv(
            suppressLegend(assetChartData),
            false,
            getSmallerChartSettings(viewSettings, model.settings, 'Assets'),
            viewSettings,
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          {taxChartDiv(
            suppressLegend(taxChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Tax'),
            viewSettings,
          )}
        </Col>
        <Col>
          {assetsOrDebtsChartDiv(
            suppressLegend(debtChartData),
            true,
            getSmallerChartSettings(viewSettings, model.settings, 'Debts'),
            viewSettings,
          )}
        </Col>
        <Col>
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
        </Col>
      </Row>
    </Container>
  );
}

function transactionsOverviewDiv(
  model: ModelData,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
) {
  const customContents = transactionsForTable(model, custom);
  const autogenContents = transactionsForTable(model, autogen);
  if (customContents.length === 0 && autogenContents.length === 0) {
    return;
  }
  return (
    <>
      {transactionsTableDiv(
        customContents,
        model,
        showAlert,
        doChecks,
        'Custom transactions',
        'Custom transactions',
      )}
      {transactionsTableDiv(
        autogenContents,
        model,
        showAlert,
        doChecks,
        'Auto-generated transactions',
        'Auto-generated transactions',
      )}
    </>
  );
}

export function overviewDiv(
  model: ModelData,
  todaysAssetValues: Map<string, AssetOrDebtVal>,
  todaysIncomeValues: Map<string, IncomeVal>,
  todaysExpenseValues: Map<string, ExpenseVal>,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  doChecks: boolean,
  assetChartData: ChartData,
  debtChartData: ChartData,
  expensesChartData: ChartData,
  incomesChartData: ChartData,
  taxChartData: ChartData,
  getStartDate: () => string,
  updateStartDate: (newDate: string) => Promise<void>,
  getEndDate: () => string,
  updateEndDate: (newDate: string) => Promise<void>,
) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`called overviewDiv with a model with ${model.assets.length} assets`);
  }
  if (!getDisplay(overview)) {
    // log(`don't populate overview`);
    return;
  }
  // log(`do populate overview`);

  const chartDataExists =
    incomesChartData.labels.length !== 0 ||
    assetChartData.labels.length !== 0 ||
    expensesChartData.labels.length !== 0 ||
    taxChartData.labels.length !== 0 ||
    debtChartData.labels.length !== 0;

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
        {triggersTableDivWithHeading(model, showAlert, doChecks)}
        {incomesTableDivWithHeading(
          model,
          todaysIncomeValues,
          showAlert,
          doChecks,
        )}
        {transactionFilteredTable(
          model,
          showAlert,
          doChecks,
          revalueInc,
          'Income revaluations',
        )}
        {expensesTableDivWithHeading(
          model,
          todaysExpenseValues,
          showAlert,
          doChecks,
        )}
        {transactionFilteredTable(
          model,
          showAlert,
          doChecks,
          revalueExp,
          'Expense revaluations',
        )}
        {assetsDivWithHeadings(model, todaysAssetValues, showAlert, doChecks)}
        {debtsDivWithHeadings(model, todaysAssetValues, showAlert, doChecks)}
        {transactionsOverviewDiv(model, showAlert, doChecks)}
        {settingsTableDiv(model, showAlert, doChecks)}
      </div>
    </div>
  );
}
