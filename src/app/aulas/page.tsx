import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackgroundBlobs from '@/components/layout/BackgroundBlobs'
import ContentHub from '@/components/features/ContentHub'
import manifest from '@/data/manifests/aulas.json'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aulas — @ciromoura',
  description: 'Material didático e tutoriais.',
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
            <ContentHub categories={manifest.categories} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
