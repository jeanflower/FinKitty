import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { log, printDebug, showObj } from '../../utils';
import { getTriggerDate } from '../../stringUtils';
import { Trigger } from '../../types/interfaces';
/**
 * Samples:
 * https://adazzle.github.io/react-data-grid/examples.html#/all-features
 */
interface DataGridProps {
  handleGridRowsUpdated: any; // TODO any
  rows: any[]; // TODO any
  columns: any[]; // TODO any
  deleteFunction: ((name: string) => Promise<boolean>) | undefined;
  triggers: Trigger[];
}
interface DataGridState {
  colSortIndex: string;
  sortDirection: 'ASC' | 'DESC' | 'NONE';
}
class DataGrid extends React.Component<DataGridProps, DataGridState> {
  sortedIndices: number[];

  public constructor(props: DataGridProps) {
    super(props);
    this.sortedIndices = props.rows.map(row => {
      return row['index'];
    });
    this.state = {
      colSortIndex: 'index',
      sortDirection: 'NONE',
    };
    this.handleSort(this.state.colSortIndex, 'NONE');
  }
  /*
  public rowGetterOld(i: number) {
    if (printDebug()) {
      log('in rowgetter, this.props.rows = ' + this.props.rows);
    }
    let colSortIndex = this.state.colSortIndex;
    if (this.state.sortDirection === 'NONE') {
      if (
        this.props.rows.length === 0 ||
        this.props.rows[0].index === undefined
      ) {
        return this.props.rows[i];
      } else {
        colSortIndex = 'index'; // TODO
      }
    }

    //return this.props.rows.sort()[i];
    return this.props.rows.sort((a, b) => {
      // log(`colSortIndex = ${colSortIndex}`);
      let aVal = a[colSortIndex];
      let bVal = b[colSortIndex];
      if (printDebug()) {
        log(`aVal = ${showObj(aVal)}, bVal = ${showObj(bVal)}`);
      }
      if (aVal === undefined || bVal === undefined) {
        aVal = a[this.props.columns[0]];
        bVal = b[this.props.columns[0]];
      }
      if (
        colSortIndex === 'DATE' ||
        colSortIndex === 'START' ||
        colSortIndex === 'END'
      ) {
        const aTimeVal = new Date(aVal).getTime();
        const bTimeVal = new Date(bVal).getTime();
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
      } else if (colSortIndex === 'index') {
      } else if (aVal !== undefined && bVal !== undefined) {
        aVal = aVal.toUpperCase();
        bVal = bVal.toUpperCase();
      }
      // log(`aVal = ${aVal}, bVal = ${bVal}`);
      if (aVal < bVal) {
        if (this.state.sortDirection === 'ASC') {
          // log('return -1');
          return -1;
        } else {
          // log('return 1');
          return 1;
        }
      } else if (aVal > bVal) {
        if (this.state.sortDirection === 'ASC') {
          // log('return 1');
          return 1;
        } else {
          // log('return -1');
          return -1;
        }
      } else {
        // log('return 0');
        return 0;
      }
    })[i];
  }
*/
  public rowGetter(i: number) {
    if (printDebug()) {
      log('in rowgetter, this.props.rows = ' + this.props.rows);
    }
    /*
    const oldRow = this.rowGetterOld(i);
    if(oldRow !== undefined
    && oldRow['index'] !== undefined 
    && oldRow['index'] !== this.sortedIndices[i]){
      log(`for ${i}th row, oldRow index was ${oldRow['index']} but sorted index is ${this.sortedIndices[i]}`);
    }
    // return oldRow;
    */

    return this.props.rows.filter(row => {
      return row['index'] === this.sortedIndices[i];
    })[0];
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

    if (sortDirection === 'NONE') {
      this.sortedIndices = this.props.rows
        .slice()
        .sort((a, b) => {
          const ai = a['index'];
          const bi = b['index'];
          return ai < bi ? 1 : ai > bi ? -1 : 0;
        })
        .map(row => {
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
          const aTimeVal = getTriggerDate(aVal, this.props.triggers).getTime();
          const bTimeVal = getTriggerDate(bVal, this.props.triggers).getTime();
          // this puts trigers seperate from dates
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
          sortColumn === 'TO_VALUE'
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
      .map(row => {
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

    this.handleSort(sortColumn, sortDirection);
    // log(`sortedIndices = ${showObj(this.sortedIndices)}`);
  }

  private getCellActions(column: ReactDataGrid.Column<any>, row: any) {
    // log(`get cell actions?`);
    if (column.key === 'NAME' && this.props.deleteFunction !== undefined) {
      // log(`add glyph`);
      return [
        {
          icon: 'fa fa-trash',
          callback: async () => {
            if (this.props.deleteFunction !== undefined) {
              await this.props.deleteFunction(row['NAME']);
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

  public render() {
    return (
      <ReactDataGrid
        columns={this.props.columns}
        rowGetter={this.rowGetter.bind(this)}
        rowsCount={this.props.rows.length}
        onGridRowsUpdated={this.props.handleGridRowsUpdated}
        minHeight={this.props.rows.length * 35 + 50}
        // minWidth={500}
        enableCellSelect={true}
        enableRowSelect={undefined}
        onGridSort={this.sortHandler.bind(this)}
        getCellActions={this.getCellActions.bind(this)}
      />
    );
  }
}

export default DataGrid;
