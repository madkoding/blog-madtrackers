import { Color, Currency, PointsMap, Sensor } from "./types";
import { useLang } from "./lang-context";
import { translations } from "./i18n";
import { useMemo } from "react";

// Constantes para FBXModel y materiales

export const FBX_MODEL_SCALE = 0.7;
export const FBX_MODEL_ROTATION_SPEED_X = 0.005;
export const FBX_MODEL_ROTATION_SPEED_Y = 0.005;
export const FBX_MODEL_ROTATION_SPEED_Z = 0.005;

export const FBX_MODEL_METALNESS_MAIN = 0.2;
export const FBX_MODEL_ROUGHNESS_MAIN = 0.3;
export const FBX_MODEL_METALNESS_SECONDARY = 1;
export const FBX_MODEL_ROUGHNESS_SECONDARY = 1;
export const FBX_MODEL_METALNESS_DEFAULT = 1;
export const FBX_MODEL_ROUGHNESS_DEFAULT = 1;
export const FBX_MODEL_ENV_INTENSITY = 1.0;
export const FBX_MODEL_NORMAL_SCALE = new (require('three').Vector2)(0.3, 0.3);
export const FBX_MODEL_DEFAULT_COLOR = 0xffffff;
export const FBX_MODEL_PURPLE_COLOR = 0x800080;
export const FBX_MODEL_NORMAL_REPEAT = 0.1;

export const sensors: Sensor[] = [
  {
    id: "sensor1",
    label: "LSM6DSR",
    description: "Buena calidad de seguimiento",
    drifting: "20 min",
    price: 1,
    available: ['rf','wifi']
  },
  {
    id: "sensor2",
    label: "LSM6DSR + MMC5983MA",
    description: "Buena calidad de seguimiento con magnetómetro",
    drifting: "30 min",
    price: 1.25,
    available: ['rf']
  },
  {
    id: "sensor3",
    label: "ICM45686",
    description: "Excelente calidad de seguimiento",
    drifting: "45 min",
    price: 1.375,
    available: ['rf','wifi']
  },
  {
    id: "sensor4",
    label: "ICM45686 + MMC5983MA",
    description: "Excelente calidad de seguimiento con magnetómetro",
    drifting: "60 min",
    price: 1.5,
    available: ['rf']
  },
];

export const trackers: any[] = [
  {
    id: "rf",
    label: "RF",
    description: "50 horas de batería. Utiliza receptor USB",
    size: "3.8 x 3.8 x 1.0 cm",
    price: 40,
  },
  // {
  //   id: "wifi",
  //   label: "WiFi",
  //   description: "10 horas de batería. Conecta a router WiFi",
  //   size: "4.5 x 4.5 x 1.5 cm",
  //   price: 30,
  // }
];

export const quantities: number[] = [6, 7, 8, 9, 10, 11, 20];

export const colors: Color[] = [
  { id: "white", label: "Blanco", color: "bg-white border-gray-400", hex: "#FFFFFF" },
  { id: "black", label: "Negro", color: "bg-black text-white", hex: "#444444" },
  { id: "red", label: "Rojo", color: "bg-red-500", hex: "#F87171" },
  { id: "blue", label: "Azul", color: "bg-blue-500", hex: "#3B82F6" },
  { id: "purple", label: "Morado", color: "bg-purple-500", hex: "#A855F7" },
  { id: "yellow", label: "Amarillo", color: "bg-yellow-500", hex: "#F59E0B" },
  { id: "green", label: "Verde", color: "bg-green-500", hex: "#10B981" },
  { id: "orange", label: "Naranja", color: "bg-orange-500", hex: "#FB923C" },
  { id: "pink", label: "Rosa", color: "bg-pink-500", hex: "#EC4899" },
  { id: "gray", label: "Gris", color: "bg-gray-500", hex: "#6B7280" },
];

/**
 * Configuración de precios por país basada en USD.
 */
export interface CountryConfig {
  /** Código ISO de la moneda local */
  currency: Currency;
  /** Tasa de conversión: moneda local por 1 USD */
  exchangeRate: number;
  /** Símbolo de la moneda local */
  currencySymbol: string;
  /** Costo de envío base en USD */
  shippingCostUsd: number;
}

/**
 * Mapeo de países a su configuración de moneda y envío.
 */
export const countries: Record<string, CountryConfig> = {
  CL: { currency: "CLP", exchangeRate: 1000, currencySymbol: "$", shippingCostUsd: 0 },
  PE: { currency: "PEN", exchangeRate: 3.8, currencySymbol: "S/", shippingCostUsd: 65 },
  AR: { currency: "ARS", exchangeRate: 1170, currencySymbol: "$", shippingCostUsd: 65 },
  MX: { currency: "MXN", exchangeRate: 20, currencySymbol: "$", shippingCostUsd: 65 },
  US: { currency: "USD", exchangeRate: 1, currencySymbol: "US$", shippingCostUsd: 65 },
};

export const points: PointsMap = {
  6: [
    { x: 250, y: 60 },
    { x: 250, y: 95 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
  ],
  8: [
    { x: 250, y: 60 },
    { x: 250, y: 95 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
  ],
  10: [
    { x: 250, y: 60 },
    { x: 250, y: 95 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 200, y: 65 },
    { x: 300, y: 65 },
  ],
  20: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 200, y: 65 },
    { x: 300, y: 65 },

    { x: 250, y: 15 },
    { x: 250, y: 35 },
    { x: 250, y: 50 },
    { x: 250, y: 95 },
    { x: 215, y: 45 },
    { x: 285, y: 45 },
    { x: 195, y: 85 },
    { x: 305, y: 85 },
    { x: 185, y: 100 },
    { x: 315, y: 100 },
  ],
};

// Hook para obtener sensores, trackers y colores traducidos
export function useTranslatedConstants() {
  const { lang } = useLang();
  const t = translations[lang] as Record<string, string>;

  const translatedSensors = useMemo(
    () =>
      sensors.map((sensor) => ({
        ...sensor,
        label: t[sensor.id + "_label"] || sensor.label,
        description: t[sensor.id + "_desc"] || sensor.description,
      })),
    [t, lang]
  );

  const translatedTrackers = useMemo(
    () =>
      trackers.map((tracker) => ({
        ...tracker,
        label: t[tracker.id + "_label"] || tracker.label,
        description: t[tracker.id + "_desc"] || tracker.description,
      })),
    [t, lang]
  );

  const translatedColors = useMemo(
    () =>
      colors.map((color) => ({
        ...color,
        label: t["color_" + color.id] || color.label,
      })),
    [t, lang]
  );

  return { sensors: translatedSensors, trackers: translatedTrackers, colors: translatedColors };
}