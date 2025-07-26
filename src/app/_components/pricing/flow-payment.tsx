import React, { useState } from "react";
import EmailInput from "./email-input";
import FlowButton from "./flow";

/**
 * Props para el componente FlowPayment.
 */
export interface FlowPaymentProps {
  /** Cantidad total en pesos chilenos CLP */
  readonly amount: number;
  /** Descripción del producto */
  readonly description: string;
}

/**
 * Componente completo de pago con Flow que incluye captura de email
 */
const FlowPayment: React.FC<FlowPaymentProps> = React.memo(({ 
  amount, 
  description
}) => {
  const [email, setEmail] = useState("");

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
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
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
          gap: 12px;
          margin-top: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .payment-buttons :global(.flow-payment-container) {
          flex: 1;
          min-width: 180px;
          max-width: 280px;
        }
      `}</style>
      
      <hr />
      <br/>
      <div className="payment-title">
        Paga de forma segura con Webpay, transferencia bancaria, MACH o tarjetas de crédito y débito
      </div>
      
      <EmailInput
        onEmailChange={setEmail}
        placeholder="tu-email@ejemplo.com"
      />
      
      <div className="payment-buttons">
        <FlowButton
          amount={amount}
          description={description}
          email={email}
          buttonText="Pagar Anticipo (25%)"
        />
        
        <FlowButton
          amount={amount * 4}
          description={description}
          email={email}
          buttonText="Pagar Total (100%)"
        />
      </div>
    </div>
  );
});

FlowPayment.displayName = 'FlowPayment';

export default FlowPayment;
