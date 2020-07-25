import React from 'react';
import { DbModelData } from '../../types/interfaces';
import { makeDateTooltip, dateFormatOptions } from '../../utils';
// import { showObj } from ''../../utils''

interface TriggerDateFormatterProps {
  name: string;
  value: string;
  model: DbModelData;
}

function makeDateTooltipLocal(props: TriggerDateFormatterProps) {
  // log(`make tooltip with ${showObj(props)}`);
  if (props.model.settings.length === 0) {
    return '';
  }
  return makeDateTooltip(props.value, props.model.triggers);
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
      <span data-tip={`${this.props.name}:${makeDateTooltipLocal(this.props)}`}>
        {tableValue}
      </span>
    );
  }
}

export default TriggerDateFormatter;
