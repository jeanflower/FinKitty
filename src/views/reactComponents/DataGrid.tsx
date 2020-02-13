import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { log, printDebug, showObj } from '../../utils';
// import { showObj } from '../AppLogic'
/**
 * Samples:
 * https://adazzle.github.io/react-data-grid/examples.html#/all-features
 */
interface DataGridProps {
  handleGridRowsUpdated: any; // TODO any
  rows: any[]; // TODO any
  columns: any[]; // TODO any
}
interface DataGridState {
  rows: any[]; // TODO any
  colSortIndex: string;
  sortDirection: string;
}
class DataGrid extends React.Component<DataGridProps, DataGridState> {
  public constructor(props: DataGridProps) {
    super(props);
    this.state = {
      rows: props.rows,
      colSortIndex: '',
      sortDirection: '',
    };
  }
  public rowGetter(i: number) {
    if (printDebug()) {
      log('in rowgetter, this.props.rows = ' + this.props.rows);
    }
    if (this.state.sortDirection === 'NONE') {
      return this.props.rows[i];
    }

    //return this.props.rows.sort()[i];
    return this.props.rows.sort((a, b) => {
      // log(`this.state.colSortIndex = ${this.state.colSortIndex}`);
      let aVal = a[this.state.colSortIndex];
      let bVal = b[this.state.colSortIndex];
      if (printDebug()) {
        log(`aVal = ${showObj(aVal)}, bVal = ${showObj(bVal)}`);
      }
      if (aVal === undefined || bVal === undefined) {
        aVal = a[this.props.columns[0]];
        bVal = b[this.props.columns[0]];
      }
      if (this.state.colSortIndex === 'DATE') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
        //log(`aVal = ${showObj(aVal)}, bVal = ${showObj(bVal)}`);
      } else if (aVal !== undefined && bVal !== undefined) {
        aVal = aVal.toUpperCase();
        bVal = bVal.toUpperCase();
      }
      if (aVal < bVal) {
        if (this.state.sortDirection === 'ASC') {
          return -1;
        } else {
          return 1;
        }
      } else if (aVal > bVal) {
        if (this.state.sortDirection === 'ASC') {
          return 1;
        } else {
          return -1;
        }
      } else {
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
      />
    );
  }
}

export default DataGrid;
