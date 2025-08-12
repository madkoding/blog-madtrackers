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
}) => {
  const advanceAmount = Math.round(parseFloat(totalPrice) / 4);
  const advanceAmountUsd = Math.round(totalUsd / 4 * 100) / 100;

  // Debug logging para verificar datos del producto
  React.useEffect(() => {
    console.log('💳 [PAYMENT SECTION] Product data being passed:', {
      sensor: selectedSensor?.label,
      numberOfTrackers: selectedQuantity,
      caseColor: selectedColorCase?.id,
      coverColor: selectedColorTapa?.id,
      magnetometer: selectedSensor?.label?.includes('+') || false,
      totalUsd: totalUsd,
      'selectedSensor full': selectedSensor,
      'selectedColorCase full': selectedColorCase,
      'selectedColorTapa full': selectedColorTapa
    });
  }, [selectedSensor, selectedQuantity, selectedColorCase, selectedColorTapa, totalUsd]);

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
                totalUsd: totalUsd
              }}
            />
          ) : (
            <PaypalButton 
              amount={advanceAmountUsd}
              description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
              acceptedTerms={acceptedTerms}
              onTermsChange={onTermsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
