import { TrackerType } from "@/app/types";
import React, { useCallback, useMemo } from "react";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

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
const TrackerTypeSelector: React.FC<TrackerTypeSelectorProps> = React.memo(({
  trackerTypes,
  selectedTrackerType,
  setSelectedTrackerType,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const handleTrackerSelect = useCallback((tracker: TrackerType) => {
    setSelectedTrackerType(tracker);
  }, [setSelectedTrackerType]);

  const trackerButtons = useMemo(() =>
    trackerTypes.map((tracker) => (
      <button
        key={tracker.id}
        className={`w-full px-4 py-6 rounded-lg border-2 transition-colors duration-200 ${
          selectedTrackerType.id === tracker.id
            ? "border-black bg-purple-900 text-white"
            : "border-gray-300 bg-white text-black hover:border-black hover:bg-gray-100"
        }`}
        onClick={() => handleTrackerSelect(tracker)}
      >
        {tracker.label}
      </button>
    )), [trackerTypes, selectedTrackerType.id, handleTrackerSelect]);

  const trackerDescriptions = useMemo(() =>
    trackerTypes.map((tracker) => (
      <p
        key={tracker.id}
        className="w-full text-center px-2 py-2 text-xs text-gray-600"
      >
        {tracker.description}
        <br />
        {tracker.size}
      </p>
    )), [trackerTypes]);

  return (
    <div className="mb-2">
      <h3 className="font-medium mb-2">{t.trackerType}</h3>
      <div className="flex justify-center gap-4">
        {trackerButtons}
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {trackerDescriptions}
      </div>
    </div>
  );
});

TrackerTypeSelector.displayName = 'TrackerTypeSelector';

export default TrackerTypeSelector;
