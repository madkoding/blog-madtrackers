"use client";

import React, { useCallback, useMemo } from "react";
import { UsbReceiver } from "../../types";

type UsbReceiverSelectorProps = {
  usbReceivers: UsbReceiver[];
  selectedUsbReceiver: UsbReceiver;
  setSelectedUsbReceiver: (receiver: UsbReceiver) => void;
};

const UsbReceiverSelector: React.FC<UsbReceiverSelectorProps> = React.memo(({
  usbReceivers,
  selectedUsbReceiver,
  setSelectedUsbReceiver,
}) => {
  const handleReceiverSelect = useCallback((receiver: UsbReceiver) => {
    setSelectedUsbReceiver(receiver);
  }, [setSelectedUsbReceiver]);

  const receiverButtons = useMemo(() => 
    usbReceivers.map((receiver) => (
      <button
        key={receiver.id}
        className={`flex-1 min-w-0 px-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 ${
          selectedUsbReceiver.id === receiver.id
            ? "border-black bg-blue-900 text-white"
            : "border-gray-300 hover:border-blue-300"
        }`}
        onClick={() => handleReceiverSelect(receiver)}
      >
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {receiver.id === "usb_3m" ? (
              // Icono WiFi corto alcance (2 ondas)
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4C9.79 4 7.79 4.69 6.17 5.88L7.59 7.3C8.86 6.46 10.39 6 12 6S15.14 6.46 16.41 7.3L17.83 5.88C16.21 4.69 14.21 4 12 4M12 8C10.69 8 9.45 8.35 8.38 9L9.8 10.42C10.46 10.15 11.21 10 12 10S13.54 10.15 14.2 10.42L15.62 9C14.55 8.35 13.31 8 12 8M12 12C11.31 12 10.69 12.19 10.17 12.5L12 14.33L13.83 12.5C13.31 12.19 12.69 12 12 12Z"/>
              </svg>
            ) : (
              // Icono WiFi largo alcance (4 ondas)
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C7.03 2 2.66 3.79 0 6.74L1.42 8.16C3.71 5.68 7.58 4.2 12 4.2S20.29 5.68 22.58 8.16L24 6.74C21.34 3.79 16.97 2 12 2M12 6C8.8 6 5.85 7.07 3.61 8.92L5.03 10.34C6.9 8.86 9.35 8 12 8S17.1 8.86 18.97 10.34L20.39 8.92C18.15 7.07 15.2 6 12 6M12 10C10.07 10 8.27 10.64 6.86 11.71L8.28 13.13C9.33 12.42 10.62 12 12 12S14.67 12.42 15.72 13.13L17.14 11.71C15.73 10.64 13.93 10 12 10M12 14C11.31 14 10.69 14.19 10.17 14.5L12 16.33L13.83 14.5C13.31 14.19 12.69 14 12 14Z"/>
              </svg>
            )}
          </div>
          <div className="font-medium">{receiver.label}</div>
          <div className="text-xs opacity-75">{receiver.description}</div>
          {receiver.additionalCostUsd > 0 && (
            <div className="text-xs font-bold mt-1">
              +${receiver.additionalCostUsd} USD
            </div>
          )}
        </div>
      </button>
    )), [usbReceivers, selectedUsbReceiver, handleReceiverSelect]);

  return (
    <div className="mb-4 flex flex-col items-center gap-2 w-full">
      <h3 className="font-medium mb-2">Receptor USB</h3>
      <div className="flex justify-center gap-2 flex-wrap w-4/5">
        {receiverButtons}
      </div>
    </div>
  );
});

UsbReceiverSelector.displayName = 'UsbReceiverSelector';

export default UsbReceiverSelector;
