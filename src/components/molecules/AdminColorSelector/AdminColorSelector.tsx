"use client";

import React, { useState, useCallback } from 'react';
import { colors } from '../../../app/constants';

interface AdminColorSelectorProps {
  selectedColor: string;
  field: string;
  onUpdate: (field: string, value: string) => void;
  id?: string;
}

const AdminColorSelector = React.memo<AdminColorSelectorProps>(({ selectedColor, field, onUpdate, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedColorObj = colors.find(color => color.id === selectedColor);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleColorSelect = useCallback((colorId: string) => {
    if (colorId !== selectedColor) {
      onUpdate(field, colorId);
    }
    setIsOpen(false);
  }, [selectedColor, field, onUpdate]);

  return (
    <div className="relative">
      <button
        id={id}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors w-full text-gray-900 bg-white"
      >
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ 
            backgroundColor: selectedColorObj?.hex,
            border: selectedColorObj?.id === 'white' ? '1px solid #ccc' : 'none'
          }}
        />
        <span className="text-sm flex-1 text-left text-gray-800">{selectedColorObj?.label}</span>
        <span className="text-xs text-gray-400">{selectedColorObj?.hex}</span>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 bg-white border rounded-lg shadow-lg">
          <div className="p-3 grid grid-cols-2 gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-800 ${
                  selectedColor === color.id ? 'bg-blue-50 border border-blue-300' : 'border border-transparent'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: color.hex,
                    border: color.id === 'white' ? '1px solid #ccc' : 'none'
                  }}
                />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-800">{color.label}</div>
                  <div className="text-xs text-gray-500">{color.hex}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

AdminColorSelector.displayName = 'AdminColorSelector';

export { AdminColorSelector, type AdminColorSelectorProps };
