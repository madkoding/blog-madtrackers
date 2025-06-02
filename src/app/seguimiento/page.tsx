"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { translations } from "../i18n";
import { useLang } from "../lang-context";
import { isHashFormat } from "../../utils/hashUtils";

export default function SeguimientoPage() {
  const { lang } = useLang();
  const t = translations[lang];
  const [searchUser, setSearchUser] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUser.trim()) {
      const input = searchUser.trim();
      
      // Si ya es un hash, redirigir directamente
      if (isHashFormat(input)) {
        router.push(`/seguimiento/${encodeURIComponent(input)}`);
        return;
      }
      
      // Si es un username, obtener el hash primero y redirigir al hash
      try {
        const response = await fetch(`/api/public/tracking/${encodeURIComponent(input)}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.userHash) {
            // Redirigir al hash para mantener la URL segura
            router.push(`/seguimiento/${data.userHash}`);
          } else {
            // Si no hay hash, usar el username como fallback
            router.push(`/seguimiento/${encodeURIComponent(input)}`);
          }
        } else {
          // Si no se encuentra, intentar buscar de todas formas
          router.push(`/seguimiento/${encodeURIComponent(input)}`);
        }
      } catch (error) {
        console.error('Error al buscar usuario:', error);
        // En caso de error, proceder con el input original
        router.push(`/seguimiento/${encodeURIComponent(input)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            {t.orderTracking}
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600 text-center mb-8">
              {t.enterUsername}
            </p>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.username}
                </label>
                <input
                  type="text"
                  id="username"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  style={{ color: '#111827' }}
                  placeholder={t.searchUserPlaceholder}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                {t.searchOrderButton}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {t.noUsernameHelp}{" "}
                <a href="mailto:madkoding@gmail.com" className="text-blue-600 hover:underline">
                  madkoding@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
