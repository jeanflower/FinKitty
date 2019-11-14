import React from 'react';
// import { showObj } from '../AppLogic'

interface ReactiveTextAreaProps {
  identifier: string;
  message: string;
}
class ReactiveTextArea extends React.Component<ReactiveTextAreaProps, {}> {
  public render() {
    return (
      <div style={{ display: 'none' }}>
        <textarea
          readOnly
          id={this.props.identifier}
          value={this.props.message}
        />
      </div>
    );
  }
}

export default ReactiveTextArea;
