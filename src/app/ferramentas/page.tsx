import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import ContentHub from '@/components/features/ContentHub'
import manifest from '@/data/manifests/ferramentas.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ferramentas Online Gratuitas',
  description:
    'Ferramentas web gratuitas para estudantes e professores: gerador de tabela verdade para lógica proposicional e planning poker para estimativas ágeis em equipe. Sem cadastro.',
  keywords: [
    'ferramentas online grátis',
    'gerador tabela verdade',
    'lógica proposicional online',
    'planning poker online grátis',
    'estimativas ágeis scrum',
    'ferramentas educacionais professor',
    'utilitários web',
  ],
  openGraph: {
    title: 'Ferramentas Online Gratuitas | Ciro Moura',
    description:
      'Tabela verdade e planning poker online. Gratuitos, sem cadastro, direto no navegador.',
    url: '/ferramentas',
  },
  alternates: { canonical: '/ferramentas' },
}

export default function FerramentasPage() {
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
                <h1 className="name-full">Ferramentas</h1>
                <p>Utilitários e ferramentas online</p>
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
