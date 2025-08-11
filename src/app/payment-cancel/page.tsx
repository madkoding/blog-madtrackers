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

const getPaymentTitle = (status?: number, hasToken?: boolean): string => {
  if (!hasToken) return 'Procesando Pago';
  
  switch (status) {
    case 2: return 'Pago Pendiente';
    case 3: return 'Pago Rechazado';
    case 4: return 'Pago Cancelado';
    default: return 'Error en el Pago';
  }
};

const getPaymentMessage = (status?: number, hasToken?: boolean): string => {
  if (!hasToken) {
    return 'Tu pago está siendo procesado. Te notificaremos cuando se complete la transacción.';
  }
  
  switch (status) {
    case 2: return 'Tu pago está siendo procesado. Te notificaremos cuando se complete.';
    case 3: return 'El pago fue rechazado. Por favor verifica tus datos e intenta nuevamente.';
    case 4: return 'El pago fue cancelado. No se ha realizado ningún cargo.';
    default: return 'Ha ocurrido un error inesperado con tu pago.';
  }
};

const getStatusColor = (status: number): string => {
  switch (status) {
    case 2: return 'yellow'; // Pendiente
    case 3: return 'red';    // Rechazado
    case 4: return 'gray';   // Cancelado
    default: return 'red';   // Error
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
    case 2: // Pendiente
      return (
        <svg {...iconProps} className="w-8 h-8 text-yellow-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 3: // Rechazado
      return (
        <svg {...iconProps} className="w-8 h-8 text-red-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 4: // Cancelado
      return (
        <svg {...iconProps} className="w-8 h-8 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default: // Error
      return (
        <svg {...iconProps} className="w-8 h-8 text-red-600">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
  }
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-center">Verificando el estado de tu pago...</p>
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

export default function PaymentCancel() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setHasToken(true);
      checkFlowPaymentStatus(token);
    } else {
      // Si no hay token, mostrar mensaje de que se está procesando
      setHasToken(false);
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

  const status = paymentInfo?.status || 3; // Default a rechazado si no hay info
  const statusColor = getStatusColor(status);
  const title = getPaymentTitle(status, hasToken);
  const message = getPaymentMessage(status, hasToken);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className={`mx-auto w-16 h-16 bg-${statusColor}-100 rounded-full flex items-center justify-center mb-4`}>
            <StatusIcon status={status} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {paymentInfo && (
          <PaymentDetails paymentInfo={paymentInfo} />
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
          
          {status === 3 && (
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
