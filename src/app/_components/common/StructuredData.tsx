import Script from 'next/script'

interface ProductData {
  name: string
  description: string
  url: string
  price: string
  priceCurrency?: string
  availability?: string
  condition?: string
  sku?: string
  gtin?: string
  mpn?: string
  image?: string[]
  category?: string
  brand?: string
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

interface FAQData {
  questions: Array<{
    question: string
    answer: string
  }>
}

interface StructuredDataProps {
  type: 'product' | 'organization' | 'breadcrumb' | 'faq'
  data: ProductData | FAQData | Record<string, unknown>
}

export default function StructuredData({ type, data }: Readonly<StructuredDataProps>) {
  const isProductData = (data: unknown): data is ProductData => {
    return typeof data === 'object' && data !== null && 'name' in data && 'description' in data
  }

  const isFAQData = (data: unknown): data is FAQData => {
    return typeof data === 'object' && data !== null && 'questions' in data
  }

  const generateProductSchema = (data: ProductData) => {
    const productSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": data.name,
      "description": data.description,
      "url": data.url,
      "brand": {
        "@type": "Brand",
        "name": data.brand || "madTrackers"
      },
      "manufacturer": {
        "@type": "Organization",
        "name": "madTrackers Chile"
      },
      "category": data.category || "VR Hardware",
      "offers": {
        "@type": "Offer",
        "url": data.url,
        "priceCurrency": data.priceCurrency || "USD",
        "price": data.price,
        "availability": data.availability || "https://schema.org/InStock",
        "itemCondition": data.condition || "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "madTrackers Chile",
          "url": "https://www.madtrackers.com"
        },
        "validFrom": new Date().toISOString(),
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    }

    // Agregar campos opcionales
    if (data.sku) productSchema.sku = data.sku
    if (data.gtin) productSchema.gtin = data.gtin
    if (data.mpn) productSchema.mpn = data.mpn
    if (data.image && data.image.length > 0) productSchema.image = data.image

    // Agregar reviews
    if (data.reviews && data.reviews.length > 0) {
      productSchema.review = data.reviews.map(review => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": review.author },
        "datePublished": review.datePublished,
        "reviewBody": review.reviewBody,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.reviewRating.ratingValue,
          "bestRating": review.reviewRating.bestRating || "5",
          "worstRating": review.reviewRating.worstRating || "1"
        }
      }))
    }

    // Agregar aggregateRating
    const rating = data.aggregateRating || {
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1"
    }
    
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating.ratingValue,
      "reviewCount": rating.reviewCount,
      "bestRating": rating.bestRating || "5",
      "worstRating": rating.worstRating || "1"
    }

    return productSchema
  }

  const generateFAQSchema = (data: FAQData) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.questions.map((q) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  })

  const generateOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "madTrackers Chile",
    "url": "https://www.madtrackers.com",
    "logo": "https://www.madtrackers.com/assets/madtrackers.svg",
    "description": "Fabricante de trackers SlimeVR compatibles en Chile. Envío internacional a países hispanos.",
    "foundingDate": "2023",
    "foundingLocation": { "@type": "Place", "name": "Chile" },
    "areaServed": [
      "Chile", "España", "México", "Argentina", "Colombia", "Perú", 
      "Venezuela", "Ecuador", "Estados Unidos", "Canada"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+56975746099",
      "contactType": "Customer Service",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://instagram.com/madkoding",
      "https://twitter.com/madtrackers"
    ]
  })

  const generateSchema = () => {
    switch (type) {
      case 'product':
        return isProductData(data) ? generateProductSchema(data) : {}
      case 'organization':
        return generateOrganizationSchema()
      case 'faq':
        return isFAQData(data) ? generateFAQSchema(data) : {}
      default:
        return {}
    }
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema())
      }}
    />
  )
}
