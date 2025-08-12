import React, { useState } from "react";
import TermsCheckbox from "./terms-checkbox";

/**
 * Interface para los datos del usuario en el checkout
 */
export interface UserCheckoutData {
  email: string;
  direccion: string;
  ciudad: string;
  estado: string;
  pais: string;
  nombreUsuarioVrChat: string;
}

/**
 * Props para el componente UserCheckoutForm
 */
interface UserCheckoutFormProps {
  onUserDataChange: (data: UserCheckoutData) => void;
  initialData?: Partial<UserCheckoutData>;
  onValidationChange?: (isValid: boolean) => void;
  acceptedTerms?: boolean;
  onTermsChange?: (accepted: boolean) => void;
}

/**
 * Componente para capturar los datos del usuario antes del pago
 */
const UserCheckoutForm: React.FC<UserCheckoutFormProps> = React.memo(({ 
  onUserDataChange,
  initialData = {},
  onValidationChange,
  acceptedTerms = false,
  onTermsChange
}) => {
  const [userData, setUserData] = useState<UserCheckoutData>({
    email: initialData.email || "",
    direccion: initialData.direccion || "",
    ciudad: initialData.ciudad || "",
    estado: initialData.estado || "",
    pais: initialData.pais || "Chile",
    nombreUsuarioVrChat: initialData.nombreUsuarioVrChat || ""
  });

  const [errors, setErrors] = useState<Partial<UserCheckoutData>>({});
  const [focusedFields, setFocusedFields] = useState<{ [key: string]: boolean }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (field: keyof UserCheckoutData, value: string): string => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!validateEmail(value)) return 'Ingresa un email válido';
        return '';
      case 'direccion':
        if (!value.trim()) return 'La dirección es obligatoria';
        if (value.trim().length < 10) return 'Ingresa una dirección más específica';
        return '';
      case 'ciudad':
        if (!value.trim()) return 'La ciudad es obligatoria';
        return '';
      case 'estado':
        if (!value.trim()) return 'El estado/región es obligatorio';
        return '';
      case 'pais':
        if (!value.trim()) return 'Debes seleccionar un país';
        return '';
      case 'nombreUsuarioVrChat':
        // Campo opcional
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = (data: UserCheckoutData): boolean => {
    const requiredFields: (keyof UserCheckoutData)[] = ['email', 'direccion', 'ciudad', 'estado', 'pais'];
    return requiredFields.every(field => {
      const error = validateField(field, data[field]);
      return error === '';
    });
  };

  const handleFieldChange = (field: keyof UserCheckoutData, value: string) => {
    const newUserData = { ...userData, [field]: value };
    setUserData(newUserData);
    
    // Validar el campo específico
    const fieldError = validateField(field, value);
    const newErrors = { ...errors };
    
    if (fieldError) {
      newErrors[field] = fieldError;
    } else {
      delete newErrors[field];
    }
    
    setErrors(newErrors);

    // Notificar cambios al componente padre
    onUserDataChange(newUserData);
    if (onValidationChange) {
      const isValid = validateAllFields(newUserData);
      onValidationChange(isValid);
    }
  };

  const renderField = (
    field: keyof UserCheckoutData,
    label: string,
    placeholder: string,
    required: boolean = true,
    type: string = "text"
  ) => {
    const hasError = errors[field];
    const hasValue = userData[field] && userData[field].trim().length > 0;
    const isFocused = focusedFields[field] || false;
    const isLabelActive = hasValue || isFocused;
    
    const handleFocus = () => {
      setFocusedFields(prev => ({ ...prev, [field]: true }));
    };
    
    const handleBlur = () => {
      setFocusedFields(prev => ({ ...prev, [field]: false }));
    };
    
    return (
      <div className="field-container">
        <div className="form-field">
          <label 
            className={`field-label ${isLabelActive ? 'active' : ''} ${hasError ? 'error' : ''}`} 
            htmlFor={field}
          >
            {label} {required && <span className="required">*</span>}
          </label>
          {field === 'pais' ? (
            <select
              id={field}
              className={`field-input field-select ${hasError ? 'invalid' : ''}`}
              style={{
                flex: 1,
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '16px',
                background: 'white',
                outline: 'none'
              }}
              value={userData[field]}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required={required}
            >
              <option value="">Selecciona tu país</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Colombia">Colombia</option>
              <option value="España">España</option>
              <option value="México">México</option>
              <option value="Perú">Perú</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Otro">Otro</option>
            </select>
          ) : (
            <input
              id={field}
              type={type}
              className={`field-input ${hasError ? 'invalid' : ''}`}
              style={{
                flex: 1,
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '16px',
                background: 'white',
                outline: 'none'
              }}
              value={userData[field]}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              required={required}
            />
          )}
        </div>
        {hasError && (
          <div className="error-text">
            {hasError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="user-checkout-form">
      <style jsx>{`
        .user-checkout-form {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
        }
        
        .user-checkout-form::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #1976d2, #42a5f5);
        }
        
        .form-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #1976d2, #42a5f5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .form-subtitle {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 32px;
          line-height: 1.6;
          font-weight: 400;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .field-container.full-width {
            grid-column: 1 / -1;
          }
        }
        
        .field-container {
          margin-bottom: 28px;
        }
        
        .field-container.full-width {
          grid-column: 1 / -1;
        }
        
        .form-field {
          display: flex;
          flex-direction: row;
          align-items: center;
          position: relative;
          background: #fafafa;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 16px;
        }
        
        .form-field:hover {
          background: #f5f5f5;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .form-field:focus-within {
          background: white;
          box-shadow: 0 8px 24px rgba(25, 118, 210, 0.15);
          border-color: rgba(25, 118, 210, 0.3);
          transform: translateY(-2px);
        }
        
        .field-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 14px;
          position: static;
          transform: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          background: transparent;
          padding: 0;
          z-index: 1;
          white-space: nowrap;
          min-width: 140px;
          text-align: left;
        }
        
        .field-label.active {
          color: #1976d2;
          font-weight: 600;
        }
        
        .form-field:focus-within .field-label {
          color: #1976d2;
        }
        
        .field-label.error {
          color: #dc2626;
        }
        
        .required {
          color: #dc2626;
          margin-left: 2px;
        }
        
        .field-input, .field-select {
          flex: 1 !important;
          width: 100% !important;
          padding: 12px 16px !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 16px !important;
          font-size: 16px !important;
          font-weight: 400 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          background: white !important;
          color: #374151 !important;
          outline: none !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        
        .field-input:hover, .field-select:hover {
          border-color: #d1d5db !important;
          background: #fefefe !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
        }
        
        .field-input:focus, .field-select:focus {
          border-color: #1976d2 !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05) !important;
        }
        
        .field-input.invalid, .field-select.invalid {
          border-color: #dc2626 !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        
        .field-input.invalid:focus, .field-select.invalid:focus {
          border-color: #dc2626 !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15), 0 4px 6px rgba(0, 0, 0, 0.05) !important;
        }
        
        .field-select {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 20px center;
          background-size: 20px;
          padding-right: 56px;
          appearance: none;
          cursor: pointer;
        }
        
        .field-select:focus {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231976d2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        }
        
        .error-text {
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
          margin-left: 0;
          background: #fef2f2;
          padding: 6px 12px;
          border-radius: 6px;
          border-left: 3px solid #dc2626;
        }
        
        .helper-text {
          color: #6b7280;
          font-size: 13px;
          margin-top: 8px;
          margin-left: 0;
          font-weight: 400;
          line-height: 1.4;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        }
        
        .info-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-top: 32px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        
        .info-title {
          font-weight: 600;
          color: #1e40af;
          font-size: 15px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .info-title::before {
          content: '🔒';
          margin-right: 8px;
          font-size: 16px;
        }
        
        .info-text {
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 400;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .field-container {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .field-container:nth-child(1) { animation-delay: 0.1s; }
        .field-container:nth-child(2) { animation-delay: 0.15s; }
        .field-container:nth-child(3) { animation-delay: 0.2s; }
        .field-container:nth-child(4) { animation-delay: 0.25s; }
        .field-container:nth-child(5) { animation-delay: 0.3s; }
        .field-container:nth-child(6) { animation-delay: 0.35s; }
        
        @media (max-width: 767px) {
          .user-checkout-form {
            padding: 24px 20px;
            margin: 0 -8px 24px -8px;
            border-radius: 16px 16px 0 0;
            box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.12);
          }
          
          .form-title {
            font-size: 24px;
          }
          
          .form-subtitle {
            font-size: 15px;
          }
          
          .field-input, .field-select {
            padding: 18px;
            font-size: 16px;
          }
          
          .field-container {
            margin-bottom: 24px;
          }
          
          .form-field {
            padding: 6px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .field-label {
            text-align: left;
            min-width: auto;
            position: static;
            font-size: 13px;
            margin-bottom: 4px;
          }
        }
      `}</style>
      
      <h3 className="form-title">
        📦 Datos de Envío y Contacto
      </h3>
      <p className="form-subtitle">
        Completa tu información para procesar el pago y recibir tus trackers. 
        <br />
        <strong>Todos los campos son seguros y encriptados.</strong>
      </p>
      
      {onTermsChange && (
        <TermsCheckbox 
          acceptedTerms={acceptedTerms}
          onTermsChange={onTermsChange}
        />
      )}
      
      <div className="form-grid">
        <div className="field-container full-width">
          {renderField('email', 'Email', 'ejemplo@correo.com', true, 'email')}
          <div className="helper-text">
            Te enviaremos confirmación del pago y seguimiento del pedido
          </div>
        </div>
        
        <div className="field-container full-width">
          {renderField('direccion', 'Dirección completa', 'Calle 123, Depto 4B, Barrio Centro', true)}
          <div className="helper-text">
            Incluye calle, número, departamento/casa y referencias
          </div>
        </div>
        
        <div className="field-container">
          {renderField('ciudad', 'Ciudad', 'Santiago', true)}
        </div>
        <div className="field-container">
          {renderField('estado', 'Estado/Región', 'Región Metropolitana', true)}
        </div>
        
        <div className="field-container full-width">
          {renderField('pais', 'País de envío', '', true)}
          <div className="helper-text">
            Selecciona tu país para calcular costos de envío
          </div>
        </div>
        
        <div className="field-container full-width">
          {renderField('nombreUsuarioVrChat', 'Usuario VRChat', 'MiUsuarioVR', false)}
          <div className="helper-text">
            Te contactaremos en VRChat para asesorarte en calibración y configuración
          </div>
        </div>
      </div>
      
      <div className="info-box">
        <div className="info-title">Información Segura</div>
        <div className="info-text">
          Tus datos están protegidos con encriptación SSL y solo se utilizan para procesar tu pedido. 
          No compartimos tu información personal con terceros bajo ninguna circunstancia.
        </div>
      </div>
    </div>
  );
});

UserCheckoutForm.displayName = 'UserCheckoutForm';

export default UserCheckoutForm;
