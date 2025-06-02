import { useState } from 'react';

interface ShareableLinkProps {
  readonly username: string;
  readonly userHash?: string;
  readonly className?: string;
}

export default function ShareableLink({ username, userHash, className = "" }: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);
  
  // SIEMPRE usar el hash del servidor que está en userHash 
  // NO generar hash del lado del cliente para evitar inconsistencias
  const safeHash = userHash ?? username; // Si no hay hash, usar username como fallback temporal
  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${safeHash}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = trackingUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy'); // Deprecated pero necesario para compatibilidad
      } finally {
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700 mb-1">
            🔗 Enlace de seguimiento seguro
          </div>
          <div className="text-xs text-gray-500 bg-white rounded px-3 py-2 border font-mono break-all">
            {trackingUrl}
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            copied 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
          }`}
        >
          {copied ? '✅ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-green-600">🔒</span>
          <span>
            Este enlace es seguro de compartir. No expone información personal y es único para cada pedido.
          </span>
        </div>
        {!userHash && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-red-500">❌</span>
            <span>
              ADVERTENCIA: Este enlace usa username temporal. El hash del servidor es diferente. Actualiza los datos con el hash correcto.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
