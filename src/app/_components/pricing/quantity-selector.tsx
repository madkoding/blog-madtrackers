// QuantitySelector.tsx
"use client";

import React from "react";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

type QuantitySelectorProps = {
  quantities: number[];
  selectedQuantity: number;
  setSelectedQuantity: (qty: number) => void;
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantities,
  selectedQuantity,
  setSelectedQuantity,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  // Debug log para verificar el estado del componente
  React.useEffect(() => {
    console.log('🔢 [QUANTITY SELECTOR] Component state:', {
      quantities,
      selectedQuantity,
      'setter type': typeof setSelectedQuantity
    });
  }, [quantities, selectedQuantity, setSelectedQuantity]);

  const handleQuantitySelect = (qty: number) => {
    console.log('🔢 [QUANTITY SELECTOR] Button clicked! Selecting quantity:', qty, 'current:', selectedQuantity);
    console.log('🔢 [QUANTITY SELECTOR] setSelectedQuantity function:', setSelectedQuantity);
    try {
      setSelectedQuantity(qty);
      console.log('✅ [QUANTITY SELECTOR] setSelectedQuantity called successfully');
    } catch (error) {
      console.error('❌ [QUANTITY SELECTOR] Error calling setSelectedQuantity:', error);
    }
  };

  const quantityButtons = quantities.map((qty) => {
    const description = t.quantityDescriptions?.[qty as keyof typeof t.quantityDescriptions];
    
    return (
      <button
        key={qty}
        className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center gap-3 text-left ${
          selectedQuantity === qty
            ? "border-black bg-purple-900 text-white"
            : "border-gray-300 hover:border-gray-500 bg-white text-black"
        }`}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          pointerEvents: 'auto',
          minWidth: '280px'
        }}
        onClick={() => {
          console.log('🔢 [QUANTITY SELECTOR] Raw button click for quantity:', qty);
          handleQuantitySelect(qty);
        }}
        onMouseDown={(e) => e.preventDefault()} // Evitar que el mousedown interfiera
      >
        <div className="font-bold text-2xl flex-shrink-0 w-8 text-center">{qty}</div>
        {description && (
          <div className="text-sm opacity-90 leading-tight flex-1">
            {description}
          </div>
        )}
      </button>
    );
  });

  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <h3 className="font-medium mb-2">{t.quantitySelectorLabel}</h3>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {quantityButtons}
      </div>
    </div>
  );
};

QuantitySelector.displayName = 'QuantitySelector';

export default QuantitySelector;
