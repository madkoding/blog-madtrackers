"use client";

import React, { Component, ReactNode } from 'react';

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    // Detectar errores de carga de chunks
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Logging para debug
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo);
    
    // Si es un error de chunk, intentar recargar
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      this.handleChunkLoadError();
    }
  }

  handleChunkLoadError = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Attempting to retry chunk loading (attempt ${this.retryCount}/${this.maxRetries})`);
      
      // Esperar un poco antes de reintentar
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 1000 * this.retryCount);
    } else {
      console.error('Max retries reached for chunk loading');
    }
  };

  handleRetry = () => {
    this.retryCount = 0;
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Error al cargar el componente</h3>
          <p className="text-sm text-gray-600 mb-4">
            Hubo un problema al cargar el modelo 3D.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
