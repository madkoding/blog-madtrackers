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

  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <h3 className="font-medium mb-2">{t.quantitySelectorLabel}</h3>
      <div className="flex justify-center gap-2 flex-wrap">
        {quantities.map((qty) => (
          <button
            key={qty}
            className={`px-6 py-3 rounded-lg border-2 ${
              selectedQuantity === qty
                ? "border-black bg-purple-900 text-white"
                : "border-gray-300"
            }`}
            onClick={() => setSelectedQuantity(qty)}
          >
            {qty}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuantitySelector;
