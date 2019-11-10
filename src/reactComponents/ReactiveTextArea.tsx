import React from 'react';
// import { showObj } from '../AppLogic'

interface IReactiveTextAreaProps {
  identifier: string;
  message: string;
}
class ReactiveTextArea extends React.Component<IReactiveTextAreaProps, {}> {
  public render() {
    return (
      <div style={{display: 'none'}}>
        <textarea readOnly id={this.props.identifier} value={this.props.message} />
      </div>
    );
  }
}

export default ReactiveTextArea;
