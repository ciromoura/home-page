import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import ContentHub from '@/components/features/ContentHub'
import manifest from '@/data/manifests/ferramentas.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ferramentas — @ciromoura',
  description: 'Utilitários e ferramentas online.',
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
