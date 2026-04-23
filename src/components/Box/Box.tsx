import './Box.css'
import type { JSX } from 'react'

type Props = Readonly<{
  children: JSX.Element[] | JSX.Element
  className?: string
}>

export function Box({children, className}: Props) {

  return (
    <div className={`box${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}