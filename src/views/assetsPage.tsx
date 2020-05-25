import React from 'react';
import { ChartData, DbModelData } from './../types/interfaces';
import {
  assetsChart,
  assetsTable,
  assetsView,
  deleteAsset,
  getDisplay,
  showContent,
  submitAsset,
  submitTrigger,
  toggleDisplay,
  submitTransaction,
} from './../App';
import Button from './reactComponents/Button';
import { assetsOrDebtsChartDiv } from './chartPages';
import { assetsOrDebtsTableDiv, transactionsTableDiv } from './tablePages';
import { AddDeleteAssetForm } from './reactComponents/AddDeleteAssetForm';
import { checkAsset, checkTransaction } from '../models/checks';
import { revalueAsset } from '../localization/stringConstants';
import DataGrid from './reactComponents/DataGrid';
import NameFormatter from './reactComponents/NameFormatter';
import CashValueFormatter from './reactComponents/CashValueFormatter';
import { log } from './../utils';


const defaultColumn = {
  editable: true,
  resizable: true,
  sortable: true,
};

export function assetsDiv(
  model: DbModelData,
  showAlert: (arg0: string) => void,
  assetChartData: ChartData[],
  todaysValues: Map<string, number>,
) {
  if (!getDisplay(assetsView)) {
    return;
  }

  return (
    <div style={{ display: getDisplay(assetsView) ? 'block' : 'none' }}>
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          toggleDisplay(assetsChart);
        }}
        title={`${showContent.get(assetsChart).display ? 'Hide ' : 'Show '}${
          assetsChart.lc
        }`}
        type={showContent.get(assetsChart).display ? 'primary' : 'secondary'}
        key={assetsChart.lc}
        id="toggleAssetsChart"
      />
      <Button
        action={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.persist();
          toggleDisplay(assetsTable);
        }}
        title={`${showContent.get(assetsTable).display ? 'Hide ' : 'Show '}${
          assetsTable.lc
        }`}
        type={showContent.get(assetsTable).display ? 'primary' : 'secondary'}
        key={assetsTable.lc}
        id="toggleAssetsTable"
      />
      {assetsOrDebtsChartDiv(model, assetChartData, false)}
      {assetsOrDebtsTableDiv(model, showAlert, false)}
      <h4>Revalue assets</h4>
      {transactionsTableDiv(model, showAlert, revalueAsset)}

      <h4>Today's values</h4>
        <DataGrid
            deleteFunction={async (name)=>{return false;}}
            handleGridRowsUpdated={function() {return false;}}
            rows={Array.from(todaysValues.entries()).map((key, value)=>{
              // log(`key[0] = ${key[0]}, key[1] = ${key[1]}`);
              return {
                'NAME': key[0],
                'VALUE': `${key[1]}`,
              }
            })}
            columns={[
              {
                ...defaultColumn,
                key: 'NAME',
                name: 'name',
                formatter: <NameFormatter value="unset" />,
              },
              {
                ...defaultColumn,
                key: 'VALUE',
                name: `today's value`,
                formatter: (
                  <CashValueFormatter
                    value="unset"
                  />
                ),
              },
            ]}
        />

      <div className="addNewAsset">
        <h4> Add an asset or pension </h4>
        <AddDeleteAssetForm
          checkAssetFunction={checkAsset}
          submitAssetFunction={submitAsset}
          checkTransactionFunction={checkTransaction}
          submitTransactionFunction={submitTransaction}
          deleteAssetFunction={deleteAsset}
          submitTriggerFunction={submitTrigger}
          model={model}
          showAlert={showAlert}
        />
      </div>
    </div>
  );
}
