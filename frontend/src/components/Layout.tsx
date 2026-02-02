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
  FiChevronDown,
} from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavRoute {
  path: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

interface CategoryGroup {
  name: string;
  label: string;
  icon: React.ReactNode;
  routes: NavRoute[];
}

// All available routes - organized by category
const allRoutes: NavRoute[] = [
  { path: '/', label: 'Home', icon: <FiHome />, category: 'main' },
  { path: '/consumer', label: 'Browse', icon: <FiShoppingBag />, category: 'main' },
  { path: '/store-owner', label: 'Store Dashboard', icon: <FiBarChart />, category: 'store' },
  { path: '/store-owner/inventory', label: 'Inventory', icon: <FiPackage />, category: 'store' },
  { path: '/store-owner/manufacturers', label: 'Manufacturers', icon: <FiUsers />, category: 'store' },
  { path: '/store-owner/purchase-orders', label: 'Purchase Orders', icon: <FiShoppingCart />, category: 'store' },
  { path: '/store-owner/analytics', label: 'Analytics', icon: <FiBarChart />, category: 'store' },
  { path: '/store-owner/products', label: 'Browse Products', icon: <FiShoppingBag />, category: 'products' },
  { path: '/manufacturer', label: 'Manufacturer', icon: <FiPackage />, category: 'manufacturer' },
  { path: '/manufacturer/orders', label: 'Orders', icon: <FiShoppingCart />, category: 'manufacturer' },
  { path: '/staff', label: 'Dashboard', icon: <FiUser />, category: 'staff' },
  { path: '/store-owner/staff', label: 'Staff Management', icon: <FiUsers />, category: 'staff' },
  { path: '/store-owner/shifts', label: 'Shifts', icon: <FiTrendingUp />, category: 'staff' },
  { path: '/admin', label: 'Admin', icon: <FiSettings />, category: 'admin' },
  { path: '/user/profile', label: 'Profile', icon: <FiUser />, category: 'user' },
];

// Category configuration
const categoryConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  main: { label: 'Main', icon: <FiHome /> },
  store: { label: 'Store Management', icon: <FiBarChart /> },
  products: { label: 'Products', icon: <FiShoppingBag /> },
  manufacturer: { label: 'Manufacturer', icon: <FiPackage /> },
  staff: { label: 'Staff', icon: <FiUser /> },
  admin: { label: 'Admin', icon: <FiSettings /> },
  user: { label: 'Account', icon: <FiUser /> },
};

// Group routes by category
const getGroupedRoutes = (routes: NavRoute[]): CategoryGroup[] => {
  const grouped = new Map<string, NavRoute[]>();
  
  routes.forEach((route) => {
    if (!grouped.has(route.category)) {
      grouped.set(route.category, []);
    }
    grouped.get(route.category)!.push(route);
  });

  return Array.from(grouped.entries()).map(([category, categoryRoutes]) => ({
    name: category,
    label: categoryConfig[category]?.label || category,
    icon: categoryConfig[category]?.icon || <FiPackage />,
    routes: categoryRoutes,
  }));
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (category: string) => {
    setOpenDropdown(openDropdown === category ? null : category);
  };

  const isDropdownOpen = (category: string) => openDropdown === category;

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
  const groupedRoutes = getGroupedRoutes(visibleRoutes);

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
              
              {/* Desktop Navigation with Dropdowns */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1 lg:items-center">
                {groupedRoutes.map((group) => (
                  <div key={group.name} className="relative group">
                    {/* Category Button */}
                    <button
                      onClick={() => toggleDropdown(group.name)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isDropdownOpen(group.name) || group.routes.some(r => pathname === r.path || pathname.startsWith(r.path + '/'))
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      <span className="text-lg">{group.icon}</span>
                      <span>{group.label}</span>
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen(group.name) ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen(group.name) && (
                      <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                        <div className="py-2">
                          {group.routes.map((route) => {
                            const isActive = pathname === route.path || pathname.startsWith(route.path + '/');
                            return (
                              <Link
                                key={route.path}
                                href={route.path}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-4 border-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                              >
                                <span className="text-base">{route.icon}</span>
                                <span>{route.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
        
        {/* Mobile Navigation with Categories */}
        <div className="lg:hidden border-t border-gray-200 bg-white max-h-96 overflow-y-auto">
          <div className="px-4 py-2 space-y-1">
            {groupedRoutes.map((group) => (
              <div key={group.name}>
                {/* Mobile Category Button */}
                <button
                  onClick={() => toggleDropdown(group.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isDropdownOpen(group.name) || group.routes.some(r => pathname === r.path || pathname.startsWith(r.path + '/'))
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{group.icon}</span>
                    <span>{group.label}</span>
                  </div>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen(group.name) ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Dropdown Items */}
                {isDropdownOpen(group.name) && (
                  <div className="pl-4 space-y-1 mt-1">
                    {group.routes.map((route) => {
                      const isActive = pathname === route.path || pathname.startsWith(route.path + '/');
                      return (
                        <Link
                          key={route.path}
                          href={route.path}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-2 border-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-sm">{route.icon}</span>
                          <span>{route.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
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
