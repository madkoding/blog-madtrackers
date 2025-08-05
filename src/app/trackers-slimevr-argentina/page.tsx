import { Metadata } from 'next'
import Link from 'next/link'
import ProductStructuredDataWrapper from '../_components/common/ProductStructuredDataWrapper'

export const metadata: Metadata = {
  title: 'Trackers SlimeVR Argentina - Envío UPS 4-7 Días | madTrackers Chile',
  description: 'Trackers SlimeVR compatibles en Argentina. Envío UPS 4-7 días, soporte español, compatible VRChat Argentina. Mejor precio vs importación local.',
  keywords: [
    'trackers slimevr argentina',
    'slimevr argentina', 
    'full body tracking argentina',
    'vr trackers argentina',
    'vrchat argentina',
    'trackers argentina',
    'slimevr compatible argentina',
    'vr argentina',
    'realidad virtual argentina'
  ],
  openGraph: {
    title: 'Trackers SlimeVR Argentina - Envío UPS | madTrackers',
    description: 'Los mejores trackers SlimeVR compatibles para Argentina. Envío UPS 4-7 días, soporte español, compatible VRChat Argentina.',
    url: 'https://www.madtrackers.com/trackers-slimevr-argentina',
    siteName: 'madTrackers Chile',
    images: [
      {
        url: 'https://www.madtrackers.com/assets/blog/preview/cover.png',
        width: 1200,
        height: 630,
        alt: 'Trackers SlimeVR Argentina - madTrackers',
      }
    ],
    locale: 'es_AR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.madtrackers.com/trackers-slimevr-argentina',
    languages: {
      'es-AR': 'https://www.madtrackers.com/trackers-slimevr-argentina',
      'es': 'https://www.madtrackers.com/trackers-slimevr-argentina',
    },
  },
}

export default function TrackersSlimeVRArgentina() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trackers SlimeVR Argentina 🇦🇷
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Los mejores <strong>trackers SlimeVR compatibles</strong> ahora en Argentina. 
              Envío UPS 4-7 días, soporte en español argentino y compatible 100% con VRChat Argentina.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                Ver Precios Argentina
              </Link>
              <Link href="/posts/Envios_Internacionales_Trackers_SlimeVR" className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300">
                Información de Envío
              </Link>
            </div>
          </div>

          {/* Características específicas para Argentina */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-3">Envío UPS Argentina</h3>
              <p className="text-gray-300">
                Envío UPS Door to Door 4-7 días hábiles a Buenos Aires, 
                Córdoba, Rosario y todo el país.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-3">Mejor Precio Argentina</h3>
              <p className="text-gray-300">
                Precio imbatible vs importación local argentina. 
                Mucho más barato que alternativas locales.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">VRChat Argentina</h3>
              <p className="text-gray-300">
                100% compatible con la creciente comunidad 
                VRChat Argentina y NeosVR.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🇦🇷</div>
              <h3 className="text-xl font-bold text-white mb-3">Soporte Argentino</h3>
              <p className="text-gray-300">
                Atención en español argentino. Entendemos 
                el mercado y las necesidades locales.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🌎</div>
              <h3 className="text-xl font-bold text-white mb-3">Hermanos Latinos</h3>
              <p className="text-gray-300">
                Desde Chile para Argentina con amor. 
                Comunidad latinoamericana unida por VR.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-3">Kit Completo</h3>
              <p className="text-gray-300">
                Todo incluido: trackers, receptor, correas, 
                cables y manual en español.
              </p>
            </div>
          </div>

          {/* Información específica de Argentina */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Información de Envío a Argentina
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Detalles de Envío</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Costo:</strong> $78-88 USD (kit básico)</li>
                  <li><strong>Tiempo:</strong> 4-7 días hábiles</li>
                  <li><strong>Courier:</strong> UPS Door to Door</li>
                  <li><strong>Tracking:</strong> Seguimiento completo</li>
                  <li><strong>Seguro:</strong> Cobertura total UPS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Importación Argentina</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Impuestos:</strong> Según normativa AFIP</li>
                  <li><strong>Gestión:</strong> UPS se encarga de todo</li>
                  <li><strong>Documentos:</strong> Factura incluida</li>
                  <li><strong>Buenos Aires:</strong> 4-5 días típicamente</li>
                  <li><strong>Interior:</strong> 5-7 días hábiles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ciudades principales Argentina */}
          <div className="bg-gradient-to-r from-blue-500/20 to-white-500/20 rounded-xl p-8 border border-blue-400/30 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Envíos a Principales Ciudades de Argentina
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🏛️</div>
                <h4 className="text-white font-semibold">Buenos Aires</h4>
                <p className="text-gray-300 text-sm">4-5 días hábiles</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏫</div>
                <h4 className="text-white font-semibold">Córdoba</h4>
                <p className="text-gray-300 text-sm">5-6 días hábiles</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏭</div>
                <h4 className="text-white font-semibold">Rosario</h4>
                <p className="text-gray-300 text-sm">5-6 días hábiles</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏔️</div>
                <h4 className="text-white font-semibold">Mendoza y más</h4>
                <p className="text-gray-300 text-sm">6-7 días hábiles</p>
              </div>
            </div>
          </div>

          {/* Comparativa de precios Argentina */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Comparativa de Precios en Argentina
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">Marca</th>
                    <th className="text-left py-2">Kit 5 Trackers</th>
                    <th className="text-left py-2">Envío Argentina</th>
                    <th className="text-left py-2">Total USD</th>
                    <th className="text-left py-2">Soporte</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 font-semibold text-cyan-400">madTrackers</td>
                    <td className="py-2">Desde $XXX USD</td>
                    <td className="py-2">$78-88 USD</td>
                    <td className="py-2 text-green-400">$XXX USD</td>
                    <td className="py-2">🇦🇷 Español AR</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2">Mercado Libre AR</td>
                    <td className="py-2">$800+ USD</td>
                    <td className="py-2">Gratis</td>
                    <td className="py-2">$800+ USD</td>
                    <td className="py-2">🇦🇷 Español</td>
                  </tr>
                  <tr>
                    <td className="py-2">Importación Propia</td>
                    <td className="py-2">$350+ USD</td>
                    <td className="py-2">$80+ USD</td>
                    <td className="py-2">$500+ USD</td>
                    <td className="py-2">❌ Sin soporte</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Comunidad VR Argentina */}
          <div className="bg-gradient-to-r from-blue-500/20 to-white-500/20 rounded-xl p-8 border border-blue-400/30 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Comunidad VR Argentina 🇦🇷
            </h2>
            <div className="text-center text-gray-300 mb-6">
              <p className="text-lg">
                La comunidad VR argentina está creciendo rapidísimo, che. Desde Buenos Aires hasta 
                Mendoza, los argentinos están adoptando masivamente los trackers madTrackers.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🥩</div>
                <h4 className="text-white font-semibold">VRChat Argentina</h4>
                <p className="text-gray-300 text-sm">Asados virtuales semanales</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚽</div>
                <h4 className="text-white font-semibold">Fútbol VR</h4>
                <p className="text-gray-300 text-sm">Partidos y mundiales VR</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎵</div>
                <h4 className="text-white font-semibold">Música Argentina</h4>
                <p className="text-gray-300 text-sm">Rock y tango en VR</p>
              </div>
            </div>
          </div>

          {/* Ventajas específicas Argentina */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              ¿Por Qué Elegir madTrackers en Argentina?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Precio Imbatible</h4>
                    <p className="text-gray-300">Mucho más barato que cualquier alternativa argentina disponible.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Sin Intermediarios</h4>
                    <p className="text-gray-300">Directo del fabricante chileno, sin revendedores que inflen precios.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Comunidad Latina</h4>
                    <p className="text-gray-300">Soporte entre hermanos latinos, entendemos tu cultura.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Calidad Premium</h4>
                    <p className="text-gray-300">Componentes de primera calidad, mejor que marcas chinas baratas.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Fácil Importación</h4>
                    <p className="text-gray-300">UPS se encarga de toda la gestión aduanera argentina.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Garantía Internacional</h4>
                    <p className="text-gray-300">1 año de garantía con soporte en español argentino.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Argentina */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Preguntas Frecuentes - Argentina
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Los trackers SlimeVR funcionan en Argentina?
                </h3>
                <p className="text-gray-300">
                  ¡Claro que sí, che! Funcionan bárbaro en Argentina. Compatible con todos los cascos VR 
                  y la comunidad VRChat argentina los está adoptando de a montones.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Cómo es el tema de la AFIP y los impuestos?
                </h3>
                <p className="text-gray-300">
                  UPS se encarga de toda la gestión aduanera. Los impuestos se calculan según 
                  la normativa vigente de AFIP y se pagan contra entrega.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Es más barato que comprar en Argentina?
                </h3>
                <p className="text-gray-300">
                  Absolutamente. Los trackers locales cuestan $800+ USD, nosotros ofrecemos 
                  mejor calidad por mucho menos plata, incluyendo el envío.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Hay garantía en Argentina?
                </h3>
                <p className="text-gray-300">
                  Sí, garantía internacional de 1 año. Soporte técnico en español argentino 
                  vía WhatsApp +56 9 7574 6099.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Dale, Sumate a la Revolución VR Argentina! 🇦🇷
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Sé parte de la comunidad VR argentina con los mejores trackers SlimeVR, che
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-gradient-to-r from-blue-500 to-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-gray-100 transition-all duration-300 transform hover:scale-105">
                Comprar para Argentina
              </Link>
              <Link href="/posts/Envios_Internacionales_Trackers_SlimeVR" className="border-2 border-blue-400 text-blue-400 px-8 py-4 rounded-lg font-semibold hover:bg-blue-400 hover:text-gray-900 transition-all duration-300">
                Ver Todos los Países
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Structured Data para SEO */}
      <ProductStructuredDataWrapper 
        config={{
          name: "Trackers SlimeVR Argentina - Set de 6 Trackers madTrackers",
          description: "Set completo de 6 trackers SlimeVR compatibles con envío UPS rápido a Argentina. Compatible con VRChat, 50+ horas de batería, soporte en español.",
          url: "https://www.madtrackers.com/trackers-slimevr-argentina",
          // Usar precios dinámicos del backend
          sensorId: "sensor4", // ICM45686 + QMC6309 - el más popular
          trackerId: "rf", // ESB - el único disponible actualmente
          quantity: 6, // Set completo de 6 trackers
          countryCode: "AR", // Argentina - con comisiones PayPal
          // Información del producto
          sku: "MT-SLIMEVR-SET6-AR-2024",
          category: "VR Hardware",
          brand: "madTrackers",
          image: [
            "https://www.madtrackers.com/assets/blog/tracker-slimevr-madtrackers.webp",
            "https://www.madtrackers.com/assets/blog/configuracion-slimevr-argentina.webp"
          ],
          aggregateRating: {
            ratingValue: "4.7",
            reviewCount: "73",
            bestRating: "5",
            worstRating: "1"
          },
          reviews: [
            {
              author: "Matías Rodriguez",
              datePublished: "2024-12-18",
              reviewBody: "Excelente set de 6 trackers para Argentina. Llegaron en 5 días por UPS y funcionan perfecto con VRChat. La calidad es muy buena y el soporte en español es genial.",
              reviewRating: {
                ratingValue: "5",
                bestRating: "5",
                worstRating: "1"
              }
            },
            {
              author: "Lucía Fernández",
              datePublished: "2024-11-30",
              reviewBody: "El mejor set de trackers que he probado. Full body tracking completo funcionando perfecto en Buenos Aires. Vale la pena la inversión para VR serio.",
              reviewRating: {
                ratingValue: "5",
                bestRating: "5",
                worstRating: "1"
              }
            },
            {
              author: "Pablo Martinez",
              datePublished: "2024-11-10",
              reviewBody: "Muy buena calidad, aunque con impuestos argentinos sale caro. Pero el tracking es excelente y el envío UPS es confiable. Lo recomiendo.",
              reviewRating: {
                ratingValue: "4",
                bestRating: "5",
                worstRating: "1"
              }
            }
          ]
        }}
        fallbackToStatic={true}
      />
    </div>
  )
}
