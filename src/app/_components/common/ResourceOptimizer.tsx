'use client'

import { useEffect } from 'react'

/**
 * Hook para cargar CSS no crítico de forma diferida
 * Mejora el First Paint al no bloquear el renderizado inicial
 */
export function useDeferredStyles() {
  useEffect(() => {
    // Cargar estilos no críticos después del primer paint
    const loadDeferredStyles = () => {
      // Precargar fuentes adicionales si es necesario
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = 'https://fonts.gstatic.com'
      document.head.appendChild(link)
    }

    // Ejecutar después del primer frame
    requestAnimationFrame(() => {
      setTimeout(loadDeferredStyles, 0)
    })
  }, [])
}

/**
 * Componente para optimizar la carga de recursos
 * Se puede usar en layout para optimizaciones globales
 */
export default function ResourceOptimizer() {
  useDeferredStyles()
  return null
}
