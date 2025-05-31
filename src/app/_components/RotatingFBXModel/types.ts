import * as THREE from "three";

export interface ModelProps {
  modelPath: string;
  colors: string[];
}

export const hasColorProperty = (
  material: THREE.Material
): material is THREE.Material & { color: THREE.Color } => {
  return "color" in material && (material as THREE.Material & { color: THREE.Color }).color instanceof THREE.Color;
};
