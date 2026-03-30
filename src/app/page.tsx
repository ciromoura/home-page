import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import SkillsSection from '@/components/features/SkillsSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ciro Moura — Professor IFRN | Material Didático Gratuito',
  description:
    'Portfólio de Ciro Moura, professor de informática no IFRN Pau dos Ferros. Acesse aulas de programação Python e FastAPI, jogos educativos, ferramentas online e muito mais.',
  keywords: [
    'Ciro Moura',
    'professor IFRN',
    'IFRN Pau dos Ferros',
    'material didático',
    'aulas programação Python',
    'educação digital',
    'jogos educativos ensino médio',
    'ferramentas online professor',
  ],
  openGraph: {
    title: 'Ciro Moura — Professor IFRN | Material Didático Gratuito',
    description:
      'Portfólio de Ciro Moura, professor de informática no IFRN Pau dos Ferros. Aulas, jogos educativos e ferramentas online gratuitas.',
    url: '/',
  },
  twitter: {
    title: 'Ciro Moura — Professor IFRN | Material Didático Gratuito',
    description:
      'Portfólio de Ciro Moura, professor de informática no IFRN Pau dos Ferros. Aulas, jogos educativos e ferramentas online gratuitas.',
  },
  alternates: { canonical: '/' },
}

export default function Home() {
  return (
    <>
      <BackgroundBlobs />
      <div className="shadow"></div>
      <Navbar />

      <main>
        {/* Seção Início */}
        <section id="inicio" className="section inicio-section">
          <div className="container">
            <div className="inicio-content">
              <div className="inicio-text card">
                <h1 className="name-full">Olá! Sou Ciro Moura!</h1>
                <p>Professor no IFRN-PF e sempre estudando algo novo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Navegação */}
        <section className="section nav-section">
          <div className="container">
            <h2>Explore</h2>
            <div className="sections-grid">
              <Link href="/aulas" className="section-card card">
                <i className="fas fa-graduation-cap section-icon"></i>
                <h3>Aulas</h3>
                <p>Material didático e tutoriais</p>
              </Link>
              <Link href="/jogos" className="section-card card">
                <i className="fas fa-gamepad section-icon"></i>
                <h3>Jogos</h3>
                <p>Jogos educativos e interativos</p>
              </Link>
              <Link href="/ferramentas" className="section-card card">
                <i className="fas fa-wrench section-icon"></i>
                <h3>Ferramentas</h3>
                <p>Utilitários e ferramentas online</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Seção Skills */}
        <section className="section skills-section">
          <div className="container">
            <div className="card">
              <div className="sobre-content">
                <div className="sobre-image">
                  <Image
                    src="/animation1.gif"
                    alt="Ilustração de programação animada"
                    width={200}
                    height={200}
                    unoptimized
                  />
                </div>
                <ul>
                  <li>👨‍🏫 Sou professor no IFRN;</li>
                  <li>📚 Tenho experiência em Banco de Dados, Mineração de Dados, Geoinformática,
                    Processamento de Imagens, Desenvolvimento Web e Informática na educação;</li>
                  <li>💻 Aprendendo mais sobre programação.</li>
                </ul>
              </div>
            </div>

            <h2 style={{ marginTop: '64px' }}>Minhas habilidades</h2>
            <SkillsSection />
          </div>
        </section>

        {/* Seção Sobre */}
        <section id="sobre" className="section skills-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="card">
              <div className="sobre-content">
                <div className="sobre-text">
                  <h2>Sobre</h2>
                  <p>Sou mestre em Ciência da Computação, professor no IFRN campus Pau dos Ferros e
                    tenho experiência em algumas áreas e estou sempre aprendendo algo novo no mundo da
                    programação.</p>
                  <p>Entre em contato:</p>
                  <ul className="social-links">
                    <li>
                      <a href="http://lattes.cnpq.br/6573088805666433" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.shields.io/badge/-Lattes-gray?style=flat-square" alt="Lattes" />
                      </a>
                    </li>
                    <li>
                      <a href="https://ciromoura.com.br/" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.shields.io/badge/-Blog-21759B?style=flat-square&logo=WordPress&logoColor=white" alt="Blog (WordPress)" />
                      </a>
                    </li>
                    <li>
                      <a href="https://www.linkedin.com/in/cirodgm/" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.shields.io/badge/-LinkedIn-blue?style=flat-square&logo=Linkedin&logoColor=white" alt="LinkedIn" />
                      </a>
                    </li>
                    <li>
                      <a href="https://instagram.com/ciromoura" target="_blank" rel="noopener noreferrer">
                        <img src="https://img.shields.io/badge/-Instagram-5d2e98?style=flat-square&labelColor=5d2e98&logo=Instagram&logoColor=white" alt="Instagram" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
