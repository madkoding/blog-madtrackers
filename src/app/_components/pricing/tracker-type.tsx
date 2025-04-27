import { TrackerType } from "@/app/types";
import React from "react";

/**
 * Props para el componente TrackerTypeSelector.
 */
export interface TrackerTypeSelectorProps {
  /** Lista de tipos de tracker disponibles */
  trackerTypes: TrackerType[];
  /** TrackerType actualmente seleccionado */
  selectedTrackerType: TrackerType;
  /** Función para actualizar el trackerType seleccionado */
  setSelectedTrackerType: (trackerType: TrackerType) => void;
}

/**
 * Componente para seleccionar el tipo de tracker (conectividad y duración de batería).
 *
 * @param props - Props de TrackerTypeSelector.
 */
const TrackerTypeSelector: React.FC<TrackerTypeSelectorProps> = ({
  trackerTypes,
  selectedTrackerType,
  setSelectedTrackerType,
}) => {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Tipo de Tracker:</h3>
      <div className="flex justify-center gap-4">
        {trackerTypes.map((tracker) => (
          <button
            key={tracker.id}
            className={`w-full px-4 py-6 rounded-lg border-2 transition-colors duration-200 ${
              selectedTrackerType.id === tracker.id
                ? "border-black bg-purple-900 text-white"
                : "border-gray-300 bg-white text-black hover:border-black hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTrackerType(tracker)}
          >
            {tracker.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {trackerTypes.map((tracker) => (
          <p
            key={tracker.id}
            className="w-full text-center px-2 py-2 text-xs text-gray-600"
          >
            {tracker.description}
            <br />
            Tamaño: {tracker.size}
          </p>
        ))}
      </div>
    </div>
  );
};

export default TrackerTypeSelector;
