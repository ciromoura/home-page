'use client'

import { useState, useEffect, useRef } from 'react'
import LessonLayout from '@/components/features/LessonLayout'
import LessonSection from '@/components/features/LessonSection'
import StepBlock from '@/components/features/StepBlock'
import InfoBox from '@/components/features/InfoBox'

/* ─── Quiz data ─────────────────────────────────────────────── */
const QUIZ = [
  {
    q: '1. Como uma IA generativa "pensa" ao gerar uma resposta?',
    opts: [
      { t: 'Ela raciocina logicamente como um ser humano', c: false },
      { t: 'Ela reconhece padrões em dados e prevê resultados com base em probabilidades', c: true },
      { t: 'Ela consulta uma enciclopédia online em tempo real', c: false },
      { t: 'Ela usa regras fixas programadas manualmente por especialistas', c: false },
    ],
    ok: 'Correto! IA não "pensa" — ela reconhece padrões em enormes volumes de dados e prevê a resposta mais provável. É estatística em grande escala.',
    err: 'Errado. IA não raciocina como humanos nem consulta a internet em tempo real. Ela identifica padrões e calcula probabilidades com base no treinamento.',
  },
  {
    q: '2. O que diferencia Machine Learning da programação tradicional?',
    opts: [
      { t: 'Machine Learning usa apenas linguagem Python', c: false },
      { t: 'Na programação tradicional, o computador aprende sozinho com o tempo', c: false },
      { t: 'Em ML, o sistema aprende com dados sem ser explicitamente programado para cada tarefa', c: true },
      { t: 'Machine Learning não precisa de dados para funcionar', c: false },
    ],
    ok: 'Perfeito! Em vez de regras escritas manualmente, o ML expõe o sistema a dados e deixa ele descobrir os padrões por conta própria.',
    err: 'Incorreto. Na programação tradicional, o humano escreve todas as regras. No ML, o sistema descobre as regras a partir dos dados — sem precisar ser instruído caso a caso.',
  },
  {
    q: '3. O que significa a sigla LLM?',
    opts: [
      { t: 'Linear Learning Machine', c: false },
      { t: 'Large Language Model (Modelo de Linguagem de Grande Escala)', c: true },
      { t: 'Logical Logic Module', c: false },
      { t: 'Language Learning Manager', c: false },
    ],
    ok: 'Correto! LLM = Large Language Model. São modelos treinados em bilhões de textos para prever e gerar linguagem de forma coerente.',
    err: 'Errado. LLM é Large Language Model — modelos como o ChatGPT que foram treinados em enormes volumes de texto para gerar e compreender linguagem.',
  },
  {
    q: '4. Como um LLM gera texto palavra por palavra?',
    opts: [
      { t: 'Pesquisa em um banco de dados de respostas prontas', c: false },
      { t: 'Traduz o pensamento humano do programador', c: false },
      { t: 'Calcula a probabilidade de cada próxima palavra dado o contexto anterior', c: true },
      { t: 'Copia textos aleatórios do treinamento', c: false },
    ],
    ok: 'Exato! A cada passo, o LLM avalia o contexto completo e escolhe a próxima palavra mais provável — repetindo isso até formar uma resposta completa.',
    err: 'Incorreto. LLMs geram texto token a token, calculando qual próxima palavra é mais provável dado tudo que foi escrito antes. É predição de sequência.',
  },
  {
    q: '5. Na sigla PROMPT, o que representa a letra "P" (Persona)?',
    opts: [
      { t: 'O prazo para a IA responder', c: false },
      { t: 'O papel ou identidade que a IA deve assumir na resposta', c: true },
      { t: 'A plataforma onde o prompt será usado', c: false },
      { t: 'A permissão para o uso da ferramenta', c: false },
    ],
    ok: 'Correto! Persona define "quem" a IA deve ser: professor, especialista, coach, personagem. Isso molda o tom e a profundidade da resposta.',
    err: 'Errado. P = Persona: o papel que a IA deve assumir. Ex: "Aja como um professor de ensino médio explicando para iniciantes." Isso calibra toda a resposta.',
  },
  {
    q: '6. Qual é a letra "O" no acróstico PROMPT?',
    opts: [
      { t: 'Organização dos parágrafos', c: false },
      { t: 'Objetivo — o resultado final esperado da resposta', c: true },
      { t: 'Ortografia — a IA deve usar linguagem formal', c: false },
      { t: 'Opções — quantas alternativas a IA deve listar', c: false },
    ],
    ok: 'Perfeito! O = Objetivo: deixar claro qual é o resultado final desejado. "Quero um plano de estudos de 30 dias" é um objetivo; "me ajude" não é.',
    err: 'Incorreto. O = Objetivo: o que você quer alcançar com a resposta. Quanto mais específico o objetivo, mais útil será o resultado.',
  },
  {
    q: '7. Para que serve a letra "M" (Modelo) no acróstico PROMPT?',
    opts: [
      { t: 'Indicar qual IA usar (ChatGPT, Gemini, etc.)', c: false },
      { t: 'Definir o formato da resposta: lista, tabela, código, redação, etc.', c: true },
      { t: 'A versão do modelo de linguagem a ser consultado', c: false },
      { t: 'O método matemático usado pela IA', c: false },
    ],
    ok: 'Exato! M = Modelo/Formato: "responda em tabela", "use tópicos", "escreva em forma de e-mail". Formatar a saída economiza tempo de edição.',
    err: 'Errado. M = Modelo de resposta/formato. Dizer "responda em bullet points" ou "crie uma tabela" direciona a estrutura do resultado.',
  },
  {
    q: '8. O que representa o "T" (Transformar) no PROMPT?',
    opts: [
      { t: 'Traduzir a resposta para outro idioma automaticamente', c: false },
      { t: 'Solicitar ajustes, melhorias ou variações após a primeira resposta', c: true },
      { t: 'Transformar texto em imagem usando a IA', c: false },
      { t: 'A velocidade com que a IA transforma o prompt em resposta', c: false },
    ],
    ok: 'Correto! T = Transformar: a IA é um colaborador iterativo. "Deixe mais simples", "adicione exemplos", "reescreva em tom formal" — refinar é parte do processo.',
    err: 'Incorreto. T = Transformar: você não precisa aceitar a primeira resposta. Peça ajustes: "Torne mais curto", "adicione um exemplo prático", "mude o tom".',
  },
  {
    q: '9. Por que não se deve compartilhar dados pessoais com IAs generativas?',
    opts: [
      { t: 'Porque a IA não entende dados pessoais', c: false },
      { t: 'Porque os dados podem ser usados no treinamento futuro ou expostos em brechas de segurança', c: true },
      { t: 'Porque a IA fica mais lenta ao processar dados pessoais', c: false },
      { t: 'Porque é proibido por lei em todos os países', c: false },
    ],
    ok: 'Correto! Dados inseridos em IAs podem ser armazenados, usados para treinamento ou expostos. Nunca informe CPF, senhas, dados de saúde ou informações confidenciais.',
    err: 'Errado. O risco é real: dados podem ser retidos para treinamento ou expostos. Trate a IA como um ambiente público — não insira o que não postaria online.',
  },
  {
    q: '10. Qual é a postura correta em relação às respostas de uma IA?',
    opts: [
      { t: 'Aceitar tudo sem questionar pois a IA nunca erra', c: false },
      { t: 'Nunca usar IA pois ela sempre mente', c: false },
      { t: 'Usar a IA como apoio, verificando informações em fontes confiáveis antes de agir', c: true },
      { t: 'Usar apenas para tarefas criativas, nunca para pesquisa', c: false },
    ],
    ok: 'Perfeito! A IA é uma ferramenta poderosa, mas erra — especialmente em datas, números e fatos recentes. Trate-a como um colaborador que precisa de revisão.',
    err: 'Incorreto. A postura certa é crítica e colaborativa: use a IA para acelerar e inspirar, mas sempre confira informações importantes em fontes primárias.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Como a IA Funciona', 'Machine Learning', 'LLMs', 'Eng. de Prompt', 'Ética', 'Quiz']

/* ─── Neural Network Animation ──────────────────────────────── */
function NeuralNetIllustration() {
  const layers = [
    [{ y: 50 }],
    [{ y: 20 }, { y: 50 }, { y: 80 }],
    [{ y: 10 }, { y: 35 }, { y: 60 }, { y: 85 }],
    [{ y: 20 }, { y: 50 }, { y: 80 }],
    [{ y: 50 }],
  ]
  const [active, setActive] = useState<number[][]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const next: number[][] = layers.map(layer =>
        layer.map(() => Math.random() > 0.4 ? 1 : 0)
      )
      setActive(next)
    }, 900)
    return () => clearInterval(interval)
  }, [])

  const xs = [10, 28, 50, 72, 90]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
      <svg viewBox="0 0 100 100" width="220" height="220" style={{ overflow: 'visible' }}>
        {/* Connections */}
        {layers.slice(0, -1).map((layerA, li) =>
          layerA.map((nodeA, ni) =>
            layers[li + 1].map((nodeB, nj) => {
              const isActive = active[li]?.[ni] && active[li + 1]?.[nj]
              return (
                <line
                  key={`${li}-${ni}-${nj}`}
                  x1={xs[li]} y1={nodeA.y}
                  x2={xs[li + 1]} y2={nodeB.y}
                  stroke={isActive ? 'var(--accent-color)' : 'rgba(103,136,194,0.12)'}
                  strokeWidth={isActive ? '0.6' : '0.3'}
                  style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                />
              )
            })
          )
        )}
        {/* Nodes */}
        {layers.map((layer, li) =>
          layer.map((node, ni) => {
            const isActive = active[li]?.[ni]
            return (
              <circle
                key={`n-${li}-${ni}`}
                cx={xs[li]} cy={node.y} r="3.5"
                fill={isActive ? 'var(--accent-color)' : 'var(--glass-bg)'}
                stroke={isActive ? 'var(--accent-color)' : 'rgba(103,136,194,0.35)'}
                strokeWidth="0.8"
                style={{ transition: 'fill 0.4s, stroke 0.4s' }}
              />
            )
          })
        )}
        {/* Labels */}
        <text x={xs[0]} y="97" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.5">Entrada</text>
        <text x={xs[2]} y="97" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.5">Ocultas</text>
        <text x={xs[4]} y="97" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.5">Saída</text>
      </svg>
    </div>
  )
}

/* ─── Token probability demo ────────────────────────────────── */
function TokenProbabilityDemo() {
  const scenarios = [
    {
      ctx: 'O céu é de cor',
      candidates: [
        { word: 'azul', prob: 72 },
        { word: 'cinza', prob: 15 },
        { word: 'rosa', prob: 8 },
        { word: 'verde', prob: 5 },
      ],
    },
    {
      ctx: 'Para proteger sua senha, use',
      candidates: [
        { word: 'autenticação', prob: 45 },
        { word: 'caracteres', prob: 28 },
        { word: 'um gerenciador', prob: 18 },
        { word: 'números', prob: 9 },
      ],
    },
    {
      ctx: 'A capital do Brasil é',
      candidates: [
        { word: 'Brasília', prob: 91 },
        { word: 'Rio de Janeiro', prob: 6 },
        { word: 'São Paulo', prob: 2 },
        { word: 'Belo Horizonte', prob: 1 },
      ],
    },
  ]
  const [idx, setIdx] = useState(0)
  const s = scenarios[idx]
  const maxProb = Math.max(...s.candidates.map(c => c.prob))

  return (
    <div style={{
      margin: '1.5rem 0',
      padding: '1.2rem',
      borderRadius: '12px',
      background: 'var(--glass-bg)',
      border: '1px solid rgba(103,136,194,0.15)',
    }}>
      <p style={{ fontWeight: 700, fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.75rem' }}>
        SIMULAÇÃO: QUAL A PRÓXIMA PALAVRA?
      </p>
      <div style={{
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        background: 'rgba(103,136,194,0.07)',
        border: '1px solid rgba(103,136,194,0.15)',
        fontFamily: 'monospace',
        fontSize: '0.95rem',
        marginBottom: '1rem',
      }}>
        {s.ctx} <span style={{
          display: 'inline-block',
          width: '60px',
          height: '16px',
          background: 'rgba(103,136,194,0.2)',
          borderRadius: '3px',
          verticalAlign: 'middle',
          animation: 'blink 1s step-end infinite',
        }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {s.candidates.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '110px', fontSize: '0.82rem', fontWeight: i === 0 ? 700 : 400 }}>
              {i === 0 && '🏆 '}{c.word}
            </div>
            <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'rgba(103,136,194,0.1)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(c.prob / maxProb) * 100}%`,
                borderRadius: '4px',
                background: i === 0 ? 'var(--accent-color)' : 'rgba(103,136,194,0.3)',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ width: '36px', fontSize: '0.78rem', textAlign: 'right', opacity: 0.7 }}>{c.prob}%</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {scenarios.map((sc, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: i === idx ? 700 : 400,
              border: `1px solid ${i === idx ? 'var(--accent-color)' : 'rgba(103,136,194,0.2)'}`,
              background: i === idx ? 'rgba(103,136,194,0.12)' : 'transparent',
              cursor: 'pointer',
              color: 'var(--text-color)',
              transition: 'all 0.2s',
            }}
          >
            Exemplo {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── PROMPT Acronym Builder ────────────────────────────────── */
const PROMPT_LETTERS = [
  {
    letter: 'P',
    name: 'Persona',
    icon: '🎭',
    desc: 'Defina quem a IA deve ser. Um papel específico calibra o tom, a profundidade e o vocabulário da resposta.',
    example: '"Aja como um professor de ensino médio explicando para alunos de 15 anos."',
    color: '#6788c2',
  },
  {
    letter: 'R',
    name: 'Roteiro',
    icon: '📋',
    desc: 'Descreva exatamente o que a IA deve fazer, passo a passo. Evite pedidos vagos.',
    example: '"Crie um plano com 5 tópicos principais, explique cada um em 3 linhas e inclua um exemplo."',
    color: '#a855f7',
  },
  {
    letter: 'O',
    name: 'Objetivo',
    icon: '🎯',
    desc: 'Deixe claro qual é o resultado final desejado. Por que você está pedindo isso?',
    example: '"O objetivo é que os alunos entendam o que é IA sem conhecimento técnico prévio."',
    color: '#22c55e',
  },
  {
    letter: 'M',
    name: 'Modelo',
    icon: '📐',
    desc: 'Especifique o formato da resposta: lista, tabela, código, e-mail, redação, tópicos...',
    example: '"Responda em formato de tabela com duas colunas: Conceito e Definição."',
    color: '#f97316',
  },
  {
    letter: 'P',
    name: 'Panorama',
    icon: '🌐',
    desc: 'Forneça contexto e detalhes adicionais. Quanto mais contexto, mais precisa a resposta.',
    example: '"O público são jovens de 14-17 anos. A aula tem 50 minutos. Sem jargões técnicos."',
    color: '#eab308',
  },
  {
    letter: 'T',
    name: 'Transformar',
    icon: '✨',
    desc: 'Refine após a primeira resposta. A IA é iterativa — peça ajustes, variações e melhorias.',
    example: '"Agora reescreva em tom mais descontraído e reduza para 3 parágrafos."',
    color: '#ef4444',
  },
]

function PromptBuilder() {
  const [selected, setSelected] = useState<number | null>(0)
  const [fields, setFields] = useState<string[]>(Array(6).fill(''))

  const preview = PROMPT_LETTERS.map((p, i) =>
    fields[i] ? `[${p.name.toUpperCase()}] ${fields[i]}` : null
  ).filter(Boolean).join('\n\n')

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {/* Letter tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {PROMPT_LETTERS.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelected(selected === i ? null : i)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              border: `2px solid ${selected === i ? p.color : 'rgba(103,136,194,0.2)'}`,
              background: selected === i ? `${p.color}18` : 'var(--glass-bg)',
              fontWeight: 800,
              fontSize: '1rem',
              color: selected === i ? p.color : 'var(--text-color)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {p.letter}
            {fields[i] && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: p.color,
              }} />
            )}
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem', fontSize: '0.78rem', opacity: 0.5 }}>
          ← selecione uma letra
        </div>
      </div>

      {/* Detail panel */}
      {selected !== null && (
        <div style={{
          padding: '1.2rem',
          borderRadius: '12px',
          background: `${PROMPT_LETTERS[selected].color}0d`,
          border: `1px solid ${PROMPT_LETTERS[selected].color}30`,
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{PROMPT_LETTERS[selected].icon}</span>
            <div>
              <div style={{ fontWeight: 800, color: PROMPT_LETTERS[selected].color, fontSize: '0.95rem' }}>
                {PROMPT_LETTERS[selected].letter} — {PROMPT_LETTERS[selected].name}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.65, marginTop: '1px' }}>{PROMPT_LETTERS[selected].desc}</div>
            </div>
          </div>
          <div style={{
            padding: '0.6rem 0.9rem',
            borderRadius: '8px',
            background: 'rgba(103,136,194,0.05)',
            border: '1px solid rgba(103,136,194,0.1)',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            opacity: 0.75,
            marginBottom: '0.75rem',
          }}>
            {PROMPT_LETTERS[selected].example}
          </div>
          <textarea
            value={fields[selected]}
            onChange={e => setFields(f => { const n = [...f]; n[selected] = e.target.value; return n })}
            placeholder={`Escreva o ${PROMPT_LETTERS[selected].name.toLowerCase()} do seu prompt...`}
            rows={2}
            style={{
              width: '100%',
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              border: `1px solid ${PROMPT_LETTERS[selected].color}40`,
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              fontSize: '0.85rem',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{
          padding: '1rem',
          borderRadius: '10px',
          background: 'rgba(103,136,194,0.06)',
          border: '1px solid rgba(103,136,194,0.15)',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.5, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            PREVIEW DO SEU PROMPT
          </div>
          <pre style={{
            fontSize: '0.78rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            margin: 0,
            fontFamily: 'inherit',
            opacity: 0.8,
          }}>{preview}</pre>
        </div>
      )}
    </div>
  )
}

/* ─── Good vs Bad prompt comparison ────────────────────────── */
function PromptComparison() {
  const pairs = [
    {
      bad: 'Me ajuda com marketing',
      good: 'Aja como um especialista em marketing digital. Crie 5 ideias de posts para Instagram sobre sustentabilidade para uma loja de roupas. Use tom jovem e descontraído. Formato: lista com título e legenda.',
      why: 'O prompt ruim é vago — a IA não sabe o nicho, o público, a plataforma nem o formato. O bom especifica persona, tarefa, contexto e formato.',
    },
    {
      bad: 'Explica IA',
      good: 'Aja como professor do ensino médio. Explique o que é Inteligência Artificial para alunos de 15 anos sem conhecimento técnico, usando analogias do dia a dia. Resposta em 3 parágrafos curtos.',
      why: 'Sem contexto, a IA pode entregar algo muito técnico ou muito superficial. Com persona, nível e formato definidos, a resposta é imediatamente útil.',
    },
  ]
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(103,136,194,0.15)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRight: '1px solid rgba(239,68,68,0.1)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                ❌ PROMPT FRACO
              </div>
              <div style={{ fontSize: '0.82rem', fontStyle: 'italic', opacity: 0.75 }}>{p.bad}</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.05)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                ✅ PROMPT FORTE
              </div>
              <div style={{ fontSize: '0.82rem', opacity: 0.75 }}>{p.good}</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(103,136,194,0.06)',
              border: 'none',
              borderTop: '1px solid rgba(103,136,194,0.1)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--accent-color)',
              fontWeight: 700,
            }}
          >
            {open === i ? '▲ Ocultar análise' : '▼ Por que o forte é melhor?'}
          </button>
          {open === i && (
            <div style={{
              padding: '0.8rem 1rem',
              fontSize: '0.82rem',
              background: 'rgba(103,136,194,0.04)',
              borderTop: '1px solid rgba(103,136,194,0.1)',
              opacity: 0.75,
              lineHeight: 1.6,
            }}>
              {p.why}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Ethics checklist ──────────────────────────────────────── */
function EthicsChecklist() {
  const items = [
    { icon: '🔍', label: 'Verifiquei as informações em fontes confiáveis antes de usar', category: 'verificação' },
    { icon: '🔒', label: 'Não inseri dados pessoais, senhas ou informações confidenciais', category: 'privacidade' },
    { icon: '✍️', label: 'Indiquei claramente quando o conteúdo foi gerado com IA', category: 'transparência' },
    { icon: '🧠', label: 'Usei a IA como apoio, não como substituta do meu próprio raciocínio', category: 'autoria' },
    { icon: '⚖️', label: 'Verifiquei se o uso respeita direitos autorais e políticas da plataforma', category: 'ética' },
    { icon: '🎯', label: 'O conteúdo final passou pela minha revisão crítica antes de ser publicado', category: 'qualidade' },
  ]
  const [checked, setChecked] = useState<boolean[]>(Array(items.length).fill(false))
  const done = checked.filter(Boolean).length

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.55, letterSpacing: '0.06em' }}>CHECKLIST DO USO RESPONSÁVEL</span>
        <span style={{
          fontSize: '0.78rem', fontWeight: 700,
          padding: '0.2rem 0.7rem', borderRadius: '20px',
          background: done === items.length ? 'rgba(34,197,94,0.12)' : 'rgba(103,136,194,0.08)',
          color: done === items.length ? '#16a34a' : 'var(--text-color)',
          border: `1px solid ${done === items.length ? 'rgba(34,197,94,0.3)' : 'rgba(103,136,194,0.2)'}`,
        }}>
          {done}/{items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setChecked(c => { const n = [...c]; n[i] = !n[i]; return n })}
            style={{
              display: 'flex', gap: '0.9rem', padding: '0.75rem 1rem',
              borderRadius: '10px', cursor: 'pointer', userSelect: 'none',
              background: checked[i] ? 'rgba(34,197,94,0.07)' : 'var(--glass-bg)',
              border: `1px solid ${checked[i] ? 'rgba(34,197,94,0.2)' : 'rgba(103,136,194,0.12)'}`,
              transition: 'all 0.25s', alignItems: 'center',
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
              border: `2px solid ${checked[i] ? '#22c55e' : 'rgba(103,136,194,0.3)'}`,
              background: checked[i] ? '#22c55e' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', color: 'white', fontWeight: 700, transition: 'all 0.25s',
            }}>
              {checked[i] && '✓'}
            </div>
            <span style={{ fontSize: '0.82rem', textDecoration: checked[i] ? 'line-through' : 'none', opacity: checked[i] ? 0.5 : 1, transition: 'all 0.2s' }}>
              {item.icon} {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────── */
export default function IAGenerativaPage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(QUIZ.length).fill(null))
  const [quizFinished, setQuizFinished] = useState(false)
  const score = answers.filter(a => a === true).length

  function handleAnswer(correct: boolean) {
    if (answers[currentQ] !== null) return
    setAnswers(prev => { const n = [...prev]; n[currentQ] = correct; return n })
  }

  function nextQuestion() {
    if (currentQ < QUIZ.length - 1) setCurrentQ(q => q + 1)
    else setQuizFinished(true)
  }

  function restartQuiz() {
    setCurrentQ(0)
    setAnswers(Array(QUIZ.length).fill(null))
    setQuizFinished(false)
  }

  return (
    <LessonLayout sections={SECTION_LABELS}>
      {({ current, goTo, visited, exportMode }) => (
        <>
          {/* ── Section 0: Hero ── */}
          {(current === 0 || exportMode) && (
            <LessonSection>
              <div className="pabd-hero">
                <div className="pabd-hero-badge">EDUCAÇÃO DIGITAL · INTELIGÊNCIA ARTIFICIAL</div>
                <h1>
                  Entenda e Domine a<br />
                  <span className="accent-text">IA Generativa</span>
                </h1>

                {/* Animated brain + sparkles */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0', position: 'relative', height: '100px' }}>
                  <div style={{ fontSize: '4.5rem', animation: 'float 3s ease-in-out infinite', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 8px 24px rgba(108,99,255,0.35))' }}>🧠</div>
                  {[
                    { top: '0%', left: '35%', delay: '0s', size: '1.4rem' },
                    { top: '10%', left: '55%', delay: '0.4s', size: '1rem' },
                    { top: '55%', left: '62%', delay: '0.8s', size: '1.2rem' },
                    { top: '60%', left: '30%', delay: '0.2s', size: '0.9rem' },
                    { top: '5%', left: '42%', delay: '0.6s', size: '0.8rem' },
                  ].map((s, i) => (
                    <span key={i} style={{
                      position: 'absolute', top: s.top, left: s.left,
                      fontSize: s.size, animation: `float 2.5s ease-in-out ${s.delay} infinite`,
                      opacity: 0.8, pointerEvents: 'none',
                    }}>✨</span>
                  ))}
                </div>

                <p>Como a IA realmente funciona por dentro, o que são LLMs e Machine Learning, e como você pode extrair o máximo dessas ferramentas com o método <strong>PROMPT</strong>.</p>

                <div className="pabd-hero-cta">
                  <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Começar Aula</button>
                  <button className="btn-outline btn-pabd" onClick={() => goTo(7)}>⚡ Ir ao Quiz</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { num: '1 trilhão+', label: 'de parâmetros nos maiores LLMs', color: '#6c63ff' },
                    { num: '6', label: 'letras do método PROMPT', color: '#6788c2' },
                    { num: '5', label: 'módulos para dominar o conteúdo', color: '#22c55e' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: '1 1 130px', padding: '1rem', borderRadius: '12px',
                      background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(103,136,194,0.15)', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.num}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.55, marginTop: '4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 1: Sumário ── */}
          {(current === 1 || exportMode) && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">ÍNDICE</div>
                <h2>Sumário da <span className="accent-text">Aula</span></h2>
                <p className="lead">Cinco módulos para compreender a IA e usá-la com inteligência.</p>

                <div className="toc-progress-row">
                  <span>PROGRESSO</span>
                  <div className="toc-progress-bar">
                    <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4,5,6].includes(v)).length / 5) * 100}%` }} />
                  </div>
                  <span>{visited.filter(v => [2,3,4,5,6].includes(v)).length} / 5</span>
                </div>

                <div className="toc-grid">
                  {[
                    { n: 2, num: '01', icon: '🤖', title: 'Como a IA Funciona', desc: 'Padrões, probabilidades e por que a IA não pensa como humanos' },
                    { n: 3, num: '02', icon: '📊', title: 'Machine Learning', desc: 'Aprendizado com dados sem programação explícita' },
                    { n: 4, num: '03', icon: '💬', title: 'LLMs', desc: 'Modelos de linguagem e como preveem a próxima palavra' },
                    { n: 5, num: '04', icon: '✏️', title: 'Engenharia de Prompt', desc: 'O método PROMPT para extrair o melhor da IA' },
                    { n: 6, num: '05', icon: '⚖️', title: 'Ética e Responsabilidade', desc: 'Verificação, privacidade e uso crítico da IA' },
                  ].map(({ n, num, icon, title, desc }) => (
                    <button key={n} className={`toc-card${visited.includes(n) ? ' visited' : ''}`} onClick={() => goTo(n)}>
                      <div className="toc-num">{num}</div>
                      <div className="toc-content"><h3>{icon} {title}</h3><p>{desc}</p></div>
                      <div className="toc-arrow">→</div>
                    </button>
                  ))}
                  <button className={`toc-card${visited.includes(7) ? ' visited' : ''}`} onClick={() => goTo(7)}>
                    <div className="toc-num quiz-num">⚡</div>
                    <div className="toc-content"><h3>Quiz Final</h3><p>{QUIZ.length} questões para testar seu conhecimento</p></div>
                    <div className="toc-arrow">→</div>
                  </button>
                </div>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(0)}>← Início</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(2)}>Módulo 1 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 2: Como a IA Funciona ── */}
          {(current === 2 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 01</div>
                  <h2>🤖 Como a <span className="accent-text">IA Funciona</span></h2>
                  <p className="lead">
                    A IA não &quot;pensa&quot; como um ser humano. Ela é um sistema extraordinariamente eficiente em reconhecer padrões e fazer previsões baseadas em probabilidades.
                  </p>
                </div>

                <StepBlock num="01" title="O que a IA realmente faz" defaultOpen forceOpen={exportMode}>
                  <p>Imagine que você leu milhões de livros, artigos e conversas. Quando alguém lhe faz uma pergunta, você não consulta uma resposta pronta — você reconhece padrões e constrói uma resposta provável. É exatamente assim que a IA funciona.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', margin: '1.5rem 0' }}>
                    {[
                      { icon: '👤', title: 'Humano pensa', desc: 'Raciocina, sente, tem intenção, consciência e criatividade genuína.', color: '#6c63ff', tag: 'BIOLÓGICO' },
                      { icon: '🤖', title: 'IA processa', desc: 'Reconhece padrões, calcula probabilidades e gera texto estatisticamente coerente.', color: '#6788c2', tag: 'MATEMÁTICO' },
                    ].map((c, i) => (
                      <div key={i} style={{
                        padding: '1.2rem', borderRadius: '12px',
                        background: `${c.color}0d`, border: `1px solid ${c.color}25`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: c.color, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{c.tag}</div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{c.title}</div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.65, lineHeight: 1.5 }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>

                  <InfoBox variant="tip" label="💡 ANALOGIA">
                    A IA é como um músico que aprendeu milhares de músicas. Ela não <em>compõe</em> com emoção — ela <em>recombina</em> padrões aprendidos de forma incrivelmente sofisticada. O resultado pode ser belo, mas o processo é diferente.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="Reconhecimento de padrões na prática" forceOpen={exportMode}>
                  <p>Pense em como a IA aprende:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1rem 0' }}>
                    {[
                      { step: '1', title: 'Coleta de dados', desc: 'Bilhões de textos da internet, livros, artigos e conversas são coletados.' },
                      { step: '2', title: 'Identificação de padrões', desc: 'A IA aprende que após "A chuva...", palavras como "caiu", "molhou" e "gelada" são comuns.' },
                      { step: '3', title: 'Construção de probabilidades', desc: 'Cada palavra ganha um "peso" baseado em quantas vezes apareceu naquele contexto.' },
                      { step: '4', title: 'Geração de resposta', desc: 'Ao receber uma pergunta, a IA escolhe as palavras mais prováveis para aquele contexto.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '1rem', padding: '0.9rem 1.1rem',
                        borderRadius: '10px', background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)', alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: 'var(--secondary-color)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                        }}>{s.step}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '2px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Visualização: rede neural" forceOpen={exportMode}>
                  <p>Abaixo está uma representação simplificada de uma rede neural. Os nós (círculos) se ativam em padrões diferentes para cada tipo de entrada:</p>
                  <NeuralNetIllustration />
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>Os nós em azul estão &quot;ativos&quot;. A rede aprende quais padrões de ativação produzem bons resultados.</p>
                  <InfoBox variant="warn" label="⚠️ IMPORTANTE">
                    A IA pode gerar respostas muito convincentes que estão <strong>completamente erradas</strong> — especialmente em datas, números e fatos específicos. Esse fenômeno se chama <em>alucinação</em>. Sempre verifique informações importantes.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(1)}>← Sumário</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(3)}>Módulo 2 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 3: Machine Learning ── */}
          {(current === 3 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 02</div>
                  <h2>📊 Machine <span className="accent-text">Learning</span></h2>
                  <p className="lead">
                    Machine Learning (Aprendizado de Máquina) é a subcategoria da IA onde sistemas aprendem com dados e experiências, sem precisar de regras programadas manualmente para cada situação.
                  </p>
                </div>

                <StepBlock num="01" title="Programação tradicional vs. Machine Learning" defaultOpen forceOpen={exportMode}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(103,136,194,0.06)', border: '1px solid rgba(103,136,194,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', opacity: 0.6, marginBottom: '0.6rem' }}>💻 PROGRAMAÇÃO TRADICIONAL</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {['Humano escreve as regras', 'Dados + Regras → Resultado', 'Bom para problemas bem definidos', 'Ex: calculadora, semáforo'].map((t, i) => (
                          <div key={i} style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-color)', fontWeight: 700, flexShrink: 0 }}>→</span>{t}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', opacity: 0.6, marginBottom: '0.6rem', color: 'var(--secondary-color)' }}>🤖 MACHINE LEARNING</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {['Sistema descobre as regras', 'Dados + Resultado → Regras', 'Bom para padrões complexos', 'Ex: reconhecer rostos, tradução'].map((t, i) => (
                          <div key={i} style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--secondary-color)', fontWeight: 700, flexShrink: 0 }}>→</span>{t}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Tipos de aprendizado" forceOpen={exportMode}>
                  <div className="feature-card-grid">
                    {[
                      { icon: '👨‍🏫', title: 'Supervisionado', desc: 'A IA aprende com exemplos rotulados. Ex: "isso é um gato, isso é um cachorro" — até aprender sozinha a diferenciar.', color: '#22c55e' },
                      { icon: '🔍', title: 'Não supervisionado', desc: 'A IA encontra padrões sem rótulos. Ex: agrupar clientes por comportamento sem dizer quais grupos existem.', color: '#6788c2' },
                      { icon: '🎮', title: 'Por reforço', desc: 'A IA aprende por tentativa e erro. Ações certas ganham pontos; erradas perdem. Como treinar um cão com recompensas.', color: '#f97316' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card" style={{ borderLeft: `3px solid ${t.color}` }}>
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="tip" label="💡 ONDE ESTÁ O ML NO SEU DIA A DIA">
                    Recomendações do Netflix, filtro de spam do Gmail, reconhecimento facial do celular, Spotify Descobertas da Semana — tudo isso usa Machine Learning.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="03" title="O papel dos dados" forceOpen={exportMode}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1rem 0',
                  }}>
                    <p>Dados são o &quot;combustível&quot; do ML. A qualidade e quantidade dos dados determinam a qualidade do modelo:</p>
                    {[
                      { icon: '📦', label: 'Quantidade', desc: 'Mais dados geralmente significa modelos mais robustos. LLMs usam trilhões de palavras.' },
                      { icon: '✅', label: 'Qualidade', desc: 'Dados incorretos ou tendenciosos geram modelos incorretos e tendenciosos.' },
                      { icon: '🌍', label: 'Diversidade', desc: 'Dados variados evitam que o modelo funcione bem apenas para um grupo específico.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '1rem', padding: '0.75rem 1rem',
                        borderRadius: '8px', background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.label}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Módulo 3 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 4: LLMs ── */}
          {(current === 4 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 03</div>
                  <h2>💬 LLMs — <span className="accent-text">Large Language Models</span></h2>
                  <p className="lead">
                    Modelos de Linguagem de Grande Escala são o coração de ferramentas como ChatGPT, Gemini e Claude. Eles foram treinados para prever a próxima palavra mais provável — e fazem isso de forma tão sofisticada que parecem conversar naturalmente.
                  </p>
                </div>

                <StepBlock num="01" title="Como um LLM gera texto" defaultOpen forceOpen={exportMode}>
                  <p>A cada palavra gerada, o LLM avalia todo o contexto anterior e calcula probabilidades. Explore os exemplos abaixo:</p>
                  <TokenProbabilityDemo />
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    Na prática, os LLMs trabalham com <em>tokens</em> (fragmentos de palavras), não palavras inteiras, e analisam contextos com milhares de tokens simultaneamente.
                  </p>
                </StepBlock>

                <StepBlock num="02" title="Principais LLMs e suas características" forceOpen={exportMode}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1rem 0' }}>
                    {[
                      { name: 'ChatGPT (GPT-4o)', company: 'OpenAI', icon: '🟢', desc: 'Pioneiro na popularização das IAs de chat. Forte em redação, código e conversação.' },
                      { name: 'Gemini', company: 'Google', icon: '🔵', desc: 'Integrado ao ecossistema Google (Gmail, Docs, Search). Forte em tarefas multimodais.' },
                      { name: 'Claude', company: 'Anthropic', icon: '🟣', desc: 'Foco em respostas seguras e contextos longos. Forte em análise e documentos extensos.' },
                      { name: 'Llama', company: 'Meta (open source)', icon: '⚪', desc: 'Código aberto. Pode ser executado localmente. Base para muitos outros modelos.' },
                    ].map((m, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '1rem', padding: '0.85rem 1.1rem',
                        borderRadius: '10px', background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)', alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }}>{m.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.name}
                            <span style={{ fontWeight: 400, opacity: 0.5, marginLeft: '0.5rem', fontSize: '0.78rem' }}>— {m.company}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '2px' }}>{m.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="O que LLMs fazem bem — e o que não fazem" forceOpen={exportMode}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', margin: '1rem 0' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#16a34a', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>✅ PONTOS FORTES</div>
                      {['Geração de texto fluido', 'Resumos e sínteses', 'Brainstorming e ideação', 'Tradução', 'Explicação de conceitos', 'Auxílio em código'].map((t, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', padding: '0.2rem 0', borderBottom: '1px solid rgba(34,197,94,0.08)', opacity: 0.75 }}>
                          ✓ {t}
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#dc2626', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>❌ LIMITAÇÕES</div>
                      {['Fatos e datas recentes', 'Cálculos matemáticos complexos', 'Eventos após corte de treino', 'Raciocínio lógico formal', 'Informações muito específicas', 'Garantia de veracidade'].map((t, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', padding: '0.2rem 0', borderBottom: '1px solid rgba(239,68,68,0.08)', opacity: 0.75 }}>
                          ✗ {t}
                        </div>
                      ))}
                    </div>
                  </div>
                  <InfoBox variant="warn" label="⚠️ ALUCINAÇÃO">
                    LLMs podem gerar informações falsas com total confiança — isso se chama <strong>alucinação</strong>. Sempre verifique fatos importantes em fontes primárias antes de usar ou compartilhar.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Módulo 4 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 5: Engenharia de Prompt ── */}
          {(current === 5 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 04</div>
                  <h2>✏️ Engenharia de <span className="accent-text">Prompt</span></h2>
                  <p className="lead">
                    A qualidade da sua resposta depende diretamente da qualidade do seu comando. Engenharia de prompt é a habilidade de formular pedidos claros, específicos e estruturados para extrair o máximo da IA.
                  </p>
                </div>

                <StepBlock num="01" title="O método PROMPT" defaultOpen forceOpen={exportMode}>
                  <p>O acróstico <strong>PROMPT</strong> é um guia prático para estruturar seus comandos. Explore cada letra:</p>

                  {/* PROMPT overview */}
                  <div style={{ display: 'flex', gap: '0.4rem', margin: '1.2rem 0', flexWrap: 'wrap' }}>
                    {PROMPT_LETTERS.map((p, i) => (
                      <div key={i} style={{
                        flex: '1 1 80px', padding: '0.9rem 0.6rem',
                        borderRadius: '10px', background: `${p.color}0d`,
                        border: `1px solid ${p.color}30`, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{p.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: p.color }}>{p.letter}</div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.65, marginTop: '2px', lineHeight: 1.3 }}>{p.name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Detail cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                    {PROMPT_LETTERS.map((p, i) => (
                      <div key={i} style={{
                        padding: '0.9rem 1.1rem', borderRadius: '10px',
                        background: `${p.color}08`, border: `1px solid ${p.color}22`,
                        borderLeft: `3px solid ${p.color}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                          <span style={{ fontWeight: 800, color: p.color }}>
                            {p.letter} — {p.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.7, marginBottom: '0.5rem' }}>{p.desc}</div>
                        <div style={{
                          padding: '0.5rem 0.75rem', borderRadius: '6px',
                          background: 'rgba(103,136,194,0.05)',
                          border: '1px solid rgba(103,136,194,0.1)',
                          fontSize: '0.78rem', fontStyle: 'italic', opacity: 0.7,
                        }}>
                          {p.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Prompts fracos vs. fortes" forceOpen={exportMode}>
                  <p>Veja a diferença na prática. Clique para ver a análise:</p>
                  <PromptComparison />
                </StepBlock>

                <StepBlock num="03" title="Monte seu próprio prompt com o PROMPT" forceOpen={exportMode}>
                  <p>Use o construtor abaixo para praticar. Selecione cada letra e preencha sua ideia:</p>
                  <PromptBuilder />
                  <InfoBox variant="tip" label="💡 DICA ITERATIVA">
                    Não espere o prompt perfeito de primeira. Escreva, veja o resultado, ajuste (&quot;T — Transformar&quot;) e refine. A IA é um colaborador, não uma máquina de respostas prontas.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(4)}>← Módulo 3</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(6)}>Módulo 5 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 6: Ética ── */}
          {(current === 6 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 05</div>
                  <h2>⚖️ Ética e <span className="accent-text">Responsabilidade</span></h2>
                  <p className="lead">
                    A IA é uma ferramenta poderosa — como qualquer ferramenta, seu valor depende de quem a usa e como. Usar IA com responsabilidade é uma habilidade tão importante quanto usá-la com eficiência.
                  </p>
                </div>

                <StepBlock num="01" title="Os quatro pilares do uso responsável" defaultOpen forceOpen={exportMode}>
                  <div className="feature-card-grid">
                    {[
                      { icon: '🔍', title: 'Verificação', desc: 'Confira sempre as informações geradas em fontes confiáveis. IA erra — especialmente em fatos, datas e números.', color: '#6788c2' },
                      { icon: '🔒', title: 'Privacidade', desc: 'Nunca insira CPF, senhas, dados de saúde ou informações confidenciais em IAs públicas.', color: '#ef4444' },
                      { icon: '✍️', title: 'Transparência', desc: 'Indique quando um conteúdo foi gerado com IA. Integridade acadêmica e profissional dependem disso.', color: '#22c55e' },
                      { icon: '🧠', title: 'Autoria humana', desc: 'Use a IA como apoio à sua criatividade, não como substituta. O julgamento final é sempre seu.', color: '#f97316' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card" style={{ borderLeft: `3px solid ${t.color}` }}>
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Checklist do uso responsável" forceOpen={exportMode}>
                  <p>Marque os itens que você já pratica — e adote os que ainda não pratica:</p>
                  <EthicsChecklist />
                </StepBlock>

                <StepBlock num="03" title="IA como amplificador humano" forceOpen={exportMode}>
                  <div style={{
                    padding: '1.5rem', borderRadius: '12px',
                    background: 'var(--glass-bg)', border: '1px solid rgba(103,136,194,0.15)',
                    margin: '1rem 0', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
                    <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>
                      A melhor forma de usar IA: como um parceiro, não como um oráculo
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left' }}>
                      {[
                        { icon: '✅', text: 'IA para acelerar rascunhos', sub: 'Você revisa e refina' },
                        { icon: '✅', text: 'IA para brainstorming', sub: 'Você seleciona e julga' },
                        { icon: '✅', text: 'IA para pesquisa inicial', sub: 'Você verifica as fontes' },
                        { icon: '✅', text: 'IA para código', sub: 'Você entende e testa' },
                        { icon: '❌', text: 'IA como verdade absoluta', sub: 'Sem verificação própria' },
                        { icon: '❌', text: 'IA substituindo o aprendizado', sub: 'Sem desenvolver compreensão' },
                      ].map((s, i) => (
                        <div key={i} style={{
                          padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem',
                          background: s.icon === '✅' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                          border: `1px solid ${s.icon === '✅' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                        }}>
                          <div style={{ fontWeight: 700 }}>{s.icon} {s.text}</div>
                          <div style={{ opacity: 0.55, fontSize: '0.72rem', marginTop: '2px' }}>{s.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <InfoBox variant="tip" label="💡 MENSAGEM FINAL">
                    A IA não vai substituir pessoas que <em>sabem usar IA</em>. O diferencial competitivo está em combinar pensamento crítico humano com a velocidade e alcance das ferramentas de IA.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(5)}>← Módulo 4</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(7)}>⚡ Quiz Final →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 7: Quiz ── */}
          {(current === 7 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <div className="section-tag">QUIZ FINAL</div>
                  <h2>⚡ Teste seu <span className="accent-text">Conhecimento</span></h2>

                  {exportMode ? (
                    <div className="quiz-print-list">
                      {QUIZ.map((q, i) => (
                        <div key={i} className="quiz-print-q">
                          <h3>{q.q}</h3>
                          <div className="quiz-print-lines">
                            <div className="quiz-print-line" />
                            <div className="quiz-print-line" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="lead">{QUIZ.length} questões sobre IA generativa e engenharia de prompt. A explicação aparece após cada resposta.</p>

                      <div className="quiz-progress">
                        {QUIZ.map((_, i) => (
                          <div key={i} className={`quiz-pip${i < currentQ ? ' done' : i === currentQ ? ' current' : ''}`} />
                        ))}
                      </div>

                      {!quizFinished ? (
                        <div className="quiz-q">
                          <h3>{QUIZ[currentQ].q}</h3>
                          <div className="quiz-options">
                            {QUIZ[currentQ].opts.map((opt, i) => {
                              const answered = answers[currentQ] !== null
                              return (
                                <button
                                  key={i}
                                  className={answered ? (opt.c ? 'quiz-opt correct' : 'quiz-opt') : 'quiz-opt'}
                                  disabled={answered}
                                  onClick={() => handleAnswer(opt.c)}
                                >
                                  {opt.t}
                                </button>
                              )
                            })}
                          </div>

                          {answers[currentQ] !== null && (
                            <>
                              <div className={`quiz-feedback ${answers[currentQ] ? 'ok' : 'err'}`}>
                                {answers[currentQ] ? '✓ ' : '✗ '}
                                {answers[currentQ] ? QUIZ[currentQ].ok : QUIZ[currentQ].err}
                              </div>
                              <div>
                                <button className="btn-primary btn-pabd" onClick={nextQuestion}>
                                  {currentQ < QUIZ.length - 1 ? 'Próxima →' : 'Ver resultado →'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="score-card">
                          <div style={{ fontSize: '3rem' }}>
                            {score >= 9 ? '🏆' : score >= 7 ? '🎉' : score >= 5 ? '📚' : '💪'}
                          </div>
                          <div className="score-num">{score}/{QUIZ.length}</div>
                          <p className="score-msg">
                            {score <= 4 && 'Continue praticando! Revise os módulos com calma e tente novamente. Você consegue! 💪'}
                            {score >= 5 && score <= 6 && 'Bom começo! Alguns conceitos ainda precisam de atenção. Revise os módulos e tente de novo. 📚'}
                            {score >= 7 && score <= 8 && 'Muito bem! Você entendeu os principais conceitos. Agora é hora de praticar com prompts reais! 🎉'}
                            {score >= 9 && 'Excelente! Você dominou o conteúdo. Agora experimente o método PROMPT nas suas ferramentas de IA favoritas! 🏆'}
                          </p>
                          <div className="score-btns">
                            <button className="btn-primary btn-pabd" onClick={restartQuiz}>↺ Refazer Quiz</button>
                            <button className="btn-outline btn-pabd" onClick={() => goTo(1)}>☰ Sumário</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="section-nav" style={{ marginTop: '2rem' }}>
                  <button className="btn-outline" onClick={() => goTo(6)}>← Módulo 5</button>
                  <button className="btn-outline" onClick={() => goTo(1)}>☰ Sumário</button>
                  <button className="btn-outline" onClick={() => goTo(0)}>⌂ Início</button>
                </div>
              </div>
            </LessonSection>
          )}
        </>
      )}
    </LessonLayout>
  )
}
