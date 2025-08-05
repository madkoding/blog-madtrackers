import { useMemo } from 'react'
import { usePricing } from './usePricing'

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

interface ProductStructuredData {
  name: string
  description: string
  url: string
  price: string
  priceCurrency: string
  availability: string
  condition: string
  sku?: string
  gtin?: string
  mpn?: string
  image?: string[]
  category: string
  brand: string
  aggregateRating: {
    ratingValue: string
    reviewCount: string
    bestRating: string
    worstRating: string
  }
  reviews?: Array<{
    author: string
    datePublished: string
    reviewBody: string
    reviewRating: {
      ratingValue: string
      bestRating: string
      worstRating: string
    }
  }>
}

export function useProductStructuredData(config: ProductStructuredDataConfig): {
  structuredData: ProductStructuredData | null
  loading: boolean
  error: string | null
} {
  // Determinar si usar precios dinámicos o estáticos
  const shouldUseDynamicPricing = !config.staticPrice && 
    config.sensorId && 
    config.trackerId && 
    config.quantity && 
    config.countryCode

  // Usar valores por defecto para obtener precio representativo si no se especifican
  const effectiveSensorId = config.sensorId || 'sensor4' // Sensor más común
  const effectiveTrackerId = config.trackerId || 'rf' // Tracker más común
  const effectiveQuantity = config.quantity || 6 // 6 trackers es el set completo estándar

  const { pricing, loading, error } = usePricing({
    sensorId: effectiveSensorId,
    trackerId: effectiveTrackerId,
    quantity: effectiveQuantity,
    countryCode: config.countryCode
  })

  const structuredData = useMemo((): ProductStructuredData | null => {
    // Si estamos usando precios dinámicos y aún estamos cargando, devolver null
    if (shouldUseDynamicPricing && (loading || !pricing)) {
      return null
    }

    // Si hay precio estático, usarlo
    if (config.staticPrice) {
      return {
        name: config.name,
        description: config.description,
        url: config.url,
        price: config.staticPrice,
        priceCurrency: config.priceCurrency || 'USD',
        availability: config.availability || 'https://schema.org/InStock',
        condition: config.condition || 'https://schema.org/NewCondition',
        sku: config.sku,
        gtin: config.gtin,
        mpn: config.mpn,
        image: config.image,
        category: config.category || 'VR Hardware',
        brand: config.brand || 'madTrackers',
        aggregateRating: {
          ratingValue: config.aggregateRating?.ratingValue || '4.8',
          reviewCount: config.aggregateRating?.reviewCount || '127',
          bestRating: config.aggregateRating?.bestRating || '5',
          worstRating: config.aggregateRating?.worstRating || '1'
        },
        reviews: config.reviews?.map(review => ({
          author: review.author,
          datePublished: review.datePublished,
          reviewBody: review.reviewBody,
          reviewRating: {
            ratingValue: review.reviewRating.ratingValue,
            bestRating: review.reviewRating.bestRating || '5',
            worstRating: review.reviewRating.worstRating || '1'
          }
        }))
      }
    }

    // Usar precios dinámicos del backend
    if (pricing) {
      // Usar precio en USD para SEO consistente
      const finalPrice = pricing.prices.totalUsd.toFixed(2)
      const finalCurrency = 'USD'

      return {
        name: config.name,
        description: config.description,
        url: config.url,
        price: finalPrice,
        priceCurrency: finalCurrency,
        availability: config.availability || 'https://schema.org/InStock',
        condition: config.condition || 'https://schema.org/NewCondition',
        sku: config.sku,
        gtin: config.gtin,
        mpn: config.mpn,
        image: config.image,
        category: config.category || 'VR Hardware',
        brand: config.brand || 'madTrackers',
        aggregateRating: {
          ratingValue: config.aggregateRating?.ratingValue || '4.8',
          reviewCount: config.aggregateRating?.reviewCount || '127',
          bestRating: config.aggregateRating?.bestRating || '5',
          worstRating: config.aggregateRating?.worstRating || '1'
        },
        reviews: config.reviews?.map(review => ({
          author: review.author,
          datePublished: review.datePublished,
          reviewBody: review.reviewBody,
          reviewRating: {
            ratingValue: review.reviewRating.ratingValue,
            bestRating: review.reviewRating.bestRating || '5',
            worstRating: review.reviewRating.worstRating || '1'
          }
        }))
      }
    }

    // Fallback si no hay pricing disponible
    return null
  }, [config, pricing, loading, shouldUseDynamicPricing])

  return {
    structuredData,
    loading: shouldUseDynamicPricing ? loading : false,
    error: shouldUseDynamicPricing ? error : null
  }
}
