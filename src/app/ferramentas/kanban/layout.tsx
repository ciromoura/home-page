import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quadro Kanban Online — Organize suas Tarefas',
  description:
    'Quadro Kanban gratuito com drag and drop para organizar tarefas em três colunas: Em Aberto, Executando e Concluídas. Salva no navegador, exporta/importa JSON e compartilha via link.',
  keywords: [
    'kanban online',
    'quadro kanban grátis',
    'organização de tarefas',
    'drag and drop tarefas',
    'gerenciador de tarefas',
    'kanban sem cadastro',
    'quadro de tarefas online',
    'compartilhar tarefas link',
  ],
  openGraph: {
    title: 'Quadro Kanban Online Gratuito | Ciro Moura',
    description:
      'Organize tarefas com drag and drop. Salva no navegador, compartilha via link e exporta/importa JSON.',
    url: '/ferramentas/kanban',
  },
  alternates: { canonical: '/ferramentas/kanban' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
