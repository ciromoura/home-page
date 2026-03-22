'use client'

import { useState, useRef } from 'react'
import { generateTruthTable, type TableStyle } from '@/lib/geradortv'

const EXAMPLES = [
  { label: '(A&amp;B)', value: '(A&B)' },
  { label: '(A&gt;B)', value: '(A>B)' },
  { label: '~A', value: '~A' },
  { label: '((AvB)&gt;~C)', value: '((AvB)>~C)' },
  { label: 'Contrap.', value: '((A>B)=(~Bv~A))' },
]

const OPERATORS = [
  { sym: '~', label: 'NÃO', value: '~' },
  { sym: '&amp;', label: 'E', value: '&' },
  { sym: 'v', label: 'OU', value: 'v' },
  { sym: 'x', label: 'XOR', value: 'x' },
  { sym: '&gt;', label: 'SE…ENTÃO', value: '>' },
  { sym: '=', label: 'SSE', value: '=' },
  { sym: '(', label: '', value: '(' },
  { sym: ')', label: '', value: ')' },
]

export default function TruthTableGenerator() {
  const [formula, setFormula] = useState('')
  const [style, setStyle] = useState<TableStyle>('completo')
  const [tableHtml, setTableHtml] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleGenerate() {
    const result = generateTruthTable(formula, style)
    if (!result) {
      setError(true)
      setTableHtml('')
    } else {
      setError(false)
      setTableHtml(result.html)
    }
  }

  function handleClear() {
    setFormula('')
    setTableHtml('')
    setError(false)
    setStyle('completo')
  }

  function insertOp(op: string) {
    const input = inputRef.current
    if (!input) return
    const start = input.selectionStart ?? formula.length
    const end = input.selectionEnd ?? formula.length
    const next = formula.slice(0, start) + op + formula.slice(end)
    setFormula(next)
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + op.length, start + op.length)
    }, 0)
  }

  function setExample(value: string) {
    setFormula(value)
    const result = generateTruthTable(value, style)
    if (!result) {
      setError(true)
      setTableHtml('')
    } else {
      setError(false)
      setTableHtml(result.html)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Operator reference */}
      <div className="card">
        <p className="text-sm font-semibold mb-3 opacity-60 uppercase tracking-wide">
          Operadores — clique para inserir
        </p>
        <div className="flex flex-wrap gap-2">
          {OPERATORS.map(op => (
            <button
              key={op.value}
              className="op-chip px-3 py-1.5 rounded-xl text-sm font-mono"
              onClick={() => insertOp(op.value)}
              title={op.label}
            >
              <span className="op-sym" dangerouslySetInnerHTML={{ __html: op.sym }} />
              {op.label && (
                <span className="opacity-60 text-xs"> {op.label}</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs mt-3 opacity-50">
          Variáveis: letras maiúsculas A–Z. Operadores binários exigem parênteses:{' '}
          <code className="font-mono">(A&amp;B)</code>,{' '}
          <code className="font-mono">(AvB)</code>
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Fórmula</h2>

        {error && (
          <p className="text-sm mb-3" style={{ color: 'var(--secondary-color)' }}>
            Não é uma fórmula bem formada.
          </p>
        )}

        <input
          ref={inputRef}
          type="text"
          value={formula}
          onChange={e => { setFormula(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          placeholder="Ex: ((AvB)>~C)"
          className="input-glass w-full px-4 py-3 rounded-2xl text-base font-mono mb-4"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Style selector */}
        <div className="flex gap-6 mb-5 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="style"
              checked={style === 'completo'}
              onChange={() => setStyle('completo')}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span className="text-sm font-medium">
              Completo <span className="opacity-50 text-xs">(todas as subfórmulas)</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="style"
              checked={style === 'condensado'}
              onChange={() => setStyle('condensado')}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: 'var(--accent-color)' }}
            />
            <span className="text-sm font-medium">
              Condensado <span className="opacity-50 text-xs">(só resultado)</span>
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleGenerate}
            className="btn-primary px-6 py-2.5 rounded-2xl font-semibold text-sm"
          >
            <i className="fas fa-table mr-2"></i>Gerar Tabela
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary px-6 py-2.5 rounded-2xl font-semibold text-sm"
          >
            <i className="fas fa-eraser mr-2"></i>Limpar
          </button>
        </div>

        {/* Examples */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs opacity-50 mr-1">Exemplos:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.value}
              className="op-chip px-3 py-1 rounded-xl text-xs font-mono"
              onClick={() => setExample(ex.value)}
              dangerouslySetInnerHTML={{ __html: ex.label }}
            />
          ))}
        </div>
      </div>

      {/* Table output */}
      {tableHtml && (
        <div className="card overflow-x-auto">
          <div dangerouslySetInnerHTML={{ __html: tableHtml }} />
        </div>
      )}
    </div>
  )
}
