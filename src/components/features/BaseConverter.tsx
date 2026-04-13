'use client'
import { useState, useEffect, useRef } from 'react'

type Base = 'decimal' | 'binary' | 'hex'

const HEX = '0123456789ABCDEF'

const BASES: { value: Base; label: string; short: string; sub: string }[] = [
  { value: 'decimal', label: 'Decimal',      short: 'Decimal',      sub: 'base 10' },
  { value: 'binary',  label: 'Binário',       short: 'Binário',      sub: 'base 2'  },
  { value: 'hex',     label: 'Hexadecimal',   short: 'Hexadecimal',  sub: 'base 16' },
]

const PATTERNS: Record<Base, RegExp> = {
  decimal: /^[0-9]*$/,
  binary:  /^[01]*$/,
  hex:     /^[0-9A-Fa-f]*$/,
}

const PLACEHOLDERS: Record<Base, string> = {
  decimal: '255',
  binary:  '11111111',
  hex:     'FF',
}

const MAX_VALUE = 65535

// ── Step model ────────────────────────────────────────────────────────
interface DivRow  { dividend: number; quotient: number; remainder: number; remLabel: string; active: boolean }
interface PowRow  { digit: string;    power: number;    value: number;     active: boolean }
interface GrpRow  { binary: string;   decimal: number;  hex: string;       active: boolean }
interface MapRow  { hex: string;      decimal: number;  binary: string;    active: boolean }

interface Step {
  kind:       'intro' | 'division' | 'power' | 'group' | 'mapping' | 'result'
  heading:    string
  note?:      string
  divisor?:   number
  divRows?:   DivRow[]
  powBase?:   number
  powRows?:   PowRow[]
  grpRows?:   GrpRow[]
  mapRows?:   MapRow[]
  result?:    string
}

// ── Converters ────────────────────────────────────────────────────────
function toDecimal(value: string, from: Base): number {
  if (from === 'decimal') return parseInt(value, 10)
  if (from === 'binary')  return parseInt(value, 2)
  return parseInt(value, 16)
}

function fromDecimal(n: number, to: Base): string {
  if (to === 'decimal') return n.toString()
  if (to === 'binary')  return n.toString(2)
  return n.toString(16).toUpperCase()
}

// ── Step generators ───────────────────────────────────────────────────
function genDecToBin(n: number): Step[] {
  if (n === 0) return [{
    kind: 'result', heading: 'Zero em qualquer base é zero.',
    result: '0',
  }]

  const steps: Step[] = []
  const rows: DivRow[] = []
  let cur = n
  while (cur > 0) {
    const q = Math.floor(cur / 2)
    const r = cur % 2
    rows.push({ dividend: cur, quotient: q, remainder: r, remLabel: r.toString(), active: false })
    cur = q
  }

  steps.push({
    kind: 'intro', divisor: 2,
    heading: 'Divisão sucessiva por 2',
    note: 'Dividimos repetidamente por 2, registrando o resto de cada divisão. O resultado será os restos lidos de baixo para cima.',
    divRows: rows.map(r => ({ ...r, active: false })),
  })
  rows.forEach((_, i) => steps.push({
    kind: 'division', divisor: 2,
    heading: `${rows[i].dividend} ÷ 2 = ${rows[i].quotient}, resto ${rows[i].remainder}`,
    divRows: rows.map((r, j) => ({ ...r, active: j === i })),
  }))
  steps.push({
    kind: 'result', divisor: 2,
    heading: 'Leia os restos de baixo para cima',
    note: 'A sequência de restos, invertida, forma o número binário.',
    divRows: rows.map(r => ({ ...r, active: false })),
    result: rows.map(r => r.remainder).reverse().join(''),
  })
  return steps
}

function genBinToDec(bin: string): Step[] {
  const bits = bin.split('')
  const rows: PowRow[] = bits.map((b, i) => ({
    digit: b,
    power: bits.length - 1 - i,
    value: parseInt(b) * Math.pow(2, bits.length - 1 - i),
    active: false,
  }))
  const total = rows.reduce((s, r) => s + r.value, 0)
  const steps: Step[] = []

  steps.push({
    kind: 'intro', powBase: 2,
    heading: 'Soma das potências de 2',
    note: 'Cada bit, da esquerda para a direita, representa uma potência de 2. Multiplicamos bit × 2^posição e somamos tudo.',
    powRows: rows.map(r => ({ ...r, active: false })),
  })
  rows.forEach((_, i) => steps.push({
    kind: 'power', powBase: 2,
    heading: `Bit ${rows[i].digit} na posição ${rows[i].power}: ${rows[i].digit} × 2^${rows[i].power} = ${rows[i].value}`,
    powRows: rows.map((r, j) => ({ ...r, active: j === i })),
  }))
  steps.push({
    kind: 'result', powBase: 2,
    heading: `Soma: ${rows.map(r => r.value).join(' + ')} = ${total}`,
    powRows: rows.map(r => ({ ...r, active: false })),
    result: total.toString(),
  })
  return steps
}

function genDecToHex(n: number): Step[] {
  if (n === 0) return [{
    kind: 'result', heading: 'Zero em qualquer base é zero.',
    result: '0',
  }]

  const rows: DivRow[] = []
  let cur = n
  while (cur > 0) {
    const q = Math.floor(cur / 16)
    const r = cur % 16
    rows.push({ dividend: cur, quotient: q, remainder: r, remLabel: HEX[r], active: false })
    cur = q
  }
  const steps: Step[] = []

  steps.push({
    kind: 'intro', divisor: 16,
    heading: 'Divisão sucessiva por 16',
    note: 'Dividimos por 16, registrando o resto. Cada resto é convertido para o dígito hexadecimal correspondente (10→A, 11→B, ... 15→F).',
    divRows: rows.map(r => ({ ...r, active: false })),
  })
  rows.forEach((_, i) => steps.push({
    kind: 'division', divisor: 16,
    heading: `${rows[i].dividend} ÷ 16 = ${rows[i].quotient}, resto ${rows[i].remainder} → ${HEX[rows[i].remainder]}`,
    divRows: rows.map((r, j) => ({ ...r, active: j === i })),
  }))
  steps.push({
    kind: 'result', divisor: 16,
    heading: 'Leia os dígitos de baixo para cima',
    note: 'A sequência de restos invertida forma o número hexadecimal.',
    divRows: rows.map(r => ({ ...r, active: false })),
    result: rows.map(r => r.remLabel).reverse().join(''),
  })
  return steps
}

function genHexToDec(hex: string): Step[] {
  const digits = hex.toUpperCase().split('')
  const rows: PowRow[] = digits.map((d, i) => ({
    digit: d,
    power: digits.length - 1 - i,
    value: parseInt(d, 16) * Math.pow(16, digits.length - 1 - i),
    active: false,
  }))
  const total = rows.reduce((s, r) => s + r.value, 0)
  const steps: Step[] = []

  steps.push({
    kind: 'intro', powBase: 16,
    heading: 'Soma das potências de 16',
    note: 'Cada dígito hex é convertido para decimal e multiplicado pela potência de 16 da sua posição.',
    powRows: rows.map(r => ({ ...r, active: false })),
  })
  rows.forEach((_, i) => {
    const dec = parseInt(rows[i].digit, 16)
    steps.push({
      kind: 'power', powBase: 16,
      heading: `${rows[i].digit} = ${dec} → ${dec} × 16^${rows[i].power} = ${rows[i].value}`,
      powRows: rows.map((r, j) => ({ ...r, active: j === i })),
    })
  })
  steps.push({
    kind: 'result', powBase: 16,
    heading: `Soma: ${rows.map(r => r.value).join(' + ')} = ${total}`,
    powRows: rows.map(r => ({ ...r, active: false })),
    result: total.toString(),
  })
  return steps
}

function genBinToHex(bin: string): Step[] {
  const padLen = Math.ceil(bin.length / 4) * 4
  const padded = bin.padStart(padLen, '0')
  const groups: GrpRow[] = []
  for (let i = 0; i < padded.length; i += 4) {
    const g = padded.slice(i, i + 4)
    const d = parseInt(g, 2)
    groups.push({ binary: g, decimal: d, hex: HEX[d], active: false })
  }
  const steps: Step[] = []

  steps.push({
    kind: 'intro',
    heading: 'Agrupamento em nibbles (grupos de 4 bits)',
    note: 'Cada dígito hexadecimal representa exatamente 4 bits. Agrupamos da direita para esquerda, completando com zeros se necessário.',
    grpRows: groups.map(r => ({ ...r, active: false })),
  })
  if (padded !== bin) {
    steps.push({
      kind: 'intro',
      heading: `Completar com zeros à esquerda: ${padded}`,
      note: `${bin.length} bits → completamos para ${padLen} bits (múltiplo de 4).`,
      grpRows: groups.map(r => ({ ...r, active: false })),
    })
  }
  groups.forEach((_, i) => steps.push({
    kind: 'group',
    heading: `${groups[i].binary}₂ = ${groups[i].decimal}₁₀ = ${groups[i].hex}₁₆`,
    grpRows: groups.map((r, j) => ({ ...r, active: j === i })),
  }))
  steps.push({
    kind: 'result',
    heading: 'Concatene os dígitos hex de cada grupo',
    grpRows: groups.map(r => ({ ...r, active: false })),
    result: groups.map(r => r.hex).join(''),
  })
  return steps
}

function genHexToBin(hex: string): Step[] {
  const digits = hex.toUpperCase().split('')
  const rows: MapRow[] = digits.map(d => ({
    hex: d,
    decimal: parseInt(d, 16),
    binary: parseInt(d, 16).toString(2).padStart(4, '0'),
    active: false,
  }))
  const steps: Step[] = []

  steps.push({
    kind: 'intro',
    heading: 'Expansão de cada dígito hex em 4 bits',
    note: 'Cada dígito hexadecimal equivale a exatamente 4 bits (um nibble). Convertemos dígito a dígito.',
    mapRows: rows.map(r => ({ ...r, active: false })),
  })
  rows.forEach((_, i) => steps.push({
    kind: 'mapping',
    heading: `${rows[i].hex}₁₆ = ${rows[i].decimal}₁₀ = ${rows[i].binary}₂`,
    mapRows: rows.map((r, j) => ({ ...r, active: j === i })),
  }))
  steps.push({
    kind: 'result',
    heading: 'Concatene os grupos de 4 bits',
    mapRows: rows.map(r => ({ ...r, active: false })),
    result: rows.map(r => r.binary).join(''),
  })
  return steps
}

function buildSteps(from: Base, to: Base, input: string): Step[] | null {
  if (!input) return null
  const n = toDecimal(input, from)
  if (isNaN(n) || n < 0 || n > MAX_VALUE) return null
  if (from === to) return null

  if (from === 'decimal' && to === 'binary')  return genDecToBin(n)
  if (from === 'decimal' && to === 'hex')     return genDecToHex(n)
  if (from === 'binary'  && to === 'decimal') return genBinToDec(input)
  if (from === 'binary'  && to === 'hex')     return genBinToHex(input)
  if (from === 'hex'     && to === 'decimal') return genHexToDec(input)
  if (from === 'hex'     && to === 'binary')  return genHexToBin(input)
  return null
}

// ── Step visualisation ────────────────────────────────────────────────
function DivTable({ rows, divisor }: { rows: DivRow[]; divisor: number }) {
  return (
    <table className="bc-table">
      <thead>
        <tr>
          <th>Dividendo</th>
          <th>÷ {divisor}</th>
          <th>Quociente</th>
          <th>Resto</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={r.active ? 'active' : ''}>
            <td>{r.dividend}</td>
            <td className="bc-td-op">÷ {divisor}</td>
            <td>{r.quotient}</td>
            <td className="bc-td-rem">{r.remLabel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PowTable({ rows, base }: { rows: PowRow[]; base: number }) {
  return (
    <table className="bc-table">
      <thead>
        <tr>
          <th>Dígito</th>
          <th>Potência</th>
          <th>Cálculo</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={r.active ? 'active' : ''}>
            <td className="bc-td-bit">{r.digit}</td>
            <td>{base}^{r.power}</td>
            <td>{parseInt(r.digit, base > 10 ? 16 : 10)} × {base}^{r.power}</td>
            <td className="bc-td-rem">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function GrpTable({ rows }: { rows: GrpRow[] }) {
  return (
    <table className="bc-table">
      <thead>
        <tr>
          <th>Grupo (4 bits)</th>
          <th>Decimal</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={r.active ? 'active' : ''}>
            <td className="bc-td-bit">{r.binary}</td>
            <td>{r.decimal}</td>
            <td className="bc-td-rem">{r.hex}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MapTable({ rows }: { rows: MapRow[] }) {
  return (
    <table className="bc-table">
      <thead>
        <tr>
          <th>Hex</th>
          <th>Decimal</th>
          <th>Binário (4 bits)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={r.active ? 'active' : ''}>
            <td className="bc-td-rem">{r.hex}</td>
            <td>{r.decimal}</td>
            <td className="bc-td-bit">{r.binary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StepView({ step, animKey }: { step: Step; animKey: number }) {
  return (
    <div key={animKey} className={`bc-step bc-step-${step.kind}`}>
      <p className="bc-step-heading">{step.heading}</p>
      {step.note && <p className="bc-step-note">{step.note}</p>}

      {step.divRows && step.divisor && (
        <DivTable rows={step.divRows} divisor={step.divisor} />
      )}
      {step.powRows && step.powBase && (
        <PowTable rows={step.powRows} base={step.powBase} />
      )}
      {step.grpRows && <GrpTable rows={step.grpRows} />}
      {step.mapRows && <MapTable rows={step.mapRows} />}

      {step.result !== undefined && (
        <div className="bc-step-result">
          <span className="bc-step-result-label">Resultado</span>
          <span className="bc-step-result-value">{step.result}</span>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
export default function BaseConverter() {
  const [from,    setFrom]    = useState<Base>('decimal')
  const [to,      setTo]      = useState<Base>('binary')
  const [input,   setInput]   = useState('13')
  const [stepIdx, setStepIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [animKey,  setAnimKey]  = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const decimalVal = input ? toDecimal(input, from) : NaN
  const isValid    = !isNaN(decimalVal) && decimalVal >= 0 && decimalVal <= MAX_VALUE
  const result     = isValid ? fromDecimal(decimalVal, to) : ''
  const steps      = isValid ? buildSteps(from, to, input) : null

  // Reset on input/base change
  useEffect(() => {
    setStepIdx(0)
    setAutoPlay(false)
    setAnimKey(k => k + 1)
  }, [from, to, input])

  // Advance animKey on step change
  useEffect(() => {
    setAnimKey(k => k + 1)
  }, [stepIdx])

  // Auto-play
  useEffect(() => {
    if (!autoPlay || !steps) return
    timerRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length - 1) { setAutoPlay(false); return prev }
        return prev + 1
      })
    }, 1800)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay, steps])

  function handleFromChange(v: Base) {
    if (v === to) setTo(from) // swap
    setFrom(v)
    setInput('')
  }

  function handleToChange(v: Base) {
    if (v === from) setFrom(to) // swap
    setTo(v)
  }

  function handleInput(raw: string) {
    if (PATTERNS[from].test(raw)) setInput(raw.toUpperCase())
  }

  const isFirst = stepIdx === 0
  const isLast  = !steps || stepIdx >= steps.length - 1
  const currentStep = steps?.[stepIdx] ?? null

  return (
    <div className="bc-root">

      {/* ── Base selectors ─────────────────────────── */}
      <div className="bc-selectors">
        <div className="bc-sel-block">
          <span className="bc-sel-label">De</span>
          <div className="bc-tabs">
            {BASES.map(b => (
              <button
                key={b.value}
                className={`bc-tab${from === b.value ? ' active' : ''}`}
                onClick={() => handleFromChange(b.value)}
              >
                <span className="bc-tab-name">{b.short}</span>
                <span className="bc-tab-sub">{b.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="bc-swap-btn"
          title="Trocar bases"
          onClick={() => { const tmp = from; handleFromChange(to); handleToChange(tmp) }}
        >
          <i className="fas fa-arrow-right-arrow-left" />
        </button>

        <div className="bc-sel-block">
          <span className="bc-sel-label">Para</span>
          <div className="bc-tabs">
            {BASES.map(b => (
              <button
                key={b.value}
                className={`bc-tab${to === b.value ? ' active' : ''}${from === b.value ? ' bc-tab-disabled' : ''}`}
                onClick={() => from !== b.value && handleToChange(b.value)}
                disabled={from === b.value}
              >
                <span className="bc-tab-name">{b.short}</span>
                <span className="bc-tab-sub">{b.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Input / Output ─────────────────────────── */}
      <div className="bc-io">
        <div className="bc-io-field">
          <label className="bc-io-label">
            {BASES.find(b => b.value === from)?.label}
          </label>
          <input
            className={`bc-input${input && !isValid ? ' bc-input-error' : ''}`}
            value={input}
            onChange={e => handleInput(e.target.value)}
            placeholder={PLACEHOLDERS[from]}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="characters"
          />
          {input && !isValid && (
            <span className="bc-input-hint">
              {decimalVal > MAX_VALUE ? `Máximo: ${MAX_VALUE}` : 'Valor inválido'}
            </span>
          )}
        </div>

        <div className="bc-io-eq">=</div>

        <div className="bc-io-field">
          <label className="bc-io-label">
            {BASES.find(b => b.value === to)?.label}
          </label>
          <div className={`bc-result${result ? '' : ' bc-result-empty'}`}>
            {result || (input ? '—' : PLACEHOLDERS[to])}
          </div>
        </div>
      </div>

      {/* ── Step animation ─────────────────────────── */}
      {steps && currentStep && (
        <div className="bc-anim">
          <div className="bc-anim-header">
            <span className="bc-anim-title">
              <i className="fas fa-chalkboard-teacher" /> Como funciona
            </span>
            <div className="bc-anim-nav">
              <button
                className="bc-nav-btn"
                onClick={() => { setAutoPlay(false); setStepIdx(p => Math.max(0, p - 1)) }}
                disabled={isFirst}
                title="Passo anterior"
              ><i className="fas fa-chevron-left" /></button>

              <span className="bc-step-counter">{stepIdx + 1} / {steps.length}</span>

              <button
                className="bc-nav-btn"
                onClick={() => { setAutoPlay(false); setStepIdx(p => Math.min(steps.length - 1, p + 1)) }}
                disabled={isLast}
                title="Próximo passo"
              ><i className="fas fa-chevron-right" /></button>

              <button
                className={`bc-nav-btn bc-play-btn${autoPlay ? ' playing' : ''}`}
                onClick={() => setAutoPlay(p => !p)}
                disabled={isLast && !autoPlay}
                title={autoPlay ? 'Pausar' : 'Reproduzir automaticamente'}
              >
                <i className={`fas ${autoPlay ? 'fa-pause' : 'fa-play'}`} />
              </button>
            </div>
          </div>

          {/* Step content */}
          <StepView step={currentStep} animKey={animKey} />

          {/* Progress dots */}
          <div className="bc-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`bc-dot${i === stepIdx ? ' active' : i < stepIdx ? ' done' : ''}`}
                onClick={() => { setAutoPlay(false); setStepIdx(i) }}
                title={`Passo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
