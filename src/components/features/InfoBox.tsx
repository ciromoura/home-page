import { ReactNode } from 'react'

interface Props {
  variant?: 'tip' | 'warn'
  label: string
  children: ReactNode
}

export default function InfoBox({ variant, label, children }: Props) {
  return (
    <div className={`info-box${variant ? ` ${variant}` : ''}`}>
      <div className="info-label">{label}</div>
      {children}
    </div>
  )
}
