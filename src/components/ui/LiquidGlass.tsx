import { ElementType, ReactNode, CSSProperties, ComponentPropsWithoutRef } from 'react'

type Props<T extends ElementType = 'div'> = {
  as?: T
  children: ReactNode
  className?: string
  style?: CSSProperties
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className' | 'style'>

export default function LiquidGlass<T extends ElementType = 'div'>({
  as,
  children,
  className = '',
  style,
  ...rest
}: Props<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag className={`liquid-glass${className ? ` ${className}` : ''}`} style={style} {...rest}>
      <span className="lg-backdrop" aria-hidden="true" />
      {children}
    </Tag>
  )
}
