"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserTracking } from "../../../interfaces/tracking";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import PriceCalculator from "./PriceCalculator";

const AdminDashboard = React.memo(() => {
  const router = useRouter();
  
  // Hook centralizado de autenticación
  const { isAuthenticated, isLoading, handleLogout } = useAdminAuth();
  
  // Estados de datos
  const [users, setUsers] = useState<UserTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const hasLoadedRef = useRef(false);

  // Memoizar función loadUsers para evitar re-creaciones innecesarias
  const loadUsers = useCallback(async () => {
    if (loading) return; // Evitar múltiples solicitudes simultáneas

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('madtrackers_jwt')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [loading, handleLogout]);

  // Cargar usuarios cuando se autentica
  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  const handleAddUser = useCallback(async () => {
    setAddingUser(true);
    try {
      router.push('/admin/nuevo-usuario');
    } finally {
      // Pequeño delay para mostrar el loading antes de navegar
      setTimeout(() => setAddingUser(false), 500);
    }
  }, [router]);

  const handleEditUser = useCallback((userIdentifier: string) => {
    router.push(`/admin/seguimiento/${userIdentifier}`);
  }, [router]);

  // Memoizar filtrado de usuarios para evitar cálculos innecesarios
  const filteredUsers = useMemo(() => 
    users.filter(user =>
      user.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

  // Memoizar estadísticas para evitar cálculos en cada render
  const statistics = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.estadoPedido !== 'received').length,
    delivered: users.filter(u => u.estadoPedido === 'received').length
  }), [users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Panel de Administración
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
              disabled={addingUser}
              className={`px-6 py-2 rounded-lg transition-colors whitespace-nowrap text-white ${
                addingUser 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {addingUser ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cargando...
                </span>
              ) : (
                '➕ Agregar Usuario'
              )}
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
                  <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📦</span>
                <div>
                  <p className="text-sm text-gray-600">Pedidos Activos</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="text-sm text-gray-600">Entregados</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.delivered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cotizador de Precios */}
          <PriceCalculator className="mb-6" />

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tapa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faltan</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        // Calcular días restantes
                        let diasRestantes = '-';
                        if (user.fechaEntrega) {
                          const hoy = new Date();
                          const entrega = new Date(user.fechaEntrega);
                          const diff = Math.ceil((entrega.setHours(0,0,0,0) - hoy.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                          diasRestantes = diff > 0 ? String(diff) : '0';
                        }
                        // Calcular faltan
                        const total = user.totalUsd ?? (user.total ? user.total / 1000 : 0);
                        const abonado = user.abonadoUsd ?? (user.abonado ? user.abonado / 1000 : 0);
                        const faltan = Math.max(0, total - abonado).toFixed(2);
                        // Función para obtener el nombre del color
                        const getColorName = (colorKey: string): string => {
                          if (!colorKey) return '-';
                          const colorMap: Record<string, string> = {
                            black: 'Negro',
                            white: 'Blanco',
                            blue: 'Azul',
                            red: 'Rojo',
                            green: 'Verde',
                            yellow: 'Amarillo',
                            orange: 'Naranjo',
                            purple: 'Morado'
                          };
                          return colorMap.hasOwnProperty(colorKey) ? colorMap[colorKey] : colorKey;
                        };
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
                                  <div className="text-sm font-medium text-gray-900"
  style={user.abonadoUsd && user.totalUsd && user.abonadoUsd >= user.totalUsd ? { color: '#16a34a', fontWeight: 700 } : {}}>
  {user.nombreUsuario}
</div>
                                  <div className="text-xs text-gray-500">
                                    {user.numeroTrackers} tracker{user.numeroTrackers !== 1 ? 's' : ''}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {user.sensor ?? '-'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {user.paisEnvio ?? '-'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span style={{backgroundColor: user.colorCase || '#eee'}} className="inline-block w-5 h-5 rounded-full border border-gray-300"></span>
                                <span className="text-xs text-gray-700">{getColorName(user.colorCase)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span style={{backgroundColor: user.colorTapa || '#eee'}} className="inline-block w-5 h-5 rounded-full border border-gray-300"></span>
                                <span className="text-xs text-gray-700">{getColorName(user.colorTapa)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{diasRestantes}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {faltan === '0.00' ? (
                                <span className="text-green-600 font-bold">completo</span>
                              ) : (
                                <div className="text-sm text-gray-900">${faltan}</div>
                              )}
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
});

AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;
