import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula: FastAPI com Banco de Dados SQLite',
  description:
    'Conecte sua API FastAPI ao banco de dados SQLite: persistência de dados entre reinicializações, arquivo database.py, queries parametrizadas e boas práticas de segurança com Python.',
  keywords: [
    'FastAPI SQLite',
    'banco de dados Python',
    'SQLite Python tutorial',
    'persistência dados FastAPI',
    'database.py FastAPI',
    'queries parametrizadas Python',
    'API Python banco de dados',
    'aula FastAPI SQLite IFRN',
  ],
  openGraph: {
    title: 'Aula: FastAPI com Banco de Dados SQLite | Ciro Moura',
    description:
      'Conecte FastAPI ao SQLite: persistência de dados, database.py e queries parametrizadas.',
    url: '/aulas/pabd-fastapi-db',
  },
  alternates: { canonical: '/aulas/pabd-fastapi-db' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
