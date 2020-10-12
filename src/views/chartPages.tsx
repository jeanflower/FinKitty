import React from 'react';
import { ChartData, DbModelData } from '../types/interfaces';
import {
  allItems,
  assetChartAdditions,
  assetChartDeltas,
  assetChartFocus,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  coarse,
  debtChartFocus,
  expenseChartFocus,
  fine,
  incomeChartFocus,
  viewDetail,
  total,
  viewFrequency,
  annually,
  monthly,
  birthDate,
  taxChartFocusPerson,
  taxChartFocusType,
  income,
  gain,
  taxChartShowNet,
} from '../localization/stringConstants';
import {
  getSettings,
  log,
  showObj,
  printDebug,
  getLiabilityPeople,
} from '../utils';
import Button from './reactComponents/Button';
import { getDisplay, taxView, editSetting } from '../App';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';

import CanvasJSReact from '../assets/js/canvasjs.react';
import CanvasJS from '../assets/js/canvasjs.min';
const { CanvasJSChart } = CanvasJSReact;

function getIncomeChartFocus(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const categoryName = getSettings(
    model.settings,
    incomeChartFocus,
    allItems, // default fallback
  );
  return categoryName;
}

function makeFiltersList(
  gridData: { CATEGORY: string; NAME: string }[],
  selectedChartFocus: string,
  settingName: string,
  model: DbModelData,
) {
  // selectedChartFocus = this.getExpenseChartFocus()
  // settingName = expenseChartFocus
  // defaultSetting = expenseChartFocusAll
  // hint = expenseChartFocusHint
  let buttonNames = [allItems];
  const names: string[] = [];
  gridData.forEach(e => {
    const candidate = e.NAME;
    if (names.indexOf(candidate) < 0) {
      names.push(candidate);
    }
  });
  names.sort();
  buttonNames = buttonNames.concat(names);

  const categories: string[] = [];
  gridData.forEach(e => {
    let candidate = allItems;
    if (e.CATEGORY !== '') {
      candidate = e.CATEGORY;
      if (categories.indexOf(candidate) < 0) {
        categories.push(candidate);
      }
    }
  });
  categories.sort();
  buttonNames = buttonNames.concat(categories);

  const buttons = buttonNames.map(buttonName => (
    <Button
      key={buttonName}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        editSetting(
          {
            NAME: settingName,
            VALUE: buttonName,
          },
          model,
        );
      }}
      title={buttonName}
      type={buttonName === selectedChartFocus ? 'primary' : 'secondary'}
      id={`select-${buttonName}`}
    />
  ));
  return <div role="group">{buttons}</div>;
}

function getCoarseFineView(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return fine;
  }
  const assetName = getSettings(
    model.settings,
    viewDetail,
    fine, // default fallback
  );
  return assetName;
}

export function coarseFineList(model: DbModelData) {
  const viewTypes: string[] = [total, coarse, fine];
  const selectedCoarseFineView = getCoarseFineView(model);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission = {
          NAME: viewDetail,
          VALUE: viewType,
        };
        editSetting(forSubmission, model);
      }}
      title={viewType}
      type={viewType === selectedCoarseFineView ? 'primary' : 'secondary'}
      id="chooseViewDetailType"
    />
  ));
  return <div role="group">{buttons}</div>;
}

export function getDefaultChartSettings(model: DbModelData) {
  const showMonth =
    getSettings(
      model.settings,
      viewFrequency,
      annually,
      false, // be OK if there's no matching value
    ) === monthly;
  const showAge =
    getSettings(
      model.settings,
      birthDate,
      '',
      false, // be OK if there's no matching value
    ) !== '';
  return {
    height: 300,
    toolTip: {
      content: '{name}: {ttip}',
    },
    // width: 800,

    legend: {
      // fontSize: 30,
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      horizontalAlign: 'right', // left, center ,right
      verticalAlign: 'center', // top, center, bottom
    },

    axisX: {
      labelFormatter: function(e: any) {
        if (printDebug()) {
          log(`e.value = ${e.label}`);
          log(`showAge = ${showAge}`);
        }
        return showAge
          ? e.label
          : CanvasJS.formatDate(e.label, showMonth ? 'MMM YYYY' : 'YYYY');
      },
    },
  };
}

export function getSmallerChartSettings(model: DbModelData, title: string) {
  return {
    ...getDefaultChartSettings(model),
    height: 200,
    width: 400,
    title: {
      display: true,
      text: title,
    },
    // see also suppressLegend()
    legend: {
      display: false,
    },
  };
}

export function incomesChartDiv(
  incomesChartData: ChartData[],
  chartSettings: any,
) {
  return (
    <fieldset>
      <CanvasJSChart
        options={{
          ...chartSettings,
          data: incomesChartData,
        }}
      />
    </fieldset>
  );
}

export function incomesChartDivWithButtons(
  model: DbModelData,
  incomesChartData: ChartData[],
  chartSettings: any,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <ReactiveTextArea
        identifier="incomeDataDump"
        message={showObj(incomesChartData)}
      />
      {makeFiltersList(
        model.incomes,
        getIncomeChartFocus(model),
        incomeChartFocus,
        model,
      )}
      {coarseFineList(model)}
      {incomesChartDiv(incomesChartData, chartSettings)}
    </div>
  );
}

function getExpenseChartFocus(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const categoryName = getSettings(
    model.settings,
    expenseChartFocus,
    allItems, // default fallback
  );
  return categoryName;
}

export function expensesChartDiv(
  expensesChartData: ChartData[],
  chartSettings: any,
) {
  return (
    <fieldset>
      <ReactiveTextArea
        identifier="expensesDataDump"
        message={showObj(expensesChartData)}
      />
      <CanvasJSChart
        options={{
          ...chartSettings,
          data: expensesChartData,
        }}
      />
    </fieldset>
  );
}

export function expensesChartDivWithButtons(
  model: DbModelData,
  expensesChartData: ChartData[],
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      <ReactiveTextArea
        identifier="expenseDataDump"
        message={showObj(expensesChartData)}
      />
      {makeFiltersList(
        model.expenses,
        getExpenseChartFocus(model),
        expenseChartFocus,
        model,
      )}
      {coarseFineList(model)}
      <fieldset>
        <ReactiveTextArea
          identifier="expensesDataDump"
          message={showObj(expensesChartData)}
        />
        {expensesChartDiv(expensesChartData, getDefaultChartSettings(model))}
      </fieldset>
    </div>
  );
}

function getAssetOrDebtChartName(model: DbModelData, debt: boolean) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const assetName = getSettings(
    model.settings,
    debt ? debtChartFocus : assetChartFocus,
    allItems, // default fallback
  );
  return assetName;
}

function assetsOrDebtsButtonList(
  model: DbModelData,
  isDebt: boolean,
  forOverview: boolean,
) {
  const assetsOrDebts = model.assets.filter(obj => {
    return obj.IS_A_DEBT === isDebt;
  });
  let assetOrDebtNames: string[] = assetsOrDebts.map(data => data.NAME).sort();
  assetOrDebtNames.unshift(allItems);
  // log(`assetNames = ${assetNames}`);
  const categoryNames: string[] = [];
  assetsOrDebts.forEach(data => {
    const cat = data.CATEGORY;
    if (cat !== '') {
      if (categoryNames.indexOf(cat) < 0) {
        categoryNames.push(cat);
      }
    }
  });
  assetOrDebtNames = assetOrDebtNames.concat(categoryNames.sort());
  // log(`assetNames with categories = ${assetNames}`);
  const selectedAssetOrDebt = getAssetOrDebtChartName(model, isDebt);
  const buttons = assetOrDebtNames.map(assetOrDebt => (
    <Button
      key={assetOrDebt}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission = {
          NAME: isDebt ? debtChartFocus : assetChartFocus,
          VALUE: assetOrDebt,
        };
        editSetting(forSubmission, model);
      }}
      title={assetOrDebt}
      type={assetOrDebt === selectedAssetOrDebt ? 'primary' : 'secondary'}
      id={`chooseAssetOrDebtChartSetting-${forOverview ? `overview` : ``}-${
        isDebt ? `debt` : `asset`
      }-${assetOrDebt}`}
    />
  ));
  return <div role="group">{buttons}</div>;
}

function getAssetChartView(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return assetChartVal;
  }
  const assetName = getSettings(
    model.settings,
    assetChartView,
    assetChartVal, // default fallback
  );
  return assetName;
}

function assetViewTypeList(model: DbModelData) {
  const viewTypes: string[] = [
    assetChartVal,
    assetChartAdditions,
    assetChartReductions,
    assetChartDeltas,
  ];
  const selectedAssetView = getAssetChartView(model);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        // when a button is clicked,
        // go to change the settings value
        const forSubmission = {
          NAME: assetChartView,
          VALUE: viewType,
        };
        editSetting(forSubmission, model);
      }}
      title={viewType}
      type={viewType === selectedAssetView ? 'primary' : 'secondary'}
      id="chooseAssetChartType"
    />
  ));
  return <div role="group">{buttons}</div>;
}

export function assetsOrDebtsChartDiv(
  assetChartData: ChartData[],
  chartSettings: any,
) {
  return (
    <CanvasJSChart
      options={{
        ...chartSettings,
        data: assetChartData,
      }}
    />
  );
}

export function assetsOrDebtsChartDivWithButtons(
  model: DbModelData,
  assetChartData: ChartData[],
  isDebt: boolean,
  forOverviewPage: boolean,
) {
  // log(`assetChartData = ${assetChartData}`);

  return (
    <div
      style={{
        display: 'block',
      }}
    >
      {assetsOrDebtsButtonList(model, isDebt, forOverviewPage)}
      {assetViewTypeList(model)}
      {coarseFineList(model)}
      <ReactiveTextArea
        identifier="assetDataDump"
        message={showObj(assetChartData)}
      />
      {assetsOrDebtsChartDiv(assetChartData, getDefaultChartSettings(model))}
    </div>
  );
}

function getTaxPerson(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const person = getSettings(
    model.settings,
    taxChartFocusPerson,
    allItems, // default fallback
  );
  return person;
}

function getTaxType(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const type = getSettings(
    model.settings,
    taxChartFocusType,
    allItems, // default fallback
  );
  return type;
}

function getTaxShowNet(model: DbModelData) {
  if (model.settings.length === 0) {
    // data not yet loaded
    return allItems;
  }
  const type = getSettings(
    model.settings,
    taxChartShowNet,
    'Y', // default fallback
  );
  return type === 'Y' || type === 'y' || type === 'yes';
}

function taxButtonList(model: DbModelData) {
  const liabilityPeople = getLiabilityPeople(model);
  liabilityPeople.unshift(allItems);

  // console.log(`liablityPeople for tax buttons is ${showObj(liabilityPeople)}`);
  const buttons = liabilityPeople.map(person => (
    <Button
      key={person === allItems ? 'All people' : person}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        const forSubmission = {
          NAME: taxChartFocusPerson,
          VALUE: person,
        };
        editSetting(forSubmission, model);
      }}
      title={person === allItems ? 'All people' : person}
      type={person === getTaxPerson(model) ? 'primary' : 'secondary'}
      id={`chooseTaxSetting-${person}`}
    />
  ));
  buttons.push(
    <Button
      key={'All types'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        const forSubmission = {
          NAME: taxChartFocusType,
          VALUE: allItems,
        };
        editSetting(forSubmission, model);
      }}
      title={'All types'}
      type={getTaxType(model) === allItems ? 'primary' : 'secondary'}
      id={`chooseTaxType-all`}
    />,
  );
  buttons.push(
    <Button
      key={'income'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        const forSubmission = {
          NAME: taxChartFocusType,
          VALUE: income,
        };
        editSetting(forSubmission, model);
      }}
      title={'Income'}
      type={getTaxType(model) === income ? 'primary' : 'secondary'}
      id={`chooseTaxType-income`}
    />,
  );
  buttons.push(
    <Button
      key={'gain'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        const forSubmission = {
          NAME: taxChartFocusType,
          VALUE: gain,
        };
        editSetting(forSubmission, model);
      }}
      title={'Gain'}
      type={getTaxType(model) === gain ? 'primary' : 'secondary'}
      id={`chooseTaxType-income`}
    />,
  );
  buttons.push(
    <Button
      key={'Show net'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        const forSubmission = {
          NAME: taxChartShowNet,
          VALUE: 'Y',
        };
        editSetting(forSubmission, model);
      }}
      title={'Show net'}
      type={getTaxShowNet(model) ? 'primary' : 'secondary'}
      id={`chooseTaxType-showNet`}
    />,
  );
  buttons.push(
    <Button
      key={'Hide net'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        const forSubmission = {
          NAME: taxChartShowNet,
          VALUE: 'N',
        };
        editSetting(forSubmission, model);
      }}
      title={'Hide net'}
      type={!getTaxShowNet(model) ? 'primary' : 'secondary'}
      id={`chooseTaxType-hideNet`}
    />,
  );
  return <div role="group">{buttons}</div>;
}
export function taxChartDiv(
  model: DbModelData,
  taxChartData: ChartData[],
  settings: any,
) {
  return (
    <CanvasJSChart
      options={{
        ...settings,
        data: taxChartData,
      }}
    />
  );
}

function taxChartDivWithButtons(
  model: DbModelData,
  taxChartData: ChartData[],
  settings: any,
) {
  return (
    <div>
      {taxButtonList(model)}
      {taxChartDiv(model, taxChartData, settings)}
    </div>
  );
}
export function taxDiv(model: DbModelData, taxChartData: ChartData[]) {
  if (!getDisplay(taxView)) {
    return;
  }

  return (
    <div>
      {coarseFineList(model)}
      {taxChartDivWithButtons(
        model,
        taxChartData,
        getDefaultChartSettings(model),
      )}
    </div>
  );
}

/*
import {
  IReactVisChartPoint,
} from './reactComponents/ReactVisExample';
*/

/*
function convertChartDatum(z: IChartDataPoint, name: string): IReactVisChartPoint {
  log(`IChartDataPoint z is ${showObj(z)}`);
  const result: IReactVisChartPoint = {
    x: z.label,
    y: z.y,
    ttip: `${name} ${z.ttip}`,
  };
  log(`converted result is ${showObj(result)}`);
  return result;
}

function makeReactVisChartData(x: IChartData): IReactVisChartPoint[] {
  const result = x.dataPoints.map(w => convertChartDatum(w, x.name));
  // log(`${result}`);
  return result;
}
*/
