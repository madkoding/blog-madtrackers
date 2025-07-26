import React, { useState } from "react";

/**
 * Props para el componente EmailInput.
 */
export interface EmailInputProps {
  /** Callback cuando el email cambia */
  readonly onEmailChange: (email: string) => void;
  /** Email inicial */
  readonly initialEmail?: string;
  /** Placeholder del input */
  readonly placeholder?: string;
}

/**
 * Componente para capturar el email del usuario para Flow
 */
const EmailInput: React.FC<EmailInputProps> = React.memo(({ 
  onEmailChange,
  initialEmail = "",
  placeholder = "tu-email@ejemplo.com"
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [isValid, setIsValid] = useState(true);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    const valid = newEmail === "" || validateEmail(newEmail);
    setIsValid(valid);
    
    if (valid) {
      onEmailChange(newEmail);
    }
  };

  return (
    <div className="email-input-container">
      <style jsx>{`
        .email-input-container {
          margin-bottom: 16px;
        }
        
        .email-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }
        
        .email-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e7ff;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }
        
        .email-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .email-input.invalid {
          border-color: #dc3545;
        }
        
        .email-input.invalid:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }
        
        .error-text {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .helper-text {
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
      
      <label className="email-label" htmlFor="flow-email">
        Ingresa tu email *
      </label>
      <input
        id="flow-email"
        type="email"
        className={`email-input ${!isValid ? 'invalid' : ''}`}
        value={email}
        onChange={handleEmailChange}
        placeholder={placeholder}
        required
      />
      {!isValid && email !== "" && (
        <div className="error-text">
          Por favor ingresa un email válido
        </div>
      )}
      {isValid && email === "" && (
        <div className="helper-text">
          Necesitamos tu email para enviarte la confirmación del pago y la pagina de seguimiento del pedido
        </div>
      )}
    </div>
  );
});

EmailInput.displayName = 'EmailInput';

export default EmailInput;
