"use client";

import React, { useState, useCallback } from 'react';

interface Color {
  id: string;
  label: string;
  hex: string;
}

interface ColorSelectorProps {
  id?: string;
  field?: string;
  selectedColor?: string;
  colors: Color[];
  onColorChange?: (colorId: string) => void;
  onUpdate?: (field: string, value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ColorSelector = React.memo<ColorSelectorProps>(({ 
  selectedColor, 
  colors, 
  onColorChange, 
  className = "",
  placeholder = "Seleccionar color",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedColorObj = colors.find(color => color.id === selectedColor);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [isOpen, disabled]);

  const handleColorSelect = useCallback((colorId: string) => {
    if (colorId !== selectedColor && onColorChange) {
      onColorChange(colorId);
    }
    setIsOpen(false);
  }, [selectedColor, onColorChange]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (isOpen) {
      const handleClick = () => setIsOpen(false);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors w-full text-left
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-50' 
            : 'bg-white hover:bg-gray-50 cursor-pointer'
          }
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
        `}
        type="button"
      >
        {selectedColorObj ? (
          <>
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ 
                backgroundColor: selectedColorObj.hex,
                border: selectedColorObj.id === 'white' ? '1px solid #ccc' : 'none'
              }}
            />
            <span className="text-sm flex-1 text-gray-800">{selectedColorObj.label}</span>
            <span className="text-xs text-gray-400">{selectedColorObj.hex}</span>
          </>
        ) : (
          <span className="text-sm text-gray-500 flex-1">{placeholder}</span>
        )}
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <select
        className="absolute z-50 mt-1 w-full min-w-72 bg-white border border-gray-200 rounded-lg shadow-lg"
        value={selectedColor ?? ""}
        onChange={(e) => handleColorSelect(e.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {colors.map((color) => (
          <option key={color.id} value={color.id}>
            {color.label} ({color.hex})
          </option>
        ))}
      </select>
    </div>
  );
});

ColorSelector.displayName = "ColorSelector";

export default ColorSelector;
