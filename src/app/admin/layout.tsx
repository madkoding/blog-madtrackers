import { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel - MadTrackers",
  description: "Panel de administración para gestión de pedidos",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-red-600 border-b border-red-700 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-white text-xl font-bold">🔧 Admin Panel</span>
              <div className="text-red-200 text-sm">
                MadTrackers - Panel de Administración
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="text-red-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                📋 Buscar Usuario
              </a>
              <a
                href="/seguimiento"
                className="text-red-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                👁️ Vista Pública
              </a>
              <a
                href="/"
                className="text-red-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                🏠 Inicio
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="min-h-screen">
        {children}
      </main>
      
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            ⚠️ Panel de Administración - Acceso Restringido ⚠️
          </p>
          <p className="text-xs mt-1">
            Todos los cambios se guardan automáticamente y afectan los datos en vivo
          </p>
        </div>
      </footer>
    </div>
  );
}
