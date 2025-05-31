"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminIndexPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    
    try {
      // Verificar si el usuario existe antes de navegar
      const response = await fetch(`/api/tracking?username=${encodeURIComponent(username.trim())}`, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? 'admin-key'
        }
      });
      
      if (response.ok) {
        router.push(`/admin/seguimiento/${encodeURIComponent(username.trim())}`);
      } else {
        alert('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error verificando usuario:', error);
      alert('Error al verificar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                🔧 Panel de Administración
              </h1>
              <p className="text-gray-600">
                Gestiona la información de seguimiento de pedidos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: usuario123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    🔍 Buscar y Editar
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ Modo Administrador
              </h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Edita toda la información de seguimiento en tiempo real</li>
                <li>• Los cambios se guardan automáticamente</li>
                <li>• Acceso a controles visuales para colores y progreso</li>
                <li>• Gestión completa del estado del pedido</li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-1">Edición Visual</h4>
                <p className="text-blue-600 text-sm">
                  Controles inline para todos los campos con selectores de color y barras de progreso editables.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-1">Vista Previa</h4>
                <p className="text-green-600 text-sm">
                  Modelo 3D actualizado en tiempo real con los colores seleccionados.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/seguimiento"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ← Volver a la página de seguimiento pública
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
