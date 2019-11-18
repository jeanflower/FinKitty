import React from 'react';
import { DbTrigger } from '../types/interfaces';
import { makeTooltip } from '../utils';
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
    return (
      <span data-tip={makeTooltip(this.props.value, this.props.triggers)}>
        {this.props.value}
      </span>
    );
  }
}

export default TriggerDateFormatter;
