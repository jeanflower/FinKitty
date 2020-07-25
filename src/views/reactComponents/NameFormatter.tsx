import React from 'react';
// import { showObj } from '../AppLogic'

interface SimpleFormatterProps {
  name: string;
  value: string;
}
class SimpleFormatter extends React.Component<SimpleFormatterProps, {}> {
  public render() {
    return (
      <span data-tip={`${this.props.name}:${this.props.value}`}>
        {this.props.value}
      </span>
    );
  }
}

export default SimpleFormatter;
