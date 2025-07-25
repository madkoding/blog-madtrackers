export type Currency = "CLP" | "PEN" | "ARS" | "MXN" | "USD";

export interface Sensor {
  id: string;
  label: string;
  description: string;
  drifting: string;
  price?: number; // Opcional - solo se incluye en el backend
  available: string[];
}
export interface TrackerType {
  id: string;
  label: string;
  description: string;
  size: string;
  price?: number; // Opcional - solo se incluye en el backend
}
export interface Color {
  id: string;
  label: string;
  color: string;
  hex: string;
}

export type Point = { x: number; y: number };

export type PointsMap = {
  [key: number]: Point[];
};