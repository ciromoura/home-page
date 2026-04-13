import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import BaseConverter from '@/components/features/BaseConverter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conversor de Bases Numéricas Online',
  description:
    'Converta números entre decimal, binário e hexadecimal com animação passo a passo. Entenda como cada conversão é feita de forma visual e interativa.',
  keywords: [
    'conversor de bases',
    'decimal para binário',
    'binário para hexadecimal',
    'hexadecimal para decimal',
    'conversão de bases numéricas',
    'base 2 base 10 base 16',
    'educação informática',
  ],
  openGraph: {
    title: 'Conversor de Bases Numéricas | Ciro Moura',
    description:
      'Converta números entre decimal, binário e hexadecimal com animação passo a passo explicando cada etapa da conversão.',
    url: '/ferramentas/conversor-bases',
  },
  alternates: { canonical: '/ferramentas/conversor-bases' },
}

export default function ConversorBasesPage() {
  return (
    <>
      <BackgroundBlobs />
      <div className="shadow" />
      <Navbar />

      <main>
        <section className="section inicio-section">
          <div className="container">
            <div className="inicio-content">
              <div className="inicio-text card">
                <h1 className="name-full">Conversor de Bases</h1>
                <p>Decimal · Binário · Hexadecimal</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <BaseConverter />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
