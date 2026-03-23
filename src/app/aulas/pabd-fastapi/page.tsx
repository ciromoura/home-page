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
    q: '1. O que é um ambiente virtual em Python?',
    opts: [
      { t: 'Um servidor virtual na nuvem para hospedar código Python', c: false },
      { t: 'Um diretório isolado que contém um interpretador Python e dependências específicas de um projeto', c: true },
      { t: 'Uma máquina virtual como VirtualBox para rodar Linux', c: false },
      { t: 'Um ambiente de editor de código como o VS Code', c: false },
    ],
    ok: 'Correto! Um ambiente virtual é uma pasta isolada com Python e dependências específicas do projeto, evitando conflitos entre projetos.',
    err: 'Não. Ambiente virtual é uma pasta local no seu computador, não um servidor. Ele isola as dependências do projeto.',
  },
  {
    q: '2. Qual comando do uv cria e ativa um ambiente virtual?',
    opts: [
      { t: 'uv install venv', c: false },
      { t: 'uv create env', c: false },
      { t: 'uv venv (cria) + source .venv/bin/activate (ativa)', c: true },
      { t: 'pip venv activate', c: false },
    ],
    ok: 'Certo! uv venv cria o ambiente e o comando source (Linux/macOS) ou .venv\\Scripts\\activate (Windows) o ativa.',
    err: 'Incorreto. O fluxo correto é: uv venv para criar e depois source .venv/bin/activate para ativar no Linux/macOS.',
  },
  {
    q: '3. Para que serve o arquivo .gitignore?',
    opts: [
      { t: 'Armazena as credenciais do GitHub', c: false },
      { t: 'Indica ao Git quais arquivos e pastas não devem ser versionados', c: true },
      { t: 'Configura as dependências do projeto Python', c: false },
      { t: 'Define as rotas da API FastAPI', c: false },
    ],
    ok: 'Exato! O .gitignore lista padrões de arquivos que o Git deve ignorar, como a pasta .venv e arquivos temporários.',
    err: 'Errado. O .gitignore instrui o Git a não rastrear certos arquivos — como a pasta .venv que pode ser recriada.',
  },
  {
    q: '4. Qual é a função do Uvicorn no contexto do FastAPI?',
    opts: [
      { t: 'É o banco de dados padrão do FastAPI', c: false },
      { t: 'É a biblioteca que valida os dados de entrada', c: false },
      { t: 'É o servidor ASGI que recebe requisições HTTP e repassa para a aplicação FastAPI', c: true },
      { t: 'É o gerenciador de pacotes Python', c: false },
    ],
    ok: 'Perfeito! Uvicorn é um servidor ASGI (Asynchronous Server Gateway Interface) que fica "na frente" do FastAPI recebendo requisições HTTP.',
    err: 'Não. O Uvicorn é o servidor web, não banco nem biblioteca de validação. FastAPI = framework; Uvicorn = servidor.',
  },
  {
    q: '5. Qual decorator é usado para criar um endpoint que recebe dados e salva (criação)?',
    opts: [
      { t: '@app.get', c: false },
      { t: '@app.post', c: true },
      { t: '@app.create', c: false },
      { t: '@app.save', c: false },
    ],
    ok: 'Correto! @app.post registra a rota para o método HTTP POST, usado convencionalmente para criar recursos.',
    err: 'Errado. @app.get é para leitura. Para criar/enviar dados, usamos @app.post conforme a convenção REST.',
  },
  {
    q: '6. O que é Pydantic no contexto do FastAPI?',
    opts: [
      { t: 'Um banco de dados relacional para Python', c: false },
      { t: 'Um servidor web alternativo ao Uvicorn', c: false },
      { t: 'Uma biblioteca de validação e serialização de dados usando anotações de tipo Python', c: true },
      { t: 'Um ORM para fazer consultas SQL', c: false },
    ],
    ok: 'Exato! Pydantic valida os dados automaticamente usando as anotações de tipo Python, gerando erros claros quando os dados são inválidos.',
    err: 'Incorreto. Pydantic é uma biblioteca de validação de dados, não banco nem servidor. Ele garante que os dados recebidos têm o formato correto.',
  },
  {
    q: '7. Por que deve-se usar ? (parâmetros) nas queries SQL em vez de concatenar strings?',
    opts: [
      { t: 'Porque o Python não consegue concatenar strings com SQL', c: false },
      { t: 'Para evitar ataques de SQL Injection, onde dados maliciosos do usuário poderiam manipular a query', c: true },
      { t: 'Porque a sintaxe com ? é mais rápida de digitar', c: false },
      { t: 'Porque o SQLite só aceita queries com ?', c: false },
    ],
    ok: 'Correto! SQL Injection é um ataque onde o usuário envia dados maliciosos que são interpretados como código SQL. Parâmetros ? evitam isso.',
    err: 'Errado. A razão principal é segurança — SQL Injection pode destruir o banco ou vazar dados. Sempre use parâmetros ?',
  },
  {
    q: '8. Qual é a URL padrão da documentação automática do FastAPI (Swagger)?',
    opts: [
      { t: 'http://localhost:8000/swagger', c: false },
      { t: 'http://localhost:8000/api', c: false },
      { t: 'http://localhost:8000/docs', c: true },
      { t: 'http://localhost:8000/help', c: false },
    ],
    ok: 'Certo! FastAPI gera a documentação Swagger automaticamente em /docs e a documentação ReDoc em /redoc.',
    err: 'Incorreto. A URL correta é /docs. Esta é uma das grandes vantagens do FastAPI — documentação automática e interativa.',
  },
  {
    q: '9. O que faz o conn.row_factory = sqlite3.Row na conexão SQLite?',
    opts: [
      { t: 'Define o número máximo de linhas retornadas', c: false },
      { t: 'Permite acessar os dados da linha pelo nome da coluna (ex: row["titulo"]) em vez de índice numérico', c: true },
      { t: 'Cria automaticamente uma tabela chamada "row"', c: false },
      { t: 'Converte os dados para objetos Pydantic automaticamente', c: false },
    ],
    ok: 'Exato! Com row_factory = sqlite3.Row, podemos acessar row[\'titulo\'] em vez de row[1], tornando o código mais legível e menos propenso a erros.',
    err: 'Errado. Essa configuração permite acesso por nome (row[\'titulo\']) em vez de índice (row[1]), tornando o código muito mais legível.',
  },
  {
    q: '10. Qual sequência correta de comandos Git para enviar alterações ao GitHub?',
    opts: [
      { t: 'git push → git commit → git add', c: false },
      { t: 'git commit → git add → git push', c: false },
      { t: 'git add → git commit -m "mensagem" → git push', c: true },
      { t: 'git upload → git save → git send', c: false },
    ],
    ok: 'Perfeito! A sequência correta é: 1) git add (seleciona arquivos), 2) git commit (cria snapshot), 3) git push (envia ao GitHub).',
    err: 'Incorreto. A ordem é: git add → git commit → git push. Primeiro seleciona, depois salva localmente, depois envia ao remoto.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Módulo 1', 'Módulo 2', 'Módulo 3', 'Quiz']

/* ─── Main component ────────────────────────────────────────── */
export default function PABDPage() {
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
      {({ current, goTo, visited }) => (
        <>
          {/* ── Section 0: Hero ── */}
          {current === 0 && (
            <LessonSection>
              <div className="pabd-hero">
                <div className="pabd-hero-badge">ENSINO MÉDIO · PROGRAMAÇÃO WEB</div>
                <h1>
                  Construa APIs com<br />
                  <span className="accent-text">FastAPI</span> &amp; <em>Python</em>
                </h1>
                <p>Do ambiente virtual ao banco de dados — aprenda a criar APIs modernas passo a passo, sem enrolação.</p>
                <div className="pabd-hero-cta">
                  <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Começar Aula</button>
                  <button className="btn-outline btn-pabd" onClick={() => goTo(5)}>⚡ Ir ao Quiz</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 1: Sumário ── */}
          {current === 1 && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">ÍNDICE</div>
                <h2>Sumário do <span className="accent-text">Curso</span></h2>
                <p className="lead">Navegue diretamente para qualquer módulo. Recomenda-se seguir a ordem, mas você pode ir a qualquer seção.</p>

                <div className="toc-progress-row">
                  <span>PROGRESSO</span>
                  <div className="toc-progress-bar">
                    <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4].includes(v)).length / 3) * 100}%` }} />
                  </div>
                  <span>{visited.filter(v => [2,3,4].includes(v)).length} / 3</span>
                </div>

                <div className="toc-grid">
                  {[
                    { n: 2, num: '01', title: 'Ambiente Virtual & GitHub', desc: 'uv, venv, git init e push para o GitHub' },
                    { n: 3, num: '02', title: 'Primeiros passos com FastAPI', desc: 'Rotas, parâmetros, Pydantic e docs automáticas' },
                    { n: 4, num: '03', title: 'Conectando ao Banco de Dados', desc: 'SQLite, queries parametrizadas, row_factory e CRUD' },
                  ].map(({ n, num, title, desc }) => (
                    <button key={n} className={`toc-card${visited.includes(n) ? ' visited' : ''}`} onClick={() => goTo(n)}>
                      <div className="toc-num">{num}</div>
                      <div className="toc-content"><h3>{title}</h3><p>{desc}</p></div>
                      <div className="toc-arrow">→</div>
                    </button>
                  ))}
                  <button className={`toc-card${visited.includes(5) ? ' visited' : ''}`} onClick={() => goTo(5)}>
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

          {/* ── Section 2: Módulo 1 — Ambiente Virtual & GitHub ── */}
          {current === 2 && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 01</div>
                  <h2>Ambiente Virtual <span className="accent-text">uv</span> &amp; GitHub</h2>
                  <p className="lead">Antes de escrever qualquer linha de código, precisamos preparar o ambiente. Um ambiente virtual isola as dependências do projeto — pense nele como uma &quot;caixinha&quot; que guarda apenas as bibliotecas que você precisa.</p>

                  <div className="feature-card-grid">
                    <div className="feature-card"><div className="card-icon">⚡</div><h3>O que é uv?</h3><p>Gerenciador de pacotes e ambientes Python ultra-rápido escrito em Rust. Substitui pip + venv em um único comando.</p></div>
                    <div className="feature-card"><div className="card-icon">📦</div><h3>Por que usar?</h3><p>10-100× mais rápido que pip. Resolve conflitos automaticamente e cria lockfiles reproduzíveis.</p></div>
                    <div className="feature-card"><div className="card-icon">🔒</div><h3>Isolamento</h3><p>Cada projeto tem suas próprias dependências. Sem conflito entre versões de bibliotecas.</p></div>
                  </div>
                </div>

                <StepBlock num="01" title="Instalar o uv" defaultOpen>
                  <p>Execute no terminal conforme seu sistema operacional:</p>
                  <CodeBlock lang="BASH — Linux / macOS" html={`<span class="cmt"># Instalação com curl</span>
curl -LsSf https://astral.sh/uv/install.sh | sh

<span class="cmt"># Verificar versão instalada</span>
uv --version`} />
                  <CodeBlock lang="POWERSHELL — Windows" html={`irm https://astral.sh/uv/install.ps1 | iex

uv --version`} />
                  <InfoBox variant="tip" label="💡 DICA">
                    Após instalar, feche e abra o terminal para que o comando <code>uv</code> seja reconhecido.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="Criar e inicializar o projeto">
                  <p>O comando <code>uv init</code> cria a estrutura de pastas e o arquivo <code>pyproject.toml</code> com as configurações do projeto.</p>
                  <CodeBlock lang="BASH" html={`<span class="cmt"># Criar pasta do projeto</span>
uv init minha-api
cd minha-api

<span class="cmt"># Estrutura criada:</span>
<span class="cmt"># minha-api/</span>
<span class="cmt"># ├── pyproject.toml   ← configurações</span>
<span class="cmt"># ├── README.md</span>
<span class="cmt"># └── hello.py</span>`} />
                  <p>Agora crie e ative o ambiente virtual:</p>
                  <CodeBlock lang="BASH" html={`<span class="cmt"># Criar ambiente virtual (.venv)</span>
uv venv

<span class="cmt"># Ativar — Linux/macOS</span>
source .venv/bin/activate

<span class="cmt"># Ativar — Windows</span>
.venv\Scripts\activate

<span class="cmt"># O prefixo (minha-api) aparece no terminal quando ativo</span>`} />
                </StepBlock>

                <StepBlock num="03" title="Conectar ao GitHub">
                  <p>Versionar o código permite colaborar, voltar a versões anteriores e publicar o projeto.</p>
                  <CodeBlock lang="BASH — configurar git" html={`<span class="cmt"># Configuração inicial (apenas uma vez)</span>
git config --global user.name <span class="str">"Seu Nome"</span>
git config --global user.email <span class="str">"seu@email.com"</span>

<span class="cmt"># Inicializar repositório no projeto</span>
git init
git add .
git commit -m <span class="str">"feat: projeto inicial"</span>`} />
                  <p>Crie o arquivo <code>.gitignore</code> para não enviar a pasta <code>.venv</code> ao GitHub:</p>
                  <CodeBlock lang=".gitignore" html={`.venv/
__pycache__/
*.pyc
.env
*.db`} />
                  <p>No <strong>GitHub.com</strong>, crie um repositório novo e execute:</p>
                  <CodeBlock lang="BASH — push para GitHub" html={`git remote add origin https://github.com/seu-usuario/minha-api.git
git branch -M main
git push -u origin main`} />
                  <InfoBox label="📌 CONCEITO">
                    <strong>origin</strong> é o apelido do repositório remoto. <strong>main</strong> é o nome da branch principal. <code>-u</code> configura o rastreamento para os próximos <code>git push</code>.
                  </InfoBox>
                </StepBlock>

                <div className="chapter-divider">FLUXO DE TRABALHO GIT</div>
                <div className="card">
                  <table className="pabd-table">
                    <thead><tr><th>Comando</th><th>O que faz</th></tr></thead>
                    <tbody>
                      <tr><td><code>git status</code></td><td>Mostra arquivos modificados</td></tr>
                      <tr><td><code>git add .</code></td><td>Adiciona todos os arquivos à staging area</td></tr>
                      <tr><td><code>git commit -m &quot;msg&quot;</code></td><td>Cria um snapshot do projeto</td></tr>
                      <tr><td><code>git push</code></td><td>Envia commits para o GitHub</td></tr>
                      <tr><td><code>git pull</code></td><td>Baixa atualizações do GitHub</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(1)}>← Sumário</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(3)}>FastAPI →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 3: Módulo 2 — FastAPI ── */}
          {current === 3 && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 02</div>
                  <h2>Primeiros passos com <span className="accent-text">FastAPI</span></h2>
                  <p className="lead">FastAPI é um framework web moderno para Python que permite criar APIs REST de forma rápida, com validação automática, documentação interativa e suporte a async nativo.</p>

                  <div className="feature-card-grid">
                    <div className="feature-card"><div className="card-icon">🚀</div><h3>Ultra rápido</h3><p>Performance comparável ao Node.js e Go graças ao Starlette e Pydantic.</p></div>
                    <div className="feature-card"><div className="card-icon">📝</div><h3>Docs automáticas</h3><p>Interface Swagger gerada automaticamente em <code>/docs</code>.</p></div>
                    <div className="feature-card"><div className="card-icon">✅</div><h3>Validação built-in</h3><p>Pydantic valida tipos, campos obrigatórios e formatos automaticamente.</p></div>
                  </div>
                </div>

                <StepBlock num="01" title="Instalar FastAPI e Uvicorn" defaultOpen>
                  <p>O <strong>uvicorn</strong> é o servidor ASGI que roda a aplicação FastAPI.</p>
                  <CodeBlock lang="BASH" html={`<span class="cmt"># Adicionar dependências com uv</span>
uv add fastapi uvicorn

<span class="cmt"># Verificar o que foi instalado</span>
uv pip list`} />
                  <InfoBox variant="tip" label="💡 DICA">
                    O <code>uv add</code> além de instalar já registra a dependência no <code>pyproject.toml</code> e gera o lockfile <code>uv.lock</code> automaticamente.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="02" title="Criar o arquivo main.py">
                  <p>Crie o arquivo <code>main.py</code> na raiz do projeto. A aplicação começa com uma instância de <code>FastAPI</code>.</p>
                  <CodeBlock lang="PYTHON — main.py" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

<span class="cmt"># Instância da aplicação</span>
app = <span class="fn">FastAPI</span>(title=<span class="str">"Minha API"</span>, version=<span class="str">"1.0.0"</span>)

<span class="cmt"># Modelo de dados com Pydantic</span>
<span class="kw">class</span> <span class="cls">Tarefa</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">TarefaResposta</span>(Tarefa):
    id: <span class="cls">str</span>

<span class="cmt"># "Banco de dados" em memória (lista Python)</span>
tarefas_db: List[<span class="cls">TarefaResposta</span>] = []

<span class="cmt"># Rota raiz</span>
<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API funcionando! 🚀"</span>}`} />
                </StepBlock>

                <StepBlock num="03" title="Endpoint: Criar tarefa (POST)">
                  <div className="endpoint-row"><span className="method-pill post">POST</span> /tarefas</div>
                  <p>Recebe dados no corpo da requisição (JSON), valida com Pydantic e salva na lista.</p>
                  <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">TarefaResposta</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(tarefa: <span class="cls">Tarefa</span>):
    nova = <span class="cls">TarefaResposta</span>(
        id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()),
        titulo=tarefa.titulo,
        descricao=tarefa.descricao,
        concluida=tarefa.concluida
    )
    tarefas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova`} />
                  <InfoBox label="📌 CONCEITO">
                    O decorador <code>@app.post</code> registra a função como handler do método HTTP POST. O parâmetro <code>response_model</code> define o formato da resposta, e <code>status_code=201</code> retorna &quot;Created&quot;.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="04" title="Endpoint: Listar tarefas (GET)">
                  <div className="endpoint-row"><span className="method-pill get">GET</span> /tarefas</div>
                  <p>Retorna todas as tarefas armazenadas em memória.</p>
                  <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">TarefaResposta</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">return</span> tarefas_db`} />
                </StepBlock>

                <StepBlock num="05" title="Rodar a aplicação">
                  <CodeBlock lang="BASH" html={`uvicorn main:app --reload

<span class="cmt"># --reload reinicia automaticamente ao salvar arquivos</span>
<span class="cmt"># Acesse: http://localhost:8000</span>
<span class="cmt"># Docs:   http://localhost:8000/docs</span>`} />
                  <InfoBox variant="tip" label="💡 TESTE">
                    Abra <strong>http://localhost:8000/docs</strong> no navegador. Você verá a documentação Swagger interativa — clique em &quot;Try it out&quot; para testar os endpoints diretamente!
                  </InfoBox>
                </StepBlock>

                <div className="chapter-divider">ARQUIVO COMPLETO</div>
                <CodeBlock lang="PYTHON — main.py completo" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

app = <span class="fn">FastAPI</span>(title=<span class="str">"Minha API"</span>, version=<span class="str">"1.0.0"</span>)

<span class="kw">class</span> <span class="cls">Tarefa</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">TarefaResposta</span>(Tarefa):
    id: <span class="cls">str</span>

tarefas_db: List[<span class="cls">TarefaResposta</span>] = []

<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API funcionando! 🚀"</span>}

<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">TarefaResposta</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(tarefa: <span class="cls">Tarefa</span>):
    nova = <span class="cls">TarefaResposta</span>(
        id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()),
        **tarefa.<span class="fn">dict</span>()
    )
    tarefas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">TarefaResposta</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">return</span> tarefas_db`} />

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Banco de Dados →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 4: Módulo 3 — SQLite ── */}
          {current === 4 && (
            <LessonSection>
              <div style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="section-tag">MÓDULO 03</div>
                  <h2>Conectando ao <span className="accent-text">Banco de Dados</span></h2>
                  <p className="lead">Agora vamos persistir os dados em um banco de dados real. Usaremos o <strong>SQLite</strong> (arquivo local, perfeito para aprendizado) com SQL puro — sem ORM.</p>

                  <div className="feature-card-grid">
                    <div className="feature-card"><div className="card-icon">🗄️</div><h3>SQLite</h3><p>Banco de dados em arquivo único. Zero configuração, incluído no Python.</p></div>
                    <div className="feature-card"><div className="card-icon">🔌</div><h3>sqlite3</h3><p>Módulo nativo do Python para conectar e executar SQL no SQLite.</p></div>
                    <div className="feature-card"><div className="card-icon">📜</div><h3>SQL puro</h3><p>Você controla cada query — sem mágica de ORM. Aprenda o que realmente acontece.</p></div>
                  </div>
                </div>

                <StepBlock num="01" title="Estrutura do projeto" defaultOpen>
                  <p>Organize o projeto em módulos separados para facilitar a manutenção:</p>
                  <CodeBlock lang="ESTRUTURA" html={`minha-api/
├── main.py          <span class="cmt">← rotas FastAPI</span>
├── database.py      <span class="cmt">← conexão e criação do banco</span>
├── models.py        <span class="cmt">← modelos Pydantic</span>
├── tarefas.db       <span class="cmt">← arquivo SQLite (gerado)</span>
├── pyproject.toml
└── .gitignore`} />
                </StepBlock>

                <StepBlock num="02" title="Criar database.py — conexão e tabela">
                  <CodeBlock lang="PYTHON — database.py" html={`<span class="kw">import</span> sqlite3
<span class="kw">from</span> contextlib <span class="kw">import</span> contextmanager

DATABASE_URL = <span class="str">"tarefas.db"</span>

<span class="kw">def</span> <span class="fn">criar_tabelas</span>():
    <span class="str">"""Cria a tabela se não existir."""</span>
    <span class="kw">with</span> sqlite3.<span class="fn">connect</span>(DATABASE_URL) <span class="kw">as</span> conn:
        conn.cursor().<span class="fn">execute</span>(<span class="str">"""
            CREATE TABLE IF NOT EXISTS tarefas (
                id        TEXT PRIMARY KEY,
                titulo    TEXT NOT NULL,
                descricao TEXT NOT NULL,
                concluida INTEGER DEFAULT 0
            )
        """</span>)
        conn.<span class="fn">commit</span>()

<span class="dec">@contextmanager</span>
<span class="kw">def</span> <span class="fn">get_conn</span>():
    <span class="str">"""Context manager para conexão segura."""</span>
    conn = sqlite3.<span class="fn">connect</span>(DATABASE_URL)
    conn.row_factory = sqlite3.Row  <span class="cmt"># acesso por nome de coluna</span>
    <span class="kw">try</span>:
        <span class="kw">yield</span> conn
    <span class="kw">finally</span>:
        conn.<span class="fn">close</span>()`} />
                  <InfoBox label="📌 CONCEITO">
                    <code>row_factory = sqlite3.Row</code> permite acessar os dados pelo nome da coluna (ex: <code>row[&quot;titulo&quot;]</code>) ao invés de índice numérico. O <code>contextmanager</code> garante que a conexão seja sempre fechada, mesmo em caso de erro.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="03" title="Criar models.py — schemas Pydantic">
                  <CodeBlock lang="PYTHON — models.py" html={`<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel

<span class="kw">class</span> <span class="cls">TarefaEntrada</span>(BaseModel):
    <span class="str">"""Dados que o cliente envia."""</span>
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">Tarefa</span>(TarefaEntrada):
    <span class="str">"""Dados que a API retorna (inclui id)."""</span>
    id: <span class="cls">str</span>

    <span class="kw">class</span> <span class="cls">Config</span>:
        from_attributes = <span class="kw">True</span>  <span class="cmt"># leitura de objetos/dicts</span>`} />
                </StepBlock>

                <StepBlock num="04" title="Atualizar main.py com banco de dados">
                  <div className="endpoint-row"><span className="method-pill post">POST</span> /tarefas — persiste no SQLite</div>
                  <div className="endpoint-row"><span className="method-pill get">GET</span> /tarefas — lê do SQLite</div>
                  <CodeBlock lang="PYTHON — main.py completo com banco" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI, HTTPException
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

<span class="kw">from</span> database <span class="kw">import</span> get_conn, criar_tabelas
<span class="kw">from</span> models <span class="kw">import</span> Tarefa, TarefaEntrada

app = <span class="fn">FastAPI</span>(title=<span class="str">"Minha API com Banco"</span>, version=<span class="str">"2.0.0"</span>)

<span class="fn">criar_tabelas</span>()


<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">Tarefa</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(dados: <span class="cls">TarefaEntrada</span>):
    tarefa_id = <span class="cls">str</span>(uuid.<span class="fn">uuid4</span>())

    <span class="kw">with</span> <span class="fn">get_conn</span>() <span class="kw">as</span> conn:
        conn.<span class="fn">execute</span>(
            <span class="str">"""INSERT INTO tarefas (id, titulo, descricao, concluida)
               VALUES (?, ?, ?, ?)"""</span>,
            (tarefa_id, dados.titulo, dados.descricao, <span class="cls">int</span>(dados.concluida))
        )
        conn.<span class="fn">commit</span>()

    <span class="kw">return</span> <span class="cls">Tarefa</span>(
        id=tarefa_id,
        titulo=dados.titulo,
        descricao=dados.descricao,
        concluida=dados.concluida
    )


<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">Tarefa</span>])
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
                  <InfoBox variant="warn" label="⚠️ ATENÇÃO">
                    Sempre use <strong>parâmetros <code>?</code></strong> nas queries SQL — nunca concatene strings! Isso evita ataques de <em>SQL Injection</em>.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="05" title="Testar com curl ou Swagger">
                  <p>Crie uma tarefa via terminal:</p>
                  <CodeBlock lang="BASH — curl" html={`<span class="cmt"># Criar uma tarefa</span>
curl -X POST http://localhost:8000/tarefas \\
  -H <span class="str">"Content-Type: application/json"</span> \\
  -d <span class="str">'{"titulo": "Estudar FastAPI", "descricao": "Praticar endpoints"}'</span>

<span class="cmt"># Listar todas as tarefas</span>
curl http://localhost:8000/tarefas`} />
                  <InfoBox variant="tip" label="💡 DICA">
                    Prefere interface gráfica? Acesse <strong>http://localhost:8000/docs</strong> e use o Swagger UI. É possível enviar requisições POST com formulário visual.
                  </InfoBox>
                </StepBlock>

                <StepBlock num="06" title="Salvar progresso no GitHub">
                  <CodeBlock lang="BASH" html={`git add .
git commit -m <span class="str">"feat: adiciona conexão com SQLite"</span>
git push`} />
                  <InfoBox variant="tip" label="✅ BOAS PRÁTICAS">
                    Use mensagens de commit descritivas. O prefixo <code>feat:</code> indica nova funcionalidade. Outros comuns: <code>fix:</code> (correção), <code>docs:</code> (documentação), <code>refactor:</code> (refatoração).
                  </InfoBox>
                </StepBlock>

                <div className="chapter-divider">RESUMO DO FLUXO COMPLETO</div>
                <div className="card">
                  <table className="pabd-table">
                    <thead><tr><th>Camada</th><th>Arquivo</th><th>Responsabilidade</th></tr></thead>
                    <tbody>
                      <tr><td>API</td><td><code>main.py</code></td><td>Rotas, lógica de negócio, validação</td></tr>
                      <tr><td>Banco</td><td><code>database.py</code></td><td>Conexão SQLite, criação de tabelas</td></tr>
                      <tr><td>Schema</td><td><code>models.py</code></td><td>Estrutura dos dados (entrada/saída)</td></tr>
                      <tr><td>Config</td><td><code>pyproject.toml</code></td><td>Dependências do projeto</td></tr>
                      <tr><td>Versionamento</td><td><code>.gitignore</code></td><td>Ignora arquivos temporários</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="section-nav">
                  <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                  <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Ir ao Quiz →</button>
                </div>
              </div>
            </LessonSection>
          )}

          {/* ── Section 5: Quiz ── */}
          {current === 5 && (
            <LessonSection>
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-tag">AVALIAÇÃO</div>
                <h2>Quiz — Teste seus <span className="accent-text">conhecimentos</span></h2>
                <p className="lead">10 questões sobre o conteúdo da aula. Você pode errar e aprender — a explicação aparece após cada resposta.</p>

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
                      {score >= 9 && 'Excelente! Você dominou o conteúdo da aula. Explore o FastAPI ainda mais! 🏆'}
                    </p>
                    <div className="score-btns">
                      <button className="btn-primary btn-pabd" onClick={restartQuiz}>↺ Refazer Quiz</button>
                      <button className="btn-outline btn-pabd" onClick={() => goTo(2)}>← Revisar Módulo 1</button>
                    </div>
                  </div>
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
