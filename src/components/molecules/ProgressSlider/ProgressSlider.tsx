"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Label } from "../../atoms/Label";
import { Badge } from "../../atoms/Badge";
import { cn } from "../../../utils/cn";

export interface ProgressSliderProps {
  label: string;
  percentage: number;
  color: string;
  field: string;
  onUpdate: (field: string, value: number) => void;
  className?: string;
  showBadge?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

// Función para obtener el hex del color de Tailwind
const getColorHex = (colorClass: string): string => {
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-green-500': '#10B981',
    'bg-yellow-500': '#F59E0B',
    'bg-purple-500': '#8B5CF6',
    'bg-red-500': '#EF4444',
    'bg-indigo-500': '#6366F1',
    'bg-pink-500': '#EC4899',
    'bg-gray-500': '#6B7280',
  };
  
  return colorMap[colorClass] || '#3B82F6';
};

export const ProgressSlider = React.memo<ProgressSliderProps>(({ 
  label, 
  percentage, 
  color, 
  field, 
  onUpdate, 
  className,
  showBadge = true,
  min = 0,
  max = 100,
  step = 1
}) => {
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

  const colorHex = getColorHex(color);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {showBadge && (
          <Badge variant="secondary" size="sm">
            {value}%
          </Badge>
        )}
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${colorHex} 0%, ${colorHex} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${colorHex};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${colorHex};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
});

ProgressSlider.displayName = 'ProgressSlider';

export default ProgressSlider;
