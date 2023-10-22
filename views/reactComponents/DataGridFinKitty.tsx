import React from 'react';
import ReactDataGrid, { RowsChangeData, SortColumn } from 'react-data-grid';
import { log, printDebug, showObj } from '../../utils/utils';
import { getTriggerDate } from '../../utils/stringUtils';
import { ModelData } from '../../types/interfaces';
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
      colSortIndex: 'NAME',
      sortDirection: 'ASC',
    };
    this.handleSort(this.state.colSortIndex, 'NONE');
  }

  public rowKeyGetter(r: any) {
    return r.index;
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
    // log(`this.props.rows.slice() indices = ${showObj(this.props.rows.slice().map((row)=>{
    //   return `${row['index']}, ${row['NAME']}`;
    // }))}`);

    // log(`before sort, this.sortedIndices = ${showObj(this.sortedIndices)}`);

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
      // log(`none-sortedIndices = ${showObj(this.sortedIndices)}`);
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
            return this.state.sortDirection === 'DESC' ? +1 : -1;
          } else if (!aVal.endsWith('%') && bVal.endsWith('%')) {
            return this.state.sortDirection === 'DESC' ? -1 : +1;
          }
          const paVal = parseFloat(aVal);
          const pbVal = parseFloat(bVal);
          if (Number.isNaN(paVal) && !Number.isNaN(pbVal)) {
            return this.state.sortDirection === 'DESC' ? 1 : -1;
          }
          if (!Number.isNaN(paVal) && Number.isNaN(pbVal)) {
            return this.state.sortDirection === 'DESC' ? -1 : +1;
          } else if (!Number.isNaN(paVal) && !Number.isNaN(pbVal)) {
            return paVal < pbVal
              ? this.state.sortDirection === 'DESC'
                ? +1
                : -1
              : paVal > pbVal
              ? this.state.sortDirection === 'DESC'
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
          if (this.state.sortDirection === 'DESC') {
            return +1;
          } else {
            return -1;
          }
        } else if (aVal > bVal) {
          if (this.state.sortDirection === 'DESC') {
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
    
    // log(`after sort, this.sortedIndices = ${showObj(this.sortedIndices)}`);
  }

  private sortHandler(cols: SortColumn[]) {
    // log(`in sortHandler, sorting ${showObj(cols)}`);

    if(cols.length > 1) {
      log('Attention only to first col of sortCols');
    }
    // log(`sortColumn = ${cols[0].columnKey}`);
    // log(`sortDirection = ${cols[0].direction}`);

    const newColumnBeingSorted = this.state.colSortIndex !== cols[0].columnKey;

    const oldSortDirection = this.state.sortDirection;
    let newSortDirection: "ASC" | "DESC" | "NONE" = "NONE";
    if (newColumnBeingSorted) {
      newSortDirection = "ASC";
    } else if (oldSortDirection === "NONE") {
      newSortDirection = "ASC";
    } else if (oldSortDirection === "ASC") {
      newSortDirection = "DESC";
    } else if (oldSortDirection === "DESC") {
      newSortDirection = "NONE";
    }

    // log(`newSortDirection = ${newSortDirection}`);

    this.setState({
      colSortIndex: cols[0].columnKey,
      sortDirection: newSortDirection,
    });

    // run the sort in the render function instead
    // to ensure sortedIndices gets updated when needed
    // this.handleSort(sortColumn, sortDirection);
    // log(`sortedIndices = ${showObj(this.sortedIndices)}`);
  }

  public render() {
    // log(`before sort rows = ${this.props.rows.map(
    //   (r) => {
    //     return `${r.index}-${r["NAME"]}`}
    // )}`);
    this.handleSort(this.state.colSortIndex, this.state.sortDirection);
    // log(`after sort rows = ${this.props.rows.map(
    //   (r) => {
    //     return `${r.index}-${r["NAME"]}`}
    // )}`);

    if(this.props.columns === undefined) {
      console.log(`this.props.columns = ${inspect(this.props.columns)}`);
    }
    if(this.props.rows === undefined) {
      console.log(`this.props.rows = ${inspect(this.props.rows)}`);
    }

    return (
      <>
        <ReactiveTextArea
          identifier={`${this.props.tableID}TableDataDump`}
          message={showObj(this.props.rows)}
        />
        {this.props.rows &&
        <ReactDataGrid
          columns={this.props.columns}
          onRowsChange={(
            rows: any[],
            data: RowsChangeData<any, any>
          ) => {
            //console.log(`in onRowsChange, rows = ${showObj(rows)}`);
            //console.log(`in onRowsChange, data = ${showObj(data)}`);
            // data.indexes is 0 for the 0th row on the screen
            // but this isn't the 0th index of the rowsData
            // so use this.sortedIndices to transform the indices

            // log(`data.indexes before transformation = ${showObj(data.indexes)}`);
            // log(`this.sortedIndices = ${showObj(this.sortedIndices)}`);

            for(let i = 0; i < data.indexes.length; i++) {
              data.indexes[i] = this.sortedIndices[data.indexes[i]];
            }
            // log(`data.indexes after transformation = ${showObj(data.indexes)}`);

            this.props.handleGridRowsUpdated(
              rows, 
              data,
            )
          }}
          rowKeyGetter={this.rowKeyGetter.bind(this)}
          // rowsCount={this.props.rows.length}
          rows={this.sortedIndices.map((idx) => {
            // log(`find row for idx=${idx}`);
            const matchedRow = this.props.rows.find((r)=> {
              return r.index === idx; 
            });
            // log(`matchedRowrow ${matchedRow}`);
            // log(`row ${matchedRow.idx}=${matchedRow["NAME"]}`);
            return matchedRow;
          })}
          // rowHeight={this.props.rows.length * 35 + 50}
          // minWidth={500}
          // enableCellSelect={true}
          // enableRowSelect={undefined}
          onSortColumnsChange={this.sortHandler.bind(this)}
          // onSelectedCellChange={this.getCellActions.bind(this)}
          //sortColumns={[{
          //  columnKey: 'NAME',
          //  direction: 'ASC',
          //}]}
        />
        }
      </>
    );
  }
}

export default DataGridFinKitty;
