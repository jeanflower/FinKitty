import React from 'react';
// import { showObj } from '../AppLogic'

interface NameFormatterProps {
  value: string;
}
class NameFormatter extends React.Component<NameFormatterProps, {}> {
  public render() {
    return <span data-tip={this.props.value}>{this.props.value}</span>;
  }
}

export default NameFormatter;
