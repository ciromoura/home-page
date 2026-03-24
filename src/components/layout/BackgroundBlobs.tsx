'use client'

import { useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

/* Each blob has:
 *  weight    – how strongly it's pulled toward the mouse (0..1)
 *  speed     – lerp factor per frame (smoothness)
 *  size      – diameter in px
 *  phaseX/Y  – drift phase offset
 *  driftAmp  – drift amplitude (fraction of screen)
 *  driftSpd  – drift speed (radians/s)
 */
const BLOBS = [
  { weight: 0.70, speed: 0.06,  size: 650, phaseX: 0.0, phaseY: 0.0, driftAmp: 0.13, driftSpd: 0.32 },
  { weight: 0.30, speed: 0.035, size: 600, phaseX: 2.0, phaseY: 1.2, driftAmp: 0.17, driftSpd: 0.26 },
  { weight: 0.12, speed: 0.018, size: 720, phaseX: 4.1, phaseY: 3.0, driftAmp: 0.11, driftSpd: 0.20 },
  { weight: 0.85, speed: 0.10,  size: 380, phaseX: 1.4, phaseY: 3.8, driftAmp: 0.20, driftSpd: 0.45 },
] as const

const COLORS = {
  light: [
    'rgba(83,137,232,0.30)',
    'rgba(108,99,255,0.24)',
    'rgba(83,137,232,0.16)',
    'rgba(108,99,255,0.20)',
  ],
  dark: [
    'rgba(129,140,248,0.22)',
    'rgba(251,146,60,0.18)',
    'rgba(129,140,248,0.14)',
    'rgba(251,146,60,0.16)',
  ],
}

export default function BackgroundBlobs() {
  const { theme }  = useTheme()
  const wrapRef    = useRef<HTMLDivElement>(null)
  const blobRefs   = useRef<(HTMLDivElement | null)[]>([])
  const mouseRef   = useRef({ x: -1, y: -1 })
  const posRef     = useRef(BLOBS.map(() => ({ x: 0, y: 0 })))
  const rafRef     = useRef(0)
  const t0Ref      = useRef(0)
  const themeRef   = useRef(theme)

  // Keep themeRef current without restarting the loop
  useEffect(() => { themeRef.current = theme }, [theme])

  useEffect(() => {
    t0Ref.current = performance.now()

    // Seed initial positions so blobs start spread, not at 0,0
    posRef.current = BLOBS.map((_, i) => ({
      x: window.innerWidth  * (0.15 + i * 0.22),
      y: window.innerHeight * 0.45,
    }))
    // Seed mouse to screen center on first load
    mouseRef.current = {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
    }

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouse)

    function frame() {
      const t  = (performance.now() - t0Ref.current) / 1000
      const W  = window.innerWidth
      const H  = window.innerHeight
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const colors = COLORS[themeRef.current]

      BLOBS.forEach((blob, i) => {
        const el = blobRefs.current[i]
        if (!el) return

        // Autonomous drift around screen center
        const baseX = W * (0.5 + Math.cos(blob.phaseX + t * blob.driftSpd) * blob.driftAmp)
        const baseY = H * (0.5 + Math.sin(blob.phaseY + t * blob.driftSpd) * blob.driftAmp)

        // Target = drift position pulled toward mouse by weight
        const tx = baseX + (mx - baseX) * blob.weight
        const ty = baseY + (my - baseY) * blob.weight

        // Smooth lerp
        posRef.current[i].x += (tx - posRef.current[i].x) * blob.speed
        posRef.current[i].y += (ty - posRef.current[i].y) * blob.speed

        const px = posRef.current[i].x - blob.size / 2
        const py = posRef.current[i].y - blob.size / 2

        el.style.transform  = `translate(${px}px,${py}px)`
        el.style.background = `radial-gradient(circle,${colors[i]},transparent 70%)`
      })

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        filter: 'blur(72px) saturate(140%)',
      }}
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          ref={el => { blobRefs.current[i] = el }}
          style={{
            position: 'absolute',
            width:  blob.size,
            height: blob.size,
            borderRadius: '50%',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
