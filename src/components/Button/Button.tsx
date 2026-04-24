import './Button.css'
import type { MouseEvent, ReactNode } from 'react'

type Props = Readonly<{
  callback?: (e: MouseEvent<HTMLButtonElement>) => void,
  type?: 'button' | 'submit' | 'reset',
  label: string | ReactNode,
  disabled?: boolean,
}>

export function Button(props : Props) {

  return (
    <div className='button_wrapper'>
      <button
        onClick={props.callback ?? (() => {})}
        type={props.type ?? 'button'}
        disabled={props.disabled}
        >
        <span>
          {props.label}
        </span>
      </button>
    </div>
  )
}