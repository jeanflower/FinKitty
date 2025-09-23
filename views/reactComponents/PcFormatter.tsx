import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface PcFormatterProps {
  name: string;
  value: string;
}
class PcFormatter extends React.Component<PcFormatterProps> {
  public render() {
    const x = this.props.value;
    // log(`string representtation of ${this.props.value} is ${x}`);
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}: ${x}`}</Tooltip>
        )}
      >
        <span>{x}%</span>
      </OverlayTrigger>
    );
  }
}

export default PcFormatter;
