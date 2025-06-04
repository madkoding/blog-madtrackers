"use client";

import dynamic from "next/dynamic";
import React from "react";

// Loading component optimizado para página de nuevo usuario
const NewUserPageLoading = React.memo(() => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-8 h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
));

NewUserPageLoading.displayName = 'NewUserPageLoading';

// Dynamic import del componente de página de nuevo usuario
const LazyNewUserPage = dynamic(
  () => import("../../admin/nuevo-usuario/page"), 
  {
    ssr: false,
    loading: () => <NewUserPageLoading />,
  }
);

export default LazyNewUserPage;
