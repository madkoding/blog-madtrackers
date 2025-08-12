"use client";

import { SensorSelectorProps } from '../../../types/admin';
import { sensors } from '../../constants';

export default function SensorSelector({ selectedSensor, onUpdate, id }: Readonly<SensorSelectorProps>) {
  return (
    <select
      id={id}
      value={selectedSensor}
      onChange={(e) => {
        if (e.target.value !== selectedSensor) {
          onUpdate('sensor', e.target.value);
        }
      }}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
    >
      {/* Opción por defecto cuando no hay sensor seleccionado */}
      {!sensors.some(sensor => sensor.label === selectedSensor) && (
        <option value="" className="text-gray-500">
          Selecciona un sensor
        </option>
      )}
      {sensors.map((sensor) => (
        <option key={sensor.id} value={sensor.label} className="text-gray-900">
          {sensor.label} - {sensor.description}
        </option>
      ))}
    </select>
  );
}
