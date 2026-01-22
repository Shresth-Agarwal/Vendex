'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiMessageCircle,
  FiBarChart,
  FiLogOut,
  FiUser,
} from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

const roleRoutes: Record<string, Array<{ path: string; label: string; icon: React.ReactNode }>> = {
  CONSUMER: [
    { path: '/consumer', label: 'Dashboard', icon: <FiHome /> },
    { path: '/consumer/shop', label: 'Shop', icon: <FiShoppingBag /> },
  ],
  STORE_OWNER: [
    { path: '/store-owner', label: 'Dashboard', icon: <FiHome /> },
    { path: '/store-owner/inventory', label: 'Inventory', icon: <FiPackage /> },
    { path: '/store-owner/staff', label: 'Staff', icon: <FiUsers /> },
    { path: '/store-owner/chat', label: 'Messages', icon: <FiMessageCircle /> },
    { path: '/store-owner/analytics', label: 'Analytics', icon: <FiBarChart /> },
  ],
  MANUFACTURER: [
    { path: '/manufacturer', label: 'Dashboard', icon: <FiHome /> },
    { path: '/manufacturer/orders', label: 'Orders', icon: <FiPackage /> },
    { path: '/manufacturer/chat', label: 'Messages', icon: <FiMessageCircle /> },
  ],
  STAFF: [
    { path: '/staff', label: 'Dashboard', icon: <FiHome /> },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
  ],
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  const routes = roleRoutes[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">Vendex</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === route.path
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{route.icon}</span>
                    {route.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiUser className="w-4 h-4" />
                <span>{user.username}</span>
                <span className="badge badge-info">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
