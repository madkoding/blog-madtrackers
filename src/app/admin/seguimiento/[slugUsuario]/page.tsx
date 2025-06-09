"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { translations } from "@/app/i18n";
import { useLang } from "@/app/lang-context";
import { UserTracking, OrderStatus } from "@/interfaces/tracking";
import UserForm from "@/app/_components/UserForm";
import { isValidHash } from "@/utils/hashUtils";

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
      return { ...prev, [field]: value };
    });
    
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!tracking) return;

    setSaving(true);
    setSaveStatus('idle');
    setValidationErrors({});

    try {
      const response = await fetch('/api/tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'madtrackers_2025_secure_api_key_dev_only'
        },
        body: JSON.stringify(tracking)
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

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving tracking data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  }, [tracking]);

  const handleCancel = useCallback(() => {
    router.push('/admin');
  }, [router]);

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
          />
        </div>
      </div>
    </div>
  );
}
