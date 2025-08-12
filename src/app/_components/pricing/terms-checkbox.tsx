"use client";

import React from "react";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";

interface TermsCheckboxProps {
  acceptedTerms: boolean;
  onTermsChange: (accepted: boolean) => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  acceptedTerms,
  onTermsChange,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="mt-6 mb-4">
      <label className="flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 transform group-hover:scale-110"
          />
          {acceptedTerms && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg 
                className="w-3 h-3 text-white animate-bounce" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          )}
        </div>
        <span className="group-hover:text-blue-600 transition-colors duration-200">
          {t.agreeToTerms}{" "}
          <a 
            href="/posts/terminos_y_condiciones" 
            target="_blank"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {t.termsAndConditions}
          </a>
        </span>
      </label>
    </div>
  );
};

export default TermsCheckbox;
