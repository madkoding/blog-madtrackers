'use client'

import { useProductStructuredData } from '@/hooks/useProductStructuredData'
import Script from 'next/script'

export default function GlobalProductStructuredData() {
  const { structuredData, loading } = useProductStructuredData({
    name: "madTrackers SlimeVR Compatible - Set de 6 Trackers",
    description: "Set completo de 6 trackers de movimiento inalámbricos compatibles con SlimeVR Compatible, fabricados en Chile para VRChat y aplicaciones de realidad virtual",
    url: "https://www.madtrackers.com",
    sensorId: "sensor4", // ICM45686 + QMC6309 - el más popular
    trackerId: "rf", // ESB - el único disponible
    quantity: 6, // Set completo de 6 trackers
    countryCode: "CL", // Chile como país base
    category: "VR Hardware",
    brand: "madTrackers",
    sku: "MT-SLIMEVR-SET6-GLOBAL-2024",
    image: [
      "https://www.madtrackers.com/assets/blog/tracker-slimevr-madtrackers.webp"
    ],
    aggregateRating: {
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1"
    },
    reviews: [
      {
        author: "Carlos M.",
        datePublished: "2024-12-15",
        reviewBody: "Excelente calidad y precisión. El set completo de 6 trackers funciona perfectamente con VRChat y la batería de cada uno dura más de 40 horas.",
        reviewRating: {
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1"
        }
      },
      {
        author: "Ana S.",
        datePublished: "2024-11-28",
        reviewBody: "Muy fáciles de configurar y el soporte en español es excelente. El set de 6 trackers es perfecto para full body tracking completo. Recomendados al 100%.",
        reviewRating: {
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1"
        }
      },
      {
        author: "Miguel R.",
        datePublished: "2024-10-20",
        reviewBody: "Llegaron rápido desde Chile. La calidad de construcción del set completo es muy buena y funcionan sin problemas todos los trackers.",
        reviewRating: {
          ratingValue: "4",
          bestRating: "5",
          worstRating: "1"
        }
      }
    ]
  })

  // No renderizar hasta que tengamos los datos
  if (loading || !structuredData) {
    return null
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": structuredData.name,
    "description": structuredData.description,
    "url": structuredData.url,
    "brand": {
      "@type": "Brand",
      "name": structuredData.brand
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "madTrackers Chile",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CL"
      }
    },
    "category": structuredData.category,
    "sku": structuredData.sku,
    "image": structuredData.image,
    "keywords": "trackers slimevr compatible chile, sensores vr, vrchat, full body tracking",
    "offers": {
      "@type": "Offer",
      "priceCurrency": structuredData.priceCurrency,
      "price": structuredData.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": structuredData.availability,
      "itemCondition": structuredData.condition,
      "url": structuredData.url,
      "seller": {
        "@type": "Organization",
        "name": "madTrackers Chile",
        "url": "https://www.madtrackers.com"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": structuredData.aggregateRating.ratingValue,
      "reviewCount": structuredData.aggregateRating.reviewCount,
      "bestRating": structuredData.aggregateRating.bestRating,
      "worstRating": structuredData.aggregateRating.worstRating
    },
    "review": structuredData.reviews?.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.reviewRating.ratingValue,
        "bestRating": review.reviewRating.bestRating,
        "worstRating": review.reviewRating.worstRating
      }
    }))
  }

  return (
    <Script
      id="global-product-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  )
}
