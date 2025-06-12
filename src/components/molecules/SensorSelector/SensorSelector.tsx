import React from 'react';

export interface SensorSelectorProps {
  selectedSensor: string;
  onUpdate: (field: string, value: string) => void;
  id?: string;
  sensors?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  className?: string;
}

const SensorSelector: React.FC<SensorSelectorProps> = React.memo(({
  selectedSensor,
  onUpdate,
  id,
  sensors = [],
  className = ""
}) => {
  return (
    <select
      id={id}
      value={selectedSensor}
      onChange={(e) => {
        if (e.target.value !== selectedSensor) {
          onUpdate('sensor', e.target.value);
        }
      }}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${className}`}
    >
      {sensors.map((sensor) => (
        <option key={sensor.id} value={sensor.label} className="text-gray-900">
          {sensor.label} - {sensor.description}
        </option>
      ))}
    </select>
  );
});

SensorSelector.displayName = 'SensorSelector';

export { SensorSelector };
