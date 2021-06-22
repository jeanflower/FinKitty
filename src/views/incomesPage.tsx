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
import { incomesView, revalueInc } from '../localization/stringConstants';

import { AddDeleteIncomeForm } from './reactComponents/AddDeleteIncomeForm';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import DataGrid from './reactComponents/DataGrid';
import React, { ReactFragment } from 'react';
import SimpleFormatter from './reactComponents/NameFormatter';
import { ViewSettings } from '../models/charting';
import { getTodaysDate } from '../models/modelUtils';
import { lessThan } from '../stringUtils';
import { Accordion, Button, Card } from 'react-bootstrap';

function addToMap(name: string, val: IncomeVal, myMap: Map<string, IncomeVal>) {
  const existingEntry = myMap.get(name);
  if (existingEntry === undefined) {
    myMap.set(name, { ...val });
  } else {
    existingEntry.incomeVal += val.incomeVal;
  }
}

function makeDataGrid(myMap: Map<string, IncomeVal>) {
  return (
    <DataGrid
      deleteFunction={async function() {
        return false;
      }}
      handleGridRowsUpdated={function() {
        return false;
      }}
      rows={Array.from(myMap.entries())
        .filter(key => {
          return key[1].incomeVal !== 0.0;
        })
        .map(key => {
          // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
          return {
            NAME: key[0],
            VALUE: `${key[1].incomeVal}`,
            CATEGORY: `${key[1].category}`,
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
        {
          ...defaultColumn,
          key: 'CATEGORY',
          name: `category`,
          formatter: <SimpleFormatter name="name" value="unset" />,
          editable: false,
        },
      ]}
    />
  );
}

export function todaysIncomesTable(
  model: ModelData,
  todaysValues: Map<string, IncomeVal>,
) {
  if (todaysValues.size === 0) {
    return;
  }

  const categorisedValues = new Map<string, IncomeVal>();

  const entries = Array.from(todaysValues.entries());
  for (const key of entries) {
    const cat = key[1].category;
    if (cat === '') {
      addToMap(key[0], key[1], categorisedValues);
    } else {
      const catName: string = key[1].category;
      addToMap(catName, key[1], categorisedValues);
    }
  }

  const today = getTodaysDate(model);
  return (
    <>
      <h4>Income values at {today.toDateString()}</h4>
      {makeDataGrid(todaysValues)}
      <h4>Income values (categorised) at {today.toDateString()}</h4>
      {makeDataGrid(categorisedValues)}
    </>
  );
}
export function collapsibleFragment(
  fragment: ReactFragment | undefined,
  title: string,
) {
  if (fragment === undefined) {
    return;
  }
  return (
    <Accordion defaultActiveKey="0">
      <Card>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey="0">
            {title}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>{fragment}</Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
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
      {collapsibleFragment(
        incomesChartDivWithButtons(
          model,
          viewSettings,
          incomesChartData,
          getDefaultChartSettings(viewSettings, model.settings),
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        ),
        'Data chart',
      )}
      {collapsibleFragment(
        <>
          {todaysIncomesTable(model, todaysValues)}
          {incomesTableDivWithHeading(model, showAlert)}
          {transactionFilteredTable(
            model,
            showAlert,
            revalueInc,
            'Income revaluations',
          )}
        </>,
        'Data tables',
      )}

      {collapsibleFragment(
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
        </div>,
        'Add or revalue an income',
      )}
    </div>
  );
}
