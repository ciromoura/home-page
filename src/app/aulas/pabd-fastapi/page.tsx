'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    q: '2. Qual sequência de comandos uv cria e ativa um ambiente virtual?',
    opts: [
      { t: 'uv install venv → uv activate', c: false },
      { t: 'uv venv (cria) → source .venv/bin/activate (ativa no Linux/macOS)', c: true },
      { t: 'pip venv → pip activate', c: false },
      { t: 'uv create env → uv start', c: false },
    ],
    ok: 'Certo! uv venv cria o ambiente e source .venv/bin/activate (Linux/macOS) ou .venv\\Scripts\\activate (Windows) o ativa.',
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
    q: '4. O que é a biblioteca httpx em Python?',
    opts: [
      { t: 'Um framework web para criar APIs REST', c: false },
      { t: 'Um cliente HTTP moderno que permite fazer requisições a APIs externas (GET, POST etc.)', c: true },
      { t: 'Um banco de dados NoSQL para Python', c: false },
      { t: 'Um gerenciador de pacotes alternativo ao pip', c: false },
    ],
    ok: 'Correto! httpx é um cliente HTTP completo com suporte a async, equivalente moderno ao requests. Usamos para consumir APIs externas.',
    err: 'Errado. httpx é um cliente HTTP para fazer requisições a outras APIs — como a BrasilAPI de CEPs — não um framework web.',
  },
  {
    q: '5. O que significa o código de status HTTP 404?',
    opts: [
      { t: 'Requisição bem-sucedida', c: false },
      { t: 'Recurso criado com sucesso', c: false },
      { t: 'Recurso não encontrado', c: true },
      { t: 'Erro interno do servidor', c: false },
    ],
    ok: 'Correto! 404 Not Found indica que o recurso solicitado não existe no servidor. Muito comum ao buscar um item por ID que não existe.',
    err: 'Errado. 404 significa "Not Found" — o recurso solicitado não foi encontrado. 200 = OK, 201 = Created, 500 = Server Error.',
  },
  {
    q: '6. Qual a diferença entre os status HTTP 200 e 201?',
    opts: [
      { t: 'São iguais — ambos indicam sucesso genérico', c: false },
      { t: '200 (OK) indica sucesso em leitura/atualização; 201 (Created) indica que um novo recurso foi criado', c: true },
      { t: '200 é para GET e 201 é para DELETE', c: false },
      { t: '201 indica redirecionamento para outra URL', c: false },
    ],
    ok: 'Perfeito! 200 OK é o sucesso genérico (GET, PUT). 201 Created é específico para POST que criou um novo recurso.',
    err: 'Incorreto. A semântica importa: 200 = sucesso em geral; 201 = recurso criado. Usamos status_code=201 nos endpoints POST de criação.',
  },
  {
    q: '7. Qual decorator FastAPI é usado para um endpoint que cria um novo recurso?',
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
    q: '8. O que é Pydantic no contexto do FastAPI?',
    opts: [
      { t: 'Um banco de dados relacional para Python', c: false },
      { t: 'Um servidor web alternativo ao Uvicorn', c: false },
      { t: 'Uma biblioteca de validação e serialização de dados usando anotações de tipo Python', c: true },
      { t: 'Um ORM para fazer consultas SQL', c: false },
    ],
    ok: 'Exato! Pydantic valida os dados automaticamente usando as anotações de tipo Python, gerando erros claros quando os dados são inválidos.',
    err: 'Incorreto. Pydantic é uma biblioteca de validação de dados — não banco nem servidor. Ele garante que os dados recebidos têm o formato correto.',
  },
  {
    q: '9. Qual é a função do Uvicorn no contexto do FastAPI?',
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
    q: '10. No CRUD em memória, qual método HTTP é usado para remover um recurso?',
    opts: [
      { t: 'GET /tarefas/{id}', c: false },
      { t: 'POST /tarefas/{id}', c: false },
      { t: 'PUT /tarefas/{id}', c: false },
      { t: 'DELETE /tarefas/{id}', c: true },
    ],
    ok: 'Correto! DELETE /tarefas/{id} remove o recurso identificado pelo ID. A convenção REST usa DELETE para remoção e PUT para atualização.',
    err: 'Errado. A convenção REST define: GET = leitura, POST = criação, PUT = atualização, DELETE = remoção.',
  },
]

const SECTION_LABELS = ['Início', 'Sumário', 'Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4', 'Quiz']

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
      {({ current, goTo, visited, exportMode }) => (
          <>
            {/* ── Section 0: Hero ── */}
            {(current === 0 || exportMode) && (
              <LessonSection>
                <div className="pabd-hero">
                  <div className="pabd-hero-badge">ENSINO MÉDIO · PROGRAMAÇÃO WEB</div>
                  <h1>
                    Construa APIs com<br />
                    <span className="accent-text">FastAPI</span> &amp; <em>Python</em>
                  </h1>
                  <p>Do ambiente virtual ao CRUD completo em memória — aprenda a criar APIs modernas passo a passo, sem enrolação.</p>
                  <div className="pabd-hero-cta">
                    <button className="btn-primary btn-pabd" onClick={() => goTo(1)}>▶ Começar Aula</button>
                    <button className="btn-outline btn-pabd" onClick={() => goTo(6)}>⚡ Ir ao Quiz</button>
                  </div>
                </div>
              </LessonSection>
            )}

            {/* ── Section 1: Sumário ── */}
            {(current === 1 || exportMode) && (
              <LessonSection>
                <div className="card" style={{ marginTop: '1.5rem' }}>
                  <div className="section-tag">ÍNDICE</div>
                  <h2>Sumário do <span className="accent-text">Curso</span></h2>
                  <p className="lead">Navegue diretamente para qualquer módulo. Recomenda-se seguir a ordem, mas você pode ir a qualquer seção.</p>

                  <div className="toc-progress-row">
                    <span>PROGRESSO</span>
                    <div className="toc-progress-bar">
                      <div className="toc-progress-fill" style={{ width: `${(visited.filter(v => [2,3,4,5].includes(v)).length / 4) * 100}%` }} />
                    </div>
                    <span>{visited.filter(v => [2,3,4,5].includes(v)).length} / 4</span>
                  </div>

                  <div className="toc-grid">
                    {[
                      { n: 2, num: '01', title: 'Ambiente Virtual & GitHub', desc: 'uv, venv, git init e push para o GitHub' },
                      { n: 3, num: '02', title: 'Consumindo APIs Externas', desc: 'httpx, BrasilAPI, códigos de status HTTP' },
                      { n: 4, num: '03', title: 'Primeiros passos com FastAPI', desc: 'POST e GET — criar e listar tarefas em memória' },
                      { n: 5, num: '04', title: 'CRUD Completo', desc: 'PUT e DELETE — editar e remover tarefas' },
                    ].map(({ n, num, title, desc }) => (
                      <button key={n} className={`toc-card${visited.includes(n) ? ' visited' : ''}`} onClick={() => goTo(n)}>
                        <div className="toc-num">{num}</div>
                        <div className="toc-content"><h3>{title}</h3><p>{desc}</p></div>
                        <div className="toc-arrow">→</div>
                      </button>
                    ))}
                    <button className={`toc-card${visited.includes(6) ? ' visited' : ''}`} onClick={() => goTo(6)}>
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
            {(current === 2 || exportMode) && (
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

                  <StepBlock num="01" title="Instalar o uv" defaultOpen forceOpen={exportMode}>
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
                    <InfoBox label="🔗 LINKS ALTERNATIVOS">
                      Para mais formas de instalação, acessse: {' '}
                      <Link href="https://docs.astral.sh/uv/getting-started/installation/">
                        https://docs.astral.sh/uv/getting-started/installation/
                      </Link>
                    </InfoBox>
                  </StepBlock>

                  <StepBlock num="02" title="Criar e inicializar o projeto" forceOpen={exportMode}>
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

                  <StepBlock num="03" title="Conectar ao GitHub" forceOpen={exportMode}>
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
                    <button className="btn-primary btn-pabd" onClick={() => goTo(3)}>Módulo 2 →</button>
                  </div>
                </div>
              </LessonSection>
            )}

            {/* ── Section 3: Módulo 2 — Consumindo APIs Externas & Status HTTP ── */}
            {(current === 3 || exportMode) && (
              <LessonSection>
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <div className="section-tag">MÓDULO 02</div>
                    <h2>Consumindo <span className="accent-text">APIs Externas</span> com httpx</h2>
                    <p className="lead">Antes de criar nossa própria API, vamos entender como consumir APIs de terceiros. Usaremos a <strong>BrasilAPI</strong> — uma API pública gratuita — para buscar informações de CEPs dos Correios.</p>

                    <div className="feature-card-grid">
                      <div className="feature-card"><div className="card-icon">🌐</div><h3>O que é httpx?</h3><p>Biblioteca Python para fazer requisições HTTP. Suporte a async, similar ao requests mas mais moderno.</p></div>
                      <div className="feature-card"><div className="card-icon">📮</div><h3>BrasilAPI</h3><p>API pública brasileira com dados de CEP, CNPJ, feriados, bancos e muito mais. Sem autenticação.</p></div>
                      <div className="feature-card"><div className="card-icon">📡</div><h3>Status HTTP</h3><p>Cada resposta tem um código numérico que indica sucesso, erro do cliente ou erro do servidor.</p></div>
                    </div>
                  </div>

                  <StepBlock num="01" title="Instalar httpx" defaultOpen forceOpen={exportMode}>
                    <CodeBlock lang="BASH" html={`<span class="cmt"># Adicionar httpx ao projeto</span>
uv add httpx`} />
                    <InfoBox variant="tip" label="💡 DICA">
                      O <code>uv add</code> instala e já registra a dependência no <code>pyproject.toml</code> automaticamente.
                    </InfoBox>
                  </StepBlock>

                  <StepBlock num="02" title="Primeiro teste: buscar CEP" forceOpen={exportMode}>
                    <p>Crie um arquivo <code>teste_cep.py</code> e execute-o para ver a resposta da API:</p>
                    <CodeBlock lang="PYTHON — teste_cep.py" html={`<span class="kw">import</span> httpx

<span class="kw">with</span> httpx.<span class="fn">Client</span>() <span class="kw">as</span> client:
    response = client.<span class="fn">get</span>(<span class="str">"https://brasilapi.com.br/api/cep/v1/05310000"</span>)
    data = response.<span class="fn">json</span>()
    <span class="fn">print</span>(data)`} />
                    <CodeBlock lang="BASH — executar" html={`python teste_cep.py`} />
                    <CodeBlock lang="JSON — resposta esperada" html={`{
  <span class="str">"cep"</span>: <span class="str">"05310000"</span>,
  <span class="str">"state"</span>: <span class="str">"SP"</span>,
  <span class="str">"city"</span>: <span class="str">"São Paulo"</span>,
  <span class="str">"neighborhood"</span>: <span class="str">"Vila Leopoldina"</span>,
  <span class="str">"street"</span>: <span class="str">"Avenida Imperatriz Leopoldina"</span>,
  <span class="str">"service"</span>: <span class="str">"open-cep"</span>
}`} />
                  </StepBlock>

                  <StepBlock num="03" title="Acessar o código de status da resposta" forceOpen={exportMode}>
                    <p>O objeto <code>response</code> do httpx expõe o código de status HTTP. Isso é importante para tratar erros:</p>
                    <CodeBlock lang="PYTHON — verificando status" html={`<span class="kw">import</span> httpx

<span class="kw">with</span> httpx.<span class="fn">Client</span>() <span class="kw">as</span> client:
    response = client.<span class="fn">get</span>(<span class="str">"https://brasilapi.com.br/api/cep/v1/99999999"</span>)

    <span class="fn">print</span>(<span class="str">"Status:"</span>, response.status_code)

    <span class="kw">if</span> response.status_code == <span class="num">200</span>:
        <span class="fn">print</span>(<span class="str">"CEP encontrado:"</span>, response.<span class="fn">json</span>())
    <span class="kw">elif</span> response.status_code == <span class="num">404</span>:
        <span class="fn">print</span>(<span class="str">"CEP não encontrado"</span>)
    <span class="kw">else</span>:
        <span class="fn">print</span>(<span class="str">"Erro inesperado"</span>)`} />
                  </StepBlock>

                  <div className="chapter-divider">CÓDIGOS DE STATUS HTTP</div>
                  <div className="card">
                    <p style={{ marginBottom: '1rem' }}>Toda resposta HTTP contém um código numérico de 3 dígitos. O primeiro dígito indica a categoria:</p>
                    <table className="pabd-table">
                      <thead>
                        <tr><th>Código</th><th>Nome</th><th>Significado</th></tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="method-pill get">200</span></td>
                          <td>OK</td>
                          <td>Requisição bem-sucedida. Dados retornados no corpo.</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill post">201</span></td>
                          <td>Created</td>
                          <td>Recurso criado com sucesso (resposta de POST).</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill get" style={{ background: 'rgba(100,100,100,0.2)' }}>204</span></td>
                          <td>No Content</td>
                          <td>Sucesso, mas sem conteúdo para retornar (comum em DELETE).</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill" style={{ background: 'rgba(234,179,8,0.2)', color: '#ca8a04' }}>400</span></td>
                          <td>Bad Request</td>
                          <td>Dados inválidos enviados pelo cliente (falta campo, tipo errado).</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill" style={{ background: 'rgba(234,179,8,0.2)', color: '#ca8a04' }}>401</span></td>
                          <td>Unauthorized</td>
                          <td>Autenticação necessária — token ausente ou inválido.</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill" style={{ background: 'rgba(234,179,8,0.2)', color: '#ca8a04' }}>403</span></td>
                          <td>Forbidden</td>
                          <td>Autenticado, mas sem permissão para acessar o recurso.</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill" style={{ background: 'rgba(234,179,8,0.2)', color: '#ca8a04' }}>404</span></td>
                          <td>Not Found</td>
                          <td>Recurso não encontrado — URL errada ou ID inexistente.</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill" style={{ background: 'rgba(239,68,68,0.2)', color: '#dc2626' }}>422</span></td>
                          <td>Unprocessable Entity</td>
                          <td>Dados no formato correto, mas semanticamente inválidos. FastAPI retorna 422 quando a validação Pydantic falha.</td>
                        </tr>
                        <tr>
                          <td><span className="method-pill" style={{ background: 'rgba(239,68,68,0.2)', color: '#dc2626' }}>500</span></td>
                          <td>Internal Server Error</td>
                          <td>Erro inesperado no servidor — bug no código da API.</td>
                        </tr>
                      </tbody>
                    </table>
                    <InfoBox label="📌 REGRA GERAL" style={{ marginTop: '1rem' }}>
                      <strong>2xx</strong> = sucesso &nbsp;·&nbsp; <strong>3xx</strong> = redirecionamento &nbsp;·&nbsp; <strong>4xx</strong> = erro do <em>cliente</em> &nbsp;·&nbsp; <strong>5xx</strong> = erro do <em>servidor</em>
                    </InfoBox>
                  </div>

                  <div className="section-nav">
                    <button className="btn-outline" onClick={() => goTo(2)}>← Módulo 1</button>
                    <button className="btn-primary btn-pabd" onClick={() => goTo(4)}>Módulo 3 →</button>
                  </div>
                </div>
              </LessonSection>
            )}

            {/* ── Section 4: Módulo 3 — Primeiros passos com FastAPI ── */}
            {(current === 4 || exportMode) && (
              <LessonSection>
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <div className="section-tag">MÓDULO 03</div>
                    <h2>Primeiros passos com <span className="accent-text">FastAPI</span></h2>
                    <p className="lead">Agora que sabemos consumir APIs externas, vamos criar a nossa própria! Começamos com uma API simples de tarefas armazenadas em memória — sem banco de dados ainda.</p>

                    <div className="feature-card-grid">
                      <div className="feature-card"><div className="card-icon">🚀</div><h3>Ultra rápido</h3><p>Performance comparável ao Node.js e Go graças ao Starlette e Pydantic.</p></div>
                      <div className="feature-card"><div className="card-icon">📝</div><h3>Docs automáticas</h3><p>Interface Swagger gerada automaticamente em <code>/docs</code>.</p></div>
                      <div className="feature-card"><div className="card-icon">✅</div><h3>Validação built-in</h3><p>Pydantic valida tipos, campos obrigatórios e formatos automaticamente.</p></div>
                    </div>
                  </div>

                  <StepBlock num="01" title="Instalar FastAPI e Uvicorn" defaultOpen forceOpen={exportMode}>
                    <p>O <strong>Uvicorn</strong> é o servidor ASGI (Asynchronous Server Gateway Interface) que roda a aplicação FastAPI.</p>
                    <CodeBlock lang="BASH" html={`<span class="cmt"># Adicionar dependências com uv</span>
uv add fastapi uvicorn

<span class="cmt"># Verificar o que foi instalado</span>
uv pip list`} />
                    <InfoBox variant="tip" label="💡 DICA">
                      O <code>uv add</code> além de instalar já registra a dependência no <code>pyproject.toml</code> e gera o lockfile <code>uv.lock</code> automaticamente.
                    </InfoBox>
                  </StepBlock>

                  <StepBlock num="02" title="Criar o arquivo main.py" forceOpen={exportMode}>
                    <p>Crie o arquivo <code>main.py</code> na raiz do projeto. Definimos o modelo de dados com Pydantic e a lista em memória que vai armazenar as tarefas.</p>
                    <CodeBlock lang="PYTHON — main.py" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

<span class="cmt"># Instância da aplicação</span>
app = <span class="fn">FastAPI</span>(title=<span class="str">"API de Tarefas"</span>, version=<span class="str">"1.0.0"</span>)

<span class="cmt"># Modelo de entrada (dados que o cliente envia)</span>
<span class="kw">class</span> <span class="cls">TarefaEntrada</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="cmt"># Modelo de resposta (inclui o ID gerado)</span>
<span class="kw">class</span> <span class="cls">Tarefa</span>(<span class="cls">TarefaEntrada</span>):
    id: <span class="cls">str</span>

<span class="cmt"># "Banco de dados" em memória</span>
tarefas_db: List[<span class="cls">Tarefa</span>] = []

<span class="cmt"># Rota raiz</span>
<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API de Tarefas funcionando! 🚀"</span>}`} />
                    <InfoBox label="📌 CONCEITO — BaseModel">
                      A classe <code>TarefaEntrada</code> herda de <code>BaseModel</code> do Pydantic. Isso faz com que o FastAPI valide automaticamente o JSON recebido — se faltar o campo <code>titulo</code>, ele retorna 422 antes mesmo de entrar na função.
                    </InfoBox>
                  </StepBlock>

                  <StepBlock num="03" title="Endpoint: Criar tarefa (POST)" forceOpen={exportMode}>
                    <div className="endpoint-row"><span className="method-pill post">POST</span> /tarefas</div>
                    <p>Recebe um JSON com os dados da tarefa, gera um ID único e salva na lista.</p>
                    <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">Tarefa</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(dados: <span class="cls">TarefaEntrada</span>):
    nova = <span class="cls">Tarefa</span>(
        id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()),
        titulo=dados.titulo,
        descricao=dados.descricao,
        concluida=dados.concluida
    )
    tarefas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova`} />
                    <InfoBox label="📌 CONCEITO">
                      <code>status_code=201</code> informa ao cliente que um novo recurso foi criado (HTTP 201 Created). O <code>response_model</code> define o formato exato da resposta JSON.
                    </InfoBox>
                  </StepBlock>

                  <StepBlock num="04" title="Endpoint: Listar tarefas (GET)" forceOpen={exportMode}>
                    <div className="endpoint-row"><span className="method-pill get">GET</span> /tarefas</div>
                    <p>Retorna todas as tarefas armazenadas em memória.</p>
                    <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">Tarefa</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">return</span> tarefas_db`} />
                  </StepBlock>

                  <StepBlock num="05" title="Rodar a aplicação" forceOpen={exportMode}>
                    <CodeBlock lang="BASH" html={`uvicorn main:app --reload

<span class="cmt"># --reload reinicia automaticamente ao salvar arquivos</span>
<span class="cmt"># Acesse: http://localhost:8000</span>
<span class="cmt"># Docs:   http://localhost:8000/docs</span>`} />
                    <InfoBox variant="tip" label="💡 TESTE">
                      Abra <strong><Link href={'http://localhost:8000/docs'} target='_blank'>http://localhost:8000/docs</Link></strong> {' '} no navegador. Você verá a documentação Swagger interativa — clique em &quot;Try it out&quot; para criar e listar tarefas diretamente!
                    </InfoBox>
                  </StepBlock>

                  <div className="chapter-divider">ARQUIVO main.py ATÉ AQUI</div>
                  <CodeBlock lang="PYTHON — main.py completo (Módulo 3)" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

app = <span class="fn">FastAPI</span>(title=<span class="str">"API de Tarefas"</span>, version=<span class="str">"1.0.0"</span>)

<span class="kw">class</span> <span class="cls">TarefaEntrada</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">Tarefa</span>(<span class="cls">TarefaEntrada</span>):
    id: <span class="cls">str</span>

tarefas_db: List[<span class="cls">Tarefa</span>] = []

<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API de Tarefas funcionando! 🚀"</span>}

<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">Tarefa</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(dados: <span class="cls">TarefaEntrada</span>):
    nova = <span class="cls">Tarefa</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    tarefas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">Tarefa</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">return</span> tarefas_db`} />

                  <div className="section-nav">
                    <button className="btn-outline" onClick={() => goTo(3)}>← Módulo 2</button>
                    <button className="btn-primary btn-pabd" onClick={() => goTo(5)}>Módulo 4 →</button>
                  </div>
                </div>
              </LessonSection>
            )}

            {/* ── Section 5: Módulo 4 — CRUD Completo (PUT + DELETE) ── */}
            {(current === 5 || exportMode) && (
              <LessonSection>
                <div style={{ marginTop: '1.5rem' }}>
                  <div className="card" style={{ marginBottom: '1rem' }}>
                    <div className="section-tag">MÓDULO 04</div>
                    <h2>CRUD Completo — <span className="accent-text">Editar &amp; Remover</span></h2>
                    <p className="lead">Agora vamos completar o CRUD adicionando os endpoints de edição (PUT) e remoção (DELETE). Para isso, precisamos buscar uma tarefa pelo ID — e lidar com o caso em que ela não existe.</p>

                    <div className="feature-card-grid">
                      <div className="feature-card"><div className="card-icon">✏️</div><h3>PUT</h3><p>Substitui completamente um recurso existente. Identificado pelo ID na URL.</p></div>
                      <div className="feature-card"><div className="card-icon">🗑️</div><h3>DELETE</h3><p>Remove um recurso pelo ID. Convencionalmente retorna 204 No Content.</p></div>
                      <div className="feature-card"><div className="card-icon">🔍</div><h3>Path params</h3><p>O ID vem na URL: <code>/tarefas/{'{id}'}</code>. FastAPI injeta automaticamente na função.</p></div>
                    </div>
                  </div>

                  <StepBlock num="01" title="Importar HTTPException" defaultOpen forceOpen={exportMode}>
                    <p>Quando o ID não existe na lista, precisamos retornar HTTP 404. O FastAPI fornece <code>HTTPException</code> para isso:</p>
                    <CodeBlock lang="PYTHON — atualizar imports em main.py" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI, HTTPException`} />
                    <InfoBox label="📌 CONCEITO">
                      <code>HTTPException</code> interrompe a execução da função e retorna imediatamente uma resposta de erro com o código e mensagem informados.
                    </InfoBox>
                  </StepBlock>

                  <StepBlock num="02" title="Endpoint: Buscar tarefa por ID (GET)" forceOpen={exportMode}>
                    <div className="endpoint-row"><span className="method-pill get">GET</span> /tarefas/{'{id}'}</div>
                    <p>Retorna uma tarefa específica pelo ID. Se não existir, retorna 404.</p>
                    <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.get</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">buscar_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> t <span class="kw">in</span> tarefas_db:
        <span class="kw">if</span> t.id == id:
            <span class="kw">return</span> t
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)`} />
                  </StepBlock>

                  <StepBlock num="03" title="Endpoint: Editar tarefa (PUT)" forceOpen={exportMode}>
                    <div className="endpoint-row"><span className="method-pill put">PUT</span> /tarefas/{'{id}'}</div>
                    <p>Recebe os novos dados no corpo e substitui a tarefa existente.</p>
                    <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.put</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">editar_tarefa</span>(id: <span class="cls">str</span>, dados: <span class="cls">TarefaEntrada</span>):
    <span class="kw">for</span> i, t <span class="kw">in</span> <span class="fn">enumerate</span>(tarefas_db):
        <span class="kw">if</span> t.id == id:
            atualizada = <span class="cls">Tarefa</span>(id=id, **dados.<span class="fn">model_dump</span>())
            tarefas_db[i] = atualizada
            <span class="kw">return</span> atualizada
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)`} />
                  </StepBlock>

                  <StepBlock num="04" title="Endpoint: Remover tarefa (DELETE)" forceOpen={exportMode}>
                    <div className="endpoint-row"><span className="method-pill delete">DELETE</span> /tarefas/{'{id}'}</div>
                    <p>Remove a tarefa pelo ID. Retorna apenas uma confirmação (sem body).</p>
                    <CodeBlock lang="PYTHON — adicionar em main.py" html={`<span class="dec">@app.delete</span>(<span class="str">"/tarefas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, t <span class="kw">in</span> <span class="fn">enumerate</span>(tarefas_db):
        <span class="kw">if</span> t.id == id:
            tarefas_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)`} />
                    <InfoBox variant="tip" label="💡 204 No Content">
                      <code>status_code=204</code> é o padrão para DELETE bem-sucedido — indica que a operação funcionou mas não há conteúdo para retornar.
                    </InfoBox>
                  </StepBlock>

                  <div className="chapter-divider">ARQUIVO main.py COMPLETO — CRUD EM MEMÓRIA</div>
                  <CodeBlock lang="PYTHON — main.py completo" html={`<span class="kw">from</span> fastapi <span class="kw">import</span> FastAPI, HTTPException
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel
<span class="kw">from</span> typing <span class="kw">import</span> List
<span class="kw">import</span> uuid

app = <span class="fn">FastAPI</span>(title=<span class="str">"API de Tarefas"</span>, version=<span class="str">"1.0.0"</span>)

<span class="kw">class</span> <span class="cls">TarefaEntrada</span>(BaseModel):
    titulo: <span class="cls">str</span>
    descricao: <span class="cls">str</span>
    concluida: <span class="cls">bool</span> = <span class="kw">False</span>

<span class="kw">class</span> <span class="cls">Tarefa</span>(<span class="cls">TarefaEntrada</span>):
    id: <span class="cls">str</span>

tarefas_db: List[<span class="cls">Tarefa</span>] = []

<span class="dec">@app.get</span>(<span class="str">"/"</span>)
<span class="kw">def</span> <span class="fn">raiz</span>():
    <span class="kw">return</span> {<span class="str">"mensagem"</span>: <span class="str">"API de Tarefas funcionando! 🚀"</span>}

<span class="dec">@app.post</span>(<span class="str">"/tarefas"</span>, response_model=<span class="cls">Tarefa</span>, status_code=<span class="num">201</span>)
<span class="kw">def</span> <span class="fn">criar_tarefa</span>(dados: <span class="cls">TarefaEntrada</span>):
    nova = <span class="cls">Tarefa</span>(id=<span class="cls">str</span>(uuid.<span class="fn">uuid4</span>()), **dados.<span class="fn">model_dump</span>())
    tarefas_db.<span class="fn">append</span>(nova)
    <span class="kw">return</span> nova

<span class="dec">@app.get</span>(<span class="str">"/tarefas"</span>, response_model=List[<span class="cls">Tarefa</span>])
<span class="kw">def</span> <span class="fn">listar_tarefas</span>():
    <span class="kw">return</span> tarefas_db

<span class="dec">@app.get</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">buscar_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> t <span class="kw">in</span> tarefas_db:
        <span class="kw">if</span> t.id == id:
            <span class="kw">return</span> t
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)

<span class="dec">@app.put</span>(<span class="str">"/tarefas/{id}"</span>, response_model=<span class="cls">Tarefa</span>)
<span class="kw">def</span> <span class="fn">editar_tarefa</span>(id: <span class="cls">str</span>, dados: <span class="cls">TarefaEntrada</span>):
    <span class="kw">for</span> i, t <span class="kw">in</span> <span class="fn">enumerate</span>(tarefas_db):
        <span class="kw">if</span> t.id == id:
            atualizada = <span class="cls">Tarefa</span>(id=id, **dados.<span class="fn">model_dump</span>())
            tarefas_db[i] = atualizada
            <span class="kw">return</span> atualizada
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)

<span class="dec">@app.delete</span>(<span class="str">"/tarefas/{id}"</span>, status_code=<span class="num">204</span>)
<span class="kw">def</span> <span class="fn">remover_tarefa</span>(id: <span class="cls">str</span>):
    <span class="kw">for</span> i, t <span class="kw">in</span> <span class="fn">enumerate</span>(tarefas_db):
        <span class="kw">if</span> t.id == id:
            tarefas_db.<span class="fn">pop</span>(i)
            <span class="kw">return</span>
    <span class="kw">raise</span> <span class="fn">HTTPException</span>(status_code=<span class="num">404</span>, detail=<span class="str">"Tarefa não encontrada"</span>)`} />

                  <div className="chapter-divider">RESUMO DO CRUD</div>
                  <div className="card">
                    <table className="pabd-table">
                      <thead>
                        <tr><th>Método</th><th>Rota</th><th>Operação</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        <tr><td><span className="method-pill post">POST</span></td><td><code>/tarefas</code></td><td>Criar tarefa</td><td>201 Created</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/tarefas</code></td><td>Listar todas</td><td>200 OK</td></tr>
                        <tr><td><span className="method-pill get">GET</span></td><td><code>/tarefas/{'{id}'}</code></td><td>Buscar por ID</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill put">PUT</span></td><td><code>/tarefas/{'{id}'}</code></td><td>Editar tarefa</td><td>200 / 404</td></tr>
                        <tr><td><span className="method-pill delete">DELETE</span></td><td><code>/tarefas/{'{id}'}</code></td><td>Remover tarefa</td><td>204 / 404</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <InfoBox variant="tip" label="🔜 PRÓXIMO PASSO">
                    Esta API armazena os dados em memória — ao reiniciar o servidor, tudo se perde. Na <strong>Aula 2</strong>, vamos conectar essa mesma API a um banco de dados SQLite para persistir os dados.
                  </InfoBox>

                  <div className="section-nav">
                    <button className="btn-outline" onClick={() => goTo(4)}>← Módulo 3</button>
                    <button className="btn-primary btn-pabd" onClick={() => goTo(6)}>Quiz →</button>
                  </div>
                </div>
              </LessonSection>
            )}

            {/* ── Section 6: Quiz ── */}
            {(current === 6 || exportMode) && (
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
                    </>
                  )}

                  <div className="section-nav" style={{ marginTop: '2rem' }}>
                    <button className="btn-outline" onClick={() => goTo(5)}>← Módulo 4</button>
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
