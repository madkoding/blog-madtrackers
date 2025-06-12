"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "../../atoms";
import { cn } from "../../../utils/cn";

export interface QuantitySelectorProps {
  quantities: number[];
  selectedQuantity: number;
  onQuantityChange: (qty: number) => void;
  label?: string;
  className?: string;
  buttonVariant?: "default" | "outline";
}

export const QuantitySelector = React.memo<QuantitySelectorProps>(({
  quantities,
  selectedQuantity,
  onQuantityChange,
  label = "Cantidad",
  className,
  buttonVariant = "outline"
}) => {
  const handleQuantitySelect = useCallback((qty: number) => {
    onQuantityChange(qty);
  }, [onQuantityChange]);

  const quantityButtons = useMemo(() => 
    quantities.map((qty) => (
      <Button
        key={qty}
        variant={selectedQuantity === qty ? "default" : buttonVariant}
        size="default"
        onClick={() => handleQuantitySelect(qty)}
        className={cn(
          "min-w-[60px]",
          selectedQuantity === qty && "border-black bg-purple-900 text-white hover:bg-purple-800"
        )}
      >
        {qty}
      </Button>
    )), [quantities, selectedQuantity, handleQuantitySelect, buttonVariant]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {label && (
        <h3 className="font-medium text-gray-700 text-center">{label}</h3>
      )}
      <div className="flex justify-center gap-2 flex-wrap">
        {quantityButtons}
      </div>
    </div>
  );
});

QuantitySelector.displayName = 'QuantitySelector';

export default QuantitySelector;
