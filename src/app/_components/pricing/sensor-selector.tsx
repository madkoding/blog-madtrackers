import React from "react";
import { Sensor } from "../../types";

type SensorSelectorProps = {
  sensors: Sensor[];
  selectedSensor: Sensor;
  setSelectedSensor: (sensor: Sensor) => void;
};

const SensorSelector: React.FC<SensorSelectorProps> = ({
  sensors,
  selectedSensor,
  setSelectedSensor,
}) => {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Tipo de Sensor:</h3>
      <div className="flex justify-center gap-4">
        {sensors.map((sensor) => (
          <button
            key={sensor.id}
            className={`w-full px-4 py-6 rounded-lg border-2 ${
              selectedSensor.id === sensor.id
                ? "border-black bg-purple-900 text-white"
                : "border-gray-300"
            }`}
            onClick={() => setSelectedSensor(sensor)}
          >
            {sensor.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        {sensors.map((sensor) => (
          <p className="w-full text-center px-2 py-2 text-xs" key={sensor.id}>
            {sensor.description}
            <br />
            Drifting: {sensor.drifting}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SensorSelector;
