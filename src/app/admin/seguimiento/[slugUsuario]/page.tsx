"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { translations } from "../../../i18n";
import { useLang } from "../../../lang-context";
import { UserTracking, OrderStatus } from "../../../../interfaces/tracking";
import TrackingModelViewer from "../../../_components/tracking/TrackingModelViewer";
import CurrencyDisplay from "../../../_components/tracking/CurrencyDisplay";
import {
  ProgressSlider,
  InlineEdit,
  ColorSelector,
  StatusSelector,
  SensorSelector,
  CountrySelector,
  InfoCard
} from "../../../_components/admin";
import { isValidHash } from "../../../../utils/hashUtils";

export default function AdminTrackingPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const params = useParams();
  const slugUsuario = params?.slugUsuario as string;
  
  const [tracking, setTracking] = useState<UserTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const loadTrackingData = useCallback(async (hash: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tracking?hash=${encodeURIComponent(hash)}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'madtrackers_2025_secure_api_key_dev_only'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t.trackingNotFound);
        } else if (response.status === 400) {
          throw new Error('Formato de hash inválido');
        } else {
          throw new Error(t.trackingError);
        }
      }

      const responseData = await response.json();
      const data: UserTracking = Array.isArray(responseData) ? responseData[0] : responseData;

      if (data) {
        if (!data.estadoPedido) {
          data.estadoPedido = OrderStatus.WAITING;
        }
        setTracking(data);
      } else {
        throw new Error(t.trackingNotFound);
      }
    } catch (err) {
      console.error('Error loading tracking data:', err);
      setError(err instanceof Error ? err.message : t.trackingError);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (slugUsuario) {
      console.log("Debug: slugUsuario recibido:", slugUsuario);

      if (!isValidHash(slugUsuario)) {
        console.error("Error: El slugUsuario no tiene un formato válido de hash.");
        setError("El identificador proporcionado no es válido.");
        setLoading(false);
        return;
      }

      loadTrackingData(slugUsuario);
    }
  }, [slugUsuario, loadTrackingData]);

  const saveTrackingData = async (updatedTracking: UserTracking) => {
    if (!tracking?.id) return;

    try {
      setSaving(true);
      setSaveStatus('idle');

      console.log("Debug: Datos antes de guardar:", updatedTracking);

      const response = await fetch(`/api/tracking?id=${encodeURIComponent(tracking.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'madtrackers_2025_secure_api_key_dev_only'
        },
        body: JSON.stringify(updatedTracking)
      });

      if (!response.ok) {
        throw new Error('Error al guardar los cambios');
      }

      const responseData = await response.json();
      console.log("Debug: Respuesta de la API después de guardar:", responseData);

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving tracking data:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldUpdate = (field: string, value: string | number | boolean) => {
    if (!tracking) return;
    
    const updatedTracking = { ...tracking };
    
    if (field.startsWith('porcentajes.')) {
      const progressField = field.split('.')[1];
      updatedTracking.porcentajes = {
        ...updatedTracking.porcentajes,
        [progressField]: value
      };
    } else if (field === 'paisEnvio') {
      updatedTracking.paisEnvio = value as string;
    } else {
      (updatedTracking as Record<string, unknown>)[field] = value;
    }
    
    setTracking(updatedTracking);
    saveTrackingData(updatedTracking);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const getTotalAmount = () => {
    return tracking?.totalUsd ?? (tracking?.total ? tracking.total / 1000 : 0);
  };

  const getPaidAmount = () => {
    return tracking?.abonadoUsd ?? (tracking?.abonado ? tracking.abonado / 1000 : 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {error || t.trackingNotFound}
              </h1>
              <p className="text-gray-600 text-center mb-6">
                {t.verifyUsername}
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.goBack}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header con estado de guardado */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">
                🔧 Admin - {tracking.nombreUsuario}
              </h1>
              <div className="flex items-center gap-3">
                {saving && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Guardando...</span>
                  </div>
                )}
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✅</span>
                    <span className="text-sm">Guardado</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <span>❌</span>
                    <span className="text-sm">Error al guardar</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selector de Estado del Pedido */}
            <StatusSelector 
              currentStatus={tracking.estadoPedido}
              onUpdate={handleFieldUpdate}
            />
          </div>

          {/* Información Personal */}
          <InfoCard title="📋 Información Personal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <InlineEdit 
                    value={tracking.nombreUsuario} 
                    field="nombreUsuario" 
                    onUpdate={handleFieldUpdate} 
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <InlineEdit 
                    value={tracking.contacto} 
                    field="contacto" 
                    type="email"
                    onUpdate={handleFieldUpdate} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">País:</span>
                  <CountrySelector
                    selectedCountry={tracking.paisEnvio}
                    onUpdate={handleFieldUpdate}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Entrega:</span>
                  <InlineEdit 
                    value={formatDate(tracking.fechaEntrega || new Date().toISOString())} 
                    field="fechaEntrega" 
                    type="date"
                    onUpdate={handleFieldUpdate} 
                  />
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Información de Pago */}
          <InfoCard title="💰 Información de Pago">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total (USD):</span>
                  <InlineEdit 
                    value={getTotalAmount()} 
                    field="totalUsd" 
                    type="number"
                    onUpdate={handleFieldUpdate} 
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Abonado (USD):</span>
                  <InlineEdit 
                    value={getPaidAmount()} 
                    field="abonadoUsd" 
                    type="number"
                    onUpdate={handleFieldUpdate} 
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <CurrencyDisplay 
                    usdAmount={getTotalAmount()} 
                    paisEnvio={tracking.paisEnvio} 
                    label="Total del pedido"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso de pago</span>
                    <span>{Math.round((getPaidAmount() / getTotalAmount()) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500 transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((getPaidAmount() / getTotalAmount()) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Detalles del Pedido */}
          <InfoCard title="📦 Detalles del Pedido">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Trackers:</span>
                  <InlineEdit 
                    value={tracking.numeroTrackers} 
                    field="numeroTrackers" 
                    type="number"
                    onUpdate={handleFieldUpdate} 
                  />
                </div>
                
                <div>
                  <div className="text-gray-600 mb-2">Sensor:</div>
                  <SensorSelector 
                    selectedSensor={tracking.sensor}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <div className="text-gray-600 mb-2">Color del Case:</div>
                  <ColorSelector
                    selectedColor={tracking.colorCase}
                    field="colorCase"
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <div className="text-gray-600 mb-2">Color de la Tapa:</div>
                  <ColorSelector
                    selectedColor={tracking.colorTapa}
                    field="colorTapa"
                    onUpdate={handleFieldUpdate}
                  />
                </div>

              </div>

              {/* Vista Previa del Tracker */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs aspect-square">
                  <TrackingModelViewer 
                    caseColor={tracking.colorCase} 
                    coverColor={tracking.colorTapa} 
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">Vista previa del tracker</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Los cambios de color se reflejan en tiempo real
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Progreso de Construcción */}
          <InfoCard title="🔧 Progreso de Construcción">
            <div className="space-y-6">
              <ProgressSlider 
                label="Placas (PCB)" 
                percentage={tracking.porcentajes.placa} 
                color="bg-blue-500" 
                field="porcentajes.placa"
                onUpdate={handleFieldUpdate}
              />
              <ProgressSlider 
                label="Correas (Straps)" 
                percentage={tracking.porcentajes.straps} 
                color="bg-green-500" 
                field="porcentajes.straps"
                onUpdate={handleFieldUpdate}
              />
              <ProgressSlider 
                label="Carcasas (Cases)" 
                percentage={tracking.porcentajes.cases} 
                color="bg-yellow-500" 
                field="porcentajes.cases"
                onUpdate={handleFieldUpdate}
              />
              <ProgressSlider 
                label="Baterías" 
                percentage={tracking.porcentajes.baterias} 
                color="bg-purple-500" 
                field="porcentajes.baterias"
                onUpdate={handleFieldUpdate}
              />
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {Math.round((tracking.porcentajes.placa + tracking.porcentajes.straps + 
                               tracking.porcentajes.cases + tracking.porcentajes.baterias) / 4)}%
                  </div>
                  <div className="text-sm text-gray-600">Progreso Total</div>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Mensaje de Admin */}
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔒 Interfaz de Administración
              </h3>
              <p className="text-yellow-700 text-center mb-4">
                Esta es la interfaz de administración. Todos los cambios se guardan automáticamente.
                Los usuarios solo pueden ver sus datos en modo lectura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`/seguimiento/${tracking.nombreUsuario}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  👁️ Ver como usuario
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🔄 Recargar datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
