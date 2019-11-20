import React from 'react';
import { makeStringFromCashValue } from '../utils';
// import { showObj } from '../AppLogic'

interface CashValueFormatterProps {
  value: string;
}
class CashValueFormatter extends React.Component<CashValueFormatterProps, {}> {
  public render() {
    return (
      <span className="float: right">
        {makeStringFromCashValue(this.props.value)}
      </span>
    );
  }
}

export default CashValueFormatter;
