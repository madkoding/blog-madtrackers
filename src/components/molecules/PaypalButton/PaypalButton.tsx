import React, { useCallback, useMemo } from "react";
import Image from "next/image";

export interface PaypalButtonProps {
  /** Cantidad total en dólares USD */
  readonly amount: number;
  /** Descripción del producto (opcional) */
  readonly description?: string;
  /** Email de PayPal para recibir pagos */
  readonly paypalBusinessEmail?: string;
  /** URLs de retorno personalizables */
  readonly returnUrls?: {
    success?: string;
    cancel?: string;
    notify?: string;
  };
  className?: string;
}

/**
 * Componente de botón de PayPal con cantidad dinámica.
 */
const PaypalButton: React.FC<PaypalButtonProps> = React.memo(({ 
  amount, 
  description = "Pago de MadTrackers",
  paypalBusinessEmail,
  returnUrls = {},
  className = ""
}) => {
  // Generar un ID único para la transacción
  const transactionId = useMemo(() => 
    `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    []
  );
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Usar email proporcionado o valor por defecto
    const businessEmail = paypalBusinessEmail || process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || 'tu-email@paypal.com';
    
    // Verificar si el email está configurado correctamente
    if (businessEmail === 'tu-email@paypal.com') {
      alert('⚠️ Configura tu email de PayPal en las variables de entorno (NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL)');
      return;
    }
    
    // URLs de retorno con valores por defecto
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const urls = {
      success: returnUrls.success || `${baseUrl}/payment-success`,
      cancel: returnUrls.cancel || `${baseUrl}/payment-cancel`,
      notify: returnUrls.notify || `${baseUrl}/api/paypal/ipn`
    };
    
    // Crear URL de PayPal con parámetros dinámicos
    const paypalUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalUrl.searchParams.append('cmd', '_xclick');
    paypalUrl.searchParams.append('business', businessEmail);
    paypalUrl.searchParams.append('item_name', description);
    paypalUrl.searchParams.append('amount', amount.toFixed(2));
    paypalUrl.searchParams.append('currency_code', 'USD');
    paypalUrl.searchParams.append('custom', transactionId);
    paypalUrl.searchParams.append('return', urls.success);
    paypalUrl.searchParams.append('cancel_return', urls.cancel);
    paypalUrl.searchParams.append('notify_url', urls.notify);
    
    // Abrir PayPal en nueva ventana
    window.open(paypalUrl.toString(), '_blank');
  }, [amount, description, transactionId, paypalBusinessEmail, returnUrls]);

  const buttonLabel = useMemo(() => 
    `Anticipo de $${amount.toFixed(2)} USD`,
    [amount]
  );

  return (
    <div className={className}>
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
        }
      `}</style>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "inline-grid",
          justifyItems: "center",
          alignContent: "start",
          gap: "0.5rem",
        }}
      >
        <input
          className="pp-6BPXHUKRZPK88"
          type="submit"
          value={buttonLabel}
        />
        <Image
          src="https://www.paypalobjects.com/images/Debit_Credit.svg"
          alt="cards"
          width={120}
          height={24}
        />
        <section>
          Con la tecnología de{" "}
          <Image
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
            alt="paypal"
            width={60}
            height={14}
            style={{ verticalAlign: "middle" }}
          />
        </section>
      </form>
    </div>
  );
});

PaypalButton.displayName = 'PaypalButton';

export { PaypalButton };
