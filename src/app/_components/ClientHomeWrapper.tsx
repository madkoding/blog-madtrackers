"use client";

import React from 'react';
import { HeroPost } from "@/app/_components/common/hero-post";
import { getAllPosts } from "@/lib/api";
import WaveDivider from "../_components/common/wave-divider";
import DeferredComponent from "../_components/common/DeferredLoading";
import dynamic from "next/dynamic";
import ComparativeTable from "../_components/common/ComparativeTable";

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
  const heroPost = allPosts[0];
  
  // Determinar qué componente mostrar basado en la variable de entorno
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <ClientErrorBoundary>
      <main>
        {/* Contenido crítico above-the-fold */}
        <HeroPost title={heroPost.title} subtitle={heroPost.subtitle} isMaintenanceMode={isMaintenanceMode} />
        
        {/* Contenido no crítico con carga diferida más optimizada */}
        <WaveDivider />
        <ComparativeTable />
        <div id="pricing" ></div>
        <DeferredComponent
          className="bg-white"
          fallback={
            <div className="loading-skeleton h-96 mx-auto max-w-6xl rounded-lg mb-12 bg-gray-200 animate-pulse"></div>
          }
          threshold={0.1}
        >
          {isMaintenanceMode ? <MaintenanceComponent /> : <Pricing />}
        </DeferredComponent>
      </main>
    </ClientErrorBoundary>
  );
}
