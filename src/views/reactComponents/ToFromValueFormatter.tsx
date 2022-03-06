import React from 'react';
import { makeStringFromFromToValue } from '../../utils/stringUtils';
import { isNumberString } from '../../models/checks';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

interface ToFromValueFormatterProps {
  name: string;
  value: string;
}
class ToFromValueFormatter extends React.Component<ToFromValueFormatterProps> {
  public render() {
    let result: string;
    if (isNumberString(this.props.value)) {
      result = makeStringFromFromToValue(this.props.value);
    } else {
      result = this.props.value;
    }
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

export default ToFromValueFormatter;
