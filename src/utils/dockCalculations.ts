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
