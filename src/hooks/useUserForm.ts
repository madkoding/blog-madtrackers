import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserTracking, OrderStatus, SensorTypes, Colors } from '../interfaces/tracking';
import { TrackingManager } from '../lib/trackingManager';

interface UserFormData {
  nombreUsuario: string;
  contacto: string;
  fechaEntrega: string;
  totalUsd: number;
  abonadoUsd: number;
  envioPagado: boolean;
  numeroTrackers: number;
  sensor: SensorTypes;
  magneto: boolean;
  colorCase: Colors;
  colorTapa: Colors;
  paisEnvio: string;
  estadoPedido?: OrderStatus;
}

interface UseUserFormProps {
  mode: 'create' | 'edit';
  initialData?: UserTracking;
  onSuccess?: (data: UserTracking) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

export function useUserForm({ mode, initialData, onSuccess }: UseUserFormProps) {
  const router = useRouter();

  // Estados del formulario
  const [formData, setFormData] = useState<UserFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        nombreUsuario: initialData.nombreUsuario,
        contacto: initialData.contacto,
        fechaEntrega: initialData.fechaEntrega || '',
        totalUsd: initialData.totalUsd || (initialData.total ? initialData.total / 1000 : 350),
        abonadoUsd: initialData.abonadoUsd || (initialData.abonado ? initialData.abonado / 1000 : 0),
        envioPagado: initialData.envioPagado || false,
        numeroTrackers: initialData.numeroTrackers || 5,
        sensor: (initialData.sensor as SensorTypes) || SensorTypes.LSM6DSR,
        magneto: initialData.sensor?.includes('+') || false,
        colorCase: (initialData.colorCase as Colors) || Colors.BLACK,
        colorTapa: (initialData.colorTapa as Colors) || Colors.BLACK,
        paisEnvio: initialData.paisEnvio || 'CL',
        estadoPedido: initialData.estadoPedido || OrderStatus.WAITING
      };
    }

    // Valores por defecto para crear nuevo usuario
    return {
      nombreUsuario: '',
      contacto: '',
      fechaEntrega: '',
      totalUsd: 350,
      abonadoUsd: 0,
      envioPagado: false,
      numeroTrackers: 5,
      sensor: SensorTypes.LSM6DSR,
      magneto: false,
      colorCase: Colors.BLACK,
      colorTapa: Colors.BLACK,
      paisEnvio: 'CL',
      estadoPedido: OrderStatus.WAITING
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Función para actualizar campos del formulario
  const updateField = useCallback((field: string, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Si se cambia el sensor, actualizar automáticamente el magnetómetro
      if (field === 'sensor') {
        updated.magneto = (value as string).includes('+');
      }
      
      return updated;
    });
    
    // Limpiar errores cuando el usuario empiece a corregir
    if (error) {
      setError(null);
    }
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [error, validationErrors]);

  // Funciones de validación
  const validateUserInfo = useCallback(() => {
    const errors: ValidationErrors = {};

    if (!formData.nombreUsuario.trim()) {
      errors.nombreUsuario = 'El nombre de usuario es obligatorio';
    } else if (formData.nombreUsuario.trim().length < 3) {
      errors.nombreUsuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.contacto.trim()) {
      errors.contacto = 'El email es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contacto)) {
        errors.contacto = 'El email no tiene un formato válido';
      }
    }

    return errors;
  }, [formData.nombreUsuario, formData.contacto]);

  const validateDates = useCallback(() => {
    const errors: ValidationErrors = {};

    if (formData.fechaEntrega) {
      const fechaEntrega = new Date(formData.fechaEntrega);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaEntrega < hoy) {
        errors.fechaEntrega = 'La fecha de entrega no puede ser en el pasado';
      }
    }

    return errors;
  }, [formData.fechaEntrega]);

  const validateAmounts = useCallback(() => {
    const errors: ValidationErrors = {};

    if (!formData.numeroTrackers || formData.numeroTrackers < 1) {
      errors.numeroTrackers = 'El número de trackers debe ser al menos 1';
    } else if (formData.numeroTrackers > 20) {
      errors.numeroTrackers = 'El número de trackers no puede ser mayor a 20';
    }

    if (!formData.totalUsd || formData.totalUsd <= 0) {
      errors.totalUsd = 'El total debe ser mayor a 0';
    }

    if (formData.abonadoUsd < 0) {
      errors.abonadoUsd = 'El monto abonado no puede ser negativo';
    } else if (formData.abonadoUsd > formData.totalUsd) {
      errors.abonadoUsd = 'El monto abonado no puede ser mayor al total';
    }

    return errors;
  }, [formData.numeroTrackers, formData.totalUsd, formData.abonadoUsd]);

  const validateSelections = useCallback(() => {
    const errors: ValidationErrors = {};

    if (!formData.sensor || !Object.values(SensorTypes).includes(formData.sensor)) {
      errors.sensor = 'Debe seleccionar un sensor válido';
    }

    if (!formData.colorCase || !Object.values(Colors).includes(formData.colorCase)) {
      errors.colorCase = 'Debe seleccionar un color válido para el case';
    }

    if (!formData.colorTapa || !Object.values(Colors).includes(formData.colorTapa)) {
      errors.colorTapa = 'Debe seleccionar un color válido para la tapa';
    }

    if (!formData.paisEnvio) {
      errors.paisEnvio = 'Debe seleccionar un país de envío';
    }

    return errors;
  }, [formData.sensor, formData.colorCase, formData.colorTapa, formData.paisEnvio]);

  // Validación completa del formulario
  const validateForm = useCallback(() => {
    const allErrors = {
      ...validateUserInfo(),
      ...validateDates(),
      ...validateAmounts(),
      ...validateSelections()
    };

    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }, [validateUserInfo, validateDates, validateAmounts, validateSelections]);

  // Función auxiliar para crear usuario
  const createUser = useCallback(async (): Promise<UserTracking> => {
    const newTracking = TrackingManager.generateUserTracking({
      ...formData,
      fechaLimite: formData.fechaEntrega,
      estadoPedido: formData.estadoPedido ?? OrderStatus.WAITING,
      porcentajes: {
        placa: 0,
        straps: 0,
        cases: 0,
        baterias: 0
      }
    });
    
    const response = await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? 'admin-key'
      },
      body: JSON.stringify(newTracking)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error ?? 'Error al crear el usuario');
    }
    
    return await response.json();
  }, [formData]);

  // Función auxiliar para editar usuario
  const updateUser = useCallback(async (): Promise<UserTracking> => {
    if (!initialData?.id) {
      throw new Error('ID de usuario requerido para edición');
    }

    const updatedTracking = {
      ...initialData,
      ...formData,
      fechaEntrega: formData.fechaEntrega,
      porcentajes: initialData.porcentajes || {
        placa: 0,
        straps: 0,
        cases: 0,
        baterias: 0
      }
    };
    
    const response = await fetch(`/api/tracking?id=${encodeURIComponent(initialData.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY ?? 'admin-key'
      },
      body: JSON.stringify(updatedTracking)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error ?? 'Error al actualizar el usuario');
    }
    
    return await response.json();
  }, [formData, initialData]);

  // Función para enviar el formulario
  const submitForm = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      const firstError = Object.values(validationErrors)[0];
      setError(firstError || 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const result = mode === 'create' ? await createUser() : await updateUser();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
      
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} user:`, err);
      const errorAction = mode === 'create' ? 'crear' : 'actualizar';
      const errorMessage = err instanceof Error ? err.message : `Error al ${errorAction} el usuario`;
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [validateForm, validationErrors, mode, createUser, updateUser, onSuccess]);

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        nombreUsuario: initialData.nombreUsuario,
        contacto: initialData.contacto,
        fechaEntrega: initialData.fechaEntrega || '',
        totalUsd: initialData.totalUsd || (initialData.total ? initialData.total / 1000 : 350),
        abonadoUsd: initialData.abonadoUsd || (initialData.abonado ? initialData.abonado / 1000 : 0),
        envioPagado: initialData.envioPagado || false,
        numeroTrackers: initialData.numeroTrackers || 5,
        sensor: (initialData.sensor as SensorTypes) || SensorTypes.LSM6DSR,
        magneto: initialData.sensor?.includes('+') || false,
        colorCase: (initialData.colorCase as Colors) || Colors.BLACK,
        colorTapa: (initialData.colorTapa as Colors) || Colors.BLACK,
        paisEnvio: initialData.paisEnvio || 'CL',
        estadoPedido: initialData.estadoPedido || OrderStatus.WAITING
      });
    } else {
      setFormData({
        nombreUsuario: '',
        contacto: '',
        fechaEntrega: '',
        totalUsd: 350,
        abonadoUsd: 0,
        envioPagado: false,
        numeroTrackers: 5,
        sensor: SensorTypes.LSM6DSR,
        magneto: false,
        colorCase: Colors.BLACK,
        colorTapa: Colors.BLACK,
        paisEnvio: 'CL',
        estadoPedido: OrderStatus.WAITING
      });
    }
    setError(null);
    setValidationErrors({});
  }, [mode, initialData]);

  // Función para obtener si hay errores globales
  const hasErrors = useCallback(() => {
    return Object.keys(validationErrors).length > 0 || !!error;
  }, [validationErrors, error]);

  // Función para obtener el progreso de validación
  const getValidationProgress = useCallback(() => {
    const requiredFields = ['nombreUsuario', 'contacto'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof UserFormData];
      return value && String(value).trim().length > 0;
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  return {
    // Estados
    formData,
    saving,
    error,
    validationErrors,
    
    // Funciones de actualización
    updateField,
    
    // Funciones de validación
    validateForm,
    hasErrors,
    getValidationProgress,
    
    // Funciones de acción
    submitForm,
    resetForm,
    
    // Utilidades
    router
  };
}
