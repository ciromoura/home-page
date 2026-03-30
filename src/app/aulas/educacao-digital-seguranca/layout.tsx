import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aula: Segurança Digital — Golpes, Phishing e Malware',
  description:
    'Aprenda a identificar golpes digitais, e-mails de phishing e malware. Engenharia social, autenticação em dois fatores (2FA), senhas seguras e como se recuperar após sofrer um golpe online.',
  keywords: [
    'segurança digital',
    'phishing como identificar',
    'engenharia social golpes',
    'malware vírus trojan',
    'autenticação dois fatores 2FA',
    'senhas seguras',
    'golpes internet',
    'educação digital segurança',
    'como se proteger golpes online',
  ],
  openGraph: {
    title: 'Aula: Segurança Digital — Golpes, Phishing e Malware | Ciro Moura',
    description:
      'Identifique phishing, malware e engenharia social. Aprenda 2FA, senhas seguras e como agir após um golpe digital.',
    url: '/aulas/educacao-digital-seguranca',
  },
  alternates: { canonical: '/aulas/educacao-digital-seguranca' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
