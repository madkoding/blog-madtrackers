import React, { useState, useCallback } from "react";

/**
 * Props para el componente FlowButton.
 */
export interface FlowButtonProps {
  /** Cantidad total en pesos chilenos CLP */
  readonly amount: number;
  /** Descripción del producto (opcional) */
  readonly description?: string;
  /** Email del pagador */
  readonly email?: string;
  /** Texto personalizado para el botón */
  readonly buttonText?: string;
}

/**
 * Componente de botón de Flow para pagos en Chile.
 *
 * Renderiza un botón que redirige al usuario a Flow para realizar el pago.
 *
 * @param props - Props del componente
 * @returns {JSX.Element} El botón de Flow.
 */
const FlowButton: React.FC<FlowButtonProps> = React.memo(({ 
  amount, 
  description = "Anticipo MadTrackers",
  email = "",
  buttonText = "💳 Pagar con Tarjetas"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(async () => {
    if (!email) {
      setError('Por favor ingresa tu email para continuar con el pago');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear el pago en Flow
      const response = await fetch('/api/flow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      if (data.success && data.paymentUrl) {
        // Redirigir al usuario a Flow
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  }, [amount, description, email]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL").format(price);
  };

  return (
    <div className="flow-payment-container">
      <style jsx>{`
        .flow-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          min-width: 200px;
          width: 100%;
          max-width: 280px;
          position: relative;
          overflow: hidden;
        }
        
        .flow-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .flow-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .flow-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          color: #dc3545;
          font-size: 14px;
          margin-top: 8px;
          text-align: center;
        }
        
        .payment-info {
          text-align: center;
          margin-bottom: 16px;
        }
        
        .amount-display {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        
        .description-display {
          font-size: 14px;
          color: #666;
        }
        
        .flow-container {
          background: linear-gradient(to bottom right, #f8f9ff, #e8ecff);
          border: 1px solid #e1e7ff;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .flow-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 16px 0;
        }
        
        .powered-by {
          font-size: 12px;
          color: #666;
        }
        
        .payment-methods {
          margin-top: 12px;
          text-align: center;
        }
        
        .payment-methods-text {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
      `}</style>
      
      <div className="flow-container">
        {/* Información del pago */}
        <div className="payment-info">
          <div className="amount-display">
            ${formatPrice(amount)} CLP
          </div>
          <div className="description-display">
            {description}
          </div>
        </div>

        {/* Botón de pago */}
        <button
          className="flow-button"
          onClick={handlePayment}
          disabled={loading || !email}
          type="button"
        >
          <div className="flow-button-content">
            {loading ? (
              <>
                <div className="loading-spinner" />
                Procesando...
              </>
            ) : (
              <>
                {buttonText}
              </>
            )}
          </div>
        </button>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

FlowButton.displayName = 'FlowButton';

export default FlowButton;
