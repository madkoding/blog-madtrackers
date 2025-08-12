import { Color, Sensor, UsbReceiver, Strap, ChargingDock } from "../types";

// NOTA: Los precios se han movido al backend por seguridad
// Solo se exponen datos públicos necesarios para la UI
export const sensors: Sensor[] = [
  // {
  //   id: "sensor1",
  //   label: "LSM6DSR",
  //   description: "Buena calidad de seguimiento",
  //   drifting: "20 min",
  //   // price removido - ahora se maneja en el backend
  //   available: ['rf','wifi']
  // },
  // {
  //   id: "sensor2",
  //   label: "LSM6DSR + QMC6309",
  //   description: "Buena calidad de seguimiento con magnetómetro",
  //   drifting: "30 min",
  //   // price removido - ahora se maneja en el backend
  //   available: ['rf']
  // },
  // {
  //   id: "sensor3",
  //   label: "ICM45686",
  //   description: "Excelente calidad de seguimiento",
  //   drifting: "45 min",
  //   // price removido - ahora se maneja en el backend
  //   available: ['rf','wifi']
  // },
  {
    id: "sensor4",
    label: "ICM45686 + QMC6309",
    description: "Excelente calidad de seguimiento con magnetómetro",
    drifting: "~60 min",
    available: ['rf']
  },
];

export const trackers = [
  {
    id: "rf",
    label: "ESB",
    description: "~50 horas de batería. Utiliza receptor USB",
    size: "3.8 x 3.8 x 1.0 cm",
    // price removido - ahora se maneja en el backend
  },
  // {
  //   id: "wifi",
  //   label: "WiFi",
  //   description: "10 horas de batería. Conecta a router WiFi",
  //   size: "4.5 x 4.5 x 1.5 cm",
  //   // price removido - ahora se maneja en el backend
  // }
];

export const usbReceivers: UsbReceiver[] = [
  {
    id: "usb_3m",
    label: "Alcance de 3mt²",
    description: "Alcance estándar",
    additionalCostUsd: 0
  },
  {
    id: "usb_6m",
    label: "Alcance de 6mt²",
    description: "Alcance extendido",
    additionalCostUsd: 30
  }
];

export const straps: Strap[] = [
  {
    id: "velcro",
    label: "Straps de velcro",
    description: "Ideales para uso casual y cómodo",
    additionalCostUsd: 0
  },
  {
    id: "anchor",
    label: "Straps con anclaje",
    description: "Perfectos para dancers y uso intensivo",
    additionalCostUsd: 10
  }
];

export const chargingDocks: ChargingDock[] = [
  {
    id: "no_dock",
    label: "Sin dock de carga",
    description: "Carga mediante cable USB-C de 1 a 6 conectores incluido",
    additionalCostUsd: 0,
    available: true
  },
  {
    id: "dock_dynamic",
    label: "Dock de carga",
    description: "Carga simultánea de trackers",
    additionalCostUsd: 0, // Se calculará dinámicamente
    available: false
  }
];

export const quantities: number[] = [6, 8, 10, 20];

// Función para calcular el costo del dock de carga basado en la cantidad de trackers
export function calculateDockCost(quantity: number): number {
  // Costo base de 50 USD para 6 trackers, +5 USD por cada tracker adicional
  const baseQuantity = 6;
  const baseCost = 50;
  const costPerAdditionalTracker = 5;
  
  if (quantity <= baseQuantity) {
    return baseCost;
  }
  
  const additionalTrackers = quantity - baseQuantity;
  return baseCost + (additionalTrackers * costPerAdditionalTracker);
}

// Función para obtener el label dinámico del dock
export function getDynamicDockLabel(quantity: number): string {
  return `Dock de carga para ${quantity} trackers`;
}

// Función para obtener la descripción dinámica del dock
export function getDynamicDockDescription(quantity: number): string {
  return `Carga simultánea de hasta ${quantity} trackers`;
}

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
