import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import AulasHub from '@/components/features/AulasHub'
import manifest from '@/data/manifests/aulas.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aulas de Programação e Educação Digital',
  description:
    'Material didático gratuito: aulas de FastAPI com Python, banco de dados SQLite, educação digital, segurança na internet e inteligência artificial generativa. Para alunos do IFRN e autodidatas.',
  keywords: [
    'aulas programação',
    'FastAPI Python tutorial',
    'banco de dados SQLite',
    'educação digital',
    'segurança digital phishing',
    'IA generativa engenharia de prompt',
    'material didático IFRN',
    'aulas online grátis',
  ],
  openGraph: {
    title: 'Aulas de Programação e Educação Digital | Ciro Moura',
    description:
      'Material didático gratuito: FastAPI, SQLite, segurança digital e IA generativa. Para alunos do IFRN e autodidatas.',
    url: '/aulas',
  },
  alternates: { canonical: '/aulas' },
}

export default function AulasPage() {
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
                <h1 className="name-full">Aulas</h1>
                <p>Material didático e tutoriais</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <AulasHub categories={manifest.categories} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
