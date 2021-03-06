import {
  ChartData,
  ChartSettings,
  ItemCategory,
  ModelData,
  Setting,
} from '../types/interfaces';
import {
  allItems,
  annually,
  chartAdditions,
  chartDeltas,
  chartReductions,
  chartVals,
  chartViewType,
  birthDate,
  coarse,
  fine,
  gain,
  income,
  monthly,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxView,
  total,
  viewDetail,
  viewFrequency,
  pensionAllowance,
} from '../localization/stringConstants';
import { getDisplay, refreshData } from '../App';
import { Context, log, printDebug, showObj } from '../utils';

import Button from './reactComponents/Button';
import CanvasJS from '../assets/js/canvasjs.min';
import CanvasJSReact from '../assets/js/canvasjs.react';
import React from 'react';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';
import { ViewSettings } from '../models/charting';
import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';
import { getSettings, getLiabilityPeople } from '../models/modelUtils';

const { CanvasJSChart } = CanvasJSReact;

function getCoarseFineView(settings: ViewSettings) {
  return settings.getViewSetting(viewDetail, fine);
}

function getAssetChartView(settings: ViewSettings) {
  return settings.getViewSetting(chartViewType, chartVals);
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

async function setViewSettingNameVal(
  settings: ViewSettings,
  name: string,
  val: string,
) {
  settings.setViewSetting(name, val);
  return await refreshData(
    false, // refreshModel = true,
    true, // refreshChart = true,
  );
}

function makeFilterButton(
  buttonName: string,
  settings: ViewSettings,
  context: Context,
) {
  let id = '';
  if (context === Context.Income) {
    id = `select-${buttonName}`;
  } else if (context === Context.Expense) {
    id = `select-${buttonName}`;
  } else if (context === Context.Asset) {
    id = `chooseAssetOrDebtChartSetting--asset-${buttonName}`;
  } else if (context === Context.Debt) {
    id = `chooseAssetOrDebtChartSetting--debt-${buttonName}`;
  }

  return (
    <Button
      key={buttonName}
      action={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        settings.toggleViewFilter(context, buttonName);
        return await refreshData(
          false, // refreshModel = true,
          true, // refreshChart = true,
        );
      }}
      title={buttonName}
      type={
        settings.highlightButton(context, buttonName) ? 'primary' : 'secondary'
      }
      id={id}
    />
  );
}

function filtersList(
  items: ItemCategory[],
  settings: ViewSettings,
  context: Context,
) {
  const incomeOrExpenseNames: string[] = items.map(data => data.NAME).sort();

  const buttons = incomeOrExpenseNames.map(buttonName => {
    return makeFilterButton(buttonName, settings, context);
  });
  const categories: string[] = [];
  items.forEach(data => {
    const cat = data.CATEGORY;
    if (cat !== '') {
      if (categories.indexOf(cat) < 0) {
        categories.push(cat);
      }
    }
  });
  categories.sort();
  categories.unshift(allItems);
  const categoryButtons = categories.map(buttonName => {
    return makeFilterButton(buttonName, settings, context);
  });

  return (
    <>
      <div role="group">{categoryButtons}</div>
      <div role="group">{buttons}</div>
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
      id={`chooseViewDetailType${viewType}`}
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

export function getDefaultChartSettings(
  settings: ViewSettings,
  modelSettings: Setting[],
): ChartSettings {
  const showMonth =
    settings.getViewSetting(viewFrequency, annually) === monthly;
  const showAge = getSettings(modelSettings, birthDate, '') !== '';
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
      display: true,
    },

    axisX: {
      labelFormatter: function(e: { label: string }) {
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

export function getSmallerChartSettings(
  settings: ViewSettings,
  modelSettings: Setting[],
  title: string,
): ChartSettings {
  return {
    ...getDefaultChartSettings(settings, modelSettings),
    height: 200,
    width: 400,
    title: {
      display: true,
      text: title,
    },
    // see also suppressLegend()
    legend: {
      fontFamily: 'Helvetica',
      fontWeight: 'normal',
      horizontalAlign: 'right', // left, center ,right
      verticalAlign: 'center', // top, center, bottom
      display: false,
    },
  };
}

function incomesChart(
  incomesChartData: ChartData[],
  chartSettings: ChartSettings,
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

function noDataToDisplayFragment(
  word: string,
  model: ModelData | undefined = undefined,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  // log(`in noDataToDisplayFragment`);
  if (
    model === undefined ||
    showAlert === undefined ||
    getStartDate === undefined ||
    updateStartDate === undefined ||
    getEndDate === undefined ||
    updateEndDate === undefined
  ) {
    return (
      <>
        <br />
        No {word} data in range
        <br />
        <br />
      </>
    );
  } else {
    let hasData = false;
    if (word === 'income') {
      hasData = model.incomes.length > 0;
    } else if (word === 'expense') {
      hasData = model.expenses.length > 0;
    } else if (word === 'asset') {
      hasData =
        model.assets.filter(a => {
          return a.IS_A_DEBT === false;
        }).length > 0;
    } else if (word === 'debt') {
      hasData =
        model.assets.filter(a => {
          return a.IS_A_DEBT === true;
        }).length > 0;
    }
    // log(`hasData = ${hasData}`);
    if (!hasData) {
      return <></>;
    } else {
      return (
        <>
          No {word}s data - add {word}, change view filters, or adjust display
          range
          <br />
          <div className="d-inline-flex p-2">
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
          </div>
          <br />
          <br />
        </>
      );
    }
  }
}

export function incomesChartDiv(
  incomesChartData: ChartData[],
  chartSettings: ChartSettings,
  model: ModelData | undefined = undefined,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
): JSX.Element {
  if (incomesChartData.length === 0) {
    log(`incomesChartData.length === 0, no data`);
    return noDataToDisplayFragment(
      'income',
      model,
      showAlert,
      getStartDate,
      updateStartDate,
      getEndDate,
      updateEndDate,
    );
  } else {
    return incomesChart(incomesChartData, chartSettings);
  }
}
export function incomesChartDivWithButtons(
  model: ModelData,
  settings: ViewSettings,
  incomesChartData: ChartData[],
  chartSettings: ChartSettings,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (model.incomes.length === 0) {
    return (
      <>
        <ReactiveTextArea
          identifier="incomeDataDump"
          message={showObj(incomesChartData)}
        />
        {noDataToDisplayFragment(
          'income',
          model,
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        )}
      </>
    );
  } else {
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
        {filtersList(model.incomes, settings, Context.Income)}
        {coarseFineList(settings)}
        {incomesChartDiv(
          incomesChartData,
          chartSettings,
          model,
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        )}
      </div>
    );
  }
}

function expensesChart(
  expensesChartData: ChartData[],
  chartSettings: ChartSettings,
) {
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
  chartSettings: ChartSettings,
  model: ModelData | undefined = undefined,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (expensesChartData.length === 0) {
    return noDataToDisplayFragment(
      'expense',
      model,
      showAlert,
      getStartDate,
      updateStartDate,
      getEndDate,
      updateEndDate,
    );
  } else {
    return expensesChart(expensesChartData, chartSettings);
  }
}

export function expensesChartDivWithButtons(
  model: ModelData,
  settings: ViewSettings,
  expensesChartData: ChartData[],
  chartSettings: ChartSettings,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (model.expenses.length === 0) {
    return (
      <>
        <ReactiveTextArea
          identifier="expenseDataDump"
          message={showObj(expensesChartData)}
        />
        {noDataToDisplayFragment(
          'expense',
          model,
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        )}
      </>
    );
  } else {
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
        {filtersList(model.expenses, settings, Context.Expense)}
        {coarseFineList(settings)}
        <fieldset>
          <ReactiveTextArea
            identifier="expensesDataDump"
            message={showObj(expensesChartData)}
          />
          {expensesChartDiv(
            expensesChartData,
            chartSettings,
            model,
            showAlert,
            getStartDate,
            updateStartDate,
            getEndDate,
            updateEndDate,
          )}
        </fieldset>
      </div>
    );
  }
}

function assetViewTypeList(settings: ViewSettings) {
  const viewTypes: string[] = [
    chartVals,
    chartAdditions,
    chartReductions,
    chartDeltas,
  ];
  const selectedAssetView = getAssetChartView(settings);
  const buttons = viewTypes.map(viewType => (
    <Button
      key={viewType}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(settings, chartViewType, viewType);
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
  chartSettings: ChartSettings,
  model: ModelData | undefined = undefined,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (assetChartData.length === 0) {
    return noDataToDisplayFragment(
      isDebt ? 'debt' : 'asset',
      model,
      showAlert,
      getStartDate,
      updateStartDate,
      getEndDate,
      updateEndDate,
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
  model: ModelData,
  viewSettings: ViewSettings,
  assetChartData: ChartData[],
  isDebt: boolean,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (
    model.assets.filter(a => {
      return a.IS_A_DEBT === isDebt;
    }).length === 0
  ) {
    const word = isDebt ? 'debt' : 'asset';
    const dataDumpName = `${word}DataDump`;
    return (
      <>
        <ReactiveTextArea
          identifier={dataDumpName}
          message={showObj(assetChartData)}
        />
        {noDataToDisplayFragment(
          word,
          model,
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        )}
      </>
    );
  } else {
    // log(`assetChartData = ${assetChartData}`);
    const context = isDebt ? Context.Debt : Context.Asset;
    const items = model.assets.filter(obj => {
      return obj.IS_A_DEBT === (context === Context.Debt);
    });

    return (
      <div
        style={{
          display: 'block',
        }}
      >
        {filtersList(items, viewSettings, context)}
        {assetViewTypeList(viewSettings)}
        {coarseFineList(viewSettings)}
        <ReactiveTextArea
          identifier={isDebt ? 'debtDataDump' : 'assetDataDump'}
          message={showObj(assetChartData)}
        />
        {assetsOrDebtsChartDiv(
          assetChartData,
          isDebt,
          getDefaultChartSettings(viewSettings, model.settings),
          model,
          showAlert,
          getStartDate,
          updateStartDate,
          getEndDate,
          updateEndDate,
        )}
      </div>
    );
  }
}

function taxButtonList(model: ModelData, viewSettings: ViewSettings) {
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
      id={`chooseTaxType-gain`}
    />,
  );
  buttons.push(
    <Button
      key={'pensionAllowance'}
      action={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.persist();
        setViewSettingNameVal(
          viewSettings,
          taxChartFocusType,
          pensionAllowance,
        );
      }}
      title={'Pension allowance'}
      type={
        getTaxType(viewSettings) === pensionAllowance ? 'primary' : 'secondary'
      }
      id={`chooseTaxType-pension`}
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
export function taxChartDiv(
  taxChartData: ChartData[],
  settings: ChartSettings,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  if (taxChartData.length === 0) {
    if (
      showAlert === undefined ||
      getStartDate === undefined ||
      updateStartDate === undefined ||
      getEndDate === undefined ||
      updateEndDate === undefined
    ) {
      return (
        <>
          <br />
          No tax data to display
          <br />
          <br />
        </>
      );
    } else {
      return (
        <>
          No tax data - none payable or adjust display range
          <div className="col">
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
          </div>
        </>
      );
    }
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
  model: ModelData,
  viewSettings: ViewSettings,
  taxChartData: ChartData[],
  settings: ChartSettings,
  showAlert: ((arg0: string) => void) | undefined = undefined,
  getStartDate: (() => string) | undefined = undefined,
  updateStartDate: ((newDate: string) => Promise<void>) | undefined = undefined,
  getEndDate: (() => string) | undefined = undefined,
  updateEndDate: ((newDate: string) => Promise<void>) | undefined = undefined,
) {
  return (
    <>
      {taxButtonList(model, viewSettings)}
      {coarseFineList(viewSettings)}
      {taxChartDiv(
        taxChartData,
        settings,
        showAlert,
        getStartDate,
        updateStartDate,
        getEndDate,
        updateEndDate,
      )}
    </>
  );
}
export function taxDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  taxChartData: ChartData[],
) {
  if (!getDisplay(taxView)) {
    return;
  }

  return (
    <div className="ml-3">

      {taxChartDivWithButtons(
        model,
        viewSettings,
        taxChartData,
        getDefaultChartSettings(viewSettings, model.settings),
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
