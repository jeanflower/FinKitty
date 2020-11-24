import { ChartData, Item, ModelData, IncomeVal } from '../types/interfaces';
import { checkIncome, checkTransaction } from '../models/checks';
import {
  defaultColumn,
  incomesTableDivWithHeading,
  transactionFilteredTable,
} from './tablePages';
import {
  deleteIncome,
  getDisplay,
  submitIncome,
  submitTransaction,
  submitTrigger,
} from '../App';
import {
  getDefaultChartSettings,
  incomesChartDivWithButtons,
} from './chartPages';
import { getTodaysDate, lessThan } from '../utils';
import { incomesView, revalueInc } from '../localization/stringConstants';

import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React from 'react';
import SimpleFormatter from './reactComponents/NameFormatter';
import { ViewSettings } from '../models/charting';

function todaysIncomesTable(
  model: ModelData,
  todaysValues: Map<string, IncomeVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }
  const today = getTodaysDate(model);
  return (
    <>
      <h4>Values at {today.toDateString()}</h4>
      <DataGrid
        deleteFunction={async function() {
          return false;
        }}
        handleGridRowsUpdated={function() {
          return false;
        }}
        rows={Array.from(todaysValues.entries())
          .map(key => {
            // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
            return {
              NAME: key[0],
              VALUE: `${key[1].incomeVal}`,
            };
          })
          .sort((a: Item, b: Item) => lessThan(a.NAME, b.NAME))}
        columns={[
          {
            ...defaultColumn,
            key: 'NAME',
            name: 'name',
            formatter: <SimpleFormatter name="name" value="unset" />,
            editable: false,
          },
          {
            ...defaultColumn,
            key: 'VALUE',
            name: `value`,
            formatter: <CashValueFormatter name="value" value="unset" />,
            editable: false,
          },
        ]}
      />
    </>
  );
}

export function incomesDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  showAlert: (arg0: string) => void,
  incomesChartData: ChartData[],
  todaysValues: Map<string, IncomeVal>,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (!getDisplay(incomesView)) {
    return;
  }
  // log('rendering an incomesDiv');
  return (
    <div
      className="ml-3"
      style={{ display: getDisplay(incomesView) ? 'block' : 'none' }}
    >
      {incomesChartDivWithButtons(
        model,
        viewSettings,
        incomesChartData,
        getDefaultChartSettings(viewSettings, model.settings),
        showAlert,
        getStartDate,
        updateStartDate,
        getEndDate,
        updateEndDate,
      )}
      {todaysIncomesTable(model, todaysValues)}
      {incomesTableDivWithHeading(model, showAlert)}
      {transactionFilteredTable(
        model,
        showAlert,
        revalueInc,
        'Income revaluations',
      )}

      <div className="addNewIncome">
        <h4>
          {' '}
          Add an income, a defined-benefits pension, or revalue an income
        </h4>
        <AddDeleteIncomeForm
          checkIncomeFunction={checkIncome}
          checkTransactionFunction={checkTransaction}
          submitIncomeFunction={submitIncome}
          submitTransactionFunction={submitTransaction}
          deleteFunction={deleteIncome}
          submitTriggerFunction={submitTrigger}
          model={model}
          showAlert={showAlert}
        />
      </div>
    </div>
  );
}
