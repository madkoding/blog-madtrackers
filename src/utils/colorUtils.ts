// Función auxiliar para obtener color hex
export function getColorHex(colorClass: string): string {
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-red-500': '#ef4444',
    'bg-orange-500': '#f97316',
  };
  return colorMap[colorClass] || '#3b82f6';
}
