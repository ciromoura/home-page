'use client'

import { useState } from 'react'
import LessonLayout from '@/components/features/LessonLayout'
import LessonSection from '@/components/features/LessonSection'
import StepBlock from '@/components/features/StepBlock'
import InfoBox from '@/components/features/InfoBox'

/* ─── Quiz data ─────────────────────────────────────────────── */
const QUIZ = [
  {
    q: '1. O que é Engenharia Social?',
    opts: [
      { t: 'Um ramo da engenharia civil para projetar cidades', c: false },
      { t: 'Técnica que explora emoções humanas para enganar e obter informações ou acesso', c: true },
      { t: 'Um software para gerenciar redes sociais', c: false },
      { t: 'Um vírus que se espalha pelas redes sociais', c: false },
    ],
    ok: 'Exato! Engenharia social é a manipulação psicológica de pessoas — usa emoções como medo e urgência para enganar, sem precisar de hacking técnico.',
    err: 'Não. Engenharia social é sobre manipulação humana, não tecnologia. Golpistas exploram emoções como urgência, medo e ganância.',
  },
  {
    q: '2. Qual é o principal indicador de um e-mail de phishing?',
    opts: [
      { t: 'O e-mail chega tarde da noite', c: false },
      { t: 'O remetente usa um endereço oficial da empresa', c: false },
      { t: 'Links com domínios mascarados ou ligeiramente diferentes do original', c: true },
      { t: 'O e-mail contém imagens coloridas', c: false },
    ],
    ok: 'Correto! Links falsos com domínios parecidos (ex: "bancobrasil-segurança.com" em vez de "bb.com.br") são o sinal clássico de phishing.',
    err: 'Errado. O principal sinal é o link ou domínio falsificado. Sempre passe o mouse sobre links antes de clicar para ver o endereço real.',
  },
  {
    q: '3. O que significa "isca" no contexto de phishing?',
    opts: [
      { t: 'O servidor que hospeda o site falso', c: false },
      { t: 'O conteúdo falso (e-mail, mensagem, site) usado para atrair a vítima', c: true },
      { t: 'O programa antivírus que protege o usuário', c: false },
      { t: 'A senha roubada do usuário', c: false },
    ],
    ok: 'Perfeito! A isca é o conteúdo enganoso — um e-mail falso, mensagem ou site — projetado para atrair a vítima a entregar dados.',
    err: 'Incorreto. Phishing vem de "fishing" (pescar). A isca é o conteúdo falso que atrai a vítima: e-mails, mensagens ou sites fraudulentos.',
  },
  {
    q: '4. Um e-mail diz: "Sua conta será bloqueada em 24 horas. Clique aqui para verificar!" Isso é um exemplo de:',
    opts: [
      { t: 'Notificação legítima de segurança do banco', c: false },
      { t: 'Uso do gatilho de urgência — técnica comum de phishing', c: true },
      { t: 'Spam publicitário inofensivo', c: false },
      { t: 'Aviso do sistema operacional', c: false },
    ],
    ok: 'Correto! "Prazo de 24 horas" é um gatilho de urgência clássico. Golpistas criam pressão para que a vítima aja sem pensar.',
    err: 'Errado. Prazos artificiais ("24 horas para bloqueio") são gatilhos emocionais usados por golpistas para impedir que a vítima pense criticamente.',
  },
  {
    q: '5. Qual é o principal risco de instalar aplicativos fora das lojas oficiais?',
    opts: [
      { t: 'O aplicativo pode ser mais lento', c: false },
      { t: 'O aplicativo pode conter malware sem verificação de segurança', c: true },
      { t: 'O celular pode ficar sem espaço', c: false },
      { t: 'O aplicativo pode não ter interface em português', c: false },
    ],
    ok: 'Exato! Apps fora da Google Play ou App Store não passam por verificação de segurança e podem conter trojans, spyware ou ransomware.',
    err: 'Incorreto. O principal risco é malware oculto. Lojas oficiais verificam apps antes de publicar; APKs de fontes desconhecidas não têm essa proteção.',
  },
  {
    q: '6. Qual desses sintomas pode indicar infecção por malware no celular?',
    opts: [
      { t: 'A bateria dura mais que o normal', c: false },
      { t: 'O celular fica mais frio que o usual', c: false },
      { t: 'Mensagens sendo enviadas automaticamente sem autorização', c: true },
      { t: 'A tela fica mais brilhante', c: false },
    ],
    ok: 'Correto! Envio automático de mensagens, lentidão extrema e consumo anormal de dados são sinais clássicos de malware ativo no dispositivo.',
    err: 'Errado. Mensagens enviadas sem sua autorização é um sinal grave de comprometimento. Outros sinais: lentidão, travamentos, consumo excessivo de dados.',
  },
  {
    q: '7. O que é Autenticação em Dois Fatores (2FA)?',
    opts: [
      { t: 'Usar duas senhas diferentes para a mesma conta', c: false },
      { t: 'Um segundo método de verificação além da senha — como um código por SMS ou aplicativo', c: true },
      { t: 'Fazer login em dois dispositivos ao mesmo tempo', c: false },
      { t: 'Ter duas contas no mesmo serviço', c: false },
    ],
    ok: 'Perfeito! O 2FA adiciona uma segunda camada — mesmo que alguém roube sua senha, precisaria do código temporário para acessar sua conta.',
    err: 'Incorreto. 2FA é um segundo fator de verificação além da senha: um código via SMS, app autenticador (Google Authenticator) ou biometria.',
  },
  {
    q: '8. Por que é importante usar senhas diferentes para cada serviço?',
    opts: [
      { t: 'Para dificultar lembrar as senhas', c: false },
      { t: 'Se uma senha vazar, as outras contas ficam protegidas', c: true },
      { t: 'Porque os servidores exigem senhas diferentes', c: false },
      { t: 'Para treinar a memória', c: false },
    ],
    ok: 'Exato! Se você usa a mesma senha em tudo e ela vazar em um site, o golpista acessa todas as suas contas. Senhas únicas limitam o dano.',
    err: 'Errado. Com senhas iguais, um vazamento compromete todas as contas. Senhas únicas garantem que um incidente não domine tudo. Use um gerenciador de senhas!',
  },
  {
    q: '9. Qual é a primeira atitude após perceber que foi vítima de golpe bancário?',
    opts: [
      { t: 'Postar sobre o ocorrido nas redes sociais', c: false },
      { t: 'Esperar para ver se o problema se resolve sozinho', c: false },
      { t: 'Ligar imediatamente para o banco para bloquear cartões e conta', c: true },
      { t: 'Formatar o computador primeiro', c: false },
    ],
    ok: 'Correto! Contato imediato com o banco limita o dano financeiro. Depois: registre boletim de ocorrência e altere senhas de outras contas.',
    err: 'Incorreto. A urgência é financeira primeiro. Ligue para o banco para bloquear transações. Cada minuto conta para evitar mais prejuízo.',
  },
  {
    q: '10. Qual é a melhor prática ao receber um link por WhatsApp, mesmo de um contato conhecido?',
    opts: [
      { t: 'Clicar imediatamente pois é de alguém de confiança', c: false },
      { t: 'Ignorar todas as mensagens com links', c: false },
      { t: 'Parar, verificar o domínio do link e confirmar com o contato antes de clicar', c: true },
      { t: 'Encaminhar para outros para verem primeiro', c: false },
    ],
    ok: 'Perfeito! Contatos conhecidos também são vítimas e reencaminham golpes sem saber. Sempre verifique o domínio e confirme com a pessoa antes de clicar.',
    err: 'Errado. Contas de amigos e familiares são frequentemente hackeadas para enviar golpes. Sempre "pare e pense" antes de clicar em qualquer link.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Engenharia Social', 'Phishing', 'Malware', 'Proteção', 'Recuperação', 'Quiz']

/* ─── Animated Shield Illustration ─────────────────────────── */
function ShieldIllustration() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '2rem 0',
      position: 'relative',
    }}>
      <div style={{
        fontSize: '5rem',
        animation: 'float 3s ease-in-out infinite',
        filter: 'drop-shadow(0 8px 24px rgba(103,136,194,0.4))',
        position: 'relative',
        zIndex: 2,
      }}>🛡️</div>
      {/* Orbit ring */}
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        border: '2px dashed rgba(103,136,194,0.3)',
        borderRadius: '50%',
        animation: 'spin 8s linear infinite',
      }}>
        <span style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '1rem' }}>🔒</span>
      </div>
      <div style={{
        position: 'absolute',
        width: '170px',
        height: '170px',
        border: '2px dashed rgba(108,99,255,0.2)',
        borderRadius: '50%',
        animation: 'spin 12s linear infinite reverse',
      }}>
        <span style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '1rem' }}>🔑</span>
      </div>
    </div>
  )
}

/* ─── Phishing Email Demo ───────────────────────────────────── */
function PhishingEmailDemo() {
  const [revealed, setRevealed] = useState(false)
  return (
    <div style={{
      border: '1px solid var(--border-color, rgba(103,136,194,0.2))',
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '1.5rem 0',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Email header bar */}
      <div style={{
        background: 'rgba(239,68,68,0.1)',
        borderBottom: '1px solid rgba(239,68,68,0.2)',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#dc2626',
        letterSpacing: '0.05em',
      }}>
        <span>⚠️</span> E-MAIL SUSPEITO — ANÁLISE EDUCATIVA
      </div>
      {/* Email content */}
      <div style={{ padding: '1.2rem 1.5rem' }}>
        <div style={{ marginBottom: '0.8rem', fontSize: '0.85rem', opacity: 0.7 }}>
          <div><strong>De:</strong> <span style={{ color: '#dc2626' }}>seguranca@banco-brasil-verificacao.com</span></div>
          <div><strong>Para:</strong> cliente@email.com</div>
          <div><strong>Assunto:</strong> 🚨 URGENTE: Sua conta será bloqueada em 24 horas!</div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(103,136,194,0.15)', margin: '0.8rem 0' }} />
        <div style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
          <p>Prezado(a) cliente,</p>
          <p>Detectamos <strong>atividade suspeita</strong> em sua conta. Para evitar o bloqueio imediato, você deve verificar seus dados <strong style={{ color: '#dc2626' }}>nas próximas 24 horas</strong>.</p>
          <p>
            Clique no link abaixo para verificar sua conta:
            <br />
            <span style={{
              display: 'inline-block',
              marginTop: '0.4rem',
              padding: '0.3rem 0.8rem',
              background: 'rgba(239,68,68,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(239,68,68,0.3)',
              cursor: 'default',
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              color: '#dc2626',
            }}>
              https://banco-brasil-verificacao.com/seguranca
            </span>
          </p>
          <p style={{ opacity: 0.7, fontSize: '0.8rem' }}>Banco do Brasil S.A. — Central de Segurança</p>
        </div>
      </div>
      {/* Reveal analysis button */}
      <div style={{ padding: '0 1.5rem 1.2rem' }}>
        <button
          className="btn-primary"
          style={{ fontSize: '0.82rem', padding: '0.5rem 1.2rem' }}
          onClick={() => setRevealed(r => !r)}
        >
          {revealed ? '▲ Ocultar análise' : '🔍 Revelar os sinais de golpe'}
        </button>
        {revealed && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: '🔴', label: 'Domínio falso', desc: '"banco-brasil-verificacao.com" não é o site oficial. O real é "bb.com.br".' },
              { icon: '🔴', label: 'Urgência artificial', desc: '"24 horas para bloqueio" — pressão emocional para impedir o pensamento crítico.' },
              { icon: '🔴', label: 'Saudação genérica', desc: '"Prezado(a) cliente" em vez de seu nome real — o golpista não te conhece.' },
              { icon: '🟡', label: 'Link diferente do texto', desc: 'O link exibido pode mascarar um endereço completamente diferente.' },
              { icon: '🟢', label: 'O que fazer', desc: 'Não clique. Entre direto no site pelo seu navegador ou ligue para o banco.' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.6rem 0.9rem',
                borderRadius: '8px',
                background: item.icon === '🔴' ? 'rgba(239,68,68,0.07)' : item.icon === '🟡' ? 'rgba(251,191,36,0.07)' : 'rgba(34,197,94,0.07)',
                border: `1px solid ${item.icon === '🔴' ? 'rgba(239,68,68,0.2)' : item.icon === '🟡' ? 'rgba(251,191,36,0.2)' : 'rgba(34,197,94,0.2)'}`,
                fontSize: '0.82rem',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                <div>
                  <strong>{item.label}:</strong> {item.desc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Malware type cards ────────────────────────────────────── */
function MalwareCard({ icon, name, desc, color }: { icon: string; name: string; desc: string; color: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{
        cursor: 'pointer',
        borderRadius: '12px',
        padding: '1.2rem',
        background: flipped ? `${color}18` : 'var(--glass-bg)',
        border: `1px solid ${flipped ? color : 'rgba(103,136,194,0.15)'}`,
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(6px)',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '2rem', transition: 'transform 0.3s', transform: flipped ? 'scale(0.8)' : 'scale(1)' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</div>
      {flipped && <div style={{ fontSize: '0.78rem', opacity: 0.75, lineHeight: 1.5 }}>{desc}</div>}
      {!flipped && <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>toque para saber mais</div>}
    </div>
  )
}

/* ─── Password strength meter ───────────────────────────────── */
function PasswordDemo() {
  const [pwd, setPwd] = useState('')
  const score = (() => {
    let s = 0
    if (pwd.length >= 8) s++
    if (pwd.length >= 12) s++
    if (/[A-Z]/.test(pwd)) s++
    if (/[0-9]/.test(pwd)) s++
    if (/[^A-Za-z0-9]/.test(pwd)) s++
    return s
  })()
  const levels = [
    { label: 'Muito fraca', color: '#ef4444' },
    { label: 'Fraca', color: '#f97316' },
    { label: 'Regular', color: '#eab308' },
    { label: 'Boa', color: '#22c55e' },
    { label: 'Forte', color: '#16a34a' },
    { label: 'Excelente! 🔒', color: '#15803d' },
  ]
  const level = levels[Math.min(score, 5)]
  return (
    <div style={{ margin: '1.5rem 0', padding: '1.2rem', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid rgba(103,136,194,0.15)' }}>
      <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>🔐 Teste a força da sua senha (simulação — não use senhas reais)</p>
      <input
        type="text"
        value={pwd}
        onChange={e => setPwd(e.target.value)}
        placeholder="Digite uma senha de exemplo..."
        style={{
          width: '100%',
          padding: '0.6rem 0.9rem',
          borderRadius: '8px',
          border: '1px solid rgba(103,136,194,0.3)',
          background: 'var(--glass-bg)',
          color: 'var(--text-color)',
          fontSize: '0.9rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {pwd.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '0.4rem' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: i < score ? level.color : 'rgba(103,136,194,0.15)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: level.color }}>{level.label}</div>
          <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {[
              { label: '≥ 8 chars', ok: pwd.length >= 8 },
              { label: '≥ 12 chars', ok: pwd.length >= 12 },
              { label: 'Maiúsculas', ok: /[A-Z]/.test(pwd) },
              { label: 'Números', ok: /[0-9]/.test(pwd) },
              { label: 'Símbolos', ok: /[^A-Za-z0-9]/.test(pwd) },
            ].map((c, i) => (
              <span key={i} style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: c.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${c.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`,
                color: c.ok ? '#16a34a' : '#dc2626',
              }}>
                {c.ok ? '✓' : '✗'} {c.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Recovery checklist ────────────────────────────────────── */
function RecoveryChecklist() {
  const steps = [
    { icon: '🏦', title: 'Notifique o banco', desc: 'Ligue imediatamente para bloquear cartões, conta e transações suspeitas.' },
    { icon: '🔑', title: 'Troque as senhas', desc: 'Altere senhas de todos os serviços importantes: e-mail, redes sociais, bancos.' },
    { icon: '📲', title: 'Revogue sessões ativas', desc: 'Nas configurações de cada conta, encerre todos os acessos ativos desconhecidos.' },
    { icon: '🛡️', title: 'Ative o 2FA', desc: 'Agora que perdeu o acesso, ative autenticação em dois fatores em tudo.' },
    { icon: '📋', title: 'Registre boletim de ocorrência', desc: 'Vá a uma delegacia ou use o portal da polícia civil do seu estado.' },
    { icon: '🔍', title: 'Verifique dispositivos', desc: 'Escaneie com antivírus confiável e, se necessário, restaure o factory reset.' },
  ]
  const [checked, setChecked] = useState<boolean[]>(Array(steps.length).fill(false))
  const done = checked.filter(Boolean).length

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6 }}>CHECKLIST DE RECUPERAÇÃO</span>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          padding: '0.2rem 0.7rem',
          borderRadius: '20px',
          background: done === steps.length ? 'rgba(34,197,94,0.15)' : 'rgba(103,136,194,0.1)',
          color: done === steps.length ? '#16a34a' : 'var(--text-color)',
          border: `1px solid ${done === steps.length ? 'rgba(34,197,94,0.3)' : 'rgba(103,136,194,0.2)'}`,
        }}>
          {done}/{steps.length} concluídos
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            onClick={() => setChecked(c => { const n = [...c]; n[i] = !n[i]; return n })}
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '0.9rem 1.1rem',
              borderRadius: '10px',
              background: checked[i] ? 'rgba(34,197,94,0.08)' : 'var(--glass-bg)',
              border: `1px solid ${checked[i] ? 'rgba(34,197,94,0.25)' : 'rgba(103,136,194,0.15)'}`,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              alignItems: 'flex-start',
              userSelect: 'none',
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              border: `2px solid ${checked[i] ? '#22c55e' : 'rgba(103,136,194,0.3)'}`,
              background: checked[i] ? '#22c55e' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
              fontSize: '0.75rem',
              color: 'white',
              fontWeight: 700,
              transition: 'all 0.25s ease',
            }}>
              {checked[i] && '✓'}
            </div>
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: checked[i] ? 'line-through' : 'none',
                opacity: checked[i] ? 0.5 : 1,
                transition: 'all 0.25s',
              }}>
                {step.icon} {step.title}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '2px' }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main component ────────────────────────────────────────── */
export default function EducacaoDigitalSegurancaPage() {
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
                <div className="pabd-hero-badge">EDUCAÇÃO DIGITAL · SEGURANÇA</div>
                <h1>
                  Proteja-se dos<br />
                  <span className="accent-text">Golpes Digitais</span>
                </h1>
                <ShieldIllustration />
                <p>
                  Engenharia social, phishing, malware e como se defender. Entenda como os golpistas pensam e aprenda a proteger sua vida digital.
                </p>
                <div className="pabd-hero-cta">
                  <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Começar Aula</button>
                  <button className="btn-outline btn-pabd" onClick={() => goTo(7)}>⚡ Ir ao Quiz</button>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '2.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                  {[
                    { num: '90%', label: 'dos ataques usam engenharia social', color: '#ef4444' },
                    { num: '3,4 bi', label: 'e-mails de phishing por dia', color: '#f97316' },
    		            { num: '6', label: 'módulos para dominar a segurança', color: '#6788c2' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: '1 1 130px',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(103,136,194,0.15)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.num}</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: '4px' }}>{s.label}</div>
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
                <p className="lead">Cinco módulos para entender os perigos digitais e como se defender deles.</p>

                <div className="toc-progress-row">
                  <span>PROGRESSO</span>
                  <div className="toc-progress-bar">
                    <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4,5,6].includes(v)).length / 5) * 100}%` }} />
                  </div>
                  <span>{visited.filter(v => [2,3,4,5,6].includes(v)).length} / 5</span>
                </div>

                <div className="toc-grid">
                  {[
                    { n: 2, num: '01', icon: '🧠', title: 'Engenharia Social', desc: 'Como golpistas manipulam emoções humanas' },
                    { n: 3, num: '02', icon: '🎣', title: 'Phishing', desc: 'Identificar iscas e links falsos' },
                    { n: 4, num: '03', icon: '🦠', title: 'Malware', desc: 'Vírus, trojans, spyware e ransomware' },
                    { n: 5, num: '04', icon: '🔒', title: 'Proteção Prática', desc: '2FA, senhas únicas e pensamento crítico' },
                    { n: 6, num: '05', icon: '🚑', title: 'Recuperação', desc: 'O que fazer após ser vítima de golpe' },
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

          {/* ── Section 2: Engenharia Social ── */}
          {(current === 2 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 01</div>
                  <h2>🧠 Engenharia <span className="accent-text">Social</span></h2>
                  <p className="lead">
                    A maioria dos ataques digitais não começa com código — começa com uma mentira bem contada. Engenharia social é a arte de manipular pessoas para que revelem informações ou tomem ações prejudiciais.
                  </p>

                  {/* Emotion triggers visual */}
                  <div className="chapter-divider">OS 4 GATILHOS EMOCIONAIS</div>
                  <div className="feature-card-grid">
                    {[
                      { icon: '⏰', title: 'Urgência', desc: '"Sua conta será bloqueada em 24h!" — pressão de tempo para impedir a reflexão.', color: '#ef4444' },
                      { icon: '😨', title: 'Medo', desc: '"Detectamos um vírus no seu celular!" — ameaça que paralisa o raciocínio crítico.', color: '#f97316' },
                      { icon: '🤑', title: 'Ganância', desc: '"Você ganhou R$5.000!" — promessa irreal que nubla o bom senso.', color: '#eab308' },
                      { icon: '🤝', title: 'Confiança', desc: '"Sou do suporte do banco" — autoridade falsa que gera obediência automática.', color: '#6788c2' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card" style={{ borderLeft: `3px solid ${t.color}` }}>
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <StepBlock num="01" title="Como a manipulação funciona" defaultOpen forceOpen={exportMode}>
                  <p>O golpista segue um roteiro previsível. Entender o padrão é a melhor defesa:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                    {[
                      { step: '1', icon: '🎯', title: 'Escolha da vítima', desc: 'O golpista pesquisa a vítima em redes sociais para criar uma abordagem personalizada.' },
                      { step: '2', icon: '🎭', title: 'Criação de pretexto', desc: 'Cria uma história falsa convincente: bancário, suporte técnico, entregador, familiar.' },
                      { step: '3', icon: '⚡', title: 'Ativação do gatilho', desc: 'Usa urgência, medo ou ganância para fazer a vítima agir sem pensar.' },
                      { step: '4', icon: '💰', title: 'Extração da informação', desc: 'Pede senhas, códigos de verificação, fotos de documentos ou transferências.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '0.9rem 1.1rem',
                        borderRadius: '10px',
                        background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)',
                        alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--accent-color)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}>{s.step}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.icon} {s.title}</div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.65, marginTop: '2px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="warn" label="⚠️ REGRA DE OURO">
                    <strong>Nenhuma instituição legítima</strong> — banco, governo, operadora — pede senha, código SMS ou fotos de documentos por telefone, WhatsApp ou e-mail.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="O antídoto: Pare e Pense" forceOpen={exportMode}>
                  <p>A resposta emocional é exatamente o que o golpista quer. O antídoto é simples:</p>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    margin: '1rem 0',
                    flexWrap: 'wrap',
                  }}>
                    {[
                      { icon: '🛑', label: 'PARE', desc: 'Respire. Não tome nenhuma ação imediata.', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
                      { icon: '🤔', label: 'PENSE', desc: 'Por que essa mensagem cria pressão? Quem realmente se beneficia?', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
                      { icon: '✅', label: 'VERIFIQUE', desc: 'Entre em contato pela via oficial. Nunca pelo link recebido.', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
                    ].map((c, i) => (
                      <div key={i} style={{
                        flex: '1 1 150px',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{c.icon}</div>
                        <div style={{ fontWeight: 800, letterSpacing: '0.05em', fontSize: '0.9rem' }}>{c.label}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '4px' }}>{c.desc}</div>
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

          {/* ── Section 3: Phishing ── */}
          {(current === 3 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 02</div>
                  <h2>🎣 Phishing — <span className="accent-text">A Pesca de Dados</span></h2>
                  <p className="lead">
                    Phishing (do inglês <em>fishing</em>, pescar) é quando golpistas lançam &quot;iscas&quot; digitais — e-mails, SMS ou sites falsos — para capturar seus dados pessoais e financeiros.
                  </p>
                </div>

                <StepBlock num="01" title="Anatomia de um e-mail falso" defaultOpen forceOpen={exportMode}>
                  <p>Analise o e-mail abaixo. Consegue identificar os sinais de golpe <strong>antes</strong> de revelar a análise?</p>
                  <PhishingEmailDemo />
                </StepBlock>

                <StepBlock num="02" title="Tipos de isca" forceOpen={exportMode}>
                  <div className="feature-card-grid">
                    {[
                      { icon: '📧', title: 'E-mail Phishing', desc: 'E-mails falsos imitando bancos, Receita Federal, Correios ou empresas conhecidas.' },
                      { icon: '📱', title: 'Smishing (SMS)', desc: 'Mensagens de texto com links falsos. "Seu pacote foi retido, clique para liberar."' },
                      { icon: '📞', title: 'Vishing (Voz)', desc: 'Ligações de "bancários", "policiais" ou "suporte técnico" pedindo dados.' },
                      { icon: '💬', title: 'WhatsApp Clone', desc: 'Conta clonada de familiar pedindo dinheiro urgente via PIX.' },
                      { icon: '🌐', title: 'Site Falso', desc: 'Cópia visual de um site legítimo com URL ligeiramente diferente.' },
                      { icon: '🎁', title: 'Phishing de Promoção', desc: '"Parabéns! Você ganhou. Clique aqui para resgatar." — promessas impossíveis.' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card">
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Como verificar um link antes de clicar" forceOpen={exportMode}>
                  <p>Nunca clique diretamente. Aprenda a inspecionar:</p>
                  <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { icon: '🖱️', action: 'Passe o mouse sobre o link', result: 'O endereço real aparece na barra inferior do navegador' },
                      { icon: '📋', action: 'Copie e cole em bloco de notas', result: 'Veja o endereço completo sem clicar' },
                      { icon: '🔍', action: 'Verifique o domínio principal', result: '"banco-brasil-seguranca.com" ≠ "bb.com.br"' },
                      { icon: '🔒', action: 'Procure o cadeado HTTPS', result: 'Cadeado = comunicação criptografada. Mas não garante que o site é legítimo!' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '0.8rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.action}</div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: '2px' }}>{s.result}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="tip" label="💡 DICA">
                    Em vez de clicar no link do e-mail, <strong>abra uma nova aba</strong> e acesse o site da empresa digitando o endereço diretamente na barra de endereços.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Módulo 3 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 4: Malware ── */}
          {(current === 4 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 03</div>
                  <h2>🦠 Malware — <span className="accent-text">Software Malicioso</span></h2>
                  <p className="lead">
                    Malware é qualquer software projetado para causar dano, roubar dados ou assumir controle de dispositivos sem o consentimento do usuário.
                  </p>
                </div>

                <StepBlock num="01" title="Tipos de malware" defaultOpen forceOpen={exportMode}>
                  <p>Toque em cada card para saber mais sobre cada tipo:</p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    margin: '1rem 0',
                  }}>
                    <MalwareCard icon="🐴" name="Trojan" color="#ef4444" desc="Disfarçado de app legítimo. Abre uma 'porta traseira' no dispositivo para o atacante." />
                    <MalwareCard icon="🔐" name="Ransomware" color="#f97316" desc="Criptografa seus arquivos e exige pagamento (resgate) para devolvê-los." />
                    <MalwareCard icon="👁️" name="Spyware" color="#a855f7" desc="Monitora suas atividades, captura senhas e dados sem você perceber." />
                    <MalwareCard icon="🤖" name="Bot" color="#6788c2" desc="Transforma seu dispositivo em um 'zumbi' controlado remotamente para ataques." />
                    <MalwareCard icon="📢" name="Adware" color="#eab308" desc="Exibe anúncios indesejados e pode rastrear seus hábitos de navegação." />
                    <MalwareCard icon="🪱" name="Worm" color="#22c55e" desc="Se auto-replica e se espalha pela rede sem precisar de ação do usuário." />
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Sinais de infecção" forceOpen={exportMode}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1rem 0' }}>
                    {[
                      { icon: '🐌', label: 'Lentidão extrema', desc: 'O dispositivo fica muito lento sem motivo aparente.', severity: 'alta' },
                      { icon: '🔋', label: 'Bateria descarregando rápido', desc: 'Processo malicioso em execução constante consome energia.', severity: 'alta' },
                      { icon: '📨', label: 'Mensagens enviadas sem autorização', desc: 'Contatos recebem mensagens ou links que você não enviou.', severity: 'alta' },
                      { icon: '💸', label: 'Consumo excessivo de dados', desc: 'Malware envia informações roubadas pelo plano de dados.', severity: 'media' },
                      { icon: '🔊', label: 'Apps abrindo sozinhos', desc: 'Aplicativos ou janelas surgem sem que você os abra.', severity: 'media' },
                      { icon: '🌡️', label: 'Dispositivo aquecendo', desc: 'Processamento em background por malware gera calor excessivo.', severity: 'baixa' },
                    ].map((s, i) => {
                      const c = s.severity === 'alta' ? '#ef4444' : s.severity === 'media' ? '#f97316' : '#eab308'
                      return (
                        <div key={i} style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          background: 'var(--glass-bg)',
                          border: `1px solid rgba(103,136,194,0.12)`,
                          borderLeft: `3px solid ${c}`,
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.label}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1px' }}>{s.desc}</div>
                          </div>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '20px',
                            background: `${c}18`,
                            color: c,
                            border: `1px solid ${c}40`,
                            whiteSpace: 'nowrap',
                          }}>
                            {s.severity === 'alta' ? '🔴 Alto' : s.severity === 'media' ? '🟠 Médio' : '🟡 Baixo'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Como o malware chega ao dispositivo" forceOpen={exportMode}>
                  <div className="feature-card-grid">
                    {[
                      { icon: '📦', title: 'Apps fora das lojas oficiais', desc: 'APKs baixados fora da Google Play ou App Store não passam por verificação.' },
                      { icon: '📎', title: 'Anexos de e-mail', desc: 'Arquivos .exe, .doc com macros ou .zip de remetentes desconhecidos.' },
                      { icon: '🔗', title: 'Links de phishing', desc: 'Um clique em link falso pode iniciar download automático de malware.' },
                      { icon: '📀', title: 'Mídias físicas', desc: 'Pen drives encontrados ou recebidos de fontes não confiáveis.' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card">
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="warn" label="⚠️ ATENÇÃO">
                    <strong>Somente instale apps das lojas oficiais:</strong> Google Play (Android) e App Store (iOS). Elas verificam e removem apps maliciosos ativamente.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Módulo 4 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 5: Proteção Prática ── */}
          {(current === 5 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 04</div>
                  <h2>🔒 Proteção <span className="accent-text">Prática</span></h2>
                  <p className="lead">
                    Segurança digital não é apenas sobre tecnologia — é sobre hábitos. Três práticas simples protegem 90% das ameaças.
                  </p>
                </div>

                <StepBlock num="01" title="Autenticação em Dois Fatores (2FA)" defaultOpen forceOpen={exportMode}>
                  <p>Mesmo que sua senha seja roubada, o 2FA impede o acesso:</p>

                  {/* 2FA flow visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                      { icon: '💻', label: 'Login + Senha', color: '#6788c2' },
                      { icon: '→', label: '', color: 'transparent' },
                      { icon: '📲', label: 'Código 2FA', color: '#22c55e' },
                      { icon: '→', label: '', color: 'transparent' },
                      { icon: '✅', label: 'Acesso liberado', color: '#16a34a' },
                    ].map((s, i) => (
                      s.label ? (
                        <div key={i} style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          background: `${s.color}15`,
                          border: `1px solid ${s.color}35`,
                          textAlign: 'center',
                          minWidth: '90px',
                        }}>
                          <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '4px', color: s.color }}>{s.label}</div>
                        </div>
                      ) : (
                        <div key={i} style={{ fontSize: '1.2rem', opacity: 0.4 }}>{s.icon}</div>
                      )
                    ))}
                  </div>

                  <div className="feature-card-grid">
                    {[
                      { icon: '📱', title: 'App Autenticador', desc: 'Google Authenticator ou Authy. Gera códigos offline. Mais seguro que SMS.' },
                      { icon: '💬', title: 'SMS', desc: 'Código enviado por mensagem de texto. Prático, mas vulnerável a SIM Swap.' },
                      { icon: '🔑', title: 'Chave de Segurança', desc: 'Dispositivo físico USB. Mais seguro de todos para contas críticas.' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card">
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="tip" label="💡 DICA">
                    Ative o 2FA em: e-mail (Gmail, Outlook), redes sociais, bancos e qualquer serviço com dados sensíveis. Priorize o app autenticador em vez do SMS.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="Senhas Únicas e Seguras" forceOpen={exportMode}>
                  <p>Reutilizar senhas é como ter uma chave que abre todas as portas. Se vazou em um lugar, está exposta em tudo.</p>
                  <PasswordDemo />
                  <div style={{ marginTop: '1rem' }}>
                    <p><strong>Boas práticas:</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {[
                        '✅ Use um gerenciador de senhas (Bitwarden, 1Password) — ele cria e lembra senhas únicas para cada site',
                        '✅ Mínimo 12 caracteres com letras, números e símbolos',
                        '✅ Nunca reutilize senhas entre serviços diferentes',
                        '❌ Nunca use: datas de aniversário, nomes de pets, sequências (123456, abcdef)',
                        '❌ Nunca salve senhas em bloco de notas ou planilhas sem criptografia',
                      ].map((item, i) => (
                        <div key={i} style={{
                          padding: '0.5rem 0.9rem',
                          borderRadius: '8px',
                          background: item.startsWith('✅') ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                          border: `1px solid ${item.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                          fontSize: '0.83rem',
                        }}>{item}</div>
                      ))}
                    </div>
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Pensamento Crítico como Escudo" forceOpen={exportMode}>
                  <div style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'var(--glass-bg)',
                    border: '1px solid rgba(103,136,194,0.15)',
                    margin: '1rem 0',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤔</div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
                      Antes de qualquer ação digital, pergunte-se:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', marginTop: '1rem' }}>
                      {[
                        'Eu estava esperando essa mensagem?',
                        'Quem realmente se beneficia se eu agir agora?',
                        'Há pressão de tempo artificial aqui?',
                        'Consigo verificar pela via oficial sem usar esse link?',
                        'Uma instituição legítima realmente pediria isso?',
                      ].map((q, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          gap: '0.75rem',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '8px',
                          background: 'rgba(103,136,194,0.06)',
                          border: '1px solid rgba(103,136,194,0.12)',
                          fontSize: '0.83rem',
                          alignItems: 'center',
                        }}>
                          <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>?</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                  <InfoBox variant="tip" label="💡 PRINCÍPIO">
                    Urgência é o inimigo do pensamento crítico. Quando sentir pressão para agir <em>agora</em>, é exatamente quando você precisa <strong>desacelerar</strong>.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(4)}>← Módulo 3</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(6)}>Módulo 5 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 6: Recuperação ── */}
          {(current === 6 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 05</div>
                  <h2>🚑 Resiliência e <span className="accent-text">Recuperação</span></h2>
                  <p className="lead">
                    Mesmo com todas as precauções, incidentes acontecem. O que diferencia quem sofre grandes perdas de quem se recupera rapidamente é a velocidade e a ordem das ações.
                  </p>
                </div>

                <StepBlock num="01" title="Aja imediatamente — cada minuto conta" defaultOpen forceOpen={exportMode}>
                  <p>Use o checklist interativo abaixo. Marque cada etapa ao concluir:</p>
                  <RecoveryChecklist />
                </StepBlock>

                <StepBlock num="02" title="Canais oficiais de denúncia" forceOpen={exportMode}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1rem 0' }}>
                    {[
                      { icon: '🏦', title: 'Golpe bancário / PIX', desc: 'Ligue para o banco (número no verso do cartão ou app oficial). Registre B.O. na delegacia.' },
                      { icon: '👮', title: 'Delegacia de Crimes Cibernéticos', desc: 'Muitos estados têm delegacias especializadas. Procure "DRCI" + nome do seu estado.' },
                      { icon: '📱', title: 'Conta de rede social clonada', desc: 'Use o formulário de denúncia da própria plataforma (Instagram, Facebook, WhatsApp).' },
                      { icon: '🏛️', title: 'Procon / Consumidor.gov.br', desc: 'Para fraudes em compras online ou serviços digitais.' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '0.9rem 1.1rem',
                        borderRadius: '10px',
                        background: 'var(--glass-bg)',
                        border: '1px solid rgba(103,136,194,0.12)',
                        alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{s.title}</div>
                          <div style={{ fontSize: '0.78rem', opacity: 0.65, marginTop: '2px' }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StepBlock>

                <StepBlock num="03" title="Como fortalecer a segurança após o incidente" forceOpen={exportMode}>
                  <p>Um incidente é uma oportunidade de revisar toda sua segurança digital:</p>
                  <div className="feature-card-grid">
                    {[
                      { icon: '🔐', title: 'Gerenciador de senhas', desc: 'Instale Bitwarden (gratuito) e migre todas as senhas para senhas únicas e fortes.' },
                      { icon: '📲', title: 'App autenticador', desc: 'Instale Google Authenticator ou Authy e ative 2FA em todos os serviços críticos.' },
                      { icon: '🛡️', title: 'Antivírus atualizado', desc: 'Mantenha antivírus ativo e realize varredura completa após qualquer suspeita.' },
                      { icon: '📚', title: 'Educação contínua', desc: 'Golpes evoluem. Mantenha-se informado e compartilhe conhecimento com família.' },
                    ].map((t, i) => (
                      <div key={i} className="feature-card">
                        <div className="card-icon">{t.icon}</div>
                        <h3>{t.title}</h3>
                        <p>{t.desc}</p>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="tip" label="💪 MENSAGEM FINAL">
                    <strong>Segurança digital é um processo, não um estado.</strong> Ninguém é 100% imune, mas quem se educa reduz drasticamente o risco. Você já deu o primeiro passo.
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
                      <p className="lead">{QUIZ.length} questões sobre segurança digital. A explicação aparece após cada resposta — use para aprender!</p>

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
                                  className={answered ? (opt.c ? 'quiz-opt correct' : answers[currentQ] === false && !opt.c ? 'quiz-opt' : 'quiz-opt') : 'quiz-opt'}
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
                            {score <= 4 && 'Continue estudando! Revise os módulos com calma — a segurança digital se aprende com prática. 💪'}
                            {score >= 5 && score <= 6 && 'Bom começo! Alguns conceitos ainda precisam de atenção. Revise os módulos e tente de novo. 📚'}
                            {score >= 7 && score <= 8 && 'Muito bem! Você absorveu bem o conteúdo. Compartilhe o que aprendeu com amigos e família! 🎉'}
                            {score >= 9 && 'Excelente! Você está preparado para enfrentar os desafios da segurança digital. Espalhe o conhecimento! 🏆'}
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
