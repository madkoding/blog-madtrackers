"use client";

import dynamic from "next/dynamic";
import React from "react";

// Loading component optimizado para página de seguimiento
const TrackingPageLoading = React.memo(() => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-6xl mx-auto">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Right column - 3D Model area */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

TrackingPageLoading.displayName = 'TrackingPageLoading';

// Dynamic import del componente de página de seguimiento
const LazyTrackingPage = dynamic(
  () => import("../../admin/seguimiento/[slugUsuario]/page"), 
  {
    ssr: false,
    loading: () => <TrackingPageLoading />,
  }
);

export default LazyTrackingPage;
