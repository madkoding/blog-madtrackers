"use client";

import React, { useCallback, useMemo } from "react";
import { ChargingDock } from "../../types";
import { calculateDockCost, getDynamicDockLabel, getDynamicDockDescription } from "../../constants/product.constants";

type ChargingDockSelectorProps = {
  chargingDocks: ChargingDock[];
  selectedChargingDock: ChargingDock;
  setSelectedChargingDock: (dock: ChargingDock) => void;
  selectedQuantity: number;
};

const ChargingDockSelector: React.FC<ChargingDockSelectorProps> = React.memo(({
  chargingDocks,
  selectedChargingDock,
  setSelectedChargingDock,
  selectedQuantity,
}) => {
  const handleDockSelect = useCallback((dock: ChargingDock) => {
    if (dock.available || dock.id === "no_dock") {
      setSelectedChargingDock(dock);
    }
  }, [setSelectedChargingDock]);

  // Crear las dos opciones: sin dock y dock dinámico
  const dockOptions = useMemo(() => {
    const noDock = chargingDocks.find(dock => dock.id === "no_dock");
    const dynamicDock = chargingDocks.find(dock => dock.id === "dock_dynamic");
    
    if (!noDock || !dynamicDock) return [];
    
    // Crear el dock dinámico con datos actualizados
    const dynamicDockWithData = {
      ...dynamicDock,
      label: getDynamicDockLabel(selectedQuantity),
      description: getDynamicDockDescription(selectedQuantity),
      additionalCostUsd: calculateDockCost(selectedQuantity)
    };
    
    return [noDock, dynamicDockWithData];
  }, [chargingDocks, selectedQuantity]);

  const dockButtons = useMemo(() => 
    dockOptions.map((dock) => {
      let buttonClass = "flex-1 min-w-0 px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 relative ";
      
      if (selectedChargingDock.id === dock.id) {
        buttonClass += "border-black bg-orange-900 text-white";
      } else if (dock.available || dock.id === "no_dock") {
        buttonClass += "border-gray-300 hover:border-orange-300";
      } else {
        buttonClass += "border-red-300 bg-red-50 text-red-800 cursor-not-allowed opacity-60";
      }

      return (
        <button
          key={dock.id}
          className={buttonClass}
          onClick={() => handleDockSelect(dock)}
          disabled={!dock.available && dock.id !== "no_dock"}
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {dock.id === "no_dock" ? (
                // Icono de rayo simple
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7,2V13H10V22L17,10H13L17,2H7Z"/>
                </svg>
              ) : (
                // Icono de estación de carga (dock)
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 7H10V5H14M16 13V5C16 3.89 15.1 3 14 3H10C8.89 3 8 3.89 8 4V16H5V18H19V16H16V13M14 13H10V7H14V13M20 9V7H22V9H20M20 11V13H22V11H20Z"/>
                </svg>
              )}
            </div>
            <div className="font-medium">{dock.label}</div>
            <div className="text-xs opacity-75">{dock.description}</div>
            {dock.additionalCostUsd > 0 && (
              <div className="text-xs font-bold mt-1">
                +${dock.additionalCostUsd} USD
              </div>
            )}
            {!dock.available && dock.id !== "no_dock" && (
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Sin stock
              </div>
            )}
          </div>
        </button>
      );
    }), [dockOptions, selectedChargingDock, handleDockSelect]);

  return (
    <div className="mb-4 flex flex-col items-center gap-2 w-full">
      <h3 className="font-medium mb-2">Dock de carga</h3>
      <div className="flex justify-center gap-2 flex-wrap w-4/5">
        {dockButtons}
      </div>
    </div>
  );
});

ChargingDockSelector.displayName = 'ChargingDockSelector';

export default ChargingDockSelector;
