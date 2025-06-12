"use client";

import React from "react";
import { UserTracking, OrderStatus, SensorTypes, Colors } from "../../../interfaces/tracking";
import { Card } from "../../molecules";
import { Button, Input, Label } from "../../atoms";
import { cn } from "../../../utils/cn";

// Type alias para union type (requerido por SonarLint)
type FieldValue = string | number | boolean;

// Interfaz para las props del componente UserForm
interface UserFormProps {
  readonly userData?: UserTracking | null;
  readonly saving: boolean;
  readonly saveStatus: 'idle' | 'success' | 'error';
  readonly validationErrors?: Record<string, string>;
  readonly onFieldUpdate: (field: string, value: FieldValue) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly mode?: 'create' | 'edit';
  readonly title?: string;
  readonly saveButtonText?: string;
  readonly cancelButtonText?: string;
  readonly hasUnsavedChanges?: boolean;
  readonly autoSaveCountdown?: number | null;
}

// Componente de estado de guardado
const SaveStatusIndicator = ({ 
  saving, 
  saveStatus, 
  isCreateMode, 
  hasUnsavedChanges, 
  autoSaveCountdown 
}: {
  saving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  isCreateMode: boolean;
  hasUnsavedChanges?: boolean;
  autoSaveCountdown?: number | null;
}) => (
  <div className="flex items-center gap-3">
    {saving && (
      <div className="flex items-center gap-2 text-blue-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm">
          {isCreateMode ? 'Creando...' : 'Guardando automáticamente...'}
        </span>
      </div>
    )}
    {saveStatus === 'success' && (
      <div className="flex items-center gap-2 text-green-600">
        <span>✅</span>
        <span className="text-sm">
          {isCreateMode ? 'Usuario creado' : 'Guardado automáticamente'}
        </span>
      </div>
    )}
    {saveStatus === 'error' && (
      <div className="flex items-center gap-2 text-red-600">
        <span>❌</span>
        <span className="text-sm">
          {isCreateMode ? 'Error al crear' : 'Error al guardar'}
        </span>
      </div>
    )}
    {!saving && saveStatus === 'idle' && !isCreateMode && (
      <div className="flex items-center gap-2 text-gray-600">
        <span>💾</span>
        <span className="text-sm">
          {(() => {
            if (autoSaveCountdown) {return `Guardando en ${autoSaveCountdown}s...`;}
            if (hasUnsavedChanges) {return 'Cambios pendientes...';}
            return 'Auto-guardado activo';
          })()}
        </span>
      </div>
    )}
  </div>
);

export const UserForm = React.memo<UserFormProps>(({ 
  userData = null,
  saving,
  saveStatus,
  validationErrors = {},
  onFieldUpdate,
  onSave,
  onCancel,
  mode = userData ? 'edit' : 'create',
  title,
  saveButtonText,
  cancelButtonText,
  hasUnsavedChanges = false,
  autoSaveCountdown = null
}) => {
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';
  
  const formData = userData || {
    nombreUsuario: "",
    contacto: "",
    paisEnvio: "AR",
    fechaEntrega: new Date().toISOString(),
    numeroTrackers: 1,
    sensor: SensorTypes.LSM6DSR,
    colorCase: Colors.BLACK,
    colorTapa: Colors.BLACK,
    magneto: false,
    totalUsd: 350,
    abonadoUsd: 0,
    envioPagado: false,
    estadoPedido: OrderStatus.WAITING,
    porcentajes: {
      placa: 0,
      straps: 0,
      cases: 0,
      baterias: 0
    }
  };

  const getTotalAmount = () => {
    return formData?.totalUsd ?? (formData?.total ? formData.total / 1000 : 0);
  };

  const hasErrors = () => {
    return Object.keys(validationErrors).length > 0;
  };

  const defaultTitle = isEditMode 
    ? `🔧 Admin - ${formData?.nombreUsuario ?? 'Usuario'}`
    : "➕ Agregar Nuevo Usuario";
    
  const defaultSaveText = isEditMode ? "💾 Guardar Cambios" : "✅ Crear Usuario";
  const defaultCancelText = isEditMode ? "🔄 Recargar datos" : "← Volver al Admin";

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {title ?? defaultTitle}
          </h1>
          <SaveStatusIndicator 
            saving={saving} 
            saveStatus={saveStatus} 
            isCreateMode={isCreateMode}
            hasUnsavedChanges={hasUnsavedChanges}
            autoSaveCountdown={autoSaveCountdown}
          />
        </div>
      </div>

      {/* Información Personal */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          📋 Información Personal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombreUsuario">Nombre de Usuario:</Label>
              <Input
                id="nombreUsuario"
                value={formData?.nombreUsuario ?? ""} 
                onChange={(e) => onFieldUpdate('nombreUsuario', e.target.value)}
                error={validationErrors.nombreUsuario}
                placeholder="Ingrese el nombre del usuario"
              />
            </div>
            <div>
              <Label htmlFor="contacto">Email de Contacto:</Label>
              <Input
                id="contacto"
                type="email"
                value={formData?.contacto ?? ""} 
                onChange={(e) => onFieldUpdate('contacto', e.target.value)}
                error={validationErrors.contacto}
                placeholder="usuario@ejemplo.com"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Información de Pago */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          💰 Información de Pago
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="totalUsd">Total del Pedido (USD):</Label>
              <Input
                id="totalUsd"
                type="number"
                value={getTotalAmount()} 
                onChange={(e) => onFieldUpdate('totalUsd', Number(e.target.value))}
                error={validationErrors.totalUsd}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="abonadoUsd">Monto Abonado (USD):</Label>
              <Input
                id="abonadoUsd"
                type="number"
                value={formData?.abonadoUsd ?? 0} 
                onChange={(e) => onFieldUpdate('abonadoUsd', Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Botones de Acción */}
      <div className="mt-8 text-center">
        <div className={cn(
          "rounded-lg p-6",
          isEditMode ? 'bg-yellow-50' : 'bg-blue-50'
        )}>
          <h3 className={cn(
            "text-lg font-semibold mb-2",
            isEditMode ? 'text-yellow-800' : 'text-blue-800'
          )}>
            {isEditMode ? '🔒 Interfaz de Administración' : '➕ Creación de Nuevo Usuario'}
          </h3>
          <p className={cn(
            "text-center mb-4",
            isEditMode ? 'text-yellow-700' : 'text-blue-700'
          )}>
            {isEditMode 
              ? 'Esta es la interfaz de administración. Todos los cambios se guardan automáticamente. Los usuarios solo pueden ver sus datos en modo lectura.'
              : 'Complete todos los campos requeridos para crear un nuevo usuario. El usuario podrá acceder a su seguimiento una vez creado.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isEditMode ? (
              <>
                <a
                  href={`/seguimiento/${formData?.userHash || formData?.nombreUsuario}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  👁️ Ver como usuario
                </a>
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  {cancelButtonText ?? defaultCancelText}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={onSave}
                  disabled={saving || hasErrors()}
                  variant={saving || hasErrors() ? "outline" : "default"}
                >
                  {saving ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      <span>Creando Usuario...</span>
                    </>
                  ) : (
                    saveButtonText ?? defaultSaveText
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  {cancelButtonText ?? defaultCancelText}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

UserForm.displayName = "UserForm";

export default UserForm;
