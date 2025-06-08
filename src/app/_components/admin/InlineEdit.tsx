"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { InlineEditProps } from '../../../types/admin';

const InlineEdit = React.memo<InlineEditProps>(({ value, field, type = 'text', onUpdate, className = "", error, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Función para obtener el placeholder apropiado
  const getPlaceholder = useCallback(() => {
    if (placeholder) return placeholder;
    
    switch (type) {
      case 'email':
        return 'ejemplo@correo.com';
      case 'number':
        return '0';
      case 'date':
        return 'dd/mm/aaaa';
      default:
        return 'Ingrese valor...';
    }
  }, [placeholder, type]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Función para convertir fecha ISO a formato YYYY-MM-DD (local, sin cambio de zona horaria)
  const getInputDateValue = useCallback((dateValue: string) => {
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
  }, [type]);

  // Función para convertir fecha de input a ISO (manteniendo la fecha local)
  const convertDateValue = useCallback((inputValue: string) => {
    if (type === 'date') {
      // Crear fecha local sin cambio de zona horaria
      const [year, month, day] = inputValue.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
      return date.toISOString();
    }
    return inputValue;
  }, [type]);

  const handleSave = useCallback(() => {
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
  }, [tempValue, type, convertDateValue, value, onUpdate, field]);

  const handleCancel = useCallback(() => {
    setTempValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleEditStart = useCallback(() => {
    setIsEditing(true);
    // Para fechas, convertir el valor inicial al formato del input
    if (type === 'date') {
      const inputDateValue = getInputDateValue(value as string);
      setTempValue(inputDateValue);
    }
  }, [type, getInputDateValue, value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEditStart();
    }
  }, [handleEditStart]);

  // Mostrar placeholder cuando el valor está vacío
  const displayValue = value || getPlaceholder();
  const isPlaceholder = !value;

  if (isEditing) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={tempValue}
            placeholder={getPlaceholder()}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSave}
            autoFocus
            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 bg-white text-right flex-1 min-w-0 shadow-sm ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } ${className}`}
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleEditStart}
        onKeyDown={handleKeyDown}
        aria-label="Click para editar"
        className={`cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg border transition-all duration-200 text-right block focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0 shadow-sm ${
          error 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        } ${isPlaceholder ? 'text-gray-400 italic' : 'text-gray-900 font-medium'}`}
        title="Click para editar"
      >
        {displayValue}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
});

InlineEdit.displayName = 'InlineEdit';

export default InlineEdit;
