import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Trackers SlimeVR Compatible Chile - madTrackers | Sensores VR Fabricados en Chile',
  description: 'Trackers SlimeVR Compatible fabricados en Chile. Sensores de movimiento inalámbricos para VRChat, full body tracking, batería ultra-duradera. Envío gratuito a todo Chile.',
  keywords: 'trackers slimevr compatible chile, sensores vr chile, vrchat chile, full body tracking chile, madtrackers chile, slimevr compatible chile, vr tracking chile, sensores movimiento chile',
  openGraph: {
    title: 'Trackers SlimeVR Compatible Chile - madTrackers',
    description: 'Los mejores trackers SlimeVR Compatible fabricados en Chile para VRChat y aplicaciones VR',
    url: 'https://www.madtrackers.com/trackers-slimevr-chile',
    images: [
      {
        url: 'https://www.madtrackers.com/assets/blog/preview/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Trackers SlimeVR Compatible Chile - madTrackers',
      }
    ],
  },
}

export default function TrackersSlimeVRChile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trackers SlimeVR Compatible en Chile
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Los únicos trackers SlimeVR Compatible fabricados en Chile. 
              Sensores de movimiento inalámbricos de alta precisión para VRChat, 
              full body tracking y aplicaciones de realidad virtual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Ver Precios y Personalizar
              </Link>
              <Link href="/posts/Configuracion_Inicial" className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300">
                Guía de Configuración
              </Link>
            </div>
          </div>

          {/* Características Principales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🇨🇱</div>
              <h3 className="text-xl font-bold text-white mb-3">Fabricado en Chile</h3>
              <p className="text-gray-300">
                Diseñados y fabricados localmente en Chile con componentes de alta calidad 
                y soporte técnico en español.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">Compatible SlimeVR</h3>
              <p className="text-gray-300">
                100% compatible con el ecosistema SlimeVR Compatible. Funciona perfectamente 
                con VRChat, NeosVR y otras aplicaciones VR.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🔋</div>
              <h3 className="text-xl font-bold text-white mb-3">Batería Ultra-Duradera</h3>
              <p className="text-gray-300">
                Hasta 50 horas de uso continuo con nuestra tecnología RF optimizada. 
                Ideal para sesiones largas de VRChat.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-white mb-3">Sin WiFi Requerido</h3>
              <p className="text-gray-300">
                Conexión RF directa que no depende de tu red WiFi. 
                Menor latencia y mayor estabilidad.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Alta Precisión</h3>
              <p className="text-gray-300">
                Sensores ICM45686 con magnetómetro QMC6309 para tracking 
                de alta precisión y reducción de drift.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-white mb-3">Envío Gratuito Chile</h3>
              <p className="text-gray-300">
                Envío gratuito a todo Chile. También enviamos a otros países 
                de Latinoamérica con tarifas preferenciales.
              </p>
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Especificaciones Técnicas
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Hardware</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Sensor:</strong> ICM45686 (6-axis) o LSM6DSR</li>
                  <li><strong>Magnetómetro:</strong> QMC6309 (opcional)</li>
                  <li><strong>Conectividad:</strong> RF 2.4GHz con receptor USB</li>
                  <li><strong>Batería:</strong> Li-Po recargable, 50+ horas</li>
                  <li><strong>Tamaño:</strong> 3.8 x 3.8 x 1.0 cm</li>
                  <li><strong>Peso:</strong> Ultra-liviano para comodidad</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">Compatibilidad</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>SlimeVR:</strong> Compatible 100%</li>
                  <li><strong>VRChat:</strong> Full body tracking</li>
                  <li><strong>NeosVR:</strong> Soporte completo</li>
                  <li><strong>Plataformas VR:</strong> PC, Quest (vía link)</li>
                  <li><strong>SO:</strong> Windows 10/11, Linux</li>
                  <li><strong>Configuración:</strong> Plug & play con SlimeVR</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Por qué elegir madTrackers Chile */}
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl p-8 border border-purple-400/30 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              ¿Por qué elegir madTrackers Chile?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Soporte Local</h4>
                    <p className="text-gray-300">Atención al cliente en español y soporte técnico especializado.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Garantía Nacional</h4>
                    <p className="text-gray-300">Garantía completa con servicio técnico en Chile.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Personalización</h4>
                    <p className="text-gray-300">10 colores disponibles y opción de logo personalizado.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Comunidad VR Chile</h4>
                    <p className="text-gray-300">Respaldado por la comunidad VRChat Chile.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Actualización Continua</h4>
                    <p className="text-gray-300">Firmware actualizable y mejoras constantes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Precio Justo</h4>
                    <p className="text-gray-300">Sin intermediarios, precio directo de fábrica.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Preguntas Frecuentes - Trackers SlimeVR Chile
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Los trackers son realmente compatibles con SlimeVR?
                </h3>
                <p className="text-gray-300">
                  Sí, nuestros trackers son 100% compatibles con SlimeVR. Utilizan el mismo protocolo 
                  y funcionan directamente con el software SlimeVR sin modificaciones.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Cuánto tiempo toma el envío dentro de Chile?
                </h3>
                <p className="text-gray-300">
                  El envío dentro de Chile es gratuito y toma entre 2-5 días hábiles según la región. 
                  Santiago y ciudades principales reciben en 1-2 días.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Funcionan con VRChat en Quest?
                </h3>
                <p className="text-gray-300">
                  Sí, funcionan perfectamente con VRChat tanto en PC como en Quest (vía Oculus Link/Air Link). 
                  El tracking se procesa en tu PC con SlimeVR.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  ¿Qué incluye el kit de trackers?
                </h3>
                <p className="text-gray-300">
                  Cada tracker incluye: dispositivo tracker, correas de sujeción, batería, 
                  cable de carga USB, receptor USB y manual de configuración en español.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Únete a la Revolución VR en Chile!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Sé parte de la comunidad VR chilena con los mejores trackers SlimeVR del país
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing" className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Personalizar y Comprar
              </Link>
              <Link href="/faq" className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300">
                Ver Más FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
