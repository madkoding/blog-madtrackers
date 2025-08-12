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

// Componentes auxiliares para reducir complejidad cognitiva
const SaveStatusIndicator = ({ saving, saveStatus, isCreateMode, hasUnsavedChanges, autoSaveCountdown }: {
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
            if (autoSaveCountdown) return `Guardando en ${autoSaveCountdown}s...`;
            if (hasUnsavedChanges) return 'Cambios pendientes...';
            return 'Auto-guardado activo';
          })()}
        </span>
      </div>
    )}
  </div>
);

const PersonalInfoSection = ({ 
  formData, 
  validationErrors, 
  onFieldUpdate, 
  isCreateMode 
}: {
  formData: Partial<UserTracking>;
  validationErrors: Record<string, string>;
  onFieldUpdate: (field: string, value: FieldValue) => void;
  isCreateMode: boolean;
}) => (
  <InfoCard title="📋 Información Personal">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="nombreUsuario" className="text-sm font-medium text-gray-700">Nombre de Usuario:</label>
          <InlineEdit 
            id="nombreUsuario"
            value={formData?.nombreUsuario ?? ""} 
            field="nombreUsuario" 
            onUpdate={onFieldUpdate}
            error={validationErrors.nombreUsuario}
            placeholder="Ingrese el nombre del usuario"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="contacto" className="text-sm font-medium text-gray-700">Email de Contacto:</label>
          <InlineEdit 
            id="contacto"
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
          <label htmlFor="paisEnvio" className="text-sm font-medium text-gray-700">País de Envío:</label>
          <CountrySelector
            id="paisEnvio"
            selectedCountry={formData?.paisEnvio ?? "AR"}
            onUpdate={onFieldUpdate}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="fechaEntrega" className="text-sm font-medium text-gray-700">Fecha de Entrega:</label>
          {isCreateMode ? (
            <input
              id="fechaEntrega"
              type="date"
              value={formatDate(formData?.fechaEntrega ?? new Date().toISOString(), isCreateMode)}
              onChange={(e) => {
                const dateValue = e.target.value;
                if (dateValue) {
                  const date = new Date(dateValue + 'T12:00:00.000Z');
                  onFieldUpdate('fechaEntrega', date.toISOString());
                } else {
                  onFieldUpdate('fechaEntrega', '');
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm"
            />
          ) : (
            <InlineEdit 
              value={formatDate(formData?.fechaEntrega ?? new Date().toISOString(), isCreateMode)} 
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
);

const PaymentInfoSection = ({ 
  formData, 
  validationErrors, 
  onFieldUpdate, 
  getTotalAmount, 
  getPaidAmount 
}: {
  formData: Partial<UserTracking>;
  validationErrors: Record<string, string>;
  onFieldUpdate: (field: string, value: FieldValue) => void;
  getTotalAmount: () => number;
  getPaidAmount: () => number;
}) => (
  <InfoCard title="💰 Información de Pago">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="totalUsd" className="text-sm font-medium text-gray-700">Total del Pedido (USD):</label>
          <InlineEdit 
            id="totalUsd"
            value={getTotalAmount()} 
            field="totalUsd" 
            type="number"
            onUpdate={onFieldUpdate}
            error={validationErrors.totalUsd}
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="abonadoUsd" className="text-sm font-medium text-gray-700">Monto Abonado (USD):</label>
          <InlineEdit 
            id="abonadoUsd"
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
);

const OrderDetailsSection = ({ 
  formData, 
  validationErrors, 
  onFieldUpdate, 
  isCreateMode 
}: {
  formData: Partial<UserTracking>;
  validationErrors: Record<string, string>;
  onFieldUpdate: (field: string, value: FieldValue) => void;
  isCreateMode: boolean;
}) => (
  <InfoCard title="📦 Detalles del Pedido">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <label htmlFor="numeroTrackers" className="text-sm font-medium text-gray-700">Número de Trackers:</label>
          <InlineEdit 
            id="numeroTrackers"
            value={formData?.numeroTrackers ?? 1} 
            field="numeroTrackers" 
            type="number"
            onUpdate={onFieldUpdate}
            error={validationErrors.numeroTrackers}
            placeholder="1"
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <label htmlFor="sensor" className="text-sm font-medium text-gray-700">Tipo de Sensor:</label>
          <SensorSelector 
            id="sensor"
            selectedSensor={formData?.sensor ?? SensorTypes.ICM45686_QMC}
            onUpdate={onFieldUpdate}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="colorCase" className="text-sm font-medium text-gray-700">Color del Case:</label>
          <ColorSelector
            id="colorCase"
            selectedColor={formData?.colorCase ?? Colors.BLACK}
            field="colorCase"
            onUpdate={onFieldUpdate}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="colorTapa" className="text-sm font-medium text-gray-700">Color de la Tapa:</label>
          <ColorSelector
            id="colorTapa"
            selectedColor={formData?.colorTapa ?? Colors.BLACK}
            field="colorTapa"
            onUpdate={onFieldUpdate}
          />
        </div>

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
);

const ConstructionProgressSection = ({ 
  formData, 
  onFieldUpdate 
}: {
  formData: Partial<UserTracking>;
  onFieldUpdate: (field: string, value: FieldValue) => void;
}) => (
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
);

const ActionButtons = ({ 
  isEditMode, 
  formData, 
  saving, 
  hasErrors, 
  onSave, 
  onCancel, 
  saveButtonText, 
  cancelButtonText, 
  defaultSaveText, 
  defaultCancelText 
}: {
  isEditMode: boolean;
  formData: Partial<UserTracking>;
  saving: boolean;
  hasErrors: () => boolean;
  onSave: () => void;
  onCancel: () => void;
  saveButtonText?: string;
  cancelButtonText?: string;
  defaultSaveText: string;
  defaultCancelText: string;
}) => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    {isEditMode ? (
      <>
        <a
          href={`/seguimiento/${formData?.userHash || formData?.nombreUsuario}`}
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
              <span>Creando Usuario...</span>
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
);

// Funciones auxiliares para reducir complejidad cognitiva
const formatDate = (dateString: string, isCreateMode: boolean) => {
  if (!dateString) return '';
  
  if (isCreateMode) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } else {
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

const getDefaultUserData = (): Partial<UserTracking> => ({
  nombreUsuario: "",
  contacto: "",
  paisEnvio: "AR",
  fechaEntrega: new Date().toISOString(),
  numeroTrackers: 1,
  sensor: SensorTypes.ICM45686_QMC,
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
});

const getDisplayTexts = (isEditMode: boolean, userName?: string) => {
  const defaultTitle = isEditMode 
    ? `🔧 Admin - ${userName ?? 'Usuario'}`
    : "➕ Agregar Nuevo Usuario";
    
  const defaultSaveText = isEditMode ? "💾 Guardar Cambios" : "✅ Crear Usuario";
  const defaultCancelText = isEditMode ? "🔄 Recargar datos" : "← Volver al Admin";

  return { defaultTitle, defaultSaveText, defaultCancelText };
};

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
  cancelButtonText,
  hasUnsavedChanges = false,
  autoSaveCountdown = null
}: UserFormProps) {
  
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';
  
  const formData = userData || getDefaultUserData();
  
  const getTotalAmount = () => {
    return formData?.totalUsd ?? (formData?.total ? formData.total / 1000 : 0);
  };

  const getPaidAmount = () => {
    return formData?.abonadoUsd ?? (formData?.abonado ? formData.abonado / 1000 : 0);
  };

  const hasErrors = () => {
    return Object.keys(validationErrors).length > 0;
  };

  const { defaultTitle, defaultSaveText, defaultCancelText } = getDisplayTexts(isEditMode, formData?.nombreUsuario);

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
        <StatusSelector 
          currentStatus={formData?.estadoPedido ?? OrderStatus.WAITING}
          onUpdate={onFieldUpdate}
        />
      </div>

      <PersonalInfoSection 
        formData={formData} 
        validationErrors={validationErrors} 
        onFieldUpdate={onFieldUpdate} 
        isCreateMode={isCreateMode} 
      />

      <PaymentInfoSection 
        formData={formData} 
        validationErrors={validationErrors} 
        onFieldUpdate={onFieldUpdate} 
        getTotalAmount={getTotalAmount} 
        getPaidAmount={getPaidAmount} 
      />

      <OrderDetailsSection 
        formData={formData} 
        validationErrors={validationErrors} 
        onFieldUpdate={onFieldUpdate} 
        isCreateMode={isCreateMode} 
      />

      {isEditMode && formData && (
        <ConstructionProgressSection 
          formData={formData} 
          onFieldUpdate={onFieldUpdate} 
        />
      )}

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
          <ActionButtons 
            isEditMode={isEditMode} 
            formData={formData} 
            saving={saving} 
            hasErrors={hasErrors} 
            onSave={onSave} 
            onCancel={onCancel} 
            saveButtonText={saveButtonText} 
            cancelButtonText={cancelButtonText} 
            defaultSaveText={defaultSaveText} 
            defaultCancelText={defaultCancelText} 
          />
        </div>
      </div>
    </div>
  );
}
