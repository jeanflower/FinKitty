import React from 'react';
// import { log } from './../../utils';

interface ButtonProps {
  type: string;
  id: string;
  action: (e: any) => void; // TODO any : MouseEvent?
  title: string;
}

const Button = (props: ButtonProps) => {
  let className = '';
  const spacer = ' mr-1 mb-1';
  if (props.type === 'primary') {
    className = `btn btn-primary${spacer}`;
  } else if (props.type === 'primary-off') {
    className = `btn btn-outline-primary${spacer}`;
  } else if (props.type === 'secondary-on') {
    className = `btn btn-secondary${spacer}`;
  } else if (props.type === 'secondary') {
    className = `btn btn-outline-secondary${spacer}`;
  } else {
    className = `btn btn-error${spacer}`;
  }
  return (
    <button
      onClick={props.action}
      id={props.id} // id can be checked by selenium
      type={props.type === 'primary' ? 'submit' : 'button'}
      className={className}
    >
      {props.title}
    </button>
  );
};

export function makeButton(
  title: string,
  action: React.MouseEventHandler<HTMLButtonElement>,
  key: string,
  id: string,
  type: 'primary'|'secondary'|'primary-on'|'secondary-on'|'primary-off'|'secondary-off',
){
  return (<Button  
    key={key}
    action={action}
    title={title}
    id={id}
    type={type}
    />
  )
}
