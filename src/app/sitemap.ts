import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    // Hubs
    {
      url: `${SITE_URL}/aulas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/jogos`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ferramentas`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Aulas
    {
      url: `${SITE_URL}/aulas/educacao-digital-seguranca`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/aulas/educacao-digital-ia-generativa`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/aulas/pabd-fastapi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/aulas/pabd-fastapi-db`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Jogos
    {
      url: `${SITE_URL}/jogos/passageiros`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/jogos/somando`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    // Ferramentas
    {
      url: `${SITE_URL}/ferramentas/tabela-verdade`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/ferramentas/planning-poker`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ]
}
