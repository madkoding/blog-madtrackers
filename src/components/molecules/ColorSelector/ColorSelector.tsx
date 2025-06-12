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
      
      {isOpen && (
        <div 
          role="dialog"
          className="absolute z-50 mt-1 w-full min-w-72 bg-white border border-gray-200 rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        >
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-left
                    ${selectedColor === color.id 
                      ? 'bg-blue-50 border border-blue-300' 
                      : 'border border-transparent'
                    }
                  `}
                  type="button"
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"
                    style={{ 
                      backgroundColor: color.hex,
                      borderColor: color.id === 'white' ? '#ccc' : color.hex
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {color.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {color.hex}
                    </div>
                  </div>
                  {selectedColor === color.id && (
                    <div className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ColorSelector.displayName = "ColorSelector";

export default ColorSelector;
