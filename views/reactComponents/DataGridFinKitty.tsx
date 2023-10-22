import React from 'react';
import DataGrid from 'react-data-grid';
import { log, printDebug, showObj } from '../../utils/utils';
import { getTriggerDate } from '../../utils/stringUtils';
import { DeleteResult, ModelData } from '../../types/interfaces';
import { getVarVal } from '../../models/modelQueries';
import ReactiveTextArea from './ReactiveTextArea';
import { inspect } from 'util';
import 'react-data-grid/lib/styles.css';

/**
 * Samples:
 * https://adazzle.github.io/react-data-grid/examples.html#/all-features
 */
export type GridRow = any;

interface DataGridProps {
  handleGridRowsUpdated?: any; // TODO any
  rows: GridRow[]; // TODO any
  columns: any[]; // TODO any
  model: ModelData;
  tableID: string;
}
interface DataGridState {
  colSortIndex: string;
  sortDirection: 'ASC' | 'DESC' | 'NONE';
}
class DataGridFinKitty extends React.Component<DataGridProps, DataGridState> {
  sortedIndices: number[];

  public constructor(props: DataGridProps) {
    super(props);

    // console.log(`in DataGridFinKitty, props are ${inspect(props)}`);

    this.sortedIndices = props.rows.map((row) => {
      return row['index'];
    });
    // log(`row indices are ${props.rows.map((r)=>{return r['index'];})}`);
    // log(`sortedIndices are ${this.sortedIndices}`);
    this.state = {
      colSortIndex: 'index',
      sortDirection: 'NONE',
    };
    this.handleSort(this.state.colSortIndex, 'NONE');
  }

  public rowGetter(i: number) {
    /* istanbul ignore if  */
    if (printDebug()) {
      log(
        `in rowgetter, this.props.rows indices = ${this.props.rows.map((r) => {
          return r['index'];
        })}`,
      );
      log(`look for row i = ${i}`);
      log(`this.sortedIndices = ${this.sortedIndices}`);
    }

    const result = this.props.rows.filter((row) => {
      return row['index'] === this.sortedIndices[i];
    })[0];
    //if(result == undefined){
    //  log(`in rowgetter, result row ${i} has sorted index ${this.sortedIndices[i]} and row = undefined`);
    //}
    return result;
  }
  public getSize() {
    return this.props.rows.length;
  }

  private handleSort(
    sortColumn: string,
    sortDirection: 'ASC' | 'DESC' | 'NONE',
  ) {
    //log(`this.props.rows.slice() indices = ${showObj(this.props.rows.slice().map((row)=>{
    //  return row['index'];
    //}))}`);
    const v = getVarVal(this.props.model.settings);

    if (sortDirection === 'NONE') {
      this.sortedIndices = this.props.rows
        .slice()
        .sort((a, b) => {
          const ai = a['index'];
          const bi = b['index'];
          return ai < bi ? 1 : ai > bi ? -1 : 0;
        })
        .map((row) => {
          return row['index'];
        });
      // log(`unsortedIndices = ${showObj(this.sortedIndices)}`);
      return;
    }

    this.sortedIndices = this.props.rows
      .slice()
      .sort((a, b) => {
        // log(`sortColumn = ${sortColumn}`);
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        /* istanbul ignore if  */
        if (printDebug()) {
          log(`aVal = ${showObj(aVal)}, bVal = ${showObj(bVal)}`);
        }
        if (aVal === undefined || bVal === undefined) {
          aVal = a[this.props.columns[0]];
          bVal = b[this.props.columns[0]];
        }
        if (
          sortColumn === 'DATE' ||
          sortColumn === 'START' ||
          sortColumn === 'END' ||
          sortColumn === 'VALUE_SET'
        ) {
          // log(`sortColumn is time-based`);
          const aTimeVal = getTriggerDate(
            aVal,
            this.props.model.triggers,
            v,
          ).getTime();
          const bTimeVal = getTriggerDate(
            bVal,
            this.props.model.triggers,
            v,
          ).getTime();
          // this puts triggers seperate from dates
          // const aTimeVal = new Date(aVal).getTime();
          // const bTimeVal = new Date(bVal).getTime();
          // log(`aTimeVal = ${aTimeVal}, bTimeVal = ${bTimeVal}`);
          const aIsDate = !Number.isNaN(aTimeVal);
          const bIsDate = !Number.isNaN(bTimeVal);
          // log(`aIsDate = ${aIsDate}, bIsDate = ${bIsDate}`);
          if (aIsDate && !bIsDate) {
            // log('return 1');
            return 1;
          } else if (!aIsDate && bIsDate) {
            // log('return -1');
            return -1;
          } else if (aIsDate && bIsDate) {
            aVal = aTimeVal;
            bVal = bTimeVal;
          }
          //log(`aVal = ${showObj(aVal)}, bVal = ${showObj(bVal)}`);
        } else if (
          sortColumn === 'VALUE' ||
          sortColumn === 'FROM_VALUE' ||
          sortColumn === 'TO_VALUE' ||
          sortColumn === 'OLD_VALUE' ||
          sortColumn === 'NEW_VALUE' ||
          sortColumn === 'CHANGE' ||
          sortColumn === 'QOLD_VALUE' ||
          sortColumn === 'QNEW_VALUE' ||
          sortColumn === 'QCHANGE'
        ) {
          if (aVal.endsWith('%') && !bVal.endsWith('%')) {
            return this.state.sortDirection === 'ASC' ? +1 : -1;
          } else if (!aVal.endsWith('%') && bVal.endsWith('%')) {
            return this.state.sortDirection === 'ASC' ? -1 : +1;
          }
          const paVal = parseFloat(aVal);
          const pbVal = parseFloat(bVal);
          if (Number.isNaN(paVal) && !Number.isNaN(pbVal)) {
            return this.state.sortDirection === 'ASC' ? 1 : -1;
          }
          if (!Number.isNaN(paVal) && Number.isNaN(pbVal)) {
            return this.state.sortDirection === 'ASC' ? -1 : +1;
          } else if (!Number.isNaN(paVal) && !Number.isNaN(pbVal)) {
            return paVal < pbVal
              ? this.state.sortDirection === 'ASC'
                ? +1
                : -1
              : paVal > pbVal
              ? this.state.sortDirection === 'ASC'
                ? -1
                : +1
              : 0;
          }
        } else if (sortColumn === 'index') {
        } else if (aVal !== undefined && bVal !== undefined) {
          aVal = aVal.toUpperCase();
          bVal = bVal.toUpperCase();
        }
        // log(`aVal = ${aVal}, bVal = ${bVal}`);
        if (aVal < bVal) {
          if (this.state.sortDirection === 'ASC') {
            return +1;
          } else {
            return -1;
          }
        } else if (aVal > bVal) {
          if (this.state.sortDirection === 'ASC') {
            return -1;
          } else {
            return +1;
          }
        } else {
          return 0;
        }
      })
      .map((row) => {
        return row['index'];
      });
  }

  private sortHandler(
    sortColumn: string,
    sortDirection: 'ASC' | 'DESC' | 'NONE',
  ) {
    // log(`sortColumn = ${sortColumn}`);
    // log(`sortDirection = ${sortDirection}`);
    this.setState({
      colSortIndex: sortColumn,
      sortDirection: sortDirection,
    });

    // run the sort in the render function instead
    // to ensure sortedIndices gets updated when needed
    // this.handleSort(sortColumn, sortDirection);
    // log(`sortedIndices = ${showObj(this.sortedIndices)}`);
  }
/*
  private getCellActions(column: any, row: any) {
    // log(`get cell actions?`);
    if (column.key === 'NAME' && this.props.deleteFunction !== undefined) {
      // log(`add glyph`);
      return [
        {
          icon: 'fa fa-trash',
          callback: async () => {
            if (this.props.deleteFunction !== undefined) {
              const deleteResult = await this.props.deleteFunction(row['NAME']);
              if (deleteResult.itemsDeleted.length > 1) {
                alert(`deleted ${deleteResult.itemsDeleted}`);
              }
              this.sortHandler(
                this.state.colSortIndex,
                this.state.sortDirection,
              );
              //log(`this.props.rows.length = ${this.props.rows.length}`);
              //log(`this.sortedIndices = ${this.sortedIndices}`);
            }
          },
        },
      ];
    } else if (
      column.key === 'FAVE' &&
      this.props.setEraFunction !== undefined
    ) {
      // log(`add glyph`);
      let icon = '';
      if (row['ERA'] === 0) {
        icon = 'fa fa-arrows-h';
      } else if (row['ERA'] === 1) {
        icon = 'fa fa-arrow-right';
      } else if (row['ERA'] === -1) {
        icon = 'fa fa-arrow-left';
      }

      return [
        {
          icon: icon,
          callback: async () => {
            if (this.props.setEraFunction !== undefined) {
              const oldVal = row['ERA'];

              let newVal = 0;
              if (oldVal === -1) {
                newVal = 0;
              } else if (oldVal === 0) {
                newVal = 1;
              } else if (oldVal === 1) {
                newVal = -1;
              }

              await this.props.setEraFunction(row['NAME'], newVal);
              this.sortHandler(
                this.state.colSortIndex,
                this.state.sortDirection,
              );
              //log(`this.props.rows.length = ${this.props.rows.length}`);
              //log(`this.sortedIndices = ${this.sortedIndices}`);
            }
          },
        },
      ];
    } else {
      return [];
    }
  }
*/

  public render() {
    this.handleSort(this.state.colSortIndex, this.state.sortDirection);

    if(this.props.columns === undefined) {
      console.log(`this.props.columns = ${inspect(this.props.columns)}`);
    }
    if(this.props.rows === undefined) {
      console.log(`this.props.rows = ${inspect(this.props.rows)}`);
    }

    function renderName(x: any) {
      return (
        <>
          {JSON.stringify(x)}
        </>
      );
    }

    return (
      <>
        <ReactiveTextArea
          identifier={`${this.props.tableID}TableDataDump`}
          message={showObj(this.props.rows)}
        />
        {this.props.rows &&
        <DataGrid
          columns={this.props.columns}
          onRowsChange={this.props.handleGridRowsUpdated}
          rowKeyGetter={this.rowGetter.bind(this)}
          // rowsCount={this.props.rows.length}
          rows={this.props.rows}
          // rowHeight={this.props.rows.length * 35 + 50}
          // minWidth={500}
          // enableCellSelect={true}
          // enableRowSelect={undefined}
          // onSortColumnsChange={this.sortHandler.bind(this)}
          // onSelectedCellChange={this.getCellActions.bind(this)}
        />
        }
      </>
    );
  }
}

export default DataGridFinKitty;
