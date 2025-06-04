"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TokenAuthModal from "../_components/auth/TokenAuthModal";
import { UserTracking } from "../../interfaces/tracking";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminIndexPage() {
  const router = useRouter();
  
  // Hook centralizado de autenticación
  const { isAuthenticated, isLoading, showAuthModal, handleAuthSuccess, handleLogout } = useAdminAuth();
  
  // Estados de datos
  const [users, setUsers] = useState<UserTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar usuarios cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? 'admin-key'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const userData = await response.json();
      setUsers(userData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userHash: string) => {
    // Navegar a la página de edición individual
    router.push(`/admin/seguimiento/${userHash}`);
  };

  const handleAddUser = () => {
    // Navegar a página para agregar usuario nuevo
    router.push('/admin/nuevo-usuario');
  };

  const filteredUsers = users.filter(user => 
    user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Interfaz principal del admin autenticado
  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  🛠️ Panel de Administración
                </h1>
                <p className="text-gray-600 mt-2">
                  Gestión de usuarios y seguimientos de MadTrackers
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🚪 Cerrar Sesión
              </button>
            </div>

            {/* Barra de búsqueda y botón agregar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-400">🔍</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleAddUser}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                ➕ Agregar Usuario
              </button>
              <button
                onClick={loadUsers}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                🔄 Recargar
              </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="text-sm text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📦</span>
                  <div>
                    <p className="text-sm text-gray-600">Pedidos Activos</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {users.filter(u => u.estadoPedido !== 'received').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <p className="text-sm text-gray-600">Entregados</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {users.filter(u => u.estadoPedido === 'received').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando usuarios...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Lista de usuarios */}
          {!loading && !error && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-gray-500">
                            <span className="text-4xl block mb-2">📭</span>
                            {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const totalProgress = Math.round(
                          (user.porcentajes.placa + user.porcentajes.straps + 
                           user.porcentajes.cases + user.porcentajes.baterias) / 4
                        );
                        // Extraer la clase de color del estado del pedido
                        let estadoPedidoClass = '';
                        switch (user.estadoPedido) {
                          case 'received':
                            estadoPedidoClass = 'bg-green-100 text-green-800';
                            break;
                          case 'manufacturing':
                            estadoPedidoClass = 'bg-blue-100 text-blue-800';
                            break;
                          case 'shipping':
                            estadoPedidoClass = 'bg-yellow-100 text-yellow-800';
                            break;
                          case 'testing':
                            estadoPedidoClass = 'bg-purple-100 text-purple-800';
                            break;
                          default:
                            estadoPedidoClass = 'bg-gray-100 text-gray-800';
                        }
                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {user.nombreUsuario.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.nombreUsuario}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {user.numeroTrackers} tracker{user.numeroTrackers !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.contacto}</div>
                              <div className="text-xs text-gray-500">{user.paisEnvio}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoPedidoClass}`}>
                                {user.estadoPedido ?? 'waiting'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${totalProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{totalProgress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ${user.totalUsd ?? (user.total ? (user.total / 1000).toFixed(2) : '0.00')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditUser(user.userHash ?? user.id ?? '')}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors mr-2"
                              >
                                ✏️ Editar
                              </button>
                              <a
                                href={`/seguimiento/${user.userHash ?? user.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                              >
                                👁️ Ver
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
