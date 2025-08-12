import { useMemo } from "react";
import { useLang } from "../lang-context";
import { translations } from "../i18n";
import { sensors, trackers, colors, usbReceivers, straps, chargingDocks } from "./product.constants";

// Hook para obtener sensores, trackers y colores traducidos
export function useTranslatedConstants() {
  const { lang } = useLang();
  const t = translations[lang] as unknown as Record<string, string>;

  const translatedSensors = useMemo(
    () =>
      sensors.map((sensor) => ({
        ...sensor,
        label: t[sensor.id + "_label"] || sensor.label,
        description: t[sensor.id + "_desc"] || sensor.description,
      })),
    [t]
  );

  const translatedTrackers = useMemo(
    () =>
      trackers.map((tracker) => ({
        ...tracker,
        label: t[tracker.id + "_label"] || tracker.label,
        description: t[tracker.id + "_desc"] || tracker.description,
      })),
    [t]
  );

  const translatedColors = useMemo(
    () =>
      colors.map((color) => ({
        ...color,
        label: t["color_" + color.id] || color.label,
      })),
    [t]
  );

  const translatedUsbReceivers = useMemo(
    () =>
      usbReceivers.map((receiver) => ({
        ...receiver,
        label: t[receiver.id + "_label"] || receiver.label,
        description: t[receiver.id + "_desc"] || receiver.description,
      })),
    [t]
  );

  const translatedStraps = useMemo(
    () =>
      straps.map((strap) => ({
        ...strap,
        label: t[strap.id + "_label"] || strap.label,
        description: t[strap.id + "_desc"] || strap.description,
      })),
    [t]
  );

  const translatedChargingDocks = useMemo(
    () =>
      chargingDocks.map((dock) => ({
        ...dock,
        label: t[dock.id + "_label"] || dock.label,
        description: t[dock.id + "_desc"] || dock.description,
      })),
    [t]
  );

  return { 
    sensors: translatedSensors, 
    trackers: translatedTrackers, 
    colors: translatedColors,
    usbReceivers: translatedUsbReceivers,
    straps: translatedStraps,
    chargingDocks: translatedChargingDocks
  };
}
