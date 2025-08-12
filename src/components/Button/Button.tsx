import './Button.css'
import type { MouseEvent, ReactNode } from 'react'

interface Props {
  callback?: (e: MouseEvent<HTMLButtonElement>) => void,
  type?: 'button' | 'submit' | 'reset',
  label: string | ReactNode
}

export function Button(props : Props) {

  return (
    <div className='button_wrapper'>
      <button 
        onClick={props.callback ? props.callback : () => {}}
        type={props.type ? props.type : 'button'}
        >
        <span>
          {props.label}
        </span>
      </button>
    </div>
  )
}