"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserTracking, OrderStatus } from "../../interfaces/tracking";
import TokenAuthModal from "../_components/auth/TokenAuthModal";
import { generateUserHash } from "../../utils/hashUtils";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminPage() {
  const router = useRouter();
  
  // Hook centralizado de autenticación
  const { isAuthenticated, isLoading, showAuthModal, handleAuthSuccess, handleLogout } = useAdminAuth();
  
  // Estados de datos
  const [users, setUsers] = useState<UserTracking[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [navigatingUser, setNavigatingUser] = useState<string | null>(null);

  // Cargar usuarios cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  // Filtrar usuarios cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.estadoPedido?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleEditUser = async (user: UserTracking) => {
    console.log('🔧 handleEditUser llamado con:', { 
      nombreUsuario: user.nombreUsuario, 
      id: user.id, 
      userHash: user.userHash 
    });
    
    // Mostrar indicador de navegación
    setNavigatingUser(user.nombreUsuario);
    
    try {
      // Si el usuario ya tiene userHash, usarlo directamente
      if (user.userHash) {
        console.log('✅ Usuario ya tiene userHash, navegando directamente:', user.userHash);
        router.push(`/admin/seguimiento/${user.userHash}`);
        return;
      }

      // Si no tiene userHash, generarlo y actualizar el registro
      const userHash = generateUserHash(user.nombreUsuario);
      console.log('🔑 Hash generado:', userHash);
      
      // Actualizar el usuario con el hash
      if (user.id) {
        console.log('📡 Actualizando usuario en Firebase con ID:', user.id);
        
        const apiKey = process.env.NEXT_PUBLIC_API_KEY ?? 'madtrackers_2025_secure_api_key_dev_only';
        const jwtToken = localStorage.getItem('madtrackers_jwt');
        console.log('🔐 Usando API Key:', apiKey);
        
        const response = await fetch(`/api/tracking/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` })
          },
          body: JSON.stringify({ userHash })
        });

        console.log('📡 Respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Hash actualizado exitosamente:', responseData);
          
          // Actualizar el estado local
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, userHash } : u
          ));
          
          // Navegar al admin del seguimiento
          console.log('🚀 Navegando a:', `/admin/seguimiento/${userHash}`);
          router.push(`/admin/seguimiento/${userHash}`);
        } else {
          const errorData = await response.text();
          console.error('❌ Error actualizando userHash:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // Como fallback, navegar con el username
          console.log('🔄 Usando fallback con username');
          router.push(`/admin/seguimiento/${encodeURIComponent(user.nombreUsuario)}`);
        }
      } else {
        console.log('⚠️ Usuario sin ID, navegando directamente con hash generado');
        router.push(`/admin/seguimiento/${userHash}`);
      }
    } catch (error) {
      console.error('💥 Error en navegación:', error);
      // Fallback a username
      console.log('🔄 Usando fallback final con username');
      router.push(`/admin/seguimiento/${encodeURIComponent(user.nombreUsuario)}`);
    } finally {
      // Ocultar indicador de navegación después de un breve retraso
      setTimeout(() => setNavigatingUser(null), 2000);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jwtToken = localStorage.getItem('madtrackers_jwt');
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? 'admin-key',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` })
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      setUsers(data.users ?? []);
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (user: UserTracking) => {
    if (!user.porcentajes) return 0;
    const total = Object.values(user.porcentajes).reduce((sum, val) => sum + (val || 0), 0);
    return Math.round(total / 4);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'manufacturing': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-orange-100 text-orange-800';
      case 'received': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Sin Estado';
    
    switch (status.toLowerCase()) {
      case 'waiting': return 'En Espera';
      case 'in_progress': return 'En Proceso';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'manufacturing': return 'Fabricando';
      case 'testing': return 'Probando';
      case 'received': return 'Recibido';
      default: return status;
    }
  };

  // Función para renderizar el contenido de la tabla
  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📭</div>
          <p className="text-gray-600">
            {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios con ese criterio'}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trackers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Límite
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id ?? user.nombreUsuario} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.nombreUsuario.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombreUsuario}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.contacto}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estadoPedido)}`}>
                    {getStatusText(user.estadoPedido)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${getProgressPercentage(user)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {getProgressPercentage(user)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.numeroTrackers || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.fechaLimite ? new Date(user.fechaLimite).toLocaleDateString() : 'No definida'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      disabled={navigatingUser === user.nombreUsuario}
                      className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                        navigatingUser === user.nombreUsuario
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      {navigatingUser === user.nombreUsuario ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
                          Navegando...
                        </>
                      ) : (
                        <>
                          ✏️ Editar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const identifier = user.userHash ?? encodeURIComponent(user.nombreUsuario);
                        window.open(`/seguimiento/${identifier}`, '_blank');
                      }}
                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded text-xs transition-colors"
                    >
                      👁️ Ver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
                  Panel Administrativo
                </h2>
                <p className="text-gray-600">
                  Se requiere autenticación para acceder al panel de administración.
                </p>
              </div>
            </div>
          </div>
        </div>

        <TokenAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            // Modal cerrado sin autenticación - el modal solo se muestra cuando no está autenticado
            console.log('🔒 Modal cerrado sin autenticación');
            setError('Se requiere autenticación para acceder al panel administrativo.');
          }}
          onSuccess={handleAuthSuccess}
          username="Administrador"
          type="admin"
          title="Acceso Administrativo"
        />
      </div>
    );
  }

  // Panel principal autenticado
  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔧 Panel Administrativo
              </h1>
              <p className="text-gray-600">
                Gestión y seguimiento de todos los pedidos de MadTrackers
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-yellow-600 text-xl">⏳</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.estadoPedido && ['waiting', 'in_progress', 'manufacturing', 'testing'].includes(u.estadoPedido)).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.estadoPedido && ['delivered', 'received'].includes(u.estadoPedido)).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enviados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.estadoPedido === OrderStatus.SHIPPING).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Herramientas */}
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 max-w-md">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Listado de clientes
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar por nombre, email o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={loadUsers}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Cargando...
                    </>
                  ) : (
                    <>
                      🔄 Actualizar
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push('/admin/nuevo-usuario')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  ➕ Nuevo Usuario
                </button>
              </div>
            </div>
          </div>

          {/* Status message */}
          {navigatingUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                <p className="text-blue-700">
                  Preparando navegación para <strong>{navigatingUser}</strong>...
                </p>
              </div>
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Usuarios ({filteredUsers.length})
              </h3>
            </div>
            {renderTableContent()}
          </div>
        </div>
      </div>
    </div>
  );
}