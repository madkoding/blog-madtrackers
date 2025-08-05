import { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '../_components/common/StructuredData'
import ProductStructuredDataWrapper from '../_components/common/ProductStructuredDataWrapper'

export const metadata: Metadata = {
  title: 'Trackers SlimeVR España - Envío Rápido UPS | madTrackers Chile',
  description: 'Trackers SlimeVR compatibles en España. Envío rápido UPS 3-5 días, soporte en español, 50+ horas batería. Compatible VRChat, full body tracking España.',
  keywords: [
    'trackers slimevr españa',
    'slimevr españa', 
    'full body tracking españa',
    'vr trackers españa',
    'vrchat españa',
    'trackers españa',
    'slimevr compatible españa',
    'vr españa',
    'realidad virtual españa'
  ],
  openGraph: {
    title: 'Trackers SlimeVR España - Envío UPS Rápido | madTrackers',
    description: 'Los mejores trackers SlimeVR compatibles para España. Envío UPS 3-5 días, soporte español, compatible VRChat.',
    url: 'https://www.madtrackers.com/trackers-slimevr-espana',
    siteName: 'madTrackers Chile',
    images: [
      {
        url: 'https://www.madtrackers.com/assets/blog/preview/cover.png',
        width: 1200,
        height: 630,
        alt: 'Trackers SlimeVR España - madTrackers',
      }
    ],
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.madtrackers.com/trackers-slimevr-espana',
    languages: {
      'es-ES': 'https://www.madtrackers.com/trackers-slimevr-espana',
      'es': 'https://www.madtrackers.com/trackers-slimevr-espana',
    },
  },
}

export default function TrackersSlimeVREspana() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trackers SlimeVR España 🇪🇸
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Los mejores <strong>trackers SlimeVR compatibles</strong> ahora disponibles en España. 
              Envío rápido UPS en 3-5 días, soporte en español y compatible 100% con VRChat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Ver Precios España
              </Link>
              <Link href="/posts/Envios_Internacionales_Trackers_SlimeVR" className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300">
                Información de Envío
              </Link>
            </div>
          </div>

          {/* Características específicas para España */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-3">Envío Rápido UPS España</h3>
              <p className="text-gray-300">
                Envío express UPS en 3-5 días hábiles a toda España. 
                Tracking completo desde Chile hasta tu domicilio.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-3">Precio Total desde €85</h3>
              <p className="text-gray-300">
                Precio completo producto + envío UPS a España. 
                Mejor precio vs competencia europea.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">VRChat España Compatible</h3>
              <p className="text-gray-300">
                100% compatible con VRChat España, NeosVR y todas las 
                aplicaciones de realidad virtual españolas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🇪🇸</div>
              <h3 className="text-xl font-bold text-white mb-3">Soporte en Español</h3>
              <p className="text-gray-300">
                Atención al cliente completamente en español. 
                Horarios compatibles con España (GMT+1).
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🔋</div>
              <h3 className="text-xl font-bold text-white mb-3">50+ Horas Batería</h3>
              <p className="text-gray-300">
                Batería ultra-duradera para sesiones largas de VR. 
                Ideal para maratones de VRChat España.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-white mb-3">Kit Completo Incluido</h3>
              <p className="text-gray-300">
                Trackers, receptor USB, correas, cables y manual 
                de configuración en español.
              </p>
            </div>
          </div>

          {/* Información específica de España */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Información de Envío a España
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Detalles de Envío</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Costo:</strong> $75-85 USD (kit básico)</li>
                  <li><strong>Tiempo:</strong> 3-5 días hábiles</li>
                  <li><strong>Courier:</strong> UPS Express</li>
                  <li><strong>Tracking:</strong> Seguimiento completo</li>
                  <li><strong>Seguro:</strong> Incluido por UPS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Importación España</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>IVA:</strong> 21% del valor CIF</li>
                  <li><strong>Gestión UPS:</strong> ~€15-25</li>
                  <li><strong>Documentos:</strong> Factura incluida</li>
                  <li><strong>Ciudades:</strong> Madrid, Barcelona, Valencia, Sevilla</li>
                  <li><strong>Zonas rurales:</strong> +1-2 días</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comunidad VR España */}
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl p-8 border border-purple-400/30 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Comunidad VR España
            </h2>
            <div className="text-center text-gray-300 mb-6">
              <p className="text-lg">
                Únete a la creciente comunidad de usuarios españoles de trackers SlimeVR madTrackers. 
                Participa en eventos VRChat España y conecta con otros usuarios españoles.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🎮</div>
                <h4 className="text-white font-semibold">VRChat España</h4>
                <p className="text-gray-300 text-sm">Eventos y meetups españoles</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="text-white font-semibold">Discord VR España</h4>
                <p className="text-gray-300 text-sm">Comunidad activa en español</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛠️</div>
                <h4 className="text-white font-semibold">Soporte Técnico</h4>
                <p className="text-gray-300 text-sm">WhatsApp +56 9 7574 6099</p>
              </div>
            </div>
          </div>

          {/* Comparativa de precios España */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Comparativa de Precios en España
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2">Marca</th>
                    <th className="text-left py-2">Kit 5 Trackers</th>
                    <th className="text-left py-2">Envío a España</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Soporte</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 font-semibold text-cyan-400">madTrackers</td>
                    <td className="py-2">Desde €XXX</td>
                    <td className="py-2">€65-75</td>
                    <td className="py-2 text-green-400">€XXX</td>
                    <td className="py-2">🇪🇸 Español</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2">HaritoraX</td>
                    <td className="py-2">€350+</td>
                    <td className="py-2">€50+</td>
                    <td className="py-2">€400+</td>
                    <td className="py-2">🇬🇧 Inglés</td>
                  </tr>
                  <tr>
                    <td className="py-2">Tundra Labs</td>
                    <td className="py-2">€600+</td>
                    <td className="py-2">€80+</td>
                    <td className="py-2">€680+</td>
                    <td className="py-2">🇬🇧 Inglés</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ España */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Preguntas Frecuentes - España
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Los trackers SlimeVR funcionan en España?
                </h3>
                <p className="text-gray-300">
                  Sí, funcionan perfectamente en España. Solo necesitas descargar SlimeVR Server 
                  gratis y seguir nuestro manual en español. Compatible con todos los cascos VR.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Cuánto tardan en llegar a España?
                </h3>
                <p className="text-gray-300">
                  El envío UPS Express tarda 3-5 días hábiles desde Chile hasta España. 
                  Madrid y Barcelona suelen recibir en 3-4 días.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Qué impuestos debo pagar en España?
                </h3>
                <p className="text-gray-300">
                  España aplica IVA del 21% sobre el valor CIF (producto + envío + seguro) 
                  más tasas de gestión de UPS (€15-25 aproximadamente).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Hay garantía en España?
                </h3>
                <p className="text-gray-300">
                  Sí, ofrecemos garantía internacional de 1 año. El soporte técnico es 
                  completamente en español vía WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Únete a la Revolución VR en España! 🇪🇸
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Sé parte de la comunidad VR española con los mejores trackers SlimeVR del mercado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Personalizar y Comprar
              </Link>
              <Link href="/posts/Envios_Internacionales_Trackers_SlimeVR" className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300">
                Ver Todos los Países
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Structured Data para SEO */}
      <ProductStructuredDataWrapper 
        config={{
          name: "Trackers SlimeVR España - Set de 6 Trackers madTrackers",
          description: "Set completo de 6 trackers SlimeVR compatibles con envío rápido a España. Compatible con VRChat, 50+ horas de batería, soporte en español.",
          url: "https://www.madtrackers.com/trackers-slimevr-espana",
          // Usar precios dinámicos del backend
          sensorId: "sensor4", // ICM45686 + QMC6309 - el más popular
          trackerId: "rf", // ESB - el único disponible actualmente
          quantity: 6, // Set completo de 6 trackers
          countryCode: "ES",
          // Información del producto
          sku: "MT-SLIMEVR-SET6-ES-2024",
          category: "VR Hardware",
          brand: "madTrackers",
          image: [
            "https://www.madtrackers.com/assets/blog/tracker-slimevr-madtrackers.webp",
            "https://www.madtrackers.com/assets/blog/configuracion-slimevr-espana.webp"
          ],
          aggregateRating: {
            ratingValue: "4.9",
            reviewCount: "89",
            bestRating: "5",
            worstRating: "1"
          },
          reviews: [
            {
              author: "Elena García",
              datePublished: "2024-12-10",
              reviewBody: "Envío súper rápido a Madrid, llegaron en 3 días. El set completo de 6 trackers funciona perfectamente con mi Quest 2 en VRChat. La batería dura toda la semana fácilmente.",
              reviewRating: {
                ratingValue: "5",
                bestRating: "5",
                worstRating: "1"
              }
            },
            {
              author: "Javier M.",
              datePublished: "2024-11-25",
              reviewBody: "Excelente soporte en español y muy fáciles de configurar. Los 6 trackers son perfectos para full body tracking completo. Los recomiendo totalmente.",
              reviewRating: {
                ratingValue: "5",
                bestRating: "5",
                worstRating: "1"
              }
            },
            {
              author: "Carmen R.",
              datePublished: "2024-10-15",
              reviewBody: "Muy buena calidad, aunque el precio del set completo con impuestos sale algo caro. Pero la calidad lo vale y el tracking es excelente.",
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
      
      <StructuredData 
        type="faq"
        data={{
          questions: [
            {
              question: "¿Los trackers SlimeVR funcionan en España?",
              answer: "Sí, funcionan perfectamente en España. Solo necesitas descargar SlimeVR Server gratis y seguir nuestro manual en español. Compatible con todos los cascos VR."
            },
            {
              question: "¿Cuánto tardan en llegar a España?",
              answer: "El envío UPS Express tarda 3-5 días hábiles desde Chile hasta España. Madrid y Barcelona suelen recibir en 3-4 días."
            },
            {
              question: "¿Qué impuestos debo pagar en España?",
              answer: "España aplica IVA del 21% sobre el valor CIF (producto + envío + seguro) más tasas de gestión de UPS (€15-25 aproximadamente)."
            }
          ]
        }}
      />
    </div>
  )
}
