'use client'

import { useState, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: ReactNode
}

export default function LessonSection({ children }: Props) {
  const [fullscreen, setFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [fullscreen])

  const modal = (
    <div className="lesson-fs-overlay">
      <div className="lesson-fs-bar">
        <button className="lesson-fs-close" onClick={() => setFullscreen(false)}>
          <i className="fas fa-compress" /> Sair da tela cheia
          <span className="lesson-fs-hint">ESC</span>
        </button>
      </div>
      <div className="lesson-fs-content">
        {children}
      </div>
    </div>
  )

  return (
    <div className="lesson-section">
      <button
        className="lesson-fs-btn"
        onClick={() => setFullscreen(true)}
        title="Expandir para tela cheia"
      >
        <i className="fas fa-expand" />
      </button>
      {children}
      {mounted && fullscreen && createPortal(modal, document.body)}
    </div>
  )
}
