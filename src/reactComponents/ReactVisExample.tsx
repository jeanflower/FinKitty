// / <reference path="./react-vis.d.ts"/>
/* eslint-disable */
import React from 'react';
import {
  Hint,
  HorizontalGridLines,
  VerticalBarSeries,
  VerticalBarSeriesPoint,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from 'react-vis';
import {
  log,
  showObj,
} from '../utils';
import '../utilsules/react-vis/dist/style.css';

export interface IReactVisChartPoint extends VerticalBarSeriesPoint {
  ttip: string;
}
export interface IReactVisChartProps {
  data: IReactVisChartPoint[][];
}

function makeHoverContent(v: VerticalBarSeriesPoint): string {
  // log(`VerticalBarSeriesPoint v = ${showObj(v)}`);
  return `${v.ttip}: ${v.x}`;
}

export class ReactVisExample extends React.Component<IReactVisChartProps, {}> {
  public state = {
    useCanvas: false,
    hoveredCell: undefined,
    dataForHoveredCell: '',
  };

  constructor(props: IReactVisChartProps) {
    super(props);
  }

  public render() {
    // log(`received array length ${showObj(this.props.data.length)} to props`);
    const arrayOfSeries = this.props.data.map(j => {
      // log(`processing ${showObj(j)}`);
      return <VerticalBarSeries
        onValueMouseOver={v => {
          this.setState(
            {
            hoveredCell: v.x && v.y ? v : {},
            dataForHoveredCell: makeHoverContent(v),
            },
          );
        }}
        onValueMouseOut={v => {
          log(`mouse out`);
          this.setState({
            hoveredCell: {},
            dataForHoveredCell: '',
          });
        }}
        data={j}
      />;
      },
    );
    return (
      <div>
        <XYPlot
          height={300}
          width={800}
          xType="ordinal"
          stackBy="y"
        >
        <XAxis />
        <YAxis />
        <HorizontalGridLines />
        <VerticalGridLines />
        {arrayOfSeries}
        {this.state.hoveredCell &&
          <Hint value={this.state.hoveredCell}>
            <div style={{background: 'black'}}>
            { this.state.dataForHoveredCell }
            </div>
          </Hint>}
        </XYPlot>
      </div>
    );
  }
}
