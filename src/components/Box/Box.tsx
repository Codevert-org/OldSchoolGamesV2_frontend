import './Box.css'
import type { JSX } from 'react'

interface Props {
  children: JSX.Element[] | JSX.Element
  className?: string
}

export function Box({children, className}: Props) {

  return (
    <div className={`box${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}