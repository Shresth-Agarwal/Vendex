'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function StaffDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'STAFF') {
      router.push('/login');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
      <div className="card">
        <p className="text-gray-600">Welcome, {user?.username}!</p>
        <p className="text-sm text-gray-500 mt-2">
          Staff dashboard features coming soon...
        </p>
      </div>
    </div>
  );
}
