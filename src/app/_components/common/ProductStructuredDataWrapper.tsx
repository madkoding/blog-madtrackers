'use client'

import { useMemo } from 'react'
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
  // Crear configuración de fallback si es necesario
  const fallbackConfig = useMemo(() => {
    if (fallbackToStatic && !config.staticPrice) {
      return {
        ...config,
        staticPrice: '373.05',
        priceCurrency: 'USD'
      }
    }
    return config
  }, [config, fallbackToStatic])

  // Usar el hook una sola vez con la configuración apropiada
  const { structuredData, loading, error } = useProductStructuredData(config)
  const { structuredData: fallbackStructuredData } = useProductStructuredData(fallbackConfig)

  // Determinar qué datos usar basado en si hay error
  const finalData = useMemo(() => {
    if (error && fallbackToStatic && fallbackStructuredData) {
      return fallbackStructuredData
    }
    return structuredData
  }, [error, fallbackToStatic, fallbackStructuredData, structuredData])

  // No renderizar nada mientras está cargando o si no hay datos
  if (loading || !finalData) {
    return null
  }

  return (
    <StructuredData 
      type="product"
      data={finalData}
    />
  )
}
