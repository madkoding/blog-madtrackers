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
    </div>
  );
};

export default PaymentSection;
