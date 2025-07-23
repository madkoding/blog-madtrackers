import { Color, Sensor } from "../types";

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
  //   label: "LSM6DSR + MMC5983MA",
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
    label: "ICM45686 + QCM6309",
    description: "Excelente calidad de seguimiento con magnetómetro",
    drifting: "~60 min",
    // price removido - ahora se maneja en el backend
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

export const quantities: number[] = [6, 8, 10, 20];

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
