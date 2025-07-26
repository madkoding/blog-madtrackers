import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

/**
 * Props para el componente PaypalButton.
 */
export interface PaypalButtonProps {
  /** Cantidad total en dólares USD */
  readonly amount: number;
  /** Descripción del producto (opcional) */
  readonly description?: string;
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
}

/**
 * Componente de un botón individual de PayPal.
 */
const PaypalSingleButton: React.FC<PaypalSingleButtonProps> = React.memo(({ 
  amount, 
  description,
  buttonText
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
    
    // Crear URL de PayPal con parámetros dinámicos
    const paypalUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalUrl.searchParams.append('cmd', '_xclick');
    paypalUrl.searchParams.append('business', paypalBusinessEmail);
    paypalUrl.searchParams.append('item_name', description);
    paypalUrl.searchParams.append('amount', amount.toFixed(2));
    paypalUrl.searchParams.append('currency_code', 'USD');
    paypalUrl.searchParams.append('custom', transactionId);
    paypalUrl.searchParams.append('return', window.location.origin + '/payment-success');
    paypalUrl.searchParams.append('cancel_return', window.location.origin + '/payment-cancel');
    paypalUrl.searchParams.append('notify_url', window.location.origin + '/api/paypal/ipn');
    
    // Abrir PayPal en nueva ventana
    window.open(paypalUrl.toString(), '_blank');
  }, [amount, description, transactionId]);

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
const PaypalButton: React.FC<PaypalButtonProps> = React.memo(({ 
  amount, 
  description = "Pago de MadTrackers",
}) => {
  const { lang } = useLang();
  const t = translations[lang];
  
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
      `}</style>
      
      <div className="paypal-payment-wrapper">
        <hr />
        <br/>
        <div className="payment-title">
          {t.paymentSecure}
        </div>
        
        <div className="payment-buttons">
          <div className="payment-card">
            <div className="card-title">{t.paymentAdvance}</div>
            <div className="card-description">{t.paymentAdvanceDesc}</div>
            <div className="card-highlight">${amount.toFixed(2)} USD</div>
            <PaypalSingleButton
              amount={amount}
              description={`${description} (${t.paymentAdvance} 25%)`}
              buttonText={t.payAdvanceBtn}
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
      </div>
    </>
  );
});

PaypalButton.displayName = 'PaypalButton';

export default PaypalButton;
