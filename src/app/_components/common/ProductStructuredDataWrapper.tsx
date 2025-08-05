'use client'

import { useProductStructuredData } from '@/hooks/useProductStructuredData'
import StructuredData from './StructuredData'

interface ProductStructuredDataConfig {
  name: string
  description: string
  url: string
  sku?: string
  gtin?: string
  mpn?: string
  image?: string[]
  category?: string
  brand?: string
  countryCode: string
  sensorId?: string
  trackerId?: string
  quantity?: number
  staticPrice?: string
  priceCurrency?: string
  availability?: string
  condition?: string
  aggregateRating?: {
    ratingValue: string
    reviewCount: string
    bestRating?: string
    worstRating?: string
  }
  reviews?: Array<{
    author: string
    datePublished: string
    reviewBody: string
    reviewRating: {
      ratingValue: string
      bestRating?: string
      worstRating?: string
    }
  }>
}

interface ProductStructuredDataWrapperProps {
  config: ProductStructuredDataConfig
  fallbackToStatic?: boolean
}

export default function ProductStructuredDataWrapper({ 
  config, 
  fallbackToStatic = true 
}: Readonly<ProductStructuredDataWrapperProps>) {
  const { structuredData, loading, error } = useProductStructuredData(config)

  // Si hay error y se permite fallback estático, usar precio estático
  if (error && fallbackToStatic && !config.staticPrice) {
    const fallbackData = {
      ...config,
      staticPrice: '85.00',
      priceCurrency: 'USD'
    }
    
    const { structuredData: fallbackStructuredData } = useProductStructuredData(fallbackData)
    
    if (fallbackStructuredData) {
      return (
        <StructuredData 
          type="product"
          data={fallbackStructuredData}
        />
      )
    }
  }

  // No renderizar nada mientras está cargando o si no hay datos
  if (loading || !structuredData) {
    return null
  }

  return (
    <StructuredData 
      type="product"
      data={structuredData}
    />
  )
}
