"use client";

import React from "react";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";

interface ContactButtonProps {
  onContactClick: () => void;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  onContactClick,
}) => {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div className="mt-6">
      <button
        onClick={onContactClick}
        className="mx-auto hover:underline font-bold rounded-full py-4 px-8 shadow focus:outline-none focus:shadow-outline transform transition duration-300 ease-in-out flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white opacity-100 hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="inline-block">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        {t.contactFormButton}
      </button>
    </div>
  );
};

export default ContactButton;
