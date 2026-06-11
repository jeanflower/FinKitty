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
    const display =
      x === "" || x.endsWith("%") ? x : `${x}%`;
    return (
      <OverlayTrigger
        placement="top"
        overlay={(props: any) => (
          <Tooltip {...props}>{`${this.props.name}: ${display}`}</Tooltip>
        )}
      >
        <span>{display}</span>
      </OverlayTrigger>
    );
  }
}

export default PcFormatter;
