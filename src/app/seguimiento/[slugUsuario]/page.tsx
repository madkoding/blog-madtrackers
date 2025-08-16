"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";
import { UserTracking, OrderStatus } from "../../../interfaces/tracking";
import { colors } from "../../constants";
import { isHashFormat } from "../../../utils/hashUtils";
import {
  TrackingModelViewer,
  CurrencyDisplay,
  OrderStatusTracker,
  ProgressBar,
  InfoCard,
  InfoRow
} from "../../_components/tracking";
import TokenAuthModal from "../../_components/auth/TokenAuthModal";
import { useUserAuth } from "../../../hooks/useUserAuth";

export default function UserTrackingPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const params = useParams();
  const slugUsuario = params?.slugUsuario as string;
  
  // Usar hook centralizado de autenticación
  const { 
    isAuthenticated, 
    isLoading: authLoading, 
    showAuthModal, 
    jwtToken, 
    handleAuthSuccess: handleAuthSuccessFromHook, 
    requestAuth 
  } = useUserAuth();
  
  const [tracking, setTracking] = useState<UserTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrackingData = useCallback(async (identifier: string, token?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // SOLO permitir acceso mediante hash - rechazar usernames directos
      const isHash = isHashFormat(identifier);
      if (!isHash) {
        throw new Error('Acceso no autorizado. Solo se permite acceso mediante URL segura.');
      }
      
      // Ahora REQUIERE autenticación JWT para acceder
      const currentToken = token || jwtToken || undefined;
      if (!currentToken) {
        throw new Error('Se requiere autenticación para ver el seguimiento');
      }
      
      // Solo usar el endpoint de hash con autenticación obligatoria
      const endpoint = `/api/public/tracking/hash/${encodeURIComponent(identifier)}`;
      
      // Preparar headers con JWT obligatorio
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      };
      
      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de acceso inválido o expirado. Solicita un nuevo código.');
        } else if (response.status === 404) {
          throw new Error(t.trackingNotFound);
        } else if (response.status === 400) {
          throw new Error('Formato de identificador inválido');
        } else {
          throw new Error(t.trackingError);
        }
      }
      
      const data: UserTracking = await response.json();
      
      // Establecer un valor por defecto para estadoPedido si no existe
      if (!data.estadoPedido) {
        data.estadoPedido = OrderStatus.WAITING;
      }
      
      setTracking(data);
      
    } catch (err) {
      console.error('Error loading tracking data:', err);
      setError(err instanceof Error ? err.message : t.trackingError);
    } finally {
      setLoading(false);
    }
  }, [t, jwtToken]);

  useEffect(() => {
    if (slugUsuario && !authLoading) {
      if (isAuthenticated && jwtToken) {
        // Cargar datos si ya está autenticado
        loadTrackingData(slugUsuario, jwtToken);
      } else {
        // Si no está autenticado, detener el loading
        setLoading(false);
      }
    }
  }, [slugUsuario, isAuthenticated, jwtToken, authLoading, loadTrackingData]);

  // Función personalizada para manejar el éxito de autenticación
  const handleAuthSuccess = (jwt: string) => {
    handleAuthSuccessFromHook(jwt);
    // Recargar datos con JWT para acceso completo
    loadTrackingData(slugUsuario, jwt);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const translationValue = t[`month_${month}` as keyof typeof t];
    let monthName: string;
    
    if (typeof translationValue === 'string') {
      monthName = translationValue;
    } else {
      monthName = date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long' });
    }
    
    return `${day} ${monthName} ${year}`;
  };

  const getTotalAmount = () => {
    return tracking?.totalUsd ?? (tracking?.total ? tracking.total / 1000 : 0);
  };

  const getPaidAmount = () => {
    return tracking?.abonadoUsd ?? (tracking?.abonado ? tracking.abonado / 1000 : 0);
  };

  const getColorName = (colorKey: string) => {
    const translationValue = t[`color_${colorKey}` as keyof typeof t];
    return typeof translationValue === 'string' ? translationValue : colorKey;
  };

  const getColorHex = (colorKey: string) => {
    const colorData = colors.find(color => color.id === colorKey);
    return colorData?.hex ?? "#FFFFFF";
  };

  const getSensorAndMagneto = () => {
    if (tracking?.sensor?.includes('+ QMC6309')) {
      const parts = tracking.sensor.split('+ QMC6309');
      return {
        sensor: parts[0].trim(),
        magneto: 'QMC6309'
      };
    }
    return {
      sensor: tracking?.sensor || '',
      magneto: tracking?.magneto || ''
    };
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos de seguimiento...</p>
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
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Acceso Seguro Requerido
                </h1>
                <p className="text-gray-600 mb-4">
                  Para proteger tu información personal, necesitas verificar tu identidad antes de acceder al seguimiento de tu pedido.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <span className="text-blue-600 mr-2">📧</span>
                    <div className="text-left">
                      <p className="font-medium text-blue-800">Verificación por Email</p>
                      <p className="text-sm text-blue-600">
                        Se enviará un código de acceso a tu email registrado para verificar tu identidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={requestAuth}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Solicitar Código de Acceso
              </button>
            </div>
          </div>
        </div>

        <TokenAuthModal
          isOpen={showAuthModal}
          onClose={() => {}} // El hook maneja el cierre automáticamente
          onSuccess={handleAuthSuccess}
          username={slugUsuario}
          type="user"
          title="Verificación de Identidad"
        />
      </div>
    );
  }

  // Mostrar error si no se pueden cargar los datos (solo si está autenticado)
  if (error && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Error al Cargar Seguimiento
                </h1>
                <p className="text-gray-600 mb-4">
                  {error}
                </p>
                <p className="text-sm text-blue-600">
                  Tu token de acceso es válido, pero hay un problema con los datos del seguimiento.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setError(null);
                  loadTrackingData(slugUsuario, jwtToken || undefined);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading cuando está autenticado pero no hay datos aún
  if (isAuthenticated && !tracking && !error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos de seguimiento...</p>
              <p className="text-sm text-gray-500 mt-2">Acceso verificado, obteniendo información...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Solo renderizar el contenido principal si hay datos de tracking
  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Datos No Disponibles
                </h1>
                <p className="text-gray-600 mb-4">
                  No se pudieron cargar los datos de seguimiento.
                </p>
              </div>
              
              <button
                onClick={() => loadTrackingData(slugUsuario, jwtToken || undefined)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar Carga
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAmountUsd = getTotalAmount();
  const paidAmountUsd = getPaidAmount();
  const pendingAmountUsd = totalAmountUsd - paidAmountUsd;
  const progressPercentage = totalAmountUsd > 0 ? (paidAmountUsd / totalAmountUsd) * 100 : 0;
  const { sensor, magneto } = getSensorAndMagneto();

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t.orderTracking}
            </h1>
            
            {/* Indicador de estado de autenticación */}
            <div className="flex justify-center items-center gap-4 mt-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <span>🔓</span>
                  <span>Acceso Verificado</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>👁️</span>
                    <span>Vista Pública</span>
                  </div>
                  <button
                    onClick={requestAuth}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔐 Obtener Acceso Verificado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estado del Pedido */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <OrderStatusTracker currentStatus={tracking.estadoPedido} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Usuario */}
            <InfoCard title={t.userInfo}>
              <InfoRow label={t.username} value={tracking.nombreUsuario} />
              <InfoRow label={t.deliveryDate} value={formatDate(tracking.fechaEntrega)} />
              <InfoRow label={t.shippingCountry} value={tracking.paisEnvio} />
            </InfoCard>

            {/* Información de Pago */}
            <InfoCard title={t.paymentInfo}>
              <CurrencyDisplay 
                usdAmount={totalAmountUsd}
                paisEnvio={tracking.paisEnvio}
                label={t.totalAmount}
                colorClass="text-gray-800"
              />
              
              <CurrencyDisplay 
                usdAmount={paidAmountUsd}
                paisEnvio={tracking.paisEnvio}
                label={t.paidAmount}
                colorClass="text-green-600"
              />
              
              <CurrencyDisplay 
                usdAmount={pendingAmountUsd}
                paisEnvio={tracking.paisEnvio}
                label={t.pendingAmount}
                colorClass="text-orange-600"
              />
              
              <InfoRow label={t.shippingPaid} value={tracking.envioPagado} />
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{t.paymentProgress}</span>
                  <span className="text-sm text-gray-600">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </InfoCard>

            {/* Detalles del Pedido */}
            <InfoCard title={t.orderDetails}>
              <div className="space-y-6">
                <InfoRow label={t.numberOfTrackers} value={tracking.numeroTrackers} />
                <InfoRow label={t.sensor} value={sensor} />
                <InfoRow label={t.magnetometer} value={magneto} />
                
                {/* Vista Previa del Tracker */}
                <div className="flex flex-col items-center pt-4 ">
                  <div className="w-full max-w-xs aspect-square">
                    <TrackingModelViewer 
                      caseColor={tracking.colorCase} 
                      coverColor={tracking.colorTapa} 
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-xs">
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: getColorHex(tracking.colorCase) }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700">Case</div>
                        <div className="text-xs text-gray-500 truncate">{getColorName(tracking.colorCase)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: getColorHex(tracking.colorTapa) }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-700">Tapa</div>
                        <div className="text-xs text-gray-500 truncate">{getColorName(tracking.colorTapa)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Progreso de Construcción */}
            <InfoCard title={t.progress}>
              <ProgressBar 
                label={t.progressPlates} 
                percentage={tracking.porcentajes?.placa ?? 0} 
                color="bg-blue-500" 
              />
              <ProgressBar 
                label={t.progressStraps} 
                percentage={tracking.porcentajes?.straps ?? 0} 
                color="bg-green-500" 
              />
              <ProgressBar 
                label={t.progressCases} 
                percentage={tracking.porcentajes?.cases ?? 0} 
                color="bg-yellow-500" 
              />
              <ProgressBar 
                label={t.progressBatteries} 
                percentage={tracking.porcentajes?.baterias ?? 0} 
                color="bg-purple-500" 
              />
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {Math.round(((tracking.porcentajes?.placa ?? 0) + (tracking.porcentajes?.straps ?? 0) + 
                               (tracking.porcentajes?.cases ?? 0) + (tracking.porcentajes?.baterias ?? 0)) / 4)}%
                  </div>
                  <div className="text-sm text-gray-600">{t.totalProgress}</div>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Información de Dirección de Envío */}
          {tracking.shippingAddress && (tracking.shippingAddress.address || tracking.shippingAddress.cityState || tracking.shippingAddress.country) && (
            <div className="mt-6">
              <InfoCard title={t.shippingAddress}>
                {tracking.shippingAddress.address && (
                  <InfoRow label={t.address} value={tracking.shippingAddress.address} />
                )}
                {tracking.shippingAddress.cityState && (
                  <InfoRow label={t.cityState} value={tracking.shippingAddress.cityState} />
                )}
                {tracking.shippingAddress.country && (
                  <InfoRow label={t.country} value={tracking.shippingAddress.country} />
                )}
              </InfoCard>
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {t.needHelp}
              </h3>
              <p className="text-blue-600 text-center mb-4">
                {t.orderQuestionHelp}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`mailto:${t.email}?subject=Consulta sobre pedido - ${tracking.nombreUsuario}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.sendEmail}
                </a>
                <a
                  href={`https://wa.me/56975746099?text=Hola, tengo una consulta sobre mi pedido (${tracking.nombreUsuario})`}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
