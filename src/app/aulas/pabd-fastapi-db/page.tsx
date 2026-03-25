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
    q: '1. Por que usar banco de dados em vez de armazenar dados em memória?',
    opts: [
      { t: 'Porque o banco de dados é mais rápido que uma lista Python', c: false },
      { t: 'Porque os dados persistem entre reinicializações do servidor', c: true },
      { t: 'Porque o FastAPI exige banco de dados obrigatoriamente', c: false },
      { t: 'Porque listas Python não suportam mais de 100 itens', c: false },
    ],
    ok: 'Correto! Dados em memória são perdidos ao reiniciar o servidor. Com banco de dados, os dados persistem independentemente do ciclo de vida da aplicação.',
    err: 'Errado. A principal vantagem do banco de dados é a persistência — os dados sobrevivem ao reinício do servidor.',
  },
  {
    q: '2. O que é SQLite e qual sua principal vantagem para desenvolvimento?',
    opts: [
      { t: 'Um banco de dados em nuvem com alta disponibilidade', c: false },
      { t: 'Um banco de dados relacional que armazena tudo em um único arquivo .db, sem servidor separado', c: true },
      { t: 'Um ORM para Python que abstrai queries SQL', c: false },
      { t: 'Um tipo especial de dicionário Python para armazenar dados', c: false },
    ],
    ok: 'Exato! SQLite é serverless — sem instalação, sem configuração de servidor. Tudo em um arquivo .db. Perfeito para desenvolvimento e projetos pequenos.',
    err: 'Incorreto. SQLite é um banco de dados de arquivo único — não precisa de servidor separado. É a opção mais simples para começar com SQL.',
  },
  {
    q: '3. Por que deve-se usar parâmetros ? nas queries SQL em vez de concatenar strings?',
    opts: [
      { t: 'Porque o Python não consegue concatenar strings com SQL', c: false },
      { t: 'Para evitar ataques de SQL Injection, onde dados maliciosos poderiam manipular a query', c: true },
      { t: 'Porque a sintaxe com ? é mais rápida de digitar', c: false },
      { t: 'Porque o SQLite só aceita queries com ?', c: false },
    ],
    ok: 'Correto! SQL Injection é um ataque grave onde o usuário envia dados maliciosos interpretados como código SQL. Parâmetros ? evitam isso.',
    err: 'Errado. A razão principal é segurança — SQL Injection pode destruir o banco ou vazar dados. Sempre use parâmetros ?',
  },
  {
    q: '4. O que faz conn.row_factory = sqlite3.Row?',
    opts: [
      { t: 'Define o número máximo de linhas retornadas', c: false },
      { t: 'Permite acessar dados da linha pelo nome da coluna (ex: row["titulo"]) em vez de índice numérico', c: true },
      { t: 'Cria automaticamente uma tabela chamada "row"', c: false },
      { t: 'Converte dados para objetos Pydantic automaticamente', c: false },
    ],
    ok: 'Exato! Com row_factory = sqlite3.Row podemos acessar row["titulo"] em vez de row[1], tornando o código mais legível.',
    err: 'Errado. Essa configuração permite acesso por nome (row["titulo"]) em vez de índice (row[1]), tornando o código muito mais legível.',
  },
  {
    q: '5. Qual é a função do CREATE TABLE IF NOT EXISTS no script de inicialização?',
    opts: [
      { t: 'Deleta a tabela e a recria sempre que a API inicia', c: false },
      { t: 'Cria a tabela apenas se ela ainda não existir, evitando erro em reinicializações', c: true },
      { t: 'Verifica se há dados na tabela antes de criar', c: false },
      { t: 'Cria a tabela temporária na memória', c: false },
    ],
    ok: 'Correto! IF NOT EXISTS garante que podemos chamar o script de inicialização toda vez que a API sobe sem apagar dados existentes.',
    err: 'Errado. IF NOT EXISTS é uma proteção — roda o CREATE TABLE com segurança mesmo que a tabela já exista.',
  },
  {
    q: '6. Qual a função de conn.commit() após um INSERT, UPDATE ou DELETE?',
    opts: [
      { t: 'Fecha a conexão com o banco de dados', c: false },
      { t: 'Confirma a transação, gravando as alterações permanentemente no arquivo .db', c: true },
      { t: 'Retorna os dados inseridos como um dicionário', c: false },
      { t: 'Verifica se os dados foram gravados corretamente', c: false },
    ],
    ok: 'Correto! commit() confirma a transação. Sem commit(), as alterações ficam apenas na transação em memória e são descartadas ao fechar a conexão.',
    err: 'Errado. commit() é essencial para persistir mudanças. Sem ele, INSERT/UPDATE/DELETE não são gravados no arquivo .db.',
  },
  {
    q: '7. Por que separamos a lógica do banco em um arquivo database.py?',
    opts: [
      { t: 'Porque o FastAPI exige que conexões fiquem em arquivos separados', c: false },
      { t: 'Para organizar o código — separação de responsabilidades entre rotas (main.py) e banco (database.py)', c: true },
      { t: 'Porque o SQLite só funciona com arquivos chamados database.py', c: false },
      { t: 'Para tornar o código mais lento e seguro', c: false },
    ],
    ok: 'Correto! Separação de responsabilidades é um princípio de design. main.py cuida das rotas, database.py cuida do banco — cada arquivo tem sua função.',
    err: 'Errado. É uma questão de organização: cada arquivo tem uma responsabilidade clara. Isso facilita manutenção e testes.',
  },
  {
    q: '8. Ao fazer um DELETE de uma tarefa inexistente, o endpoint deve retornar:',
    opts: [
      { t: '200 OK com uma lista vazia', c: false },
      { t: '204 No Content sempre, independente de encontrar ou não', c: false },
      { t: '404 Not Found, pois o recurso solicitado não existe', c: true },
      { t: '500 Internal Server Error', c: false },
    ],
    ok: 'Correto! Se o recurso não existe, retornamos 404 Not Found com HTTPException. Retornar 204 seria mentir ao cliente que a operação foi bem-sucedida.',
    err: 'Errado. Tentar deletar algo que não existe é um erro do cliente — 404 Not Found é a resposta correta.',
  },
  {
    q: '9. Qual instrução SQL é usada para atualizar dados existentes?',
    opts: [
      { t: 'INSERT INTO ... WHERE', c: false },
      { t: 'MODIFY TABLE ... SET', c: false },
      { t: 'UPDATE ... SET ... WHERE', c: true },
      { t: 'REPLACE INTO ...', c: false },
    ],
    ok: 'Correto! UPDATE tabela SET coluna = valor WHERE condição é a sintaxe padrão SQL para atualizar registros existentes.',
    err: 'Errado. A sintaxe correta é UPDATE tarefas SET titulo = ?, descricao = ? WHERE id = ?',
  },
  {
    q: '10. Como o lifespan do FastAPI é usado nesta aula?',
    opts: [
      { t: 'Para limitar o tempo de resposta de cada requisição', c: false },
      { t: 'Para executar init_db() na inicialização da aplicação, criando a tabela automaticamente', c: true },
      { t: 'Para fechar o banco de dados após cada requisição', c: false },
      { t: 'Para configurar o timeout de conexão com SQLite', c: false },
    ],
    ok: 'Perfeito! O lifespan é um context manager que roda código de setup antes da API receber requisições — ideal para criar tabelas ao iniciar.',
    err: 'Errado. O lifespan nos permite executar init_db() ao subir a API, garantindo que a tabela existe antes de qualquer requisição chegar.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Módulo 1', 'Módulo 2', 'Módulo 3', 'Quiz']

/* ─── Main component ────────────────────────────────────────── */
export default function PABDDbPage() {
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
                <div className="pabd-hero-badge">Informática - Programação com Acesso a Banco de Dados (PABD) - AULA 02</div>
                <h1>
                  FastAPI com<br />
                  <span className="accent-text">Banco de Dados</span> <em>SQLite</em>
                </h1>
                <p>Continuando da Aula 1 — conectamos nossa API de tarefas a um banco de dados real. Os dados agora persistem entre reinicializações.</p>
                <div className="pabd-hero-cta">
                  <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Começar Aula</button>
                  <button className="btn-outline btn-pabd" onClick={() => goTo(5)}>⚡ Ir ao Quiz</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 1: Sumário ── */}
          {(current === 1 || exportMode) && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">ÍNDICE</div>
                <h2>Sumário da <span className="accent-text">Aula 2</span></h2>
                <p className="lead">Esta aula parte do CRUD em memória da Aula 1 e adiciona persistência com SQLite.</p>

                <div className="toc-progress-row">
                  <span>PROGRESSO</span>
                  <div className="toc-progress-bar">
                    <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4].includes(v)).length / 3) * 100}%` }} />
                  </div>
                  <span>{visited.filter(v => [2,3,4].includes(v)).length} / 3</span>
                </div>

                <div className="toc-grid">
                  {[
                    { n: 2, num: '01', title: 'SQLite & Estrutura do Projeto', desc: 'Por que SQLite, database.py e CREATE TABLE' },
                    { n: 3, num: '02', title: 'CRUD com Banco de Dados', desc: 'POST, GET, PUT e DELETE persistindo no .db' },
                    { n: 4, num: '03', title: 'Arquivo Completo & Boas Práticas', desc: 'main.py final, git e próximos passos' },
                  ].map(({ n, num, title, desc }) => (
                    <button key={n} className={`toc-card${visited.includes(n) ? ' visited' : ''}`} onClick={() => goTo(n)}>
                      <div className="toc-num">{num}</div>
                      <div className="toc-content"><h3>{title}</h3><p>{desc}</p></div>
                      <div className="toc-arrow">→</div>
                    </button>
                  ))}
                  <button className={`toc-card${visited.includes(5) ? ' visited' : ''}`} onClick={() => goTo(5)}>
                    <div className="toc-num quiz-num">⚡</div>
                    <div className="toc-content"><h3>Quiz Final</h3><p>10 questões sobre SQLite e persistência</p></div>
                    <div className="toc-arrow">→</div>
                  </button>
                </div>

                <InfoBox label="📌 PRÉ-REQUISITO">
                  Esta aula assume que você completou a <strong>Aula 1</strong> e tem o projeto <code>minha-api</code> com FastAPI e uv configurados.
                </InfoBox>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(0)}>← Início</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(2)}>Módulo 1 →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 2: Módulo 1 — SQLite & Estrutura ── */}
          {(current === 2 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 01</div>
                  <h2>SQLite &amp; <span className="accent-text">Estrutura do Projeto</span></h2>
                  <p className="lead">Na Aula 1, os dados viviam em uma lista Python — ao reiniciar o servidor, tudo se perdia. Agora vamos conectar a mesma API a um banco de dados SQLite para que os dados persistam.</p>

                  <div className="feature-card-grid">
                    <div className="feature-card"><div className="card-icon">📁</div><h3>Arquivo único</h3><p>SQLite armazena tudo em um arquivo <code>.db</code>. Sem instalação de servidor, sem configuração extra.</p></div>
                    <div className="feature-card"><div className="card-icon">🐍</div><h3>Incluso no Python</h3><p>O módulo <code>sqlite3</code> já vem na biblioteca padrão — zero dependências adicionais.</p></div>
                    <div className="feature-card"><div className="card-icon">💾</div><h3>Persistência</h3><p>Dados gravados no <code>.db</code> sobrevivem a reinicializações, falhas e atualizações de código.</p></div>
                  </div>
                </div>

                <StepBlock num="01" title="Por que SQLite?" defaultOpen forceOpen={exportMode}>
                  <p>Compare os dois modelos de armazenamento:</p>
                  <div className="card">
                    <table className="pabd-table">
                      <thead><tr><th>Aspecto</th><th>Lista em Memória (Aula 1)</th><th>SQLite (Aula 2)</th></tr></thead>
                      <tbody>
                        <tr><td>Persistência</td><td>❌ Perde ao reiniciar</td><td>✅ Permanente no .db</td></tr>
                        <tr><td>Instalação</td><td>✅ Nenhuma</td><td>✅ Incluso no Python</td></tr>
                        <tr><td>Consultas</td><td>Loop Python manual</td><td>SQL — filtros, ordenação</td></tr>
                        <tr><td>Escala</td><td>Limitado à RAM</td><td>Milhões de registros</td></tr>
                        <tr><td>Ideal para</td><td>Prototipagem rápida</td><td>Desenvolvimento e projetos pequenos</td></tr>
                      </tbody>
                    </table>
                  </div>
                </StepBlock>

                <StepBlock num="02" title="Nova estrutura de arquivos" forceOpen={exportMode}>
                  <p>Vamos organizar o projeto em três arquivos com responsabilidades distintas:</p>
                  <CodeBlock lang="ESTRUTURA" html={`minha-api/
├── main.py          <span class="cmt">← rotas FastAPI (mantemos e adaptamos)</span>
├── database.py      <span class="cmt">← conexão e inicialização do SQLite (NOVO)</span>
├── models.py        <span class="cmt">← modelos Pydantic (NOVO — separamos do main.py)</span>
├── tarefas.db       <span class="cmt">← arquivo do banco (criado automaticamente)</span>
├── pyproject.toml
└── .gitignore`} />
                  <InfoBox label="📌 CONCEITO — Separação de Responsabilidades">
                    Cada arquivo tem uma função clara: <code>main.py</code> define as rotas, <code>database.py</code> gerencia o banco, <code>models.py</code> define os schemas. Isso facilita manutenção e leitura do código.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="03" title="Criar models.py" forceOpen={exportMode}>
                  <p>Movemos os modelos Pydantic para um arquivo dedicado:</p>
                  <CodeBlock lang="PYTHON — models.py" html={`<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel

<span class="kw">class</span> <span class="cls">TarefaEntrada</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">Tarefa</span>(<span class="cls">TarefaEntrada</span>):
    id: <span class="cls">str</span>`} />
                </StepBlock>

                <StepBlock num="04" title="Criar database.py" forceOpen={exportMode}>
                  <p>Este arquivo concentra tudo relacionado ao SQLite: conexão, criação de tabelas e configurações.</p>
                  <CodeBlock lang="PYTHON — database.py" html={`<span class="kw">import</span> sqlite3

<span class="cmt"># Caminho do arquivo do banco de dados</span>
DB_PATH = <span class="str">"tarefas.db"</span>

<span class="kw">def</span> <span class="fn">get_conn</span>() -> sqlite3.Connection:
    <span class="cmt">"""Abre e retorna uma conexão com o banco."""</span>
    conn = sqlite3.<span class="fn">connect</span>(DB_PATH)
    <span class="cmt"># Permite acessar colunas pelo nome: row["titulo"]</span>
    conn.row_factory = sqlite3.Row
    <span class="kw">return</span> conn

<span class="kw">def</span> <span class="fn">init_db</span>():
    <span class="cmt">"""Cria a tabela se ela ainda não existir."""</span>
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        conn.<span class="fn">execute</span>(<span class="str">"""
            CREATE TABLE IF NOT EXISTS tarefas (
                id        TEXT PRIMARY KEY,
                titulo    TEXT NOT NULL,
                descricao TEXT NOT NULL,
                concluida INTEGER NOT NULL DEFAULT 0
            )
        """</span>)
        conn.<span class="fn">commit</span>()`} />
                  <InfoBox label="📌 CONCEITO — row_factory">
                    Com <code>conn.row_factory = sqlite3.Row</code>, cada linha retornada pelo SQLite vira um objeto que aceita acesso por nome: <code>row[&quot;titulo&quot;]</code> em vez de <code>row[1]</code>. Muito mais legível.
                  </InfoBox>
                  <InfoBox variant="tip" label="💡 CREATE TABLE IF NOT EXISTS">
                    O <code>IF NOT EXISTS</code> garante que a função <code>init_db()</code> pode ser chamada toda vez que a API inicia — se a tabela já existe, nada acontece. Se não existe, ela é criada.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="05" title="Atualizar .gitignore" forceOpen={exportMode}>
                  <p>Adicione o arquivo de banco de dados ao <code>.gitignore</code> — não faz sentido versionar dados:</p>
                  <CodeBlock lang=".gitignore — adicionar linha" html={`.venv/
__pycache__/
*.pyc
.env
<span class="cmt">*.db      ← adicionar esta linha</span>`} />
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(1)}>← Sumário</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(3)}>CRUD com Banco →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 3: Módulo 2 — CRUD com SQLite ── */}
          {(current === 3 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 02</div>
                  <h2>CRUD com <span className="accent-text">Banco de Dados</span></h2>
                  <p className="lead">Agora reescrevemos o <code>main.py</code> substituindo as operações na lista Python por queries SQL. A estrutura dos endpoints é idêntica à Aula 1 — só muda onde os dados são armazenados.</p>
                </div>

                <StepBlock num="01" title="Configurar o lifespan (inicialização)" defaultOpen forceOpen={exportMode}>
                  <p>O <code>lifespan</code> é um context manager do FastAPI que executa código de setup antes da API começar a atender requisições — perfeito para criar o banco:</p>
                  <CodeBlock lang="PYTHON — início do main.py" html={`<span class="kw">from</span> contextlib <span class="kw">import</span> asynccontextmanager
<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI, HTTPException
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

<span class="kw">from</span> database <span class="kw">import</span> get_conn, init_db
<span class="kw">from</span> models <span class="kw">import</span> Tarefa, TarefaEntrada

<span class="dec">@asynccontextmanager</span>
<span class="kw">async def</span> <span class="fn">lifespan</span>(app: <span class="cls">FastAPI</span>):
    <span class="cmt"># Executado na inicialização: cria tabelas se não existirem</span>
    <span class="fn">init_db</span>()
    <span class="kw">yield</span>
    <span class="cmt"># Executado no encerramento (se necessário)</span>

app = <span class="fn">FastAPI</span>(title=<span class="str">"API de Tarefas"</span>, version=<span class="str">"2.0.0"</span>, lifespan=lifespan)`} />
                </StepBlock>

                <StepBlock num="02" title="Endpoint: Criar tarefa (POST)" forceOpen={exportMode}>
                  <div className="endpoint-row"><span className="method-pill post">POST</span> /tarefas</div>
                  <CodeBlock lang="PYTHON — main.py" html={`<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">Tarefa</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(dados: <span class="cls">TarefaEntrada</span>):
    tarefa_id = <span class="cls">str</span>(uuid.<span class="fn">uuid4</span>())

    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        conn.<span class="fn">execute</span>(
            <span class="str">"INSERT INTO tarefas (id, titulo, descricao, concluida) VALUES (?, ?, ?, ?)"</span>,
            (tarefa_id, dados.titulo, dados.descricao, <span class="cls">int</span>(dados.concluida))
        )
        conn.<span class="fn">commit</span>()

    <span class="kw">return</span> <span class="cls">Tarefa</span>(id=tarefa_id, **dados.<span class="fn">model_dump</span>())`} />
                  <InfoBox variant="warn" label="⚠️ SQL Injection">
                    Sempre use parâmetros <code>?</code> nas queries SQL — <strong>nunca concatene</strong> strings! <code>&quot;... WHERE id = &apos;&quot; + id + &quot;&apos;&quot;</code> é uma vulnerabilidade grave.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="03" title="Endpoint: Listar tarefas (GET)" forceOpen={exportMode}>
                  <div className="endpoint-row"><span className="method-pill get">GET</span> /tarefas</div>
                  <CodeBlock lang="PYTHON — main.py" html={`<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">Tarefa</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        rows = conn.<span class="fn">execute</span>(
            <span class="str">"SELECT id, titulo, descricao, concluida FROM tarefas"</span>
        ).<span class="fn">fetchall</span>()

    <span class="kw">return</span> [
        <span class="cls">Tarefa</span>(
            id=row[<span class="str">"id"</span>],
            titulo=row[<span class="str">"titulo"</span>],
            descricao=row[<span class="str">"descricao"</span>],
            concluida=<span class="cls">bool</span>(row[<span class="str">"concluida"</span>])
        )
        <span class="kw">for</span> row <span class="kw">in</span> rows
    ]`} />
                  <InfoBox label="📌 CONCEITO — bool(row[&quot;concluida&quot;])">
                    O SQLite armazena booleanos como inteiros (0 ou 1). Convertemos de volta para <code>bool</code> ao ler — assim o JSON retornado terá <code>true</code>/<code>false</code> corretos.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="04" title="Endpoint: Buscar por ID (GET)" forceOpen={exportMode}>
                  <div className="endpoint-row"><span className="method-pill get">GET</span> /tarefas/{'{id}'}</div>
                  <CodeBlock lang="PYTHON — main.py" html={`<span class="dec">@app.get</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">buscar_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        row = conn.<span class="fn">execute</span>(
            <span class="str">"SELECT id, titulo, descricao, concluida FROM tarefas WHERE id = ?"</span>,
            (id,)
        ).<span class="fn">fetchone</span>()

    <span class="kw">if</span> row <span class="kw">is None</span>:
        <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)

    <span class="kw">return</span> <span class="cls">Tarefa</span>(
        id=row[<span class="str">"id"</span>],
        titulo=row[<span class="str">"titulo"</span>],
        descricao=row[<span class="str">"descricao"</span>],
        concluida=<span class="cls">bool</span>(row[<span class="str">"concluida"</span>])
    )`} />
                </StepBlock>

                <StepBlock num="05" title="Endpoint: Editar tarefa (PUT)" forceOpen={exportMode}>
                  <div className="endpoint-row"><span className="method-pill put">PUT</span> /tarefas/{'{id}'}</div>
                  <CodeBlock lang="PYTHON — main.py" html={`<span class="dec">@app.put</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">editar_tarefa</span>(id: <span class="cls">str</span>, dados: <span class="cls">TarefaEntrada</span>):
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        resultado = conn.<span class="fn">execute</span>(
            <span class="str">"""UPDATE tarefas
               SET titulo = ?, descricao = ?, concluida = ?
               WHERE id = ?"""</span>,
            (dados.titulo, dados.descricao, <span class="cls">int</span>(dados.concluida), id)
        )
        conn.<span class="fn">commit</span>()

    <span class="kw">if</span> resultado.rowcount == <span class="num">0</span>:
        <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)

    <span class="kw">return</span> <span class="cls">Tarefa</span>(id=id, **dados.<span class="fn">model_dump</span>())`} />
                  <InfoBox label="📌 CONCEITO — rowcount">
                    <code>cursor.rowcount</code> informa quantas linhas foram afetadas pelo UPDATE. Se for 0, significa que nenhuma linha tinha aquele ID — retornamos 404.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="06" title="Endpoint: Remover tarefa (DELETE)" forceOpen={exportMode}>
                  <div className="endpoint-row"><span className="method-pill delete">DELETE</span> /tarefas/{'{id}'}</div>
                  <CodeBlock lang="PYTHON — main.py" html={`<span class="dec">@app.delete</span>(<span class="str">"/tarefas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        resultado = conn.<span class="fn">execute</span>(
            <span class="str">"DELETE FROM tarefas WHERE id = ?"</span>,
            (id,)
        )
        conn.<span class="fn">commit</span>()

    <span class="kw">if</span> resultado.rowcount == <span class="num">0</span>:
        <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)`} />
                </StepBlock>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Arquivo Completo →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 4: Módulo 3 — Arquivo Completo & Boas Práticas ── */}
          {(current === 4 || exportMode) && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 03</div>
                  <h2>Arquivo Completo &amp; <span className="accent-text">Boas Práticas</span></h2>
                  <p className="lead">Juntando tudo — os três arquivos completos, como rodar, testar e salvar no GitHub.</p>
                </div>

                <StepBlock num="01" title="database.py completo" defaultOpen forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON — database.py" html={`<span class="kw">import</span> sqlite3

DB_PATH = <span class="str">"tarefas.db"</span>

<span class="kw">def</span> <span class="fn">get_conn</span>() -> sqlite3.Connection:
    conn = sqlite3.<span class="fn">connect</span>(DB_PATH)
    conn.row_factory = sqlite3.Row
    <span class="kw">return</span> conn

<span class="kw">def</span> <span class="fn">init_db</span>():
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        conn.<span class="fn">execute</span>(<span class="str">"""
            CREATE TABLE IF NOT EXISTS tarefas (
                id        TEXT PRIMARY KEY,
                titulo    TEXT NOT NULL,
                descricao TEXT NOT NULL,
                concluida INTEGER NOT NULL DEFAULT 0
            )
        """</span>)
        conn.<span class="fn">commit</span>()`} />
                </StepBlock>

                <StepBlock num="02" title="models.py completo" forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON — models.py" html={`<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel

<span class="kw">class</span> <span class="cls">TarefaEntrada</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">Tarefa</span>(<span class="cls">TarefaEntrada</span>):
    id: <span class="cls">str</span>`} />
                </StepBlock>

                <StepBlock num="03" title="main.py completo" forceOpen={exportMode}>
                  <CodeBlock lang="PYTHON — main.py completo" html={`<span class="kw">from</span> contextlib <span class="kw">import</span> asynccontextmanager
<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI, HTTPException
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

<span class="kw">from</span> database <span class="kw">import</span> get_conn, init_db
<span class="kw">from</span> models <span class="kw">import</span> Tarefa, TarefaEntrada

<span class="dec">@asynccontextmanager</span>
<span class="kw">async def</span> <span class="fn">lifespan</span>(app: <span class="cls">FastAPI</span>):
    <span class="fn">init_db</span>()
    <span class="kw">yield</span>

app = <span class="fn">FastAPI</span>(title=<span class="str">"API de Tarefas"</span>, version=<span class="str">"2.0.0"</span>, lifespan=lifespan)

<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API de Tarefas v2 com SQLite! 🗄️"</span>}

<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">Tarefa</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(dados: <span class="cls">TarefaEntrada</span>):
    tarefa_id = <span class="cls">str</span>(uuid.<span class="fn">uuid4</span>())
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        conn.<span class="fn">execute</span>(
            <span class="str">"INSERT INTO tarefas (id, titulo, descricao, concluida) VALUES (?, ?, ?, ?)"</span>,
            (tarefa_id, dados.titulo, dados.descricao, <span class="cls">int</span>(dados.concluida))
        )
        conn.<span class="fn">commit</span>()
    <span class="kw">return</span> <span class="cls">Tarefa</span>(id=tarefa_id, **dados.<span class="fn">model_dump</span>())

<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">Tarefa</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        rows = conn.<span class="fn">execute</span>(
            <span class="str">"SELECT id, titulo, descricao, concluida FROM tarefas"</span>
        ).<span class="fn">fetchall</span>()
    <span class="kw">return</span> [<span class="cls">Tarefa</span>(id=r[<span class="str">"id"</span>], titulo=r[<span class="str">"titulo"</span>], descricao=r[<span class="str">"descricao"</span>], concluida=<span class="cls">bool</span>(r[<span class="str">"concluida"</span>])) <span class="kw">for</span> r <span class="kw">in</span> rows]

<span class="dec">@app.get</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">buscar_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        row = conn.<span class="fn">execute</span>(
            <span class="str">"SELECT id, titulo, descricao, concluida FROM tarefas WHERE id = ?"</span>, (id,)
        ).<span class="fn">fetchone</span>()
    <span class="kw">if</span> row <span class="kw">is None</span>:
        <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)
    <span class="kw">return</span> <span class="cls">Tarefa</span>(id=row[<span class="str">"id"</span>], titulo=row[<span class="str">"titulo"</span>], descricao=row[<span class="str">"descricao"</span>], concluida=<span class="cls">bool</span>(row[<span class="str">"concluida"</span>]))

<span class="dec">@app.put</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">editar_tarefa</span>(id: <span class="cls">str</span>, dados: <span class="cls">TarefaEntrada</span>):
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        res = conn.<span class="fn">execute</span>(
            <span class="str">"UPDATE tarefas SET titulo = ?, descricao = ?, concluida = ? WHERE id = ?"</span>,
            (dados.titulo, dados.descricao, <span class="cls">int</span>(dados.concluida), id)
        )
        conn.<span class="fn">commit</span>()
    <span class="kw">if</span> res.rowcount == <span class="num">0</span>:
        <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)
    <span class="kw">return</span> <span class="cls">Tarefa</span>(id=id, **dados.<span class="fn">model_dump</span>())

<span class="dec">@app.delete</span>(<span class="str">"/tarefas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        res = conn.<span class="fn">execute</span>(
            <span class="str">"DELETE FROM tarefas WHERE id = ?"</span>, (id,)
        )
        conn.<span class="fn">commit</span>()
    <span class="kw">if</span> res.rowcount == <span class="num">0</span>:
        <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)`} />
                </StepBlock>

                <StepBlock num="04" title="Rodar e testar" forceOpen={exportMode}>
                  <CodeBlock lang="BASH" html={`<span class="cmt"># Iniciar o servidor</span>
uvicorn main:app --reload

<span class="cmt"># Ao iniciar, init_db() é chamado e tarefas.db é criado automaticamente</span>
<span class="cmt"># Acesse: http://localhost:8000/docs</span>`} />
                  <CodeBlock lang="BASH — testar com curl" html={`<span class="cmt"># Criar uma tarefa</span>
curl -X POST http://localhost:8000/tarefas \
  -H <span class="str">"Content-Type: application/json"</span> \
  -d <span class="str">'{"titulo": "Estudar SQLite", "descricao": "Praticar queries"}'</span>

<span class="cmt"># Listar todas</span>
curl http://localhost:8000/tarefas

<span class="cmt"># Reiniciar o servidor e listar novamente — dados persistem!</span></span>`} />
                  <InfoBox variant="tip" label="💡 DICA">
                    Pare o servidor com <code>Ctrl+C</code>, inicie novamente com <code>uvicorn main:app --reload</code> e liste as tarefas. Os dados ainda estão lá — essa é a diferença do banco de dados!
                  </InfoBox>
                </StepBlock>

                <StepBlock num="05" title="Salvar progresso no GitHub" forceOpen={exportMode}>
                  <CodeBlock lang="BASH" html={`git add main.py database.py models.py .gitignore
git commit -m <span class="str">"feat: conecta API ao SQLite para persistência de dados"</span>
git push`} />
                </StepBlock>

                <div className="chapter-divider">RESUMO DA ARQUITETURA</div>
                <div className="card">
                  <table className="pabd-table">
                    <thead><tr><th>Camada</th><th>Arquivo</th><th>Responsabilidade</th></tr></thead>
                    <tbody>
                      <tr><td>API</td><td><code>main.py</code></td><td>Rotas, lógica de negócio, validação</td></tr>
                      <tr><td>Banco</td><td><code>database.py</code></td><td>Conexão SQLite, criação de tabelas</td></tr>
                      <tr><td>Schema</td><td><code>models.py</code></td><td>Modelos Pydantic (entrada e resposta)</td></tr>
                      <tr><td>Dados</td><td><code>tarefas.db</code></td><td>Arquivo SQLite gerado automaticamente</td></tr>
                      <tr><td>Config</td><td><code>pyproject.toml</code></td><td>Dependências do projeto</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Quiz →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 5: Quiz ── */}
          {(current === 5 || exportMode) && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">AVALIAÇÃO</div>
                <h2>Quiz — Teste seus <span className="accent-text">conhecimentos</span></h2>

                {exportMode ? (
                  /* Print view: questions only */
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
                <p className="lead">10 questões sobre SQLite, persistência e boas práticas. A explicação aparece após cada resposta.</p>

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
                      {score >= 7 && score <= 8 && 'Muito bem! Você absorveu bem o conteúdo. Pratique os exemplos no terminal 🚀'}
                      {score >= 9 && 'Excelente! Você dominou o conteúdo da aula. Explore SQLAlchemy como próximo passo! 🏆'}
                    </p>
                    <div className="score-btns">
                      <button className="btn-primary btn-pabd" onClick={restartQuiz}>↺ Refazer Quiz</button>
                      <button className="btn-outline btn-pabd" onClick={() => goTo(2)}>← Revisar Módulo 1</button>
                    </div>
                  </div>
                )}

                </>
                )}

                <div className="section-nav" style={{ marginTop: '2rem' }}>
                  <button className="btn-outline" onClick={() => goTo(4)}>← Módulo 3</button>
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
