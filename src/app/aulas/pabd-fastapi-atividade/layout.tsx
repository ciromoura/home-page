import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Atividade: API Escolar com FastAPI — Alunos, Disciplinas e Infrações',
  description:
    'Atividade prática de FastAPI com Python: implemente um CRUD completo para Alunos, Disciplinas (N:N) e Infrações usando Pydantic, UUID e armazenamento em memória.',
  keywords: [
    'FastAPI atividade prática',
    'CRUD FastAPI Python',
    'relacionamento N para N FastAPI',
    'Pydantic modelos',
    'API Escolar Python',
    'alunos disciplinas infrações API',
    'FastAPI UUID em memória',
    'aula PABD IFRN',
  ],
  openGraph: {
    title: 'Atividade: API Escolar com FastAPI | Ciro Moura',
    description:
      'Crie uma API REST com FastAPI para gerenciar Alunos, Disciplinas e Infrações com relacionamento N:N.',
    url: '/aulas/pabd-fastapi-atividade',
  },
  alternates: { canonical: '/aulas/pabd-fastapi-atividade' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
