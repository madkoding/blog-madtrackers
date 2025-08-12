"use client";

import React, { useEffect } from "react";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  message: string;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  setEmail: (email: string) => void;
  setMessage: (message: string) => void;
  onSubmit: () => Promise<void>;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  email,
  message,
  isSubmitting,
  submitStatus,
  setEmail,
  setMessage,
  onSubmit,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            {t.contactFormTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Cerrar modal"
            title="Cerrar modal (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-gray-700">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6 text-center">
            {t.contactFormDesc}
          </p>
          
          <form 
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await onSubmit();
            }}
          >
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !email || !message}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting || !email || !message
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transform'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                  {t.sendMessage}
                </>
              )}
            </button>
            
            {/* reCAPTCHA Notice */}
            <div className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                <path d="M12 2L4.09 6.31l1.42 1.42L12 4.13l6.49 3.6 1.42-1.42L12 2zM12 6L4.09 10.31l1.42 1.42L12 8.13l6.49 3.6 1.42-1.42L12 6zM12 10L4.09 14.31l1.42 1.42L12 12.13l6.49 3.6 1.42-1.42L12 10zM3 16l9 5 9-5-1.42-1.42L12 18.13l-7.58-3.55L3 16z"/>
              </svg>
              Protegido por reCAPTCHA
            </div>
            
            {/* Status Messages */}
            {submitStatus === "success" && (
              <div className="text-center p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {t.messageSent}
                </div>
              </div>
            )}
            
            {submitStatus === "error" && (
              <div className="text-center p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                <div className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  {t.messageError}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactFormModal;
