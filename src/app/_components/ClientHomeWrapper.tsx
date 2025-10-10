"use client";

import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { HeroPost } from "@/app/_components/common/hero-post";
import { getAllPosts } from "@/lib/api";
import dynamic from "next/dynamic";
import BrandBenefits from "../_components/common/BrandBenefits";
import TutorialVideosCarousel from "../_components/common/TutorialVideosCarousel";
import SupportedGamesCarousel from "../_components/common/SupportedGamesCarousel";
import { useLang } from "@/app/lang-context";
import ShippingCountries from './common/ShippingCountries';

// Lazy load del componente de pricing que no es crítico para First Paint
const Pricing = dynamic(() => import("../_components/pricing/pricing"), {
  ssr: false,
  loading: () => (
    <div className="loading-skeleton h-96 mx-auto max-w-6xl rounded-lg bg-gray-200 animate-pulse"></div>
  ),
});

// Lazy load del componente de mantenimiento que no es crítico para First Paint
const MaintenanceComponent = dynamic(() => import("../_components/maintenance/maintenance"), {
  ssr: false,
  loading: () => (
    <div className="loading-skeleton h-96 mx-auto max-w-6xl rounded-lg bg-gray-200 animate-pulse"></div>
  ),
});

interface LazyVisibleProps {
  children: React.ReactNode;
  estimatedHeight?: number | string;
  fallback?: React.ReactNode;
  unmountOnExit?: boolean;
}

function LazyVisible({ children, estimatedHeight = "24rem", fallback, unmountOnExit = true }: LazyVisibleProps) {
  const [hasEverBeenVisible, setHasEverBeenVisible] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = React.useState(false);
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = React.useRef(false);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    prefersReducedMotion.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEverBeenVisible(true);
          setIsVisible(true);
          if (!prefersReducedMotion.current) {
            requestAnimationFrame(() => {
              setIsAnimatingIn(true);
            });
          } else {
            setIsAnimatingIn(true);
          }
        } else {
          if (unmountOnExit && contentRef.current) {
            const height = contentRef.current.offsetHeight;
            if (height > 0) {
              setMeasuredHeight(height);
            }
          }
          setIsVisible(false);
          setIsAnimatingIn(false);
        }
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [unmountOnExit]);

  const resolvedEstimatedHeight = typeof estimatedHeight === "number" ? `${estimatedHeight}px` : estimatedHeight;
  const shouldRenderContent = isVisible || (!unmountOnExit && hasEverBeenVisible);
  
  const containerHeight = shouldRenderContent 
    ? undefined 
    : (measuredHeight ? `${measuredHeight}px` : resolvedEstimatedHeight);

  return (
    <div
      ref={containerRef}
      className="w-full bg-white"
      style={{ minHeight: containerHeight }}
    >
      {shouldRenderContent ? (
        <div
          ref={contentRef}
          className={`transition-opacity duration-500 ease-out ${
            (isAnimatingIn && isVisible) || prefersReducedMotion.current
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          {children}
        </div>
      ) : (
        fallback ?? null
      )}
    </div>
  );
}

interface ClientHomeWrapperProps {
  allPosts: ReturnType<typeof getAllPosts>;
}

class ClientErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ClientErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ClientHomeWrapper({ allPosts }: Readonly<ClientHomeWrapperProps>) {
  const { lang } = useLang();
  const heroPost = allPosts[0];
  
  // Determinar qué componente mostrar basado en la variable de entorno
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  // Obtener contenido según el idioma
  const heroContent = lang === 'es' ? heroPost.es : heroPost.en;

  return (
    <ClientErrorBoundary>
      <main>
        <SpeedInsights />
        
        <LazyVisible>
        <HeroPost 
          title={heroContent.title} 
          subtitle={heroContent.subtitle} 
          isMaintenanceMode={isMaintenanceMode} 
          />
        </LazyVisible>
       
        <LazyVisible>
          <BrandBenefits />
        </LazyVisible>
        <LazyVisible>
          <ShippingCountries />
        </LazyVisible>
        <LazyVisible>
          <TutorialVideosCarousel />
        </LazyVisible>
        <LazyVisible>
          <SupportedGamesCarousel />
        </LazyVisible>

        <div id="pricing" ></div>
        <LazyVisible unmountOnExit={false}>
          {isMaintenanceMode ? <MaintenanceComponent /> : <Pricing />}
        </LazyVisible>
      </main>
    </ClientErrorBoundary>
  );
}
