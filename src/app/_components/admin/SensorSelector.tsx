"use client";

import { SensorSelectorProps } from '../../../types/admin';
import { sensors } from '../../constants';

export default function SensorSelector({ selectedSensor, onUpdate }: Readonly<SensorSelectorProps>) {
  return (
    <select
      value={selectedSensor}
      onChange={(e) => {
        if (e.target.value !== selectedSensor) {
          onUpdate('sensor', e.target.value);
        }
      }}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
    >
      {sensors.map((sensor) => (
        <option key={sensor.id} value={sensor.label} className="text-gray-900">
          {sensor.label} - {sensor.description}
        </option>
      ))}
    </select>
  );
}
