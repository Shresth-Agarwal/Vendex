'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        CONSUMER: '/consumer',
        STORE_OWNER: '/store-owner',
        MANUFACTURER: '/manufacturer',
        STAFF: '/staff',
        ADMIN: '/admin',
      };
      router.push(roleRoutes[user.role] || '/login');
    } else {
      // Try to load user from token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        loadUser().then(() => {
          if (user) {
            const roleRoutes: Record<string, string> = {
              CONSUMER: '/consumer',
              STORE_OWNER: '/store-owner',
              MANUFACTURER: '/manufacturer',
              STAFF: '/staff',
              ADMIN: '/admin',
            };
            router.push(roleRoutes[user.role] || '/login');
          } else {
            router.push('/login');
          }
        });
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, router, loadUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Vendex</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
