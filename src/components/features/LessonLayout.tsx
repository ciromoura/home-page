'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'

interface FullscreenCtx {
  fullscreen:    boolean
  setFullscreen: (v: boolean) => void
  exportMode:    boolean
  setExportMode: (v: boolean) => void
}

export const LessonFullscreenContext = createContext<FullscreenCtx>({
  fullscreen:    false,
  setFullscreen: () => {},
  exportMode:    false,
  setExportMode: () => {},
})

export function useLessonFullscreen() {
  return useContext(LessonFullscreenContext)
}

export interface LessonNavArgs {
  current:     number
  goTo:        (n: number) => void
  visited:     number[]
  exportMode:  boolean
}

interface Props {
  sections: string[]
  children: (args: LessonNavArgs) => ReactNode
}

export default function LessonLayout({ sections, children }: Props) {
  const [current,    setCurrent]    = useState(0)
  const [visited,    setVisited]    = useState<number[]>([])
  const [fullscreen, setFullscreen] = useState(false)
  const [exportMode, setExportMode] = useState(false)

  function goTo(n: number) {
    setCurrent(n)
    if (n >= 1 && !visited.includes(n)) setVisited(prev => [...prev, n])
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  const progressPct = (current / (sections.length - 1)) * 100

  return (
    <LessonFullscreenContext.Provider value={{ fullscreen, setFullscreen, exportMode, setExportMode }}>
    <>
      <BackgroundBlobs />
      <div className="shadow" />
      <Navbar />

      <main style={{ paddingTop: '80px' }}>
        <div className="container">
          <div className="pabd-nav-bar">
            <div className="pabd-dots">
              {sections.map((label, i) => (
                <button
                  key={i}
                  className={`pabd-dot${i === current ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  title={label}
                />
              ))}
            </div>
            <div className="pabd-progress">
              <div className="pabd-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {children({ current, goTo, visited, exportMode })}

          <div style={{ height: '3rem' }} />
        </div>
      </main>

      <Footer />
    </>
    </LessonFullscreenContext.Provider>
  )
}
