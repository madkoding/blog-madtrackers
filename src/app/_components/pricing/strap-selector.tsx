"use client";

import React, { useCallback, useMemo } from "react";
import { Strap } from "../../types";

type StrapSelectorProps = {
  straps: Strap[];
  selectedStrap: Strap;
  setSelectedStrap: (strap: Strap) => void;
};

const StrapSelector: React.FC<StrapSelectorProps> = React.memo(({
  straps,
  selectedStrap,
  setSelectedStrap,
}) => {
  const handleStrapSelect = useCallback((strap: Strap) => {
    setSelectedStrap(strap);
  }, [setSelectedStrap]);

  const strapButtons = useMemo(() => 
    straps.map((strap) => (
      <button
        key={strap.id}
        className={`flex-1 min-w-0 px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 ${
          selectedStrap.id === strap.id
            ? "border-black bg-green-900 text-white"
            : "border-gray-300 hover:border-green-300"
        }`}
        onClick={() => handleStrapSelect(strap)}
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {strap.id === "velcro" ? (
              // Icono de superficie peluda/texturizada (velcro)
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C10.9 2 10 2.9 10 4S10.9 6 12 6 14 5.1 14 4 13.1 2 12 2M8 8C6.9 8 6 8.9 6 10S6.9 12 8 12 10 11.1 10 10 9.1 8 8 8M16 8C14.9 8 14 8.9 14 10S14.9 12 16 12 18 11.1 18 10 17.1 8 16 8M4 14C2.9 14 2 14.9 2 16S2.9 18 4 18 6 17.1 6 16 5.1 14 4 14M12 14C10.9 14 10 14.9 10 16S10.9 18 12 18 14 17.1 14 16 13.1 14 12 14M20 14C18.9 14 18 14.9 18 16S18.9 18 20 18 22 17.1 22 16 21.1 14 20 14M8 20C6.9 20 6 20.9 6 22S6.9 24 8 24 10 23.1 10 22 9.1 20 8 20M16 20C14.9 20 14 20.9 14 22S14.9 24 16 24 18 23.1 18 22 17.1 20 16 20"/>
              </svg>
            ) : (
              // Icono de gancho/anclaje
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,2A2,2 0 0,1 22,4V16A6,6 0 0,1 16,22H15A1,1 0 0,1 14,21A1,1 0 0,1 15,20H16A4,4 0 0,0 20,16V4H12A4,4 0 0,0 8,8V16A2,2 0 0,1 6,18A2,2 0 0,1 4,16V12A1,1 0 0,1 3,11A1,1 0 0,1 2,10A3,3 0 0,1 5,7A1,1 0 0,1 6,8A1,1 0 0,1 5,9A1,1 0 0,0 4,10A1,1 0 0,0 5,11V16A1,1 0 0,0 6,17A1,1 0 0,0 7,16V8A6,6 0 0,1 13,2H20Z"/>
              </svg>
            )}
          </div>
          <div className="font-medium">{strap.label}</div>
          <div className="text-xs opacity-75">{strap.description}</div>
          {strap.additionalCostUsd > 0 && (
            <div className="text-xs font-bold mt-1">
              +${strap.additionalCostUsd} USD
            </div>
          )}
        </div>
      </button>
    )), [straps, selectedStrap, handleStrapSelect]);

  return (
    <div className="mb-4 flex flex-col items-center gap-2 w-full">
      <h3 className="font-medium mb-2">Straps</h3>
      <div className="flex justify-center gap-2 flex-wrap w-4/5">
        {strapButtons}
      </div>
    </div>
  );
});

StrapSelector.displayName = 'StrapSelector';

export default StrapSelector;
