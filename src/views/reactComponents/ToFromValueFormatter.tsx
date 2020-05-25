import React from 'react';
import { makeStringFromFromToValue } from '../../utils';
import { isNumberString } from '../../models/checks';
// import { showObj } from ''../../utils''

interface ToFromValueFormatterProps {
  value: string;
}
class ToFromValueFormatter extends React.Component<
  ToFromValueFormatterProps,
  {}
> {
  public render() {
    let result: string;
    if (isNumberString(this.props.value)) {
      result = makeStringFromFromToValue(this.props.value);
    } else {
      result = this.props.value;
    }
    return <span className="float: right">{result}</span>;
  }
}

export default ToFromValueFormatter;
