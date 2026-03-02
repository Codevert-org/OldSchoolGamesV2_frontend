import type { ChangeEvent } from 'react';

type formLineProps = {
  name: string;
  inputType?: string;
  label?: string;
  value?: string;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function FormLine(props: formLineProps) {
  const inputProps = props.onChange
    ? { value: props.value ?? '', onChange: props.onChange }
    : { defaultValue: props.value || '' };

  return (
    <div className="form-line">
      <label htmlFor={props.name}>
        {props.label ? props.label : `${props.name[0].toUpperCase()}${props.name.substring(1)}:`}
      </label>
      <input
        type={props.inputType || 'text'}
        id={props.name}
        name={props.name}
        required={props.required || false}
        {...inputProps}
      />
    </div>
  );
}