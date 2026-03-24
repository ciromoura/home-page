'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import LiquidGlass from '@/components/ui/LiquidGlass'

const NAV_LINKS = [
  { label: 'Início',       href: '/' },
  { label: 'Aulas',        href: '/aulas' },
  { label: 'Jogos',        href: '/jogos' },
  { label: 'Ferramentas',  href: '/ferramentas' },
  { label: 'Sobre',        href: '/#sobre' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {menuOpen && (
        <div className="shadow" style={{ display: 'flex' }} onClick={closeMenu} />
      )}
      <header className="navbar">
        <LiquidGlass className="navbar-pill">
          <div className="logo">
            <Link href="/">@ciromoura</Link>
          </div>

          {/* Desktop: inline nav links — Mobile: absolute dropdown */}
          <LiquidGlass as="nav" className={`menu${menuOpen ? ' active' : ''}`}>
            <button className="close-btn" onClick={closeMenu}>&times;</button>
            <ul>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} onClick={closeMenu}>{label}</Link>
                </li>
              ))}
              <li>
                <button className="theme-btn" onClick={toggleTheme} suppressHydrationWarning>
                  <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`} suppressHydrationWarning />
                </button>
              </li>
            </ul>
          </LiquidGlass>

          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <i className="fas fa-bars" />
          </button>
        </LiquidGlass>
      </header>
    </>
  )
}
