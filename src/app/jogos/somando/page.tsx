'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import type { Metadata } from 'next'

const CANVAS_W = 600
const CANVAS_H = 800
const GAME_DURATION = 60

interface FallingObj {
  x: number
  y: number
  size: number
  speed: number
  type: 'triangle' | 'circle'
  operator: 'add' | 'multiply' | 'subtract' | 'divide'
  value: number
  displayText: string
}

function makeFallingObj(): FallingObj {
  const size = 35
  const x = Math.random() * (CANVAS_W - size * 2) + size
  const y = -40
  const speed = 3 + Math.random() * 3
  const type = Math.random() > 0.5 ? 'triangle' : 'circle'

  let operator: FallingObj['operator']
  let value: number
  let displayText: string

  if (type === 'triangle') {
    if (Math.random() < 0.2) {
      operator = 'multiply'
      value = Math.floor(Math.random() * 2) + 2
      displayText = 'x' + value
    } else {
      operator = 'add'
      value = Math.floor(Math.random() * 5) + 1
      displayText = '+' + value
    }
  } else {
    if (Math.random() < 0.2) {
      operator = 'divide'
      value = 2
      displayText = '/2'
    } else {
      operator = 'subtract'
      value = Math.floor(Math.random() * 8) + 1
      displayText = '-' + value
    }
  }

  return { x, y, size, speed, type, operator, value, displayText }
}

export default function SomandoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const livesRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const [overlay, setOverlay] = useState<{ title: string; subtitle: string } | null>(null)
  const gameRunningRef = useRef(false)
  const startGameRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const keys = { ArrowLeft: false, ArrowRight: false }
    let gameRunning = false
    let animationId = 0
    let frameCount = 0
    let timeLeft = GAME_DURATION
    let touchTargetX: number | null = null

    const player = { x: CANVAS_W / 2, y: CANVAS_H - 100, width: 30, speed: 7, count: 1, color: '#FFD700' }
    let objects: FallingObj[] = []

    const onKeyDown = (e: KeyboardEvent) => { if (e.code in keys) keys[e.code as keyof typeof keys] = true }
    const onKeyUp = (e: KeyboardEvent) => { if (e.code in keys) keys[e.code as keyof typeof keys] = false }

    function getCanvasX(clientX: number): number {
      const rect = canvas!.getBoundingClientRect()
      const scaleX = CANVAS_W / rect.width
      return (clientX - rect.left) * scaleX
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!gameRunning) return
      e.preventDefault()
      touchTargetX = getCanvasX(e.clientX)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!gameRunning || e.buttons === 0) return
      e.preventDefault()
      touchTargetX = getCanvasX(e.clientX)
    }
    const onPointerUp = () => { touchTargetX = null }

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false })
    canvas.addEventListener('pointermove', onPointerMove, { passive: false })
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    function drawPlayer() {
      ctx.fillStyle = player.color
      const visualLimit = Math.min(player.count, 40)
      for (let i = 0; i < visualLimit; i++) {
        let offsetX = 0, offsetY = 0
        if (i > 0) {
          const spread = 10 + Math.sqrt(player.count) * 2
          offsetX = (Math.random() - 0.5) * spread * 2
          offsetY = (Math.random() - 0.5) * spread
        }
        const px = player.x + offsetX, py = player.y + offsetY, size = 20
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px - size / 2, py + size)
        ctx.lineTo(px + size / 2, py + size)
        ctx.fill()
        ctx.closePath()
      }
    }

    function drawObj(obj: FallingObj) {
      ctx.beginPath()
      if (obj.type === 'triangle') {
        ctx.fillStyle = '#4CAF50'
        ctx.moveTo(obj.x, obj.y)
        ctx.lineTo(obj.x - obj.size / 2, obj.y + obj.size)
        ctx.lineTo(obj.x + obj.size / 2, obj.y + obj.size)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(obj.displayText, obj.x, obj.y + obj.size * 0.75)
      } else {
        ctx.fillStyle = '#F44336'
        ctx.arc(obj.x, obj.y + obj.size / 2, obj.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'white'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(obj.displayText, obj.x, obj.y + obj.size / 2 + 5)
      }
      ctx.closePath()
    }

    function update() {
      if (!gameRunning) return
      if (keys.ArrowLeft && player.x > 30) player.x -= player.speed
      if (keys.ArrowRight && player.x < CANVAS_W - 30) player.x += player.speed
      if (touchTargetX !== null) {
        const dx = touchTargetX - player.x
        if (Math.abs(dx) < player.speed) player.x = touchTargetX
        else player.x += Math.sign(dx) * player.speed
        player.x = Math.max(30, Math.min(CANVAS_W - 30, player.x))
      }
      if (frameCount % 45 === 0) objects.push(makeFallingObj())

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]
        obj.y += obj.speed
        if (obj.y > CANVAS_H) { objects.splice(i, 1); continue }

        const playerRadius = 20 + Math.sqrt(player.count) * 2
        const dist = Math.hypot(player.x - obj.x, (player.y + 15) - (obj.y + 15))
        if (dist < playerRadius + 15) {
          if (obj.operator === 'add') player.count += obj.value
          else if (obj.operator === 'multiply') player.count *= obj.value
          else if (obj.operator === 'subtract') player.count -= obj.value
          else if (obj.operator === 'divide') player.count = Math.floor(player.count / obj.value)
          player.count = Math.floor(player.count)
          objects.splice(i, 1)
          if (player.count <= 0) { player.count = 0; doGameOver(false); return }
        }
      }

      if (frameCount % 60 === 0) {
        timeLeft--
        if (timeLeft <= 0) doGameOver(true)
      }
      frameCount++
    }

    function draw() {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      if (gameRunning) drawPlayer()
      objects.forEach(drawObj)
      if (livesRef.current) livesRef.current.textContent = String(player.count)
      if (timeRef.current) timeRef.current.textContent = String(timeLeft)
    }

    function loop() {
      if (gameRunning) {
        update()
        draw()
        animationId = requestAnimationFrame(loop)
      }
    }

    function doGameOver(victory: boolean) {
      gameRunning = false
      gameRunningRef.current = false
      cancelAnimationFrame(animationId)
      setOverlay(
        victory
          ? { title: 'VITÓRIA!', subtitle: `Exército Final: ${player.count} unidades!` }
          : { title: 'DERROTA', subtitle: 'Seu exército foi eliminado.' }
      )
    }

    function startGame() {
      player.count = 1
      player.x = CANVAS_W / 2
      objects = []
      timeLeft = GAME_DURATION
      frameCount = 0
      keys.ArrowLeft = false
      keys.ArrowRight = false
      touchTargetX = null
      gameRunning = true
      gameRunningRef.current = true
      setOverlay(null)
      loop()
    }

    startGameRef.current = startGame
    startGame()

    return () => {
      gameRunning = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return (
    <>
      <BackgroundBlobs />
      <div className="shadow"></div>
      <Navbar />

      <main style={{ paddingTop: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '1rem' }}>
          <div style={{ position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
            {/* HUD */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
              display: 'flex', justifyContent: 'space-between', padding: '8px 10px',
              pointerEvents: 'none'
            }}>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '1px 1px 2px black' }}>
                Exército: <span ref={livesRef} style={{ color: '#FFD700' }}>1</span>
              </div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', textShadow: '1px 1px 2px black' }}>
                Tempo: <span ref={timeRef}>{GAME_DURATION}</span>s
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ backgroundColor: '#333', border: '2px solid #555', display: 'block', maxWidth: '100%' }}
            />

            {/* Overlay */}
            {overlay && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', color: 'white', zIndex: 10
              }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: overlay.title === 'VITÓRIA!' ? '#4CAF50' : '#F44336' }}>
                  {overlay.title}
                </h1>
                <p style={{ marginBottom: '30px', color: '#ccc' }}>{overlay.subtitle}</p>
                <button
                  onClick={() => startGameRef.current()}
                  style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#00bcd4', color: 'white' }}
                >
                  Nova Partida
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
