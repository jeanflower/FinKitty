import React from 'react';

interface ButtonProps {
  type: string;
  id: string;
  action: any;
  title: string;
}

const Button = (props: ButtonProps) => {
  let className = '';
  if (props.type === 'primary') {
    className = 'btn btn-primary';
  } else if (props.type === 'secondary') {
    className = 'btn btn-outline-secondary';
  } else {
    className = 'btn btn-outline-secondary';
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

export default Button;
