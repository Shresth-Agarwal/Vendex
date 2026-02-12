'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FiShoppingBag, FiPackage, FiTrendingUp, FiArrowRight, FiUsers, FiBarChart, FiMoon, FiSun } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    }
  };

  useEffect(() => {
    // Load dark mode preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        setDarkMode(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    // Try to load user from token if available (optional)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && !isAuthenticated) {
      loadUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      // Redirect based on role
      const roleRoutes: Record<string, string> = {
        CONSUMER: '/consumer',
        STORE_OWNER: '/store-owner',
        MANUFACTURER: '/manufacturer',
        STAFF: '/staff',
        ADMIN: '/admin',
      };
      router.push(roleRoutes[user.role] || '/consumer');
    } else {
      router.push('/consumer');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${
        darkMode
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
            darkMode ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Navigation */}
      <nav className={`backdrop-blur-md shadow-lg border-b transition-colors duration-300 ${
        darkMode
          ? 'bg-gray-800/80 border-gray-700'
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vendex
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <FiMoon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {isAuthenticated && user ? (
                <>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user.username}</span>
                  <button
                    onClick={handleGetStarted}
                    className="btn-primary text-sm"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link href="/consumer" className={`text-sm font-medium ${
                    darkMode
                      ? 'text-gray-400 hover:text-blue-400'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}>
                    Browse
                  </Link>
                  <Link href="/login" className="btn-primary text-sm">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className={`text-6xl font-bold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Smart B2B Platform for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Modern Commerce</span>
          </h1>
          <p className={`text-xl mb-10 max-w-3xl mx-auto ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Connect consumers, store owners, and manufacturers in one intelligent platform.
            Powered by AI-driven inventory management and demand forecasting.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/consumer" className="btn-primary text-lg px-8 py-4">
              Browse Products <FiArrowRight className="inline ml-2" />
            </Link>
            {isAuthenticated ? (
              <button onClick={handleGetStarted} className="btn-secondary text-lg px-8 py-4">
                Go to Dashboard
              </button>
            ) : (
              <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/consumer" className={`card text-center hover:scale-105 transition-transform cursor-pointer ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <FiShoppingBag className={`w-10 h-10 mx-auto mb-3 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Browse Products</h3>
          </Link>
          <Link href="/store-owner" className={`card text-center hover:scale-105 transition-transform cursor-pointer ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <FiBarChart className={`w-10 h-10 mx-auto mb-3 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Store Dashboard</h3>
          </Link>
          <Link href="/manufacturer" className={`card text-center hover:scale-105 transition-transform cursor-pointer ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <FiPackage className={`w-10 h-10 mx-auto mb-3 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Manufacturer</h3>
          </Link>
          <Link href="/admin" className={`card text-center hover:scale-105 transition-transform cursor-pointer ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <FiUsers className={`w-10 h-10 mx-auto mb-3 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Admin</h3>
          </Link>
        </div>
      </div>

      {/* Features Overview Section */}
      <div className={`py-20 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl font-bold text-center mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>Key Features</h2>
          <p className={`text-center mb-12 max-w-3xl mx-auto text-lg ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Vendex combines intelligent AI technology with intuitive design to streamline your B2B operations. 
            From smart shopping experiences to real-time inventory management and comprehensive analytics, 
            we provide everything you need to succeed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`flex items-start gap-4 p-6 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}>
              <FiShoppingBag className={`w-8 h-8 flex-shrink-0 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Smart Shopping</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered intent builder to find exactly what you need
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-4 p-6 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}>
              <FiPackage className={`w-8 h-8 flex-shrink-0 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Inventory Management</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Real-time tracking with AI demand forecasting
                </p>
              </div>
            </div>
            <div className={`flex items-start gap-4 p-6 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}>
              <FiTrendingUp className={`w-8 h-8 flex-shrink-0 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Analytics & Insights</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Comprehensive analytics for better decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Panels Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className={`text-4xl font-bold text-center mb-12 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>Tailored Solutions for Everyone</h2>
        
        <div className="space-y-8">
          {/* Consumer Panel */}
          <div className={`rounded-lg overflow-hidden shadow-lg transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
              <div className="flex items-center gap-4">
                <FiShoppingBag className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">For Consumers</h3>
                  <p className="text-blue-100">Browse & discover products with ease</p>
                </div>
              </div>
            </div>
            <div className={`px-8 py-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Shop from a wide variety of products offered by multiple store owners and manufacturers. 
                Use our AI-powered search to find exactly what you&rsquo;re looking for with natural language queries. 
                Track your purchases, manage receipts, and enjoy a seamless shopping experience on a unified platform.
              </p>
            </div>
          </div>

          {/* Store Owner Panel */}
          <div className={`rounded-lg overflow-hidden shadow-lg transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-6">
              <div className="flex items-center gap-4">
                <FiBarChart className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">For Store Owners</h3>
                  <p className="text-purple-100">Manage your store efficiently</p>
                </div>
              </div>
            </div>
            <div className={`px-8 py-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Manage your entire store operations from inventory tracking to staff management. 
                Monitor sales analytics, forecast demand using AI, and optimize your product lineup. 
                Connect with manufacturers to streamline purchases and keep your shelves stocked with the right products at the right time.
              </p>
            </div>
          </div>

          {/* Manufacturer Panel */}
          <div className={`rounded-lg overflow-hidden shadow-lg transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-6">
              <div className="flex items-center gap-4">
                <FiPackage className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">For Manufacturers</h3>
                  <p className="text-indigo-100">Connect with retailers directly</p>
                </div>
              </div>
            </div>
            <div className={`px-8 py-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Showcase your products to multiple store owners across the platform. 
                Manage purchase orders efficiently and track shipments in real-time. 
                Access valuable insights about demand patterns and optimize your production accordingly.
              </p>
            </div>
          </div>

          {/* Admin Panel */}
          <div className={`rounded-lg overflow-hidden shadow-lg transition-colors ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-6">
              <div className="flex items-center gap-4">
                <FiUsers className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">For Administrators</h3>
                  <p className="text-red-100">Monitor and manage the platform</p>
                </div>
              </div>
            </div>
            <div className={`px-8 py-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Oversee all platform activities including user management, store verification, and transaction monitoring. 
                Access comprehensive analytics to understand platform health and user behavior. 
                Maintain system integrity and ensure a secure environment for all stakeholders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`text-white py-20 rounded-2xl mx-4 mb-20 transition-colors duration-300 ${
        darkMode
          ? 'bg-gradient-to-r from-blue-700 to-purple-700'
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Vendex today and transform your business operations.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/consumer" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              Browse Products
            </Link>
            {!isAuthenticated && (
              <Link href="/login" className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl">
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`text-white py-12 transition-colors duration-300 ${
        darkMode ? 'bg-gray-950' : 'bg-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Vendex</h3>
              <p className="text-gray-400">
                Smart B2B platform connecting consumers, store owners, and manufacturers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/consumer" className="hover:text-white transition-colors">Browse Products</Link></li>
                <li><Link href="/store-owner" className="hover:text-white transition-colors">Store Dashboard</Link></li>
                <li><Link href="/manufacturer" className="hover:text-white transition-colors">Manufacturer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/consumer" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/consumer" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vendex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
