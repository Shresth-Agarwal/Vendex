'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FiBarChart } from 'react-icons/fi';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'STORE_OWNER') {
      router.push('/login');
    }
  }, [isAuthenticated, user]);

  // Power BI embed URL - replace with your actual Power BI embed URL
  const powerBiEmbedUrl = process.env.NEXT_PUBLIC_POWER_BI_URL || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FiBarChart className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
      </div>

      {powerBiEmbedUrl ? (
        <div className="card p-0 overflow-hidden">
          <iframe
            src={powerBiEmbedUrl}
            className="w-full h-[800px] border-0"
            title="Power BI Dashboard"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <FiBarChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Power BI Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Configure your Power BI embed URL in the environment variables
            </p>
            <p className="text-sm text-gray-500">
              Set NEXT_PUBLIC_POWER_BI_URL in your .env.local file
            </p>
          </div>
        </div>
      )}

      {/* Placeholder for custom analytics if Power BI is not configured */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - integrate with your analytics</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Stock Movement</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - integrate with your analytics</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Demand Forecast</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - integrate with your analytics</p>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - integrate with your analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
