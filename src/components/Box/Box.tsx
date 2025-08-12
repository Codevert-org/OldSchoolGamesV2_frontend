import './Box.css'
import type { JSX } from 'react'

interface Props {
  children: JSX.Element[] | JSX.Element
}

export function Box({children}: Props) {

  return (
    <div className='box'>
      {children}
    </div>
  )
}