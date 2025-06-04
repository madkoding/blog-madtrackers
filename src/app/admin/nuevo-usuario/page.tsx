"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus, SensorTypes, Colors } from "../../../interfaces/tracking";
import { availableCountries } from "../../constants/countries.constants";
import { TrackingManager } from "../../../lib/trackingManager";
import TokenAuthModal from "../../_components/auth/TokenAuthModal";
import { useAdminAuth } from "../../../hooks/useAdminAuth";

export default function AddUserPage() {
  const router = useRouter();
  
  // Hook centralizado de autenticación
  const { isAuthenticated, isLoading, showAuthModal, handleAuthSuccess } = useAdminAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    contacto: '',
    fechaEntrega: '',
    totalUsd: 350,
    abonadoUsd: 0,
    envioPagado: false,
    numeroTrackers: 5,
    sensor: SensorTypes.LSM6DSR,
    magneto: false,
    colorCase: Colors.BLACK,
    colorTapa: Colors.BLACK,
    paisEnvio: 'CL'
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Si se cambia el sensor, actualizar automáticamente el magnetómetro
      if (field === 'sensor') {
        updated.magneto = (value as string).includes('+');
      }
      
      return updated;
    });
    
    // Limpiar error cuando el usuario empiece a corregir
    if (error) {
      setError(null);
    }
  };

  // Funciones de validación separadas para reducir complejidad cognitiva
  const validateUserInfo = () => {
    if (!formData.nombreUsuario.trim()) {
      return 'El nombre de usuario es obligatorio';
    }
    
    if (formData.nombreUsuario.trim().length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.contacto.trim()) {
      return 'El email es obligatorio';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contacto)) {
      return 'El email no tiene un formato válido';
    }

    return null;
  };

  const validateDates = () => {
    if (formData.fechaEntrega) {
      const fechaEntrega = new Date(formData.fechaEntrega);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
      
      if (fechaEntrega < hoy) {
        return 'La fecha de entrega no puede ser en el pasado';
      }
    }
    return null;
  };

  const validateAmounts = () => {
    if (!formData.numeroTrackers || formData.numeroTrackers < 1) {
      return 'El número de trackers debe ser al menos 1';
    }
    
    if (formData.numeroTrackers > 20) {
      return 'El número de trackers no puede ser mayor a 20';
    }

    if (!formData.totalUsd || formData.totalUsd <= 0) {
      return 'El total debe ser mayor a 0';
    }

    if (formData.abonadoUsd < 0) {
      return 'El monto abonado no puede ser negativo';
    }
    
    if (formData.abonadoUsd > formData.totalUsd) {
      return 'El monto abonado no puede ser mayor al total';
    }

    return null;
  };

  const validateSelections = () => {
    if (!formData.sensor || !Object.values(SensorTypes).includes(formData.sensor)) {
      return 'Debe seleccionar un sensor válido';
    }

    if (!formData.colorCase || !Object.values(Colors).includes(formData.colorCase)) {
      return 'Debe seleccionar un color válido para el case';
    }

    if (!formData.colorTapa || !Object.values(Colors).includes(formData.colorTapa)) {
      return 'Debe seleccionar un color válido para la tapa';
    }

    if (!formData.paisEnvio) {
      return 'Debe seleccionar un país de envío';
    }

    return null;
  };

  const validateForm = () => {
    return validateUserInfo() ?? validateDates() ?? validateAmounts() ?? validateSelections();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario completo
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Crear el objeto de tracking usando TrackingManager
      const newTracking = TrackingManager.generateUserTracking({
        ...formData,
        fechaLimite: formData.fechaEntrega,
        estadoPedido: OrderStatus.WAITING,
        porcentajes: {
          placa: 0,
          straps: 0,
          cases: 0,
          baterias: 0
        }
      });
      
      // Enviar al API
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? 'admin-key'
        },
        body: JSON.stringify(newTracking)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? 'Error al crear el usuario');
      }
      
      await response.json();
      
      // Redirigir al panel de admin
      router.push('/admin');
      
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
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
                  Acceso Requerido
                </h2>
                <p className="text-gray-600">
                  Se requiere autenticación para agregar nuevos usuarios.
                </p>
              </div>
            </div>
          </div>
        </div>

        <TokenAuthModal
          isOpen={showAuthModal}
          onClose={() => router.push('/admin')}
          onSuccess={handleAuthSuccess}
          username="Administrador"
          type="admin"
          title="Acceso Administrativo"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  ➕ Agregar Nuevo Usuario
                </h1>
                <p className="text-gray-600 mt-2">
                  Crear un nuevo usuario para seguimiento de pedido
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">⚠️</span>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Usuario *
                  </label>
                  <input
                    id="nombreUsuario"
                    type="text"
                    value={formData.nombreUsuario}
                    onChange={(e) => handleInputChange('nombreUsuario', e.target.value)}
                    placeholder="Ej: usuario123"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 ${
                      formData.nombreUsuario.trim().length > 0 && formData.nombreUsuario.trim().length < 3
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formData.nombreUsuario.trim().length > 0 && formData.nombreUsuario.trim().length < 3 && (
                    <p className="text-xs text-red-600 mt-1">Mínimo 3 caracteres</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="contacto"
                    type="email"
                    value={formData.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
                    placeholder="usuario@email.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 ${
                      formData.contacto.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto)
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formData.contacto.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto) && (
                    <p className="text-xs text-red-600 mt-1">Formato de email inválido</p>
                  )}
                </div>
              </div>

              {/* Fecha y País */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Entrega
                  </label>
                  <input
                    id="fechaEntrega"
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 ${
                      formData.fechaEntrega && new Date(formData.fechaEntrega) < new Date()
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formData.fechaEntrega && new Date(formData.fechaEntrega) < new Date() && (
                    <p className="text-xs text-red-600 mt-1">La fecha no puede ser en el pasado</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="paisEnvio" className="block text-sm font-medium text-gray-700 mb-2">
                    País de Envío
                  </label>
                  <select
                    id="paisEnvio"
                    value={formData.paisEnvio}
                    onChange={(e) => handleInputChange('paisEnvio', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    {availableCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Información del Pedido */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="numeroTrackers" className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Trackers *
                  </label>
                  <input
                    id="numeroTrackers"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numeroTrackers}
                    onChange={(e) => handleInputChange('numeroTrackers', parseInt(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 ${
                      formData.numeroTrackers < 1 || formData.numeroTrackers > 20
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {(formData.numeroTrackers < 1 || formData.numeroTrackers > 20) && (
                    <p className="text-xs text-red-600 mt-1">Debe ser entre 1 y 20</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="totalUsd" className="block text-sm font-medium text-gray-700 mb-2">
                    Total (USD) *
                  </label>
                  <input
                    id="totalUsd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalUsd}
                    onChange={(e) => handleInputChange('totalUsd', parseFloat(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 ${
                      formData.totalUsd <= 0
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formData.totalUsd <= 0 && (
                    <p className="text-xs text-red-600 mt-1">Debe ser mayor a 0</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="abonadoUsd" className="block text-sm font-medium text-gray-700 mb-2">
                    Abonado (USD)
                  </label>
                  <input
                    id="abonadoUsd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.abonadoUsd}
                    onChange={(e) => handleInputChange('abonadoUsd', parseFloat(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 ${
                      formData.abonadoUsd < 0 || formData.abonadoUsd > formData.totalUsd
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                  {formData.abonadoUsd < 0 && (
                    <p className="text-xs text-red-600 mt-1">No puede ser negativo</p>
                  )}
                  {formData.abonadoUsd > formData.totalUsd && (
                    <p className="text-xs text-red-600 mt-1">No puede ser mayor al total</p>
                  )}
                  {formData.abonadoUsd >= 0 && formData.abonadoUsd <= formData.totalUsd && formData.totalUsd > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Pendiente: ${(formData.totalUsd - formData.abonadoUsd).toFixed(2)} USD
                    </p>
                  )}
                </div>
              </div>

              {/* Configuración Técnica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sensor" className="block text-sm font-medium text-gray-700 mb-2">
                    Sensor
                  </label>
                  <select
                    id="sensor"
                    value={formData.sensor}
                    onChange={(e) => handleInputChange('sensor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    {Object.values(SensorTypes).map((sensor) => (
                      <option key={sensor} value={sensor}>
                        {sensor}
                      </option>
                    ))}
                  </select>
                  {formData.sensor.includes('+') && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <span className="mr-1">✅</span>{' '}
                      Incluye magnetómetro
                    </p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.envioPagado}
                      onChange={(e) => handleInputChange('envioPagado', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 accent-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Envío Pagado</span>
                  </label>
                </div>
              </div>

              {/* Colores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="colorCase" className="block text-sm font-medium text-gray-700 mb-2">
                    Color del Case
                  </label>
                  <select
                    id="colorCase"
                    value={formData.colorCase}
                    onChange={(e) => handleInputChange('colorCase', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    {Object.values(Colors).map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="colorTapa" className="block text-sm font-medium text-gray-700 mb-2">
                    Color de la Tapa
                  </label>
                  <select
                    id="colorTapa"
                    value={formData.colorTapa}
                    onChange={(e) => handleInputChange('colorTapa', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    {Object.values(Colors).map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !!validateForm()}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    saving || !!validateForm()
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Creando...
                    </>
                  ) : (
                    '✅ Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
