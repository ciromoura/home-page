import { CSSProperties, ReactNode } from 'react'

interface Props {
  variant?: 'tip' | 'warn'
  label: string
  children: ReactNode
  style?: CSSProperties
}

export default function InfoBox({ variant, label, children, style }: Props) {
  return (
    <div className={`info-box${variant ? ` ${variant}` : ''}`} style={style}>
      <div className="info-label">{label}</div>
      {children}
    </div>
  )
}
