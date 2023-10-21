import {
  ChartData,
  AssetOrDebtVal,
  ExpenseVal,
  IncomeVal,
  ModelData,
  Asset,
  Expense,
  Income,
  ViewCallbacks,
  Setting,
  SettingVal,
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
  getSmallerChartSettings,
  incomesChartDiv,
  taxChartDiv,
} from './chartPages';
import {
  autogen,
  bondInvest,
  custom,
  overview,
  revalueExp,
  revalueInc,
} from '../localization/stringConstants';

import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';
import React from 'react';

import { Col, Container, Row } from 'react-bootstrap';
import { log, printDebug } from '../utils/utils';
import { ViewSettings, getDisplay } from '../utils/viewUtils';
import { makeButton } from './reactComponents/Button';

// import Fuse from 'fuse.js';

function suppressLegend(barData: ChartData) {
  return {
    ...barData,
    displayLegend: false,
  };
}
function chartsForOverview(
  model: ModelData,
  viewSettings: ViewSettings,
  assetChartData: ChartData,
  debtChartData: ChartData,
  expensesChartData: ChartData,
  incomesChartData: ChartData,
  taxChartData: ChartData,
  parentCallbacks: ViewCallbacks,
) {
  return (
    <Container>
      <Row>
        <Col>
          {incomesChartDiv(
            suppressLegend(incomesChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Incomes'),
            viewSettings,
            undefined,
            parentCallbacks,
          )}
        </Col>
        <Col>
          {expensesChartDiv(
            suppressLegend(expensesChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Expenses'),
            viewSettings,
            undefined,
            parentCallbacks,
          )}
        </Col>
        <Col>
          {assetsOrDebtsChartDiv(
            suppressLegend(assetChartData),
            false,
            getSmallerChartSettings(viewSettings, model.settings, 'Assets'),
            viewSettings,
            undefined,
            parentCallbacks,
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          {taxChartDiv(
            suppressLegend(taxChartData),
            getSmallerChartSettings(viewSettings, model.settings, 'Tax'),
            viewSettings,
            parentCallbacks,
          )}
        </Col>
        <Col>
          {assetsOrDebtsChartDiv(
            suppressLegend(debtChartData),
            true,
            getSmallerChartSettings(viewSettings, model.settings, 'Debts'),
            viewSettings,
            undefined,
            parentCallbacks,
          )}
        </Col>
        <Col>
          <AddDeleteEntryForm
            name="view start date"
            getValue={parentCallbacks.getStartDate}
            submitFunction={parentCallbacks.updateStartDate}
            showAlert={parentCallbacks.showAlert}
          />
          <AddDeleteEntryForm
            name="view end date"
            getValue={parentCallbacks.getEndDate}
            submitFunction={parentCallbacks.updateEndDate}
            showAlert={parentCallbacks.showAlert}
          />
          {coarseFineList(
            viewSettings,
            {
              labels: [],
              datasets: [],
              displayLegend: false,
            },
            parentCallbacks,
          )}
        </Col>
      </Row>
    </Container>
  );
}

function transactionsOverviewDiv(
  model: ModelData,
  doChecks: boolean,
  parentCallbacks: ViewCallbacks,
) {
  const customContents = transactionsForTable(model, custom, parentCallbacks);
  const autogenContents = transactionsForTable(model, autogen, parentCallbacks);
  if (customContents.length === 0 && autogenContents.length === 0) {
    return;
  }
  return (
    <>
      {transactionsTableDiv(
        customContents,
        model,
        doChecks,
        'Custom transactions',
        'Custom transactions',
        parentCallbacks,
        'customTransactionsOverview',
      )}
      {transactionsTableDiv(
        autogenContents,
        model,
        doChecks,
        'Auto-generated transactions',
        'Auto-generated transactions',
        parentCallbacks,
        'autogenTransactionsOverview',
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        bondInvest,
        'Bond transactions',
        parentCallbacks,
        'bondTransactionsOverview',
      )}
    </>
  );
}

export function overviewDiv(
  model: ModelData,
  user: string,
  todaysAssetValues: Map<Asset, AssetOrDebtVal>,
  todaysIncomeValues: Map<Income, IncomeVal>,
  todaysExpenseValues: Map<Expense, ExpenseVal>,
  todaysSettingValues: Map<Setting, SettingVal>,
  viewSettings: ViewSettings,
  doChecks: boolean,
  assetChartData: ChartData,
  debtChartData: ChartData,
  expensesChartData: ChartData,
  incomesChartData: ChartData,
  taxChartData: ChartData,
  parentCallbacks: ViewCallbacks,
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

  let introText = `Model ${model.name}`;
  if (user === undefined) {
    introText += ' in shared sandpit';
  } else {
    introText += ` for ${user}`;
  }
  return (
    <div className="ml-3">
      <>{introText}</>
      {chartDataExists ? (
        chartsForOverview(
          model,
          viewSettings,
          assetChartData,
          debtChartData,
          expensesChartData,
          incomesChartData,
          taxChartData,
          parentCallbacks,
        )
      ) : (
        <></>
      )}
      {makeButton(
        parentCallbacks.getSearchString() === ''
          ? `enter search term for table data`
          : `alter search term, currently set to '${parentCallbacks.getSearchString()}'`,
        () => {
          // Change the pattern
          const pattern = prompt('search term');
          if (pattern !== null) {
            parentCallbacks.setSearchString(pattern);
            parentCallbacks.refreshData(
              false, // refreshModel
              false, // refreshChart
              31, //sourceID
            );
          }
        },
        'search model',
        'search model',
        'outline-secondary',
      )}
      <div className={chartDataExists ? 'scrollClass resizeClass' : ''}>
        <br />
        {triggersTableDivWithHeading(
          model,
          doChecks,
          parentCallbacks,
          'Overview',
        )}
        {incomesTableDivWithHeading(
          model,
          todaysIncomeValues,
          doChecks,
          parentCallbacks,
        )}
        {transactionFilteredTable(
          model,
          doChecks,
          revalueInc,
          'Income revaluations',
          parentCallbacks,
          'incomesRevalsOverviewTable',
        )}
        {expensesTableDivWithHeading(
          model,
          todaysExpenseValues,
          doChecks,
          parentCallbacks,
          'Overview',
        )}
        {transactionFilteredTable(
          model,
          doChecks,
          revalueExp,
          'Expense revaluations',
          parentCallbacks,
          'expensesRevalsOverviewTable',
        )}
        {assetsDivWithHeadings(
          model,
          todaysAssetValues,
          doChecks,
          parentCallbacks,
          'Overview',
        )}
        {debtsDivWithHeadings(
          model,
          todaysAssetValues,
          doChecks,
          parentCallbacks,
          'Overview',
        )}
        {transactionsOverviewDiv(model, doChecks, parentCallbacks)}
        {settingsTableDiv(
          model,
          todaysSettingValues,
          doChecks,
          parentCallbacks,
          'Overview',
        )}
      </div>
    </div>
  );
}
