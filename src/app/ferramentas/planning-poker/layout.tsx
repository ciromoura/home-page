import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planning Poker Online — Estimativas Ágeis em Equipe',
  description:
    'Ferramenta gratuita de Planning Poker online para estimar tarefas em equipe. Votação colaborativa em tempo real via WebRTC, sem necessidade de cadastro. Ideal para times Scrum e Kanban.',
  keywords: [
    'planning poker online',
    'planning poker grátis',
    'estimativas ágeis',
    'scrum poker online',
    'votação equipe tempo real',
    'story points estimativa',
    'WebRTC colaborativo',
    'ferramenta scrum',
    'planning poker sem cadastro',
  ],
  openGraph: {
    title: 'Planning Poker Online Gratuito | Ciro Moura',
    description:
      'Estime tarefas em equipe com votação em tempo real via WebRTC. Sem cadastro, gratuito e direto no navegador.',
    url: '/ferramentas/planning-poker',
  },
  alternates: { canonical: '/ferramentas/planning-poker' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
