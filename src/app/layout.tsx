import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SITE_URL } from '@/lib/site'
import '@/styles/globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Ciro Moura — Professor IFRN',
    template: '%s | Ciro Moura',
  },
  description:
    'Portfólio de Ciro Moura, professor de informática no IFRN Pau dos Ferros. Material didático, aulas de programação Python e FastAPI, jogos educativos e ferramentas online gratuitas.',
  keywords: [
    'professor IFRN',
    'material didático',
    'aulas programação',
    'FastAPI Python',
    'educação digital',
    'jogos educativos',
    'tabela verdade',
    'planning poker',
    'Ciro Moura',
    'IFRN Pau dos Ferros',
  ],
  authors: [{ name: 'Ciro Moura', url: SITE_URL }],
  creator: 'Ciro Moura',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Ciro Moura',
    title: 'Ciro Moura — Professor IFRN',
    description:
      'Portfólio e material didático de Ciro Moura, professor de informática no IFRN Pau dos Ferros.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciro Moura — Professor IFRN',
    description:
      'Portfólio e material didático de Ciro Moura, professor de informática no IFRN Pau dos Ferros.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark');})()`
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={openSans.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId="G-E575BCMD0Z" />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7263961104483212"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  )
}
