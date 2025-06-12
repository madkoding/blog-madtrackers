"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserTracking } from "../../../interfaces/tracking";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import { Button, LoadingSpinner } from "../../atoms";
import { SearchBox, Card, CardHeader, CardTitle, CardContent } from "../../molecules";

// Import existing components that will be migrated later
import { PriceCalculator } from "../PriceCalculator";

interface AdminDashboardProps {
  className?: string;
}

interface Statistics {
  total: number;
  active: number;
  delivered: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = "" }) => {
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
    if (loading) {return;} // Evitar múltiples solicitudes simultáneas

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
  const statistics = useMemo<Statistics>(() => ({
    total: users.length,
    active: users.filter(u => u.estadoPedido !== 'received').length,
    delivered: users.filter(u => u.estadoPedido === 'received').length
  }), [users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
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
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              🚪 Cerrar Sesión
            </Button>
          </div>

          {/* Barra de búsqueda y botones */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBox
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onSearch={setSearchTerm}
              />
            </div>
            <Button
              variant="default"
              onClick={handleAddUser}
              disabled={addingUser}
              className="bg-green-600 hover:bg-green-700"
            >
              {addingUser ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Cargando...
                </>
              ) : (
                '➕ Agregar Usuario'
              )}
            </Button>
            <Button
              variant="default"
              onClick={loadUsers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔄 Recargar
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="text-sm text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📦</span>
                  <div>
                    <p className="text-sm text-gray-600">Pedidos Activos</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <p className="text-sm text-gray-600">Entregados</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.delivered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cotizador de Precios */}
          <PriceCalculator className="mb-6" />

          {/* Estado de carga */}
          {loading && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Cargando usuarios...</p>
            </div>
          )}

          {/* Estado de error */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center text-red-700">
                  <span className="text-xl mr-3">⚠️</span>
                  <div>
                    <h3 className="font-semibold">Error</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de usuarios */}
          {!loading && !error && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Usuarios ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-4">📋</span>
                    <p>No hay usuarios que coincidan con la búsqueda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user, index) => (
                      <div
                        key={user.id || index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {user.nombreUsuario || 'Sin nombre'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {user.contacto || 'Sin contacto'}
                              </p>
                            </div>
                            <div className="text-sm">
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${user.estadoPedido === 'received' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                                }
                              `}>
                                {user.estadoPedido || 'waiting'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user.nombreUsuario || user.id || '')}
                        >
                          📝 Editar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
