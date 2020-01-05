// / <reference path="./react-vis.d.ts"/>
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
import { log } from '../../utils';
import '../utilsules/react-vis/dist/style.css';

export interface ReactVisChartPoint extends VerticalBarSeriesPoint {
  ttip: string;
}
export interface ReactVisChartProps {
  data: ReactVisChartPoint[][];
}

function makeHoverContent(v: VerticalBarSeriesPoint): string {
  // log(`VerticalBarSeriesPoint v = ${showObj(v)}`);
  return `${v.ttip}: ${v.x}`;
}

export class ReactVisExample extends React.Component<ReactVisChartProps, {}> {
  public state = {
    useCanvas: false,
    hoveredCell: undefined,
    dataForHoveredCell: '',
  };

  public constructor(props: ReactVisChartProps) {
    super(props);
  }

  public render() {
    // log(`received array length ${showObj(this.props.data.length)} to props`);
    const arrayOfSeries = this.props.data.map(j => {
      // log(`processing ${showObj(j)}`);
      /* eslint-disable react/jsx-key */
      return (
        <VerticalBarSeries
          onValueMouseOver={v => {
            this.setState({
              hoveredCell: v.x && v.y ? v : {},
              dataForHoveredCell: makeHoverContent(v),
            });
          }}
          onValueMouseOut={() => {
            log(`mouse out`);
            this.setState({
              hoveredCell: {},
              dataForHoveredCell: '',
            });
          }}
          data={j}
          //key={j}
        />
        /* eslint-enable react/jsx-key */
      );
    });
    return (
      <div>
        <XYPlot height={300} width={800} xType="ordinal" stackBy="y">
          <XAxis />
          <YAxis />
          <HorizontalGridLines />
          <VerticalGridLines />
          {arrayOfSeries}
          {this.state.hoveredCell && (
            <Hint value={this.state.hoveredCell}>
              <div style={{ background: 'black' }}>
                {this.state.dataForHoveredCell}
              </div>
            </Hint>
          )}
        </XYPlot>
      </div>
    );
  }
}
