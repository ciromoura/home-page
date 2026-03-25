'use client'

import { useState, ReactNode } from 'react'

interface Props {
  num: string | number
  title: string
  defaultOpen?: boolean
  forceOpen?: boolean
  children: ReactNode
}

export default function StepBlock({ num, title, defaultOpen = false, forceOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = open || forceOpen

  return (
    <div className={`step-block${isOpen ? ' open' : ''}`}>
      <div className="step-header" onClick={() => setOpen(!open)}>
        <div className="step-num">{num}</div>
        <div className="step-title">{title}</div>
        <div className="step-chevron">▾</div>
      </div>
      {isOpen && <div className="step-body">{children}</div>}
    </div>
  )
}
