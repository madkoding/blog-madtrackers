import { Color, Currency, PointsMap, Sensor } from "./types";

export const sensors: Sensor[] = [
  {
    id: "sensor1",
    label: "LSM6DSR",
    description: "Buena calidad de seguimiento",
    drifting: "30 min",
    price: 40000,
  },
  {
    id: "sensor2",
    label: "ICM45686",
    description: "Excelente calidad de seguimiento",
    drifting: "45 min",
    price: 80000,
  },
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

export const countries: Record<string, { 
  currency: Currency; 
  exchangeRate: number; 
  currencySymbol: string; 
  shippingCost: number; 
}> = {
  CL: { currency: "CLP", exchangeRate: 1, currencySymbol: "$", shippingCost: 5000 },
  PE: { currency: "PEN", exchangeRate: 0.0038, currencySymbol: "S/", shippingCost: 60000 },
  AR: { currency: "ARS", exchangeRate: 1.1, currencySymbol: "$", shippingCost: 60000 },
  MX: { currency: "MXN", exchangeRate: 0.022, currencySymbol: "$", shippingCost: 60000 },
  US: { currency: "USD", exchangeRate: 0.0011, currencySymbol: "US$", shippingCost: 60000 },
};

export const points: PointsMap = {
  6: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
  ],
  7: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 250, y: 95 },
  ],
  8: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
  ],
  9: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 250, y: 95 },
  ],
  10: [
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
  ],
  11: [
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
    { x: 250, y: 95 },
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