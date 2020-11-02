import { ChartData, DbItem, DbModelData, DbSetting } from '../types/interfaces';
import {
  allItems,
  annually,
  assetChartAdditions,
  assetChartDeltas,
  assetChartFocus,
  assetChartReductions,
  assetChartVal,
  assetChartView,
  birthDate,
  coarse,
  debtChartFocus,
  expenseChartFocus,
  fine,
  gain,
  income,
  incomeChartFocus,
  monthly,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxView,
  total,
  viewDetail,
  viewFrequency,
} from '../localization/stringConstants';
import { getDisplay, refreshData } from '../App';
import {
  getLiabilityPeople,
  getSettings,
  log,
  printDebug,
  showObj,
} from '../utils';

import Button from './reactComponents/Button';
import CanvasJS from '../assets/js/canvasjs.min';
import CanvasJSReact from '../assets/js/canvasjs.react';
import React from 'react';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';

const { CanvasJSChart } = CanvasJSReact;

function getViewSetting(
  settings: DbSetting[],
  settingType: string,
  defaultValue: string,
) {
  if (settings.length === 0) {
    // data not yet loaded
    return defaultValue;
  }
  const val = getSettings(
    settings,
    settingType,
    defaultValue, // default fallback
  );
  return val;
}
function getIncomeChartFocus(settings: DbSetting[]) {
  return getViewSetting(settings, incomeChartFocus, allItems);
}

function getExpenseChartFocus(settings: DbSetting[]) {
  return getViewSetting(settings, expenseChartFocus, allItems);
}

function getCoarseFineView(settings: DbSetting[]) {
  return getViewSetting(settings, viewDetail, fine);
}

function getAssetOrDebtChartName(settings: DbSetting[], debt: boolean) {
  return getViewSetting(
    settings,
    debt ? debtChartFocus : assetChartFocus,
    allItems,
  );
}

function getAssetChartView(settings: DbSetting[]) {
  return getViewSetting(settings, assetChartView, assetChartVal);
}

function getTaxPerson(settings: DbSetting[]) {
  return getViewSetting(settings, taxChartFocusPerson, allItems);
}

function getTaxType(settings: DbSetting[]) {
  return getViewSetting(settings, taxChartFocusType, allItems);
}

function getTaxShowNet(settings: DbSetting[]) {
  const type = getViewSetting(settings, taxChartShowNet, allItems);
  return type === 'Y' || type === 'y' || type === 'yes';
}

// if HINT or TYPE are empty, leave pre-existing values
async function editViewSetting(
  settingInput: {
    NAME: string;
    VALUE: string;
  },
  settings: DbSetting[],
) {
  const idx = settings.find((i: DbItem) => {
    return i.NAME === settingInput.NAME;
  });
  if (idx !== undefined) {
    idx.VALUE = settingInput.VALUE;
  }
  return await refreshData(
    true, // gotoDB
  );
}

function setViewSettingNameVal(
  settings: DbSetting[],
  name: string,
  val: string,
) {
  editViewSetting(
    {
      NAME: name,
      VALUE: val,
    },
    settings,
  );
}

function makeFiltersList(
  gridData: { CATEGORY: string; NAME: string }[],
  selectedChartFocus: string,
  settingName: string,
  settings: DbSetting[],
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
        setViewSettingNameVal(settings, settingName, buttonName);
      }}
      title={buttonName}
      type={buttonName === selectedChartFocus ? 'primary' : 'secondary'}
      id={`select-${buttonName}`}
    />
  ));
  return <div role="group">{buttons}</div>;
}

export function coarseFineList(settings: DbSetting[]) {
  const viewTypes: string[] = [total, coarse, fine];
  const selectedCoarseFineView = getCoarseFineView(settings);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(settings, viewDetail, viewType);
      }}
      title={viewType}
      type={viewType === selectedCoarseFineView ? 'primary' : 'secondary'}
      id="chooseViewDetailType"
    />
  ));
  return <div role="group">{buttons}</div>;
}

export function frequencyList(settings: DbSetting[]) {
  const viewTypes: string[] = [monthly, annually];
  const selectedView = getViewSetting(settings, viewFrequency, annually);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(settings, viewFrequency, viewType);
      }}
      title={viewType}
      type={viewType === selectedView ? 'primary' : 'secondary'}
      id="chooseViewFrequencyType"
    />
  ));
  return <div role="group">{buttons}</div>;
}

export function getDefaultChartSettings(settings: DbSetting[]) {
  const showMonth =
    getSettings(
      settings,
      viewFrequency,
      annually,
      false, // be OK if there's no matching value
    ) === monthly;
  const showAge =
    getSettings(
      settings,
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

export function getSmallerChartSettings(settings: DbSetting[], title: string) {
  return {
    ...getDefaultChartSettings(settings),
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

function incomesChart(incomesChartData: ChartData[], chartSettings: any) {
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

export function incomesChartDiv(
  incomesChartData: ChartData[],
  chartSettings: any,
): any {
  if (incomesChartData.length === 0) {
    return (
      <>
        <br />
        No incomes data to display
        <br />
        <br />
      </>
    );
  } else {
    return incomesChart(incomesChartData, chartSettings);
  }
}
export function incomesChartDivWithButtons(
  model: DbModelData,
  settings: DbSetting[],
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
        getIncomeChartFocus(settings),
        incomeChartFocus,
        settings,
      )}
      {coarseFineList(settings)}
      {incomesChartDiv(incomesChartData, chartSettings)}
    </div>
  );
}

function expensesChart(expensesChartData: ChartData[], chartSettings: any) {
  return (
    <fieldset>
      <CanvasJSChart
        options={{
          ...chartSettings,
          data: expensesChartData,
        }}
      />
    </fieldset>
  );
}

export function expensesChartDiv(
  expensesChartData: ChartData[],
  chartSettings: any,
) {
  if (expensesChartData.length === 0) {
    return (
      <>
        <br />
        No expenses data to display
        <br />
        <br />
      </>
    );
  } else {
    return expensesChart(expensesChartData, chartSettings);
  }
}

export function expensesChartDivWithButtons(
  model: DbModelData,
  settings: DbSetting[],
  expensesChartData: ChartData[],
  chartSettings: any,
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
        getExpenseChartFocus(settings),
        expenseChartFocus,
        settings,
      )}
      {coarseFineList(settings)}
      <fieldset>
        <ReactiveTextArea
          identifier="expensesDataDump"
          message={showObj(expensesChartData)}
        />
        {expensesChartDiv(expensesChartData, chartSettings)}
      </fieldset>
    </div>
  );
}

function assetsOrDebtsButtonList(
  model: DbModelData,
  settings: DbSetting[],
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
  const selectedAssetOrDebt = getAssetOrDebtChartName(settings, isDebt);
  const buttons = assetOrDebtNames.map(assetOrDebt => (
    <Button
      key={assetOrDebt}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        if (isDebt) {
          setViewSettingNameVal(settings, debtChartFocus, assetOrDebt);
        } else {
          setViewSettingNameVal(settings, assetChartFocus, assetOrDebt);
        }
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

function assetViewTypeList(settings: DbSetting[]) {
  const viewTypes: string[] = [
    assetChartVal,
    assetChartAdditions,
    assetChartReductions,
    assetChartDeltas,
  ];
  const selectedAssetView = getAssetChartView(settings);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(settings, assetChartView, viewType);
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
  isDebt: boolean,
  chartSettings: any,
) {
  if (assetChartData.length === 0) {
    return (
      <>
        <br />
        No {isDebt ? 'debt' : 'asset'} data to display
        <br />
        <br />
      </>
    );
  } else {
    return (
      <CanvasJSChart
        options={{
          ...chartSettings,
          data: assetChartData,
        }}
      />
    );
  }
}

export function assetsOrDebtsChartDivWithButtons(
  model: DbModelData,
  viewSettings: DbSetting[],
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
      {assetsOrDebtsButtonList(model, viewSettings, isDebt, forOverviewPage)}
      {assetViewTypeList(viewSettings)}
      {coarseFineList(viewSettings)}
      <ReactiveTextArea
        identifier={isDebt ? 'debtDataDump' : 'assetDataDump'}
        message={showObj(assetChartData)}
      />
      {assetsOrDebtsChartDiv(
        assetChartData,
        isDebt,
        getDefaultChartSettings(viewSettings),
      )}
    </div>
  );
}

function taxButtonList(model: DbModelData, viewSettings: DbSetting[]) {
  const liabilityPeople = getLiabilityPeople(model);
  liabilityPeople.unshift(allItems);

  // console.log(`liablityPeople for tax buttons is ${showObj(liabilityPeople)}`);
  const buttons = liabilityPeople.map(person => (
    <Button
      key={person === allItems ? 'All people' : person}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusPerson, person);
      }}
      title={person === allItems ? 'All people' : person}
      type={person === getTaxPerson(viewSettings) ? 'primary' : 'secondary'}
      id={`chooseTaxSetting-${person}`}
    />
  ));
  buttons.push(
    <Button
      key={'All types'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusType, allItems);
      }}
      title={'All types'}
      type={getTaxType(viewSettings) === allItems ? 'primary' : 'secondary'}
      id={`chooseTaxType-all`}
    />,
  );
  buttons.push(
    <Button
      key={'income'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusType, income);
      }}
      title={'Income'}
      type={getTaxType(viewSettings) === income ? 'primary' : 'secondary'}
      id={`chooseTaxType-income`}
    />,
  );
  buttons.push(
    <Button
      key={'gain'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusType, gain);
      }}
      title={'Gain'}
      type={getTaxType(viewSettings) === gain ? 'primary' : 'secondary'}
      id={`chooseTaxType-income`}
    />,
  );
  buttons.push(
    <Button
      key={'Show net'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartShowNet, 'Y');
      }}
      title={'Show net'}
      type={getTaxShowNet(viewSettings) ? 'primary' : 'secondary'}
      id={`chooseTaxType-showNet`}
    />,
  );
  buttons.push(
    <Button
      key={'Hide net'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartShowNet, 'N');
      }}
      title={'Hide net'}
      type={!getTaxShowNet(viewSettings) ? 'primary' : 'secondary'}
      id={`chooseTaxType-hideNet`}
    />,
  );
  return <div role="group">{buttons}</div>;
}
export function taxChartDiv(taxChartData: ChartData[], settings: any) {
  if (taxChartData.length === 0) {
    return (
      <>
        <br />
        No tax data to display
        <br />
        <br />
      </>
    );
  }
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
  viewSettings: DbSetting[],
  taxChartData: ChartData[],
  settings: any,
) {
  return (
    <>
      {taxButtonList(model, viewSettings)}
      {taxChartDiv(taxChartData, settings)}
    </>
  );
}
export function taxDiv(
  model: DbModelData,
  viewSettings: DbSetting[],
  taxChartData: ChartData[],
) {
  if (!getDisplay(taxView)) {
    return;
  }

  return (
    <>
      {coarseFineList(viewSettings)}
      {taxChartDivWithButtons(
        model,
        viewSettings,
        taxChartData,
        getDefaultChartSettings(viewSettings),
      )}
    </>
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
