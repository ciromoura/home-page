import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula: Apresentação Científica de Sucesso',
  description:
    'Guia completo para criar e apresentar trabalhos científicos com impacto: planejamento, design de slides, construção de conteúdo, revisão, ensaio e técnicas de apresentação.',
  keywords: [
    'apresentação científica',
    'como fazer slides',
    'design de slides',
    'técnicas de apresentação',
    'defesa de trabalho',
    'TCC apresentação',
    'engenharia de prompt',
    'slides acadêmicos',
    'apresentação banca avaliadora',
  ],
  openGraph: {
    title: 'Aula: Apresentação Científica de Sucesso | Ciro Moura',
    description:
      'Do planejamento ao dia da apresentação: 6 etapas para comunicar seu trabalho com clareza e segurança.',
    url: '/aulas/educacao-digital-apresentacao',
  },
  alternates: { canonical: '/aulas/educacao-digital-apresentacao' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
