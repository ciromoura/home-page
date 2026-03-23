'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'

/* ─── Constants ──────────────────────────────────────────────── */
const CARDS = [0, 1, 2, 3, 5, 8, 13, 21]

const MODEL_CSV = [
  'titulo,descricao,nota',
  '"Implementar login","Criar fluxo de autenticação com JWT","5"',
  '"Criar API REST","CRUD completo de recursos","8"',
  '"Refatorar componentes","Melhorar reutilização e testes",""',
].join('\n')

/* ─── Types ──────────────────────────────────────────────────── */
interface Participant {
  id: string
  name: string
  hasVoted: boolean
  vote?: number
}

interface Task {
  id: string
  title: string
  description: string
  estimate?: number
}

interface GameState {
  phase: 'setup' | 'lobby' | 'voting' | 'reveal'
  myId: string
  myName: string
  participants: Participant[]
  tasks: Task[]
  currentTaskId: string | null
  votes: Record<string, number>
  myVote: number | null
  timerTotal: number
  timerRemaining: number
  timerRunning: boolean
}

interface SharedState {
  phase: 'lobby' | 'voting' | 'reveal'
  participants: Participant[]
  tasks: Task[]
  currentTaskId: string | null
  timerTotal: number
  timerRemaining: number
  timerRunning: boolean
}

type PeerMsg = { type: 'join'; name: string } | { type: 'vote'; value: number }
type HostMsg = { type: 'state'; payload: SharedState }

/* ─── Helpers ────────────────────────────────────────────────── */
const initial: GameState = {
  phase: 'setup',
  myId: '',
  myName: '',
  participants: [],
  tasks: [],
  currentTaskId: null,
  votes: {},
  myVote: null,
  timerTotal: 0,
  timerRemaining: 0,
  timerRunning: false,
}

function calcAverage(participants: Participant[]) {
  const vals = participants.filter(p => p.vote !== undefined).map(p => p.vote as number)
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}m:${s}s`
}

function tasksToCSV(tasks: Task[]): string {
  const rows = ['titulo,descricao,nota']
  for (const t of tasks) {
    const esc = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`
    const est = t.estimate !== undefined ? String(t.estimate) : ''
    rows.push(`${esc(t.title)},${esc(t.description)},${esc(est)}`)
  }
  return rows.join('\n')
}

function parseCSV(text: string): Task[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  return lines.slice(1).flatMap(line => {
    const cols: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
        else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        cols.push(cur); cur = ''
      } else {
        cur += ch
      }
    }
    cols.push(cur)
    const [title = '', description = '', est = ''] = cols.map(s => s.trim())
    if (!title) return []
    const estimate = est && !isNaN(parseFloat(est)) ? parseFloat(est) : undefined
    return [{ id: crypto.randomUUID(), title, description, estimate }]
  })
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ─── Inner component ────────────────────────────────────────── */
function PlanningPokerInner() {
  const searchParams = useSearchParams()
  const roomParam = searchParams.get('room')
  const isHost = !roomParam

  const peerRef = useRef<any>(null)
  const connsRef = useRef<Map<string, any>>(new Map())
  const hostConnRef = useRef<any>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const gameRef = useRef<GameState>({ ...initial })
  const [, setTick] = useState(0)

  const [peerReady, setPeerReady] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [timerMin, setTimerMin] = useState(0)
  const [timerSec, setTimerSec] = useState(0)
  const [editEstimate, setEditEstimate] = useState('')
  const [copied, setCopied] = useState(false)
  const [connError, setConnError] = useState('')

  /* ── Core primitives ── */
  function update(fn: (s: GameState) => GameState) {
    gameRef.current = fn(gameRef.current)
    setTick(t => t + 1)
  }

  function broadcast() {
    const s = gameRef.current
    const reveal = s.phase === 'reveal'
    const payload: SharedState = {
      phase: s.phase as SharedState['phase'],
      participants: s.participants.map(p => ({
        ...p,
        hasVoted: s.votes[p.id] !== undefined,
        vote: reveal ? s.votes[p.id] : undefined,
      })),
      tasks: s.tasks,
      currentTaskId: s.currentTaskId,
      timerTotal: s.timerTotal,
      timerRemaining: s.timerRemaining,
      timerRunning: s.timerRunning,
    }
    const msg = JSON.stringify({ type: 'state', payload } as HostMsg)
    connsRef.current.forEach(conn => { if (conn.open) conn.send(msg) })
  }

  /* ── Host peer event handlers ── */
  function onPeerJoin(peerId: string, name: string, conn: any) {
    connsRef.current.set(peerId, conn)
    update(prev => ({
      ...prev,
      participants: [...prev.participants, { id: peerId, name, hasVoted: false }],
    }))
    broadcast()
  }

  function onPeerVote(peerId: string, value: number) {
    update(prev => {
      const votes = { ...prev.votes, [peerId]: value }
      const allVoted = prev.participants.every(p => votes[p.id] !== undefined)
      return {
        ...prev,
        votes,
        phase: allVoted ? 'reveal' : prev.phase,
        participants: prev.participants.map(p => ({
          ...p,
          hasVoted: votes[p.id] !== undefined,
          vote: allVoted ? votes[p.id] : undefined,
        })),
      }
    })
    broadcast()
  }

  function onPeerLeave(peerId: string) {
    connsRef.current.delete(peerId)
    update(prev => {
      const participants = prev.participants.filter(p => p.id !== peerId)
      const votes = { ...prev.votes }
      delete votes[peerId]
      const allVoted = participants.length > 0 && participants.every(p => votes[p.id] !== undefined)
      const phase = prev.phase === 'voting' && allVoted ? 'reveal' : prev.phase
      return { ...prev, participants, votes, phase }
    })
    broadcast()
  }

  /* ── PeerJS init ── */
  useEffect(() => {
    let destroyed = false
    import('peerjs').then(({ Peer }) => {
      if (destroyed) return
      const peer = new Peer()
      peerRef.current = peer
      peer.on('open', (id: string) => {
        update(s => ({ ...s, myId: id }))
        setPeerReady(true)
      })
      peer.on('error', (err: any) => {
        setConnError(`Erro de conexão: ${err.message ?? err.type}`)
      })
      if (isHost) {
        peer.on('connection', (conn: any) => {
          conn.on('data', (raw: string) => {
            try {
              const msg: PeerMsg = JSON.parse(raw)
              if (msg.type === 'join') onPeerJoin(conn.peer, msg.name, conn)
              else if (msg.type === 'vote') onPeerVote(conn.peer, msg.value)
            } catch {}
          })
          conn.on('close', () => onPeerLeave(conn.peer))
          conn.on('error', () => onPeerLeave(conn.peer))
        })
      }
    })
    return () => {
      destroyed = true
      peerRef.current?.destroy()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost])

  /* ── Derived ── */
  const s = gameRef.current
  const roomLink = s.myId && typeof window !== 'undefined'
    ? `${window.location.origin}/ferramentas/planning-poker?room=${s.myId}`
    : ''
  const currentTask = s.tasks.find(t => t.id === s.currentTaskId) ?? null
  const average = calcAverage(s.participants)
  const timerDone = s.timerTotal > 0 && s.timerRemaining === 0 && !s.timerRunning

  /* ── Actions: navigation ── */
  function handleEnter() {
    const name = nameInput.trim()
    if (!name || !peerReady) return
    if (isHost) {
      update(prev => ({
        ...prev,
        myName: name,
        phase: 'lobby',
        participants: [{ id: prev.myId, name, hasVoted: false }],
      }))
    } else {
      update(prev => ({ ...prev, myName: name }))
      const peer = peerRef.current
      if (!peer || !roomParam) return
      const conn = peer.connect(roomParam)
      hostConnRef.current = conn
      conn.on('open', () => {
        conn.send(JSON.stringify({ type: 'join', name } as PeerMsg))
      })
      conn.on('data', (raw: string) => {
        try {
          const msg: HostMsg = JSON.parse(raw)
          if (msg.type === 'state') {
            update(prev => {
              const taskChanged = msg.payload.currentTaskId !== prev.currentTaskId
              return {
                ...prev,
                phase: msg.payload.phase,
                participants: msg.payload.participants,
                tasks: msg.payload.tasks,
                currentTaskId: msg.payload.currentTaskId,
                timerTotal: msg.payload.timerTotal,
                timerRemaining: msg.payload.timerRemaining,
                timerRunning: msg.payload.timerRunning,
                myVote: msg.payload.phase === 'voting' && taskChanged ? null : prev.myVote,
              }
            })
          }
        } catch {}
      })
      conn.on('close', () => setConnError('Você foi desconectado da sala.'))
      conn.on('error', () => setConnError('Não foi possível conectar à sala.'))
    }
  }

  /* ── Actions: tasks ── */
  function handleAddTask() {
    const title = newTaskTitle.trim()
    if (!title) return
    update(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: crypto.randomUUID(), title, description: newTaskDesc.trim() }],
    }))
    setNewTaskTitle('')
    setNewTaskDesc('')
    broadcast()
  }

  function handleRemoveTask(id: string) {
    update(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))
    broadcast()
  }

  function handleStartVoting(taskId: string) {
    update(prev => ({
      ...prev,
      phase: 'voting',
      currentTaskId: taskId,
      votes: {},
      myVote: null,
      participants: prev.participants.map(p => ({ ...p, hasVoted: false, vote: undefined })),
    }))
    broadcast()
  }

  /* ── Actions: voting ── */
  function handleVote(value: number) {
    if (isHost) {
      update(prev => {
        const votes = { ...prev.votes, [prev.myId]: value }
        const allVoted = prev.participants.every(p => votes[p.id] !== undefined)
        return {
          ...prev, votes, myVote: value,
          phase: allVoted ? 'reveal' : prev.phase,
          participants: prev.participants.map(p => ({
            ...p,
            hasVoted: votes[p.id] !== undefined,
            vote: allVoted ? votes[p.id] : undefined,
          })),
        }
      })
      broadcast()
    } else {
      const conn = hostConnRef.current
      if (!conn?.open) return
      update(prev => ({ ...prev, myVote: value }))
      conn.send(JSON.stringify({ type: 'vote', value } as PeerMsg))
    }
  }

  function handleReveal() {
    update(prev => ({
      ...prev,
      phase: 'reveal',
      participants: prev.participants.map(p => ({ ...p, vote: prev.votes[p.id] })),
    }))
    broadcast()
  }

  function handleSaveEstimate() {
    const val = parseFloat(editEstimate)
    if (isNaN(val)) return
    update(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === prev.currentTaskId ? { ...t, estimate: val } : t),
    }))
    broadcast()
  }

  function handleNextTask() {
    const cur = gameRef.current.tasks.find(t => t.id === gameRef.current.currentTaskId)
    const finalEstimate = cur?.estimate !== undefined ? cur.estimate : (average ?? undefined)
    update(prev => ({
      ...prev,
      phase: 'lobby',
      currentTaskId: null,
      votes: {},
      myVote: null,
      participants: prev.participants.map(p => ({ ...p, hasVoted: false, vote: undefined })),
      tasks: prev.tasks.map(t => t.id === prev.currentTaskId ? { ...t, estimate: finalEstimate } : t),
    }))
    setEditEstimate('')
    broadcast()
  }

  /* ── Actions: timer ── */
  function handleStartTimer() {
    const total = timerMin * 60 + timerSec
    if (total <= 0) return
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    update(prev => ({ ...prev, timerTotal: total, timerRemaining: total, timerRunning: true }))
    broadcast()
    timerIntervalRef.current = setInterval(() => {
      update(prev => {
        if (!prev.timerRunning || prev.timerRemaining <= 0) {
          clearInterval(timerIntervalRef.current!)
          timerIntervalRef.current = null
          return { ...prev, timerRunning: false }
        }
        const remaining = prev.timerRemaining - 1
        if (remaining === 0) {
          clearInterval(timerIntervalRef.current!)
          timerIntervalRef.current = null
        }
        return { ...prev, timerRemaining: remaining, timerRunning: remaining > 0 }
      })
      broadcast()
    }, 1000)
  }

  function handleStopTimer() {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null }
    update(prev => ({ ...prev, timerRunning: false }))
    broadcast()
  }

  function handleResetTimer() {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null }
    update(prev => ({ ...prev, timerRemaining: prev.timerTotal, timerRunning: false }))
    broadcast()
  }

  /* ── Actions: CSV ── */
  function handleExportCSV() {
    downloadBlob(tasksToCSV(s.tasks), 'tarefas.csv')
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const imported = parseCSV(ev.target?.result as string)
      if (!imported.length) return
      update(prev => ({ ...prev, tasks: [...prev.tasks, ...imported] }))
      broadcast()
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  /* ── Render ── */
  if (connError) {
    return (
      <div className="card pp-error">
        <div className="pp-error-icon">⚠️</div>
        <p>{connError}</p>
        <button className="btn-primary" onClick={() => { setConnError(''); update(() => ({ ...initial })) }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <>
      {/* ── Setup ── */}
      {s.phase === 'setup' && (
        <div className="card pp-setup">
          <div className="section-tag">PLANNING POKER</div>
          <h2>{isHost ? 'Nova Sessão' : 'Entrar na Sala'}</h2>
          <p className="lead">
            {isHost
              ? 'Crie uma sala e convide seu time para estimar tarefas em conjunto.'
              : 'Você foi convidado para uma sessão de Planning Poker.'}
          </p>
          {!peerReady ? (
            <p className="pp-connecting"><i className="fas fa-circle-notch fa-spin" /> Conectando...</p>
          ) : (
            <div className="pp-setup-form">
              <input
                className="pp-input" type="text" placeholder="Seu nome"
                value={nameInput} maxLength={32}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEnter()}
                autoFocus
              />
              <button className="btn-primary btn-pabd" onClick={handleEnter} disabled={!nameInput.trim()}>
                {isHost ? '▶ Criar Sala' : '→ Entrar na Sala'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Room ── */}
      {s.phase !== 'setup' && (
        <div className="pp-room">

          {/* Flash overlay when timer < 10s */}
          {s.timerRunning && s.timerRemaining > 0 && s.timerRemaining < 10 && (
            <div className="pp-flash-overlay" />
          )}

          {/* Header */}
          <div className="card pp-header">
            <div className="pp-header-left">
              <div className="section-tag">PLANNING POKER</div>
              <h2 className="pp-header-title">
                {isHost ? `Sala de ${s.myName}` : `Sala de ${s.participants[0]?.name ?? '...'}`}
              </h2>
            </div>

            {/* Timer (center) */}
            <div className="pp-timer-area">
              {s.timerTotal > 0 && (
                <div className={`pp-timer-display${s.timerRunning ? (s.timerRemaining < 10 ? ' urgent' : ' running') : timerDone ? ' done' : ''}`}>
                  <i className="fas fa-clock" />
                  {formatTime(s.timerRemaining)}
                </div>
              )}
              {isHost && (
                <div className="pp-timer-controls">
                  <input
                    className="pp-timer-input" type="number" min={0} max={99}
                    value={timerMin}
                    onChange={e => setTimerMin(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span className="pp-timer-sep">m</span>
                  <input
                    className="pp-timer-input" type="number" min={0} max={59}
                    value={timerSec}
                    onChange={e => setTimerSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  />
                  <span className="pp-timer-sep">s</span>
                  <button className="pp-timer-btn" onClick={handleStartTimer} title="Iniciar">
                    <i className="fas fa-play" />
                  </button>
                  <button className="pp-timer-btn" onClick={handleStopTimer} title="Parar" disabled={!s.timerRunning}>
                    <i className="fas fa-stop" />
                  </button>
                  <button className="pp-timer-btn" onClick={handleResetTimer} title="Reiniciar" disabled={s.timerTotal === 0}>
                    <i className="fas fa-rotate-left" />
                  </button>
                </div>
              )}
            </div>

            {/* Room link (right) */}
            {isHost && roomLink && (
              <div className="pp-link-box">
                <span className="pp-link-label">Link para convidar</span>
                <div className="pp-link-row">
                  <code className="pp-link-code">{roomLink}</code>
                  <button
                    className={`copy-btn${copied ? ' copied' : ''}`}
                    onClick={() => {
                      navigator.clipboard.writeText(roomLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? 'copiado ✓' : 'copiar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3-column grid */}
          <div className="pp-3col">

            {/* ── Col 1: Participants ── */}
            <div className="card pp-participants">
              <h4>Participantes <span className="pp-count">{s.participants.length}</span></h4>
              <ul className="pp-participants-list">
                {s.participants.map(p => (
                  <li key={p.id} className={`pp-participant${p.hasVoted ? ' voted' : ''}`}>
                    <div className="pp-avatar">{p.name.charAt(0).toUpperCase()}</div>
                    <span className="pp-pname">
                      {p.name}
                      {p.id === s.myId && <em> (você)</em>}
                      {isHost && p.id === s.myId && ' · facilitador'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Col 2: Voting ── */}
            <div className="pp-col-vote">
              {s.phase === 'lobby' && (
                <div className="card pp-waiting">
                  <div className="pp-waiting-icon">🃏</div>
                  <h3>Aguardando tarefa</h3>
                  <p>
                    {isHost
                      ? 'Selecione uma tarefa e clique em ▶ para iniciar a votação.'
                      : 'O facilitador está preparando a próxima tarefa...'}
                  </p>
                </div>
              )}

              {(s.phase === 'voting' || s.phase === 'reveal') && currentTask && (
                <div className="card pp-vote-panel">
                  <div className="pp-task-badge">EM VOTAÇÃO</div>
                  <h3 className="pp-task-title">{currentTask.title}</h3>
                  {currentTask.description && (
                    <p className="pp-task-desc-vote">{currentTask.description}</p>
                  )}

                  {/* Per-participant face-down / revealed cards */}
                  <div className="pp-player-cards">
                    {s.participants.map(p => (
                      <div key={p.id} className="pp-player-card-wrap">
                        <div className={`pp-player-card${
                          s.phase === 'reveal' ? ' revealed' : p.hasVoted ? ' voted' : ''
                        }`}>
                          {s.phase === 'reveal' ? (p.vote !== undefined ? p.vote : '?') : null}
                        </div>
                        <span className="pp-player-name">{p.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card selection (voting only) */}
                  {s.phase === 'voting' && (
                    <>
                      <p className="pp-card-hint">
                        {s.myVote !== null ? `Seu voto: ${s.myVote} — clique para mudar` : 'Escolha sua estimativa:'}
                      </p>
                      <div className="pp-cards-row">
                        {CARDS.map(v => (
                          <button
                            key={v}
                            className={`pp-card${s.myVote === v ? ' selected' : ''}`}
                            onClick={() => handleVote(v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      {isHost && (
                        <div className="pp-reveal-action">
                          <button className="btn-outline" onClick={handleReveal}>
                            <i className="fas fa-eye" /> Revelar votos
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Results (reveal only) */}
                  {s.phase === 'reveal' && (
                    <div className="pp-reveal">
                      <div className="pp-average">
                        <span className="pp-average-label">Média</span>
                        <span className="pp-average-value">{average ?? '—'}</span>
                      </div>
                      {isHost ? (
                        <div className="pp-estimate-form">
                          <span className="pp-estimate-label">Estimativa final</span>
                          <input
                            className="pp-input pp-estimate-input"
                            type="number" min="0"
                            placeholder={average !== null ? String(average) : ''}
                            value={editEstimate}
                            onChange={e => setEditEstimate(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveEstimate()}
                          />
                          <button className="btn-outline" onClick={handleSaveEstimate}>Salvar</button>
                          <button className="btn-primary btn-pabd" onClick={handleNextTask}>
                            Próxima tarefa →
                          </button>
                        </div>
                      ) : (
                        <p className="pp-peer-waiting">Aguardando o facilitador avançar...</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Col 3: Tasks ── */}
            <div className="card pp-tasks">
              <h4>Tarefas</h4>

              {isHost && (
                <>
                  <div className="pp-add-task-form">
                    <input
                      className="pp-input" type="text" placeholder="Título *"
                      value={newTaskTitle} maxLength={120}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    />
                    <input
                      className="pp-input" type="text" placeholder="Descrição (opcional)"
                      value={newTaskDesc} maxLength={240}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    />
                    <button
                      className="btn-primary pp-add-full-btn"
                      onClick={handleAddTask}
                      disabled={!newTaskTitle.trim()}
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="pp-csv-actions">
                    <button className="pp-csv-btn" onClick={handleExportCSV} title="Exportar CSV">
                      <i className="fas fa-download" /> Exportar
                    </button>
                    <label className="pp-csv-btn" title="Importar CSV">
                      <i className="fas fa-upload" /> Importar
                      <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportCSV} />
                    </label>
                    <button
                      className="pp-csv-btn model"
                      onClick={() => downloadBlob(MODEL_CSV, 'modelo-tarefas.csv')}
                      title="Baixar modelo CSV"
                    >
                      <i className="fas fa-file-lines" /> Modelo
                    </button>
                  </div>
                </>
              )}

              {s.tasks.length === 0 && (
                <p className="pp-empty">
                  {isHost ? 'Nenhuma tarefa. Adicione acima.' : 'Nenhuma tarefa ainda.'}
                </p>
              )}

              <ul className="pp-task-list">
                {s.tasks.map(t => (
                  <li key={t.id} className={`pp-task-item${t.id === s.currentTaskId ? ' active' : ''}`}>
                    <div className="pp-task-body">
                      <span className="pp-task-title">{t.title}</span>
                      {t.description && <span className="pp-task-desc">{t.description}</span>}
                    </div>
                    <div className="pp-task-meta">
                      {t.estimate !== undefined && <span className="pp-task-est">{t.estimate}</span>}
                      {isHost && s.phase === 'lobby' && (
                        <>
                          <button className="pp-task-btn vote" onClick={() => handleStartVoting(t.id)} title="Votar">▶</button>
                          <button className="pp-task-btn del" onClick={() => handleRemoveTask(t.id)} title="Remover">×</button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

/* ─── Page wrapper ───────────────────────────────────────────── */
export default function PlanningPokerPage() {
  return (
    <>
      <BackgroundBlobs />
      <div className="shadow" />
      <Navbar />
      <main style={{ paddingTop: '80px', paddingBottom: '3rem' }}>
        <div className="pp-page-wrap">
          <Suspense
            fallback={<div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}
          >
            <PlanningPokerInner />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
