import { ChartData, DbModelData } from '../types/interfaces';
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
  log,
  printDebug,
  showObj,
} from '../utils';

import Button from './reactComponents/Button';
import CanvasJS from '../assets/js/canvasjs.min';
import CanvasJSReact from '../assets/js/canvasjs.react';
import React from 'react';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';
import { ViewSettings } from '../models/charting';

const { CanvasJSChart } = CanvasJSReact;


function getIncomeChartFocus(settings: ViewSettings) {
  return settings.getViewSetting(incomeChartFocus, allItems);
}

function getExpenseChartFocus(settings: ViewSettings) {
  return settings.getViewSetting(expenseChartFocus, allItems);
}

function getCoarseFineView(settings: ViewSettings) {
  return settings.getViewSetting(viewDetail, fine);
}

function getAssetOrDebtChartName(settings: ViewSettings, debt: boolean) {
  return settings.getViewSetting(
    debt ? debtChartFocus : assetChartFocus,
    allItems,
  );
}

function getAssetChartView(settings: ViewSettings) {
  return settings.getViewSetting(assetChartView, assetChartVal);
}

function getTaxPerson(settings: ViewSettings) {
  return settings.getViewSetting(taxChartFocusPerson, allItems);
}

function getTaxType(settings: ViewSettings) {
  return settings.getViewSetting(taxChartFocusType, allItems);
}

function getTaxShowNet(settings: ViewSettings) {
  const type = settings.getViewSetting(taxChartShowNet, allItems);
  return type === 'Y' || type === 'y' || type === 'yes';
}

// if HINT or TYPE are empty, leave pre-existing values
async function editViewSetting(
  settingInput: {
    NAME: string;
    VALUE: string;
  },
  settings: ViewSettings,
) {
  settings.setViewSetting(
    settingInput.NAME,
    settingInput.VALUE,
  );
  return await refreshData(
    true, // gotoDB
  );
}

function setViewSettingNameVal(
  settings: ViewSettings,
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

function makeFilterButton(
  buttonName: string,
  settings: ViewSettings,
  settingName: string,
  selectedChartFocus: string,
) {
  return (
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
  );
}

function makeFiltersList(
  gridData: { CATEGORY: string; NAME: string }[],
  selectedChartFocus: string,
  settingName: string,
  settings: ViewSettings,
) {
  // selectedChartFocus = this.getExpenseChartFocus()
  // settingName = expenseChartFocus
  // defaultSetting = expenseChartFocusAll
  // hint = expenseChartFocusHint
  let buttonNames: string[] = [];
  const names: string[] = [];
  gridData.forEach(e => {
    const candidate = e.NAME;
    if (names.indexOf(candidate) < 0) {
      names.push(candidate);
    }
  });
  names.sort();
  buttonNames = buttonNames.concat(names);

  const buttons1 = buttonNames.map(buttonName => {
    return makeFilterButton(
      buttonName,
      settings,
      settingName,
      selectedChartFocus,
    );
  });
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
  categories.unshift(allItems);
  const buttons2 = categories.map(buttonName => {
    return makeFilterButton(
      buttonName,
      settings,
      settingName,
      selectedChartFocus,
    );
  });

  return (
    <>
      <div role="group">{buttons2}</div>
      <br></br>
      <div role="group">{buttons1}</div>
      <br></br>
    </>
  );
}

export function coarseFineList(settings: ViewSettings) {
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

export function frequencyList(settings: ViewSettings) {
  const viewTypes: string[] = [monthly, annually];
  const selectedView = settings.getViewSetting(viewFrequency, annually);
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

export function getDefaultChartSettings(settings: ViewSettings) {
  const showMonth =
    settings.getViewSetting(
      viewFrequency,
      annually,
    ) === monthly;
  const showAge =
    settings.getViewSetting(
      birthDate,
      '',
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

export function getSmallerChartSettings(settings: ViewSettings, title: string) {
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
  settings: ViewSettings,
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
  settings: ViewSettings,
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

function makeButton(
  assetOrDebt: string,
  isDebt: boolean,
  settings: ViewSettings,
  selectedAssetOrDebt: string,
  forOverview: boolean,
) {
  return (
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
  );
}

function assetsOrDebtsButtonList(
  model: DbModelData,
  settings: ViewSettings,
  isDebt: boolean,
  forOverview: boolean,
) {
  const assetsOrDebts = model.assets.filter(obj => {
    return obj.IS_A_DEBT === isDebt;
  });
  const assetOrDebtNames: string[] = assetsOrDebts
    .map(data => data.NAME)
    .sort();
  // log(`assetNames = ${assetNames}`);
  // log(`assetNames with categories = ${assetNames}`);
  const selectedAssetOrDebt = getAssetOrDebtChartName(settings, isDebt);
  const assetOrDebtButtons = assetOrDebtNames.map(assetOrDebt => {
    return makeButton(
      assetOrDebt,
      isDebt,
      settings,
      selectedAssetOrDebt,
      forOverview,
    );
  });
  let categoryNames: string[] = [];
  assetsOrDebts.forEach(data => {
    const cat = data.CATEGORY;
    if (cat !== '') {
      if (categoryNames.indexOf(cat) < 0) {
        categoryNames.push(cat);
      }
    }
  });
  categoryNames = categoryNames.sort();
  categoryNames.unshift(allItems);
  const categoryButtons = categoryNames.map(category => {
    return makeButton(
      category,
      isDebt,
      settings,
      selectedAssetOrDebt,
      forOverview,
    );
  });
  return (
    <>
      <div role="group">{categoryButtons}</div>
      <br></br>
      <div role="group">{assetOrDebtButtons}</div>
      <br></br>
    </>
  );
}

function assetViewTypeList(settings: ViewSettings) {
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
  viewSettings: ViewSettings,
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

function taxButtonList(model: DbModelData, viewSettings: ViewSettings) {
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
  viewSettings: ViewSettings,
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
  viewSettings: ViewSettings,
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
