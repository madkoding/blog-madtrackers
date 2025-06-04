import { Exo_2, Faustina } from 'next/font/google'

// Optimizar fuentes principales con Next.js
export const exo2 = Exo_2({
  subsets: ['latin'],
  display: 'swap', // Evita FOIT (Flash of Invisible Text)
  variable: '--font-exo2',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  preload: true, // Precargar la fuente principal
})

export const faustina = Faustina({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-faustina',
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  preload: false, // No precargar fuente secundaria
})
