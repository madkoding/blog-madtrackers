// QuantitySelector.tsx
import React from "react";

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
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Cantidad:</h3>
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
