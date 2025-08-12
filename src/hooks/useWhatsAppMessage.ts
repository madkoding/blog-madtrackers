"use client";

import { useMemo } from "react";
import { Currency } from "../app/types";

interface UseWhatsAppMessageProps {
  selectedTrackerType: { label: string };
  selectedSensor: { label: string };
  selectedQuantity: number;
  selectedColorTapa: { label: string };
  selectedColorCase: { label: string };
  selectedUsbReceiver: { label: string };
  selectedStrap: { label: string };
  selectedChargingDock: { label: string };
  currency: Currency;
  totalUsd: number;
}

export const useWhatsAppMessage = ({
  selectedTrackerType,
  selectedSensor,
  selectedQuantity,
  selectedColorTapa,
  selectedColorCase,
  selectedUsbReceiver,
  selectedStrap,
  selectedChargingDock,
  currency,
  totalUsd,
}: UseWhatsAppMessageProps) => {
  const message = useMemo(() => {
    return encodeURIComponent(
      `Hola, quiero encargar estos trackers.
- País: ${currency}
- Tipo de tracker: ${selectedTrackerType.label}
- Sensor: ${selectedSensor.label} 
- Cantidad: ${selectedQuantity}
- Color de la tapa: ${selectedColorTapa.label}
- Color del case: ${selectedColorCase.label}
- Receptor USB: ${selectedUsbReceiver.label}
- Straps: ${selectedStrap.label}
- Dock de carga: ${selectedChargingDock.label}
- Precio total: $${totalUsd} USD`
    );
  }, [
    selectedTrackerType.label,
    selectedSensor.label,
    selectedQuantity,
    selectedColorTapa.label,
    selectedColorCase.label,
    selectedUsbReceiver.label,
    selectedStrap.label,
    selectedChargingDock.label,
    currency,
    totalUsd,
  ]);

  const openWhatsApp = () => {
    window.open(`https://wa.me/56975746099?text=${message}`, "_blank");
  };

  return {
    message,
    openWhatsApp,
  };
};
