'use client'

import { useState } from 'react'
import LessonLayout from '@/components/features/LessonLayout'
import LessonSection from '@/components/features/LessonSection'
import StepBlock from '@/components/features/StepBlock'
import CodeBlock from '@/components/features/CodeBlock'
import InfoBox from '@/components/features/InfoBox'

/* ─── Quiz data ─────────────────────────────────────────────── */
const QUIZ = [
  {
    q: '1. Qual tipo de relacionamento existe entre Aluno e Disciplina neste sistema?',
    opts: [
      { t: 'Um para Um (1:1) — cada aluno pertence a exatamente uma disciplina', c: false },
      { t: 'Um para Muitos (1:N) — uma disciplina tem vários alunos, mas cada aluno só pode estar em uma', c: false },
      { t: 'Muitos para Muitos (N:N) — um aluno pode estar em várias disciplinas e cada disciplina pode ter vários alunos', c: true },
      { t: 'Não há relacionamento — são entidades completamente independentes', c: false },
    ],
    ok: 'Correto! O relacionamento N:N é implementado pela entidade Matrícula, que conecta alunos a disciplinas e permite que ambos os lados tenham múltiplos relacionamentos.',
    err: 'Incorreto. O sistema usa N:N: um aluno pode estar matriculado em N disciplinas e uma disciplina pode ter N alunos. A tabela de junção é a Matrícula.',
  },
  {
    q: '2. O que representa a entidade Matrícula neste sistema?',
    opts: [
      { t: 'Um registro de notas do aluno', c: false },
      { t: 'A entidade de junção que implementa o relacionamento N:N entre Aluno e Disciplina', c: true },
      { t: 'Um tipo especial de infração', c: false },
      { t: 'Uma subclasse de Aluno', c: false },
    ],
    ok: 'Exato! A Matrícula é a entidade de junção (join table) que implementa o N:N armazenando aluno_id e disciplina_id. Sem ela, não seria possível representar que um aluno pertence a várias disciplinas.',
    err: 'Errado. A Matrícula existe para implementar o N:N entre Alunos e Disciplinas. Ela guarda os IDs das duas entidades ligando-as.',
  },
  {
    q: '3. Qual código de status HTTP é retornado ao tentar matricular um aluno que já está matriculado na mesma disciplina?',
    opts: [
      { t: '200 OK', c: false },
      { t: '404 Not Found', c: false },
      { t: '409 Conflict', c: true },
      { t: '422 Unprocessable Entity', c: false },
    ],
    ok: 'Correto! 409 Conflict indica conflito de estado — o recurso já existe. É o código semântico correto para duplicidade, diferente do 422 que indica dados malformados.',
    err: 'Incorreto. 409 Conflict é o status adequado para duplicidade de recurso. 422 é para dados inválidos, 404 para não encontrado, e 200 seria sucesso.',
  },
  {
    q: '4. Para que servem as funções auxiliares <code>encontrar_aluno()</code> e <code>encontrar_disciplina()</code>?',
    opts: [
      { t: 'Para fazer consultas SQL no banco de dados', c: false },
      { t: 'Para centralizar a lógica de busca por ID e lançar 404 automaticamente, evitando código repetido', c: true },
      { t: 'Para validar os dados de entrada com Pydantic', c: false },
      { t: 'Para converter modelos Python em JSON', c: false },
    ],
    ok: 'Perfeito! As helpers centralizam a lógica de busca: se o ID for encontrado, retornam o objeto; se não, lançam HTTPException 404. Isso evita duplicar o mesmo for loop em múltiplos endpoints.',
    err: 'Errado. As funções helpers centralizam a busca por ID, retornando o objeto encontrado ou levantando HTTPException 404 — eliminando código duplicado nos endpoints de matrícula e infração.',
  },
  {
    q: '5. O modelo <code>Infracao</code> tem um campo <code>data</code> que não está em <code>InfracaoEntrada</code>. Como ele é preenchido?',
    opts: [
      { t: 'O cliente envia a data no body da requisição', c: false },
      { t: 'É gerado automaticamente pelo servidor com <code>datetime.now().isoformat()</code> no momento do registro', c: true },
      { t: 'Fica sempre com valor None até ser atualizado', c: false },
      { t: 'É gerado pelo FastAPI automaticamente', c: false },
    ],
    ok: 'Correto! A data é gerada pelo servidor no momento do POST, assim como o UUID. O cliente não precisa informá-la, garantindo que o timestamp seja confiável.',
    err: 'Incorreto. A data é gerada pelo servidor com datetime.now().isoformat() no endpoint POST, não pelo cliente. Assim como o id, é responsabilidade do servidor, não do cliente.',
  },
  {
    q: '6. Qual endpoint retorna todas as disciplinas em que um aluno específico está matriculado?',
    opts: [
      { t: 'GET /disciplinas', c: false },
      { t: 'GET /matriculas/{aluno_id}', c: false },
      { t: 'GET /alunos/{id}/disciplinas', c: true },
      { t: 'GET /disciplinas?aluno={id}', c: false },
    ],
    ok: 'Correto! O padrão REST /alunos/{id}/disciplinas representa "as disciplinas do aluno X". É uma rota aninhada que segue a convenção de recursos relacionados.',
    err: 'Errado. A rota correta é GET /alunos/{id}/disciplinas. Este padrão aninhado é uma convenção REST para representar sub-recursos relacionados a um recurso pai.',
  },
  {
    q: '7. Quantas listas em memória o projeto utiliza para simular o banco de dados?',
    opts: [
      { t: '1 lista — uma única lista de dicionários', c: false },
      { t: '2 listas — alunos e disciplinas', c: false },
      { t: '3 listas — alunos, disciplinas e infrações', c: false },
      { t: '4 listas — alunos, disciplinas, matrículas e infrações', c: true },
    ],
    ok: 'Exato! São 4 listas: alunos_db, disciplinas_db, matriculas_db e infracoes_db. Cada entidade tem sua própria "tabela" em memória, refletindo uma estrutura relacional.',
    err: 'Incorreto. São 4 listas: alunos_db, disciplinas_db, matriculas_db (a junção N:N) e infracoes_db. A lista de matrículas é essencial para representar o N:N.',
  },
  {
    q: '8. O que acontece se você chamar <code>POST /infracoes</code> com um <code>aluno_id</code> que não existe?',
    opts: [
      { t: 'A infração é criada normalmente com o ID inválido', c: false },
      { t: 'O FastAPI retorna 422 automaticamente', c: false },
      { t: 'A função <code>encontrar_aluno()</code> levanta HTTPException 404 antes de criar a infração', c: true },
      { t: 'A infração é criada mas o campo aluno_id fica como null', c: false },
    ],
    ok: 'Correto! O endpoint de infração chama encontrar_aluno(dados.aluno_id) antes de criar o registro. Se o aluno não existir, a função lança 404 e nada é criado — garantindo integridade referencial.',
    err: 'Errado. A chamada a encontrar_aluno() no início do endpoint age como uma validação de integridade referencial: se o aluno não existe, lança 404 e a infração nunca é criada.',
  },
  {
    q: '9. Qual a diferença entre os modelos <code>AlunoEntrada</code> e <code>Aluno</code>?',
    opts: [
      { t: 'São idênticos — um é alias do outro', c: false },
      { t: 'AlunoEntrada é o schema que o cliente envia (sem id); Aluno herda AlunoEntrada e adiciona o campo id gerado pelo servidor', c: true },
      { t: 'Aluno é para GET e AlunoEntrada é para POST', c: false },
      { t: 'AlunoEntrada tem validação mais rígida de tipos', c: false },
    ],
    ok: 'Exato! O padrão de dois modelos separa entrada (o que o cliente envia) de saída (o que o servidor retorna). O id nunca é enviado pelo cliente — é responsabilidade do servidor.',
    err: 'Incorreto. AlunoEntrada define o que o cliente envia (sem id). Aluno herda AlunoEntrada e adiciona id — que é gerado pelo servidor com uuid4(). Dois modelos = separação clara de responsabilidades.',
  },
  {
    q: '10. Qual endpoint deve ser chamado para cancelar a matrícula de um aluno em uma disciplina?',
    opts: [
      { t: 'DELETE /alunos/{id}', c: false },
      { t: 'DELETE /disciplinas/{id}', c: false },
      { t: 'DELETE /matriculas/{id} passando o ID da matrícula', c: true },
      { t: 'PUT /alunos/{id}/disciplinas com body vazio', c: false },
    ],
    ok: 'Correto! Para cancelar a matrícula, deletamos o registro de junção pelo seu próprio id. Deletar o aluno ou a disciplina removeria o registro completo, não só o vínculo.',
    err: 'Errado. A matrícula é uma entidade própria com seu id. Para desfazer o vínculo aluno↔disciplina, deletamos o registro de matrícula pelo seu ID, não o aluno nem a disciplina.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Código Completo', 'Quiz']

/* ─── Main component ────────────────────────────────────────── */
export default function FastAPIAtividadePage() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(10).fill(null))
  const [quizFinished, setQuizFinished] = useState(false)
  const score = answers.filter(a => a === true).length

  function handleAnswer(correct: boolean) {
    if (answers[currentQ] !== null) return
    setAnswers(prev => { const n = [...prev]; n[currentQ] = correct; return n })
  }

  function nextQuestion() {
    if (currentQ < 9) setCurrentQ(q => q + 1)
    else setQuizFinished(true)
  }

  function restartQuiz() {
    setCurrentQ(0)
    setAnswers(Array(10).fill(null))
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
                <div className="pabd-hero-badge">ENSINO MÉDIO · PROGRAMAÇÃO WEB · ATIVIDADE PRÁTICA</div>
                <h1>
                  API Escolar com<br />
                  <span className="accent-text">Alunos</span>, <em>Disciplinas</em> &amp; Infrações
                </h1>
                <p>Aplique os conceitos de FastAPI construindo um sistema CRUD completo com relacionamento N:N entre entidades. Uma atividade real, com código real.</p>
                <div className="pabd-hero-cta">
                  <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Ver Atividade</button>
                  <button className="btn-outline btn-pabd" onClick={() => goTo(7)}>⚡ Ir ao Quiz</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 1: Sumário ── */}
          {(current === 1 || exportMode) && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">ÍNDICE</div>
                <h2>Sumário da <span className="accent-text">Atividade</span></h2>
                <p className="lead">Esta atividade expande o CRUD de tarefas para um sistema com três entidades interligadas: Alunos, Disciplinas e Infrações.</p>

                <div className="toc-progress-row">
                  <span>PROGRESSO</span>
                  <div className="toc-progress-bar">
                    <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4,5,6].includes(v)).length / 5) * 100}%` }} />
                  </div>
                  <span>{visited.filter(v => [2,3,4,5,6].includes(v)).length} / 5</span>
                </div>

                <div className="toc-grid">
                  {[
                    { n: 2, num: '01', title: 'Estrutura & Modelos',      desc: 'Configurar projeto, entidades, relacionamentos e modelos Pydantic' },
                    { n: 3, num: '02', title: 'CRUD de Alunos',           desc: 'POST, GET, PUT e DELETE para a entidade Aluno' },
                    { n: 4, num: '03', title: 'Disciplinas & Matrículas', desc: 'CRUD de Disciplinas e o vínculo N:N com Alunos' },
                    { n: 5, num: '04', title: 'CRUD de Infrações',        desc: 'Registrar, listar e remover infrações por aluno/disciplina' },
                    { n: 6, num: '05', title: 'Código Completo',          desc: 'main.py completo, execução do servidor e testes com curl' },
                  ].map(({ n, num, title, desc }) => (
                    <button key={n} className={`toc-card${visited.includes(n) ? ' visited' : ''}`} onClick={() => goTo(n)}>
                      <div className="toc-num">{num}</div>
                      <div className="toc-content"><h3>{title}</h3><p>{desc}</p></div>
                      <div className="toc-arrow">→</div>
                    </button>
                  ))}
                  <button className={`toc-card${visited.includes(7) ? ' visited' : ''}`} onClick={() => goTo(7)}>
                    <div className="toc-num quiz-num">⚡</div>
                    <div className="toc-content"><h3>Quiz Final</h3><p>10 questões para testar o que você aprendeu</p></div>
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

          {/* ── Section 2: Módulo 1 — Estrutura & Modelos ── */}
          {(current === 2 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 01</div>
                  <h2>Estrutura do Projeto &amp; <span className="accent-text">Modelos Pydantic</span></h2>
                  <p className="lead">Antes de escrever endpoints, precisamos entender quais entidades o sistema gerencia e como elas se relacionam.</p>

                  <div className="feature-card-grid">
                    <div className="feature-card"><div className="card-icon">🧑‍🎓</div><h3>Aluno</h3><p>Possui nome, matrícula e e-mail. Pode estar inscrito em N disciplinas.</p></div>
                    <div className="feature-card"><div className="card-icon">📚</div><h3>Disciplina</h3><p>Possui nome, código e descrição. Pode ter N alunos matriculados.</p></div>
                    <div className="feature-card"><div className="card-icon">🚨</div><h3>Infração</h3><p>Registra um incidente de um aluno em uma disciplina específica, com descrição, gravidade e data.</p></div>
                    <div className="feature-card"><div className="card-icon">🔗</div><h3>Matrícula</h3><p>Entidade de junção que implementa o N:N entre Aluno e Disciplina.</p></div>
                  </div>
                </div>

                {/* Diagrama de relacionamento */}
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">DIAGRAMA</div>
                  <h3 style={{ marginBottom: '0.75rem' }}>Relacionamento entre as entidades</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '1rem 0' }}>
                    {[
                      { icon: '🧑‍🎓', title: 'Aluno', fields: 'id, nome, matricula, email' },
                    ].map(e => (
                      <div key={e.title} style={{ padding: '14px 18px', borderRadius: '12px', background: 'color-mix(in srgb, #6366f1 10%, transparent)', border: '2px solid #6366f1', textAlign: 'center', minWidth: '140px' }}>
                        <div style={{ fontSize: '1.4rem' }}>{e.icon}</div>
                        <div style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.9rem', margin: '4px 0' }}>{e.title}</div>
                        <div style={{ fontSize: '0.62rem', opacity: 0.6, fontFamily: 'monospace' }}>{e.fields}</div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>N</div>
                      <div style={{ fontSize: '1.1rem', color: '#f59e0b', fontWeight: 700 }}>↔</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>N</div>
                    </div>
                    <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'color-mix(in srgb, #f59e0b 10%, transparent)', border: '2px solid #f59e0b', textAlign: 'center', minWidth: '140px' }}>
                      <div style={{ fontSize: '1.4rem' }}>🔗</div>
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem', margin: '4px 0' }}>Matrícula</div>
                      <div style={{ fontSize: '0.62rem', opacity: 0.6, fontFamily: 'monospace' }}>id, aluno_id, disciplina_id</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>N</div>
                      <div style={{ fontSize: '1.1rem', color: '#f59e0b', fontWeight: 700 }}>↔</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>N</div>
                    </div>
                    <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'color-mix(in srgb, #10b981 10%, transparent)', border: '2px solid #10b981', textAlign: 'center', minWidth: '140px' }}>
                      <div style={{ fontSize: '1.4rem' }}>📚</div>
                      <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem', margin: '4px 0' }}>Disciplina</div>
                      <div style={{ fontSize: '0.62rem', opacity: 0.6, fontFamily: 'monospace' }}>id, nome, codigo, descricao</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>1 aluno em 1 disciplina pode ter N infrações</div>
                      <div style={{ fontSize: '1.1rem', color: '#ef4444', fontWeight: 700 }}>↓</div>
                      <div style={{ padding: '12px 18px', borderRadius: '12px', background: 'color-mix(in srgb, #ef4444 10%, transparent)', border: '2px solid #ef4444', textAlign: 'center', minWidth: '200px' }}>
                        <div style={{ fontSize: '1.4rem' }}>🚨</div>
                        <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.9rem', margin: '4px 0' }}>Infração</div>
                        <div style={{ fontSize: '0.62rem', opacity: 0.6, fontFamily: 'monospace' }}>id, aluno_id, disciplina_id, descricao, gravidade, data</div>
                      </div>
                    </div>
                  </div>
                </div>

                <StepBlock num="01" title="Criar e configurar o projeto" defaultOpen forceOpen={exportMode}>
                  <p>Execute a sequência completa de uma vez no terminal. Escolha o bloco correspondente ao seu sistema operacional:</p>
                  <CodeBlock lang="BASH — Linux / macOS" html={`uv init api-escolar   # cria a pasta e o pyproject.toml
cd api-escolar        # entra na pasta do projeto
uv venv               # cria o ambiente virtual
source .venv/bin/activate   # ativa o ambiente
uv add fastapi uvicorn      # instala as dependências`} />
                  <CodeBlock lang="POWERSHELL — Windows" html={`uv init api-escolar
cd api-escolar
uv venv
.venv\\Scripts\\activate
uv add fastapi uvicorn`} />
                  <p>Quando o ambiente estiver ativo, o prefixo <code>(api-escolar)</code> aparece no terminal.</p>
                  <p>Crie o <code>main.py</code> e o <code>.gitignore</code>:</p>
                  <CodeBlock lang="BASH — Linux / macOS" html={`touch main.py
touch .gitignore`} />
                  <CodeBlock lang="POWERSHELL — Windows" html={`New-Item main.py
New-Item .gitignore`} />
                  <CodeBlock lang=".gitignore" html={`.venv/
__pycache__/
*.pyc
.env`} />
                  <p>Estrutura final do projeto:</p>
                  <CodeBlock lang="ESTRUTURA" html={`api-escolar/
├── main.py           <span class="cmt">← todo o código ficará aqui</span>
├── pyproject.toml    <span class="cmt">← gerado pelo uv init</span>
├── .gitignore
└── .venv/            <span class="cmt">← não versionar</span>`} />
                  <p>Com o <code>main.py</code> preenchido (veja o Módulo 5), execute o servidor de dentro da pasta <code>api-escolar</code>:</p>
                  <CodeBlock lang="BASH" html={`uvicorn main:app --reload`} />
                  <p>Acesse <code>http://127.0.0.1:8000/docs</code> para ver a documentação interativa gerada pelo FastAPI.</p>
                </StepBlock>

                <StepBlock num="02" title="Modelos Pydantic — as 4 entidades" forceOpen={exportMode}>
                  <p>Cada entidade tem dois modelos: um de <strong>entrada</strong> (o que o cliente envia) e um de <strong>saída</strong> (o que o servidor retorna com o id gerado).</p>
                  <CodeBlock lang="PYTHON — models" html={`<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel

<span class="cmt"># ── Aluno ──────────────────────────────────────────</span>
<span class="kw">class</span> <span class="cls">AlunoEntrada</span>(BaseModel):
    nome: <span class="cls">str</span>
    matricula: <span class="cls">str</span>
    email: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Aluno</span>(<span class="cls">AlunoEntrada</span>):
    id: <span class="cls">str</span>

<span class="cmt"># ── Disciplina ─────────────────────────────────────</span>
<span class="kw">class</span> <span class="cls">DisciplinaEntrada</span>(BaseModel):
    nome: <span class="cls">str</span>
    codigo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Disciplina</span>(<span class="cls">DisciplinaEntrada</span>):
    id: <span class="cls">str</span>

<span class="cmt"># ── Matrícula (junção N:N) ─────────────────────────</span>
<span class="kw">class</span> <span class="cls">MatriculaEntrada</span>(BaseModel):
    aluno_id: <span class="cls">str</span>
    disciplina_id: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Matricula</span>(<span class="cls">MatriculaEntrada</span>):
    id: <span class="cls">str</span>

<span class="cmt"># ── Infração ────────────────────────────────────────</span>
<span class="kw">class</span> <span class="cls">InfracaoEntrada</span>(BaseModel):
    aluno_id: <span class="cls">str</span>
    disciplina_id: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    gravidade: <span class="cls">str</span>  <span class="cmt"># "leve" | "media" | "grave"</span>

<span class="kw">class</span> <span class="cls">Infracao</span>(<span class="cls">InfracaoEntrada</span>):
    id: <span class="cls">str</span>
    data: <span class="cls">str</span>  <span class="cmt"># gerada pelo servidor no momento do registro</span>`} />
                  <InfoBox label="📌 PADRÃO DE DOIS MODELOS">
                    O campo <code>id</code> nunca é enviado pelo cliente — é sempre gerado pelo servidor com <code>uuid4()</code>. O campo <code>data</code> da infração também é gerado pelo servidor com <code>datetime.now().isoformat()</code>. Separar <em>entrada</em> e <em>saída</em> torna o contrato da API explícito e seguro.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="03" title="Dados em memória — as 4 listas" forceOpen={exportMode}>
                  <p>Cada entidade tem sua própria lista, simulando quatro tabelas de um banco de dados relacional:</p>
                  <CodeBlock lang="PYTHON" html={`<span class="kw">from</span> typing <span class="kw">import</span> List

alunos_db:      List[<span class="cls">Aluno</span>]      = []  <span class="cmt"># "tabela" de alunos</span>
disciplinas_db: List[<span class="cls">Disciplina</span>] = []  <span class="cmt"># "tabela" de disciplinas</span>
matriculas_db:  List[<span class="cls">Matricula</span>]  = []  <span class="cmt"># "tabela" de junção N:N</span>
infracoes_db:   List[<span class="cls">Infracao</span>]   = []  <span class="cmt"># "tabela" de infrações</span>`} />
                  <div className="card" style={{ marginTop: '0.75rem' }}>
                    <table className="pabd-table">
                      <thead><tr><th>Lista</th><th>Entidade</th><th>Papel</th></tr></thead>
                      <tbody>
                        <tr><td><code>alunos_db</code></td><td>Aluno</td><td>Armazena os dados cadastrais dos alunos</td></tr>
                        <tr><td><code>disciplinas_db</code></td><td>Disciplina</td><td>Armazena as disciplinas disponíveis</td></tr>
                        <tr><td><code>matriculas_db</code></td><td>Matrícula</td><td>Implementa o vínculo N:N Aluno ↔ Disciplina</td></tr>
                        <tr><td><code>infracoes_db</code></td><td>Infração</td><td>Registra ocorrências de alunos em disciplinas</td></tr>
                      </tbody>
                    </table>
                  </div>
                </StepBlock>

                <StepBlock num="04" title="Funções auxiliares — evitando repetição" forceOpen={exportMode}>
                  <p>Endpoints de matrícula e infração precisam validar se o aluno e a disciplina existem antes de criar o registro. Para não repetir o mesmo <code>for</code> em vários lugares, criamos duas helpers:</p>
                  <CodeBlock lang="PYTHON — helpers" html={`<span class="kw">def</span> <span class="fn">encontrar_aluno</span>(id: <span class="cls">str</span>) -> <span class="cls">Aluno</span>:
    <span class="kw">for</span> a <span class="kw">in</span> alunos_db:
        <span class="kw">if</span> a.id == id:
            <span class="kw">return</span> a
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Aluno não encontrado"</span>)

<span class="kw">def</span> <span class="fn">encontrar_disciplina</span>(id: <span class="cls">str</span>) -> <span class="cls">Disciplina</span>:
    <span class="kw">for</span> d <span class="kw">in</span> disciplinas_db:
        <span class="kw">if</span> d.id == id:
            <span class="kw">return</span> d
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Disciplina não encontrada"</span>)`} />
                  <InfoBox variant="tip" label="💡 DRY — Don't Repeat Yourself">
                    Sempre que você perceber que vai escrever o mesmo bloco de código em dois lugares, extraia para uma função. Se a lógica mudar (ex.: busca em banco de dados), basta alterar em um único ponto.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(1)}>← Sumário</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(3)}>Módulo 2 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 3: Módulo 2 — CRUD de Alunos ── */}
          {(current === 3 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 02</div>
                  <h2>CRUD de <span className="accent-text">Alunos</span></h2>
                  <p className="lead">Cinco endpoints para gerenciar alunos: criar, listar todos, buscar por ID, editar e remover. Seguem exatamente o mesmo padrão do CRUD de tarefas da Aula 1.</p>

                  <div className="card" style={{ marginTop: '0.75rem' }}>
                    <table className="pabd-table">
                      <thead><tr><th>Método</th><th>Rota</th><th>Operação</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr><td><span className="method-pill post">POST</span></td><td><code>/alunos</code></td><td>Criar aluno</td><td>201 Created</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/alunos</code></td><td>Listar todos</td><td>200 OK</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/alunos/{'{id}'}</code></td><td>Buscar por ID</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill put">PUT</span></td><td><code>/alunos/{'{id}'}</code></td><td>Editar aluno</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill delete">DELETE</span></td><td><code>/alunos/{'{id}'}</code></td><td>Remover aluno</td><td>204 / 404</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <StepBlock num="01" title="POST /alunos — Criar um aluno" defaultOpen forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.post</span>(<span class="str">"/alunos"</span>, response_model=<span class="cls">Aluno</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_aluno</span>(dados: <span class="cls">AlunoEntrada</span>):
    novo = <span class="cls">Aluno</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    alunos_db.<span class="fn">append</span>(novo)
    <span class="kw">return</span> novo`} />
                  <CodeBlock lang="JSON — Body da requisição (exemplo)" html={`{
  <span class="str">"nome"</span>: <span class="str">"Ana Paula"</span>,
  <span class="str">"matricula"</span>: <span class="str">"20240001"</span>,
  <span class="str">"email"</span>: <span class="str">"ana.paula@escola.edu.br"</span>
}`} />
                  <CodeBlock lang="JSON — Resposta 201 Created" html={`{
  <span class="str">"id"</span>: <span class="str">"f47ac10b-58cc-4372-a567-0e02b2c3d479"</span>,
  <span class="str">"nome"</span>: <span class="str">"Ana Paula"</span>,
  <span class="str">"matricula"</span>: <span class="str">"20240001"</span>,
  <span class="str">"email"</span>: <span class="str">"ana.paula@escola.edu.br"</span>
}`} />
                </StepBlock>

                <StepBlock num="02" title="GET /alunos e GET /alunos/{id}" forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.get</span>(<span class="str">"/alunos"</span>, response_model=List[<span class="cls">Aluno</span>])
<span class="kw">def</span> <span class="fn">listar_alunos</span>():
    <span class="kw">return</span> alunos_db

<span class="dec">@app.get</span>(<span class="str">"/alunos/{id}"</span>, response_model=<span class="cls">Aluno</span>)
<span class="kw">def</span> <span class="fn">buscar_aluno</span>(id: <span class="cls">str</span>):
    <span class="kw">return</span> <span class="fn">encontrar_aluno</span>(id)  <span class="cmt"># helper lança 404 se não existir</span>`} />
                </StepBlock>

                <StepBlock num="03" title="PUT /alunos/{id} — Editar e DELETE /alunos/{id} — Remover" forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.put</span>(<span class="str">"/alunos/{id}"</span>, response_model=<span class="cls">Aluno</span>)
<span class="kw">def</span> <span class="fn">editar_aluno</span>(id: <span class="cls">str</span>, dados: <span class="cls">AlunoEntrada</span>):
    <span class="kw">for</span> i, a <span class="kw">in</span> <span class="fn">enumerate</span>(alunos_db):
        <span class="kw">if</span> a.id == id:
            atualizado = <span class="cls">Aluno</span>(id=id, **dados.<span class="fn">model_dump</span>())
            alunos_db[i] = atualizado
            <span class="kw">return</span> atualizado
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Aluno não encontrado"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/alunos/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_aluno</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, a <span class="kw">in</span> <span class="fn">enumerate</span>(alunos_db):
        <span class="kw">if</span> a.id == id:
            alunos_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Aluno não encontrado"</span>)`} />
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Módulo 3 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 4: Módulo 3 — Disciplinas & Matrículas ── */}
          {(current === 4 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 03</div>
                  <h2>CRUD de <span className="accent-text">Disciplinas</span> &amp; Matrículas</h2>
                  <p className="lead">Além do CRUD padrão de Disciplinas, este módulo introduz os endpoints de <strong>Matrícula</strong> — a entidade que implementa o relacionamento N:N entre Alunos e Disciplinas.</p>

                  <div className="card" style={{ marginTop: '0.75rem' }}>
                    <table className="pabd-table">
                      <thead><tr><th>Método</th><th>Rota</th><th>Operação</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr><td><span className="method-pill post">POST</span></td><td><code>/disciplinas</code></td><td>Criar disciplina</td><td>201</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/disciplinas</code></td><td>Listar todas</td><td>200</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/disciplinas/{'{id}'}</code></td><td>Buscar por ID</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill put">PUT</span></td><td><code>/disciplinas/{'{id}'}</code></td><td>Editar disciplina</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill delete">DELETE</span></td><td><code>/disciplinas/{'{id}'}</code></td><td>Remover disciplina</td><td>204 / 404</td></tr>
                        <tr><td><span className="method-pill post">POST</span></td><td><code>/matriculas</code></td><td>Matricular aluno em disciplina</td><td>201 / 409</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/alunos/{'{id}'}/disciplinas</code></td><td>Disciplinas de um aluno</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/disciplinas/{'{id}'}/alunos</code></td><td>Alunos de uma disciplina</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill delete">DELETE</span></td><td><code>/matriculas/{'{id}'}</code></td><td>Cancelar matrícula</td><td>204 / 404</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <StepBlock num="01" title="CRUD de Disciplinas" defaultOpen forceOpen={exportMode}>
                  <p>Idêntico ao CRUD de Alunos em estrutura:</p>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.post</span>(<span class="str">"/disciplinas"</span>, response_model=<span class="cls">Disciplina</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_disciplina</span>(dados: <span class="cls">DisciplinaEntrada</span>):
    nova = <span class="cls">Disciplina</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    disciplinas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/disciplinas"</span>, response_model=List[<span class="cls">Disciplina</span>])
<span class="kw">def</span> <span class="fn">listar_disciplinas</span>():
    <span class="kw">return</span> disciplinas_db

<span class="dec">@app.get</span>(<span class="str">"/disciplinas/{id}"</span>, response_model=<span class="cls">Disciplina</span>)
<span class="kw">def</span> <span class="fn">buscar_disciplina</span>(id: <span class="cls">str</span>):
    <span class="kw">return</span> <span class="fn">encontrar_disciplina</span>(id)

<span class="dec">@app.put</span>(<span class="str">"/disciplinas/{id}"</span>, response_model=<span class="cls">Disciplina</span>)
<span class="kw">def</span> <span class="fn">editar_disciplina</span>(id: <span class="cls">str</span>, dados: <span class="cls">DisciplinaEntrada</span>):
    <span class="kw">for</span> i, d <span class="kw">in</span> <span class="fn">enumerate</span>(disciplinas_db):
        <span class="kw">if</span> d.id == id:
            atualizada = <span class="cls">Disciplina</span>(id=id, **dados.<span class="fn">model_dump</span>())
            disciplinas_db[i] = atualizada
            <span class="kw">return</span> atualizada
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Disciplina não encontrada"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/disciplinas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_disciplina</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, d <span class="kw">in</span> <span class="fn">enumerate</span>(disciplinas_db):
        <span class="kw">if</span> d.id == id:
            disciplinas_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Disciplina não encontrada"</span>)`} />
                </StepBlock>

                <StepBlock num="02" title="POST /matriculas — Matricular aluno em disciplina" forceOpen={exportMode}>
                  <p>Este é o endpoint mais rico: valida se ambas as entidades existem e impede duplicidade de matrícula.</p>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.post</span>(<span class="str">"/matriculas"</span>, response_model=<span class="cls">Matricula</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">matricular_aluno</span>(dados: <span class="cls">MatriculaEntrada</span>):
    <span class="fn">encontrar_aluno</span>(dados.aluno_id)            <span class="cmt"># 404 se aluno não existe</span>
    <span class="fn">encontrar_disciplina</span>(dados.disciplina_id)   <span class="cmt"># 404 se disciplina não existe</span>

    <span class="kw">for</span> m <span class="kw">in</span> matriculas_db:                      <span class="cmt"># verifica duplicidade</span>
        <span class="kw">if</span> m.aluno_id == dados.aluno_id <span class="kw">and</span> m.disciplina_id == dados.disciplina_id:
            <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">409</span>,
                                detail=<span class="str">"Aluno já matriculado nesta disciplina"</span>)

    nova = <span class="cls">Matricula</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    matriculas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova`} />
                  <InfoBox label="📌 STATUS 409 CONFLICT">
                    <strong>409 Conflict</strong> indica que a requisição não pode ser processada por conflito com o estado atual do recurso. É diferente do <strong>422 Unprocessable Entity</strong> (dados mal formatados) — aqui os dados estão corretos, mas o recurso já existe.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="03" title="Endpoints de relacionamento N:N" forceOpen={exportMode}>
                  <p>Estes endpoints permitem navegar pela relação N:N em ambas as direções:</p>
                  <CodeBlock lang="PYTHON" html={`<span class="cmt"># Quais disciplinas um aluno está cursando?</span>
<span class="dec">@app.get</span>(<span class="str">"/alunos/{id}/disciplinas"</span>, response_model=List[<span class="cls">Disciplina</span>])
<span class="kw">def</span> <span class="fn">disciplinas_do_aluno</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_aluno</span>(id)
    ids_disc = {m.disciplina_id <span class="kw">for</span> m <span class="kw">in</span> matriculas_db <span class="kw">if</span> m.aluno_id == id}
    <span class="kw">return</span> [d <span class="kw">for</span> d <span class="kw">in</span> disciplinas_db <span class="kw">if</span> d.id <span class="kw">in</span> ids_disc]

<span class="cmt"># Quais alunos estão em uma disciplina?</span>
<span class="dec">@app.get</span>(<span class="str">"/disciplinas/{id}/alunos"</span>, response_model=List[<span class="cls">Aluno</span>])
<span class="kw">def</span> <span class="fn">alunos_da_disciplina</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_disciplina</span>(id)
    ids_alunos = {m.aluno_id <span class="kw">for</span> m <span class="kw">in</span> matriculas_db <span class="kw">if</span> m.disciplina_id == id}
    <span class="kw">return</span> [a <span class="kw">for</span> a <span class="kw">in</span> alunos_db <span class="kw">if</span> a.id <span class="kw">in</span> ids_alunos]

<span class="cmt"># Cancelar matrícula</span>
<span class="dec">@app.delete</span>(<span class="str">"/matriculas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">cancelar_matricula</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, m <span class="kw">in</span> <span class="fn">enumerate</span>(matriculas_db):
        <span class="kw">if</span> m.id == id:
            matriculas_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Matrícula não encontrada"</span>)`} />
                  <InfoBox variant="tip" label="💡 SET COMPREHENSION">
                    <code>{'{ m.disciplina_id for m in matriculas_db if m.aluno_id == id }'}</code> é uma <em>set comprehension</em> — cria um conjunto com os IDs de disciplinas do aluno. A busca em set (<code>d.id in ids_disc</code>) é O(1), mais eficiente que percorrer uma lista.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Módulo 4 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 5: Módulo 4 — CRUD de Infrações ── */}
          {(current === 5 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 04</div>
                  <h2>CRUD de <span className="accent-text">Infrações</span></h2>
                  <p className="lead">Uma infração sempre pertence a um <strong>aluno específico</strong> em uma <strong>disciplina específica</strong>. Os endpoints refletem essa hierarquia, permitindo filtrar infrações por aluno ou por disciplina.</p>

                  <div className="card" style={{ marginTop: '0.75rem' }}>
                    <table className="pabd-table">
                      <thead><tr><th>Método</th><th>Rota</th><th>Operação</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr><td><span className="method-pill post">POST</span></td><td><code>/infracoes</code></td><td>Registrar infração</td><td>201 / 404</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/infracoes</code></td><td>Listar todas as infrações</td><td>200</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/infracoes/{'{id}'}</code></td><td>Buscar infração por ID</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/alunos/{'{id}'}/infracoes</code></td><td>Infrações de um aluno</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/disciplinas/{'{id}'}/infracoes</code></td><td>Infrações em uma disciplina</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill put">PUT</span></td><td><code>/infracoes/{'{id}'}</code></td><td>Editar infração</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill delete">DELETE</span></td><td><code>/infracoes/{'{id}'}</code></td><td>Remover infração</td><td>204 / 404</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <StepBlock num="01" title="POST /infracoes — Registrar uma infração" defaultOpen forceOpen={exportMode}>
                  <p>Valida aluno e disciplina antes de criar o registro. O campo <code>data</code> é gerado automaticamente.</p>
                  <CodeBlock lang="PYTHON" html={`<span class="kw">from</span> datetime <span class="kw">import</span> datetime

<span class="dec">@app.post</span>(<span class="str">"/infracoes"</span>, response_model=<span class="cls">Infracao</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">registrar_infracao</span>(dados: <span class="cls">InfracaoEntrada</span>):
    <span class="fn">encontrar_aluno</span>(dados.aluno_id)            <span class="cmt"># 404 se aluno não existe</span>
    <span class="fn">encontrar_disciplina</span>(dados.disciplina_id)   <span class="cmt"># 404 se disciplina não existe</span>

    nova = <span class="cls">Infracao</span>(
        id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()),
        data=datetime.<span class="fn">now</span>().<span class="fn">isoformat</span>(),      <span class="cmt"># gerada pelo servidor</span>
        **dados.<span class="fn">model_dump</span>()
    )
    infracoes_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova`} />
                  <CodeBlock lang="JSON — Body da requisição (exemplo)" html={`{
  <span class="str">"aluno_id"</span>: <span class="str">"f47ac10b-58cc-4372-a567-0e02b2c3d479"</span>,
  <span class="str">"disciplina_id"</span>: <span class="str">"3d6f4444-8ae0-11d0-a765-00a0c91e6bf6"</span>,
  <span class="str">"descricao"</span>: <span class="str">"Uso de celular durante a prova"</span>,
  <span class="str">"gravidade"</span>: <span class="str">"media"</span>
}`} />
                  <CodeBlock lang="JSON — Resposta 201 Created" html={`{
  <span class="str">"id"</span>: <span class="str">"9b2d4e8c-1234-5678-abcd-ef0123456789"</span>,
  <span class="str">"aluno_id"</span>: <span class="str">"f47ac10b-58cc-4372-a567-0e02b2c3d479"</span>,
  <span class="str">"disciplina_id"</span>: <span class="str">"3d6f4444-8ae0-11d0-a765-00a0c91e6bf6"</span>,
  <span class="str">"descricao"</span>: <span class="str">"Uso de celular durante a prova"</span>,
  <span class="str">"gravidade"</span>: <span class="str">"media"</span>,
  <span class="str">"data"</span>: <span class="str">"2024-08-15T14:32:10.123456"</span>
}`} />
                </StepBlock>

                <StepBlock num="02" title="GET — Listar e buscar infrações" forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.get</span>(<span class="str">"/infracoes"</span>, response_model=List[<span class="cls">Infracao</span>])
<span class="kw">def</span> <span class="fn">listar_infracoes</span>():
    <span class="kw">return</span> infracoes_db

<span class="dec">@app.get</span>(<span class="str">"/infracoes/{id}"</span>, response_model=<span class="cls">Infracao</span>)
<span class="kw">def</span> <span class="fn">buscar_infracao</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> inf <span class="kw">in</span> infracoes_db:
        <span class="kw">if</span> inf.id == id:
            <span class="kw">return</span> inf
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Infração não encontrada"</span>)

<span class="cmt"># Todas as infrações de um aluno específico</span>
<span class="dec">@app.get</span>(<span class="str">"/alunos/{id}/infracoes"</span>, response_model=List[<span class="cls">Infracao</span>])
<span class="kw">def</span> <span class="fn">infracoes_do_aluno</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_aluno</span>(id)
    <span class="kw">return</span> [inf <span class="kw">for</span> inf <span class="kw">in</span> infracoes_db <span class="kw">if</span> inf.aluno_id == id]

<span class="cmt"># Todas as infrações em uma disciplina específica</span>
<span class="dec">@app.get</span>(<span class="str">"/disciplinas/{id}/infracoes"</span>, response_model=List[<span class="cls">Infracao</span>])
<span class="kw">def</span> <span class="fn">infracoes_da_disciplina</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_disciplina</span>(id)
    <span class="kw">return</span> [inf <span class="kw">for</span> inf <span class="kw">in</span> infracoes_db <span class="kw">if</span> inf.disciplina_id == id]`} />
                </StepBlock>

                <StepBlock num="03" title="PUT /infracoes/{id} e DELETE /infracoes/{id}" forceOpen={exportMode}>
                  <p>Ao editar, preservamos a <code>data</code> original da infração:</p>
                  <CodeBlock lang="PYTHON" html={`<span class="dec">@app.put</span>(<span class="str">"/infracoes/{id}"</span>, response_model=<span class="cls">Infracao</span>)
<span class="kw">def</span> <span class="fn">editar_infracao</span>(id: <span class="cls">str</span>, dados: <span class="cls">InfracaoEntrada</span>):
    <span class="kw">for</span> i, inf <span class="kw">in</span> <span class="fn">enumerate</span>(infracoes_db):
        <span class="kw">if</span> inf.id == id:
            atualizada = <span class="cls">Infracao</span>(id=id, data=inf.data, **dados.<span class="fn">model_dump</span>())
            infracoes_db[i] = atualizada        <span class="cmt"># data original preservada</span>
            <span class="kw">return</span> atualizada
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Infração não encontrada"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/infracoes/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_infracao</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, inf <span class="kw">in</span> <span class="fn">enumerate</span>(infracoes_db):
        <span class="kw">if</span> inf.id == id:
            infracoes_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Infração não encontrada"</span>)`} />
                  <InfoBox label="📌 POR QUE PRESERVAR data?">
                    Ao editar uma infração, apenas os dados descritivos mudam (descrição, gravidade). A data de ocorrência é um fato histórico — alterá-la seria uma adulteração de registro. Por isso <code>data=inf.data</code> reutiliza o valor já armazenado.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(4)}>← Módulo 3</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(6)}>Código Completo →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 6: Código Completo ── */}
          {(current === 6 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 05</div>
                  <h2>O <span className="accent-text">main.py</span> Completo</h2>
                  <p className="lead">Todo o código em um único arquivo. Copie, cole no seu projeto e execute com <code>uvicorn main:app --reload</code>. A documentação interativa estará disponível em <code>http://127.0.0.1:8000/docs</code>.</p>
                </div>

                <StepBlock num="01" title="Do zero ao servidor rodando" defaultOpen forceOpen={exportMode}>
                  <p>Execute a sequência completa de uma vez. Escolha o bloco do seu sistema operacional:</p>
                  <CodeBlock lang="BASH — Linux / macOS" html={`uv init api-escolar
cd api-escolar
uv venv
source .venv/bin/activate
uv add fastapi uvicorn`} />
                  <CodeBlock lang="POWERSHELL — Windows" html={`uv init api-escolar
cd api-escolar
uv venv
.venv\\Scripts\\activate
uv add fastapi uvicorn`} />
                  <p>Cole o código do <strong>Passo 02</strong> no arquivo <code>main.py</code>, salve e inicie o servidor:</p>
                  <CodeBlock lang="BASH — iniciar servidor com hot-reload" html={`uvicorn main:app --reload`} />
                  <InfoBox label="⚠️ ATENÇÃO — execute dentro da pasta do projeto">
                    O comando <code>uvicorn main:app --reload</code> (e o <code>uv add</code>) precisam ser executados de <strong>dentro da pasta <code>api-escolar</code></strong>, onde o <code>pyproject.toml</code> está. Se você abrir um terminal novo, use <code>cd api-escolar</code> antes de qualquer comando.
                  </InfoBox>
                  <p>A saída esperada no terminal é:</p>
                  <CodeBlock lang="TERMINAL — saída esperada" html={`INFO:     Uvicorn running on <span style="color:#22c55e">http://127.0.0.1:8000</span> (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.`} />
                  <InfoBox variant="tip" label="💡 DOCUMENTAÇÃO AUTOMÁTICA">
                    Acesse <strong>http://127.0.0.1:8000/docs</strong> para abrir o <strong>Swagger UI</strong> — interface interativa que lista todos os 21 endpoints e permite testá-los sem precisar do terminal.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="main.py — código completo" forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON — main.py completo" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI, HTTPException
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">from</span> datetime <span class="kw">import</span> datetime
<span class="kw">import</span> uuid

app = <span class="fn">FastAPI</span>(title=<span class="str">"API Escolar"</span>, version=<span class="str">"1.0.0"</span>)

<span class="cmt"># ═══════════════════ MODELOS ═══════════════════</span>

<span class="kw">class</span> <span class="cls">AlunoEntrada</span>(BaseModel):
    nome: <span class="cls">str</span>
    matricula: <span class="cls">str</span>
    email: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Aluno</span>(<span class="cls">AlunoEntrada</span>):
    id: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">DisciplinaEntrada</span>(BaseModel):
    nome: <span class="cls">str</span>
    codigo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Disciplina</span>(<span class="cls">DisciplinaEntrada</span>):
    id: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">MatriculaEntrada</span>(BaseModel):
    aluno_id: <span class="cls">str</span>
    disciplina_id: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Matricula</span>(<span class="cls">MatriculaEntrada</span>):
    id: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">InfracaoEntrada</span>(BaseModel):
    aluno_id: <span class="cls">str</span>
    disciplina_id: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    gravidade: <span class="cls">str</span>

<span class="kw">class</span> <span class="cls">Infracao</span>(<span class="cls">InfracaoEntrada</span>):
    id: <span class="cls">str</span>
    data: <span class="cls">str</span>

<span class="cmt"># ═══════════════════ DADOS EM MEMÓRIA ═══════════════════</span>

alunos_db:      List[<span class="cls">Aluno</span>]      = []
disciplinas_db: List[<span class="cls">Disciplina</span>] = []
matriculas_db:  List[<span class="cls">Matricula</span>]  = []
infracoes_db:   List[<span class="cls">Infracao</span>]   = []

<span class="cmt"># ═══════════════════ HELPERS ═══════════════════</span>

<span class="kw">def</span> <span class="fn">encontrar_aluno</span>(id: <span class="cls">str</span>) -> <span class="cls">Aluno</span>:
    <span class="kw">for</span> a <span class="kw">in</span> alunos_db:
        <span class="kw">if</span> a.id == id:
            <span class="kw">return</span> a
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Aluno não encontrado"</span>)

<span class="kw">def</span> <span class="fn">encontrar_disciplina</span>(id: <span class="cls">str</span>) -> <span class="cls">Disciplina</span>:
    <span class="kw">for</span> d <span class="kw">in</span> disciplinas_db:
        <span class="kw">if</span> d.id == id:
            <span class="kw">return</span> d
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Disciplina não encontrada"</span>)

<span class="cmt"># ═══════════════════ ALUNOS ═══════════════════</span>

<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API Escolar funcionando! 🏫"</span>}

<span class="dec">@app.post</span>(<span class="str">"/alunos"</span>, response_model=<span class="cls">Aluno</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_aluno</span>(dados: <span class="cls">AlunoEntrada</span>):
    novo = <span class="cls">Aluno</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    alunos_db.<span class="fn">append</span>(novo)
    <span class="kw">return</span> novo

<span class="dec">@app.get</span>(<span class="str">"/alunos"</span>, response_model=List[<span class="cls">Aluno</span>])
<span class="kw">def</span> <span class="fn">listar_alunos</span>():
    <span class="kw">return</span> alunos_db

<span class="dec">@app.get</span>(<span class="str">"/alunos/{id}"</span>, response_model=<span class="cls">Aluno</span>)
<span class="kw">def</span> <span class="fn">buscar_aluno</span>(id: <span class="cls">str</span>):
    <span class="kw">return</span> <span class="fn">encontrar_aluno</span>(id)

<span class="dec">@app.put</span>(<span class="str">"/alunos/{id}"</span>, response_model=<span class="cls">Aluno</span>)
<span class="kw">def</span> <span class="fn">editar_aluno</span>(id: <span class="cls">str</span>, dados: <span class="cls">AlunoEntrada</span>):
    <span class="kw">for</span> i, a <span class="kw">in</span> <span class="fn">enumerate</span>(alunos_db):
        <span class="kw">if</span> a.id == id:
            atualizado = <span class="cls">Aluno</span>(id=id, **dados.<span class="fn">model_dump</span>())
            alunos_db[i] = atualizado
            <span class="kw">return</span> atualizado
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Aluno não encontrado"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/alunos/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_aluno</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, a <span class="kw">in</span> <span class="fn">enumerate</span>(alunos_db):
        <span class="kw">if</span> a.id == id:
            alunos_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Aluno não encontrado"</span>)

<span class="cmt"># ═══════════════════ DISCIPLINAS ═══════════════════</span>

<span class="dec">@app.post</span>(<span class="str">"/disciplinas"</span>, response_model=<span class="cls">Disciplina</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_disciplina</span>(dados: <span class="cls">DisciplinaEntrada</span>):
    nova = <span class="cls">Disciplina</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    disciplinas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/disciplinas"</span>, response_model=List[<span class="cls">Disciplina</span>])
<span class="kw">def</span> <span class="fn">listar_disciplinas</span>():
    <span class="kw">return</span> disciplinas_db

<span class="dec">@app.get</span>(<span class="str">"/disciplinas/{id}"</span>, response_model=<span class="cls">Disciplina</span>)
<span class="kw">def</span> <span class="fn">buscar_disciplina</span>(id: <span class="cls">str</span>):
    <span class="kw">return</span> <span class="fn">encontrar_disciplina</span>(id)

<span class="dec">@app.put</span>(<span class="str">"/disciplinas/{id}"</span>, response_model=<span class="cls">Disciplina</span>)
<span class="kw">def</span> <span class="fn">editar_disciplina</span>(id: <span class="cls">str</span>, dados: <span class="cls">DisciplinaEntrada</span>):
    <span class="kw">for</span> i, d <span class="kw">in</span> <span class="fn">enumerate</span>(disciplinas_db):
        <span class="kw">if</span> d.id == id:
            atualizada = <span class="cls">Disciplina</span>(id=id, **dados.<span class="fn">model_dump</span>())
            disciplinas_db[i] = atualizada
            <span class="kw">return</span> atualizada
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Disciplina não encontrada"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/disciplinas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_disciplina</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, d <span class="kw">in</span> <span class="fn">enumerate</span>(disciplinas_db):
        <span class="kw">if</span> d.id == id:
            disciplinas_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Disciplina não encontrada"</span>)

<span class="cmt"># ═══════════════════ MATRÍCULAS ═══════════════════</span>

<span class="dec">@app.post</span>(<span class="str">"/matriculas"</span>, response_model=<span class="cls">Matricula</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">matricular_aluno</span>(dados: <span class="cls">MatriculaEntrada</span>):
    <span class="fn">encontrar_aluno</span>(dados.aluno_id)
    <span class="fn">encontrar_disciplina</span>(dados.disciplina_id)
    <span class="kw">for</span> m <span class="kw">in</span> matriculas_db:
        <span class="kw">if</span> m.aluno_id == dados.aluno_id <span class="kw">and</span> m.disciplina_id == dados.disciplina_id:
            <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">409</span>, detail=<span class="str">"Aluno já matriculado nesta disciplina"</span>)
    nova = <span class="cls">Matricula</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    matriculas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/alunos/{id}/disciplinas"</span>, response_model=List[<span class="cls">Disciplina</span>])
<span class="kw">def</span> <span class="fn">disciplinas_do_aluno</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_aluno</span>(id)
    ids_disc = {m.disciplina_id <span class="kw">for</span> m <span class="kw">in</span> matriculas_db <span class="kw">if</span> m.aluno_id == id}
    <span class="kw">return</span> [d <span class="kw">for</span> d <span class="kw">in</span> disciplinas_db <span class="kw">if</span> d.id <span class="kw">in</span> ids_disc]

<span class="dec">@app.get</span>(<span class="str">"/disciplinas/{id}/alunos"</span>, response_model=List[<span class="cls">Aluno</span>])
<span class="kw">def</span> <span class="fn">alunos_da_disciplina</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_disciplina</span>(id)
    ids_alunos = {m.aluno_id <span class="kw">for</span> m <span class="kw">in</span> matriculas_db <span class="kw">if</span> m.disciplina_id == id}
    <span class="kw">return</span> [a <span class="kw">for</span> a <span class="kw">in</span> alunos_db <span class="kw">if</span> a.id <span class="kw">in</span> ids_alunos]

<span class="dec">@app.delete</span>(<span class="str">"/matriculas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">cancelar_matricula</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, m <span class="kw">in</span> <span class="fn">enumerate</span>(matriculas_db):
        <span class="kw">if</span> m.id == id:
            matriculas_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Matrícula não encontrada"</span>)

<span class="cmt"># ═══════════════════ INFRAÇÕES ═══════════════════</span>

<span class="dec">@app.post</span>(<span class="str">"/infracoes"</span>, response_model=<span class="cls">Infracao</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">registrar_infracao</span>(dados: <span class="cls">InfracaoEntrada</span>):
    <span class="fn">encontrar_aluno</span>(dados.aluno_id)
    <span class="fn">encontrar_disciplina</span>(dados.disciplina_id)
    nova = <span class="cls">Infracao</span>(
        id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()),
        data=datetime.<span class="fn">now</span>().<span class="fn">isoformat</span>(),
        **dados.<span class="fn">model_dump</span>()
    )
    infracoes_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/infracoes"</span>, response_model=List[<span class="cls">Infracao</span>])
<span class="kw">def</span> <span class="fn">listar_infracoes</span>():
    <span class="kw">return</span> infracoes_db

<span class="dec">@app.get</span>(<span class="str">"/infracoes/{id}"</span>, response_model=<span class="cls">Infracao</span>)
<span class="kw">def</span> <span class="fn">buscar_infracao</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> inf <span class="kw">in</span> infracoes_db:
        <span class="kw">if</span> inf.id == id:
            <span class="kw">return</span> inf
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Infração não encontrada"</span>)

<span class="dec">@app.get</span>(<span class="str">"/alunos/{id}/infracoes"</span>, response_model=List[<span class="cls">Infracao</span>])
<span class="kw">def</span> <span class="fn">infracoes_do_aluno</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_aluno</span>(id)
    <span class="kw">return</span> [inf <span class="kw">for</span> inf <span class="kw">in</span> infracoes_db <span class="kw">if</span> inf.aluno_id == id]

<span class="dec">@app.get</span>(<span class="str">"/disciplinas/{id}/infracoes"</span>, response_model=List[<span class="cls">Infracao</span>])
<span class="kw">def</span> <span class="fn">infracoes_da_disciplina</span>(id: <span class="cls">str</span>):
    <span class="fn">encontrar_disciplina</span>(id)
    <span class="kw">return</span> [inf <span class="kw">for</span> inf <span class="kw">in</span> infracoes_db <span class="kw">if</span> inf.disciplina_id == id]

<span class="dec">@app.put</span>(<span class="str">"/infracoes/{id}"</span>, response_model=<span class="cls">Infracao</span>)
<span class="kw">def</span> <span class="fn">editar_infracao</span>(id: <span class="cls">str</span>, dados: <span class="cls">InfracaoEntrada</span>):
    <span class="kw">for</span> i, inf <span class="kw">in</span> <span class="fn">enumerate</span>(infracoes_db):
        <span class="kw">if</span> inf.id == id:
            atualizada = <span class="cls">Infracao</span>(id=id, data=inf.data, **dados.<span class="fn">model_dump</span>())
            infracoes_db[i] = atualizada
            <span class="kw">return</span> atualizada
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Infração não encontrada"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/infracoes/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_infracao</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, inf <span class="kw">in</span> <span class="fn">enumerate</span>(infracoes_db):
        <span class="kw">if</span> inf.id == id:
            infracoes_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Infração não encontrada"</span>)`} />
                </StepBlock>

                <StepBlock num="03" title="Testar a API — sequência completa com curl" forceOpen={exportMode}>
                  <p>Com o servidor rodando, execute os comandos abaixo em ordem para testar o fluxo completo da API:</p>
                  <p><strong>1. Verificar se a API está no ar:</strong></p>
                  <CodeBlock lang="BASH" html={`curl http://127.0.0.1:8000/`} />
                  <CodeBlock lang="JSON — resposta esperada" html={`{ <span class="str">"mensagem"</span>: <span class="str">"API Escolar funcionando! 🏫"</span> }`} />

                  <p><strong>2. Criar um aluno:</strong></p>
                  <CodeBlock lang="BASH" html={`curl -s -X POST http://127.0.0.1:8000/alunos \\
  -H <span class="str">"Content-Type: application/json"</span> \\
  -d <span class="str">'{"nome":"Ana Paula","matricula":"20240001","email":"ana@escola.edu.br"}'</span>`} />
                  <CodeBlock lang="JSON — 201 Created" html={`{
  <span class="str">"id"</span>: <span class="str">"&lt;uuid-gerado&gt;"</span>,
  <span class="str">"nome"</span>: <span class="str">"Ana Paula"</span>,
  <span class="str">"matricula"</span>: <span class="str">"20240001"</span>,
  <span class="str">"email"</span>: <span class="str">"ana@escola.edu.br"</span>
}`} />

                  <p><strong>3. Criar uma disciplina:</strong></p>
                  <CodeBlock lang="BASH" html={`curl -s -X POST http://127.0.0.1:8000/disciplinas \\
  -H <span class="str">"Content-Type: application/json"</span> \\
  -d <span class="str">'{"nome":"Matemática","codigo":"MAT01","descricao":"Álgebra e cálculo básico"}'</span>`} />

                  <p><strong>4. Matricular o aluno na disciplina</strong> (use os IDs retornados nos passos 2 e 3):</p>
                  <CodeBlock lang="BASH" html={`curl -s -X POST http://127.0.0.1:8000/matriculas \\
  -H <span class="str">"Content-Type: application/json"</span> \\
  -d <span class="str">'{"aluno_id":"&lt;id-do-aluno&gt;","disciplina_id":"&lt;id-da-disciplina&gt;"}'</span>`} />

                  <p><strong>5. Registrar uma infração:</strong></p>
                  <CodeBlock lang="BASH" html={`curl -s -X POST http://127.0.0.1:8000/infracoes \\
  -H <span class="str">"Content-Type: application/json"</span> \\
  -d <span class="str">'{"aluno_id":"&lt;id-do-aluno&gt;","disciplina_id":"&lt;id-da-disciplina&gt;","descricao":"Uso de celular","gravidade":"leve"}'</span>`} />

                  <p><strong>6. Consultar as infrações do aluno:</strong></p>
                  <CodeBlock lang="BASH" html={`curl http://127.0.0.1:8000/alunos/<span class="str">&lt;id-do-aluno&gt;</span>/infracoes`} />

                  <p><strong>7. Listar as disciplinas do aluno:</strong></p>
                  <CodeBlock lang="BASH" html={`curl http://127.0.0.1:8000/alunos/<span class="str">&lt;id-do-aluno&gt;</span>/disciplinas`} />

                  <InfoBox label="📌 ALTERNATIVA — Swagger UI">
                    Prefere clicar em vez de digitar comandos? Acesse <code>http://127.0.0.1:8000/docs</code>, expanda qualquer endpoint, clique em <strong>Try it out</strong>, preencha o body e clique em <strong>Execute</strong>. O resultado aparece diretamente na página.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="04" title="Mapa completo de endpoints" forceOpen={exportMode}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.65rem', margin: '0.5rem 0' }}>
                    {[
                      { method: 'POST',   color: '#6788c2', path: '/alunos',                       op: 'Criar aluno',              status: '201' },
                      { method: 'GET',    color: '#22c55e', path: '/alunos',                       op: 'Listar alunos',            status: '200' },
                      { method: 'GET',    color: '#22c55e', path: '/alunos/{id}',                  op: 'Buscar aluno',             status: '200/404' },
                      { method: 'PUT',    color: '#f59e0b', path: '/alunos/{id}',                  op: 'Editar aluno',             status: '200/404' },
                      { method: 'DELETE', color: '#ef4444', path: '/alunos/{id}',                  op: 'Remover aluno',            status: '204/404' },
                      { method: 'POST',   color: '#6788c2', path: '/disciplinas',                  op: 'Criar disciplina',         status: '201' },
                      { method: 'GET',    color: '#22c55e', path: '/disciplinas',                  op: 'Listar disciplinas',       status: '200' },
                      { method: 'GET',    color: '#22c55e', path: '/disciplinas/{id}',             op: 'Buscar disciplina',        status: '200/404' },
                      { method: 'PUT',    color: '#f59e0b', path: '/disciplinas/{id}',             op: 'Editar disciplina',        status: '200/404' },
                      { method: 'DELETE', color: '#ef4444', path: '/disciplinas/{id}',             op: 'Remover disciplina',       status: '204/404' },
                      { method: 'POST',   color: '#6788c2', path: '/matriculas',                   op: 'Matricular aluno',         status: '201/409' },
                      { method: 'GET',    color: '#22c55e', path: '/alunos/{id}/disciplinas',      op: 'Disciplinas do aluno',     status: '200/404' },
                      { method: 'GET',    color: '#22c55e', path: '/disciplinas/{id}/alunos',      op: 'Alunos da disciplina',     status: '200/404' },
                      { method: 'DELETE', color: '#ef4444', path: '/matriculas/{id}',              op: 'Cancelar matrícula',       status: '204/404' },
                      { method: 'POST',   color: '#6788c2', path: '/infracoes',                    op: 'Registrar infração',       status: '201/404' },
                      { method: 'GET',    color: '#22c55e', path: '/infracoes',                    op: 'Listar infrações',         status: '200' },
                      { method: 'GET',    color: '#22c55e', path: '/infracoes/{id}',               op: 'Buscar infração',          status: '200/404' },
                      { method: 'GET',    color: '#22c55e', path: '/alunos/{id}/infracoes',        op: 'Infrações do aluno',       status: '200/404' },
                      { method: 'GET',    color: '#22c55e', path: '/disciplinas/{id}/infracoes',   op: 'Infrações da disciplina',  status: '200/404' },
                      { method: 'PUT',    color: '#f59e0b', path: '/infracoes/{id}',               op: 'Editar infração',          status: '200/404' },
                      { method: 'DELETE', color: '#ef4444', path: '/infracoes/{id}',               op: 'Remover infração',         status: '204/404' },
                    ].map(({ method, color, path, op, status }) => (
                      <div key={method + path} style={{ padding: '10px 12px', borderRadius: '10px', border: `1px solid ${color}44`, background: `${color}0d`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ padding: '2px 7px', borderRadius: '4px', background: color, color: 'white', fontSize: '0.62rem', fontWeight: 700, width: 'fit-content' }}>{method}</span>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.62rem', opacity: 0.55, wordBreak: 'break-all' }}>{path}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.3 }}>{op}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color }}>{status}</div>
                      </div>
                    ))}
                  </div>
                  <InfoBox variant="tip" label="💡 PRÓXIMO PASSO">
                    Esta API armazena os dados em memória. Para persistir os registros entre reinicializações do servidor, substitua as listas por um banco de dados SQLite — seguindo o mesmo padrão demonstrado na <strong>Aula 2: FastAPI com SQLite</strong>.
                  </InfoBox>
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(5)}>← Módulo 4</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(7)}>Quiz →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 7: Quiz ── */}
          {(current === 7 || exportMode) && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">AVALIAÇÃO</div>
                <h2>Quiz — Teste seus <span className="accent-text">conhecimentos</span></h2>

                {exportMode ? (
                  <div className="quiz-print-list">
                    {QUIZ.map((q, i) => (
                      <div key={i} className="quiz-print-q">
                        <h3 dangerouslySetInnerHTML={{ __html: q.q }} />
                        <div className="quiz-print-lines">
                          <div className="quiz-print-line" />
                          <div className="quiz-print-line" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="lead">10 questões sobre a atividade. Você pode errar e aprender — a explicação aparece após cada resposta.</p>

                    <div className="quiz-progress">
                      {QUIZ.map((_, i) => (
                        <div key={i} className={`quiz-pip${i < currentQ ? ' done' : i === currentQ ? ' current' : ''}`} />
                      ))}
                    </div>

                    {!quizFinished ? (
                      <div className="quiz-q">
                        <h3 dangerouslySetInnerHTML={{ __html: QUIZ[currentQ].q }} />

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
                                {currentQ < 9 ? 'Próxima →' : 'Ver resultado →'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="score-card">
                        <div style={{ fontSize: '3rem' }}>🎉</div>
                        <div className="score-num">{score}/10</div>
                        <p className="score-msg">
                          {score <= 3 && 'Não desanime! Revise os módulos e tente novamente. Você consegue! 💪'}
                          {score >= 4 && score <= 6 && 'Bom começo! Alguns conceitos ainda precisam de atenção. Revise e tente de novo 📚'}
                          {score >= 7 && score <= 8 && 'Muito bem! Você absorveu bem o conteúdo. Implemente a API no seu computador! 🚀'}
                          {score >= 9 && 'Excelente! Você dominou os relacionamentos e o CRUD. Agora adicione persistência com SQLite! 🏆'}
                        </p>
                        <button className="btn-outline btn-pabd" onClick={restartQuiz}>Tentar novamente</button>
                      </div>
                    )}
                  </>
                )}

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(6)}>← Código Completo</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(0)}>Início ↑</button>
                </div>
              </div>
            </LessonSection>
          )}
        </>
      )}
    </LessonLayout>
  )
}
