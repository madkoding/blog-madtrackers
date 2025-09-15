import React, { useCallback, useMemo, useState, memo } from "react";
import Image from "next/image";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";
import UserCheckoutForm, { UserCheckoutData } from "./user-checkout-form";

/**
 * Props para el componente PaypalButton.
 */
export interface PaypalButtonProps {
  /** Cantidad total en dólares USD */
  readonly amount: number;
  /** Descripción del producto (opcional) */
  readonly description?: string;
  /** Estado de aceptación de términos */
  readonly acceptedTerms?: boolean;
  /** Callback para cambio de términos */
  readonly onTermsChange?: (accepted: boolean) => void;
  /** Información del producto seleccionado */
  readonly productData?: {
    sensor?: string;
    numberOfTrackers?: number;
    caseColor?: string;
    coverColor?: string;
    magnetometer?: boolean;
    totalUsd?: number;
    // Extras adicionales
    usbReceiverId?: string;
    usbReceiverCost?: number;
    strapId?: string;
    strapCost?: number;
    chargingDockId?: string;
    chargingDockCost?: number;
  };
}

/**
 * Props para un botón individual de PayPal.
 */
interface PaypalSingleButtonProps {
  /** Cantidad en dólares USD */
  readonly amount: number;
  /** Descripción del producto */
  readonly description: string;
  /** Texto del botón */
  readonly buttonText: string;
  /** Datos del usuario */
  readonly userData?: {
    email: string;
    direccion?: string;
    ciudad?: string;
    estado?: string;
    pais?: string;
    nombreUsuarioVrChat?: string;
  };
  /** Información del producto seleccionado */
  readonly productData?: {
    sensor?: string;
    numberOfTrackers?: number;
    caseColor?: string;
    coverColor?: string;
    magnetometer?: boolean;
    totalUsd?: number;
    // Extras adicionales
    usbReceiverId?: string;
    usbReceiverCost?: number;
    strapId?: string;
    strapCost?: number;
    chargingDockId?: string;
    chargingDockCost?: number;
  };
}

/**
 * Componente de un botón individual de PayPal.
 */
const PaypalSingleButton: React.FC<PaypalSingleButtonProps> = React.memo(({ 
  amount, 
  description,
  buttonText,
  userData,
  productData
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar un ID único para la transacción
  const transactionId = useMemo(() => 
    `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    []
  );
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!userData?.email || !userData?.direccion) {
      setError('Por favor completa todos los datos requeridos para continuar con el pago');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 [PAYPAL BUTTON] Creating PayPal payment with data:', {
        amount,
        description,
        userData,
        productData,
        transactionId
      });
      
      // Crear el pago en PayPal (y tracking pendiente)
      const response = await fetch('/api/paypal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          email: userData.email,
          userData,
          productData,
          transactionId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago PayPal');
      }

      if (data.success && data.paymentUrl) {
        console.log('✅ [PAYPAL BUTTON] Payment created, redirecting to:', data.paymentUrl);
        console.log('📦 [PAYPAL BUTTON] Tracking ID:', data.trackingId);
        
        // Redirigir al usuario a PayPal
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: unknown) {
      console.error('❌ [PAYPAL BUTTON] Error creating payment:', error);
      setError(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  }, [amount, description, userData, productData, transactionId]);

  return (
    <>
      <style jsx>{`
        .pp-6BPXHUKRZPK88 {
          text-align: center;
          border: none;
          border-radius: 1.5rem;
          min-width: 11.625rem;
          padding: 0 2rem;
          height: 3.125rem;
          font-weight: bold;
          background-color: #ffd140;
          color: #000000;
          font-family: "Helvetica Neue", Arial, sans-serif;
          font-size: 1.125rem;
          line-height: 1.5rem;
          cursor: pointer;
          width: 100%;
        }
        
        .pp-6BPXHUKRZPK88:hover {
          background-color: #ffcd00;
        }

        .pp-6BPXHUKRZPK88:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "inline-grid",
          justifyItems: "center",
          alignContent: "start",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <input
          className="pp-6BPXHUKRZPK88"
          type="submit"
          value={loading ? 'Procesando...' : buttonText}
          disabled={loading}
        />
      </form>
    </>
  );
});

PaypalSingleButton.displayName = 'PaypalSingleButton';
/**
 * Componente principal de PayPal con opción de pago completo.
 *
 * Renderiza un formulario de PayPal para pago total (100%).
 */
const PaypalButton: React.FC<PaypalButtonProps> = memo(({ 
  amount, 
  description = "Pago de MadTrackers",
  acceptedTerms,
  onTermsChange,
  productData: externalProductData
}) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [userData, setUserData] = useState<UserCheckoutData | null>(null);
  
  const { lang } = useLang();
  const t = translations[lang];

  // Debug logging para verificar el monto recibido
  React.useEffect(() => {
    console.log('💳 [PAYPAL BUTTON] Amount received:', {
      amount: amount,
      description: description,
      externalProductData: externalProductData
    });
  }, [amount, description, externalProductData]);

  const handleUserDataChange = useCallback((data: UserCheckoutData) => {
    setUserData(data);
    console.log('User data updated:', data);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsFormValid(isValid);
  }, []);

  // Usar productData externo si está disponible, sino generar basado en descripción
  const productData = useMemo(() => {
    if (externalProductData) {
      console.log('🔧 [PAYPAL] Using external product data:', externalProductData);
      return externalProductData;
    }
    
    // Fallback: crear productData basado en la descripción y cantidad (para compatibilidad)
    let trackers = 6; // valor por defecto
    if (description.includes('x11')) {
      trackers = 11;
    }

    const fallbackData = {
      numberOfTrackers: trackers,
      sensor: "ICM45686 + QMC6309", // Sensor por defecto
      magnetometer: true,
      caseColor: 'white',
      coverColor: 'white'
    };
    
    console.log('⚠️ [PAYPAL] Using fallback product data:', fallbackData);
    return fallbackData;
  }, [description, externalProductData]);
  
  return (
    <>
      <style jsx>{`
        .paypal-payment-wrapper {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .payment-title {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }
        
        .payment-buttons {
          display: flex;
          flex-direction: row;
          gap: 16px;
          margin-top: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .payment-card {
          flex: 1;
          min-width: 200px;
          max-width: 280px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .payment-card:hover {
          border-color: #ffd140;
          box-shadow: 0 4px 16px rgba(255, 209, 64, 0.3);
          transform: translateY(-2px);
        }
        
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .card-description {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-bottom: 16px;
          line-height: 1.4;
        }
        
        .card-highlight {
          background: linear-gradient(135deg, #ffd140, #ffcd00);
          color: #000;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 16px;
          font-size: 15px;
        }
        
        .continue-purchase-container {
          display: flex;
          justify-content: center;
          margin: 32px 0;
        }
        
        .continue-purchase-btn {
          background: linear-gradient(135deg, #ffd140 0%, #ffcd00 100%);
          color: #000;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255, 209, 64, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .continue-purchase-btn:hover {
          background: linear-gradient(135deg, #ffcd00 0%, #ffb300 100%);
          box-shadow: 0 6px 20px rgba(255, 209, 64, 0.4);
          transform: translateY(-2px);
        }
        
        .continue-purchase-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(255, 209, 64, 0.3);
        }
        
        .cart-icon {
          font-size: 28px;
          margin-right: 12px;
          display: inline-block;
          transform: scale(1);
          transition: transform 0.2s ease;
          filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
          opacity: 0.9;
        }
        
        .continue-purchase-btn:hover .cart-icon {
          transform: scale(1.1);
          opacity: 1;
        }
        
        .payment-buttons {
          opacity: var(--buttons-opacity, 0.5);
          pointer-events: var(--buttons-pointer-events, none);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: var(--buttons-transform, translateY(8px));
          position: relative;
        }
        
        .payment-buttons.enabled {
          --buttons-opacity: 1;
          --buttons-pointer-events: auto;
          --buttons-transform: translateY(0);
        }
        
        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg, 
            rgba(255, 255, 255, 0.9) 0%, 
            rgba(255, 255, 255, 0.6) 25%, 
            rgba(255, 255, 255, 0.2) 50%, 
            rgba(255, 255, 255, 0.6) 75%, 
            rgba(255, 255, 255, 0.9) 100%
          );
          backdrop-filter: blur(8px) saturate(1.2);
          border-radius: 12px;
          opacity: var(--overlay-opacity, 1);
          pointer-events: var(--overlay-pointer-events, auto);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        
        .payment-buttons.enabled .glass-overlay {
          --overlay-opacity: 0;
          --overlay-pointer-events: none;
          transform: scale(1.1) rotate(2deg);
        }
        
        .overlay-message {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(255, 209, 64, 0.3);
          border-radius: 12px;
          padding: 16px 24px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          color: #b8860b;
          font-weight: 600;
          font-size: 14px;
          max-width: 300px;
        }
      `}</style>
      
      <div className="paypal-payment-wrapper">
        <hr />
        <br/>
        
        {!showCheckoutForm ? (
          <div className="continue-purchase-container">
            <button 
              className="continue-purchase-btn"
              onClick={() => setShowCheckoutForm(true)}
            >
              <span className="cart-icon">🛒</span>
              {' '}
              Continuar con la compra
            </button>
          </div>
        ) : (
          <>
            <div className="payment-title">
              {t.paymentSecure}
            </div>
            
            <UserCheckoutForm
              onUserDataChange={handleUserDataChange}
              onValidationChange={handleValidationChange}
              acceptedTerms={acceptedTerms}
              onTermsChange={onTermsChange}
            />
            
            <div className={`payment-buttons ${isFormValid ? 'enabled' : ''}`}>
              {/* Glass overlay que aparece cuando el formulario no está completo */}
              {!isFormValid && (
                <div className="glass-overlay">
                  <div className="overlay-message">
                    Completa todos los campos y acepta los términos para continuar
                  </div>
                </div>
              )}
              
              <div className="payment-card" style={{ maxWidth: '100%', margin: '0 auto' }}>
                <div className="card-title">{t.paymentFull}</div>
                <div className="card-description">{t.paymentFullDesc}</div>
                <div className="card-highlight">${amount.toFixed(2)} USD</div>
                <PaypalSingleButton
                  amount={amount}
                  description={`${description} (${t.paymentFull} 100%)`}
                  buttonText={t.payFullBtn}
                  userData={userData || undefined}
                  productData={productData}
                />
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <section style={{ 
                marginTop: '8px', 
                fontSize: '14px', 
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span>{t.poweredBy}</span>
                <Image
                  src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
                  alt="paypal"
                  width={60}
                  height={14}
                  style={{ verticalAlign: "middle" }}
                />
                <Image
                  src="https://www.paypalobjects.com/images/Debit_Credit.svg"
                  alt="cards"
                  width={120}
                  height={24}
                  style={{ verticalAlign: "middle" }}
                />
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
});

PaypalButton.displayName = 'PaypalButton';

export default PaypalButton;
