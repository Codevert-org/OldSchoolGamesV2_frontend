type formLineProps = {
  name: string;
  inputType?: string;
  label?: string;
  value?: string;
  required?: boolean;
}

export function FormLine(props: formLineProps) {
  return (
    <div className="form-line">
      <label htmlFor={props.name}>
        {props.label ? props.label : `${props.name[0].toUpperCase()}${props.name.substring(1)}:`}
      </label>
      <input
        type={props.inputType || 'text'}
        id={props.name} name={props.name}
        defaultValue={props.value || ''}
        required={props.required || false} />
    </div>
  )
}