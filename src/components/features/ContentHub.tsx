import Link from 'next/link'

export interface ManifestItem {
  title: string
  href: string
  description: string
}

export interface ManifestCategory {
  name: string
  sigla?: string
  cor?: string
  items: ManifestItem[]
}

interface ContentHubProps {
  categories: ManifestCategory[]
}

export default function ContentHub({ categories }: ContentHubProps) {
  if (categories.length === 0 || categories.every(c => c.items.length === 0)) {
    return (
      <div className="empty-state">
        <div className="card">
          <i className="fas fa-inbox"></i>
          <p>Nenhum conteúdo disponível ainda.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="content-area">
      {categories.map(category => (
        <div key={category.name} className="category-section">
          <h2>{category.name}</h2>
          <div className="items-grid">
            {category.items.map(item => (
              <Link key={item.href} href={item.href} className="item-card card">
                <span className="item-title">{item.title}</span>
                {item.description && (
                  <span className="item-desc">{item.description}</span>
                )}
                <i className="fas fa-arrow-right item-arrow"></i>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
