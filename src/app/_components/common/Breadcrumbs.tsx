"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const Breadcrumbs = () => {
  const pathname = usePathname();
  
  // No mostrar breadcrumbs en la página principal
  if (pathname === '/') return null;

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', href: '/' }
    ];

    // Casos específicos para mejorar SEO
    if (pathname === '/trackers-slimevr-chile') {
      breadcrumbs.push({ label: 'Trackers SlimeVR Chile', href: '/trackers-slimevr-chile' });
    } else if (pathname === '/faq') {
      breadcrumbs.push({ label: 'Preguntas Frecuentes', href: '/faq' });
    } else if (pathname === '/seguimiento') {
      breadcrumbs.push({ label: 'Seguimiento de Pedidos', href: '/seguimiento' });
    } else if (pathname.startsWith('/posts/')) {
      const slug = pathname.replace('/posts/', '');
      breadcrumbs.push({ label: 'Blog', href: '/posts' });
      
      // Casos específicos para posts importantes para SEO
      if (slug === 'Configuracion_Inicial') {
        breadcrumbs.push({ label: 'Configuración Inicial SlimeVR', href: pathname });
      } else if (slug === 'Trackers_SlimeVR_Chile_Guia_Completa') {
        breadcrumbs.push({ label: 'Guía Trackers SlimeVR Chile', href: pathname });
      } else {
        breadcrumbs.push({ label: slug.replace(/_/g, ' '), href: pathname });
      }
    } else {
      // Generar breadcrumbs dinámicos para otras rutas
      const segments = pathname.split('/').filter(Boolean);
      segments.forEach((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = segment.replace(/-/g, ' ').replace(/_/g, ' ');
        breadcrumbs.push({ 
          label: label.charAt(0).toUpperCase() + label.slice(1), 
          href 
        });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="Navegación de migas de pan" className="py-4 bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <svg 
                  className="w-4 h-4 mx-2 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-600 font-medium">{item.label}</span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
      
      {/* Structured Data para Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": `https://www.madtrackers.com${item.href}`
            }))
          })
        }}
      />
    </nav>
  );
};

export default Breadcrumbs;
