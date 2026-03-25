'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLessonFullscreen } from './LessonLayout'

type Mode = 'none' | 'pointer' | 'highlight'

interface DrawLine {
  id:     string
  points: [number, number][]
  fading: boolean
}

interface Props {
  children: ReactNode
}

export default function LessonSection({ children }: Props) {
  const { fullscreen, setFullscreen, exportMode, setExportMode } = useLessonFullscreen()
  const [mounted,    setMounted]    = useState(false)
  const [mode,       setMode]       = useState<Mode>('none')
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 })
  const [lines,      setLines]      = useState<DrawLine[]>([])
  const drawingRef   = useRef(false)
  const currentIdRef = useRef<string | null>(null)
  const pointsBufRef = useRef<[number, number][]>([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!fullscreen) { setMode('none'); setLines([]) }
  }, [fullscreen])

  useEffect(() => {
    if (!fullscreen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen, setFullscreen])

  useEffect(() => {
    const reset = () => setExportMode(false)
    window.addEventListener('afterprint', reset)
    return () => window.removeEventListener('afterprint', reset)
  }, [setExportMode])

  function handleExportPDF() {
    setExportMode(true)
    setTimeout(() => window.print(), 150)
  }

  /* ── Handlers: use clientX/Y (viewport coords) ── */
  function handleMouseMove(e: React.MouseEvent) {
    if (mode === 'pointer') {
      setPointerPos({ x: e.clientX, y: e.clientY })
      return
    }
    if (mode === 'highlight' && drawingRef.current && currentIdRef.current) {
      const pt: [number, number] = [e.clientX, e.clientY]
      pointsBufRef.current.push(pt)
      const id  = currentIdRef.current
      const pts = [...pointsBufRef.current]
      setLines(prev => prev.map(l => l.id === id ? { ...l, points: pts } : l))
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (mode !== 'highlight') return
    e.preventDefault()
    const id = `${Date.now()}`
    const pt: [number, number] = [e.clientX, e.clientY]
    pointsBufRef.current = [pt]
    currentIdRef.current = id
    drawingRef.current   = true
    setLines(prev => [...prev, { id, points: [pt], fading: false }])
  }

  function handleMouseUp() {
    if (!drawingRef.current) return
    drawingRef.current   = false
    const id = currentIdRef.current
    currentIdRef.current = null
    if (!id) return
    setTimeout(() => {
      setLines(prev => prev.map(l => l.id === id ? { ...l, fading: true } : l))
      setTimeout(() => setLines(prev => prev.filter(l => l.id !== id)), 1000)
    }, 3000)
  }

  const modal = (
    <div
      className="lesson-fs-overlay"
      onMouseMove={mode !== 'none' ? handleMouseMove : undefined}
      onMouseDown={mode === 'highlight' ? handleMouseDown : undefined}
      onMouseUp={mode === 'highlight' ? handleMouseUp : undefined}
      style={{ cursor: mode === 'pointer' ? 'none' : mode === 'highlight' ? 'crosshair' : undefined }}
    >
      {/* Top bar */}
      <div className="lesson-fs-bar">
        <button className="lesson-fs-close" onClick={() => setFullscreen(false)}>
          <i className="fas fa-compress" /> Sair da tela cheia
          <span className="lesson-fs-hint">ESC</span>
        </button>
        <div className="lesson-fs-tools">
          <button
            className={`lesson-fs-tool${mode === 'none' ? ' active' : ''}`}
            onClick={() => setMode('none')}
            title="Modo normal"
          >
            <i className="fas fa-mouse-pointer" />
          </button>
          <button
            className={`lesson-fs-tool${mode === 'pointer' ? ' active' : ''}`}
            onClick={() => setMode(m => m === 'pointer' ? 'none' : 'pointer')}
            title="Apontador"
          >
            <i className="fas fa-circle" style={{ color: mode === 'pointer' ? '#e53e3e' : undefined }} />
          </button>
          <button
            className={`lesson-fs-tool${mode === 'highlight' ? ' active' : ''}`}
            onClick={() => setMode(m => m === 'highlight' ? 'none' : 'highlight')}
            title="Modo destaque"
          >
            <i className="fas fa-pen" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="lesson-fs-content">
        {children}
      </div>

      {/*
        Annotation layer: position:fixed + clientX/Y coords
        → always aligned with the real cursor, independent of scroll
      */}
      {mode !== 'none' && (
        <div className="lesson-fs-annotation-layer" aria-hidden="true">
          {lines.length > 0 && (
            <svg className="lesson-fs-draw-layer">
              {lines.map(ln => (
                <polyline
                  key={ln.id}
                  points={ln.points.map(([x, y]) => `${x},${y}`).join(' ')}
                  className={`lesson-draw-line${ln.fading ? ' fading' : ''}`}
                />
              ))}
            </svg>
          )}
          {mode === 'pointer' && (
            <div
              className="lesson-fs-pointer-dot"
              style={{ left: pointerPos.x, top: pointerPos.y }}
            />
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="lesson-section">
      <div className="lesson-section-btns">
        <button
          className="lesson-fs-btn lesson-pdf-btn"
          onClick={handleExportPDF}
          title="Exportar como PDF"
          disabled={exportMode}
        >
          <i className="fas fa-download" />
        </button>
        <button
          className="lesson-fs-btn"
          onClick={() => setFullscreen(true)}
          title="Expandir para tela cheia"
        >
          <i className="fas fa-expand" />
        </button>
      </div>
      {children}
      {mounted && fullscreen && createPortal(modal, document.body)}
    </div>
  )
}
