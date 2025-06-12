"use client";

import React from "react";
import Link from "next/link";
import { cn } from "../../../utils/cn";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showNavigation?: boolean;
  navigationItems?: Array<{
    href: string;
    label: string;
    icon?: string;
  }>;
  // Propiedades para integración con Navigation
  translations?: Record<string, string>;
  lang?: "en" | "es";
  onLanguageChange?: (lang: "en" | "es") => void;
}

export const AdminLayout = React.memo<AdminLayoutProps>(({
  children,
  className,
  title = "Panel de Administración",
  showNavigation = true,
  navigationItems = [
    { href: "/admin", label: "📋 Buscar Usuario", icon: "📋" },
    { href: "/admin/nuevo-usuario", label: "➕ Nuevo Usuario", icon: "➕" },
    { href: "/seguimiento", label: "👁️ Vista Pública", icon: "👁️" },
    { href: "/", label: "🏠 Inicio", icon: "🏠" }
  ]
}) => {
  return (
    <div className={cn("admin-layout min-h-screen", className)}>
      {showNavigation && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-red-600 border-b border-red-700 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <span className="text-white text-xl font-bold">🔧 Admin Panel</span>
                <div className="text-red-200 text-sm">
                  MadTrackers - {title}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-red-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={cn(
        "min-h-screen",
        showNavigation && "pt-16"
      )}>
        {children}
      </main>
      
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            ⚠️ Panel de Administración - Acceso Restringido ⚠️
          </p>
          <p className="text-xs mt-1">
            Todos los cambios se guardan automáticamente y afectan los datos en vivo
          </p>
        </div>
      </footer>
    </div>
  );
});

AdminLayout.displayName = "AdminLayout";

export default AdminLayout;
