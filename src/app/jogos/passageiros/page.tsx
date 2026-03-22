'use client'

import { useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'

// ── Constants ────────────────────────────────────────────
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22']
const TYPES = [
  { cap: 2, cls: 'h-size-2' },
  { cap: 4, cls: 'h-size-4' },
  { cap: 8, cls: 'h-size-8' },
]
const MAX_DOCK = 5

// ── Types ────────────────────────────────────────────────
interface Passenger { color: string; id: number }
interface Vehicle { id: string; color: string; cap: number; count: number; cls: string }

interface GameState {
  level: number
  passengers: Passenger[]
  parking: Vehicle[]
  dock: Vehicle[]
  time: number
  isPlaying: boolean
  isProcessing: boolean
  colorMap: Record<string, number>
}

// ── Helpers ──────────────────────────────────────────────
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randId() { return Math.random().toString(36).slice(2) }

function generatePassengers(total: number): { passengers: Passenger[]; colorMap: Record<string, number> } {
  const passengers: Passenger[] = []
  const colorMap: Record<string, number> = {}
  COLORS.forEach(c => (colorMap[c] = 0))
  let count = 0
  while (count < total) {
    const color = rand(COLORS)
    const group = Math.min(Math.floor(Math.random() * 6) + 1, total - count)
    for (let i = 0; i < group; i++) { passengers.push({ color, id: Math.random() }); colorMap[color]++ }
    count += group
  }
  return { passengers, colorMap }
}

function generateVehicles(colorMap: Record<string, number>): Vehicle[] {
  const vehicles: Vehicle[] = []
  for (const colorCode in colorMap) {
    let needed = colorMap[colorCode]
    let cap = 0
    while (cap < needed) {
      const type = rand(TYPES)
      vehicles.push({ id: randId(), color: colorCode, cap: type.cap, count: 0, cls: type.cls })
      cap += type.cap
    }
    const extra = TYPES[0]
    vehicles.push({ id: randId(), color: colorCode, cap: extra.cap, count: 0, cls: extra.cls })
  }
  for (let i = 0; i < 5; i++) {
    const color = rand(COLORS)
    const type = rand(TYPES)
    vehicles.push({ id: randId(), color, cap: type.cap, count: 0, cls: type.cls })
  }
  return vehicles.sort(() => Math.random() - 0.5)
}

function buildInitialState(level: number): GameState {
  const pCount = 30 + level * 15
  const time = 60 + level * 10
  const { passengers, colorMap } = generatePassengers(pCount)
  const parking = generateVehicles(colorMap)
  return { level, passengers, parking, dock: [], time, isPlaying: true, isProcessing: false, colorMap }
}

// ── VehicleCard ──────────────────────────────────────────
function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle; onClick?: () => void }) {
  const sizeStyle: React.CSSProperties =
    vehicle.cls === 'h-size-2' ? { height: 60 }
    : vehicle.cls === 'h-size-4' ? { height: 110 }
    : { height: 190 }

  return (
    <div
      onClick={onClick}
      style={{
        width: 50, backgroundColor: vehicle.color, borderRadius: '6px 6px 2px 2px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column-reverse', alignItems: 'center',
        padding: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', position: 'relative',
        marginBottom: 5, transition: 'all 0.3s', ...sizeStyle
      }}
    >
      {Array.from({ length: vehicle.cap }, (_, i) => (
        <div key={i} style={{
          width: 16, height: 16, borderRadius: '50%', margin: '2px 0',
          backgroundColor: i < vehicle.count ? '#fff' : 'rgba(0,0,0,0.3)',
          border: i < vehicle.count ? '2px solid white' : 'none',
          boxShadow: i < vehicle.count ? '0 0 5px rgba(255,255,255,0.5)' : 'none',
        }} />
      ))}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────
export default function PassageirosPage() {
  const stateRef = useRef<GameState>(buildInitialState(1))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // DOM refs for HUD (avoid React re-renders every second)
  const lvlRef = useRef<HTMLSpanElement>(null)
  const queueRef = useRef<HTMLSpanElement>(null)
  const dockSlotsRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)

  // Refs to container nodes for direct DOM rendering
  const queueTrackRef = useRef<HTMLDivElement>(null)
  const parkingRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const endTitleRef = useRef<HTMLHeadingElement>(null)
  const endMsgRef = useRef<HTMLParagraphElement>(null)
  const btnNextRef = useRef<HTMLButtonElement>(null)
  const btnRestartRef = useRef<HTMLButtonElement>(null)

  const updateHUD = useCallback(() => {
    const s = stateRef.current
    if (lvlRef.current) lvlRef.current.textContent = String(s.level)
    if (queueRef.current) queueRef.current.textContent = String(s.passengers.length)
    if (dockSlotsRef.current) {
      dockSlotsRef.current.textContent = String(MAX_DOCK - s.dock.length)
      dockSlotsRef.current.style.color = s.dock.length === MAX_DOCK ? '#e74c3c' : '#f1c40f'
    }
    if (timeRef.current) timeRef.current.textContent = s.time + 's'
  }, [])

  const renderQueue = useCallback(() => {
    const el = queueTrackRef.current
    if (!el) return
    el.innerHTML = ''
    const limit = Math.min(stateRef.current.passengers.length, 15)
    for (let i = 0; i < limit; i++) {
      const p = stateRef.current.passengers[i]
      const div = document.createElement('div')
      div.style.cssText = `width:30px;height:30px;border-radius:50%;background-color:${p.color};border:2px solid rgba(0,0,0,0.1);box-shadow:1px 1px 3px rgba(0,0,0,0.2);flex-shrink:0`
      el.appendChild(div)
    }
  }, [])

  const createVehicleEl = useCallback((v: Vehicle, onClick?: () => void) => {
    const el = document.createElement('div')
    const h = v.cls === 'h-size-2' ? 60 : v.cls === 'h-size-4' ? 110 : 190
    el.style.cssText = `width:50px;height:${h}px;background-color:${v.color};border-radius:6px 6px 2px 2px;cursor:${onClick ? 'pointer' : 'default'};display:flex;flex-direction:column-reverse;align-items:center;padding:4px;box-shadow:0 4px 6px rgba(0,0,0,0.3);position:relative;margin-bottom:5px;`
    if (onClick) el.onclick = onClick
    for (let i = 0; i < v.cap; i++) {
      const seat = document.createElement('div')
      seat.style.cssText = `width:16px;height:16px;border-radius:50%;margin:2px 0;`
      if (i < v.count) {
        seat.style.backgroundColor = '#fff'
        seat.style.border = '2px solid white'
        seat.style.boxShadow = '0 0 5px rgba(255,255,255,0.5)'
      } else {
        seat.style.backgroundColor = 'rgba(0,0,0,0.3)'
      }
      el.appendChild(seat)
    }
    return el
  }, [])

  const renderParking = useCallback(() => {
    const el = parkingRef.current
    if (!el) return
    el.innerHTML = ''
    stateRef.current.parking.forEach((v, idx) => {
      el.appendChild(createVehicleEl(v, () => moveFromParkingToDock(idx)))
    })
  }, []) // eslint-disable-line

  const renderDock = useCallback(() => {
    const el = dockRef.current
    if (!el) return
    el.innerHTML = '<div style="position:absolute;top:5px;left:10px;color:rgba(255,255,255,0.3);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Zona de Embarque (Max 5)</div>'
    stateRef.current.dock.forEach(v => {
      el.appendChild(createVehicleEl(v))
    })
  }, []) // eslint-disable-line

  const updateUI = useCallback(() => {
    renderQueue()
    renderDock()
    renderParking()
    updateHUD()
  }, [renderQueue, renderDock, renderParking, updateHUD])

  const gameOver = useCallback((win: boolean, msg?: string) => {
    const s = stateRef.current
    s.isPlaying = false
    if (timerRef.current) clearInterval(timerRef.current)
    if (modalRef.current) modalRef.current.style.display = 'flex'
    if (win) {
      if (endTitleRef.current) { endTitleRef.current.textContent = 'Nível Completo!'; endTitleRef.current.style.color = '#2ecc71' }
      if (endMsgRef.current) endMsgRef.current.textContent = 'Todos os passageiros embarcaram.'
      if (btnNextRef.current) btnNextRef.current.style.display = 'block'
      if (btnRestartRef.current) btnRestartRef.current.style.display = 'none'
    } else {
      if (endTitleRef.current) { endTitleRef.current.textContent = 'Derrota'; endTitleRef.current.style.color = '#e74c3c' }
      if (endMsgRef.current) endMsgRef.current.textContent = msg || 'Você falhou.'
      if (btnNextRef.current) btnNextRef.current.style.display = 'none'
      if (btnRestartRef.current) btnRestartRef.current.style.display = 'block'
    }
  }, [])

  const checkGridlock = useCallback(() => {
    const s = stateRef.current
    if (s.dock.length === MAX_DOCK && s.passengers.length > 0) {
      const pColor = s.passengers[0].color
      const hasMatch = s.dock.some(v => v.color === pColor && v.count < v.cap)
      if (!hasMatch) gameOver(false, 'Engarrafamento! Doca cheia e sem cor compatível.')
    }
  }, [gameOver])

  const attemptBoarding = useCallback(() => {
    const s = stateRef.current
    if (s.passengers.length === 0) { gameOver(true); return }

    s.isProcessing = true
    const passenger = s.passengers[0]
    const targetVehicle = s.dock.find(v => v.color === passenger.color && v.count < v.cap)

    if (targetVehicle) {
      s.passengers.shift()
      targetVehicle.count++
      updateUI()
      setTimeout(() => {
        // Process departures
        const fullIndices = s.dock.map((v, i) => v.count >= v.cap ? i : -1).filter(i => i !== -1).sort((a, b) => b - a)
        if (fullIndices.length > 0) {
          fullIndices.forEach(idx => s.dock.splice(idx, 1))
          updateUI()
          setTimeout(() => attemptBoarding(), 300)
        } else {
          attemptBoarding()
        }
      }, 200)
    } else {
      s.isProcessing = false
      checkGridlock()
    }
  }, [updateUI, gameOver, checkGridlock]) // eslint-disable-line

  const moveFromParkingToDock = useCallback((parkingIdx: number) => {
    const s = stateRef.current
    if (!s.isPlaying || s.isProcessing) return
    if (s.dock.length >= MAX_DOCK) return
    const vehicle = s.parking.splice(parkingIdx, 1)[0]
    s.dock.push(vehicle)
    updateUI()
    attemptBoarding()
  }, [updateUI, attemptBoarding])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const s = stateRef.current
      if (!s.isPlaying) return
      s.time--
      if (timeRef.current) timeRef.current.textContent = s.time + 's'
      if (s.time <= 0) gameOver(false, 'Tempo esgotado!')
    }, 1000)
  }, [gameOver])

  const initLevel = useCallback(() => {
    const level = stateRef.current.level
    stateRef.current = buildInitialState(level)
    if (modalRef.current) modalRef.current.style.display = 'none'
    updateUI()
    startTimer()
  }, [updateUI, startTimer])

  useEffect(() => {
    initLevel()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, []) // eslint-disable-line

  return (
    <>
      <BackgroundBlobs />
      <div className="shadow"></div>
      <Navbar />

      <main style={{ paddingTop: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', fontFamily: "'Segoe UI', sans-serif", userSelect: 'none', overflow: 'hidden', position: 'relative' }}>

          {/* HUD */}
          <div style={{ height: 50, backgroundColor: '#1a252f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 20, fontSize: '0.9rem' }}>
            <div>Nível: <span ref={lvlRef} style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: 5 }}>1</span></div>
            <div>Fila: <span ref={queueRef} style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: 5 }}>0</span></div>
            <div>Vagas na Doca: <span ref={dockSlotsRef} style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: 5 }}>5</span></div>
            <div>Tempo: <span ref={timeRef} style={{ color: '#f1c40f', fontWeight: 'bold', marginLeft: 5 }}>90s</span></div>
          </div>

          {/* Queue */}
          <div style={{ height: 80, backgroundColor: '#ecf0f1', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '4px solid #bdc3c7', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 50, top: 0, bottom: 0, width: 4, backgroundColor: '#e74c3c', zIndex: 5, boxShadow: '2px 0 5px rgba(0,0,0,0.2)' }} />
            <div ref={queueTrackRef} style={{ display: 'flex', gap: 8, paddingLeft: 60 }} />
          </div>

          {/* Dock */}
          <div ref={dockRef} style={{ height: 220, backgroundColor: '#4b6584', borderBottom: '4px solid #2c3e50', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '10px 20px', gap: 10, position: 'relative' }} />

          {/* Parking */}
          <div ref={parkingRef} style={{ flex: 1, backgroundColor: '#34495e', padding: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'flex-start', gap: 12, overflowY: 'auto' }} />

          {/* Modal */}
          <div ref={modalRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 100, color: 'white' }}>
            <h1 ref={endTitleRef} style={{ fontSize: '2.5rem', marginBottom: 10 }}>Fim</h1>
            <p ref={endMsgRef}>...</p>
            <button ref={btnNextRef} onClick={() => { stateRef.current.level++; initLevel() }} style={{ padding: '12px 30px', fontSize: '1.2rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: 25, cursor: 'pointer', marginTop: 20 }}>
              Próximo Nível
            </button>
            <button ref={btnRestartRef} onClick={() => { stateRef.current.level = 1; initLevel() }} style={{ padding: '12px 30px', fontSize: '1.2rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: 25, cursor: 'pointer', marginTop: 10, display: 'none' }}>
              Reiniciar
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
