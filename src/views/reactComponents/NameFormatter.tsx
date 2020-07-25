import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

interface SimpleFormatterProps {
  name: string;
  value: string;
}
class SimpleFormatter extends React.Component<SimpleFormatterProps, {}> {
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

export default SimpleFormatter;
