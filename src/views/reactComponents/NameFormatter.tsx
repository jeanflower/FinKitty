import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import {
  getNumberAndWordParts,
  makeStringFromCashValue,
} from '../../utils/stringUtils';

interface SimpleFormatterProps {
  name: string;
  value: string;
}
export class SimpleFormatter extends React.Component<SimpleFormatterProps> {
  public render() {
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip
            {...props}
          >{`${this.props.name}:${this.props.value}`}</Tooltip>
        )}
      >
        <span>{this.props.value}</span>
      </OverlayTrigger>
    );
  }
}
export class SettingFormatter extends React.Component<SimpleFormatterProps> {
  public render() {
    const rawValue = this.props.value;
    let tidyValue = rawValue;

    const nwp = getNumberAndWordParts(rawValue);
    if (nwp.wordPart === 'USD' && nwp.numberPart !== undefined) {
      tidyValue = `${makeStringFromCashValue(
        nwp.numberPart.toFixed(2),
        '',
      )}USD`;
    }

    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}:${tidyValue}`}</Tooltip>
        )}
      >
        <span>{tidyValue}</span>
      </OverlayTrigger>
    );
  }
}
