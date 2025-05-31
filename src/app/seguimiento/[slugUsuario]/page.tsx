"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";
import { UserTracking, OrderStatus } from "../../../interfaces/tracking";
import { colors } from "../../constants";
import {
  TrackingModelViewer,
  CurrencyDisplay,
  OrderStatusTracker,
  ProgressBar,
  InfoCard,
  InfoRow
} from "../../_components/tracking";

export default function UserTrackingPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const params = useParams();
  const slugUsuario = params?.slugUsuario as string;
  
  const [tracking, setTracking] = useState<UserTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrackingData = useCallback(async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/public/tracking/${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t.trackingNotFound);
        } else if (response.status === 400) {
          throw new Error('Formato de nombre de usuario inválido');
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
  }, [t]);

  useEffect(() => {
    if (slugUsuario) {
      loadTrackingData(slugUsuario);
    }
  }, [slugUsuario, loadTrackingData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthName = t[`month_${month}` as keyof typeof t] || date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'long' });
    
    return `${day} ${monthName} ${year}`;
  };

  const getTotalAmount = () => {
    return tracking?.totalUsd ?? (tracking?.total ? tracking.total / 1000 : 0);
  };

  const getPaidAmount = () => {
    return tracking?.abonadoUsd ?? (tracking?.abonado ? tracking.abonado / 1000 : 0);
  };

  const getColorName = (colorKey: string) => {
    return t[`color_${colorKey}` as keyof typeof t] || colorKey;
  };

  const getColorHex = (colorKey: string) => {
    const colorData = colors.find(color => color.id === colorKey);
    return colorData?.hex ?? "#FFFFFF";
  };

  const getSensorAndMagneto = () => {
    if (tracking?.sensor?.includes('+ MMC5983MA')) {
      const parts = tracking.sensor.split('+ MMC5983MA');
      return {
        sensor: parts[0].trim(),
        magneto: 'MMC5983MA'
      };
    }
    return {
      sensor: tracking?.sensor || '',
      magneto: tracking?.magneto || ''
    };
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
              <InfoRow label={t.contactInfo} value={tracking.contacto} />
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
                percentage={tracking.porcentajes.placa} 
                color="bg-blue-500" 
              />
              <ProgressBar 
                label={t.progressStraps} 
                percentage={tracking.porcentajes.straps} 
                color="bg-green-500" 
              />
              <ProgressBar 
                label={t.progressCases} 
                percentage={tracking.porcentajes.cases} 
                color="bg-yellow-500" 
              />
              <ProgressBar 
                label={t.progressBatteries} 
                percentage={tracking.porcentajes.baterias} 
                color="bg-purple-500" 
              />
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {Math.round((tracking.porcentajes.placa + tracking.porcentajes.straps + 
                               tracking.porcentajes.cases + tracking.porcentajes.baterias) / 4)}%
                  </div>
                  <div className="text-sm text-gray-600">{t.totalProgress}</div>
                </div>
              </div>
            </InfoCard>
          </div>

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
