import React, { Component } from 'react';
import { finkittyButtonType } from '../../types/interfaces';
import { log, printDebug } from './../../utils';

interface ButtonProps {
  type: finkittyButtonType;
  id: string;
  action: (e: any) => void; // TODO any : MouseEvent?
  title: string;
  disabled: boolean;
}

class Button extends Component<ButtonProps, {}> {
  public constructor(props: ButtonProps) {
    super(props);
  }

  render() {
    const spacer = ' mr-1 mb-1';
    const className = `btn btn-${this.props.type}${spacer}`;
    return (
      <button
        onClick={this.props.action}
        id={this.props.id} // id can be checked by selenium
        type={this.props.type === 'primary' ? 'submit' : 'button'}
        className={className}
        disabled={this.props.disabled}
      >
        {this.props.title}
      </button>
    );
  }
}

export function makeButton(
  title: string,
  action: React.MouseEventHandler<HTMLButtonElement>,
  key: string,
  id: string,
  type: finkittyButtonType,
  disabled?: boolean,
) {
  if (printDebug()) {
    log(`making a Button for ${title}`);
  }
  return (
    <Button
      key={key}
      action={action}
      title={title}
      id={id}
      type={type}
      disabled={disabled === undefined ? false : disabled}
    />
  );
}
