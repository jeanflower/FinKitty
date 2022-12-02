import { Col } from 'react-bootstrap';
import {
  ChartData,
  ChartSettings,
  finkittyButtonType,
  ItemCategory,
  ItemChartData,
  ModelData,
  Setting,
  ViewCallbacks,
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
  coarseDetail,
  fineDetail,
  gain,
  income,
  monthly,
  taxChartFocusPerson,
  taxChartFocusType,
  taxChartShowNet,
  taxView,
  totalDetail,
  viewDetail,
  viewFrequency,
  cpPrefix,
  penPrefix,
  weekly,
} from '../localization/stringConstants';
import { refreshData } from '../App';
import { Context, log, printDebug, showObj } from '../utils/utils';

import { makeButton } from './reactComponents/Button';
import React from 'react';
import ReactiveTextArea from './reactComponents/ReactiveTextArea';
import { ViewSettings } from '../models/charting';
import { AddDeleteEntryForm } from './reactComponents/AddDeleteEntryForm';
import { getSettings, getLiabilityPeople } from '../models/modelUtils';

import { Bar } from 'react-chartjs-2';

import { Container } from 'react-bootstrap';
import dateFormat from 'dateformat';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { getColor, getDisplay } from '../utils/viewUtils';
import { makeStringFromCashValue, makeTwoDP } from '../utils/stringUtils';
import { isNumberString } from '../models/checks';

export function makeBarData(
  labels: string[],
  chartData: ItemChartData[],
): ChartData {
  return {
    labels: labels,
    datasets: chartData.map((cd, index) => {
      const c = getColor(index);
      return {
        label: cd.item.NAME,
        data: cd.chartDataPoints.map((c) => {
          return Math.round(c.y * 100.0) / 100.0;
        }),
        backgroundColor: `rgb(${c.r},${c.g},${c.b})`,
        barPercentage: 1.0,
      };
    }),
    displayLegend: true,
  };
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
);

function getCoarseFineView(settings: ViewSettings) {
  return settings.getViewSetting(viewDetail, fineDetail);
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
  let needsRefreshData = false;
  if (name === viewFrequency) {
    // we do need to redo evaluations when we switch
    // between weekly and monthly/annually
    const oldVal = settings.getViewSetting(name, monthly);
    settings.setViewSetting(name, val);
    if (
      (oldVal === weekly && val !== weekly) ||
      (oldVal !== weekly && val === weekly)
    ) {
      needsRefreshData = true;
    }
  }
  settings.setViewSetting(name, val);
  return await refreshData(
    needsRefreshData, // refreshModel
    true, // refreshChart
    29, //sourceID
  );
}

function makeFilterButton(
  buttonName: string,
  settings: ViewSettings,
  context: Context,
  refreshModel: boolean,
  isCategory: boolean,
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

  let type: finkittyButtonType = 'primary';
  if (isCategory) {
    type = settings.highlightButton(context, buttonName)
      ? 'success'
      : 'outline-success';
  } else {
    type = settings.highlightButton(context, buttonName)
      ? 'primary'
      : 'outline-primary';
  }

  return makeButton(
    buttonName,
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.persist();
      settings.toggleViewFilter(context, buttonName);
      return await refreshData(
        refreshModel, // refreshModel
        true, // refreshChart
        30, //sourceID
      );
    },
    buttonName,
    id,
    type,
  );
}

export function filtersList(
  items: ItemCategory[],
  settings: ViewSettings,
  context: Context,
  refreshModel: boolean,
) {
  const incomeOrExpenseNames: string[] = items
    .map((data) => data.NAME)
    .sort((a: string, b: string) => {
      const aCP = a.startsWith(cpPrefix);
      const bCP = b.startsWith(cpPrefix);
      if (aCP && !bCP) {
        return 1;
      } else if (!aCP && bCP) {
        return -1;
      } else {
        const aP = a.startsWith(penPrefix);
        const bP = b.startsWith(penPrefix);
        if (aP && !bP) {
          return 1;
        } else if (!aP && bP) {
          return -1;
        } else {
          if (a === b) {
            return 0;
          } else {
            const aLTb = a < b;
            return aLTb ? -1 : 1;
          }
        }
      }
    });

  const buttons = incomeOrExpenseNames.map((buttonName) => {
    return makeFilterButton(buttonName, settings, context, refreshModel, false);
  });
  const categories: string[] = [];
  items.forEach((data) => {
    const cat = data.CATEGORY;
    if (cat !== '') {
      if (categories.indexOf(cat) < 0) {
        categories.push(cat);
      }
    }
  });
  categories.sort();
  categories.unshift(allItems);
  const categoryButtons = categories.map((buttonName) => {
    return makeFilterButton(buttonName, settings, context, refreshModel, true);
  });

  return (
    <>
      <div role="group">{categoryButtons}</div>
      <div role="group">{buttons}</div>
    </>
  );
}

export function startEndDateInputs(parentCallbacks: ViewCallbacks) {
  return (
    <div className="ml-3">
      <div className="row">
        <div className="col-3">
          <AddDeleteEntryForm
            name="Start"
            getValue={
              parentCallbacks.getStartDate
                ? parentCallbacks.getStartDate
                : () => {
                    return '';
                  }
            }
            submitFunction={
              parentCallbacks.updateStartDate
                ? parentCallbacks.updateStartDate
                : async () => {
                    return;
                  }
            }
            showAlert={parentCallbacks.showAlert}
          />
        </div>
        <div className="col-3">
          <AddDeleteEntryForm
            name="End"
            getValue={
              parentCallbacks.getEndDate
                ? parentCallbacks.getEndDate
                : () => {
                    return '';
                  }
            }
            submitFunction={
              parentCallbacks.updateEndDate
                ? parentCallbacks.updateEndDate
                : async () => {
                    return;
                  }
            }
            showAlert={parentCallbacks.showAlert}
          />
        </div>
        <div className="col" />
      </div>
    </div>
  );
}

export function coarseFineList(
  settings: ViewSettings,
  chartData: ChartData,
  parentCallbacks: ViewCallbacks,
) {
  const viewTypesDetail: string[] = [fineDetail, coarseDetail, totalDetail];
  const selectedCoarseFineView = getCoarseFineView(settings);
  const buttonsDetail = viewTypesDetail.map((viewType) =>
    makeButton(
      `${viewType}${tideLines(viewType, settings, chartData)}`,
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(settings, viewDetail, viewType);
      },
      viewType,
      `chooseViewDetailType${viewType}`,
      viewType === selectedCoarseFineView ? 'secondary' : 'outline-secondary',
    ),
  );
  const viewTypeFrequencys: string[] = [weekly, monthly, annually];
  const selectedView = settings.getViewSetting(viewFrequency, annually);
  const buttonsFrequency = viewTypeFrequencys.map((viewType) =>
    makeButton(
      viewType,
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(settings, viewFrequency, viewType);
      },
      viewType,
      'chooseViewFrequencyType',
      viewType === selectedView ? 'primary' : 'outline-primary',
    ),
  );
  return (
    <div role="group">
      {buttonsFrequency}
      {buttonsDetail}
      {startEndDateInputs(parentCallbacks)}
    </div>
  );
}

export function getDefaultChartSettings(
  settings: ViewSettings,
  modelSettings: Setting[],
): ChartSettings {
  //const showMonth =
  //  settings.getViewSetting(viewFrequency, annually) === monthly;
  const showAge = getSettings(modelSettings, birthDate, '') !== '';
  return {
    isSmall: false,
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
      labelFormatter: function (e: { label: string }) {
        /* istanbul ignore if  */
        if (printDebug()) {
          log(`e.value = ${e.label}`);
          log(`showAge = ${showAge}`);
        }
        return e.label;
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
    isSmall: true,
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

function makeBarChart(
  data: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
) {
  // log(`data in makeBarChart = ${JSON.stringify(data)}`);
  return (
    <Bar
      options={{
        plugins: {
          title: {
            display:
              chartSettings.title !== undefined && chartSettings.title.display,
            text:
              chartSettings.title !== undefined ? chartSettings.title.text : '',
          },
          legend: {
            display: data.displayLegend,
            position: 'right',
          },
        },
        animation: {
          duration: 0,
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              callback: function (value, index, values) {
                /* istanbul ignore if  */
                if (printDebug()) {
                  log(
                    `convert value ${value}, ${showObj(
                      values[index],
                    )} to make tick text`,
                  );
                }
                const l = data.labels[index];
                if (typeof l === 'number' || isNumberString(l)) {
                  return l;
                }
                const d = new Date(l);
                const freq = viewSettings.getViewSetting(
                  viewFrequency,
                  annually,
                );
                if (freq === weekly) {
                  return dateFormat(d, 'dd mmmm yyyy');
                } else if (freq === monthly) {
                  return dateFormat(d, 'mmmm yyyy');
                } else {
                  return dateFormat(d, 'yyyy');
                }
              },
            },
          },
          y: {
            stacked: true,
          },
        },
      }}
      data={data}
    />
  );
}

export function makeContainedBarChart(
  data: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
) {
  //  return (<Container>
  return (
    <Container style={{ height: `${chartSettings.height}px` }}>
      {makeBarChart(data, chartSettings, viewSettings)}
    </Container>
  );
}

function incomesChart(
  incomesChartData: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
) {
  if (chartSettings.isSmall) {
    return makeBarChart(incomesChartData, chartSettings, viewSettings);
  } else {
    return makeContainedBarChart(incomesChartData, chartSettings, viewSettings);
  }
}

function noDataToDisplayFragment(
  word: string,
  model: ModelData | undefined = undefined,
  parentCallbacks: ViewCallbacks,
) {
  // log(`in noDataToDisplayFragment`);
  if (
    model === undefined ||
    parentCallbacks.showAlert === undefined ||
    parentCallbacks.getStartDate === undefined ||
    parentCallbacks.updateStartDate === undefined ||
    parentCallbacks.getEndDate === undefined ||
    parentCallbacks.updateEndDate === undefined
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
        model.assets.filter((a) => {
          return a.IS_A_DEBT === false;
        }).length > 0;
    } else if (word === 'debt') {
      hasData =
        model.assets.filter((a) => {
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
          </div>
          <br />
          <br />
        </>
      );
    }
  }
}

export function incomesChartDiv(
  incomesChartData: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
  model: ModelData | undefined = undefined,
  parentCallbacks: ViewCallbacks,
): JSX.Element {
  if (incomesChartData.labels.length === 0) {
    log(`incomesChartData.length === 0, no data`);
    return noDataToDisplayFragment('income', model, parentCallbacks);
  } else {
    return incomesChart(incomesChartData, chartSettings, viewSettings);
  }
}
export function tideLines(
  viewType: string,
  settings: ViewSettings,
  chartData: ChartData,
): string {
  if (viewType !== totalDetail || getCoarseFineView(settings) !== totalDetail) {
    return '';
  }
  if (chartData.datasets[0] === undefined) {
    return '';
  }
  const mx = Math.max(...chartData.datasets[0].data);
  const mn = Math.min(...chartData.datasets[0].data);
  const mxString = makeStringFromCashValue(`${mx}`, '£');
  const mnString = makeStringFromCashValue(`${mn}`, '£');
  return ` min = ${mnString}, max = ${mxString}`;
}

export function incomesChartDivWithButtons(
  model: ModelData,
  settings: ViewSettings,
  incomesChartData: ChartData,
  chartSettings: ChartSettings,
  parentCallbacks: ViewCallbacks,
) {
  if (model.incomes.length === 0) {
    return (
      <>
        <ReactiveTextArea
          identifier="incomeDataDump"
          message={showObj(incomesChartData)}
        />
        {noDataToDisplayFragment('income', model, parentCallbacks)}
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
        {filtersList(model.incomes, settings, Context.Income, false)}
        {coarseFineList(settings, incomesChartData, parentCallbacks)}
        {incomesChartDiv(
          incomesChartData,
          chartSettings,
          settings,
          model,
          parentCallbacks,
        )}
      </div>
    );
  }
}

function expensesChart(
  expensesChartData: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
) {
  return makeContainedBarChart(expensesChartData, chartSettings, viewSettings);
}

export function expensesChartDiv(
  expensesChartData: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
  model: ModelData | undefined = undefined,
  parentCallbacks: ViewCallbacks,
) {
  if (expensesChartData.labels.length === 0) {
    return noDataToDisplayFragment('expense', model, parentCallbacks);
  } else {
    return expensesChart(expensesChartData, chartSettings, viewSettings);
  }
}

export function expensesChartDivWithButtons(
  model: ModelData,
  settings: ViewSettings,
  expensesChartData: ChartData,
  chartSettings: ChartSettings,
  parentCallbacks: ViewCallbacks,
) {
  if (model.expenses.length === 0) {
    return (
      <>
        <ReactiveTextArea
          identifier="expenseDataDump"
          message={showObj(expensesChartData)}
        />
        {noDataToDisplayFragment('expense', model, parentCallbacks)}
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
        {filtersList(model.expenses, settings, Context.Expense, false)}
        {coarseFineList(settings, expensesChartData, parentCallbacks)}
        <fieldset>
          {expensesChartDiv(
            expensesChartData,
            chartSettings,
            settings,
            model,
            parentCallbacks,
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
  const buttons = viewTypes.map((viewType) =>
    makeButton(
      viewType,
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(settings, chartViewType, viewType);
      },
      viewType,
      'chooseAssetChartType',
      viewType === selectedAssetView ? 'primary' : 'outline-primary',
    ),
  );
  return <div role="group">{buttons}</div>;
}

export function assetsOrDebtsChartDiv(
  assetChartData: ChartData,
  isDebt: boolean,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
  model: ModelData | undefined = undefined,
  parentCallbacks: ViewCallbacks,
) {
  if (assetChartData.labels.length === 0) {
    return noDataToDisplayFragment(
      isDebt ? 'debt' : 'asset',
      model,
      parentCallbacks,
    );
  } else {
    return makeContainedBarChart(assetChartData, chartSettings, viewSettings);
  }
}

export function assetsOrDebtsChartDivWithButtons(
  model: ModelData,
  viewSettings: ViewSettings,
  assetChartData: ChartData,
  isDebt: boolean,
  parentCallbacks: ViewCallbacks,
) {
  if (
    model.assets.filter((a) => {
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
        {noDataToDisplayFragment(word, model, parentCallbacks)}
      </>
    );
  } else {
    // log(`assetChartData = ${assetChartData}`);
    const context = isDebt ? Context.Debt : Context.Asset;
    const items = model.assets.filter((obj) => {
      return obj.IS_A_DEBT === (context === Context.Debt);
    });

    return (
      <div
        style={{
          display: 'block',
        }}
      >
        {filtersList(items, viewSettings, context, false)}
        {assetViewTypeList(viewSettings)}
        {coarseFineList(viewSettings, assetChartData, parentCallbacks)}
        <ReactiveTextArea
          identifier={isDebt ? 'debtDataDump' : 'assetDataDump'}
          message={showObj(assetChartData)}
        />
        {assetsOrDebtsChartDiv(
          assetChartData,
          isDebt,
          getDefaultChartSettings(viewSettings, model.settings),
          viewSettings,
          model,
          parentCallbacks,
        )}
      </div>
    );
  }
}

function taxButtonList(model: ModelData, viewSettings: ViewSettings) {
  const liabilityPeople = getLiabilityPeople(model);
  liabilityPeople.unshift(allItems);

  // log(`liablityPeople for tax buttons is ${showObj(liabilityPeople)}`);
  const buttons = liabilityPeople.map((person) =>
    makeButton(
      person === allItems ? 'All people' : person,
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusPerson, person);
      },
      person === allItems ? 'All people' : person,
      `chooseTaxSetting-${person}`,
      person === getTaxPerson(viewSettings) ? 'primary' : 'outline-primary',
    ),
  );
  buttons.push(
    makeButton(
      'All types',
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusType, allItems);
      },
      'All types',
      `chooseTaxType-all`,
      getTaxType(viewSettings) === allItems ? 'secondary' : 'outline-secondary',
    ),
  );
  buttons.push(
    makeButton(
      'Income',
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusType, income);
      },
      'income',
      `chooseTaxType-income`,
      getTaxType(viewSettings) === income ? 'secondary' : 'outline-secondary',
    ),
  );
  buttons.push(
    makeButton(
      'Gain',
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartFocusType, gain);
      },
      'gain',
      `chooseTaxType-gain`,
      getTaxType(viewSettings) === gain ? 'secondary' : 'outline-secondary',
    ),
  );
  buttons.push(
    makeButton(
      'Show net',
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartShowNet, 'Y');
      },
      'Show net',
      `chooseTaxType-showNet`,
      getTaxShowNet(viewSettings) ? 'success' : 'outline-success',
    ),
  );
  buttons.push(
    makeButton(
      'Hide net',
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.persist();
        setViewSettingNameVal(viewSettings, taxChartShowNet, 'N');
      },
      'Hide net',
      `chooseTaxType-hideNet`,
      !getTaxShowNet(viewSettings) ? 'success' : 'outline-success',
    ),
  );
  return <div role="group">{buttons}</div>;
}
export function taxChartDiv(
  taxChartData: ChartData,
  chartSettings: ChartSettings,
  viewSettings: ViewSettings,
  parentCallbacks: ViewCallbacks,
) {
  if (taxChartData.labels.length === 0) {
    if (
      parentCallbacks.showAlert === undefined ||
      parentCallbacks.getStartDate === undefined ||
      parentCallbacks.updateStartDate === undefined ||
      parentCallbacks.getEndDate === undefined ||
      parentCallbacks.updateEndDate === undefined
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
          </Col>
        </>
      );
    }
  }
  return makeContainedBarChart(taxChartData, chartSettings, viewSettings);
}

function taxChartDivWithButtons(
  model: ModelData,
  viewSettings: ViewSettings,
  taxChartData: ChartData,
  settings: ChartSettings,
  parentCallbacks: ViewCallbacks,
) {
  return (
    <>
      {taxButtonList(model, viewSettings)}
      {coarseFineList(viewSettings, taxChartData, parentCallbacks)}
      {taxChartDiv(taxChartData, settings, viewSettings, parentCallbacks)}
    </>
  );
}
export function taxDiv(
  model: ModelData,
  viewSettings: ViewSettings,
  taxChartData: ChartData,
  totalTaxPaid: number,
  parentCallbacks: ViewCallbacks,
) {
  if (!getDisplay(taxView)) {
    // log(`don't populate taxView`);
    return;
  }
  // log(`do populate taxView`);

  return (
    <div className="ml-3">
      {taxChartDivWithButtons(
        model,
        viewSettings,
        taxChartData,
        getDefaultChartSettings(viewSettings, model.settings),
        parentCallbacks,
      )}
      <h2>Total tax paid: {makeTwoDP(totalTaxPaid)}</h2>
    </div>
  );
}

export function optimizationDiv(
  model: ModelData,
  settings: ViewSettings,
  data: ChartData,
  chartSettings: ChartSettings,
) {
  return (
    <div
      style={{
        display: 'block',
      }}
    >
      {makeBarChart(data, chartSettings, settings)}
    </div>
  );
}
