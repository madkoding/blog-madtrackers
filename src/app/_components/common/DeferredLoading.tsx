'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Hook para determinar cuándo cargar recursos no críticos
 * Usa Intersection Observer y timing optimal
 */
export function useDeferredLoading(threshold = 0.1) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) {return}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Pequeño delay para asegurar que el contenido crítico ya se renderizó
          setTimeout(() => setShouldLoad(true), 100)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '50px' }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { shouldLoad, ref }
}

/**
 * Hook para cargar recursos cuando la página está idle
 */
export function useIdleLoading(delay = 2000) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Verificar si el navegador está idle
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => setShouldLoad(true))
      } else {
        setShouldLoad(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return shouldLoad
}

/**
 * Component wrapper para carga diferida basada en visibilidad
 */
interface DeferredComponentProps {
  readonly children: React.ReactNode
  readonly fallback?: React.ReactNode
  readonly threshold?: number
  readonly className?: string
}

export default function DeferredComponent({ 
  children, 
  fallback = null, 
  threshold = 0.1,
  className = ""
}: DeferredComponentProps) {
  const { shouldLoad, ref } = useDeferredLoading(threshold)

  return (
    <div ref={ref} className={className}>
      {shouldLoad ? children : fallback}
    </div>
  )
}
