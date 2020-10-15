import React from 'react';

export const Input = props => {
  //log(props.value);
  return (
    <div className="form-group">
      <label htmlFor={props.name} className="form-label">
        {props.title}
      </label>
      <input
        className="form-control"
        id={props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
      />
    </div>
  );
};

export const InputRow = props => {
  //log(props.value);
  return (
      <div className="form-group row">
      <label htmlFor={props.name} className="col-sm col-form-label">
        {props.title}
      </label>
      <div className="col-sm">
      <input
        className="form-control"
        id={props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
      />
      </div>
    </div>
  );
};
