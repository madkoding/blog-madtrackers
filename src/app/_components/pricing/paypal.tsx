import React, { useCallback, useMemo } from "react";
import Image from "next/image";

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
 * Componente de botón de PayPal con cantidad dinámica.
 *
 * Renderiza el formulario de PayPal con la cantidad especificada.
 *
 * @param props - Props del componente
 * @returns {JSX.Element} El formulario de PayPal.
 */
const PaypalButton: React.FC<PaypalButtonProps> = React.memo(({ 
  amount, 
  description = "Pago de MadTrackers",
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

  const buttonLabel = useMemo(() => 
    `Anticipo de $${amount.toFixed(2)} USD`,
    [amount]
  );
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
    </>
  );
});

PaypalButton.displayName = 'PaypalButton';

export default PaypalButton;
