import React from 'react';
import { DbTrigger } from '../../types/interfaces';
import { makeDateTooltip, dateFormatOptions } from '../../utils';
// import { showObj } from '../AppLogic'

interface TriggerDateFormatterProps {
  value: string;
  triggers: DbTrigger[];
}

class TriggerDateFormatter extends React.Component<
  TriggerDateFormatterProps,
  {}
> {
  public render() {
    let tableValue = this.props.value;
    const asDate = new Date(this.props.value);
    if (!Number.isNaN(asDate.getTime())) {
      tableValue = asDate.toLocaleDateString(undefined, dateFormatOptions);
    }
    return (
      <span data-tip={makeDateTooltip(this.props.value, this.props.triggers)}>
        {tableValue}
      </span>
    );
  }
}

export default TriggerDateFormatter;
