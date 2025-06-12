import React, { useMemo } from "react";
import { logger } from '../../../lib/logger';

export interface CurrencyDisplayProps {
  usdAmount: number;
  paisEnvio: string;
  label: string;
  colorClass?: string;
  formatCurrencyFn?: (amount: number, country: string) => {
    local: string;
    usd: string;
  };
  getCurrencyCodeFn?: (country: string) => string;
}

/**
 * Componente para mostrar un monto con conversión USD/Local
 */
const CurrencyDisplay: React.FC<CurrencyDisplayProps> = React.memo(({
  usdAmount,
  paisEnvio,
  label,
  colorClass = "text-gray-800",
  formatCurrencyFn,
  getCurrencyCodeFn
}) => {
  const { formatted, showConversion } = useMemo(() => {
    try {
      if (!formatCurrencyFn || !getCurrencyCodeFn) {
        return { 
          formatted: { local: `$${usdAmount} USD`, usd: '' }, 
          showConversion: false 
        };
      }
      
      const formatted = formatCurrencyFn(usdAmount, paisEnvio);
      const showConversion = getCurrencyCodeFn(paisEnvio) !== 'USD';
      return { formatted, showConversion };
    } catch (error) {
      logger.error('Error in CurrencyDisplay:', error);
      return { 
        formatted: { local: `Error: $${usdAmount}`, usd: '' }, 
        showConversion: false 
      };
    }
  }, [usdAmount, paisEnvio, formatCurrencyFn, getCurrencyCodeFn]);

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-600">{label}:</span>
      <div className="text-right">
        <div className={`font-medium ${colorClass}`}>
          {formatted.local}
        </div>
        {showConversion && (
          <div className="text-xs text-gray-500">
            {formatted.usd}
          </div>
        )}
      </div>
    </div>
  );
});

CurrencyDisplay.displayName = 'CurrencyDisplay';

export { CurrencyDisplay };
