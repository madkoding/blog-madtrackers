// PricingQuantitySelector.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import { useLang } from "../../../app/lang-context";
import { translations } from "../../../app/i18n";

export interface PricingQuantitySelectorProps {
  quantities: number[];
  selectedQuantity: number;
  setSelectedQuantity: (qty: number) => void;
  className?: string;
}

const PricingQuantitySelector: React.FC<PricingQuantitySelectorProps> = React.memo(({
  quantities,
  selectedQuantity,
  setSelectedQuantity,
  className = ""
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const handleQuantitySelect = useCallback((qty: number) => {
    setSelectedQuantity(qty);
  }, [setSelectedQuantity]);

  const quantityButtons = useMemo(() => 
    quantities.map((qty) => (
      <button
        key={qty}
        className={`px-6 py-3 rounded-lg border-2 ${
          selectedQuantity === qty
            ? "border-black bg-purple-900 text-white"
            : "border-gray-300"
        }`}
        onClick={() => handleQuantitySelect(qty)}
      >
        {qty}
      </button>
    )), [quantities, selectedQuantity, handleQuantitySelect]);

  return (
    <div className={`mb-4 flex flex-col items-center gap-2 ${className}`}>
      <h3 className="font-medium mb-2">{t.quantitySelectorLabel}</h3>
      <div className="flex justify-center gap-2 flex-wrap">
        {quantityButtons}
      </div>
    </div>
  );
});

PricingQuantitySelector.displayName = 'PricingQuantitySelector';

export { PricingQuantitySelector };
