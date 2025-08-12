"use client";

import { useState, useEffect, useCallback } from "react";
import { quantities, useTranslatedConstants } from "../app/constants";
import { Sensor, TrackerType } from "../app/types";

export const useProductConfiguration = () => {
  const {
    sensors: sensorsT,
    trackers: trackersT,
    colors: colorsT,
    usbReceivers: usbReceiversT,
    straps: strapsT,
    chargingDocks: chargingDocksT,
  } = useTranslatedConstants();

  // Estados con inicialización defensiva para evitar undefined
  const [selectedSensor, setSelectedSensor] = useState<Sensor>(() => 
    sensorsT[0] || { id: "sensor4", label: "ICM45686 + QMC6309", description: "", drifting: "", available: ["rf"] }
  );
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>(() => 
    trackersT[0] || { id: "rf", label: "ESB", description: "", size: "" }
  );
  const [selectedQuantity, setSelectedQuantity] = useState<number>(quantities[0] || 6);

  // Wrapper del setter de cantidad para debug
  const setSelectedQuantityWithLog = useCallback((newQuantity: number) => {
    console.log(`🔢 [PRODUCT CONFIG] Quantity changing from ${selectedQuantity} to ${newQuantity}`);
    setSelectedQuantity(newQuantity);
  }, [selectedQuantity]);
  const [selectedColorTapa, setSelectedColorTapa] = useState(() => 
    colorsT[0] || { id: "white", label: "Blanco", color: "bg-white border-gray-400", hex: "#FFFFFF" }
  );
  const [selectedColorCase, setSelectedColorCase] = useState(() => 
    colorsT[1] || colorsT[0] || { id: "black", label: "Negro", color: "bg-black text-white", hex: "#444444" }
  );
  const [selectedUsbReceiver, setSelectedUsbReceiver] = useState(() => 
    usbReceiversT[0] || { id: "usb_3m", label: "Alcance de 3mt²", description: "" }
  );
  const [selectedStrap, setSelectedStrap] = useState(() => 
    strapsT[0] || { id: "velcro", label: "Velcro", description: "" }
  );
  const [selectedChargingDock, setSelectedChargingDock] = useState(() => 
    chargingDocksT[0] || { id: "dock_dynamic", label: "Dock Dinámico", description: "" }
  );

  // Efecto para ajustar el sensor cuando cambia el tracker
  useEffect(() => {
    if (
      !selectedSensor.available?.includes(selectedTrackerType.id) &&
      selectedTrackerType.id !== "none"
    ) {
      setSelectedSensor(sensorsT[0]);
    }
  }, [selectedTrackerType, selectedSensor.available, sensorsT]);

  // Efecto para reinicializar cuando cambian las traducciones
  useEffect(() => {
    // Función helper para validar y actualizar selección
    const updateIfNeeded = <T extends { id: string }>(
      array: T[], 
      current: T | undefined, 
      setter: (value: T) => void, 
      defaultIndex = 0,
      itemType = 'item'
    ) => {
      if (array && array.length > 0) {
        // Si current no existe o no está en el array, usar el valor por defecto
        if (!current?.id || !array.find(item => item.id === current.id)) {
          const defaultItem = array[defaultIndex] || array[0];
          console.log(`🔄 ProductConfig: Setting default ${itemType}:`, defaultItem);
          setter(defaultItem);
        }
      }
    };

    // Solo actualizar si las traducciones están disponibles
    if (sensorsT && sensorsT.length > 0) {
      updateIfNeeded(sensorsT, selectedSensor, setSelectedSensor, 0, 'sensor');
    }
    if (trackersT && trackersT.length > 0) {
      updateIfNeeded(trackersT, selectedTrackerType, setSelectedTrackerType, 0, 'tracker');
    }
    if (colorsT && colorsT.length > 0) {
      updateIfNeeded(colorsT, selectedColorTapa, setSelectedColorTapa, 0, 'tapa color (white)'); // Blanco como primer color (tapa)
      updateIfNeeded(colorsT, selectedColorCase, setSelectedColorCase, 1, 'case color (black)'); // Negro como segundo color (case)
    }
    if (usbReceiversT && usbReceiversT.length > 0) {
      updateIfNeeded(usbReceiversT, selectedUsbReceiver, setSelectedUsbReceiver, 0, 'USB receiver');
    }
    if (strapsT && strapsT.length > 0) {
      updateIfNeeded(strapsT, selectedStrap, setSelectedStrap, 0, 'strap');
    }
    if (chargingDocksT && chargingDocksT.length > 0) {
      updateIfNeeded(chargingDocksT, selectedChargingDock, setSelectedChargingDock, 0, 'charging dock');
    }

    // Inicializar cantidad solo si no hay una válida seleccionada
    if (quantities && quantities.length > 0 && !quantities.includes(selectedQuantity)) {
      console.log(`🔄 ProductConfig: Setting default quantity:`, quantities[0]);
      setSelectedQuantity(quantities[0]);
    }
  }, [sensorsT, trackersT, colorsT, usbReceiversT, strapsT, chargingDocksT, selectedSensor, selectedTrackerType, selectedColorTapa, selectedColorCase, selectedUsbReceiver, selectedStrap, selectedChargingDock, selectedQuantity]);

  return {
    // Estados
    selectedSensor,
    selectedTrackerType,
    selectedQuantity,
    selectedColorTapa,
    selectedColorCase,
    selectedUsbReceiver,
    selectedStrap,
    selectedChargingDock,
    
    // Setters
    setSelectedSensor,
    setSelectedTrackerType,
    setSelectedQuantity: setSelectedQuantityWithLog,
    setSelectedColorTapa,
    setSelectedColorCase,
    setSelectedUsbReceiver,
    setSelectedStrap,
    setSelectedChargingDock,
    
    // Datos traducidos
    sensorsT,
    trackersT,
    colorsT,
    usbReceiversT,
    strapsT,
    chargingDocksT,
  };
};
