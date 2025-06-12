"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import { TokenAuthModal } from "../../../components/molecules";
import { UserTracking, OrderStatus, SensorTypes, Colors } from "../../../interfaces/tracking";
import UserForm from "../../_components/UserForm";

// Datos iniciales para nuevo usuario
const initialUserData: Partial<UserTracking> = {
  nombreUsuario: "",
  contacto: "",
  paisEnvio: "AR",
  fechaEntrega: new Date().toISOString(),
  numeroTrackers: 1,
  sensor: SensorTypes.LSM6DSR,
  colorCase: Colors.BLACK,
  colorTapa: Colors.BLACK,
  magneto: false,
  totalUsd: 350, // Valor por defecto razonable
  abonadoUsd: 0,
  envioPagado: false,
  estadoPedido: OrderStatus.WAITING,
};

export default function AddUserPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, showAuthModal, handleAuthSuccess } = useAdminAuth();
  
  const [formData, setFormData] = useState<Partial<UserTracking>>(initialUserData);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validaciones
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombreUsuario || formData.nombreUsuario.trim() === '') {
      errors.nombreUsuario = 'El nombre de usuario es requerido';
    }
    
    if (!formData.contacto || formData.contacto.trim() === '') {
      errors.contacto = 'El email de contacto es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.contacto)) {
      errors.contacto = 'El formato del email no es válido';
    }
    
    if (!formData.numeroTrackers || formData.numeroTrackers < 1) {
      errors.numeroTrackers = 'Debe especificar al menos 1 tracker';
    }
    
    if (!formData.totalUsd || formData.totalUsd <= 0) {
      errors.totalUsd = 'El total en USD debe ser mayor a 0';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldUpdate = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error de validación cuando se corrige el campo
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    try {
      setSaving(true);
      setSaveStatus('idle');

      console.log("Debug: Creando nuevo usuario:", formData);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? 'madtrackers_2025_secure_api_key_dev_only'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }

      const responseData = await response.json();
      console.log("Debug: Usuario creado exitosamente:", responseData);

      setSaveStatus('success');
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err) {
      console.error('Error creating user:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };



  // Mostrar carga inicial de autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar modal de autenticación si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 text-2xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Acceso Requerido
                </h2>
                <p className="text-gray-600">
                  Se requiere autenticación para agregar nuevos usuarios.
                </p>
              </div>
            </div>
          </div>
        </div>

        <TokenAuthModal
          isOpen={showAuthModal}
          onClose={() => router.push('/admin')}
          onSuccess={handleAuthSuccess}
          username="Administrador"
          type="admin"
          title="Acceso Administrativo"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <UserForm
            userData={formData as UserTracking}
            saving={saving}
            saveStatus={saveStatus}
            validationErrors={validationErrors}
            onFieldUpdate={handleFieldUpdate}
            onSave={handleCreateUser}
            onCancel={() => router.push('/admin')}
            mode="create"
          />
        </div>
      </div>
    </div>
  );
}
