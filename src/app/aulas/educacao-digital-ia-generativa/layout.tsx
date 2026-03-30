import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula: IA Generativa e Engenharia de Prompt',
  description:
    'Entenda como funciona a inteligência artificial generativa, Machine Learning e LLMs (Large Language Models). Aprenda o método PROMPT para extrair o máximo do ChatGPT, Gemini, Claude e outras IAs.',
  keywords: [
    'IA generativa como funciona',
    'Machine Learning explicado',
    'LLM Large Language Model',
    'engenharia de prompt',
    'método PROMPT ChatGPT',
    'como usar ChatGPT',
    'inteligência artificial educação',
    'prompt engineering português',
    'uso responsável IA',
  ],
  openGraph: {
    title: 'Aula: IA Generativa e Engenharia de Prompt | Ciro Moura',
    description:
      'Como funciona IA, Machine Learning e LLMs. Aprenda o método PROMPT para usar ChatGPT e outras IAs com eficiência.',
    url: '/aulas/educacao-digital-ia-generativa',
  },
  alternates: { canonical: '/aulas/educacao-digital-ia-generativa' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
