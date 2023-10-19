import React from 'react';
import { getNumberAndWordParts, makeTwoDP } from '../../utils/stringUtils';
// import { showObj } from ''../../utils''
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { log } from '../../utils/utils';

log;

interface SettingValueFormatterProps {
  name: string;
  value: string;
}
class SettingValueFormatter extends React.Component<SettingValueFormatterProps> {
  public render() {
    let result: string;
    if (
      this.props.value === '' ||
      this.props.value === undefined ||
      this.props.value === 'undefined'
    ) {
      return '';
    }

    result = this.props.value;
    const numAndWords = getNumberAndWordParts(this.props.value);
    if (numAndWords.numberPart !== undefined) {
      if (
        !Number.isInteger(numAndWords.numberPart) &&
        !Number.isInteger(numAndWords.numberPart * 10)
      ) {
        result = makeTwoDP(numAndWords.numberPart) + numAndWords.wordPart;
      }
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

export default SettingValueFormatter;
