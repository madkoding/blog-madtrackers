import { useMemo } from "react";
import { useLang } from "../lang-context";
import { translations } from "../i18n";
import { sensors, trackers, colors } from "./product.constants";

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

  return { sensors: translatedSensors, trackers: translatedTrackers, colors: translatedColors };
}
