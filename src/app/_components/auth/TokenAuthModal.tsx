"use client";
import { useState } from 'react';

interface TokenAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (jwtToken: string) => void;
  username: string;
  type: 'user' | 'admin';
  title: string;
}

export default function TokenAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  username, 
  type, 
  title 
}: Readonly<TokenAuthModalProps>) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestToken = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, type }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setStep('verify');
        
        // En modo desarrollo, si viene el token en la respuesta, auto-completarlo
        if (data.token && process.env.NODE_ENV === 'development') {
          setToken(data.token);
        }
      } else {
        setError(data.message ?? 'Error al enviar código');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    if (!token || token.length !== 6) {
      setError('Ingresa un código de 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token.toUpperCase(), username, type }),
      });

      const data = await response.json();

      if (data.valid && data.jwt) {
        // Guardar JWT en localStorage
        localStorage.setItem('madtrackers_jwt', data.jwt);
        onSuccess(data.jwt);
        handleClose();
      } else {
        setError(data.message ?? 'Código inválido');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setToken('');
    setMessage('');
    setError('');
    onClose();
  };

  const handleTokenChange = (value: string) => {
    // Solo permitir letras y números, máximo 6 caracteres
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase();
    setToken(cleanValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {type === 'admin' ? '🔧' : '🔐'} {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {step === 'request' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {type === 'admin' 
                ? `Para acceder al panel administrativo de ${username}, se enviará un código de verificación al administrador.`
                : `Para acceder a tu seguimiento, recibirás un código de verificación en tu email registrado.`
              }
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">
                  {type === 'admin' ? '👨‍💼' : '📧'}
                </span>
                <div>
                  <p className="font-medium text-blue-800">
                    {type === 'admin' ? 'Admin' : 'Usuario'}: {username}
                  </p>
                  <p className="text-sm text-blue-600">
                    {type === 'admin' 
                      ? 'Código enviado al administrador'
                      : 'Código enviado a tu email registrado'
                    }
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={requestToken}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700">{message}</p>
              </div>
            )}

            <div>
              <label htmlFor="tokenInput" className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificación (6 caracteres)
              </label>
              <input
                id="tokenInput"
                type="text"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="Ej: ABC123"
                className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-wider uppercase bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('request')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
              <button
                onClick={verifyToken}
                disabled={loading || token.length !== 6}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
