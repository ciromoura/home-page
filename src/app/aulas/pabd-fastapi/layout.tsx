import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula: FastAPI com Python — Primeiros Passos',
  description:
    'Aprenda a criar APIs REST com FastAPI e Python do zero: ambiente virtual com uv, requisições HTTP com httpx, CRUD completo em memória, códigos de status HTTP e versionamento com Git.',
  keywords: [
    'FastAPI tutorial',
    'Python API REST',
    'FastAPI primeiros passos',
    'uv ambiente virtual Python',
    'httpx Python',
    'CRUD FastAPI',
    'API Python tutorial',
    'status HTTP 200 404',
    'aula FastAPI IFRN',
  ],
  openGraph: {
    title: 'Aula: FastAPI com Python — Primeiros Passos | Ciro Moura',
    description:
      'Crie APIs REST com FastAPI do zero: ambiente virtual, httpx, CRUD em memória e códigos de status HTTP.',
    url: '/aulas/pabd-fastapi',
  },
  alternates: { canonical: '/aulas/pabd-fastapi' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
