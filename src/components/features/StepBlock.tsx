'use client'

import { useState, ReactNode } from 'react'

interface Props {
  num: string | number
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export default function StepBlock({ num, title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`step-block${open ? ' open' : ''}`}>
      <div className="step-header" onClick={() => setOpen(!open)}>
        <div className="step-num">{num}</div>
        <div className="step-title">{title}</div>
        <div className="step-chevron">▾</div>
      </div>
      {open && <div className="step-body">{children}</div>}
    </div>
  )
}
