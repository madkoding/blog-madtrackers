"use client";

import { UserTracking, OrderStatus, SensorTypes, Colors } from "../../interfaces/tracking";
import TrackingModelViewer from "./tracking/TrackingModelViewer";
import CurrencyDisplay from "./tracking/CurrencyDisplay";
import {
  ProgressSlider,
  InlineEdit,
  ColorSelector,
  StatusSelector,
  SensorSelector,
  CountrySelector,
  InfoCard
} from "./admin";

interface UserFormProps {
  // Datos del usuario (null para modo create, UserTracking para modo edit)
  userData?: UserTracking | null;
  
  // Estados externos que maneja el padre
  saving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  validationErrors?: Record<string, string>;
  
  // Callbacks
  onFieldUpdate: (field: string, value: string | number | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  
  // Configuración de modo
  mode?: 'create' | 'edit';
  
  // Textos personalizables
  title?: string;
  saveButtonText?: string;
  cancelButtonText?: string;
}

export default function UserForm({
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
  cancelButtonText
}: UserFormProps) {
  
  // Detectar automáticamente el modo si no se especifica
  const isEditMode = mode === 'edit' || userData !== null;
  const isCreateMode = mode === 'create' || userData === null;
  
  // Datos por defecto para modo create
  const defaultData: Partial<UserTracking> = {
    nombreUsuario: "",
    contacto: "",
    paisEnvio: "AR",
    fechaEntrega: new Date().toISOString(),
    numeroTrackers: 1,
    sensor: SensorTypes.LSM6DSR,
    colorCase: Colors.BLACK,
    colorTapa: Colors.BLACK,
    magneto: false,
    totalUsd: 0,
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
  
  // Usar los datos del usuario o los datos por defecto
  const formData = userData || defaultData;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (isCreateMode) {
      // Para modo create, devolver formato para input date
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } else {
      // Para modo edit, devolver formato legible
      const date = new Date(dateString);
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    }
  };

  const getTotalAmount = () => {
    return formData?.totalUsd ?? (formData?.total ? formData.total / 1000 : 0);
  };

  const getPaidAmount = () => {
    return formData?.abonadoUsd ?? (formData?.abonado ? formData.abonado / 1000 : 0);
  };

  const hasErrors = () => {
    return Object.keys(validationErrors).length > 0;
  };

  // Textos por defecto basados en el modo
  const defaultTitle = isEditMode 
    ? `🔧 Admin - ${formData?.nombreUsuario ?? 'Usuario'}`
    : "➕ Agregar Nuevo Usuario";
    
  const defaultSaveText = isEditMode ? "💾 Guardar Cambios" : "✅ Crear Usuario";
  const defaultCancelText = isEditMode ? "🔄 Recargar datos" : "← Volver al Admin";

  return (
    <div className="space-y-6">
      {/* Header con estado de guardado */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {title ?? defaultTitle}
          </h1>
          <div className="flex items-center gap-3">
            {saving && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">
                  {isCreateMode ? 'Creando...' : 'Guardando...'}
                </span>
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <span>✅</span>
                <span className="text-sm">
                  {isCreateMode ? 'Usuario creado' : 'Guardado'}
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
          </div>
        </div>
        
        {/* Selector de Estado del Pedido */}
        <StatusSelector 
          currentStatus={formData?.estadoPedido ?? OrderStatus.WAITING}
          onUpdate={onFieldUpdate}
        />
      </div>

      {/* Información Personal */}
      <InfoCard title="📋 Información Personal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre de Usuario:</label>
              <InlineEdit 
                value={formData?.nombreUsuario ?? ""} 
                field="nombreUsuario" 
                onUpdate={onFieldUpdate}
                error={validationErrors.nombreUsuario}
                placeholder="Ingrese el nombre del usuario"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Email de Contacto:</label>
              <InlineEdit 
                value={formData?.contacto ?? ""} 
                field="contacto" 
                type="email"
                onUpdate={onFieldUpdate}
                error={validationErrors.contacto}
                placeholder="usuario@ejemplo.com"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">País de Envío:</label>
              <CountrySelector
                selectedCountry={formData?.paisEnvio ?? "AR"}
                onUpdate={onFieldUpdate}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Fecha de Entrega:</label>
              {isCreateMode ? (
                <input
                  type="date"
                  value={formatDate(formData?.fechaEntrega ?? new Date().toISOString())}
                  onChange={(e) => onFieldUpdate('fechaEntrega', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
                />
              ) : (
                <InlineEdit 
                  value={formatDate(formData?.fechaEntrega ?? new Date().toISOString())} 
                  field="fechaEntrega" 
                  type="date"
                  onUpdate={onFieldUpdate}
                  placeholder="Seleccione una fecha"
                />
              )}
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Información de Pago */}
      <InfoCard title="💰 Información de Pago">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Total del Pedido (USD):</label>
              <InlineEdit 
                value={getTotalAmount()} 
                field="totalUsd" 
                type="number"
                onUpdate={onFieldUpdate}
                error={validationErrors.totalUsd}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Monto Abonado (USD):</label>
              <InlineEdit 
                value={getPaidAmount()} 
                field="abonadoUsd" 
                type="number"
                onUpdate={onFieldUpdate}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <CurrencyDisplay 
                usdAmount={getTotalAmount()} 
                paisEnvio={formData?.paisEnvio ?? "AR"} 
                label="Total del pedido"
              />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso de pago</span>
                <span>
                  {getTotalAmount() > 0 
                    ? Math.round((getPaidAmount() / getTotalAmount()) * 100) 
                    : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${
                      getTotalAmount() > 0 
                        ? Math.min((getPaidAmount() / getTotalAmount()) * 100, 100) 
                        : 0
                    }%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Detalles del Pedido */}
      <InfoCard title="📦 Detalles del Pedido">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Número de Trackers:</label>
              <InlineEdit 
                value={formData?.numeroTrackers ?? 1} 
                field="numeroTrackers" 
                type="number"
                onUpdate={onFieldUpdate}
                error={validationErrors.numeroTrackers}
                placeholder="1"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Sensor:</label>
              <SensorSelector 
                selectedSensor={formData?.sensor ?? SensorTypes.LSM6DSR}
                onUpdate={onFieldUpdate}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Color del Case:</label>
              <ColorSelector
                selectedColor={formData?.colorCase ?? Colors.BLACK}
                field="colorCase"
                onUpdate={onFieldUpdate}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Color de la Tapa:</label>
              <ColorSelector
                selectedColor={formData?.colorTapa ?? Colors.BLACK}
                field="colorTapa"
                onUpdate={onFieldUpdate}
              />
            </div>

            {/* Magnetómetro - solo en modo create */}
            {isCreateMode && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="magneto"
                  checked={formData?.magneto || false}
                  onChange={(e) => onFieldUpdate('magneto', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="magneto" className="text-sm font-medium text-gray-700">
                  Incluir magnetómetro (funcionalidad adicional)
                </label>
              </div>
            )}
          </div>

          {/* Vista Previa del Tracker */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs aspect-square">
              <TrackingModelViewer 
                caseColor={formData?.colorCase ?? Colors.BLACK} 
                coverColor={formData?.colorTapa ?? Colors.BLACK} 
              />
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">Vista previa del tracker</div>
              <div className="text-xs text-gray-500 mt-1">
                Los cambios de color se reflejan en tiempo real
              </div>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Progreso de Construcción - solo en modo edit */}
      {isEditMode && formData && (
        <InfoCard title="🔧 Progreso de Construcción">
          <div className="space-y-6">
            <ProgressSlider 
              label="Placas (PCB)" 
              percentage={formData.porcentajes?.placa ?? 0} 
              color="bg-blue-500" 
              field="porcentajes.placa"
              onUpdate={onFieldUpdate}
            />
            <ProgressSlider 
              label="Correas (Straps)" 
              percentage={formData.porcentajes?.straps ?? 0} 
              color="bg-green-500" 
              field="porcentajes.straps"
              onUpdate={onFieldUpdate}
            />
            <ProgressSlider 
              label="Carcasas (Cases)" 
              percentage={formData.porcentajes?.cases ?? 0} 
              color="bg-yellow-500" 
              field="porcentajes.cases"
              onUpdate={onFieldUpdate}
            />
            <ProgressSlider 
              label="Baterías" 
              percentage={formData.porcentajes?.baterias ?? 0} 
              color="bg-purple-500" 
              field="porcentajes.baterias"
              onUpdate={onFieldUpdate}
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {Math.round((
                    (formData.porcentajes?.placa ?? 0) + 
                    (formData.porcentajes?.straps ?? 0) + 
                    (formData.porcentajes?.cases ?? 0) + 
                    (formData.porcentajes?.baterias ?? 0)
                  ) / 4)}%
                </div>
                <div className="text-sm text-gray-600">Progreso Total</div>
              </div>
            </div>
          </div>
        </InfoCard>
      )}

      {/* Mensaje y Acciones */}
      <div className="mt-8 text-center">
        <div className={`rounded-lg p-6 ${
          isEditMode ? 'bg-yellow-50' : 'bg-blue-50'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${
            isEditMode ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            {isEditMode ? '🔒 Interfaz de Administración' : '➕ Creación de Nuevo Usuario'}
          </h3>
          <p className={`text-center mb-4 ${
            isEditMode ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            {isEditMode 
              ? 'Esta es la interfaz de administración. Todos los cambios se guardan automáticamente. Los usuarios solo pueden ver sus datos en modo lectura.'
              : 'Complete todos los campos requeridos para crear un nuevo usuario. El usuario podrá acceder a su seguimiento una vez creado.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isEditMode ? (
              <>
                <a
                  href={`/seguimiento/${formData?.nombreUsuario}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  👁️ Ver como usuario
                </a>
                <button
                  onClick={onCancel}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {cancelButtonText ?? defaultCancelText}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSave}
                  disabled={saving || hasErrors()}
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    saving || hasErrors()
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Creando Usuario...
                    </>
                  ) : (
                    saveButtonText ?? defaultSaveText
                  )}
                </button>
                <button
                  onClick={onCancel}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {cancelButtonText ?? defaultCancelText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
