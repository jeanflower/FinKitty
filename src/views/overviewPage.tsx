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
  bondInvest,
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
          {coarseFineList(viewSettings, {
            labels: [],
            datasets: [],
            displayLegend: false,
          })}
          {frequencyList(viewSettings)}
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
      )}
      {transactionsTableDiv(
        autogenContents,
        model,
        doChecks,
        'Auto-generated transactions',
        'Auto-generated transactions',
        parentCallbacks,
      )}
      {transactionFilteredTable(
        model,
        doChecks,
        bondInvest,
        'Bond transactions',
        parentCallbacks,
      )}
    </>
  );
}

export function overviewDiv(
  model: ModelData,
  todaysAssetValues: Map<Asset, AssetOrDebtVal>,
  todaysIncomeValues: Map<Income, IncomeVal>,
  todaysExpenseValues: Map<Expense, ExpenseVal>,
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

  return (
    <div className="ml-3">
      {makeButton(
        'search model',
        () => {
          /*
          const options = {
            // isCaseSensitive: false,
            // includeScore: false,
            // shouldSort: true,
            // includeMatches: false,
            // findAllMatches: false,
            // minMatchCharLength: 1,
            // location: 0,
            // threshold: 0.6,
            // distance: 100,
            // useExtendedSearch: false,
            // ignoreLocation: false,
            // ignoreFieldNorm: false,
            // fieldNormWeight: 1,
            keys: ['NAME', 'CATEGORY'],
          };
          const list = ([...model.assets] as Item[])
            .concat(model.incomes)
            .concat(model.expenses)
            .concat(model.transactions)
            .concat(model.settings);

          const fuse = new Fuse(list, options);

          // Change the pattern
          const pattern = prompt('search term');
          if (pattern !== null) {
            const searchResult = fuse.search(pattern);
            log(`searchResult ${searchResult.map(showObj)}`);
          }
          */
        },
        'search model',
        'search model',
        'outline-secondary',
      )}
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
      <div className={chartDataExists ? 'scrollClass resizeClass' : ''}>
        <br />
        {triggersTableDivWithHeading(model, doChecks, parentCallbacks)}
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
        )}
        {expensesTableDivWithHeading(
          model,
          todaysExpenseValues,
          doChecks,
          parentCallbacks,
        )}
        {transactionFilteredTable(
          model,
          doChecks,
          revalueExp,
          'Expense revaluations',
          parentCallbacks,
        )}
        {assetsDivWithHeadings(
          model,
          todaysAssetValues,
          doChecks,
          parentCallbacks,
        )}
        {debtsDivWithHeadings(
          model,
          todaysAssetValues,
          doChecks,
          parentCallbacks,
        )}
        {transactionsOverviewDiv(model, doChecks, parentCallbacks)}
        {settingsTableDiv(model, doChecks, parentCallbacks)}
      </div>
    </div>
  );
}
