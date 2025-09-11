import React, { useState, memo, useCallback } from "react";
import UserCheckoutForm, { UserCheckoutData } from "./user-checkout-form";
import FlowButton from "./flow";

/**
 * Props para el componente FlowPayment.
 */
export interface FlowPaymentProps {
  /** Cantidad total en pesos chilenos CLP */
  readonly amount: number;
  /** Descripción del producto */
  readonly description: string;
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
    totalUsd?: number; // Precio real calculado en USD
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
 * Componente completo de pago con Flow que incluye captura de datos del usuario
 */
const FlowPayment = memo(({ amount, description, acceptedTerms, onTermsChange, productData }: FlowPaymentProps) => {
  const [userData, setUserData] = useState<UserCheckoutData>({
    email: '',
    direccion: '',
    ciudad: '',
    estado: '',
    pais: '',
    nombreUsuarioVrChat: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleUserDataChange = (newUserData: UserCheckoutData) => {
    setUserData(newUserData);
    console.log('Datos del usuario actualizados:', newUserData);
  };

    const handleValidationChange = useCallback((isValid: boolean) => {
    console.log('📡 FlowPayment received validation change:', {
      isValid,
      acceptedTerms,
      finalResult: isValid
    });
    setIsFormValid(isValid);
  }, [acceptedTerms]);

  return (
    <div className="flow-payment-wrapper">
      <style jsx>{`
        .flow-payment-wrapper {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .payment-title {
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .payment-subtitle {
          text-align: center;
          font-size: 16px;
          color: #64748b;
          margin-bottom: 32px;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .payment-subtitle {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 24px;
          line-height: 1.4;
        }
        
        .payment-buttons {
          display: flex;
          flex-direction: row;
          gap: 16px;
          margin-top: 32px;
          justify-content: center;
          flex-wrap: wrap;
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
        
        .payment-buttons :global(.flow-payment-container) {
          flex: 1;
          min-width: 180px;
          max-width: 280px;
        }
        
        .payment-buttons :global(.flow-payment-container) button,
        .payment-buttons :global(.flow-payment-container) input[type="submit"],
        .payment-buttons :global(.flow-payment-container) button *,
        .payment-buttons :global(.flow-payment-container) input[type="submit"] * {
          font-size: 13px !important;
          line-height: 1.4 !important;
        }
        
        .payment-buttons :global(button),
        .payment-buttons :global(input[type="submit"]) {
          font-size: 13px !important;
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
          border: 2px solid rgba(25, 118, 210, 0.3);
          border-radius: 12px;
          padding: 16px 24px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          color: #1976d2;
          font-weight: 600;
          font-size: 14px;
          max-width: 300px;
        }
        
        .continue-purchase-container {
          display: flex;
          justify-content: center;
          margin: 32px 0;
        }
        
        .continue-purchase-btn {
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .continue-purchase-btn:hover {
          background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
          transform: translateY(-2px);
        }
        
        .continue-purchase-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
        }
        
        .cart-icon {
          font-size: 28px;
          margin-right: 12px;
          display: inline-block;
          transform: scale(1);
          transition: transform 0.2s ease;
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }
        
        .continue-purchase-btn:hover .cart-icon {
          transform: scale(1.1);
          opacity: 1;
        }
      `}</style>
      
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
            💳 Completa tus datos y paga de forma segura
          </div>
          <div className="payment-subtitle">
            Aceptamos Webpay, transferencias bancarias, MACH y tarjetas de crédito/débito
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
            
            <FlowButton
              amount={amount}
              description={description}
              email={userData.email}
              buttonText="Pagar Total (100%)"
              disabled={!isFormValid}
              userData={{
                direccion: userData.direccion,
                ciudad: userData.ciudad,
                estado: userData.estado,
                pais: userData.pais,
                nombreUsuarioVrChat: userData.nombreUsuarioVrChat
              }}
              productData={productData}
            />
          </div>
        </>
      )}
    </div>
  );
});

FlowPayment.displayName = 'FlowPayment';

export default FlowPayment;
