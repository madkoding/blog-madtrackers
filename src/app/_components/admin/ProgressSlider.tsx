"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ProgressSliderProps } from '../../../types/admin';
import { getColorHex } from '../../../utils/colorUtils';

const ProgressSlider = React.memo<ProgressSliderProps>(({ label, percentage, color, field, onUpdate }) => {
  const [value, setValue] = useState(percentage);

  useEffect(() => {
    setValue(percentage);
  }, [percentage]);

  const handleChange = useCallback((newValue: number) => {
    if (newValue !== percentage) {
      setValue(newValue);
      onUpdate(field, newValue);
    }
  }, [percentage, field, onUpdate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(Number(e.target.value));
  }, [handleChange]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{value}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleInputChange}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${getColorHex(color)} 0%, ${getColorHex(color)} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
      </div>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${getColorHex(color)};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${getColorHex(color)};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
});

ProgressSlider.displayName = 'ProgressSlider';

export default ProgressSlider;
