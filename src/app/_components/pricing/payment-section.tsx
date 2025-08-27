"use client";

import React from "react";
import PaypalButton from "./paypal";
import FlowPayment from "./flow-payment";
import { Currency } from "../../types";

interface PaymentSectionProps {
  currency: Currency;
  totalPrice: string;
  totalUsd: number;
  selectedTrackerType: { label: string };
  selectedQuantity: number;
  acceptedTerms: boolean;
  onTermsChange: (accepted: boolean) => void;
  // Información adicional del producto
  selectedSensor?: { id: string; label: string };
  selectedColorCase?: { id: string; label: string };
  selectedColorTapa?: { id: string; label: string };
  // Extras adicionales
  selectedUsbReceiver?: { id: string; label: string; additionalCostUsd: number };
  selectedStrap?: { id: string; label: string; additionalCostUsd: number };
  selectedChargingDock?: { id: string; label: string; additionalCostUsd: number };
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  currency,
  totalPrice,
  totalUsd,
  selectedTrackerType,
  selectedQuantity,
  acceptedTerms,
  onTermsChange,
  selectedSensor,
  selectedColorCase,
  selectedColorTapa,
  selectedUsbReceiver,
  selectedStrap,
  selectedChargingDock,
}) => {
  // Verificar si está en modo mantenimiento
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  
  const advanceAmount = Math.round(parseFloat(totalPrice) / 4);
  const advanceAmountUsd = Math.round(totalUsd / 4 * 100) / 100;

  // Debug logging para verificar datos del producto incluyendo extras
  React.useEffect(() => {
    console.log('💳 [PAYMENT SECTION] Product data being passed:', {
      sensor: selectedSensor?.label,
      numberOfTrackers: selectedQuantity,
      caseColor: selectedColorCase?.id,
      coverColor: selectedColorTapa?.id,
      magnetometer: selectedSensor?.label?.includes('+') || false,
      totalUsd: totalUsd,
      // Extras adicionales
      usbReceiver: selectedUsbReceiver?.id,
      usbReceiverCost: selectedUsbReceiver?.additionalCostUsd,
      strap: selectedStrap?.id,
      strapCost: selectedStrap?.additionalCostUsd,
      chargingDock: selectedChargingDock?.id,
      chargingDockCost: selectedChargingDock?.additionalCostUsd,
      'selectedSensor full': selectedSensor,
      'selectedColorCase full': selectedColorCase,
      'selectedColorTapa full': selectedColorTapa,
      'selectedUsbReceiver full': selectedUsbReceiver,
      'selectedStrap full': selectedStrap,
      'selectedChargingDock full': selectedChargingDock
    });
  }, [selectedSensor, selectedQuantity, selectedColorCase, selectedColorTapa, totalUsd, selectedUsbReceiver, selectedStrap, selectedChargingDock]);

  return (
    <div>
      {isMaintenanceMode ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
            <span className="ml-3 text-yellow-700 font-medium">Sistema de pagos temporalmente deshabilitado</span>
          </div>
          <p className="text-sm text-yellow-600 mb-4">
            Estamos renovando nuestro stock. Los pagos estarán disponibles nuevamente en Agosto 2025.
          </p>
          <button 
            onClick={() => {
              const phoneNumber = "56975746099"; // +56 9 7574 6099 sin espacios ni símbolos
              const message = "Hola, tengo una consulta sobre los trackers y cuándo estará disponible el stock.";
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span className="text-lg">📱</span>
            <span>Consultar por WhatsApp</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <div>
            {currency === "CLP" ? (
              <FlowPayment
                amount={advanceAmount}
                description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
                acceptedTerms={acceptedTerms}
                onTermsChange={onTermsChange}
                productData={{
                  sensor: selectedSensor?.label,
                  numberOfTrackers: selectedQuantity,
                  caseColor: selectedColorCase?.id,
                  coverColor: selectedColorTapa?.id,
                  magnetometer: selectedSensor?.label?.includes('+') || false,
                  totalUsd: totalUsd,
                  // Extras adicionales
                  usbReceiverId: selectedUsbReceiver?.id,
                  usbReceiverCost: selectedUsbReceiver?.additionalCostUsd,
                  strapId: selectedStrap?.id,
                  strapCost: selectedStrap?.additionalCostUsd,
                  chargingDockId: selectedChargingDock?.id,
                  chargingDockCost: selectedChargingDock?.additionalCostUsd
                }}
              />
            ) : (
              <PaypalButton 
                amount={advanceAmountUsd}
                description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
                acceptedTerms={acceptedTerms}
                onTermsChange={onTermsChange}
                productData={{
                  sensor: selectedSensor?.label,
                  numberOfTrackers: selectedQuantity,
                  caseColor: selectedColorCase?.id,
                  coverColor: selectedColorTapa?.id,
                  magnetometer: selectedSensor?.label?.includes('+') || false,
                  totalUsd: totalUsd,
                  // Extras adicionales  
                  usbReceiverId: selectedUsbReceiver?.id,
                  usbReceiverCost: selectedUsbReceiver?.additionalCostUsd,
                  strapId: selectedStrap?.id,
                  strapCost: selectedStrap?.additionalCostUsd,
                  chargingDockId: selectedChargingDock?.id,
                  chargingDockCost: selectedChargingDock?.additionalCostUsd
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSection;
