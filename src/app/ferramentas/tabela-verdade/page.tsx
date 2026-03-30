import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import TruthTableGenerator from '@/components/features/TruthTableGenerator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerador de Tabela Verdade Online',
  description:
    'Gere tabelas verdade para qualquer fórmula da lógica proposicional. Suporta negação (¬), conjunção (∧), disjunção (∨), condicional (→) e bicondicional (↔). Gratuito e online.',
  keywords: [
    'gerador tabela verdade',
    'tabela verdade online',
    'lógica proposicional',
    'operadores lógicos',
    'negação conjunção disjunção',
    'condicional bicondicional',
    'lógica matemática ferramenta',
    'álgebra booleana',
  ],
  openGraph: {
    title: 'Gerador de Tabela Verdade Online | Ciro Moura',
    description:
      'Gere tabelas verdade para fórmulas da lógica proposicional com negação, conjunção, disjunção, condicional e bicondicional. Gratuito.',
    url: '/ferramentas/tabela-verdade',
  },
  alternates: { canonical: '/ferramentas/tabela-verdade' },
}

export default function TabelaVerdadePage() {
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
                <h1 className="name-full">Tabela Verdade</h1>
                <p>Lógica proposicional</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <TruthTableGenerator />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
