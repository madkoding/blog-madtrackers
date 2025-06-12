"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input } from "../../atoms";

interface InlineEditProps {
  value: string | number;
  field: string;
  type?: 'text' | 'email' | 'number' | 'date';
  onUpdate: (field: string, value: string | number) => void;
  className?: string;
  error?: string;
  placeholder?: string;
  id?: string;
}

const InlineEdit = React.memo<InlineEditProps>(({ 
  value, 
  field, 
  type = 'text', 
  onUpdate, 
  className = "", 
  error, 
  placeholder, 
  id 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // Función para obtener el placeholder apropiado
  const getPlaceholder = useCallback(() => {
    if (placeholder) {return placeholder;}
    
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
  const getInputDateValue = useCallback((dateValue: string | number) => {
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
    return String(dateValue);
  }, [type]);

  const handleSave = () => {
    onUpdate(field, tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatDisplayValue = (val: string | number) => {
    if (type === 'date' && val) {
      try {
        const date = new Date(String(val));
        return date.toLocaleDateString('es-ES');
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Input
          id={id}
          type={type}
          value={getInputDateValue(tempValue)}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className={`min-w-0 ${error ? 'border-red-500' : ''}`}
          autoFocus
        />
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          className="px-2 py-1"
        >
          ✓
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="px-2 py-1"
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <button
      className={`inline-flex items-center justify-between w-full text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
      type="button"
      aria-label={`Editar ${field}`}
    >
      <span className={`${!value ? 'text-gray-400 italic' : ''}`}>
        {value ? formatDisplayValue(value) : getPlaceholder()}
      </span>
      <span className="text-gray-400 text-xs ml-2">✏️</span>
    </button>
  );
});

InlineEdit.displayName = "InlineEdit";

export default InlineEdit;
