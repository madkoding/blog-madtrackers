"use client";

import { useState, useEffect } from "react";
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

  const [selectedSensor, setSelectedSensor] = useState<Sensor>(sensorsT[0]);
  const [selectedTrackerType, setSelectedTrackerType] = useState<TrackerType>(trackersT[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(quantities[0]);
  const [selectedColorTapa, setSelectedColorTapa] = useState(colorsT[0]);
  const [selectedColorCase, setSelectedColorCase] = useState(colorsT[0]);
  const [selectedUsbReceiver, setSelectedUsbReceiver] = useState(usbReceiversT[0]);
  const [selectedStrap, setSelectedStrap] = useState(strapsT[0]);
  const [selectedChargingDock, setSelectedChargingDock] = useState(chargingDocksT[0]);

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
    setSelectedSensor(sensorsT[0]);
    setSelectedTrackerType(trackersT[0]);
    setSelectedColorTapa(colorsT[0]);
    setSelectedColorCase(colorsT[0]);
    setSelectedUsbReceiver(usbReceiversT[0]);
    setSelectedStrap(strapsT[0]);
    setSelectedChargingDock(chargingDocksT[0]);
  }, [sensorsT, trackersT, colorsT, usbReceiversT, strapsT, chargingDocksT]);

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
    setSelectedQuantity,
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
