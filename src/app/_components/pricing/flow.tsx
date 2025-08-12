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
  /** Si el botón está deshabilitado */
  readonly disabled?: boolean;
  /** Datos adicionales del usuario (opcional) */
  readonly userData?: {
    direccion?: string;
    ciudad?: string;
    estado?: string;
    pais?: string;
    nombreUsuarioVrChat?: string;
  };
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
  buttonText = "💳 Pagar con Tarjetas",
  disabled = false,
  userData
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(async () => {
    if (disabled) {
      return;
    }

    if (!email) {
      setError('Por favor completa todos los datos requeridos para continuar con el pago');
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
          userData
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
  }, [amount, description, email, disabled, userData]);

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
          border-radius: 16px;
          padding: 18px 24px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          min-width: 220px;
          width: 100%;
          max-width: 300px;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.025em;
        }
        
        .flow-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #667eea 100%);
        }
        
        .flow-button:active:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        
        .flow-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
          background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%);
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
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 6px;
          letter-spacing: -0.025em;
        }
        
        .description-display {
          font-size: 15px;
          color: #64748b;
          font-weight: 500;
        }
        
        .flow-container {
          background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px;
          max-width: 420px;
          margin: 0 auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
          disabled={loading || !email || disabled}
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
