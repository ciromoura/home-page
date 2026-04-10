'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'

// ─── Types ──────────────────────────────────────────────────────

interface Task {
  id: string
  title: string
  description: string
  color: string
}

type ColumnId = 'todo' | 'doing' | 'done'

interface Column {
  id: ColumnId
  title: string
  tasks: Task[]
}

interface BoardData {
  name: string
  columns: Column[]
  updatedAt: number
}

// Collaboration protocol types
type KanbanMutation =
  | { op: 'addTask';    columnId: ColumnId; task: Task }
  | { op: 'editTask';   columnId: ColumnId; task: Task }
  | { op: 'deleteTask'; columnId: ColumnId; taskId: string }
  | { op: 'moveTask';   taskId: string; fromColumn: ColumnId; toColumn: ColumnId }
  | { op: 'renameBoard'; name: string }

type KanbanPeerMsg =
  | { type: 'join'; name: string }
  | { type: 'mutation'; payload: KanbanMutation }

type KanbanHostMsg = { type: 'state'; board: BoardData }

// ─── Constants ──────────────────────────────────────────────────

const LS_KEY = 'kanban-board-v1'

const LABEL_COLORS = [
  '#ef5350', '#ff9800', '#fdd835', '#66bb6a',
  '#42a5f5', '#ab47bc', '#26c6da', '#78909c',
]

const DEFAULT_BOARD: BoardData = {
  name: 'Meu Quadro',
  columns: [
    { id: 'todo',  title: 'Em Aberto',  tasks: [] },
    { id: 'doing', title: 'Executando', tasks: [] },
    { id: 'done',  title: 'Concluídas', tasks: [] },
  ],
  updatedAt: Date.now(),
}

// ─── Helpers ────────────────────────────────────────────────────

function encodeBoard(data: BoardData): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  } catch {
    return ''
  }
}

function decodeBoard(str: string): BoardData | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(str))))
    if (parsed && Array.isArray(parsed.columns)) return parsed as BoardData
    return null
  } catch {
    return null
  }
}

function loadFromLS(): BoardData | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.columns)) return parsed as BoardData
    return null
  } catch {
    return null
  }
}

function saveToLS(data: BoardData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...data, updatedAt: Date.now() }))
  } catch {}
}

function downloadJSON(data: BoardData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.name.replace(/\s+/g, '-').toLowerCase()}-kanban.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Pure function: applies a mutation to a board and returns the new state
function applyMutation(b: BoardData, m: KanbanMutation): BoardData {
  switch (m.op) {
    case 'addTask':
      return {
        ...b,
        updatedAt: Date.now(),
        columns: b.columns.map(col =>
          col.id === m.columnId ? { ...col, tasks: [...col.tasks, m.task] } : col
        ),
      }
    case 'editTask':
      return {
        ...b,
        updatedAt: Date.now(),
        columns: b.columns.map(col =>
          col.id === m.columnId
            ? { ...col, tasks: col.tasks.map(t => t.id === m.task.id ? m.task : t) }
            : col
        ),
      }
    case 'deleteTask':
      return {
        ...b,
        updatedAt: Date.now(),
        columns: b.columns.map(col =>
          col.id === m.columnId
            ? { ...col, tasks: col.tasks.filter(t => t.id !== m.taskId) }
            : col
        ),
      }
    case 'moveTask': {
      let moved: Task | undefined
      const cols = b.columns.map(col => {
        if (col.id === m.fromColumn) {
          moved = col.tasks.find(t => t.id === m.taskId)
          return { ...col, tasks: col.tasks.filter(t => t.id !== m.taskId) }
        }
        return col
      })
      if (!moved) return b
      const task = moved
      return {
        ...b,
        updatedAt: Date.now(),
        columns: cols.map(col =>
          col.id === m.toColumn ? { ...col, tasks: [...col.tasks, task] } : col
        ),
      }
    }
    case 'renameBoard':
      return { ...b, name: m.name, updatedAt: Date.now() }
  }
}

// ─── Inner component ─────────────────────────────────────────────

function KanbanInner() {
  const searchParams = useSearchParams()
  const shareParam = searchParams.get('d')
  const roomParam  = searchParams.get('room')
  const viewOnly   = searchParams.get('v') === '1'
  const isHost     = !roomParam

  // Standalone board state
  const [board, setBoard]       = useState<BoardData>(DEFAULT_BOARD)
  const [loaded, setLoaded]     = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // Task form
  const [editingTask, setEditingTask]   = useState<{ columnId: ColumnId; task: Task } | null>(null)
  const [newTaskColumn, setNewTaskColumn] = useState<ColumnId | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc]   = useState('')
  const [formColor, setFormColor] = useState('')

  // Static share panel
  const [shareOpen, setShareOpen]   = useState(false)
  const [copiedLink, setCopiedLink] = useState<'' | 'edit' | 'view'>('')

  // Drag state
  const dragState = useRef<{
    taskId: string
    fromColumn: ColumnId
    ghost: HTMLElement | null
    offsetX: number
    offsetY: number
  } | null>(null)
  const [draggingId, setDraggingId]       = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null)
  const columnRefs = useRef<Record<ColumnId, HTMLElement | null>>({
    todo: null, doing: null, done: null,
  })

  // ── Collaboration ──
  const peerRef         = useRef<any>(null)
  const connsRef        = useRef<Map<string, any>>(new Map())
  const hostConnRef     = useRef<any>(null)
  const collabBoardRef  = useRef<BoardData | null>(null)
  const participantsRef = useRef<Array<{ id: string; name: string }>>([])
  const myPeerIdRef     = useRef<string>('')

  const [, setTick]                     = useState(0)
  const [collabActive, setCollabActive] = useState(false)
  const [peerReady, setPeerReady]       = useState(false)
  const [collabError, setCollabError]   = useState('')
  const [roomLink, setRoomLink]         = useState('')
  const [copiedRoom, setCopiedRoom]     = useState(false)

  // ── Init board: load from URL param or localStorage ──
  useEffect(() => {
    if (roomParam) {
      // Guest collab: board will come from host after connection
      setLoaded(true)
      return
    }
    if (shareParam) {
      const decoded = decodeBoard(shareParam)
      if (decoded) {
        setBoard(decoded)
        setLoaded(true)
        return
      }
    }
    const fromLS = loadFromLS()
    if (fromLS) setBoard(fromLS)
    setLoaded(true)
  }, [shareParam, roomParam])

  // ── Auto-save to localStorage (standalone only) ──
  useEffect(() => {
    if (!loaded || viewOnly || collabActive) return
    saveToLS(board)
  }, [board, loaded, viewOnly, collabActive])

  // ── PeerJS init ──
  useEffect(() => {
    let destroyed = false
    import('peerjs').then(({ Peer }) => {
      if (destroyed) return
      const peer = new Peer()
      peerRef.current = peer

      peer.on('open', (id: string) => {
        myPeerIdRef.current = id
        setPeerReady(true)

        if (!isHost && roomParam) {
          // Guest: auto-connect to host
          const conn = peer.connect(roomParam)
          hostConnRef.current = conn
          conn.on('open', () => {
            setCollabActive(true)
            conn.send(JSON.stringify({
              type: 'join',
              name: `Usuário ${id.slice(0, 4)}`,
            } as KanbanPeerMsg))
          })
          conn.on('data', (raw: unknown) => {
            try {
              const msg: KanbanHostMsg = JSON.parse(raw as string)
              if (msg.type === 'state') {
                collabBoardRef.current = msg.board
                setTick(t => t + 1)
              }
            } catch {}
          })
          conn.on('close', () => setCollabError('Desconectado da sala.'))
          conn.on('error', () => setCollabError('Não foi possível conectar à sala.'))
        }
      })

      peer.on('error', (err: any) => {
        setCollabError(`Erro de conexão: ${err.message ?? err.type}`)
      })

      if (isHost) {
        peer.on('connection', (conn: any) => {
          // Reject connections before the room is created
          if (!collabBoardRef.current) { conn.close(); return }

          conn.on('data', (raw: string) => {
            try {
              const msg: KanbanPeerMsg = JSON.parse(raw)
              if (msg.type === 'join') {
                connsRef.current.set(conn.peer, conn)
                participantsRef.current = [
                  ...participantsRef.current,
                  { id: conn.peer, name: msg.name },
                ]
                setTick(t => t + 1)
                // Send current board to new joiner
                conn.send(JSON.stringify({ type: 'state', board: collabBoardRef.current } as KanbanHostMsg))
                broadcastState()
              } else if (msg.type === 'mutation') {
                collabBoardRef.current = applyMutation(collabBoardRef.current!, msg.payload)
                setTick(t => t + 1)
                broadcastState()
              }
            } catch {}
          })
          conn.on('close', () => {
            connsRef.current.delete(conn.peer)
            participantsRef.current = participantsRef.current.filter(p => p.id !== conn.peer)
            setTick(t => t + 1)
          })
          conn.on('error', () => {
            connsRef.current.delete(conn.peer)
            participantsRef.current = participantsRef.current.filter(p => p.id !== conn.peer)
            setTick(t => t + 1)
          })
        })
      }
    })

    return () => {
      destroyed = true
      peerRef.current?.destroy()
    }
  }, [isHost, roomParam]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Collab helpers ──
  function broadcastState() {
    const msg = JSON.stringify({ type: 'state', board: collabBoardRef.current } as KanbanHostMsg)
    connsRef.current.forEach(conn => { if (conn.open) conn.send(msg) })
  }

  function sendMutation(m: KanbanMutation) {
    if (isHost) {
      collabBoardRef.current = applyMutation(collabBoardRef.current!, m)
      setTick(t => t + 1)
      broadcastState()
    } else {
      const conn = hostConnRef.current
      if (conn?.open) conn.send(JSON.stringify({ type: 'mutation', payload: m } as KanbanPeerMsg))
    }
  }

  // Unified mutation dispatcher: uses collab when active, standalone otherwise
  function dispatchBoardChange(localFn: (b: BoardData) => BoardData, mutation: KanbanMutation) {
    if (collabActive) sendMutation(mutation)
    else updateBoard(localFn)
  }

  function handleCreateRoom() {
    if (!peerReady || collabActive) return
    collabBoardRef.current = { ...board, updatedAt: Date.now() }
    participantsRef.current = [{ id: myPeerIdRef.current, name: 'Você (host)' }]
    setCollabActive(true)
    setRoomLink(`${window.location.origin}/ferramentas/kanban?room=${myPeerIdRef.current}`)
    setTick(t => t + 1)
  }

  // ── Standalone board mutation helper ──
  const updateBoard = useCallback((fn: (b: BoardData) => BoardData) => {
    setBoard(prev => fn(prev))
  }, [])

  // ── Task form ──
  function openNewTask(columnId: ColumnId) {
    setNewTaskColumn(columnId)
    setEditingTask(null)
    setFormTitle('')
    setFormDesc('')
    setFormColor('')
  }

  function openEditTask(columnId: ColumnId, task: Task) {
    setEditingTask({ columnId, task })
    setNewTaskColumn(null)
    setFormTitle(task.title)
    setFormDesc(task.description)
    setFormColor(task.color)
  }

  function closeForm() {
    setNewTaskColumn(null)
    setEditingTask(null)
  }

  function submitForm() {
    const title = formTitle.trim()
    if (!title) return
    if (editingTask) {
      const updated: Task = {
        ...editingTask.task,
        title,
        description: formDesc.trim(),
        color: formColor,
      }
      dispatchBoardChange(
        b => ({
          ...b,
          columns: b.columns.map(col =>
            col.id === editingTask.columnId
              ? { ...col, tasks: col.tasks.map(t => t.id === updated.id ? updated : t) }
              : col
          ),
        }),
        { op: 'editTask', columnId: editingTask.columnId, task: updated },
      )
    } else if (newTaskColumn) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description: formDesc.trim(),
        color: formColor,
      }
      dispatchBoardChange(
        b => ({
          ...b,
          columns: b.columns.map(col =>
            col.id === newTaskColumn ? { ...col, tasks: [...col.tasks, newTask] } : col
          ),
        }),
        { op: 'addTask', columnId: newTaskColumn, task: newTask },
      )
    }
    closeForm()
  }

  function deleteTask(columnId: ColumnId, taskId: string) {
    dispatchBoardChange(
      b => ({
        ...b,
        columns: b.columns.map(col =>
          col.id === columnId ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) } : col
        ),
      }),
      { op: 'deleteTask', columnId, taskId },
    )
  }

  function moveTask(taskId: string, fromColumn: ColumnId, toColumn: ColumnId) {
    if (fromColumn === toColumn) return
    dispatchBoardChange(
      b => {
        let moved: Task | undefined
        const cols = b.columns.map(col => {
          if (col.id === fromColumn) {
            moved = col.tasks.find(t => t.id === taskId)
            return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
          }
          return col
        })
        if (!moved) return b
        const task = moved
        return {
          ...b,
          columns: cols.map(col =>
            col.id === toColumn ? { ...col, tasks: [...col.tasks, task] } : col
          ),
        }
      },
      { op: 'moveTask', taskId, fromColumn, toColumn },
    )
  }

  // ── Drag & Drop (pointer events — desktop + mobile) ──
  function getColumnUnderPoint(x: number, y: number): ColumnId | null {
    for (const [id, el] of Object.entries(columnRefs.current)) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return id as ColumnId
      }
    }
    return null
  }

  function onTaskPointerDown(e: React.PointerEvent<HTMLDivElement>, taskId: string, columnId: ColumnId) {
    if (viewOnly || editingTask || newTaskColumn) return
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()

    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const ghost = el.cloneNode(true) as HTMLElement
    ghost.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      opacity: 0.88;
      pointer-events: none;
      z-index: 9999;
      transform: rotate(2deg) scale(1.03);
      box-shadow: 0 10px 28px rgba(0,0,0,0.5);
    `
    document.body.appendChild(ghost)
    dragState.current = { taskId, fromColumn: columnId, ghost, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
    setDraggingId(taskId)
    el.setPointerCapture(e.pointerId)
  }

  function onTaskPointerMove(e: React.PointerEvent<HTMLDivElement>, taskId: string) {
    if (!dragState.current || dragState.current.taskId !== taskId) return
    const { ghost, offsetX, offsetY } = dragState.current
    if (ghost) {
      ghost.style.left = `${e.clientX - offsetX}px`
      ghost.style.top  = `${e.clientY - offsetY}px`
    }
    setDragOverColumn(getColumnUnderPoint(e.clientX, e.clientY))
  }

  function onTaskPointerUp(e: React.PointerEvent<HTMLDivElement>, taskId: string) {
    if (!dragState.current || dragState.current.taskId !== taskId) return
    const { fromColumn, ghost } = dragState.current
    if (ghost && document.body.contains(ghost)) document.body.removeChild(ghost)

    const toColumn = getColumnUnderPoint(e.clientX, e.clientY)
    if (toColumn && toColumn !== fromColumn) moveTask(taskId, fromColumn, toColumn)

    dragState.current = null
    setDraggingId(null)
    setDragOverColumn(null)
  }

  // ── Manual save ──
  function handleManualSave() {
    try {
      saveToLS(board)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // ── Export / Import ──
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as BoardData
        if (parsed && Array.isArray(parsed.columns)) setBoard(parsed)
      } catch {}
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Static share links ──
  function getShareLink(mode: 'edit' | 'view') {
    if (typeof window === 'undefined') return ''
    const encoded = encodeBoard(activeBoard)
    const base = `${window.location.origin}/ferramentas/kanban?d=${encoded}`
    return mode === 'view' ? `${base}&v=1` : base
  }

  function copyLink(mode: 'edit' | 'view') {
    navigator.clipboard.writeText(getShareLink(mode))
    setCopiedLink(mode)
    setTimeout(() => setCopiedLink(''), 2000)
  }

  // ── Render ──
  if (!loaded) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
  }

  // Active board: collab ref when collaborative, React state otherwise
  const activeBoard = (collabActive && collabBoardRef.current) ? collabBoardRef.current : board
  const formOpen = !!editingTask || !!newTaskColumn

  return (
    <div className="kb-wrap">

      {/* ── Header ── */}
      <div className="card kb-header">
        <div className="kb-header-left">
          {viewOnly ? (
            <h2 className="kb-board-name">{activeBoard.name}</h2>
          ) : (
            <input
              className="kb-name-input"
              value={activeBoard.name}
              maxLength={60}
              onChange={e => dispatchBoardChange(
                b => ({ ...b, name: e.target.value }),
                { op: 'renameBoard', name: e.target.value },
              )}
              onBlur={e => {
                if (!e.target.value.trim()) dispatchBoardChange(
                  b => ({ ...b, name: 'Meu Quadro' }),
                  { op: 'renameBoard', name: 'Meu Quadro' },
                )
              }}
            />
          )}
          {viewOnly && <span className="kb-view-badge">Somente leitura</span>}
        </div>

        {!viewOnly && (
          <div className="kb-header-actions">
            {/* Criar sala — only in standalone mode */}
            {!collabActive && !roomParam && (
              <button
                className={`kb-btn${!peerReady ? ' loading' : ''}`}
                onClick={handleCreateRoom}
                disabled={!peerReady}
                title="Colaboração em tempo real"
              >
                <i className="fas fa-users" />
                <span>{peerReady ? 'Criar sala' : 'Conectando...'}</span>
              </button>
            )}

            {!collabActive && (
              <>
                <button
                  className={`kb-btn${saveStatus === 'saved' ? ' success' : saveStatus === 'error' ? ' error' : ''}`}
                  onClick={handleManualSave}
                  title="Salvar no navegador"
                >
                  <i className="fas fa-floppy-disk" />
                  <span>{saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'error' ? 'Erro' : 'Salvar'}</span>
                </button>

                <button className="kb-btn" onClick={() => downloadJSON(activeBoard)} title="Exportar JSON">
                  <i className="fas fa-download" />
                  <span>Exportar</span>
                </button>

                <label className="kb-btn" title="Importar JSON">
                  <i className="fas fa-upload" />
                  <span>Importar</span>
                  <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                </label>

                <button
                  className={`kb-btn${shareOpen ? ' active' : ''}`}
                  onClick={() => setShareOpen(o => !o)}
                  title="Compartilhar cópia"
                >
                  <i className="fas fa-share-nodes" />
                  <span>Compartilhar</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Static share panel (standalone only) ── */}
      {shareOpen && !viewOnly && !collabActive && (
        <div className="card kb-share-panel">
          <div className="kb-share-grid">
            <div className="kb-share-item">
              <span className="kb-share-label"><i className="fas fa-pen" /> Link para edição</span>
              <p className="kb-share-hint">Quem acessar poderá editar uma cópia do quadro.</p>
              <div className="kb-share-link-row">
                <code className="kb-share-code">{getShareLink('edit')}</code>
                <button className={`copy-btn${copiedLink === 'edit' ? ' copied' : ''}`} onClick={() => copyLink('edit')}>
                  {copiedLink === 'edit' ? 'copiado ✓' : 'copiar'}
                </button>
              </div>
            </div>
            <div className="kb-share-item">
              <span className="kb-share-label"><i className="fas fa-eye" /> Link para visualização</span>
              <p className="kb-share-hint">Quem acessar verá o quadro sem poder editar.</p>
              <div className="kb-share-link-row">
                <code className="kb-share-code">{getShareLink('view')}</code>
                <button className={`copy-btn${copiedLink === 'view' ? ' copied' : ''}`} onClick={() => copyLink('view')}>
                  {copiedLink === 'view' ? 'copiado ✓' : 'copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Collaboration live bar ── */}
      {collabActive && (
        <div className="card kb-collab-bar">
          <div className="kb-collab-bar-left">
            <span className="kb-collab-live-dot" />
            <span className="kb-collab-label">Sala ao vivo</span>
          </div>

          {isHost && roomLink && (
            <div className="kb-collab-link-wrap">
              <code className="kb-collab-link-code">{roomLink}</code>
              <button
                className={`copy-btn${copiedRoom ? ' copied' : ''}`}
                onClick={() => {
                  navigator.clipboard.writeText(roomLink)
                  setCopiedRoom(true)
                  setTimeout(() => setCopiedRoom(false), 2000)
                }}
              >
                {copiedRoom ? 'copiado ✓' : 'copiar'}
              </button>
            </div>
          )}

          <div
            className="kb-collab-participants"
            title={participantsRef.current.map(p => p.name).join(', ')}
          >
            <i className="fas fa-circle-dot kb-collab-dot-icon" />
            <span>{participantsRef.current.length} online</span>
          </div>
        </div>
      )}

      {/* ── Connection error banner ── */}
      {collabError && (
        <div className="card kb-collab-error">
          <i className="fas fa-triangle-exclamation" />
          <span>{collabError}</span>
          <button className="kb-btn" onClick={() => setCollabError('')}>Dispensar</button>
        </div>
      )}

      {/* ── Columns ── */}
      <div className="kb-columns">
        {activeBoard.columns.map(col => (
          <div
            key={col.id}
            ref={el => { columnRefs.current[col.id] = el }}
            className={`kb-column${dragOverColumn === col.id ? ' over' : ''}`}
          >
            <div className="kb-col-header">
              <span className="kb-col-title">{col.title}</span>
              <span className="kb-col-count">{col.tasks.length}</span>
            </div>

            <div className="kb-tasks">
              {col.tasks.map(task => (
                <div
                  key={task.id}
                  className={`kb-task card${draggingId === task.id ? ' dragging' : ''}`}
                  style={task.color ? { borderLeft: `4px solid ${task.color}` } : {}}
                  onPointerDown={e => onTaskPointerDown(e, task.id, col.id)}
                  onPointerMove={e => onTaskPointerMove(e, task.id)}
                  onPointerUp={e => onTaskPointerUp(e, task.id)}
                >
                  <div className="kb-task-body">
                    <span className="kb-task-title">{task.title}</span>
                    {task.description && <p className="kb-task-desc">{task.description}</p>}
                  </div>
                  {!viewOnly && (
                    <div className="kb-task-actions">
                      <button className="kb-task-btn" onClick={() => openEditTask(col.id, task)} title="Editar">
                        <i className="fas fa-pen" />
                      </button>
                      <button className="kb-task-btn del" onClick={() => deleteTask(col.id, task.id)} title="Excluir">
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {col.tasks.length === 0 && !viewOnly && (
                <div className="kb-empty-col">Arraste tarefas aqui</div>
              )}
            </div>

            {!viewOnly && (
              <button className="kb-add-task" onClick={() => openNewTask(col.id)}>
                <i className="fas fa-plus" /> Adicionar tarefa
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Task modal ── */}
      {formOpen && (
        <div className="kb-modal-overlay" onClick={closeForm}>
          <div className="card kb-modal" onClick={e => e.stopPropagation()}>
            <h3 className="kb-modal-title">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>

            <input
              className="pp-input"
              type="text"
              placeholder="Título *"
              value={formTitle}
              maxLength={120}
              autoFocus
              onChange={e => setFormTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitForm()}
            />

            <textarea
              className="kb-textarea"
              placeholder="Descrição (opcional)"
              value={formDesc}
              maxLength={500}
              rows={3}
              onChange={e => setFormDesc(e.target.value)}
            />

            <div className="kb-color-row">
              <span className="kb-color-label">Cor:</span>
              <button
                className={`kb-color-dot none${formColor === '' ? ' selected' : ''}`}
                onClick={() => setFormColor('')}
                title="Sem cor"
              />
              {LABEL_COLORS.map(c => (
                <button
                  key={c}
                  className={`kb-color-dot${formColor === c ? ' selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormColor(c)}
                  title={c}
                />
              ))}
            </div>

            <div className="kb-modal-actions">
              <button className="btn-outline" onClick={closeForm}>Cancelar</button>
              <button className="btn-primary btn-pabd" onClick={submitForm} disabled={!formTitle.trim()}>
                {editingTask ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page wrapper ────────────────────────────────────────────────

export default function KanbanPage() {
  return (
    <>
      <BackgroundBlobs />
      <div className="shadow" />
      <Navbar />
      <main style={{ paddingTop: '80px', paddingBottom: '3rem' }}>
        <div className="kb-page-wrap">
          <Suspense
            fallback={
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                Carregando...
              </div>
            }
          >
            <KanbanInner />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
