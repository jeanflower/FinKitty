import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { log, printDebug, showObj } from '../../utils';
/**
 * Samples:
 * https://adazzle.github.io/react-data-grid/examples.html#/all-features
 */
interface DataGridProps {
  handleGridRowsUpdated: any; // TODO any
  rows: any[]; // TODO any
  columns: any[]; // TODO any
  deleteFunction: (name: string) => Promise<boolean>;
}
interface DataGridState {
  rows: any[]; // TODO any
  colSortIndex: string;
  sortDirection: 'ASC' | 'DESC' | 'NONE';
}
class DataGrid extends React.Component<DataGridProps, DataGridState> {
  public constructor(props: DataGridProps) {
    super(props);
    this.state = {
      rows: props.rows,
      colSortIndex: '',
      sortDirection: 'NONE',
    };
  }
  public rowGetter(i: number) {
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
  public getSize() {
    return this.props.rows.length;
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
  }

  private getCellActions(column: ReactDataGrid.Column<any>, row: any) {
    // log(`get cell actions?`);
    if (column.key === 'NAME') {
      // log(`add glyph`);
      return [
        {
          icon: 'fa fa-trash',
          callback: () => {
            if (window.confirm(`delete data for ${row['NAME']} - you sure?`)) {
              this.props.deleteFunction(row['NAME']);
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
