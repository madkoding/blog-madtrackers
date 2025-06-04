import React, { useCallback, useMemo } from "react";
import { Sensor } from "../../types";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

type SensorSelectorProps = {
  sensors: Sensor[];
  selectedSensor: Sensor;
  setSelectedSensor: (sensor: Sensor) => void;
};

const SensorSelector: React.FC<SensorSelectorProps> = React.memo(({
  sensors,
  selectedSensor,
  setSelectedSensor,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  const handleSensorSelect = useCallback((sensor: Sensor) => {
    setSelectedSensor(sensor);
  }, [setSelectedSensor]);

  const sensorItems = useMemo(() => 
    sensors.map((sensor) => (
      <div
        className="w-1/2 px-1 pb-4 flex-col items-center"
        key={sensor.id}
      >
        <button
          className={`w-full px-1 py-4 text-xs font-bold rounded-lg border-2 ${
            selectedSensor.id === sensor.id
              ? "border-black bg-purple-900 text-white"
              : "border-gray-300"
          }`}
          onClick={() => handleSensorSelect(sensor)}
        >
          {sensor.label}
        </button>
        <p className="w-full text-center px-2 py-2 text-xs">
          {sensor.description}
          <br />
          Drifting: {sensor.drifting}
        </p>
      </div>
    )), [sensors, selectedSensor, handleSensorSelect]);

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">{t.sensor}</h3>
      <div className="flex justify-center flex-wrap">
        {sensorItems}
      </div>
    </div>
  );
});

SensorSelector.displayName = 'SensorSelector';

export default SensorSelector;
