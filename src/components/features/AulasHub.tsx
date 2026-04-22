'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ManifestCategory } from './ContentHub'

interface AulasHubProps {
  categories: ManifestCategory[]
}

interface FlatItem {
  title: string
  href: string
  description: string
  category: string
  categorySigla: string
  categoryCor: string
}

const PAGE_SIZE = 9

export default function AulasHub({ categories }: AulasHubProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const allItems = useMemo<FlatItem[]>(() =>
    categories.flatMap(cat =>
      cat.items.map(item => ({
        ...item,
        category: cat.name,
        categorySigla: cat.sigla ?? cat.name,
        categoryCor: cat.cor ?? '',
      }))
    ), [categories])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allItems.filter(item => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      const matchesCategory = !activeCategory || item.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [allItems, search, activeCategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleCategory(cat: string | null) {
    setActiveCategory(cat)
    setPage(1)
  }

  return (
    <div className="aulas-hub">
      <div className="aulas-controls">
        <div className="aulas-search-wrap">
          <i className="fas fa-search aulas-search-icon" />
          <input
            className="aulas-search input-glass"
            type="search"
            placeholder="Buscar aula ou categoria…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            aria-label="Buscar aulas"
          />
        </div>

        <div className="aulas-filters" role="group" aria-label="Filtrar por categoria">
          <button
            className={`filter-pill${!activeCategory ? ' active' : ''}`}
            onClick={() => handleCategory(null)}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              className={`filter-pill${activeCategory === cat.name ? ' active' : ''}`}
              onClick={() => handleCategory(cat.name)}
              title={cat.name}
              style={cat.cor ? { '--pill-color': cat.cor } as React.CSSProperties : undefined}
            >
              {cat.sigla ?? cat.name}
            </button>
          ))}
        </div>
      </div>

      <p className="aulas-results-info">
        {filtered.length === 0
          ? 'Nenhuma aula encontrada.'
          : `${filtered.length} aula${filtered.length !== 1 ? 's' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
        {filtered.length > 0 && totalPages > 1 && (
          <span className="aulas-page-info"> — página {safePage} de {totalPages}</span>
        )}
      </p>

      {filtered.length > 0 && (
        <div className="aulas-grid">
          {pageItems.map(item => (
            <Link key={item.href} href={item.href} className="aulas-card card">
              <span
                className="aulas-card-badge"
                style={item.categoryCor ? { '--badge-color': item.categoryCor } as React.CSSProperties : undefined}
              >
                {item.categorySigla}
              </span>
              <span className="aulas-card-title">{item.title}</span>
              {item.description && (
                <span className="aulas-card-desc">{item.description}</span>
              )}
              <i className="fas fa-arrow-right item-arrow" />
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="aulas-pagination">
          <button
            className="page-btn btn-secondary"
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
            aria-label="Página anterior"
          >
            <i className="fas fa-chevron-left" />
            <span>Anterior</span>
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`page-num${n === safePage ? ' active' : ''}`}
                onClick={() => setPage(n)}
                aria-label={`Página ${n}`}
                aria-current={n === safePage ? 'page' : undefined}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="page-btn btn-secondary"
            disabled={safePage === totalPages}
            onClick={() => setPage(safePage + 1)}
            aria-label="Próxima página"
          >
            <span>Próxima</span>
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  )
}
