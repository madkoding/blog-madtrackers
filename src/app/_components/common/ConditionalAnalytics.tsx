'use client';

import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';

/**
 * Componente que renderiza Vercel Analytics condicionalmente
 * Se excluye en rutas de admin para evitar tracking innecesario
 */
export default function ConditionalAnalytics() {
  const pathname = usePathname();
  
  // Excluir analytics en rutas de admin
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // No renderizar analytics en rutas de admin
  if (isAdminRoute) {
    return null;
  }
  
  return <Analytics />;
}
