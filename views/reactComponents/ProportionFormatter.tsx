import React from "react";
import { Setting } from "../../types/interfaces";
import { makeStringFromProportion } from "../../utils/stringUtils";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface ProportionFormatterProps {
  name: string;
  value: string;
  settings: Setting[];
}
class ProportionFormatter extends React.Component<ProportionFormatterProps> {
  public render() {
    const x = makeStringFromProportion(this.props.value, this.props.settings);
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}: ${x}`}</Tooltip>
        )}
      >
        <span>{x}</span>
      </OverlayTrigger>
    );
  }
}

export default ProportionFormatter;
