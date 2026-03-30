import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jogo: Somando — Aritmética Mental',
  description:
    'Jogo educativo de matemática: colete os números que caem na tela e some-os para atingir os alvos antes que o tempo acabe. Exercite agilidade mental e aritmética de forma divertida.',
  keywords: [
    'jogo matemática online',
    'aritmética mental jogo',
    'jogo educativo soma',
    'exercício matemática interativo',
    'jogo ensino fundamental',
    'atividade matemática online',
  ],
  openGraph: {
    title: 'Jogo: Somando — Aritmética Mental | Ciro Moura',
    description:
      'Some os números que caem na tela antes que o tempo acabe. Exercite aritmética mental de forma divertida.',
    url: '/jogos/somando',
  },
  alternates: { canonical: '/jogos/somando' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
