import React, { useCallback, useMemo, useState, memo } from "react";
import Image from "next/image";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";
import UserCheckoutForm, { UserCheckoutData } from "./user-checkout-form";

/**
 * Props para el componente PaypalButton.
 */
export interface PaypalButtonProps {
  /** Cantidad en dólares USD */
  readonly amount: number;
  /** Descripción del producto */
  readonly description: string;
  /** Configuración de términos y condiciones */
  readonly acceptedTerms?: boolean;
  readonly onTermsChange?: (accepted: boolean) => void;
}

/**
 * Datos del producto para PayPal
 */
interface PaypalProductData {
  readonly amount: number;
  readonly description: string;
  readonly paymentType: 'advance' | 'full';
  readonly numberOfTrackers?: number;
  readonly sensor?: string;
  readonly magnetometer?: boolean;
  readonly caseColor?: string;
  readonly coverColor?: string;
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
  /** Datos del usuario para el tracking */
  readonly userData?: UserCheckoutData | null;
  /** Datos del producto configurado */
  readonly productData?: PaypalProductData;
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
  // Generar un ID único para la transacción
  const transactionId = useMemo(() => 
    `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    []
  );
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtener email de PayPal desde variables de entorno o usar valor por defecto
    const paypalBusinessEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL ?? 'tu-email@paypal.com';
    
    // Verificar si el email está configurado correctamente
    if (paypalBusinessEmail === 'tu-email@paypal.com') {
      alert('⚠️ Configura tu email de PayPal en las variables de entorno (NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL)');
      return;
    }

    // Verificar que tengamos los datos del usuario
    if (!userData?.email || !userData?.direccion) {
      alert('⚠️ Por favor completa todos los campos del formulario antes de proceder con el pago');
      return;
    }
    
    // Crear objeto con datos para el tracking
    const customData = {
      transactionId,
      userData: {
        email: userData.email,
        direccion: userData.direccion,
        ciudad: userData.ciudad,
        estado: userData.estado,
        pais: userData.pais,
        nombreUsuarioVrChat: userData.nombreUsuarioVrChat
      },
      productData: productData || {},
      amount: amount,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
    
    // Crear URL de PayPal con parámetros dinámicos
    const paypalUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalUrl.searchParams.append('cmd', '_xclick');
    paypalUrl.searchParams.append('business', paypalBusinessEmail);
    paypalUrl.searchParams.append('item_name', description);
    paypalUrl.searchParams.append('amount', amount.toFixed(2));
    paypalUrl.searchParams.append('currency_code', 'USD');
    paypalUrl.searchParams.append('custom', JSON.stringify(customData));
    paypalUrl.searchParams.append('return', window.location.origin + '/payment-success');
    paypalUrl.searchParams.append('cancel_return', window.location.origin + '/payment-cancel');
    paypalUrl.searchParams.append('notify_url', window.location.origin + '/api/paypal/ipn');
    
    console.log('🚀 [PAYPAL] Redirecting to PayPal with user data:', {
      transactionId,
      amount,
      userEmail: userData.email,
      userCountry: userData.pais
    });
    
    // Abrir PayPal en nueva ventana
    window.open(paypalUrl.toString(), '_blank');
  }, [amount, description, transactionId, userData, productData]);

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
      `}</style>
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
          value={buttonText}
        />
      </form>
    </>
  );
});

PaypalSingleButton.displayName = 'PaypalSingleButton';
/**
 * Componente principal de PayPal con dos opciones de pago.
 *
 * Renderiza dos formularios de PayPal: uno para anticipo (25%) y otro para total (100%).
 */
const PaypalButton: React.FC<PaypalButtonProps> = memo(({ 
  amount, 
  description = "Pago de MadTrackers",
  acceptedTerms,
  onTermsChange
}) => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [userData, setUserData] = useState<UserCheckoutData | null>(null);
  
  const { lang } = useLang();
  const t = translations[lang];

  const handleUserDataChange = useCallback((data: UserCheckoutData) => {
    // Almacenar los datos del usuario para usarlos cuando se confirme el pago
    setUserData(data);
    console.log('PayPal user data updated:', data);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsFormValid(isValid);
  }, []);
  
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
              <span className="cart-icon">
                🛒
              </span>
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
              
              <div className="payment-card">
                <div className="card-title">{t.paymentAdvance}</div>
                <div className="card-description">{t.paymentAdvanceDesc}</div>
                <div className="card-highlight">${amount.toFixed(2)} USD</div>
                <PaypalSingleButton
                  amount={amount}
                  description={`${description} (${t.paymentAdvance} 25%)`}
                  buttonText={t.payAdvanceBtn}
                  userData={userData}
                  productData={{ amount: amount, description, paymentType: 'advance' }}
                />
              </div>
              
              <div className="payment-card">
                <div className="card-title">{t.paymentFull}</div>
                <div className="card-description">{t.paymentFullDesc}</div>
                <div className="card-highlight">${(amount * 4).toFixed(2)} USD</div>
                <PaypalSingleButton
                  amount={amount * 4}
                  description={`${description} (${t.paymentFull} 100%)`}
                  buttonText={t.payFullBtn}
                  userData={userData}
                  productData={{ amount: amount * 4, description, paymentType: 'full' }}
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
