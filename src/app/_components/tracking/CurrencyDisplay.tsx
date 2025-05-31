import React from "react";
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
const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  usdAmount,
  paisEnvio,
  label,
  colorClass = "text-gray-800"
}) => {
  try {
    const formatted = TrackingManager.formatCurrencyWithLocal(usdAmount, paisEnvio);
    const showConversion = TrackingManager.getCurrencyCode(paisEnvio) !== 'USD';

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
  } catch (error) {
    console.error('Error in CurrencyDisplay:', error);
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-600">{label}:</span>
        <span className={`font-medium ${colorClass}`}>Error: ${usdAmount}</span>
      </div>
    );
  }
};

export default CurrencyDisplay;
