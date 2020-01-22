import React from 'react';
import ReactDataGrid from 'react-data-grid';
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
}
class DataGrid extends React.Component<DataGridProps, DataGridState> {
  public rowGetter(i: number) {
    // log('in rowgetter, this.props.rows = '+this.props.rows);
    return this.props.rows[i];
  }
  public getSize() {
    return this.props.rows.length;
  }
  public onGridRowsUpdated = ({ fromRow, toRow, updated }: any) => {
    // log('onGridRowsUpdated');
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };
  public onGridSort = () => {};

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
      />
    );
  }
}

export default DataGrid;
