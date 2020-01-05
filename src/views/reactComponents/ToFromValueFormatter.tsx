import React from 'react';
import { makeStringFromFromToValue } from '../../utils';
// import { showObj } from '../AppLogic'

interface ToFromValueFormatterProps {
  value: string;
}
class ToFromValueFormatter extends React.Component<
  ToFromValueFormatterProps,
  {}
> {
  public render() {
    return (
      <span className="float: right">
        {makeStringFromFromToValue(this.props.value)}
      </span>
    );
  }
}

export default ToFromValueFormatter;
