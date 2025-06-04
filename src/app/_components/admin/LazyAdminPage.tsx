"use client";

import dynamic from "next/dynamic";

// Lazy loading del panel de admin completo
const AdminDashboard = dynamic(() => import("./AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando panel de administración...</p>
      </div>
    </div>
  ),
});

export default function LazyAdminPage() {
  return <AdminDashboard />;
}
