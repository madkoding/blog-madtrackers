"use client";

import React from "react";
import PaypalButton from "./paypal";
import FlowPayment from "./flow-payment";
import TermsCheckbox from "./terms-checkbox";
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
        <div className={`transition-all duration-500 ${acceptedTerms ? 'transform scale-105' : 'transform scale-100'}`}>
          {currency === "CLP" ? (
            <FlowPayment
              amount={advanceAmount}
              description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
            />
          ) : (
            <PaypalButton 
              amount={advanceAmountUsd}
              description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity}`}
            />
          )}
        </div>
        
        {/* Glass overlay with reflection effect */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-out ${
            acceptedTerms 
              ? 'opacity-0 scale-110 rotate-3' 
              : 'opacity-100 scale-100 rotate-0'
          }`}
          style={{
            background: `linear-gradient(
              135deg, 
              rgba(255, 255, 255, 0.9) 0%, 
              rgba(255, 255, 255, 0.6) 15%, 
              rgba(255, 255, 255, 0.2) 30%, 
              rgba(255, 255, 255, 0.1) 50%, 
              rgba(255, 255, 255, 0.3) 70%, 
              rgba(255, 255, 255, 0.7) 85%, 
              rgba(255, 255, 255, 0.95) 100%
            )`,
            backdropFilter: 'blur(3px) saturate(1.2)',
            borderRadius: '12px',
            boxShadow: acceptedTerms 
              ? 'none' 
              : `
                inset 0 2px 4px rgba(255, 255, 255, 0.9),
                inset 0 -2px 4px rgba(255, 255, 255, 0.5),
                0 8px 32px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.3)
              `
          }}
        />
        
        {/* Primary moving reflection */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-1200 delay-100 ease-out ${
            acceptedTerms 
              ? 'opacity-0 translate-x-full scale-110' 
              : 'opacity-75 translate-x-0 scale-100'
          }`}
          style={{
            background: `linear-gradient(
              75deg, 
              transparent 0%, 
              transparent 25%,
              rgba(255, 255, 255, 0.2) 40%, 
              rgba(255, 255, 255, 0.7) 48%, 
              rgba(255, 255, 255, 0.9) 50%, 
              rgba(255, 255, 255, 0.7) 52%, 
              rgba(255, 255, 255, 0.2) 60%, 
              transparent 75%,
              transparent 100%
            )`,
            width: '50%',
            height: '100%',
            top: '0%',
            left: acceptedTerms ? '100%' : '-50%',
            transform: `skewX(-15deg) ${acceptedTerms ? 'translateX(50%)' : 'translateX(0)'}`,
            borderRadius: '12px',
            animation: acceptedTerms ? 'none' : 'shimmer 4s ease-in-out infinite',
          }}
        />

        {/* Secondary diagonal reflection */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-800 delay-300 ease-out ${
            acceptedTerms 
              ? 'opacity-0 translate-x-full rotate-12' 
              : 'opacity-70 translate-x-0 rotate-0'
          }`}
          style={{
            background: `linear-gradient(
              135deg, 
              transparent 0%, 
              transparent 20%,
              rgba(255, 255, 255, 0.3) 35%, 
              rgba(255, 255, 255, 0.8) 50%, 
              rgba(255, 255, 255, 0.3) 65%, 
              transparent 80%,
              transparent 100%
            )`,
            width: '80%',
            height: '100%',
            top: '0%',
            right: acceptedTerms ? '-80%' : '20%',
            transform: `skewX(-20deg) ${acceptedTerms ? 'translateX(100%)' : 'translateX(0)'}`,
            borderRadius: '12px',
          }}
        />

        {/* Disabled state overlay */}
        {!acceptedTerms && (
          <div 
            className="absolute inset-0 bg-gray-300 bg-opacity-40 backdrop-blur-sm rounded-lg pointer-events-auto cursor-not-allowed flex items-center justify-center"
          >
            <div className="bg-white bg-opacity-95 px-6 py-3 rounded-full shadow-xl border-2 border-gray-200">
              <p className="text-gray-700 text-sm font-semibold flex items-center gap-2">
                <span className="text-blue-500 text-lg">🔒</span>{" "}
                Acepta los términos para continuar con tu compra
              </p>
            </div>
          </div>
        )}
      </div>
      
      <TermsCheckbox 
        acceptedTerms={acceptedTerms}
        onTermsChange={onTermsChange}
      />
    </div>
  );
};

export default PaymentSection;
