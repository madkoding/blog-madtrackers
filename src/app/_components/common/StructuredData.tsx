import Script from 'next/script'

interface StructuredDataProps {
  type: 'product' | 'organization' | 'breadcrumb' | 'faq'
  data: any
}

export default function StructuredData({ type, data }: Readonly<StructuredDataProps>) {
  const generateSchema = () => {
    switch (type) {
      case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": data.name,
          "description": data.description,
          "brand": {
            "@type": "Brand",
            "name": "madTrackers"
          },
          "manufacturer": {
            "@type": "Organization",
            "name": "madTrackers Chile"
          },
          "offers": {
            "@type": "Offer",
            "url": data.url,
            "priceCurrency": "USD",
            "price": data.price,
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "madTrackers Chile"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150"
          }
        }
      
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "madTrackers Chile",
          "url": "https://www.madtrackers.com",
          "logo": "https://www.madtrackers.com/assets/madtrackers.svg",
          "description": "Fabricante de trackers SlimeVR compatibles en Chile. Envío internacional a países hispanos.",
          "foundingDate": "2023",
          "foundingLocation": {
            "@type": "Place",
            "name": "Chile"
          },
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
        }
      
      case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.questions.map((q: any) => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": q.answer
            }
          }))
        }
        
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
