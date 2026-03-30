import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import ContentHub from '@/components/features/ContentHub'
import manifest from '@/data/manifests/jogos.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jogos Educativos Online',
  description:
    'Jogos educativos e interativos para praticar matemática e raciocínio lógico. Desenvolvidos para alunos do ensino médio e técnico. Gratuitos e sem cadastro.',
  keywords: [
    'jogos educativos',
    'jogos matemática online',
    'jogos raciocínio lógico',
    'jogos ensino médio',
    'atividades interativas alunos',
    'jogos educacionais grátis',
  ],
  openGraph: {
    title: 'Jogos Educativos Online | Ciro Moura',
    description:
      'Jogos educativos para praticar matemática e raciocínio lógico. Gratuitos, sem cadastro, direto no navegador.',
    url: '/jogos',
  },
  alternates: { canonical: '/jogos' },
}

export default function JogosPage() {
  return (
    <>
      <BackgroundBlobs />
      <div className="shadow"></div>
      <Navbar />

      <main>
        <section className="section inicio-section">
          <div className="container">
            <div className="inicio-content">
              <div className="inicio-text card">
                <h1 className="name-full">Jogos</h1>
                <p>Jogos educativos e interativos</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <ContentHub categories={manifest.categories} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
