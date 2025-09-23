import React from "react";
import { Setting } from "../../types/interfaces";
import { makeStringFromGrowth } from "../../utils/stringUtils";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface GrowthFormatterProps {
  name: string;
  value: string;
  settings: Setting[];
}
class GrowthFormatter extends React.Component<GrowthFormatterProps> {
  public render() {
    const x = makeStringFromGrowth(this.props.value, this.props.settings);
    // log(`string representtation of ${this.props.value} is ${x}`);
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

export default GrowthFormatter;
