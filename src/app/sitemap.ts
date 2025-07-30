import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/api'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.madtrackers.com'
  const allPosts = getAllPosts()

  // URLs estáticas principales
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/trackers-slimevr-chile`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/seguimiento`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // URLs de posts del blog
  const postRoutes = allPosts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...routes, ...postRoutes]
}
