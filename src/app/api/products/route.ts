import { NextRequest, NextResponse } from 'next/server';

// Datos de productos (sin exponer precios)
const SENSORS_DATA = [
  // {
  //   id: "sensor1",
  //   label: "LSM6DSR",
  //   description: "Buena calidad de seguimiento",
  //   drifting: "20 min",
  //   available: ['rf','wifi']
  // },
  {
    id: "sensor2", 
    label: "LSM6DSR + MMC5983MA",
    description: "Buena calidad de seguimiento con magnetómetro",
    drifting: "30 min",
    available: ['rf']
  },
  // {
  //   id: "sensor3",
  //   label: "ICM45686", 
  //   description: "Excelente calidad de seguimiento",
  //   drifting: "45 min",
  //   available: ['rf','wifi']
  // },
  {
    id: "sensor4",
    label: "ICM45686 + MMC5983MA",
    description: "Excelente calidad de seguimiento con magnetómetro", 
    drifting: "60 min",
    available: ['rf']
  },
];

const TRACKERS_DATA = [
  {
    id: "rf",
    label: "RF",
    description: "50 horas de batería. Utiliza receptor USB",
    size: "3.8 x 3.8 x 1.0 cm",
  },
  // {
  //   id: "wifi",
  //   label: "WiFi", 
  //   description: "10 horas de batería. Conecta a router WiFi",
  //   size: "4.5 x 4.5 x 1.5 cm",
  // }
];

const COLORS_DATA = [
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

const QUANTITIES_DATA = [6, 8, 10, 20];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'sensors':
        return NextResponse.json({ sensors: SENSORS_DATA });
      case 'trackers':
        return NextResponse.json({ trackers: TRACKERS_DATA });
      case 'colors':
        return NextResponse.json({ colors: COLORS_DATA });
      case 'quantities':
        return NextResponse.json({ quantities: QUANTITIES_DATA });
      case 'all':
      default:
        return NextResponse.json({
          sensors: SENSORS_DATA,
          trackers: TRACKERS_DATA,
          colors: COLORS_DATA,
          quantities: QUANTITIES_DATA
        });
    }
  } catch (error) {
    console.error('Error en API de productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
