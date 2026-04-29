'use client'

import { useState } from 'react'
import LessonLayout from '@/components/features/LessonLayout'
import LessonSection from '@/components/features/LessonSection'
import StepBlock from '@/components/features/StepBlock'
import InfoBox from '@/components/features/InfoBox'

/* ─── Quiz data ─────────────────────────────────────────────── */
const QUIZ = [
  {
    q: '1. Qual é o primeiro passo antes de abrir qualquer ferramenta de slides?',
    opts: [
      { t: 'Escolher um tema visual bonito para a apresentação', c: false },
      { t: 'Definir em uma frase o objetivo central da apresentação', c: true },
      { t: 'Pesquisar imagens para ilustrar os slides', c: false },
      { t: 'Contar o número de slides que serão necessários', c: false },
    ],
    ok: 'Correto! Uma apresentação bem planejada começa pela clareza do objetivo. Se não dá para resumir em uma frase, o conteúdo ainda não está organizado.',
    err: 'Errado. O primeiro passo é definir o objetivo central em uma única frase. Só depois disso faz sentido pensar em design ou quantidade de slides.',
  },
  {
    q: '2. Qual é a regra de ouro sobre o tempo de explicação por slide?',
    opts: [
      { t: 'Cada slide deve ocupar pelo menos 5 minutos de apresentação', c: false },
      { t: 'Um slide que exige mais de 2 minutos para ser explicado tem conteúdo demais', c: true },
      { t: 'O tempo por slide não importa, o que importa é cobrir todo o conteúdo', c: false },
      { t: 'Slides de conclusão podem durar até 10 minutos', c: false },
    ],
    ok: 'Exato! Se um slide precisa de mais de 2 minutos, ele tem conteúdo em excesso. A solução é dividir em dois slides.',
    err: 'Incorreto. A regra prática é: mais de 2 minutos por slide significa conteúdo demais. Divida-o para manter o ritmo da apresentação.',
  },
  {
    q: '3. Qual é o tamanho mínimo recomendado para o corpo de texto nos slides?',
    opts: [
      { t: '12pt', c: false },
      { t: '18pt', c: false },
      { t: '24pt', c: true },
      { t: '32pt', c: false },
    ],
    ok: 'Correto! O mínimo recomendado é 24pt para garantir legibilidade mesmo à distância. Abaixo disso, o público do fundo da sala não consegue ler.',
    err: 'Errado. O tamanho mínimo é 24pt. Textos menores comprometem a legibilidade para quem está longe da tela.',
  },
  {
    q: '4. Quantas famílias de fonte devem ser usadas em uma apresentação?',
    opts: [
      { t: 'Quanto mais variado, mais criativo fica', c: false },
      { t: 'No máximo 3 famílias de fonte', c: false },
      { t: 'No máximo 2 famílias de fonte', c: true },
      { t: 'Apenas 1 família de fonte em toda a apresentação', c: false },
    ],
    ok: 'Certo! O limite é 2 famílias de fonte. Mais do que isso cria poluição visual e transmite falta de consistência.',
    err: 'Incorreto. A recomendação é no máximo 2 famílias de fonte — uma para títulos e outra para o corpo de texto, por exemplo.',
  },
  {
    q: '5. O que deve ser priorizado na construção do texto dos slides?',
    opts: [
      { t: 'Parágrafos completos e detalhados para que o público possa ler tudo', c: false },
      { t: 'Tópicos curtos e diretos, sem parágrafos inteiros', c: true },
      { t: 'Frases longas com todos os argumentos para não precisar falar muito', c: false },
      { t: 'Apenas imagens, sem nenhum texto nos slides', c: false },
    ],
    ok: 'Perfeito! O slide é suporte visual para a fala — não um documento a ser lido. Tópicos curtos guiam o apresentador sem sobrecarregar o público.',
    err: 'Errado. Parágrafos inteiros nos slides fazem o público ler em vez de ouvir. Use tópicos curtos e diretos; os detalhes ficam na sua fala.',
  },
  {
    q: '6. Qual é o teste prático recomendado para verificar se um slide está poluído?',
    opts: [
      { t: 'Mostrar para 10 pessoas e ver se elas entendem em 5 segundos', c: false },
      { t: 'Imprimir em miniatura (6 por página A4) e tentar ler', c: true },
      { t: 'Medir o número de palavras no slide', c: false },
      { t: 'Verificar o espaçamento entre linhas no arquivo', c: false },
    ],
    ok: 'Correto! Imprimir em miniatura simula a visão de quem está longe. Se não consegue ler, há fonte pequena demais ou texto em excesso.',
    err: 'Incorreto. O teste prático é imprimir em miniatura: se o texto não é legível nem de perto no papel pequeno, o slide está sobrecarregado.',
  },
  {
    q: '7. Quantas vezes completas o ensaio em voz alta deve ser feito?',
    opts: [
      { t: 'Uma vez é suficiente se você domina o conteúdo', c: false },
      { t: 'Duas vezes, uma por dia antes da apresentação', c: false },
      { t: 'Ao menos 3 vezes, do início ao fim', c: true },
      { t: 'O número de ensaios não importa, só o domínio do tema', c: false },
    ],
    ok: 'Exato! O mínimo são 3 ensaios completos em voz alta. Cada repetição revela ajustes necessários no tempo, nas transições e na fluência.',
    err: 'Incorreto. O mínimo recomendado são 3 ensaios completos. Apresentar bem é habilidade prática — não nasce espontaneamente no dia.',
  },
  {
    q: '8. Qual é a postura corporal correta durante a apresentação?',
    opts: [
      { t: 'De costas para a tela ao apontar os slides', c: false },
      { t: 'Sempre de frente para o público, nunca de costas para a tela', c: true },
      { t: 'Sentado atrás de uma mesa para transmitir formalidade', c: false },
      { t: 'Qualquer postura, desde que a voz seja clara', c: false },
    ],
    ok: 'Correto! Ficar de frente para o público mantém a conexão e o contato visual. Virar as costas quebra o vínculo com a plateia.',
    err: 'Errado. A postura certa é sempre de frente para o público. Virar de costas para a tela perde o contato visual e a atenção da plateia.',
  },
  {
    q: '9. Por que se deve fazer uma pausa antes de começar a responder uma pergunta da banca?',
    opts: [
      { t: 'Para mostrar que a pergunta é muito difícil', c: false },
      { t: 'Para parecer mais inteligente e seguro', c: false },
      { t: 'Para ouvir a pergunta completa e organizar uma resposta mais precisa', c: true },
      { t: 'Porque interromper a banca é antiético', c: false },
    ],
    ok: 'Exato! Ouvir até o fim antes de responder evita mal-entendidos e permite formular uma resposta mais clara. Uma pausa demonstra seriedade, não fraqueza.',
    err: 'Incorreto. A pausa serve para garantir que você ouviu a pergunta inteira e pode organizar uma resposta precisa. É sinal de maturidade, não insegurança.',
  },
  {
    q: '10. O que a banca avaliadora principalmente avalia em uma apresentação científica?',
    opts: [
      { t: 'Performance perfeita, sem nenhuma hesitação', c: false },
      { t: 'A beleza visual dos slides e a criatividade do design', c: false },
      { t: 'Domínio do conteúdo e clareza na comunicação', c: true },
      { t: 'O tempo exato de apresentação, sem segundos a mais ou a menos', c: false },
    ],
    ok: 'Correto! A banca avalia domínio do conteúdo e clareza na comunicação. Uma pausa para pensar é sinal de seriedade — não de fraqueza.',
    err: 'Errado. O foco da avaliação é domínio do conteúdo e clareza. Performance perfeita ou design elaborado são secundários.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Planejamento', 'Design', 'Conteúdo', 'Revisão', 'Ensaio', 'Apresentação', 'Quiz']

/* ─── Checklist interativo ──────────────────────────────────── */
function StageChecklist({ items, color }: { items: string[]; color: string }) {
  const [checked, setChecked] = useState<boolean[]>(Array(items.length).fill(false))
  const done = checked.filter(Boolean).length

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '0.15rem 0.6rem', borderRadius: '20px',
          background: done === items.length ? 'rgba(34,197,94,0.12)' : 'rgba(103,136,194,0.08)',
          color: done === items.length ? '#16a34a' : 'var(--text-color)',
          border: `1px solid ${done === items.length ? 'rgba(34,197,94,0.3)' : 'rgba(103,136,194,0.2)'}`,
        }}>
          {done}/{items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setChecked(c => { const n = [...c]; n[i] = !n[i]; return n })}
            style={{
              display: 'flex', gap: '0.9rem', padding: '0.65rem 1rem',
              borderRadius: '9px', cursor: 'pointer', userSelect: 'none',
              background: checked[i] ? 'rgba(34,197,94,0.06)' : 'var(--glass-bg)',
              border: `1px solid ${checked[i] ? 'rgba(34,197,94,0.18)' : 'rgba(103,136,194,0.12)'}`,
              transition: 'all 0.2s', alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, marginTop: '1px',
              border: `2px solid ${checked[i] ? color : 'rgba(103,136,194,0.3)'}`,
              background: checked[i] ? color : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', color: '#0E0F11', fontWeight: 800, transition: 'all 0.2s',
            }}>
              {checked[i] && '✓'}
            </div>
            <span
              style={{
                fontSize: '0.82rem', lineHeight: 1.5,
                textDecoration: checked[i] ? 'line-through' : 'none',
                opacity: checked[i] ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Slide visual comparison ───────────────────────────────── */
function SlideComparison() {
  const [active, setActive] = useState<'bad' | 'good'>('bad')
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['bad', 'good'] as const).map(v => (
          <button
            key={v}
            onClick={() => setActive(v)}
            style={{
              flex: 1, padding: '0.4rem',
              borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
              border: `1px solid ${active === v ? (v === 'bad' ? '#dc2626' : '#16a34a') : 'rgba(103,136,194,0.2)'}`,
              background: active === v ? (v === 'bad' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)') : 'transparent',
              color: active === v ? (v === 'bad' ? '#dc2626' : '#16a34a') : 'var(--text-color)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {v === 'bad' ? '❌ Slide poluído' : '✅ Slide limpo'}
          </button>
        ))}
      </div>

      {active === 'bad' ? (
        <div style={{
          padding: '1.5rem', borderRadius: '12px',
          background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
          position: 'relative',
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.6rem', opacity: 0.8 }}>Título do slide que é muito longo e ocupa quase duas linhas completas</div>
          <div style={{ fontSize: '0.65rem', lineHeight: 1.6, opacity: 0.65 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
          <div style={{ fontSize: '0.6rem', marginTop: '0.5rem', opacity: 0.5 }}>• Ponto 1 • Ponto 2 • Ponto 3 • Ponto 4 • Ponto 5 • Ponto 6 • Ponto 7 • Ponto 8 • Ponto 9</div>
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            fontSize: '0.65rem', fontWeight: 700, color: '#dc2626',
            background: 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: '4px',
          }}>texto demais</div>
        </div>
      ) : (
        <div style={{
          padding: '1.5rem', borderRadius: '12px',
          background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)',
          position: 'relative',
        }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', opacity: 0.9 }}>Título claro e direto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {['→ Ponto principal em uma linha', '→ Segundo ponto conciso', '→ Máximo 5 tópicos por slide'].map((t, i) => (
              <div key={i} style={{ fontSize: '0.78rem', opacity: 0.75 }}>{t}</div>
            ))}
          </div>
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            fontSize: '0.65rem', fontWeight: 700, color: '#16a34a',
            background: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: '4px',
          }}>legível e eficiente</div>
        </div>
      )}
      <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.75rem', textAlign: 'center' }}>
        O slide limpo direciona a atenção. O poluído divide e dispersa.
      </p>
    </div>
  )
}

/* ─── Timeline da apresentação ──────────────────────────────── */
function PresentationTimeline() {
  const [active, setActive] = useState<number | null>(null)
  const steps = [
    { time: 'Chegada', icon: '🚪', title: 'Chegue cedo', desc: 'Teste o equipamento: projetor, cabo e o apresentador de slides. Identifique onde você vai ficar posicionado.' },
    { time: 'Início', icon: '🎤', title: 'Abertura', desc: 'Respire fundo. Faça uma pausa antes de falar. Cumprimente a banca. Apresente-se e anuncia o tema.' },
    { time: 'Meio', icon: '📊', title: 'Desenvolvimento', desc: 'Fique de frente para o público. Distribua o contato visual. Fale pausadamente — velocidade alta denota nervosismo.' },
    { time: 'Final', icon: '🏁', title: 'Conclusão', desc: 'Retome os pontos essenciais. Agradeça a atenção. Sinalize que está disponível para perguntas.' },
    { time: 'Q&A', icon: '❓', title: 'Perguntas', desc: 'Ouça até o fim antes de responder. Uma pausa para pensar é sinal de seriedade, não de fraqueza.' },
  ]
  return (
    <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {steps.map((s, i) => (
        <div
          key={i}
          onClick={() => setActive(active === i ? null : i)}
          style={{
            borderRadius: '10px', cursor: 'pointer', overflow: 'hidden',
            border: `1px solid ${active === i ? 'rgba(103,136,194,0.3)' : 'rgba(103,136,194,0.12)'}`,
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.9rem',
            padding: '0.75rem 1rem',
            background: active === i ? 'rgba(103,136,194,0.07)' : 'var(--glass-bg)',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.5 }}>{s.time}</div>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{active === i ? '▲' : '▼'}</span>
          </div>
          {active === i && (
            <div style={{
              padding: '0.75rem 1rem 1rem',
              borderTop: '1px solid rgba(103,136,194,0.1)',
              fontSize: '0.82rem', lineHeight: 1.6, opacity: 0.75,
            }}>
              {s.desc}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────── */
export default function ApresentacaoPage() {
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
                <div className="pabd-hero-badge">EDUCAÇÃO DIGITAL · COMUNICAÇÃO CIENTÍFICA</div>
                <h1>
                  Apresentação<br />
                  <span className="accent-text">Científica</span> de Sucesso
                </h1>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0', position: 'relative', height: '90px' }}>
                  <div style={{ fontSize: '4rem', animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 24px rgba(103,136,194,0.35))' }}>🎓</div>
                  {[
                    { top: '0%', left: '36%', delay: '0s', size: '1.2rem', emoji: '📊' },
                    { top: '15%', left: '56%', delay: '0.5s', size: '1rem', emoji: '🗺️' },
                    { top: '55%', left: '60%', delay: '0.9s', size: '1.1rem', emoji: '✨' },
                    { top: '58%', left: '30%', delay: '0.3s', size: '0.9rem', emoji: '🎤' },
                  ].map((s, i) => (
                    <span key={i} style={{
                      position: 'absolute', top: s.top, left: s.left,
                      fontSize: s.size, animation: `float 2.5s ease-in-out ${s.delay} infinite`,
                      opacity: 0.75, pointerEvents: 'none',
                    }}>{s.emoji}</span>
                  ))}
                </div>

                <p>Expanda cada etapa, absorva os conceitos e marque os pontos conforme avança na preparação. Do planejamento ao dia da defesa, em <strong>6 módulos</strong>.</p>

                <div className="pabd-hero-cta">
                  <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Começar Aula</button>
                  <button className="btn-outline btn-pabd" onClick={() => goTo(8)}>⚡ Ir ao Quiz</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { num: '6', label: 'etapas do processo completo', color: '#6788c2' },
                    { num: '33', label: 'pontos de verificação práticos', color: '#22c55e' },
                    { num: '10', label: 'questões no quiz final', color: '#f97316' },
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
                <p className="lead">Seis módulos do planejamento ao dia da apresentação.</p>

                <div className="toc-progress-row">
                  <span>PROGRESSO</span>
                  <div className="toc-progress-bar">
                    <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4,5,6,7].includes(v)).length / 6) * 100}%` }} />
                  </div>
                  <span>{visited.filter(v => [2,3,4,5,6,7].includes(v)).length} / 6</span>
                </div>

                <div className="toc-grid">
                  {[
                    { n: 2, num: '01', icon: '🗺️', title: 'Planejamento do Conteúdo', desc: 'Objetivo, público-alvo, tempo disponível e estrutura' },
                    { n: 3, num: '02', icon: '🎨', title: 'Design Visual dos Slides', desc: 'Contraste, fontes, paleta de cores e legibilidade' },
                    { n: 4, num: '03', icon: '✍️', title: 'Construção do Conteúdo', desc: 'Texto mínimo, dados com fonte e regra dos 2 minutos' },
                    { n: 5, num: '04', icon: '🔍', title: 'Revisão e Ajustes Finais', desc: 'Ortografia, consistência visual e feedback externo' },
                    { n: 6, num: '05', icon: '🎤', title: 'Ensaio da Apresentação', desc: 'Voz alta, cronometragem e simulação do ambiente' },
                    { n: 7, num: '06', icon: '🏆', title: 'A Apresentação em Si', desc: 'Postura, contato visual e resposta às perguntas' },
                  ].map(({ n, num, icon, title, desc }) => (
                    <button key={n} className={`toc-card${visited.includes(n) ? ' visited' : ''}`} onClick={() => goTo(n)}>
                      <div className="toc-num">{num}</div>
                      <div className="toc-content"><h3>{icon} {title}</h3><p>{desc}</p></div>
                      <div className="toc-arrow">→</div>
                    </button>
                  ))}
                  <button className={`toc-card${visited.includes(8) ? ' visited' : ''}`} onClick={() => goTo(8)}>
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

          {/* ── Section 2: Planejamento ── */}
          {(current === 2 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 01</div>
                  <h2>🗺️ Planejamento do <span className="accent-text">Conteúdo</span></h2>
                  <p className="lead">
                    Antes de abrir qualquer ferramenta, entenda o que precisa ser comunicado. Essa é a etapa mais importante — uma apresentação bem planejada exige muito menos retrabalho depois.
                  </p>
                </div>

                <StepBlock num="01" title="Por que planejar antes de criar" defaultOpen forceOpen={exportMode}>
                  <p>A maioria das apresentações fracas não falha no design — falha no planejamento. Quando o objetivo não está claro, o conteúdo se expande sem critério, os slides ficam sobrecarregados e o apresentador perde o fio condutor.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', margin: '1.5rem 0' }}>
                    {[
                      { icon: '🎯', title: 'Objetivo claro', desc: 'Uma frase define o que o público deve compreender ou lembrar ao sair.', color: '#6788c2' },
                      { icon: '👥', title: 'Público definido', desc: 'Banca, professores ou colegas exigem linguagens e níveis de profundidade diferentes.', color: '#22c55e' },
                      { icon: '⏱️', title: 'Tempo controlado', desc: 'Cada minuto disponível corresponde, em média, a 1 slide bem explorado.', color: '#f97316' },
                    ].map((c, i) => (
                      <div key={i} style={{
                        padding: '1.1rem', borderRadius: '12px',
                        background: `${c.color}0d`, border: `1px solid ${c.color}25`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{c.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{c.title}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.65, lineHeight: 1.5 }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>

                  <InfoBox variant="tip" label="💡 DIAGNÓSTICO RÁPIDO">
                    Se você não consegue resumir o objetivo da apresentação em uma frase, o conteúdo ainda não está organizado. Reorganize antes de criar qualquer slide.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="Checklist de planejamento" forceOpen={exportMode}>
                  <p>Marque cada item à medida que conclui:</p>
                  <StageChecklist
                    color="#6788c2"
                    items={[
                      'Defina em <strong>uma frase</strong> o objetivo central da apresentação',
                      'Identifique o público-alvo: banca avaliadora, professores ou colegas',
                      'Estabeleça o tempo disponível e estime quantos slides comporta',
                      'Liste os <strong>3–5 pontos essenciais</strong> que o público deve lembrar',
                      'Esboce a estrutura: capa → sumário → desenvolvimento → conclusão → referências',
                    ]}
                  />
                </StepBlock>

                <StepBlock num="03" title="Estrutura básica de uma apresentação científica" forceOpen={exportMode}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
                    {[
                      { n: '1', title: 'Capa', desc: 'Título, autores, instituição e data. Sem texto além disso.' },
                      { n: '2', title: 'Sumário', desc: 'Visão geral do que será apresentado. Orienta o público.' },
                      { n: '3–N', title: 'Desenvolvimento', desc: 'Um conceito central por slide. Dados com fonte citada.' },
                      { n: 'N+1', title: 'Conclusão', desc: 'Retoma os 3–5 pontos essenciais definidos no planejamento.' },
                      { n: 'Fim', title: 'Referências', desc: 'Slide exclusivo. Formato ABNT ou Vancouver conforme a área.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '1rem', padding: '0.75rem 1rem',
                        borderRadius: '9px', background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)', alignItems: 'flex-start',
                      }}>
                        <div style={{
                          minWidth: '36px', height: '28px', borderRadius: '6px',
                          background: 'rgba(103,136,194,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.72rem', flexShrink: 0, color: 'var(--accent-color)',
                        }}>{s.n}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(1)}>← Sumário</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(3)}>Módulo 2 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 3: Design ── */}
          {(current === 3 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 02</div>
                  <h2>🎨 Design Visual dos <span className="accent-text">Slides</span></h2>
                  <p className="lead">
                    Um slide visualmente poluído prejudica até o melhor conteúdo. Simplicidade e coerência visual são sinais de maturidade acadêmica e profissionalismo.
                  </p>
                </div>

                <StepBlock num="01" title="Princípios do design eficiente" defaultOpen forceOpen={exportMode}>
                  <div className="feature-card-grid">
                    {[
                      { icon: '🌗', title: 'Alto contraste', desc: 'Fundo claro com texto escuro (ou vice-versa). Nunca texto cinza claro em fundo branco.', color: '#6788c2' },
                      { icon: '🔤', title: 'Máx. 2 fontes', desc: 'Uma para títulos, outra para o corpo. Mais do que isso gera poluição tipográfica.', color: '#a855f7' },
                      { icon: '🎨', title: 'Paleta de 2–3 cores', desc: 'Escolha e aplique consistentemente. Cada nova cor dilui a identidade visual.', color: '#f97316' },
                      { icon: '📐', title: 'Margens generosas', desc: 'Espaço de respiro entre elementos direciona o olhar e reduz carga cognitiva.', color: '#22c55e' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card" style={{ borderLeft: `3px solid ${t.color}` }}>
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Slide poluído vs. slide eficiente" forceOpen={exportMode}>
                  <p>Veja a diferença na prática e entenda por que o design impacta a comunicação:</p>
                  <SlideComparison />
                </StepBlock>

                <StepBlock num="03" title="Checklist de design" forceOpen={exportMode}>
                  <StageChecklist
                    color="#a855f7"
                    items={[
                      'Use <strong>fundo claro com texto escuro</strong> (alto contraste sempre)',
                      'Limite a <strong>no máximo 2 famílias de fonte</strong> em toda a apresentação',
                      'Defina uma <strong>paleta de 2–3 cores</strong> e aplique consistentemente',
                      'Garanta margens generosas e espaço de respiro entre os elementos',
                      'Use tamanho mínimo de <strong>24pt</strong> para corpo de texto nos slides',
                      'Teste em tela cheia simulando a distância real do público',
                    ]}
                  />
                  <InfoBox variant="tip" label="💡 TESTE PRÁTICO">
                    Imprima um slide em miniatura (6 por página A4). Se não conseguir ler, há fonte pequena demais ou texto em excesso.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Módulo 3 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 4: Conteúdo ── */}
          {(current === 4 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 03</div>
                  <h2>✍️ Construção do <span className="accent-text">Conteúdo</span></h2>
                  <p className="lead">
                    O slide é um suporte visual para a fala, não um documento a ser lido. Cada slide deve carregar uma única ideia central. O que vai no slide é o roteiro — não o discurso.
                  </p>
                </div>

                <StepBlock num="01" title="A regra dos 2 minutos" defaultOpen forceOpen={exportMode}>
                  <div style={{
                    padding: '1.5rem', borderRadius: '12px',
                    background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)',
                    textAlign: 'center', margin: '1rem 0',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f97316', marginBottom: '0.5rem' }}>Regra de Ouro</div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      Se um slide precisa de mais de <strong>2 minutos</strong> para ser explicado, ele tem conteúdo demais.
                      <br />Divida-o em dois slides.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#dc2626', marginBottom: '0.5rem' }}>❌ EVITE</div>
                      {['Parágrafos inteiros no slide', 'Mais de 6 linhas de texto', 'Dois conceitos num só slide', 'Dados sem citar a fonte'].map((t, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', padding: '0.18rem 0', opacity: 0.7 }}>✗ {t}</div>
                      ))}
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#16a34a', marginBottom: '0.5rem' }}>✅ PREFIRA</div>
                      {['Tópicos curtos e diretos', 'Máx. 5–6 linhas por slide', 'Uma ideia por slide', 'Gráficos com fonte citada'].map((t, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', padding: '0.18rem 0', opacity: 0.7 }}>✓ {t}</div>
                      ))}
                    </div>
                  </div>
                </StepBlock>

                <StepBlock num="02" title="O papel das imagens e dos dados" forceOpen={exportMode}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1rem 0' }}>
                    {[
                      { icon: '📊', label: 'Gráficos e tabelas', desc: 'Sempre cite a fonte logo abaixo. Prefira gráficos simples — barras e linhas são mais rápidos de ler.' },
                      { icon: '🖼️', label: 'Imagens', desc: 'Escolha imagens que explicam, não que decoram. Se remover a imagem não muda nada, ela não deveria estar lá.' },
                      { icon: '💬', label: 'Citações diretas', desc: 'Use com moderação e sempre com aspas + autor + ano. Citações longas viram texto — e texto demais é inimigo dos slides.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '1rem', padding: '0.75rem 1rem',
                        borderRadius: '9px', background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)', alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.label}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Checklist de conteúdo" forceOpen={exportMode}>
                  <StageChecklist
                    color="#f97316"
                    items={[
                      'Máximo de <strong>5–6 linhas de texto</strong> por slide',
                      'Use tópicos curtos e diretos, <strong>nunca parágrafos inteiros</strong>',
                      'Inclua gráficos, tabelas e dados com <strong>fonte citada</strong>',
                      'Escolha imagens que complementam e explicam, não apenas decoram',
                      'Reserve um slide final exclusivo para as <strong>referências bibliográficas</strong>',
                      'Numere todos os slides, exceto a capa',
                    ]}
                  />
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Módulo 4 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 5: Revisão ── */}
          {(current === 5 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 04</div>
                  <h2>🔍 Revisão e <span className="accent-text">Ajustes Finais</span></h2>
                  <p className="lead">
                    Erros que passam despercebidos durante a criação ficam gritantes na hora da apresentação. A revisão é a etapa que separa o trabalho bom do muito bom.
                  </p>
                </div>

                <StepBlock num="01" title="Por que o olhar externo é essencial" defaultOpen forceOpen={exportMode}>
                  <p>Depois de horas trabalhando em algo, nosso cérebro começa a preencher automaticamente os erros que existem — ele lê o que deveria estar lá, não o que está. Isso se chama <em>cegueira de mudança</em>.</p>

                  <InfoBox variant="tip" label="💡 DICA">
                    Feche o arquivo por algumas horas antes da revisão final. Você volta com olhos frescos e encontra muito mais inconsistências.
                  </InfoBox>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1.2rem 0' }}>
                    {[
                      { icon: '⏳', title: 'Distância temporal', desc: 'Feche o arquivo. Revise horas depois. Seu cérebro "esquece" o que deveria estar lá.' },
                      { icon: '👀', title: 'Olhar de terceiros', desc: 'Peça a um colega ou orientador para revisar. Eles veem o que você não vê mais.' },
                      { icon: '🖨️', title: 'Impressão em papel', desc: 'Imprimir revela problemas de legibilidade que a tela esconde.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '0.9rem', padding: '0.7rem 1rem',
                        borderRadius: '9px', background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Checklist de revisão" forceOpen={exportMode}>
                  <StageChecklist
                    color="#22c55e"
                    items={[
                      'Revise ortografia e gramática em <strong>todos os slides</strong>, sem exceção',
                      'Confirme que dados, percentuais e gráficos estão corretos e atualizados',
                      'Verifique consistência visual: fontes, tamanhos, cores e alinhamentos',
                      'Teste em <strong>modo apresentação completo</strong>, slide a slide, em tela cheia',
                      'Peça feedback a um colega ou orientador antes da versão final',
                    ]}
                  />
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(4)}>← Módulo 3</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(6)}>Módulo 5 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 6: Ensaio ── */}
          {(current === 6 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 05</div>
                  <h2>🎤 Ensaio da <span className="accent-text">Apresentação</span></h2>
                  <p className="lead">
                    Apresentar bem é uma habilidade prática — não nasce espontaneamente no dia. O ensaio é onde você descobre o que precisa melhorar enquanto ainda dá tempo de corrigir.
                  </p>
                </div>

                <StepBlock num="01" title="Por que ensaiar em voz alta" defaultOpen forceOpen={exportMode}>
                  <p>Ler mentalmente é diferente de falar. A voz revela tropeços, pausas longas e trechos confusos que o olhar não percebe. Só o ensaio em voz alta simula a experiência real.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', margin: '1.2rem 0' }}>
                    {[
                      { icon: '🗣️', title: 'Mínimo 3 vezes', desc: 'Cada ensaio completo revela ajustes que o anterior não mostrou.', color: '#6788c2' },
                      { icon: '⏱️', title: 'Cronometrado', desc: 'Sem cronometrar, é impossível saber se o conteúdo cabe no tempo.', color: '#a855f7' },
                      { icon: '📹', title: 'Grave um ensaio', desc: 'Vídeo expõe vícios de fala, postura e ritmo que você não percebe ao vivo.', color: '#f97316' },
                    ].map((c, i) => (
                      <div key={i} style={{
                        padding: '1.1rem', borderRadius: '12px',
                        background: `${c.color}0d`, border: `1px solid ${c.color}25`, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{c.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.3rem', color: c.color }}>{c.title}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.65, lineHeight: 1.5 }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>

                  <InfoBox variant="tip" label="💡 DICA PODEROSA">
                    Grave um ensaio em vídeo e assista. Vícios de fala, postura e ritmo que você não percebe ao vivo ficam evidentes na gravação.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="Checklist de ensaio" forceOpen={exportMode}>
                  <StageChecklist
                    color="#a855f7"
                    items={[
                      'Ensaie em voz alta <strong>ao menos 3 vezes</strong> completas, do início ao fim',
                      'Cronometre cada ensaio e ajuste o conteúdo para caber no tempo',
                      'Pratique <strong>sem ler o texto do slide</strong> — use-o apenas como guia visual',
                      'Simule o ambiente real: sala, projetor e pelo menos uma pessoa de plateia',
                      'Ensaie as respostas para as prováveis perguntas da banca avaliadora',
                    ]}
                  />
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(5)}>← Módulo 4</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(7)}>Módulo 6 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 7: A Apresentação ── */}
          {(current === 7 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 06</div>
                  <h2>🏆 A Apresentação <span className="accent-text">em Si</span></h2>
                  <p className="lead">
                    Chegou a hora. Você planejou, criou, revisou e ensaiou. Agora é foco na comunicação: falar com clareza, olhar para as pessoas e deixar o conteúdo falar por si.
                  </p>
                </div>

                <StepBlock num="01" title="Linha do tempo do dia" defaultOpen forceOpen={exportMode}>
                  <p>Clique em cada etapa para ver os detalhes:</p>
                  <PresentationTimeline />
                </StepBlock>

                <StepBlock num="02" title="Comunicação não-verbal" forceOpen={exportMode}>
                  <div className="feature-card-grid">
                    {[
                      { icon: '👁️', title: 'Contato visual', desc: 'Distribua o olhar por toda a sala. Não fixe em um ponto — conecte-se com pessoas diferentes.', color: '#6788c2' },
                      { icon: '🚶', title: 'Postura', desc: 'De frente para o público, nunca de costas para a tela. Postura ereta transmite confiança.', color: '#22c55e' },
                      { icon: '🎙️', title: 'Voz', desc: 'Fale pausadamente. Velocidade alta denota nervosismo. Variação de ritmo mantém a atenção.', color: '#f97316' },
                      { icon: '🤝', title: 'Gesticulação', desc: 'Gestos naturais reforçam a fala. Mãos quietas e controladas passam mais profissionalismo.', color: '#a855f7' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card" style={{ borderLeft: `3px solid ${t.color}` }}>
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Checklist do dia da apresentação" forceOpen={exportMode}>
                  <StageChecklist
                    color="#6788c2"
                    items={[
                      'Chegue cedo e <strong>teste o equipamento</strong> (projetor, cabo, apresentador de slides)',
                      'Respire fundo antes de começar — dê uma pausa antes de falar',
                      'Fique <strong>de frente para o público</strong>, nunca de costas para a tela',
                      'Distribua o <strong>contato visual</strong> por toda a sala, não fixe em um ponto',
                      'Fale pausadamente e com clareza — velocidade alta denota nervosismo',
                      'Nas perguntas, <strong>ouça até o fim</strong> antes de começar a responder',
                    ]}
                  />
                  <InfoBox variant="tip" label="💡 LEMBRE-SE">
                    A banca avalia domínio do conteúdo e clareza na comunicação — não performance perfeita. Uma pausa para pensar é sinal de seriedade, não de fraqueza.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(6)}>← Módulo 5</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(8)}>⚡ Quiz Final →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 8: Quiz ── */}
          {(current === 8 || exportMode) && (
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
                      <p className="lead">{QUIZ.length} questões sobre apresentação científica. A explicação aparece após cada resposta.</p>

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
                            {score >= 7 && score <= 8 && 'Muito bem! Você entendeu os principais conceitos. Agora é hora de preparar sua apresentação! 🎉'}
                            {score >= 9 && 'Excelente! Você dominou o conteúdo. Está pronto para uma apresentação de sucesso! 🏆'}
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
                  <button className="btn-outline" onClick={() => goTo(7)}>← Módulo 6</button>
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
