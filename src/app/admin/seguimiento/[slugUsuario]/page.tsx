"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { translations } from "@/app/i18n";
import { useLang } from "@/app/lang-context";
import { UserTracking, OrderStatus } from "@/interfaces/tracking";
import UserForm from "@/app/_components/UserForm";
import { isValidHash, generateUserHashClient } from "@/utils/hashUtils";

export default function AdminTrackingPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const params = useParams();
  const router = useRouter();
  const slugUsuario = params?.slugUsuario as string;
  
  const [tracking, setTracking] = useState<UserTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number | null>(null);
  
  // Ref para el timeout del debounce
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<UserTracking | null>(null);

  const loadTrackingData = useCallback(async (hash: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tracking?hash=${encodeURIComponent(hash)}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'madtrackers_2025_secure_api_key_dev_only'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t.trackingNotFound);
        } else if (response.status === 400) {
          throw new Error('Formato de hash inválido');
        } else {
          throw new Error(t.trackingError);
        }
      }

      const responseData = await response.json();
      const data: UserTracking = Array.isArray(responseData) ? responseData[0] : responseData;

      if (data) {
        if (!data.estadoPedido) {
          data.estadoPedido = OrderStatus.WAITING;
        }
        if (!data.porcentajes) {
          data.porcentajes = {
            placa: 0,
            straps: 0,
            cases: 0,
            baterias: 0
          };
        }
        setTracking(data);
        lastSavedDataRef.current = data;
      } else {
        throw new Error(t.trackingNotFound);
      }
    } catch (err) {
      console.error('Error loading tracking data:', err);
      setError(err instanceof Error ? err.message : t.trackingError);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (slugUsuario) {
      if (!isValidHash(slugUsuario)) {
        setError('Formato de hash inválido');
        setLoading(false);
        return;
      }
      loadTrackingData(slugUsuario);
    }
  }, [slugUsuario, loadTrackingData]);

  const handleFieldUpdate = useCallback((field: string, value: unknown) => {
    setTracking(prev => {
      if (!prev) return null;
      
      // Manejar campos anidados como porcentajes.placa
      if (field.includes('.')) {
        const [parentKey, childKey] = field.split('.');
        const parentValue = prev[parentKey as keyof UserTracking];
        
        return {
          ...prev,
          [parentKey]: {
            ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
            [childKey]: value
          }
        };
      }
      
      return { ...prev, [field]: value };
    });
    
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    setHasUnsavedChanges(true);
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!tracking || !tracking.id) {
      console.error('No tracking data or ID available for update');
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    setSaveStatus('idle');
    setValidationErrors({});

    try {
      // Actualizar el userHash si se cambió el nombre de usuario
      const updatedTracking = { ...tracking };
      if (tracking.nombreUsuario && (!tracking.userHash || tracking.userHash !== generateUserHashClient(tracking.nombreUsuario))) {
        updatedTracking.userHash = generateUserHashClient(tracking.nombreUsuario);
      }

      const response = await fetch(`/api/tracking?id=${encodeURIComponent(tracking.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'madtrackers_2025_secure_api_key_dev_only'
        },
        body: JSON.stringify(updatedTracking)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.validationErrors) {
          setValidationErrors(errorData.validationErrors);
          setSaveStatus('error');
          return;
        }
        throw new Error(errorData.error || 'Error al guardar los datos');
      }

      const updatedData = await response.json();
      setTracking(updatedData); // Actualizar con los datos del servidor
      
      // Si el hash del usuario cambió, actualizar la URL
      if (updatedData.userHash && updatedData.userHash !== slugUsuario) {
        // Reemplazar la URL actual en el historial sin recargar la página
        window.history.replaceState(null, '', `/admin/seguimiento/${updatedData.userHash}`);
      }
      
      setSaveStatus('success');
      setHasUnsavedChanges(false);
      lastSavedDataRef.current = updatedData;
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving tracking data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  }, [tracking, slugUsuario]);

  const handleCancel = useCallback(() => {
    router.push('/admin');
  }, [router]);

  // Auto-guardado con debounce y contador
  useEffect(() => {
    if (hasUnsavedChanges && tracking) {
      // Limpiar timeouts anteriores
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      // Iniciar contador de 2 segundos
      setAutoSaveCountdown(2);
      
      // Actualizar contador cada segundo
      countdownIntervalRef.current = setInterval(() => {
        setAutoSaveCountdown(prev => {
          if (prev === null || prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // Guardar después de 2 segundos
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSaveUser();
        setAutoSaveCountdown(null);
      }, 2000);
    } else {
      setAutoSaveCountdown(null);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [hasUnsavedChanges, handleSaveUser, tracking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-red-600 text-lg font-semibold mb-4">
                  {error}
                </div>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Volver al Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <UserForm
            userData={tracking}
            saving={saving}
            saveStatus={saveStatus}
            validationErrors={validationErrors}
            onFieldUpdate={handleFieldUpdate}
            onSave={handleSaveUser}
            onCancel={handleCancel}
            mode="edit"
            hasUnsavedChanges={hasUnsavedChanges}
            autoSaveCountdown={autoSaveCountdown}
          />
        </div>
      </div>
    </div>
  );
}
