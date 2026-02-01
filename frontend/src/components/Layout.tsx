 'use client';

import React, { useState, useEffect } from 'react';
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
  FiLogIn,
  FiShoppingCart,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

// All available routes - organized by category
const allRoutes = [
  { path: '/', label: 'Home', icon: <FiHome />, category: 'main' },
  { path: '/consumer', label: 'Products', icon: <FiShoppingBag />, category: 'main' },
  { path: '/store-owner', label: 'Store Dashboard', icon: <FiBarChart />, category: 'store' },
  { path: '/store-owner/inventory', label: 'Inventory', icon: <FiPackage />, category: 'store' },
  { path: '/store-owner/products', label: 'Products', icon: <FiPackage />, category: 'store' },
  { path: '/store-owner/manufacturers', label: 'Manufacturers', icon: <FiUsers />, category: 'store' },
  { path: '/store-owner/purchase-orders', label: 'Orders', icon: <FiShoppingCart />, category: 'store' },
  { path: '/store-owner/staff', label: 'Staff', icon: <FiUsers />, category: 'store' },
  { path: '/store-owner/shifts', label: 'Shifts', icon: <FiTrendingUp />, category: 'store' },
  { path: '/store-owner/analytics', label: 'Analytics', icon: <FiBarChart />, category: 'store' },
  { path: '/manufacturer', label: 'Manufacturer', icon: <FiPackage />, category: 'manufacturer' },
  { path: '/manufacturer/orders', label: 'Orders', icon: <FiShoppingCart />, category: 'manufacturer' },
  { path: '/staff', label: 'Staff Dashboard', icon: <FiUser />, category: 'staff' },
  { path: '/admin', label: 'Admin', icon: <FiSettings />, category: 'admin' },
  { path: '/user/profile', label: 'Profile', icon: <FiUser />, category: 'user' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  useEffect(() => {
    function onAppError(e: Event) {
      // @ts-ignore
      const msg = (e as CustomEvent)?.detail?.message || 'An error occurred';
      setGlobalError(msg);
    }

    function onAppSuccess(e: Event) {
      // @ts-ignore
      const msg = (e as CustomEvent)?.detail?.message || 'Success';
      setGlobalSuccess(msg);
      // auto-dismiss success after 3s
      setTimeout(() => setGlobalSuccess(null), 3000);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('app-error', onAppError as EventListener);
      window.addEventListener('app-success', onAppSuccess as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('app-error', onAppError as EventListener);
        window.removeEventListener('app-success', onAppSuccess as EventListener);
      }
    };
  }, []);

  // Don't show navigation on home page or login page
  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  // Show all routes - no authentication required for navigation
  const visibleRoutes = allRoutes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vendex
                </span>
              </Link>
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {visibleRoutes.map((route) => {
                  const isActive = pathname === route.path || pathname.startsWith(route.path + '/');
                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      <span className="mr-2">{route.icon}</span>
                      {route.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                      <FiUser className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700">{user.username}</span>
                      <span className="badge badge-info text-xs">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 overflow-x-auto">
            <div className="flex space-x-2">
              {visibleRoutes.slice(0, 6).map((route) => {
                const isActive = pathname === route.path || pathname.startsWith(route.path + '/');
                return (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{route.icon}</span>
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      {globalError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex justify-between items-start gap-4">
              <p className="text-red-800 text-sm">{globalError}</p>
              <button
                className="text-red-600 text-sm hover:text-red-800"
                onClick={() => setGlobalError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {globalSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex justify-between items-start gap-4">
              <p className="text-green-800 text-sm">{globalSuccess}</p>
              <button
                className="text-green-600 text-sm hover:text-green-800"
                onClick={() => setGlobalSuccess(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
