'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { InventoryTable } from '@/components/InventoryTable';
import { productsApi, stockApi, salesApi, inventoryAgentApi } from '@/lib/api';
import { FiPackage, FiTrendingUp, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';

export default function StoreOwnerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    recentSales: 0,
  });

  useEffect(() => {
    loadInventory();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadInventory, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadInventory = async () => {
    try {
      const productsData = await productsApi.getAll();
      
      // Get stock for each product
      const inventoryWithStock = await Promise.all(
        productsData.map(async (product: any) => {
          try {
            const stock = await stockApi.getBySku(product.sku);
            return {
              ...product,
              ...stock,
              productName: product.productName || product.name,
              unitCost: product.unitCost || 0,
            };
          } catch (error) {
            // Stock not found, set to 0
            return {
              ...product,
              sku: product.sku,
              onHand: 0,
              lastUpdated: new Date().toISOString(),
              productName: product.productName || product.name,
              unitCost: product.unitCost || 0,
            };
          }
        })
      );

      setInventory(inventoryWithStock);

      // Calculate stats
      const totalItems = inventoryWithStock.length;
      const lowStock = inventoryWithStock.filter((item: any) => item.onHand > 0 && item.onHand < 10).length;
      const outOfStock = inventoryWithStock.filter((item: any) => item.onHand === 0).length;
      const totalValue = inventoryWithStock.reduce(
        (sum: number, item: any) => sum + (item.onHand || 0) * (item.unitCost || 0),
        0
      );

      // Get recent sales count (last 7 days)
      let recentSales = 0;
      try {
        const allSales = await Promise.all(
          inventoryWithStock.slice(0, 10).map(async (item: any) => {
            try {
              const sales = await salesApi.getBySku(item.sku);
              return sales.length;
            } catch {
              return 0;
            }
          })
        );
        recentSales = allSales.reduce((sum, count) => sum + count, 0);
      } catch (error) {
        console.error('Error loading sales:', error);
      }

      setStats({ totalItems, lowStock, outOfStock, totalValue, recentSales });
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (sku: string, onHand: number) => {
    try {
      await stockApi.update(sku, onHand);
      await loadInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={loadInventory} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link href="/store-owner/inventory" className="btn-primary">
            Manage Inventory
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/store-owner/inventory" className="card hover:shadow-lg transition-shadow">
          <FiPackage className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Inventory</p>
        </Link>
        <Link href="/store-owner/staff" className="card hover:shadow-lg transition-shadow">
          <FiPackage className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Staff</p>
        </Link>
        <Link href="/store-owner/analytics" className="card hover:shadow-lg transition-shadow">
          <FiTrendingUp className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Analytics</p>
        </Link>
        <Link href="/store-owner/chat" className="card hover:shadow-lg transition-shadow">
          <FiPackage className="w-8 h-8 text-primary-600 mb-2" />
          <p className="font-semibold">Messages</p>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
            <FiPackage className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <FiPackage className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalValue.toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Sales</p>
              <p className="text-2xl font-bold text-blue-600">{stats.recentSales}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Inventory</h2>
        <InventoryTable
          items={inventory.slice(0, 10)}
          onUpdateStock={handleUpdateStock}
          showActions={true}
        />
        <div className="mt-4 text-center">
          <Link href="/store-owner/inventory" className="text-primary-600 hover:text-primary-800">
            View All Inventory →
          </Link>
        </div>
      </div>
    </div>
  );
}
