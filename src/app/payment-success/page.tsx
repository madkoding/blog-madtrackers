'use client';

import React, { useEffect, useState } from 'react';

interface PaymentInfo {
  flowOrder: number;
  commerceOrder: string;
  status: number;
  statusText: string;
  currency: string;
  amount: number;
  paymentData?: {
    media: string;
  };
}

const getPaymentTitle = (isFlow: boolean, status?: number, hasToken?: boolean): string => {
  if (!isFlow) return '¡Pago Exitoso!';
  
  if (!hasToken) return 'Procesando Pago';
  
  switch (status) {
    case 1: return '¡Pago Exitoso!';
    case 2: return 'Pago Rechazado';
    case 3: return 'Pago Pendiente';
    case 4: return 'Pago Cancelado';
    default: return 'Estado del Pago';
  }
};

const getPaymentMessage = (isFlow: boolean, status?: number, hasToken?: boolean): string => {
  if (!isFlow) {
    return 'Tu pago ha sido procesado correctamente. Recibirás un email de confirmación en breve.';
  }
  
  if (!hasToken) {
    return 'Tu pago está siendo procesado. Te notificaremos cuando se complete la transacción.';
  }
  
  switch (status) {
    case 1: return 'Tu pago ha sido procesado correctamente. Recibirás un email de confirmación en breve.';
    case 2: return 'El pago fue rechazado. Por favor intenta nuevamente o contacta con soporte.';
    case 3: return 'Tu pago está siendo procesado. Te notificaremos cuando se complete.';
    case 4: return 'El pago fue cancelado.';
    default: return 'Verificando el estado de tu pago...';
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1: return 'green';
    case 2: return 'red';
    case 3: return 'yellow';
    case 4: return 'gray';
    default: return 'yellow';
  }
};

const StatusIcon: React.FC<{ status: number }> = ({ status }) => {
  const iconProps = {
    className: `w-8 h-8`,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  };

  switch (status) {
    case 1: // Pagado
      return (
        <svg {...iconProps} className="w-8 h-8 text-green-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 2: // Rechazado
      return (
        <svg {...iconProps} className="w-8 h-8 text-red-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default: // Pendiente
      return (
        <svg {...iconProps} className="w-8 h-8 text-yellow-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Verificando el estado de tu pago...</p>
    </div>
  </div>
);

const PaymentDetails: React.FC<{ paymentInfo: PaymentInfo }> = ({ paymentInfo }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
    <h3 className="font-semibold text-gray-900 mb-2">Detalles del pago</h3>
    <div className="space-y-1 text-sm text-gray-600">
      <div>Orden: {paymentInfo.commerceOrder}</div>
      <div>Monto: ${paymentInfo.amount?.toLocaleString()} {paymentInfo.currency}</div>
      <div>Estado: {paymentInfo.statusText}</div>
      {paymentInfo.paymentData && (
        <div>Método: {paymentInfo.paymentData.media}</div>
      )}
    </div>
  </div>
);

export default function PaymentSuccess() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlow, setIsFlow] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const flowParam = urlParams.get('flow');
    const token = urlParams.get('token');
    
    console.log('URL params:', { flowParam, token, allParams: Object.fromEntries(urlParams.entries()) });
    
    if (flowParam === 'true') {
      setIsFlow(true);
      if (token) {
        setHasToken(true);
        checkFlowPaymentStatus(token);
      } else {
        // Si es Flow pero no hay token, mostrar mensaje de que se está procesando
        console.warn('Flow payment detected but no token found');
        setHasToken(false);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const checkFlowPaymentStatus = async (token: string) => {
    try {
      const response = await fetch(`/api/flow/status?token=${token}`);
      const data = await response.json();
      
      if (data.success) {
        setPaymentInfo(data.payment);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const status = paymentInfo?.status || 1;
  const statusColor = getStatusColor(status);
  const title = getPaymentTitle(isFlow, status, hasToken);
  const message = getPaymentMessage(isFlow, status, hasToken);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className={`mx-auto w-16 h-16 bg-${statusColor}-100 rounded-full flex items-center justify-center mb-4`}>
            {isFlow && paymentInfo ? (
              <StatusIcon status={status} />
            ) : (
              <StatusIcon status={1} />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {isFlow && paymentInfo && (
          <PaymentDetails paymentInfo={paymentInfo} />
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
          
          <button
            onClick={() => window.location.href = '/seguimiento'}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ver seguimiento
          </button>
        </div>
      </div>
    </div>
  );
}
