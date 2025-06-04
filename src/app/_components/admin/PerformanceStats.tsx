'use client';

import { useState, useEffect } from 'react';

interface PerformanceStats {
  averageScore: number;
  totalSessions: number;
  webpAdoption: number;
  commonIssues: string[];
  scoreDistribution: {
    good: number;
    fair: number;
    poor: number;
  };
}

export default function PerformanceStats() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from your analytics API
    // For now, we'll simulate some data
    setTimeout(() => {
      setStats({
        averageScore: 87,
        totalSessions: 1234,
        webpAdoption: 78.5,
        commonIssues: [
          'Large image sizes affecting LCP',
          'JavaScript blocking main thread',
          'Missing image dimensions causing CLS'
        ],
        scoreDistribution: {
          good: 65,
          fair: 25,
          poor: 10
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Estadísticas de Rendimiento</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Estadísticas de Rendimiento</h3>
      
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getScoreBgColor(stats.averageScore)}`}>
          <div className="text-sm text-gray-600">Puntuación Promedio</div>
          <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
            {stats.averageScore}
          </div>
        </div>
        
        <div className="p-4 bg-blue-100 rounded-lg">
          <div className="text-sm text-gray-600">Total Sesiones</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalSessions.toLocaleString()}
          </div>
        </div>
        
        <div className="p-4 bg-purple-100 rounded-lg">
          <div className="text-sm text-gray-600">Adopción WebP</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.webpAdoption}%
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-3 text-gray-700">Distribución de Puntuaciones</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-16 text-sm text-gray-600">Bueno:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: `${stats.scoreDistribution.good}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{stats.scoreDistribution.good}%</span>
          </div>
          
          <div className="flex items-center">
            <span className="w-16 text-sm text-gray-600">Regular:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
              <div 
                className="bg-yellow-500 h-4 rounded-full" 
                style={{ width: `${stats.scoreDistribution.fair}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{stats.scoreDistribution.fair}%</span>
          </div>
          
          <div className="flex items-center">
            <span className="w-16 text-sm text-gray-600">Malo:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 mx-3">
              <div 
                className="bg-red-500 h-4 rounded-full" 
                style={{ width: `${stats.scoreDistribution.poor}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{stats.scoreDistribution.poor}%</span>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div>
        <h4 className="text-md font-semibold mb-3 text-gray-700">Problemas Comunes</h4>
        <ul className="space-y-2">
          {stats.commonIssues.map((issue) => (
            <li key={issue} className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span className="text-sm text-gray-600">{issue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={() => window.open('https://pagespeed.web.dev/', '_blank')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Analizar con PageSpeed Insights
        </button>
      </div>
    </div>
  );
}
