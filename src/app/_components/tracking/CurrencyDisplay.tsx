import React, { useMemo } from "react";
import { TrackingManager } from "../../../lib/trackingManager";

interface CurrencyDisplayProps {
  usdAmount: number;
  paisEnvio: string;
  label: string;
  colorClass?: string;
}

/**
 * Componente para mostrar un monto con conversión USD/Local
 */
const CurrencyDisplay: React.FC<CurrencyDisplayProps> = React.memo(({
  usdAmount,
  paisEnvio,
  label,
  colorClass = "text-gray-800"
}) => {
  const { formatted, showConversion } = useMemo(() => {
    try {
      const formatted = TrackingManager.formatCurrencyWithLocal(usdAmount, paisEnvio);
      const showConversion = TrackingManager.getCurrencyCode(paisEnvio) !== 'USD';
      return { formatted, showConversion };
    } catch (error) {
      console.error('Error in CurrencyDisplay:', error);
      return { 
        formatted: { local: `Error: $${usdAmount}`, usd: '' }, 
        showConversion: false 
      };
    }
  }, [usdAmount, paisEnvio]);

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

export default CurrencyDisplay;
