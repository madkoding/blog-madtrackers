"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserTracking } from "../../../interfaces/tracking";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import PriceCalculator from "./PriceCalculator";

const DELIVERED_STATUSES = new Set(["received", "delivered"]);

const COLOR_NAMES: Record<string, string> = {
  black: "Negro",
  white: "Blanco",
  blue: "Azul",
  red: "Rojo",
  green: "Verde",
  yellow: "Amarillo",
  orange: "Naranjo",
  purple: "Morado",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "💰 Pendiente de pago",
  waiting: "⏳ En espera",
  manufacturing: "🔧 Fabricando",
  testing: "🧪 Probando",
  shipping: "📦 Enviando",
  received: "✅ Recibido",
  delivered: "✅ Entregado",
  production: "🔧 Producción",
};

const isDeliveredStatus = (estadoPedido?: string | null): boolean => {
  if (!estadoPedido) return false;
  return DELIVERED_STATUSES.has(estadoPedido.toLowerCase());
};

const getColorName = (colorKey?: string | null): string => {
  if (!colorKey) return "-";
  return COLOR_NAMES[colorKey] ?? colorKey;
};

const getStatusLabel = (estadoPedido?: string | null): string => {
  if (!estadoPedido) return "-";
  const normalized = estadoPedido.toLowerCase();
  return STATUS_LABELS[normalized] ?? estadoPedido;
};

const getUserInitial = (nombre?: string | null): string => {
  return nombre?.charAt(0).toUpperCase() ?? "?";
};

const getUserDisplayName = (user: UserTracking): string => {
  return (
    user.nombreUsuario ||
    user.contacto ||
    user.userHash ||
    (user.id ? `ID ${user.id}` : null) ||
    "este usuario"
  );
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const calculateRemainingDays = (fechaEntrega?: string | null): string => {
  if (!fechaEntrega) return "-";
  const hoy = new Date();
  const entrega = new Date(fechaEntrega);
  const diff = Math.ceil(
    (entrega.setHours(0, 0, 0, 0) - hoy.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? String(diff) : "0";
};

interface PaymentInfo {
  faltanFormatted: string;
  porcentajePago: number;
  total: number;
  abonado: number;
  isComplete: boolean;
}

const calculatePaymentInfo = (user: UserTracking): PaymentInfo => {
  const total = user.totalUsd ?? (user.total ? user.total / 1000 : 0);
  const abonado = user.abonadoUsd ?? (user.abonado ? user.abonado / 1000 : 0);
  const faltan = Math.max(0, total - abonado);
  const porcentajePago = total > 0 ? Math.min(100, (abonado / total) * 100) : 0;

  return {
    faltanFormatted: faltan.toFixed(2),
    porcentajePago,
    total,
    abonado,
    isComplete: faltan === 0,
  };
};

const calculateManufacturingProgress = (user: UserTracking): number => {
  if (!user.porcentajes) return 0;
  const {
    placa = 0,
    straps = 0,
    cases = 0,
    baterias = 0,
  } = user.porcentajes;
  const promedio = (placa + straps + cases + baterias) / 4;
  return Math.max(0, Math.min(100, promedio));
};

const getPaymentProgressColor = (percentage: number): string => {
  if (percentage >= 100) return "bg-green-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const getManufacturingProgressColor = (percentage: number): string => {
  if (percentage >= 100) return "bg-green-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 50) return "bg-yellow-500";
  if (percentage >= 25) return "bg-orange-500";
  return "bg-red-500";
};

const getUserKey = (user: UserTracking): string => {
  if (user.id !== undefined && user.id !== null) return String(user.id);
  if (user.userHash) return user.userHash;
  if (user.contacto) return user.contacto;
  if (user.nombreUsuario) return user.nombreUsuario;
  return "unknown-user";
};

interface UserTableRowProps {
  user: UserTracking;
  onEdit: (userIdentifier: string) => void;
  onDelete: (user: UserTracking) => void;
  isDeleting: boolean;
}

const UserTableRow = React.memo(({ user, onEdit, onDelete, isDeleting }: UserTableRowProps) => {
  const paymentInfo = calculatePaymentInfo(user);
  const manufacturingProgress = calculateManufacturingProgress(user);
  const paymentBarColor = getPaymentProgressColor(paymentInfo.porcentajePago);
  const manufacturingBarColor = getManufacturingProgressColor(
    manufacturingProgress
  );
  const remainingDays = calculateRemainingDays(user.fechaEntrega);
  const statusLabel = getStatusLabel(user.estadoPedido);
  const userInitial = getUserInitial(user.nombreUsuario);
  const trackersCount = user.numeroTrackers ?? 0;
  const userIdentifier = String(user.userHash ?? user.id ?? "");
  const canEdit = Boolean(userIdentifier);
  const trackingId = user.userHash ?? user.id;
  const trackingLink = trackingId ? `/seguimiento/${trackingId}` : null;
  const isFullyPaid = paymentInfo.isComplete;
  const canDelete = Boolean(user.id);
  const paymentDateDisplay = formatDateTime(
    user.paymentCompletedAt ?? user.createdAt
  );

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">{userInitial}</span>
            </div>
          </div>
          <div className="ml-4">
            <div
              className="text-sm font-medium text-gray-900"
              style={
                isFullyPaid
                  ? { color: "#16a34a", fontWeight: 700 }
                  : undefined
              }
            >
              {user.nombreUsuario ?? "Sin nombre"}
            </div>
            <div className="text-xs text-gray-500">
              {`${trackersCount} tracker${trackersCount !== 1 ? "s" : ""}`}
            </div>
            <div className="text-xs text-gray-400">{user.sensor ?? "-"}</div>
            <div className="text-xs text-gray-400">{user.paisEnvio ?? "-"}</div>
            <div className="text-xs text-gray-400">Pago: {paymentDateDisplay}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: user.colorCase || "#eee" }}
            className="inline-block w-5 h-5 rounded-full border border-gray-300"
          ></span>
          <span className="text-xs text-gray-700">{getColorName(user.colorCase)}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            style={{ backgroundColor: user.colorTapa || "#eee" }}
            className="inline-block w-5 h-5 rounded-full border border-gray-300"
          ></span>
          <span className="text-xs text-gray-700">{getColorName(user.colorTapa)}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{remainingDays}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          {paymentInfo.faltanFormatted === "0.00" ? (
            <span className="text-green-600 font-bold">completo</span>
          ) : (
            <div className="text-sm text-gray-900">
              ${paymentInfo.faltanFormatted}
            </div>
          )}
          <div className="mt-1">
            <div className="flex items-center">
              <div className="flex-1 mr-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${paymentBarColor}`}
                    style={{ width: `${paymentInfo.porcentajePago}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {paymentInfo.porcentajePago.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-xs text-gray-600 mb-1">{statusLabel}</div>
          <div className="flex items-center">
            <div className="flex-1 mr-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${manufacturingBarColor}`}
                  style={{ width: `${manufacturingProgress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-xs text-gray-600 min-w-[35px]">
              {manufacturingProgress.toFixed(0)}%
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => canEdit && onEdit(userIdentifier)}
            disabled={!canEdit || isDeleting}
            className={`bg-blue-600 text-white px-3 py-1 rounded transition-colors ${
              canEdit && !isDeleting
                ? "hover:bg-blue-700"
                : "opacity-60 cursor-not-allowed"
            }`}
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => canDelete && !isDeleting && onDelete(user)}
            disabled={!canDelete || isDeleting}
            className={`bg-red-600 text-white px-3 py-1 rounded transition-colors ${
              canDelete && !isDeleting
                ? "hover:bg-red-700"
                : "opacity-60 cursor-not-allowed"
            }`}
          >
            {isDeleting ? "Eliminando..." : "🗑️ Eliminar"}
          </button>
          <a
            href={trackingLink ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!trackingLink}
            className={`bg-gray-600 text-white px-3 py-1 rounded transition-colors ${
              trackingLink ? "hover:bg-gray-700" : "opacity-60 cursor-not-allowed"
            }`}
          >
            👁️ Ver
          </a>
        </div>
      </td>
    </tr>
  );
});

UserTableRow.displayName = "UserTableRow";

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
  const [activeTab, setActiveTab] = useState<'active' | 'received'>("active");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
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

  const handleDeleteUser = useCallback(async (user: UserTracking) => {
    const userId = user.id;
    if (!userId) {
      setError('No es posible eliminar un usuario sin identificador.');
      return;
    }

    if (typeof window !== 'undefined') {
      const displayName = getUserDisplayName(user);
      const confirmed = window.confirm(
        `¿Eliminar definitivamente a ${displayName}? Esta acción no se puede deshacer.`
      );
      if (!confirmed) {
        return;
      }
    }

    setDeletingUserId(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('madtrackers_jwt')}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Error al eliminar el usuario');
      }

      setUsers((prev) => prev.filter((item) => item.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar');
    } finally {
      setDeletingUserId(null);
    }
  }, [handleLogout]);

  const usersByStatus = useMemo(() => {
    const activeList: UserTracking[] = [];
    const deliveredList: UserTracking[] = [];

    users.forEach((user) => {
      if (isDeliveredStatus(user.estadoPedido)) {
        deliveredList.push(user);
      } else {
        activeList.push(user);
      }
    });

    return {
      active: activeList,
      delivered: deliveredList,
    };
  }, [users]);

  const { active: activeUsers, delivered: deliveredUsers } = usersByStatus;

  const filteredUsers = useMemo(() => {
    const pool = activeTab === 'active' ? activeUsers : deliveredUsers;

    if (!searchTerm) {
      return pool;
    }

    const normalizedTerm = searchTerm.toLowerCase();

    return pool.filter(
      (user) =>
        user.nombreUsuario?.toLowerCase().includes(normalizedTerm) ||
        user.contacto?.toLowerCase().includes(normalizedTerm)
    );
  }, [activeTab, activeUsers, deliveredUsers, searchTerm]);

  const statistics = {
    total: users.length,
    active: activeUsers.length,
    delivered: deliveredUsers.length,
  };

  const emptyStateMessage = useMemo(() => {
    if (searchTerm) return 'No se encontraron usuarios que coincidan con la búsqueda';
    return activeTab === 'active'
      ? 'No hay usuarios pendientes de entrega'
      : 'No hay usuarios marcados como recibidos';
  }, [searchTerm, activeTab]);

  const handleTabChange = useCallback((tab: 'active' | 'received') => {
    setActiveTab(tab);
  }, []);

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
              <div className="flex flex-wrap gap-2 bg-gray-50 border-b border-gray-200 px-4 py-2">
                <button
                  onClick={() => handleTabChange('active')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    activeTab === 'active'
                      ? 'bg-white text-blue-600 border border-b-white border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent'
                  }`}
                >
                  Pendientes ({statistics.active})
                </button>
                <button
                  onClick={() => handleTabChange('received')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                    activeTab === 'received'
                      ? 'bg-white text-blue-600 border border-b-white border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent'
                  }`}
                >
                  Entregados ({statistics.delivered})
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tapa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faltan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          {emptyStateMessage}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <UserTableRow
                          key={getUserKey(user)}
                          user={user}
                          onEdit={handleEditUser}
                          onDelete={handleDeleteUser}
                          isDeleting={Boolean(user.id && deletingUserId === user.id)}
                        />
                      ))
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
