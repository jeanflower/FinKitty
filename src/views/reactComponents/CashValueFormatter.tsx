import React from 'react';
import { makeStringFromCashValue } from '../../utils/stringUtils';
import { isNumberString } from '../../models/checks';
// import { showObj } from ''../../utils''
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { log } from '../../utils/utils';

log;

interface CashValueFormatterProps {
  name: string;
  value: string;
}
class CashValueFormatter extends React.Component<CashValueFormatterProps> {
  public render() {
    let result: string;
    if (
      this.props.value === '' ||
      this.props.value === undefined ||
      this.props.value === 'undefined'
    ) {
      return '';
    } else if (isNumberString(this.props.value)) {
      result = makeStringFromCashValue(this.props.value, '£');
    } else {
      result = this.props.value;
    }
    // log(`cash formatter from ${this.props.value} = ${result}`);
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}:${result}`}</Tooltip>
        )}
      >
        <span className="float: right">{result}</span>
      </OverlayTrigger>
    );
  }
}

export default CashValueFormatter;
