"use client";

import { useState, useEffect } from 'react';
import { InlineEditProps } from '../../../types/admin';

export default function InlineEdit({ value, field, type = 'text', onUpdate, className = "" }: Readonly<InlineEditProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Función para convertir fecha ISO a formato YYYY-MM-DD (local, sin cambio de zona horaria)
  const getInputDateValue = (dateValue: string) => {
    if (type === 'date' && typeof dateValue === 'string') {
      try {
        // Si el valor ya está en formato YYYY-MM-DD, devolverlo directamente
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        
        // Si es una fecha ISO, convertirla
        const date = new Date(dateValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return '';
      }
    }
    return dateValue;
  };

  // Función para convertir fecha de input a ISO (manteniendo la fecha local)
  const convertDateValue = (inputValue: string) => {
    if (type === 'date') {
      // Crear fecha local sin cambio de zona horaria
      const [year, month, day] = inputValue.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
      return date.toISOString();
    }
    return inputValue;
  };

  const handleSave = () => {
    let processedValue = tempValue;
    
    if (type === 'number') {
      processedValue = Number(tempValue);
    } else if (type === 'date') {
      processedValue = convertDateValue(tempValue as string);
    }
    
    if (processedValue !== value) {
      onUpdate(field, processedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    // Para fechas, convertir el valor inicial al formato del input
    if (type === 'date') {
      const inputDateValue = getInputDateValue(value as string);
      setTempValue(inputDateValue);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          autoFocus
          className={`px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-right ${className}`}
        />
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEditStart();
    }
  };

  return (
    <button
      type="button"
      onClick={handleEditStart}
      onKeyDown={handleKeyDown}
      aria-label="Click para editar"
      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded border border-transparent hover:border-gray-300 transition-colors text-gray-900 font-medium text-right block focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-transparent"
      title="Click para editar"
    >
      {value}
    </button>
  );
}
