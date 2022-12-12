import React from 'react';
import { ModelData } from '../../types/interfaces';
import { DateFormatType, log, printDebug } from '../../utils/utils';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { makeDateTooltip, dateAsString } from '../../utils/stringUtils';
import { getVarVal } from '../../models/modelUtils';

log;
printDebug;

interface TriggerDateFormatterProps {
  name: string;
  value: string;
  model: ModelData;
}

function makeDateTooltipLocal(props: TriggerDateFormatterProps) {
  // log(`make tooltip with ${showObj(props)}`);
  if (props.model.settings.length === 0) {
    return '';
  }
  return makeDateTooltip(
    props.value,
    props.model.triggers,
    getVarVal(props.model.settings),
  );
}
class TriggerDateFormatter extends React.Component<TriggerDateFormatterProps> {
  public render() {
    let tableValue = this.props.value;
    const asDate = new Date(this.props.value);
    if (!Number.isNaN(asDate.getTime())) {
      tableValue = dateAsString(DateFormatType.View, asDate);
    }
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}:${makeDateTooltipLocal(
            this.props,
          )}`}</Tooltip>
        )}
      >
        <span>{tableValue}</span>
      </OverlayTrigger>
    );
  }
}

export default TriggerDateFormatter;
