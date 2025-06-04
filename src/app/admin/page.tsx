"use client";

import dynamic from "next/dynamic";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import TokenAuthModal from "../_components/auth/TokenAuthModal";

// Lazy loading del panel de admin completo con SSR deshabilitado
const LazyAdminPage = dynamic(() => import("../_components/admin/LazyAdminPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando panel de administración...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function AdminIndexPage() {
  // Hook centralizado de autenticación
  const { isAuthenticated, isLoading, showAuthModal, handleAuthSuccess } = useAdminAuth();

  // Mostrar carga inicial de autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Verificando acceso administrativo...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar modal de autenticación si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-2xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Panel de Administración
                </h2>
                <p className="text-gray-600">
                  Acceso restringido. Se requiere autenticación por email para continuar.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">🛡️</span>
                  <div className="text-left">
                    <p className="font-medium text-blue-800">Acceso Seguro</p>
                    <p className="text-sm text-blue-600">
                      Se enviará un código de verificación al administrador para confirmar tu identidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <TokenAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            console.log('🔒 Modal cerrado sin autenticación');
          }}
          onSuccess={handleAuthSuccess}
          username="Administrador"
          type="admin"
          title="Acceso Administrativo"
        />
      </div>
    );
  }

  // Solo cuando esté autenticado, cargar el panel de admin completo
  return <LazyAdminPage />;
}
