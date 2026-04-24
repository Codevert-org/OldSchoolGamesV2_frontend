import type { ChangeEvent, FocusEvent } from 'react';

type formLineProps = Readonly<{
  name: string;
  inputType?: string;
  label?: string;
  value?: string;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}>

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
        spellCheck={false}
        onBlur={props.onBlur}
        {...inputProps}
      />
    </div>
  );
}