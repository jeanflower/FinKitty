import React from 'react';
import { makeStringFromCashValue } from '../../utils';
import { isNumberString } from '../../models/checks';
// import { showObj } from ''../../utils''

interface CashValueFormatterProps {
  value: string;
}
class CashValueFormatter extends React.Component<CashValueFormatterProps, {}> {
  public render() {
    let result: string;
    if (isNumberString(this.props.value)) {
      result = makeStringFromCashValue(this.props.value);
    } else {
      result = this.props.value;
    }
    return <span className="float: right">{result}</span>;
  }
}

export default CashValueFormatter;
