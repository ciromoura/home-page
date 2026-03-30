import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jogo: Passageiros — Raciocínio Lógico',
  description:
    'Jogo educativo de raciocínio lógico: distribua passageiros nos veículos respeitando as capacidades de cada um. Desenvolva pensamento estratégico e lógica combinatória de forma interativa.',
  keywords: [
    'jogo raciocínio lógico',
    'jogo educativo lógica',
    'jogo combinatória',
    'atividade lógica interativa',
    'jogo ensino médio raciocínio',
    'jogo educacional online',
  ],
  openGraph: {
    title: 'Jogo: Passageiros — Raciocínio Lógico | Ciro Moura',
    description:
      'Distribua passageiros respeitando as capacidades dos veículos. Desenvolva raciocínio lógico de forma divertida.',
    url: '/jogos/passageiros',
  },
  alternates: { canonical: '/jogos/passageiros' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
