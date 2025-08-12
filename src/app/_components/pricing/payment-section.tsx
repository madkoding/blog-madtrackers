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
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  currency,
  totalPrice,
  totalUsd,
  selectedTrackerType,
  selectedQuantity,
  acceptedTerms,
  onTermsChange,
}) => {
  const advanceAmount = Math.round(parseFloat(totalPrice) / 4);
  const advanceAmountUsd = Math.round(totalUsd / 4 * 100) / 100;

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
